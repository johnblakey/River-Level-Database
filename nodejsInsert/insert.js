/**
 * Created by jb on 12/9/17.
 * http://www.sqlitetutorial.net/sqlite-nodejs/connect/
 * TODO refactor into separate files
 */

// https package for getting json data
const https = require('https');

// sqlite3 to connect to db, .verbose() can be removed to reduce the stack trace
const sqlite3 = require('sqlite3').verbose();

function updateDbStart() {
    getJSON();
}

/** json from waterservices.usgs.gov */
function getJSON() {
    var url = "https://waterservices.usgs.gov/nwis/iv/?format=json&sites=09058000,06719505,07094500&parameterCd=00060&siteStatus=all";

    // json response variable
    var usgsJSON;

    https.get(url, function(response){
        var body = '';

        response.on('data', function(chunk){
            body += chunk;
        });

        response.on('end', function(){
            usgsJSON = JSON.parse(body);
            dbOpen(usgsJSON);
        });
    }).on('error', function(err){
        console.error(err.message);
    });
}

/** sqlite db modify with json data */
function dbOpen(usgs) {

    // need a pre-populated river list (mvp complete with 2 rivers)

    /* open database from local file */
    let dbSource = "../dbRiverLevel/levels.db";
    let db = new sqlite3.Database(dbSource, sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Open connection to database:', dbSource);

        insertSetup(db, usgs);

    });
}

function dbInsert(db, siteCode, level, dateTime, returnList, returnCount) {
    /* copy correct foreign key for insert below */
    let sql = `SELECT RiverId FROM rivers WHERE siteCode = ?`;
    db.get(sql, [siteCode], level, dateTime, (err, riverRow) => {
        if (err) {
            console.error(err.message);
        }
        console.log(riverRow.RiverId);
        /* check if dateTime for siteCode already exists */
        let sql = `SELECT dateTime FROM levels INNER JOIN rivers ON levels.riverId = rivers.RiverId WHERE siteCode = ?`;
        db.get(sql, [siteCode], level, dateTime, (err, levelRow) => {
            if (err) {
                console.error(err.message);
            }
            if (levelRow === undefined) {
                console.log("dateTime does not exist in levels table (insert data)");
                /* insert data into table */
                sql = `INSERT INTO levels (levelValue, dateTime, riverId) VALUES (?,?,?)`;
                db.run(sql, [level, dateTime, riverRow.RiverId], function(err) {
                    if (err) {
                        console.error(err.message);
                    }
                    // get the last insert id
                    console.log(`levels table insertion added LevelId: ${this.lastID}`);
                    // send end signal and check if all end signals were received
                    returnList.push(0);
                    if (returnList.length === returnCount) {
                        close(db);
                    }
                });
            } else {    // dateTime exists
                let message = "River level entry already exists (do not insert data), datTime:";
                console.log(message, levelRow);
                // send end signal and check if all end signals were received
                returnList.push(0);
                if (returnList.length === returnCount) {
                    close(db);
                }
            }
        });
    });
}

function close(db) {
    /** debugging display of results of tables */
    console.log("======== levels table entries ========");
    /* display all levels rows */
    let sql = "SELECT * FROM levels;";
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error(err.message);
        }
        rows.forEach((row) => {
            console.log(row);
        });
    });
    /* Close database */
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Close connection to database');
    });
}

function insertSetup(db, usgs) {
    /* execute each sql query in order */
    db.serialize(function() {
        // variables to track successful insertions
        returnCount = usgs.value.timeSeries.length;
        returnList = [];

        for (var i in usgs.value.timeSeries) {
            /* insert new json data */
            // Note this is a closure to allow the for loop 'i' to be captured
            (function(counter) {
                var level = usgs.value.timeSeries[counter].values[0].value[0].value;
                var dateTime = usgs.value.timeSeries[counter].values[0].value[0].dateTime;
                var siteCode = usgs.value.timeSeries[counter].sourceInfo.siteCode[0].value;

                dbInsert(db, siteCode, level, dateTime, returnList, returnCount);

            })(i);
        }
    });
}

// main start
updateDbStart();
