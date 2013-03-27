/**

	Build a new camera object.
	
	mapSize: an array of length 2, indicating the size of the map
	// pos: a point, indicating the coordinates of top-left corner of the camera on the map
	movingSpeed: the distance that the camera should move when user presses an arrow key once.
	img: background image for the minimap.
	layer: the kinetic layer that miniMap will be drawn on.
	
 **/
 
var BuildCamera = function(mapSize, movingSpeed, img, layer) {

	var me = this;

	// fields
	this.mapSize = mapSize;
	this.x = 0;
	this.y = 0;
	this.speed = movingSpeed;
	this.isMovingLeft = false;
	this.isMovingRight = false;
	this.isMovingUp = false;
	this.isMovingDown = false;
	
	// add background image
	var bg = new Kinetic.Image({
		x: 0,
		y: 0,
		image: img,
		width: CONSTANTS.width,
		height: CONSTANTS.height
	});
	layer.add(bg);
	
	// add animation to move camera and background image
	var me = this;
	this.anime = new Kinetic.Animation(function(frame){
		if (me.isMovingLeft)
			me.moveLeft();
		if (me.isMovingRight)
			me.moveRight();
		if (me.isMovingUp)
			me.moveUp();
		if (me.isMovingDown)
			me.moveDown();
		bg.setCrop({
			x: me.x,
			y: me.y,
			width: CONSTANTS.width,
			height: CONSTANTS.height
		});
	}, layer);
	this.anime.start();
	
	// methods
	this.stop = function(){
		if (this.anime) {
			this.anime.stop();
		}
	}
	
	this.setPos = function(p){
		var newX = p.X;
		var newY = p.Y;
		if (newX < 0) newX = 0;
		if (newX + CONSTANTS.width > this.mapSize[0])
			newX = this.mapSize[0] - CONSTANTS.width;
		if (newY < 0) newY = 0;
		if (newY + CONSTANTS.height > this.mapSize[1])
			newY = this.mapSize[1] - CONSTANTS.height;
		this.x = newX;
		this.y = newY;
	};
	
	this.moveLeft = function(){
		var i = me.x - me.speed;
		if (i >= 0)
			me.x = i;
	};
	
	this.moveRight = function(){
		var i = me.x + me.speed;
		if (i + CONSTANTS.width <= me.mapSize[0])
			me.x = i;
	};
	
	this.moveUp = function(){
		var i = me.y - me.speed;
		if (i >= 0)
			me.y = i;
	};
	
	this.moveDown = function(){
		var i = me.y + me.speed;
		if (i + CONSTANTS.height <= me.mapSize[1])
			me.y = i;
	};
};
