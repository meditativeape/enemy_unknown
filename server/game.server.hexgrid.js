/**
 * Server hexgrid functions.
 */ 
 
/**
 * Server side we import helper objects and scenarios.
 */
if( 'undefined' !== typeof global ){
    var helper = require("../shared/game.shared.helper.js");
	var Point = helper.Point;
	var Coordinate = helper.Coordinate;
	var CONSTANTS = helper.CONSTANTS;
	var Scenarios = require("../shared/game.shared.scenarios.js").Scenarios;
}

/**
 * Constructor for server hexgrid.
 */ 
var ServerHexgrid = function(/*Hexgrid*/ hexgrid){
	// Inherit old properties
	this.prototype = hexgrid;
	// Convert all units in server hexgrid to server units.
    var unitCoord = new Coordinate(0, 0);
	for (var i = 0; i < this.numRows; i++){
        unitCoord.X = i;
		for (var j = 0; j < this.numCols; j++){
            unitCoord.Y = j;
			var oldUnit = this.getUnit(unitCoord);
            var newUnit = ServerUnit(oldUnit);
            this.setUnit(newUnit, unitCoord);
		}
	}
};
 
/**
 * Check if the unit can move from one coordinate to another.
 */
ServerHexgrid.prototype.canMove = function(/*Coord*/ coord1, /*Coord*/ coord2, /*int*/ player){	

	var unit = this.getUnit(coord1);
    
	if (unit && unit.player == player.player && !this.getUnit(coord2)){ // coord1 has player's unit, and coord2 is empty
		if (this.hexDistByCoord(coord1, coord2) <= unit.range) { // within moving range
            var terrain = this.getTerrain(coord2);
			if (!terrain || terrain.moveable) // no terrain or terrain is movable
				return true;
		}
	}
	
	return false;
};

/**
 * Move the unit from one coordinate to another.
 */
ServerHexgrid.prototype.makeMove = function(/*Coord*/ coord1, /*Coord*/ coord2){
	this.move(coord1, coord2);
};
	
/**
 * Check it the unit at a coordinate can attack the unit at another coordinate.
 */
ServerHexgrid.prototype.canAttack = function(/*Coord*/ coord1, /*Coord*/ coord2, /*int*/ player){
	var myUnit = this.getUnit(coord1);
	var theirUnit = this.getUnit(coord2);
	if (myUnit.player == player.player && theirUnit && theirUnit.team != player.team)
		if (this.hexDistByCoord(coord1, coord2) <= myUnit.range)
			return true;
	return false;
};

/**
 * Make the unit at a coordinate attack the unit at another coordinate.
 * TODO: move message sending
 */	
ServerHexgrid.prototype.makeAttack = function(/*Coord*/ coord1, /*Coord*/ coord2){
	var responses = [];
	var unit1 = this.getUnit(coord1);
	var unit2 = this.getUnit(coord2);
	this.attack(coord1, coord2);
	responses.push(["1", "attack", coord1.X, coord1.Y, unit1.hp, coord2.X, coord2.Y, unit2.hp].join(" "));
	if (unit1.hp <= 0) {  // unit 1 dies
		responses.push(["1", "die", coord1.X, coord1.Y, unit1.type].join(" "));
		this.units[unit1.team]--;
	}
	if (unit2.hp <= 0) {  // unit 2 dies
		responses.push(["1", "die", coord2.X, coord2.Y, unit2.type].join(" "));
		this.units[unit2.team]--;
	}
	return responses;	
};

/**
 * Update pieces visible to enemy based on the unit at given coordinate.
 */
ServerHexgrid.prototype.updatePieceVisible = function(/*Coordinate*/ coord) {
	var myTeam = this.getUnit(coord).team;
	var vision = CONSTANTS.unitViewRange;
    
    var tempCoord = new Coordinate(0, 0);
    var tempUnit = null;
	for (var i = -vision; i <= vision; i++) {
        tempCoord.X = coord.X + i;
		for (var j = -vision; j <= vision; j++) {
            tempCoord.Y = coord.Y + j;
			if (this.containsCoord(tempCoord) && this.hexDistByCoord(tempCoord) <= vision) {
                tempUnit = this.getUnit(tempCoord);
                if (tempUnit && tempUnit.team != myTeam) // there is an enemy piece within distance of 3
                    return this.getUnit(coord).setIsVisibleToEnemy(true);
			}
		}
    }
	return this.getUnit(coord).setIsVisibleToEnemy(false);
}

/**
 * Update pieces visible to enemy.
 * TODO: move message sending
 */ 
ServerHexgrid.prototype.updateVisible = function(){  // only works for 1v1
	var piecesToAdd = [[], []];
    var tempCoord = new Coordinate(0, 0);
    var tempUnit = null;
    
	for (var x = 0; x < this.numRows; x++){
        tempCoord.X = x;
		for (var y = 0; y < this.numCols; y++){
            tempCoord.Y = y;
            var tempUnit = this.getUnit(tempCoord);
			if (tempUnit) // for each existing piece, check surrounding hexs
				if (this.updatePieceVisible(tempCoord)) // if a piece becomes visible, add to the list
					piecesToAdd[tempUnit.team].push(new Coordinate(x, y));
		}
	}
    
	for (var i in piecesToAdd){
		for (var j in piecesToAdd[i]) {
			tempUnit = this.getUnit(piecesToAdd[i][j]);
		    if (this.scenario.revealtype) {
				this.sendMsg(this.players[1-i], "1 add {0} {1} {2} {3} {4} {5} {6}".format([tempUnit.player, tempUnit.team, tempUnit.type, tempUnit.x, tempUnit.y, tempUnit.cooldown, tempUnit.hp]));
		  	} else {
		    	this.sendMsg(this.players[1-i], "1 add {0} {1} {2} {3} {4} {5} {6}".format([tempUnit.player, tempUnit.team, 5, tempUnit.x, tempUnit.y, tempUnit.cooldown, tempUnit.hp]));
		  	}
	  	}
	}
}

/**
 * Server side we export Hexgrid.
 */
if( 'undefined' !== typeof global ) {
    module.exports = ServerHexgrid;
}