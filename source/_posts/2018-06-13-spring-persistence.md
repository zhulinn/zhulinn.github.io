---
title: Spring数据持久化
toc: true 
date: 2018-06-13 09:40:49
categories: Java web
tags: Spring
---

## Spring数据访问
服务对象通过接口访问Repository实现，实现松耦合。
Spring JDBC框架提供与平台无关的统一持久化异常。
采用模板方法模式，将数据访问过程划分为模板和回调。模板管理过程中固定的部
分，而回调处理自定义的数据访问代码。针对不同持久化平台，Spring提供多个可选模板。
![](../../uploads/post_pics/spring/template.png)

<!-- more -->

## JDBC模板
**JdbcTemplate**
```java
@Bean
public JdbcTemplate jdbcTemplate(DataSource dataSource) {
	return new JdbcTemplate(dataSource);
}

@Repository
public class SpitterRepository {
	@Autowired
	private JdbcOperations jdbcOperations;  
	//JdbcOperations是一个接口，定义了JdbcTemplate所实现的操作。
	
	public Spitter findOne(long id) {
		return jdbcOperations.queryForObject(
			SELECT_SPITTER_BY_ID,
			new SpitterRowMapper(),
			id);
	}

	private static final class SpitterRowMapper implements RowMapper<Spitter> {
		public Spitter mapRow(ResultSet rs, int rowNum) throws SQLException {
			return new Spitter(
				rs.getLong("id"),
				rs.getString("username")
				);	
		}
	}
}
```
对于查询返回的每一行数据，JdbcTemplate将会调用RowMapper的mapRow()方法。
RowMapper接口符合函数式接口，只声明一个方法，可以使用Lambda改写。
```java
public Spitter findOne(long id) {
	return jdbcOperations.queryForObject(
			SELECT_SPITTER_BY_ID,
			(rs, rowNum) -> {
				return new Spitter(
					rs.getLong("id"),
					rs.getString("username"));
			},
			id);
}
```

```java
public Spitter findOne(long id) {
	return jdbcOperations.queryForObject(
			SELECT_SPITTER_BY_ID, this::mapSpitter, id);
}

private Spitter mapSpitter(ResultSet rs, int row) throws SQLException{
				return new Spitter(
				rs.getLong("id"),
				rs.getString("username")
				);	
}
```
**NamedParameterJdbcTemplate**
通过Map绑定，支持命名参数
```java
private static final String INSERT_SPITTER = "insert into Spitter " +
		"(username, password) " +
		"values " + 
		"(:username, :password)";

public void addSpitter(Spitter spitter) {
	Map<String, Object> paramMap = new HashMap<>();
	paramMap.put("username",spitter.getUsername());
	paramMap.put("password", spitter.getPassword());

	jdbcOperations.update(INSERT_SPITTER, paramMap);
}
```
## 对象-关系映射ORM
### Hibernate
**配置Session工厂**
使用Hibernate4.LocalSessionFactoryBean，支持基于XML和基于注解的映射。
```java
@Bean
public LocalSessionFactoryBean sessionFactory(DataSource dataSource) {
	LocalSessionFactoryBean sfb = new LocalSessionFactoryBean();
	sfb.setDataSource(dataSource)；
	sfb.setPackagesToScan(new String[] {"me.zhulin.domain"}); //扫描@Entity类
	Properties props = new Properties();
	props.setProperty("dialect", "org.hibernate.dialect.H2Dialect");
	sfb.setHibernateProperties(props);
	return sfb;
}
```
**Repository**
将SessionFactory装配到Repository，获取Session，不依赖Spring。
```java
@Repository
public classs Repository{
	@Autowired
	SessionFactory sessionFactory;   //注入SessionFactory

	private Session currentsession() {
		return sessionFactory.getCurrentSession();  //获取当前Session
	}

	public Spitter findOne(long id) {
		retur (Spitter) currentSession().get(Spitter.class, id);
	}	
}

```
给不使用模板的Hibernate Repository添加异常转换功能，声明`PersistenceExceptionTranslationPostProcessor`
bean。它会在所有拥有@Repository注解的类上添加一个通知器（advisor），这样就会捕获任何平台相关的异常并以Spring非检查型数据访问异常的形式重新抛出。
```java
@Bean
public BeanPostProcessor persistenceTranslation(){
	return new PersistenceExceptionTranslationPostProcessor();
}
```

