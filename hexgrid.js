/**
* Hex grid map objects and helper functions.
*/

// server side we import Point and Coordinate.
if( 'undefined' != typeof global ) {
    var helper = require("./helper.js");
	var Point = helper.Point;
	var Coordinate = helper.Coordinate;
}

/**
* Constructor for a Map. Automatically builds map of hexagons.
* camera and layer could be null on server, since no visualization is needed there.
* callback could be null on server, since no click event will be fired there.
* @constructor
*/
var BuildMap = function(/*double*/side, /*double*/ratio,/*int*/ x, /*int*/y, /*double*/offset, /*camera*/camera, /*layer*/layer, /*function*/callback){
	
	if (camera && layer) {
		this.layer = layer;
		this.hexGroup = new Kinetic.Group();  // only hexagons listen to events
		this.terrainGroup = new Kinetic.Group({listening: false});
		this.unitGroup = new Kinetic.Group({listening: false});
		this.hpGroup = new Kinetic.Group({listening: false});
	}
	
	this.matrix = [];
	this.reachables = [];
	this.attackables = [];
	
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
			var hexagon = new Hexagon(id, matrixx, matrixy, xpos, ypos, spec, camera, this, callback);
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
		layer.add(this.hpGroup);
		var me = this;
		var anim = new Kinetic.Animation(function(frame) {
			for(var x in me.matrix){
				for(var y in me.matrix[x]){
					me.matrix[x][y].update();
				}
			}
		}, layer);
		anim.start();
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
	
	// this.draw = function draw(/*Camera*/camera){
		// for(var x in this.matrix){
			// for(var y in this.matrix[x]){
				// this.matrix[x][y].draw(camera);
			// }
		// }	
		// for(var x in this.matrix){
			// for(var y in this.matrix[x]){
				// if(this.matrix[x][y].piece){
					// var midPoint = new Point(this.matrix[x][y].MidPoint.X-camera.x,this.matrix[x][y].MidPoint.Y-camera.y);
					// this.matrix[x][y].piece.drawHP(midPoint,this.matrix[x][y].spec.height);
				// }
			// }		
		// }
	// };
	
	this.move = function(/*Coordinate*/ origin, /*Coordinate*/dest) {
		var toMove = this.matrix[origin.X][origin.Y].piece;
		this.matrix[origin.X][origin.Y].piece = null;
		this.matrix[dest.X][dest.Y].piece = toMove;
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
		return this.matrix[toCheck.X][toCheck.Y].piece;

	};
	
	this.addUnit = function(/*Unit*/ toAdd, /*Coordinate*/dest){
		this.matrix[dest.X][dest.Y].piece = toAdd;
	};
	
	this.markReachable = function(/*Coordinate*/coord){
		var selectedHex = this.matrix[coord.X][coord.Y];
		for(var x in this.matrix){ // brute force!
			for(var y in this.matrix[x]){
				if (this.hexDist(selectedHex, this.matrix[x][y]) <= selectedHex.piece.range && !this.matrix[x][y].piece) { // in range and not occupied
					this.matrix[x][y].reachable = true;
					this.reachables.push(this.matrix[x][y]);
				}
			}
		}
	};
	
	this.markAttackable = function(/*Coordinate*/coord){
		var selectedHex = this.matrix[coord.X][coord.Y];
		for(var x in this.matrix){ // brute force!
			for(var y in this.matrix[x]){
				if (this.hexDist(selectedHex, this.matrix[x][y]) <= selectedHex.piece.range && this.matrix[x][y].piece && (selectedHex !=this.matrix[x][y])) { // in range and occupied by enemys
					if(this.matrix[coord.X][coord.Y].piece.team!=this.matrix[x][y].piece.team){
						this.matrix[x][y].attackable = true;
						this.attackables.push(this.matrix[x][y]);
					}
				}
			}
		}
	};
	
	
	this.clearReachable = function(){
		for (var i in this.reachables){  // clear reachables
			var check = this.reachables[i];
			check.reachable = false;
		}
		this.reachables = [];
	};
	
	this.clearAttackable = function(){
		for (var i in this.attackables){  // clear reachables
			var check = this.attackables[i];
			check.attackable = false;
		}
		this.attackables = [];
	};
	
	this.isReachable = function(/*Coordinate*/coord){
		return this.matrix[coord.X][coord.Y].reachable;
	}
	
	this.isAttackable = function(/*Coordinate*/coord){
		return this.matrix[coord.X][coord.Y].attackable;
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
* camera could be null on server side, since no visualization is needed.
* @constructor
*/
function Hexagon(id, mx, my, x, y, spec, camera, map, callback) {
	this.piece = null;
	this.map = map;
	this.matrixx = mx;
	this.matrixy = my;
	this.reachable = false;
	this.attackable = false;
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
		
		// add hexagon
		var hexagonConfig = {
			points:[],
			stroke:'rgb(255, 165, 0)',
		};
		for (var i = 0; i < this.Points.length; i++) {
			hexagonConfig.points.push([this.Points[i].X-this.camera.x, this.Points[i].Y-this.camera.y]);
		}
		if (this.reachable) {
			hexagonConfig.fill = 'rgba(238, 130, 238, 0.3)';
		} else if (this.attackable) {
			hexagonConfig.fill = 'rgba(130, 238, 130, 0.3)';
		}
		this.hexagonToDraw = new Kinetic.Polygon(hexagonConfig);
		if (this.callback) {
			var me = this;
			this.hexagonToDraw.on('click', function(event){
				me.callback(new Coordinate(me.matrixx, me.matrixy));
			});
		}
		this.map.hexGroup.add(this.hexagonToDraw);
		
		// TODO: add terrain
		this.terrainToDraw = null;
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
	if (this.reachable) {
		this.hexagonToDraw.setFill('rgba(238, 130, 238, 0.3)');
	} else if (this.attackable) {
		this.hexagonToDraw.setFill('rgba(130, 238, 130, 0.3)');
	}
	
	// add/update unit and hp
	if (this.unitToDraw)
		this.unitToDraw.destroy();
	if (this.hpToDraw)
		this.hpToDraw.destroy();
	if (this.piece != null) {
		var midPoint = new Point(this.MidPoint.X - this.camera.x, this.MidPoint.Y - this.camera.y);
		this.unitToDraw = this.piece.draw(midPoint,this.spec.height);
		this.map.unitGroup.add(this.unitToDraw);
		this.hpToDraw = this.piece.drawHP(midPoint,this.spec.height);
		this.map.hpGroup.add(this.hpToDraw);
	}
};
