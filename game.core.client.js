/* Client-side code. */

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
	
        // Teams: 0:red, 1:blue, 2:yellow, 3:green
		// Container for all unit images
        this.sprites = [[], [], [], []];
		// Container for all unit cooldown images
		this.cooldown = [[], [], [], []];
        // Button images
        this.buttonImgs = {lit: {}, unlit: {}};
        this.buttons = {};
        // Flag images
        this.flagImgs = [];
        this.flags = [];
        // Topbar images
        this.topbarImgs = [];
        this.topbar = null;
        // Build unit images
        this.buildUnitImgs = {frame: null, unavailable: [], lit: [], unlit: []};
        this.buildUnit = [];
        this.buildUnitGroup = null;
        // Mark unit images
        this.markUnitImgs = {lit: [], unlit:[]};
        this.markUnit = [];
        this.markUnitGroup = null;
        
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
		this.countdown = CONSTANTS.countdown;
		this.capping = 0;
		this.countdownTimer = null;
		this.resource = 0;
        this.showNum = 1;
		this.build = false;
		this.toBuild = null;
        this.soundOn = true;
		
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
					if(me.resource >= CONSTANTS.cost[0]){
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
					if(me.resource >= CONSTANTS.cost[1]){
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
					if(me.resource >= CONSTANTS.cost[2]){
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
					if(me.resource >= CONSTANTS.cost[3]){
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
					if(me.resource >= CONSTANTS.cost[4]){
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
				me.build = false;
				me.toBuild = null;
				me.hexgrid.clientClearBuildable();
			}	
			if (event.keyCode == 81){
				me.build = true;
				me.toBuild = null;
				me.hexgrid.clientClearReachable();
				me.hexgrid.clientClearAttackable();
				me.hexgrid.clientClearBuildable();
                me.buildUnitGroup.setVisible(true);
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
			if (files_loaded >= 35) {
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
        this.fogImg = load_image("sprites\\fog.png");
        this.buttonbarImg = load_image("sprites\\buttonbar.png");

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

        // load team specific UI images
        this.flagImgs[0] = load_image("sprites\\redflag.png");
        this.flagImgs[1] = load_image("sprites\\blueflag.png");
        this.topbarImgs[0] = load_image("sprites\\topbar1.png");
        this.topbarImgs[1] = load_image("sprites\\topbar2.png");
        
        // load buttons
        this.buttonImgs.unlit.build = load_image("sprites\\hammerunlit.png");
        this.buttonImgs.lit.build = load_image("sprites\\hammerlit.png");
        this.buttonImgs.unlit.menu = load_image("sprites\\menuunlit.png");
        this.buttonImgs.lit.menu = load_image("sprites\\menulit.png");
        this.buttonImgs.unlit.mute = load_image("sprites\\muteunlit.png");
        this.buttonImgs.lit.mute = load_image("sprites\\mutelit.png");
        this.buttonImgs.unlit.sound = load_image("sprites\\soundunlit.png");
        this.buttonImgs.lit.sound = load_image("sprites\\soundlit.png");
        
        // build unit buttons
        this.buildUnitImgs.frame = load_image("sprites\\buildframe.png");
        this.buildUnitImgs.unavailable[0] = load_image("sprites\\vampire_grey.png");
        this.buildUnitImgs.unlit[0] = load_image("sprites\\vampire_black.png");
        this.buildUnitImgs.lit[0] = load_image("sprites\\vampire_green.png");
        this.buildUnitImgs.unavailable[1] = load_image("sprites\\wolf_grey.png");
        this.buildUnitImgs.unlit[1] = load_image("sprites\\wolf_black.png");
        this.buildUnitImgs.lit[1] = load_image("sprites\\wolf_green.png");
        this.buildUnitImgs.unavailable[2] = load_image("sprites\\hunter_grey.png");
        this.buildUnitImgs.unlit[2] = load_image("sprites\\hunter_black.png");
        this.buildUnitImgs.lit[2] = load_image("sprites\\hunter_green.png");
        this.buildUnitImgs.unavailable[3] = load_image("sprites\\zombie_grey.png");
        this.buildUnitImgs.unlit[3] = load_image("sprites\\zombie_black.png");
        this.buildUnitImgs.lit[3] = load_image("sprites\\zombie_green.png");
        this.buildUnitImgs.unavailable[4] = load_image("sprites\\wizard_grey.png");
        this.buildUnitImgs.unlit[4] = load_image("sprites\\wizard_black.png");
        this.buildUnitImgs.lit[4] = load_image("sprites\\wizard_green.png");
        
        // guess unit buttons
        this.markUnitImgs.unlit[0] = load_image("sprites\\mark\\vampire_unlit");
        this.markUnitImgs.lit[0] = load_image("sprites\\mark\\vampire_lit");
        this.markUnitImgs.unlit[1] = load_image("sprites\\mark\\wolf_unlit");
        this.markUnitImgs.lit[1] = load_image("sprites\\mark\\wolf_lit");
        this.markUnitImgs.unlit[2] = load_image("sprites\\mark\\hunter_unlit");
        this.markUnitImgs.lit[2] = load_image("sprites\\mark\\hunter_lit");
        this.markUnitImgs.unlit[3] = load_image("sprites\\mark\\zombie_unlit");
        this.markUnitImgs.lit[3] = load_image("sprites\\mark\\zombie_lit");
        this.markUnitImgs.unlit[4] = load_image("sprites\\mark\\wizard_unlit");
        this.markUnitImgs.lit[4] = load_image("sprites\\mark\\wizard_lit");
        
		// add terrain images
		CONSTANTS.thronTerrain.image = this.thronImg;
		CONSTANTS.flagTerrain.image = this.flagImg;
		CONSTANTS.resourceTerrain.image = this.resourceImg;
        CONSTANTS.heart = this.heartImg;
		
		soundAssets.gothitsound = soundManager.createSound({
			  id: 'gothitsound',
			  url: '/sounds/gothit.mp3'
		});
		//soundAssets.gothitsound.load();
		
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
				var p = this.hexgrid.matrix[parseInt(keywords[2])][parseInt(keywords[3])].MidPoint;
				this.camera.setPos(new Point(p.X-CONSTANTS.width/2,p.Y-CONSTANTS.height/2))
				soundAssets.menusound.setVolume(soundAssets.menusound.volume-1);
				var now, before = new Date();
				var fadeOut = window.setInterval(function(){
						now = new Date();
						if(soundAssets.menusound.volume>=0){
							var elapsedTime = now.getTime() - before.getTime();
							if (elapsedTime > 100)  // in case tab is not active in Chrome
								soundAssets.menusound.setVolume(soundAssets.menusound.volume-Math.round(elapsedTime/100));
							else
								soundAssets.menusound.setVolume(soundAssets.menusound.volume-1);
						}else{
							window.clearInterval(fadeOut);
						}
						before = new Date();
					} ,100);
				
				window.setTimeout(function(){
						soundAssets.menusound.stop();
						soundAssets.backgroundsound = soundManager.createSound({
							  id: 'background',
							  url: '/sounds/background.mp3',
							  volume: 50,
							  onfinish: function(){soundAssets.backgroundsound.play();},
							  //onsuspend: function(){soundAssets.backgroundsound.play();}
						});
						soundAssets.backgroundsound.play();
						if(!blurred){
							soundAssets.backgroundsound.unmute();
						}
					}
				,3000);

				
				break;
			case "end":
				if (this.countdownTimer){
					window.clearInterval(this.countdownTimer);
				}
                for (var i = 0; i < this.flags.length; i++) {
                    this.flags[i].setVisible(false);
                }
				this.capping = 0;
				this.countdown = CONSTANTS.countdown;
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
                // draw flag
                for (var i = 0; i < this.flags.length; i++) {
                    if (i == capteam) {
                        this.flags[i].setVisible(true);
                        this.flags[i].moveToTop();
                    } else {
                        this.flags[i].setVisible(false);
                    }
                }
                // setup countdown timer
				if(keywords[2] != -1){
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
					this.countdown = CONSTANTS.countdown;
					this.capping = 0;
				}
				break;
			case "add":
				var sprite = this.sprites[parseInt(keywords[2])][parseInt(keywords[4])];
				var cd = this.cooldown[parseInt(keywords[2])][parseInt(keywords[4])];
				this.hexgrid.matrix[parseInt(keywords[5])][parseInt(keywords[6])].piece = new Unit(parseInt(keywords[2]), parseInt(keywords[3]),
                        4, parseInt(keywords[4]), new Coordinate(parseInt(keywords[5]),parseInt(keywords[6])), sprite, cd, this.showNum);
				this.hexgrid.matrix[parseInt(keywords[5])][parseInt(keywords[6])].piece.setcd(parseFloat(keywords[7]));
				if (this.fogOn) {
                    this.hexgrid.clientClearViewable();
                    this.hexgrid.clientMarkViewable(this.team);
                    this.hexgrid.clientRemoveUnseeable();
                }
				this.updateRA();
				// update minimap
				var pointOnMap = this.hexgrid.toMap(new Coordinate(parseInt(keywords[5]), parseInt(keywords[6])));
				this.minimap.addUnit(pointOnMap, parseInt(keywords[2]));
                if (this.fogOn) {
                    this.hexgrid.clientClearViewable();
                    this.hexgrid.clientMarkViewable(this.team);
                    this.hexgrid.clientRemoveUnseeable(this.minimap);
                }
				this.updateRA();
				break;
			case "resource":
				this.resource = parseInt(keywords[2]);
                this.updateUnitAvailability();
				break;
			case "move":
				this.hexgrid.move(new Coordinate(parseInt(keywords[2]),parseInt(keywords[3])),new Coordinate(parseInt(keywords[4]),parseInt(keywords[5])))
				this.hexgrid.matrix[parseInt(keywords[4])][parseInt(keywords[5])].piece.setcd(parseInt(keywords[6]));
				// update minimap
				var oldPointOnMap = this.hexgrid.toMap(new Coordinate(parseInt(keywords[2]), parseInt(keywords[3])));
				var newPointOnMap = this.hexgrid.toMap(new Coordinate(parseInt(keywords[4]), parseInt(keywords[5])));
				this.minimap.moveUnit(oldPointOnMap, newPointOnMap);
				if (this.fogOn) {
                    this.hexgrid.clientClearViewable();
                    this.hexgrid.clientMarkViewable(this.team);
                    this.hexgrid.clientRemoveUnseeable(this.minimap);
                }
				this.updateRA();
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
				if (this.fogOn) {
                    this.hexgrid.clientClearViewable();
                    this.hexgrid.clientMarkViewable(this.team);
                    this.hexgrid.clientRemoveUnseeable(this.minimap);
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
				} else if ((me.capping == -1) && (me.countdown <= 30)){  // TODO: hardcoded!
					// if (me.capping == 1){
						// centerMsg.setText("Capturing flag: " + me.countdown + " seconds until win.");
						// centerMsg.setFill('white');
						// centerMsg.setX(200);
						// centerMsg.setY(50);
						// centerMsg.setFontSize(28);
						// centerMsg.setFontStyle('normal');
						// centerMsg.setFontFamily('Calibri');
						// if (!msgLayer.isAncestorOf(centerMsg)) {
							// msgLayer.add(centerMsg);
						// }
					// } else {
						centerMsg.setText("Defend flag: " + me.countdown + " seconds until lose!");
						centerMsg.setFill('red');
						centerMsg.setX(210);
						centerMsg.setY(50);
						centerMsg.setFontSize(28);
						centerMsg.setFontStyle('normal');
						centerMsg.setFontFamily('Calibri');
						if (!msgLayer.isAncestorOf(centerMsg)) {
							msgLayer.add(centerMsg);
						}
					// }
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
        
        // topbar
        this.topbar = new Kinetic.Image({
            x: CONSTANTS.minimapWidth,
            y: 0,
            image: this.topbarImgs[this.team],
            listening: false
        });
        UILayer.add(this.topbar);
		
        // resource text
        var resourceText = new Kinetic.Text({
            fontFamily: "Courier New",
            fontSize: 15,
            fill: "white",
            text: this.resource,
            x: 402,
            y: 8,
            listening: false
        });
        UILayer.add(resourceText);
        
        // flags
        for (var i = 0; i < this.flagImgs.length; i++) {
            this.flags.push(new Kinetic.Image({
                image: this.flagImgs[i],
                x: 448,
                y: 5,
                visible: false,
                listening: false
            }));
            UILayer.add(this.flags[i]);
            this.flags[i].moveToTop();
        }
        
        var flagText = new Kinetic.Text({
            fontFamily: "Courier New",
            fontSize: 15,
            fill: "white",
            text: CONSTANTS.countdown-this.countdown + "/" + CONSTANTS.countdown,
            x: 475,
            y: 8,
            listening: false
        });
        UILayer.add(flagText);
        
        // button bar
        this.buttonbar = new Kinetic.Image({
            x: CONSTANTS.minimapWidth + this.topbar.getWidth(),
            y: 0,
            image: this.buttonbarImg,
            listening: false
        });
        UILayer.add(this.buttonbar);
        
        // buttons
        this.buttons.build = new Kinetic.Image({
            x: 572,
            y: 4,
            image: this.buttonImgs.unlit.build,
            listening: true
        });
        this.buttons.build.on('mouseover', function(){
            me.buttons.build.setImage(me.buttonImgs.lit.build);
            document.body.style.cursor = "pointer";
        });
        this.buttons.build.on('mouseout', function(){
            me.buttons.build.setImage(me.buttonImgs.unlit.build);
            document.body.style.cursor = "auto";
        });
        this.buttons.build.on('click', function(){
            if (!me.buildUnitGroup.getVisible()) {
                me.build = true;
				me.toBuild = null;
				me.hexgrid.clientClearReachable();
				me.hexgrid.clientClearAttackable();
				me.hexgrid.clientClearBuildable();
                me.buildUnitGroup.setVisible(true);
            } else {
                me.buildUnitGroup.setVisible(false);
                me.build = false;
            }
        });
        UILayer.add(this.buttons.build);
        
        this.buttons.menu = new Kinetic.Image({
            x: 602,
            y: 4,
            image: this.buttonImgs.unlit.menu,
            listening: true
        });
        this.buttons.menu.on('mouseover', function(){
            me.buttons.menu.setImage(me.buttonImgs.lit.menu);
            document.body.style.cursor = "pointer";
        });
        this.buttons.menu.on('mouseout', function(){
            me.buttons.menu.setImage(me.buttonImgs.unlit.menu);
            document.body.style.cursor = "auto";
        });
        this.buttons.menu.on('click', function(){
            // click event listener goes here
            alert("clicked!");
        });
        UILayer.add(this.buttons.menu);
        
        this.buttons.sound = new Kinetic.Image({
            x: 630,
            y: 4,
            image: this.buttonImgs.unlit.sound,
            listening: true
        });
        if (!this.soundOn) {
            this.buttons.sound.setImage(this.buttonImgs.unlit.mute);
        }
        this.buttons.sound.on('mouseover', function(){
            if (me.soundOn) {
                me.buttons.sound.setImage(me.buttonImgs.lit.sound);
            } else {
                me.buttons.sound.setImage(me.buttonImgs.lit.mute);
            }
            document.body.style.cursor = "pointer";
        });
        this.buttons.sound.on('mouseout', function(){
            if (me.soundOn) {
                me.buttons.sound.setImage(me.buttonImgs.unlit.sound);
            } else {
                me.buttons.sound.setImage(me.buttonImgs.unlit.mute);
            }
            document.body.style.cursor = "auto";
        });
        this.buttons.sound.on('click', function(){
            if (me.soundOn) {
                me.soundOn = false;
                me.buttons.sound.setImage(me.buttonImgs.lit.mute);
            } else {
                me.soundOn = true;
                me.buttons.sound.setImage(me.buttonImgs.lit.sound);
            }
        });
        UILayer.add(this.buttons.sound);
        
        // build unit image
        var buildUnitGroup = new Kinetic.Group({
            visible: false,
        });
        this.buildUnitGroup = buildUnitGroup;
        buildUnitGroup.add(new Kinetic.Image({
            image: this.buildUnitImgs.frame,
            x: 572,
            y: 40
        }));
        for (var i = 0; i < 5; i++) {
            this.buildUnit[i] = new Kinetic.Image({
                image: this.buildUnitImgs.unavailable[i],
                x: 573,
                y: 60+31*i
            });
            this.buildUnit[i].available = false;
            this.buildUnit[i].on('mouseover', function(temp) {
                return function(){
                    if (me.buildUnit[temp].available) {
                        me.buildUnit[temp].setImage(me.buildUnitImgs.lit[temp]);
                        document.body.style.cursor = "pointer";
                    }
                }
            }(i));
            this.buildUnit[i].on('mouseout', function(temp) {
                return function(){
                    if (me.buildUnit[temp].available) {
                        me.buildUnit[temp].setImage(me.buildUnitImgs.unlit[temp]);
                        document.body.style.cursor = "auto";
                    }
                }
            }(i));
            this.buildUnit[i].on('click', function(temp) {
                return function(){
                    if (me.buildUnit[temp].available) {
                        me.toBuild = temp;
                        me.hexgrid.clientMarkBuildable(me.player);
                    }
                }
            }(i));
            buildUnitGroup.add(this.buildUnit[i]);
        }
        UILayer.add(buildUnitGroup);
        
        this.UILayerAnim = new Kinetic.Animation(function(frame) {
            resourceText.setText(me.resource);
            flagText.setText(CONSTANTS.countdown-me.countdown + "/" + CONSTANTS.countdown);
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
                gc.buildUnitGroup.setVisible(false);
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
		
		// initialize game instance
		var scenario = Scenarios[this.mapName];
        this.fogOn = scenario.fog;
		this.camera = new BuildCamera([scenario.size.x + scenario.offset*2, scenario.size.y], 10, this.background, mapLayer);
		this.minimap = new BuildMiniMap(this.camera, [scenario.size.x + scenario.offset*2, scenario.size.y], CONSTANTS.minimapWidth, this.background, UILayer, stage);
		this.hexgrid = new BuildMap(this.mapName, this.camera, mapLayer, clickCallback, this.fogOn, this.fogImg);
		
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
    
    game_core_client.prototype.updateUnitAvailability = function() {
        for (var i = 0; i < 5; i++) {
            if (this.resource >= CONSTANTS.cost[i]) {
                this.buildUnit[i].available = true;
                this.buildUnit[i].setImage(this.buildUnitImgs.unlit[i]);
            } else {
                this.buildUnit[i].available = false;
                this.buildUnit[i].setImage(this.buildUnitImgs.unavailable[i]);
            }
        }
    }

var gc = new game_core_client();
