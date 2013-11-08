/**
 * Client UI controls in browser platform.
 */ 

var gcUIBrowser = function(/*GameClient*/ gc, /*GameClientUI*/ gcUI) {
    this.gc = gc;
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
			me.gc.lastClickCoord = null;
			me.gc.hexgrid.clientClearReachable();
			me.gc.hexgrid.clientClearAttackable();
			if(me.gc.guess){
				me.gc.hexgrid.matrix[me.gcUI.guess.X][me.gcUI.guess.Y].guessing = false;
				me.gc.guess = null;
			}
			me.gc.build = false;
			me.gc.toBuild = null;

			me.gc.hexgrid.clientClearBuildable();
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
			if(me.gc.guess){
				me.gc.hexgrid.getUnit(me.gc.guess).guess(0);
				me.gc.hexgrid.matrix[me.gc.guess.X][me.gc.guess.Y].guessing = false;
				me.gc.guess = null;
			}
			if(me.gc.build){
				if(me.gc.resource >= CONSTANTS.cost[0]){
					me.gc.toBuild = 0;
					me.gc.hexgrid.clientMarkBuildable(me.gc.player);
				}
				me.gc.build = false;
			}
		}
		if (event.keyCode == 50){
			if(me.gc.guess){
				me.gc.hexgrid.getUnit(me.gc.guess).guess(1);
				me.gc.hexgrid.matrix[me.gc.guess.X][me.gc.guess.Y].guessing = false;
				me.gc.guess = null;
			}
			if(me.gc.build){
				if(me.gc.resource >= CONSTANTS.cost[1]){
					me.gc.toBuild = 1;
					me.gc.hexgrid.clientMarkBuildable(me.gc.player);
				}
				me.gc.build = false;
			}
		}
		if (event.keyCode == 51){
			if(me.gc.guess){
				me.gc.hexgrid.getUnit(me.gc.guess).guess(2);
				me.gc.hexgrid.matrix[me.gc.guess.X][me.gc.guess.Y].guessing = false;
				me.gc.guess = null;
			}
			if(me.gc.build){
				if(me.gc.resource >= CONSTANTS.cost[2]){
					me.gc.toBuild = 2;
					me.gc.hexgrid.clientMarkBuildable(me.gc.player);
				}
				me.gc.build = false;
			}
		}
		if (event.keyCode == 52){
			if(me.gc.guess){
				me.gc.hexgrid.getUnit(me.gc.guess).guess(3);
				me.gc.hexgrid.matrix[me.gc.guess.X][me.gc.guess.Y].guessing = false;
				me.gc.guess = null;
			}
			if(me.gc.build){
				if(me.gc.resource >= CONSTANTS.cost[3]){
					me.gc.toBuild = 3;
					me.gc.hexgrid.clientMarkBuildable(me.gc.player);
				}
				me.gc.build = false;
			}
		}
		if (event.keyCode == 53){
			if(me.gc.guess){
				me.gc.hexgrid.getUnit(me.gc.guess).guess(4);
				me.gc.hexgrid.matrix[me.gc.guess.X][me.gc.guess.Y].guessing = false;
				me.gc.guess = null;
			}
			if(me.gc.build){
				if(me.gc.resource >= CONSTANTS.cost[4]){
					me.gc.toBuild = 4;
					me.gc.hexgrid.clientMarkBuildable(me.gc.player);
				}
				me.gc.build = false;
			}
		}
		if (event.keyCode == 54){
			if(me.gc.guess){
				me.gc.hexgrid.getUnit(me.gc.guess).guess(5);
				me.gc.hexgrid.matrix[me.gc.guess.X][me.gc.guess.Y].guessing = false;
				me.gc.guess = null;
			}
			me.gc.build = false;
			me.gc.toBuild = null;
			me.gc.hexgrid.clientClearBuildable();
		}	
		if (event.keyCode == 81){
			me.gc.build = true;
			me.gc.toBuild = null;
			me.gc.hexgrid.clientClearReachable();
			me.gc.hexgrid.clientClearAttackable();
			me.gc.hexgrid.clientClearBuildable();
			me.gc.buildUnitGroup.setVisible(true);
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
        if (!me.gc.buildUnitFlagUnitGroup.getVisible()) {
            me.gc.buildUnitFlag = true;
            me.gc.toBuild = null;
            me.gc.hexgrid.clientClearReachable();
            me.gc.hexgrid.clientClearAttackable();
            me.gc.hexgrid.clientClearBuildable();
            me.gc.buildUnitFlagUnitGroup.setVisible(true);
        } else {
            me.gc.buildUnitFlagUnitGroup.setVisible(false);
            me.gc.buildUnitFlag = false;
        }
	});
    
    // callback function for click events on a hexagon
    var clickCallback = function(coord, event){
        if (!me.gc.alive) {
            return;
        }
        if (event.which == 3) {  // trigger right click event
            me.gc.contextmenu(event);
        }
        var unitplayer = -1;
        if (me.gc.hexgrid.getUnit(coord)==null) {
            if(!(me.gc.toBuild===null)){
                me.gc.mainSocket.send('1 build ' + me.gc.toBuild + ' ' + coord.X +' ' + coord.Y);
            }
            me.gc.build = false;
            me.gc.toBuild = null;
            me.gc.hexgrid.clientClearBuildable();
            me.gc.buildUnitGroup.setVisible(false);  // TODO: does not exist
        }else{
            unitplayer = me.gc.hexgrid.getUnit(coord).player;
        }
        var isReachable = me.gc.hexgrid.isReachable(coord);
        var isAttackable = me.gc.hexgrid.isAttackable(coord);
        if(me.gc.guess){
            me.gc.hexgrid.matrix[me.gc.guess.X][me.gc.guess.Y].guessing = false;
        }
        me.gc.guess = null;
        // some unit has been selected, and some hexagon without this player's unit has been clicked
        if (me.gc.lastClickCoord && (unitplayer != me.gc.player)) {
            if (isReachable) {  // Move unit
                me.gc.mainSocket.send('1 move ' + me.gc.lastClickCoord.X +' ' + me.gc.lastClickCoord.Y + ' ' + coord.X +' ' + coord.Y);
            } else if (isAttackable) {  // Attack unit
                me.gc.mainSocket.send('1 attack ' + me.gc.lastClickCoord.X +' ' + me.gc.lastClickCoord.Y + ' ' + coord.X + ' ' + coord.Y);
            }
            me.gc.hexgrid.clientClearReachable();
            me.gc.hexgrid.clientClearAttackable();
            me.gc.hexgrid.clientClearBuildable();
            me.gc.lastClickCoord = null;
            me.gc.build = false;
            me.gc.toBuild = null;
        }
        // some hexagon with this player's unit has been clicked, select that unit
        else if (unitplayer == me.gc.player) {
            me.gc.hexgrid.clientClearReachable();
            me.gc.hexgrid.clientClearAttackable();
            if (me.gc.hexgrid.getUnit(coord).cooldown<=0) {
                me.gc.lastClickCoord = coord;
                me.gc.hexgrid.clientMarkReachable(coord);
                me.gc.hexgrid.clientMarkAttackable(coord,coord);
            }
            me.gc.build = false;
            me.gc.toBuild = null;
            me.gc.hexgrid.clientClearBuildable();
        }else{
            if(me.gc.hexgrid.getUnit(coord)){
                me.gc.guess = coord;
                me.gc.hexgrid.matrix[coord.X][coord.Y].guessing = true;
            }
            me.gc.build = false;
            me.gc.toBuild = null;
            me.gc.hexgrid.clientClearBuildable();
        }
    };
    // TODO: register this callback
}