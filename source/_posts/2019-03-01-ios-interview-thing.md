---
title: 一些iOS面试基础题总结
date: 2019-03-01 10:06:07
tags:
  - iOS
  - Objective-C
categories:
  - Note
---

<!-- more -->

## 多线程

#### 线程之间同步
1. 原子操作 Atomic
2. 加锁（互斥锁、递归锁、读写锁）NSLock，OSSpinLock

#### 多线程之间通信

performSelectorOnMainThread:withObject:waitUntilDone:

#### 如何保证线程安全

1. OSSpinLock 自旋锁
2. dispatch_semaphore
3. NSLock 等各种锁
4. @synchronized


#### 多线程的坑

1. 常驻线程

常驻线程多了影响CPU效率

AFNetworking2.0因为用的NSURLConnection有缺陷，需要所在线程一直存活，所以保持了个常驻线程，3.0用了NSURLSession，可以指定回调的delegateQueue于是弃用常驻线程。

[runloop run]是常驻线程，[runloop runUntilDate]指定保活时长

2. 并发

GCD本着最大化CPU效率的原则会多创建线程，但如果是IO类操作，需要等待数据的空档会继续创建新线程导致内存失控。类似数据库操作尽量用串行队列避免多线程并发导致问题。因为创建线程需要堆栈内存，切换线程也消耗CPU。

3. 死锁

串行队列（如主队列）同步操作


## AutoLayout

更新屏幕时，Layout Engine从上到下调用layoutSubviews()通过 Cassowary 算法计算各个子视图的位置，算出来后将子视图的 frame 从 Layout Engine 里拷贝出来，接下来的过程就跟手写frame是一样的了。iOS12优化了性能，以前元素多了会导致性能下降，现正不会了

## objc_msgSend

1. 检查这个selector是不是要忽略的
2. 检查target是不是nil
- 如果有相应处理nil的函数就跳转到该函数
- 如果没有就自动清理现场并返回，这就是OC中给nil发消息不会崩溃的原因
3. 确定不是给nil发消息后，在该class的缓存中查找方法对应的IMP实现
- 如果找到就跳转进去
- 如果没找到就在方法分发表里继续查找，直到找到NSObject为止
4. 如果还没找到就开始消息转发，上述过程就是通过SEL快速查找IMP的过程

## Runtime

C语言中，编译期函数的调用就决定调用哪个函数，而OC只有在真正运行时才根据函数名称找到对应函数来调用。需要一个运行时系统来动态地创建类和对象、消息传递和转发

1. 讲一下 OC 的消息机制

- OC中的方法调用其实都是转成了objc_msgSend函数的调用，给receiver（方法调用者）发送了一条消息（selector方法名）
- objc_msgSend底层有3大阶段:消息发送（当前类、父类中查找）、动态方法解析、消息转发
- 当递归地找不到selector时，启动消息转发：resolveInstanceMethod、resolveClassMethod、forwardingTargetForSelector

2. 什么是Runtime？平时项目中有用过么？
- OC是一门动态性比较强的编程语言，允许很多操作推迟到程序运行时再进行
- OC的动态性就是由Runtime来支撑和实现的，Runtime是一套C语言的API，封装了很多动态性相关的函数
- 平时编写的OC代码，底层都是转换成了Runtime API进行调用

5. Runtime 的应用（优点）：
- 实现多继承 Multiple Inheritance
- Method Swizzling -> 无侵入埋点 -> 使用Category进行
- Aspect Oriented Prigramming 面向切面编程AOP -> 如日志、身份验证、缓存等模块
- isa Swizzling -> KVO的实现
- Associated Object关联对象(给Category添加属性) objc_set(get)AssociatedObject 
- 动态地增加方法
- NSCoding 的自动归档和自动解档
- 字典和模型相互转换！
- 异常保护（保护数组越界问题）

6. Runtime 的缺点
- Method Swizzling 不是原子操作，放在+load里没问题，放在+initialize里就有问题了
- 重写方法而不调用super方法可能有问题

7. Runtime 注意事项
- Swizzling应该总在+load中执行
- Swizzling应该总在dispatch_once中执行 -> 因为会改变全局状态所以应该只执行一次
- +load中执行Swizzling时，不要调用[super load] -> 避免偶数次执行Swizzling

SEL其本身是一个Int类型的地址，地址中存放着方法的名字。

## Category

通过Runtime给类添加方法，可以把类的实现分开在几个不同的文件，减少单个文件体积、不同功能组织到不同的Category里、可以由多人开发一个类、可以按需加载想要的category、可以把framework的私有方法公开

与extension不同的是，extension需要有类的源码才能添加，所以无法为系统类添加extension。

