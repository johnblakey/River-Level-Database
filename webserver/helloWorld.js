/**
 * Created by jb on 12/9/17.
 * https://stackoverflow.com/questions/8017674/nodejs-server-not-accessible-from-outside
 */

var http = require('http');

http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello sdcommander!\n');
}).listen(3000, "0.0.0.0");
console.log('Server running at http://riverlevel:3000/');
