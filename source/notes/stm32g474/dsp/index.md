---
title: DSP 与波形系统
layout: stm32-note
math: true
chapter: dsp
chapter_label: Chapter 02 / Signal Processing
description: 把采样理论落实到 DDS、FFT、幅值校正、THD、FIR 与 Hilbert 移相的代码结构中。
---

## 1. 采样与频率分辨率

采样必须满足奈奎斯特条件 \(f_s>2f_{max}\)，但工程设计通常需要更高过采样率，以给模拟抗混叠滤波器和数字算法留下余量。长度为 \(N\) 的 DFT 频率间隔为：

\[
\Delta f=\frac{f_s}{N}, \qquad f_k=k\Delta f
\]

增加 \(N\) 能改善频率栅格，但也增加延迟和 RAM 占用。`baseboard/fft_analyzer.c` 使用 4096 点 FFT；`separation/main.c` 使用 CMSIS-DSP 的 1024 点复 FFT。

## 2. DDS：相位累加器

软件 DDS 的核心是固定宽度相位累加器：

\[
P[n+1]=P[n]+K \pmod {2^B}, \qquad K=\frac{f_{out}2^B}{f_s}
\]

`DDS/Core/Inc/dds.h` 使用 32 位相位、170 kHz DAC 采样率：

```c
#define DDS_PHASE_BITS  32
#define DDS_SAMPLE_RATE 170000U
#define DDS_FREQ_TO_PHASE(f_hz) \
    ((uint32_t)(((uint64_t)(f_hz) << DDS_PHASE_BITS) / DDS_SAMPLE_RATE))
```

取相位高位作为 256 点波表索引，低位则保存分数相位。DMA 半满和全满回调分别重填缓冲区，可连续改变频率而不停止输出。

外部 AD9959 同样使用频率控制字：

\[
FTW=\operatorname{round}\left(\frac{f_{out}2^{32}}{f_{SYSCLK}}\right)
\]

14 位相位字满足 \(POW=\operatorname{round}(\phi\cdot16384/360^\circ)\)。这两条公式分别对应频率和相位寄存器，不应混用。

## 3. 窗函数与幅值校正

非整周期截断会产生频谱泄漏。加窗后的 DFT 为：

\[
X[k]=\sum_{n=0}^{N-1}x[n]w[n]e^{-j2\pi kn/N}
\]

Hamming 窗为 \(w[n]=0.54-0.46\cos(2\pi n/(N-1))\)。窗会降低幅值，因此 `fft_analyzer.c` 计算相干增益：

\[
CG=\frac{1}{N}\sum_{n=0}^{N-1}w[n], \qquad
A_{peak}=\frac{2|X[k]|}{N\cdot CG}
\]

```c
for (uint32_t i = 0; i < FFT_SIZE; ++i) {
    coherent_gain += window[i];
    fft_re[i] = centered_sample[i] * window[i];
}
coherent_gain /= FFT_SIZE;
peak_code = 2.0f * magnitude[peak] / (FFT_SIZE * coherent_gain);
```

峰值位于两个频点之间时，可用三点抛物线插值：

\[
\delta=\frac{1}{2}\frac{M_{k-1}-M_{k+1}}{M_{k-1}-2M_k+M_{k+1}},
\quad f=(k+\delta)\Delta f
\]

## 4. 谐波与 THD

若 \(A_1\) 为基波幅值，\(A_h\) 为第 \(h\) 次谐波，则：

\[
THD=\frac{\sqrt{A_2^2+A_3^2+\cdots+A_H^2}}{A_1}\times100\%
\]

实际程序应在每个理论谐波频点附近搜索局部峰值，防止频率插值误差把能量分散到邻近频点；还要检查谐波是否超过奈奎斯特频率。

## 5. Hilbert 正交与任意移相

理想 Hilbert 变换让正频率分量移相 \(-90^\circ\)。有限长 FIR 产生正交分量 \(Q[n]\)，原信号延迟 \((L-1)/2\) 点得到对齐的 \(I[n]\)：

\[
y[n]=I[n]\cos\phi-Q[n]\sin\phi
\]

`P/Core/Src/main.c` 的关键实现：

```c
for (int j = 0; j < FIR_N_TAPS; ++j)
    q += Hilbert_FIR_Coeffs[j] * history[head - j];

float i_delayed = history[head - FIR_DELAY];
output[n] = i_delayed * cos_phi - q * sin_phi;
```

这里必须补偿 FIR 群延迟，并为块间卷积保留 `L-1` 个历史样本。G474 的 FPU 和 CMSIS-DSP 适合做浮点原型；确定性能瓶颈后，再考虑 Q15/Q31。

## 对应工程

`DDS`、`2025G/dac_wave.c`：波形产生；`baseboard/fft_analyzer.c`：4096 点 FFT；`separation`：CMSIS-DSP 与 THD；`P/P1/P2/Px2`：Hilbert FIR 移相；`2025G/model_fir.c`：Q30 FIR 与模型响应。
