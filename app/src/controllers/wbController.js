
var request = require('request');

const auth_url= 'http://auth.hasura/';
const data_url = 'http://data.hasura/';
const admin_headers = {
	'Content-Type' : 'application/json;charset=utf-8',
	'X-Hasura-Role' : 'admin',
	'X-Hasura-User-Id' : 1
};

var get_server_groups = (req, res) => {
	var options = {
		url: data_url + 'v1/query',
		method: 'POST',
		headers: admin_headers,
		body: JSON.stringify({
			"args": {
				"table": "group_info",
				"columns": [ "id", "name" ]
			},
			"type": "select"
		})
	}

	request(options, function(err, response, body) {
		if (err) {
			console.error("Could not connect to APIs : " + err);
			res.status(500).send('Internal error: ' + err);
			return;
		}

		if (response.statusCode !== 200) {
			console.error('Auth API bad request');
			res.status(500).send('Internal error: Could not connect to auth APIs');
			return;
		}

		if (response.statusCode === 200) { res.send(body); }
	});
};

// Definition of all web routes here
module.exports = function(app, io) {
	var user_auth_token;
	
	function requireLogin(req, res, next) {
		user_auth_token = req.headers['x-hasura-session-id'];
		if (user_auth_token === undefined) {
			res.redirect("/"); 
		} else {
			next();
		}
	}

	app.get('/', function (req, res) {
		res.render('base');
	});

	app.get('/app', function (req, res) {
		res.render('whiteboard');
	});

	app.get('/welcome-msg', function (req, res) {
		res.render('partials/welcome-msg');
	});
	app.get('/login-content', function (req, res) {
		res.render('partials/login-content');
	});
	app.get('/signup-content', function (req, res) {
		res.render('partials/signup-content');
	});
	app.get('/groups', get_server_groups);

	// Socket routes
	io.on('connection', (socket) => {
		console.log("User #" + socket.id + " connected");
		
		// Socket events
		socket.on('disconnect', () => {
			console.log("User #" + socket.id + " disconnected");
		});

		socket.on('clear', () => { socket.broadcast.emit('clear'); });
		socket.on('draw-data', (data) => {
			socket.broadcast.emit('draw', { 'data': data });
		});
	});
};
