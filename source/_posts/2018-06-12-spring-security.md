---
title: Spring Security
toc: true
date: 2018-06-12 10:36:17
categories: Java Web
tags: Spring
---

## Spring Security原理
![](../../uploads/post_pics/spring/delegatingfilterproxy.png)
DelegatingFilterProxy是一个特殊的Servlet Filter，将工作委托给javax.servlet.Filter实现类。

<!-- more -->

## 配置DelegatingFilterProxy
```java
public class SecurityWebInitializer extends AbstractSecurityWebApplicationInitializer {

}
```

```xml
<filter>
	<filter-name>springSecurityFilterChain</filter-name>
	<filter-class>org.springframework.web.filter.DelegatingFilterProxy</filter-class>
</filter>
```

## 配置Web安全性
实现WebSecurityConfigurer或拓展WebSecurityConfigurerAdapter
```java
@Configuration
@EnableWebMvcSecurity  //启用Web安全功能
// @EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {
	@Override
	protecte void configure(WebSecurity webSecurity) {};  //配置Filter链

	@Override
	protecte void configure(HttpSecurity httpSecurity) {};  //配置如何拦截

	@Override //配置用户存储
	protecte void configure(AuthenticationManagerBuilder authenticationManagerBuilder) {};  

}
```

@EnableWebMvcSecurity配置了一个Spring MVC参数解析解析器(argument resolver)，处理器方法能够通过带有@AuthenticationPrincipal注解的参数获得认证用户的principal（或username）。它同时还配置了一个bean，自动添加一个隐藏的跨站请求伪造（cross-site request forgery，CSRF）token输入域。

### 用户存储
#### 基于内存
```java
	@Override
	protected void configure(AuthenticationManagerBuilder auth) throws Exception {
		auth
			.inMemoryAuthentication() 
			.withUser("user").password("password").roles("USER").and()
			.withUser("admin").password("password").roles("USER","ADMIN");
	}
```
roles()方法是authorities()方法的简写形式。roles()方法所给定的值都会添加一个“ROLE_”前缀，并将其作为权限授予给用户。

#### 基于数据库表
```java
	@Autowired
	DataSource dataSource;

	@Override
	protected void configure(AuthenticationManagerBuilder auth) throws Exception {
		auth
			.jdbcAuthentication() 
			.dataSource(dataSource)
			.usersByUsernameQuery("select username, password, enabled from Spitter where username=?")
			.authoritiesByUsernameQuery("select username, role from Spitter where username=?")
			.passwordEncoder(new StandardPasswordEncoder("example")); 
			// BCryptPasswordEncoder、NoOpPasswordEncoder
	}
```

#### 自定义UserDetailsService
提供一个自定义的UserDetailsService接口实现
```java
	@Autowired
	SpitterRepository spitterRepository;

	@Override
	protected void configure(AuthenticationManagerBuilder auth) throws Exception {
		auth
			.userDetailsService(new SpitterUserService(spitterRepository));
	}
```

```java
public class SpitterUserservice implements UesrDetailsService {
	private final SpitterRepository spitterRepository;

	// 注入SpitterRepository
	public SpitterUserService(SpitterRepository spitterRepository) {
		this.spitterRepository = spitterRepository;
	}

	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		if(spitter != null ) {
			List<GrantedAuthority> authorities = new ArrayList<>();
			authorities.add(new SimpleGrantedAuthority("ROLE_SPITTER"));

			return new User(spitter.getUserName(), spitter.getPassword(), authorities);
		}
	}
}
```

### 拦截请求
由上到下，优先匹配原则。
```java
	@Override
	protected void configure(HttpSecurity http) throws Exception {
		http
			.authorizeRequests()
				.antMatchers("/spitters/me").hasAuthority("ROLE_SPITTER")
				.antMatchers(HttpMethod.POST, "/spitters").hasRole("SPITTER")
				.anyRequest().permitAll();
			.and()
			.requiresChannel()
				.antMatchers("/spitter/form").requiresSecure()  //HTTPS
			.and()
			.csrf()
				.disable();  //禁用CSRF防护

	}
```

**跨站请求CSRF防护**
Spring Security通过一个同步token的方式来实现CSRF防护的功能。所有的表单必须在一个`_csrf`域中提交token，而且这个token必须要与服务器端计算并存储的token一致，这样的话当表单提交的时候，才能进行匹配。
`<sf:form>`、`th:action`标签会自动为我们添加隐藏的CSRF token标签。

### 认证用户
```java
	@Override
	protected void configure(HttpSecurity http) throws Exception {
		http
			.formLogin()
				.loginPage("/login")
	}
```

**HTTP Basic认证**
HTTP Basic实际上就是将我们的用户名和密码连接起来`user:password`，然后使用base64进行加密，将加密后的密文`Basic dXNlcjpwYXNzd29yZA0K`放在HTTP的header中进行验证。Authorization: Basic dXNlcjpwYXNzd29yZA0K
```java
	@Override
	protected void configure(HttpSecurity http) throws Exception {
		http
			.httpBasic()
				.realmName("name")
	}
```

**Remember-me**
通过在cookie中存储一个token完成，包含用户名、密码、过期时间和一个私钥。
```java
	@Override
	protected void configure(HttpSecurity http) throws Exception {
		http
			.rememberMe()
				.tokenValiditySeconds()
				.key("key")
	}
```
页面登录表单中，增加`name="remember-me"`复选框。

**退出**
用户退出应用，remember-me token被清除，默认重定向"/login?logout"
```java
	@Override
	protected void configure(HttpSecurity http) throws Exception {
		http
			.logout()
				.logoutUrl("/signout")
				.logoutSuccessUrl("/")
	}
```

### 视图保护
- Spring Security的JSP标签库
	- `<security:accesscontrollist>`
	- `<security:authentication property="principal.username">` 获取认证对象信息
	- `<security:authorize access="hasRole('ROLE_SPITTER')" url="/admin">` 