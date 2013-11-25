var CreateMapLayerAnimation = function(camera, hexgrid, minimap, mapLayer){
    return new Kinetic.Animation(function(frame) {
        // camera
        if (camera.isMovingLeft) {
            camera.moveLeft();
        }
        if (camera.isMovingRight) {
            camera.moveRight();
        }
        if (camera.isMovingUp) {
            camera.moveUp();
        }
        if (camera.isMovingDown) {
            camera.moveDown();
        }
        camera.redrawCamera();
        
        // hexgrid
        for(var x in hexgrid.matrix){
            for(var y in hexgrid.matrix[x]){
                hexgrid.matrix[x][y].update();
            }
        }
        
        // minimap
        // minimap.cameraBox.setX(Math.floor(camera.x*minimap.width/minimap.mapSize[0]));
        // minimap.cameraBox.setY(Math.floor(camera.y*minimap.height/minimap.mapSize[1]));
        minimap.cameraBox.move(Math.floor(camera.x*minimap.width/minimap.mapSize[0]) - minimap.cameraBox.getX(),
                               Math.floor(camera.y*minimap.height/minimap.mapSize[1]) - minimap.cameraBox.getY());
    }, mapLayer);
}