/**
 * Setup Socket.IO message handler on the server.
 */

//Export MessageHanler
module.exports = MessageHandler;
	
/**
 * Message Handler set up.
 * The message handler listens to messages from the client.
 */
var MessageHandler = function(/*ExpressServer*/ ){

        
        //Create a socket.io instance using our express server
    
	
	var sio = io.listen(app);

        //Configure the socket.io connection settings.
        //See http://socket.io/
    sio.configure(function (){

        sio.set('log level', 0);

        sio.set('authorization', function (handshakeData, callback) {
          callback(null, true); // error first callback style
        });

    });

        //Enter the game server code. The game server handles
        //client connections looking for a game, creating games,
        //leaving games, joining games and ending games when they leave.
    gameServer = require('./server/game.server.js');

        //Socket.io will call this function when a client connects,
        //So we can send that client looking for a game to play,
        //as well as give that client a unique ID to use so we can
        //maintain the list if players.
    sio.sockets.on('connection', function (client) {
        
            //Generate a new UUID, looks something like
            //5b2ca132-64bd-4513-99da-90e838ca47d1
            //and store this on their socket/connection
        client.userid = UUID();

            //tell the player they connected, giving them their id
        client.emit('onconnected', { id: client.userid } );


            //Useful to know when someone connects
        console.log(':: socket.io :: player ' + client.userid.substring(0,8) + ' connected');

            //Now we want to handle some of the messages that clients will send.
            //They send messages here, and we send them to the gameServer to handle.
        client.on('message', function(m) {
            gameServer.onMessage(client, m);

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
			
                //player leaving a game should tell the gameServer
            gameServer.onDisconnect(client);

        }); //client.on disconnect
     
    }); //sio.sockets.on connection
};