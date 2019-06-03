---
title: WKWebView获取H5页面里图片地址以及图片相对视图窗口的坐标的方法
date: 2019-06-01 12:04:39
tags:
  - iOS
  - Objective-C
categories:
  - Tech
---

WKWebView获取H5页面里图片地址以及图片相对视图窗口的坐标的方法

最近有个需求是点击放大查看H5内容页面的图片，寻找到一个比较轻量的库[`YHPhotoBrowser`](https://github.com/hackxhj/YHPhotoBrowser)，其中根据图片位置来缩放的动画需要传递一个图片所在屏幕里的位置`CGRect`，想获取H5的图片坐标那就需要JS注入了

<!-- more -->

```objc
- (void)handleSingleTap:(UITapGestureRecognizer *)recognizer {
    CGPoint touchPoint = [recognizer locationInView:self.webView];
    NSString *jsString = [NSString stringWithFormat:@"function getURLandRect(){\
                            var ele=document.elementFromPoint(%f, %f);\
                            var url=ele.src;\
                            var left=ele.getBoundingClientRect().left;\
                            var top=ele.getBoundingClientRect().top;\
                            var width=ele.getBoundingClientRect().width;\
                            var height=ele.getBoundingClientRect().height;\
                            var jsonString= `{\"url\":\"${url}\",\"left\":\"${left}\",\"top\":\"${top}\",\"width\":\"${width}\",\"height\":\"${height}\"}`;\
                            return(jsonString)} getURLandRect()", touchPoint.x, touchPoint.y];
    
    [self.webView evaluateJavaScript:jsString completionHandler:^(id _Nullable result, NSError * _Nullable error) {
        NSDictionary *resultDic = [SmallTools convertToDictionary:(NSString *)result];
        NSString *imageURL = [SmallTools isNullToString:resultDic[@"url"]];
        if (imageURL.length == 0 || [imageURL isEqualToString:@"undefined"]) {
            return;
        }
        CGFloat imgX = [resultDic[@"left"] floatValue];
        CGFloat imgY = [resultDic[@"top"] floatValue] + NAV_HEIGHT + 5;
        CGFloat imgW = [resultDic[@"width"] floatValue];
        CGFloat imgH = [resultDic[@"height"] floatValue];
        
        self.photoView = [[YHPhotoBrowser alloc]init];
        self.photoView.sourceView = self.view; //图片所在的父容器
        self.photoView.urlImgArr = @[imageURL]; //网络链接图片的数组
        if (imgX && imgY && imgW && imgH) { //原图片所在屏幕位置
            self.photoView.sourceRect = CGRectMake(imgX, imgY, imgW, imgH);
        }
        self.photoView.indexTag = 0; //初始化进去显示的图片下标
        [self.view addSubview:self.photoView]; //叠加在当前VC上
    }];
}
```

这个JS方法`document.elementFromPoint(%f, %f)`根据传入的点返回该点最上层的对象，通过`src`找到图片的链接，然后`getBoundingClientRect()`方法能返回对象的八个属性`left, top, right, bottom, x, y, width, height`，根据需要获取相应属性构造原图的`CGRect`即可

这里附带一下判断`NSString`合法性以及`JSON`字符串转`NSDictionary`的工具方法

```objc
+ (NSString *)isNullToString:(id)string {
    if ([string isEqual:@"NULL"] || [string isKindOfClass:[NSNull class]] || [string isEqual:[NSNull null]] || [string isEqual:NULL] || [[string class] isSubclassOfClass:[NSNull class]] || string == nil || string == NULL || [string isKindOfClass:[NSNull class]] || [[string stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]] length]==0 || [string isEqualToString:@"<null>"] || [string isEqualToString:@"(null)"]) {
        return @"";
    } else {
        return (NSString *)string;
    }
}
```

```objc
+ (NSDictionary *)convertToDictionary:(NSString *)jsonStr {
    NSData *data = [jsonStr dataUsingEncoding:NSUTF8StringEncoding];
    NSDictionary *tempDic = [NSJSONSerialization JSONObjectWithData:data options:0 error:nil];
    return tempDic;
}
```