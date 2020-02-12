---
title: 详解 YUV 格式（I420/YUV420/NV12/NV12/YUV422）
date: 2020-01-26 14:30:16
tags:
  - Audio/Video
categories:
  - Tech
---

`YUV` （`Y'CbCr`）是一种像素格式，常见于视频编码与静态图像。与 `RGB` 格式（红-绿-蓝）相反，YUV 分别由一个称为 `Y`（相当于灰度）的“亮度”分量（Luminance or Luma）和两个称为 `U`（蓝色投影 `Cb`）和 `V`（红色投影 `Cr`）的“色度”分量（Chrominance or Chroma）表示，由此得名。

仅有 Y 分量而没有 UV 分量信息，一样可以显示完整的黑白（灰度）图像，解决了模拟信号电视黑白与彩色的兼容问题。

<!-- more -->

## 采样

色度通道（UV）的采样率可以低于亮度通道（Y），而不会显着降低感知质量。一种称为 “A:B:C” 的表示法用于描述相对于 Y 采样， U 和 V 的频率：

- 4:4:4 表示不降低色度（UV）通道的采样率。每个 Y 分量对应一组 UV 分量。
- 4:2:2 表示 2:1 水平下采样，没有垂直下采样。每两个 Y 分量共享一组 UV 分量。
- 4:2:0 表示 2:1 水平下采样，同时 2:1 垂直下采样。每四个 Y 分量共享一组 UV 分量。
- 4:1:1 表示 4:1 水平下采样，没有垂直下采样。每四个 Y 分量共享一组 UV 分量。4:1:1 采样比其他格式少见，本文不再详细讨论。

下图显示了如何针对每个下采样率采样色度。亮度样本用十字表示，色度样本用圆圈表示。

