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
	this.vampireKO = false;
	this.gcUI = null;
	this.gcSound = null;
    this.scenarioName = null;
    this.canBuildUnit = [false, false, false, false, false];
    this.guess = null;
	
	
}





GameClient.prototype.initGame = function(/*string*/ scenarioName,/*boolean*/ fogOn){

    this.scenarioName = scenarioName;
	this.fogOn = fogOn;
    
	// Build Hexgrid.
    this.hexgrid = new ClientHexgrid(new Hexgrid(this.scenarioName));
    
	// Load UI and sound assets.
	this.gcUI = new GameClientUI(this);
	this.gcUI.loadImage();
	this.gcUI.initGameUI();  // init game UI
	this.gcSound = new GameClientSounds();
	this.gcSound.loadSound();
};

/**
 * Handle message from server.
 * TODO: refactor this method!
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
				
				//TODO call gcUI.cleanUp();
				
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
				//Duplicate should be fine even when removed. 
				//this.hexgrid.updateViewable(this.team,this.minimap);
				//this.updateReachableAndAttackable();
				
				// update minimap
				var pointOnMap = this.hexgrid.toMap(new Coordinate(parseInt(keywords[5]), parseInt(keywords[6])));
				this.minimap.addUnit(pointOnMap, parseInt(keywords[2]));
                this.hexgrid.updateViewable(this.team,this.minimap);
				this.updateReachableAndAttackable();
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
				this.hexgrid.updateViewable(this.team,this.minimap);
				this.updateReachableAndAttackable();
				break;
			case "attack":
				//Piece at ('2','3') attacks piece at ('5','6'). Piece at ('2','3') loses '4' hp, and piece at ('5','6') loses '7' hp.
				//updateHP also plays the correct attack sound.
				this.hexgrid.matrix[parseInt(keywords[2])][parseInt(keywords[3])].piece.updateHP(parseInt(keywords[4]),this);
				this.hexgrid.matrix[parseInt(keywords[5])][parseInt(keywords[6])].piece.updateHP(parseInt(keywords[7]),this);
				//Piece at ('2','3') has cd set.
				this.hexgrid.matrix[parseInt(keywords[2])][parseInt(keywords[3])].piece.setcd(CONSTANTS.cd);
				this.updateReachableAndAttackable();
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
				//Our unit was killed.
				if(this.hexgrid.matrix[parseInt(keywords[2])][parseInt(keywords[3])].piece.team == gc.team){
					this.gcSound.playDieSound();
				//Enemy unit was killed.
				}else{
					if(this.vampireKO){
						//If vampire is unit killed, play vampireKO sound.
						//Uses information from updateHP that has been passed to client.
						this.gcSound.playVampireKOSound.play(); 
						this.vampireKO = false;
					}else{
						this.gcSound.playKillSound();
						
					}
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
				this.hexgrid.updateViewable(this.team,this.minimap);
				this.updateReachableAndAttackable();
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
	
GameClient.prototype.updateReachableAndAttackable = function(){
    this.hexgrid.clearReachable();
    this.hexgrid.clearAttackable();
    if(this.lastClickCoord){
        if(this.hexgrid.getUnit(this.lastClickCoord)){
            this.hexgrid.markReachable(this.lastClickCoord);
            this.hexgrid.markAttackable(this.lastClickCoord);
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