/**

	Build a new camera object.
	
	mapSize: an array of length 2, indicating the size of the map
	pos: a point, indicating the coordinates of top-left corner of the camera on the map
	movingSpeed: the distance that the camera should move when user presses an arrow key once
	
 **/
 
var BuildCamera = function(mapSize, p, movingSpeed) {

	var me = this;

	// fields
	this.canvas = document.getElementById('gameCanvas');
	this.mapSize = mapSize;
	this.x = p.X;
	this.y = p.Y;
	this.speed = movingSpeed;
	
	// methods
	
	this.setPos = function(p){
		var newX = p.X;
		var newY = p.Y;
		if (newX < 0) newX = 0;
		if (newX + this.canvas.width > this.mapSize[0])
			newX = this.mapSize[0] - this.canvas.width;
		if (newY < 0) newY = 0;
		if (newY + this.canvas.height > this.mapSize[1])
			newY = this.mapSize[1] - this.canvas.height;
		this.x = newX;
		this.y = newY;
	};
	
	this.draw = function(img){
		var ctx = this.canvas.getContext('2d');
		ctx.drawImage(img, this.x, this.y, this.canvas.width, this.canvas.height, 
			0, 0, this.canvas.width, this.canvas.height);
	};
	
	this.moveLeft = function(){
		var i = me.x - me.speed;
		if (i >= 0)
			me.x = i;
	};
	
	this.moveRight = function(){
		var i = me.x + me.speed;
		if (i + me.canvas.width <= me.mapSize[0])
			me.x = i;
	};
	
	this.moveUp = function(){
		var i = me.y - me.speed;
		if (i >= 0)
			me.y = i;
	};
	
	this.moveDown = function(){
		var i = me.y + me.speed;
		if (i + me.canvas.height <= me.mapSize[1])
			me.y = i;
	};
};
