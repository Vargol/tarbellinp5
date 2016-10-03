// Intersecting Circles, Instantaneous
// J. Tarbell                              + complexification.net
// Albuquerque, New Mexico
// May, 2004
//
// a REAS collaboration for the            + groupc.net
// Whitney Museum of American Art ARTPORT  + artport.whitney.org
// Robert Hodgin                           + flight404.com
// William Ngan                            + metaphorical.net

// Processing 0085 Beta syntax update
// j.tarbell   April, 2005

//p5.js port by D. Burnett 2016

// dimensions
var dim = 1000;
var num = 200;
var time = 0;

// object array
var discs;
var img;
var white;


// initialization
function setup() {
  
  white = color(255);
  createCanvas(dim,dim);
  img = createImage(dim, dim);
  img.loadPixels();
//  size(dim,dim,P3D);
  ellipseMode(CENTER);
  frameRate(30);

  // make some discs
  discs = [];
  
  // arrange in anti-collapsing circle
  for (var i=0;i<num;i++) {
    var fx = 0.4*dim*cos(TWO_PI*i/num);
    var fy = 0.4*dim*sin(TWO_PI*i/num);
    var x = random(dim/2) + fx;
    var y = random(dim/2) + fy;
    var r = 5+random(45);
    var bt = 1;
    if (random(100)<50) bt=-1;
    discs[i] = new Disc(i,x,y,bt*fx/1000.0,bt*fy/1000.0,r);
  }
}

// main
function draw() {
  
  var c = color(0,0,0);
  img = createImage(dim, dim);
  
  for (i = 0; i < img.width; i++) {
    for (j = 0; j < img.height; j++) {
      img.set(i, j, c);
    }
  }

  // move discs
  for (var c=0;c<num;c++) {
    discs[c].move();
    discs[c].render();
    discs[c].renderPxRiders();
  }
  
  img.updatePixels();
  image(img);
  
  time++;
}

// disc object
var Disc = function ( Id, X, Y, Vx, Vy, R) {
  // index identifier
  this.id=Id;
  // position
  this.x=X;
  this.y=Y;
  // radius
  this.dr=R;
  this.r=0;
  // velocity
  this.vx=Vx;
  this.vy=Vy;

  //  pixel riders  
  this.numr = int(R/1.62);
  this.maxr = 40;
  this.pxRiders = [];
    
  if (this.numr>this.maxr) this.numr=this.maxr;
  
  // create pixel riders
  for (var n=0;n<this.maxr;n++) {
    this.pxRiders[n] = new PxRider();
  }
}

Disc.prototype.draw = function () {
  // not used .
    stroke(0,50);
    noFill();
    ellipse(this.x,this.y,this.r,this.r);
}

Disc.prototype.render = function () {
    // find intersecting points with all ascending discs
  for (var n=this.id+1;n<num;n++) {
    if (n!=this.id) {
      // find distance to other disc
      var dx = discs[n].x-this.x;
      var dy = discs[n].y-this.y;
      var d = sqrt(dx*dx+dy*dy);
      // intersection test
      if (d<(discs[n].r+this.r)) {
        // complete containment test
        if (d>abs(discs[n].r-this.r)) {
          // find solutions
          var a = (this.r*this.r - discs[n].r*discs[n].r + d*d ) / (2*d);
          
          var p2x = this.x + a*(discs[n].x - this.x)/d;
          var p2y = this.y + a*(discs[n].y - this.y)/d;
          
          var h = sqrt(this.r*this.r - a*a);
          
          var p3ax = p2x + h*(discs[n].y - this.y)/d;
          var p3ay = p2y - h*(discs[n].x - this.x)/d;
          
          var p3bx = p2x - h*(discs[n].y - this.y)/d;
          var p3by = p2y + h*(discs[n].x - this.x)/d;
          
          // P3a and P3B may be identical - ignore this case (for now)

          img.set(p3ax,p3ay, white);
          img.set(p3bx,p3by, white);
        }
      }
    }
  }
}

Disc.prototype.move = function() {
    // add velocity to position
    this.x+=this.vx;
    this.y+=this.vy;
    // bound check
    if (this.x+this.r<0) this.x+=dim+this.r+this.r;
    if (this.x-this.r>dim) this.x-=dim+this.r+this.r;
    if (this.y+this.r<0) this.y+=dim+this.r+this.r;
    if (this.y-this.r>dim) this.y-=dim+this.r+this.r;

    // increase to destination radius
    if (this.r<this.dr) {
      this.r+=0.1;
    }
}
  
Disc.prototype.renderPxRiders = function() {
    for (var n=0;n<this.numr;n++) {
      this.pxRiders[n].move(this.x,this.y,this.r);
    }
}

  // pixel rider object  
var PxRider = function() {

  this.t=random(TWO_PI);
  this.vt=0.0;
  this.mycharge = 0;

}
    
PxRider.prototype.move = function (x, y, r) {
  // add velocity to theta
  this.t=(this.t+this.vt+PI)%TWO_PI - PI;
  
  this.vt+=random(-0.001,0.001);

  // apply friction brakes
  if (abs(this.vt)>0.02) this.vt*=0.9;

  // draw      
  var px = int(x+r*cos(this.t));
  var py = int(y+r*sin(this.t));

  var c = color(img.pixels[py * img.width * 4 + (px * 4)], img.pixels[py * img.width * 4 + (px * 4) + 1], img.pixels[py * img.width * 4+ (px * 4) + 2], img.pixels[py * img.width * 4+ px + 3])

//  var c = img.get(int(px),int(py));
  if (brightness(c)>48) {
    glowpoint(px,py);
    this.mycharge = 164;
  } else {
    img.set(px,py, color(this.mycharge));
    this.mycharge*=0.98;
  }

}


// methods
function glowpoint(px, py) {
  for (var i=-2;i<3;i++) {
    for (var j=-2;j<3;j++) {
      var a = 0.8 - i*i*0.1 - j*j*0.1;
      img.set(px+i,py+j, color(255, a*256));
    }
  }
}

