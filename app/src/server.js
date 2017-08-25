
var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var wbController = require('./controllers/wbController');

// Use 8080 for local development because you might already have apache running on 80
const port = process.env.PORT || 8080;

var app = express();
var server = require('http').Server(app);
// var io = require('socket.io')(server, { 'transports': ['polling'] });
var io = require('socket.io')(server);
var path = require('path');

// Set up template engine
app.set('view engine', 'ejs');

// Static files
app.use(express.static(__dirname + '/public'));
// JSON pareser
app.use(bodyParser.json());

// Group and sockets data
var groups = [];
var sock_nsp = { root: '/', chat: '/chat' };

// Fire controllers
wbController(app, io, groups, sock_nsp);

server.listen(port, () => {
  console.log(`Whiteboard listening on port ${port}!`);
});
