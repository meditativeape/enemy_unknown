/*
	Server-side code.
*/

var helper = require('./helper.js');
var BuildMap = require('./hexgrid.js');
var Unit = require('./unit.js');

/* The game_core_server class */

    var game_core_server = module.exports = function(playerList, gameid, type, server){

        // Store the players
        this.players = playerList;
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

    };
	
	game_core_server.prototype.canMove = function(coord1, coord2, player){
		
		var unit = this.hexgrid.getUnit(coord1);
		if (unit.team == player.team && !this.hexgrid.getUnit(coord2)){ // coord1 has player's unit and coord2 is empty
			if (this.hexgrid.hexDist(this.hexgrid.matrix[coord1.X][coord1.Y], this.hexgrid.matrix[coord2.X][coord2.Y]) <= unit.range)
				return true;
		}
		
		return false;
		
	};
	
	game_core_server.prototype.makeMove = function(coord1, coord2){
		this.hexgrid.move(coord1, coord2);
	};
	
	game_core_server.prototype.canAttack = function(coord1, coord2, player){
	
		var myUnit = this.hexgrid.getUnit(coord1);
		var theirUnit = this.hexgrid.getUnit(coord2)
		if (myUnit.team == player.team && theirUnit && theirUnit.team != player.team)
			if (this.hexgrid.hexDist(this.hexgrid.matrix[coord1.X][coord1.Y], this.hexgrid.matrix[coord2.X][coord2.Y]) == 1)
				return true;
		return false;
	
	};
	
	game_core_server.prototype.makeAttack = function(coord1, coord2){
		var responses = [];
		var unit1 = this.hexgrid.getUnit(coord1);
		var unit2 = this.hexgrid.getUnit(coord2);
		this.hexgrid.attack(coord1, coord2);
		responses.push(["1", "attack", coord1.X, coord1.Y, unit1.hp, coord2.X, coord2.Y, unit2.hp].join(" "));
		if (unit1.hp <= 0)  // unit 1 dies
			responses.push(["1", "die", coord1.X, coord1.Y, unit1.type].join(" "));
		if (unit2.hp <= 0)  // unit 2 dies
			responses.push(["1", "die", coord2.X, coord2.Y, unit2.type].join(" "));
		return responses;
	};

	game_core_server.prototype.handleClientInput = function(client, message){
		
		var keywords = message.split(" ");
		var msgType = parseInt(keywords[0]);
		console.log("received a message: " + message);
		
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
				var xcoord1 = parseInt(keywords[2]);
				var ycoord1 = parseInt(keywords[3]);
				var xcoord2 = parseInt(keywords[4]);
				var ycoord2 = parseInt(keywords[5]);
				var coord1 = new helper.Coordinate(xcoord1, ycoord1);
				var coord2 = new helper.Coordinate(xcoord2, ycoord2);
				if (this.canMove(coord1, coord2, client)) {
					this.makeMove(coord1, coord2);  // move in our local game
					for (var i in this.players) {  // tell each player the result of move
						this.sendMsg(this.players[i], message);
					}
				}
				break;
			case "attack":
				var xcoord1 = parseInt(keywords[2]);
				var ycoord1 = parseInt(keywords[3]);
				var xcoord2 = parseInt(keywords[4]);
				var ycoord2 = parseInt(keywords[5]);
				var coord1 = new helper.Coordinate(xcoord1, ycoord1);
				var coord2 = new helper.Coordinate(xcoord2, ycoord2);
				if (this.canAttack(coord1, coord2, client)) {
					var responses = this.makeAttack(coord1, coord2);  // attack in our local game and get results
					for (var i in this.players) {  // tell each player the result of attack
						for (var j in responses)
							this.sendMsg(this.players[i], responses[j]);
					}
				}
				break;
			case "endturn":
				// TODO
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
	
	game_core_server.prototype.sendMsg = function(recipient, message){
		console.log("send message: " + message);
		recipient.send(message);
	};

	game_core_server.prototype.startGame = function(){
		this.started = true;
		
		console.log("game started!");
		// hardcoded game instance for test!
		this.hexgrid = new BuildMap(40,2.0,1500,1200,40);
		this.hexgrid.matrix[0][0].piece = new Unit(0, 0, 1, 0, new helper.Coordinate(0, 0), 0, null);
		this.hexgrid.matrix[0][2].piece = new Unit(0, 0, 1, 0, new helper.Coordinate(0, 2), 0, null);
		this.hexgrid.matrix[2][0].piece = new Unit(1, 1, 1, 0, new helper.Coordinate(2, 0), 0, null);
		this.hexgrid.matrix[2][2].piece = new Unit(1, 1, 1, 0, new helper.Coordinate(2, 2), 0, null);
		this.players[0].team = 0;
		this.players[1].team = 1;
		
		for (var i in this.players) {
			this.sendMsg(this.players[i], "0 start 0 " + i);
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
		// if this game has no more than one player, end it
		if (this.players.length == 1) {
			this.sendMsg(this.players[0], "0 end " + this.players[0].userid);
			this.players[0].game = null;
		}
		if (this.players.length <= 1)
			this.server.endGame();
	};