/**

	Build a new camera object.
	
	mapSize: an array of length 2, indicating the size of the map
	x, y: integers indicating the coordinates of top-left corner of the camera on the map
	movingSpeed: the distance that the camera should move when user presses an arrow key once
	
 **/
 
var BuildCamera = function(mapSize, x, y, movingSpeed) {

	var me = this;

	// fields
	this.canvas = document.getElementById('gameCanvas');
	this.mapSize = mapSize;
	this.pos = new Point(x, y);
	this.speed = movingSpeed;
	
	// methods
	
	this.setPos = function(x, y){
		var newPos = new Point(x, y);
		// validate the given position
		if (newPos.X < 0) newPos.X = 0;
		if (newPos.X + this.canvas.width > this.mapSize[0])
			newPos.X = this.mapSize[0] - this.canvas.width;
		if (newPos.Y < 0) newPos.Y = 0;
		if (newPos.Y + this.canvas.height > this.mapSize[1])
			newPos.Y = this.mapSize[1] - this.canvas.height;
		this.pos = newPos;
	};
	
	this.draw = function(img){
		var ctx = this.canvas.getContext('2d');
		ctx.drawImage(img, this.pos.X, this.pos.Y, this.canvas.width, this.canvas.height, 
			0, 0, this.canvas.width, this.canvas.height);
	};
	
	this.moveLeft = function(){
		var i = me.pos.X - me.speed;
		if (i >= 0)
			me.pos.X = i;
	};
	
	this.moveRight = function(){
		var i = me.pos.X + me.speed;
		if (i + me.canvas.width <= me.mapSize[0])
			me.pos.X = i;
	};
	
	this.moveUp = function(){
		var i = me.pos.Y - me.speed;
		if (i >= 0)
			me.pos.Y = i;
	};
	
	this.moveDown = function(){
		var i = me.pos.Y + me.speed;
		if (i + me.canvas.height <= me.mapSize[1])
			me.pos.Y = i;
	};
};
