/**
* Client sound assets and controls.
*/ 

//Load sounds
var gameClientSounds = function(){};

gameClientSounds.prototype.loadSound = function(){
}

gameClientSounds.prototype.playBackgroundsound = function(){
}

gameClientSounds


		soundAssets.backgroundsound = soundManager.createSound({
			id: 'background',
			url: '/sounds/background.mp3',
			volume: 30,
			onfinish: function(){soundAssets.backgroundsound.play();},
		});

		soundAssets.attack_2sound = soundManager.createSound({
			  id: 'attack_2',
			  url: '/sounds/attack_2.mp3'
		});
					
		soundAssets.attack_1sound = soundManager.createSound({
			  id: 'attack_1',
			  url: '/sounds/attack_1.mp3'
		});
		
		soundAssets.attack1sound = soundManager.createSound({
			  id: 'attack1',
			  url: '/sounds/attack1.mp3'
		});
		
		soundAssets.attack2sound = soundManager.createSound({
			  id: 'attack2',
			  url: '/sounds/attack2.mp3'
		});
		
		soundAssets.kosound = soundManager.createSound({
			  id: 'ko',
			  url: '/sounds/ko.mp3'
		});
		
		soundAssets.diesound = soundManager.createSound({
			  id: 'die',
			  url: '/sounds/die.mp3'
		});
		
		soundAssets.killsound = soundManager.createSound({
			  id: 'kill',
			  url: '/sounds/kill.mp3'
		});
		
		soundAssets.flagcapsound = soundManager.createSound({
			  id: 'flagcap',
			  url: '/sounds/flagcap.mp3',
			onfinish: function(){soundAssets.flagcapsound.play();},
			  volume: 10
		});
		//soundAssets.gothitsound.load();