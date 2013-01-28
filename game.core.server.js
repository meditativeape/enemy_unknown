/*
	Server-side code.
*/

/* The game_core_server class */

    var game_core_server = function(game_instance, type, server){

        // Store the instance, if any
        this.instance = game_instance;
		// Store the type of the game. One of 0, 1, 2, 3.
		this.type = type;
        // gameserver
        this.server = server;
		// Game has not started yet
		this.started = false;
		// Our local game
		this.hexgrid = null;

    };
	
	game_core_server.canMove = function(coord1, coord2, player){
		
		var unit = this.hexgrid.getUnit(coord1);
		if (unit.teamID == player.teamID && !this.map.getUnit(coord2)){ // coord1 has player's unit and coord2 is empty
			if (this.hexgrid.hexDist(this.hexgrid.matrix[coord1.X][coord1.Y], this.hexgrid.matrix[coord2.X][coord2.Y]) <= unit.range)
				return true;
		}
		
		return false;
		
	};
	
	game_core_server.makeMove = function(coord1, coord2){
		this.hexgrid.move(coord1, coord2);
	};
	
	game_core_server.canAttack = function(coord1, coord2, player){
	
		var myUnit = this.hexgrid.getUnit(coord1);
		var theirUnit = this.hexgrid.getUnit(coord2)
		if (myUnit.teamID == player.teamID && theirUnit && theirUnit.teamID != player.teamID)
			if (this.hexgrid.hexDist(this.hexgrid.matrix[coord1.X][coord1.Y], this.hexgrid.matrix[coord2.X][coord2.Y]) == 1)
				return true;
		return false;
	
	};
	
	game_core_server.makeAttack = function(coord1, coord2){
		this.hexgrid.attack(coord1, coord2);
		var responses = [];
		var unit1 = this.hexgrid.getUnit(coord1);
		var unit2 = this.hexgrid.getUnit(coord2);
		responses.push(["attack", coord1.X, coord1.Y, unit1.hp, coord2.X, coord2.Y, unit2.hp].join(" "));
		if (unit1.hp == 0)  // unit 1 dies
			responses.push(["die", coord1.X, coord1.Y, unit1.type].join(" "));
		if (unit2.hp == 0)  // unit 2 dies
			responses.push(["die", coord2.X, coord2.Y, unit2.type].join(" "));
		return responses;
	};

	game_core_server.handleClientInput = function(client, message){
		
		var keywords = message.split(" ");
		var msgType = parseInt(keywords[0]);
		
		switch (msgType) {
		
		case 0:  // game control messages
			switch (keywords[1]) {
			case "join":  // a client joins the game
				if (!this.started) {
					this.instance.players.push(client);
					if ((this.instance.players.length == 2 && this.type == 0)
						|| (this.instance.players.length == 3 && this.type == 1)
						|| (this.instance.players.length == 4 && this.type == 2)
						|| (this.instance.players.length == 4 && this.type == 3)) {
						this.startGame();  // enough players; start game
					} else {
						for (var i in this.instance.players) {  // tell each player that someone joins
							this.instance.players[i].send("0 join " + this.instance.players.length + " " + client.userid);
						}	
					}
				} else {
					// TODO: report error
				}
				break;
			case "leave":
				for (var i in this.instance.players) {
					if (this.instance.players[i].userid == client.userid) {
						this.instance.players.splice(i, i+1);
						for (var i in this.instance.players) {  // tell each player that someone leaves
							this.instance.players[i].send("0 leave " + this.instance.players.length + " " + client.userid);
						}
						break;
					}
				}
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
				if (this.canMove(client, new Coordinate(xcoord1, ycoord1), new Coordinate(xcoord2, ycoord2))) {
					this.makeMove();  // move in our local game
					for (var i in this.instance.players) {  // tell each player the result of move
						this.instance.players[i].send(message);
					}
				}
				break;
			case "attack":
				var xcoord1 = parseInt(keywords[2]);
				var ycoord1 = parseInt(keywords[3]);
				var xcoord2 = parseInt(keywords[4]);
				var ycoord2 = parseInt(keywords[5]);
				if (this.canAttack(client, new Coordinate(xcoord1, ycoord1), new Coordinate(xcoord2, ycoord2))) {
					var responses = this.makeAttack();  // attack in our local game and get results
					for (var i in this.instance.players) {  // tell each player the result of attack
						for (var j in responses)
							this.instance.players[i].send(responses[j]);
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

	game_core_server.startGame = function(){
		this.started = true;
		
		// hardcoded game instance for test!
		this.hexgrid = new BuildMap(40,2.0,1500,1200,40);
		this.hexgrid.matrix[0][0].piece = new Unit(0, 0, 1, 0, new Coordinate(0, 0), 0, null);
		this.hexgrid.matrix[1][1].piece = new Unit(0, 0, 1, 0, new Coordinate(1, 1), 0, null);
		this.hexgrid.matrix[10][10].piece = new Unit(1, 1, 1, 0, new Coordinate(10, 10), 0, null);
		this.hexgrid.matrix[11][11].piece = new Unit(1, 1, 1, 0, new Coordinate(11, 11), 0, null);
		
		for (var i in this.instance.players) {
			this.instance.players[i].send("0 start 0 " + i);
		}
	};
