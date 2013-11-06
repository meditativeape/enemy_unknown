/**
* Client UI controls in browser platform.
*/ 

var gcUIBrowser = function(/*gameClientUI*/ gcUI) {
	this.gcUI = gcUI;
}

this.gcUIBrowser.prototype.registerEventListeners = function() {

	var me = this;
	
	var mousemove = function(event) {  // mouse move event listener
		var x = event.pageX;
		var y = event.pageY;
		var offsetLeft = stage.getContainer().offsetLeft;
		var offsetTop = stage.getContainer().offsetTop;
		if (x < offsetLeft) {
			me.gcUI.camera.isMovingLeft = true;
		} else {
			me.gcUI.camera.isMovingLeft = false;
		}
		if (x > offsetLeft+CONSTANTS.width) {
			me.gcUI.camera.isMovingRight = true;
		} else {
			me.gcUI.camera.isMovingRight = false;
		}
		if (y < offsetTop) {
			me.gcUI.camera.isMovingUp = true;
		} else {
			me.gcUI.camera.isMovingUp = false;
		}
		if (y > offsetTop+CONSTANTS.height) {
			me.gcUI.camera.isMovingDown = true;
		} else {
			me.gcUI.camera.isMovingDown = false;
		}
	};
	document.addEventListener("mousemove", mousemove);
	
	var contextmenu = function(event) { // right click event listener
		var x = event.pageX;
		var y = event.pageY;
		var offsetLeft = stage.getContainer().offsetLeft;
		var offsetTop = stage.getContainer().offsetTop;
		if (x >= offsetLeft && x <= offsetLeft+CONSTANTS.width && y >= offsetTop && y <= offsetTop+CONSTANTS.height) {
			event.preventDefault();
			me.gcUI.last_click_coord = null;
			me.gcUI.hexgrid.clientClearReachable();
			me.gcUI.hexgrid.clientClearAttackable();
			if(me.gcUI.guess){
				me.gcUI.hexgrid.matrix[me.gcUI.guess.X][me.gcUI.guess.Y].guessing = false;
				me.gcUI.guess = null;
			}
			me.gcUI.build = false;
			me.gcUI.toBuild = null;
			
			// TODO WTF????
			gc.hexgrid.clientClearBuildable();
		}
	};
	document.addEventListener('contextmenu', contextmenu);
	// this.contextmenu = contextmenu;
	
	var keydown = function(event) { // keydown event listener
		if (event.keyCode == 37 || event.keyCode == 65) { // left
			me.gcUI.camera.isMovingLeft = true;
		} else if (event.keyCode == 39 || event.keyCode == 68) { // right
			me.gcUI.camera.isMovingRight = true;
		} else if (event.keyCode == 38 || event.keyCode == 87) { // up
			me.gcUI.camera.isMovingUp = true;
		} else if (event.keyCode == 40 || event.keyCode == 83) { // down
			me.gcUI.camera.isMovingDown = true;
		}
		if (event.keyCode == 49){
			if(me.gcUI.guess){
				me.gcUI.hexgrid.getUnit(me.gcUI.guess).guess(0);
				me.gcUI.hexgrid.matrix[me.gcUI.guess.X][me.gcUI.guess.Y].guessing = false;
				me.gcUI.guess = null;
			}
			if(me.gcUI.build){
				if(me.gcUI.resource >= CONSTANTS.cost[0]){
					me.gcUI.toBuild = 0;
					me.gcUI.hexgrid.clientMarkBuildable(me.gcUI.player);
				}
				me.gcUI.build = false;
			}
		}
		if (event.keyCode == 50){
			if(me.gcUI.guess){
				me.gcUI.hexgrid.getUnit(me.gcUI.guess).guess(1);
				me.gcUI.hexgrid.matrix[me.gcUI.guess.X][me.gcUI.guess.Y].guessing = false;
				me.gcUI.guess = null;
			}
			if(me.gcUI.build){
				if(me.gcUI.resource >= CONSTANTS.cost[1]){
					me.gcUI.toBuild = 1;
					me.gcUI.hexgrid.clientMarkBuildable(me.gcUI.player);
				}
				me.gcUI.build = false;
			}
		}
		if (event.keyCode == 51){
			if(me.gcUI.guess){
				me.gcUI.hexgrid.getUnit(me.gcUI.guess).guess(2);
				me.gcUI.hexgrid.matrix[me.gcUI.guess.X][me.gcUI.guess.Y].guessing = false;
				me.gcUI.guess = null;
			}
			if(me.gcUI.build){
				if(me.gcUI.resource >= CONSTANTS.cost[2]){
					me.gcUI.toBuild = 2;
					me.gcUI.hexgrid.clientMarkBuildable(me.gcUI.player);
				}
				me.gcUI.build = false;
			}
		}
		if (event.keyCode == 52){
			if(me.gcUI.guess){
				me.gcUI.hexgrid.getUnit(me.gcUI.guess).guess(3);
				me.gcUI.hexgrid.matrix[me.gcUI.guess.X][me.gcUI.guess.Y].guessing = false;
				me.gcUI.guess = null;
			}
			if(me.gcUI.build){
				if(me.gcUI.resource >= CONSTANTS.cost[3]){
					me.gcUI.toBuild = 3;
					me.gcUI.hexgrid.clientMarkBuildable(me.gcUI.player);
				}
				me.gcUI.build = false;
			}
		}
		if (event.keyCode == 53){
			if(me.gcUI.guess){
				me.gcUI.hexgrid.getUnit(me.gcUI.guess).guess(4);
				me.gcUI.hexgrid.matrix[me.gcUI.guess.X][me.gcUI.guess.Y].guessing = false;
				me.gcUI.guess = null;
			}
			if(me.gcUI.build){
				if(me.gcUI.resource >= CONSTANTS.cost[4]){
					me.gcUI.toBuild = 4;
					me.gcUI.hexgrid.clientMarkBuildable(me.gcUI.player);
				}
				me.gcUI.build = false;
			}
		}
		if (event.keyCode == 54){
			if(me.gcUI.guess){
				me.gcUI.hexgrid.getUnit(me.gcUI.guess).guess(5);
				me.gcUI.hexgrid.matrix[me.gcUI.guess.X][me.gcUI.guess.Y].guessing = false;
				me.gcUI.guess = null;
			}
			me.gcUI.build = false;
			me.gcUI.toBuild = null;
			me.gcUI.hexgrid.clientClearBuildable();
		}	
		if (event.keyCode == 81){
			me.gcUI.build = true;
			me.gcUI.toBuild = null;
			me.gcUI.hexgrid.clientClearReachable();
			me.gcUI.hexgrid.clientClearAttackable();
			me.gcUI.hexgrid.clientClearBuildable();
			me.gcUI.buildUnitGroup.setVisible(true);
		}
	};
	document.addEventListener('keydown', keydown);
	
	var keyup = function(event) { // keyup event listener
		if (event.keyCode == 37 || event.keyCode == 65) { // left
			me.gcUI.camera.isMovingLeft = false;
		} else if (event.keyCode == 39 || event.keyCode == 68) { // right
			me.gcUI.camera.isMovingRight = false;
		} else if (event.keyCode == 38 || event.keyCode == 87) { // up
			me.gcUI.camera.isMovingUp = false;
		} else if (event.keyCode == 40 || event.keyCode == 83) { // down
			me.gcUI.camera.isMovingDown = false;
		}
	};
	document.addEventListener('keyup', keyup);
	
	// Build button
	me.gcUI.buttons.build.on('mouseover', function(){
	  me.gcUI.buttons.build.setImage(me.buttonImgs.lit.build);
	  document.body.style.cursor = "pointer";
	});
	me.gcUI.buttons.build.on('mouseout', function(){
	  me.gcUI.buttons.build.setImage(me.buttonImgs.unlit.build);
	  document.body.style.cursor = "auto";
	});
	// TODO!!!!!!!!!!
	me.gcUI.buttons.build.on('click', function(){
	  if (!me.buildUnitFlagUnitGroup.getVisible()) {
		  me.buildUnitFlag = true;
		  me.toBuild = null;
		  me.hexgrid.clientClearReachable();
		  me.hexgrid.clientClearAttackable();
		  me.hexgrid.clientClearBuildable();
		  me.buildUnitFlagUnitGroup.setVisible(true);
	  } else {
		  me.buildUnitFlagUnitGroup.setVisible(false);
		  me.buildUnitFlag = false;
	  }
	});
}