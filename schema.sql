DROP DATABASE IF EXISTS bamazonDB;
CREATE DATABASE bamazonDB;
USE bamazonDB;

CREATE TABLE products(
    item_id integer(11) AUTO_INCREMENT NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    department_name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INTEGER(10) NOT NULL,
    PRIMARY KEY(item_id)
);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES
    ('MacBook Pro 1TB', 'Electronics', 2500.00, 10),
    ('Javascript for Dummies', 'Books', 10.65, 20),
    ('Kayak', 'Outdoor', 450.00, 10),
    ('Tootpaste', 'Personal Care', 2.35, 200),
    ('Cotton Balls', 'Personal Care', 1.9, 200),
    ('Band Aids', 'First Aid', 1.99, 200),
    ('Baseball Gloves', 'Sports', 9.99, 100),
    ('Detergent', 'Home', 14.89, 200),
    ('SQL for Dummies', 'Books', 8.99, 20),
    ('Vitamins', 'Pharmacy', 10.95, 20);
