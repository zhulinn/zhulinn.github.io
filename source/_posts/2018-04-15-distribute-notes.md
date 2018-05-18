---
title: 分布式基础知识
categories: 分布式
tags:
  - 面试
date: 2018-04-15 23:57:27
---


**Refefence:**[Interview-Notebook](https://github.com/CyC2018/Interview-Notebook)

# 负载均衡的算法与实现
## 算法
1. 轮询
轮询算法把每个请求轮流发送到每个服务器上。该算法比较适合每个服务器的性能差不多的场景。
![](https://raw.githubusercontent.com/CyC2018/Interview-Notebook/master/pics/2766d04f-7dad-42e4-99d1-60682c9d5c61.jpg)
<!-- more -->
2. 加权轮询
加权轮询是在轮询的基础上，根据服务器的性能差异，为服务器赋予一定的权值。
![](https://raw.githubusercontent.com/CyC2018/Interview-Notebook/master/pics/211c60d4-75ca-4acd-8a4f-171458ed58b4.jpg)
3. 最少连接
最少连接算法就是将请求发送给当前最少连接数的服务器上。
4. 加权最小连接
在最小连接的基础上，根据服务器的性能为每台服务器分配权重，根据权重计算出每台服务器能处理的连接数。
5. 随机算法
把请求随机发送到服务器上。该算法比较适合服务器性能差不多的场景。

## 实现
1. HTTP重定向
负载均衡服务器收到 HTTP 请求之后会返回服务器的地址，并将该地址写入 HTTP 重定向响应中返回给浏览器，浏览器收到后需要再次发送请求。

缺点：
* 用户访问的延迟会增加；
* 如果负载均衡器宕机，就无法访问该站点。

2. DNS 重定向
使用 DNS 作为负载均衡器，根据负载情况返回不同服务器的 IP 地址。大型网站基本使用了这种方式做为第一级负载均衡手段，然后在内部使用其它方式做第二级负载均衡。

缺点：
* DNS 查找表可能会被客户端缓存起来，那么之后的所有请求都会被重定向到同一个服务器。

3. 修改 MAC 地址
使用 LVS（Linux Virtual Server）这种链路层负载均衡器，根据负载情况修改请求的 MAC 地址。

4. 修改 IP 地址
在网络层修改请求的目的 IP 地址。

# 分布式锁
Java 提供了两种内置的锁的实现，一种是由 JVM 实现的 synchronized 和 JDK 提供的 Lock，当你的应用是单机或者说单进程应用时，可以使用 synchronized 或 Lock 来实现锁。当应用涉及到多机、多进程共同完成时，那么这时候就需要一个全局锁来实现多个进程之间的同步。
## 实现
1. 数据库分布式锁
2. Redis分布式锁

# 分布式Session
1. Sticky Sessions
需要配置负载均衡器，使得一个用户的所有请求都路由到一个服务器节点上，这样就可以把用户的 Session 存放在该服务器节点中。
缺点：当服务器节点宕机时，将丢失该服务器节点上的所有 Session。
![](https://github.com/CyC2018/Interview-Notebook/raw/master/pics/MultiNode-StickySessions.jpg)


2. Session Replication
在服务器节点之间进行 Session 同步操作，这样的话用户可以访问任何一个服务器节点。
缺点：需要更好的服务器硬件条件；需要对服务器进行配置。
![](https://github.com/CyC2018/Interview-Notebook/raw/master/pics/MultiNode-SessionReplication.jpg)

3. Persistent DataStore
将 Session 信息持久化到一个数据库中。
缺点：有可能需要去实现存取 Session 的代码。
![](https://github.com/CyC2018/Interview-Notebook/raw/master/pics/MultiNode-SpringSession.jpg)

4. In-Memory DataStore
可以使用 Redis 和 Memcached 这种内存型数据库对 Session 进行存储，可以大大提高 Session 的读写效率。内存型数据库同样可以持久化数据到磁盘中来保证数据的安全性。
# CDN架构
![CDN](https://raw.githubusercontent.com/CyC2018/Interview-Notebook/master/pics/dbd60b1f-b700-4da6-a993-62578e892333.jpg)

