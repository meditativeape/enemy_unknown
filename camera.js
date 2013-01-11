/**

	Build a new camera object.
	
	mapSize: an array of length 2, indicating the size of the map
	pos: an array of length 2, indicating the coordinates of top-left corner of the camera on the map
	movingSpeed: the distance that the camera should move when user presses an arrow key once
	
 **/
 
var BuildCamera = function(mapSize, pos, movingSpeed) {

	var me = this;

	// fields
	this.canvas = document.getElementById('gameCanvas');
	this.mapSize = mapSize;
	this.pos = pos;
	this.speed = movingSpeed;
	
	// methods
	
	this.setPos = function(x, y){
		// validate the given position
		if (x < 0) x = 0;
		if (x + this.canvas.width > this.mapSize[0])
			x = this.mapSize[0] - this.canvas.width;
		if (y < 0) y = 0;
		if (y + this.canvas.height > this.mapSize[1])
			y = this.mapSize[1] - this.canvas.height;
		this.pos = [x, y];
	};
	
	this.draw = function(img){
		var ctx = this.canvas.getContext('2d');
		ctx.drawImage(img, this.pos[0], this.pos[1], this.canvas.width, this.canvas.height, 
			0, 0, this.canvas.width, this.canvas.height);
	};
	
	this.moveLeft = function(){
		var i = me.pos[0] - me.speed;
		if (i >= 0)
			me.pos[0] = i;
	};
	
	this.moveRight = function(){
		var i = me.pos[0] + me.speed;
		if (i + me.canvas.width <= me.mapSize[0])
			me.pos[0] = i;
	};
	
	this.moveUp = function(){
		var i = me.pos[1] - me.speed;
		if (i >= 0)
			me.pos[1] = i;
	};
	
	this.moveDown = function(){
		var i = me.pos[1] + me.speed;
		if (i + me.canvas.height <= me.mapSize[1])
			me.pos[1] = i;
	};
};

// THESE IS JUST FOR DEBUG USE AND SHOULD BE PUT INTO GAMECORE

( function () {

    var lastTime = 0;
    var vendors = [ 'ms', 'moz', 'webkit', 'o' ];

    for ( var x = 0; x < vendors.length && !window.requestAnimationFrame; ++ x ) {
        window.requestAnimationFrame = window[ vendors[ x ] + 'RequestAnimationFrame' ];
        window.cancelAnimationFrame = window[ vendors[ x ] + 'CancelAnimationFrame' ] || window[ vendors[ x ] + 'CancelRequestAnimationFrame' ];
    }

    if ( !window.requestAnimationFrame ) {
        window.requestAnimationFrame = function ( callback, element ) {
            var currTime = Date.now(), timeToCall = Math.max( 0, frame_time - ( currTime - lastTime ) );
            var id = window.setTimeout( function() { callback( currTime + timeToCall ); }, timeToCall );
            lastTime = currTime + timeToCall;
            return id;
        };
    }

    if ( !window.cancelAnimationFrame ) {
        window.cancelAnimationFrame = function ( id ) { clearTimeout( id ); };
    }

}() );

var img;
var camera;
var minimap;

var load_assets = function() {

	var files_loaded = 0;
	
	var load_image = function(url) {
		var img = new Image();
		img.onload = isAppLoaded;
		img.src = url;
		return img;
	};
	
	var load_audio = function(url) {
		var audio = new Audio();
		audio.addEventListener('canplaythrough', isAppLoaded, false);
		audio.src = url;
		return audio;
	};
	
	function isAppLoaded() {
		files_loaded++;
		if (files_loaded >= 1) {
			main();
		}
	}
	
	img = load_image("http://1.bp.blogspot.com/-zTYKmcB26qQ/Ts1Tyf4wjeI/AAAAAAAABrg/15p7wQiAsxQ/s1600/universe.jpg");
};

function animate(){
	requestAnimationFrame(animate);
	
	camera.draw(img);
	minimap.draw(img);
}

function main(){
	camera = new BuildCamera([img.width, img.height], [0,0], 5);
	minimap = new BuildMiniMap(camera, [img.width, img.height], 200);
	document.addEventListener('keydown', function(event) {
		if (event.keyCode == 37) { // left
			camera.moveLeft();
		} else if (event.keyCode == 39) { // right
			camera.moveRight();
		} else if (event.keyCode == 38) { // up
			camera.moveUp();
		} else if (event.keyCode == 40) { // down
			camera.moveDown();
		}
	});
	document.addEventListener('click', minimap.click);
	
	var canvas = document.getElementById('gameCanvas');
	canvas.width = 800;
	canvas.height = 600;
	animate();
}

load_assets();

// END