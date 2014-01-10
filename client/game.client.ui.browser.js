/**
 * Client UI controls in browser platform.
 */ 

/**
 * The game client UI for browser.
 */
var gcUIBrowser = function(/*GameClient*/ gc, /*GameClientUI*/ gcUI){
    this.gc = gc;
	this.gcUI = gcUI;
}

/**
 * Register event listeners for mouse and keyboard actions performed in
 * a desktop-version browser.
 */
this.gcUIBrowser.prototype.registerEventListeners = function(){
    var gc = this.gc;
    var gcUI = this.gcUI;
	
    // Event listener for mouse move to move the camera
	var mousemove = function(event){
		var x = event.pageX;
		var y = event.pageY;
		var offsetLeft = stage.getContainer().offsetLeft;
		var offsetTop = stage.getContainer().offsetTop;
		if (x < offsetLeft){
			gcUI.camera.isMovingLeft = true;
		} else {
			gcUI.camera.isMovingLeft = false;
		}
		if (x > offsetLeft+CONSTANTS.width){
			gcUI.camera.isMovingRight = true;
		} else {
			gcUI.camera.isMovingRight = false;
		}
		if (y < offsetTop){
			gcUI.camera.isMovingUp = true;
		} else {
			gcUI.camera.isMovingUp = false;
		}
		if (y > offsetTop+CONSTANTS.height){
			gcUI.camera.isMovingDown = true;
		} else {
			gcUI.camera.isMovingDown = false;
		}
	};
	document.addEventListener("mousemove", mousemove);
	
    // Event listener for right click to cancel the current operation
	var contextmenu = function(event){
		var x = event.pageX;
		var y = event.pageY;
		var offsetLeft = stage.getContainer().offsetLeft;
		var offsetTop = stage.getContainer().offsetTop;
		if (x >= offsetLeft && x <= offsetLeft + CONSTANTS.width && y >= offsetTop && y <= offsetTop + CONSTANTS.height){
			event.preventDefault();
            gc.lastClickCoord = null;
			gc.hexgrid.clearReachable();
			gc.hexgrid.clearAttackable();
			if (gc.guess){
                // TODO: provide a method for this!
				gc.hexgrid.matrix[gcUI.guess.X][gcUI.guess.Y].guessing = false;
				gc.guess = null;
			}
			gc.build = false;
			gc.toBuild = null;
			gc.hexgrid.clearBuildable();
		}
	};
	document.addEventListener('contextmenu', contextmenu);
	
    // Event listener for pressing down a key to move the camera, make a
    // guess, or build a new unit.
	var keydown = function(event){
		if (event.keyCode === 37 || event.keyCode === 65){ // left or a
			gcUI.camera.isMovingLeft = true;
		} else if (event.keyCode === 39 || event.keyCode === 68){ // right or d
			gcUI.camera.isMovingRight = true;
		} else if (event.keyCode === 38 || event.keyCode === 87){ // up or w
			gcUI.camera.isMovingUp = true;
		} else if (event.keyCode === 40 || event.keyCode === 83){ // down or s
			gcUI.camera.isMovingDown = true;
		}
        
		if (event.keyCode === 49 || event.keyCode === 50 || event.keyCode === 51 ||
            event.keyCode === 52 || event.keyCode === 53){ // 1, 2, 3, 4, or 5
            var numberOfGuess = event.keyCode - 49;
			if (gc.guess){
				gc.hexgrid.getUnit(gc.guess).guess(numberOfGuess);
                // TODO: provide a method for this!
				gc.hexgrid.matrix[gc.guess.X][gc.guess.Y].guessing = false;
				gc.guess = null;
			}
			if (gc.build){
				if(gc.resource >= CONSTANTS.cost[numberOfGuess]){
					gc.toBuild = numberOfGuess;
					gc.hexgrid.markBuildable(gc.player);
				}
				gc.build = false;
			}
		}
		
		if (event.keyCode === 54){  // 6
			if (gc.guess){
				gc.hexgrid.getUnit(gc.guess).guess(5);
				gc.hexgrid.matrix[gc.guess.X][gc.guess.Y].guessing = false;
				gc.guess = null;
			}
			gc.build = false;
			gc.toBuild = null;
			gc.hexgrid.clearBuildable();
		}
        
		if (event.keyCode === 81){  // q
			gc.build = true;
			gc.toBuild = null;
			gc.hexgrid.clearReachable();
			gc.hexgrid.clearAttackable();
			gc.hexgrid.clearBuildable();
			gc.buildUnitGroup.setVisible(true);
		}
	};
	document.addEventListener('keydown', keydown);
	
    // Event listener for releasing a key to stop moving the camera.
	var keyup = function(event){
		if (event.keyCode === 37 || event.keyCode === 65){ // left or a
			gcUI.camera.isMovingLeft = false;
		} else if (event.keyCode === 39 || event.keyCode === 68){ // right or d
			gcUI.camera.isMovingRight = false;
		} else if (event.keyCode === 38 || event.keyCode === 87){ // up or w
			gcUI.camera.isMovingUp = false;
		} else if (event.keyCode === 40 || event.keyCode === 83){ // down or s
			gcUI.camera.isMovingDown = false;
		}
	};
	document.addEventListener('keyup', keyup);
	
	// Event listeners for mouseover and mouseout on topbar buttons.
	gcUI.buttons.build.on('mouseover', function(){
        gcUI.buttons.build.setImage(buttonImgs.lit.build);
        document.body.style.cursor = "pointer";
	});
	gcUI.buttons.build.on('mouseout', function(){
        gcUI.buttons.build.setImage(buttonImgs.unlit.build);
        document.body.style.cursor = "auto";
	});
    gcUI.buttons.build.on('click', function(){
        if (!gc.buildUnitFlagUnitGroup.getVisible()){
            gc.buildUnitFlag = true;
            gc.toBuild = null;
            gc.hexgrid.clearReachable();
            gc.hexgrid.clearAttackable();
            gc.hexgrid.clearBuildable();
            gc.buildUnitFlagUnitGroup.setVisible(true);
        } else {
            gc.buildUnitFlagUnitGroup.setVisible(false);
            gc.buildUnitFlag = false;
        }
	});
    gcUI.buttons.menu.on('mouseover', function(){
        gcUI.buttons.menu.setImage(buttonImgs.lit.menu);
        document.body.style.cursor = "pointer";
    });
    gcUI.buttons.menu.on('mouseout', function(){
        gcUI.buttons.menu.setImage(buttonImgs.unlit.menu);
        document.body.style.cursor = "auto";
    });
    gcUI.buttons.sound.on('mouseover', function(){
        if (gcUI.soundOn){
            gcUI.buttons.sound.setImage(gcUI.buttonImgs.lit.sound);
        } else {
            gcUI.buttons.sound.setImage(gcUI.buttonImgs.lit.mute);
        }
        document.body.style.cursor = "pointer";
    });
    gcUI.buttons.sound.on('mouseout', function(){
        if (gcUI.soundOn){
            gcUI.buttons.sound.setImage(gcUI.buttonImgs.unlit.sound);
        } else {
            gcUI.buttons.sound.setImage(gcUI.buttonImgs.unlit.mute);
        }
        document.body.style.cursor = "auto";
    });
    gcUI.buttons.sound.on('click', function(){
        if (gcUI.soundOn){
            gcUI.soundOn = false;
            gcUI.buttons.sound.setImage(gcUI.buttonImgs.lit.mute);
        } else {
            gcUI.soundOn = true;
            gcUI.buttons.sound.setImage(gcUI.buttonImgs.lit.sound);
      }
    });
    
    // Event listeners for build unit buttons.
    for (var i = 0; i < 5; i++){
        gcUI.buildUnitButtons[i].on('mouseover', function(temp){
            return function(){
                if (gc.canBuildUnit[temp]){
                    gcUI.buildUnitButtons[temp].setImage(gcUI.buildUnitImgs.lit[temp]);
                    document.body.style.cursor = "pointer";
                }
            }
        }(i));
        gcUI.buildUnitButtons[i].on('mouseout', function(temp){
            return function(){
                if (gc.canBuildUnit[temp]){
                    gcUI.buildUnitButtons[temp].setImage(gcUI.buildUnitImgs.unlit[temp]);
                    document.body.style.cursor = "auto";
                }
            }
        }(i));
        this.buildUnitButtons[i].on('click', function(temp){
            return function(){
                if (gc.canBuildUnit[temp]){
                    gc.toBuild = temp;
                    gc.hexgrid.markBuildable(gc.player);
                }
            }
        }(i));
    }
    
    // Register a callback function for click events on a hexagon.
    var clickCallback = function(coord, event){
        if (!gc.alive){
            return;
        }
        
        if (event.which === 3){  // trigger right click event
            gc.contextmenu(event);
        }
        
        var unitplayer = -1;
        if (!gc.hexgrid.getUnit(coord)){
            if (gc.toBuild){
                gc.mainSocket.send('1 build ' + gc.toBuild + ' ' + coord.X +' ' + coord.Y);
            }
            gc.build = false;
            gc.toBuild = null;
            gc.hexgrid.clearBuildable();
            gcUI.buildUnitGroup.setVisible(false);
        } else {
            unitplayer = gc.hexgrid.getUnit(coord).player;
        }
        
        var isReachable = gc.hexgrid.isReachable(coord);
        var isAttackable = gc.hexgrid.isAttackable(coord);
        if (gc.guess){  // TODO: provide a method for this
            gc.hexgrid.matrix[gc.guess.X][gc.guess.Y].guessing = false;
        }
        gc.guess = null;
        
        // some unit has been selected, and some hexagon without this player's unit has been clicked
        if (gc.lastClickCoord && (unitplayer !== gc.player)){
            if (isReachable){  // Move unit
                gc.mainSocket.send('1 move ' + gc.lastClickCoord.X +' ' + gc.lastClickCoord.Y + ' ' + coord.X +' ' + coord.Y);
            } else if (isAttackable){  // Attack unit
                gc.mainSocket.send('1 attack ' + gc.lastClickCoord.X +' ' + gc.lastClickCoord.Y + ' ' + coord.X + ' ' + coord.Y);
            }
            gc.hexgrid.clearReachable();
            gc.hexgrid.clearAttackable();
            gc.hexgrid.clearBuildable();
            gc.lastClickCoord = null;
            gc.build = false;
            gc.toBuild = null;
        }
        
        // some hexagon with this player's unit has been clicked, select that unit
        else if (unitplayer === gc.player){
            gc.hexgrid.clearReachable();
            gc.hexgrid.clearAttackable();
            if (gc.hexgrid.getUnit(coord).cooldown <= 0){
                gc.lastClickCoord = coord;
                gc.hexgrid.markReachable(coord);
                gc.hexgrid.markAttackable(coord,coord);
            }
            gc.build = false;
            gc.toBuild = null;
            gc.hexgrid.clearBuildable();
        } else {
            if (gc.hexgrid.getUnit(coord)){
                gc.guess = coord;
                // TODO: provide a method for this!
                gc.hexgrid.matrix[coord.X][coord.Y].guessing = true;
            }
            gc.build = false;
            gc.toBuild = null;
            gc.hexgrid.clearBuildable();
        }
    };
    // TODO: register this callback
}