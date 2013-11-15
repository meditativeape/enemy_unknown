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
    this.dragged = false;
    this.lastTouchCoord = null;
	
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
	
    // add drag support for mobile devices
    // should be moved to UI class
    bg.on('touchstart', function(event){
        // If this is a one-finger touch
        if (event.targetTouches.length == 1) {
            var touch = event.targetTouches[0];
            me.lastTouchCoord = new Point(touch.pageX, touch.pageY);
            me.dragged = false;
        }
    });
    bg.on('touchmove', function(event){
        // If this is a one-finger touch
        if (event.targetTouches.length == 1) {
            var touch = event.targetTouches[0];
            var currTouchCoord = new Point(touch.pageX, touch.pageY);
            me.movePos(me.lastTouchCoord, currTouchCoord);
            me.lastTouchCoord = currTouchCoord;
            me.dragged = true;
        }
    });
    
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
        console.log("Set position to (" + this.x + ", " + this.y + ")");
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
    
    this.movePos = function(/*Point*/ p1, /*Point*/ p2){
        var pos = new Point(me.x, me.y);
        pos.X -= p2.X - p1.X;
        pos.Y -= p2.Y - p1.Y;
        me.setPos(pos);
    };
    
    this.touchstart = function(event){
        console.log("Fire touchstart");
        bg.fire('touchstart', event);
    };
    
    this.touchmove = function(event){
        console.log("Fire touchmove");
        bg.fire('touchmove', event);
    };
};
