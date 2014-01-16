/**
 * Game helper structs, functions, and constants.
 */

/**
 * Server side we export Point,Coordinate and constants.
 */
if( 'undefined' !== typeof global ) {
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
	unitCD: 10, //Unit countdown
    captureCD: 180, //Capture countdown
    unitCosts: [50, 40, 20, 30, 40], //Costs to build unit by type
	unitMoveRange: 2.0 , //Movement range of all units.
	unitViewRange: 3.0 //View range of all units.
};

console.log(CONSTANTS);

