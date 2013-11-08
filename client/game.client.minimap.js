/**
 * Minimap object.
 */

/**
 * Constructor to build a new miniMap object.
 * @constructor
 * @camera: a camera object.
 * @mapSize: an array of length 2 indicating the width and height of the map.
 * @width: an integer, which is the actual width of the minimap on the screen.
 * @img: background image for the minimap.
 * @layer: the kinetic layer that miniMap will be drawn on.
 * @stage: the kinetic stage that our game is rendered on.
 **/
var MiniMap = function(/*Camera*/ camera, /*int[]*/ mapSize, /*int*/ width, /*Image*/ img, /*Kinetic.Layer*/ layer, /*Kinetic.Stage*/ stage){
	
    var me = this;
    
    // fields
    this.camera = camera;
    this.mapSize = mapSize;
    this.width = width;
    this.height = Math.floor(mapSize[1]/(mapSize[0]/width));
    this.toDraw = new Kinetic.Group();
    this.units = [];
    
    // draw background image
    var bg = new Kinetic.Image({
        x: 0,
        y: 0,
        image: img,
        width: this.width,
        height: this.height
    });
    this.toDraw.add(bg);
    
    // draw side lines
    this.toDraw.add(new Kinetic.Line({
        points: [[this.width, 0], [this.width, this.height], [0, this.height]],
        stroke: "white",
        strokeWidth: 2,
        listening: false
    }));
    
    // draw camera box
    var cameraBox = new Kinetic.Rect({
        fillEnabled: false,
        stroke: 'rgb(255, 165, 0)',
        strokeWidth: 1,
        x: Math.floor(camera.x*this.width/mapSize[0]),
        y: Math.floor(camera.y*this.height/mapSize[1]),
        width: Math.floor(this.width*CONSTANTS.width/mapSize[0]),
        height: Math.floor(this.height*CONSTANTS.height/mapSize[1]),
        listening: false
    });
    this.toDraw.add(cameraBox);
    
    // add group to layer
    layer.add(this.toDraw);
    
    // add animation to cameraBox
    this.anime = new Kinetic.Animation(function(frame){
        cameraBox.setX(Math.floor(camera.x*me.width/me.mapSize[0]));
        cameraBox.setY(Math.floor(camera.y*me.height/me.mapSize[1]));
    }, layer);
    this.anime.start();
    
    // Event listeners for background of minimap
    bg.on('click', function(event){
        var bgxy = bg.getAbsolutePosition();
        var x = event.pageX - stage.getContainer().offsetLeft - bgxy.x;
        var y = event.pageY - stage.getContainer().offsetTop - bgxy.y;
        var mapX = x/me.width * me.mapSize[0] - CONSTANTS.width/2;
        var mapY = y/me.height * me.mapSize[1] - CONSTANTS.height/2;
        me.camera.setPos(new Point(mapX, mapY));
    });
    bg.on('mouseover', function(event){
        document.body.style.cursor = "pointer";
    });
    bg.on('mouseout', function(event){
        document.body.style.cursor = "auto";
    });
};

/**
 * Stop the animation to move camera through miniMap.
 */
MiniMap.prototype.stop = function(){
    if (this.anime) {
        this.anime.stop();
    }
};

/**
 * Add a unit for the given player at p to the miniMap.
 */ 
MiniMap.prototype.addUnit = function(/*Point*/ p, /*int*/ player){
    // figure out player's color
    var color;
    switch (player) {    
    case 2:
        color = "lightskyblue";
        break;
    case 1:
        color = "yellow";
        break;
    case 0:
        color = "red";
        break;
    case 3:
        color = "green";
        break;
    }
    // create a circle and add into our group
    var s = new Kinetic.Circle({
        x: p.X / this.mapSize[0] * this.width,
        y: p.Y / this.mapSize[1] * this.height,
        radius: 3,
        fill: color,
        listening: false
    });
    this.toDraw.add(s);
    // save it
    this.units.push([p.X, p.Y, player, s]);
};

/**
 * Move the unit at p1 to p2 in the miniMap.
 */ 
this.moveUnit = function(/*Point*/ p1, /*Point*/ p2){
    for (var i in this.units)
        if (this.units[i][0] == p1.X && this.units[i][1] == p1.Y) {
            var player = this.units[i][2];
            this.units[i][3].remove();
            this.units.splice(i, 1);
            this.addUnit(p2, player);
            return;
        }
};

/**
 * Remove a unit from p in the miniMap.
 */ 
this.removeUnit = function(/*Point*/ p){
    for (var i in this.units)
        if (this.units[i][0] == p.X && this.units[i][1] == p.Y) {
            this.units[i][3].remove();
            this.units.splice(i, 1);
            return;
        }
};