### JPA
**配置实体管理器工厂**
基于JPA的应用程序需要使用EntityManagerFactory的实现类来获取EntityManager实例。JPA定义了两种类型的实体
管理器：
- Application-managed: 程序要负责打开或关闭实体管理器并在事务中对其进行控制。
- Container-managed: 实体管理器由Java EE创建和管理。
Spring既可承担应用程序角色，也可担当容器角色。

- **配置Application-managed JPA**
配置信息位于META-INF/persistence.xml
```xml
<persistence>
	<persistence-unit name="spitterPU">
		<class>me.zhulin.domain.Spitter</class>
		<class>me.zhulin.domain.Spittle</class>
		<properties>
			<property></property>
		</properties>
	</persistence-unit>
</persistence>
```
```java
@Bean
public LocalEntityManagerFactoryBean entityManagerFactoryBean(){
	LocalEntityManagerFactoryBean emfb = new LocalEntityManagerFactoryBean();
	emfb.setPersistenceUnitName("spitterPU");
	return emfb;
}
```

- **配置Container-managed JPA**
配置信息位于Spring应用上下文，persistence.xml没有存在的必要。  
```java
@Bean
public LocalContainerEntityManagerFactoryBean entityManagerFactoryBean(DataSource dataSource, JpaVendorAdapter JpaVendorAdapter) {
	LocalContainerEntityManagerFactoryBean emfb = new LocalContainerEntityManagerFactoryBean();
	emfb.setDataSource(dataSource);
	emfb.setJpaVendorAdapter(jpaVendorAdapter);
	emfb.setPackagesToScan("me.zhulin.domain");  //@Entity
	return emfb;
}

@Beanpublic JpaVendorAdapter jpaVendorAdapter() {
	HibernateJpaVendorAdapter adapter = new HibernateJpaVendorAdapter();
	adapter.setDataSource("MYSQL");
	adapter.setDatabasePlatform("org.hibernate.dialect.MYSQLDialect");
}
```

**Repository**
```java
@Repository
@Transactional
public class Repository {
	@PersistenceUnit
	private EntityManagerFactory emf;  //注入Factory

	public void addSpitter(Spitter spitter) {
		emf.createEntityManger().persist(spitter);  //创建EntityManger
	}
}
```
借助`@PersistentCotext`注解为JpaSpitterRepository注入EntityManager。它没有将真正的EntityManager设置给Repository，而是给了它一个EntityManager的代理。线程安全
```java
@Repository
@Transactional
public class Repository {
	@PersistenceContext
	private EntityManager em;  //注入Factory

	public void addSpitter(Spitter spitter) {
		em.persist(spitter);  //创建EntityManger
	}
}
```
> @PersistenceUnit和@PersistenceContext并不是Spring的注解，它们是由JPA规范提供的。为了让Spring理解这些注解，要声明`PersistenceAnnotationBeanPostProcessor`的bean，或者使用`<context:annotation-config>`或`<context:componentscan>`
Spring统一数据访问异常。
```java
@Bean
public BeanPostProcessor persistenceTranslation(){
	return new PersistenceExceptionTranslationPostProcessor();
}
```

### Spring Data实现自动化JPA Repository
启用Spring Data创建Repository接口的实现，`<jpa:repositories base-package="me.zhulin.db"/>` or `@EnableJpaRepositories(basePackages="me.zhulin.db")`扫描扩展自Spring Data JPA Repository接口的所有接口，自动生成实现类。
`<Spitter, Long>`对JpaRepository参数化，持久化对象为Spitter，ID类型为Long
```java
public interface SpitterRepository extends JpaRepository<Spitter, Long> { 
	List<Spitter> readByFirstnameOrLastnameAllIgnoresCaseOrderByLastnameAscFirstnameDesc(String first, String last);
}
```

#### 定义查询方法
**DSL**
Repository方法由 **动词 + Subject + By + 断言** 组成。 
动词：get/read/find, count
Subject可选，以Distinct开头，确保不重复.

**@Query**
```java
@Query("select s from Spitter s where s.email like '%gmail.com'")
List<Spitter> findAllGmailSpitters();
```

#### 混合自定义功能
Spring Data JPA为Repository接口生成实现的时候，它还会查找名字与接口相同，并且添加了Impl后缀的一个类。如果这个类存在的话，Spring Data JPA将会把它的方法与Spring Data JPA所生成的方法合并在一起。
```java
public intface SpitterSweeper{
	int eliteSweep();
}
```
```java
public class SpitterRepositoryImpl implements SpitterSweeper {
	@PersistenceContext
	private EntityManager em;

	public int eliteSweep(){
		String sql = "update Spitter spitter set spitter.status = 'Eliite' " + 
					"where spitter.status = 'Newbie'";

		return em.createQuery(sql).excuteUpdate();
	}
}
```
```java
public interface SpitterRepository extends JpaRepository<Spitter, Long>, SpitterSweeper{
	
}
```

