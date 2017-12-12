/**
 * Created by jb on 12/9/17.
 * http://www.sqlitetutorial.net/sqlite-nodejs/connect/
 * // refactor into separate files eventually
 */

// https package for getting json data
const https = require('https');

// sqlite3 to connect to db, .verbose() can be removed to reduce the stack trace
const sqlite3 = require('sqlite3').verbose();

function updateDbStart() {
    getData();
}

/** json from waterservices.usgs.gov */
function getData() {
    var url = "https://waterservices.usgs.gov/nwis/iv/?format=json&sites=09058000,06719505&parameterCd=00060&siteStatus=all";

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

function dbInsert(db, siteCode, level, dateTime) {
    /* grab correct foreign key for insert below */
    let sql = `SELECT RiverId FROM rivers WHERE siteCode = ?`;
    db.get(sql, [siteCode], level, dateTime, (err, row) => {
        if (err) {
            console.error(err.message);
        }
        console.log("RiverId", row.RiverId);
        console.log("level", level);
        console.log("dateTime", dateTime);

        /* insert data into table */
        db.run(`INSERT INTO levels (levelValue, dateTime, riverId) VALUES (?,?,?)`, [level, dateTime, row.RiverId], function(err) {
            if (err) {
                console.error(err.message);
            }
            // get the last insert id
            console.log(`A row has been inserted into levels: levelId = ${this.lastID}`);
        });
    });
}

function close(db) {
    /** debugging display of results of tables */
    console.log("Display current tables =========================");
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
    /* Close database */
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Close connection to database');
    });
}

function insertValues(db, usgs) {
    /* execute each sql query in order */
    db.serialize(function() {
        console.log("JSON received, one test level value: ", usgs.value.timeSeries[1].values[0].value[0].value);
        // iterate through given series
        for (var i in usgs.value.timeSeries) {
            /* insert new json data */
            var level = usgs.value.timeSeries[i].values[0].value[0].value;
            var dateTime = usgs.value.timeSeries[i].values[0].value[0].dateTime;
            var siteCode = usgs.value.timeSeries[i].sourceInfo.siteCode[0].value;
            console.log("Iteration:", i);
            console.log(level);
            console.log(dateTime);
            console.log(siteCode);

            (function(counter) {
                var level = usgs.value.timeSeries[counter].values[0].value[0].value;
                var dateTime = usgs.value.timeSeries[counter].values[0].value[0].dateTime;
                var siteCode = usgs.value.timeSeries[counter].sourceInfo.siteCode[0].value;

                // logic to close db after loop is complete
                dbInsert(db, siteCode, level, dateTime);

            })(i);
        }
    });
}

// main start
updateDbStart();
