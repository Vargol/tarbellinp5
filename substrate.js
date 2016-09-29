// Substrate Watercolor
// j.tarbell   June, 2004
// Albuquerque, New Mexico
// complexification.net

// Processing 0085 Beta syntax update
// j.tarbell   April, 2005
var crackCount = 0;
var startTime;


var dimx = 900;
var dimy = 900;
var num = 0;
var maxnum = 200;

// grid of cracks
var cgrid = [];
var cracks = [];

// color parameters
var maxpal = 24;
var numpal = 0;
var goodcolor = [];

// sand painters
var sands = [] ;

// MAIN METHODS ---------------------------------------------

function setup() {
  createCanvas(900,900);
//  size(dimx,dimy,P3D);
  background(255);
  takecolor("pollockShimmering.gif");
  
  begin();  
}

function draw() {
  // crack all cracks
  for (var n=0;n<num;n++) {
    cracks[n].move();
  }
}

function mousePressed() {
  begin();
}
    

// METHODS --------------------------------------------------

function makeCrack() {
  if (num<maxnum) {
    // make a new crack instance
    cracks[num] = new Crack();
    num++;
  }
}


function begin() {
   
  crackCount = 0;
  
  // erase crack grid
  for (var y=0;y<dimy;y++) {
    for (var x=0;x<dimx;x++) {
      cgrid[y*dimx+x] = 10001;
    }
  }
  // make random crack seeds
  for (var k=0;k<16;k++) {
    var i = int(random(dimx*dimy-1));
    cgrid[i]=int(random(360));
  }

  // make just three cracks
  num=0;
  for (var k=0;k<3;k++) {
    makeCrack();
  }
  background(255);
}



// COLOR METHODS ----------------------------------------------------------------

function somecolor() {
  // pick some random good color
  return goodcolor[Math.floor(random(maxpal))];
}

function takecolor() {
 
  colorMode(HSB, 1.0); 
  
  var golden_ratio_conjugate = 0.618033988749895;
  var h = random (1.0);
  for (var i=0; i<maxpal; i++) {

      h += golden_ratio_conjugate;
      h %= 1.0;
      goodcolor[i] = color(h, 0.20, 0.95);

  }

  colorMode(RGB, 256); 
  
}



// OBJECTS -------------------------------------------------------

function Crack () {
  var x, y;
  var t;    // direction of travel in degrees
  // sand painter
  var sp;

  var strokeColour

  this.strokeColour = color(0,0,0,84);  
  this.findStart();
  this.sp = new SandPainter();
 }
 
  Crack.prototype.findStart = function () {
    // pick random point
    var px=0;
    var py=0;
    
    // shift until crack is found
    var found=false;
    var timeout = 0;
    while ((!found) || (timeout++>1000)) {
      px = int(random(dimx));
      py = int(random(dimy));
      if (cgrid[py*dimx+px]<10000) {
        found=true;
      }
    }
    
    if (found) {
      // start crack
      var a = cgrid[py*dimx+px];
      if (random(100)<50) {
        a-=90+int(random(-2,2.1));
      } else {
        a+=90+int(random(-2,2.1));
      }
      this.startCrack(px,py,a);
    } else {
      //println("timeout: "+timeout);
    }
  }
   
  Crack.prototype.startCrack = function ( X,  Y,  T) {
      
    crackCount++;

    this.x=X;
    this.y=Y;
    this.t=T;//%360;
    this.x+=0.61*cos(this.t*PI/180);
    this.y+=0.61*sin(this.t*PI/180);  
  }
             
  Crack.prototype.move = function() {
    // continue cracking
    this.x+=0.42*cos(this.t*PI/180);
    this.y+=0.42*sin(this.t*PI/180); 
    
    // bound check
    var z = 0.33;
    var cx = int(this.x+random(-z,z));  // add fuzz
    var cy = int(this.y+random(-z,z));
    
    // draw sand painter
    this.regionColor();
    
    // draw black crack
//    stroke(0,85);
    stroke(this.strokeColour);
    point(this.x+random(-z,z),this.y+random(-z,z));
    
    
    if ((cx>=0) && (cx<dimx) && (cy>=0) && (cy<dimy)) {
      // safe to check
      if ((cgrid[cy*dimx+cx]>10000) || (abs(cgrid[cy*dimx+cx]-this.t)<5)) {
        // continue cracking
        cgrid[cy*dimx+cx]=int(this.t);
      } else if (abs(cgrid[cy*dimx+cx]-this.t)>2) {
        // crack encountered (not self), stop cracking
        this.findStart();
        makeCrack();
      }
    } else {
      // out of bounds, stop cracking
      this.findStart();
      makeCrack();
    }
  }
  
  Crack.prototype.regionColor = function() {
    // start checking one step away
    var rx=this.x;
    var ry=this.y;
    var openspace=true;
    
    // find extents of open space
    while (openspace) {
      // move perpendicular to crack
      rx+=0.81*sin(this.t*PI/180);
      ry-=0.81*cos(this.t*PI/180);
      var cx = int(rx);
      var cy = int(ry);
      if ((cx>=0) && (cx<dimx) && (cy>=0) && (cy<dimy)) {
        // safe to check
        if (cgrid[cy*dimx+cx]>10000) {
          // space is open
        } else {
          openspace=false;
        }
      } else {
        openspace=false;
      }
    }
    // draw sand painter
    this.sp.render(rx,ry,this.x,this.y);
  }



function SandPainter () {

  var c;
  var g;
  var colours;
  var grains;
  
  this.colours = [];
  this.grains = 64;
  this.c = somecolor();
  this.g = random(0.01,0.1);
  
  var r = red(this.c);
  var g = green(this.c);
  var b = blue(this.c);
    
  for (var i=0;i<this.grains;i++) {
      var a = 0.1-i/(this.grains*10.0);
      this.colours[i] = color(r,g,b,a*256);
  }
  
}
  
SandPainter.prototype.render = function render( x,  y,  ox,  oy) {

	// modulate gain
	this.g+=random(-0.050,0.050);
	var maxg = 1.0;
	if (this.g<0) this.g=0;
	if (this.g>maxg) this.g=maxg;

	// calculate grains by distance
	//var grains = int(sqrt((ox-x)*(ox-x)+(oy-y)*(oy-y)));
	var grains = 64;

	// lay down grains of sand (transparent pixels)
	var w = this.g/(grains-1);
	for (var i=0;i<grains;i++) {
	  stroke(this.colours[i]);
	  point(ox+(x-ox)*sin(sin(i*w)),oy+(y-oy)*sin(sin(i*w)));
	}
}


// j.tarbell   June, 2004
// Albuquerque, New Mexico
// complexification.net

