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
		this.colx = 0;
		this.coly = 0;
		this.mouseAngle = 0;
		this.maxVel = 10;
		this.direction = 'down';
		this.state = 'idle';
		this.timer = 0;
		this.health = 12;
		this.maxHealth = 12;
		this.power = 1;
		this.iFrames = 0;
	}

	update()
	{
		if(this.state == 'attack')
			this.attack();
		else if(this.playerCollision(this.maxVel) == false)
			this.updateVelocity();
		else
			this.stop('idle')

		super.update();

		if(this.keyAttack)
		{
			this.shootArrow(this.mouseAngle);
		}

		if(this.iFrames-- < 0)
			this.iFrames = 0;
	}

	shootArrow(angle)
	{
		let a = new Arrow(this.id, angle);
		a.position.x = this.position.x;
		a.position.y = this.position.y;
		Arrow.list[a.id] = a;
	}
	attack()
	{
		var dist = 40;
		this.stop('attack')
		if(this.timer++ > 10)
		{
			this.state = 'idle';
			this.timer = 0;
		}

		if(this.direction == 'right')
		{
			this.colx = dist + 35;
			this.coly = 0;
		}
		else if(this.direction == 'left')
		{
			this.colx = -dist - 30;
			this.coly = 0;
		}
		else if(this.direction == 'down')
		{
			this.colx = 0;
			this.coly = dist + 15;
		}
		else if(this.direction == 'up')
		{
			this.colx = 0;
			this.coly = -dist - 20;
		}
		for(var i in Player.list)
		{
			var player = Player.list[i];
			if(this.collision(player))
				player.takeDamage(this.power);
		}
		return false;
	}

	takeDamage(damage)
	{
		if(this.iFrames == 0)
		{
			this.health -= damage;
			this.iFrames = 20;
			if(this.health < 0)
				this.health = 0;
		}
	}

	playerCollision(dist)
	{
		if(this.keyRight)
		{
			this.colx = dist;
			this.coly = 0;
			this.direction = 'right';
		}
		else if(this.keyLeft)
		{
			this.colx = -dist;
			this.coly = 0;
			this.direction = 'left';
		}
		else if(this.keyDown)
		{
			this.colx = 0;
			this.coly = dist;
			this.direction = 'down';
		}
		else if(this.keyUp)
		{
			this.colx = 0;
			this.coly = -dist;
			this.direction = 'up';
		}
		else
		{
			this.colx = 0;
			this.coly = 0;
		}
		for(var i in Player.list)
		{
			var player = Player.list[i];
			if(this.collision(player))
				return true;
		}
		return false;
	}

	collision(object)
	{
		if(this.checkCollision(object, this.colx, this.coly, 80, 80, 80, 80) && this.id !== object.id)
			return true;
		return false;
	}
	
	updateVelocity()
	{
		if(this.keyRight)
		{
			this.velocity.x = this.maxVel;
			this.velocity.y = 0;
			this.direction = 'right';
			this.state = 'moving';
		}
		else if(this.keyLeft)
		{
			this.velocity.x = -this.maxVel;
			this.velocity.y = 0;
			this.direction = 'left';
			this.state = 'moving';
		}
		else if(this.keyDown)
		{
			this.velocity.y = this.maxVel;
			this.velocity.x = 0;
			this.direction = 'down';
			this.state = 'moving';
		}
		else if(this.keyUp)
		{
			this.velocity.y = -this.maxVel;
			this.velocity.x = 0;
			this.direction = 'up';
			this.state = 'moving';
		}
		else
		{
			this.stop('idle')
		}
	}
	stop(state)
	{
		this.velocity.x = 0;
		this.velocity.y = 0;
		this.state = state;
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
		{
			player.keyLeft = data.state;
		}
		else if(data.inputId === 'right')
		{
			player.keyRight = data.state;
		}
		else if(data.inputId === 'up')
		{
			player.keyUp = data.state;
		}
		else if(data.inputId === 'down')
		{
			player.keyDown = data.state;
		}
		else if(data.inputId === 'attack')
			player.keyAttack = data.state;
		else if(data.inputId === 'mouseAngle')
			player.mouseAngle = data.state;
		else if(data.inputId === 'sword')
		{
			player.state = 'attack';
		}
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
			state:player.state,
			health:player.health,
		})
	}
	return pack;
}

module.exports = Player;

return module.exports;