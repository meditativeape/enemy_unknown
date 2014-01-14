/**
 * Main file to run on server.
 * Starts express server to serve files to client.
 * Starts message handler 
 */

/**
 * Server side we import dependences.
 */
var io = require('socket.io');
var express = require('express');
var UUID = require('node-uuid');
//Import message handler setup.
var MessageHandler  = require('./server/messageHandler.server.js');

/**
 * Set up and Message Handler. 
 */
var Setup = function(){
	//The express server handles passing our content to the browser.
	// Set the gameport for express server.
	var gameport = process.env.PORT || 4004;	
	//Create the express server.
	var expressServer = this.express.createServer();
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
        //Send the requesting client the homepage.
        res.sendfile( __dirname + '/index.html' );
    }); 
	
	//Express and socket.io can work together to serve the socket.io client files for you.
	//This way, when the client requests '/socket.io/' files, socket.io determines what the client needs.
	MessageHandler(expressServer);
};

//Start express server and message handler setup.
Setup();



