---
title: iOS 判断NSString值是否为空或null并转换为空字符串
categories:
  - Note
date: 2019-02-12 17:52:26
tags:
  - iOS
  - Objective-C
---

遇到了一个后台json误将null作为字符串值导致iOS客户端崩溃闪退的问题，解决方法如下：套一层判断，如果是各种情况的null则转换为@""。

```objc
+ (NSString *) nullToString:(id)string {
    if ([string isEqual:@"NULL"] || [string isKindOfClass:[NSNull class]] || [string isEqual:[NSNull null]] || [string isEqual:NULL] || [[string class] isSubclassOfClass:[NSNull class]] || string == nil || string == NULL || [string isKindOfClass:[NSNull class]] || [[string stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]] length]==0 || [string isEqualToString:@"<null>"] || [string isEqualToString:@"(null)"]) {
        return @"";
    } else {
        return (NSString *)string;
    }
}
```


     

* * *