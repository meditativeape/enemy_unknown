/**
 * Server Unit functions.
 */ 

/**
 * Constructor for server unit.
 */ 
var ServerUnit = function(){
	/**
     * Record on server side whether a unit is visible to the opponent.
     * WORK FOR 1 VS 1 ONLY!
     */
	this.serverIsVisible = false;
}

var ServerUnitFromUnit = function(/*Unit*/ oldUnit){
	var serverUnit = new ServerUnit();
	serverUnit.prototype = oldUnit;
	return serverUnit;
}

/**
 * Setter for Unit.serverIsVisible.
 * Returns true if this unit becomes visible; returns false otherwise.
 */
ServerUnit.prototype.setServerIsVisible = function(/*boolean*/ isVisible) {
	var old = this.serverIsVisible;
	this.serverIsVisible = isVisible;
	if (!old && isVisible)
		return true;
	else
		return false;
}