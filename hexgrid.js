/**
* Hex grid map objects and helper functions.
*/

/**
*Constructor for a Map. Automatically builds map of hexagons.
* @constructor
*/
function BuildMap(/*double*/ side,/*double*/ratio,/*int*/ x, /*int*/y,/*double*/offset){
	
	this.matrix = [];
	
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
			this.matrix[matrixx][matrixy] = new Hexagon(id, matrixx,matrixy,xpos, ypos,spec);
			ypos = ypos + spec.height/2;
			xpos = xpos + spec.width/2 + spec.side/2;
			matrixx = matrixx + 1;
		}
		matrixx = 0;
		matrixy = matrixy + 1;
		ypos = y/2 - spec.height/2*(matrixy+1);
		xpos = offset+ (spec.width/2 + spec.side/2)*matrixy;
	}
	
	this.toHex = function toHex(/*double*/ screenx,/*double*/screeny,/*Camera*/camera){
		var mapPoint = Point(screenx+camera.pos.X,screeny+camera.pos.Y);
		for(var x in this.matrix){
			for(var y in this.matrix[x]){
				this.matrix[x][y].contains(mapPoint);
			}
		}	
		return null;
	};
	
	this.toScreen = function toScreen(/*int*/ matrixx,/*int*/matrixy,/*Camera*/camera){
		var mapPoint = this.matix[matrixx][matrixy].MidPoint;
		return Point(mapPoint.X-camera.pos.X,mapPoint.Y-camera.pos.Y);
	};
	
	this.hexDist = function hexDist(/*Hexagon*/ h1, /*Hexagon*/ h2) {
		var deltaX = h1.matrixx - h2.matrixx;
		var deltaY = h1.matrixy - h2.matrixy;
		return ((Math.abs(deltaX) + Math.abs(deltaY) + Math.abs(deltaX - deltaY)) / 2);		
	};
	
	this.draw = function draw(/*Camera*/camera,/*ctx*/ctx){
		for(var x in this.matrix){
			for(var y in this.matrix[x]){
				this.matrix[x][y].draw(camera,ctx);
			}
		}	
	};
	
	this.move = function(/*Coordinate*/ origin, /*Coordinate*/dest) {
		var toMove = this.matrix[origin.X][origin.Y].piece;
		this.matrix[origin.X][origin.Y].piece = null;
		this.matrix[dest.X][dest.Y].piece = toMove;
	};
	
	this.checkSquare = function(/*Coordinate*/toCheck){
		if(this.matrix[toCheck.X][toCheck.Y].piece == null){
			return false;
		}
		else{
			return true;
		}
	}
	
	this.addUnit = function(/*Unit*/ toAdd, /*Coordinate*/dest){
		this.matrix[dest.X][dest.Y].piece = toAdd;
	}
	
	this.getMovable = function(/*Unit*/toMove){
		//TODO
	}
}



/**
* Helper function to calculate the specs of a hexagon.
* @return The specs for all hexagons
*/
function findHexSpecs(/*double*/side,/*double*/ratio){
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
	return spec
	
}

/**
* Constructs a hexagon.
* @constructor
*/
function Hexagon(id, mx,my,x, y,spec,piece) {
	this.piece = null;
	this.matrixx = mx;
	this.matrixy = my;
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
 * Hexagon Method: Draws this Hexagon to the canvas
 * @this {Hexagon}
 */
Hexagon.prototype.draw = function(/*Camera*/camera) {

	var ctx = document.getElementById("gameCanvas").getContext('2d');
	ctx.beginPath();
	ctx.moveTo(this.Points[0].X-camera.pos.X, this.Points[0].Y-camera.pos.Y);
	
	for(var i = 1; i < this.Points.length; i++)
	{
		var p = this.Points[i];
		ctx.lineTo(p.X-camera.pos.X, p.Y-camera.pos.Y);
	}
	ctx.closePath();
	ctx.stroke();
	if(this.piece!=null){
		var midPoint = new Point(this.MidPoint.X-camera.pos.X,this.MidPoint.Y-camera.pos.Y);
		this.piece.draw(midPoint,this.spec.height);
	}
	
};