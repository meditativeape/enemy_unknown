/**
 * Client UI functions
 */ 
 
/* Setup stage and layers. */
var stage = new Kinetic.Stage({
	container: 'container',
	id: 'gameCanvas',
	width: 800,
	height: 600
});

var mapLayer = new Kinetic.Layer(); // layer for background image, hexgrid, and units
var UILayer = new Kinetic.Layer(); // layer for UI elements, such as minimap, buttons, and unit info
var msgLayer = new Kinetic.Layer({listening: false}); // layer for messages, such as start and end message

var gameClientUI = function() {
	// Teams: 0:red, 1:blue, 2:yellow, 3:green
	// Container for all unit images
	this.sprites = [[], [], [], []];
	// Container for all unit cooldown images
	this.cooldown = [[], [], [], []];
	// Get hit images
	this.getHitImgs = {small: [[], [], [], []], big: [[], [], [], []]};
	// Button images
	this.buttonImgs = {lit: {}, unlit: {}};
	this.buttons = {};
	// Flag images
	this.flagImgs = [];
	this.flags = [];
	// Topbar images
	this.topbarImgs = [];
	this.topbar = null;
	// Build unit images
	this.buildUnitImgs = {frame: null, unavailable: [], lit: [], unlit: []};
	this.buildUnit = [];
	this.buildUnitGroup = null;
	// Mark unit images
	this.markUnitImgs = {lit: [], unlit:[]};
	this.markUnit = [];
	this.markUnitGroup = null;
	this.hasLoaded = false;
	// camera???
	this.buildUnitMenu = false;
	this.whichUnitToBuild = null;
	
}

