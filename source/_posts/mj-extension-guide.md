---
title: iOS MJExtension使用方法指南(Objective-C)
tags:
  - iOS
  - Objective-C
categories:
  - Tech
description: MJExtension使用方法指南
date: 2019-02-03 15:29:04
---

MJExtension能做什么？
----------------

##### 1\. MJExtension是一套字典和模型之间互相转换的超轻量级框架

##### 2\. MJExtension能完成的功能


```objective-c
字典（JSON） --> 模型（Model）
模型（Model） --> 字典（JSON）
字典数组（JSON Array） --> 模型数组（Model Array）
模型数组（Model Array） --> 字典数组（JSON Array）
```


`详尽用法主要参考 main.m中的各个函数 以及 NSObject+MJKeyValue.h`

MJExtension和JSONModel、Mantle等框架的区别
----------------------------------

##### 1\. 转换速率：

最近一次测试表明：`MJExtension > JSONModel > Mantle` 各位开发者也可以自行测试

##### 2\. 具体用法：


```objective-c
JSONModel：

要求所有模型类必须继承自JSONModel基类

Mantle：

要求所有模型类必须继承自MTModel基类

MJExtension：

不需要你的模型类继承任何特殊基类，毫无污染，毫无侵入性
```


如何安装MJExtension
---------------

方法一：cocoapods导入：

```objective-c
pod 'MJExtension'
```


方法二：手动导入：


```objective-c
将MJExtensionExample/MJExtensionExample/MJExtension文件夹中的所有源代码拽入项目中
导入主头文件：#import "MJExtension.h"
MJExtension.h
MJConst.h
MJConst.m
MJFoundation.h
MJFoundation.m
MJIvar.h
MJIvar.m
MJType.h
MJType.m
NSObject+MJCoding.h
NSObject+MJCoding.m
NSObject+MJIvar.h
NSObject+MJIvar.m
NSObject+MJKeyValue.h
NSObject+MJKeyValue.m
```


如何使用MJExtension
---------------

#### 1\. 最简单的字典转模型


```objective-c
typedef enum {
    SexMale,    
    SexFemale} Sex;
@interface User : NSObject
@property (copy, nonatomic) NSString *name;
@property (copy, nonatomic) NSString *icon;
@property (assign, nonatomic) int age;
@property (assign, nonatomic) double height;
@property (strong, nonatomic) NSNumber *money;
@property (assign, nonatomic) Sex sex;
@end

NSDictionary *dict = @{
                        @"name" : @"Jack",                 
                        @"icon" : @"lufy.png",               
                        @"age" : @20,               
                        @"height" : @"1.55",               
                        @"money" : @100.9,               
                        @"sex" : @(SexFemale)            
};

// 将字典转为User模型
User *user = [User objectWithKeyValues:dict];
NSLog(@"name=%@, icon=%@, age=%d, height=%@, money=%@, sex=%d", user.name, user.icon, user.age, user.height, user.money, user.sex);
// name=Jack, icon=lufy.png, age=20, height=1.550000, money=100.9, sex=1
```


##### 核心代码1：

```objective-c
[User objectWithKeyValues:dict]
```


#### 2\. 模型中嵌套模型


```objective-c
@interface Status : NSObject
/** 微博文本内容 */
@property (copy, nonatomic) NSString *text;
/** 微博作者 */
@property (strong, nonatomic) User *user;
/** 转发的微博 */
@property (strong, nonatomic) Status *retweetedStatus;
@end

NSDictionary *dict = @{               
@"text" : @"是啊，今天天气确实不错！", 
@"user" : @{                   
             @"name" : @"Jack",                   
             @"icon" : @"lufy.png"                
           },               
@"retweetedStatus" : @{                   
                        @"text" : @"今天天气真不错！",                   
                        @"user" : @{                       
                                    @"name" : @"Rose",                       
                                    @"icon" : @"nami.png"                    
                                   }                
                       }            
};

// 将字典转为Status模型
Status *status = [Status objectWithKeyValues:dict];
NSString *text = status.text;
NSString *name = status.user.name;
NSString *icon = status.user.icon;
NSLog(@"text=%@, name=%@, icon=%@", text, name, icon);
// text=是啊，今天天气确实不错！, name=Jack, icon=lufy.png

NSString *text2 = status.retweetedStatus.text;
NSString *name2 = status.retweetedStatus.user.name;
NSString *icon2 = status.retweetedStatus.user.icon;
NSLog(@"text2=%@, name2=%@, icon2=%@", text2, name2, icon2);
// text2=今天天气真不错！, name2=Rose, icon2=nami.png
```


