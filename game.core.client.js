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
	
		// Container for all unit images and animations
		// 0:blue, 1:yellow, 2:red, 3:green
		this.sprites = [[], [], [], []];
		this.last_click_coord = null;
		this.background = null;
		this.camera = null;
		this.minimap = null;
		this.hexgrid = null;
		this.started = false;
		this.player = 0;
		this.team = null;
		this.type = null;
		this.alive = true;
		this.winner = null;
		
		// load assets
		this.load_assets();
	}

	game_core_client.prototype.load_assets = function() {

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
		
		var isAppLoaded = function() {
			files_loaded++;
			if (files_loaded >= 25) {
				gc.initiate();
			}
		}
		
		this.background = load_image("sprites\\bg_temp.jpg");
		
		this.sprites[0][0] = load_image("sprites\\wood_blue.png");
		this.sprites[0][1] = load_image("sprites\\water_blue.png");
		this.sprites[0][2] = load_image("sprites\\earth_blue.png");
		this.sprites[0][3] = load_image("sprites\\fire_blue.png");
		this.sprites[0][4] = load_image("sprites\\air_blue.png");
		this.sprites[0][5] = load_image("sprites\\unlit_blue.png");
		
		this.sprites[1][0] = load_image("sprites\\wood_yellow.png");
		this.sprites[1][1] = load_image("sprites\\water_yellow.png");
		this.sprites[1][2] = load_image("sprites\\earth_yellow.png");
		this.sprites[1][3] = load_image("sprites\\fire_yellow.png");
		this.sprites[1][4] = load_image("sprites\\air_yellow.png");
		this.sprites[1][5] = load_image("sprites\\unlit_yellow.png");
		
		this.sprites[2][0] = load_image("sprites\\wood_red.png");
		this.sprites[2][1] = load_image("sprites\\water_red.png");
		this.sprites[2][2] = load_image("sprites\\earth_red.png");
		this.sprites[2][3] = load_image("sprites\\fire_red.png");
		this.sprites[2][4] = load_image("sprites\\air_red.png");
		this.sprites[2][5] = load_image("sprites\\unlit_red.png");
		
		this.sprites[3][0] = load_image("sprites\\wood_green.png");
		this.sprites[3][1] = load_image("sprites\\water_green.png");
		this.sprites[3][2] = load_image("sprites\\earth_green.png");
		this.sprites[3][3] = load_image("sprites\\fire_green.png");
		this.sprites[3][4] = load_image("sprites\\air_green.png");
		this.sprites[3][5] = load_image("sprites\\unlit_green.png");

	};

	game_core_client.prototype.onnetmessage = function(data){
			var keywords = data.split(" ");
			var msgType = parseInt(keywords[0]);
			
			switch (msgType) {
			
			case 0:
				switch (keywords[1]) {
				case "init":  // game starts
					this.player = parseInt(keywords[3]);
					this.team = parseInt(keywords[4]);
					this.type = parseInt(keywords[5]);
					this.initGame();
					break;
				case "start":
					this.starting = true;
					var self = this;
					window.setTimeout(function(){
							self.starting = false;
						}
						,2000);

					this.started = true;
					var p = this.hexgrid.matrix[parseInt(keywords[2])][parseInt(keywords[3])].MidPoint;
					this.camera.setPos(new Point(p.X-this.camera.canvas.width/2,p.Y-this.camera.canvas.height/2))
					break;
				case "end":
					this.winner = parseInt(keywords[2]);
					break;
				}
				break;
			
			case 1:  // game control messages
				switch (keywords[1]) {
				case "add":
					var sprite = this.sprites[parseInt(keywords[2])][parseInt(keywords[4])];
					this.hexgrid.matrix[parseInt(keywords[5])][parseInt(keywords[6])].piece = new Unit(parseInt(keywords[2]),parseInt(keywords[3]),100,parseInt(keywords[4]),new Coordinate(parseInt(keywords[5]),parseInt(keywords[6])),0,sprite);
					this.updateRA();
					// update minimap
					var pointOnMap = this.hexgrid.toMap(new Coordinate(parseInt(keywords[5]), parseInt(keywords[6])));
					this.minimap.addUnit(pointOnMap, parseInt(keywords[2]));
					break;
				case "move":
					this.hexgrid.move(new Coordinate(parseInt(keywords[2]),parseInt(keywords[3])),new Coordinate(parseInt(keywords[4]),parseInt(keywords[5])))
					this.hexgrid.matrix[parseInt(keywords[4])][parseInt(keywords[5])].piece.setcd(0);
					this.updateRA();
					// update minimap
					var oldPointOnMap = this.hexgrid.toMap(new Coordinate(parseInt(keywords[2]), parseInt(keywords[3])));
					var newPointOnMap = this.hexgrid.toMap(new Coordinate(parseInt(keywords[4]), parseInt(keywords[5])));
					this.minimap.moveUnit(oldPointOnMap, newPointOnMap);
					break;
				case "attack":
					this.hexgrid.matrix[parseInt(keywords[2])][parseInt(keywords[3])].piece.minusHP(parseInt(keywords[4]));
					this.hexgrid.matrix[parseInt(keywords[5])][parseInt(keywords[6])].piece.minusHP(parseInt(keywords[7]));
					this.hexgrid.matrix[parseInt(keywords[2])][parseInt(keywords[3])].piece.setcd(0);
					this.updateRA();
					break;
				case "die":
					this.hexgrid.matrix[parseInt(keywords[2])][parseInt(keywords[3])].piece.type = parseInt(keywords[4]);
					// this.hexgrid.matrix[parseInt(keywords[2])][parseInt(keywords[3])].piece.die();
					if (this.last_click_coord && this.last_click_coord.X == parseInt(keywords[2]) && this.last_click_coord.Y == parseInt(keywords[3]))
						this.last_click_coord = null;
					this.hexgrid.matrix[parseInt(keywords[2])][parseInt(keywords[3])].piece = null;
					// update minimap
					var pointOnMap = this.hexgrid.toMap(new Coordinate(parseInt(keywords[2]), parseInt(keywords[3])));
					this.minimap.removeUnit(pointOnMap);
					this.alive = false;
					for(var x in this.hexgrid.matrix){
						for(var y in this.hexgrid.matrix[x]){
							if(this.hexgrid.matrix[x][y].piece && this.hexgrid.matrix[x][y].piece.team == this.team){
								this.alive = true;
							}
						}
					}	
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
	
	game_core_client.prototype.updateRA = function(){
		if(this.last_click_coord){
			this.hexgrid.clearReachable();
			this.hexgrid.clearAttackable();
			this.hexgrid.markReachable(this.last_click_coord);
			this.hexgrid.markAttackable(this.last_click_coord);
		}
	} 
	
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

	game_core_client.prototype.initGame = function(){
		// hard-coded game instance for demo!!!
		this.camera = new BuildCamera([this.background.width, this.background.height], new Point(0, 0), 15);
		this.minimap = new BuildMiniMap(this.camera, [this.background.width, this.background.height], 200);
		this.hexgrid = new BuildMap(40,2.0,1500,1200,40);
		
		document.addEventListener('keydown', function(event) {  // key pressing event listener
			if (event.keyCode == 37 || event.keyCode == 65) { // left
				gc.camera.moveLeft();
			} else if (event.keyCode == 39 || event.keyCode == 68) { // right
				gc.camera.moveRight();
			} else if (event.keyCode == 38 || event.keyCode == 87) { // up
				gc.camera.moveUp();
			} else if (event.keyCode == 40 || event.keyCode == 83) { // down
				gc.camera.moveDown();
			}
		});
			
		
		document.addEventListener('click', function(event) {  // left click event listener
			if (gc.minimap.checkClick(event)) {
				gc.minimap.click(event); // pass to minimap
			} else {
				if(!gc.alive){
					return;
				}
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
					//After unit has moved
					if (gc.last_click_coord && isReachable) {
						gc.socket.send('1 move ' + gc.last_click_coord.X +' ' + gc.last_click_coord.Y + ' ' + coord.X +' ' + coord.Y);
						gc.hexgrid.clearReachable();
						gc.hexgrid.clearAttackable();
						gc.last_click_coord = null;
					}
					//After unit has attacked
					else if (gc.last_click_coord && isAttackable){
						gc.socket.send('1 attack ' + gc.last_click_coord.X +' ' + gc.last_click_coord.Y + ' ' + coord.X + ' ' + coord.Y);
						gc.hexgrid.clearReachable();
						gc.hexgrid.clearAttackable();
						gc.last_click_coord = null;
					//Before unit has been selected
					} else if (!gc.last_click_coord && (unitplayer == gc.player)) { // select a unit
						if (gc.hexgrid.getUnit(coord)) { // this coordinate has a unit
							if(gc.hexgrid.getUnit(coord).cooldown<=0){
								gc.last_click_coord = coord;
								gc.hexgrid.markReachable(coord);
								gc.hexgrid.markAttackable(coord,coord);
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
				gc.last_click_coord = null;
				gc.hexgrid.clearReachable();
				gc.hexgrid.clearAttackable();
			}
		});
	};

	// animate function
	var animate = function(){
		requestAnimationFrame(animate);
		var canvas = document.getElementById('gameCanvas');
		var ctx = document.getElementById('gameCanvas').getContext('2d');
		if (gc.started) {
			gc.camera.draw(gc.background);
			gc.hexgrid.draw(gc.camera);
			gc.minimap.draw(gc.background);
			if (gc.starting){
				ctx.font = '60px Calibri';
				ctx.fillStyle = 'white';
				ctx.fillText("Game has started",  canvas.width/4,canvas.height/2);
				ctx.font = '30px Calibri';	
				ctx.fillText("Objective: Kill all enemy units.", canvas.width/4 + 60, canvas.height/2 + 60);			
			}
			if (!gc.alive && !gc.winner){
				ctx.font = '60px Calibri';
				ctx.fillStyle = 'white';
				ctx.fillText("All your units are dead!",  canvas.width/4,canvas.height/2);
			}
			if (gc.winner){
				ctx.font = '60px Calibri';
				ctx.fillStyle = 'white';
				if (gc.winner == gc.team){
					ctx.fillText("You have won!",  canvas.width/4,canvas.height/2);
				}
				else{
					ctx.fillText("You have lost.",  canvas.width/4,canvas.height/2);
				}
			}
		} else {
			ctx.font = 'italic 60px Calibri';
			ctx.fillStyle = 'rgba(127, 155, 0, 0.5)';;
			ctx.fillText("Waiting for other players...", 80, 260);		
		}
	};
	
// create game client
var gc = new game_core_client();
