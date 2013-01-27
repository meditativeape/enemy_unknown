// Unit Prototype

/**
* Prototype for a unit
* @constructor
*/
function Unit(/*int*/ myteam,/*int*/hp,/*int*/ type, /*Coordinate*/cord, /*int*/ cooldown, /*image*/pic){
	this.team = myteam; //Starts from 0
	this.hp = hp;
	this.type = type; //0. Wood 1. Water. 2.Earth. 3.Fire 4.Air undefined.Unknown
	this.range = 2;
	this.x = cord.X;
	this.y = cord.Y;
	this.cooldown = cooldown;
	this.image = pic;
	
	this.ally = function (/*unit*/ target){
		return true;
	}
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
    	this.hp = this.hp - damage; 
		enemy.hp = enemy.hp - floor(damage/2);
	}
	//My advantage
    else if (flag!=0){
        this.hp = this.hp - floor(damage/2);
		enemy.hp = enemy.hp - damage;
	}
    else{
        this.hp = this.hp - damage;
		enemy.hp = enemy.hp - damage;
	}
};

Unit.prototype.die = function(){
}
