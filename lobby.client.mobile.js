/**
 * Client lobby for mobile devices. 
 */
 
/**
 * Choose a scenario and start game.
 */
var mobileStartGame = function(/*String*/ scenario){
	if(!started){
		var typSelection = "0";
		gc.load_assets(senSelection,parseInt(typSelection));
		started = true;
		waitingScreen.style.visibility = "visible";	
		startMenu.style.visibility = "hidden";
		loseMenu.style.visibility = "hidden";
		winMenu.style.visibility = "hidden";
	}
}

/**
 * Game has ended.
 */
var mobileEndGame = function(/*boolean*/ winner){
	ObjectiveCCall("endGame", [winner]);
}