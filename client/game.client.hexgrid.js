/**
 * Client hexgrid functions.
 */ 

/**
 * Constructor for client hexgrid.
 */ 
var ClientHexgrid = function(/*Hexgrid*/ hexgrid) {

	// Inherit old properties
	this.prototype = hexgrid;
    
	// Add new properties
	this.reachables = [];
	this.attackables = [];
	this.buildables = [];
	this.viewables = [];
    
	// Convert all hexagons in client hexgrid to client hexagons
    var unitCoord = new Coordinate(0, 0);
	for (var i = 0; i < this.numRows; i++){
        unitCoord.X = i;
		for (var j = 0; j < this.numCols; j++){
            unitCoord.Y = j;
			var oldUnit = this.getUnit(unitCoord);
            var newUnit = ClientHexagon(oldUnit);
            this.setUnit(newUnit, unitCoord);
		}
	}
};


/**
 * Constructor for client hexagon.
 */
var ClientHexagon = function(/*Hexagon*/ oldHexagon){

	// Inherit old properties
	clientHexagon.prototype = oldHexagon;
    
	// Add new properties
	this.reachable = false;
	this.attackable = false;
	this.buildable = false;
	this.viewable = false;
	this.opacity = 1;
	this.pastViewable = false;
    this.guessing = false;
    this.selected = false;
};

/**
 * Mark reachable locations from the given coordinate.
 */
ClientHexgrid.prototype.markReachable = function(/*Coordinate*/ coord){

	xs = [coord.X-1, coord.X, coord.X+1, coord.X-2, coord.X+2];
	ys = [coord.Y, coord.Y+1, coord.Y-1, coord.Y-2,coord.Y+2];
    var tempCoord = new Coordinate(0, 0);
    var tempHexagon = null;
    
	for (var i = 0; i < 5; i++) {
        tempCoord.X = xs[i];
		for (var j = 0; j < 5; j++) {
            tempCoord.Y = ys[j];
            if (this.containsCoord(tempCoord) && // coord exists
                this.hexDistByCoord(coord, tempCoord) <= CONSTANTS.unitMoveRange && // coord within move range
                !this.getUnit(tempCoord) && // coord has no unit
                (!this.getTerrain(tempCoord) || this.getTerrain(tempCoord).moveable)) // coord terrain moveable
                {
                    tempHexagon = this.getHexagon(tempCoord);
                    tempHexagon.reachable = true;
                    this.reachables.push(tempHexagon);
                }
        }
    }
};

/**
 * Mark attackable locations from the given coordinate.
 */
ClientHexgrid.prototype.markAttackable = function(/*Coordinate*/ coord){

	var myUnit = this.getUnit(coord);
	xs = [coord.X-1, coord.X, coord.X+1, coord.X-2, coord.X+2];
	ys = [coord.Y, coord.Y+1, coord.Y-1, coord.Y-2,coord.Y+2];
    var tempCoord = new Coordinate(0, 0);
    var tempHexagon = null;
    
	for (var i = 0; i < 5; i++){
        tempCoord.X = i;
		for (var j = 0; j < 5; j++){
            tempCoord.Y = j;
			if (this.containsCoord(tempCoord) && // coord exists
                this.hexDistByCoord(coord, tempCoord) <= CONSTANTS.unitMoveRange && // coord within move range
                this.getUnit(tempCoord) && // coord has a unit
                this.getUnit(tempCoord).team != myUnit.team) // two units are of different teams
                {
                    tempHexagon = this.getHexagon(tempCoord);
					tempHexagon.attackable = true;
					this.attackables.push(tempHexagon);
                }
		}
	}
};

/**
 * Mark buildable locations for player.
 */
ClientHexgrid.prototype.markBuildable = function(/*int*/ player){
    
    var tempCoord = new Coordinate(0, 0);
    var tempCoord2 = new Coordinate(0, 0);
    var tempHexagon;
    
	for (var x = 0; x < this.numRows; x++) {
        tempCoord.X = x;
		for (var y = 0; y < this.numCols; y++) {
            tempCoord.Y = y;
			if (this.getUnit(tempCoord) && this.getUnit(tempCoord).player === player) { // there is a player's unit
				xs = [x-1, x-1, x, x, x+1, x+1];
				ys = [y, y+1, y-1, y+1, y-1, y];
				for (var i = 0; i < 6; i++) {
                    tempCoord2.X = xs[i];
                    tempCoord2.Y = ys[i];
					if (this.containsCoord(tempCoord2) && // coord exists
                        !this.getUnit(tempCoord2) && // coord has no unit
                        (!this.getTerrain(tempCoord2) || this.getTerrain(tempCoord2).moveable)) // coord terrain moveable
                    {
                        tempHexagon = this.getHexagon(tempCoord2);
                        tempHexagon.buildable = true;
                        this.buildables.push(tempHexagon);
					}
				}
			}
		}
	}
};

