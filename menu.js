// JavaScript Document
var waiting = function(){
	if(!started){
		var sen = document.getElementById('scenario');
		var typ = document.getElementById('type');
		var senSelection = sen.options[sen.selectedIndex].value;
		var typSelection = "0";
		// gc = new game_core_client();
		started = true;
		waitingScreen.style.visibility = "visible";
		levelMenu.style.visibility = "hidden";
		loseMenu.style.visibility = "hidden";
		winMenu.style.visibility = "hidden";
		
	}
}

var started = false;

var selectLevel = function(){
	gc.mainSocket.send('0 menu');
	levelMenu.style.visibility = "visible";
	mainMenu.style.visibility = "hidden";
	howToMenu.style.visibility = "hidden";
	loseMenu.style.visibility = "hidden";
	winMenu.style.visibility = "hidden";
}


var gameEnded = function(/*boolean*/winner){
	container.style.visibility = "hidden";
	started = false;
	if(winner){
		winMenu.style.visibility = "visible";
	}else{
		loseMenu.style.visibility = "visible";
	}
}

var start = function(){
	container.style.visibility = "visible";
	waitingScreen.style.visibility = "hidden";
}

var howTo = function(){
	howToMenu.style.visibility = "visible";
	mainMenu.style.visibility = "hidden";
}

var menuBack = function(){
	levelMenu.style.visibility = "hidden";
	howToMenu.style.visibility = "hidden";
	mainMenu.style.visibility = "visible";
}




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
			  onfinish: function(){soundAssets.menusound.play();},
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
