var express = require('express');
var request = require('request');
var wbController = require('./controllers/wbController');

var app = express();
var path = require('path');

// set up template engine
app.set('view engine', 'ejs');

// static files
app.use(express.static('public'));

// fire controllers
wbController(app);


var port = 8080; // Use 8080 for local development because you might already have apache running on 80
app.listen(8080, function () {
  console.log(`White Board app listening on port ${port}!`);
});
