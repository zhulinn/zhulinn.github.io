---
title: Spring基础
categories: Java Web
tags:
  - Spring
date: 2018-04-18 20:40:37
toc: true
---



# Dependency Injection
Spring offers a container, often referrd to as the *Spring application context*, that creates and manages application components. These components, or *beans*, are wired together inside of the Spring application context to make a complete application.
The act of wiring beans together is based on a pattern known as **dependency injection**. 

![IoC](https://raw.githubusercontent.com/zhulinn/zhulinn.github.io/hexo/source/uploads/post_pics/IoC.png)

<!-- more -->

**IoC** stands for "Inversion of Control".It will act as manager.
IoC container creates HelloWorldService object and then pass the object HelloWorld into HelloWorldService through setter. The IoC container is doing is "*dependency injection*"  into HelloWorldService. The dependence here means that the dependence between objects: HelloWorldService and HelloWorld. 
So, what is **IoC**?
>In case that an object is created from a class traditionally, its fields have value assigned inside the class. Reversely, for Spring, <font color=red>its objects and fields have value injected from the outside by an object called as IoC. </font>

![IoC-Container1](https://raw.githubusercontent.com/zhulinn/zhulinn.github.io/hexo/source/uploads/post_pics/IoC-Container1.png)
![IoC-Container2](https://raw.githubusercontent.com/zhulinn/zhulinn.github.io/hexo/source/uploads/post_pics/IoC-Container2.png)
IoC Container is a container containing all Spring BEANs used in the application.



# Spring Bean
Any object initialized through Spring container.

## Bean Scopes
1. singleton - Only one instance of the bean.
2. prototype - A new instance will be created every time the bean is requested.
3. request - Same as prototype, used for web applications. For each HTTP request. 
4. session - For each HTTP session.

`@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)` or `@Scope("prototype")`
`<bean scope="prototype">`
注意session的bean注入singleton的bean时，例如购物车与商店，需要注入作用域代理对象。`@Scope(proxyMode=ScopedProxyMode.INTERFACES)`，<bean aop:scoped-proxy proxy-target-class="false">
ScopedProxyMode.INTERFACES创建基于接口的代理，
ScopedProxyMode.TARGET_CLASS生成基于类的代理。



## Bean Configuration
1.**XML Based Configuration** 

```xml
<beans>
	
	<context:component-scan base-package="com.journaldev.spring" />
	
	<bean id="innerBean" class="beans.InnerBean " scope="singleton" />
	
	<bean id="outBean" class="beans.OutBean">
	    <constructor-arg ref="innerBean">
	    <constructor-arg value="literal text">
	    <property name="name" value="Jack">
	</bean>
	
</beans>
```
2. Annotation Based Configuration - `@Service` or `@Component`, `@Scope` + `@ComponentScan`
 隐式的bean发现机制和自动装配 
    - 组件扫描(component scanning) `@ComponentScan` or `<context:component-scand>`
    - 自动装配(autowiring) `@Autowired`
	
 Automatic configuration has its roots in a Spring technique known as **auto-wiring** and another technique known as **component-scanning**. 
```java
package com.journaldev.spring.beans;

@Service
@Scope(WebApplicationContext.SCOPE_REQUEST)
public class MyAnnotatedBean {

	private int empId;

	public int getEmpId() {
		return empId;
	}

	public void setEmpId(int empId) {
		this.empId = empId;
	}
	
}
```

```java
@Controller
@Scope("request")
public class HomeController {
	@Autowired
	public void setMyAnnotatedBean(MyAnnotatedBean obj) {
		this.myAnnotatedBean = obj;
	}
	
}
```
3. Java Based Configuration  -  `@Configuration`,  `@Bean`

```java
package com.journaldev.spring.main;

import java.util.Date;

public class MyService {

	public void log(String msg){
		System.out.println(new Date()+"::"+msg);
	}
}
```

```java
package com.journaldev.spring.main;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MyConfiguration {

	@Bean
	public MyService getService(){
		return new MyService();
	}
}
```

The `@Configuration` annotation indicates to Spring that this class is a configuration class which will provide beans to the Spring application context.

* JavaConfig引用配置
导入JavaConfig：`@Import(Config.class)`
导入XML配置：`@ImportResource("classpath:config.xml")`
* XML引用配置
导入JavaConfig(以bean的形式)：`<bean class="package.Config">`
导入XML配置：`<import resource="config.xml" />`



# Advanced Bean Configuration
## Profiles
配置profile bean
1. `@Profiles("dev")`
2. `<beans profile="dev">` ，`<beans>`元素可嵌套

激活profile
设置`spring.profiles.active`(优先)和`spring.profiles.default`属性，有以下方式：
1. DispatcherServlet初始化参数
2. Web上下文参数
3. 环境变量
4. JVM系统属性
5. 集成测试，`@ActiveProfiles("dev")`

## @Conditional
`@Conditional(Condition.class)`

```java
public interface Condition {
    boolean matches(ConditionContext ctext, AnnotatedTypeMetadata, metadata);
}
```

## 自动装配歧义性
1. `@Primary` or `<bean primary="true">`
2. `@Qualifier("id")

## 运行时值注入
### @PropertySource和Environment

```java
@Configuration
@PropertySource("classpath:app.properties")  //属性源
public class  Config {
    
    @Autowired
    Environment env;
    
    @Bean
    public BlankDisc disc() {
        return new BlankDisc(env.getProperty("disc.title"));    //属性值
    }
}
```
### 属性占位符
`${...}` 和 JavaConfig 使用`@Value("${...}")`注解。
配置属性源`PropertySourcesPlaceholderConfigurer` bean，或 `<context:propertyplaceholder />`

### SpEL
`#{...}`

 - 使用bean的ID来引用bean； 
 - 调用方法和访问对象的属性； 
 - 对值进行算术、关系和逻辑运算； 
 - 正则表达式匹配； 
 - 集合操作。

`T(...)`表达式视作Java对应类型
`?.` 非null
`?: "1"` null时为1
`songs.?[ condition]` 计算集合中符合condition的子集
`.^[]`第一个匹配项
`.$[]`最后一个匹配项
`songs.![title]` 投影title集合



# 切面

![](../../uploads/post_pics/spring/AOP.png)
## 术语

**通知Advice**
切面的工作称为通知Advice，通知定义切面是"什么"以及"何时"使用。5种类型通知：

- @Before
- @After
- @After-returning
- @After-throwing
- @Around

**连接点Join point**
连接点是在应用执行过程中能够插入切面的一个点。

**切点Poincut**
切点就定义了切面的"何处"，匹配一个或多个连接点。

**切面Aspect**
切面是通知和切点的结合。通知和切点共同定义了切面的全部内容。@Aspect

**引入Introduction**
引入允许我们向现有的类添加新方法或属性。

**织入Weaving**
织入是把切面应用到目标对象并创建新的代理对象的过程。切面在指定的连接点被织入到目
标对象中。按目标对象的不同生命周期进行织入：

- 编译期
- 类加载期
- 运行期：Spring AOP

## 创建切面

**启动自动代理**： `@EnableAspectJAutoProxy` or `<aop:aspectj-autoproxy>`

**定义切面**
```java
@Aspect
public class Audience {

    @Before("execution(* me.zhulin.HomeController.hello(...))")
    public void dressup() {
        // do something
    }
    
    @Poincut("execution(* me.zhulin.HomeController.hello(...))")
    public void hello() {}  //标识
    
    @Before("hello()")
    public void dressup() {
        // do something
    }
    
    @Around("hello()") 
    public void talk(ProceedingJoinPoint jp){
        // Before 
        
        jp.proceed();
        
        //After 
    }
}
```

```xml
<aop:config>
    <aop:aspect ref="audience">  //引用 audience Bean
        <aop:pointcut
            id="performance"
            expression="execution(** concert.Performance.perform(..))"/>  //定义切点
        <aop:before
            pointcut-ref="performance"    //引用切点
            method="silenceCellPhones"/>            
            
        <aop:before
            pointcut="excution(** concert.Performance.perform(..))"
            method="silenceCellPhones"/>
    </aop:apsect>
</aop:config>
```

**带参通知**
`args(count)`表明传递给`hello()`方法的int类型参数也会传递到通知中去。参数的名称count也与切点方法签名中的参数相匹配。

```java
@Aspect
public class Counter {
    private int count = 0;
    @Poincut("execution(* me.zhulin.HomeController.hello(int)) and args(count)")
    public void sayHi(int count) {}  //标识
    
    
    @Before("sayHi(count)")
    public void dressup(int count) {
        this.count += count;
    }    
}
```

## 引入新功能
```java
@Aspect
public class EncoreableIntroducer {
    @DeclareParents(value="concert.Performance+", defaultImpl=DefaultEncoreable.class)
    public static Encoreable encoreable;   //将Encoreable接口织入Performance bean中
}
```

```xml
    <aop:aspect>
        <aop:declare-parents
            types-matching="concert.Performance+"  //父类
            implement-interface="concert.Encoreable"  //新增接口
            default-impl="concert.DefaultEncorable"/>  //全限定实现类名
        或  delegate-ref="encoreableDelegate"/>  //Bean    
    </aop:apsect>
```
`@DeclareParents`
- value指定哪种类型bean需要引入该接口。`+`表明所以子类型
- defaultImpl属性指定了为引入功能提供实现的类。
- @DeclareParents注解所标注的静态属性指明了要引入了接口。

之后，将切面声明为bean。当Spring发现一个bean使用了@Aspect注解时，Spring就会创建一个代理，将调用委托给被代理的bean或被引入的实现。

