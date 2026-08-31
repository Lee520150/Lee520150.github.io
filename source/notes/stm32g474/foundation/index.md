---
title: 底层与实时数据流
layout: stm32-note
math: true
chapter: foundation
chapter_label: Chapter 01 / Foundation
description: 从时钟和触发链开始，把 ADC、DAC、DMA 与中断组织成稳定、可计算的实时系统。
---

## 1. 先画出数据链

电赛程序最先要确定的不是 `while (1)` 里写什么，而是数据何时产生、由谁搬运、在哪一段被处理。现有 G474 工程中最常用的链路是：

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

## 3. DMA 双缓冲

循环 DMA 的前半区和后半区交替可用。回调里只设置标志或调用有确定上限的短函数，不执行串口打印、浮点大循环或阻塞等待。

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

主循环取走标志后处理对应半区。若一个数据块包含 \(N\) 点，算法最迟必须在下一次同半区被覆盖前完成；半缓冲可用时间约为 \(N/(2f_s)\)。

## 4. DAC：查表输出与同步

由 TIM TRGO 触发 DAC，再用循环 DMA 搬运查表数据，可以避免软件逐点写 DAC 带来的抖动：

```c
HAL_DAC_Start_DMA(&hdac1, DAC_CHANNEL_1,
                  (uint32_t *)dac_buffer, DAC_BUFFER_SIZE,
                  DAC_ALIGN_12B_R);
HAL_TIM_Base_Start(&htim6);
```

ADC 与 DAC 若要进行相位、阻抗或传递函数测量，应尽量共用同一时间基准。工程 `baseboard/phase_shifter.c`、`LCR/main.c` 和 `separation/main.c` 都体现了这种“定时器统一节拍”的思路。

## 5. 中断边界与错误观测

- 中断回调负责通知，不负责完整业务。
- 每个 DMA 数据块应有 `ready`、`overrun` 或序号，不能静默覆盖。
- 串口接收完成后立即重新挂接 `HAL_UART_Receive_IT`。
- 启动顺序通常是校准 ADC、启动 DAC DMA、启动 ADC DMA，最后启动触发定时器。
- 调试阶段记录实际采样率、处理耗时、溢出次数和 ADC 极值，比只观察最终波形更有效。

## 对应工程

`baseboard` 提供 ADC/DAC 双 DMA 与 FFT 数据链；`LCR` 展示双通道同步采样和数据块快照；`P/P1/P2/Px2` 展示实时 FIR 移相；`2025G` 包含 DAC 波形和 ADC-DMA 频响测量。
