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
	this.isVisibleToEnemy = false;
}

/**
 * Setter for Unit.isVisibleToEnemy.
 * Returns true if this unit becomes visible; returns false otherwise.
 */
ServerUnit.prototype.setIsVisibleToEnemy = function(/*boolean*/ isVisible) {
	var old = this.isVisibleToEnemy;
	this.isVisibleToEnemy = isVisible;
	if (!old && isVisible)
		return true;
	else
		return false;
}