![YUV Sampling](https://raw.githubusercontent.com/Fongim/personal_blog_image/master/image/20200212164150.png)

## 存储格式

YUV 在存储上通常分为平面格式（`Planar`），半平面格式（`Semi-Planar`）以及打包格式（`Packed`）。

### Planar 平面格式

平面格式有时也称为三面格式（`Triplanar`），即 Y, U, V 三个分量各自使用单独的数组保存，这种三平面分离的格式比较方便视频编码。

#### YU12 (I420)

- 4:2:0 Formats, 12 Bits per Pixel, 3 Planars

> [FOURCC I420](http://www.fourcc.org/pixel-format/yuv-i420/)

`YU12` 即 `I420`，也叫 `IYUV`，属于 `YUV420P` 格式。三个平面，分别存储 Y U V 分量。每四个 Y 分量共享一组 UV 分量。U、V 平面的 strides, width 和 height 都是 Y 平面的一半，因此一个像素 12 bits，内存排列如下图所示：

![YU12 Format](https://raw.githubusercontent.com/Fongim/personal_blog_image/master/image/20200212182646.png)

从图中可看出，U、V 平面的每行字节数（strides）、高（height）都是 Y 平面的一半。

`I420` 是音视频开发中常用的一种格式。

#### YV12

- 4:2:0 Formats, 12 Bits per Pixel, 3 Planars

> [FOURCC YV12](http://www.fourcc.org/pixel-format/yuv-yv12/)

`YV12` 与 `I420` 几乎一样，仅改变了 U, V 平面的顺序。内存排列如下图所示：

![YU12 Format](https://raw.githubusercontent.com/Fongim/personal_blog_image/master/image/20200212181507.png)

#### J420

- 4:2:0 Formats, 12 Bits per Pixel, 3 Planars

`J420` 与 `I420` 完全相同，但具有完整范围（0-255，full range）的亮度（Y）分量，而不是有限范围（16-240，limited range，在 iOS 上也叫做 video range）。色度（UV）分量与 I420 中的完全相同。

#### IMC1

- 4:2:0 Formats, 16 Bits per Pixel, 3 Planars

> [FOURCC IMC1](http://www.fourcc.org/pixel-format/yuv-imc1/)

`IMC1` 与 `I420` 类似，U, V 平面的宽（width）、高（height）是 Y 平面的一半，但是每行字节数（strides）与 Y 平面一致，因此 U, V 平面在内存上会有留空（padding），因此一个像素 16 bits，如图所示：

![IMC1 Format](https://raw.githubusercontent.com/Fongim/personal_blog_image/master/image/20200212193133.png)

#### IMC3

- 4:2:0 Formats, 16 Bits per Pixel, 3 Planars

`IMC3` 与 `IMC1` 几乎一样，仅改变了 U, V 平面的顺序。内存排列如下图所示：

![IMC3 Format](https://raw.githubusercontent.com/Fongim/personal_blog_image/master/image/20200212202002.png)

#### I422

- 4:2:2 Formats, 16 Bits per Pixel, 3 Planars

`I422` 属于 `YUV422P` 格式。三个平面，分别存储 Y U V 分量。每两个 Y 分量共享一组 UV 分量。U、V 平面的 strides, width 是 Y 平面的一半，但 height 与 Y 平面一致，因此一个像素 16 bits，内存排列如下图所示：

![YUV422P](https://raw.githubusercontent.com/Fongim/personal_blog_image/master/image/20200212232724.png)

从图中可看出，U、V 平面的每行字节数（strides）是 Y 平面的一半，高（height）与 Y 平面一致。

#### J422

- 4:2:2 Formats, 16 Bits per Pixel, 3 Planars

`J422` 与 `I422` 完全相同，但具有完整范围（0-255，full range）的亮度（Y）分量，而不是有限范围（16-240，limited range，在 iOS 上也叫做 video range）。色度（UV）分量与 I420 中的完全相同。

### Semi-Planar 半平面格式

半平面格式具有两个平面而不是三个平面，一个平面存储亮度（Y）分量，另一个平面存储两个色度（UV）分量。有时也将它们称为双平面格式（`BiPlanar`）。

#### NV12

- 4:2:0 Formats, 12 Bits per Pixel, 2 Planars

> [FOURCC NV12](http://www.fourcc.org/pixel-format/yuv-nv12/)

`NV12` 属于 `YUV420SP` 格式。两个平面，分别存储 Y 分量 和 UV 分量。其中 UV 分量共用一个平面并且以 U, V, U, V 的顺序交错排列。每四个 Y 分量共享一组 UV 分量。

UV 平面的 strides, width 与 Y 平面一样长，但 height 仅为 Y 平面的一半。因此一个像素 12 bits，内存排列如下图所示：

![NV12 Format](https://raw.githubusercontent.com/Fongim/personal_blog_image/master/image/20200212234845.png)

从图中可看出，UV 平面的每行字节数（strides）与 Y 平面一致，高（height）是 Y 平面的一半。

`NV12` 是 iOS 相机（`AVCaptureOutput`）可直接输出的两种视频帧格式之一，另外一种是 `BGRA32`(`kCVPixelFormatType_32BGRA`)。

在 iOS 上，`NV12` 还分为 Full Range (0-255, `kCVPixelFormatType_420YpCbCr8BiPlanarFullRange`) 和 Video Range (16-240, `kCVPixelFormatType_420YpCbCr8BiPlanarVideoRange`)，区别仅为亮度（Y）分量的取值范围，一般而言，Full Range 适用于静态图像（拍照），Video Range 适用于视频采集（摄像）。

#### NV21

- 4:2:0 Formats, 12 Bits per Pixel, 2 Planars

> [FOURCC NV21](http://www.fourcc.org/pixel-format/yuv-nv21/)

`NV21` 属于 `YUV420SP`，与 `NV12` 几乎一致，区别是 UV 平面中 U 与 V 的排列顺序颠倒，以 V, U, V, U 的顺序交错排列，内存排列如图所示：

![NV21 Format](https://raw.githubusercontent.com/Fongim/personal_blog_image/master/image/20200212235436.png)

`NV21` 是 Android 相机（`Camera`）默认的输出格式。

### Packed 打包格式

打包格式通常只有一个平面，所有亮度（Y）和色度（UV）数据都交织在一起。有点类似于 RGB 格式，只是使用了不同的色彩空间。

打包格式在网络摄像头中较为常见。硬件设备使用多平面格式效率较低，因为每个像素需要多次内存访问。而打包格式由于仅一个平面，访问内存的开销较小。

#### AYUV

- 4:4:4 Formats, 32 Bits per Pixel

> [FOURCC AYUV](http://www.fourcc.org/pixel-format/yuv-ayuv/)

AYUV 是 Packed 打包格式，其中每个像素编码为四个连续字节，每个像素在内存中按照 V, U, Y, A 的顺序排列（A 指 alpha 通道），如下图所示：

![AYUV Format](https://raw.githubusercontent.com/Fongim/personal_blog_image/master/image/20200212165800.png)

#### YUYV (V422 / YUY2 / YUNV)

- 4:2:2 Formats, 16 Bits per Pixel

> [FOURCC YUY2](http://www.fourcc.org/pixel-format/yuv-yuy2/)

`YUYV` 通常也称作 `V422`、`YUY2`、`YUNV`

YUY2 是 Packed 打包格式，其中两个像素共用一组 UV 分量，内存中按照 Y U Y V 的顺序排列，如下图所示：

![YUYV Format](https://raw.githubusercontent.com/Fongim/personal_blog_image/master/image/20200212171116.png)

#### UYVY (Y422 / UYNV)

- 4:2:2 Formats, 16 Bits per Pixel

> [FOURCC UYVY](https://www.fourcc.org/pixel-format/yuv-uyvy/)

`UYVY` 通常也称作 `Y422`、`UYNV`

`UYVY` 与 `YUYV` 类似，只是亮度（Y）分量与色度（UV）分量排列顺序颠倒，如下图所示：

![UYVY Format](https://raw.githubusercontent.com/Fongim/personal_blog_image/master/image/20200212172050.png)

## 参考资料

1. [Microsoft: Recommended 8-Bit YUV Formats for Video Rendering](https://docs.microsoft.com/en-us/windows/win32/medfound/recommended-8-bit-yuv-formats-for-video-rendering)

2. [VideoLAN's Wiki: YUV](https://wiki.videolan.org/YUV#Semi-planar)

3. [FOURCC: YUV pixel formats](https://www.fourcc.org/yuv.php)

4. [WWDC2011: Capturing from the Camera using AV Foundation on iOS 5](https://developer.apple.com/videos/play/wwdc2011/419/?time=1527)
