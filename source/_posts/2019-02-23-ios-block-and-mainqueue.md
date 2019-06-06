---
title: iOS处理多线程异步Block中的UI操作
date: 2019-02-23 12:05:28
tags:
  - iOS
  - Objective-C
categories:
  - Note
---

多线程方法的`completionHandler`block可能运行在非主线程上。两种处理方法：

<!-- more -->

1. 在block里手动加上`dispatch_async(dispatch_get_main_queue(), ^{});`

```objc
    NSURLSessionConfiguration *configuration = [NSURLSessionConfiguration defaultSessionConfiguration];
    
    NSURLSession *session = [NSURLSession sessionWithConfiguration:configuration];//no delegateQueue
    NSURLRequest *request = [NSURLRequest requestWithURL:[NSURL URLWithString:url] cachePolicy:NSURLRequestReturnCacheDataElseLoad timeoutInterval:30.0];
    
    NSURLSessionDownloadTask *task = [session downloadTaskWithRequest:imgRequest completionHandler:^(NSURL * _Nullable location, NSURLResponse * _Nullable response, NSError * _Nullable error) {
        dispatch_async(dispatch_get_main_queue(), ^{/* do UI things */});
        //or
        [self performSelectorOnMainThread:@selector(doUIthings) withObject:nil waitUntilDone:NO];
    }];
    
    [task resume];
```

2. 带有`delegateQueue`等参数的方法，可传入主线程队列，然后block`completionHandler`便运行在主线程了。

```objc
    NSURLSessionConfiguration *configuration = [NSURLSessionConfiguration defaultSessionConfiguration];
    
    NSURLSession *session = [NSURLSession sessionWithConfiguration:configuration delegate:self delegateQueue:[NSOperationQueue mainQueue]];//get the mainQueue
    NSURLRequest *request = [NSURLRequest requestWithURL:[NSURL URLWithString:url] cachePolicy:NSURLRequestReturnCacheDataElseLoad timeoutInterval:30.0];
    
    NSURLSessionDownloadTask *task = [session downloadTaskWithRequest:imgRequest completionHandler:^(NSURL * _Nullable location, NSURLResponse * _Nullable response, NSError * _Nullable error) {
    /* do UI things */
    }];
    
    [task resume];
```