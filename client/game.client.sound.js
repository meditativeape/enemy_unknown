/**
* Client Sound assets and controls.
*/ 

/**
 * Manages in game sounds.
 */
var GameClientSounds = function(){
};

GameClientSounds.prototype.loadSound = function(){
	//Sound assets is data structure initiated in menu.
	soundAssets.backgroundSound = soundManager.createSound({
	  id: 'background',
	  url: '/sounds/background.mp3',
	  volume: 30,
	  onfinish: function(){soundAssets.backgroundsound.play();}
	});
	soundAssets.attack_2Sound = soundManager.createSound({
	  id: 'attack_2',
	  url: '/sounds/attack_2.mp3'
	});
				
	soundAssets.attack_1Sound = soundManager.createSound({
	  id: 'attack_1',
	  url: '/sounds/attack_1.mp3'
	});
	
	soundAssets.attack1Sound = soundManager.createSound({
	  id: 'attack1',
	  url: '/sounds/attack1.mp3'
	});
	
	soundAssets.attack2Sound = soundManager.createSound({
	  id: 'attack2',
	  url: '/sounds/attack2.mp3'
	});
	
	soundAssets.koSound = soundManager.createSound({
	  id: 'ko',
	  url: '/sounds/ko.mp3'
	});
	
	soundAssets.dieSound = soundManager.createSound({
	  id: 'die',
	  url: '/sounds/die.mp3'
	});
		
	soundAssets.killSound = soundManager.createSound({
	  id: 'kill',
	  url: '/sounds/kill.mp3'
	});
	
	soundAssets.flagcapSound = soundManager.createSound({
	  id: 'flagcap',
	  url: '/sounds/flagcap.mp3',
	  onfinish: function(){soundAssets.flagcapsound.play();},
	  volume: 3
	});
}

/**
 * Dim out menu sound and start background sound.
 * Called when game starts.
 */
GameClientSounds.prototype.playBackgroundSound = function(){
	soundAssets.menusound.setVolume(soundAssets.menusound.volume-1);
	var now, before = new Date();
	var fadeOut = window.setInterval(function(){
		now = new Date();
		if(soundAssets.menuSound.volume>=0){
			var elapsedTime = now.getTime() - before.getTime();
			if (elapsedTime > 100)  // in case tab is not active in Chrome
				soundAssets.menusound.setVolume(soundAssets.menusound.volume-Math.round(elapsedTime/100));
			else
				soundAssets.menusound.setVolume(soundAssets.menusound.volume-1);
		}else{
			window.clearInterval(fadeOut);
			soundAssets.menusound.stop();
			//Dirty hack?
		/*	soundAssets.backgroundsound.destruct();
			soundAssets.backgroundsound = soundManager.createSound({
				  id: 'background',
				  url: '/sounds/background.mp3',
				  volume: 30,
				  onfinish: function(){soundAssets.backgroundsound.play();},
			});*/
			//Dirty hack end.
			soundAssets.backgroundsound.play();
			if(!blurred){
				console.log("unmuting backgroundsound");
				soundAssets.backgroundsound.unmute();
			}else{
				console.log("muting backgroundsound");
				soundAssets.backgroundsound.mute();
			}
		}
		before = new Date();
	} ,100);
}

/**
 * Dim out background sound and start menu sound.
 * Called when game ends.
 */
GameClientSounds.prototype.stopBackgroundSound = function(){
	soundAssets.flagcapsound.stop();
	soundAssets.backgroundsound.setVolume(soundAssets.backgroundsound.volume-1);
	var now, before = new Date();
	var fadeOut = window.setInterval(function(){
		now = new Date();
		if(soundAssets.backgroundsound.volume>=0){
			var elapsedTime = now.getTime() - before.getTime();
			if (elapsedTime > 100)  // in case tab is not active in Chrome
				soundAssets.backgroundsound.setVolume(soundAssets.backgroundsound.volume-Math.round(elapsedTime/100));
			else
				soundAssets.backgroundsound.setVolume(soundAssets.backgroundsound.volume-1);
		}else{
			window.clearInterval(fadeOut);
			soundAssets.backgroundsound.stop();
			//Dirty hack?
			/*soundAssets.menusound.destruct();
			soundAssets.menusound = soundManager.createSound({
				  id: 'menu',
				  url: '/sounds/menu.mp3',
				  onfinish: function(){soundAssets.menusound.play();},
				  volume: 30
			});*/
			//Dirty hack end.
			soundAssets.menusound.play();
			if(!blurred){
				console.log("unmuting menusound");
				soundAssets.menusound.unmute();
			}else{
				console.log("muting menusound");
				soundAssets.menusound.mute();
			}
		}
		before = new Date();
	} ,100);
}
		
/**
 * Play flagcapSound
 */
GameClientSounds.prototype.playFlagcapSound = function(){
	soundAssets.flagcapSound.play();
}

/**
 * Stop flagcapSound
 */
GameClientSounds.prototype.stopFlagcapSound = function(){
	soundAssets.flagcapSound.stop();
}

/**
 * Play attack_1sound
 */
GameClientSounds.prototype.playAttack_1Sound = function(){
	soundAssets.attack_1Sound.play();
}

/**
 * Play attack_2sound
 */
GameClientSounds.prototype.playAttack_2Sound = function(){
	soundAssets.attack_2Sound.play();
}

/**
 * Play attack1sound
 */
GameClientSounds.prototype.playAttack1Sound = function(){
	soundAssets.attack1Sound.play();
}

/**
 * Play attack2sound
 */
GameClientSounds.prototype.playAttack2Sound = function(){
	soundAssets.attack2Sound.play();
}
		