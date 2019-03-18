---
title: iOS UITabbar图标点击动画效果实现
tags:
  - iOS
  - Objective-C
url: 274.html
id: 274
categories:
  - Tech
date: 2019-02-01 16:54:57
---

正常情况下，我们点击tabbar都只有一个变色效果，但有时候，如果我们想给它添加一个点击动画，该如何做呢？ 以下是两种方法： 第一种通过`tabBar: didSelectItem:`代理方法接收每次点击的item，对每个item都绑定动画效果，弊端是获取到的是整个item，图标和标题都会一起动。 第二种是自定一个方法单独获取tabbar item的image和label，可自定只对某个item绑定动画，并且可设定单独image的动画。 先上几个效果图： 1、带重力效果的弹跳（第二种方法：只对image执行动画） ![](http://paaatrick.com/wordpress/wp-content/uploads/2019/02/1549072293345_888x213.gif) 2、先放大，再缩小 ![](http://paaatrick.com/wordpress/wp-content/uploads/2019/01/511196-20170116103844396-1872210226.gif) 3、Z轴旋转 ![](http://paaatrick.com/wordpress/wp-content/uploads/2019/01/511196-20170116103932614-876709799.gif) 4、Y轴位移 ![](http://paaatrick.com/wordpress/wp-content/uploads/2019/01/511196-20170116104000302-95725194.gif) 5、放大并保持 ![](http://paaatrick.com/wordpress/wp-content/uploads/2019/01/511196-20170116104036224-920525159.gif)

    @interface MainTabbarVC ()<UITabBarControllerDelegate>
    @property (nonatomic,assign) NSInteger  indexFlag;　　//记录上一次点击tabbar，使用时，记得先在init或viewDidLoad里 初始化 = 0
    @end
    
    //第一种方法：通过接收点击事件对每个tabbar item的点击都执行动画
    -(void)tabBar:(UITabBar *)tabBar didSelectItem:(UITabBarItem *)item{
        NSInteger index = [self.tabBar.items indexOfObject:item];
        if (index != self.indexFlag) {
            //执行动画
            NSMutableArray *arry = [NSMutableArray array];
            for (UIView *btn in self.tabBar.subviews) {
                if ([btn isKindOfClass:NSClassFromString(@"UITabBarButton")]) {
                     [arry addObject:btn];
                }
            }
            //添加动画
    　　　　 //---将下面的代码块拷贝到此并修改最后一行addAnimation的layer对象即可---
    
            self.indexFlag = index;
        }
    }
    
    //第二种方法：只想对某一个item的点击执行动画，且只有图片动，文字不动。并且其余图标的点击不带动画
    - (void)tabBarImageAnimation {
        for (UIControl *tabBarButton in self.tabBar.subviews) {
            if ([tabBarButton isKindOfClass:NSClassFromString(@"UITabBarButton")]) {
                for (UIControl *tabBarButtonLabel in tabBarButton.subviews) {
                    if ([tabBarButtonLabel isKindOfClass:NSClassFromString(@"UITabBarButtonLabel")]) {
                        UILabel *label = (UILabel *)tabBarButtonLabel;
                        //"tab1"到"tab4"分别是不打算执行动画的tabbar item的标题名称
                        if (![label.text isEqualToString:@"tab1"] && ![label.text isEqualToString:@"tab2"] && ![label.text isEqualToString:@"tab3"] && ![label.text isEqualToString:@"tab4"]) {
                            for (UIView *imageView in tabBarButton.subviews) {
                                if ([imageView isKindOfClass:NSClassFromString(@"UITabBarSwappableImageView")]) {
                                    //添加动画
                                    //---将下面的代码块拷贝到此并修改最后一行addAnimation的layer对象即可---
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    

1、带重力效果的弹跳

    CAKeyframeAnimation *animation = [CAKeyframeAnimation animationWithKeyPath:@"transform.translation.y"];
    //通过初中物理重力公式计算出的位移y值数组
    animation.values = @[@0.0, @-4.15, @-7.26, @-9.34, @-10.37, @-9.34, @-7.26, @-4.15, @0.0, @2.0, @-2.9, @-4.94, @-6.11, @-6.42, @-5.86, @-4.44, @-2.16, @0.0];
    animation.duration = 0.8;
    animation.beginTime = CACurrentMediaTime() + 1;
    [imageView.layer addAnimation:animation forKey:nil];
    

2、先放大，再缩小

    //放大效果，并回到原位
    CABasicAnimation *animation = [CABasicAnimation animationWithKeyPath:@"transform.scale"];
    //速度控制函数，控制动画运行的节奏
    animation.timingFunction = [CAMediaTimingFunction functionWithName:kCAMediaTimingFunctionEaseInEaseOut];
    animation.duration = 0.2;       //执行时间
    animation.repeatCount = 1;      //执行次数
    animation.autoreverses = YES;    //完成动画后会回到执行动画之前的状态
    animation.fromValue = [NSNumber numberWithFloat:0.7];   //初始伸缩倍数
    animation.toValue = [NSNumber numberWithFloat:1.3];     //结束伸缩倍数
    [[arry[index] layer] addAnimation:animation forKey:nil];
    

3、Z轴旋转

    //z轴旋转180度
    CABasicAnimation *animation = [CABasicAnimation animationWithKeyPath:@"transform.rotation.z"];
    //速度控制函数，控制动画运行的节奏
    animation.timingFunction = [CAMediaTimingFunction functionWithName:kCAMediaTimingFunctionEaseInEaseOut];
    animation.duration = 0.2;       //执行时间
    animation.repeatCount = 1;      //执行次数
    animation.removedOnCompletion = YES;
    animation.fromValue = [NSNumber numberWithFloat:0];   //初始伸缩倍数
    animation.toValue = [NSNumber numberWithFloat:M_PI];     //结束伸缩倍数
    [[arry[index] layer] addAnimation:animation forKey:nil];
    

4、Y轴位移

    //向上移动
    CABasicAnimation *animation = [CABasicAnimation animationWithKeyPath:@"transform.translation.y"];
    //速度控制函数，控制动画运行的节奏
    animation.timingFunction = [CAMediaTimingFunction functionWithName:kCAMediaTimingFunctionEaseInEaseOut];
    animation.duration = 0.2;       //执行时间
    animation.repeatCount = 1;      //执行次数
    animation.removedOnCompletion = YES;
    animation.fromValue = [NSNumber numberWithFloat:0];   //初始伸缩倍数
    animation.toValue = [NSNumber numberWithFloat:-10];     //结束伸缩倍数
    [[arry[index] layer] addAnimation:animation forKey:nil];
    

5、放大并保持

    //放大效果
    CABasicAnimation *animation = [CABasicAnimation animationWithKeyPath:@"transform.scale"];
    //速度控制函数，控制动画运行的节奏
    animation.timingFunction = [CAMediaTimingFunction functionWithName:kCAMediaTimingFunctionEaseInEaseOut];
    animation.duration = 0.2;       //执行时间
    animation.repeatCount = 1;      //执行次数
    animation.removedOnCompletion = NO;
    animation.fillMode = kCAFillModeForwards;           //保证动画效果延续
    animation.fromValue = [NSNumber numberWithFloat:1.0];   //初始伸缩倍数
    animation.toValue = [NSNumber numberWithFloat:1.15];     //结束伸缩倍数
    [[arry[index] layer] addAnimation:animation forKey:nil];
    //移除其他tabbar的动画
    for (int i = 0; i<arry.count; i++) {
        if (i != index) {
            [[arry[i] layer] removeAllAnimations];
        }
    }
    

此外，如果想定制其他动画效果，还可以从下面属性里自己定制动画 ![](http://paaatrick.com/wordpress/wp-content/uploads/2019/01/511196-20170116093610724-1578979553.png)      

* * *