class Entity 
{
	constructor()
	{
		this.position = {x:250,y:250};
		this.velocity ={x:0,y:0};
		this.id = "";
	}
	update()
	{
		this.updatePosition();
	}
	updatePosition()
	{
		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;
	}
	getDistance(point)
	{
		return Math.sqrt(Math.pow(this.position.x-point.position.x,2) + Math.pow(this.position.y-point.position.y,2));
	}
}
module.exports = Entity;

return module.exports;
/*
var Player = function(id)
{
	var self = Entity();
	self.id = id;
	self.number = "" + Math.floor(10 * Math.random());
	self.keyRight = false;
	self.keyLeft = false;
	self.keyUp = false;
	self.keyDown = false;
	self.keyAttack = false;
	self.mouseAngle = 0;
	self.maxSpd = 3;

	var super_update = self.update;
	self.update = function()
	{
		self.updateSpd();
		super_update();

		if(self.keyAttack)
		{
			self.shootArrow(self.mouseAngle);
		}
	}

	self.shootArrow = function(angle)
	{
		var a = Arrow(self.id, angle);
		a.x = self.x;
		a.y = self.y;
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
		else if(data.inputId === 'attack')
			player.keyAttack = data.state;
		else if(data.inputId === 'mouseAngle')
			player.mouseAngle = data.state;
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


var Arrow = function(parent,angle)
{
	var self = Entity();
	self.id = Math.random();
	self.spdX = Math.cos(angle/180*Math.PI) * 10;
	self.spdY = Math.sin(angle/180*Math.PI) * 10;
	self.parent = parent;
	self.timer = 0;
	self.toRemove = false;
	var super_update = self.update;
	self.update = function()
	{
		if(self.timer++ > 100)
			self.toRemove = true;
		super_update();

		for(var i in Player.list)
		{
			var p = Player.list[i];
			if(self.getDistance(p) < 32 && self.parent !== p.id)
			{
				//handle health lose
				self.toRemove = true;
			}
		}
	}
	Arrow.list[self.id] = self;
	return self;
} 
Arrow.list = {};
Arrow.update = function()
{
	var pack = [];
	for(var i in Arrow.list)
	{
		var arrow = Arrow.list[i];
		arrow.update();
		if(arrow.toRemove)
			delete Arrow.list[i];
		else
			pack.push({x:arrow.x, y:arrow.y,})
	}
	return pack;
}
*/