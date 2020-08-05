
var Player = require('./src/Player.js');
var Arrow = require('./src/Arrow.js');

console.log('Starting Server');
var mongojs = require("mongojs");
var db = mongojs('localhost:27017/Game', ['account']);

var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/', function(req, res)
{
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + '/client'));

serv.listen(2000);

var SOCKET_LIST = {};

var DEBUG = true;

var isValidPassword = function(data, cb)
{
	db.account.find({username:data.username,password:data.password}, function(error, result)
	{
		if(result.length > 0)
			cb(true);
		else
			cb(false);
	});
}

var usernameExists = function(data, cb)
{
	db.account.find({username:data.username}, function(error, result)
	{
		if(result.length > 0)
			cb(true);
		else
			cb(false);
	});
}

var addUser = function(data, cb)
{
	db.account.insert({username:data.username,password:data.password}, function(error)
	{
		cb();
	});
}
var io = require('socket.io') (serv, {});
io.sockets.on('connection', function(socket)
{
	socket.id = Math.random();
	SOCKET_LIST[socket.id] = socket;
	console.log('socket connection');
	socket.emit('serverMsg', {msg:'Connected to Server',});

	socket.on('signIn', function(data)
	{
		isValidPassword(data, function(result)
		{
			if(result)
			{
				Player.onConnect(socket);
				socket.emit('signInResponse', {success:true});		
			}
			else
			{
				socket.emit('signInResponse', {success:false});
			}
		});
	});

	socket.on('signUp', function(data)
	{
		usernameExists(data, function(result)
		{
			if(result)
			{
				socket.emit('signUpResponse', {success:false});		
			}
			else
			{
				addUser(data, function()
				{
					socket.emit('signUpResponse', {success:true});
				});
			}
		});
	});

	socket.on('disconnect', function()
	{
		delete SOCKET_LIST[socket.id];
		Player.onDisconnect(socket);
	});

	socket.on('sendMsgToServer', function(data)
	{
		var playerName = ("" + socket.id).slice(2, 7);
		for(var i in SOCKET_LIST)
		{
			SOCKET_LIST[i].emit('addToChat', playerName + ': ' + data);
		}
	});

	socket.on('evalServer', function(data)
	{
		if(!DEBUG)
			return;
		
		var res = eval(data);
		console.log(res);
		socket.emit('evalAnswer', res);
	});
});

setInterval(function() 
{
	var pack = 
	{
		player:Player.update(),
		arrow:Arrow.update(),
	}

	for(var i in SOCKET_LIST)
	{
		var socket = SOCKET_LIST[i];
		socket.emit('newPositions', pack);
	}
	
}, 1000/50);