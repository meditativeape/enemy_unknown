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
	// List to store open game instances
	this.games = [];
	//Number of game instances
	this.openGames = 0;

	
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
	
}

/**
 * Find a game for player to join.
 */
LobbyServer.prototype.findGame = function(player, type) {
	//If open game available join game
	if(openGames>0){
		for(var openGame in this.games){
			
		}
	}
	//Else create game
	else{
		this.createGame(player,type);
	}
	
};    

// Define some required functions
LobbyServer.prototype.createGame = function(player, type) {
	// Create a new game instance
	var theGame = new GameServer();
	
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
