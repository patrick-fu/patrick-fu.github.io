---
title: 【SwiftUI】解决 NavigationLink 立即加载 destination View 的问题（实现懒加载）
date: 2020-03-23 00:32:43
tags:
  - iOS
  - Swift
  - SwiftUI
categories:
  - Tech
---

在 SwiftUI 中，一般通过 `NavigationView` 配合 `NavigationLinks` 来实现页面间的跳转，可类比为 UIKit 中的 `UINavigationController` 与 `segue`（或者 push/present 语句）。熟悉 UIKit 的开发者刚接触 SwiftUI 时可能会遇到一个小坑：`NavigationLinks` 的 `destination` 并不是懒加载的。

<!-- more -->

## 遇到的问题

`NavigationLinks` 与 UIKit 中 push/present 之间的行为差异导致刚上手 SwiftUI 时，由于不知道目标 View 会被提前加载，使得目标 View 里的业务逻辑时序上出现问题。

我们都知道，`UINavigationController` 的目标 ViewController 只在调用了 push/present 后才会触发常用的加载方法 `viewDidLoad()`。

然而在 SwiftUI 中，`NavigationLinks` 的目标 View 会立即加载，这意味着假设有一个包含 100 个 cell 的 `List`/`ForEach`，其中每个 cell 都是用 `NavigationLinks` 来跳转新页面的话，那当加载显示这个 `List` 时，内存中会马上创建 100 个对应的 View 结构体。

如果这些 View 的构造函数中还做了些开销大的操作比如网络请求、加载资源等。。。可以想象将导致什么后果🤣

> 例：

如下所示，`MyRootView` 是首页 View，通过 `NavigationView` 来实现路由导航功能，其中是一个包含了三个 cell 的 `List`，每个 cell 是一个 `NavigationLinks`，分别导航至 `FirstView`、`SecondView`、`ThirdView`。

```swift
import SwiftUI

struct MyRootView: View {

    let myViews = [
        "FirstView",
        "SecondView",
        "ThirdView"
    ]

    func containedView(viewName: String) -> AnyView {
        switch viewName {
        case "FirstView":
            return AnyView(FirstView())
        case "SecondView":
            return AnyView(SecondView())
        case "ThirdView":
            return AnyView(ThirdView())
        default:
            return AnyView(Text("None"))
        }
    }

    var body: some View {
        NavigationView {
            List(myViews, id: \.self) { viewName in
                NavigationLink(destination: self.containedView(viewName: viewName)) {
                    Text(viewName)
                }
            }
            .navigationBarTitle(Text("ZegoExpressExample"), displayMode: .automatic)
            .onAppear {
                NSLog("🚩 MyRootView appear")
            }
        }
    }
}
```

然后，在 `FirstView`、`SecondView`、`ThirdView` 的实现中，View 结构体里包含一个 class 实例属性，如下所示：

```swift
struct FirstView: View {
    private let firstCoordinator = FirstCoordinator()

    init() {
        NSLog("1️⃣ FirstView init 🟢")
    }

    var body: some View {
        Text("I'm FirstView created by Patrick Fu")
            .onAppear {
                NSLog("---------1️⃣ FirstView appear-------")
            }.onDisappear {
                NSLog("---------1️⃣ FirstView disappear-------")
            }
    }

    class FirstCoordinator: NSObject {
        override init() {
            NSLog("1️⃣ FirstCoordinator init 🟢")
        }

        deinit {
            NSLog("1️⃣ FirstCoordinator deinit 🔴")
        }
    }
}
```

```swift
import SwiftUI

struct SecondView: View {
    private let secondCoordinator = SecondCoordinator()

    init() {
        NSLog("2️⃣ SecondView init 🟢")
    }

    var body: some View {
        Text("I'm SecondView created by Patrick Fu")
            .onAppear {
                NSLog("---------2️⃣ SecondView appear-------")
            }.onDisappear {
                NSLog("---------2️⃣ SecondView disappear-------")
            }
    }

    class SecondCoordinator: NSObject {
        override init() {
            NSLog("2️⃣ SecondCoordinator init 🟢")
        }

        deinit {
            NSLog("2️⃣ SecondCoordinator deinit 🔴")
        }
    }
}
```

> ThirdView 的实现完全一致，就不贴出来了

