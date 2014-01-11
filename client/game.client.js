/** 
 * Client-side code. 
 */

 /**
 * The GameClient constructor. 
 */
var GameClient = function() {
	this.lastClickCoord = null;	
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
	this.unitCounter = [0, 0];
	this.newSocket();
	this.vampireKO = false;
	this.gcUI = null;
	this.gcSound = null;
    this.scenario = null;
    this.canBuildUnit = [false, false, false, false, false];
    this.guess = null;
}

GameClient.prototype.newSocket = function (){
	//Store a local reference to our connection to the server
	this.mainSocket = io.connect();
	//When we connect, we are not 'connected' until we have a server id
	//and are placed in a game by the server. The server sends us a message for that.
	this.mainSocket.on('connect', this.connecting.bind(this));
	//Sent when we are disconnected (network, server down, etc)
	this.mainSocket.on('disconnect', this.ondisconnect.bind(this));
	//Handle when we connect to the server, showing state and storing id's.
	this.mainSocket.on('onconnected', this.onconnected.bind(this));
	//On message from the server, we parse the commands and send it to the handlers
	this.mainSocket.on('message', this.onnetmessage.bind(this));
}

/**
 * Load UI and sound assets.
 */
GameClient.prototype.loadAssets = function(/*string*/ scenario) {
    this.scenario = scenario;
	this.gcUI = new GameClientUI(this, scenario);
	gcUI.loadImage();
	this.gcSound = new GameClientSounds();
	gcSound.loadSound();
	//Do we really need hasLoaded? JavaScript is linear.
};

GameClient.prototype.joinGame = function(/*string*/ scenario, /*int*/ type){  //Server connection functionality..
	this.mainSocket.send('0 join '+ type + ' '+ scenario);
};

GameClient.prototype.initGame = function(){
    this.fogOn = this.scenario.fog;
    this.hexgrid = new ClientHexgrid(new Hexgrid(this.scenario));
    this.gcUI.initGameUI();  // init game UI
};

/**
 * Handle message from server.
 */
GameClient.prototype.onnetmessage = function(data){
	var keywords = data.split(" ");
	var msgType = parseInt(keywords[0]);
	switch (msgType) {	
		// Lobby message.
		case 0:
			switch (keywords[1]) {
			case "menuReset":
				resetMenu();//Menu method
				break;
			case "menu":
				updateMenu(keywords[2]);//Menu method
				break;
			case "init":  // Init Game
				this.mapName = keywords[2];
				this.player = parseInt(keywords[3]);
				this.team = parseInt(keywords[4]);
				this.type = parseInt(keywords[5]);
				this.alive = true;
				this.started = false;
				this.winner = false;
				this.initGame();
				break;
			case "start": // Start Game
				start(); //Menu method. Tell menu to display game.
				this.started = true;
				var p = this.hexgrid.matrix[parseInt(keywords[2])][parseInt(keywords[3])].MidPoint;
				this.camera.setPos(new Point(p.X-CONSTANTS.width/2,p.Y-CONSTANTS.height/2))
				//Start background sound.
				this.gcSound.playBackgroundSound();
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
				this.lastClickCoord = null;
				this.started = false;
				this.countdownTimer = null;
				this.resource = 0;
                this.unitCounter = [0, 0];
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
				//Stop in game sounds.
				this.gcSound.stopBackgroundSound();
				// switch back to menu
				if (this.winner == this.team){
					gameEnded(true);
				} else {
					gameEnded(false);
				}
				break;
			}
			break;
		// Game control messages
		case 1:  
			switch (keywords[1]) {
			case "countdown":
				var capteam = parseInt(keywords[2]);
				if(this.team != capteam && capteam != -1){
					this.gcSound.playFlagcapSound();
				}else{
					this.gcSound.stopFlagcapSound();
				}
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
            case "count":
                this.unitCounter[0] = parseInt(keywords[2]);
                this.unitCounter[1] = parseInt(keywords[3]);
                break;
			case "add":
				var sprite = this.sprites[parseInt(keywords[2])][parseInt(keywords[4])];
				var cd = this.cooldown[parseInt(keywords[2])][parseInt(keywords[4])];
				this.hexgrid.matrix[parseInt(keywords[5])][parseInt(keywords[6])].piece = new Unit(parseInt(keywords[2]), parseInt(keywords[3]),
                       parseInt(keywords[8]), parseInt(keywords[4]), new Coordinate(parseInt(keywords[5]),parseInt(keywords[6])), sprite, cd, this.showNum);
				this.hexgrid.matrix[parseInt(keywords[5])][parseInt(keywords[6])].piece.setcd(parseFloat(keywords[7]));
				if (this.fogOn) {
                    this.hexgrid.clientClearViewable();
                    this.hexgrid.clientMarkViewable(this.team);
                    this.hexgrid.clientRemoveUnseeable(this.minimap);
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
				if (this.lastClickCoord && this.lastClickCoord.X == parseInt(keywords[2]) && this.lastClickCoord.Y == parseInt(keywords[3])){
					this.lastClickCoord = null;
				}
				if (this.guess && this.guess.X == parseInt(keywords[2]) && this.guess == parseInt(keywords[3])){
					this.hexgrid.matrix[gc.guess.X][gc.guess.Y].guessing = false;
					this.guess = null;
				}
				if(this.hexgrid.matrix[parseInt(keywords[2])][parseInt(keywords[3])].piece.team == gc.team){
					soundAssets.diesound.play();
				}else{
					if(!this.vampireKO){
						soundAssets.killsound.play();
					}
					this.vampireKO = false;
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

GameClient.prototype.connecting = function(data){
	//TODO
};

GameClient.prototype.ondisconnect = function(data){ 
	//TODO
};

GameClient.prototype.onconnected = function(data){
	//TODO
};
	
GameClient.prototype.updateRA = function(){
    this.hexgrid.clientClearReachable();
    this.hexgrid.clientClearAttackable();
    if(this.lastClickCoord){
        if(this.hexgrid.getUnit(this.lastClickCoord)){
            this.hexgrid.clientMarkReachable(this.lastClickCoord);
            this.hexgrid.clientMarkAttackable(this.lastClickCoord);
        }
    }
}; 
    
GameClient.prototype.updateUnitAvailability = function() {
    for (var i = 0; i < 5; i++) {
        if (this.resource >= CONSTANTS.cost[i]) {
            this.canBuildUnit[i] = true;
        } else {
            this.canBuildUnit[i] = false;
        }
    }
}