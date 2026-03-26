-- Create databases
CREATE DATABASE IF NOT EXISTS task_db;
CREATE DATABASE IF NOT EXISTS user_db;

-- Change root password to use mysql_native_password
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Quan11092005@';
ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'Quan11092005@';

-- Create user for Spring Boot applications with mysql_native_password
DROP USER IF EXISTS 'springuser'@'%';
CREATE USER 'springuser'@'%' IDENTIFIED WITH mysql_native_password BY 'Quan11092005@';
GRANT ALL PRIVILEGES ON task_db.* TO 'springuser'@'%';
GRANT ALL PRIVILEGES ON user_db.* TO 'springuser'@'%';
FLUSH PRIVILEGES;

-- Grant privileges to root
GRANT ALL PRIVILEGES ON task_db.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON user_db.* TO 'root'@'%';
FLUSH PRIVILEGES;
