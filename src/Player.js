var Entity = require('./Entity.js');
var Arrow = require('./Arrow.js');

class Player extends Entity
{
	constructor(id)
	{
		super();
		this.id = id;
		this.number = "" + Math.floor(10 * Math.random());
		this.keyRight = false;
		this.keyLeft = false;
		this.keyUp = false;
		this.keyDown = false;
		this.keyAttack = false;
		this.mouseAngle = 0;
		this.maxVel = 7;
		this.direction = 'down';
		this.isMoving = false;
	}

	update()
	{
		this.updateVelocity();
		super.update();

		if(this.keyAttack)
		{
			this.shootArrow(this.mouseAngle);
		}
	}

	shootArrow(angle)
	{
		let a = new Arrow(this.id, angle);
		a.position.x = this.position.x;
		a.position.y = this.position.y;
		Arrow.list[a.id] = a;
	}
	
	updateVelocity()
	{
		if(this.keyRight)
		{
			this.velocity.x = this.maxVel;
			this.velocity.y = 0;
			this.direction = 'right';
			this.isMoving = true;
		}
		else if(this.keyLeft)
		{
			this.velocity.x = -this.maxVel;
			this.velocity.y = 0;
			this.direction = 'left';
			this.isMoving = true;
		}
		else if(this.keyDown)
		{
			this.velocity.y = this.maxVel;
			this.velocity.x = 0;
			this.direction = 'down';
			this.isMoving = true;
		}
		else if(this.keyUp)
		{
			this.velocity.y = -this.maxVel;
			this.velocity.x = 0;
			this.direction = 'up';
			this.isMoving = true;
		}
		else
		{
			this.velocity.x = 0;
			this.velocity.y = 0;
			this.isMoving = false;
		}
	}
}

Player.list = {};
Player.onConnect = function(socket)
{
	let player = new Player(socket.id);
	Player.list[socket.id] = player;
	socket.on('keyPress', function(data)
	{
		if(data.inputId === 'left')
			player.keyLeft = data.state;
		else if(data.inputId === 'right')
			player.keyRight = data.state;
		else if(data.inputId === 'up')
			player.keyUp = data.state;
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
		pack.push(
		{
			x:player.position.x, 
			y:player.position.y, 
			number:player.number, 
			direction:player.direction, 
			isMoving:player.isMoving
		})
	}
	return pack;
}

module.exports = Player;

return module.exports;