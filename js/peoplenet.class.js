'use strict';
/*
 * Base class for the Maze
 */
class PeopleNet {
	
	constructor( props ) {

		this.route = [];
		this.maze = null;
		this.rows = null;
		this.columns = null;
		this.name = 'short-matrix';

		if ( props ) {
			this.metrics = props.metrics;
			this.rows = props.rows;
			this.columns = props.columns;
			this.name = props.name;
			this.coordinates = {
				start: props.start,
				end: props.end
			}
		}

	}

	/*
	 * Method to find the Shortest route using BFS
	 */

	findShortRoute() {

		let queue = [];
		let position = this.coordinates.start;
		let end = this.coordinates.end;
		let matrix = this.metrics;
		
		matrix[position[0]][position[1]] = 1;
		queue.push( [position] ); /* store a path, not just a position */

		while ( queue.length > 0 ) {
		    let path = queue.shift(); /* get the path out of the queue */
		    let pos = path[path.length-1]; /* and then the last position from it */

		    let direction = this.getAdjacentPaths( this.coordinates.start[ 0 ], this.coordinates.start[ 1 ], this.metrics.length, pos );
		    let i = 0;
		    for ( ; i < direction.length; i++ ) {
		      /* erform this check first: */
		      if ( direction[i][0] == end[0] && direction[i][1] == end[1] ) {
		       /*return the path that led to the find*/
		        this.routes = path.concat([end]);
		        this.route = this.compareLengthAndPickSmallest( this.routes ); 
		        return this.route;
		      }
		      
		      if ( direction[i][0] < 0 || direction[i][0] >= matrix[0].length 
		          || direction[i][1] < 0 || direction[i][1] >= matrix[0].length 
		          || matrix[direction[i][0]][direction[i][1]] != 0 ) { 
		        continue;
		      }

		      matrix[direction[i][0]][direction[i][1]] = 1;
		      /* extend and push the path on the queue */
		      queue.push( path.concat( [direction[i]]) ); 
		    }
	  	}
		
	}

	/*
	 * To find the Adjacent cells from the current position
	 */

	getAdjacentPaths(  x, y, size, grid ) {

        if ( x == 0 ) {
            if ( y == 0 ) {
             return  [ 
                  [ grid[0] + 1, grid[1] ],
                  [ grid[0], grid[1] + 1 ]
                ];
            } else if ( y == size - 1 ) {
               return [ 
                  [ grid[0]+ 1, grid[1] ],
                  [ grid[0], grid[y]- 1 ]
                ];
            } else {
                return [ 
                  [ grid[0]+ 1, grid[1] ],
                  [ grid[0], grid[1] + 1 ],
                  [ grid[0], grid[1] - 1 ]
                ];
            }
        } else if ( x == size - 1 ) {
            if ( y == size - 1 ) {
                return [ 
                  [ grid[0] - 1, grid[1] ],
                  [ grid[0], grid[1] - 1 ],
                  [ grid[0], grid[1] + 1 ]
                ];
            } else if ( y == 0 ) {
               return  [ 
                  [ grid[0] - 1, grid[1] ],
                  [ grid[0], grid[1] + 1 ]
                ];
            } else {
                return [ 
                  [ grid[0] - 1, grid[1] ],
                  [ grid[0], grid[1] - 1 ],
                  [ grid[0], grid[1] + 1 ]
                ];
            }
        } else if ( y == 0 ) {
                return [ 
                  [ grid[0] + 1, grid[1] ],
                  [ grid[0] - 1, grid[1] ],
                  [ grid[0], grid[1] + 1 ]
                ];
        } else if ( y == size - 1 ) {
               return [ 
                  [ grid[0] + 1, grid[1] ],
                  [ grid[0] - 1, grid[1] ],
                  [ grid[0], grid[y] - 1 ]
                ];
        } else {
               return [ 
              [grid[0] + 1, grid[1]],
              [grid[0], grid[1] + 1],
              [grid[0] - 1, grid[1]],
              [grid[0], grid[1] - 1] 
            ];
        }

	}

	/*
	 * Pick the shortest route from the results array
	 */

	compareLengthAndPickSmallest( routes ) {

		const route = [];
		if ( routes ) {
			let i = 0;
			let cols;
			const routeTemp = [];
			const routeTempInfo = [];
			let routeLength = routes.length;
			for( ; i < routeLength; i++ ) {
				routeTempInfo.push( routes[ i ] )
				routeTemp.push( routes[ i ].length );
			}
			if ( routeTemp && routeTemp.length > 0 ) {
				for ( cols in routeTempInfo ) {
					route.push( { x: routeTempInfo[ cols ][0], y: routeTempInfo[ cols ][1] } );
				}
			}
		}

		return route;
	}

	/*
	 * Generate Maze from the shortest route
	 */

	generateMaze() {

		this.findShortRoute();

		if ( this.route && this.route.length > 0 ) {
			const rows = this.rows;
			const columns = this.columns;
    		let xHtml = "<div class='"+this.name+"'>";
    		let y;
    		let x;

		    for( y = 0; y < rows; y++  ) {
		        xHtml += "<div class='rows-maze'>";
		        for ( x = 0; x < columns; x++  ) {
		            let filteredValue = this.route.filter( ( item ) => { return item.x == y && item.y == x  } );
		            if ( filteredValue.length > 0 ) {
		                 xHtml += "<div class='columns-maze columns-maze-white'>";
		            } else {
		                xHtml += "<div class='columns-maze'>";
		            }
		            if ( x == this.coordinates.start[ 1 ] && this.coordinates.start[ 0 ] == y ) {
		            	xHtml += 'A';
		            }
		            if ( x == this.coordinates.end[ 1 ] && this.coordinates.end[ 0 ] == y ) {
		            	xHtml += 'B';
		            }
		            xHtml += "</div>";
		        }
		        xHtml += "</div>";
		    }

		    xHtml +="</div>"

		    this.maze = xHtml;
		}
	    return {
	    	maze: this.maze,
	    	path: this.route
	    };
	}

}
