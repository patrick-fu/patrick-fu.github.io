---
title: 解决 CocoaPods trunk CDN 连接不上的问题
date: 2020-04-10 16:22:10
tags:
  - iOS
  - CocoaPods
categories:
  - Note
---

CocoaPods 自 1.8 版本开始默认使用 trunk CDN ([https://cdn.cocoapods.org/](https://cdn.cocoapods.org/)) 作为 spec 的源，本意是非常好的，避免了需要本地 clone 一份庞大的 [Specs](https://github.com/CocoaPods/Specs.git) 仓库导致每次 update 都要全量更新的问题。然而不知为何国内连 trunk CDN 都被限制访问了。

常见的问题是 `pod install` 时报错 `CDN: trunk URL couldn't be downloaded` 以及 `pod repo update` 时 `CDN: trunk Repo update failed`

以下是几种解决方案。

<!-- more -->

## 安装 CocoaPods

在执行以下步骤之前，请确保已安装 CocoaPods。

> 可执行 `pod --version` 检查是否有安装 CocoaPods 并查看版本号。

安装 CocoaPods：打开终端 Terminal，执行：

```sh
sudo gem install cocoapods
```

请参阅 [CocoaPods入门](https://guides.cocoapods.org/using/getting-started.html#getting-started)

> 注：若根据以上入门指引，因网络问题无法下载安装 CocoaPods，可考虑使用 Ruby Gems 镜像源：
>
> - 清华 Gems 镜像站: [https://mirror.tuna.tsinghua.edu.cn/help/rubygems/](https://mirror.tuna.tsinghua.edu.cn/help/rubygems/)
>
> - Ruby China 镜像站: [https://gems.ruby-china.com](https://gems.ruby-china.com)

## 解决连接不上 trunk CDN 的问题

### 方案一：使用代理

不管是使用旧版 CocoaPods 还是使用镜像源，都不是最优解，为了充分使用 CocoaPods 的特性，最推荐的还是使用代理来解决无法连接 trunk CDN 的问题。

### 方案二：使用旧版 CocoaPods

1.7.5 版本的 CocoaPods 默认使用 [Specs](https://github.com/CocoaPods/Specs.git) 作为 repo 源，可以卸载后重新安装旧版 CocoaPods。

- 卸载：

```sh
sudo gem uninstall cocoapods
```

- 安装 CocoaPods 1.7.5：

```sh
sudo gem install cocoapods -v 1.7.5
```

### 方案三：手动切换使用官方 Git 源 / 镜像源

> 不推荐此方案，比较繁琐。

1. 检查当前使用的源

    先执行 `pod repo list` 查看本机的源有哪些，如果存在一个 master 源 (`URL: https://github.com/CocoaPods/Specs.git`) 以及一个 trunk 源 (`URL: https://cdn.cocoapods.org/`)，则无需操作下面的第二步，可直接执行 `pod repo remove trunk` 删除 trunk CDN 源。

    若使用 1.9.1 或以上版本，应该只存在一个 trunk CDN 源，此时需要手动添加 Git 源

2. 添加源

    - 添加 [官方 CocoaPods Git 源](https://github.com/CocoaPods/Specs.git)

        执行 `pod repo add cocoapods https://github.com/CocoaPods/Specs.git`

    - 添加 [清华 CocoaPods 镜像源](https://mirror.tuna.tsinghua.edu.cn/help/CocoaPods/)

        执行 `pod repo add tuna https://mirrors.tuna.tsinghua.edu.cn/git/CocoaPods/Specs.git`

3. 执行 `pod repo update --verbose`

4. 在 iOS 项目根目录下的 `Podfile` 文件里指定源

    > 若找不到 `Podfile`，请先 `cd` 进 iOS 项目的根目录，执行 `pod init`

    往 `Podfile` 的第一行添加一句 `source https://xxxxx.git` （其中的 URL 为上一步添加的源的 URL）

    例：使用清华源

    ```ruby
    source 'https://mirrors.tuna.tsinghua.edu.cn/git/CocoaPods/Specs.git'

    target 'MyProject' do
      use_frameworks!
    end
    ```

    如果没有在 Podfile 里指定 source 的话，1.8 版本以上的 CocoaPods 会自动重新添加并使用 trunk CDN 源，因此每个项目的 Podfile 都需要显式指定 source，非常麻烦。
