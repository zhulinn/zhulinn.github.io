---
layout: '[post]'
title: JVM知识点
toc: true
categories: Java SE
tags:
  - JVM
date: 2018-03-02 22:42:14
---



<!-- https://raw.githubusercontent.com/zhulinn/zhulinn.github.io/hexo/source/uploads/post_pics/XXX.png -->

> Reference: [纯洁的微笑](http://www.ityouknow.com/java/2017/03/01/jvm-overview.html)

# 类的加载
## 类加载的定义
将类的`.class`文件中的二进制数据读入到内存中，将其放在运行时数据取的**方法区**内，然后在**堆区**创建`java.lang.Class`对象，封装方法区内的数据结构。Class对象**封装**方法区的数据结构，提供访问方法区的数据结构的**接口**。
<!-- more -->
## 类加载的过程
![](https://raw.githubusercontent.com/zhulinn/zhulinn.github.io/hexo/source/uploads/post_pics/class-loading.png)
1. 加载，查找并加载类的二进制数据，在Java堆中也创建一个java.lang.Class类的对象
2. 连接，连接又包含三块内容：验证、准备、初始化。
   - 验证，文件格式、元数据、字节码、符号引用验证；
   - 准备，为类的静态变量分配内存，并将其初始化为默认值；
   - 解析，把类中的符号引用转换为直接引用（内存地址）
3. 初始化，为类的静态变量赋予正确的初始值
4. 使用，new出对象程序中使用
5. 卸载，执行垃圾回收

## 类加载器
![](https://raw.githubusercontent.com/zhulinn/zhulinn.github.io/hexo/source/uploads/post_pics/classloader.png)

## 加载机制
* 全盘负责，当一个类加载器负责加载某个Class时，该Class所依赖的和引用的其他Class也将由该类加载器负责载入，除非显示使用另外一个类加载器来载入
* 父类委托，先让父类加载器试图加载该类，只有在父类加载器无法加载该类时才尝试从自己的类路径中加载该类。解决类加载的统一性问题，保证了基类都由相同的类加载器加载。
* 缓存机制，缓存机制将会保证所有加载过的Class都会被缓存，当程序中需要使用某个Class时，类加载器先从缓存区寻找该Class，只有缓存区不存在，系统才会读取该类对应的二进制数据，并将其转换成Class对象，存入缓存区。这就是为什么修改了Class后，必须重启JVM，程序的修改才会生效


**对象分配规则**
* 对象优先分配在Eden区，如果Eden区没有足够的空间时，虚拟机执行一次Minor GC。
* 大对象直接进入老年代（大对象是指需要大量连续内存空间的对象）。这样做的目的是避免在Eden区和两个Survivor区之间发生大量的内存拷贝（新生代采用复制算法收集内存）。
* 长期存活的对象进入老年代。虚拟机为每个对象定义了一个年龄计数器，如果对象经过了1次Minor GC那么对象会进入Survivor区，之后每经过一次Minor GC那么对象的年龄加1，知道达到阀值对象进入老年区。
* 动态判断对象的年龄。如果Survivor区中相同年龄的所有对象大小的总和大于Survivor空间的一半，年龄大于或等于该年龄的对象可以直接进入老年代。
* 空间分配担保。每次进行Minor GC时，JVM会计算Survivor区移至老年区的对象的平均大小，如果这个值大于老年区的剩余值大小则进行一次Full GC，如果小于检查HandlePromotionFailure设置，如果true则只进行Monitor GC,如果false则进行Full GC。 


# JVM内存模型
Java运行时(Java runtime)内存模型。五大区：方法区、堆区、虚拟机栈、本地方法栈、程序计数器。
![](https://raw.githubusercontent.com/zhulinn/zhulinn.github.io/hexo/source/uploads/post_pics/JMM.png)
程序计数器：线程私有，保存当前线程执行的虚拟机字节码指令的内存地址。多线程切换后，恢复原先状态，找到原先执行的指令。
虚拟机栈：线程私有，包含多个栈帧，存储方法数据和部分过程结果的数据结构。方法的调用到返回结果，对应一个栈帧的入栈到出栈。
本地方法栈：同虚拟机栈，适用于Native方法。
方法区：存储类结构信息的地方，包括常量池，静态变量，构造函数等，类型信息由类加载器在加载时从类文件提取出来。
堆：存储java实例或对象的地方，GC的主要区域。堆内存是JVM中最大的一块由**年轻代**和**老年代**组成，而年轻代内存又被分成三部分，**Eden空间**、**From Survivor空间**、**To Survivor空间**。

# GC算法
## 存活判断
1. 引用计数：无法解决对象相互循环引用
2. 可达性分析：从GC Roots向下搜索，搜索所走过的路径称为引用链。当一个对象到GC Roots没有任何引用链相连时，则证明此对象是不可用的，不可达对象。

## 算法
* 引用计数法(Reference Counting)
无法处理循环引用：A->B,B->A。Java没有
* 标记-清除算法 (Mark-Sweep)
未标记对象为垃圾对象，清除所有未被标记的对象。问题：存在大量空间碎片。
* 复制算法 (Copying)
内存空间分为两块，每次只是用一块，垃圾回收时，复制存活对象到另一块，清除所有。问题：内存折半。
* 标记-压缩算法 (Mark-Compact)
标记，压缩再清理。
* 增量算法 (Incremental Collecting)
解决垃圾回收长时间的线程阻塞，让垃圾收集线程和应用程序线程交替执行。问题：线程切换和上下文转换的消耗。
* 分代 (Generational Collecting)
年轻代：复制算法；老生代：标记-压缩算法

## 类型
串行/并行 ，按线程数分
并发式/独占式，按工作模式分，并发交替工作
压缩式/非压缩式
新生代/老年代

## 分类
新生：
* Serial新生代串行收集器：独占式。复制算法，没有线程切换开销，适合单CPU,小内存。
* ParNew并行收集器：Serial多线程版，适合并行CPU
* Parallel Scavenge新生代回收收集器：相比并行收集器，注重吞吐量，自适应调节
老生:
* Serial Old老年代串行收集器：独占式。标记-压缩算法
* Parallel Old老年代并行回收收集器：多线程版，关注吞吐量
* CMS收集器：并发式Concurrent Mark Sweep，标记-清除算法。关注于系统停顿时间
* G1收集器：服务器的，标记-压缩算法
![gc](https://raw.githubusercontent.com/zhulinn/zhulinn.github.io/hexo/source/uploads/post_pics/GC.PNG)
