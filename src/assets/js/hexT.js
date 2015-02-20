//hex-timeline
/*
 *   _____      _     _ 
 *  / ____|    (_)   | |
 * | |  __ _ __ _  __| |
 * | | |_ | '__| |/ _` |
 * | |__| | |  | | (_| |
 *  \_____|_|  |_|\__,_|
 */
                      

function Grid(gridWidth,gridHeight,TileSize,regioncount) { 
    /**
     * There are 6 neighbors for every Tile, the direction input is below:
     *      __
     *   __/  \__
     *  /  \_3/  \
     *  \_2/  \4_/
     *  / 1\__/5 \
     *  \__/0 \__/
     *     \__/
     */
    this.nDelta = {
        even: [ [1,  0], [ 0, -1], [-1, -1],
                [-1,  0], [-1, 1], [ 0, 1] ],
        odd: [ [1,  0], [1, -1], [ 0, -1],
               [-1,  0], [ 0, 1], [1, 1] ]
    }
    this.gridWidth          = gridWidth;
    this.gridHeight         = gridHeight;
    this.Tilesize           = Tilesize;
    this.TileWidth          = this.Tilesize * 2;
    this.TileHeight         = Math.sqrt(3)/2 * this.TileWidth; 
    this.verticalSpacing    = this.TileHeight;
    this.horizontalSpacing  = 3/4 * this.TileWidth;
    this.maxRows            = Math.floor((this.gridHeight / this.verticalSpacing)) - 1;
    this.maxColumns         = Math.floor((this.gridWidth / this.horizontalSpacing)) - 1;
    this.TileSet            = new Array(this.maxRows);
    this.regionSet          = new Array();
    var row, column;
    for (row = 0; row < this.maxRows; row++) {
        this.TileSet[row] = new Array(this.maxColumns);
        for (column = 0; column < this.maxColumns; column++) {
            this.TileSet[row][column] = new Tile(this.Tilesize, row, column);
        }
    }
}
Grid.prototype = { 
	/*  generate
     *  Description: Creates a linked list to objects, by running a  short loop to map out and tile hexagons, 
     * 			assigning them each a column number and a row number. These will be the X/Y values I will use
     *  		later to uniquely find each tile. 
     */ 
    generate: function () {
        console.log("Grid.generate");
		for(var Tileid = 0; Tileid<=((this.maxRows)*(this.maxColumns));Tileid++){
            var row = Tileid%this.maxRows;
            var column = Tileid%this.maxColumns;
            this.TileSet[row][column].setid(Tileid);
            this.TileSet[row][column].draw();
        }
    },
    /*  getNeighbor
     *  Description: Selects a neighbor from a Tile based on input direction
     *      @param Tile Tile - a Tile which to select neighbor from based on direction
     *      @param direction int - a number 0-5 selects which side to return Tile from
     *      @return Tile - returns the Tile selected
     */ 
    getNeighbor: function(Tile,direction) {
        var parity = Tile.getColumn() & 1 ? 'odd' : 'even'; //checks if row is even or odd, assigns
        var delta  = this.nDelta[parity][direction]; // returns a array, with 0 being row delta, and 1 column delta
        var newRow = Tile.getRow() + delta[0];
        var newCol = Tile.getColumn() + delta[1];
        if(newRow < 0){
            newRow = this.maxRows -1;
        } 
        if (newCol < 0){
            newCol = this.maxColumns -1;
        } 
        if (newRow >= this.maxRows ){
            newRow = 1;
        }
        if ( newCol >= this.maxColumns){
            newCol = 1;
        } 
            return this.TileSet[newRow][ newCol];
    },
    /*  checkOccupied
     *  Description: Selects a neighbor from a Tile based on input direction
     *      @param row int - a number which will be the row the tile is in
     *      @param col int - a number which will be the column the tile is in
     *      @return boolean - returns if the tile is occupied.
     */ 
    checkOccupied: function (row,col) {
        return this.TileSet[row][col].getOccupied();
    }
}

