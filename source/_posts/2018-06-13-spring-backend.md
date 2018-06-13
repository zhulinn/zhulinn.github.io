---
title: Spring数据处理
toc: true
date: 2018-06-13 09:40:49
categories: Java web
tags: Spring
---

## Spring数据访问
服务对象通过接口访问Repository实现，实现松耦合。
Spring JDBC提供与平台无关的统一持久化异常。
采用模板方法模式，将数据访问过程划分为模板和回调。模板管理过程中固定的部
分，而回调处理自定义的数据访问代码。针对不同持久化平台，Spring提供多个可选模板。
![](../../uploads/post_pics/spring/template.png)

## http://m.jd.id/redis/switch?redisKey=abtest.issue.switch&value=false