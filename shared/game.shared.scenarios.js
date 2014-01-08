/**
 * Game scenarios.
 */
 
/**
 * Server side we export Scenarios.
 */
if( 'undefined' != typeof global ) {
    exports.Scenarios = Scenarios;
}

/**
 * A big JavaScript object that contains all scenarios.
 */
var Scenarios = {
	"tutorial_1": {
		"size": {"numRows": 11, "numCols": 11},
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
        "startcamera": {
            0: [5, 5],
            1: [5, 5]
        },
        "resource": {
			0: 30,
			1: 30
		},
		"revealtype": true,
        "fog": false
	},
	
	"slayer": {
		"size": {"numRows": 11, "numCols": 11},
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
            terrain[0][10] = "resource";
            terrain[10][0] = "resource";
            // add flag
            terrain[5][5] = "flag";
			return terrain;
		})(),
		"startpoint": {
			0: [[0,4], [1,3], [2,2], [3,1], [4,0]],
			1: [[6,10], [7,9], [8,8], [9,7], [10,6]]
		},
		"startunits": {
			0: [0, 1, 2, 3, 4],
			1: [0, 1, 2, 3, 4]
		},
		"resource": {
			0: 30,
			1: 30
		},
        "startcamera": {
            0: [2, 4],
            1: [7, 7]
        },
		"revealtype": false,
        "fog": true
	},
	
	"captureflag": {
		"size": {"numRows": 11, "numCols": 11},
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
        "startcamera": {
            0: [2, 4],
            1: [7, 7]
        },
		"revealtype": false,
        "fog": true
	},

	"vampirehunter": {
		"size": {"numRows": 11, "numCols": 11},
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
        "startcamera": {
            0: [4, 4],
            1: [5, 6]
        },
		"revealtype": false,
        "fog": true
	},
    
	"zombieisbetter": {
		"size": {"numRows": 11, "numCols": 11},
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
        "startcamera": {
            0: [4, 4],
            1: [5, 6]
        },
		"revealtype": false,
        "fog": true
	},
	"rockpapersissors": {
		"size": {"numRows": 11, "numCols": 11},
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
        "startcamera": {
            0: [4, 4],
            1: [5, 6]
        },
		"revealtype": false,
        "fog": true
	},
	
	"warzone": {
		"size": {"numRows": 11, "numCols": 11},
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
        "startcamera": {
            0: [3, 3],
            1: [7, 7]
        },
		"revealtype": false,
        "fog": true
	}
};


