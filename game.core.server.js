/*
	Server-side code.
*/
require('./terrain.js');
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

    var game_core_server = module.exports = function(playerList, gameid, type, scenario){

        // Store the players
        this.players = playerList;
		// Store the number of units for each team;
		this.units = [];
		// Store game's uuid
		this.id = gameid;
		// Store the type of the game. One of 0, 1, 2, 3.
		this.type = type;
		// Store the map name of the game
		this.scenario = scenario;
		// Game has not started yet
		this.started = false;
		// Our local game
		this.hexgrid = null;
		this.winCountdownFlag = false;
		this.winCountdown = null;
		//Store the resources
		this.resources = [];

    };
	
	game_core_server.prototype.canMove = function(coord1, coord2, player){
		
		var unit = this.hexgrid.getUnit(coord1);
		if (unit && unit.player == player.player && !this.hexgrid.getUnit(coord2)){ // coord1 has player's unit and coord2 is empty
			if (this.hexgrid.hexDist(this.hexgrid.matrix[coord1.X][coord1.Y], this.hexgrid.matrix[coord2.X][coord2.Y]) <= unit.range) {
				if (!this.hexgrid.matrix[coord2.X][coord2.Y].terrain) {
					return true;
				} else {
					if (this.hexgrid.matrix[coord2.X][coord2.Y].terrain.moveable)
						return true;
				}	
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
		if (myUnit.player == player.player && theirUnit && theirUnit.team != player.team)
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
	
	game_core_server.prototype.updateResource = function(id, offset){
		this.resources[id] += offset;
		this.sendMsg(this.players[id], "1 resource " + this.resources[id]);
	};
    
    game_core_server.prototype.buildUnit = function(type, coord, player){
        var id = player.player;
        var team = player.team;
        var cost = CONSTANTS.cost[type];
        // check if coord is empty
        if (this.hexgrid.getUnit(coord))
            return;
        // check if there is any ally unit nearby
        hasAllyNearby = false;
        var x = coord.X;
        var y = coord.Y;
        var unit;
		xs = [x-1, x-1, x, x, parseInt(x)+1, parseInt(x)+1];
		ys = [y, parseInt(y)+1, y-1, parseInt(y)+1, y-1, y];
        for (var i = 0; i < 6; i++) {
            unit = this.hexgrid.getUnit(new helper.Coordinate(xs[i], ys[i]));
            if (unit && (unit.team == team)) {
                hasAllyNearby = true;
                break;
            }
        }
        // TODO: hardcoded cost!
        if (hasAllyNearby && this.resources[id] >= cost) {
            // deduct resource
            this.resources[id] -= cost;
            this.sendMsg(this.players[id], "1 resource " + this.resources[id]);
            // add unit
            var u = new Unit(id, team, 4, type, coord);
			this.hexgrid.addUnit(u, coord);
            this.units[team]++;
            this.sendMsg(this.players[id], "1 add {0} {1} {2} {3} {4} {5}".format([id, team, type, coord.X, coord.Y, CONSTANTS.cd]));
        }
        this.updateVisible();
    };

	game_core_server.prototype.checkObjectives = function(){
		for(var x in this.hexgrid.matrix){ // brute force!
			for(var y in this.hexgrid.matrix[x]){
				if(this.hexgrid.matrix[x][y].terrain){
					var hexagon = this.hexgrid.matrix[x][y];
                    var t = hexagon.terrain;
					if(t.objectiveType == 'flag'){  // is a flag
						var self = this;
						if (this.hexgrid.matrix[x][y].piece && !hexagon.captured) {
							this.winner = self.hexgrid.matrix[x][y].piece.team;
							for (var i in this.players) {
								this.sendMsg(this.players[i], "1 countdown " + this.winner);
							}
							hexagon.countdown = window.setTimeout(function(){
								self.endGame(self.winner);
								}, t.objectiveTime*1000);
							hexagon.captured = true;
						} else if (!this.hexgrid.matrix[x][y].piece && hexagon.captured) {
							this.winner = null;
							window.clearTimeout(hexagon.countdown);
							for (var i in this.players) {
								this.sendMsg(this.players[i], "1 countdown " + -1);
							}
							hexagon.captured = false;
						}
					}
					if (t.resource) {  // provide resource
                        var r = t.resource;
						var self = this;
						if (this.hexgrid.matrix[x][y].piece && !hexagon.captured) {
                            var id = this.hexgrid.matrix[x][y].piece.player;
							hexagon.interval = window.setInterval(function(){
								self.updateResource(id, r);
								}, t.gatheringSpeed*1000);
							hexagon.captured = true;
						} else if (!this.hexgrid.matrix[x][y].piece && hexagon.captured) {
							window.clearInterval(hexagon.interval);
                            hexagon.interval = 0;
							hexagon.captured = false;
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
			case "build":
                var type = parseInt(keywords[2]);
				var coord = new helper.Coordinate(parseInt(keywords[3]), parseInt(keywords[4]));
				this.buildUnit(type, coord, client);
				break;
			case "move":
				var coord1 = new helper.Coordinate(parseInt(keywords[2]), parseInt(keywords[3]));
				var coord2 = new helper.Coordinate(parseInt(keywords[4]), parseInt(keywords[5]));
				if (this.canMove(coord1, coord2, client)) {
					this.makeMove(coord1, coord2);  // move in our local game
                    var unit = this.hexgrid.getUnit(coord2);
					unit.setcd(CONSTANTS.cd);
					for (var i in this.players) {  // tell players the result of move
                        if (unit.player == i || unit.serverIsVisible)  // only works for 1v1
                            this.sendMsg(this.players[i], message + " " + CONSTANTS.cd);
					}
				}
                this.updateVisible();
				this.checkObjectives();
				break;
			case "attack":
				var myCoord = new helper.Coordinate(parseInt(keywords[2]), parseInt(keywords[3]));
				var oppoCoord = new helper.Coordinate(parseInt(keywords[4]), parseInt(keywords[5]));
				if (this.canAttack(myCoord, oppoCoord, client)) {
					var responses = this.makeAttack(myCoord, oppoCoord);  // attack in our local game and get results
					var unit = this.hexgrid.getUnit(myCoord);
					if (unit)
						unit.setcd(CONSTANTS.cd);
					for (var i in this.players) {  // tell each player the result of attack
						for (var j in responses)
							this.sendMsg(this.players[i], responses[j]);
					}
					this.checkGameStatus();
				}
                this.updateVisible(); // in case some unit dies
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
		console.log(":: " + this.id.substring(0,8) + " :: send message to " + recipient.player + ": " + message);
		recipient.send(message);
	};
    
    game_core_server.prototype.updateVisible = function(){  // only works for 1v1
        var piecesToAdd = this.hexgrid.serverUpdateVisible();
        // console.log(piecesToAdd);
        for (var i in piecesToAdd)
            for (var j in piecesToAdd[i]) {
                var piece = this.hexgrid.getUnit(piecesToAdd[i][j]);
                if (this.hexgrid.scenario.revealtype) {
                    this.sendMsg(this.players[1-i], "1 add {0} {1} {2} {3} {4} {5}".format([piece.player, piece.team, piece.type, piece.x, piece.y, piece.cooldown]));
                } else {
                    this.sendMsg(this.players[1-i], "1 add {0} {1} {2} {3} {4} {5}".format([piece.player, piece.team, 5, piece.x, piece.y, piece.cooldown]));
                }
            }
    }

	game_core_server.prototype.startGame = function(){
	
		this.started = true;
		console.log(":: " + this.id.substring(0,8) + " :: Initializing game...");
		for (var i in this.players) {
			this.sendMsg(this.players[i], "0 init " + this.scenario + " " + i + " " + i + " " + this.type);  // TODO: 1v1 only!
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
		this.hexgrid = new BuildMap(this.scenario);
		
		// initialize terrain
		var terrain = this.hexgrid.scenario.terrain;
		for (var i = 0; i < terrain.length; i++)
			for (var j = 0; j < terrain[i].length; j++) {
				switch (terrain[i][j]) {
				case "thron":
					this.hexgrid.addTerrain(CONSTANTS.thronTerrain, new helper.Coordinate(i, j));
					break;
				case "flag":
					this.hexgrid.addTerrain(CONSTANTS.flagTerrain, new helper.Coordinate(i, j));
					break;
                case "resource":
					this.hexgrid.addTerrain(CONSTANTS.resourceTerrain, new helper.Coordinate(i, j));
					break;
				}
			}
		
		// initialize resources
		var resource = this.hexgrid.scenario.resource;
		if (resource) {
			for (var i = 0; i < this.players.length; i++) {
                this.resources[i] = resource[i];
                this.sendMsg(this.players[i], "1 resource " + resource[i]);
            }
		}
			
		// 2 players
		for (i = 0; i < 2; i++) {
			var types = this.hexgrid.scenario.startunits[i];
			shuffle(types);
			var sp = this.hexgrid.scenario.startpoint[i];
			for (var j = 0; j < types.length; j++) {
				var u = new Unit(i, i, 4, types[j], new helper.Coordinate(sp[j][0], sp[j][1]));
				pieces.push(u);
				this.hexgrid.addUnit(u, new helper.Coordinate(sp[j][0], sp[j][1]));
			}
			this.units.push(types.length);
		}
		
		var k = 0;
		for (var i in this.players) {
			this.players[i].player = k;
			this.players[i].team = k++;
			for (var j in pieces) {
				if (this.players[i].team == pieces[j].team)
					this.sendMsg(this.players[i], "1 add {0} {1} {2} {3} {4} {5}".format([pieces[j].player, pieces[j].team, pieces[j].type, pieces[j].x, pieces[j].y, 0]));
            }
		}
        this.updateVisible();
		
		console.log(":: " + this.id.substring(0,8) + " :: Game started!");
		k = -1;
		for (var i in this.players) {
			k += this.hexgrid.scenario.startunits[parseInt(i)].length;
			this.sendMsg(this.players[i], "0 start {0} {1}".format([pieces[k].x, pieces[k].y]));
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
        // clear all intervals in terrains
        for(var x in this.hexgrid.matrix){ // brute force!
			for(var y in this.hexgrid.matrix[x]){
				if(this.hexgrid.matrix[x][y].interval){
                    window.clearInterval(this.hexgrid.matrix[x][y].interval);
                }
            }
        }
        // stop clients
		for (var i in this.players) {
			this.sendMsg(this.players[i], "0 end " + winningTeam);
			this.players[i].game = null;
		}
	};