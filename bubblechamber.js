// Bubble Chamber
// j.tarbell   October, 2003
// Albuquerque, New Mexico
// complexification.net

// Processing 0085 Beta syntax update
// j.tarbell   April, 2005

// a generative painting system using random collisions of
// four unique orbit decaying particle types.

// dimensions of drawing area
var dim =  1000;
var cnv;

// particle proportions
var maxMuon = 1789;
var maxQuark = 1300;
var maxHadron = 1000;
var maxAxion = 111;

// angle of collision (usually calculated with mouse position)
var collisionTheta;

// first time user interaction flag
var boom = false;

// discrete universe of particles?
var muon = [maxMuon];
var quark = [maxQuark];
var hadron = [maxHadron];
var axion = [maxAxion];

// some nice color palettes

// rusted desert metal. winter, new mexico
var goodcolor = []

// perdenales canyon. fall, texas
//color[] goodcolor = {#f8f7f1, #6b6556, #a09c84, #908b7c, #79746e, #755d35, #937343, #9c6b4b, #ab8259, #aa8a61, #578375, #f0f6f2, #d0e0e5, #d7e5ec, #d3dfea, #c2d7e7, #a5c6e3, #a6cbe6, #adcbe5, #77839d, #d9d9b9, #a9a978, #727b5b, #6b7c4b, #546d3e, #47472e, #727b52, #898a6a, #919272, #AC623b, #cb6a33, #9d5c30, #843f2b, #652c2a, #7e372b, #403229, #47392b, #3d2626, #362c26, #57392c, #998a72, #864d36, #544732 };



// MAIN -----------------------------------------------------------

function setup() {
  goodcolor = [
                 color("#3a242b"), color("#3b2426"), color("#352325"), color("#836454"), 
                 color("#7d5533"), color("#8b7352"), color("#b1a181"), color("#a4632e"), 
                 color("#bb6b33"), color("#b47249"), color("#ca7239"), color("#d29057"), 
                 color("#e0b87e"), color("#d9b166"), color("#f5eabe"), color("#fcfadf"), 
                 color("#d9d1b0"), color("#fcfadf"), color("#d1d1ca"), color("#a7b1ac"), 
                 color("#879a8c"), color("#9186ad"), color("#776a8e")];
  // processing is awesome
  cnv = createCanvas(dim,dim);
  cnv.canvas.style.border = '1px solid black';  
//  size(dim,dim,P3D);
  background(255);
  noStroke();
  smooth();

  // instantiate universe of particles
  for (var i=0; i<maxAxion; i++) {
    axion[i] = new Axion(dim/2,dim/2);
  }
  for (var i=0; i<maxHadron; i++) {
    hadron[i] = new Hadron(dim/2,dim/2);
  }
  for (var i=0; i<maxQuark; i++) {
    quark[i] = new Quark(dim/2,dim/2);
  }
  for (var i=0; i<maxMuon; i++) {
    muon[i] = new Muon(dim/2,dim/2);
  }
  
  // ok, draw just one collision
  collideOne();
}

function draw() {
  //background(0);  // and erase all that hard work?
  if (boom) {
    // initial collision event has occured, ok to move the particles...
  
    // allow each particle in the universe one step
    for (var i=0; i<hadron.length; i++){
      hadron[i].move();
    }
    
    for (var i=0; i<muon.length; i++){
      muon[i].move();
    }
    
    for (var i=0; i<quark.length; i++){
      quark[i].move();
    }
    for (var i=0; i<axion.length; i++){
      axion[i].move();
    }
    
  }
}


function mousePressed() {
  boom = true;
  // fire 11 of each particle type
  for (var k=0;k<11;k++) {
    collideOne();
  }
}

function keyReleased () {
  if (key == ' ') {
    // reset and fire all particles
    boom = true;
    background(255);
    collideAll();
  }
}



// METHODS -------------------------------------------------------------------------

function somecolor() {
  // pick some random color from a list of known color
  return goodcolor[int(random(goodcolor.length))];
}

function collideAll() {
  // random collision angle
  collisionTheta = random(TWO_PI);

  // particle super collision
  if (hadron.length>0) {
    for (var i=0; i<maxHadron; i++) {
      hadron[i].collide();
    }
  }
  if (quark.length>0) {
    for (var i=0; i<maxQuark; i++) {
      quark[i].collide();
    }
  }
  if (muon.length>0) {
    for (var i=0; i<maxMuon; i++) {
      muon[i].collide();
    }
  }
  if (axion.length>0) {
    for (var i=0; i<maxAxion; i++) {
      axion[i].collide();
    }
  }
}

