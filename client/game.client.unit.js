/**
 * Client unit methods.
 */
 
/**
 * Constructor for client unit.
 */ 
var ClientUnit = function(/*Unit*/ oldUnit){
	//Inherit old properties
	serverUnit.prototype = oldUnit;
	//Add new properties
	this.lastHitType = null;
	this.lostHP = 0;
	this.hitCounter = 21; //???? Determines which sprite to draw.
}

/**
 * Change the unit's displaye type when player guesses.
 */
ClientUnit.prototype.guess = function(/*int*/ guess){
    this.type = guess;
	this.image = gc.sprites[this.player][guess];
	this.cdImage = gc.cooldown[this.player][guess];
}

/**
 * When the unit attacks or is attacked, and the hp is updated.
 */
ClientUnit.prototype.updateHP = function(/*int*/hp,/*GameClient*/ gameClient){
	this.lostHP = this.hp - hp;
	this.hp = hp;
	if(this.lostHP!=0){ 
        this.hitCounter = 0; //Reset get hit animation counter.
		//Set get hit animation type.
        if (this.lostHP == 1)
            this.lastHitType = "small";
        else
            this.lastHitType = "big";
		//If own unit loses hp but didn't die.
		if(this.team == gameClient.team && hp!= 0){
			if(this.lostHP == 1){
				gameClient.gcSound.playAttack_1Sound();
			}else{
				gameClient.gcSound.playAttack_2Sound();
			}
		}
		//If enemy unit loses hp but didn't die.
		else{
			if(this.lostHP == 1 && hp!= 0){
				gameClient.gcSound.playAttack1Sound();
			//Special case: If we killed vampire.
			}else if(this.type == 0){
				//Play vampire KO sound. (Only if killed by wizard when vampire has >= 2HP.)
				gameClient.vampireKO = true;
			}
			else if(hp!= 0){
				gameClient.gcSound.playAttack2Sound();
			}
		}
	}
	
}