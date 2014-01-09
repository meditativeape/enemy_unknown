/**
 * Hex grid map objects and helper functions.
 */
 
/**
 * Server side we import Point and Coordinate and export Map.
 */
if( 'undefined' != typeof global ) {
    var helper = require("./helper.js");
	var Point = helper.Point;
	var Coordinate = helper.Coordinate;
	var CONSTANTS = helper.CONSTANTS;
	var Scenarios = require("./scenarios.js").Scenarios;
    module.exports = BuildMap;
}

/**
 * Constructor for a shared hexgird. Automatically builds matrix of hexagons.
 * @constructor
 */
var Hexgrid = function(/*string*/ mapName /*boolean*/ /*fogOn*/){
	
	//Move to server
	// /*camera*/camera, /*layer*/layer, /*function*/callback, 
	//Move to view
	///*img*/fogImg
	var side = CONSTANTS.hexSideLength;
	var ratio = CONSTANTS.hexRatio;
	this.scenario = Scenarios[mapName];
	var numRows = this.scenario.size.numRows;
	var numCols = this.scenario.size.numCols;
	//var x = this.scenario.size.x;
	//var y = this.scenario.size.y;
	//Move to view
	//var offset = this.scenario.offset;
	
	
//	if (camera && layer) {
//		this.layer = layer;
//		this.hexGroup = new Kinetic.Group();  // only hexagons listen to events
//		this.terrainGroup = new Kinetic.Group({listening: false});
//		this.unitGroup = new Kinetic.Group({listening: false});
//        this.fogGroup = new Kinetic.Group({listening: false});
//	}
	
	this.matrix = [];
	
	//var spec = findHexSpecs(side,ratio);
	//var xpos = offset;
	//var ypos = y/2-spec.height/2;
	for (var i = 0; i < numRows; i++) {
		this.matrix[i] = [];
		for (var j = 0; j < numCols; j++) {
			this.matrix[i][j] = new Hexagon(/*todo*/);
		}
	}
			
	
//	while(xpos < x/2 && (ypos - spec.height/2>0)){
//		while(matrixx <= rows && (ypos + spec.height/2<y)){
//			var id = matrixx.toString(10) + matrixy.toString(10);
//			if(matrixy == 0){
//				this.matrix[matrixx] = [];
//				if(xpos + spec.width/2 + spec.side/2 < x/2){
//					rows =  rows + 1;
//				}			
//			}
//			var hexagon = new Hexagon(id, matrixx, matrixy, xpos, ypos, spec, camera, this, callback, fogOn, fogImg);
//			this.matrix[matrixx][matrixy] = hexagon;
//			ypos = ypos + spec.height/2;
//			xpos = xpos + spec.width/2 + spec.side/2;
//			matrixx = matrixx + 1;
//		}
//		matrixx = 0;
//		matrixy = matrixy + 1;
//		ypos = y/2 - spec.height/2*(matrixy+1);
//		xpos = offset+ (spec.width/2 + spec.side/2)*matrixy;
//	}
	
	//View
	// draw hexagons, terrains, units, and hp bars, then update them
//	if (camera && layer) {
//		layer.add(this.terrainGroup);
//		layer.add(this.hexGroup);
//		layer.add(this.unitGroup);
//        layer.add(this.fogGroup);
//		var me = this;
//		this.anim = new Kinetic.Animation(function(frame) {
//			for(var x in me.matrix){
//				for(var y in me.matrix[x]){
//					me.matrix[x][y].update();
//				}
//			}
//		}, layer);
//		this.anim.start();
//	}
	
	//View
//	this.stop = function stop(){
//		if (this.anim)
//			this.anim.stop();
//	}
	
	//View
//	this.toHex = function toHex(/*Point*/ p){
//		p.X += this.camera.x;
//		p.Y += this.camera.y;
//		for(var x in this.matrix){
//			for(var y in this.matrix[x]){
//				if (this.matrix[x][y].contains(p))
//					return new Coordinate(x,y);
//			}
//		}	
//		return null;
//	};
	
//	this.toMap = function toMap(/*Coordinate*/ coord){
//		return this.matrix[coord.X][coord.Y].MidPoint;
//	};
	
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
	};
	
	this.getTerrain = function(/*Coordinate*/toCheck){
		return this.matrix[toCheck.X][toCheck.Y].terrain;
	};
	
	this.addTerrain = function(toAdd, /*Coordinate*/dest){
		this.matrix[dest.X][dest.Y].terrain = toAdd;
	}
}//End class.