/**
 * Mark hexagons that should be displayed for team.
 */
ClientHexgrid.prototype.markViewable = function(/*int*/ team){
    
    var tempCoord = new Coordinate(0, 0);
    var tempCoord2 = new Coordinate(0, 0);
    var tempHexagon;
    
	for (var x = 0; x < this.numRows; x++) {
        tempCoord.X = x;
		for (var y = 0; y < this.numCols; y++) {
            tempCoord.Y = y;
			if (this.getUnit(tempCoord) && this.getUnit(tempCoord).team === team) { // there is a team's unit
				xs = [x-3, x-2, x-1, x, x+1, x+2, x+3];
				ys = [y-3, y-2, y-1, y, y+1, y+2, y+3];
				for (var i = 0; i < 7; i++) {
                    tempCoord2.X = xs[i];
                    for (var j = 0; j < 7; j++) {
                        tempCoord2.Y = ys[j];
                        if (this.containsCoord(tempCoord2) && // coord exists
                            this.hexDistByCoord(coord, tempCoord2) <= CONSTANTS.unitViewRange) // coord within view range
                        {
                            // TODO: Do something that shows transition
                            tempHexagon = this.getHexagon(tempCoord2);
                            tempHexagon.viewable = true;
                            this.viewables.push(tempHexagon);
                        }
                    }
				}
			}
		}
	}
};

/**
 * Check if coord is reachable according to current reachables.
 * Should only be used after markReachable.
 */
ClientHexgrid.prototype.isReachable = function(/*Coordinate*/coord){
	return this.getUnit(coord).reachable;
};

/**
 * Check if coord is attackable accroding to current attackables.
 * Should only be used after markAttackable.
 */
ClientHexgrid.prototype.isAttackable = function(/*Coordinate*/coord){
	return this.getUnit(coord).attackable;
};

/**
 * Clear reachables.
 */
ClientHexgrid.prototype.clearReachables = function(){
	for (var i in this.reachables)
		this.reachables[i].reachable = false;
	this.reachables = [];
};

/**
 * Clear attackables.
 */
ClientHexgrid.prototype.clearAttackables = function(){
	for (var i in this.attackables)
		this.attackables[i].attackable = false;
	this.attackables = [];
};

/**
 * Clear buildables.
 */
ClientHexgrid.prototype.clearBuildables = function(){
	for (var i in this.buildables)
		this.buildables[i].buildable = false;
	this.buildables = [];
};
	
/**
 * Clear viewables.
 */
ClientHexgrid.prototype.clearViewables = function(){
	for (var i in this.viewables){
		var check = this.viewables[i];
		check.viewable = false;
		check.pastViewable = true;
	}
	this.viewables = [];

};

/**
 * Remove units that can't be seen.
 * Should only be used after markViewable.
 */
ClientHexgrid.prototype.removeUnviewable = function(/*MiniMap*/ miniMap){
    var tempCoord = new Coordinate(0, 0);
    var tempUnit = null;
	for (var x = 0; x < this.numRows; x++){ // brute force!
        tempCoord.X = x;
		for (var y = 0; y < this.numCols; y++){
            tempCoord.Y = y;
            tempUnit = this.getUnit(tempCoord);
			if (!tempUnit.viewable){
				if (tempUnit.piece)
                    // where is tomap???
					miniMap.removeUnit(this.toMap(tempCoord));
				if (tempUnit.pastViewable){
					// reset opacity to 0
					tempUnit.opacity = 0;
					tempUnit.pastViewable = false;
				}
				tempUnit.piece = null;			
			}
		}
	}
};

/**
 * Update viewable units.
 */
ClientHexgrid.prototype.updateViewable = function(/*int*/team, /*MiniMap*/miniMap){
	if (this.fogOn) {
	  this.clearViewables();
	  this.markViewable(team);
	  this.removeUnviewable(minimap);
    }
}
