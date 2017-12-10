/**
 * Created by jb on 12/9/17.
 * http://www.sqlitetutorial.net/sqlite-nodejs/connect/
 * // refactor into separate files eventually
 */

/** json from waterservices.usgs.gov */
const https = require('https');

var url = "https://waterservices.usgs.gov/nwis/iv/?format=json&sites=09058000,06719505&parameterCd=00060&siteStatus=all"

// json response
var usgsJSON;

https.get(url, function(response){
    var body = '';

    response.on('data', function(chunk){
        body += chunk;
    });

    response.on('end', function(){
        usgsJSON = JSON.parse(body);
        console.log("Got a response: ", usgsJSON.value.timeSeries[1].values[0].value[0].value);
    });
}).on('error', function(err){
    console.error(err.message);
});

// need a pre-populated river list (mvp complete with 2 rivers)

// parse usgs json and upload to db
//json.forEach(function);

/** sqlite db modify with json data */
// .verbose() can be removed to reduce the stack trace
const sqlite3 = require('sqlite3').verbose();


/* open database from local file */
let dbSource = "../levels.db";
let db = new sqlite3.Database(dbSource, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Open connection to database:', dbSource);
});

/* execute each sql query in order */
db.serialize(function() {
    let sql;    // sql query variable

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
    console.log('Close connection to database:', dbSource);
});