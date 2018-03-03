---
title: Java面试题总结
categories:
tags:
---
<!--https://raw.githubusercontent.com/zhulinn/zhulinn.github.io/hexo/source/uploads/post_pics/XXX.png-->

# 面向对象
面向对象的本质就是将现实世界描绘成一系列完全自治、封闭的对象。
* **抽象**：抽象是将一类对象的共同特征总结出来构造类的过程，包括**数据抽象**和**行为抽象**两方面。抽象只关注对象有哪些属性和行为，并不关注这些行为的细节是什么。
* **继承**：继承是从已有类得到继承信息创建新类的过程。
<!-- more -->
* **封装**：封装是把数据和操作数据的方法绑定起来，对数据的访问只能通过已定义的接口。我们在类中编写的方法就是对实现细节的一种封装；我们编写一个类就是对数据和数据操作的封装。封装就是隐藏一切可隐藏的东西，只向外界提供最简单的**编程接口**。
* **多态性**：对外一个接口，内部多种实现。用同样的对象引用调用同样的方法但是做了不同的事情。多态性分为编译时的多态性和运行时的多态性。方法重载（overload）实现的是编译时的多态性（也称为前绑定），而方法重写（override）实现的是运行时的多态性（也称为后绑定）。

# 线程
 概念
线程是操作系统能够进行运算调度的最小单位，它被包含在进程之中，是进程中的实际运作单位。

 线程 vs 进程
一进程，多个线程。不同的进程使用不同的内存空间，而所有的线程共享一片相同的内存空间。

 实现
调用Runable接口重写run()或者继承Thread类。

 Thread类中start()和run()区别
start()启动**新创建**的线程，内部调用run()方法。run()在原来的线程中调用。

 Runnable和Callable
Callable的call()方法可以返回值和抛出异常，返回装载有计算结果的Future对象。

 CountDownLatch
允许一个或多个线程等待其他线程完成操作。无法重用。
{% fold Click %}
```java
private static CountDownLatch countDownLatch = new CountDownLatch(2); // wait for N threads finished

public void run() throws InterruptedException {
	Thread thread1 = new Thread(new Runable() {
			@Override
			public void run() {
				countDownLatch.countDown();  //countDown()
			}
		});
	Thread thread2 = new Thread(new Runable() {
			@Override
			public void run() {
				countDownLatch.countDown();  //countDown()
			}
		});
	threadstart();
	threadstart();
	countDownLatch.await();  // 主线程阻塞 等待其他线程，直到N减为0
}
```
{% endfold %}

 CyclicBarrier
多线程互相等待，到达同一同步点后再一起运行，在其中任意一个线程未达到同步点，其他到达的线程均会被阻塞。通过reset，实现重用。
{% fold Click %}
```java
// 创建拦截线程数为4，当所有线程都达到barrier后执行`this`的run方法
private CyclicBarrier cyclicBarrier = new CyclicBarrier(4, this);  

// 4线程池
private Executor executor = Executors.newFixedThreadPool(4);

// this 当前类 run方法
@Override
public void run() {

}

// 启动4线程 等所有4个线程都达到await
public void calculate() {
	for(int i = 0; i < 4; i++) {
		executor.execute(new Runnable() {
			@Override
			public void run() {
				
				/** Do some staff**/

				cyclicBarrier.await(); //  通知达到Barrier
			}
			})
	}
}
```
{% endfold %}

 原子性
简单的读取、赋值(数字直接赋值)才是原子操作。变量之间赋值含有读取变量的操作。getAndIncrement()
```java
//原子性
x = 1;
//非原子性
y = x;
x++;
x= x + 1;
```
 volatile
成员变量使用。保证可见性。一个线程修改了这个变量的值，其他线程能够立即看得到修改的值。保证写操作发生在后续读操作之前，不能保证原子性，如`c++；`。修改值会立即被更新到主存，读取时，访问内存。普通会放在高速缓存。

 Hashtable
不允许null。对所有方法synchronized。

 ConcurrentHashMap
* JDK5使用segment分段锁。当一个线程占用一把锁（segment）访问其中一段数据的时候，其他段的数据也能被其它的线程访问，默认分配16个segment。默认比Hashtable效率提高16倍。
* JDK8采用CAS和synchronized来保证并发安全。数据结构跟HashMap8的结构一样，数组+链表/红黑二叉树。synchronized只锁定当前链表或红黑二叉树的**首节点**，这样只要hash不冲突，就不会产生并发，效率又提升N倍

 Object的wait() 和 sleep()，Condition接口的await()和signal（）
