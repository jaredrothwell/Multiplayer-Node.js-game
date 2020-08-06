var Entity = require('./Entity.js');

class Arrow extends Entity
{
	constructor(parent, angle)
	{
		super();
		this.velocity = {x:Math.cos(angle/180*Math.PI) * 10,y:Math.sin(angle/180*Math.PI) * 10};
		this.id = Math.random();
		this.parent = parent;
		this.timer = 0;
		this.toRemove = false;
	}
	update()
	{
		if(this.timer++ > 100)
			this.toRemove = true;
		super.update();
	}
	collision(Players)
	{
		for(var player in Players)
		{
			if(this.getDistance(player) < 80 && this.parent !== player.id)
			{
				//handle health lose
				this.toRemove = true;
			}
		}
	}
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
			pack.push({x:arrow.position.x, y:arrow.position.y,})
	}
	return pack;
}

module.exports = Arrow;

return module.exports;