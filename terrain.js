// server side we import Point and Coordinate.
if( 'undefined' != typeof global ) {
    var helper = require("./helper.js");
	var Point = helper.Point;
	var Coordinate = helper.Coordinate;
	var CONSTANTS = helper.CONSTANTS;
}

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

// var Buff = function(/*int*/attackBuff,/*int*/ defenseBuff,/*int*/rangeBuff){
	// this.attackBuff = attackBuff; 
	// this.defenseBuff = defenseBuff;
	// this.rangeBuff = rangeBuff;
// }

/**
 * Terrain Method: return a Kinetic.Image to be put into the terrain group.
 * If oldTerrain is provided, update on oldTerrain.
 * @this {Terrain}
 */
Terrain.prototype.draw = function(/*Point*/p, /*int*/height, /*Kinetic.Image*/oldTerrain) {
	if (this.image) {
		if (oldTerrain) {
			//oldTerrain.setX(Math.floor(p.X - this.image.width/2));
			//oldTerrain.setY(Math.floor(p.Y + height/2 - this.image.height));
            oldTerrain.move(Math.floor(p.X - this.image.width/2) - oldTerrain.getX(),
                            Math.floor(p.Y + height/2 - this.image.height) - oldTerrain.getY());
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

//Build terrains.

CONSTANTS.thronTerrain = new Terrain(false,false,null,0,0,0,null);
CONSTANTS.flagTerrain = new Terrain(true,false,'flag',CONSTANTS.countdown,0,0,null);
CONSTANTS.resourceTerrain = new Terrain(true,false,'resource',0,1,2,null);