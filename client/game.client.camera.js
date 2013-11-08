/**
 * Camera object.
 */

/**
 * Constructor to build a new camera object that shows game contents.
 * @constructor
 * @mapSize: an array of length 2, indicating the size of the map
 * @movingSpeed: the distance that the camera should move when user presses an arrow key once.
 * @img: background image for the game.
 * @layer: the kinetic layer that the game will be drawn on.
 **/
var Camera = function(/*int[]*/ mapSize, /*int*/ movingSpeed, /*Image*/ img, /*Kinetic.Layer*/ layer) {

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
};

/**
 * Stop the animation to move camera and background image.
 */ 
Camera.prototype.stop = function(){
    if (this.anime) {
        this.anime.stop();
    }
};

/**
 * Set the coordination of top-left cornor of the camera.
 */
Camera.prototype.setPos = function(/*Point*/ p){
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
    
/**
 * Move the camera left.
 */
Camera.prototype.moveLeft = function(){
    var i = this.x - this.speed;
    if (i >= 0)
        this.x = i;
};

/**
 * Move the camera right.
 */    
Camera.prototype.moveRight = function(){
    var i = this.x + this.speed;
    if (i + CONSTANTS.width <= this.mapSize[0])
        this.x = i;
};

/**
 * Move the camera up.
 */
Camera.prototype.moveUp = function(){
    var i = this.y - this.speed;
    if (i >= 0)
        this.y = i;
};

/**
 * Move the camera down.
 */
Camera.prototype.moveDown = function(){
    var i = this.y + this.speed;
    if (i + CONSTANTS.height <= this.mapSize[1])
        this.y = i;
};