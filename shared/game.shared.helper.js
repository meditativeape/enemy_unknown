/**
 * Game helper structs, functions, and constants.
 */

/**
 * Server side we export Point and Coordinate.
 */
if( 'undefined' != typeof global ) {
    exports.Point = Point;
	exports.Coordinate = Coordinate;
	exports.CONSTANTS = CONSTANTS;
}

/**
 * Constructs a point. This represents a position on the canvas. 
 * @constructor
 */
function Point(/*float*/ x, /*float*/ y) {
	this.X = x;
	this.Y = y;
};

/**
 * Constructs a coordinate. This represents a position on the grid.
 * @constructor
 */
function Coordinate(/*int*/ x, /*int*/ y) {
	this.X = x;
	this.Y = y;
};

/**
 * Constants
 */
var CONSTANTS = {
	//width: 800, //TODO To be moved to client
	//height: 600, //TODO To be moved to client
	//hexSideLength: 60, //Move to UI
	//hexRatio: 2.0, //Move to UI
	//minimapWidth: 200 //Move to UI
	unitCD: 10, //Unit countdown
    captureCD: 180, //Capture countdown
	initialResource: 100, //TODO move to maps
    unitCosts: [50, 40, 20, 30, 40], //Costs to build unit by type
	unitMoveRange: 2.0 , //Movement range of all units.
	unitViewRange: 4.0, //View range of all units.
    
};

