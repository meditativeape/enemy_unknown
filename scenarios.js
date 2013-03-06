/**
 * A big JavaScript object that contains all scenarios.
 */
var Scenarios = {
	"default": {
		"size": {"x": 1500, "y": 1200, "numRows": 11, "numCols": 11},
		"offset": 40,
		"terrain": (function(){
			var terrain = [];
			// all initialized to null
			for (var i = 0; i < 11; i++) {
				terrain.push([]);
				for (var j = 0; j < 11; j++) {
					terrain[i][j] = null;
				}
			}
			// add special terrains
			terrain[5][5] = "flag";
			terrain[4][5] = "water";
			terrain[5][4] = "water";
			terrain[5][6] = "water";
			terrain[6][5] = "water";
			return terrain;
		})(),
		"startpoint": {
			1: [[0,4], [1,3], [2,2], [3,1], [4,0]],
			2: [[6,10], [7,9], [8,8], [9,7], [10,6]],
			3: [],
			4: []
		}
	}
};


// server side we export Point and Coordinate.
if( 'undefined' != typeof global ) {
    exports.Scenarios = Scenarios;
}