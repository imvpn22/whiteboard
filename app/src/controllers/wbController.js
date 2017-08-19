
var request = require('request');

// Definition of all web routes here
module.exports = function(app, io) {
	//var auth_url= 'http://auth.hasura/';
	var user_auth_token;
	
	app.get('/', function (req, res) {
		// user_auth_token = req.headers['x-hasura-session-id'];		
		// if (user_auth_token === undefined) {
		 	res.render('base');
		// } else {
		// 	res.render('whiteboard');
		// }
	});

	app.get('/app', function (req, res) {
		// user_auth_token = req.headers['x-hasura-session-id'];		
		// if (user_auth_token === undefined) {
		// 	res.render('base');
		// } else {
		 	res.render('whiteboard');
		// }
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
		console.log("A user just connected");
		
		// Socket events
		socket.on('disconnect', () => {
			console.log("A user just disconnected");
		});

		socket.on('clear', () => { socket.broadcast.emit('clear'); });
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
