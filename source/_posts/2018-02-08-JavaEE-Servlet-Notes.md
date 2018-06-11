---
title: JavaEE Servlet Notes
categories: JavaEE
toc: true
tags:
  - Servlet
  - JSP
date: 2018-02-08 11:56:15
---

# Web Container
* **Communication Support** – Container provides easy way of communication between web server and the servlets and JSPs. Because of container, we don’t need to build a server socket to listen for any request from web server, parse the request and generate response.
<!-- more -->
 All these important and complex tasks are done by container and all we need to focus is on our business logic for our applications.
* **Lifecycle and Resource Management** – Container takes care of managing the life cycle of servlet. Container takes care of loading the servlets into memory, initializing servlets, invoking servlet methods and destroying them. Container also provides utility like JNDI for resource pooling and management.
* **Multithreading Support** – Container creates new thread for every request to the servlet and when it’s processed the thread dies. So servlets are not initialized for each request and saves time and memory.
* **JSP Support** – JSPs doesn’t look like normal java classes and web container provides support for JSP. Every JSP in the application is compiled by container and converted to Servlet and then container manages them like other servlets.
* **Miscellaneous Task** – Web container manages the resource pool, does memory optimizations, run garbage collector, provides security configurations, support for multiple applications, hot deployment and several other tasks behind the scene that makes our life easier.

------
# The principle when programming Servlet + JSP
1. Never allow users to directly access to your JSP page.
Set JSP files in the **WEB-INF** folder or its subdirectories.
2. JSP is only considered as the place to display interface.

3. Servlet acts as the controller of the application flows and  program logical processing.
4. Open the JDBC connection and transaction management in Filter (Optional).

