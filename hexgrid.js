/**
* Hex grid map objects and helper functions.
*/

// server side we import Point and Coordinate.
if( 'undefined' != typeof global ) {
    var helper = require("./helper.js");
	var Point = helper.Point;
	var Coordinate = helper.Coordinate;
	var CONSTANTS = helper.CONSTANTS;
	var Scenarios = require("./scenarios.js").Scenarios;
}

/**
* Constructor for a Map. Automatically builds map of hexagons.
* camera and layer could be null on server, since no visualization is needed there.
* callback could be null on server, since no click event will be fired there.
* @constructor
*/
var BuildMap = function(/*string*/mapName, /*camera*/camera, /*layer*/layer, /*function*/callback, /*boolean*/ fogOn, /*img*/fogImg){
	
	var side = CONSTANTS.hexSideLength;
	var ratio = CONSTANTS.hexRatio;
	this.scenario = Scenarios[mapName];
	var x = this.scenario.size.x;
	var y = this.scenario.size.y;
	var offset = this.scenario.offset;
	
	if (camera && layer) {
		this.layer = layer;
		this.hexGroup = new Kinetic.Group();  // only hexagons listen to events
		this.terrainGroup = new Kinetic.Group({listening: false});
		this.unitGroup = new Kinetic.Group({listening: false});
        this.fogGroup = new Kinetic.Group({listening: false});
	}
	
	this.matrix = [];
	this.clientReachables = [];
	this.clientAttackables = [];
	this.clientBuildables = [];
	this.clientViewables = [];
	
	var spec = findHexSpecs(side,ratio);
	var xpos = offset;
	var ypos = y/2-spec.height/2;
	var matrixx = 0;
	var matrixy = 0;
	var rows = 0;
	while(xpos < x/2 && (ypos - spec.height/2>0)){
		while(matrixx <= rows && (ypos + spec.height/2<y)){
			var id = matrixx.toString(10) + matrixy.toString(10);
			if(matrixy == 0){
				this.matrix[matrixx] = [];
				if(xpos + spec.width/2 + spec.side/2 < x/2){
					rows =  rows + 1;
				}			
			}
			var hexagon = new Hexagon(id, matrixx, matrixy, xpos, ypos, spec, camera, this, callback, fogOn, fogImg);
			this.matrix[matrixx][matrixy] = hexagon;
			ypos = ypos + spec.height/2;
			xpos = xpos + spec.width/2 + spec.side/2;
			matrixx = matrixx + 1;
		}
		matrixx = 0;
		matrixy = matrixy + 1;
		ypos = y/2 - spec.height/2*(matrixy+1);
		xpos = offset+ (spec.width/2 + spec.side/2)*matrixy;
	}
	
	// draw hexagons, terrains, units, and hp bars, then update them
	if (camera && layer) {
		layer.add(this.terrainGroup);
		layer.add(this.hexGroup);
		layer.add(this.unitGroup);
        layer.add(this.fogGroup);
		var me = this;
		this.anim = new Kinetic.Animation(function(frame) {
			for(var x in me.matrix){
				for(var y in me.matrix[x]){
					me.matrix[x][y].update();
				}
			}
		}, layer);
		this.anim.start();
	}
	
	this.stop = function stop(){
		if (this.anim)
			this.anim.stop();
	}
	
	this.toHex = function toHex(/*Point*/ p){
		p.X += this.camera.x;
		p.Y += this.camera.y;
		for(var x in this.matrix){
			for(var y in this.matrix[x]){
				if (this.matrix[x][y].contains(p))
					return new Coordinate(x,y);
			}
		}	
		return null;
	};
	
	this.toMap = function toMap(/*Coordinate*/ coord){
		return this.matrix[coord.X][coord.Y].MidPoint;
	};
	
	this.hexDist = function hexDist(/*Hexagon*/ h1, /*Hexagon*/ h2) {
		var deltaX = h1.matrixx - h2.matrixx;
		var deltaY = h1.matrixy - h2.matrixy;
		return ((Math.abs(deltaX) + Math.abs(deltaY) + Math.abs(deltaX + deltaY)) / 2);		
	};
	
	this.move = function(/*Coordinate*/ origin, /*Coordinate*/dest) {
		var toMove = this.matrix[origin.X][origin.Y].piece;
		this.matrix[origin.X][origin.Y].piece = null;
		this.matrix[dest.X][dest.Y].piece = toMove;
        toMove.x = dest.X;
        toMove.y = dest.Y;
		this.matrix[dest.X][dest.Y].piece.buff = this.matrix[dest.X][dest.Y].terrain?this.matrix[dest.X][dest.Y].terrain.buff:null;
	};
	
	this.attack = function(/*Coordinate*/ attacker, /*Coordinate*/gothit){
		this.matrix[gothit.X][gothit.Y].piece.gotHit(this.matrix[attacker.X][attacker.Y].piece);
		if(this.matrix[gothit.X][gothit.Y].piece.hp<=0){
			this.matrix[gothit.X][gothit.Y].piece = null;
		}
		if(this.matrix[attacker.X][attacker.Y].piece.hp<=0){
			this.matrix[attacker.X][attacker.Y].piece = null;
		}
	}
	
	this.getUnit = function(/*Coordinate*/toCheck){
        if (this.matrix[toCheck.X] && this.matrix[toCheck.X][toCheck.Y])
            return this.matrix[toCheck.X][toCheck.Y].piece;
        else
            return null;
	};
	
	this.addUnit = function(/*Unit */ toAdd, /*Coordinate*/dest){
		this.matrix[dest.X][dest.Y].piece = toAdd;
		this.matrix[dest.X][dest.Y].piece.buff = this.matrix[dest.X][dest.Y].terrain?this.matrix[dest.X][dest.Y].terrain.buff:null; 
	};
	
	this.getTerrain = function(/*Coordinate*/toCheck){
		return this.matrix[toCheck.X][toCheck.Y].terrain;
	};
	
	this.addTerrain = function(toAdd, /*Coordinate*/dest){
		this.matrix[dest.X][dest.Y].terrain = toAdd;
	}
		
	this.isReachable = function(/*Coordinate*/coord){
		return this.matrix[coord.X][coord.Y].reachable;
	};
	
	this.isAttackable = function(/*Coordinate*/coord){
		return this.matrix[coord.X][coord.Y].clientAttackable;
	};
    
	this.clientMarkReachable = function(/*Coordinate*/coord){
		var selectedHex = this.matrix[coord.X][coord.Y];
		xs = [coord.X-1, coord.X, coord.X+1, coord.X-2, coord.X+2];
		ys = [coord.Y, coord.Y+1, coord.Y-1, coord.Y-2,coord.Y+2];
		for (var i = 0; i < 5; i++) {
			for(var j = 0; j < 5; j++){
				var range = selectedHex.piece.buff?selectedHex.piece.range+selectedHex.piece.buff.rangeBuff:selectedHex.piece.range;
                if(this.matrix[xs[i]]){				
                    if(this.matrix[xs[i]][ys[j]]){		
                        if(this.hexDist(this.matrix[xs[i]][ys[j]], selectedHex) <= range  && !this.matrix[xs[i]][ys[j]].piece){
                            if(this.matrix[xs[i]][ys[j]].terrain){
                                if(this.matrix[xs[i]][ys[j]].terrain.moveable){
                                    this.matrix[xs[i]][ys[j]].reachable = true;
                                    this.clientReachables.push(this.matrix[xs[i]][ys[j]]);
                                }
                            }else{
                                this.matrix[xs[i]][ys[j]].reachable = true;
                                this.clientReachables.push(this.matrix[xs[i]][ys[j]]);
                            }
                        }
                    }
                }
			}
		}
		

	};
	
	this.clientMarkAttackable = function(/*Coordinate*/coord){
		var selectedHex = this.matrix[coord.X][coord.Y];
		xs = [coord.X-1, coord.X, coord.X+1, coord.X-2, coord.X+2];
		ys = [coord.Y, coord.Y+1, coord.Y-1, coord.Y-2,coord.Y+2];
		for (var i = 0; i < 5; i++) {
			for(var j = 0; j < 5; j++){
				var range = selectedHex.piece.buff?selectedHex.piece.range+selectedHex.piece.buff.rangeBuff:selectedHex.piece.range;
                if(this.matrix[xs[i]]){				
                    if(this.matrix[xs[i]][ys[j]]){		
                        if(this.hexDist(this.matrix[xs[i]][ys[j]], selectedHex) <= range  && this.matrix[xs[i]][ys[j]].piece && (selectedHex !=this.matrix[xs[i]][ys[j]])){
                            if(this.matrix[xs[i]][ys[j]].piece.team != selectedHex.piece.team){
                                this.matrix[xs[i]][ys[j]].clientAttackable = true;
                                this.clientAttackables.push(this.matrix[xs[i]][ys[j]]);
                            }
                        }
                    }
                }
			}
		}
	};
	
	this.clientMarkBuildable = function(/*int*/player){
		for(var x in this.matrix){ // brute force!
			for(var y in this.matrix[x]){
                if(this.matrix[x][y].piece && this.matrix[x][y].piece.player == player){
                    xs = [x-1, x-1, x, x, parseInt(x)+1, parseInt(x)+1];
                    ys = [y, parseInt(y)+1, y-1, parseInt(y)+1, y-1, y];
                    for (var i = 0; i < 6; i++) {
                        if(this.matrix[xs[i]] && this.matrix[xs[i]][ys[i]] && !this.matrix[xs[i]][ys[i]].piece){
                            if(this.matrix[xs[i]][ys[i]].terrain){
                                if(this.matrix[xs[i]][ys[i]].terrain.buildable){
                                    this.matrix[xs[i]][ys[i]].clientBuildable = true;
                                    this.clientBuildables.push(this.matrix[xs[i]][ys[i]]);
                                }
                            }else{
                                this.matrix[xs[i]][ys[i]].clientBuildable = true;
                                this.clientBuildables.push(this.matrix[xs[i]][ys[i]]);
                            }
                        }
                    }
                }
			}
		}
	};
	
	this.clientMarkViewable = function(/*int*/team){
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
											if(this.matrix[xs[i]][ys[j]].clientViewable == false){
												//Do something that shows transition
												//TODO
												this.matrix[xs[i]][ys[j]].clientViewable = true;
												
											}
											this.matrix[xs[i]][ys[j]].clientViewable = true;
											this.clientViewables.push(this.matrix[xs[i]][ys[j]]);
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
	
	this.clientRemoveUnseeable = function(minimap){
		for(var x in this.matrix){ // brute force!
			for(var y in this.matrix[x]){
				if(this.matrix[x][y].clientViewable == false){
					if(this.matrix[x][y].piece){
						minimap.removeUnit(this.toMap(new Coordinate(x,y)));
					}
					if(this.matrix[x][y].clientPastViewable == true){
						// reset opacity to 0
						this.matrix[x][y].opacity = 0;
						this.matrix[x][y].piece = null;
                        this.matrix[x][y].clientPastViewable = false;
					}
					this.matrix[x][y].piece = null;			
					
				}
			}
		}
	}
	
	this.clientClearReachable = function(){
		for (var i in this.clientReachables){  // clear clientReachables
			var check = this.clientReachables[i];
			check.reachable = false;
		}
		this.clientReachables = [];
	};
	
	this.clientClearAttackable = function(){
		for (var i in this.clientAttackables){  // clear clientReachables
			var check = this.clientAttackables[i];
			check.clientAttackable = false;
		}
		this.clientAttackables = [];
	};
	
	this.clientClearBuildable = function(){
		for (var i in this.clientBuildables){  // clear clientReachables
			var check = this.clientBuildables[i];
			check.clientBuildable = false;
		}
		this.clientBuildables = [];
	};
		
	this.clientClearViewable = function(){
		for (var i in this.clientViewables){  // clear clientReachables
			var check = this.clientViewables[i];
			check.clientViewable = false;
			check.clientPastViewable = true;
		}
		this.clientViewables = [];
	};

    this.serverUpdateVisible = function() {
        var piecesToAdd = [[], []];
        for (var x in this.matrix)
            for (var y in this.matrix[x])
                if (this.matrix[x][y].piece) {  // for each piece, check surrounding hexs
                    if (this.serverUpdatePieceVisible(x, y)) {  // if a piece becomes visible, add to the list
                        piecesToAdd[this.matrix[x][y].piece.team].push(new Coordinate(x, y));
                    }
                }
        return piecesToAdd;
    }
    
    this.serverUpdatePieceVisible = function(/*int*/ x, /*int*/ y) {
        x = parseInt(x);
        y = parseInt(y);
        var myTeam = this.matrix[x][y].piece.team;
        for (var i = -3; i <= 3; i++)
            for (var j = -3; j <= 3; j++) {
                i = parseInt(i);
                j = parseInt(j);
                if (this.matrix[x+i] && this.matrix[x+i][y+j] && (this.hexDist(this.matrix[x][y], 
                this.matrix[x+i][y+j]) <= 3) && this.matrix[x+i][y+j].piece && 
                (this.matrix[x+i][y+j].piece.team != myTeam))  { // there is an enemy piece beside
                    //console.log(x + " " + y + " is visible");
                    return this.matrix[x][y].piece.serverSetVisible(true);
                }
            }
        return this.matrix[x][y].piece.serverSetVisible(false);
    }
}

// server side we export BuildMap.
if( 'undefined' != typeof global ) {
    module.exports = BuildMap;
}

/**
* Helper function to calculate the specs of a hexagon.
* @return The specs for all hexagons
*/
function findHexSpecs(/*double*/side, /*double*/ratio){
	var z = side
	var r = ratio
	
	//solve quadratic
	var r2 = Math.pow(r, 2);
	var a = (1 + r2)/r2;
	var b = z/r2;
	var c = ((1-4.0*r2)/(4.0*r2)) * (Math.pow(z, 2));
	var x = (-b + Math.sqrt(Math.pow(b,2)-(4.0*a*c)))/(2.0*a);
	var y = ((2.0 * x) + z)/(2.0 * r);
	var spec = new Object();
	spec.width = ((2.0*x)+z);
	spec.height = (2.0*y);
	spec.side = side;
	return spec;
	
}

/**
* Constructs a hexagon.
* camera and fogImg could be null on server side, since no visualization is needed.
* @constructor
*/
function Hexagon(id, mx, my, x, y, spec, camera, map, callback, fogOn, fogImg) {
	this.piece = null;
	this.map = map;
	this.matrixx = mx;
	this.matrixy = my;
	this.reachable = false;
	this.clientAttackable = false;
	this.clientBuildable = false;
	this.clientViewable = false;
    if (fogOn != true)
        this.clientViewable = true;
    this.opacity = 1;
	this.clientPastViewable = false;
	this.guessing = false;
	this.Points = [];//Polygon Base
	this.spec = spec;
	var x1 = (spec.width - spec.side)/2;
	var y1 = (spec.height / 2);
	this.Points.push(new Point(x1 + x, y));
	this.Points.push(new Point(x1 + spec.side + x, y));
	this.Points.push(new Point(spec.width + x, y1 + y));
	this.Points.push(new Point(x1 + spec.side + x, spec.height + y));
	this.Points.push(new Point(x1 + x, spec.height + y));
	this.Points.push(new Point(x, y1 + y));

	this.Id = id;
	
	this.x = x;
	this.y = y;
	this.x1 = x1;
	this.y1 = y1;
	
	this.TopLeftPoint = new Point(this.x, this.y);
	this.BottomRightPoint = new Point(this.x + spec.width, this.y + spec.height);
	this.MidPoint = new Point(this.x + (spec.width / 2), this.y + y1);
	
	this.P1 = new Point(x + x1, y + y1);
	
	this.selected = false;
	
	if (callback) {
		this.callback = callback;
	}
	
	if (camera) {
		this.camera = camera;
        this.fogImg = fogImg;
		
		// add hexagon
		var hexagonConfig = {
			points:[],
			stroke:'rgb(255,255,255)',
		};
		for (var i = 0; i < this.Points.length; i++) {
			hexagonConfig.points.push([this.Points[i].X-this.camera.x, this.Points[i].Y-this.camera.y]);
		}
		this.hexagonToDraw = new Kinetic.Polygon(hexagonConfig);
        
        // register event listener
        var me = this;
		if (this.callback) {
			this.hexagonToDraw.on('click tap', function(event){
               	me.callback(new Coordinate(me.matrixx, me.matrixy), event);
			});
		}
        this.hexagonToDraw.on('mouseover', function(){
            if (me.piece || me.reachable || me.clientAttackable || me.clientBuildable) {
                me.hexagonToDraw.setStroke("orange");
                me.hexagonToDraw.moveToTop();
                document.body.style.cursor = "pointer";
            }
        });
        this.hexagonToDraw.on('mouseout', function(){
            me.hexagonToDraw.setStroke("white");
            document.body.style.cursor = "auto";
        });
		this.map.hexGroup.add(this.hexagonToDraw);
	}
};

/**
* Hexagon Method:  Checks if point is in hexagon.
* @this {Hexagon}
*/
Hexagon.prototype.contains = function(/*Point*/ p) {
	var isIn = false;
	if(this.TopLeftPoint.X < p.X && this.TopLeftPoint.Y < p.Y &&
	   p.X < this.BottomRightPoint.X && p.Y < this.BottomRightPoint.Y)
	{
		//turn our absolute point into a relative point for comparing with the polygon's points
		//var pRel = new HT.Point(p.X - this.x, p.Y - this.y);
		var i, j = 0;
		for (i = 0, j = this.Points.length - 1; i < this.Points.length; j = i++)
		{
			var iP = this.Points[i];
			var jP = this.Points[j];
			if (
				(
				 ((iP.Y <= p.Y) && (p.Y < jP.Y)) ||
				 ((jP.Y <= p.Y) && (p.Y < iP.Y))
				//((iP.Y > p.Y) != (jP.Y > p.Y))
				) &&
				(p.X < (jP.X - iP.X) * (p.Y - iP.Y) / (jP.Y - iP.Y) + iP.X)
			   )
			{
				isIn = !isIn;
			}
		}
	}
	return isIn;
};

/**
 * Hexagon Method: Update this hexagon and its unit on its layer
 * @this {Hexagon}
 */
Hexagon.prototype.update = function() {
	
	// update hexagon
	var points = [];
	for (var i = 0; i < this.Points.length; i++) {
		points.push([this.Points[i].X-this.camera.x, this.Points[i].Y-this.camera.y]);
	}
	this.hexagonToDraw.setPoints(points);
	this.hexagonToDraw.setFill('transparent');
	if (this.reachable || this.clientBuildable) {
		this.hexagonToDraw.setFill('rgba(120, 255,120, 0.3)');
	} else if (this.clientAttackable) {
		this.hexagonToDraw.setFill('rgba(255, 0, 0, 0.3)');
	}else if (this.guessing){
		this.hexagonToDraw.setFill('rgba(0,0,255,0.3)');
	}
    // else if(!this.clientViewable){
		// this.hexagonToDraw.setFill('rgba(120,0,0,0.3)');
	// }
	// add/update terrain
	var midPoint = new Point(this.MidPoint.X - this.camera.x, this.MidPoint.Y - this.camera.y);
	if (this.terrain) {
		if (this.terrainToDraw) {
			this.terrain.draw(midPoint, this.spec.height, this.terrainToDraw);
		} else {
			this.terrainToDraw = this.terrain.draw(midPoint, this.spec.height);
			this.map.terrainGroup.add(this.terrainToDraw);
		}
	}
	// add/update unit and hp
	if (this.unitToDraw)
		this.unitToDraw.destroy();
	if (this.piece != null) {
		this.unitToDraw = this.piece.draw(midPoint, this.spec.height);
		this.map.unitGroup.add(this.unitToDraw);
	}
    // add fog of war
    if (!this.fog) {
        this.fog = new Kinetic.Image({
            image: this.fogImg,
            x: midPoint.X - this.fogImg.width/4,
            y: midPoint.Y - this.fogImg.height/4,
            opacity: 0,
            scale: {x:0.6, y:0.6}
        });
        this.map.fogGroup.add(this.fog);
    }
    this.fog.setX(midPoint.X - this.fogImg.width/3);
    this.fog.setY(midPoint.Y - this.fogImg.height/3);
    if (!this.clientViewable) {   
        if (this.opacity < 0.5) {
            this.fog.setOpacity(this.opacity);
            this.opacity += 0.01;
        } else {
            this.fog.setOpacity(0.5);
        }
    } else {
        this.fog.setOpacity(0);
    }
};