gameClientUI.prototype.loadImage = function(/*string*/ scenario,/*int*/type ) {

	var filesLoaded = 0;
	
	var loadImage = function(url) {
		var img = new Image();
		img.onload = incrementCounter;
		img.src = url;
		return img;
	};
	
	var incrementCounter = function() {
		filesLoaded++;
		if (filesLoaded >= 60) {
			this.hasLoaded = true;
		}
		this.hasLoaded = false;
	}
	// load sprites
	this.background = loadImage("sprites\\bg_grey.jpg");
	this.heartImg = loadImage("sprites\\heart.png");
	this.resourceImg = loadImage("sprites\\resource.png");
	this.flagImg = loadImage("sprites\\tile-flag.png");
	this.thronImg = loadImage("sprites\\thron.png");
	this.whokillswhoImg = loadImage("sprites\\whokillswho2.png");
	this.fogImg = loadImage("sprites\\fog.png");
	this.buttonbarImg = loadImage("sprites\\buttonbar.png");

	this.sprites[0][0] = loadImage("sprites\\vampire6_red.png");
	this.sprites[0][1] = loadImage("sprites\\wolf6_red.png");
	this.sprites[0][2] = loadImage("sprites\\hunter6_red.png");
	this.sprites[0][3] = loadImage("sprites\\zombie6_red.png");
	this.sprites[0][4] = loadImage("sprites\\wizard6_red.png");
	this.sprites[0][5] = loadImage("sprites\\unknown6_red.png");
	
	this.sprites[1][0] = loadImage("sprites\\vampire6_blue.png");
	this.sprites[1][1] = loadImage("sprites\\wolf6_blue.png");
	this.sprites[1][2] = loadImage("sprites\\hunter6_blue.png");
	this.sprites[1][3] = loadImage("sprites\\zombie6_blue.png");
	this.sprites[1][4] = loadImage("sprites\\wizard6_blue.png");
	this.sprites[1][5] = loadImage("sprites\\unknown6_blue.png");

	// load cooldown spritesheets
	this.cooldown[0][0] = loadImage("sprites\\vampire9_red_cd.png");
	this.cooldown[0][1] = loadImage("sprites\\wolf9_red_cd.png");
	this.cooldown[0][2] = loadImage("sprites\\hunter9_red_cd.png");
	this.cooldown[0][3] = loadImage("sprites\\zombie9_red_cd.png");
	this.cooldown[0][4] = loadImage("sprites\\wizard9_red_cd.png");
	this.cooldown[0][5] = loadImage("sprites\\unknown9_red_cd.png");
	
	this.cooldown[1][0] = loadImage("sprites\\vampire9_blue_cd.png");
	this.cooldown[1][1] = loadImage("sprites\\wolf9_blue_cd.png");
	this.cooldown[1][2] = loadImage("sprites\\hunter9_blue_cd.png");
	this.cooldown[1][3] = loadImage("sprites\\zombie9_blue_cd.png");
	this.cooldown[1][4] = loadImage("sprites\\wizard9_blue_cd.png");
	this.cooldown[1][5] = loadImage("sprites\\unknown9_blue_cd.png");

	// load team specific UI images
	this.flagImgs[0] = loadImage("sprites\\redflag.png");
	this.flagImgs[1] = loadImage("sprites\\blueflag.png");
	this.topbarImgs[0] = loadImage("sprites\\topbar1.png");
	this.topbarImgs[1] = loadImage("sprites\\topbar2.png");
	
	// load buttons
	this.buttonImgs.unlit.build = loadImage("sprites\\hammerunlit.png");
	this.buttonImgs.lit.build = loadImage("sprites\\hammerlit.png");
	this.buttonImgs.unlit.menu = loadImage("sprites\\menuunlit.png");
	this.buttonImgs.lit.menu = loadImage("sprites\\menulit.png");
	this.buttonImgs.unlit.mute = loadImage("sprites\\muteunlit.png");
	this.buttonImgs.lit.mute = loadImage("sprites\\mutelit.png");
	this.buttonImgs.unlit.sound = loadImage("sprites\\soundunlit.png");
	this.buttonImgs.lit.sound = loadImage("sprites\\soundlit.png");
	
	// build unit buttons
	this.buildUnitImgs.frame = loadImage("sprites\\build\\buildframe.png");
	this.buildUnitImgs.unavailable[0] = loadImage("sprites\\build\\vampire_grey.png");
	this.buildUnitImgs.unlit[0] = loadImage("sprites\\build\\vampire_black.png");
	this.buildUnitImgs.lit[0] = loadImage("sprites\\build\\vampire_green.png");
	this.buildUnitImgs.unavailable[1] = loadImage("sprites\\build\\wolf_grey.png");
	this.buildUnitImgs.unlit[1] = loadImage("sprites\\build\\wolf_black.png");
	this.buildUnitImgs.lit[1] = loadImage("sprites\\build\\wolf_green.png");
	this.buildUnitImgs.unavailable[2] = loadImage("sprites\\build\\hunter_grey.png");
	this.buildUnitImgs.unlit[2] = loadImage("sprites\\build\\hunter_black.png");
	this.buildUnitImgs.lit[2] = loadImage("sprites\\build\\hunter_green.png");
	this.buildUnitImgs.unavailable[3] = loadImage("sprites\\build\\zombie_grey.png");
	this.buildUnitImgs.unlit[3] = loadImage("sprites\\build\\zombie_black.png");
	this.buildUnitImgs.lit[3] = loadImage("sprites\\build\\zombie_green.png");
	this.buildUnitImgs.unavailable[4] = loadImage("sprites\\build\\wizard_grey.png");
	this.buildUnitImgs.unlit[4] = loadImage("sprites\\build\\wizard_black.png");
	this.buildUnitImgs.lit[4] = loadImage("sprites\\build\\wizard_green.png");
	
	// guess unit buttons
	this.markUnitImgs.unlit[0] = loadImage("sprites\\mark\\vampire_unlit.png");
	this.markUnitImgs.lit[0] = loadImage("sprites\\mark\\vampire_lit.png");
	this.markUnitImgs.unlit[1] = loadImage("sprites\\mark\\wolf_unlit.png");
	this.markUnitImgs.lit[1] = loadImage("sprites\\mark\\wolf_lit.png");
	this.markUnitImgs.unlit[2] = loadImage("sprites\\mark\\hunter_unlit.png");
	this.markUnitImgs.lit[2] = loadImage("sprites\\mark\\hunter_lit.png");
	this.markUnitImgs.unlit[3] = loadImage("sprites\\mark\\zombie_unlit.png");
	this.markUnitImgs.lit[3] = loadImage("sprites\\mark\\zombie_lit.png");
	this.markUnitImgs.unlit[4] = loadImage("sprites\\mark\\wizard_unlit.png");
	this.markUnitImgs.lit[4] = loadImage("sprites\\mark\\wizard_lit.png");
	
	// get hit images
	this.getHitImgs.small[0][0] = loadImage("sprites\\gethit\\vampire_red_small_hit.png");
	this.getHitImgs.small[0][1] = loadImage("sprites\\gethit\\wolf_red_small_hit.png");
	this.getHitImgs.small[0][2] = loadImage("sprites\\gethit\\hunter_red_small_hit.png");
	this.getHitImgs.small[0][3] = loadImage("sprites\\gethit\\zombie_red_small_hit.png");
	this.getHitImgs.small[0][4] = loadImage("sprites\\gethit\\wizard_red_small_hit.png");
	this.getHitImgs.small[1][0] = loadImage("sprites\\gethit\\vampire_blue_small_hit.png");
	this.getHitImgs.small[1][1] = loadImage("sprites\\gethit\\wolf_blue_small_hit.png");
	this.getHitImgs.small[1][2] = loadImage("sprites\\gethit\\hunter_blue_small_hit.png");
	this.getHitImgs.small[1][3] = loadImage("sprites\\gethit\\zombie_blue_small_hit.png");
	this.getHitImgs.small[1][4] = loadImage("sprites\\gethit\\wizard_blue_small_hit.png");
	
	this.getHitImgs.big[0][0] = loadImage("sprites\\gethit\\vampire_red_big_hit.png");
	this.getHitImgs.big[0][1] = loadImage("sprites\\gethit\\wolf_red_big_hit.png");
	this.getHitImgs.big[0][2] = loadImage("sprites\\gethit\\hunter_red_big_hit.png");
	this.getHitImgs.big[0][3] = loadImage("sprites\\gethit\\zombie_red_big_hit.png");
	this.getHitImgs.big[0][4] = loadImage("sprites\\gethit\\wizard_red_big_hit.png");
	this.getHitImgs.big[1][0] = loadImage("sprites\\gethit\\vampire_blue_big_hit.png");
	this.getHitImgs.big[1][1] = loadImage("sprites\\gethit\\wolf_blue_big_hit.png");
	this.getHitImgs.big[1][2] = loadImage("sprites\\gethit\\hunter_blue_big_hit.png");
	this.getHitImgs.big[1][3] = loadImage("sprites\\gethit\\zombie_blue_big_hit.png");
	this.getHitImgs.big[1][4] = loadImage("sprites\\gethit\\wizard_blue_big_hit.png");
	
	// add terrain images
	CONSTANTS.thronTerrain.image = this.thronImg;
	CONSTANTS.flagTerrain.image = this.flagImg;
	CONSTANTS.resourceTerrain.image = this.resourceImg;
	CONSTANTS.heart = this.heartImg;
		
}

