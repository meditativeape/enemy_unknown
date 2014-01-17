/**
 * Main file to run on server.
 * Starts express server to serve files to client.
 * Sets up game lobby.
 */

//Import express server
var express = require('express');
//Import lobby setup.
var LobbyServer  = require('./server/lobby.server.js');

/**
 * Set up express server and lobby.. 
 */
var Setup = function(){
	//The express server handles passing our content to the browser.
	// Set the gameport for express server.
	var gameport = process.env.PORT || 4004;	
	//Create the express server.
	var expressServer = express.createServer();
	//Tell the server to listen for incoming connections
    expressServer.listen( gameport );
    //Something so we know that it succeeded.
    console.log(':: Express :: Listening on port ' + gameport );
	//All requests are redirected to the homepage.
    //By default, we forward the / path to index.html automatically.
    expressServer.get( '/', function( req, res ){
		//Send the requesting client the homepage.
        res.sendfile( __dirname + '/index.html' );
    });
    //This handler will listen for requests on /*, any file from the root of our server.
    expressServer.get( '/*' , function( req, res, next ) {
        //This is the current file they have requested
        var file = req.params[0];    
        //Send the requesting client the file.
        res.sendfile( __dirname + '/' + file );
    }); 
	//Set up lobby server and socket io message handler.
	var lobbyServer = new LobbyServer();
	lobbyServer.messageHandler(expressServer);
};

//Start express server and lobby setup.
Setup();



