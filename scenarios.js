/**
 * A big JavaScript object that contains all scenarios.
 */
var Scenarios = {
	"tutorial_1": {
		"size": {"x": 1500, "y": 1200, "numRows": 11, "numCols": 11},
		"offset": 40,
		"terrain": (function(){
			var terrain = [];
			// all initialized to thron
			for (var i = 0; i < 11; i++) {
				terrain.push([]);
				for (var j = 0; j < 11; j++) {
					terrain[i][j] = "thron";
				}
			}
			// add movable hexs
			terrain[3][5] = null;
			terrain[3][6] = null;
			terrain[3][7] = null;
			terrain[4][4] = null;
			terrain[4][5] = null;
			terrain[4][6] = null;
			terrain[4][7] = null;
			terrain[5][3] = null;
			terrain[5][4] = null;
			terrain[5][5] = null;
			terrain[5][6] = null;
			terrain[5][7] = null;
			terrain[6][3] = null;
			terrain[6][4] = null;
			terrain[6][5] = null;
			terrain[6][6] = null;
			terrain[7][3] = null;
			terrain[7][4] = null;
			terrain[7][5] = null;
			return terrain;
		})(),
		"startpoint": {
			0: [[3,5], [5,3]],
			1: [[5,7], [7,5]]
		},
		"startunits": {
			0: [0, 3],
			1: [1, 4]
		},
		"revealtype": true
	},
	
	"captureflag": {
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
			terrain[4][5] = "thron";
			terrain[5][4] = "thron";
			terrain[5][6] = "thron";
			terrain[6][5] = "thron";
			return terrain;
		})(),
		"startpoint": {
			0: [[0,4], [1,3], [2,2], [3,1], [4,0]],
			1: [[6,10], [7,9], [8,8], [9,7], [10,6]],
			2: [],
			3: []
		},
		"startunits": {
			0: [0, 1, 2, 3, 4],
			1: [0, 1, 2, 3, 4],
			2: [0, 1, 2, 3, 4],
			3: [0, 1, 2, 3, 4]
		},
		"revealtype": false
	}
};


// server side we export Point and Coordinate.
if( 'undefined' != typeof global ) {
    exports.Scenarios = Scenarios;
}