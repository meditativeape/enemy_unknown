/**
 * Client sound assets and controls.
 */ 

/**
 * Setup soundManager.
 */
var gameClientSoundBrowser = function(){
	this.soundAssets = {};
}

gameClientSoundBrowser.prototype.soundManagerSetup = function(){
  soundManager.setup({
	url: '/lib/',
	flashVersion: 8, // optional: shiny features (default = 8)
	useFlashBlock: true, // optionally, enable when you're ready to dive in
	/**
	 * read up on HTML5 audio support, if you're feeling adventurous.
	 * iPad/iPhone and devices without flash installed will always attempt to use it.
	 */
	onready: function() {
		  this.soundAssets.menusound = soundManager.createSound({
				id: 'menu',
				url: '/sounds/menu.mp3',
				onfinish: function(){this.soundAssets.menusound.play();},
				volume: 30
		  });
		  this.soundAssets.menusound.play();
	},
	ontimeout: function() {
		  alert("soundManager failed to load");	
	  }
  });
}

gameClientSoundBrowser.prototype.loadSoundAssets = function(){
		this.soundAssets.backgroundsound = soundManager.createSound({
			id: 'background',
			url: '/sounds/background.mp3',
			volume: 30,
			onfinish: function(){this.soundAssets.backgroundsound.play();},
		});

		this.soundAssets.attack_2sound = soundManager.createSound({
			  id: 'attack_2',
			  url: '/sounds/attack_2.mp3'
		});
					
		this.soundAssets.attack_1sound = soundManager.createSound({
			  id: 'attack_1',
			  url: '/sounds/attack_1.mp3'
		});
		
		this.soundAssets.attack1sound = soundManager.createSound({
			  id: 'attack1',
			  url: '/sounds/attack1.mp3'
		});
		
		this.soundAssets.attack2sound = soundManager.createSound({
			  id: 'attack2',
			  url: '/sounds/attack2.mp3'
		});
		
		this.soundAssets.kosound = soundManager.createSound({
			  id: 'ko',
			  url: '/sounds/ko.mp3'
		});
		
		this.soundAssets.diesound = soundManager.createSound({
			  id: 'die',
			  url: '/sounds/die.mp3'
		});
		
		this.soundAssets.killsound = soundManager.createSound({
			  id: 'kill',
			  url: '/sounds/kill.mp3'
		});
		
		this.soundAssets.flagcapsound = soundManager.createSound({
			  id: 'flagcap',
			  url: '/sounds/flagcap.mp3',
			onfinish: function(){this.soundAssets.flagcapsound.play();},
			  volume: 10
		});
		//this.soundAssets.gothitsound.load();
}