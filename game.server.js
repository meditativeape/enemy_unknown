/*  Copyright (c) 2012 Sven "FuzzYspo0N" Bergström
    
    written by : http://underscorediscovery.com
    written for : http://buildnewgames.com/real-time-multiplayer/
    
    MIT Licensed.
*/

    var
        game_server = module.exports = { games : {}, game_count:0 },
        UUID        = require('node-uuid'),
        verbose     = true;

        //Since we are sharing code with the browser, we
        //are going to include some values to handle that.
    global.window = global.document = global;

        //Import shared game library code.
    require('./game.core.js');

        //A simple wrapper for logging so we can toggle it,
        //and augment it for clarity.
    game_server.log = function() {
        if(verbose) console.log.apply(this,arguments);
    }


    //Relay messages from the client
    game_server.onMessage = function(client,message) {
		   //the client should be in a game, so
            //we can tell that game to handle the input
		if(client && client.game && client.game.gamecore) {
            client.game.gamecore.handle_server_input(client, message);
        }
		
    }; //game_server.onMessage


        //Define some required functions
    game_server.createGame = function(player,type) {

            //Create a new game instance
		var thegame = new Object();
		thegame.id = UUID(); //generate a new id for the game
		thegame.players = new Array(); 
		thegame.players[0] = player;//so we know who initiated the game
		            //Create a new game core instance, this actually runs the
            //game code like collisions and such.
		thegame.type = type;
        thegame.gamecore = new game_core( thegame,type,this );
		
            //Store it in the list of game
        this.games[ thegame.id ] = thegame;

            //Keep track
        this.game_count++;

            //tell the player that they are now the host
            //s=server message, h=you are hosting

        player.send('0 join 1 '+ player.userid);
        console.log('server host at  ' + thegame.gamecore.local_time);
        player.game = thegame;
        
        this.log('player ' + player.userid + ' created a game with id ' + player.game.id);

            //return it
        return thegame;

    }; //game_server.createGame
	
	
	game_server.endGame = function(gameid){
		for (person in this.games[gameid].players){
			person.game = null;
		}
        delete this.games[gameid];
        this.game_count--;
        this.log('game removed. there are now ' + this.game_count + ' games' );
	}//game_server.endGame 
	
	
        //we are requesting to leave a game
    game_server.leaveGame = function(gameid, userid) {

        var thegame = this.games[gameid];

        if(thegame) {
			thegame.left(userid);
			userid.game = null;
        } else {
            this.log('that game was not found!');
        }

    }; //game_server.leaveGame

    game_server.findGame = function(player,type) {


		if(type = 0){
			needed = 2;
		}
        this.log('looking for a game. We have : ' + this.game_count);

            //so there are games active,
            //lets see if one needs another player
        if(this.game_count) {
                
            var joined_a_game = false;

                //Check the list of games for an open game
            for(var gameid in this.games) {
                    //only care about our own properties.
                if(!this.games.hasOwnProperty(gameid)) continue;
		
                    //get the game we are checking against
                var game_instance = this.games[gameid];
				if(game_instance.type != type) continue;
			
                    //If the game is a player short
				var player_count = game_instance.players.length;
                if(player_count < needed) {

                        //someone wants us to join!
                    joined_a_game = true;
                        //increase the player count and store
                        //the player as the client of this game
                    game_instance.players[player_count] = player;
					player.send('0 join ' + player_count + ' ' +player.userid)
                        //start running the game on the server,
                        //which will tell them to respawn/start
					if(player_count == needed){
                    	game_instance.start();
					}

                } //if less than 2 players
            } //for all games

                //now if we didn't join a game,
                //we must create one
            if(!joined_a_game) {

                this.createGame(player);

            } //if no join already

        } else { //if there are any games at all

                //no games? create one!
            this.createGame(player,type);
        }

    }; //game_server.findGame