测试一下，通过日志可以发现，当加载显示 `MyRootView` 的时候，通过 `NavigationLinks` 导航的目标 View 全部被提前立即初始化了，并且其属性 Coordinator 类也被实例化了。

```blank
2020-03-23 01:10:46.546218+0800 ZegoExpressExample-iOS-Swift[76375:18919854] 🚩 MyRootView appear
2020-03-23 01:10:46.553204+0800 ZegoExpressExample-iOS-Swift[76375:18919854] 1️⃣ FirstCoordinator init 🟢
2020-03-23 01:10:46.553234+0800 ZegoExpressExample-iOS-Swift[76375:18919854] 1️⃣ FirstView init 🟢
2020-03-23 01:10:46.558073+0800 ZegoExpressExample-iOS-Swift[76375:18919854] 2️⃣ SecondCoordinator init 🟢
2020-03-23 01:10:46.558104+0800 ZegoExpressExample-iOS-Swift[76375:18919854] 2️⃣ SecondView init 🟢
2020-03-23 01:10:46.559791+0800 ZegoExpressExample-iOS-Swift[76375:18919854] 3️⃣ ThirdCoordinator init 🟢
2020-03-23 01:10:46.559808+0800 ZegoExpressExample-iOS-Swift[76375:18919854] 3️⃣ ThirdView init 🟢
2020-03-23 01:11:03.746197+0800 ZegoExpressExample-iOS-Swift[76375:18919854] ---------1️⃣ FirstView appear-------
2020-03-23 01:11:06.641696+0800 ZegoExpressExample-iOS-Swift[76375:18919854] 🚩 MyRootView appear
2020-03-23 01:11:06.892756+0800 ZegoExpressExample-iOS-Swift[76375:18919854] ---------1️⃣ FirstView disappear-------
2020-03-23 01:11:08.618983+0800 ZegoExpressExample-iOS-Swift[76375:18919854] ---------2️⃣ SecondView appear-------
2020-03-23 01:11:11.507952+0800 ZegoExpressExample-iOS-Swift[76375:18919854] 🚩 MyRootView appear
2020-03-23 01:11:11.680365+0800 ZegoExpressExample-iOS-Swift[76375:18919854] ---------2️⃣ SecondView disappear-------
2020-03-23 01:11:13.138151+0800 ZegoExpressExample-iOS-Swift[76375:18919854] ---------3️⃣ ThirdView appear-------
2020-03-23 01:11:15.317203+0800 ZegoExpressExample-iOS-Swift[76375:18919854] 🚩 MyRootView appear
2020-03-23 01:11:15.488869+0800 ZegoExpressExample-iOS-Swift[76375:18919854] ---------3️⃣ ThirdView disappear-------
```

并且在右滑返回主页面时，View 和其 Coordinator 类实例也并没有被释放，GG~

## 解决方法

首先，`NavigationLinks` 立即加载 `destination` 的现象应该是 SwiftUI 的 Feature。因为在 SwiftUI 中，View 是非常轻量化的结构体，类似于 Flutter 中的 `Widget`，创建、销毁的开销非常低。

### 方案一

因此，其中一种解决方案就是充分利用 View 的 `onAppear()` 和 `onDisappear()` 作为依赖注入来实现自己的业务逻辑和一些开销大的操作，避免在 View 初始化的时机做业务逻辑。也就是说，把 View 的 `onAppear()` 当做 UIKit 中的 `viewDidLoad()` 来使用，并且避免在 View 的属性中直接初始化开销大的对象。

### 方案二

当然了，作为老 UIKit/AppKit 开发者，大量的对象瞬间全部加载实在难顶，还是得懒加载才行。

那另一种解决方案就是通过给 `destination` 的 View 包裹一层自定义的 View 来实现懒加载功能。

- LazyView.swift

```swift
import SwiftUI

public struct LazyView<Content: View>: View {
    private let build: () -> Content
    public init(_ build: @autoclosure @escaping () -> Content) {
        self.build = build
    }
    public var body: Content {
        build()
    }
}
```

一个 View 的 body 属性只在这个 View 被显示出来的时候才会被执行，也就是说，当 body 中的 `NavigationLinks` 的 `destination` 是另一个 ViewB 时，这个 `destination` 的 ViewB 会被马上初始化，但是 ViewB 的 body 属性不会被执行。

换句话说，SwiftUI 会立刻加载**当前层级**以及**下一层级**的 View，但**不会**加载第三层级的 View。

