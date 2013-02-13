/*
	Server-side code.
*/

var helper = require('./helper.js');
var BuildMap = require('./hexgrid.js');
var Unit = require('./unit.js');

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
		if (unit && unit.team == player.team && !this.hexgrid.getUnit(coord2)){ // coord1 has player's unit and coord2 is empty
			if (this.hexgrid.hexDist(this.hexgrid.matrix[coord1.X][coord1.Y], this.hexgrid.matrix[coord2.X][coord2.Y]) <= unit.range)
				return true;
		}
		
		return false;
		
	};
	
	game_core_server.prototype.makeMove = function(coord1, coord2){
		this.hexgrid.move(coord1, coord2);
	};
	
	game_core_server.prototype.canAttack = function(coord1, coord2, coord3, player){
	
		if (((coord1.X != coord2.X) || (coord1.Y != coord2.Y)) && !this.canMove(coord1, coord2, player))
			return false;
		var myUnit = this.hexgrid.getUnit(coord1);
		var theirUnit = this.hexgrid.getUnit(coord3);
		if (myUnit.team == player.team && theirUnit && theirUnit.team != player.team)
			if (this.hexgrid.hexDist(this.hexgrid.matrix[coord2.X][coord2.Y], this.hexgrid.matrix[coord3.X][coord3.Y]) == 1)
				return true;
		return false;
	
	};
	
	game_core_server.prototype.makeAttack = function(coord1, coord2, coord3){
	
		var responses = [];
		if ((coord1.X != coord2.X) || (coord1.Y != coord2.Y))
			this.makeMove(coord1, coord2);
		var unit1 = this.hexgrid.getUnit(coord2);
		var unit2 = this.hexgrid.getUnit(coord3);
		this.hexgrid.attack(coord2, coord3);
		responses.push(["1", "attack", coord1.X, coord1.Y, coord2.X, coord2.Y, unit1.hp, coord3.X, coord3.Y, unit2.hp].join(" "));
		if (unit1.hp <= 0)  // unit 1 dies
			responses.push(["1", "die", coord2.X, coord2.Y, unit1.type].join(" "));
		if (unit2.hp <= 0)  // unit 2 dies
			responses.push(["1", "die", coord3.X, coord3.Y, unit2.type].join(" "));
		return responses;
		
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
					this.hexgrid.getUnit(coord2).setcd(3);
					for (var i in this.players) {  // tell each player the result of move
						this.sendMsg(this.players[i], message);
					}
				}
				break;
			case "attack":
				var myCoord = new helper.Coordinate(parseInt(keywords[2]), parseInt(keywords[3]));
				var destCoord = new helper.Coordinate(parseInt(keywords[4]), parseInt(keywords[5]));
				var oppoCoord = new helper.Coordinate(parseInt(keywords[6]), parseInt(keywords[7]));
				if (this.canAttack(myCoord, destCoord, oppoCoord, client)) {
					var responses = this.makeAttack(myCoord, destCoord, oppoCoord);  // attack in our local game and get results
					var unit = this.hexgrid.getUnit(destCoord);
					if (unit)
						unit.setcd(3);
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
		console.log(":: " + this.id.substring(0,8) + " :: send message: " + message);
		recipient.send(message);
	};

	game_core_server.prototype.startGame = function(){
	
		this.started = true;
		console.log(":: " + this.id.substring(0,8) + " :: Initializing game...");
		for (var i in this.players) {
			this.sendMsg(this.players[i], "0 init 0 " + i);
		}
		
		// helper function to get a random type
		var randomType = function() {
			if (Math.random() <= 0.5)
				return 1;
			else
				return 3;
		};
		
		// hardcoded game instance for test!
		var pieces = [];
		this.hexgrid = new BuildMap(40,2.0,1500,1200,40);
		// 2 players
		pieces.push(this.hexgrid.matrix[0][1].piece = new Unit(0, 0, 1, randomType(), new helper.Coordinate(0, 1), 0, null));
		pieces.push(this.hexgrid.matrix[1][0].piece = new Unit(0, 0, 1, randomType(), new helper.Coordinate(1, 0), 0, null));
		pieces.push(this.hexgrid.matrix[4][5].piece = new Unit(1, 1, 1, randomType(), new helper.Coordinate(4, 5), 0, null));
		pieces.push(this.hexgrid.matrix[5][4].piece = new Unit(1, 1, 1, randomType(), new helper.Coordinate(5, 4), 0, null));
		// 3 players
		if (this.type == 1) {
			pieces.push(this.hexgrid.matrix[0][5].piece = new Unit(2, 2, 1, randomType(), new helper.Coordinate(0, 5), 0, null));
			pieces.push(this.hexgrid.matrix[1][4].piece = new Unit(2, 2, 1, randomType(), new helper.Coordinate(1, 4), 0, null));
		}
		// 4 players
		if (this.type == 2) {
			pieces.push(this.hexgrid.matrix[5][1].piece = new Unit(3, 3, 1, randomType(), new helper.Coordinate(5, 1), 0, null));
			pieces.push(this.hexgrid.matrix[6][0].piece = new Unit(3, 3, 1, randomType(), new helper.Coordinate(6, 0), 0, null));
		}
		
		// do not work for 2v2 yet
		var k = 0;
		for (var i in this.players) {
			this.players[i].team = k++;
			for (var j in pieces) {
				if (this.players[i].team == pieces[j].team)
					this.sendMsg(this.players[i], "1 add {0} {1} {2} {3} {4}".format([pieces[j].player, pieces[j].team, pieces[j].type, pieces[j].x, pieces[j].y]));
				else
					this.sendMsg(this.players[i], "1 add {0} {1} {2} {3} {4}".format([pieces[j].player, pieces[j].team, 5, pieces[j].x, pieces[j].y]));
			}
		}
		
		console.log(":: " + this.id.substring(0,8) + " :: Game started!");
		for (var i in this.players) {
			this.sendMsg(this.players[i], "0 start {0} {1}".format([pieces[2*i].x, pieces[2*i].y]));
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
			this.sendMsg(this.players[0], "0 end " + this.players[0].userid);
			this.players[0].game = null;
		}
		if (this.players.length <= 1)
			this.server.endGame(this.id);
	};