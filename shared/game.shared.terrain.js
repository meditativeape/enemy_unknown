/**
 * Game terrains.
 * Abstract terrain object and specific terrain objects.
 */

/**
 * Server side we import Point and Coordinate.
 */
if( 'undefined' != typeof global ) {
    var helper = require("./game.shared.helper.js");
	var Point = helper.Point;
	var Coordinate = helper.Coordinate;
	var CONSTANTS = helper.CONSTANTS;
	console.log(helper);
	
}


/**
 * Abstract terrain object.
 * @Constructor
 */
var Terrain = function(/*boolean*/ moveable, /*boolean*/ buildable, /*string*/ objectiveType, 
	/*int*/ objectiveTime, /*int*/ resource, /*double*/ gatheringSpeed, /*image*/image){
	this.moveable = moveable;
    this.buildable = buildable;
	this.objectiveType = objectiveType;
	this.objectiveTime = objectiveTime;
	this.resource = resource;
	this.gatheringSpeed = gatheringSpeed;
	this.image = image;
	this.captured = false;
	this.countdown = null;
    this.interval = -1;
}

/**
 * Instances of terrains to be shared in game.
 */
CONSTANTS.thornTerrain = new Terrain(false,false,null,0,0,0,null);
CONSTANTS.flagTerrain = new Terrain(true,false,'flag',CONSTANTS.countdown,0,0,null);
CONSTANTS.resourceTerrain = new Terrain(true,false,'resource',0,1,2,null);