/*
 *   _______ _ _      
 *  |__   __(_) |     
 *     | |   _| | ___ 
 *     | |  | | |/ _ \
 *     | |  | | |  __/
 *     |_|  |_|_|\___|
 */
 function Tile(Tilesize, row, column) {
    this.row            = row;
    this.column         = column;
    this.size           = Tilesize; //size corner to corner
    this.id             = 0;
    this.x              = this.size * 3/2 * (1 + column);
    this.y              = this.size * Math.sqrt(3) * (1 + row + 0.5 * (column&1));
    this.display        = false;
    this.occupied       = false;
    this.data           = {};
    this.nSides         = 6; // ma sides
    this.centerX        = 0;
    this.centerY        = 0;
    this.lineWidth      = 1;
    this.tag            = '';
    this.strokeStyle    = "black";
    this.fillStyle      = '#383A3D';
    this.region;
    this.polygon;
}

Tile.prototype = {
	/*  initialize
     *  Description: this is the initialization constructor of a tile, for using the ID param
     *      @param id int - the unique id of the tile
     */ 
    initialize: function(id) {
        this.id         = id;
    },
    /*  initialize
     *  Description: this is the initialization constructor of a tile, for using the ID param 
     * 		as well as intializing it at a set location.
     *      @param id int - the unique id of the tile
     *      @param centerX int - the unique id of the tile
     *      @param centerY int - the center coordinate of the Y axis. 
     */ 
    initialize: function(id,centerX,centerY)  {
        this.id         = id;
        this.x          = centerX;
        this.y          = centerY;
    },
    /*  draw
     *  Description: this will draw the current tile and mark as occupied,
     *		 reset it if it is already occupied.
     */ 
    draw: function() {
        if(this.display === true) {
            //clear Tile, then redraw
            //console.log("Tile.draw: clear Tile, then redraw" );
            this.clear();
            this.draw();
        } else {

            var xmlns = "http://www.w3.org/2000/svg";
            var svgspace = document.getElementById("gamesvg");
            var polygon = document.createElementNS(xmlns,'polygon');

            	// Settting Attributes of SVG polygon element
                polygon.setAttributeNS(null, 'id', 'polygon'+this.id);
                polygon.setAttributeNS(null, 'row', this.row);
                polygon.setAttributeNS(null, 'column', this.column);
                polygon.setAttributeNS(null, 'stroke-width', this.lineWidth );
                polygon.setAttributeNS(null, 'fill',this.fillStyle);
                polygon.setAttributeNS(null, 'stroke',this.strokeStyle);
                polygon.setAttributeNS(null, 'opacity', 1); 
            
            var pointString = "";
            //draws the element based on how many sides
            for( var i = 0; i <= this.nSides; i++) {
                var angle = 2 * Math.PI / this.nSides * i;
                //Corner x and y, draws each side/cornerpoint
                var cornX = this.x + this.size * Math.cos(angle);
                var cornY = this.y + this.size * Math.sin(angle);
                if( i == 0) {
                    pointString = " " + cornX + "," + cornY;
                } else {
                    pointString += " " + cornX + "," + cornY;
                }
            }
            polygon.setAttributeNS(null, 'points', pointString);
             
            var gTile = document.createElementNS(xmlns,'g');
                gTile.setAttributeNS(null, 'id','Tile' + this.id);
                gTile.appendChild(polygon);
                this.polygon = gTile;
            svgspace.appendChild(gTile);
            this.display = true;
        }
    }, 
    /*  clear
     *  Description: this will clear it if it is already being displayed, otherwise it is left alone. this is used by draw
     *		 
     */ 
    clear: function() {
        if(this.display === true) {
            var svgspace = document.getElementById("gamesvg");
            this.polygon.parentNode.removeChild(this.polygon);
            this.display = false;
        }
    },
    /*  reset
     *  Description: resets the tile's attributes back to default, this is used by draw
     *		 
     */
    reset: function () {
        this.strokeStyle = "black";
        this.fillStyle = '#323232';
        this.lineWidth = 1;
        this.occupied = false;
        this.Tile = false;
        this.clear();
        this.draw();
    }, 
    /*
     *	occupy
     *  Description:
     *      @param
     */
    occupy: function (Tile) {
        this.setOccupied(true);
        this.Tile = Tile;
    },
    toString: function() {
        return this.row + ', ' + this.column;
    }
}