function collideOne() {
  // eject a single particle, relative to position position
  var t;
  collisionTheta = atan2(dim/2-mouseX,dim/2-mouseY);

  // choose a set of hadron particles to recollide
  if (hadron.length>0) {
    t = int(random(hadron.length));
    hadron[t].collide();
  }

  // choose a set of quark particles to recollide
  if (quark.length>0) {
    t = int(random(quark.length));
    quark[t].collide();
  }

  // choose a set of muon particles to recollide
  if (muon.length>0) {
    t = int(random(muon.length));
    muon[t].collide();
  }

}




// CLASSES ---------------------------------------------------------------------------

// Muon particle
//   the muon is a colorful particle with an entangled friend.
//   draws both itself and its horizontally symmetric partner.
//   a high range of speed and almost no speed decay allow the
//   muon to reach the extents of the window, often forming rings
//   where theta has decayed but speed remains stable.  result
//   is color almost everywhere in the general direction of collision,
//   stabilized into fuzzy rings.

function Muon(X, Y)  {
  // position
  this.x = X;
  this.y = Y;
  // speed
  this.speed = 0;
  // orbit
  this.theta = 0;
  // decay
  this.speedD = 0;
  this.thetaD = 0;
  this.thetaDD = 0;
  // color
  this.myc = color(0,0,0,0);
  this.mya = color(0,0,0,0);
}

 
Muon.prototype.collide =  function () {
    // initialize all parameters 
    this.x = dim/2;
    this.y = dim/2;
    this.speed = random(2,32);
    this.speedD = random(0.0001,0.001);

    // rotation
    this.theta = collisionTheta+random(-0.1,0.1);
    //    theta = random(TWO_PI)-PI;
    this.thetaD = 0;
    this.thetaDD = 0;

    // ensure that there IS decay
    while (abs(this.thetaDD)<0.001) {
      // rate of orbit decay
      this.thetaDD = random(-0.1,0.1);
    }

    // color is determined by direction of movement
    var c = int((goodcolor.length-1)*(this.theta+PI)/TWO_PI);
    if ((c>=goodcolor.length) || (c<0)) {
      // SAFETY: this is giving me problems    
      // println("whoa: "+c);
    } else {
      this.myc = goodcolor[c];
      // anti-particle color
      this.mya = goodcolor[goodcolor.length-c-1];
    }
  };
  
  Muon.prototype.move =  function () {
    // draw
    stroke(red(this.myc),green(this.myc),blue(this.myc),42);
    point(this.x,this.y);
    // draw anti-particle
    stroke(red(this.mya),green(this.mya),blue(this.mya),42);
    point(dim-this.x,this.y);
    

    // move
    this.x+=this.speed*sin(this.theta);
    this.y+=this.speed*cos(this.theta);
    // rotate
    this.theta+=this.thetaD;

    // modify spin
    this.thetaD+=this.thetaDD;
    // modify speed
    this.speed-=this.speedD;

    // do not allow particle to enter extreme offscreen areas
    if ((this.x<-dim) || (this.x>dim*2) || (this.y<-dim) || (this.y>dim*2)) {
      this.collide();
    }
  };


// Quark particle
//   the quark draws as a translucent black.  their large numbers
//   create fields of blackness overwritten only by the glowing shadows of Hadrons.
//   quarks are allowed to accelerate away with speed decay values above 1.0
//   each quark has an entangled friend.  both particles are drawn identically,
//   mirrored along the y-axis.

function Quark(posX, posY) {
  // position
  this.x = posX;
  this.y = posY;  // 

  this.vx = 0;
  this.vy = 0;
  // orbit
  this.theta;
  this.speed;
  // decay
  this.speedD;
  this.thetaD;
  this.thetaDD;
  // color
  this.myc = color(0);
}

Quark.prototype.collide =  function () {
  
    // initialize all parameters with random collision
    this.x = dim/2;
    this.y = dim/2;
    this.theta = collisionTheta+random(-0.11,0.11);
    this.speed = random(0.5,3.0);

    this.speedD = random(0.996,1.001);
    this.thetaD = 0;
    this.thetaDD = 0;

    // rate of orbit decay
    while (abs(this.thetaDD)<0.00001) {
      this.thetaDD = random(-0.001,0.001);
    }
  };

Quark.prototype.move =  function () {
  
    // draw
    stroke(red(this.myc),green(this.myc),blue(this.myc),32);
    point(this.x,this.y);
    // draw anti-particle
    point(dim-this.x,this.y);

    // move
    this.x+=this.vx;
    this.y+=this.vy;
    // turn
    this.vx = this.speed*sin(this.theta);
    this.vy = this.speed*cos(this.theta);

    this.theta+=this.thetaD;

    // modify spin
    this.thetaD+=this.thetaDD;
    // modify speed
    this.speed*=this.speedD;
    if (random(1000)>997) {
      this.speed*=-1;
      this.speedD=2-this.speedD;
    }
    // do not allow particle to enter extreme offscreen areas
    if ((this.x<-dim) || (this.x>dim*2) || (this.y<-dim) || (this.y>dim*2)) {
      this.collide();
    }
};


