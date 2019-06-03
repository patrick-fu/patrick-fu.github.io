---
title: 粗谈iOS中weak、self、循环引用的二三事
date: 2019-05-21 16:20:16
tags:
  - iOS
  - Objective-C
categories:
  - Note
---

有关weak、self、循环引用的一些问题

## 0. 什么是循环引用，后果是什么

<!-- more -->

循环引用可以简单理解为`A`引用了`B`，而`B`又引用了`A`，双方都同时保持对方的一个引用，导致任何时候引用计数都不为`0`，始终无法释放。若当前对象是一个`ViewController`，则在`dismiss`或者`pop`之后其`dealloc`无法被调用，在频繁的`push`或者`present`之后内存暴增，就会Crash。

[关于ARC的介绍](https://paaatrick.com/2019-05-19-ios-arc-gc/)

## 1. 在使用`block`时，为了避免产生循环引用，通常会使用`weakSelf`与`strongSelf`，例如如下代码，那么什么时候在  `block`里面用`self`，什么时候不需要使用`weakSelf`

```objc
__weak typeof(self) weakSelf = self;
[self doSomeBlockJob:^{
    __strong typeof(weakSelf) strongSelf = weakSelf;
    if (strongSelf) {
        ...
    }
}];
```
当 `block` 本身不被 `self` 持有，而被别的对象持有，同时不产生循环引用的时候，就不需要使用 `weakSelf` 了。最常见的代码就是 `UIView` 的动画代码，我们在使用 `UIView` 的 `animateWithDuration:animations` 方法做动画的时候，并不需要使用 `weakSelf`，因为引用持有关系是：

- `UIView` 的某个负责动画的对象持有了 `block`
- `block` 持有了 `self`

因为 `self` 并不持有 `block`，所以就没有循环引用产生，因为就不需要使用 `weakSelf` 了。
```objc
[UIView animateWithDuration:0.2 animations:^{
    self.alpha = 1;
}];
```
当动画结束时，`UIView` 会结束持有这个 `block`，如果没有别的对象持有 `block` 的话，`block` 对象就会释放掉，从而 `block` 会释放掉对于 `self` 的持有。整个内存引用关系被解除。

## 2. `block` 里面还需要写一个 `strongSelf` 的原因，如果不写会发生什么

外部的`weakSelf`是为了打破环，从而使得没有循环引用，而内部的`strongSelf`仅仅是个局部变量，存在栈中，会在`block`执行结束后回收，不会再造成循环引用。

在 `block` 中先写一个 `strongSelf`，其实是为了避免在 `block` 的执行过程中，突然出现 `self` 被释放的尴尬情况。通常情况下，如果不这么做的话，还是很容易出现一些奇怪的逻辑，甚至闪退。

以 `AFNetworking` 中 `AFNetworkReachabilityManager.m` 的一段代码举例：

```objc
__weak __typeof(self)weakSelf = self;
AFNetworkReachabilityStatusBlock callback = ^(AFNetworkReachabilityStatus status) {
    __strong __typeof(weakSelf)strongSelf = weakSelf;

    strongSelf.networkReachabilityStatus = status;
    if (strongSelf.networkReachabilityStatusBlock) {
        strongSelf.networkReachabilityStatusBlock(status);
    }
};
```

如果没有 `strongSelf` 的那行代码，那么后面的每一行代码执行时，`self` 都可能被释放掉了，这样很可能造成逻辑异常。

特别是当我们正在执行 `strongSelf.networkReachabilityStatusBlock(status); `这个 `block` 闭包时，如果这个 `block` 执行到一半时 `self` 释放，那么多半情况下会 Crash。

## 3. 有没有这样一个需求场景，`block` 会产生循环引用，但是业务又需要你不能使用 `weakSelf`? 如果有，请举一个例子并且解释这种情况下如何解决循环引用问题。

需要不使用 `weakSelf` 的场景是：你需要构造一个循环引用，以便保证引用双方都存在。比如你有一个后台的任务，希望任务执行完后，通知另外一个实例。在 `YTKNetwork` 网络库的源码中，就有这样的场景。

在 `YTKNetwork` 库中，我们的每一个网络请求 API 会持有回调的 `block`，回调的 `block` 会持有 `self`，而如果 `self` 也持有网络请求 API 的话，我们就构造了一个循环引用。虽然我们构造出了循环引用，但是因为在网络请求结束时，网络请求 API 会主动释放对 `block` 的持有，因此，整个循环链条被解开，循环引用就被打破了，所以不会有内存泄漏问题。代码其实很简单，如下所示：

```objc
//  YTKBaseRequest.m
- (void)clearCompletionBlock {
    // nil out to break the retain cycle.
    self.successCompletionBlock = nil;
    self.failureCompletionBlock = nil;
}
```

总结来说，解决循环引用问题主要有两个办法：

第一个办法是「事前避免」，我们在会产生循环引用的地方使用 `weak` 弱引用，以避免产生循环引用。

第二个办法是「事后补救」，我们明确知道会存在循环引用，但是我们在合理的位置主动断开环中的一个引用，使得对象得以回收。

## 4. weak 变量在引用计数为0时，会被自动设置成 nil 的这个特性的实现原理

> 简单来说，系统对于每一个有弱引用的对象，都维护一个表来记录它所有的弱引用的指针地址。这样，当一个对象的引用计数为 `0` 时，系统就通过这张表，找到所有的弱引用指针，继而把它们都置成 `nil`。
所以使用`weak`会有额外的开销

在 Friday QA 上，[有一期专门介绍](https://mikeash.com/pyblog/friday-qa-2010-07-16-zeroing-weak-references-in-objective-c.html) `weak` 的实现原理。

《Objective-C高级编程》一书中也介绍了相关的内容。

系统有一个全局的 `CFMutableDictionary` 实例，来保存每个对象的 `weak` 指针列表，因为每个对象可能有多个 `weak` 指针，所以这个实例的值是 `CFMutableSet` 类型。

剩下我们要做的，就是在引用计数变成 `0` 的时候，去这个全局的字典里面，找到所有的 `weak` 指针，将其值设置成 `nil`。如何做到这一点呢？Friday QA 上介绍了一种类似 `KVO` 实现的方式。当对象存在 `weak` 指针时，我们可以将这个实例指向一个新创建的子类，然后修改这个子类的 `release` 方法，在 `release` 方法中，去从全局的 `CFMutableDictionary` 字典中找到所有的 `weak` 对象，并且设置成 `nil`。我摘抄了 Friday QA 上的实现的核心代码，如下：

```python
Class subclass = objc_allocateClassPair(class, newNameC, 0);
Method release = class_getInstanceMethod(class, @selector(release));
Method dealloc = class_getInstanceMethod(class, @selector(dealloc));
class_addMethod(subclass, @selector(release), (IMP)CustomSubclassRelease, method_getTypeEncoding(release));
class_addMethod(subclass, @selector(dealloc), (IMP)CustomSubclassDealloc, method_getTypeEncoding(dealloc));
objc_registerClassPair(subclass);
```

当然，这并不代表苹果官方是这么实现的，因为苹果的这部分代码并没有开源。《Objective-C高级编程》一书中介绍了 `GNUStep` 项目中的开源代码，思想也是类似的。所以我认为虽然实现细节会有差异，但是大致的实现思路应该差别不大。

## 5. 如果有一些 `UI` 控件我们要用代码的方式来创建，那么它应该用 `weak` 还是 `strong`

我们知道，从 `Storyboard` 往编译器拖出来的 `UI` 控件的属性是 `weak` 的，如下所示

```objc
@property (weak, nonatomic) IBOutlet UIButton *myButton;
```

那么如果有一些 `UI` 控件我们要用代码的方式来创建，那么它应该用 `weak` 还是 `strong`?

> 从上面弱引用自动置`nil`的原理可以看出，弱引用的使用是有额外的开销的。虽然这个开销很小，但是如果一个地方我们肯定它不需要弱引用的特性，就不应该盲目使用弱引用。举个例子，有人喜欢在手写界面的时候，将所有界面元素都设置成 `weak` 的，这某种程度上与 `Xcode` 通过 `Storyboard` 拖拽生成的新变量是一致的。

`UI` 控件用默认用 `weak`，根源还是苹果希望只有这些 `UI` 控件的父 `View` 来强引用它们，而 `ViewController` 只需要强引用 `ViewController.view` 成员，则可以间接持有所有的 `UI` 控件。这样有一个好处是：在以前，当系统收到 `Memory Warning` 时，会触发 `ViewController` 的 `viewDidUnload` 方法，这样的弱引用方式，可以让整个 `view` 整体都得到释放，也更方便重建时整体重新构造。

但是首先 `viewDidUnload` 方法在 `iOS 6` 开始就被废弃掉了，苹果用了更简单有效地方式来解决内存警告时的视图资源释放，具体如何做的呢？嗯，这个可以当作某一期的面试题展开介绍。总之就是，除非你特殊地操作 `view` 成员，`ViewController.view` 的生命期和 `ViewController` 是一样的了。

所以在这种情况下，其实 `UI` 控件是不是 `weak` 其实关系并不大。当 `UI` 控件是 `weak` 时，它的引用计数是 `1`，持有它的是它的 `superview`，当 `UI` 控件是 `strong` 时，它的引用计数是 `2`，持有它的有两个地方，一个是它的 `superview`，另一个是这个 `strong` 的指针。`UI` 控件并不会持有别的对象，所以，不管是手写代码还是 `Storyboard`，`UI` 控件是 `strong` 都不会有循环引用的。

那么回到我们的最初的问题，自己写的 `view` 成员，应该用 `weak` 还是 `strong`？我个人觉得应该用 `strong`，因为用 `weak` 并没有什么特别的优势，而且由上面 `weak`的实现来看，`weak` 变量会有额外的系统维护开销的，如果你没有使用它的特别的理由，那么用 `strong` 的话应该更好。

另外如果要做懒加载，那么你也只能选择用 `strong`。

当然，如果你非要用 `weak`，其实也没什么问题，只需要注意在赋值前，先把这个对象用 `addSubView` 加到父 `view` 上，否则可能刚刚创建完，它就被释放了。

