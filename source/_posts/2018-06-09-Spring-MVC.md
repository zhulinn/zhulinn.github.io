---
title: Spring MVC
date: 2018-06-09 11:53:50
toc: true
categories: Java Web
tags: Spring
---


# Spring MVC基础知识
<hr>
![](../../uploads/post_pics/spring-mvc/flow.png)

<!-- more -->

## 搭建Spring MVC
### 配置DispatcherServlet
- Servlet容器 -> `extends AbstractAnnotationConfigDispatcherServletInitializer`
ServletContainerInitializer接口 -> 
SpringServletContainerInitializer实现 -> 
WebApplicationInitializer接口 -> AbstractAnnotationConfigDispatcherServletInitializer实现
```java
public class WebAppInitializer extends AbstractAnnotationConfigDispatcherServletInitializer {

    @Override
    protected String[] getServletMappings()｛
        　return new String[] { "/" };  // 将DispatcherServlet映射到"/"
    ｝
    
    @Override
    protected Class<?>[] getRootConfigClasses() {  //配置ContextLoaderListener应用上下文的其他非web组件bean
        return new Class<?>[] { RootConfig.class };
    }
    
    @Override
    protected Class<?>[] getServletConfigClasses() { //配置DispatcherServlet应用上下文包含web组件的bean，控制器、视图解析器等
        return new Class<?>[] { WebConfig.class };  //配置类
    }
}
```

- 配置web.xml
```xml  web.xml
  <servlet>
      <servlet-name>dispatcher</servlet-name>
      <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
      <load-on-startup>1</load-on-startup>
      <init-param>
        <param-name>contextConfigLocation</param-name>
        <param-value>/WEB-INF/dispatcher-context.xml</param-value>    
      </init-param>
  </servlet>
    
    <servlet-mapping>
        <servlet-name>dispatcher</servlet-name>
        <url-pattern>/</url-pattern>
    </servlet-mapping>
    
    <context-param>
        <param-name>contextConfigLocation</param-name>
        <param-value>/WEB-INF/root-context.xml</param-value>    
    </context-param>

    <listener>
        <listener-class>
            org.springframework.web.context.ContextLoaderListener
        </listener-class>
    </listener>
```

```xml dispatcher-context.xml
    <context:component-scan base-package="me.zhulin.controller"></context:component-scan>

    <bean class="org.springframework.web.servlet.view.InternalResourceViewResolver">
        <property name="prefix">
            <value>/</value>
        </property>
        <property name="suffix">
            <value>.jsp</value>
        </property>
    </bean>
```
`ContextLoaderListener`和`DispatcherServlet`各自都会加载一个Spring应用上下文。
上下文参数`contextConfigLocation`指定了一个XML文件的地址，这个文件定义了根应用上下文，它会被`ContextLoaderListener`加载。
若`DispatcherServlet`未指定XML文件地址,`DispatcherServlet`会根据Servlet的名字找到一个文件，并基于该文件加载应用上下文。例如，`DispatcherServlet`会从`/WEBINF/dispatcher-context.xml`文件中加载bean。


### 启动Spring MVC
1. 使用<mvc:annotationdriven>启用注解驱动的Spring MVC。
2. 配置 Spring MVC

```java WebConfig.class
@Configuration
@EnableWebMvc
@ComponentScan("me.zhulin.controller")
public class WebConfig extends WebMvcConfigurerAdapter {

	@Bean
	public ViewResolver viewResolver() {
		InternalResourceViewResolver resolver = new InternalResourceViewResolver();
		resolver.setPrefix("/WEB-INF/views/");
		resolver.setSuffix(".jsp");
		resolver.setExposeContextBeansAsAttributes(true);
		return resolver;
	}

	@Override
	public void configureDefaultServletHandling(DefaultServletHandlerConfigurer configurer) {  //配置静态资源处理
		configurer.enable(); //转交默认Servlet,而非DispatcherServlet
	}
}

```

