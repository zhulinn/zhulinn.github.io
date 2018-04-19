---
title: Java Web Spring Notes
categories: Java Web
tags:
  - Spring
date: 2018-04-18 20:40:37
---



# Dependency Injection
Spring offers a container, often referrd to as the *Spring application context*, that creates and manages application components. These components, or *beans*, are wired together inside of the Spring application context to make a complete application.
The act of wiring beans together is based on a pattern known as **dependency injection**. 

# Spring Bean
Any object initialized through Spring container.
## Bean Scopes
1. singleton - Only one instance of the bean.
2. prototype - A new instance will be created every time the bean is requested.
3. request - Same as prototype, used for web applications. For each HTTP request. 
4. session - For each HTTP session.
5. global-session - Create global session beans for Portlet applications.

## Bean Configuration
1. **XML Based Configuration** 
```xml
<beans:beans>
	
	<context:component-scan base-package="com.journaldev.spring" />
	
	<beans:bean name="myBean" class=" com.journaldev.spring.beans.MyBean " scope="singleton" ></beans:bean>
	
</beans:beans>
```
2. **Annotation Based Configuration** - @Service or @Component, @Scope
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
3. **Java Based Configuration** -  @Configuration, @ComponentScan and @Bean
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
@ComponentScan(value="com.journaldev.spring.main")
public class MyConfiguration {

	@Bean
	public MyService getService(){
		return new MyService();
	}
}
```


3. 隐式的bean发现机制和自动装配
    - 组件扫描(component scanning)
    - 自动装配(autowiring)



The `@Configuration` annotation indicates to Spring that this class is a configuration class which will provide beans to the Spring application context.

Automatic configuration has its roots in a Spring technique known as **auto-wiring** and another technique known as **component-scanning**. 



1. Service components should be designed with base class or interface. It’s better to prefer interfaces or abstract classes that would define contract for the services.
2. Consumer classes should be written in terms of service interface.
3. Injector classes that will initialize the services and then the consumer classes.

* Cusumer class is annotated by `@Component`, `@Controller`, `Service`, `Repository`.
* `@Autowired` annotation is used to let Spring know that autowiring is required. 
* Injector class: `@Configuration`. `@ComponentScan` is used with `@Configuration` to specify the packages to look for Component classes. `@Bean` annotation is used to let Spring framework know that this method should be used to get the bean implementation to inject in Component classes.


# IoC
IoC stands for "Inversion of Control".It will act as manager.
![IoC](https://raw.githubusercontent.com/zhulinn/zhulinn.github.io/hexo/source/uploads/post_pics/IoC.png)
<!-- more -->
IoC container creates HelloWorldService object and then pass the object HelloWorld into HelloWorldService through setter. The IoC container is doing is "*dependency injection*"  into HelloWorldService. The dependence here means that the dependence between objects: HelloWorldService and HelloWorld. 
So, what is **IoC**?
>In case that an object is created from a class traditionally, its fields have value assigned inside the class. Reversely, for Spring, <font color=red>its objects and fields have value injected from the outside by an object called as IoC. </font>

![IoC-Container1](https://raw.githubusercontent.com/zhulinn/zhulinn.github.io/hexo/source/uploads/post_pics/IoC-Container1.png)
![IoC-Container2](https://raw.githubusercontent.com/zhulinn/zhulinn.github.io/hexo/source/uploads/post_pics/IoC-Container2.png)
IoC Container is a container containing all Spring BEANs used in the application.

<hr>
# Spring Boot
![Spring-Boot](https://raw.githubusercontent.com/zhulinn/zhulinn.github.io/hexo/source/uploads/post_pics/Spring-boot.png)
The @SpringBootApplication annotation is equivalent to using @Configuration, @EnableAutoConfiguration and @ComponentScan with their default attributes.
![springbootapplication](https://raw.githubusercontent.com/zhulinn/zhulinn.github.io/hexo/source/uploads/post_pics/springbootapplication.png)
## The relationship between the Controller and the View
![spring-url](https://raw.githubusercontent.com/zhulinn/zhulinn.github.io/hexo/source/uploads/post_pics/spring-url.png)