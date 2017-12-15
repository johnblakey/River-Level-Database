/**
 * Created by jb on 12/9/17.
 * Simple hello world server.
 */

var http = require('http');

http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello sdcommander!\n');
}).listen(200, "0.0.0.0");
console.log('Server running at http://riverlevel:200/');
