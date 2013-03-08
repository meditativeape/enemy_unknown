// JavaScript Document
var waiting = function(){
	if(!started){
		var sen = document.getElementById('senario');
		var typ = document.getElementById('type');
		var senSelection = sen.options[sen.selectedIndex].value;
		var typSelection = typ.options[typ.selectedIndex].value;
		gc.load_assets(parseInt(senSelection),parseInt(typSelection));
		started = true;
		waitingScreen.style.visibility = "visible";
		levelMenu.style.visibility = "hidden";
		
	}
}
var started = false;

var selectLevel = function(){
	levelMenu.style.visibility = "visible";
	startMenu.style.visibility = "hidden";
}

var gameEnded = function(){
	container.style.visibility = "hidden";
	endGameMenu.style.visibility = "visible";
}

var start = function(){
	container.style.visibility = "visible";
	waitingScreen.style.visibility = "hidden";
}

var menuBack = function(){
	levelMenu.style.visibility = "hidden";
	startMenu.style.visibility = "visible";
}