##### 核心代码2

```objective-c
[Status objectWithKeyValues:dict]`
```


#### 3\. 模型中有个数组属性，数组里面又要装着其它模型


```objective-c
@interface Ad : NSObject
@property (copy, nonatomic) NSString *image;
@property (copy, nonatomic) NSString *url;
@end

@interface StatusResult : NSObject
/** 存放着一堆的微博数据（里面都是Status模型） */
@property (strong, nonatomic) NSMutableArray *statuses;
/** 存放着一堆的广告数据（里面都是Ad模型） */
@property (strong, nonatomic) NSArray *ads;
@property (strong, nonatomic) NSNumber *totalNumber;
@end

@implementation StatusResult
// 实现这个方法的目的：告诉MJExtension框架statuses和ads数组里面装的是什么模型
/*    + (NSDictionary *)objectClassInArray{    
return @{         
@"statuses" : [Status class],         
@"ads" : [Ad class]    };
}
+ (Class)objectClassInArray:(NSString *)propertyName{    
if ([propertyName isEqualToString:@"statuses"]) {        
return [Status class];    
} else if ([propertyName isEqualToString:@"ads"]) {        
return [Ad class];    }    
return nil;}
*/

// 这个方法对比上面的2个方法更加没有侵入性和污染，因为不需要导入Status和Ad的头文件
+ (NSDictionary *)objectClassInArray{    
    return @{         
              @"statuses" : @"Status",         
              @"ads" : @"Ad"    
            };
}
@end

NSDictionary *dict = @{                       
@"statuses" : @[                           
                @{                                   
                   @"text" : @"今天天气真不错！",
                   @"user" : @{                                   
                                @"name" : @"Rose",
                                @"icon" : @"nami.png"                                                                                  
                              }                            
                 }, 

                 @{                               
                    @"text" : @"明天去旅游了", 
                    @"user" : @{                                                                   
                                 @"name" : @"Jack",                                       
                                 @"icon" : @"lufy.png"                               
                               }  
                   } 

                ],                       
 @"ads" :@[                           
           @{                               
              @"image" : @"ad01.png", 
              @"url" : @"http://www.ad01.com"                                                          
            }, 

           @{                               
              @"image" : @"ad02.png",                                   
              @"url" : @"http://www.ad02.com"                           
            }                       
          ],                       
 @"totalNumber" : @"2014"                    
};

         // 将字典转为StatusResult模型
         StatusResult *result = [StatusResult objectWithKeyValues:dict];
         NSLog(@"totalNumber=%@", result.totalNumber);
         // totalNumber=2014

         // 打印statuses数组中的模型属性
         for (Status *status in result.statuses) {    
                NSString *text = status.text;    
                NSString *name = status.user.name;    NSString *icon = status.user.icon;    
                NSLog(@"text=%@, name=%@, icon=%@", text, name, icon);}
               // text=今天天气真不错！, name=Rose, icon=nami.png
               // text=明天去旅游了, name=Jack, icon=lufy.png

         // 打印ads数组中的模型属性
         for (Ad *ad in result.ads) {    
                 NSLog(@"image=%@, url=%@", ad.image, ad.url);}
                 // image=ad01.png, url=http://www.ad01.com
                 // image=ad02.png, url=http://www.ad02.com
```


##### 核心代码3：

```objective-c
在模型内部实现+ (NSDictionary *)objectClassInArray方法

[StatusResult objectWithKeyValues:dict]
```


#### 4\. 模型中的属性名和字典中的key不相同(或者需要多级映射)


```objective-c
@interface Bag : NSObject
@property (copy, nonatomic) NSString *name;
@property (assign, nonatomic) double price;@end@interface Student : NSObject
@property (copy, nonatomic) NSString *ID;
@property (copy, nonatomic) NSString *desc;
@property (copy, nonatomic) NSString *nowName;
@property (copy, nonatomic) NSString *oldName;
@property (copy, nonatomic) NSString *nameChangedTime;
@property (strong, nonatomic) Bag *bag;
@end

@implementation Student
// 实现这个方法的目的：告诉MJExtension框架模型中的属性名对应着字典的哪个key
+ (NSDictionary *)replacedKeyFromPropertyName{    
     return @{                
               @"ID" : @"id",                
               @"desc" : @"desciption",                
               @"oldName" : @"name.oldName", 
               @"nowName" : @"name.newName",  
               @"nameChangedTime" : @"name.info.nameChangedTime",                                       
               @"bag" : @"other.bag"            
              };
}

