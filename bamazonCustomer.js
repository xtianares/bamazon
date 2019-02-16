let mysql = require("mysql"),
    inquirer = require("inquirer");

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
        name: "who",
        type: "list",
        message: "Who are you?",
        choices: [
            "Customer",
            "Manager",
            "Supervisor",
            "I Dont know!"
        ]
    })
    .then(function(answer) {
        switch (answer.who) {
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
