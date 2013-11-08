/**
 * Client lobby for mobile devices. 
 */
 
/**
 * Call asyncMobileStartGame asynchronously.
 */
var mobileStartGame = function(/*String*/ scenario){
	setTimeout(asyncMobileStartGame(scenario), 0);
}

/**
 * Game has ended.
 */
var mobileEndGame = function(/*boolean*/ winner){
	ObjectiveCCall("endGame", [winner]);
}

/**
 * Choose a scenario and start game.
 */
var asyncMobileStartGame = function(/*String*/ scenario){
	if(!started){
		var typSelection = "0";
		waitingScreen.style.visibility = "visible";	
		startMenu.style.visibility = "hidden";
		loseMenu.style.visibility = "hidden";
		winMenu.style.visibility = "hidden";
		gc.load_assets(scenario,parseInt(typSelection));
		ObjectiveCCall("alert", []);
		started = true;
	}
}