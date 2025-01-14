<?php

if (isset($_POST["signup"])) {

    $username = $_POST['username'];
    $password = $_POST['password'];

    $host = 'localhost';
    $dbUser = 'root';
    $dbPassword = '';
    $database = 'users';

    $conn = new mysqli($host, $dbUser, $dbPassword, $database);

    if ($conn->connect_error) {
        die("اتصال به دیتابیس ناموفق بود: " . $conn->connect_error);
    }

    echo "اتصال به دیتابیس موفقیت‌آمیز بود!";

    /*
ساخت جدول
CREATE TABLE IF NOT EXISTS user_info(
id INT AUTO_INCREMENT PRIMARY KEY,
username VARCHAR(50) NOT NULL UNIQUE,
password VARCHAR(50) NOT NULL UNIQUE
)
*/

    $sql = "INSERT INTO user_info(username,password) VALUES('$username','$password')";
    $result = $conn->query($sql);

    if ($result) {
        echo "ثبت نام با موفقیت انجام شد";
    } else {
        echo "خطا در ثبت نام";
    }

    $conn->close();
} else {
    header("Location: index.html");
}
