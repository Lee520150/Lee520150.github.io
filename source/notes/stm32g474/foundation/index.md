---
title: 底层与实时数据流
layout: stm32-note
math: true
chapter: foundation
chapter_label: Chapter 01 / Foundation
description: 从时钟和触发链开始，把 ADC、DAC、DMA 与中断组织成稳定、可计算的实时系统。
---

## 1. 先画出数据链

实时程序最先要确定的不是 `while (1)` 里写什么，而是数据何时产生、由谁搬运、在哪一段被处理。一个便于扩展的链路通常是：

> TIM 更新事件 → ADC 规则组采样 → DMA 循环搬运 → 半满/全满回调 → DSP → DAC DMA 输出

这种结构让采样间隔由硬件定时器决定，CPU 只负责按块处理。设定时器输入时钟为 \(f_{TIM}\)，预分频器为 PSC，自动重装值为 ARR，则更新频率为：

\[
f_s = \frac{f_{TIM}}{(PSC+1)(ARR+1)}
\]

需要注意 G4 的 APB 定时器时钟倍频规则：当 APB 预分频不为 1 时，定时器时钟通常为该总线时钟的 2 倍。参数必须由实际时钟树计算，不能只看系统主频。

## 2. ADC：从码值回到电压

对于 12 位 ADC，理想换算关系为：

\[
V_{in}=\frac{Code}{2^{12}-1}V_{ref}
\]

双极性信号通常先在模拟前端偏置到 \(V_{bias}\)，进入算法前再去直流：

\[
x[n]=(Code[n]-Code_{bias})\frac{V_{ref}}{4095}
\]

启动前应进行单端校准，并让 DMA 缓冲区长度与处理块严格一致：

```c
HAL_ADCEx_Calibration_Start(&hadc1, ADC_SINGLE_ENDED);
HAL_ADC_Start_DMA(&hadc1, (uint32_t *)adc_buffer, ADC_BUFFER_SIZE);
HAL_TIM_Base_Start(&htim6);  /* TIM6 TRGO drives ADC conversion */
```

### 采样参数不要只填一个默认值

ADC 的采样时间需要结合信号源阻抗来定。信号源阻抗较高、前端有 RC 滤波或多路扫描时，过短的采样时间会让码值偏低且不稳定；这类问题常被误判成算法误差。实操时，先固定输入直流电压，逐步缩短采样时间，观察均值是否开始偏移、标准差是否增大，再选择有余量的一档。

多通道扫描还要把“单次转换时间 × 通道数”算进采样周期。若转换尚未完成，下一个定时器触发已经到来，DMA 看到的数据就不会是预期的通道顺序。先用固定电压分别接到每个通道，打印前几十个原始码，确认交错顺序和预期一致。

## 3. DMA 双缓冲：一边采样，一边处理

循环 DMA 的缓冲区分成等长的前、后两半：DMA 正在填其中一半时，CPU 处理另一半。这样采样节拍不再被算法执行时间直接打断，也比“采满一整帧后停下来处理”更容易维持连续输出。

回调里只发布哪一半已经就绪的标志；滤波、FFT、打印和屏幕刷新都放在主循环或任务中执行。下面的位标志写法足够直观，也便于以后补上溢出统计：

```c
static volatile uint8_t block_ready;

void HAL_ADC_ConvHalfCpltCallback(ADC_HandleTypeDef *hadc)
{
    if (hadc == &hadc1) block_ready |= 0x01U;
}

void HAL_ADC_ConvCpltCallback(ADC_HandleTypeDef *hadc)
{
    if (hadc == &hadc1) block_ready |= 0x02U;
}
```

主循环取走标志后处理对应半区。若一个数据块包含 \(N\) 点，算法最迟必须在下一次同半区被覆盖前完成；半缓冲可用时间约为 \(N/(2f_s)\)。例如采样率为 100 kHz、总缓冲区为 1024 点时，每半区只有 5.12 ms 的处理预算。

使用双缓冲时，几个细节最容易出问题：

- `block_ready` 必须是 `volatile`；主循环读出并清零时，要避免恰好被中断重新置位。
- 只用一个标志代表“有数据”会掩盖处理过慢的问题。调试阶段应记录连续到达而未被取走的次数，作为 `overrun` 指标。
- 两半缓冲的处理函数必须使用明确的起始地址和长度，不能默认总是从数组开头读。
- 更换采样率、FFT 长度或 FIR 阶数后，都要重新计算时间预算；波形看起来正常不等于没有丢块。

### 主循环怎样安全地取走一块数据

处理函数不要自己判断“现在 DMA 填到哪里”，而是只接受一段已经完成的地址和长度。主循环取标志时，可先把标志复制到局部变量并清零，再按位处理：

~~~c
uint8_t ready = block_ready;
block_ready = 0U;

if (ready & 0x01U)
    ProcessSamples(&adc_buffer[0], ADC_BUFFER_SIZE / 2U);
if (ready & 0x02U)
    ProcessSamples(&adc_buffer[ADC_BUFFER_SIZE / 2U],
                   ADC_BUFFER_SIZE / 2U);
~~~

如果处理速度接近极限，不能悄悄合并两个标志。更稳妥的做法是给每半区配一个递增序号：主循环发现序号跳了不止一次时，明确记为丢块，并在界面或日志中报告。对测量设备来说，带“数据过载”标记的一次结果，远胜于一条看似正常却混入旧数据的结果。

## 4. DAC：查表输出与同步

由 TIM TRGO 触发 DAC，再用循环 DMA 搬运查表数据，可以避免软件逐点写 DAC 带来的抖动：

```c
HAL_DAC_Start_DMA(&hdac1, DAC_CHANNEL_1,
                  (uint32_t *)dac_buffer, DAC_BUFFER_SIZE,
                  DAC_ALIGN_12B_R);
HAL_TIM_Base_Start(&htim6);
```

ADC 与 DAC 若要进行相位、阻抗或传递函数测量，应尽量共用同一时间基准。由同一个定时器触发采样和输出，能让相位关系有明确的参考；若分别由软件启动，测到的相位差很容易混入不可重复的启动偏移。

### 输出缓冲区也要遵守同一条规则

DAC 的双缓冲与 ADC 的思路完全相同，只是方向相反：DMA 正在输出前半区时，CPU 准备后半区的下一段波形。若要在线改变频率、幅值或波形，更新应发生在“刚写完一半缓冲”的边界。直接在主循环改正在发送的数组，轻则在示波器上看到毛刺，重则让测量用的参考信号失去连续性。

## 5. 中断边界与错误观测

- 中断回调负责通知，不负责完整业务。
- 每个 DMA 数据块应有 `ready`、`overrun` 或序号，不能静默覆盖。
- 串口接收完成后立即重新挂接 `HAL_UART_Receive_IT`。
- 启动顺序通常是校准 ADC、启动 DAC DMA、启动 ADC DMA，最后启动触发定时器。
- 调试阶段记录实际采样率、处理耗时、溢出次数和 ADC 极值，比只观察最终波形更有效。

## 落地检查

在接入算法前，先用示波器或串口日志确认四件事：触发频率是否正确、ADC 与 DAC 是否同频、半满与全满回调是否交替到达、单个数据块的最长处理时间是否小于预算。先让链路稳定，再叠加算法，定位问题会轻松很多。