gameClientUI.prototype.initGameUI = function(){
	// animation to show text message at the center of canvas
	var me = this;
	var centerMsg = new Kinetic.Text({
	text: "Waiting for other players...",
	x: 80,
	y: 260,
	fill: 'rgba(127, 155, 0, 0.5)',
	fontFamily: 'Calibri',
	fontSize: 60,
	fontStyle: 'italic'
	});
	
	msgLayer.add(centerMsg);
	this.msgLayerAnim = new Kinetic.Animation(function(frame) {
	  if (me.started) {
		  if (me.starting){
			  centerMsg.setText("Game has started");
			  centerMsg.setFill('white');
			  centerMsg.setX(CONSTANTS.width/4);
			  centerMsg.setY(CONSTANTS.height/2);
			  centerMsg.setFontSize(60);
			  centerMsg.setFontStyle('normal');
			  centerMsg.setFontFamily('Calibri');
			  // ctx.font = '30px Calibri';	
			  // ctx.fillText("Objective: Kill all enemy units.", canvas.width/4 + 60, canvas.height/2 + 60);
			  if (!msgLayer.isAncestorOf(centerMsg)) {
				  msgLayer.add(centerMsg);
			  }
		  } else if ((me.capping == -1) && (me.countdown <= 30)){  // TODO: hardcoded!
			  // if (me.capping == 1){
				  // centerMsg.setText("Capturing flag: " + me.countdown + " seconds until win.");
				  // centerMsg.setFill('white');
				  // centerMsg.setX(200);
				  // centerMsg.setY(50);
				  // centerMsg.setFontSize(28);
				  // centerMsg.setFontStyle('normal');
				  // centerMsg.setFontFamily('Calibri');
				  // if (!msgLayer.isAncestorOf(centerMsg)) {
					  // msgLayer.add(centerMsg);
				  // }
			  // } else {
				  centerMsg.setText("Defend flag: " + me.countdown + " seconds until lose!");
				  centerMsg.setFill('red');
				  centerMsg.setX(210);
				  centerMsg.setY(50);
				  centerMsg.setFontSize(28);
				  centerMsg.setFontStyle('normal');
				  centerMsg.setFontFamily('Calibri');
				  if (!msgLayer.isAncestorOf(centerMsg)) {
					  msgLayer.add(centerMsg);
				  }
			  // }
		  } else if (!me.alive && me.winner === false){
			  centerMsg.setText("All your units are dead!");
			  centerMsg.setFill('white');
			  centerMsg.setX(CONSTANTS.width/4);
			  centerMsg.setY(CONSTANTS.height/2);
			  centerMsg.setFontSize(60);
			  centerMsg.setFontStyle('normal');
			  centerMsg.setFontFamily('Calibri');
			  if (!msgLayer.isAncestorOf(centerMsg)) {
				  msgLayer.add(centerMsg);
			  }
		  } else {
			  if (msgLayer.isAncestorOf(centerMsg)) {
				  centerMsg.remove();
			  }
		  }
	  }
	}, msgLayer);
	this.msgLayerAnim.start();
	
	// topbar
	this.topbar = new Kinetic.Image({
	  x: CONSTANTS.minimapWidth,
	  y: 0,
	  image: this.topbarImgs[this.team],
	  listening: false
	});
	UILayer.add(this.topbar);
	
	// unit counter
	var counter1Text = new Kinetic.Text({
	  fontFamily: "Courier New",
	  fontSize: 15,
	  fill: "white",
	  text: this.unitCounter[1-this.team],
	  x: 248,
	  y: 8,
	  listening: false
	});
	UILayer.add(counter1Text);
	var counter2Text = new Kinetic.Text({
	  fontFamily: "Courier New",
	  fontSize: 15,
	  fill: "white",
	  text: this.unitCounter[this.team],
	  x: 328,
	  y: 8,
	  listening: false
	});
	UILayer.add(counter2Text);
	
	// resource text
	var resourceText = new Kinetic.Text({
	  fontFamily: "Courier New",
	  fontSize: 15,
	  fill: "white",
	  text: this.resource,
	  x: 402,
	  y: 8,
	  listening: false
	});
	UILayer.add(resourceText);
	
	// flags
	for (var i = 0; i < this.flagImgs.length; i++) {
	  this.flags.push(new Kinetic.Image({
		  image: this.flagImgs[i],
		  x: 448,
		  y: 5,
		  visible: false,
		  listening: false
	  }));
	  UILayer.add(this.flags[i]);
	  this.flags[i].moveToTop();
	}
	
	var flagText = new Kinetic.Text({
	  fontFamily: "Courier New",
	  fontSize: 15,
	  fill: "white",
	  text: CONSTANTS.countdown-this.countdown + "/" + CONSTANTS.countdown,
	  x: 475,
	  y: 8,
	  listening: false
	});
	UILayer.add(flagText);
	
	// button bar
	this.buttonbar = new Kinetic.Image({
	  x: CONSTANTS.minimapWidth + this.topbar.getWidth(),
	  y: 0,
	  image: this.buttonbarImg,
	  listening: false
	});
	UILayer.add(this.buttonbar);
	
	// buttons
	this.buttons.build = new Kinetic.Image({
	  x: 572,
	  y: 4,
	  image: this.buttonImgs.unlit.build,
	  listening: true
	});
	UILayer.add(this.buttons.build);
	
	this.buttons.menu = new Kinetic.Image({
	  x: 602,
	  y: 4,
	  image: this.buttonImgs.unlit.menu,
	  listening: true
	});
	this.buttons.menu.on('mouseover', function(){
	  me.buttons.menu.setImage(me.buttonImgs.lit.menu);
	  document.body.style.cursor = "pointer";
	});
	this.buttons.menu.on('mouseout', function(){
	  me.buttons.menu.setImage(me.buttonImgs.unlit.menu);
	  document.body.style.cursor = "auto";
	});
	this.buttons.menu.on('click', function(){
	  // click event listener goes here
	  alert("clicked!");
	});
	UILayer.add(this.buttons.menu);
	
	this.buttons.sound = new Kinetic.Image({
	  x: 630,
	  y: 4,
	  image: this.buttonImgs.unlit.sound,
	  listening: true
	});
	if (!this.soundOn) {
	  this.buttons.sound.setImage(this.buttonImgs.unlit.mute);
	}
	this.buttons.sound.on('mouseover', function(){
	  if (me.soundOn) {
		  me.buttons.sound.setImage(me.buttonImgs.lit.sound);
	  } else {
		  me.buttons.sound.setImage(me.buttonImgs.lit.mute);
	  }
	  document.body.style.cursor = "pointer";
	});
	this.buttons.sound.on('mouseout', function(){
	  if (me.soundOn) {
		  me.buttons.sound.setImage(me.buttonImgs.unlit.sound);
	  } else {
		  me.buttons.sound.setImage(me.buttonImgs.unlit.mute);
	  }
	  document.body.style.cursor = "auto";
	});
	this.buttons.sound.on('click', function(){
	  if (me.soundOn) {
		  me.soundOn = false;
		  me.buttons.sound.setImage(me.buttonImgs.lit.mute);
	  } else {
		  me.soundOn = true;
		  me.buttons.sound.setImage(me.buttonImgs.lit.sound);
	  }
	});
	UILayer.add(this.buttons.sound);
	
	// build unit image
	var buildUnitGroup = new Kinetic.Group({
	  visible: false,
	});
	this.buildUnitGroup = buildUnitGroup;
	buildUnitGroup.add(new Kinetic.Image({
	  image: this.buildUnitImgs.frame,
	  x: 572,
	  y: 40
	}));
	for (var i = 0; i < 5; i++) {
	  this.buildUnit[i] = new Kinetic.Image({
		  image: this.buildUnitImgs.unavailable[i],
		  x: 573,
		  y: 60+31*i
	  });
	  this.buildUnit[i].available = false;
	  this.buildUnit[i].on('mouseover', function(temp) {
		  return function(){
			  if (me.buildUnit[temp].available) {
				  me.buildUnit[temp].setImage(me.buildUnitImgs.lit[temp]);
				  document.body.style.cursor = "pointer";
			  }
		  }
	  }(i));
	  this.buildUnit[i].on('mouseout', function(temp) {
		  return function(){
			  if (me.buildUnit[temp].available) {
				  me.buildUnit[temp].setImage(me.buildUnitImgs.unlit[temp]);
				  document.body.style.cursor = "auto";
			  }
		  }
	  }(i));
	  this.buildUnit[i].on('click', function(temp) {
		  return function(){
			  if (me.buildUnit[temp].available) {
				  me.whichUnitToBuild = temp;
				  me.hexgrid.clientMarkBuildable(me.player);
			  }
		  }
	  }(i));
	  buildUnitGroup.add(this.buildUnit[i]);
	}
	UILayer.add(buildUnitGroup);
	
	this.UILayerAnim = new Kinetic.Animation(function(frame) {
	  counter1Text.setText(me.unitCounter[1-me.team]);
	  counter2Text.setText(me.unitCounter[me.team]);
	  resourceText.setText(me.resource);
	  flagText.setText(CONSTANTS.countdown-me.countdown + "/" + CONSTANTS.countdown);
	}, UILayer);
	this.UILayerAnim.start();
}

gameClientUI.prototype.startingMessageControl = function(){
	this.starting = true;
	var self = this;
	window.setTimeout(function(){
			self.starting = false;
		}
		,2000);
}