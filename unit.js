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
Unit.prototype.draw = function(/*Camera*/camera) {

	//TODO
	
};