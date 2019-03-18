---
title: iOS UILabel的lineBreakMode省略模式设置
tags:
  - iOS
  - Objective-C
url: 388.html
id: 388
categories:
  - Tech
date: 2019-02-01 18:18:21
---

     
    label.lineBreakMode = NSLineBreakByCharWrapping; //以字符为显示单位显示，后面部分省略不显示。
    label.lineBreakMode = NSLineBreakByClipping; //剪切与文本宽度相同的内容长度，后半部分被删除。
    label.lineBreakMode = NSLineBreakByTruncatingHead; //前面部分文字以……方式省略，显示尾部文字内容。
    label.lineBreakMode = NSLineBreakByTruncatingMiddle; //中间的内容以……方式省略，显示头尾的文字内容。
    label.lineBreakMode = NSLineBreakByTruncatingTail; //结尾部分的内容以……方式省略，显示头的文字内容。
    label.lineBreakMode = NSLineBreakByWordWrapping; //以单词为显示单位显示，后面部分省略不显示。
    

     

* * *