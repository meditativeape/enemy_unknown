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
	this.attacked = false;
    this.cooldown = 0;
	this.attacking = false;
	this.damaged = false;
	this.death = null; // For death animation
	this.lostHP = 0;
	//this.lastHitType. 
};

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
};

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