//  Hadron particle
//    hadrons collide from totally random directions.
//    those hadrons that do not exit the drawing area,
//    tend to stabilize into perfect circular orbits.
//    each hadron draws with a slight glowing emboss.
//    the hadron itself is not drawn.

function Hadron (X, Y){
  // position
  this.x = X;
  this.y = Y;
  this.vx = 0;
  this.vy = 0;
  // orbit
  this.theta = 0;
  this.speed = 0;
  // decay
  this.speedD = 0;
  this.thetaD = 0;
  this.thetaDD = 0;
  this.myc = color(0);
 
}

Hadron.prototype.collide =  function ()  {
    // initialize all parameters with random collision
    this.x = dim/2;
    this.y = dim/2;
    this.theta = random(TWO_PI);
    this.speed = random(0.5,3.5);

    this.speedD = random(0.996,1.001);
    this.thetaD = 0;
    this.thetaDD = 0;

    // rate of orbit decay
    while (abs(this.thetaDD)<0.00001) {
      this.thetaDD = random(-0.001,0.001);
    }
    this.myc = color("#00FF00");
};

  Hadron.prototype.move =  function ()  {
    // the particle itself is unseen, not drawn
    // instead, draw shadow emboss
    
    // lighten pixel above hadron
    stroke(255, 255, 255, 28);
    point(this.x, this.y-1);
    // darken pixel below hadron
    stroke(0, 0, 0, 28);
    point(this.x, this.y+1);

    // move
    this.x+=this.vx;
    this.y+=this.vy;
    
    // turn
    this.vx = this.speed*sin(this.theta);
    this.vy = this.speed*cos(this.theta);
    
    // modify spin
    this.theta+=this.thetaD;
    this.thetaD+=this.thetaDD;
    
    // modify speed
    this.speed*=this.speedD;
    
    // random chance of subcollision event
    if (random(1000)>997) {
      // stablize orbit
      this.speedD=1.0;
      this.thetaDD=0.00001;
      if (random(100)>70) {
        // recollide
        this.x = dim/2;
        this.y = dim/2;
        this.collide();
      }
    }
    // do not allow particle to enter extreme offscreen areas
    if ((this.x<-dim) || (this.x>dim*2) || (this.y<-dim) || (this.y>dim*2)) {
      this.collide();
    }
};

// Axion particle
//   the axion particle draws a bold black path.  axions exist
//   in a slightly higher dimension and as such are drawn with
//   elevated embossed shadows.  axions are quick to stabilize
//   and fall into single pixel orbits axions automatically
//   recollide themselves after stabilizing.

function Axion (X, Y) {
  // position
  this.x = X;
  this.y = Y;
  this.vx = 0;
  this.vy = 0;
  // orbit
  this.theta = 0;
  this.speed = 0;
  // decay
  this.speedD = 0;
  this.thetaD = 0;
  this.thetaDD = 0;
  this.myc = color(0,0,0,0);
 
}

Axion.prototype.collide = function ()  {
    // initialize all parameters with random collision
    this.x = dim/2;
    this.y = dim/2;
    this.theta = random(TWO_PI);
    this.speed = random(1.0,6.0);

    this.speedD = random(0.998,1.000);
    this.thetaD = 0;
    this.thetaDD = 0;

    // rate of orbit decay
    while (abs(this.thetaDD)<0.00001) {
      this.thetaDD = random(-0.001,0.001);
    }
  };

Axion.prototype.move = function () {
    // draw - axions are high contrast
    stroke(16, 16, 16, 150);
    point(this.x,this.y);
    
    // axions cast vertical glows, highlight/shadow emboss
    for (var dy=1;dy<5;dy++) {
      stroke(255,255,255,30-dy*6);
      point(this.x,this.y-dy);
    }

    for (var dy=1;dy<5;dy++) {
      stroke(0 ,0,0,30-dy*6);
      point(this.x,this.y+dy);
    }

    // move
    this.x+=this.vx;
    this.y+=this.vy;
    // turn
    this.vx = this.speed*sin(this.theta);
    this.vy = this.speed*cos(this.theta);

    this.theta+=this.thetaD;

    // modify spin
    this.thetaD+=this.thetaDD;
    // modify speed
    this.speed*=this.speedD;
    this.speedD*=0.9999;
    if (random(1000)>996) {
      // reverse orbit
      this.speed*=-1;
      this.speedD=2-this.speedD;
      if (random(100)>30) {
        this.x = dim/2;
        this.y = dim/2;
        this.collide();
      }
    }
};


// the end