/* 
 *      ## Sets
 */
Tile.prototype.setid            = function(newid)     { this.id     = newid;};
Tile.prototype.setX             = function(newX)     { this.x     = newX;};
Tile.prototype.setY             = function(newY)     { this.y     = newY;};
Tile.prototype.setFillStyle     = function(newFill)  { this.fillStyle   = newFill;};
Tile.prototype.setStrokeStyle   = function(newStroke){ this.strokeStyle = newStroke;};
Tile.prototype.setLineWidth     = function(newWidth) { this.lineWidth   = newWidth;};
Tile.prototype.setOccupied      = function(newOccupied) {this.occupied = newOccupied; };
Tile.prototype.setDisplay       = function(newDisplay) { this.display = newDisplay; };

/* 
 *      ## Gets
 */
Tile.prototype.getid            = function() { return this.id;};
Tile.prototype.getX             = function() { return this.x;};
Tile.prototype.getY             = function() { return this.y;};
Tile.prototype.getColumn        = function() { return this.column;};
Tile.prototype.getRow           = function() { return this.row;};
Tile.prototype.getfillStyle     = function() { return this.fillStyle;};
Tile.prototype.getstrokeStyle   = function() { return this.strokeStyle;};
Tile.prototype.getlineWidth     = function() { return this.lineWidth;};
Tile.prototype.getOccupied      = function() { return this.occupied; };


/* 
 *  _    _ _     _                                  
 * | |  | (_)   | |                                 
 * | |__| |_ ___| |_ ___   __ _ _ __ __ _ _ __ ___  
 * |  __  | / __| __/ _ \ / _` | '__/ _` | '_ ` _ \ 
 * | |  | | \__ \ || (_) | (_| | | | (_| | | | | | |
 * |_|  |_|_|___/\__\___/ \__, |_|  \__,_|_| |_| |_|
 *                         __/ |                     
 *                        |___/ 
 */                    
function Histogram() {
    this.grid;
    this.gridheight   	= 600;
    this.gridWidth    	= 600;
    this.tilesizeparam	= 27;
    this.tilesize    = Math.sqrt((this.gridwidth^2)+(this.gridheight^2))/(this.tilesizeparam/5)
}

Histogram.prototype = {
    initialize: function() {
    	console.log("Initializing Histogram");
    	console.log("tilesize:". this.tilesizeparam);
    	this.grid = new Grid(this.gridwidth,this.gridheight,this.tilesize,this.tilesizeparam);
    	this.grid.generate();
    	//should initialize
    }
}

function Data() {
	this.url = "https://api.github.com/users/beaubouchard";
	this.time= "52"; // how many weeks you want to see back in time
	this.eventStack = []; 
}
Data.prototype = {
	/*
	 * fetch
	 * Description: AJAX request to the github repo

	 *	readyState properties
	 *	0 UNSENT: open() uncalled
	 *	1 OPENED: send() uncalled
	 *	2 HEADERS_RECIEVED: headers and status are available after a send()
	 *	3 LOADING: the responseText is still downloading
	 *	4 DONE: Success!!
	 */
	fetch: function() {
		// Create a new request object
		var request = new XMLHttpRequest(); // xmlhttp obj

		request.onload = this.parse;
		// Initialize a request
		request.open('get', this.url);
		// Send it
		request.send();

	}, 
	parse: function() {
	//	we are aiming to find the information located inside of "created_at"
		var responseObj = JSON.parse(this.responseText);
  		console.log(responseObj.name + " has " + responseObj.public_repos + " public repositories!");
	}
}

//https://api.github.com/users/BeauBouchard/events
//an event is something that happens which is worth noting, for this program its going to be a commit
//generic sounding function names is hard :P
function Event(){
	// 
	this.id; // commit id
	this.created_at; //when the commit was submitted 
	this.repo-name; //what is the name of the repo Example: "name": "BeauBouchard/hex-timeline"
	this.repo-url; // wgat is the url of the repo example: "url": "https://api.github.com/repos/BeauBouchard/hex-timeline"
	this.avatar-url;
}


var histo = new Histogram();
histo.initialize();



