// server side we import Point and Coordinate.
if( 'undefined' != typeof global ) {
    var helper = require("./helper.js");
	var Point = helper.Point;
	var Coordinate = helper.Coordinate;
	var CONSTANTS = helper.CONSTANTS;
}

// JavaScript Document
var Terrain = function(/*int*/attackBuff,/*int*/ defenseBuff,/*int*/rangeBuff,/*boolean*/ moveable, /*string*/objectiveType, 
	/*int*/ objectiveTime,/*int*/ resource,/*int*/ gatheringSpeed,/*image*/image){
	this.buff = new Buff(attackBuff,defenseBuff,rangeBuff);
	this.moveable = moveable 
	this.objectiveType = objectiveType;
	this.objectiveTime = objectiveTime;
	this.resource = resource;
	this.gatheringSpeed = gatheringSpeed;
	this.image = image;
}

var Buff = function(/*int*/attackBuff,/*int*/ defenseBuff,/*int*/rangeBuff){
	this.attackBuff = attackBuff; 
	this.defenseBuff = defenseBuff;
	this.rangeBuff = rangeBuff;
}

Terrain.prototype.draw = function(/*Point*/p, /*int*/height) {
	var ctx = document.getElementById('gameCanvas').getContext('2d');
	ctx.drawImage(this.image, Math.floor(p.X - this.image.width/2), Math.floor(p.Y + height/4 - this.image.height), 
			this.image.width, this.image.height);
};

CONSTANTS.waterTerrain = new Terrain(0,0,0,false,null,0,0,0,null);
CONSTANTS.flagTerrain = new Terrain(0,0,0,true,'flag',60,0,0,null);