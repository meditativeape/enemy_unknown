/**
 * Client game lobby code.
 */

/**
 * Setup client lobby.
 */
var LobbyClient = function(/*Menu*/ menu){
	this.mainSocket = null;
}

/**
 * Create a new socket io connection and register methods.
 */
LobbyClient.prototype.newSocket = function (){
	//Reference to the GameClient instance of the current game player is in.
	this.game = null;
	//Set up socket io connection.
	//Store a local reference to our connection to the server
	this.mainSocket = io.connect();
	//When we connect, we are not 'connected' until we have a server id
	//and are placed in a game by the server. The server sends us a message for that.
	this.mainSocket.on('connect', this.connecting.bind(this));
	//Sent when we are disconnected (network, server down, etc)
	this.mainSocket.on('disconnect', this.onDisconnect.bind(this));
	//Handle when we connect to the server, showing state and storing id's.
	this.mainSocket.on('onconnected', this.onConnected.bind(this));
	//On message from the server, we parse the commands and send it to the handlers
	this.mainSocket.on('message', this.onMessage.bind(this));
}

/**
 * Handle messages sent from the server.
 */ 
LobbyClient.prototype.onMessage = function(message){
	//If client is in a game, let game instance handle the message
	if(this.game){
		this.game.handleMessage(message);
	}
	//If client is in the lobby, the lobby handles the message
	else{
		this.handleMessage(message);
	}
} 

/**
 * When the client is connecting to the server.
 */
LobbyClient.prototype.connecting = function(message){
	//TODO
};

/**
 * When the client is disconnected from the server.
 */
LobbyClient.prototype.onDisconnect = function(message){ 
	//TODO
};

/**
 * When the client is connected to the server
 */
LobbyClient.prototype.onConnected = function(message){
	//TODO
};

LobbyClient.prototype.handleMessage = function(message){
}


/**
 * Tell server client wishes to join a particular game.
 */
LobbyClient.prototype.joinGame = function(/*string*/ scenarioName, /*int*/ type){
	this.game = new GameClient();  
	this.mainSocket.send('0 join '+ type + ' '+ scenarioName);
};

LobbyClient.prototype.update = function(){
	this.mainSocket.send('0 menu');
}


