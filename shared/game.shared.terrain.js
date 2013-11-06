/**
 * Game terrains.
 * Abstract terrain object and specific terrain objects.
 */
 
/**
 * Server side we import Point and Coordinate.
 */
if( 'undefined' != typeof global ) {
    var helper = require("./helper.js");
	var Point = helper.Point;
	var Coordinate = helper.Coordinate;
	var CONSTANTS = helper.CONSTANTS;
}

/**
 * Abstract terrain object.
 * @Constructor
 */
var Terrain = function(/*boolean*/ moveable, /*boolean*/ buildable, /*string*/ objectiveType, 
	/*int*/ objectiveTime,/*int*/ resource,/*double*/ gatheringSpeed,/*image*/image){
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

//TODO Needs to move to client.
/**
 * Terrain Method: Return a Kinetic.Image to be put into the terrain group and draw by UI.
 * If oldTerrain is provided, update on oldTerrain.
 * @return Kinetic.Image Image object to draw.
 */
Terrain.prototype.getObjectToDraw = function(/*Point*/ p, /*int*/ height, /*Kinetic.Image*/ oldTerrain) {
	if (this.image) {
		if (oldTerrain) {
			oldTerrain.setX(Math.floor(p.X - this.image.width/2));
			oldTerrain.setY(Math.floor(p.Y + height/2 - this.image.height));
			return oldTerrain;
		} else {
			var terrainToDraw = new Kinetic.Image({
				image: this.image,
				x: Math.floor(p.X - this.image.width/2),
				y: Math.floor(p.Y + height/2 - this.image.height)
			});
			return terrainToDraw;
		}
	}
};

/**
 * Instances of terrains to be shared in game.
 **/
CONSTANTS.thronTerrain = new Terrain(false,false,null,0,0,0,null);
CONSTANTS.flagTerrain = new Terrain(true,false,'flag',CONSTANTS.countdown,0,0,null);
CONSTANTS.resourceTerrain = new Terrain(true,false,'resource',0,1,2,null);