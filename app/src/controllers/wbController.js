
// Server request configs
const auth_url= 'http://auth.hasura/';
const data_url = 'http://data.hasura/';
const admin_headers = {
    'Content-Type' : 'application/json;charset=utf-8',
    'X-Hasura-Role' : 'admin',
    'X-Hasura-User-Id' : 1
};

var socketMap = {};

// Definition of all web routes here
module.exports = function(app, io, groups, sock_nsp) {
	function requireLogin(req, res, next) {
		let user_auth_token = req.headers['x-hasura-session-id'];
		if (user_auth_token === undefined) { res.redirect("/");  }
		else { next(); }
	}

	function fastForward(req, res, next) {
		let user_auth_token = req.headers['x-hasura-session-id'];
		if (user_auth_token !== undefined) { res.redirect("/app");  }
		else { next(); }
	}

	// GET routes
	app.get('/', fastForward, function (req, res) {
		res.render('base');
	});
	app.get('/app',  function (req, res) {
		res.render('whiteboard');
	});

	io.of(sock_nsp.root).on('connection', (socket) => {
		socket.on('init', (id, username) => {
			socket.uid = id; socket.username = username;
			if (!socketMap[id]) socketMap[id] = socket;

			// Emit connection feedback to client
			socket.emit('feedback', { "message": 'Connected on root nsp' });
		});

		socket.on('add-user-to-group', (id, group_id) => {
			if (socketMap[id]) {
				socketMap[id].emit(
					'new-group', { "group_id": group_id, "added_by": socket.username }
				);

				// Emit connection feedback to client
				socket.emit('feedback', { "message": 'Member addition notified to user' });
			} else {
				socket.emit('feedback', { "message": 'Member offline. Unable to notify' });
			}
		});

		socket.on('disconnect', () => {
			if (socketMap[socket.uid]) socketMap[socket.uid] = null;
		});
	});

	io.of(sock_nsp.chat).on('connection', (socket) => {
		socket.on('init', (username, group_id) => {
			console.log(username + " connecting on [" + group_id + "]");

			socket.username = username;
			socket.room = "" + group_id; socket.join(socket.room);

			// Notify all others
			socket.broadcast.to(socket.room).emit('connect-notify', { "username": username });
			// Emit connection feedback to client
			socket.emit('feedback', { "message": 'You connected to group ' + group_id });
		});

		socket.on('group-switch', (group_id) => {
			if (group_id == socket.room) return;
			console.log(socket.username + " switching to [" + group_id + "]");

			socket.leave(socket.room);
			socket.room = "" + group_id; socket.join(socket.room);

			// Emit switch feedback to client
			socket.emit('feedback', { "message": 'You switched to group ' + group_id });
		});

		socket.on('push-msg', (message) => {
			socket.broadcast.to(socket.room).emit(
				'new-message', { "username": socket.username, "message": message }
			);
			// Emit message feedback to client
			socket.emit('feedback', { "message": 'Your message was recieved' });
		});

		socket.on('disconnect', () => {
			console.log(socket.username + " disconnecting on [" + socket.room + "]");
			
			socket.leave(socket.room);
			// Notify all others
			socket.broadcast.to(socket.room).emit('disconnect-notify', { "username": socket.username });
		});

		// Canvas operations
		socket.on('canvas-clear', () => {
			socket.broadcast.to(socket.room).emit('canvas-clear');
		});
		socket.on('canvas-draw', (data) => {
			socket.broadcast.to(socket.room).emit('canvas-draw', { 'data': data });
		});
	});
};
