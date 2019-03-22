---
title: iOS集成支付宝H5支付实现跳转与回调的解决方案
date: 2019-03-22 20:28:36
tags:
  - iOS
  - Objective-C
categories:
  - Tech
---
# 前言

最近有个需求，不能在iOS客户端内集成支付宝和微信的App支付SDK（为了防苹果审核检测SDK），因此使用H5支付，虽然微信和支付宝的H5支付文档都说不要在App内使用H5支付而是使用App支付，但办法总是有的。

这篇讲的是支付宝H5支付如何从App跳转支付宝以及如何从支付宝跳转回App，微信支付的见这篇：

## [iOS集成H5微信支付实现跳转与回调的解决方案](https://paaatrick.com/ios-wxpay-h5-solution/)

实现的效果是：App→支付宝→支付(成功失败或取消)→App


<!-- more -->

# 前置准备

本项目使用WKWebView，前置动作是后端小伙伴已经处理好支付宝H5支付下单链接，客户端接收到下单链接后的操作。

下单链接即为[支付宝H5支付文档-参数说明-公共参数](https://docs.open.alipay.com/203/107090/)中构造的`https://openapi.alipay.com/gateway.do`开头的的链接，构造链接的操作交由后端处理。

![](https://raw.githubusercontent.com/Fongim/personal_blog_image/master/image/20190322204641.png)

# 操作步骤

## 1. 添加 URL Scheme 并把支付宝加入白名单

![](https://raw.githubusercontent.com/Fongim/personal_blog_image/master/image/20190322175421.png)

添加 URL Scheme。在 `xcodeproj` 文件 `Info` 选项卡最下面的 `URL Types`内设置。 该 URL Scheme 不像微信支付因为要校验必须设置商户后台填的一级域名，支付宝的这个可以任意设置。


![](https://raw.githubusercontent.com/Fongim/personal_blog_image/master/image/20190322175420.png)

把支付宝的 URL Scheme `alipay` 和 `alipays` 填入项目的白名单。在 `xcodeproj` 文件 `Info` 选项卡内的 `LSApplicationQueriesSchemes`字段里设置。


## 2. WKWebView加载链接

添加协议 `WKNavigationDelegate`和`WKUIDelegate`。

创建一个WKWebView，并加载统一下单链接。

```objc
- (void)buildWKWebView {
    WKWebView *webView = [[WKWebView alloc] initWithFrame:CGRectMake(0, NAV_HEIGHT, SCREEN_WIDTH, SCREEN_HEIGHT - NAV_HEIGHT)];
    [self.view addSubview:webView];
    webView.navigationDelegate = self;
    webView.UIDelegate = self;
    NSURL *payURL = [NSURL URLWithString:self.payString];
    NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:payURL];
    [webView loadRequest:request];
}
```

此处self.payString就是后台传来的支付宝5支付统一下单链接，格式为：

`https://openapi.alipay.com/gateway.do?app_id=2015081808011180&biz_content={"body"%3A"支付宝充值"%2C"subject"%3A"10000宝石"%2C"out_trade_no"%3A"30677"%2C"total_amount"%3A"1.00"%2C"seller_id"%3A"2088721584425035"%2C"product_code"%3A"QUICK_WAP_PAY"%2C"goods_type"%3A"1"%2C"passback_params"%3A"20190322083556lkkzmwT2wi0bAaFL1W"%2C"store_id"%3A"company"%2C"timeout_express"%3A"3m"}&charset=UTF-8&format=JSON&method=alipay.trade.wap.pay&notify_url=https%3A%2F%2Fsttv3-api.company.com%2FaliNotify&return_url=https%3A%2F%2Fwww.company.com&sign_type=RSA2&timestamp=2019-03-22+20%3A35%3A56&version=1.0&sign=rmnKUOsZBYi%2BWzDELY%2B5ixnSFn0b0S38K0NR45SRZBAvmzr0qaXm7mnKaXm7OrvmnKUOsZRYiaJ2LNAaFL1K0hvJ3L3hZqH5HifNCIJ0hfTr1OkA5Lgyn1SCx74SrSWVfXdMXqiLurpN0Mj%2B2zs7vDee%2B8vxwzhRG3a5EaZbOHDQFN1%2OrvvVcdv%2F%2FBJCwISBhoXhBelvfZRYiaJ2LNAaFL1KdrJvjlo2lR%2BEzvda0ppMKFzjMLxRZBAvmzr0qNwxyTMfAuxjAT2%2BXAaF3hZqH5Hlo2lRiaJ2LNE`

不像微信支付还要加个请求头，支付宝的简单的多，直接访问即可。


## 3. 实现代理方法拦截链接并跳转支付宝

```objc
- (void)webView:(WKWebView *)webView decidePolicyForNavigationAction:(WKNavigationAction *)navigationAction decisionHandler:(void (^)(WKNavigationActionPolicy))decisionHandler {

    if ([navigationAction.request.URL.scheme isEqualToString:@"alipay"]) {
        //  1.以？号来切割字符串
        NSArray *urlBaseArr = [navigationAction.request.URL.absoluteString componentsSeparatedByString:@"?"];
        NSString *urlBaseStr = urlBaseArr.firstObject;
        NSString *urlNeedDecode = urlBaseArr.lastObject;
        //  2.将截取以后的Str，做一下URLDecode，方便我们处理数据
        NSMutableString *afterDecodeStr = [NSMutableString stringWithString:[SmallTools decoderUrlEncodeStr:urlNeedDecode]];
        //  3.替换里面的默认Scheme为自己的Scheme
        NSString *afterHandleStr = [afterDecodeStr stringByReplacingOccurrencesOfString:@"alipays" withString:@"alipayreturn.cutv.com"];
        //  4.然后把处理后的，和最开始切割的做下拼接，就得到了最终的字符串
        NSString *finalStr = [NSString stringWithFormat:@"%@?%@",urlBaseStr, [SmallTools urlEncodeStr:afterHandleStr]];
        
        dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.5 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
            //  判断一下，是否安装了支付宝APP（也就是看看能不能打开这个URL）
            if ([[UIApplication sharedApplication] canOpenURL:[NSURL URLWithString:finalStr]]) {
                [[UIApplication sharedApplication] openURL:[NSURL URLWithString:finalStr]];
            } else {
                //未安装支付宝, 自行处理
            }
        });
        
        decisionHandler(WKNavigationActionPolicyCancel);
        return;
    }
```


顺便附带一下 URL 的 Encode 和 Decode 方法。


```objc
//urlEncode编码
+ (NSString *)urlEncodeStr:(NSString *)input {
    NSString *charactersToEscape = @"?!@#$^&%*+,:;='\"`<>()[]{}/\\| ";
    NSCharacterSet *allowedCharacters = [[NSCharacterSet characterSetWithCharactersInString:charactersToEscape] invertedSet];
    NSString *upSign = [input stringByAddingPercentEncodingWithAllowedCharacters:allowedCharacters];
    return upSign;
}
//urlEncode解码
+ (NSString *)decoderUrlEncodeStr: (NSString *) input {
    NSMutableString *outputStr = [NSMutableString stringWithString:input];
    [outputStr replaceOccurrencesOfString:@"+" withString:@"" options:NSLiteralSearch range:NSMakeRange(0,[outputStr length])];
    return [outputStr stringByRemovingPercentEncoding];
}
```


## 4. AppDelegate 中接收跳转动作

当然你也不一定需要在AppDelegate里接收返回动作，也可以直接返回支付界面，自行操作后续逻辑。

以下是AppDelegate接收返回动作的示例。

其中支付宝回调的 host 是固定的 safepay，而微信支付的 host 随意定义。

```objc
- (BOOL)application:(UIApplication *)app openURL:(NSURL *)url options:(NSDictionary<NSString *,id> *)options{
    //safepay是支付宝H5支付的回调host, 
    if ([url.host isEqualToString:@"wxpaycallback"] || [url.host isEqualToString:@"safepay"]) {
        // 自行操作业务逻辑，比如使用通知请求查询订单状态，popView回上级页面等
        UITabBarController *tabBarVC = (UITabBarController *)topRootViewController;
        UINavigationController *navVC = tabBarVC.viewControllers[tabBarVC.selectedIndex];
        [navVC popViewControllerAnimated:YES];
        
        NSString *orderId = [[NSUserDefaults standardUserDefaults] objectForKey:@"PayOrderId"];
            NSString *payFee = [[NSUserDefaults standardUserDefaults] objectForKey:@"PayFee"];
            //以及更多参数
        NSDictionary *resultDict = @{@"order_id":orderId, @"payFee":payFee};
        [[NSNotificationCenter defaultCenter] postNotificationName:@"htmlPaymentNotification" object:self userInfo:resultDict];
    }
}
```

---