而category是运行时添加的。所以，extension可以添加实例变量，而category只能添加实例方法、类方法、协议、属性，但是不能添加实例变量。

category并不是完全替换掉原来类的方法，而是附加到方法列表的前面，而runtime寻找方法是顺着找的，找到category覆盖的方法后就执行了

## NSObject与objc_class

NSObject 继承自 objc_class
objc_class 继承自 objc_object

objc_object -> objc_class -> NSObject

所以OC中，类也是一个对象。

objc_class中，除了isa，还有3个成员变量，一个是父类的指针，一个是方法缓存，最后一个这个类的实例方法链表。

每个类都有单独的元类，所以类的superclass指针递归最后指向NSObject，NSObject没有超类所以指向nil。类的isa指向对应唯一的元类，每个元类的isa都指向rootMetaClass，rootMetaClass的superClass指向NSObject，isa指向自己

元类中保存了创建类对象以及类方法所需的所有信息


## Runloop

#### 介绍
运行循环，在程序运行过程中循环做一些事情，如果没有Runloop程序执行完毕就会立即退出，如果有Runloop程序会一直运行，并且时时刻刻在等待用户的输入操作。RunLoop可以在需要的时候自己跑起来运行，在没有操作的时候就停下来休息。充分节省CPU资源，提高程序性能。

## Source
分为Input Source输入源和定时源Timer Source

#### 五个Mode
1. 默认（主线程的）Mode：NSDefaultRunLoopMode
2. 界面追踪Mode：UITrackingRunLoopMode
3. 首次启动的第一个Mode：UIInitializationRunLoopMode

#### 作用
1. 保持程序持续运行，程序一启动就会开一个主线程，主线程一开起来就会跑一个主线程对应的RunLoop,RunLoop保证主线程不会被销毁，也就保证了程序的持续运行，对于子线程可以使用run来常驻线程。
2. 保证NSTimer正常运转
3. 线上监测App卡顿情况
4. 处理App中的各种事件（比如：触摸事件，定时器事件，Selector事件等）
5. 节省CPU资源，提高程序性能，程序运行起来时，当什么操作都没有做的时候，RunLoop就告诉CUP，现在没有事情做，我要去休息，这时CUP就会将其资源释放出来去做其他的事情，当有事情做的时候RunLoop就会立马起来去做事情

#### 过程
1. 进入loop
2. do while 保活线程：触发Timer回调、触发Source()回调、执行block
3. 进入休眠
4. 等待mach_port消息（如Timer时间到、Runloop超时、被调用者唤醒）
5. 唤醒，处理消息
6. 判断是否进入下一个loop

#### 监测卡顿的方法

1. 创建观察者
2. 把观察者添加到主线程的Runloop的common模式下观察，然后创建一个常驻子线程专门用来监控主线程的Runloop状态
3. 一旦发现runloop进入睡眠前的状态或者唤醒后的状态在设置的时间阈值内没有变化，即可判定为卡顿，用第三方库PLCrashReporter来获取堆栈信息，上报服务器。后续分析。

## autoreleasepool

配合runloop的，每次runloop开启时重建自动释放池，休息前释放掉池里的东西如Timer
ARC下自动创建的在子线程结束后释放，手动创建的在作用域大括号结束后释放
底层实现 AutoReleasePoolPage 是一个双向链表，有push release pop操作

## iOS系统架构
四个层
- 第一层：用户体验层：SpringBoard
- 第二层：应用框架层：CocoaTouch
- 第三层：核心框架层：Metal、图形媒体核心框架
- 第四层：Darwin层：XNU、内核、驱动

iOS的可执行文件和动态库都是Mach-O格式，加载App实际就是加载Mach-O文件。

## App启动过程与优化

1. main()执行前
- 加载可执行文件（App的.o文件的集合）
- 加载动态链接库，进行rebase指针调整和bind符号绑定
- Objc Runtime 的初始处理，包括 Objc 相关类的注册、Category注册、selector 唯一性检查
- +load()初始化
> 这个阶段的优化有 1. 减少动态库加载（合并动态库）2. 减少加载启动后不会去用的类和方法 3. 少用+load，或用 +initialize替换，因为runtime 的 Method Swizzling 操作每次4ms

2. main()执行后
- 指 main() 执行开始到 didFinishLaunchingWithOptions 方法里首屏渲染相关方法完成
- 配置初始化文件的IO操作
- 首屏列表大数据的读取
- 首屏渲染的大量计算
> 优化方法有把各种与首屏渲染不相干的初始化挪走或子线程处理

3. 首屏渲染完成后
- 指 didFinishLaunchingWithOptions 作用域内执行首屏渲染之后的所有方法执行完成
- 非首屏其他业务服务模块的初始化
- 监听的注册
- 配置文件的读写
> 把可能卡住主线程的方法挪走或子线程处理

