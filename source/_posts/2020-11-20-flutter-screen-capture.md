---
title: Flutter 移动端屏幕采集方案分享
date: 2020-11-20 12:12:59
tags:
  - Flutter
  - iOS
  - Android
categories:
  - Tech
---

现如今随着 Flutter 的应用越来越广泛，纯 Flutter 项目也越来越多，本篇内容主要分享的是 Flutter 移动端（iOS + Android）的屏幕采集的实现。

<!-- more -->

## 概述

在视频会议、线上课堂、游戏直播等场景，屏幕共享是一个最常见的功能。屏幕共享就是对屏幕画面的实时共享，端到端主要有几个步骤：录屏采集、视频编码及封装、实时传输、视频解封装及解码、视频渲染。

一般来说，实时屏幕共享时，共享发起端以固定采样频率（一般 8 - 15帧足够）抓取到屏幕中指定源的画面（包括指定屏幕、指定区域、指定程序等），经过视频编码压缩（应选择保持文本/图形边缘信息不失真的方案）后，在实时网络上以相应的帧率分发。

因此，屏幕采集是实现实时屏幕共享的基础，它的应用场景也是非常广泛的。

## 实现

### 准备

首先我们看看原生系统提供了哪些能力来进行屏幕录制。

1. iOS 11.0 提供了 `ReplayKit 2` 用于采集跨 App 的全局屏幕内容，但仅能通过控制中心启动；iOS 12.0 则在此基础上提供了从 App 内启动 ReplayKit 的能力。

2. Android 5.0 系统提供了 `MediaProjection` 功能，只需弹窗获取用户的同意即可采集到全局屏幕内容。

我们再看一下 Android / iOS 的屏幕采集能力有哪些区别。

1. iOS 的 `ReplayKit` 是通过启动一个 `Broadcast Upload Extension` 子进程来采集屏幕数据，需要解决主 App 进程与屏幕采集子进程之间的通信交互问题，同时，子进程还有诸如运行时内存最大不能超过 50M 的限制。

2. Android 的 `MediaProjection` 是直接在 App 主进程内运行的，可以很容易获取到屏幕数据的 `Surface`。

### 解决方案

虽然无法避免原生代码，但我们可以尽量以最少的原生代码来实现 Flutter 屏幕采集。将两端的屏幕采集能力抽象封装为通用的 Dart 层接口，只需一次部署完成后，就能开心地在 Dart 层启动、停止屏幕采集了。

#### **iOS**

打开 `Runner` Xcode Project，新建一个 `Broadcast Upload Extension` Target，在此处理 ReplayKit 子进程的业务逻辑。

首先需要处理主 App 进程与 ReplayKit 子进程的跨进程通信问题，由于屏幕采集的 audio/video buffer 回调非常频繁，出于性能与 Flutter 插件生态考虑，在原生侧处理音视频 buffer 显然是目前最靠谱的方案，那剩下要解决的就是启动、停止信令以及必要的配置信息的传输了。

对于启动 `ReplayKit` 的操作，可以通过 Flutter 的 MethodChannel 在原生侧 new 一个 `RPSystemBroadcastPickerView`，这是一个系统提供的 View，包含一个点击后直接弹出启动屏幕采集窗口的 Button。通过遍历 Sub View 的方式找到 Button 并触发点击操作，便解决了启动 `ReplayKit` 的问题。

然后是配置信息的同步问题。

- 一是使用 iOS 的 `App Group` 能力，通过 NSUserDefaults 持久化配置在进程间共享配置信息，分别在 `Runner` Target 和 `Broadcast Upload Extension` Target 内开启 App Group 能力并设置同一个 App Group ID，然后就能通过 `-[NSUserDefaults initWithSuiteName]` 读写此 App Group 内的配置了。

- 二是使用跨进程通知 `CFNotificationCenterGetDarwinNotifyCenter` 携带配置信息来实现进程间通信。

接下来是停止 ReplayKit 的操作。也是使用上述的 CFNotification 跨进程通知，在 Flutter 主 App 发起结束屏幕采集的通知，ReplayKit 子进程接收到通知后调用 `-[RPBroadcastSampleHandler finishBroadcastWithError:]` 来结束屏幕采集。

<center><img src=https://raw.githubusercontent.com/patrick-fu/personal_blog_image/master/image/20201120152638.png width=80%></center>

#### **Android**

启动屏幕采集时，直接通过 Flutter 的 MethodChannel 在原生侧通过 `MediaProjectionManager` 弹出一个向用户请求屏幕采集权限的弹窗，收到确认后即可调用 `MediaProjectionManager.getMediaProjection()` 函数拿到 `MediaProjection` 对象。

然后根据业务场景需求从屏幕采集 buffer 的消费者拿到 `Surface`，例如，要保存屏幕录制的话，从 `MediaRecoder` 拿到 Surface，要录屏直播的话，可调用音视频直播 SDK 的接口获取 Surface。

有了 `MediaProjection` 和消费者的 `Surface`，接下来就是调用 `MediaProjection.createVirtualDisplay()` 函数传入 Surface 来创建 `VirtualDisplay` 实例，从而获取到屏幕采集 buffer。

最后是结束屏幕采集，相比 iOS 复杂的操作，Android 仅需要将 `VirtualDisplay` 和 `MediaProjection` 实例对象释放即可。

## 实战示例

一个实现了 iOS/Android 屏幕采集并使用 **[ZEGO Express Audio and Video Flutter SDK](https://pub.dev/packages/zego_express_engine)** 进行推流直播的示例 Demo。

**[https://github.com/zegoim/zego-express-example-screen-capture-flutter](https://github.com/zegoim/zego-express-example-screen-capture-flutter)**
