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

  var strokeColour = color(0,0,0,84);
  
  this.findStart = findStart;
  this.move = move;
  this.startCrack = startCrack;
  this.regionColor = regionColor;
  
  findStart();
  sp = new SandPainter();
  
  function findStart() {
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
      startCrack(px,py,a);
    } else {
      //println("timeout: "+timeout);
    }
  }
   
  function startCrack( X,  Y,  T) {
      
    crackCount++;
      if(crackCount == 2000) {
          print(millis() - startTime);
      }
      
    x=X;
    y=Y;
    t=T;//%360;
    x+=0.61*cos(t*PI/180);
    y+=0.61*sin(t*PI/180);  
  }
             
  function move() {
    // continue cracking
    x+=0.42*cos(t*PI/180);
    y+=0.42*sin(t*PI/180); 
    
    // bound check
    var z = 0.33;
    var cx = int(x+random(-z,z));  // add fuzz
    var cy = int(y+random(-z,z));
    
    // draw sand painter
    regionColor();
    
    // draw black crack
//    stroke(0,85);
    stroke(strokeColour);
    point(x+random(-z,z),y+random(-z,z));
    
    
    if ((cx>=0) && (cx<dimx) && (cy>=0) && (cy<dimy)) {
      // safe to check
      if ((cgrid[cy*dimx+cx]>10000) || (abs(cgrid[cy*dimx+cx]-t)<5)) {
        // continue cracking
        cgrid[cy*dimx+cx]=int(t);
      } else if (abs(cgrid[cy*dimx+cx]-t)>2) {
        // crack encountered (not self), stop cracking
        findStart();
        makeCrack();
      }
    } else {
      // out of bounds, stop cracking
      findStart();
      makeCrack();
    }
  }
  
  function regionColor() {
    // start checking one step away
    var rx=x;
    var ry=y;
    var openspace=true;
    
    // find extents of open space
    while (openspace) {
      // move perpendicular to crack
      rx+=0.81*sin(t*PI/180);
      ry-=0.81*cos(t*PI/180);
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
    sp.render(rx,ry,x,y);
  }
}


function SandPainter () {

  var c;
  var g;
  var colours = [];
  var grains = 64;
  
  c = somecolor();
  g = random(0.01,0.1);
    
  for (var i=0;i<grains;i++) {
      var a = 0.1-i/(grains*10.0);
      colours[i] = color(red(c),green(c),blue(c),a*256);
  }
  
  this.render = render;
  
  function render( x,  y,  ox,  oy) {
    // modulate gain
    g+=random(-0.050,0.050);
    var maxg = 1.0;
    if (g<0) g=0;
    if (g>maxg) g=maxg;
    
    // calculate grains by distance
    //var grains = int(sqrt((ox-x)*(ox-x)+(oy-y)*(oy-y)));
    var grains = 64;

    // lay down grains of sand (transparent pixels)
    var w = g/(grains-1);
    for (var i=0;i<grains;i++) {
      stroke(colours[i]);
      point(ox+(x-ox)*sin(sin(i*w)),oy+(y-oy)*sin(sin(i*w)));
    }
  }
  
}

// j.tarbell   June, 2004
// Albuquerque, New Mexico
// complexification.net

