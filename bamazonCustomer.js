let mysql = require("mysql"),
    inquirer = require("inquirer"),
    Table = require('cli-table3'), // use to disoplay pretty tables in the console
    total = 0; // total amount due

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
        message: "Are you a customer, manager or supervisor?",
        choices: [
            "Customer",
            "Manager",
            "Supervisor",
            "I Dont know!"
        ]
    })
    .then(function(input) {
        switch (input.whoThis) {
        case "Customer":
            customer.init();
            break;
        case "Manager":
            managerInit();
            break;
        case "Supervisor":
            supervisorInit();
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
    updateInventory: (res, sku, quantity) => {
        let newQty = (res[sku - 1].stock_quantity - quantity);
        if(newQty >= 0) {
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
    },
    buy: (res) => {
        inquirer.prompt([
            {
                name: "item_id",
                type: "input",
                message: "Enter the Sku of the item you want to buy:",
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
    }
}
