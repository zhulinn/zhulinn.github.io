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