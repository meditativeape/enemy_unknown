// Helper Functions

/**
* Constructs a point. This represents a position on the canvas. 
* @constructor
*/
function Point(x, y) {
	this.X = x;
	this.Y = y;
};

/**
* Constructs a coordinate. This represents a position on the grid.
* @constructor
*/
function Coordinate(x, y) {
	this.X = x;
	this.Y = y;
};

var CONSTANTS = {
	width: 800,
	height: 600,
	cd: 15,
	init_resource: 100,
	hexSideLength: 60,
	hexRatio: 2.0
};

// server side we export Point and Coordinate.
if( 'undefined' != typeof global ) {
    exports.Point = Point;
	exports.Coordinate = Coordinate;
	exports.CONSTANTS = CONSTANTS;
}