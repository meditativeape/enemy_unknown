/*  Copyright (c) 2012 Sven "FuzzYspo0N" Bergström
    
    written by : http://underscorediscovery.com
    written for : http://buildnewgames.com/real-time-multiplayer/
    
    MIT Licensed.

    Usage : node app.js
*/

    var
        gameport        = process.env.PORT || 4004,	        		   
		app       = require('express.io')(),
        UUID            = require('node-uuid'),

        verbose         = false;

/* Express server set up. */

//The express server handles passing our content to the browser,
//As well as routing users where they need to go. This example is bare bones
//and will serve any file the user requests from the root of your web server (where you launch the script from)
//so keep this in mind - this is not a production script but a development teaching tool.

        //Tell the server to listen for incoming connections
	app.http().io();
    app.listen( gameport );

        // something so we know that it succeeded.
    console.log(':: Express :: Listening on port ' + gameport );

        //By default, we forward the / path to index.html automatically.
    app.get( '/', function( req, res ){
        res.sendfile( __dirname + '/index.html' );
    });


        //This handler will listen for requests on /*, any file from the root of our server.
        //See expressjs documentation for more info on routing.

    app.get( '/*' , function( req, res, next ) {

            //This is the current file they have requested
        var file = req.params[0];

            //For debugging, we can track what files are requested.
        if(verbose) console.log(':: Express :: file requested : ' + file);

            //Send the requesting client the file.
        res.sendfile( __dirname + '/' + file );

    }); //app.get *


/* Socket.IO server set up. */

//Express and socket.io can work together to serve the socket.io client files for you.
//This way, when the client requests '/socket.io/' files, socket.io determines what the client needs.

        //Configure the socket.io connection settings.
        //See http://socket.io/
    app.io.configure(function (){

        app.io.set('log level', 0);

        app.io.set('authorization', function (handshakeData, callback) {
          callback(null, true); // error first callback style
        });

    });
 
        //Enter the game server code. The game server handles
        //client connections looking for a game, creating games,
        //leaving games, joining games and ending games when they leave.
    game_server = require('./game.server.js');

        //Socket.io will call this function when a client connects,
        //So we can send that client looking for a game to play,
        //as well as give that client a unique ID to use so we can
        //maintain the list if players.
    app.io.sockets.on('connection', function (client) {
        
            //Generate a new UUID, looks something like
            //5b2ca132-64bd-4513-99da-90e838ca47d1
            //and store this on their socket/connection
        client.userid = UUID();

            //tell the player they connected, giving them their id
        client.emit('onconnected', { id: client.userid } );


            //Useful to know when someone connects
        console.log(':: socket.io :: player ' + client.userid.substring(0,8) + ' connected');

            //Now we want to handle some of the messages that clients will send.
            //They send messages here, and we send them to the game_server to handle.
        client.on('message', function(m) {
            game_server.onMessage(client, m);

        }); //client.on message

            //When this client disconnects, we want to tell the game server
            //about that as well, so it can remove them from the game they are
            //in, and make sure the other player knows that they left and so on.
        client.on('disconnect', function () {

                //Useful to know when someone disconnects
			if (client.game)
				console.log(':: socket.io:: client ' + client.userid.substring(0,8) + ' disconnected from game '
				+ client.game.id.substring(0, 8));
			else
				console.log(':: socket.io :: client ' + client.userid.substring(0,8) + ' disconnected');
			
                //player leaving a game should tell the game_server
            game_server.onDisconnect(client);

        }); //client.on disconnect
     
    }); //sio.sockets.on connection