------
# Web Application Directory Structure
![Dierectory Structure](https://raw.githubusercontent.com/zhulinn/zhulinn.github.io/hexo/source/uploads/post_pics/WAR-directory-structure.png)

---
# URL
![URL](https://raw.githubusercontent.com/zhulinn/zhulinn.github.io/hexo/source/uploads/post_pics/url-pattern.png)

---
# Session
**Session** is a conversional state between client and server and it can consists of multiple request and response between client and server. Since HTTP and Web Server both are **stateless**, the only way to maintain a session is when some unique information about the session (session id) is passed between server and client in every request and response. 

### Methods
There are mainly two ways through which we can provide unique identifier in request and response.

* **Cookies**
Cookies are small piece of information that is sent by web server in response header and gets stored in the browser cookies.
```java
// Send
Cookies loginCookie = new Cookie("user", user);
loginCookie.setMaxAge(30*60);
response.addCookie(loginCookie);


//Recieve
Cookie[] cookies = request.getCookies();
if(cookies != null) {
    if(cookie.getName().equals("user")) 
        userName = cookie.getValue();
}

//remove
Cookie loginCookie = null;
Cookie[] cookies = request.getCookies();
for(Cookie cookie : cookies){
    if(cookie.getName().equals("user")){
    	loginCookie = cookie;
    	break;
	}	
}
if(loginCookie != null){
    loginCookie.setMaxAge(0);
    response.addCookie(loginCookie);
}
```
* **URL Rewriting**
We can append a session identifier parameter with every request and response to keep track of the session. **Only when the cookies are disabled.** `HttpServletResponse encodeURL()` encodes URL. `HttpServletResponse encodeRedirectURL` redicts the request with session information.

    Servlet
    ```java
//Get the encoded URL string
String encodedURL = response.encodeRedirectURL("LoginSuccess.jsp");
response.sendRedirect(encodedURL);
    ```
    JSP
    ```jsp 
    <!-- need to encode all the URLs where we want session information to be passed -->
    <a href="<%=response.encodeURL("CheckoutPage.jsp") %>">Checkout Page</a>
    <form action="<%=response.encodeURL("LogoutServlet") %>" method="post">
    <input type="submit" value="Logout" >
    </form>
    ```
### HttpSession
Servlet API provides Session management through HttpSession interface.
`HttpServletRequest getSession()` It returns the session object attached with the request, if the request has no session attached, then it creates a new session and return it. It creates the new HttpSession object and also add a Cookie to the response object with name `JSESSIONID` and value as session id. If the cookies are disabled at client side and we are using URL rewriting then this method uses the jsessionid value from the request URL to find the corresponding session.
```java
HttpSession session = request.getSession();

session.setAttribute("user", "Pankaj");

//setting session to expiry in 30 mins
session.setMaxInactiveInterval(30*60);

//remove session
session.invalidate();
```

---
# Servlet
### Configuration
* web.xml
```xml
<servlet>
    <display-name>ss</display-name>
    <servlet-name>SimpleServlet</servlet-name>
    <servlet-class>footmark.servlet.SimpleServlet</servlet-class>
    <load-on-startup>-1</load-on-startup>
    <async-supported>true</async-supported>
    <init-param>
        <param-name>username</param-name>
        <param-value>tom</param-value>
    </init-param>
</servlet>
<servlet-mapping>
    <servlet-name>SimpleServlet</servlet-name>
    <url-pattern>/simple</url-pattern>
</servlet-mapping>
```
* Annotation
```java
@WebServlet(urlPatterns = {"/simple"}, asyncSupported = true, 
loadOnStartup = -1, name = "SimpleServlet", displayName = "ss", 
initParams = {@WebInitParam(name = "username", value = "tom")} 
) 
public class SimpleServlet extends HttpServlet{ … }
```

---
# Filter
### Configuration
* web.xml
```xml
<filter> 
    <filter-name>SimpleFilter</filter-name> 
    <filter-class>xxx</filter-class> 
</filter> 
<filter-mapping> 
    <filter-name>SimpleFilter</filter-name> 
    <servlet-name>SimpleServlet</servlet-name> 
</filter-mapping>
```
* Annotation
```java
@WebFilter(servletNames = {"SimpleServlet"},filterName="SimpleFilter") 
public class LessThanSixFilter implements Filter{...}
```
|Attribute|type|
|:---:|:---:|
|`filterName` |  String|
|`value`|String[]|
|`urlPatterns`|String[]|
|`servletNames`|String[]|
|`dispatcherTypes`|DispatcherType|
|`initPatams`|WebInitParam[]|
|`asyncSupported`|boolean|
|`description`|String|
|`displayName`|String|

---
# Listener
### Why?
We know that using `ServletContext`, we can create an attribute with application scope that all other servlets can access but we can initialize ServletContext init parameters as **String only** in deployment descriptor (web.xml). To set an attribute in ServletContext for Database Connection, we can create a **Listener** for the application startup event to read context init parameters and create a database connection and set it to context attribute for use by other resources.

### Configuration
* web.xml
```xml
<listener> 
    <listener-classcom.journaldev.listener.SimpleListener</listener-class> 
</listener>
```
* Annotation
```java
@WebListener("This is only a demo listener") 
public class SimpleListener implements ServletContextListener{...}
```
# Exception and Error Handing
Before servlet container invokes the **servlet** to handle the exception, it sets some attributes in the request to get useful information about the exception, some of them are `javax.servlet.error.exception`, `javax.servlet.error.status_code`, `javax.servlet.error.servlet_name` and `javax.servlet.error.request_uri`.
You can also use JSP page as exception handler, just provide the location of jsp file rather than servlet mapping.
```xml
  <error-page>
  	<error-code>404</error-code>
  	<location>AppErrorHandler.jsp</location>
  </error-page>
  
  <error-page>
  <exception-type>javax.servlet.ServletException</exception-type>
  <location>/AppExceptionHandler</location>
  </error-page>
```

---
# Servlet 3 File Upload
#### **@MultipartConfig**
 Servlet Specs 3.0 provided additional support for uploading files to server. Annotate File Upload handler servlet with `MultipartConfig` annotation to handle multipart/form-data requests.
* `fileSizeThreshol`: The size threshold after which the file will be written to disk. In bytes.
* `location`: Default value is “”.
* `maxFileSize`: Default value is -1L means unlimited. In bytes.
* `maxRequestSize`: Default value is -1L that means unlimited. In bytes.

#### **Part Interface**
Part interface represents a part or form item that was received within a multipart/form-data POST request. 

#### **HttpServletRequest**
New methods got added in HttpServletRequest to get all the parts in multipart/form-data request through `getParts()` method. We can get a specific part using `getPart(String partName)` method.

#### **Implement**
1. HTML
Submit the form to send `POST` request and . `enctype` of form should be `multipart/form-data`. Use `input` element with `type` as `file`.
2. FileUploadServlet
```java 
@WebServlet("/FileUploadServlet")
@MultipartConfig(fileSizeThreshold=1024*1024*10, 	// 10 MB 
                 maxFileSize=1024*1024*50,      	// 50 MB
                 maxRequestSize=1024*1024*100)   	// 100 MB
public class FileUploadServlet extends HttpServlet {
 
    private static final long serialVersionUID = 205242440643911308L;
	
    /**
     * Directory where uploaded files will be saved, its relative to
     * the web application directory.
     */
    private static final String UPLOAD_DIR = "uploads";
     
    protected void doPost(HttpServletRequest request,
            HttpServletResponse response) throws ServletException, IOException {
        // gets absolute path of the web application
        String applicationPath = request.getServletContext().getRealPath("");
        // constructs path of the directory to save uploaded file
        String uploadFilePath = applicationPath + File.separator + UPLOAD_DIR;
         
        // creates the save directory if it does not exists
        File fileSaveDir = new File(uploadFilePath);
        if (!fileSaveDir.exists()) {
            fileSaveDir.mkdirs();
        }
        
        String fileName = null;
        //Get all the parts from request and write it to the file on server
        for (Part part : request.getParts()) {
            fileName = getFileName(part);
            part.write(uploadFilePath + File.separator + fileName);
        }
 
        request.setAttribute("message", fileName + " File uploaded successfully!");
        getServletContext().getRequestDispatcher("/response.jsp").forward(
                request, response);
    }
 
    /**
     * Utility method to get file name from HTTP header content-disposition
     */
    private String getFileName(Part part) {
        String contentDisp = part.getHeader("content-disposition");
        System.out.println("content-disposition header= "+contentDisp);
        String[] tokens = contentDisp.split(";");
        for (String token : tokens) {
            if (token.trim().startsWith("filename")) {
                return token.substring(token.indexOf("=") + 2, token.length()-1);
            }
        }
        return "";
    }
}
```

---
# JavaBean
A JavaBean is just a standard.
* All properties private (use getters/setters)
* A public no-argument constructor
* Implements `Serializable`.






