---
title: 判断一个 NSArray 是否为空
tags:
  - Objective-C
url: 453.html
id: 453
categories:
  - Tech
date: 2019-03-12 15:34:27
---

    if ([array isKindOfClass:[NSArray class]] && array.count > 0)
    {
        NSLog(@"这是一个非空数组");
    }
    

* * *