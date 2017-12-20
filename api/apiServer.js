/**
 * Created by jb on 12/16/17.
 */

const express = require("express");
const bodyParser = require("body-parser");
// sqlite3 to connect to db, .verbose() can be removed to reduce the stack trace
const sqlite3 = require("sqlite3").verbose();
const sqliteJSON = require('sqlite-json');
let exporter;

let app = express();
app.use(bodyParser.json());

/** open sqlite database from local file */
let dbSource = "/home/jb/Development/Production/River-Level-Database/db/levels.db";
let db = new sqlite3.Database(dbSource, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Open connection to database:', dbSource);

    exporter = sqliteJSON(dbSource);    // create instance of sqlite-json

    /* initialize the express app */
    let port = "2000";
    const server = app.listen(port, "0.0.0.0", () => {
        var {address, port} = server.address();
        console.log(`Express app running at http://${address}:${port}`);
    });
});

/** Levels API routes below */

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
    console.log("ERROR: " + reason);
    res.status(code || 500).json({"error": message});
}

/* return all river levels */
let sql = `SELECT siteName, levelValue, unitCode FROM
            rivers
                INNER JOIN
            levels
            ON levels.riverId = rivers.RiverId
                INNER JOIN
            (SELECT MAX(LevelId) lastLevel FROM levels GROUP BY riverId) maxId
            ON levels.LevelId = maxId.lastLevel;`;
app.get("/api/rivers", function(req, res) {
    exporter.json(sql, (err, json) => {
        if (err) {
            console.error(err.message);
        }
        res.send(json);
    });
});

/* return one river level */
app.get("/api/rivers/:id", function(req, res) {
    //TODO implement
});
