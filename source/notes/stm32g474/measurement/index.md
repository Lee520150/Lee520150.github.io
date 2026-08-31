---
title: 测量与校准
layout: stm32-note
math: true
chapter: measurement
chapter_label: Chapter 03 / Measurement
description: 从同步检波到复阻抗、扫频建模和时间数字转换，建立“激励—采样—估计—校准”的闭环。
---

## 1. 测量系统的共同结构

现有工程里的 LCR、Bode、微电阻和 TDC 看似不同，本质上都遵循：生成已知激励、同步采集响应、估计目标参数、通过基准消除系统误差。真正决定精度的往往不是公式本身，而是同步、量程和校准。

## 2. 正交相关检测

对已知频率 \(f_0\) 的信号，可分别与正弦、余弦参考相关：

\[
X=\frac{2}{N}\sum_{n=0}^{N-1}x[n]\cos(2\pi f_0n/f_s),\quad
Y=\frac{2}{N}\sum_{n=0}^{N-1}x[n]\sin(2\pi f_0n/f_s)
\]

于是幅值 \(A=\sqrt{X^2+Y^2}\)，相位 \(\phi=\operatorname{atan2}(Y,X)\)。相关检测只提取目标频率附近的能量，对宽带噪声比峰峰值法稳健。

## 3. LCR 复阻抗

`LCR/Core/Src/main.c` 同步采集被测端电压与跨阻放大器输出，分别形成复数相量 \(V=V_r+jV_i\)、\(I=I_r+jI_i\)，再计算：

\[
Z=\frac{V}{I}=\frac{(V_rI_r+V_iI_i)+j(V_iI_r-V_rI_i)}{I_r^2+I_i^2}
\]

```c
float den = i_re * i_re + i_im * i_im;
z_re = (v_re * i_re + v_im * i_im) / den;
z_im = (v_im * i_re - v_re * i_im) / den;
```

由 \(Z=R+jX\) 可换算常见串联模型：

\[
L_s=\frac{X}{2\pi f}\;(X>0), \qquad
C_s=-\frac{1}{2\pi fX}\;(X<0)
\]

若跨阻反馈电阻并联电容 \(C_f\)，还需要补偿反馈网络的频率响应。当前工程采用 `Zraw = Zdut * (1 - jωRfCf)` 形式；其符号与增益应通过标准件再次标定。

## 4. 自动量程

TIA 量程的目标是让 ADC 利用足够动态范围又不削顶。程序统计电流通道相对均值的峰值码，超过上阈值则降低反馈电阻，低于下阈值则提高反馈电阻。切换后必须丢弃若干稳定块，避免开关瞬态进入结果。

采用两条不同阈值形成迟滞，可防止量程在边界反复跳变。最终结果应同时保存量程编号、峰值码和溢出标志，便于复盘。

## 5. Bode 扫频与模型拟合

传递函数由输入、输出相量相除得到：

\[
G_{dB}=20\log_{10}\left|\frac{V_o}{V_i}\right|,\qquad
\phi=\arg(V_o)-\arg(V_i)
\]

`2025G/learned_model.c` 收集频率、输入幅值、输出幅值和相位，寻找峰值与半功率点，再形成带通模型。拟合结果写入 Flash 前计算 CRC32，启动时校验魔数、版本与 CRC，避免把损坏参数当成有效模型。

## 6. GP22 时间数字转换

`TDC/gp22.c` 通过 SPI 读写 24/32 位寄存器，并读取飞行时间原始值。通用的标定关系应写成：

\[
t_{meas}=K_{cal}\cdot Code_{TDC}, \qquad
d=\frac{v\,t_{meas}}{2}
\]

其中 \(K_{cal}\) 由参考时钟和器件校准结果决定，\(v\) 是传播速度。当前工程中的 `raw * 90 ps` 和 `time_ps * 0.15 mm` 属于实验阶段的简化换算，不应脱离具体硬件直接复用。

## 7. 校准清单

- ADC 零点、参考电压与通道增益。
- 激励实际幅值及 DAC 输出偏置。
- 模拟前端增益、极性和相位延迟。
- TIA 各档反馈阻值与寄生电容。
- 开路、短路、标准阻抗或标准时间基准。
- 每次结果保存频率、量程、原始码和校准版本。

## 对应工程

`LCR`：复阻抗和自动量程；`baseboard`：FFT 分析与移相；`2025G`：Bode 扫频、模型拟合与 Flash 保存；`TDC/TDC_test`：GP22；`micro_resistence`：微电阻测量方向；`2026NUEDC`：ADC、OPAMP 与 DAC3 组合测量链。
