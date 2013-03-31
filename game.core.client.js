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
		// 0:red, 1:blue, 2:yellow, 3:green
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
        this.showNum = 1;
		this.build = false;
		this.toBuild = null;
		
		var me = this;
		var mousemove = function(event) {  // mouse move event listener
			var x = event.pageX;
			var y = event.pageY;
			var offsetLeft = stage.getContainer().offsetLeft;
			var offsetTop = stage.getContainer().offsetTop;
			if (x < offsetLeft) {
				me.camera.isMovingLeft = true;
			} else {
				me.camera.isMovingLeft = false;
			}
			if (x > offsetLeft+CONSTANTS.width) {
				me.camera.isMovingRight = true;
			} else {
				me.camera.isMovingRight = false;
			}
			if (y < offsetTop) {
				me.camera.isMovingUp = true;
			} else {
				me.camera.isMovingUp = false;
			}
			if (y > offsetTop+CONSTANTS.height) {
				me.camera.isMovingDown = true;
			} else {
				me.camera.isMovingDown = false;
			}
		};
		document.addEventListener("mousemove", mousemove);
		
		var contextmenu = function(event) { // right click event listener
			var x = event.pageX;
			var y = event.pageY;
			var offsetLeft = stage.getContainer().offsetLeft;
			var offsetTop = stage.getContainer().offsetTop;
			if (x >= offsetLeft && x <= offsetLeft+CONSTANTS.width && y >= offsetTop && y <= offsetTop+CONSTANTS.height) {
				event.preventDefault();
				me.last_click_coord = null;
				me.hexgrid.clientClearReachable();
				me.hexgrid.clientClearAttackable();
				if(me.guess){
					me.hexgrid.matrix[me.guess.X][me.guess.Y].guessing = false;
					me.guess = null;
				}
				gc.build = false;
				gc.toBuild = null;
				gc.hexgrid.clientClearBuildable();
			}
		};
		document.addEventListener('contextmenu', contextmenu);
        this.contextmenu = contextmenu;

		var keydown = function(event) { // keydown event listener
			if (event.keyCode == 37 || event.keyCode == 65) { // left
				me.camera.isMovingLeft = true;
			} else if (event.keyCode == 39 || event.keyCode == 68) { // right
				me.camera.isMovingRight = true;
			} else if (event.keyCode == 38 || event.keyCode == 87) { // up
				me.camera.isMovingUp = true;
			} else if (event.keyCode == 40 || event.keyCode == 83) { // down
				me.camera.isMovingDown = true;
			}
			if (event.keyCode == 49){
				if(me.guess){
					me.hexgrid.getUnit(me.guess).guess(0);
					me.hexgrid.matrix[me.guess.X][me.guess.Y].guessing = false;
					me.guess = null;
				}
				if(me.build){
					if(me.resource >= 50){
						me.toBuild = 0;
						me.hexgrid.clientMarkBuildable(me.player);
					}
					me.build = false;
				}
			}
			if (event.keyCode == 50){
				if(me.guess){
					me.hexgrid.getUnit(me.guess).guess(1);
					me.hexgrid.matrix[me.guess.X][me.guess.Y].guessing = false;
					me.guess = null;
				}
				if(me.build){
					if(me.resource >= 50){
						me.toBuild = 1;
						me.hexgrid.clientMarkBuildable(me.player);
					}
					me.build = false;
				}
			}
			if (event.keyCode == 51){
				if(me.guess){
					me.hexgrid.getUnit(me.guess).guess(2);
					me.hexgrid.matrix[me.guess.X][me.guess.Y].guessing = false;
					me.guess = null;
				}
				if(me.build){
					if(me.resource >= 50){
						me.toBuild = 2;
						me.hexgrid.clientMarkBuildable(me.player);
					}
					me.build = false;
				}
			}
			if (event.keyCode == 52){
				if(me.guess){
					me.hexgrid.getUnit(me.guess).guess(3);
					me.hexgrid.matrix[me.guess.X][me.guess.Y].guessing = false;
					me.guess = null;
				}
				if(me.build){
					if(me.resource >= 50){
						me.toBuild = 3;
						me.hexgrid.clientMarkBuildable(me.player);
					}
					me.build = false;
				}
			}
			if (event.keyCode == 53){
				if(me.guess){
					me.hexgrid.getUnit(me.guess).guess(4);
					me.hexgrid.matrix[me.guess.X][me.guess.Y].guessing = false;
					me.guess = null;
				}
				if(me.build){
					if(me.resource >= 50){
						me.toBuild = 4;
						me.hexgrid.clientMarkBuildable(me.player);
					}
					me.build = false;
				}
			}
			if (event.keyCode == 54){
				if(me.guess){
					me.hexgrid.getUnit(me.guess).guess(5);
					me.hexgrid.matrix[me.guess.X][me.guess.Y].guessing = false;
					me.guess = null;
				}
				gc.build = false;
				gc.toBuild = null;
				gc.hexgrid.clientClearBuildable();
			}	
			if (event.keyCode == 81){
				me.build = true;
				me.toBuild = null;
				gc.hexgrid.clientClearReachable();
				gc.hexgrid.clientClearAttackable();
				gc.hexgrid.clientClearBuildable();
			}
		};
		document.addEventListener('keydown', keydown);
		
		var keyup = function(event) { // keyup event listener
			if (event.keyCode == 37 || event.keyCode == 65) { // left
				me.camera.isMovingLeft = false;
			} else if (event.keyCode == 39 || event.keyCode == 68) { // right
				me.camera.isMovingRight = false;
			} else if (event.keyCode == 38 || event.keyCode == 87) { // up
				me.camera.isMovingUp = false;
			} else if (event.keyCode == 40 || event.keyCode == 83) { // down
				me.camera.isMovingDown = false;
			}
		};
		document.addEventListener('keyup', keyup);
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
		
		var isAppLoaded = function() {
			files_loaded++;
			if (files_loaded >= 31) {
				gc.initiate(scenario,type);
			}
		}
		
		// load sprites
		this.background = load_image("sprites\\bg_grey.jpg");
        this.heartImg = load_image("sprites\\heart.png");
		this.resourceImg = load_image("sprites\\resource.png");
		this.flagImg = load_image("sprites\\tile-flag.png");
		this.thronImg = load_image("sprites\\thron.png");
		this.whokillswhoImg = load_image("sprites\\whokillswho2.png");
        this.ibuttonImg = load_image("sprites\\ibutton.png");

		this.sprites[0][0] = load_image("sprites\\vampire6_red.png");
		this.sprites[0][1] = load_image("sprites\\wolf6_red.png");
		this.sprites[0][2] = load_image("sprites\\hunter6_red.png");
		this.sprites[0][3] = load_image("sprites\\zombie6_red.png");
		this.sprites[0][4] = load_image("sprites\\wizard6_red.png");
		this.sprites[0][5] = load_image("sprites\\unknown6_red.png");
		
		this.sprites[1][0] = load_image("sprites\\vampire6_blue.png");
		this.sprites[1][1] = load_image("sprites\\wolf6_blue.png");
		this.sprites[1][2] = load_image("sprites\\hunter6_blue.png");
		this.sprites[1][3] = load_image("sprites\\zombie6_blue.png");
		this.sprites[1][4] = load_image("sprites\\wizard6_blue.png");
		this.sprites[1][5] = load_image("sprites\\unknown6_blue.png");
		
		// this.sprites[2][0] = load_image("sprites\\vampire6_yellow.png");
		// this.sprites[2][1] = load_image("sprites\\wolf6_yellow.png");
		// this.sprites[2][2] = load_image("sprites\\hunter6_yellow.png");
		// this.sprites[2][3] = load_image("sprites\\zombie6_yellow.png");
		// this.sprites[2][4] = load_image("sprites\\wizard6_yellow.png");
		// this.sprites[2][5] = load_image("sprites\\unknown6_yellow.png");
		
		// this.sprites[3][0] = load_image("sprites\\vampire6_green.png");
		// this.sprites[3][1] = load_image("sprites\\wolf6_green.png");
		// this.sprites[3][2] = load_image("sprites\\hunter6_green.png");
		// this.sprites[3][3] = load_image("sprites\\zombie6_green.png");
		// this.sprites[3][4] = load_image("sprites\\wizard6_green.png");
		// this.sprites[3][5] = load_image("sprites\\unknown6_green.png");

		// load cooldown spritesheets
		this.cooldown[0][0] = load_image("sprites\\vampire9_red_cd.png");
		this.cooldown[0][1] = load_image("sprites\\wolf9_red_cd.png");
		this.cooldown[0][2] = load_image("sprites\\hunter9_red_cd.png");
		this.cooldown[0][3] = load_image("sprites\\zombie9_red_cd.png");
		this.cooldown[0][4] = load_image("sprites\\wizard9_red_cd.png");
		this.cooldown[0][5] = load_image("sprites\\unknown9_red_cd.png");
		
		this.cooldown[1][0] = load_image("sprites\\vampire9_blue_cd.png");
		this.cooldown[1][1] = load_image("sprites\\wolf9_blue_cd.png");
		this.cooldown[1][2] = load_image("sprites\\hunter9_blue_cd.png");
		this.cooldown[1][3] = load_image("sprites\\zombie9_blue_cd.png");
		this.cooldown[1][4] = load_image("sprites\\wizard9_blue_cd.png");
		this.cooldown[1][5] = load_image("sprites\\unknown9_blue_cd.png");

		// add terrain images
		CONSTANTS.thronTerrain.image = this.thronImg;
		CONSTANTS.flagTerrain.image = this.flagImg;
		CONSTANTS.resourceTerrain.image = this.resourceImg;
        CONSTANTS.heart = this.heartImg;
        
		var backgroundsound = soundManager.createSound({
			  id: 'background',
			  url: '/sounds/forest.mp3'
		});
		//backgroundsound.play();
		
		this.gothitsound = soundManager.createSound({
			  id: 'gothitsound',
			  url: '/sounds/gothit.mp3'
		});
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
				this.alive = true;
				this.started = false;
				this.winner = false;
				this.initGame();
				break;
			case "start":
				// starting msg
				this.starting = true;
				var self = this;
				window.setTimeout(function(){
						self.starting = false;
					}
					,2000);
				start();
				this.started = true;
				// TODO: set camera position!
				var p = this.hexgrid.matrix[parseInt(keywords[2])][parseInt(keywords[3])].MidPoint;
				this.camera.setPos(new Point(p.X-CONSTANTS.width/2,p.Y-CONSTANTS.height/2))
				//playSound('sounds\\forest.mp3');
				break;
			case "end":
				if (this.countdownTimer){
					window.clearInterval(this.countdownTimer);
				}
				this.capping = 0;
				this.countdown = 60;
				this.winner = parseInt(keywords[2]);
				this.alive = false;
				this.last_click_coord = null;
				this.started = false;
				this.countdownTimer = null;
				this.resource = 0;
				// stop animations
				this.camera.stop();
				this.minimap.stop();
				this.hexgrid.stop();
				this.UILayerAnim.stop();
                this.msgLayerAnim.stop();
				// clear all layers
				mapLayer.destroy();
				mapLayer = new Kinetic.Layer();
				UILayer.destroy();
				UILayer = new Kinetic.Layer();
				msgLayer.destroy();
				msgLayer = new Kinetic.Layer({listening: false});
				// switch back to menu
				if (this.winner == this.team){
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
				var cd = this.cooldown[parseInt(keywords[2])][parseInt(keywords[4])];
				this.hexgrid.matrix[parseInt(keywords[5])][parseInt(keywords[6])].piece = new Unit(parseInt(keywords[2]), parseInt(keywords[3]),
                        4, parseInt(keywords[4]), new Coordinate(parseInt(keywords[5]),parseInt(keywords[6])), sprite, cd, this.showNum);
				this.hexgrid.matrix[parseInt(keywords[5])][parseInt(keywords[6])].piece.setcd(parseInt(keywords[7]));
				this.hexgrid.clientClearViewable();
				this.hexgrid.clientMarkViewable(this.team);
				this.hexgrid.clientRemoveUnseeable();
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
				this.hexgrid.matrix[parseInt(keywords[4])][parseInt(keywords[5])].piece.setcd(parseInt(keywords[6]));
				
				this.hexgrid.clientClearViewable();
				this.hexgrid.clientMarkViewable(this.team);
				this.hexgrid.clientRemoveUnseeable();
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
				if (this.last_click_coord && this.last_click_coord.X == parseInt(keywords[2]) && this.last_click_coord.Y == parseInt(keywords[3])){
					this.last_click_coord = null;
				}
				if (this.guess && this.guess.X == parseInt(keywords[2]) && this.guess == parseInt(keywords[3])){
					this.hexgrid.matrix[gc.guess.X][gc.guess.Y].guessing = false;
					this.guess = null;
				}
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
				
				this.hexgrid.clientClearViewable();
				this.hexgrid.clientMarkViewable(this.team);
				this.hexgrid.clientRemoveUnseeable();
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
		this.hexgrid.clientClearReachable();
		this.hexgrid.clientClearAttackable();
		if(this.last_click_coord){
			if(this.hexgrid.getUnit(this.last_click_coord)){
				this.hexgrid.clientMarkReachable(this.last_click_coord);
				this.hexgrid.clientMarkAttackable(this.last_click_coord);
			}
		}
	}; 
	
	game_core_client.prototype.initiate = function(/*string*/scenario ,/*int*/ type){  //Server connection functionality..

		if (!this.socket) {
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
		}
	    
		this.socket.send('0 join '+ type + ' '+ scenario);
	};

	game_core_client.prototype.initGame = function(){
	
		// animation to show text message at the center of canvas
		var me = this;
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
		this.msgLayerAnim = new Kinetic.Animation(function(frame) {
			if (me.started) {
				if (me.starting){
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
				} else if (me.capping){  // TODO: hardcoded!
					if (me.capping == 1){
						centerMsg.setText("Caputring flag: " + me.countdown + " seconds until win.");
						centerMsg.setFill('white');
						centerMsg.setX(200);
						centerMsg.setY(50);
						centerMsg.setFontSize(28);
						centerMsg.setFontStyle('normal');
						centerMsg.setFontFamily('Calibri');
						if (!msgLayer.isAncestorOf(centerMsg)) {
							msgLayer.add(centerMsg);
						}
					} else {
						centerMsg.setText("Defend flag: " + me.countdown + " seconds until lose.");
						centerMsg.setFill('white');
						if (me.countdown <= 10)
							centerMsg.setFill('red');
						centerMsg.setX(210);
						centerMsg.setY(50);
						centerMsg.setFontSize(28);
						centerMsg.setFontStyle('normal');
						centerMsg.setFontFamily('Calibri');
						if (!msgLayer.isAncestorOf(centerMsg)) {
							msgLayer.add(centerMsg);
						}
					}
				} else if (!me.alive && me.winner === false){
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
				} else {
					if (msgLayer.isAncestorOf(centerMsg)) {
						centerMsg.remove();
					}
				}
			}
		}, msgLayer);
		this.msgLayerAnim.start();
        
        // who kills whom image
		UILayer.add(new Kinetic.Image({
			x: CONSTANTS.width - this.whokillswhoImg.width,
			y: 0,
			image: this.whokillswhoImg,
			listening: false
		}));
		
        // resource
        UILayer.add(new Kinetic.Image({
            image: this.resourceImg,
            x: 215,
            y: 10,
            scale: {x:0.5, y:0.5},
            listening: false
        }));
        var resourceText = new Kinetic.Text({
            fontFamily: "Impact",
            fontSize: 18,
            fill: "white",
            text: this.resource,
            x: 255,
            y: 15,
            listening: false
        });
        UILayer.add(resourceText);
        this.UILayerAnim = new Kinetic.Animation(function(frame) {
            resourceText.setText(me.resource);
        }, UILayer);
        this.UILayerAnim.start();
	
		// callback function for click events on a hexagon
		var clickCallback = function(coord, event){
		
			if (!gc.alive) {
				return;
			}
            
            if (event.which == 3) {  // trigger right click event
                gc.contextmenu(event);
            }
			
			var unitplayer = -1;
			if (gc.hexgrid.getUnit(coord)==null) {
				if(!(gc.toBuild===null)){
					gc.socket.send('1 build ' + gc.toBuild + ' ' + coord.X +' ' + coord.Y);
				}
				gc.build = false;
				gc.toBuild = null;
				gc.hexgrid.clientClearBuildable();
			}else{
				unitplayer = gc.hexgrid.getUnit(coord).player;
			}
			
			var isReachable = gc.hexgrid.isReachable(coord);
			var isAttackable = gc.hexgrid.isAttackable(coord);
			if(gc.guess){
				gc.hexgrid.matrix[gc.guess.X][gc.guess.Y].guessing = false;
			}
			gc.guess = null;
			// some unit has been selected, and some hexagon without this player's unit has been clicked
			if (gc.last_click_coord && (unitplayer != gc.player)) {
				if (isReachable) {  // Move unit
					gc.socket.send('1 move ' + gc.last_click_coord.X +' ' + gc.last_click_coord.Y + ' ' + coord.X +' ' + coord.Y);
				} else if (isAttackable) {  // Attack unit
					gc.socket.send('1 attack ' + gc.last_click_coord.X +' ' + gc.last_click_coord.Y + ' ' + coord.X + ' ' + coord.Y);
				}
				gc.hexgrid.clientClearReachable();
				gc.hexgrid.clientClearAttackable();
				gc.hexgrid.clientClearBuildable();
				gc.last_click_coord = null;
				gc.build = false;
				gc.toBuild = null;
			}
	
			// some hexagon with this player's unit has been clicked, select that unit
			else if (unitplayer == gc.player) {
				gc.hexgrid.clientClearReachable();
				gc.hexgrid.clientClearAttackable();
				if (gc.hexgrid.getUnit(coord).cooldown<=0) {
					gc.last_click_coord = coord;
					gc.hexgrid.clientMarkReachable(coord);
					gc.hexgrid.clientMarkAttackable(coord,coord);
				}
				gc.build = false;
				gc.toBuild = null;
				gc.hexgrid.clientClearBuildable();
			}else{
				if(gc.hexgrid.getUnit(coord)){
					gc.guess = coord;
					gc.hexgrid.matrix[coord.X][coord.Y].guessing = true;
				}
				gc.build = false;
				gc.toBuild = null;
				gc.hexgrid.clientClearBuildable();
			}
		};
		
		// hard-coded game instance for demo!!!
		var scenario = Scenarios[this.mapName];
		this.camera = new BuildCamera([scenario.size.x + scenario.offset*2, scenario.size.y], 10, this.background, mapLayer);
		this.minimap = new BuildMiniMap(this.camera, [scenario.size.x + scenario.offset*2, scenario.size.y], 200, this.background, UILayer, stage);
		this.hexgrid = new BuildMap(this.mapName, this.camera, mapLayer, clickCallback);
		
		// initialize terrain
		var terrain = scenario.terrain;
		for (var i = 0; i < terrain.length; i++)
			for (var j = 0; j < terrain[i].length; j++) {
				switch (terrain[i][j]) {
				case "thron":
					this.hexgrid.addTerrain(CONSTANTS.thronTerrain, new Coordinate(i, j));
					break;
				case "resource":
					this.hexgrid.addTerrain(CONSTANTS.resourceTerrain, new Coordinate(i, j));
					break;
				case "flag":
					this.hexgrid.addTerrain(CONSTANTS.flagTerrain, new Coordinate(i, j));
					break;
				}
			}
		
		// draw the game
		stage.add(mapLayer);
		stage.add(UILayer);
		stage.add(msgLayer);
	};

var gc = new game_core_client();
