---
title: 通信与器件驱动
layout: stm32-note
math: true
chapter: devices
chapter_label: Chapter 04 / Devices
description: 用统一的分层方法组织 SPI、I2C、UART 与 GPIO 器件驱动，让更换工程时不再重复拆代码。
---

## 1. 驱动分层

一个可复用器件驱动至少分成三层：

1. **总线层**：SPI/I2C/UART 读写、片选、超时和错误码。
2. **寄存器层**：地址、位域、字节序、复位和初始化序列。
3. **业务层**：设置频率、读取距离、刷新屏幕等面向任务的接口。

驱动文件不应直接拥有整个 `main()` 的状态。推荐在句柄中保存 HAL 外设指针、GPIO 和配置，使同一驱动可以连接不同实例。

## 2. SPI：事务和字节序

先从数据手册确认 CPOL、CPHA、位宽、最高时钟、片选时序和字节序。`TDC/Core/Src/gp22.c` 使用“命令字节 + 大端 32 位数据”：

```c
uint8_t tx[5] = {
    (uint8_t)(0x80U | address),
    (uint8_t)(value >> 24), (uint8_t)(value >> 16),
    (uint8_t)(value >> 8),  (uint8_t)value
};

HAL_GPIO_WritePin(CS_GPIO_Port, CS_Pin, GPIO_PIN_RESET);
HAL_SPI_Transmit(&hspi3, tx, sizeof(tx), HAL_MAX_DELAY);
HAL_GPIO_WritePin(CS_GPIO_Port, CS_Pin, GPIO_PIN_SET);
```

调试第一步不是跑完整业务，而是写入测试图样再读回，先验证模式、线序和片选。

## 3. AD9959：寄存器更新边界

AD9959 驱动包含 `CS`、`MASTER_RESET` 和 `IO_UPDATE` 三类控制。寄存器写完并不一定立即生效，必须在一组参数写完后产生 `IO_UPDATE` 脉冲，避免频率、相位、幅值分批改变。

频率字、相位字和幅度字分别由 FTW、POW、ACR 控制。多通道更新时应先选择通道、写参数，最后统一更新；扫频时把通信操作与固定周期调度分开。

## 4. I2C：传感器接入

`2025G` 中整理出了 AHT20、BH1745、QMI8568、SPL06、VL53L0X 等器件。它们虽测量对象不同，接入步骤基本一致：

- 上电等待和软复位。
- 读取器件 ID，确认地址和总线连接。
- 写配置寄存器并读回验证。
- 启动测量，等待数据就绪。
- 按数据手册拼接原始码，再做比例和温漂补偿。

I2C 地址在 HAL 中通常需要左移一位；是传入 7 位地址还是 8 位地址必须在驱动接口中统一，不能每个调用点自行猜测。

## 5. UART：中断接收与帧解析

`2025G/dgus.c` 采用单字节中断接收、状态机拼帧和命令队列。回调只把字节送入解析器并立即重新挂接接收：

```c
void HAL_UART_RxCpltCallback(UART_HandleTypeDef *huart)
{
    if (huart == dgus_uart) {
        DGUS_ProcessByte(dgus_rx_byte);
        HAL_UART_Receive_IT(dgus_uart, &dgus_rx_byte, 1U);
    }
}
```

完整帧解析必须处理帧头、长度、命令、地址和负载，并在非法长度或超时后回到等待帧头状态。发送端可用队列隔离 UI 刷新与实时测量，避免串口阻塞采样链。

## 6. 显示和射频开关

`LP_SCREEN` 中的 `jlx16080g` 与 `rf_switch` 代表 GPIO/SPI 类低速控制器件。此类驱动的重点是把端口映射、复位时序、刷新区域和业务状态分开。屏幕全帧刷新耗时较长，应优先局部更新；射频开关切换后应留出稳定时间再采样。

## 驱动验收表

| 项目 | 验证内容 |
| --- | --- |
| 电气 | 电平、电源、上拉、模拟地与数字地 |
| 总线 | 模式、速率、字节序、片选与超时 |
| 身份 | ID/状态寄存器可重复读取 |
| 配置 | 写入后读回，复位后恢复默认值 |
| 边界 | 最大最小参数、断线、忙状态与校验失败 |
| 时序 | 逻辑分析仪波形与数据手册一致 |

## 对应工程

`DDS`：AD9959；`TDC/TDC_test`：GP22；`2025G`：DGUS 与多种 I2C 传感器；`LP_SCREEN`：JLX16080G 和 RF switch；`screen`：串口屏与波形数据；`test`：SPI3、I2C1 与 USART2 联调。
