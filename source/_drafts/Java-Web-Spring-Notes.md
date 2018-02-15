---
title: Java Web Spring Notes
categories: Java Web
tags:
- Spring
---

# Dependency Injection
1. Service components should be designed with base class or interface. It’s better to prefer interfaces or abstract classes that would define contract for the services.
2. Consumer classes should be written in terms of service interface.
3. Injector classes that will initialize the services and then the consumer classes.

* Cusumer class is annotated by `@Component`
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