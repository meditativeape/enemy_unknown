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
var Unit = function(/*int*/player, /*int*/ team, /*int*/hp, /*int*/type, /*Coordinate*/startCoord, /*image*/pic, /*image*/cdImage, /*int*/showNum){
	this.player = player; //Starts from 0
	this.team = team; //Starts from 0
	this.hp = hp;
	this.type = type; //0.Vampire 1.Wolf 2.Hunter 3.Zombie 4.Wizard 5.Unknown
	this.range = 2;
	this.x = startCoord.X;
	this.y = startCoord.Y;
    this.serverIsVisible = false; // visible to enemy
	this.attacked = false;
    this.heartImage = CONSTANTS.heart; // hp image
	this.image = pic; // unit image
	this.cdImage = cdImage; // cd image
    this.cooldown = 0;
    this.lastCooldownTime = 0;
	this.attacking = false;
	this.damaged = false;
	this.death = null;
	this.lostHP = 0;
	this.terrain = null;
	this.buff = null;
	this.attack = 50;
	this.defense = 1;
    this.showNum = 0;
    this.hitCounter = 20;
    this.lastHitType = null;
    if (showNum)
        this.showNum = 1;
    this.groupToDraw = null;
}

// server side we export Unit.
if( 'undefined' != typeof global ) {
    module.exports = Unit;
}

Unit.prototype.setcd = function(/*float*/ time){
    if ('undefined' != typeof global) {
        var now = new Date();
        this.lastCooldownTime = now.getTime();
    } else {
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
}

/**
 * Unit Method: return a group of images to be put into the unit group.
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
			height: this.image.height,
            name: "unit"
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
			height: this.image.height,
            name: "unit"
		});
		var offset = Math.round((5 - this.cooldown/2)*10);
		unitToDraw.setCrop({x:120*offset, y:0, width:120, height:120});
	} else {
		unitToDraw = new Kinetic.Image({
			image: this.image,
			x: Math.floor(p.X - this.image.width/2),
			y: Math.floor(p.Y + height*2/5 - this.image.height + 5),
			width: this.image.width,
			height: this.image.height,
            name: "unit"
		});
	}
    groupToDraw.add(unitToDraw);
    
    // draw hp
    for (var i = 0; i < this.hp; i++) {
        var hpHeart = new Kinetic.Image({
            image: this.heartImage,
            x: Math.floor(p.X + 22),
            y: Math.floor(p.Y + 15 * i - 30),
            name: "heart"
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
            y: p.Y,
            name: "number"
        });
        groupToDraw.add(numText);
    }
    
	return groupToDraw;
};

Unit.prototype.redraw = function(/*Point*/p, /*int*/height, /*Kinetic.Layer*/layerToDraw){
    if (!this.groupToDraw) {
        this.groupToDraw = this.draw(p, height);
        layerToDraw.add(this.groupToDraw);
    } else {
        // redraw unit
        var unit = this.groupToDraw.get(".unit")[0]
        if (this.hitCounter < 20) {
            var hitImage;
            if (this.lastHitType == "small")
                hitImage = gc.getHitImgs.small[this.team][this.type];
            else
                hitImage = gc.getHitImgs.big[this.team][this.type];
            unit.setImage(hitImage);
            var offset = Math.floor(this.hitCounter/2);
            unit.setCrop({x:120*offset, y:0, width:120, height:120});
            this.hitCounter++;
        } else if (this.cooldown > 0.2 && this.cdImage) {
            unit.setImage(this.cdImage);
            var offset = Math.round((5 - this.cooldown/2)*10);
            unit.setCrop({x:120*offset, y:0, width:120, height:120});
        } else {
            unit.setImage(this.image);
            unit.setCrop({x:0, y:0, width:120, width:120});
        }
        //unit.setX(Math.floor(p.X - this.image.width/2));
        //unit.setY(Math.floor(p.Y + height*2/5 - this.image.height + 5));
        unit.move(Math.floor(p.X - this.image.width/2) - unit.getX(),
                  Math.floor(p.Y + height*2/5 - this.image.height + 5) - unit.getY());
        
        // adjust hp
        var hearts = this.groupToDraw.get(".heart");
        for (var i = 0; i < hearts.length; i++) {
            if (i < this.hp) {
                //hearts[i].setX(Math.floor(p.X + 22));
                //hearts[i].setY(Math.floor(p.Y + 15 * i - 30));
                hearts[i].move(Math.floor(p.X + 22) - hearts[i].getX(),
                               Math.floor(p.Y + 15 * i - 30) - hearts[i].getY());
            } else {
                hearts[i].destroy();
            }
        }
        
        // adjust number
        var number = this.groupToDraw.get(".number")[0];
        if (number) {
            //number.setX(p.X);
            //number.setY(p.Y);
            number.move(p.X - number.getX(), p.Y - number.getY());
        }
    }
};

Unit.prototype.guess = function(/*int*/ guess){
    this.type = guess;
	this.image = gc.sprites[this.player][guess];
	this.cdImage = gc.cooldown[this.player][guess];
};

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
	if(this.hp < 0){
		this.hp = 0;
	}
	if(enemy.hp < 0){
		enemy.hp = 0;
	}
};

Unit.prototype.disappear = function() {
    if (this.groupToDraw)
        this.groupToDraw.destroy();
}

Unit.prototype.serverSetVisible = function(/*boolean*/ isVisible) {
    var old = this.serverIsVisible;
    this.serverIsVisible = isVisible;
    if (!old && isVisible)
        return true;
    else
        return false;
}
