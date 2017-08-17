// var bodyParser = require('body-parser');
var request = require('request');

// all routs are in this file
module.exports = function(app) {
	var auth_url= 'http://auth.hasura/user/account/info';

	app.get('/test', function (req, res) {
		//var user_role = req.headers['x-hasura-user-role'];
		var user_id = req.headers['x-hasura-user-id'];
		var user_auth_token = req.headers['x-hasura-session-id'];
		//res.send("User ID : " + user_id + " Auth token : " +  user_auth_token  + " Role : " + x-hasura-user-role);		
		res.send(JSON.stringify(req.headers));
		/*// Verify user token
		var headers = {
			'Content-Type' : 'application/json',
			'X-Hasura-Role' : 'user',
			'X-Hasura-User-Id' : 1
		};

		var options = {
			url : auth_url,
			method : 'POST',
			headers : headers
			body : JSON.stringify({
				type : 'select',
				args : {
					table : 'test',
					columns : ['*']
				}	
			})
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
				let user = JSON.parse(body)


			}
		});*/
		
	});

	app.get('/', function (req, res) {
		res.render('base');
	});

	app.get('/app', function (req, res) {
		res.render('whiteboard');
	});

	app.get('/groups', function (req, res) {
		res.render('groups');
	});

	app.get('/profile', function(req,res) {
		res.render('profile');
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
	app.get('/reset-pass-content', function (req, res) {
		res.render('partials/reset-pass-content');
	});

};