因此，用一个自定义 View 来包裹住真正想要跳转的目标 View，就可以变相的实现懒加载。

实际上，此方案只是“懒加载”了目标 View，在一个拥有大量 cell 的 `List`/`ForEach` 中，还是会有等同数量的 `LazyView` 被创建。

这种方式并不 Swifty，目前看来，最好还是按照 SwiftUI 的设计理念来做业务逻辑，也就是上面的方案一。

- 用法示例

```swift
struct ContentView: View {
    var body: some View {
        NavigationView {
            NavigationLink(destination: LazyView(Text("My details page"))) {
                Text("Go to details")
            }
        }
    }
}
```

修改后的 `MyRootView` 的 body 如下所示

```swift
    var body: some View {
        NavigationView {
            List(myViews, id: \.self) { viewName in
                NavigationLink(destination: LazyView(self.containedView(viewName: viewName))) {
                    Text(viewName)
                }
            }
            .navigationBarTitle(Text("ZegoExpressExample"), displayMode: .automatic)
            .onAppear {
                NSLog("🚩 MyRootView appear")
            }
        }
    }
```

测试一下，当加载显示 `MyRootView` 时，通过 `NavigationLinks` 导航的目标 View 都实现了懒加载，并且在返回 `MyRootView` 并进入其他新的 View 时，上一个老 View 也能被释放，这就非常舒服了。

```blank
2020-03-23 01:32:12.577138+0800 ZegoExpressExample-iOS-Swift[76407:18927258] 🚩 MyRootView appear
2020-03-23 01:32:26.788288+0800 ZegoExpressExample-iOS-Swift[76407:18927258] 1️⃣ FirstCoordinator init 🟢
2020-03-23 01:32:26.788380+0800 ZegoExpressExample-iOS-Swift[76407:18927258] 1️⃣ FirstView init 🟢
2020-03-23 01:32:26.811396+0800 ZegoExpressExample-iOS-Swift[76407:18927258] ---------1️⃣ FirstView appear-------
2020-03-23 01:32:57.753106+0800 ZegoExpressExample-iOS-Swift[76407:18927258] 🚩 MyRootView appear
2020-03-23 01:32:57.969867+0800 ZegoExpressExample-iOS-Swift[76407:18927258] ---------1️⃣ FirstView disappear-------
2020-03-23 01:33:00.826847+0800 ZegoExpressExample-iOS-Swift[76407:18927258] 2️⃣ SecondCoordinator init 🟢
2020-03-23 01:33:00.826983+0800 ZegoExpressExample-iOS-Swift[76407:18927258] 2️⃣ SecondView init 🟢
2020-03-23 01:33:00.831038+0800 ZegoExpressExample-iOS-Swift[76407:18927258] 1️⃣ FirstCoordinator deinit 🔴
2020-03-23 01:33:00.850590+0800 ZegoExpressExample-iOS-Swift[76407:18927258] ---------2️⃣ SecondView appear-------
2020-03-23 01:33:04.745348+0800 ZegoExpressExample-iOS-Swift[76407:18927258] 🚩 MyRootView appear
2020-03-23 01:33:05.011015+0800 ZegoExpressExample-iOS-Swift[76407:18927258] ---------2️⃣ SecondView disappear-------
2020-03-23 01:33:06.126583+0800 ZegoExpressExample-iOS-Swift[76407:18927258] 3️⃣ ThirdCoordinator init 🟢
2020-03-23 01:33:06.126716+0800 ZegoExpressExample-iOS-Swift[76407:18927258] 3️⃣ ThirdView init 🟢
2020-03-23 01:33:06.130353+0800 ZegoExpressExample-iOS-Swift[76407:18927258] 2️⃣ SecondCoordinator deinit 🔴
2020-03-23 01:33:06.149465+0800 ZegoExpressExample-iOS-Swift[76407:18927258] ---------3️⃣ ThirdView appear-------
```

## 参考资料

- [https://twitter.com/chriseidhof/status/1144242544680849410](https://twitter.com/chriseidhof/status/1144242544680849410)

- [https://stackoverflow.com/questions/57594159/swiftui-navigationlink-loads-destination-view-immediately-without-clicking](https://stackoverflow.com/questions/57594159/swiftui-navigationlink-loads-destination-view-immediately-without-clicking)
