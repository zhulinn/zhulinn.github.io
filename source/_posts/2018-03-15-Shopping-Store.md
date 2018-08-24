---
title: 'A Shopping Store with Spring Boot, Hibernate, Freemarker & Bootstrap'
categories: Java Web
tags:
  - Spring Boot
  - Projects
date: 2018-03-15 10:12:58
top: true
sticky: 100
---

**Demo:** [E-Shop](https://e-shop-.herokuapp.com)
**Github:** [Online Shop Store](https://github.com/zhulinn/Online-Shopping-Store)
<hr>
<img src="https://raw.githubusercontent.com/zhulinn/zhulinn.github.io/hexo/source/uploads/post_pics/shop-cart.png">
<!-- more -->
<img src="https://raw.githubusercontent.com/zhulinn/zhulinn.github.io/hexo/source/uploads/post_pics/shop-product.png">
<img src="https://raw.githubusercontent.com/zhulinn/zhulinn.github.io/hexo/source/uploads/post_pics/shop-order.png">
# Before 
Rencently, I am developing a online shopping web application with Spring Boot as a practice of Spring. This project is totally developed by myself. Technology stacks includes Spring Boot, Spring Security, Spring Data JPA & Hibernate for the back end and Freemarker, Bootstrap & JavaScript for the front end. It's a full stack project.

# Introduction
In short, this web application is design for both customers and employees. There are total three roles for different users that are `ROLE_CUSTOEMR`, `ROLE_EMPLOYEEE` and `ROLE_MANAGER`.

* **CUSTOMER:** Customers can shop on this website and add items to their own shopping cart. Customers can edit items in the cart. The order was created once the customer checkout items. Customers can cancel their own orders before the order is finished.
p.s. Right now, the payment functionality is not included.

* **Employee** Employees hava the access to view the orders of all the customers. And do some actions on the orders, such as cancel, finish. Employees can edit the product information.

* **Manager** Managers have all the functionality of employees. They can also provide new products for sale.

# TODO