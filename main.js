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
var unit_img;
var camera;
var minimap;
var hexgrid;

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
		if (files_loaded >= 2) {
			main();
		}
	}
	
	img = load_image("http://1.bp.blogspot.com/-zTYKmcB26qQ/Ts1Tyf4wjeI/AAAAAAAABrg/15p7wQiAsxQ/s1600/universe.jpg");
	unit_img = load_image("sprites\\unit_drop_2.png");
};

function animate(){
	requestAnimationFrame(animate);
	
	camera.draw(img);
	hexgrid.draw(camera);
	minimap.draw(img);
}

function main(){
	camera = new BuildCamera([img.width, img.height], new Point(0, 0), 5);
	minimap = new BuildMiniMap(camera, [img.width, img.height], 200);
	hexgrid = new BuildMap(40,2.0,1500,1200,40);
	hexgrid.matrix[0][0].piece = new Unit(0, 0, 0, new Coordinate(0, 0), 0, 0, unit_img);
	
	document.addEventListener('keydown', function(event) {  // key pressing event listener
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
	
	var last_click_coord = null;
	document.addEventListener('click', function(event) {  // left click event listener
		if (minimap.checkClick(event)) {
			minimap.click(event); // pass to minimap
		} else {
			var canvas = document.getElementById("gameCanvas");
			var canvasX = event.pageX - canvas.offsetLeft;
			var canvasY = event.pageY - canvas.offsetTop;
			var coord = hexgrid.toHex(new Point(canvasX, canvasY), camera);
			if (coord) {
				var isReachable = hexgrid.isReachable(coord);
				if (last_click_coord && isReachable) { // move a unit to a reachable coord
					hexgrid.move(last_click_coord, coord);
					last_click_coord = null;
				} else if (!last_click_coord && hexgrid.checkSquare(coord)) { // select a unit
					last_click_coord = coord;
					hexgrid.markReachable(coord);
				}
			}
		}
	});
	document.addEventListener('contextmenu', function(event) { // right click event listener
		var canvas = document.getElementById("gameCanvas");
		var canvasX = event.pageX - canvas.offsetLeft;
		var canvasY = event.pageY - canvas.offsetTop;
		if (canvasX <= canvas.width && canvasY <= canvas.height) {
			event.preventDefault();
			last_click_coord = null;
			hexgrid.clearReachable();
		}
	});
	
	var canvas = document.getElementById('gameCanvas');
	canvas.width = 800;
	canvas.height = 600;
	animate();
}

load_assets();
