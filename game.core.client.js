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

/* Setup stage and layers. */
var stage = new Kinetic.Stage({
	container: 'container',
	id: 'gameCanvas',
	width: 800,
	height: 600
});
var mapLayer = new Kinetic.Layer(); // layer for background image, hexgrid, and units
var UILayer = new Kinetic.Layer(); // layer for UI elements, such as minimap, buttons, and unit info
var msgLayer = new Kinetic.Layer({listening: false}); // layer for messages, such as start and end message

/* The game_core_client class. */

	var game_core_client = function() {
	
		// Container for all unit images
		// 0:red, 1:yellow, 2:blue, 3:green
		this.sprites = [[], [], [], []];
		// Container for all unit cooldown images
		this.cooldown = [[], [], [], []];
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
		this.winner = false;
		this.countdown = 60;
		this.capping = 0;
		this.countdownTimer = null;
		this.resource = 0;
		
		
	}

// load assets
	game_core_client.prototype.load_assets = function(/*string*/ scenario,/*int*/type ) {

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
			if (files_loaded >= 39) {
				gc.initiate(scenario,type);
			}
		}
		
		// load sprites
		this.background = load_image("sprites\\bg1.png");
		this.flagImg = load_image("sprites\\flag.png");
		this.thronImg = load_image("sprites\\thron.png");

		this.sprites[0][0] = load_image("sprites\\hunter3_red.png");
		this.sprites[0][1] = load_image("sprites\\wolf3_red.png");
		this.sprites[0][2] = load_image("sprites\\zombie3_red.png");
		this.sprites[0][3] = load_image("sprites\\wizard3_red.png");
		this.sprites[0][4] = load_image("sprites\\vampire3_red.png");
		this.sprites[0][5] = load_image("sprites\\unknown3_red.png");
		
		this.sprites[1][0] = load_image("sprites\\hunter3_yellow.png");
		this.sprites[1][1] = load_image("sprites\\wolf3_yellow.png");
		this.sprites[1][2] = load_image("sprites\\zombie3_yellow.png");
		this.sprites[1][3] = load_image("sprites\\wizard3_yellow.png");
		this.sprites[1][4] = load_image("sprites\\vampire3_yellow.png");
		this.sprites[1][5] = load_image("sprites\\unknown3_yellow.png");
		
		this.sprites[2][0] = load_image("sprites\\hunter3_blue.png");
		this.sprites[2][1] = load_image("sprites\\wolf3_blue.png");
		this.sprites[2][2] = load_image("sprites\\zombie3_blue.png");
		this.sprites[2][3] = load_image("sprites\\wizard3_blue.png");
		this.sprites[2][4] = load_image("sprites\\vampire3_blue.png");
		this.sprites[2][5] = load_image("sprites\\unknown3_blue.png");
		
		this.sprites[3][0] = load_image("sprites\\hunter3_green.png");
		this.sprites[3][1] = load_image("sprites\\wolf3_green.png");
		this.sprites[3][2] = load_image("sprites\\zombie3_green.png");
		this.sprites[3][3] = load_image("sprites\\wizard3_green.png");
		this.sprites[3][4] = load_image("sprites\\vampire3_green.png");
		this.sprites[3][5] = load_image("sprites\\unknown3_green.png");

		// load cooldown spritesheetss
		
		this.cooldown[0][0] = load_image("sprites\\HUNTER3_RED_CD2.png");
		this.cooldown[0][1] = load_image("sprites\\WOLF3_RED_CD2.png");
		this.cooldown[0][2] = load_image("sprites\\ZOMBIE3_RED_CD2.png");
		this.cooldown[0][3] = load_image("sprites\\WIZARD3_RED_CD2.png");
		this.cooldown[0][4] = load_image("sprites\\VAMPIRE3_RED_CD2.png");
		this.cooldown[0][5] = load_image("sprites\\UNKNOWN3_RED_CD2.png");
		
		this.cooldown[1][0] = load_image("sprites\\HUNTER3_YELLOW_CD2.png");
		this.cooldown[1][1] = load_image("sprites\\WOLF3_YELLOW_CD2.png");
		this.cooldown[1][2] = load_image("sprites\\ZOMBIE3_YELLOW_CD2.png");
		this.cooldown[1][3] = load_image("sprites\\WIZARD3_YELLOW_CD2.png");
		this.cooldown[1][4] = load_image("sprites\\VAMPIRE3_YELLOW_CD2.png");
		this.cooldown[1][5] = load_image("sprites\\UNKNOWN3_YELLOW_CD2.png");
		
		//Add terrain images.
		CONSTANTS.thronTerrain.image = this.thronImg;
		CONSTANTS.flagTerrain.image = this.flagImg;

	};

	game_core_client.prototype.onnetmessage = function(data){

	
		var keywords = data.split(" ");
		var msgType = parseInt(keywords[0]);
		
		switch (msgType) {
		
		case 0:
			switch (keywords[1]) {
			case "init":  // game starts
				this.mapName = keywords[2];
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
				start();
				this.started = true;
				var p = this.hexgrid.matrix[parseInt(keywords[2])][parseInt(keywords[3])].MidPoint;
				this.camera.setPos(new Point(p.X-CONSTANTS.width/2,p.Y-CONSTANTS.height/2))
				playSound('sounds\\forest.mp3');
				break;
			case "end":
					if (this.countdownTimer){
						window.clearInterval(this.countdownTimer);
					}
					this.capping = 0;
					this.winner = parseInt(keywords[2]);
					this.alive = false;
					if (gc.winner == gc.team){
						gameEnded(true);
					} else {
						gameEnded(false);
					}
				break;
			}
			break;
		
		case 1:  // game control messages
			switch (keywords[1]) {
			case "countdown":
					var capteam = parseInt(keywords[2]);
					if(!(keywords[2]==-1)){
						if(this.team == capteam){
							this.capping = 1;
						}else{
							this.capping = -1;
						}
						var self = this;
						this.countdownTimer = window.setInterval(function(){
							self.countdown--;
						}
						,1000);
					}else{
						window.clearInterval(this.countdownTimer);
						this.countdown = 60;
						this.capping = 0;
					}
					break;
			case "add":
				var sprite = this.sprites[parseInt(keywords[2])][parseInt(keywords[4])];
				var cdImage = this.cooldown[parseInt(keywords[2])][parseInt(keywords[4])];
				this.hexgrid.matrix[parseInt(keywords[5])][parseInt(keywords[6])].piece = new Unit(parseInt(keywords[2]),parseInt(keywords[3]),100,parseInt(keywords[4]),new Coordinate(parseInt(keywords[5]),parseInt(keywords[6])),sprite,cdImage);
				this.updateRA();
				// update minimap
				var pointOnMap = this.hexgrid.toMap(new Coordinate(parseInt(keywords[5]), parseInt(keywords[6])));
				this.minimap.addUnit(pointOnMap, parseInt(keywords[2]));
				break;
			case "resource":
				this.resource = parseInt(keywords[2]);
				break;
			case "move":
				this.hexgrid.move(new Coordinate(parseInt(keywords[2]),parseInt(keywords[3])),new Coordinate(parseInt(keywords[4]),parseInt(keywords[5])))
				this.hexgrid.matrix[parseInt(keywords[4])][parseInt(keywords[5])].piece.setcd(CONSTANTS.cd);
				this.updateRA();
				// update minimap
				var oldPointOnMap = this.hexgrid.toMap(new Coordinate(parseInt(keywords[2]), parseInt(keywords[3])));
				var newPointOnMap = this.hexgrid.toMap(new Coordinate(parseInt(keywords[4]), parseInt(keywords[5])));
				this.minimap.moveUnit(oldPointOnMap, newPointOnMap);
				break;
			case "attack":
				this.hexgrid.matrix[parseInt(keywords[2])][parseInt(keywords[3])].piece.minusHP(parseInt(keywords[4]));
				this.hexgrid.matrix[parseInt(keywords[5])][parseInt(keywords[6])].piece.minusHP(parseInt(keywords[7]));
				this.hexgrid.matrix[parseInt(keywords[2])][parseInt(keywords[3])].piece.setcd(CONSTANTS.cd);
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
				this.updateRA();
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
		this.hexgrid.clearReachable();
		this.hexgrid.clearAttackable();
		if(this.last_click_coord){
			if(this.hexgrid.getUnit(this.last_click_coord)){
				this.hexgrid.markReachable(this.last_click_coord);
				this.hexgrid.markAttackable(this.last_click_coord);
			}
		}
	}; 
	

	game_core_client.prototype.initiate = function(/*string*/scenario ,/*int*/ type){  //Server connection functionality..
	    //Store a local reference to our connection to the server
        this.socket = io.connect();
		
		this.socket.send('0 join '+ type + ' '+ scenario);
		
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
		// var canvas = document.getElementById('gameCanvas');
		// canvas.width = 800;
		// canvas.height = 600;
		// animate(this);
		
		//TODO
	};

	game_core_client.prototype.initGame = function(){
	
		// callback function for click events on a hexagon
		var clickCallback = function(coord){
		
			if (!gc.alive) {
				return;
			}
			
			var unitplayer = -1;
			if (gc.hexgrid.getUnit(coord)!=null) {
				unitplayer = gc.hexgrid.getUnit(coord).player;
			}
			
			var isReachable = gc.hexgrid.isReachable(coord);
			var isAttackable = gc.hexgrid.isAttackable(coord);
			
			// some unit has been selected, and some hexagon without this player's unit has been clicked
			if (gc.last_click_coord && (unitplayer != gc.player)) {
				if (isReachable) {  // Move unit
					gc.socket.send('1 move ' + gc.last_click_coord.X +' ' + gc.last_click_coord.Y + ' ' + coord.X +' ' + coord.Y);
				} else if (isAttackable) {  // Attack unit
					gc.socket.send('1 attack ' + gc.last_click_coord.X +' ' + gc.last_click_coord.Y + ' ' + coord.X + ' ' + coord.Y);
				}
				gc.hexgrid.clearReachable();
				gc.hexgrid.clearAttackable();
				gc.last_click_coord = null;
			}
			
			// some hexagon with this player's unit has been clicked, select that unit
			else if (unitplayer == gc.player) {
				gc.hexgrid.clearReachable();
				gc.hexgrid.clearAttackable();
				if (gc.hexgrid.getUnit(coord).cooldown<=0) {
					gc.last_click_coord = coord;
					gc.hexgrid.markReachable(coord);
					gc.hexgrid.markAttackable(coord,coord);
				}
			}
		};
		
		document.addEventListener('contextmenu', function(event) { // right click event listener
			var x = event.pageX;
			var y = event.pageY;
			var offsetLeft = stage.getContainer().offsetLeft;
			var offsetTop = stage.getContainer().offsetTop;
			if (x >= offsetLeft && x <= offsetLeft+CONSTANTS.width && y >= offsetTop && y <= offsetTop+CONSTANTS.height) {
				event.preventDefault();
				gc.last_click_coord = null;
				gc.hexgrid.clearReachable();
				gc.hexgrid.clearAttackable();
			}
		});

		document.addEventListener('keydown', function(event) {  // keydown event listener

			if (event.keyCode == 37 || event.keyCode == 65) { // left
				gc.camera.isMovingLeft = true;
			} else if (event.keyCode == 39 || event.keyCode == 68) { // right
				gc.camera.isMovingRight = true;
			} else if (event.keyCode == 38 || event.keyCode == 87) { // up
				gc.camera.isMovingUp = true;
			} else if (event.keyCode == 40 || event.keyCode == 83) { // down
				gc.camera.isMovingDown = true;
			}
			if (gc.camera.isMovingLeft)
				gc.camera.moveLeft();
			if (gc.camera.isMovingRight)
				gc.camera.moveRight();
			if (gc.camera.isMovingUp)
				gc.camera.moveUp();
			if (gc.camera.isMovingDown)
				gc.camera.moveDown();
		});
		
		document.addEventListener('keyup', function(event) {  // keyup event listener
			if (event.keyCode == 37 || event.keyCode == 65) { // left
				gc.camera.isMovingLeft = false;
			} else if (event.keyCode == 39 || event.keyCode == 68) { // right
				gc.camera.isMovingRight = false;
			} else if (event.keyCode == 38 || event.keyCode == 87) { // up
				gc.camera.isMovingUp = false;
			} else if (event.keyCode == 40 || event.keyCode == 83) { // down
				gc.camera.isMovingDown = false;
			}
		});
		
		// hard-coded game instance for demo!!!
		this.camera = new BuildCamera([this.background.width, this.background.height], 15, this.background, mapLayer);
		this.minimap = new BuildMiniMap(this.camera, [this.background.width, this.background.height], 200, this.background, UILayer, stage);
		this.hexgrid = new BuildMap(this.mapName, this.camera, mapLayer, clickCallback);
		
		// initialize terrain
		var terrain = this.hexgrid.scenario.terrain;
		for (var i = 0; i < terrain.length; i++)
			for (var j = 0; j < terrain[i].length; j++) {
				switch (terrain[i][j]) {
				case "thron":
					this.hexgrid.addTerrain(CONSTANTS.thronTerrain, new Coordinate(i, j));
					break;
				case "flag":
					this.hexgrid.addTerrain(CONSTANTS.flagTerrain, new Coordinate(i, j));
					break;
				}
			}
	};
	
// draw the game
stage.add(mapLayer);
stage.add(UILayer);
stage.add(msgLayer);

// create game client
var gc = new game_core_client();

// animation to show text message at the center of canvas
var centerMsg = new Kinetic.Text({
	text: "Waiting for other players...",
	x: 80,
	y: 260,
	fill: 'rgba(127, 155, 0, 0.5)',
	fontFamily: 'Calibri',
	fontSize: 60,
	fontStyle: 'italic'
});
msgLayer.add(centerMsg);
var centerMsgAnim = new Kinetic.Animation(function(frame) {
	if (gc.started) {
		if (gc.starting){
			centerMsg.setText("Game has started");
			centerMsg.setFill('white');
			centerMsg.setX(CONSTANTS.width/4);
			centerMsg.setY(CONSTANTS.height/2);
			centerMsg.setFontSize(60);
			centerMsg.setFontStyle('normal');
			centerMsg.setFontFamily('Calibri');
			// ctx.font = '30px Calibri';	
			// ctx.fillText("Objective: Kill all enemy units.", canvas.width/4 + 60, canvas.height/2 + 60);
			if (!msgLayer.isAncestorOf(centerMsg)) {
				msgLayer.add(centerMsg);
			}
		} else if (gc.capping){
			if (gc.capping == 1){
				centerMsg.setText("Caputring flag: " + gc.countdown + " seconds until win.");
				centerMsg.setFill('white');
				centerMsg.setX(CONSTANTS.width/4);
				centerMsg.setY(CONSTANTS.height/2);
				centerMsg.setFontSize(30);
				centerMsg.setFontStyle('normal');
				centerMsg.setFontFamily('Calibri');
				if (!msgLayer.isAncestorOf(centerMsg)) {
					msgLayer.add(centerMsg);
				}
			} else {
				centerMsg.setText("Defend flag: " + gc.countdown + " seconds until lose.");
				centerMsg.setFill('white');
				centerMsg.setX(CONSTANTS.width/4);
				centerMsg.setY(CONSTANTS.height/2);
				centerMsg.setFontSize(30);
				centerMsg.setFontStyle('normal');
				centerMsg.setFontFamily('Calibri');
				if (!msgLayer.isAncestorOf(centerMsg)) {
					msgLayer.add(centerMsg);
				}
			}
		} else if (!gc.alive && gc.winner === false){
			centerMsg.setText("All your units are dead!");
			centerMsg.setFill('white');
			centerMsg.setX(CONSTANTS.width/4);
			centerMsg.setY(CONSTANTS.height/2);
			centerMsg.setFontSize(60);
			centerMsg.setFontStyle('normal');
			centerMsg.setFontFamily('Calibri');
			if (!msgLayer.isAncestorOf(centerMsg)) {
				msgLayer.add(centerMsg);
			}
		} else if (!(gc.winner===false)){
			if (gc.winner == gc.team){
				centerMsg.setText("You have won!");
			} else {
				centerMsg.setText("You have lost.");
			}
			centerMsg.setFill('white');
			centerMsg.setX(CONSTANTS.width/4);
			centerMsg.setY(CONSTANTS.height/2);
			centerMsg.setFontSize(60);
			centerMsg.setFontStyle('normal');
			centerMsg.setFontFamily('Calibri');
			if (!msgLayer.isAncestorOf(centerMsg)) {
				msgLayer.add(centerMsg);
			}
		} else {
			if (msgLayer.isAncestorOf(centerMsg)) {
				centerMsg.remove();
			}
		} 
	}
}, msgLayer);
centerMsgAnim.start();

//Helper function for playing sound
function playSound(soundfile) {
 document.getElementById("sound").innerHTML=
 "<embed src=\""+soundfile+"\" hidden=\"true\" autostart=\"true\" loop=\"false\" />";
 }

