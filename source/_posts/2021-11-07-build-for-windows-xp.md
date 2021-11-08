---
title: 如何构建一个支持 Windows XP 的 LIB/DLL/EXE
date: 2021-11-07 17:38:41
tags:
  - Windows
  - GN
  - Ninja
  - CMake
categories:
  - Tech
---

最近把公司的一些大型跨平台 C++ Base 项目从 CMake 构建系统切换到了 Google 的 [GN Build](https://gn.googlesource.com/gn/)。进展都比较顺利，直到有客户需要一个支持 Windows XP 的动态库。。。

虽然马上就要 2022 年，距离 XP 的诞生已经超过 20 年，距离 XP 的废弃也超过 7 年了，但仍然架不住还是将近有 5% 的计算机运行着 XP （大陆地区甚至有 15% ！），既然客户需要，那还是得支持 🤷‍♂️

<!-- more -->

实际上这个项目在几年前已经做过一次 XP 的适配，也顺利交付过很多次了，但明显 Google Chromium 的工具链默认并不支持 Windows XP。

## 构建支持

经过一番研究，实际上在构建这块，想要支持 XP 还是比较简单的，难的是代码中如何解决适配那些 XP 没有提供的 Windows API。以下按照不同的 Windows 工程来讨论。

### 原生 Visual Studio 工程

1. 首先确保你的 Visual Studio 已安装 XP 工具集（例如 VS 2019 的需要安装标注了已废弃的 v141_xp 工具集。

    ![Visual Studio Installer v141_xp](https://raw.githubusercontent.com/patrick-fu/personal_blog_image/master/image/visual_studio_installer_xp.png)

2. 打开解决方案/项目，在项目属性中找到常规 -> 平台工具集，选择 v141_xp 或其他带有 xp 后缀的工具集。

    ![Visual Studio Project Properties Toolset](https://raw.githubusercontent.com/patrick-fu/personal_blog_image/master/image/visual_studio_project_properties.png)

3. 改动保存后，注意到此时 Windows SDK 的版本会自动切换到 7.0。然后再次生成项目，就能构建出一个支持 Windows XP 的库/可执行二进制了。

### CMake 工程

1. 需要使用 Visual Studio Generator，参考 [CMake Visual Studio Generator](https://cmake.org/cmake/help/v3.22/manual/cmake-generators.7.html#visual-studio-generators)

2. 通过 `-T` 参数指定 v141_xp 或 v140_xp 的工具集，参考 [CMAKE_GENERATOR_TOOLSET](https://cmake.org/cmake/help/v3.22/variable/CMAKE_GENERATOR_TOOLSET.html#variable:CMAKE_GENERATOR_TOOLSET)

3. 例如 `cmake -GVisual Studio 15 2017 -Tv141_xp`

### GN (Ninja) 工程

> 此方式不仅适用于 GN 工程，也适用于任何直接调用 MSBuild 命令行工具的构建系统。

1. 为所有 `source_set` 添加 `_USING_V110_SDK71_` 这个 `defines` （宏定义），即为 `cl.exe` 添加参数 `/D_USING_V110_SDK71_` （用于传递给源码中可能出现的 XP 分支宏，这是官方推荐的 XP 专用宏）

2. 为你的 `shared_library` 或 `executable` Target 添加 `/SUBSYSTEM:WINDOWS,"5.02"` 这个 `ldflags` （链接器参数） ，即为 `link.exe` 指定构建目标为 5.02 (Windows XP SP2)，参考 [链接器选项 /SUBSYSTEM（指定子系统）](https://docs.microsoft.com/en-us/cpp/build/reference/subsystem-specify-subsystem?view=msvc-160)

3. 如果你使用的是 Google Chromium 的 [`build`](https://github.com/chromium/chromium/tree/master/build) 作为你的 GN 工程的工具链，那你的 `shared_library` 或 `executable` Target 就已经带了上述的配置，默认是用 `//build/config/win:console`，你也可以手动替换为 `windowed`:

    ```gn
    # 仅当你的构建目标是一个带 GUI 的可执行二进制时才需要这样操作
    # 对于 DLL 来说，二者没有区别，因为函数入口不是 DLL 决定的
    configs -= [ "//build/config/win:console" ]
    configs += [ "//build/config/win:windowed" ]
    ```

    ![Chromium build win config windowed](https://raw.githubusercontent.com/patrick-fu/personal_blog_image/master/image/chromium_build_win_config_windowed.png)

    参考：[GN build toolchain, //build/config/win:windowed](https://github.com/patrick-fu/gn_build/blob/48ac640820/config/win/BUILD.gn#L570)

### 代码支持

如果你的项目里依赖了很多 Windows API，可以预见的是链接时找不到符号，因为很多 API 都是在 Windows 7 以后才提供的。

当然你可以耗费一些时间，把那些用到的新 API 替换掉，不管是找替代品还是干脆就不支持，都可以。

个人推荐一个便于你适配 XP 的 [开源项目 YY-Thunks](https://github.com/Chuyu-Team/YY-Thunks)，集成到你的工程中，应该就能链接成功了。 :-)
