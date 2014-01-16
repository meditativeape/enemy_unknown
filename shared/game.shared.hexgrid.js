/**
 * Hexgrid and hexagon objects shared by both client and server.
 */
 
/**
 * Server side we import helper objects and scenarios, and export Hexgrid.
 */
if( 'undefined' !== typeof global ) {
    var helper = require("./game.shared.helper.js");
	var Point = helper.Point;
	var Coordinate = helper.Coordinate;
	var CONSTANTS = helper.CONSTANTS;
	var Scenarios = require("./game.shared.scenarios.js").Scenarios;
    module.exports = Hexgrid;
}

/**
 * Creates a shared hexgird.
 * Automatically builds a matrix of hexagons based on the given scenario.
 */
var Hexgrid = function(/*string*/ scenarioName, /*boolean*/ fogOn){

	this.scenario = Scenarios[scenarioName];
    this.fogOn = fogOn;
    this.numRows = this.scenario.size.numRows;
	this.numCols = this.scenario.size.numCols;
    
    // build the matrix of hexagons
	this.matrix = [];
	for (var i = 0; i < this.numRows; i++) {
		this.matrix[i] = [];
		for (var j = 0; j < this.numCols; j++) {
			this.matrix[i][j] = new Hexagon(new Coordinate(i, j));
		}
	}
};

/**
 * Checks if the hexgrid contains the given coordination.
 */
Hexgrid.prototype.containsCoord = function(/*Coordinate*/ coord) {
    if (coord.X >= 0 && coord.X < numRows && coord.Y >= 0 && coord.Y < numCols)
        return true;
    else
        return false;
}

/**
 * Returns the hexagon at a given coordinate.
 */
Hexgrid.prototype.getHexagon = function(/*Coordinate*/ coord) {
    if (this.containsCoord(coord))
        return this.matrix[coord.X][coord.Y];
    else
        return null;
};

/**
 * Returns the unit at a given coordinate.
 */
Hexgrid.prototype.getUnit = function(/*Coordinate*/ coord){
    return this.getHexagon(coord).piece;
};

/**
 * Sets the unit at a given coordinate.
 */
Hexgrid.prototype.setUnit = function(/*Unit*/ toSet, /*Coordinate*/ coord){
    this.getHexagon(coord).piece = toSet;
};

/**
 * Returns the terrain at a given coordinate.
 */
Hexgrid.prototype.getTerrain = function(/*Coordinate*/ toCheck){
    return this.getHexagon(coord).terrain;
};

/**
 * Sets the terrain at a given coordinate.
 */
Hexgrid.prototype.setTerrain = function(/*Terrain*/ toSet, /*Coordinate*/ coord){
    this.getHexagon(coord).terrain = toSet;
};

/**
 * Calculates the distance between two hexagons.
 */
Hexgrid.prototype.hexDist = function(/*Hexagon*/ h1, /*Hexagon*/ h2) {
    return this.hexDistByCoord(h1.coord, h2.coord);		
};

/**
 * Calculates the distance between two hexagons by coordinations.
 */
Hexgrid.prototype.hexDistByCoord = function(/*Coordination*/ coord1, /*Coordination*/ coord2) {
    var deltaX = coord1.X - coord2.X;
    var deltaY = coord1.Y - coord2.Y;
    return ((Math.abs(deltaX) + Math.abs(deltaY) + Math.abs(deltaX + deltaY)) / 2);		
};

/**
 * Move a unit from one hexagon to another hexagon.
 * This method will not validate the move.
 */
Hexgrid.prototype.move = function(/*Coordinate*/ origin, /*Coordinate*/ dest) {
    var toMove = this.getUnit(origin);
    this.setUnit(null, origin);
    this.setUnit(toMove, dest);
    toMove.coord = dest;
};

/**
 * Use a unit to attack another enemy's unit.
 * This method will not validate the attack.
 */
Hexgrid.prototype.attack = function(/*Coordinate*/ attacker, /*Coordinate*/ enemy){
    var attUnit = this.getUnit(attacker);
    var enemyUnit = this.getUnit(enemy);
    enemyUnit.gotHit(attUnit);
    if (enemyUnit.hp <= 0){
        this.setUnit(null, enemy);
    }
    if (attUnit.hp <= 0){
        this.setUnit(null, attacker);
    }
};

/**
 * Constructs a hexagon.
 * Contains the coordination of the hexagon, and the unit and terrain in the hexagon.
 */
function Hexagon(/*Coordinate*/ coord) {
	this.piece = null;
    this.terrain.null;
    this.coord = coord;
};