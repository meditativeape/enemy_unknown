/**
 * Lobby for matchmaking.
 * Setups message handler, handles matchmaking, relays messages to correct game instance.
 */

// Import GameServer
var GameServer = require('./game.server.js');

// Import socket io and UUID
var io = require('socket.io');
var UUID = require('node-uuid');

/**
 * Set up LobbyServer.
 */
var LobbyServer = function(){
	// List to store game instances
	this.games = [];
	//Number of game instances
	this.game_count = 0;
	//List of players in lobby
	this.inMenu = [];
	//Number of players in lobby
	this.inMenu_count = 0;
	
	//Since we are sharing code with the browser, we
    //are going to include some values to handle that.
    global.window = global.document = global;

	
}

/**
 *A wrapper for logging.
 */
LobbyServer.prototype.log = function() {
	console.log.apply(this,arguments);
}

/**
 * Message Handler set up.
 * The message handler listens to messages from the client.
 */
LobbyServer.prototype.messageHandler = function(/*ExpressServer*/ expressServer){
	//Create a socket.io instance using our express server
	var sio = io.listen(expressServer);
	//Configure the socket.io connection settings.
	//See http://socket.io/
	sio.configure(function (){
		sio.set('log level', 0);
		sio.set('authorization', function (handshakeData, callback) {
		  callback(null, true); // error first callback style
		});
	});
	//Socket.io will call this function when a client connects
	//Assign each client a unique ID to use so we can maintain the list of players.
    var me = this;
	sio.sockets.on('connection', function (client) {    
		//Generate a new UUID, looks something like
		//5b2ca132-64bd-4513-99da-90e838ca47d1
		//and store this on their socket/connection
		client.userid = UUID();
		//Tell the player they connected, giving them their id to store on their socket/connection.
		client.emit('onconnected', { id: client.userid } );
		//Log player connections
		console.log(':: socket.io :: player ' + client.userid.substring(0,8) + ' connected');
		//Send messages to the lobby to handle
		client.on('message', function(m) {
			me.onMessage(client, m);
		}); 
		//Let lobby handle player disconnection
		client.on('disconnect', function () {    
			me.onDisconnect(client);
		}); 
	}); 
};

/**
 * Handle messages from the client
 */
LobbyServer.prototype.onMessage = function(client,message) {
	//If client isn't in a game, the lobby handles the message
	if(client && !client.game){
		this.handleMessage(client, message);
	}
	//If client is in a game, we relay the message to the game instance it is in.
	else if (client && client.game) {
    	client.game.handleMessage(client, message);
    }
};

//Handles client disconection
LobbyServer.prototype.onDisconnect = function(client) {		
	//If player is in game.
	if(client.game) {
		//Log event
		console.log(':: socket.io:: client ' + client.userid.substring(0,8) + ' disconnected from game '
				+ client.game.id.substring(0, 8));
		//Tell game instance that player has left game.
		client.game.leaveGame(client);
	}
	//If player is not in game
	else{
		console.log(':: socket.io :: client ' + client.userid.substring(0,8) + ' disconnected');
	}
	//TODO Lobby
};

/**
 * Handle message from client.
 */
LobbyServer.prototype.handleMessage = function(client,message){
	console.log(":: server :: received a message: " + message);
		var keywords = message.split(" ");
		if(parseInt(keywords[0])==0){
			if(keywords[1] == "join"){
				this.findGame(client,parseInt(keywords[2]),keywords[3]);
			}
			if(keywords[1] == "menu"){
				this.inMenu[this.inMenu_count] = client;
				this.inMenu_count++;
				client.send('0 menuReset');
				for(var gameid in this.games) {
					client.send('0 menu ' + this.games[gameid].scenario);
				}				
			}
			//Error handling?
		}
}

/**
 * Find a game for player to join.
 */
LobbyServer.prototype.findGame = function(player,type,scenario) {
//	for(var playerNum in this.inMenu){
//		if(this.inMenu[playerNum] == player){
//			this.inMenu.splice(playerNum, playerNum+1);
//			this.game_count--;
//		}
//	}
	var needed;
	 if(type == 0){
		 needed = 2;
	 }
	 if(type == 1){
		 needed = 3;
	 }
	 if(type == 2){
		 needed = 4;
	 }
	 if(type == 3){
		 needed = 4;
	 }
	 
	this.log(':: server :: Looking for a game. Number of games: ' + this.game_count);

		//so there are games active,
		//lets see if one needs another player
	if(this.game_count) {
			
		var joined_a_game = false;

			//Check the list of games for an open game
		for(var gameid in this.games) {
	
				//get the game we are checking against
			var game_instance = this.games[gameid];
			if(game_instance.type != type ||game_instance.scenario != scenario) continue;
		
				//If the game is a player short
			var player_count = game_instance.players.length;
			if(player_count < needed) {
				this.log(':: server :: found a game....');
					//someone wants us to join!
				joined_a_game = true;
					//increase the player count and store
					//the player as the client of this game
				game_instance.players[player_count] = player;
				player.game = game_instance;
				for (var i in game_instance.players)
					game_instance.players[i].send('0 join ' + player_count + ' ' +player.userid);
					//start running the game on the server,
					//which will tell them to respawn/start
				if (player_count+1 == needed){
					this.log(':: server :: Starting game....');
					game_instance.startGame();
					this.games.splice(gameid, gameid+1);
					this.game_count--;
				}
				break;
			} //if less than 2 players
		} //for all games

			//now if we didn't join a game,
			//we must create one
		if(!joined_a_game) {

			this.createGame(player, type,scenario);

		} //if no join already

	} else { //if there are any games at all

			//no games? create one!
		this.createGame(player,type,scenario);
	}
	for(var playerNum in this.inMenu){
		this.inMenu[playerNum].send('0 menuReset');
		for(var gameid in this.games) {
			this.inMenu[playerNum].send('0 menu ' + this.games[gameid].scenario);
		}
	}
};    

// Define some required functions
LobbyServer.prototype.createGame = function(player, type,scenario) {
	// Create a new game instance
	var theGame = new GameServer([player], UUID(), type, scenario);
	
	// Store it in the list of game
	this.games.push(theGame);

	// Keep track of #games
	this.game_count++;

	// Tell the player that he joins the game
	player.send('0 join 1 ' + player.userid);
	player.game = theGame;
	
	//Log the event
	this.log(':: server :: Player ' + player.userid.substring(0,8) + ' created a game with id '
	+ player.game.id.substring(0,8));

	// return it
	return theGame;
}; 

//Export Lobby
module.exports = LobbyServer;
