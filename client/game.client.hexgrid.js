/**
 * Client hexgrid functions.
 */ 

/**
 * Constructor for client hexgrid.
 */ 
var ClientHexgrid = function(/*hexgrid*/ hexgrid) {
	this.reachables = [];
	this.attackables = [];
	this.buildables = [];
	this.viewables = [];
};

/**
 * Mark reachable locations from coord.
 */
ClientHexgrid.prototype.markReachable = function(/*Coordinate*/coord){
	var selectedHex = this.matrix[coord.X][coord.Y];
	xs = [coord.X-1, coord.X, coord.X+1, coord.X-2, coord.X+2];
	ys = [coord.Y, coord.Y+1, coord.Y-1, coord.Y-2,coord.Y+2];
	for (var i = 0; i < 5; i++) {
		for(var j = 0; j < 5; j++){
			if(this.matrix[xs[i]]){				
				if(this.matrix[xs[i]][ys[j]]){		
					if(this.hexDist(this.matrix[xs[i]][ys[j]], selectedHex) <= CONSTANTS.unitMoveRange  && !this.matrix[xs[i]][ys[j]].piece){
						if(this.matrix[xs[i]][ys[j]].terrain){
							if(this.matrix[xs[i]][ys[j]].terrain.moveable){
								this.matrix[xs[i]][ys[j]].reachable = true;
								this.reachables.push(this.matrix[xs[i]][ys[j]]);
							}
						}else{
							this.matrix[xs[i]][ys[j]].reachable = true;
							this.reachables.push(this.matrix[xs[i]][ys[j]]);
						}
					}
				}
			}
		}
	}
};

/**
 * Mark attachable locations from coord.
 */
ClientHexgrid.prototype.markAttackable = function(/*Coordinate*/coord){
	var selectedHex = this.matrix[coord.X][coord.Y];
	xs = [coord.X-1, coord.X, coord.X+1, coord.X-2, coord.X+2];
	ys = [coord.Y, coord.Y+1, coord.Y-1, coord.Y-2,coord.Y+2];
	for (var i = 0; i < 5; i++) {
		for(var j = 0; j < 5; j++){
			if(this.matrix[xs[i]]){				
				if(this.matrix[xs[i]][ys[j]]){		
					if(this.hexDist(this.matrix[xs[i]][ys[j]], selectedHex) <= CONSTANTS.unitMoveRange  && this.matrix[xs[i]][ys[j]].piece && (selectedHex !=this.matrix[xs[i]][ys[j]])){
						if(this.matrix[xs[i]][ys[j]].piece.team != selectedHex.piece.team){
							this.matrix[xs[i]][ys[j]].attackable = true;
							this.attackables.push(this.matrix[xs[i]][ys[j]]);
						}
					}
				}
			}
		}
	}
};

/**
 * Mark buildable locations for player.
 */
ClientHexgrid.prototype.markBuildable = function(/*int*/ player){
	for(var x in this.matrix){ // brute force!
		for(var y in this.matrix[x]){
			if(this.matrix[x][y].piece && this.matrix[x][y].piece.player == player){
				xs = [x-1, x-1, x, x, parseInt(x)+1, parseInt(x)+1];
				ys = [y, parseInt(y)+1, y-1, parseInt(y)+1, y-1, y];
				for (var i = 0; i < 6; i++) {
					if(this.matrix[xs[i]] && this.matrix[xs[i]][ys[i]] && !this.matrix[xs[i]][ys[i]].piece){
						if(this.matrix[xs[i]][ys[i]].terrain){
							if(this.matrix[xs[i]][ys[i]].terrain.buildable){
								this.matrix[xs[i]][ys[i]].buildable = true;
								this.buildables.push(this.matrix[xs[i]][ys[i]]);
							}
						}else{
							this.matrix[xs[i]][ys[i]].buildable = true;
							this.buildables.push(this.matrix[xs[i]][ys[i]]);
						}
					}
				}
			}
		}
	}
};

/**
 * Mark hexagons that should be displayed for team.
 */
