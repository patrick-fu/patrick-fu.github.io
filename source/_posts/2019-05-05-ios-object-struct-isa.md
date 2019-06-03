---
title: 考察ObjC对象内存结构与isa指针
date: 2019-05-05 13:07:42
tags:
  - iOS
  - Objective-C
categories:
  - Note
---

考察ObjC对象内存结构与isa指针

#### 1. 一个 Objective-C 对象的内存结构是怎样的？

如果把类的实例看成一个C语言的结构体（`struct`），它首先包含的是一个 `isa` 指针，而类的其它成员变量依次排列在结构体中。排列顺序如下图所示：

![](https://raw.githubusercontent.com/Fongim/personal_blog_image/master/image/20190603171627.png)

为了验证该说法，我们在Xcode中新建一个工程，在main.m中运行如下代码：

```objc
#import <UIKit/UIKit.h>

@interface Father : NSObject {    
    int _father;
}
@end@implementation Father

@end

@interface Child : Father {    
int _child;
}
@end

@implementation Child

@end

int main(int argc, char * argv[])
{

  Child * child = [[Child alloc] init];  
  @autoreleasepool {      
       // ...
  }
}
```

我们将断点下在 `@autoreleasepool` 处，然后在`Console`中输入`p *child`,则可以看到`Xcode`输出如下内容，这与我们上面的说法一致。

```objc
(lldb) p *child
(Child) $0 = {
  (Father) Father = {
    (NSObject) NSObject = {
      (Class) isa = Child
    }
    (int) _father = 0
  }
  (int) _child = 0
}
```

因为对象在内存中的排布可以看成一个结构体，该结构体的大小并不能动态变化。所以无法在运行时动态给对象增加成员变量。

> 注：需要特别说明一下，通过 `objc_setAssociatedObject`和 `objc_getAssociatedObject`方法可以变相地给对象增加成员变量，但由于实现机制不一样，所以并不是真正改变了对象的内存结构。

#### 2. Objective-C 对象内存结构中的 isa 指针是用来做什么的，有什么用？

`Objective-C` 是一门面向对象的编程语言。每一个对象都是一个类的实例。在 `Objective-C` 语言的内部，每一个对象都有一个名为 `isa` 的指针，指向该对象的类。每一个类描述了一系列它的实例的特点，包括成员变量的列表，成员函数的列表等。每一个对象都可以接受消息，而对象能够接收的消息列表是保存在它所对应的类中。

在 `Xcode` 中按`Shift + Command + O`, 然后输入 `NSObject.h` 和 `objc.h`，可以打开 `NSObject` 的定义头文件，通过头文件我们可以看到，`NSObject` 就是一个包含 isa 指针的结构体，如下图所示：

![](https://raw.githubusercontent.com/Fongim/personal_blog_image/master/image/20190603171935.png)

按照面向对象语言的设计原则，所有事物都应该是对象（严格来说 `Objective-C` 并没有完全做到这一点，因为它有象 `int`, `double` 这样的简单变量类型，而 `Swift` 语言，连 `int` 变量也是对象）。在 `Objective-C` 语言中，每一个类实际上也是一个对象。每一个类也有一个名为 `isa` 的指针。每一个类也可以接受消息，例如代码`[NSObject alloc]`，就是向 `NSObject` 这个类发送名为alloc消息。

在 `Xcode` 中按`Shift + Command + O`, 然后输入 `runtime.h`，可以打开 `Class` 的定义头文件，通过头文件我们可以看到，`Class` 也是一个包含 `isa` 指针的结构体，如下图所示。（图中除了 `isa` 外还有其它成员变量，但那是为了兼容非 2.0 版的 `Objective-C` 的遗留逻辑，大家可以忽略它。）

![](https://raw.githubusercontent.com/Fongim/personal_blog_image/master/image/20190603172059.png)

因为类也是一个对象，那它也必须是另一个类的实例，这个类就是元类 (`metaclass`)。元类保存了类方法的列表。当一个类方法被调用时，元类会首先查找它本身是否有该类方法的实现，如果没有，则该元类会向它的父类查找该方法，直到一直找到继承链的头。

元类 (`metaclass`) 也是一个对象，那么元类的 `isa` 指针又指向哪里呢？为了设计上的完整，所有的元类的 `isa` 指针都会指向一个根元类 (`root metaclass`)。根元类 (`root metaclass`) 本身的 `isa` 指针指向自己，这样就行成了一个闭环。上面提到，一个对象能够接收的消息列表是保存在它所对应的类中的。在实际编程中，我们几乎不会遇到向元类发消息的情况，那它的 `isa` 指针在实际上很少用到。不过这么设计保证了面向对象概念在 `Objective-C` 语言中的完整，即语言中的所有事物都是对象，都有 `isa` 指针。

我们再来看看继承关系，由于类方法的定义是保存在元类 (`metaclass`) 中，而方法调用的规则是，如果该类没有一个方法的实现，则向它的父类继续查找。所以，为了保证父类的类方法可以在子类中可以被调用，所以子类的元类会继承父类的元类，换而言之，类对象和元类对象有着同样的继承关系。

我很想把关系说清楚一些，但是这块儿确实有点绕，我们还是来看图吧，很多时候图象比文字表达起来更为直观。下面这张图或许能够让大家对 `isa` 和继承的关系清楚一些：

![](https://raw.githubusercontent.com/Fongim/personal_blog_image/master/image/20190603172152.png)

我们可以从图中看出：

`NSObject` 的类中定义了实例方法，例如 `-(id)init` 方法 和 `- (void)dealloc` 方法。

`NSObject` 的元类中定义了类方法，例如 `+(id)alloc` 方法 和 `+ (void)load` 、`+ (void)initialize` 方法。

`NSObject` 的元类继承自 `NSObject` 类，所以 `NSObject` 类是所有类的根，因此 `NSObject` 中定义的实例方法可以被所有对象调用，例如 `- (id)init` 方法 和 `- (void)dealloc` 方法。

`NSObject` 的元类的 `isa` 指向自己。

#### isa swizzling 的应用

系统提供的 `KVO` 的实现，就利用了动态地修改 `isa` 指针的值的技术。在 苹果的文档
中可以看到如下描述：
```
Key-Value Observing Implementation Details

Automatic key-value observing is implemented using a technique called isa-swizzling.

The isa pointer, as the name suggests, points to the object’s class which maintains a dispatch table. This dispatch table essentially contains pointers to the methods the class implements, among other data.

When an observer is registered for an attribute of an object the isa pointer of the observed object is modified, pointing to an intermediate class rather than at the true class. As a result the value of the isa pointer does not necessarily reflect the actual class of the instance.

You should never rely on the isa pointer to determine class membership. Instead, you should use the class method to determine the class of an object instance.
```