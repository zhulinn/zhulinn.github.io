---
layout: '[post]'
title: JavaEE JSP Notes
toc: true
tags:
  - JSP
categories: JavaEE
date: 2018-02-09 19:26:24
---

# Life cycle of JSP Page
1. Translation
e.g. home.jsp -> home_jsp.java
2. Compilation

<!-- more -->

e.g. home_jsp.java -> home_jsp.class
3. Class Loading
4. Instance Creation
5. Initialization
6. Request Processing
7. Destroy


# JSP Implicit Object
* out Object
Output content to be sent in client response. `out.print()` is same as <%= %>
* request Object
* response Object
* config Object
Get the JSP init params.
* application Object
Get the context information and attributes in JSP. `getRequestDispatcher("XXX")`
* session Object
Whenever we request a JSP page, container automatically creates a session for the JSP. `<%@ page session="false"%>`
* pageContext Object
We can use pageContext to get and set attributes with different scopes and to forward request to other resources. pageContext object also hold reference to other implicit object.
* page Object
Represents the current JSP page. Provide reference to the generated servlet class.
* exception Object
Error pages.

# JSP Directives
* **page directive**
e.g. `<%@ page import="java.util.Date,java.util.List,java.io.*" %>`
* **include directive**
e.g. `<%@ include file="test.html" %>`
* **taglib directive**
e.g. `<%@ taglib uri="/WEB-INF/c.tld" prefix="c"%>`

# Exception Handling in JSP
## Define an Error Page
To handle exceptions thrown by the JSP page, all we need is an error page and set page directive attribute `isErrorPage` value to `true`.
## Configuration
Two ways
* Set page directive `errorPage` attribute. `<%@ page errorPage="error.jsp"%>`
* Define error page in web.xml with `error-page`
```xml
    <error-page>
   <error-code>404</error-code>
   <location>/error.jsp</location>
   </error-page>
```

# Expression Language(EL)
We can disable EL expression in JSP by setting `isELIgnored` to `true`.
## EL Implicati Objects
e.g. `pageScope`, `requestScope`, `sessionScope`, `applicationScope`, `param`, `paramValues`, `header`, `headerValues`, `cookie`, `initParam`  -- Map type
`pageContext` -- pageContext type

>If scope is not provided, the JSP EL looks into page, request, session and application scope to find the named attribute.

## EL Operators
1. Dot or Access Operator `.`
`${firstObj.secondObj}`
2. Collection Operator `[]`
`${requestScope[“foo.bar”]}`
`${myList[1]}` and `${myList[“1”]} `
`${myMap[expr]}`
3. Arithmetic Operator
`+`, `-`, `*`, `/`, `%`
4. Logical Operators
`&&`, `||`, `!`
5. Relational Operators
`==`, `!=`, `<`, `>`, `<=`, `>=`

# Action Tags
## jsp:useBean
**Use or create one if it's null**
```jsp
<jsp:useBean id="myBeanAttribute" class="com.journaldev.MyBean" scope="request" />
```
JSP container will first try to find the myBeanAttribute attribute in the request scope but if it’s not existing then it will create the instance of MyBean and then assign it to the myBeanAttribute id variable in JSP and sets it as an attribute to the request scope.
<hr>

**getProperty is limitted**
We can get it’s properties using jsp:getProperty action like below. 
```jsp
<jsp:getProperty name="myBeanAttribute" property="count" />
```
`getProperty` is limited because we **can’t get the property of a property**. For example if MyBean has a property that is another java bean, then we can’t use JSP action tags to get it’s value, for that we have JSP EL.
<hr>

**Set only on new one**
```jsp
<jsp:useBean id="myBeanAttribute" class="com.journaldev.MyBean" scope="request">
    <jsp:setProperty name="myBeanAttribute" property="count" value="5" />
</jsp:useBean>
```
`jsp:setProperty` inside the `jsp:useBeanSet` only if `jsp:useBean` is creating a new instance.
<hr>

