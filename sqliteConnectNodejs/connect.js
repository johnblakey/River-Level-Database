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

https.get(url, function(res){
    var body = '';

    res.on('data', function(chunk){
        body += chunk;
    });

    res.on('end', function(){
        usgsJSON = JSON.parse(body);
        console.log("Got a response: ", usgsJSON.value.timeSeries[1].values[0].value[0].value);
    });
}).on('error', function(e){
    console.log("Got an error: ", e);
});

// need a pre-populated river list


// parse usgs json and upload to db
//json.forEach(function);

/** sqlite db */
// .verbose() can be removed to reduce the stack trace
const sqlite3 = require('sqlite3').verbose();

// open the database (note the hardcoded location of the db)
let db = new sqlite3.Database('../levels.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the levels database.');
});

let sql = "SELECT * FROM levels;";

// execute each sql query in order
db.serialize(function() {
    db.get(sql, function(err, rows) {
        console.log(err);
        console.log(rows);
    });
});

    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Close the database connection.');
});