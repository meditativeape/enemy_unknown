/**
 * Client game lobby code.
 */

var LobbyClient = new function(){
	this.mainSocket = null;
	this.newSocket();
	
}

/**
 * Create a new socket io connection and register methods.
 */
LobbyClient.prototype.newSocket = function (){
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
 * Tell server client wishes to join a particular game.
 */
LobbyClient.prototype.joinGame = function(/*string*/ scenarioName, /*int*/ type){  
	this.mainSocket.send('0 join '+ type + ' '+ scenarioName);
};


LobbyClient.prototype.connecting = function(data){
	//TODO
};

LobbyClient.prototype.ondisconnect = function(data){ 
	//TODO
};

LobbysClient.prototype.onconnected = function(data){
	//TODO
};