/**
 * Game units.
 * Abstract unit object and methods.
 */
 
/**
 * Server side we import Point and Coordinate and export Unit.
 */
if( 'undefined' != typeof global ) {
    var helper = require("./helper.js");
	var CONSTANTS = helper.CONSTANTS;
	module.exports = Unit;
}

/**
* Prototype for a unit
* @constructor
*/
var Unit = function(/*int*/ player, /*int*/ team, /*int*/hp, /*int*/ type, /*Coordinate*/ startCoord){
	this.player = player; // Starts from 0
	this.team = team; // Starts from 0
	this.hp = hp; // Unit health points
	this.type = type; // TODO
	this.coord = startCoord; // Unit position
    //this.typeVisibleToEnemy = false; // This unit's type is visible to enemy //Move to server
	this.attacked = false;
    this.cooldown = 0;
	this.attacking = false;
	this.damaged = false;
	this.death = null; // For death animation
	this.lostHP = 0;
	//this.lastHitType. 
}


/**
 * Set the cd for unit. Dirty hack used by both client server.
 */
Unit.prototype.setcd = function(/*float*/ time){
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


//Move to view
/**
 * Unit Method: return a Kinetic.Image to be put into the unit group.
 * @this {Unit}
 */
Unit.prototype.draw = function(/*Point*/p, /*int*/height) {
    var groupToDraw = new Kinetic.Group();
    // draw unit
	var unitToDraw;
    if (this.hitCounter < 20) {
        var hitImage;
        if (this.lastHitType == "small")
            hitImage = gc.getHitImgs.small[this.team][this.type];
        else
            hitImage = gc.getHitImgs.big[this.team][this.type];
        unitToDraw = new Kinetic.Image({
			image: hitImage,
			x: Math.floor(p.X - this.image.width/2),
			y: Math.floor(p.Y + height*2/5 - this.image.height + 5),
			width: this.image.width,
			height: this.image.height
		});
		var offset = Math.floor(this.hitCounter/2);
		unitToDraw.setCrop({x:120*offset, y:0, width:120, height:120});
        this.hitCounter++;
	} else if (this.cooldown > 0.2 && this.cdImage) {
		unitToDraw = new Kinetic.Image({
			image: this.cdImage,
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

//View
Unit.prototype.guess = function(/*int*/ guess){
    this.type = guess;
	this.image = gc.sprites[this.player][guess];
	this.cdImage = gc.cooldown[this.player][guess];
}

//View
Unit.prototype.minusHP = function(/*int*/hp){
	this.lostHP = this.hp - hp;
	this.hp = hp;
	if(this.lostHP!=0){
        this.hitCounter = 0; // show get hit animation
        if (this.lostHP == 1)
            this.lastHitType = "small";
        else
            this.lastHitType = "big";
		if(this.team == gc.team && hp!= 0){
			if(this.lostHP == 1){
				soundAssets.attack_1sound.play();
			}else{
				soundAssets.attack_2sound.play();
			}
		}
		else{
			if(this.lostHP == 1 && hp!= 0){
				soundAssets.attack1sound.play();
			}else if(this.type == 0){
				soundAssets.kosound.play();
				gc.vampireKO = true;
			}
			else if(hp!= 0){
				soundAssets.attack2sound.play();
			}
		}
	}
	
}

/**
 * Method called when unit gets hit by enemy unit and loses hp.
 */
Unit.prototype.gotHit = function(/*Unit*/enemy){
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
	if(this.hp < 0){
		this.hp = 0;
	}
	if(enemy.hp < 0){
		enemy.hp = 0;
	}
};


