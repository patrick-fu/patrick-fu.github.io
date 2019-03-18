---
title: 云服务器使用WordPress搭建个人博客并绑定域名全记录
tags:
  - WordPress
url: 41.html
id: 41
categories:
  - Tech
date: 2019-01-29 18:38:32
---

一直在续费云服务器，索性充分利用资源，复古一下，鼓捣个小博客记录些东西。 现在大致已经搭好博客了，那就先把这折腾了一整天的建站过程给记录下。

### **关于服务器**

前几年购入的Vultr的ECS，东京的相对性价比高一些，延迟和网速都很稳，现在（2019.1）还有3.5刀一个月的，非常实惠。 ![](http://paaatrick.com/wordpress/wp-content/uploads/2019/01/Screenshot-2019-01-29-18.26.19.png)  

#### **安装 Apache2、MySQL、PHP**

sudo apt-get install apache2
sudo apt-get install mysql-server mysql-client

测试一下Apache2是否成功安装：浏览器访问云服务器的IP，安装成功的话会显示Apache2的默认页面，It works。   安装php7.0，并安装apache的php扩展，再安装整合mysql和php的工具

sudo apt-get install php7.0
sudo apt-get install libapache2-mod-php7.0
sudo apt-get install php7.0-mysql

重启一下Apache2和MySQL

sudo service apache2 restart
sudo service mysql restart

安装 phpmyadmin 这是一个以PHP为基础，以Web-Base方式架构在网站主机上的MySQL的数据库管理工具。

sudo apt-get install phpmyadmin

开启 apache 的 mod_rewrite，再重启一次apache

sudo a2enmod rewrite
sudo service apache2 restart

先登录mysql `mysql -u root -p` ，输入密码 首先创建名为“wordpressdb”数据库，然后查看创建的数据库是否成功。

create database wordpressdb;
show databases;

看到图中出现自己创建的数据库。 ![](http://paaatrick.com/wordpress/wp-content/uploads/2019/01/20180318165221370.png)   给用户服务权限，下面的wordpressuser改为安装mysql时自己输入的用户名。

GRANT ALL PRIVILEGES ON wordpressdb.* TO wordpressuser@localhost;
FLUSH PRIVILEGES;

  输入 `exit;`退出mysql，并再次重启服务。

sudo service apache2 restart
sudo service mysql restart

#### **下载并配置WordPress**

用wget从WordPress官方网站下载安装包，放在 /var/www/html/ 目录，然后解压。 （最新版下载链接在 [https://cn.wordpress.org/download/](https://cn.wordpress.org/download/) 里面有）

cd /var/www/html/
sudo wget https://cn.wordpress.org/wordpress-5.0.3-zh_CN.zip
sudo tar zxf wordpress-4.9.4.tar.gz

  在 /var/www/html/wordpress/wp-content/ 下创建uploads。 然后更改上传目录权限，不然之后博客上传不了图片。

sudo mkdir uploads
sudo chown -R www-data /var/www/html/wordpress
sudo chmod -R 755 /var/www/html/wordpress
sudo chown -R :www-data /var/www/html/wordpress/wp-content/uploads

  配置wp-config-sample.php ，该文件在/var/www/html/wordpress/下

sudo vi wp-config-sample.php

修改方法如下图所示： ![](http://paaatrick.com/wordpress/wp-content/uploads/2019/01/20180318182134757.png) 浏览器访问  http://服务器IP地址/wordpress ，如果安装正常则进入wordpress的安装界面。 安装好后的效果如图： ![](http://paaatrick.com/wordpress/wp-content/uploads/2019/01/20180318182550961.png) 到此建站完成。接下来申请域名并绑定服务器。

### **申请域名并配置DNS**

通过比价网站可以先大致看一下想要的域名价格 [https://www.domcomp.com/](https://www.domcomp.com/) 看了一下知乎，大家推荐的域名供应商有 NameSilo 、Namecheap、Porkbun、GoDaddy等，亲测了一遍，发现 NameSilo 用户界面太丑；Namecheap 实际并不 cheap；最多人说的 GoDaddy 也偏贵但是支持支付宝，Porkbun 性价比高而且界面友好。 因为有境外支付的信用卡就不考虑 GoDaddy 了，直接在 Porkbun 上下单了一个 .com 域名，首年不到 7刀，续费 8.7刀。 值得一提的是支付时好几张卡支付失败，建行、农行都不行，换了广发的万事达才支付成功，有点迷。 付款后主页可以看到自己域名的各种详情，然后要设置的是 DNS RECORDS ![](http://paaatrick.com/wordpress/wp-content/uploads/2019/01/Screenshot-2019-01-29-17.48.31.png) 点击Edit，添加两个A记录，分别是带www和不带的域名，ANSWER填自己的主机地址。 ![](http://paaatrick.com/wordpress/wp-content/uploads/2019/01/Screenshot-2019-01-29-17.50.38.png) 两个NS填DNS提供商的，这里因为Vultr自带了免费的DNS服务，直接填上去即可，具体的DNS地址可在Vultr的设置页里找。 下图就是设置页，可以看到底下有两条DNS地址，填到 Porkbun 里，然后还要在 Vultr 里 Add Domain，绑定服务器到域名。 ![](http://paaatrick.com/wordpress/wp-content/uploads/2019/01/Screenshot-2019-01-29-17.52.20.png) 两边都操作完成后，静候几分钟，然后访问一下自己的域名，应该就出来了。

### **常见问题**

#### **在仪表盘的设置中不小心更改了wordpress地址后回不到后台**

在建站过程中，如果改动了 wordpress地址或站点地址，就回不到后台了。 解决方法：网站首页在wordpress目录下的index.php中的require这行的内容。 下图是wordpress下index.php的require所在行的内容。 ![](http://paaatrick.com/wordpress/wp-content/uploads/2019/01/20180319090603947.png) 最开始wordpress url是： 主机ip/wordpress。 它会自动去找index.php，然后就通过index.php里面的内容加载wordpress环境，更改了url后，就不能自动去找index.php了。此时后台也无法登录。解决这个问题，直接进数据库修改相关数据即可。操作如下。

mysql -u root -p //然后输入密码
show databases; //显示所有数据库
use wordpressdb; //选中你自己网站对应的数据库。
show tables; //显示该数据库所有表格。
select * from wp_options where 1=1 limit 10; //查看数据库前10条记录
update wp\_options set option\_value='http://服务器ip（或域名）/wordpress' where option_name='siteurl';

（如果home也改了就也改回来）
update wp\_options set option\_value='http://服务器ip（或域名）/wordpress' where option_name='home';

其实就是改变了wordpress url ，则wp_options表中的siteurl的值变化了，只要把它在修改过来就行。

#### **使用服务器IP（或域名）根地址直接访问网站首页**

此文章的建站方法是把所有东西都放在wordpress目录下，因此建完后，访问网站的网址为：主机IP/wordpresss。通常情况下，我们会买一个域名与云主机IP绑定，输入IP地址只能访问根目录。 即/var/www/html，但是无法访问其下面的子目录。以下将给出解决方案。如果使主机IP直接定位到网站首页。第一种解决方式是把wordpress的内容直接都弄到根目录中，这是不提倡的，会使根目录变得杂乱。通常推荐第二种方案。   第二种方案操作如下： 登录后台，打开 设置→常规，修改站点地址。 WordPress地址是本体存放的地址，按本文安装的话就不用改动了。 站点地址是浏览器访问的地址，改为 “http://服务器IP（或域名）” 的形式，如下图即可。 ![](http://paaatrick.com/wordpress/wp-content/uploads/2019/01/Screenshot-2019-01-31-15.26.26.png) 同时，打开 设置→固定链接，把固定链接修改成如下形式：（去掉中间的/wordpress/） ![](http://paaatrick.com/wordpress/wp-content/uploads/2019/01/Screenshot-2019-01-29-17.14.42.png) 至于文章后缀名，网上有关WordPress永久链接设置的介绍众多，普遍认为 `/%postname%.html` 是最佳的自定义永久链接形式。这种形式将显示为:http://你的域名/日志标题.html，简单明了，有利于SEO。但当你的日志标题是中文时，文章标题以中文形式出现，看上去很不符合标准，或者可能会出现如:%64%b3%e8%ae%ar%e6%ba%a7%e5%9.html 类似乱码的显示。因此需要在编辑文章时，标题下面固定链接项，点击编辑，用拼音或英文输入文章标题。 ![](http://paaatrick.com/wordpress/wp-content/uploads/2019/01/Screenshot-2019-01-29-17.19.42.png)   然后把wordpress目录下的index.php 和 .htaccess文件复制一份到根目录下，.htaccess 是隐藏文件，可以使用ls -all。将其显示出来。注意是复制文件，原来目录下还存在。

cd /var/www/html/wordpress/
cp index.php /var/www/html/
cp .htaccess /var/www/html/

  然后使用vim修改.htaccess文件的内容为下图所示。（默认文件如果就是如此则跳过该步骤） ![](http://paaatrick.com/wordpress/wp-content/uploads/2019/01/20180319093058967.png) 修改index.php文件，因为index.php文件是wordpress下index.php的复制品，因此文件内部的require那一行的值当对于当前目录，是不正确的。同样使用vim编辑该文件，把require那一行路径，修改成下图那样。 ![](http://paaatrick.com/wordpress/wp-content/uploads/2019/01/20180319093423845.png) 此时再输入IP，看到还是It works界面，那是因为安装apache时，我们看到的It works界面其实是根目录下的index.html。当index.html 和 index.php同时存在时，默认还是打开index.html，所以应该把index.html移出该目录。我们把它移出到其他目录就行。  

#### **然后可能会产生下一个问题，设置固定链接后，文章页会404**

解决方法如下：

sudo vi /etc/apache2/apache2.conf

把 AllowOverride None 改为 AllowOverride ALL ![](http://paaatrick.com/wordpress/wp-content/uploads/2019/01/20170922122312719.png)![](http://paaatrick.com/wordpress/wp-content/uploads/2019/01/20170922122320129.png) 注意有两处要改，然后操作一下

sudo a2enmod rewrite
sudo /etc/init.d/apache2 restar

刷新一下应该就能正常打开文章了。

### **主页样式修改**

![](http://paaatrick.com/wordpress/wp-content/uploads/2019/01/20170413090347184.jpeg) ![](http://paaatrick.com/wordpress/wp-content/uploads/2019/01/20170413090322305.png) 页尾和功能模块里的链接如果觉得碍眼，可以去除。  

#### **删除页尾“自豪地使用WordPress”字样**

![](http://paaatrick.com/wordpress/wp-content/uploads/2019/01/Screenshot-2019-01-29-18.12.11.png)![](http://paaatrick.com/wordpress/wp-content/uploads/2019/01/Screenshot-2019-01-29-18.15.07.png)   如果是通过函数生成页尾的主题，一般在模板函数那里修改，查找 "Proudly powered by" 的字样删掉就ok。

<a href=“<?php echo esc\_url( \_\_( ‘http://wordpress.org/’, ‘twentyeleven’ ) ); ?>” title=“<?php esc\_attr\_e(‘SemanticPersonalPublishing Platform’, ‘twentyeleven’ ); ?>” rel=“generator”><?php printf( __( ‘Proudly powered by%s’,‘twentyeleven’ ), ‘WordPress’ ); ?></a>

#### **删除功能小工具里的“文章RSS”、“评论RSS”、“WordPress.org”**

打开组件文件夹：wp-include/widgets/class-wp-widget-meta.php 找到代码段删除即可。

<!\-\- 屏蔽 RSS 功能
<li><a href="<?php echo esc\_url( get\_bloginfo( 'rss2\_url' ) ); ?>"><?php \_e('Entries <abbr title="Really Simple Syndication">RSS</abbr>'); ?></a></li>
<li><a href="<?php echo esc\_url( get\_bloginfo( 'comments\_rss2\_url' ) ); ?>"><?php _e('Comments <abbr title="Really Simple Syndication">RSS</abbr>'); ?></a></li>
-->