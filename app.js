
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

var Entity = function()
{
	var self =
	{
		x:250,
		y:250,
		spdX:0,
		spdY:0,
		id:"",
	}
	self.update = function()
	{
		self.updatePosition();
	}
	self.updatePosition = function()
	{
		self.x += self.spdX;
		self.y += self.spdY;
	}
	return self;
}

var Player = function(id)
{
	var self = Entity();
	self.id = id;
	self.number = "" + Math.floor(10 * Math.random());
	self.keyRight = false;
	self.keyLeft = false;
	self.keyUp = false;
	self.keyDown = false;
	self.maxSpd = 3;

	var super_update = self.update;
	self.update = function()
	{
		self.updateSpd();
		super_update();
	}
	
	self.updateSpd = function()
	{
		if(self.keyRight)
			self.spdX += self.maxSpd;
		else if(self.keyLeft)
			self.spdX -= self.maxSpd;
		else
			self.spdX = 0;

		if(self.keyup)
			self.spdY -= self.maxSpd;
		else if(self.keyDown)
			self.spdY += self.maxSpd;
		else
			self.spdY = 0;
	}
	Player.list[id] = self;
	return self;
}
Player.list = {};
Player.onConnect = function(socket)
{
	var player = Player(socket.id);
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
}
Player.onDisconnect = function(socket)
{
	delete Player.list[socket.id];
}
Player.update = function()
{
	var pack = [];
	for(var i in Player.list)
	{
		var player = Player.list[i];
		player.update();
		pack.push({x:player.x, y:player.y, number:player.number})
	}
	return pack;
}


var Arrow = function(angle)
{
	var self = Entity();
	self.id = Math.random();
	self.spdX = Math.cos(angle/180*Math.PI) * 10;
	self.spdY = Math.sin(angle/180*Math.PI) * 10;

	self.timer = 0;
	self.toRemove = false;
	var super_update = self.update;
	self.update = function()
	{
		if(self.timer++ > 100)
			self.toRemove = true;
		super_update();
	}
	Arrow.list[self.id] = self;
	return self;
} 
Arrow.list = {};
Arrow.update = function()
{
	if(Math.random() < 0.1)
	{
		Arrow(Math.random()*360);
	}

	var pack = [];
	for(var i in Arrow.list)
	{
		var arrow = Arrow.list[i];
		arrow.update();
		pack.push({x:arrow.x, y:arrow.y,})
	}
	return pack;
}

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