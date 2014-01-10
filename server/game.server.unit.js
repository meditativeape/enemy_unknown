/**
 * Server Unit functions.
 */ 

/**
 * Constructor for server unit.
 */ 
var ServerUnit = function(/*Unit*/ oldUnit){
	//Inherit old properties
	serverUnit.prototype = oldUnit;
	//Add new properties
	/**
     * Record on server side whether a unit is visible to the opponent.
     * WORK FOR 1 VS 1 ONLY!
     */
	this.serverIsVisible = false;
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