前者对应synchronized锁，后者对应ReentrantLock(Lock接口)锁
wait()等待条件为真且其它线程被唤醒时它会释放锁，sleep()方法仅仅释放CPU资源但不会释放锁。`wait` can be "woken up" by another thread calling `notify` whereas a `sleep` cannot. `wait` and `notify` must happen in `synchronized` block.


 反射
在运行状态中，对于任意的一个类，都能够知道这个类的所有属性和方法，对任意一个对象都能够通过反射机制调用一个类的任意方法，这种动态获取类信息及动态调用类对象方法的功能称为java的反射机制。
作用： 动态地创建类的实例，将类绑定到现有的对象中，或从现有的对象中获取类型。  应用程序需要在运行时从某个特定的程序集中载入一个特定的类。

 IO和NIO
IO阻塞式，读取数据，程序等待直至读完。
NIO非阻塞式，读取数据，程序继续向下执行。读完数据后通知当前程序（回调）。

 JVM内存模型
Java运行时(Java runtime)内存模型。方法区、堆区、虚拟机栈、本地方法栈、程序计数器。
![](https://raw.githubusercontent.com/zhulinn/zhulinn.github.io/hexo/source/uploads/post_pics/JMM.png)

 内存中Stack，Heap和Static area用法
* 栈Stack：基本数据类型变量，对象的引用，函数调用的现场保存
* 堆Heap：通过new、构造器创建的对象
* 静态区Static Area：常量， 字面量(literal)，如100，“hello”

 StringBuffer vs StringBuilder
都是mutable。StringBuffer的所有方法synchronized，StringBuilder非线程安全。

 线程间通信
* 同步：通过synchronized
* while轮询
* Object#wait/notify机制
* 管道通信

 CopyOnWriteArrayList
读不加锁，写加锁。读写分离，写操作通过创捷底层新副本。适用于读多写少。缺点：占内存；无法保证实时性。

 synchronized, Lock, ReentrantLock
synchronized: 只有执行结束或异常自动释放锁。
Lock接口: 手动释放锁。必须try{}catch{}。可设定等待时间。可在等待时，响应interrupt方法
ReentrantLock: 实现Lock接口。

 可重入锁
可重入锁：synchronized方法内的synchronized方法不必重新申请锁。
公平锁：尽量以请求锁的顺序来获取锁。`new ReentrantLock(true);`ReentrantLock可设置为公平锁(默认非公平).
非公平锁：无法保证锁的获取是按照请求锁的顺序进行的，可能导致某些线程永远得不到锁。如sychroniczed

 TCP三次握手
第一次：请求建立连接，等待服务器确认。
第二次：服务器发送确认。
第三次：客户端确认，开始发送数据。
前两次确保接收方能够听懂发送方的话，并做出正确应答。第三次防止接收方一直等待。


 Socket
连接协议，本地IP，本地端口，远地IP,远地端口。为了区分不同应用程序访问同一TCP端口，使用Socket接口，实现数据传输并发服务。分为三个步骤：服务器监听，客户端请求，连接确认。

 OSI七层模型
![ISO](https://raw.githubusercontent.com/zhulinn/zhulinn.github.io/hexo/source/uploads/post_pics/ISO.png)

 TCP四次分手
第一次：主机1发送，表示没有数据要发送了。
第二次：主机2告诉主机1，同意关闭请求。
第三次：主机2请求关闭连接。
第四次：主机1发送ACK，主机2关闭，主机1没有收到回复则关闭连接。

 Semaphore
内部维护一组虚拟许可，数量由构造函数的参数指定。访问前，使用acquire获得许可，若许可数量为0，阻塞；访问后使用release释放许可。公平性通过检查阻塞队列实现

 AQS
抽象类AbstractQueuedSynchronizer队列同步器。state > 0 获取锁，state = 0 释放锁。通过FIFO同步队列完成资源获取线程的排队工作。所有的锁机制都可以基于同步器定制来实现的。

 ReentrantReadWriter
一个读锁（共享锁），一个写锁（独占锁）。允许多个读线程访问。适用于读多写少

 Executor
![Executor](https://raw.githubusercontent.com/zhulinn/zhulinn.github.io/hexo/source/uploads/post_pics/Executor.png)
Executor接口是Executor框架最基础的部分，定义用于执行Runnable的execute方法。
ExecutorService接口继承Executor接口，execute()执行Runnable任务，submit()执行Callable或Runnable任务，并返回Future结果。
Future接口：判断任务是否完成；中断任务；获取执行结果。
