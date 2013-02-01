// Unit Prototype

/**
* Prototype for a unit
* @constructor
*/
var Unit = function(/*int*/player,/*int*/ team,/*int*/hp,/*int*/ type, /*Coordinate*/cord, /*int*/ cooldown, /*image*/pic){
	this.player = player; //Starts from 0
	this.team = team; //Starts from 0
	this.hp = hp;
	this.type = type; //0. Wood 1. Water. 2.Earth. 3.Fire 4.Air undefined.Unknown
	this.range = 2;
	this.x = cord.X;
	this.y = cord.Y;
	this.cooldown = cooldown;
	this.image = pic;
}

// server side we export Unit.
if( 'undefined' != typeof global ) {
    module.exports = Unit;
}

Unit.prototype.setcd = function(/*int*/ time){
	this.cooldown = time;
	var self = this;
	var cding = window.setInterval(function(){
			if(self.cooldown>=0){
				self.cooldown = self.cooldown - 0.5;
			}else{
				window.clearInterval(cding);
			}
		}
		,500);

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
	var damage = 100;
	//Calculate type advantage
    var flag = (this.type-enemy.type)%5;
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
	if(this.hp < 0){
		this.hp = 0;
	}
	if(enemy.hp < 0){
		enemy.hp = 0;
	}
};

Unit.prototype.die = function(){
	//TODO
	//Used for unit animation.
};