## UIScrollView 的代理方法

1. 滚动完 scrollViewDidScroll 
2. 缩放完 scrollViewDidZoom
3. 将要开始拖动 scrollViewWillBeginDragging
4. 将要结束拖动 scrollViewWillEndDragging
5. 滑动将要减速、 滑动减速完成
6. 滚动动画完成
7. 将要开始缩放、已经结束缩放

## 响应连和事件传递

1. hitTest方法检测看是否返回

2. 继承`UIResponder`的类才能响应，如`UIApplication`、`UIView`、`UIViewController`。而`CALayer`是继承自`NSObject`的，不能响应

3. 事件首先传递给`UIApplication`，然后向下分发给`UIWindow`，然后分发给最下层的`UIView`，逐步调用`hitTest`从屏内向外找，当某个`UIView`返回YES时就递归对其`SubView`执行`hitTest`，直到找到最后一个

- 某`UIView`不接受事件的情况：
1. alpha < 0.01
2. userInteractionEnabled = NO
3. hidden = YES

## UIView 和 CALayer 的区别和联系

1. UIView能响应，CALayer不能
2. View的frame(和bounds)是简单返回layer的frame(bound), 而layer的frame由几个参数决定
3. UIView 是 CALayer 的代理
4. 每个UIView内都有一个CALayer（即有个属性）

## 轮播图朴素实现的集中方法
1. UICollectionView, 简单粗暴放100个Cell
2. UIScrollView 首尾各放一个展示
3. UIScrollView 三个ImageView实现
4. UIImageView 自己实现layer转场动画

## TableView 和 CollectionView 必选的代理方法
- delegate都是可选
- datasource各有两个必选
- table: cellForRowAtIndexPath、numberOfRowsInSection
- collection: cellForItemAtIndexPath、numberOfItemsInSection

## UITableView 的优化思路

#### 流程：

1. 获取数据；
2. 把数据转化成model、存进数组；
3. tableview调用reloadData刷新数据；
4. 在代理方法cellForRowAtIndexPath里，创建自定义的cell，把model赋值给cell；
5. cell在对应的model的set方法里，根据拿到的model，设置图片的image，设置label的text等(控件都以懒加载形式初始化)；
6. 在代理方法heightForRowAtIndexPath里，根据model，算出当前行应该显示多少的高度；
7. 在cell的layoutSubviews方法里，布局子控件。

#### 优化思路

1. 避免主线程阻塞
1/2步里的获取数据、数据处理等耗时操作，应该放入后台线程异步处理，处理好后再通知主线程刷新界面。

2. 避免频繁的对象创建
对象的创建会发送内存分配、属性调整等。
所以，首先，尽量用轻量的对象代替重量的对象。比如CALayer代替UIView。
接着，多利用缓存思想，对象创建后缓存起来，需要的时候再拿出来用。合理利用内存开销，减少CPU开销。
把 Cell setModel里的一些操作放在第二步数据转model里

3. 减少对象的属性赋值操作
尤其是UIView的frame/bounds等属性的赋值操作，会产生比较大的CPU消耗。
尽量少让Cell里空间动态变化，有规律的话筛分成多个固定cell

4. 异步绘制
文本渲染、图像绘制都是比较消耗性能的操作，而UILabel等控件都是在主线程进行的文本绘制。这会对性能产生比较大的影响。
UIKit和CoreAnimation相关操作必须在主线程中进行，其它的可以在后台线程异步执行


5. 简化视图结构
- GPU在绘制图像前，会把重叠的视图进行混合，视图结构越复杂，这个操作就越耗时，如果存在透明视图，混合过程会更加复杂。
- 所以，我们可以：
- 尽量避免复杂的图层结构
- 少使用透明的视图
- 不透明的视图，设置opaque = YES 

6. 减少离屏渲染
- 老生常谈之圆角问题
- 圆角是开发中经常使用到的美化方式，但一般的设置cornerRadius时会配合masksToBounds属性，这就会造成离屏渲染。
- 关于这种问题的处理，大致有两个思路
- 异步绘制一张圆角的图片来显示；
- 用一个圆角而中空的图来盖住。

- tableview需要刷新数据时，使用
[tableview beginUpdates]、[tableview insertRowsAtIndexPaths:indexArray withRowAnimation:UITableViewRowAnimationNone]、
[tableview endUpdates];而非
[tableview reloadData]从而刷新更少的行减少CPU压力


8. 对于固定行高，前一个设置属性比后一个实现代理方法效率高
```objc
cell.tableview.rowHeight = 50.0;

- (CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath
{
    return 50.0;
}
```
9. NSDateFormatter这个对象的相关操作很费时，需要避免频繁的创建和计算