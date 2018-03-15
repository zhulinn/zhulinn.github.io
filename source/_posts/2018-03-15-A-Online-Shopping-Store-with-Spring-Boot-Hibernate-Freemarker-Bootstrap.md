---
title: 'A Online Shopping Store with Spring Boot, Hibernate, Freemarker & Bootstrap'
categories: Spring
tags:
  - Spring Boot
date: 2018-03-15 10:12:58
---

<!-- 
{% fold Click %}
something you want to fold, include code block.
{% endfold %} -->

<!-- https://raw.githubusercontent.com/zhulinn/zhulinn.github.io/hexo/source/uploads/post_pics/XXX.png -->

<!-- more -->

<!-- 
{% fold Click %}
something you want to fold, include code block.
{% endfold %} -->
Demo: [E-Shop](https://e-shop-.herokuapp.com)
Github: [Online Shop Store](https://github.com/zhulinn/Online-Shopping-Store)
<img src="https://raw.githubusercontent.com/zhulinn/zhulinn.github.io/hexo/source/uploads/post_pics/shop-cart.png">
<!-- more -->
<img src="https://raw.githubusercontent.com/zhulinn/zhulinn.github.io/hexo/source/uploads/post_pics/shop-product.png">
<img src="https://raw.githubusercontent.com/zhulinn/zhulinn.github.io/hexo/source/uploads/post_pics/shop-order.png">
# Before 
Rencently, I am developing a online shopping web application with Spring Boot as a practice of Spring. This project is totally developed by myself. Technology stacks includes Spring Boot, Spring Security, Spring Data JPA & Hibernate for the back end and Freemarker, Bootstrap & JavaScript for the front end. It's a full stack project.

# Introduction
In short, this web application is design for both customers and employees. There are total three roles for different users that are `ROLE_CUSTOEMR`, `ROLE_EMPLOYEEE` and `ROLE_MANAGER`.
* **CUSTOMER:** This role is for the normal customers. Each customer can shop on this website and buy anything they want. The website will display all the products in category to give a better experience to users finding their favorites. Customers will get a lot of information of each product. Once they find something they are interested, they can add items to their own shopping cart. In the shopping cart, there will be a list of all the items that customers have added. Customers will hava another chance to remove products from the cart. The cart also give some information about the amount of each items as well as the total amount. Customers can checkout all the items and clean the cart. And there will be a order created, which contains all the information the sellers need. By the way, customers can cancel their own orders before the order is finished.
p.s. Right now, the payment functionality is not included.

* **Employee** This role is one type of sellers. At first, emoployees can buy all the things in their own store. So they hava the same functionality as customers. What's more, as a seller, employees hava the access to view the orders of all the customers. And do some actions on the orders, such as cancel, finish. Employees can edit the product information, decide whether the product is on sale or off sale.
* **Manager** Lastly, manager is the super admin for this web applicaton. You can think them as the boss of the shopping store. They hava all the functionality mentioned above. Not only that, managers have a ability to 'fire' other employees and provide new products for sale.

# TODO