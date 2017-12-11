/**
 * Created by jb on 12/9/17.
 * http://www.sqlitetutorial.net/sqlite-nodejs/connect/
 * // refactor into separate files eventually
 */

// https package for getting json data
const https = require('https');

// sqlite3 to connect to db, .verbose() can be removed to reduce the stack trace
const sqlite3 = require('sqlite3').verbose();

/** json from waterservices.usgs.gov */
function getData() {
    var url = "https://waterservices.usgs.gov/nwis/iv/?format=json&sites=09058000,06719505&parameterCd=00060&siteStatus=all"

    // json response variable
    var usgsJSON;

    https.get(url, function(response){
        var body = '';

        response.on('data', function(chunk){
            body += chunk;
        });

        response.on('end', function(){
            usgsJSON = JSON.parse(body);
            dbUtility(usgsJSON);
        });
    }).on('error', function(err){
        console.error(err.message);
    });
}

function insertValues(db, usgs) {
    /* execute each sql query in order */
    db.serialize(function() {
        let sql;    // sql query variable

        console.log("JSON received, one test level value: ", usgs.value.timeSeries[1].values[0].value[0].value);
        // iterate through given series
        for (var i in usgs.value.timeSeries) {
            /* insert new json data */
            var level = usgs.value.timeSeries[i].values[0].value[0].value;
            var dateTime = usgs.value.timeSeries[i].values[0].value[0].dateTime;
            console.log(level);
            console.log(dateTime);

            //TODO turn into function, add logic to prevent same data added, webstorm hints
            /* insert data into table */
            db.run(`INSERT INTO levels (levelValue, dateTime) VALUES (?,?)`, [level, dateTime], function(err) {
                if (err) {
                    return console.log(err.message);
                }
                // get the last insert id
                console.log(`A row has been inserted with rowid ${this.lastID}`);
            });

        }

        /** debugging display of results of tables */
        /* display all levels rows */
        sql = "SELECT * FROM levels;";
        db.all(sql, [], (err, rows) => {
            if (err) {
                console.error(err.message);
            }
            rows.forEach((row) => {
                console.log(row);
            });
        });

        /* display one levels row */
        sql = "SELECT * FROM levels;";
        db.get(sql, function(err, rows) {
            if (err) {
                console.error(err.message);
            }
            console.log(rows);
        });

        /* display all rivers rows */
        sql = "SELECT * FROM rivers;";
        db.all(sql, [], function(err, rows) {
            if (err) {
                console.error(err.message);
            }
            rows.forEach((row) => {
                console.log(row);
            });
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

/** sqlite db modify with json data */
function dbUtility(usgs) {

    // need a pre-populated river list (mvp complete with 2 rivers)

    /* open database from local file */
    let dbSource = "../levels.db";
    let db = new sqlite3.Database(dbSource, sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Open connection to database:', dbSource);

        insertValues(db, usgs);
    });

}

// main start
getData();



