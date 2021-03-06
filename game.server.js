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

        //Import server-side game library code.
	var game_core_server = require('./game.core.server.js');

        //A simple wrapper for logging so we can toggle it,
        //and augment it for clarity.
    game_server.log = function() {
        if(verbose) console.log.apply(this,arguments);
    }

	// List to store games
	game_server.games = [];
	game_server.inMenu = [];
	game_server.inMenu_count = 0;
	game_server.game_count = 0;


    //Relay messages from the client
    game_server.onMessage = function(client,message) {
		//the client should be in a game, so
        //we can tell that game to handle the input
		if(client && !client.game){
			console.log(":: server :: received a message: " + message);
			var keywords = message.split(" ");
			if(parseInt(keywords[0])==0){
				if(keywords[1] == "join"){
					game_server.findGame(client,parseInt(keywords[2]),keywords[3]);
				}
				if(keywords[1] == "menu"){
					game_server.inMenu[game_server.inMenu_count] = client;
					game_server.inMenu_count++;
					client.send('0 menuReset');
					for(var gameid in this.games) {
						client.send('0 menu ' + this.games[gameid].scenario);
					}				
				}
			}
		} else if (client && client.game) {
            client.game.handleClientInput(client, message);
        }
		
    }; //game_server.onMessage

	//Remove client for a game
	game_server.onDisconnect = function(client) {
	
		if(client.game) {
			client.game.leaveGame(client);
		}
	
	}

    // Define some required functions
    game_server.createGame = function(player, type,scenario) {

        // Create a new game instance
        var thegame = new game_core_server([player], UUID(), type, scenario);
		
        // Store it in the list of game
        this.games.push(thegame);

        // Keep track of #games
        this.game_count++;

        // Tell the player that he joins the game
        player.send('0 join 1 ' + player.userid);
        player.game = thegame;
		
        this.log(':: server :: Player ' + player.userid.substring(0,8) + ' created a game with id '
		+ player.game.id.substring(0,8));

        // return it
        return thegame;

    }; // game_server.createGame

    game_server.findGame = function(player,type,scenario) {

		for(var playerNum in this.inMenu){
			if(this.inMenu[playerNum] == player){
				this.inMenu.splice(playerNum, playerNum+1);
				this.game_count--;
			}
		}
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
        this.log(':: server :: Looking for a game. We have : ' + this.game_count);

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


    }; //game_server.findGame


