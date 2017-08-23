
var request = require('request');

// const auth_url= 'http://auth.hasura/';
// const data_url = 'http://data.hasura/';
// const admin_headers = {
// 	'Content-Type' : 'application/json;charset=utf-8',
// 	'X-Hasura-Role' : 'admin',
// 	'X-Hasura-User-Id' : 1
// };

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

	app.get('/app', requireLogin, function (req, res) {
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


// Verify user token
		/*var headers = {
			'Content-Type' : 'application/json',
			'X-Hasura-Role' : 'admin',
			'X-Hasura-User-Id' : 1
		};

		var options = {
			url : auth_url + 'user/account/info',
			method : 'POST',
			headers : headers
		}

		request(options, function(err, response, body){
			if(err) {
				console.error("Could not connect to APIs : " + err);
				res.status(500).send('Internal error : ' + err);
				return;
			}

			if (response.statusCode !== 200) {
				console.error('Auth API bad request');
				res.status(500).send('Internal error : Could not connect to auth APIs');
				return;
			}
			
			if (response.statusCode === 200) {
				let user_data = JSON.parse(body);
				let token = user_data['auth_token'];
				if (token === user_auth_token) {
					res.render('app');
				} else {
					res.render('base');
				}

			}
		});*/
