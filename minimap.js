/**

	Build a new miniMap object.
	
	camera: a camera object.
	mapSize: an array of length 2 indicating the width and height of the map.
	width: an integer, which is the actual width of the minimap on the screen.

 **/
 
 var BuildMiniMap = function(camera, mapSize, width){
	
	var me = this;
	
	// fields
	this.camera = camera;
	this.canvas = document.getElementById('gameCanvas');
	this.mapSize = mapSize;
	this.width = width;
	this.height = Math.floor(mapSize[1]/(mapSize[0]/width));
	
	// methods
	this.draw = function(img){
		var ctx = this.canvas.getContext('2d');
		// draw on top-left corner
		ctx.drawImage(img, 0, 0, this.mapSize[0], this.mapSize[1], 0, 0, this.width, this.height);
		// draw the rims
		ctx.lineWidth = 2;
		ctx.strokeStyle = 'rgb(255, 255, 255)';
		ctx.beginPath();
		ctx.moveTo(this.width+1, 0);
		ctx.lineTo(this.width+1, this.height+1);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(0, this.height+1);
		ctx.lineTo(this.width+1, this.height+1);
		ctx.stroke();
		// draw the camera box
		ctx.lineWidth = 1;
		ctx.strokeStyle = 'rgb(255, 165, 0)';
		var boxSize = [Math.floor(this.width*this.canvas.width/mapSize[0]), Math.floor(this.height*this.canvas.height/mapSize[1])];
		var boxPos = new Point(Math.floor(camera.pos.X*this.width/mapSize[0]), Math.floor(camera.pos.Y*this.height/mapSize[1]));
		ctx.strokeRect(boxPos.X, boxPos.Y, boxSize[0], boxSize[1]);
	};
	
	this.click = function(event){
		var x = event.pageX - me.canvas.offsetLeft;
		var y = event.pageY - me.canvas.offsetTop;
		if (x <= me.width && y <= me.height) {
			var mapX = x/me.width*me.mapSize[0] - me.canvas.width/2;
			var mapY = y/me.height*me.mapSize[1] - me.canvas.height/2;
			me.camera.setPos(mapX, mapY);
		}
	};
	
 };