ClientHexgrid.prototype.markViewable = function(/*int*/team){
	for(var x in this.matrix){ // brute force!
		for(var y in this.matrix[x]){
			if(this.matrix[x][y].piece){
				if(this.matrix[x][y].piece.team == team){
					x = parseInt(x);
					y = parseInt(y);
					xs = [x-3, x-2, x-1, x, x+1, x+2, x+3];
					ys = [y-3, y-2, y-1, y, y+1, y+2, y+3];
					for (var i = 0; i < 7; i++) {
						for(var j = 0; j < 7; j++){
							if(this.matrix[xs[i]]){				
								if(this.matrix[xs[i]][ys[j]]){		
									if(this.hexDist(this.matrix[xs[i]][ys[j]], this.matrix[x][y]) <= 3){
										if(this.matrix[xs[i]][ys[j]].viewable == false){
											//Do something that shows transition
											//TODO
											this.matrix[xs[i]][ys[j]].viewable = true;
										}
										this.matrix[xs[i]][ys[j]].viewable = true;
										this.viewables.push(this.matrix[xs[i]][ys[j]]);
									}
								}
							}
						}
					}
				}
			}
		}
	}
};

/**
 * Check if coord is reachable accroding to current reachables.
 * Should only be used after markReachable.
 */
ClientHexgrid.prototype.isReachable = function(/*Coordinate*/coord){
	return this.matrix[coord.X][coord.Y].reachable;
};

/**
 * Check if coord is attackable accroding to current attackables.
 * Should only be used after markReachable.
 */
ClientHexgrid.prototype.isAttackable = function(/*Coordinate*/coord){
	return this.matrix[coord.X][coord.Y].attackable;
};


/**
 * Remove units that can't be seen.
 * Should only be used after markViewable.
 */
ClientHexgrid.prototype.removeUnviewable = function(/*minimap (optional) */minimap){
	for(var x in this.matrix){ // brute force!
		for(var y in this.matrix[x]){
			if(this.matrix[x][y].viewable == false){
				if(this.matrix[x][y].piece){
					minimap.removeUnit(this.toMap(new Coordinate(x,y)));
				}
				if(this.matrix[x][y].pastViewable == true){
					// reset opacity to 0
					this.matrix[x][y].opacity = 0;
					this.matrix[x][y].piece = null;
					this.matrix[x][y].pastViewable = false;
				}
				this.matrix[x][y].piece = null;			
				
			}
		}
	}
};

/**
 * Clear reachables.
 */
ClientHexgrid.prototype.clearReachables = function(){
	for (var i in this.reachables){  // clear clientReachables
		var check = this.reachables[i];
		check.reachable = false;
	}
	this.reachables = [];
};

/**
 * Clear attackables.
 */
ClientHexgrid.prototype.clearAttackables = function(){
	for (var i in this.attackables){  // clear clientReachables
		var check = this.attackables[i];
		check.attackable = false;
	}
	this.attackables = [];
};

/**
 * Clear buildables.
 */
ClientHexgrid.prototype.clearBuildables = function(){
	for (var i in this.buildables){  // clear clientReachables
		var check = this.buildables[i];
		check.buildable = false;
	}
	this.buildables = [];
};
	
/**
 * Clear viewables.
 */
ClientHexgrid.prototype.clearViewables = function(){
	for (var i in this.viewables){  // clear clientReachables
		var check = this.viewables[i];
		check.viewable = false;
		check.pastViewable = true;
	}
	this.viewables = [];

};

/**
 * Constructor for client hexagon.
 */
var ClientHexagon = function(){
	this.reachable = false;
	this.attackable = false;
	this.buildable = false;
	this.viewable = false;
	this.opacity = 1;
	this.pastViewable = false;
};

/**
 * Convert regulat hexagon to client hexagon.
 */
var ClientHexagonFromHexagon = function(/*Hexagon*/ oldHexagon){
	var clientHexagon = new ClientHexagon();
	clientHexagon.prototype = oldHexagon;
	return clientHexagon;
}

/**
 * Convert all regular hexagons in hexgrid to client hexagons.
 */ 
var convertToClientHexagon = function(/*hexgrid*/ hexgrid){
	for(var i in hexgrid.matrix){
		for(var j in hexgrid.matrix[i]){
			var hexagon = hexgrid.matrix[i][j];
			hexgrid.matrix[i][j] = ClientHexagonFromHexagon(hexagon);
		}
	}
};



