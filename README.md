# ⚽ Football Field Management System 

This project builds a football field management system, supporting administrators and users to book fields, manage branches, fields, and related activities. Built with **Java Spring Boot**, **Maven**, and **MySQL**.

---

## 🚀 Main Features

- 👤 **User Management**: View list, assign roles, manage user information.
- 🏟️ **Field Management**: Add, delete, update fields, view details, filter fields by name/area/branch.
- 🏢 **Branch Management**: Add new, view list, filter fields by branch.
- 📅 **Field Booking**: Users can view field information, book fields by time slot/date, view booking details.
- 💳 **Booking Management**: Admin can view, manage, and check booking details.
- 🔒 **Security & Authorization**: Use JWT for authentication and role-based API access for admin/user.

---

## 🛠 Technologies Used

- **Backend**: Java 17, Spring Boot, Hibernate, JPA
- **Database**: MySQL
- **Others**: Maven, Lombok, Spring Security (JWT)

---

## ⚙️ Installation

1. **Clone the project**
    ```bash
    git clone https://github.com/ZuyHung05/THCSDL.git
    cd THCSDL
    ```

2. **Configure the database**
    - Create a MySQL database:
        ```sql
        CREATE DATABASE thcsdl;
        ```
    - Update connection info in `src/main/resources/application.properties`:
        ```
        spring.datasource.url=jdbc:mysql://localhost:3306/thcsdl
        spring.datasource.username=root
        spring.datasource.password=your_password
        ```

3. **Run the project**
    ```bash
    mvn spring-boot:run
    ```
    Or run directly from an IDE like IntelliJ IDEA.

---

## 📌 API Usage Guide

- **Admin**: Access `/admin/**` endpoints to manage users, fields, branches, and bookings.
- **User**: Access `/user/**` endpoints to view and book fields, view branches, filter fields.
- **Authentication**: Send JWT in the header `Authorization: Bearer <token>` when calling APIs.

---

## 📞 Contact

For any questions or contributions, please contact via [Gmail](duyhungwork05@gmail.com).

---
