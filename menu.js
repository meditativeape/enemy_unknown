/**
 * Menu controls for interfacting with the index.html HTML document.
 */
 
/**
 * Setup menu controls
 */
var Menu = function(){
	this.lobby = null;
};




/**
 * Code to execute when player enters game lobby.
 */
Menu.prototype.enterLobby = function(){
	//Setup lobby client.
	this.lobby = new LobbyClient(this);
	//Setup lobby socket io.
	this.lobby.newSocket();
	//Tell lobby to update return updated state.
	this.lobby.update(); 
	levelMenu.style.visibility = "visible";
	mainMenu.style.visibility = "hidden";
	howToMenu.style.visibility = "hidden";
	loseMenu.style.visibility = "hidden";
	winMenu.style.visibility = "hidden";
}


Menu.prototype.waiting = function(){
	var scenarioMenu = document.getElementById('scenario');
	var typeMenu = document.getElementById('type');
	var scenarioSelection = scenarioMenu.options[scenarioMenu.selectedIndex].value;
	var typeSelection = "0";
	this.lobby.joinGame(scenarioSelection,typeSelection);
	waitingScreen.style.visibility = "visible";
	levelMenu.style.visibility = "hidden";
	loseMenu.style.visibility = "hidden";
	winMenu.style.visibility = "hidden";
}

Menu.prototype.start = function(){
	container.style.visibility = "visible";
	waitingScreen.style.visibility = "hidden";
}

Menu.prototype.gameEnded = function(/*boolean*/winner){
	container.style.visibility = "hidden";
	if(winner){
		winMenu.style.visibility = "visible";
	}else{
		loseMenu.style.visibility = "visible";
	}
}


Menu.prototype.howTo = function(){
	howToMenu.style.visibility = "visible";
	mainMenu.style.visibility = "hidden";
}

Menu.prototype.highScore = function(){
	//TODO
}

Menu.prototype.about = function(){
	//TODO
}

Menu.prototype.menuBack = function(){
	levelMenu.style.visibility = "hidden";
	howToMenu.style.visibility = "hidden";
	mainMenu.style.visibility = "visible";
}



//TODO Handle by lobby
var senarioList = [];
var senarioCount = 0;

var resetMenu = function(){
	document.getElementById('lobby').value = 'No created games, create one yourself.';
	senarioList = [];
	senarioCount = 0;
}

var updateMenu = function(/*string*/senario){
	var string = ''
	var flag = true;
	for (var i in senarioList){
		if(senarioList[i]  == senario){
			flag = false;
		}
		string = string + ' ' + senarioList[i];
	}
	if(flag){
		senarioList[senarioCount] = senario;
		senarioCount++;
		string = string + ' ' + senario;
	}
	
	document.getElementById('lobby').value = 'Senarios created by players: ' + string + '.';
	
}
//END TODO

//Global instance of menu for document.
var menu = new Menu();

/**
 * Sound manager setup.
 */
 
//Data structure for sound Assets.
var soundAssets = {};
 
//Load sounds
soundManager.setup({
  url: '/lib/',
  flashVersion: 8, // optional: shiny features (default = 8)
  useFlashBlock: true, // optionally, enable when you're ready to dive in
//   * read up on HTML5 audio support, if you're feeling adventurous.
//   * iPad/iPhone and devices without flash installed will always attempt to use it.
//   
  onready: function() {
    	soundAssets.menuSound = soundManager.createSound({
			  id: 'menu',
			  url: '/sounds/menu.mp3',
			  onfinish: function(){soundAssets.menuSound.play();},
			  volume: 30
		});
		soundAssets.menuSound.play();
  },
  ontimeout: function() {
		alert("soundManager failed to load");	
	}
});

var blurred = false;

var onBlur = function() {
	if(!blurred){
		soundManager.mute();
		blurred = true;
	}
};

var onFocus = function() {
	if(blurred){
		soundManager.unmute();
		blurred = false;
	}
};

window.onfocus = onFocus;
window.onblur = onBlur;

