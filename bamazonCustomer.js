let mysql = require("mysql"),
    inquirer = require("inquirer"),
    Table = require('cli-table3'), // use to disoplay pretty tables in the console
    total = 0, // total amount due
    skus = [];

let connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazonDB"
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    storeInit();
});

let storeInit = () => {
    inquirer.prompt({
        name: "whoThis",
        type: "list",
        message: "Are you a customer or the manager?",
        choices: [
            "Customer",
            "Manager",
            // "Supervisor",
            "I Dont know!"
        ]
    })
    .then(function(input) {
        switch (input.whoThis) {
        case "Customer":
            customer.init();
            break;
        case "Manager":
            manager.init();
            break;
        case "Supervisor":
            supervisor.init();
            break;
        case "I Dont know!":
            connection.end();
            break;
        }
    });
}

const customer = {
    init: (current) => {
        let query = "SELECT * FROM products";
        connection.query(query, function(err, res) {
            if(err) throw err;
            if (!current) {
                let table = new Table ({
                    head: ["Sku", "Product", "Department", "Price", "Stock"],
                    colWidths: [10, 30, 20, 10, 10]
                });
                res.forEach((item, index) => {
                    let {item_id, product_name, department_name, price, stock_quantity} = item;
                    let itemArr = [item_id, product_name, department_name, price.toFixed(2), stock_quantity];
                    table.push(itemArr);
                    skus.push(item_id);
                });
                console.log(table.toString());

                // ask customer what he/she wants to buy
                customer.buy(res);
            }
            else {
                customer.buyMore(res);
            }
        });
    },
    buy: (res) => {
        inquirer.prompt([
            {
                name: "item_id",
                type: "input",
                message: "Enter the 'Sku' of the item you want to buy:",
            },
            {
                name: "quantity",
                type: "input",
                message: "Enter the quantity:"
            }
        ])
        .then(function(input) {
            customer.updateInventory(res, input.item_id, input.quantity);
        });
    },
    buyMore: (res) => {
        inquirer.prompt([
            {
                name: "more",
                type: "confirm",
                message: "Do you want to buy another item?"
            }
        ])
        .then(function(input) {
            if (input.more) {
                customer.init();
            }
            else {
                console.log("Total amount due: $" + total.toFixed(2));
                connection.end();
            }
        });
    },
    updateInventory: (res, sku, quantity) => {
        // console.log(skus.indexOf(sku));
        if (skus.indexOf(parseFloat(sku)) < 0){
            console.log("Sku '" + sku + "' does not exist. Please try again.");
            customer.buy(res);
        }
        else {
            let newQty = (res[sku - 1].stock_quantity - quantity);
            if (newQty >= 0) {
                let query = "UPDATE products SET stock_quantity = ? WHERE item_id = ?";
                connection.query(query, [newQty, sku], function(err) {
                    if(err) throw err;
                    console.log(quantity + " " + res[sku - 1].product_name + " added to your cart.");
                    total += quantity * res[sku - 1].price;
                    customer.init(true);
                });
            }
            else {
                console.log("Not enough inventory.");
                customer.buy(res);
            }
        }
    }
}

const manager = {
    init: (current) => {
        let question = current ? 'What else do you want to do?' : "What would you like to do?";
        inquirer.prompt({
            name: "task",
            type: "list",
            message: question,
            choices: [
                "View Products for Sale",
                "View Low Inventory",
                "Add to Inventory",
                "Add New Product",
                "Exit"
            ]
        })
        .then(function(input) {
            switch (input.task) {
            case "View Products for Sale":
                manager.viewInventory();
                break;
            case "View Low Inventory":
                manager.viewLowInventory();
                break;
            case "Add to Inventory":
                manager.addInventory();
                break;
            case "Add New Product":
                manager.addNewProduct();
                break;
            case "Exit":
                connection.end();
                break;
            }
        });
    },
    viewInventory: () => {
        let query = "SELECT * FROM products";
        connection.query(query, function(err, res) {
            if(err) throw err;
            let table = new Table ({
                head: ["Sku", "Product", "Department", "Price", "Stock"],
                colWidths: [10, 30, 20, 10, 10]
            });
            res.forEach((item, index) => {
                let {item_id, product_name, department_name, price, stock_quantity} = item;
                let itemArr = [item_id, product_name, department_name, price.toFixed(2), stock_quantity];
                table.push(itemArr);
            });
            console.log(table.toString());
            manager.init(true);
        });
    },
    viewLowInventory: () => {
        let query = "SELECT * FROM products WHERE stock_quantity <= 5";
        connection.query(query, function(err, res) {
            if(err) throw err;
            let table = new Table ({
                head: ["Sku", "Product", "Department", "Price", "Stock"],
                colWidths: [10, 30, 20, 10, 10]
            });
            res.forEach((item, index) => {
                let {item_id, product_name, department_name, price, stock_quantity} = item;
                let itemArr = [item_id, product_name, department_name, price.toFixed(2), stock_quantity];
                table.push(itemArr);
            });
            console.log(table.toString());
            manager.init(true);
        });
    },
    addInventory: () => {
        let query = "SELECT * FROM products";
        connection.query(query, function(err, res) {
            if (err) throw err;
            inquirer.prompt([{
                name: "sku",
                type: "input",
                message: "Enter the 'Sku' of the product you want to update."
            },
            {
                name: "quantity",
                type: "input",
                message: "How many do you want to add?"
            }])
            .then(function(answer) {
                let product,
                    skuActive = false;
                res.forEach((item, index) => {
                    if (item.item_id == answer.sku) {
                        product = item;
                    }
                });

                if (product !== undefined) {
                    let query = "UPDATE products SET stock_quantity = ? WHERE item_id = ?";
                    connection.query(query, [product.stock_quantity + parseFloat(answer.quantity), answer.sku
                    ], function(error) {
                        if (error) throw err;
                        console.log("Inventory updated!");
                        manager.init(true);
                    });
                }
                else {
                    console.log("Product with sku '" +  answer.sku + "' does not exist.");
                    manager.init(true);
                }
            });
        });
    },
    addNewProduct: () => {
        inquirer.prompt([{
            name: "product",
            type: "input",
            message: "Product name?"
        },
        {
            name: "department",
            type: "input",
            message: "Department name?"
        },
        {
            name: "price",
            type: "input",
            message: "Product price?"
        },
        {
            name: "quantity",
            type: "input",
            message: "Quantity?"
        }])
        .then(function(answer) {
            let {product, department, price, quantity} = answer;
            let query = "INSERT INTO products (product_name, department_name, price, stock_quantity) ";
                query += "VALUES ('" + product + "', '" + department + "', " + parseFloat(price) + ", " + parseFloat(quantity) + ")";
            // console.log(query);
            connection.query(query, function(err, res) {
                console.log("New product added.");
                manager.init(true);
            });
        });
    }
}