/**
 * Helper function to calculate the specs of a hexagon.
 * @return The specs for all hexagons
 */
//function findHexSpecs(/*double*/side, /*double*/ratio){
//	var z = side;
//	var r = ratio;
//	
//	//solve quadratic
//	var r2 = Math.pow(r, 2);
//	var a = (1 + r2)/r2;
//	var b = z/r2;
//	var c = ((1-4.0*r2)/(4.0*r2)) * (Math.pow(z, 2));
//	var x = (-b + Math.sqrt(Math.pow(b,2)-(4.0*a*c)))/(2.0*a);
//	var y = ((2.0 * x) + z)/(2.0 * r);
//	var spec = new Object();
//	spec.width = ((2.0*x)+z);
//	spec.height = (2.0*y);
//	spec.side = side;
//	return spec;
//	
//}

/**
 * Constructs a hexagon.
 * camera and fogImg could be null on server side, since no visualization is needed.
 * @constructor
 */
function Hexagon(mx, my, map) {
	// original argument list: id, mx, my, x, y, spec, camera, map, callback, fogOn, fogImg
	this.piece = null;
	this.map = map;
	this.matrixx = mx;
	this.matrixy = my;
    //if (fogOn != true)
    //    this.clientViewable = true;
    //this.opacity = 1;
	//this.clientPastViewable = false;
	//this.guessing = false;
	//this.Points = [];//Polygon Base
//	this.spec = spec;
//	var x1 = (spec.width - spec.side)/2;
//	var y1 = (spec.height / 2);
//	this.Points.push(new Point(x1 + x, y));
//	this.Points.push(new Point(x1 + spec.side + x, y));
//	this.Points.push(new Point(spec.width + x, y1 + y));
//	this.Points.push(new Point(x1 + spec.side + x, spec.height + y));
//	this.Points.push(new Point(x1 + x, spec.height + y));
//	this.Points.push(new Point(x, y1 + y));

//	this.Id = id;
//	
//	this.x = x;
//	this.y = y;
//	this.x1 = x1;
//	this.y1 = y1;
//	
//	this.TopLeftPoint = new Point(this.x, this.y);
//	this.BottomRightPoint = new Point(this.x + spec.width, this.y + spec.height);
//	this.MidPoint = new Point(this.x + (spec.width / 2), this.y + y1);
//	
//	this.P1 = new Point(x + x1, y + y1);
//	
//	this.selected = false;
	
	//View
//	if (callback) {
//		this.callback = callback;
//	}
//	
//	if (camera) {
//		this.camera = camera;
//        this.fogImg = fogImg;
//		
//		// add hexagon
//		var hexagonConfig = {
//			points:[],
//			stroke:'rgb(255,255,255)',
//		};
//		for (var i = 0; i < this.Points.length; i++) {
//			hexagonConfig.points.push([this.Points[i].X-this.camera.x, this.Points[i].Y-this.camera.y]);
//		}
//		this.hexagonToDraw = new Kinetic.Polygon(hexagonConfig);
//        
//        // register event listener
//        var me = this;
//		if (this.callback) {
//			this.hexagonToDraw.on('click tap', function(event){
//               	me.callback(new Coordinate(me.matrixx, me.matrixy), event);
//			});
//		}
//        this.hexagonToDraw.on('mouseover', function(){
//            if (me.piece || me.reachable || me.clientAttackable || me.clientBuildable) {
//                me.hexagonToDraw.setStroke("orange");
//                me.hexagonToDraw.moveToTop();
//                document.body.style.cursor = "pointer";
//            }
//        });
//        this.hexagonToDraw.on('mouseout', function(){
//            me.hexagonToDraw.setStroke("white");
//            document.body.style.cursor = "auto";
//        });
//		this.map.hexGroup.add(this.hexagonToDraw);
//	}
};


