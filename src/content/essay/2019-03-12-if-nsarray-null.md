---
title: '判断一个 NSArray 是否为空'
date: '2019-03-12 15:34:27'
tags:
  - 'iOS'
  - 'Objective-C'
categories:
  - 'Note'
slug: '2019-03-12-if-nsarray-null'
---

```objc
if ([array isKindOfClass:[NSArray class]] && array.count > 0)
{
    NSLog(@"这是一个非空数组");
}
```

* * *
