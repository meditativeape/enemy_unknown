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
    this.delayedStop = null;
	
	// add background image
	bg = new Kinetic.Image({
		x: 0,
		y: 0,
		image: img,
		width: CONSTANTS.width,
		height: CONSTANTS.height
	});
	layer.add(bg);
	
	// add animation to move camera
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
		me.redrawCamera();
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
    
    // setters
    this.setIsMovingLeft = function(/*boolean*/ isMovingLeft){
        me.isMovingLeft = isMovingLeft;
        if (isMovingLeft)
            me.startAnimation();
        else if (!me.isMovingRight && !me.isMovingUp && !me.isMovingDown)
            me.stopAnimation();
    }
    
    this.setIsMovingRight = function(/*boolean*/ isMovingRight){
        me.isMovingRight = isMovingRight;
        if (isMovingRight)
            me.startAnimation();
        else if (!me.isMovingLeft && !me.isMovingUp && !me.isMovingDown)
            me.stopAnimation();
    }
    
    this.setIsMovingUp = function(/*boolean*/ isMovingUp){
        me.isMovingUp = isMovingUp;
        if (isMovingUp)
            me.startAnimation();
        else if (!me.isMovingLeft && !me.isMovingRight && !me.isMovingDown)
            me.stopAnimation();
    }
    
    this.setIsMovingDown = function(/*boolean*/ isMovingDown){
        me.isMovingDown = isMovingDown;
        if (isMovingDown)
            me.startAnimation();
        else if (!me.isMovingLeft && !me.isMovingRight && !me.isMovingUp)
            me.stopAnimation();
    }
    
	// methods
    this.startAnimation = function(){
        if (this.anime && !this.anime.isRunning())
            this.anime.start();
    }
    
	this.stopAnimation = function(){
		//alert("stopped");
        //if (this.anime && this.anime.isRunning())
        //    this.anime.stop();
	}
    
    this.redrawCamera = function(){
        bg.setCrop({
			x: this.x,
			y: this.y,
			width: CONSTANTS.width,
			height: CONSTANTS.height
		});
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
        this.redrawCamera();
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
    
    // methods to fire touch events
    this.touchstart = function(event){
        bg.fire('touchstart', event);
    };
    
    this.touchmove = function(event){
        bg.fire('touchmove', event);
    };
};
