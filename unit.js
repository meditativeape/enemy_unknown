// server side we import CONSTANTS
if( 'undefined' != typeof global ) {
    var helper = require("./helper.js");
	var CONSTANTS = helper.CONSTANTS;
}

// Unit Prototype

/**
* Prototype for a unit
* @constructor
*/
var Unit = function(/*int*/player, /*int*/ team, /*int*/hp, /*int*/type, /*Coordinate*/startCoord, /*image*/pic, /*image*/cd, /*int*/showNum){
	this.player = player; //Starts from 0
	this.team = team; //Starts from 0
	this.hp = hp;
	this.type = type; //0.Vampire 1.Wolf 2.Hunter 3.Zombie 4.Wizard 5.Unknown
	this.range = 2;
	this.x = startCoord.X;
	this.y = startCoord.Y;
	this.cooldown = 0;
	this.moved = false;
	this.attacked = false;
    this.heartImage = CONSTANTS.heart;
	this.image = pic;
	this.cd = cd;
	this.attacking = false;
	this.damaged = false;
	this.death = null;
	this.lostHP = 0;
	this.losingHP = false;
	this.hpfloat = 0;
	this.terrain = null;
	this.buff = null;
	this.attack = 50;
	this.defense = 1;
    this.showNum = 0;
    if (showNum)
        this.showNum = 1;
}

// server side we export Unit.
if( 'undefined' != typeof global ) {
    module.exports = Unit;
}

Unit.prototype.setcd = function(/*int*/ time){
	this.cooldown = time;
	var self = this;
	var now, before = new Date();
	var cding = window.setInterval(function(){
			now = new Date();
			if(self.cooldown>=0){
				var elapsedTime = now.getTime() - before.getTime();
				if (elapsedTime > 100)  // in case tab is not active in Chrome
					self.cooldown = self.cooldown - Math.round(elapsedTime/100)/10;
				else
					self.cooldown = self.cooldown - 0.1;
			}else{
				self.cooldown = 0;
				window.clearInterval(cding);
			}
			before = new Date();
		} ,100);
}

/**
 * Unit Method: return a Kinetic.Image to be put into the unit group.
 * @this {Unit}
 */
Unit.prototype.draw = function(/*Point*/p, /*int*/height) {
    var groupToDraw = new Kinetic.Group();
    // draw unit
	var unitToDraw;
	if (this.cooldown > 0.2 && this.cd) {
		unitToDraw = new Kinetic.Image({
			image: this.cd,
			x: Math.floor(p.X - this.image.width/2),
			y: Math.floor(p.Y + height*2/5 - this.image.height + 5),
			width: this.image.width,
			height: this.image.height
		});
		var offset = Math.round((5 - this.cooldown/2)*10);
		unitToDraw.setCrop({x:120*offset, y:0, width:120, height:120});
	} else {
		unitToDraw = new Kinetic.Image({
			image: this.image,
			x: Math.floor(p.X - this.image.width/2),
			y: Math.floor(p.Y + height*2/5 - this.image.height + 5),
			width: this.image.width,
			height: this.image.height
		});
	}
    groupToDraw.add(unitToDraw);
    // draw hp
    for (var i = 0; i < this.hp; i++) {
        var hpHeart = new Kinetic.Image({
            image: this.heartImage,
            x: Math.floor(p.X + 22),
            y: Math.floor(p.Y + 15 * i - 30)
        });
        groupToDraw.add(hpHeart);
    }
    // draw number
    if (this.showNum && this.type != 5) {
        var num = this.type + 1;
        var numText = new Kinetic.Text({
            fontFamily: "Impact",
            fontSize: 30,
            stroke: "white",
            text: num,
            x: p.X,
            y: p.Y
        });
        groupToDraw.add(numText);
    }
    
	return groupToDraw;
};

/**
 * Unit Method: return a Kinetic.Group to be put into the hp group.
 * @this {Unit}
 */
Unit.prototype.drawHP = function(/*Point*/p, /*int*/height) {

	var hpToDraw = new Kinetic.Group({listening: false});
	
	hpToDraw.add(new Kinetic.Line({
		points: [Math.floor(p.X - this.imageWithNum.width/4), Math.floor(p.Y - this.imageWithNum.height/2 + 18), Math.floor(p.X + this.imageWithNum.width/4), Math.floor(p.Y - this.imageWithNum.height/2 + 18)],
		stroke: "white",
		strokeWidth: 3
	}));
	hpToDraw.add(new Kinetic.Line({
		points: [Math.floor(p.X - this.imageWithNum.width/4), Math.floor(p.Y - this.imageWithNum.height/2 + 18), Math.floor(p.X - this.imageWithNum.width/4 + this.imageWithNum.width/2 * this.hp / 100), Math.floor(p.Y - this.imageWithNum.height/2 + 18)],
		stroke: "red",
		strokeWidth: 3
	}));
	if (this.losingHP) {
		hpToDraw.add(new Kinetic.Text({
			text: "-" + this.lostHP,
			fill: "white",
			fontFamily: "Arial",
			fontSize: 16,
			x: p.X - this.imageWithNum.width/8,
			y: p.Y - this.hpfloat
		}));
		this.hpfloat += 0.5;
		if(this.hpfloat >= this.imageWithNum.width/2-20){
			this.losingHP = false;
			this.hpfloat = 0;
		}
	}
	
	return hpToDraw;
};

Unit.prototype.guess = function(/*int*/ guess){
    this.type = guess;
	this.image = gc.sprites[this.player][guess];
	this.cdImage = gc.cooldown[this.player][guess];
}

Unit.prototype.minusHP = function(/*int*/hp){
	this.lostHP = this.hp - hp;
	this.hp = hp;
	var self = this;
	this.losingHP = true;
	this.hpfloat = 0;
}

Unit.prototype.gotHit = function(/*Unit*/enemy){
	var damage = enemy.buff?(enemy.attack+enemy.buff.attackBuff):enemy.attack;
	var defense = this.buff?(this.defense*this.buff.defenseBuff):this.defense;
	//Calculate type advantage
    if(enemy.type == 4){
		if(this.type == 0){
			this.hp = 0;
		}else if(enemy.type == this.type){
			this.hp = this.hp - 1;
		}else if(enemy.type > this.type){
			enemy.hp = enemy.hp - 1;
		}
	}else{
		if(enemy.type < this.type){
			this.hp = this.hp - 2;
		}
		else if(enemy.type == this.type){
			this.hp = this.hp - 1;
		}
		else if(enemy.type > this.type){
			enemy.hp = enemy.hp - 1;
		}
	}
	//My advantage
//    if (flag>2){
//    	this.hp = this.hp - Math.floor(damage/2 * defense); 
//		//enemy.hp = enemy.hp - floor(damage/2);
//	}
//	//Enemy advantage
//    else if (flag!=0){
//        this.hp = this.hp - Math.floor(damage * 2 * defense);
//		//enemy.hp = enemy.hp - damage;
//	}
//	//Tie
//    else{
//        this.hp = this.hp - Math.floor(damage * defense);
//		//enemy.hp = enemy.hp - damage;
//	}
	if(this.hp < 0){
		this.hp = 0;
	}
	if(enemy.hp < 0){
		enemy.hp = 0;
	}
};


