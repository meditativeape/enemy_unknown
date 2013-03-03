/*
	Server-side code.
*/

var helper = require('./helper.js');
var BuildMap = require('./hexgrid.js');
var Unit = require('./unit.js');
var CONSTANTS = helper.CONSTANTS;

// helper function for string format
String.prototype.format = function (args) {
	var str = this;
	return str.replace(String.prototype.format.regex, function(item) {
		var intVal = parseInt(item.substring(1, item.length - 1));
		var replace;
		if (intVal >= 0) {
			replace = args[intVal];
		} else if (intVal === -1) {
			replace = "{";
		} else if (intVal === -2) {
			replace = "}";
		} else {
			replace = "";
		}
		return replace;
	});
};
String.prototype.format.regex = new RegExp("{-?[0-9]+}", "g");

/* The game_core_server class */

    var game_core_server = module.exports = function(playerList, gameid, type, server){

        // Store the players
        this.players = playerList;
		// Store the number of units for each team;
		this.units = [];
		// Store game's uuid
		this.id = gameid;
		// Store the type of the game. One of 0, 1, 2, 3.
		this.type = type;
        // gameserver
        this.server = server;
		// Game has not started yet
		this.started = false;
		// Our local game
		this.hexgrid = null;
		this.winCountdownFlag = false;
		this.winCountdown = null;

    };
	
	game_core_server.prototype.canMove = function(coord1, coord2, player){
		
		var unit = this.hexgrid.getUnit(coord1);
		if (unit && unit.team == player.team && !this.hexgrid.getUnit(coord2)){ // coord1 has player's unit and coord2 is empty
			if (this.hexgrid.hexDist(this.hexgrid.matrix[coord1.X][coord1.Y], this.hexgrid.matrix[coord2.X][coord2.Y]) <= unit.range)
						if(this.hexgrid.matrix[coord2.X][coord2.Y].terrain){
								if(this.hexgrid.matrix[coord2.X][coord2.Y].terrain.moveable){
									return true;
								}
							}else{
								return true;
							}
		}
		
		return false;
		
	};
	
	game_core_server.prototype.makeMove = function(coord1, coord2){
		this.hexgrid.move(coord1, coord2);
	};
	
	game_core_server.prototype.canAttack = function(coord1, coord2, player){
	
		var myUnit = this.hexgrid.getUnit(coord1);
		var theirUnit = this.hexgrid.getUnit(coord2);
		if (myUnit.team == player.team && theirUnit && theirUnit.team != player.team)
			if (this.hexgrid.hexDist(this.hexgrid.matrix[coord1.X][coord1.Y], this.hexgrid.matrix[coord2.X][coord2.Y]) <= myUnit.range)
				return true;
		return false;
	
	};
	
	game_core_server.prototype.makeAttack = function(coord1, coord2){
	
		var responses = [];
		var unit1 = this.hexgrid.getUnit(coord1);
		var unit2 = this.hexgrid.getUnit(coord2);
		this.hexgrid.attack(coord1, coord2);
		responses.push(["1", "attack", coord1.X, coord1.Y, unit1.hp, coord2.X, coord2.Y, unit2.hp].join(" "));
		if (unit1.hp <= 0) {  // unit 1 dies
			responses.push(["1", "die", coord1.X, coord1.Y, unit1.type].join(" "));
			this.units[unit1.player]--;
		}
		if (unit2.hp <= 0) {  // unit 2 dies
			responses.push(["1", "die", coord2.X, coord2.Y, unit2.type].join(" "));
			this.units[unit2.player]--;
		}
		return responses;
		
	};

	game_core_server.prototype.checkObjectives = function(){
		for(var x in this.hexgrid.matrix){ // brute force!
			for(var y in this.hexgrid.matrix[x]){
				if(this.hexgrid.matrix[x][y].terrain){
					if(this.hexgrid.matrix[x][y].terrain.objectiveType){
						if(this.hexgrid.matrix[x][y].terrain.objectiveType = 'flag'){
							var self = this;
							if(this.hexgrid.matrix[x][y].piece && !this.winCountdownFlag){
								this.winner = self.hexgrid.matrix[x][y].piece.team;
								for (var i in this.players) {
									this.sendMsg(this.players[i], "0 countdown " + this.winner);
								}
								this.winCountdown = window.setTimeout(function(){
									self.endGame(self.winner);
									},this.hexgrid.matrix[x][y].terrain.objectiveTime*1000);
								this.winCountdownFlag = true;
							}
							else if(!this.hexgrid.matrix[x][y].piece && this.winCountdownFlag){
								this.winner = null;
								window.clearTimeout(this.winCountdown);
								for (var i in this.players) {
									this.sendMsg(this.players[i], "0 countdown " + -1);
								}
								this.winCountdownFlag = false;
							}
						}
					}
				}
			}
		}
	};
	
	game_core_server.prototype.handleClientInput = function(client, message){
		
		var keywords = message.split(" ");
		var msgType = parseInt(keywords[0]);
		console.log(":: " + this.id.substring(0,8) + " :: received a message: " + message);
		
		switch (msgType) {
		
		case 0:  // game control messages
			switch (keywords[1]) {
			// case "join":  // a client joins the game
				// if (!this.started) {
					// this.players.push(client);
					// if ((this.players.length == 2 && this.type == 0)
						// || (this.players.length == 3 && this.type == 1)
						// || (this.players.length == 4 && this.type == 2)
						// || (this.players.length == 4 && this.type == 3)) {
						// this.startGame();  // enough players; start game
					// } else {
						// for (var i in this.players) {  // tell each player that someone joins
							// this.players[i].send("0 join " + this.players.length + " " + client.userid);
						// }	
					// }
				// } else {
					// // TODO: report error
				// }
				// break;
			case "leave":
				this.leaveGame(client);
				break;
			default:
				// TODO: send response about invalid message
			}
			break;
		
		case 1:  // game state messages
			switch (keywords[1]) {
			case "move":
				var coord1 = new helper.Coordinate(parseInt(keywords[2]), parseInt(keywords[3]));
				var coord2 = new helper.Coordinate(parseInt(keywords[4]), parseInt(keywords[5]));
				if (this.canMove(coord1, coord2, client)) {
					this.makeMove(coord1, coord2);  // move in our local game
					this.hexgrid.getUnit(coord2).setcd(0);
					for (var i in this.players) {  // tell each player the result of move
						this.sendMsg(this.players[i], message);
					}
				}
				this.checkObjectives();
				break;
			case "attack":
				var myCoord = new helper.Coordinate(parseInt(keywords[2]), parseInt(keywords[3]));
				var oppoCoord = new helper.Coordinate(parseInt(keywords[4]), parseInt(keywords[5]));
				if (this.canAttack(myCoord, oppoCoord, client)) {
					var responses = this.makeAttack(myCoord, oppoCoord);  // attack in our local game and get results
					var unit = this.hexgrid.getUnit(myCoord);
					if (unit)
						unit.setcd(0);
					for (var i in this.players) {  // tell each player the result of attack
						for (var j in responses)
							this.sendMsg(this.players[i], responses[j]);
					}
					this.checkGameStatus();
				}
				this.checkObjectives();
				break;
			default:
				// TODO: send response about invalid message
			}
			break;
			
		case 2:
			switch (keywords[1]) {
			case "team":
				// TODO: team chat
				break;
			case "all":
				// TODO: all chat
				break;
			default:
				// TODO: send response about invalid message
			}
			break;
			
		case 3:
			switch (keywords[1]) {
			case "retts":
				// TODO: find the event that requires timestamp from client and tell it the answer
				break;
			default:
				// TODO: send response about invalid message
			}
			break;
			
		default:
			// TODO: send response about invalid message
		}
	};
	
	game_core_server.prototype.checkGameStatus = function(){
		var winningTeam = -1;
		for (var i in this.units) {
			if (this.units[i] > 0) {
				if (winningTeam != -1)
					return;
				else
					winningTeam = i;
			}
		}
		this.endGame(winningTeam);  // some team wins
	};
	
	game_core_server.prototype.sendMsg = function(recipient, message){
		console.log(":: " + this.id.substring(0,8) + " :: send message: " + message);
		recipient.send(message);
	};

	game_core_server.prototype.startGame = function(){
	
		this.started = true;
		console.log(":: " + this.id.substring(0,8) + " :: Initializing game...");
		for (var i in this.players) {
			this.sendMsg(this.players[i], "0 init 0 " + i + " " + i + " " + this.type);  // TODO: does not work for 2v2
			// this.sendMsg(this.players[i], "resource " + CONSTANTS.init_resource);
		}
		
		// helper function to shuffle an array
		var shuffle = function(myArray) {
			var i = myArray.length, j, tempi, tempj;
			if ( i == 0 ) return false;
			while ( --i ) {
			 j = Math.floor( Math.random() * ( i + 1 ) );
			 tempi = myArray[i];
			 tempj = myArray[j];
			 myArray[i] = tempj;
			 myArray[j] = tempi;
			}
		}
		
		// hardcoded game instance for demo!
		var pieces = [];
		this.hexgrid = new BuildMap(40, 2.0, 1500, 1200, 40);
		//Map 0.
						this.hexgrid.matrix[5][5].terrain = CONSTANTS.flagTerrain;
						this.hexgrid.matrix[4][5].terrain = CONSTANTS.waterTerrain;
						this.hexgrid.matrix[5][4].terrain = CONSTANTS.waterTerrain;
						this.hexgrid.matrix[5][6].terrain = CONSTANTS.waterTerrain;
						this.hexgrid.matrix[6][5].terrain = CONSTANTS.waterTerrain;
		// 2 players
		var types = [0, 1, 2, 3, 4];
		shuffle(types);
		pieces.push(this.hexgrid.matrix[0][4].piece = new Unit(0, 0, 100, types[0], new helper.Coordinate(0,4),0, null));
		this.hexgrid.matrix[0][4].piece.buff = this.hexgrid.matrix[0][4].terrain?this.hexgrid.matrix[0][4].terrain.buff:null;
		pieces.push(this.hexgrid.matrix[1][3].piece = new Unit(0, 0, 100, types[1], new helper.Coordinate(1,3),0, null));
		this.hexgrid.matrix[1][3].piece.buff = this.hexgrid.matrix[1][3].terrain?this.hexgrid.matrix[1][3].terrain.buff:null;
		pieces.push(this.hexgrid.matrix[2][2].piece = new Unit(0, 0, 100, types[2], new helper.Coordinate(2,2),0, null));
		this.hexgrid.matrix[2][2].piece.buff = this.hexgrid.matrix[2][2].terrain?this.hexgrid.matrix[2][2].terrain.buff:null;
		pieces.push(this.hexgrid.matrix[3][1].piece = new Unit(0, 0, 100, types[3],new helper.Coordinate(3,1), 0, null));
		this.hexgrid.matrix[3][1].piece.buff = this.hexgrid.matrix[3][1].terrain?this.hexgrid.matrix[3][1].terrain.buff:null;
		pieces.push(this.hexgrid.matrix[4][0].piece = new Unit(0, 0, 100, types[4],new helper.Coordinate(4,0), 0, null));
		this.hexgrid.matrix[4][0].piece.buff = this.hexgrid.matrix[4][0].terrain?this.hexgrid.matrix[4][0].terrain.buff:null;
		this.units.push(5);
		shuffle(types);
		pieces.push(this.hexgrid.matrix[6][10].piece = new Unit(1, 1, 100, types[0],new helper.Coordinate(6,10), 0, null));
		this.hexgrid.matrix[6][10].piece.buff = this.hexgrid.matrix[6][10].terrain?this.hexgrid.matrix[6][10].terrain.buff:null;
		pieces.push(this.hexgrid.matrix[7][9].piece = new Unit(1, 1, 100, types[1], new helper.Coordinate(7,9),0, null));
		this.hexgrid.matrix[7][9].piece.buff = this.hexgrid.matrix[7][9].terrain?this.hexgrid.matrix[7][9].terrain.buff:null;
		pieces.push(this.hexgrid.matrix[8][8].piece = new Unit(1, 1, 100, types[2], new helper.Coordinate(8,8),0, null));
		this.hexgrid.matrix[8][8].piece.buff = this.hexgrid.matrix[8][8].terrain?this.hexgrid.matrix[8][8].terrain.buff:null;
		pieces.push(this.hexgrid.matrix[9][7].piece = new Unit(1, 1, 100, types[3],new helper.Coordinate(9,7), 0, null));
		this.hexgrid.matrix[9][7].piece.buff = this.hexgrid.matrix[9][7].terrain?this.hexgrid.matrix[9][7].terrain.buff:null;
		pieces.push(this.hexgrid.matrix[10][6].piece = new Unit(1, 1, 100,types[4], new helper.Coordinate(10,6), 0, null));
		this.hexgrid.matrix[10][6].piece.buff = this.hexgrid.matrix[10][6].terrain?this.hexgrid.matrix[10][6].terrain.buff:null;
		this.units.push(5);
		// 3 players
		// if (this.type == 1) {
			// pieces.push(this.hexgrid.matrix[0][5].piece = new Unit(2, 2, 100, randomType(), new helper.Coordinate(0, 5), 0, null));
			// pieces.push(this.hexgrid.matrix[1][4].piece = new Unit(2, 2, 100, randomType(), new helper.Coordinate(1, 4), 0, null));
		// }
		// 4 players
		// if (this.type == 2) {
			// pieces.push(this.hexgrid.matrix[5][1].piece = new Unit(3, 3, 100, randomType(), new helper.Coordinate(5, 1), 0, null));
			// pieces.push(this.hexgrid.matrix[6][0].piece = new Unit(3, 3, 100, randomType(), new helper.Coordinate(6, 0), 0, null));
		// }
		
		// do not work for 2v2 yet
		var k = 0;
		for (var i in this.players) {
			this.players[i].team = k++;
			// this.players[i].resource = CONSTANTS.init_resource;
			for (var j in pieces) {
				if (this.players[i].team == pieces[j].team)
					this.sendMsg(this.players[i], "1 add {0} {1} {2} {3} {4}".format([pieces[j].player, pieces[j].team, pieces[j].type, pieces[j].x, pieces[j].y]));
				else
					this.sendMsg(this.players[i], "1 add {0} {1} {2} {3} {4}".format([pieces[j].player, pieces[j].team, 5, pieces[j].x, pieces[j].y]));
			}
		}
		
		console.log(":: " + this.id.substring(0,8) + " :: Game started!");
		for (var i in this.players) {
			this.sendMsg(this.players[i], "0 start {0} {1}".format([pieces[5*i].x, pieces[5*i].y]));
		}
	};
	
	game_core_server.prototype.leaveGame = function(client){
		for (var i in this.players)
			if (this.players[i].userid == client.userid) {
				this.players[i].game = null;
				this.players.splice(i, i+1);
				for (var i in this.players) {  // tell each player that someone leaves
					this.sendMsg(this.players[i], "0 leave " + this.players.length + " " + client.userid);
				}
				break;
			}
		console.log(":: " + this.id.substring(0,8) + " :: player " + client.userid.substring(0,8) + " has left the game.");
		// if this game has no more than one player, end it
		if (this.players.length == 1) {
			this.endGame(this.players[0].team);
		}
	};
	
	game_core_server.prototype.endGame = function(winningTeam){
		for (var i in this.players) {
			this.sendMsg(this.players[i], "0 end " + winningTeam);
			this.players[i].game = null;
		}
		this.server.endGame(this.id)
	};