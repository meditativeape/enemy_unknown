// Unit Prototype

/**
* Prototype for a unit
* @constructor
*/
function Unit(/*int*/ team,/*int*/hp,/*int*/ type, /*Coordinate*/cord, /*int*/stat, /*int*/ cooldown, /*image*/pic){
	this.team = team;
	this.hp = hp;
	this.type = type;
	this.x = cord.X;
	this.y = cord.Y;
	this.status = stat;
	this.cooldown = cooldown;
	this.image = pic;
}

/**
 * Unit Method: Draws this unit to the canvas
 * @this {Unit}
 */
Unit.prototype.draw = function(/*Point*/p, /*int*/height) {
	var ctx = document.getElementById('gameCanvas').getContext('2d');
	ctx.drawImage(this.image, p.X - this.image.width/2, p.Y + height/4 - this.image.height, 
		this.image.width, this.image.height);
};