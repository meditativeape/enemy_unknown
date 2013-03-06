// JavaScript Document
var start = function(){
	if(!started){
		var sen = document.getElementById('senario');
		var typ = document.getElementById('type');
		var senSelection = sen.options[sen.selectedIndex].value;
		var typSelection = typ.options[typ.selectedIndex].value;
		gc.load_assets(parseInt(senSelection),parseInt(typSelection));
		started = true;
		container.style.visibility = "visible";
		levelMenu.style.visibility = "hidden";
		
	}
}
var started = false;

var selectLevel = function(){
	levelMenu.style.visibility = "visible";
	startMenu.style.visibility = "hidden";
}

var gameEnded = function(){
}