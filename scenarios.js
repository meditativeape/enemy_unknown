/**
 * A big JavaScript object that contains all scenarios.
 */
var Scenarios = {
	"tutorial_1": {
		"size": {"x": 2300, "y": 1500, "numRows": 11, "numCols": 11},
		"offset": 50,
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
	
	"slayer": {
		"size": {"x": 2300, "y": 1500, "numRows": 11, "numCols": 11},
		"offset": 50,
		"terrain": (function(){
			var terrain = [];
			// all initialized to null
			for (var i = 0; i < 11; i++) {
				terrain.push([]);
				for (var j = 0; j < 11; j++) {
					terrain[i][j] = null;
				}
			}
			// add throns
			terrain[2][6] = "thron";
			terrain[2][7] = "thron";
			terrain[2][8] = "thron";
			terrain[3][5] = "thron";
			terrain[3][6] = "thron";
			terrain[3][7] = "thron";
			terrain[3][8] = "thron";
			terrain[4][4] = "thron";
			terrain[4][7] = "thron";
			terrain[4][8] = "thron";
			terrain[5][3] = "thron";
			terrain[5][7] = "thron";
			terrain[6][2] = "thron";
			terrain[6][3] = "thron";
			terrain[6][6] = "thron";
			terrain[7][2] = "thron";
			terrain[7][3] = "thron";
			terrain[7][4] = "thron";
			terrain[7][5] = "thron";
			terrain[8][2] = "thron";
			terrain[8][3] = "thron";
			terrain[8][4] = "thron";
			// add resource
			terrain[5][5] = "resource";
            terrain[0][10] = "resource";
            terrain[10][0] = "resource";
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
		"resource": {
			0: 30,
			1: 30,
			2: 30,
			3: 30
		},
		"revealtype": false
	},
	
	"captureflag": {
		"size": {"x": 2300, "y": 1500, "numRows": 11, "numCols": 11},
		"offset": 50,
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
	},

	"vampirehunter": {
		"size": {"x": 2300, "y": 1500, "numRows": 11, "numCols": 11},
		"offset": 50,
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
			0: [[3,5], [4,4],[5,3],[4,3],[3,4]],
			1: [[5,7],[6,6], [7,5],[7,6],[6,7]]
		},
		"startunits": {
			0: [0, 1, 1 ,3,3],
			1: [2,2,2,2, 4]
		},
		"revealtype": false
	},
	"zombieisbetter": {
		"size": {"x": 2300, "y": 1500, "numRows": 11, "numCols": 11},
		"offset": 50,
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
			0: [[3,5], [4,4],[5,3],[4,3],[3,4]],
			1: [[5,7],[6,6], [7,5],[7,6],[6,7]]
		},
		"startunits": {
			0: [0, 0, 0 ,0,2],
			1: [1,4,4,4, 4]
		},
		"revealtype": false
	},
	"rockpapersissors": {
		"size": {"x": 2300, "y": 1500, "numRows": 11, "numCols": 11},
		"offset": 50,
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
			0: [[3,5], [4,4],[5,3]],
			1: [[5,7],[6,6], [7,5]]
		},
		"startunits": {
			0: [4, 3, 0],
			1: [4, 3, 0]
		},
		"revealtype": false
	},
	
	"warzone": {
		"size": {"x": 2300, "y": 1500, "numRows": 11, "numCols": 11},
		"offset": 50,
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
			0: [[0,4], [1,3], [2,2], [3,1],[4,0],[2,3],[3,2]],
			1: [[6,10], [7,9], [8,8], [9,7], [10,6],[7,8],[8,7]],
		},
		"startunits": {
			0: [0, 1,1,2,2,3,4],
			1: [0,1,1,2,2,3,4]
		},
		"revealtype": false
	}
};


// server side we export Point and Coordinate.
if( 'undefined' != typeof global ) {
    exports.Scenarios = Scenarios;
}