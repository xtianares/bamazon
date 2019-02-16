let mysql = require("mysql"),
    inquirer = require("inquirer"),
    Table = require('cli-table'); // use to disoplay pretty tables in the console

var connection = mysql.createConnection({
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
        message: "Are a customer, manager or supervisor?",
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
            customerInit();
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

let customerInit = () => {
    var query = "SELECT * FROM products";
    connection.query(query, function(err, res) {
        var table = new Table ({
            head: ["Sku", "Product", "Department", "Price", "Stock"],
            colWidths: [10, 35, 25, 10, 10]
        });
        res.forEach((item, index) => {
            let {item_id, product_name, department_name, price, stock_quantity} = item;
            let itemArr = [item_id, product_name, department_name, price, stock_quantity];
            table.push(itemArr);
        });
        console.log(table.toString());

        // ask customer what he/she wants to buy
        buy(res);
    });
}

let buy = (res) => {
    inquirer.prompt([
        {
            name: "item_id",
            type: "input",
            message: "Enter the Sku of the item you want to buy.",
            choices: [
                "Customer",
                "Manager",
                "Supervisor",
                "I Dont know!"
            ]
        },
        {
            name: "quantity",
            type: "input",
            message: "Enter the quantity."
        }
    ])
    .then(function(input) {
        console.log(input.quantity + " " + res[input.item_id - 1].product_name + " added to you cart ");
    });
}
