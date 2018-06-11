---
title: Network基础知识
categories: Network
toc: true
tags:
  - 面试
date: 2018-04-19 16:16:02
---


**Refefence:**[Interview-Notebook](https://github.com/CyC2018/Interview-Notebook)

# 主机之间的通信方式
1. 客户-服务器（C/S）

* 传输控制协议 TCP（Transmission Control Protocol） 是面向连接的，提供可靠交付，有流量控制，拥塞控制，提供全双工通信，面向字节流（把应用层传下来的报文看成字节流，把字节流组织成大小不等的数据块）
客户是服务的请求方，服务器是服务的提供方。

2. 对等（P2P）

不区分客户和服务器。
<!-- more -->
# 五层体系结构
1. 应用层：FTP/SMTP，报文
2. 运输层：TCP/UDP，报文段/数据报
3. 网络层：IP，分组
4. 数据链数层：帧，
5. 物理层

# UDP 和 TCP 的特点
* 用户数据包协议 UDP（User Datagram Protocol）是无连接的，尽最大可能交付，没有拥塞控制，面向**报文**（对于应用程序传下来的报文不合并也不拆分，只是添加 UDP 首部）。
* 传输控制协议 TCP（Transmission Control Protocol） 是面向连接的，提供可靠交付，有流量控制，拥塞控制，提供全双工通信，面向**字节流**（把应用层传下来的报文看成字节流，把字节流组织成大小不等的数据块）

# TCP三次握手
![3](https://raw.githubusercontent.com/zhulinn/zhulinn.github.io/hexo/source/uploads/post_pics/TCP3.png)

# TCP四次挥手
![4](https://raw.githubusercontent.com/zhulinn/zhulinn.github.io/hexo/source/uploads/post_pics/TCP4.jpg)
### TIME_WAIT
1. 确保最后一个确认报文段能够到达。如果 B 没收到 A 发送来的确认报文段，那么就会重新发送连接释放请求报文段，A 等待一段时间就是为了处理这种情况的发生。
2. 可能存在“已失效的连接请求报文段”，为了防止这种报文段出现在本次连接之外，需要等待一段时间。

# HTTP请求页面
1. 三次握手建立连接。
2. 生成80端口的TCP SYN报文段(套接字socket)，发送给HTTP服务器
3. HTTP返回TCP SYNACK
4. 建立连接后，发送HTPP GET报文
5. HTTP服务器从TCP套接字读取HTTP GET报文，生成HTTP响应报文，将Web页面内容放入报文主题，返回
6. 收到HTTP响应报文，提取Web页面内容，渲染显示

# 请求与响应报文
* 请求报文
![req](https://raw.githubusercontent.com/zhulinn/zhulinn.github.io/hexo/source/uploads/post_pics/HTTP_ResponseMessageExample.png)
* 响应报文
![res](https://raw.githubusercontent.com/zhulinn/zhulinn.github.io/hexo/source/uploads/post_pics/HTTP_RequestMessageExample.png)

# HTTP 状态码

服务器返回的  **响应报文**  中第一行为状态行，包含了状态码以及原因短语，用来告知客户端请求的结果。

| 状态码 | 类别 | 原因短语 |
| --- | --- | --- |
| 1XX | Informational（信息性状态码） | 接收的请求正在处理 |
| 2XX | Success（成功状态码） | 请求正常处理完毕 |
| 3XX | Redirection（重定向状态码） | 需要进行附加操作以完成请求 |
| 4XX | Client Error（客户端错误状态码） | 服务器无法处理请求 |
| 5XX | Server Error（服务器错误状态码） | 服务器处理请求出错 |