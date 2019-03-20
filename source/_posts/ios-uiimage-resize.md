---
title: iOS修改UIImage图片尺寸大小逻辑分辨率
tags:
  - iOS
  - Objective-C
categories:
  - Tech
date: 2019-02-01 17:57:12
---

之前遇到的问题，给UITabbar item设置图片，然而素材的图片分辨率是87*87，填满了整个tabbar item的区域，很难看，又要考虑适配XS Max的三倍问题。 解决方法如下： 通过设置scale使生成的图片尺寸是逻辑分辨率pt单位，不用操心二倍三倍的问题。

<!-- more -->


```objc
+ (UIImage *)imageResize:(UIImage*)img andResizeTo:(CGSize)newSize {
    CGFloat scale = [[UIScreen mainScreen]scale];
    //UIGraphicsBeginImageContext(newSize);
    UIGraphicsBeginImageContextWithOptions(newSize, NO, scale);
    [img drawInRect:CGRectMake(0,0,newSize.width,newSize.height)];
    UIImage* newImage = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();
    return newImage;
}
```


这样一来就能使tabbar item的图标始终是25pt*25pt，恰到好处。

```objc
childController.tabBarItem.selectedImage = [[SmallTools imageResize:[UIImage imageNamed:selected] andResizeTo:CGSizeMake(25, 25)] imageWithRenderingMode:UIImageRenderingModeAlwaysOriginal];
```


![](https://raw.githubusercontent.com/Fongim/personal_blog_image/master/image/1549072293345_888x213.gif)

### 另外关于上图中间图标的动画效果实现可参考此文章

[iOS UITabbar图标点击动画效果实现](http://paaatrick.com/ios_uitabbar_touch_animation.html "iOS UITabbar图标点击动画效果实现")      

* * *