//View
/**
* Hexagon Method:  Checks if point is in hexagon.
* @this {Hexagon}
*/
//Hexagon.prototype.contains = function(/*Point*/ p) {
//	var isIn = false;
//	if(this.TopLeftPoint.X < p.X && this.TopLeftPoint.Y < p.Y &&
//	   p.X < this.BottomRightPoint.X && p.Y < this.BottomRightPoint.Y)
//	{
//		//turn our absolute point into a relative point for comparing with the polygon's points
//		//var pRel = new HT.Point(p.X - this.x, p.Y - this.y);
//		var i, j = 0;
//		for (i = 0, j = this.Points.length - 1; i < this.Points.length; j = i++)
//		{
//			var iP = this.Points[i];
//			var jP = this.Points[j];
//			if (
//				(
//				 ((iP.Y <= p.Y) && (p.Y < jP.Y)) ||
//				 ((jP.Y <= p.Y) && (p.Y < iP.Y))
//				//((iP.Y > p.Y) != (jP.Y > p.Y))
//				) &&
//				(p.X < (jP.X - iP.X) * (p.Y - iP.Y) / (jP.Y - iP.Y) + iP.X)
//			   )
//			{
//				isIn = !isIn;
//			}
//		}
//	}
//	return isIn;
//};


//View
/**
 * Hexagon Method: Update this hexagon and its unit on its layer
 * @this {Hexagon}
 */
//Hexagon.prototype.update = function() {
//	
//	// update hexagon
//	var points = [];
//	for (var i = 0; i < this.Points.length; i++) {
//		points.push([this.Points[i].X-this.camera.x, this.Points[i].Y-this.camera.y]);
//	}
//	this.hexagonToDraw.setPoints(points);
//	this.hexagonToDraw.setFill('transparent');
//	if (this.reachable || this.clientBuildable) {
//		this.hexagonToDraw.setFill('rgba(120, 255,120, 0.3)');
//	} else if (this.clientAttackable) {
//		this.hexagonToDraw.setFill('rgba(255, 0, 0, 0.3)');
//	}else if (this.guessing){
//		this.hexagonToDraw.setFill('rgba(0,0,255,0.3)');
//	}
//    // else if(!this.clientViewable){
//		// this.hexagonToDraw.setFill('rgba(120,0,0,0.3)');
//	// }
//	// add/update terrain
//	var midPoint = new Point(this.MidPoint.X - this.camera.x, this.MidPoint.Y - this.camera.y);
//	if (this.terrain) {
//		if (this.terrainToDraw) {
//			this.terrain.draw(midPoint, this.spec.height, this.terrainToDraw);
//		} else {
//			this.terrainToDraw = this.terrain.draw(midPoint, this.spec.height);
//			this.map.terrainGroup.add(this.terrainToDraw);
//		}
//	}
//	// add/update unit and hp
//	if (this.unitToDraw)
//		this.unitToDraw.destroy();
//	if (this.piece != null) {
//		this.unitToDraw = this.piece.draw(midPoint, this.spec.height);
//		this.map.unitGroup.add(this.unitToDraw);
//	}
//    // add fog of war
//    if (!this.fog) {
//        this.fog = new Kinetic.Image({
//            image: this.fogImg,
//            opacity: 0,
//            scale: {x:0.95, y:0.95}
//        });
//        this.map.fogGroup.add(this.fog);
//    }
//    this.fog.setX(midPoint.X - this.fogImg.width/3 - 18);
//    this.fog.setY(midPoint.Y - this.fogImg.height/3 - 18);
//    if (!this.clientViewable) {   
//        if (this.opacity < 0.5) {
//            this.fog.setOpacity(this.opacity);
//            this.opacity += 0.01;
//        } else {
//            this.fog.setOpacity(0.5);
//        }
//    } else {
//        this.fog.setOpacity(0);
//    }
//};
