
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
var PLAYER_LIST = {};

var Player = function(id)
{
	var self = 
	{
		x:250,
		y:250,
		id:id,
		number:"" + Math.floor(10 * Math.random()),
		keyRight:false,
		keyLeft:false,
		keyUp:false,
		keyDown:false,
		maxSpd:10
	}
	self.updatePosition = function()
	{
		if(self.keyRight)
			self.x += self.maxSpd;
		if(self.keyLeft)
			self.x -= self.maxSpd;
		if(self.keyup)
			self.y -= self.maxSpd;
		if(self.keyDown)
			self.y += self.maxSpd;
	}
	return self;
}

var io = require('socket.io') (serv, {});
io.sockets.on('connection', function(socket)
{
	socket.id = Math.random();
	SOCKET_LIST[socket.id] = socket;

	var player = Player(socket.id);
	PLAYER_LIST[socket.id] = player;
	console.log('socket connection');
	socket.emit('serverMsg', {msg:'Connected to Server',});
	socket.on('disconnect', function()
	{
		delete SOCKET_LIST[socket.id];
		delete PLAYER_LIST[socket.id];
	});

	socket.on('keyPress', function(data)
	{
		if(data.inputId === 'left')
			player.keyLeft = data.state;
		else if(data.inputId === 'right')
			player.keyRight = data.state;
		else if(data.inputId === 'up')
			player.keyup = data.state;
		else if(data.inputId === 'down')
			player.keyDown = data.state;
	});

});

setInterval(function() 
{
	var pack = [];
	for(var i in PLAYER_LIST)
	{
		var player = PLAYER_LIST[i];
		player.updatePosition();
		pack.push({x:player.x, y:player.y, number:player.number})
	}
	for(var i in SOCKET_LIST)
	{
		var socket = SOCKET_LIST[i];
		socket.emit('newPositions', pack);
	}
	
}, 1000/25);