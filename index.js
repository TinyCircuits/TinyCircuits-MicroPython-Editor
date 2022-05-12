var express = require('express');
var path = require('path');
var https = require('https');
var fs = require('fs');

// This line is from the Node.js HTTPS documentation.
const options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
};

// Create a service (the app object is just a callback).
var app = express();

app.use('/', express.static(__dirname));

// Create an HTTPS service identical to the HTTP service.
https.createServer(options, app).listen(443);


app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '/dist/html/index.html'));
});

app.get('/code', function (req, res) {
    res.sendFile(path.join(__dirname, '/dist/html/pages/code/code.html'));
});

app.get('/account', function (req, res) {
    res.sendFile(path.join(__dirname, '/dist/html/pages/account.html'));
});