// JavaScript Document
var waiting = function(){
	if(!started){
		var sen = document.getElementById('scenario');
		var typ = document.getElementById('type');
		var senSelection = sen.options[sen.selectedIndex].value;
		var typSelection = typ.options[typ.selectedIndex].value;
		gc.load_assets(senSelection,parseInt(typSelection));
		started = true;
		waitingScreen.style.visibility = "visible";
		levelMenu.style.visibility = "hidden";
		loseMenu.style.visibility = "hidden";
		winMenu.style.visibility = "hidden";
		
	}
}
var started = false;

var selectLevel = function(){
	levelMenu.style.visibility = "visible";
	startMenu.style.visibility = "hidden";
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
	startMenu.style.visibility = "hidden";
}

var menuBack = function(){
	levelMenu.style.visibility = "hidden";
	howToMenu.style.visibility = "hidden";
	startMenu.style.visibility = "visible";
}