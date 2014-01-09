/**
 * Server hexgrid functions.
 */ 
 
 /**
 * Constructor for server hexgrid.
 */ 
var ServerHexgrid = function(/*Hexgrid*/ hexgrid) {
	//Inherit properties
	this.prototype = hexgrid;
};

 
/**
 * Check if the unit can move from coord1 to coord2.
 */
ServerHexgrid.prototype.canMove = function(/*Coord*/ coord1, /*Coord*/ coord2, /*int*/ player){	
	var unit = this.getUnit(coord1);
	if (unit && unit.player == player.player && !this.getUnit(coord2)){ // coord1 has player's unit and coord2 is empty
		if (this.hexDist(this.matrix[coord1.X][coord1.Y], this.matrix[coord2.X][coord2.Y]) <= unit.range) {
			if (!this.matrix[coord2.X][coord2.Y].terrain) {
				return true;
			} else {
				if (this.matrix[coord2.X][coord2.Y].terrain.moveable)
					return true;
			}	
		}
	}
	
	return false;
};

/**
 * Move the unit from coord1 to coord2.
 */
ServerHexgrid.prototype.makeMove = function(/*Coord*/ coord1, /*Coord*/ coord2){
	this.move(coord1, coord2);
};
	
/**
 * Check it the unit at coord1 can attack a unit at to coord2.
 */
ServerHexgrid.prototype.canAttack = function(/*Coord*/ coord1, /*Coord*/ coord2, /*int*/ player){
	var myUnit = this.getUnit(coord1);
	var theirUnit = this.getUnit(coord2);
	if (myUnit.player == player.player && theirUnit && theirUnit.team != player.team)
		if (this.hexDist(this.matrix[coord1.X][coord1.Y], this.matrix[coord2.X][coord2.Y]) <= myUnit.range)
			return true;
	return false;
};

/**
 * Make the unit at coord1 attack the unit at coord2.
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
 * Update visible peices based on piece coord [x][y]
 */
ServerHexgrid.prototype.updatePieceVisible = function(/*int*/ x, /*int*/ y) {
	var myTeam = this.hexgrid.matrix[x][y].piece.team;
	var vision = CONSTANTS.unitVision;
	for (var i = -vision; i <= vision; i++)
		for (var j = -vision; j <= vision; j++) {
			if (this.hexgrid.matrix[x+i] && this.hexgrid.matrix[x+i][y+j] && 
				(this.hexgrid.hexDist(this.hexgrid.matrix[x][y], this.hexgrid.matrix[x+i][y+j]) <= 3) && 
				this.hexgrid.matrix[x+i][y+j].piece && 
				(this.hexgrid.matrix[x+i][y+j].piece.team != myTeam))  { // there is an enemy piece within distance of 3
				return this.hexgrid.matrix[x][y].piece.setVisible(true);
			}
		}
	return this.hexgrid.matrix[x][y].piece.setVisible(false);
}

/**
 * Update visible peices. 
 */ 
ServerHexgrid.prototype.updateVisible = function(){  // only works for 1v1
	var piecesToAdd = [[], []];
	for (var x in this.hexgrid.matrix){
		for (var y in this.hexgrid.matrix[x]){
			if (this.hexgrid.matrix[x][y].piece) {  // for each piece, check surrounding hexs
				if (this.updatePieceVisible(parseInt(x), parseInt(y))) {  // if a piece becomes visible, add to the list
					piecesToAdd[this.hexgrid.matrix[x][y].piece.team].push(new Coordinate(x, y));
				}
			}
		}
	}
	for (var i in piecesToAdd){
		for (var j in piecesToAdd[i]) {
			var piece = this.hexgrid.getUnit(piecesToAdd[i][j]);
		    if (this.hexgrid.scenario.revealtype) {
				this.sendMsg(this.players[1-i], "1 add {0} {1} {2} {3} {4} {5} {6}".format([piece.player, piece.team, piece.type, piece.x, piece.y, piece.cooldown, piece.hp]));
		  	} else {
		    	this.sendMsg(this.players[1-i], "1 add {0} {1} {2} {3} {4} {5} {6}".format([piece.player, piece.team, 5, piece.x, piece.y, piece.cooldown, piece.hp]));
		  	}
	  	}
	}
}

