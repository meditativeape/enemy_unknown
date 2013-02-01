/* Client-side code. */

/* Polyfill for requestAnimationFrame. */

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

/* The game_core_client class. */

	var game_core_client = function() {
	
		// TODO: Container for all unit images and animations
		this.sprites = [];

		this.background = null;
		this.camera = null;
		this.minimap = null;
		this.hexgrid = null;
		this.started = false;
		this.player = 0;
		
		// load assets
		this.load_assets();
	}

	game_core_client.prototype.load_assets = function() {

		var files_loaded = 0;
		var gc = this;
		
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
		
		var isAppLoaded = function() {
			files_loaded++;
			if (files_loaded >= 4) {
				gc.initiate();
			}
		}
		
		this.background = load_image("sprites\\bg_temp.jpg");
		this.sprites[5] = load_image("sprites\\unit_drop_2.png");
		this.sprites[3] = load_image("sprites\\fire_breath.gif");
		this.sprites[1] = load_image("sprites\\water_breath.gif");
	};

	game_core_client.prototype.onnetmessage = function(data){
			var keywords = data.split(" ");
			var msgType = parseInt(keywords[0]);
			
			switch (msgType) {
			
			case 0:
				switch (keywords[1]) {
				case "start":  // game starts
					this.player = parseInt(keywords[3]);
					this.startGame();
					break;
				}
				break;
			
			case 1:  // game control messages
				switch (keywords[1]) {
				case "move":
					this.hexgrid.move(new Coordinate(parseInt(keywords[2]),parseInt(keywords[3])),new Coordinate(parseInt(keywords[4]),parseInt(keywords[5])))
					break;
				case "attack":
					this.hexgrid.matrix[parseInt(keywords[2])][parseInt(keywords[3])].piece.hp = parseInt(keywords[4]);
					this.hexgrid.matrix[parseInt(keywords[5])][parseInt(keywords[6])].piece.hp = parseInt(keywords[7]);
					this.hexgrid.matrix[parseInt(keywords[2])][parseInt(keywords[3])].piece.setcd(5);
					break;
				case "die":
					this.hexgrid.matrix[parseInt(keywords[2])][parseInt(keywords[3])].piece.type = parseInt(keywords[4]);
					// this.hexgrid.matrix[parseInt(keywords[2])][parseInt(keywords[3])].piece.die();
					this.hexgrid.matrix[parseInt(keywords[2])][parseInt(keywords[3])].piece = null;
					break;
				}
				break;
			}
	};

	game_core_client.prototype.connecting = function(data){
	};

	game_core_client.prototype.ondisconnect = function(data){
	};

	game_core_client.prototype.onconnected = function(data){
	};

	game_core_client.prototype.initiate = function(){
	
	//Sever connection functionallity..
	
	//No idea what this does? //Frank
	            //Store a local reference to our connection to the server
        this.socket = io.connect();

            //When we connect, we are not 'connected' until we have a server id
            //and are placed in a game by the server. The server sends us a message for that.
        this.socket.on('connect', this.connecting.bind(this));

            //Sent when we are disconnected (network, server down, etc)
        this.socket.on('disconnect', this.ondisconnect.bind(this));
            //Handle when we connect to the server, showing state and storing id's.
        this.socket.on('onconnected', this.onconnected.bind(this));
            //On message from the server, we parse the commands and send it to the handlers
        this.socket.on('message', this.onnetmessage.bind(this));
		// Start animation
		var canvas = document.getElementById('gameCanvas');
		canvas.width = 800;
		canvas.height = 600;
		animate(this);
		
		//TODO
	};

	game_core_client.prototype.startGame = function(){
		// hard-coded game instance for demo!!!
		this.camera = new BuildCamera([this.background.width, this.background.height], new Point(0, 0), 5);
		this.minimap = new BuildMiniMap(this.camera, [this.background.width, this.background.height], 200);
		this.hexgrid = new BuildMap(40,2.0,1500,1200,40);
		if (this.player == 0) {
			this.hexgrid.matrix[0][0].piece = new Unit(0, 0, 1, 0, new Coordinate(0, 0), 0, this.sprites[3]);
			this.hexgrid.matrix[0][2].piece = new Unit(0, 0, 1, 0, new Coordinate(0, 2), 0, this.sprites[3]);
			this.hexgrid.matrix[2][0].piece = new Unit(1, 1, 1, 0, new Coordinate(2, 0), 0, this.sprites[5]);
			this.hexgrid.matrix[2][2].piece = new Unit(1, 1, 1, 0, new Coordinate(2, 2), 0, this.sprites[5]);
		} else {
			this.hexgrid.matrix[0][0].piece = new Unit(0, 0, 1, 0, new Coordinate(0, 0), 0, this.sprites[5]);
			this.hexgrid.matrix[0][2].piece = new Unit(0, 0, 1, 0, new Coordinate(0, 2), 0, this.sprites[5]);
			this.hexgrid.matrix[2][0].piece = new Unit(1, 1, 1, 0, new Coordinate(2, 0), 0, this.sprites[1]);
			this.hexgrid.matrix[2][2].piece = new Unit(1, 1, 1, 0, new Coordinate(2, 2), 0, this.sprites[1]);
		}
		this.started = true;
		
		document.addEventListener('keydown', function(event) {  // key pressing event listener
			if (event.keyCode == 37) { // left
				gc.camera.moveLeft();
			} else if (event.keyCode == 39) { // right
				gc.camera.moveRight();
			} else if (event.keyCode == 38) { // up
				gc.camera.moveUp();
			} else if (event.keyCode == 40) { // down
				gc.camera.moveDown();
			}
		});
			
		var last_click_coord = null;
		document.addEventListener('click', function(event) {  // left click event listener
			if (gc.minimap.checkClick(event)) {
				gc.minimap.click(event); // pass to minimap
			} else {
				var canvas = document.getElementById("gameCanvas");
				var canvasX = event.pageX - canvas.offsetLeft;
				var canvasY = event.pageY - canvas.offsetTop;
				var coord = gc.hexgrid.toHex(new Point(canvasX, canvasY), gc.camera);
				if (coord) {
					var unitplayer = -1;
					if(gc.hexgrid.getUnit(coord)!=null){
						unitplayer = gc.hexgrid.getUnit(coord).player;
					}
					
					var isReachable = gc.hexgrid.isReachable(coord);
					var isAttackable = gc.hexgrid.isAttackable(coord);
					if (last_click_coord && isReachable) { // move a unit to a reachable coord
						gc.socket.send('1 move ' + last_click_coord.X +' ' + last_click_coord.Y + ' ' + coord.X + ' ' + coord.Y);
						last_click_coord = null;
						gc.hexgrid.clearReachable();
					}
					else if (last_click_coord && isAttackable){
						gc.socket.send('1 attack ' + last_click_coord.X +' ' + last_click_coord.Y + ' ' + coord.X + ' ' + coord.Y);
						last_click_coord = null;
						gc.hexgrid.clearReachable();
					} else if (!last_click_coord && (unitplayer == gc.player)) { // select a unit
						if (gc.hexgrid.getUnit(coord)) { // this coordinate has a unit
							if(gc.hexgrid.getUnit(coord).cooldown<=0){
								last_click_coord = coord;
								gc.hexgrid.markReachable(coord);
							}
						}

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
				gc.hexgrid.clearReachable();
			}
		});
	};

	// animate function
	var animate = function(){
		requestAnimationFrame(animate);
		
		if (gc.started) {
			gc.camera.draw(gc.background);
			gc.hexgrid.draw(gc.camera);
			gc.minimap.draw(gc.background);
		} else {
			var ctx = document.getElementById('gameCanvas').getContext('2d');
			ctx.font = 'italic 60px Calibri';
			ctx.fillStyle = 'rgba(127, 155, 0, 0.5)';;
			ctx.fillText("Waiting for other players...", 80, 260);		
		}
	};
	
// create game client
var gc = new game_core_client();
