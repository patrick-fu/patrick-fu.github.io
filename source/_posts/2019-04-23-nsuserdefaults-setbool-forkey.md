---
title: 关于 NSUserDefaults setBool 的值取出后if判断不了的问题
date: 2019-04-23 11:30:27
tags:
  - iOS
  - Objective-C
categories:
  - Note
---

使用  `[[NSUserDefaults standardUserDefaults] setBool:(BOOL)value forKey:(NSString *)defaultName]` 设置的值，如果用普通的`objectForKey:`取出的值是`__NSCFBoolean`类型，`if`语句无法判断，即使后加`== YES`也没用，还会出问题。


要用 `[[NSUserDefaults standardUserDefaults] boolForKey:(NSString *)defaultName]` 来取值，

同理：
```objc
- (void)setInteger:(NSInteger)value forKey:(NSString *)defaultName;
- (void)setFloat:(float)value forKey:(NSString *)defaultName;
- (void)setDouble:(double)value forKey:(NSString *)defaultName;
- (void)setBool:(BOOL)value forKey:(NSString *)defaultName;
- (void)setURL:(nullable NSURL *)url forKey:(NSString *)defaultName;
```
如上所示等入值方法，都用对应配套的取值方法
```objc
- (NSInteger)integerForKey:(NSString *)defaultName;
- (float)floatForKey:(NSString *)defaultName;
- (double)doubleForKey:(NSString *)defaultName;
- (BOOL)boolForKey:(NSString *)defaultName;
- (nullable NSURL *)URLForKey:(NSString *)defaultName;
```
