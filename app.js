
require('./Entity');

console.log('Starting Server');

var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/', function(req, res)
{
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + 'client'));

serv.listen(2000);

var SOCKET_LIST = {};

var DEBUG = true;

var io = require('socket.io') (serv, {});
io.sockets.on('connection', function(socket)
{
	socket.id = Math.random();
	SOCKET_LIST[socket.id] = socket;
	console.log('socket connection');
	socket.emit('serverMsg', {msg:'Connected to Server',});

	Player.onConnect(socket);
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
	
}, 1000/25);