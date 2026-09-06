---
title: Lesson 0
date: 2026-09-06T12:00:00+08:00
categories:
  - 技术分享
  - 《单片机基础》助教记录
tags:
  - 《单片机基础》助教记录
---

本人第一次当《单片机基础》课程助教，系列文章用于更新课程进度以及**指导书之外**的相关问题，便于追踪课程进度。

在软件配置之前，优先检查一下下发的材料，一部分是厂家SMT，一部分是助教手焊，如发现元件有问题请及时联系助教进行更换或维修，第一节课是元件最为齐全的时候，后面可能会混进去坏的。

接下来正式进入到软件配置相关问题。

### 配置环境时请全程不要使用中文路径，关闭Windows安全中心病毒保护相关功能

### 如果您发现自己的用户名或系统根目录等重要名称是中文的，那么可以权衡一下是尝试去配置环境还是直接想办法把它改成英文的，根据经验来讲大概率配置是不成功的。

### If you find that important names such as your username or system root directory are in Chinese, you may consider whether to attempt environment configuration or directly change them to English. Experience suggests the former approach will most likely fail.

首先，对于参加过蓝桥杯单片机组的同学一定对本学期使用的Keil软件不陌生，但是也需要安装软件包里面的Keil，因为Keil C51并不能进行STM32的开发，需要下载Keil MDK-ARM。

之后我将就我个人进行配置时发现的一些可能出现的问题进行说明：

1.STM32Cube_FW_F1_V1.8.5固件包的保存地址是否有严格限制：原则上是没有的，因为后续在STM32CubeMX生成文件时可以进行手动调整，如果不想以后每次都手动调整的话就按照指导书进行配置即可。

![软件配置界面](/images/posts/lesson-0/image.png)

2.注册机keygen.exe找不到怎么办：已知课程组提供的资料包中具有该程序，所以请关闭所有杀毒软件（Windows安全中心，360杀毒等等），如下图所示。进行重新尝试如果依旧没有及时联系老师和助教。

![注册机文件位置](/images/posts/lesson-0/image-1.png)

3.AC5编译器下载过程中没有ARMCC文件夹怎么办：新建一个，亲测直接强制写一个路径该下载程序不会自动新建对应文件夹。后续下载过程中如果出现了warning内容多数情况下直接next就可以。

4.打不开 Project -> Manage -> Project Items怎么办，该选项显示为灰色：如果已经完成了前面的相关配置可以去打开资料包中的程序，对应地址为："timer_pwm\MDK-ARM\timer_pwm.uvprojx"，打开之后即可解决该问题。对于如何打开该工程参见下图：

![工程文件位置](/images/posts/lesson-0/image-2.png)

![打开工程示例](/images/posts/lesson-0/image-3.png)

之后的创建新的工程等步骤严格按照指导书中的进行即可，在使用CubeMX的过程中我们需要注意几个问题。

1.在进行“generate code”时，我们要选取工程的地址，请保持工程的路径清晰干净，如下图所示，不要产生杂乱的嵌套，会影响到相关文件的读取。

![工程生成路径](/images/posts/lesson-0/image-4.png)

2.如果需要使用 CubeMX 重新生成代码，手动添加的代码应放在 USER CODE BEGIN 和 USER CODE END 标记之间。放在这些标记之外的代码，重新生成工程时可能会被 CubeMX 覆盖。while 循环中的代码应写在 USER CODE BEGIN WHILE 与 USER CODE END WHILE 之间。

![代码书写位置](/images/posts/lesson-0/image-5.png)

尽量不要出现whil里面明明是空的却问是代码哪里有问题的状况。

## **祝各位顺利**

<!-- more -->