```java RootConfig.class
@Configuration
@ComponentScan("me.zhulin")
public class RootConfig {

}

```

### 控制器
```java
@Controller
@RequestMapping("/spittles")
public class SpittleController {

    private SpittleRepository spittleRepository;

    @Autowired
    public SpittleController(SpittleRepository spittleRepository) {
        this.spittleRepository = spittleRepository;
    }

	@RequestMapping(method=GET)
	public String spittles(Model model) {
        model.addAttribute(spittleRepository.findSpittles(Long.MAX_VALUE, 20));  //key: spittleList
		reutrn "spittles";  //  /WEB-INF/views/spittles.jsp
	}

    //当controller没有显式设定模型，也没有返回视图名，只是返回对象或集合时，
    //处理器会将值放入模型，视图名根据请求路径推断
}
```

#### 测试控制器
```java
public class SpittleControllerTest {
    @Test
    public void testSpittlesPage() throws Exception {
        List<Spittle> expectedSpittles = createSpittleList(20);  //新建20个，方法略

        SpittleRepository mockRepository = mock(SpittleRepository.class);  //Mock Repository
        when(mockRepository.findSpittles(Long.MAX_VALUE,20))  // Mock 方法
            .thenReturn(expectedSpittles);  

        SpittleController controller = new SpittleController(mockRepository);

        //MockMvcBuilders.standaloneSetup()
        MockMvc mockMvc = standaloneSetup(controller)
                            .setSingleView(new InternalResourceVIew("/WEB-INF/views/spittles.jsp"))  // 不再解析视图名 可省略
                            .build();  

        mockMvc.perform(get("/spittles"))
               .andExpect(view().name("spittles"))
               .andExpect(model().attributeExists("spittleList"))
               .andExpect(model().attribute("spittleList", hasItems(expectedSpittles.toArray())));


               // .andExpect(redirectedUrl("/spitter/jbauer"))
    }
}
```

# Spring MVC高级技术
<hr>

## multipart数据
### 配置multipart解析器
MultipartResolver接口的实现解析multipart请求数据。
- CommonsMultipartResolver
- StandardServletMultipartResolver(Servlet3.0，推荐)
```java
@Bean
public MultipartResolver multipartResolver() throws IOException {
    return new StandardServletMultipartResolver();
}
```
通过重载`AbstractAnnotationConfigDispatcherServletInitializer`的`customizeRegistration()`配置multipart具体细节：
```java
@Override
protected void customizeRegistration(Dynamic registration) {
    registration.setMultipartConfig(
        new MultipartConfigElement("/tmp/spittr/uploads", 2097152, 4194304, 0)); 

    //绝对路径，文件大小，请求大小，全部写入磁盘
}
```

```xml
  <servlet>
      <servlet-name>dispatcher</servlet-name>
      <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
      <load-on-startup>1</load-on-startup>
      <multipart-config>
        <location>/tmp/spittr/uploads</location>  
        <max-file-size>2097152</max-file-size>
        <max-request-size>4194304</max-request-size>
      </multipart-config>  
      <init-param>
        <param-name>contextConfigLocation</param-name>
        <param-value>/WEB-INF/dispatcher-context.xml</param-value>    
      </init-param>
  </servlet>    
```

### 处理multipart请求



# Spring Boot
<hr>
![Spring-Boot](https://raw.githubusercontent.com/zhulinn/zhulinn.github.io/hexo/source/uploads/post_pics/Spring-boot.png)

The @SpringBootApplication annotation is equivalent to using @Configuration, @EnableAutoConfiguration and @ComponentScan with their default attributes.
![springbootapplication](https://raw.githubusercontent.com/zhulinn/zhulinn.github.io/hexo/source/uploads/post_pics/springbootapplication.png)

 The relationship between the Controller and the View
![spring-url](https://raw.githubusercontent.com/zhulinn/zhulinn.github.io/hexo/source/uploads/post_pics/spring-url.png)