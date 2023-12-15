const fs = require('fs');
// Express importieren
const express = require('express');

// Express initialisieren
const app = express();

// Port definieren (optional)
const port = 3000;

// CORS (Cross Origin Ressource Sharing) aktivieren
const cors = require('cors');

// MySQL als Konstante
const mysql = require('mysql2');

//dotenv package initialisieren
const { config } = require('dotenv');

// Check if the .env file exists
if (config().parsed == undefined) {
    console.error('Error: .env file is missing (copy/adapt .env.example and rename it to .env)');
    process.exit(1); // Exit the process with an error code
}


// Debug-Ausgabe für Umgebung
if (process.env.ENABLE_DEBUG == "TRUE") {
    console.log("env:", process.env);
}

// CORS Options definieren
var corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

// Express mit Json Req/Res aktivieren
app.use(express.json(), cors(corsOptions));

// This will catch unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Datenbank Verbindung mit Umgebungsvariablen
function getConnection() {
    const requiredEnvVariables = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
    const missingVariables = requiredEnvVariables.filter(key => !process.env[key]);
    if (missingVariables.length > 0)
        console.error(`Error: Missing required environment variables: ${missingVariables.join(', ')}`);
    try {
        var cnx = mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });


    } catch (error) {
        console.error("Database connection error", error);
    }

    // run sample query to check DB setup
    // try to execute code that might fail
    try {
        cnx.query('SELECT * FROM todos;', function (error, results, fields) {
            if (error) {
                console.log("mySQL Error:", error);
                process.exit(1); // exit
            } else {
                console.log("SQL Connection Self-Check: Ok");
                console.log("DB Connection set up successfully");
                console.log('Connected to MySQL as id ' + cnx.threadId);
            }
        });
    } catch (error) {
        // An error occurred
        console.error("SQL Schema Error: Could not retrieve todo list (see sql-scripts for DB setup)", error);
    }
    return cnx;
}
const cnx = getConnection();

// GET Route um eine Liste aller Einträge zu erhalten
app.get('/todos', (req, res) => {
    try {
        cnx.query('SELECT * FROM todos;', function (error, results, fields) {
            if (error) throw error;
            res.json({ "todos": results });
        });
        // try to execute code that might fail
    } catch (error) {
        // An error occurred
        console.error("Could not retrieve todo list", error);
    }
});
// GET one specific item by id
app.get('/todo/:id', (req, res) => {
    // console.log("REQ", req);
    try {
        cnx.query('SELECT * FROM todos WHERE id =?', req.params.id, function (error, results, fields) {
            if (!error) {
                res.status(200).json({ "todo": results });
            } else {
                res.status(500).json({ "error": "Could not find item with id ", "id": req.params.id });
            }
        });
        // try to execute code that might fail
    } catch (error) {
        // An error occurred
        console.error("Could not retrieve todo list", error);
    }
});

// POST route erstellen
app.post('/todo', (req, res) => {
    try {
        let data = req.body.todo;
        console.log("req:", req.body);
        cnx.query('INSERT INTO todos (description)  VALUES (?);', data, function (error, result) {
            if (!error) {
                let response = JSON.stringify({ "id": result.insertId })
                res.status(200).send(response);
            }

        });
    } catch (error) {
        // Es ist ein Fehler aufgetreten!
        console.error("Could not retrieve todo key", error);
    }
});

//Todo Item mit PUT zu aktualisieren
app.put('/todo/:id', (req, res) => {
    try {
        let sql = `UPDATE todos
            SET status = CASE
            WHEN status = 'open' THEN 'in progress'
            WHEN status = 'in progress' THEN 'finished'
            ELSE status
        END
        WHERE id = ?;`;
        let id = req.params.id;

        cnx.query(sql, id, function (error, result) {
            if (!error && result.affectedRows) {
                console.log("put successful");
                res.status(200).send(JSON.stringify({ "affected-rows": result.affectedRows }));
            } else {
                console.error("Affected rows:", result.affectedRows);
                console.error("put error:", error);
                // 500 not found 
                res.status(500).json({ "affected-rows": 0 });
            }
        }); // query

        // Überprüfung ob auf id zugegriffen kann  
        // res.status(200).send(`todo update item: ${req.params.id}`);
    } catch (error) {
        // Es ist ein Fehler aufgetreten!
        console.error("Could not retrieve todo key", error);
    }

});

// neu route mit patch wurde hier definiert 
app.patch('/todo/:id', (req, res) => {
    try {
        let sql = "UPDATE todos SET description = ? WHERE id = ?;";
        let id = req.params.id;
        let todo = req.body.todo;
        cnx.query(sql, [todo, id], function (error, result) {
            if (!error && result.affectedRows) {
                res.status(200).json({ "id": id, "message": "item successfully updated" });
            } else {
                res.status(404).send({ "id": id, "message": "error updating item", "error": error });
            }
        }); // query

        // Überprüfung ob auf id zugegriffen kann  
        // res.status(200).send(`todo update item: ${req.params.id}`);
    } catch (error) {
        // Es ist ein Fehler aufgetreten!
        console.error("Could not retrieve todo key", error);
    }

});


// neue delete route erstellt
app.delete('/todo/:id', (req, res) => {
    try {
        let sql = "DELETE FROM todos WHERE id = ?;";
        let id = req.params.id;
        cnx.query(sql, id, function (error, result) {
            if (!error && result.affectedRows) {
                res.status(200).json({ "action": "delete", "affected-rows": result.affectedRows });
            } else {
                res.status(500).json({ "action": "delete", "affected-rows": 0 });
            }
        });
        // Überprüfung ob auf id zugegriffen kann  
    } catch (error) {
        // Es ist ein Fehler aufgetreten!
        console.error("Could not retrieve todo key", error);
    }
});

// localhost listen port app 
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
