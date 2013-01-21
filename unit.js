// Unit Prototype

/**
* Prototype for a unit
* @constructor
*/
function Unit(/*int*/ team,/*int*/hp,/*int*/ type, /*Coordinate*/cord, /*int*/stat, /*int*/ cooldown, /*image*/pic){
	this.team = team;
	this.hp = hp;
	this.type = type; //0. Wood 1. Water. 2.Earth. 3.Fire 4.Air undefined.Unknown
	this.range = 3;//TODO
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

Unit.prototype.gotHit = function(/*Unit*/enemy){
	//Wood beats water and earth
	//Water beats earth and fire
	//Earth beats fire and air
	//Fire beats air and wood
	//Air beats wood and water
	var damgage = 10;
	//Calculate type advantage
    var flag = (this.type-enemy.type)%5
	//Enemy advantage
    if (flag>2){
    	this.hp = this.hp  
		enemy.hp = enemy.hp
	}
	//My advantage
    else if (flag!=0){
        this.hp = this.hp
		enemy.hp = enemy.hp
	}
    else{
        this.hp = this.hp
		enemy.hp = enemy.hp
	}
};