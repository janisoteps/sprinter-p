const express = require('express');
const app = express();
const Base64 = require('js-base64').Base64;
const request = require('request');
const sqlite3 = require('sqlite3').verbose();
var bodyParser = require('body-parser');
app.use(bodyParser.json());

let username = 'jdzikevics';
let password = 'Mierakapi99';
const headers = {
    'Authorization' : 'Basic ' + Base64.encode(username + ":" + password)
};

// Connect to a disk SQLite database
let db = new sqlite3.Database('sprinter1.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to disk db');
});

// Returns all sprints
app.get('/api/sprints', function (req, res) {

    let options = {
        url: 'https://jira.zmags.com/rest/agile/1.0/board/110/sprint',
        headers: headers
    };

    function callback(error, response, body){
        if (!error && response.statusCode === 200) {
            let info = JSON.parse(body);
            res.send(info);
        }
    }

    request(options, callback);
});

// Retrieves tickets of a specified sprint
app.get('/api/tickets/:id', function (req, res) {

    console.log(req.params);

    let options = {
        url: 'https://jira.zmags.com/rest/agile/1.0/sprint/' + req.params.id + '/issue',
        headers: headers
    };

    function callback(error, response, body){
        if (!error && response.statusCode === 200) {
            let info = JSON.parse(body);

            // console.log(info);

            let sql = `SELECT ticket_key, ticket_if_tested ticket_if_tested,
                        ticket_test_steps ticket_test_steps,
                        ticket_result ticket_result,
                        ticket_test_outputs ticket_test_outputs,
                        ticket_integration ticket_integration
                        FROM sprinter_ticket_table_2
                        WHERE sprint_id = ?
                        ORDER BY ticket_key`;

            db.all(sql, [req.params.id], (err, rows) => {
                if (err) {
                    throw err;
                }

                let responseArray = [];
                info['issues'].forEach(ticket => {
                    let ticketKey = ticket['key'];

                    var found = rows.find(function(element) {
                        return element['ticket_key'] === ticketKey;
                    });

                    if(found !== 'undefined'){
                        let newTicket = ticket;
                        newTicket['testing'] = found;
                        responseArray.push(newTicket);
                    } else {
                        let newTicket = ticket;
                        newTicket['testing'] = '';
                        responseArray.push(newTicket);
                    }
                });

                res.send(responseArray);

            });
        }
    }

    request(options, callback);
});

// Only called once in a new database to create ticket data table, sets ticket key to unique (one entry per ticket)
app.get('/api/create-table', function (req, res) {
    db.run(`CREATE TABLE sprinter_ticket_table_2
    (
    ticket_key UNIQUE,
    ticket_if_tested INTEGER,
    ticket_test_steps TEXT,
    ticket_test_outputs TEXT,
    ticket_result TEXT,
    ticket_integration TEXT,
    sprint_id TEXT
    )`);
    res.send('Done');
});

// Create or update ticket data in database
// Since ticket key is unique, it will return error if trying to save with existing key
app.post('/api/update-ticket', function(req, res) {
    console.log(req.body);
    let ticket_key = req.body.ticket_key;
    let ticket_if_tested = req.body.ticket_if_tested;
    let ticket_test_steps = req.body.ticket_test_steps;
    let ticket_result = req.body.ticket_result;
    let ticket_test_outputs = req.body.ticket_test_outputs;
    let ticket_integration = req.body.ticket_integration;
    let sprint_id = req.body.sprint_id;

    console.log(
        'Request ticket key: ', ticket_key,
        ' if tested boolean: ', ticket_if_tested,
        ' test steps: ', ticket_test_steps,
        ' test outputs: ', ticket_test_outputs,
        ' test result: ', ticket_result,
        ' integration test: ', ticket_integration,
        ' sprint id: ', sprint_id
    );

    db.run(`INSERT INTO sprinter_ticket_table_2 (
        ticket_key,
        ticket_if_tested,
        ticket_test_steps,
        ticket_test_outputs,
        ticket_result,
        ticket_integration,
        sprint_id
        )
        VALUES
        (?, ?, ?, ?, ?, ?, ?);`, [
        ticket_key,
        ticket_if_tested,
        ticket_test_steps,
        ticket_test_outputs,
        ticket_result,
        ticket_integration,
        sprint_id
        ], function(err) {
        if (err) {
            console.log(err.message);

            let data = [
                ticket_if_tested,
                ticket_test_steps,
                ticket_result,
                ticket_test_outputs,
                ticket_integration,
                ticket_key
            ];

            let sql = `UPDATE sprinter_ticket_table_2
                        SET ticket_if_tested = ?,
                        ticket_test_steps = ?,
                        ticket_result = ?,
                        ticket_test_outputs = ?,
                        ticket_integration = ?
                        WHERE ticket_key = ?`;

            db.run(sql, data, function(err) {
                if (err) {
                    return console.error(err.message);
                }
                console.log(`Row(s) updated: ${this.changes}`);

                res.send('updated');
            });
        } else {
            console.log('A row has been inserted');

            res.send('created');
        }
    });
});

// Returns all tickets in database
app.get('/api/all-tickets', function (req, res) {

    let sql = `SELECT * FROM sprinter_ticket_table_2`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
        res.send(rows);
    });
});

// Will delete ticket based on it's key
app.get('/api/delete-ticket/:id', function (req, res) {
    let ticketKey = req.params.id;

    // delete a row based on id
    db.run(`DELETE FROM sprinter_ticket_table_2 WHERE ticket_key=?`, ticketKey, function(err) {
        if (err) {
            return console.error(err.message);
        }
        res.send(`Row(s) deleted ${this.changes}`);
    });
});

// Shows ticket based on it's key
app.get('/api/show-ticket/:id', function (req, res) {
    let ticketKey = req.params.id;

    let sql = `SELECT * FROM sprinter_ticket_table_2 WHERE ticket_key=?`;


    db.all(sql, ticketKey, (err, rows) => {
        if (err) {
            throw err;
        }
        res.send(rows);
    });
});

app.use(express.static(__dirname +'./../client')); //serves the index.html
app.listen(3000); //listens on port 3000 -> http://localhost:3000/
