/**
 * Client unit methods.
 */
 
 //View
ClientUnit.prototype.guess = function(/*int*/ guess){
    this.type = guess;
	this.image = gc.sprites[this.player][guess];
	this.cdImage = gc.cooldown[this.player][guess];
}

//View
ClientUnit.prototype.minusHP = function(/*int*/hp){
	this.lostHP = this.hp - hp;
	this.hp = hp;
	if(this.lostHP!=0){
        this.hitCounter = 0; // show get hit animation
        if (this.lostHP == 1)
            this.lastHitType = "small";
        else
            this.lastHitType = "big";
		if(this.team == gc.team && hp!= 0){
			if(this.lostHP == 1){
				soundAssets.attack_1sound.play();
			}else{
				soundAssets.attack_2sound.play();
			}
		}
		else{
			if(this.lostHP == 1 && hp!= 0){
				soundAssets.attack1sound.play();
			}else if(this.type == 0){
				soundAssets.kosound.play();
				gc.vampireKO = true;
			}
			else if(hp!= 0){
				soundAssets.attack2sound.play();
			}
		}
	}
	
}