## NoSQL
### MongoDB
1. 配置MongoDB
```java
@Configuration
@EnableMongoRepositories(basePackages="orders.db")
public class MongoConfig {
	@Bean
	public MongoFactoryBean mongo(){
		MongoFactoryBean mongo = new MongoFactoryBean();  //不必处理UnknownHostException
		mongo.setHost("localhost");
		return mongo;
	}

	@Bean
	public MongoOperations mongoTemplate(Mongo mongo) {
		return new mongoTemplate(mongo,"OrdersDB");
	}
}
```
or

```java
@Configuration
@EnableMongoRepositories("orders.db")
public class MongoConfig extends AbstractMongoConfiguration {
	@Override
	protected String getDatabaseName(){
		return "OrdersDB";
	}

	@Override
	protected Mongo() throws Exception {
		return new MongoClient("server", 27017);
	}
}
```

2. 添加MongoDB持久化注解
Spring Data MongoDB注解：`@Document`、`@Id`、`@Field`

3. 使用MongoTemplate访问MongoDB
```java
	@Autowired
	MongoOperations mongo;

	List<Order> orders = mongo.find(Query.query(Criteria.where("customer").is("Chuck Wagon")
														.and("type").is("WEB")), Order.class);
```

4. 编写Repository
```java
piblic interface OrderRepository extends MongoRepository<Order, String> {
	@Query("{'customer': 'Chuck Wagon', 'type': ?0}")  //?0 第0个参数相等
	List<Order> findOrders(String type);
}
```

### Redis
1. 配置工厂
```java
public RedisConnectionFactory redisCF() {
	JedisConnectionFactory cf = new JedisConnectionFactory();
	//cf.setHostName("redis-server");
	//cf.setPort(7379);
	// cf.setPassword("psd")
	return cf;
}
```
2. 使用模板
```java
	RedisConnectionFactory cf = new JedisConnectionFactory();
	RedisTemplate<String, Product> redis = new RedisTemplate<String, Product>();
	// StringRedisTemplate redis = new StringRedisTemplate(cf);
	redis.setConnectionFactory(cf);
```
3. 操作
```java
	redis.opsForValue().set(product.getSku(), product);
	redis.opsForList().rightPush("cart", product);
	redis.opsForList().range("cart", 1,3);
	
```

## 缓存
缓存是一种面向切面的行为。
1. 启用缓存,`@EnableCaching` or `<cache:annotation-driven />`
2. 配置缓存管理器
```java
@Configuration
@EnableCaching
public class CachingConfig {
	@Bean
	public EhCacheCacheManager cacheManager(CacheManager cm) {
		return new EhCacheCacheManager(cm);  //Spring 的EhCacheCacheManager
	}

	@Bean
	public EhCacheManagerFactoryBean ehcache(){ 
		EhCacheManagerFactoryBean ehCacheFactoryBean = new EhCacheManagerFactoryBean();
		ehCacheFactoryBean.setConfigLocation(new ClassPathResource("me/zhulin/ehcache.xml"));
		return ehCacheFactoryBean;   //EhCache 的CacheManager
	}
}
```
- Redis
```java
@Configuration
@EnableCaching
public class CachingConfig {
	@Bean
	public CacheManager cacheManager(RedisTemplate redisTemplate) {
		return new RedisCacheManager(redisTemplate);

	@Bean
	public JedisConnectionFactory redisConnectionFactory(){ 
		JedisConnectionFactory jedisConnectionFactory = new JedisConnectionFactory.afterPropertiesSet();
		return jedisConnectionFactory;
	}

	@Bean
	public RedisTemplate<String, String> redisTemplate(RedisConnectionFactory redisCF){ 
		RedisTemplate<String, String> redisTemplate = new RedisTemplate<>();
		redisTemplate.setConnectionFactory(redisCF);
		redisTemplate.afterPropertiesSet();
		return redisTemplate;
	}
}
```
3. 缓存注解

- @Cacheable：调用前检查缓存 
- @CachePut： 调用前不检查缓存
- @CacheEvict：清除缓存
- @Caching

@Cacheable和@CachePut有一些属性是共有的，默认的缓存key要基于方法的参数来确定。
- value: 缓存名称
- condition：禁用缓存
- key： 缓存key
- unless：阻止写入缓存