@end

NSDictionary *dict = @{                       
                        @"id" : @"20",                       
                        @"desciption" : @"孩子",
                        @"name" : @{                                                         
                                     @"newName" : @"lufy", 
                                     @"oldName" : @"kitty",  
                                     @"info" : @{                                                                                                   
                                                  @"nameChangedTime" : @"2013-08"                            
                                                 }                       
                                    },                       
                        @"other" : @{                            
                                      @"bag" : @{                                
                                                  @"name" : @"小书包", 
                                                  @"price" : @100.7                                                              
                                                 }                       
                                     }                   
};

// 将字典转为Student模型
Student *stu = [Student objectWithKeyValues:dict];
// 打印Student模型的属性
NSLog(@"ID=%@, desc=%@, oldName=%@, nowName=%@, nameChangedTime=%@", stu.ID, stu.desc, stu.oldName, stu.nowName, stu.nameChangedTime);
// ID=20, desc=孩子, oldName=kitty, nowName=lufy, nameChangedTime=2013-08
NSLog(@"bagName=%@, bagPrice=%f", stu.bag.name, stu.bag.price);
// bagName=小书包, bagPrice=100.700000
```


##### 核心代码4：

```objective-c
在模型内部实现+ (NSDictionary *)replacedKeyFromPropertyName方法

[Student objectWithKeyValues:dict]
```


#### 5\. 将一个字典数组转成模型数组


```objective-c
NSArray *dictArray = @[                       
                        @{                           
                           @"name" : @"Jack",                           
                           @"icon" : @"lufy.png",                        
                         },                       
                        @{                           
                           @"name" : @"Rose",                           
                           @"icon" : @"nami.png",                        
                         }                    
                       ];

// 将字典数组转为User模型数组
NSArray *userArray = [User objectArrayWithKeyValuesArray:dictArray];
// 打印userArray数组中的User模型属性
for (User *user in userArray) {   
      NSLog(@"name=%@, icon=%@", user.name, user.icon);}
      // name=Jack, icon=lufy.png
      // name=Rose, icon=nami.png
```


##### 核心代码5：

```objective-c
[User objectArrayWithKeyValuesArray:dictArray]
```


#### 6\. 将一个模型转成字典


```objective-c
// 新建模型
  User *user = [[User alloc] init];
user.name = @"Jack";
user.icon = @"lufy.png";

Status *status = [[Status alloc] init];
status.user = user;
status.text = @"今天的心情不错！";
```


​    
```objective-c
// 将模型转为字典
NSDictionary *statusDict = status.keyValues;
NSLog(@"%@", statusDict);
/*{ text = "今天的心情不错！";    
    user = {        
             icon = "lufy.png";        
             name = Jack;    
           };
  }*/

// 多级映射的模型
Student *stu = [[Student alloc] init];
stu.ID = @"123";
stu.oldName = @"rose";
stu.nowName = @"jack";
stu.desc = @"handsome";
stu.nameChangedTime = @"2018-09-08";

Bag *bag = [[Bag alloc] init];
bag.name = @"小书包";
bag.price = 205;
stu.bag = bag;
NSDictionary *stuDict = stu.keyValues;NSLog(@"%@", stuDict);
/*
{    desciption = handsome;    
       id = 123;    
       name = {        
                info ={            
                nameChangedTime = "2018-09-08";        
                       };        
                newName = jack;        
                oldName = rose;    
               };    
                other = {  
                          bag ={            
                                 name = "小书包";            
                                 price = 205;        
                               };    
                        }; 
               }
 */
```


##### 核心代码6：

```objective-c
status.keyValues、stu.keyValues
```


#### 7\. 将一个模型数组转成字典数组


```objective-c
// 新建模型数组
  User *user1 = [[User alloc] init];
user1.name = @"Jack";
user1.icon = @"lufy.png";

User *user2 = [[User alloc] init];
user2.name = @"Rose";
user2.icon = @"nami.png";

NSArray *userArray = @[user1, user2];
// 将模型数组转为字典数组
NSArray *dictArray = [User keyValuesArrayWithObjectArray:userArray];
NSLog(@"%@", dictArray);
/*(    
{        icon = "lufy.png";        name = Jack;    },    
{        icon = "nami.png";        name = Rose;    }  )*/
```


###### 核心代码7：

```objective-c
[User keyValuesArrayWithObjectArray:userArray]
```


#### 更多用法


```objective-c
参考NSObject+MJKeyValue.h
参考NSObject+MJCoding.h
```


     

* * *