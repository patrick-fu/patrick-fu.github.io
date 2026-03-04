---
title: 'macOS 使用 QuickLook 预览高亮查看任意代码源文件'
date: '2020-04-05 22:32:43'
tags:
  - 'macOS'
  - 'QuickLook'
categories:
  - 'Note'
slug: '2020-04-05-make-mac-quicklook-any-code-source-file'
---

很多源码文件 macOS 默认不支持通过空格快速查看，比如 Flutter 的 `.dart` 文件、YAML 的 `.yaml`、`.yml`、CocoaPods 的 `Podfile`、`Podfile.lock` 等等。

![dart](https://raw.githubusercontent.com/patrick-fu/personal_blog_image/master/image/20200405170111.png)

就算通过右键文件，`显示简介` -> `打开方式` 将其设置为全部通过 VSCode、Android Studio 等应用打开，解决了能双击文件打开的问题，也还是不能 QuickLook 快速预览。

![vscode_dart](https://raw.githubusercontent.com/patrick-fu/personal_blog_image/master/image/20200405170604.png)

普通的 `.h`、`.cpp` 等源码文件虽然系统是认识了，但没有代码高亮，看瞎眼。

![h_file](https://raw.githubusercontent.com/patrick-fu/personal_blog_image/master/image/20200405170330.png)

## 安装插件

幸好有成吨的开源插件做了这些事，不用重复造轮子。

GitHub 项目链接：[https://github.com/sindresorhus/quick-look-plugins](https://github.com/sindresorhus/quick-look-plugins)

其他关于 QuickLook Plugin 的介绍：

- [https://sspai.com/post/31927](https://sspai.com/post/31927)

- [https://zhuanlan.zhihu.com/p/57203915](https://zhuanlan.zhihu.com/p/57203915)

关于 QuickLook 的介绍参考以上两个链接，就不再啰嗦了。

对于本文讨论的高亮预览源码文件的需求，我们可以安装 [QLColorCode](https://github.com/anthonygelibert/QLColorCode) 用于代码高亮、[QLStephen](https://github.com/whomwah/qlstephen) 用于预览无后缀名的文件。

推荐通过 Homebrew 来安装，以便集中管理。

```sh
brew cask install qlcolorcode

brew cask install qlstephen
```

> 需要注意的是如果 macOS 系统版本是 10.15 Catalina 及以上，安装完插件后需要额外执行一下
>
> `xattr -r ~/Library/QuickLook`
>
> `xattr -d -r com.apple.quarantine ~/Library/QuickLook`
>
> 以解决运行不了 QuickLook 插件的问题

## 添加扩展文件

然而即便安装了里面的 [QLColorCode](https://github.com/anthonygelibert/QLColorCode) 也还是没法查看这些系统不认识的文件比如 `.dart`，此时可修改一下这个插件的配置文件使其支持

打开 `~/Library/QuickLook/QLColorCode.qlgenerator/Contents/Info.plist` 文件

找到 `Document types > Item 0 > Document Content Type UTIs (CFBundleDocumentTypes > Item 0 > LSItemContentTypes`

![plist](https://raw.githubusercontent.com/patrick-fu/personal_blog_image/master/image/20200405172403.png)

点击➕添加一行 `.dart` 文件格式，如上图所示

```sh
com.apple.disk-image-dart
```

保存后即生效，其他类型文件也可通过这个方法来快速预览。

然而如何查看具体某种文件格式的类型呢？

通过这条命令

```sh
mdls -name kMDItemContentType ./main.dart
```

就能得到传入的文件类型了

```sh
kMDItemContentType = "com.apple.disk-image-dart"
```

把常见的源码文件都添加进 `~/Library/QuickLook/QLColorCode.qlgenerator/Contents/Info.plist`，生产效率大大提高💪

![dart](https://raw.githubusercontent.com/patrick-fu/personal_blog_image/master/image/20200405173836.png)

![h](https://raw.githubusercontent.com/patrick-fu/personal_blog_image/master/image/20200405173841.png)

## 参考

1. [https://medium.com/@claudmarotta/how-to-preview-dart-files-with-macos-quick-look-54779340811f](https://medium.com/@claudmarotta/how-to-preview-dart-files-with-macos-quick-look-54779340811f)

2. [https://github.com/anthonygelibert/QLColorCode](https://github.com/anthonygelibert/QLColorCode)

3. [https://github.com/whomwah/qlstephen/issues/81#issuecomment-582365549](https://github.com/whomwah/qlstephen/issues/81#issuecomment-582365549)
