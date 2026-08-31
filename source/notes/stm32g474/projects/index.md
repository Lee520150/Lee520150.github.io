---
title: G474 工程索引
layout: stm32-note
math: false
chapter: projects
chapter_label: Chapter 05 / Project Map
description: 按知识用途整理本机工程，定位可复用实现，而不是把生成文件和历史副本当成学习内容。
---

## 阅读说明

本索引依据各工程 `.ioc` 的 MCU 与外设配置，以及 `Core` 中自编写源码整理。HAL/CMSIS、构建目录和备份副本不计入驱动模块。工程目前仍保留在本机，网页只摘录关键代码；完整源码链接以后统一接入 GitHub。

## 波形与 DSP

| 工程 | 主要外设 | 可学习内容 |
| --- | --- | --- |
| `DDS` | DAC1、DMA、SPI1、TIM6 | 软件 DDS、AD9959、多通道频率/相位/幅值控制 |
| `baseboard` | ADC1、DAC2/3、DMA、OPAMP3 | 4096 点 FFT、幅值校正、THD、实时移相 |
| `separation` | ADC1、DAC1/2、DMA、TIM6/7 | CMSIS-DSP FFT、谐波分离与 THD |
| `P/P1/P2/Px2` | ADC1/2、DAC2、DMA、TIM7 | Hilbert FIR、群延迟、任意相位合成 |
| `VGA` | DAC2、DMA、TIM7 | 波形输出与可变增益控制实验 |
| `g4_test` | ADC1、DAC1、DMA、TIM6 | 最小 ADC/DAC/DMA 验证工程 |

## 测量系统

| 工程 | 主要外设 | 可学习内容 |
| --- | --- | --- |
| `LCR` | ADC1、DAC2、DMA、LPUART1 | 正交相关、复阻抗、TIA 自动量程、扫频 |
| `TDC` | COMP1/2、DAC1、SPI3、USART2 | 比较器阈值、GP22 寄存器和 TOF 测量 |
| `TDC_test` | SPI1、LPUART1 | GP22 总线与寄存器最小验证 |
| `micro_resistence` | ADC/GPIO 基础链 | 微电阻测量实验入口，后续需补齐标定记录 |
| `2026NUEDC` | ADC1、DAC3、OPAMP1/3、DMA | 片内模拟前端与同步采样组合 |
| `2025G` | DAC1、I2C1、TIM3/7、UART | Bode 扫频、模型拟合、实时 FIR 与屏幕交互 |

## 人机交互与器件

| 工程 | 主要外设 | 可学习内容 |
| --- | --- | --- |
| `LP_SCREEN` | GPIO/SPI 类控制 | JLX16080G 显示、RF switch |
| `screen` | USART1、TIM7 | 串口屏通信与波形数据显示 |
| `test` | I2C1、SPI3、TIM3、USART2 | 多总线联调模板 |
| `2025G` | I2C1、USART1/2 | DGUS、AHT20、BH1745、QMI8568、SPL06、VL53L0X |

## 原型与分支工程

`P_problem`、`untitled` 以及部分编号分支属于问题复现或阶段性原型。它们可以用于对比配置与排错，但不作为首选模板。复用代码时应从功能最完整、测试记录最清楚的工程抽取模块，再回到一个最小工程验证。

## 推荐复习顺序

1. 用 `g4_test` 验证时钟、ADC、DAC 与 DMA。
2. 用 `DDS` 掌握定时器节拍、查表与外部 DDS。
3. 用 `baseboard` 或 `separation` 完成 FFT、幅值与 THD。
4. 用 `LCR` 理解同步测量、复数运算和自动量程。
5. 用 `TDC` 与 `2025G` 学习复杂器件协议、校准和系统整合。

## 后续维护规则

- 新工程先在本页登记用途、板卡、关键外设和验证状态。
- 成熟功能提取成独立 `.c/.h`，不要继续复制整个 `main.c`。
- 公式旁记录参数单位、采样率、缓冲长度和校准条件。
- 代码上传 GitHub 时再为每章补“完整源码”入口，网页路径无需改变。
