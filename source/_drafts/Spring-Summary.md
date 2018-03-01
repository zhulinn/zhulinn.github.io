---
title: Java面试题总结
categories:
tags:
---
<!--https://raw.githubusercontent.com/zhulinn/zhulinn.github.io/hexo/source/uploads/post_pics/WAR-directory-structure.png-->

# 面向对象
面向对象的本质就是将现实世界描绘成一系列完全自治、封闭的对象。
* **抽象**：抽象是将一类对象的共同特征总结出来构造类的过程，包括**数据抽象**和**行为抽象**两方面。抽象只关注对象有哪些属性和行为，并不关注这些行为的细节是什么。
* **继承**：继承是从已有类得到继承信息创建新类的过程。
<!-- more -->
* **封装**：封装是把数据和操作数据的方法绑定起来，对数据的访问只能通过已定义的接口。我们在类中编写的方法就是对实现细节的一种封装；我们编写一个类就是对数据和数据操作的封装。封装就是隐藏一切可隐藏的东西，只向外界提供最简单的**编程接口**。
* **多态性**：对外一个接口，内部多种实现。用同样的对象引用调用同样的方法但是做了不同的事情。多态性分为编译时的多态性和运行时的多态性。方法重载（overload）实现的是编译时的多态性（也称为前绑定），而方法重写（override）实现的是运行时的多态性（也称为后绑定）。

# 线程
1. 概念
线程是操作系统能够进行运算调度的最小单位，它被包含在进程之中，是进程中的实际运作单位。

2. 线程 vs 进程
一进程，多个线程。不同的进程使用不同的内存空间，而所有的线程共享一片相同的内存空间。

3. 实现
调用Runable接口重写run()或者继承Thread类。

4. Thread类中start()和run()区别
start()启动**新创建**的线程，内部调用run()方法。run()在原来的线程中调用。

5. Runnable和Callable
Callable的call()方法可以返回值和抛出异常，返回装载有计算结果的Future对象。

6. CountDownLatch
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
	thread1.start();
	thread2.start();
	countDownLatch.await();  // 主线程阻塞 等待其他线程，直到N减为0
}
```
{% endfold %}

7. CyclicBarrier
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

8. 原子性
简单的读取、赋值(数字直接赋值)才是原子操作。变量之间赋值含有读取变量的操作。getAndIncrement()
```java
//原子性
x = 1;
//非原子性
y = x;
x++;
x= x + 1;
```
9. volatile
成员变量使用。保证可见性。一个线程修改了这个变量的值，其他线程能够立即看得到修改的值。保证写操作发生在后续读操作之前，不能保证原子性，如`c++；`。修改值会立即被更新到主存，读取时，访问内存。普通会放在高速缓存。

10. Hashtable
不允许null。对所有方法synchronized。

11. ConcurrentHashMap
* JDK1.5使用segment分段锁。当一个线程占用一把锁（segment）访问其中一段数据的时候，其他段的数据也能被其它的线程访问，默认分配16个segment。默认比Hashtable效率提高16倍。
* JDK1.8采用CAS和synchronized来保证并发安全。数据结构跟HashMap1.8的结构一样，数组+链表/红黑二叉树。synchronized只锁定当前链表或红黑二叉树的**首节点**，这样只要hash不冲突，就不会产生并发，效率又提升N倍

12. wait() 和 sleep()
wait()等待条件为真且其它线程被唤醒时它会释放锁，sleep()方法仅仅释放CPU资源但不会释放锁。
# 内存中Stack，Heap和Static area用法
* 栈Stack：基本数据类型变量，对象的引用，函数调用的现场保存
* 堆Heap：通过new、构造器创建的对象
* 静态区Static Area：常量， 字面量(literal)，如100，“hello”