**type and class**
```jsp
<jsp:useBean id="person" type="Person" class="Employee" scope="request" />
```
If we don’t provide `class` attribute value, it must has an attribute called `person`.
If we don’t provide `scope` attribute value, it’s defaulted to page scope.
<hr>

**`param` Set Been properties from request parameters**
If we want to set the Java Bean properties from request parameters, we can use param attribute like below.
```jsp
<jsp:useBean id="myBeanAttribute" class="com.journaldev.MyBean" scope="session">
<jsp:setProperty name="myBeanAttribute" property="id" param="empID" />
</jsp:useBean>
```
If property and param attribute values are same, we can skip the param attribute.
```jsp
<jsp:useBean id="myBeanAttribute" class="com.journaldev.MyBean" scope="session">
<jsp:setProperty name="myBeanAttribute" property="id" />
</jsp:useBean>
```
If all the request parameter names matches with the java bean properties, then we can simply set bean properties like below.
```jsp
<jsp:useBean id="myBeanAttribute" class="com.journaldev.MyBean" scope="session">
<jsp:setProperty name="myBeanAttribute" property="*" />
</jsp:useBean>
```
## jsp:include
We can use `jsp:include` action to include another resource in the JSP page.
```jsp
<jsp:include page="header.jsp" />
```
**Difference with JSP include directive**
In include directive, the content to other resource is added to the generated servlet code **at the time of translation** whereas with include action it happens **at runtime**.
We can pass Parameters to the included resource using `jsp:param`
```jsp
<jsp:include page="header.jsp">
   <jsp:param name="myParam" value="myParam value" />
</jsp:include>
```
## jsp:forward
We can use `jsp:forward` to forward the request to another resource to handle it.
```jsp
<jsp:forward page="login.jsp" />
```

# JSTL tags
1. **Core Tags**
Iteration, conditional logic catch exception, url, forward or redirecr response...
```jsp
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>

<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt" %>
```
2. **SQL Tags**
Interaction with relational databases.
```jsp
<%@ taglib uri="http://java.sun.com/jsp/jstl/sql" prefix="sql" %>
```
3. **XML Tags**
Work with XML documents like parsing XML, transforming XML data and XPath expressions evaluation.
```jsp
<%@ taglib uri="http://java.sun.com/jsp/jstl/xml" prefix="x" %>
```
4. **Functions Tags**
Perform common operation, most of them are for string manipulation such as concatenation, split etc.
```jsp
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn" %>
```
# Custom Tag
1. Creating cumtom tags handler class
    * Extend `javax.servlet.jsp.tagext.SimpleTagSupport`
    * Override `doTags()` method
    * Provide setter methods for the attributes we need for the tag.
```java
public class NumberFormatterTag extends SimpleTagSupport {

	private String format;
	private String number;
	
	//Setters
	public void setFormat(String format) {
		this.format = format;
	}
	public void setNumber(String number) {
		this.number = number;
	}
	
	
	@Override
	public void doTag() throws JspException, IOException {
	...
	}
```
    2. Creating Custom Tag Library Descriptor(TLD) File inside **WEB-INF** directory.
```
<short-name>mytags</short-name>
<uri>https://journaldev.com/jsp/tlds/mytags</uri>
<tag>
	<name>formatNumber</name>
	<tag-class>com.journaldev.jsp.customtags.NumberFormatterTag</tag-class>
	<body-content>empty</body-content>
	<attribute>
	<name>format</name>
	<required>true</required>
	</attribute>
	<attribute>
	<name>number</name>
	<required>true</required>
	</attribute>
</tag>
```
3. Deployment Descriptor Configuration
```xml
<jsp-config>
  <taglib>
  	<taglib-uri>https://journaldev.com/jsp/tlds/mytags</taglib-uri>
  	<taglib-location>/WEB-INF/numberformatter.tld</taglib-location>
  </taglib>
</jsp-config
```


**Refefence:**[JSP EL Tutorial](https://www.journaldev.com/2064/jsp-expression-language-el-example-tutorial)