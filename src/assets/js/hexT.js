/*
 * 
 * @title: Hex Timelime
 * @author: Beau Bouchard ( @beaubouchard )
 * @description: This script will create a hex tile svg rendering of the github commit calendar.
 * @repo http://www.github.com/beaubouchard/hex-timeline/
 *
 */



    /*  Date.getWeekNumber
     *  Description:  
     *		@return {int} calculates and returns the week number of date object
     */ 
Date.prototype.getWeekNumber = function(){
    var d = new Date(+this);// Copy date so don't modify original
    d.setHours(0,0,0);
    d.setDate(d.getDate()+4-(d.getDay()||7)); // Set to nearest Thursday: current date + 4 - current day number, Make Sunday's day number 7
    return Math.ceil((((d-new Date(d.getFullYear(),0,1))/8.64e7)+1)/7); // Get first day of year
};




/*
 *   _____      _     _ 
 *  / ____|    (_)   | |
 * | |  __ _ __ _  __| |
 * | | |_ | '__| |/ _` |
 * | |__| | |  | | (_| |
 *  \_____|_|  |_|\__,_|
 */
     /* 
      * Grid
      * 	description: the grid object hold the array of tiles which will be placed on the svg tag. 
      *
      */                 

function Grid(gridWidth,gridHeight,tileSize,regioncount) { 
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
    this.Tilesize           = tileSize;
    this.TileWidth          = this.Tilesize * 2;
    this.TileHeight         = Math.sqrt(3)/2 * this.TileWidth; 
    console.log("this.TileWidth " + this.TileWidth  );
    console.log("this.TileHeight " + this.TileHeight);
    this.verticalSpacing    = this.TileHeight;
    this.horizontalSpacing  = 3/4 * this.TileWidth;
    this.maxRows            = Math.floor((this.gridHeight / this.verticalSpacing)) - 1;
    this.maxColumns         = Math.floor((this.gridWidth / this.horizontalSpacing)) - 1;
    console.log("this.maxRows " + this.maxRows );
    console.log("this.maxColumns " + this.maxColumns);
    this.TileSet            = new Array(this.maxRows);
    this.regionSet          = new Array();
    var row, column;
    for (row = 0; row < this.maxRows; row++) {
    	console.log(this.maxColumns);
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
    },
    /*  setTileColor
     *  Description: sets the tile's color to the supplied param
     * 		@param color string - a hex color
     *      @param row int - a number which will be the row the tile is in
     *      @param col int - a number which will be the column the tile is in
     *      @return boolean - returns false if there was a problem.
     */ 
     setTileColor: function (row,col,color) {
     	this.TileSet[row][col].setFillStyle(color);
     	this.TileSet[row][col].draw();
     },
    /*  disable
     *  Description: disables a tile, meaning it will not even show up.
     *      @param row int - a number which will be the row the tile is in
     *      @param col int - a number which will be the column the tile is in
     */ 
     disable: function(row,col) {
		this.TileSet[row][col].clear();
     },
     getTile: function(row,col) {
     	return this.TileSet[row][col];
     },
     addText: function(x,y,text) {
     			//setting up left lettering
     			var xmlns = 'http://www.w3.org/2000/svg';
		var newText = document.createElementNS(xmlns,"text");
			newText.setAttributeNS(null,"x",x);     
			newText.setAttributeNS(null,"y",y); 
			newText.setAttributeNS(null,"font-size","8");

		var textNode = document.createTextNode(text);
		newText.appendChild(textNode);
		var svgspace = document.getElementById('hextimeline');
		svgspace.appendChild(newText);
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
    this.strokeStyle    = '#323232';
    this.fillStyle      = '#EEEEEE'; //383A3D
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

            var xmlns = 'http://www.w3.org/2000/svg';
            var svgspace = document.getElementById('hextimeline');
            var polygon = document.createElementNS(xmlns,'polygon');

            	// Settting Attributes of SVG polygon element
                polygon.setAttributeNS(null, 'id', 'polygon'+this.id);
                polygon.setAttributeNS(null, 'row', this.row);
                polygon.setAttributeNS(null, 'column', this.column);
                polygon.setAttributeNS(null, 'stroke-width', this.lineWidth );
                polygon.setAttributeNS(null, 'fill',this.fillStyle);
                polygon.setAttributeNS(null, 'stroke',this.strokeStyle);
                polygon.setAttributeNS(null, 'opacity', 1); 
            
            var pointString = '';
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
        this.strokeStyle = '#323232';
        this.fillStyle = '#eeeeee';
        this.lineWidth = 1;
        this.occupied = false;
        this.Tile = false;
        this.clear();
        this.draw();
    }, 
    /*
     *	occupy
     *  Description: Sets a tile to being occupied
     *      @param tile Tile - Incoming tile to set occupy to TRUE.
     */
    occupy: function (tile) {
        this.setOccupied(true);
        this.tile = tile;
    },
    /*
     *	toString
     *  Description: returns the row and column of the tile
     *      @return String - the row and column seperated by a comma
     */
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
 *                        |___/ +
 */
/*
 * Histogram
 *   Description: Currently the histogram will fill up the entire available space with tiles
 *		With the size of 9 (tile size is roughly double that, 18px 18*7=126px), and the height of
 *  	our space is about 128. 
 *
 *		gray = "#eeeeee";
 *		paleGreen="#d6e685";
 *		lightGreen="#8cc665";
 *		green="#44a340";
 *		darkGreen="#1e6823";
 *
 */                    
function Histogram() {
    
    this.gridHeight   	= 128;
    this.gridWidth    	= 720;
    this.tilesizeparam	= 32;
    this.tilesize    = 9;//Math.sqrt((this.gridwidth^2)+(this.gridheight^2))/(this.tilesizeparam/5);
    this.dataB;
    	this.countArray = new Array(365);
    //console.log("tilesize:"+ this.tilesizeparam);
    this.grid = new Grid(this.gridWidth ,this.gridHeight,this.tilesize,this.tilesizeparam);
    //(gridWidth,gridHeight,tileSize,regioncount) 
    this.grid.generate();
    //should initialize


}

Histogram.prototype = {
    initialize: function() {
		console.log("Initializing Histogram");


		this.drawLetters(1);

		//set first and last day of the year. 
		var currentTime = new Date();
		var startd = Math.abs(currentTime.getDay()-7);
		for(var i = 0; i<= startd; i++){this.grid.disable(i,0);}

		//setup the last days of the year
		for(var i = currentTime.getDay(); i<= 6; i++){this.grid.disable(i,51);}
		this.dataB = new Data();

		// connecting to github with a AJAX call
		this.dataB.fetch(this);
		//draw the data

    },
    /*
     *	drawLetters
     *  Description: Draws the letters of the week on the week provided.
     *      @param week {int} - The integer value of the week, 0-51
     */
    drawLetters: function(week){

    	// Draws M, W, F for Monday, Wednesday, Friday
    	// Sunday is zero, the first day
    	// Monday is the second day of the week,
    	// Our weeks on this calendar are starting with sunday, ending with saturday
		var x = this.grid.getTile(1,week).getX();
		var y = this.grid.getTile(1,week).getY();
		this.grid.addText(x-4,y+4,"M");

		 x = this.grid.getTile(3,week).getX();
		 y = this.grid.getTile(3,week).getY();
		this.grid.addText(x-4,y+4,"W");

		 x = this.grid.getTile(5,week).getX();
		 y = this.grid.getTile(5,week).getY();
		this.grid.addText(x-4,y+4,"F");
    },
    drawDay: function(date){
    	var daynum 		= getDayofYear(date);
    	var week 		= date.getWeekNumber();
    	var day 		= date.getDay();
		var gray 		= "#eeeeee";
		var paleGreen	= "#d6e685";
		var lightGreen	= "#8cc665";
		var green 		= "#44a340";
		var darkGreen 	= "#1e6823";

		var max = Math.max.apply(Math, this.countArray);

		if(this.countArray[daynum] == 0){
			console.log("Histogram.drawDay() :: 0 ");
			var color = gray;
		} else if(this.countArray[daynum] > 1 && this.countArray[daynum] <= 2) {
			var color = paleGreen;
		} else if(this.countArray[daynum] > 2 && this.countArray[daynum] <= Math.floor(max/2) ){
			var color = green;
		}else if(this.countArray[daynum] > Math.floor(max/2) ){
			var color = darkGreen;
		}
		console.log("Histogram.drawDay() ::  "+color);
    	this.grid.setTileColor(day,week,color);//row,col,color
    },
	getCountArray: function() {
		return this.countArray;
	}, 
    increaseDay: function(d){
    	var date = new Date();
    	date = d;
    	var daynum = getDayofYear(date);
    	var week = date.getWeekNumber();
    	var day = date.getDay();
    	this.countArray[daynum]++;
    	//this.drawDay(date);

    }
}

function Data() {
	this.url = "https://api.github.com/users/beaubouchard/events";
	this.time= "52"; // how many weeks you want to see back in time
	this.eventStack = []; 
	this.responseText = "";
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
	fetch: function(callback) {
		// Create a new request object
		var request = new XMLHttpRequest(); // xmlhttp obj

		request.onreadystatechange = function() {
		    if (request.readyState == 4) {
		        //alert(request.responseText);
		        		var responseObj = JSON.parse(this.responseText);

				for (var key in responseObj) {
				    if (responseObj.hasOwnProperty(key)) {
				      var created_at = responseObj[key]["created_at"];
				      //var date = Date.parse(created_at);
				      var date = new Date(created_at);
				      	callback.increaseDay(date);
				      	callback.drawDay(date);
				    }
		  		}
		    }
		}
		//request.onload = this.parse;
		// Initialize a request
		request.open('GET', this.url, true);
		// Send it
		request.send(null);

	},
	parse: function() {
	//	we are aiming to find the information located inside of "created_at"

  				//var bull = new Date(object.created_at);

  				//callback.increaseDay(date);
  				//this.callback.increaseDay(date);
  				//this.callback.drawDay(date);
  				//var daynum = getDayofYear(date);
		    	//var week = date.getWeekNumber();
		    	//var day = date.getDay();
		    	//this.countArray[daynum]++;
		   
		//responseObj.forEach(function(object) {
  		//	console.log(object.message + "  created_at:" + object.created_at + " !");
  		//});
  		//YYYY-MM-DDTHH:MM:SSZ
  		//2015-02-20T04:58:19Z
  		// this will be UTM time, so you are going to need to convert it, or just groove on it
  		//.toLocaleTimeString()
  		//.toLocaleDateString()
  		//.toUTCString()
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

function getDayofYear(checkdate){
	var now = new Date();
	var start = new Date(now.getFullYear(), 0, 0);
	var diff = checkdate - start;
	var oneDay = 1000 * 60 * 60 * 24;
	var day = Math.floor(diff / oneDay);
	return day;
}



    /*  LinkedList
     *  Description:  single linked list implimentation 
     */ 
function LinkedList() {
	this.head = null;
}

LinkedList.prototype = {
	/*  LinkedList.add(value)
     *  Description:  adds a node to the list of value, then points/links it in list
     * 		@param - a value to add to the linked list
     * 		@return node - returns the next node in the list
     */ 
	add: function(value) {
		var node = {
			value: value,
			next: null };
		var current;
		if(this.head === null){
			this.head = node;
		} else {
			current = this.head;
			while(current.next) {
				current = current.next;
			}
			current.next = node;
		}
		return node;
	},
	/*  LinkedList.remove(node)
     *  Description:  removes node from list, and then sets the current to point/link to the next node in linked list
     * 		@param node- a node to remove from the list
     * 		@return value - the value of the node removed from the list
     */ 
	remove: function(node) {
		var current;
		var value = node.value;
		if(this.head !== null) {
			this.head = this.head.next;
			node.next = null;
			return value;
		}
		current = this.head;
		while(current.next) {
			if(current.next === node) {
				current.next = node.next;
				return value;
			}
			current = current.next;
		}
	}
}


var histo = new Histogram();
histo.initialize();



