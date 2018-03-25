---
title: Network基础知识
categories: Network
tags:
- 面试
---

---
title: Network基础知识
categories: Network
tags:
- 面试
---

# 主机之间的通信方式
1. 客户-服务器（C/S）

* 传输控制协议 TCP（Transmission Control Protocol） 是面向连接的，提供可靠交付，有流量控制，拥塞控制，提供全双工通信，面向字节流（把应用层传下来的报文看成字节流，把字节流组织成大小不等的数据块）
客户是服务的请求方，服务器是服务的提供方。

2. 对等（P2P）

不区分客户和服务器。


# UDP 和 TCP 的特点
* 用户数据包协议 UDP（User Datagram Protocol）是无连接的，尽最大可能交付，没有拥塞控制，面向报文（对于应用程序传下来的报文不合并也不拆分，只是添加 UDP 首部）。
