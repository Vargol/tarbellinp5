// Node Garden
// j.tarbell     August, 2004
// Albuquerque, New Mexico
// complexification.net

// Processing 0085 Beta syntax update
// j.tarbell   April, 2005

var dim;
var numSpines;
var maxSpines;
var numNodes;
var maxNodes;

var nodeIcoDark;
var nodeIcoSpec;
var nodeIcoBase;
var coloursgif;

// collection of nodes
var gnodes = [];

// collection of spines
var spines = [];

// color parameters
var maxpal = 512;
var numpal = 0;
var goodcolor = [];

var render = 0;

function preload() {
  
  // load node icon   
  nodeIcoDark = loadImage("images/nodeXlgDark.png");
  nodeIcoSpec = loadImage("images/nodeXlgSpecular.png");
  nodeIcoBase = loadImage("images/nodeXlgBase.png");
  coloursgif = loadImage("images/longshort.gif");
}

function setup() {
  
  dim = 1000;
  maxSpines = 500;
  maxNodes = 10000;

// color parameters
  maxpal = 512;
  numpal = 0;
  
  createCanvas(1000,1000);
  
//  size(1000,1000,P3D);
//  size(dim,dim,P3D);
  takecolor(coloursgif);
  background(255);
  ellipseMode(CENTER);


  // create all nodes
//  gnodes = new GNode[maxNodes];
  
  // create all spines
//  spines = new Spine[maxSpines];
  
  // go baby
  begin();  

}

function draw() {
  // six step rendering cycle
  if (render>0) {
    if (render==1) {
      // randomly connect all nodes
      for (var n=0;n<numNodes*5;n++) {
        var i = random(numNodes) | 0;
        gnodes[i].findNearConnection();
      }
    } else if (render==2) {
      // remove obscured nodes
      for (var n=0;n<numNodes;n++) {
        gnodes[n].calcHidden();
      }
    } else if (render==3) {
      // draw all gnodes
      for (var n=0;n<numNodes;n++) {
        gnodes[n].drawNodeDark();
      }
    } else if (render==4) {
      // draw all connections
      for (var n=0;n<numNodes;n++) {
        gnodes[n].drawConnections();
      }
    } else if (render==5) {
      // decorate gnodes
      for (var n=0;n<numNodes;n++) {
        gnodes[n].drawNodeBase();
      }
    } else if (render==6) {
      for (var n=0;n<numNodes;n++) {
        gnodes[n].drawNodeSpecular();
      }
    }
    render++;
    if (render>6) {
      render = 0;
    }
  }
}

function mousePressed() {
  background(255);
  begin();
}


function makeNode(X, Y, M) {
    if (numNodes<maxNodes) {
      gnodes[numNodes] = new GNode(numNodes);
      gnodes[numNodes].setPosition(X,Y);
      gnodes[numNodes].setMass(M);
      numNodes++;
    }
}

function makeSpine(X, Y, T, MTime) {
  if (numSpines<maxSpines) {
    spines[numSpines] = new Spine(numSpines);
    spines[numSpines].setPosition(X,Y);
    spines[numSpines].setTheta(T);
    spines[numSpines].traceInto(MTime);
    numSpines++;
  }
}

function begin() {
  // reset object counters
  numSpines = 0;
  numNodes = 0;

/*
  // arrange spines in line
  for (var i=0;i<maxSpines;i++) {
    float x = dim/4 + i*dim/(maxSpines-1);
    float y = dim/2;
    float mt = 420; 
    makeSpine(x,y,-HALF_PI,mt);
    makeSpine(x,y,HALF_PI,mt);
  }
  */
  // arrange spines in circle
  for (var i=0;i<maxSpines;i++) {
    var a = TWO_PI*i/(maxSpines-1);
    var x = dim/2 + 0.15*dim*cos(a);
    var y = dim/2 + 0.15*dim*sin(a);
    var mt = random(11,140); 
    makeSpine(x,y,a,mt);
    
    // make a second spine in opposite direction
//    makeSpine(x,y,a+PI,mt);
  }
  
  // begin step one of rendering process  
  render = 1;
}


// OBJECTS ----------------------------------------------------------------

var Spine = function (Id) {
  
 // var id;
  
  this.x,this.y;
  this.xx,this.yy;
  
  this.step;
  
  this.theta;
  this.thetav;
  this.thetamax;
  this.time;
  
  this.depth = 1;
  this.t = [];
  this.amp = [];

   this.id = Id;
   this.step = random(2.0,7.3);
   this.thetamax = 0.1;
   this.theta = random(TWO_PI);
   for (var n=0;n<this.depth;n++) {
     this.amp[n] = random(0.01,0.3);
     this.t[n] = random(0.01,0.2);
   }
}

Spine.prototype.setPosition = function (X, Y) {
  this.x = X;
  this.y = Y;
}

Spine.prototype.setTheta = function (T) {
  this.theta = T;
}

Spine.prototype.traceInto = function (MT) {
  // skip into the future
  for (time=random(MT);time<MT*2;time+=random(0.1,2.0)) {
    this.grow();
  }
}

Spine.prototype.grow = function () {
  // save last position
  this.xx = this.x;
  this.yy = this.y;
  
  // calculate new position
  this.x+=this.step*cos(this.theta);
  this.y+=this.step*sin(this.theta);
  
  // rotational meander
  var thetav = 0.0;
  for (var n=0;n<this.depth;n++) {
    thetav+=this.amp[n]*sin(time*this.t[n]);
    this.amp[n]*=0.9998;
    this.t[n]*=0.998;
  }
  
  this.step*=1.005;
//    step*=0.995;
//    step+=0.01;
  this.theta+=thetav;
  
  // render    
  this.draw();
  
  // place node?
  if (random(1000)<61) {
    var m = random(3.21,5+500/(1+time));
    makeNode(this.x,this.y,m);
  }
}  

Spine.prototype.draw = function () {
  stroke(85,26);
  line(this.x,this.y,this.xx,this.yy);
}
  



// -----------------------

function GNode(Id) {
  
  
  var id;
  var x, y;
  var mass;

  // connections
  var numcons;
  var maxcons;
  var cons;
  
  var hidden;
  
  var myc;
      
  // set identification number
  this.id = Id;
  // create connection list
  this.cons = [];
  // initialize one time

  this.maxcons = 11;
  this.cons = [];
  // initialize connections
  this.initConnections();
  // pick color
  this.myc = somecolor();
  this.hidden = false;

}
  
GNode.prototype.initConnections = function () {
  // set number of connections to zero
  this.numcons=0;
}

GNode.prototype.calcHidden = function () {
  // determine if hidden by larger gnode
  for (var n=0;n<numNodes;n++) {
    if (n!=this.id) {
      if (gnodes[n].mass>this.mass) {
        var d = dist(this.x,this.y,gnodes[n].x,gnodes[n].y);
        if (d<abs(this.mass*0.321-gnodes[n].mass*0.321)) {
            this.hidden = true;
        }
      }
    }
  }
}

GNode.prototype.setPosition = function (X, Y) {
  // position self
  this.x=X;
  this.y=Y;
}

GNode.prototype.setMass = function (Sz) {
  // set size
  this.mass=Sz;
}
 
GNode.prototype.findRandomConnection = function () {
  // check for available connection element
  if ((this.numcons<this.maxcons) && (this.numcons<this.mass)) {
    // pick other gnode at large
    var cid = int(random(this.numNodes));
    if (cid!=this.id) {
      this.cons[this.numcons]=this.cid;
      this.numcons++;
//        println(id+" connected to "+cid);
    } else {
      // random connection failed
    }
  } else {
    // no connection elements available
  }
}

GNode.prototype.findNearConnection = function () {
  // find closest node
  if ((this.numcons<this.maxcons) && (this.numcons<this.mass)) {
    // sample 5% of nodes for near connection
    var dd = dim;
    var dcid = -1;
    for (var k=0;k<(numNodes/20);k++) {
      var cid = int(random(numNodes-1));
      var d = sqrt((this.x-gnodes[cid].x)*(this.x-gnodes[cid].x)+(this.y-gnodes[cid].y)*(this.y-gnodes[cid].y));
      if ((d<dd) && (d<this.mass*6)) {
        // closer gnode has been found
        dcid = cid;
        dd = d;
      }
    }
  
    if (dcid>=0) {
      // close node has been found, connect to it
      this.connectTo(dcid);
    }
  }
}

GNode.prototype.connectTo = function (Id) {
  if (this.numcons<this.maxcons) {
    var duplicate = false;
    for (var n=0;n<this.numcons;n++) {
      if (this.cons[n]==Id) {
        duplicate = true;
      }
    }
    if (!duplicate) {
      this.cons[this.numcons]=Id;
      this.numcons++;  
    }
  }
}
                       
GNode.prototype.drawNodeDark = function () {
  // stamp node icon down
  if (!this.hidden) {
    var half_mass = this.mass/2;
  //  blend(nodeIcoDark,0,0,nodeIcoDark.width,nodeIcoDark.height,int(x-half_mass),int(y-half_mass),int(mass),int(mass),DARKEST);  
      image(nodeIcoDark,int(this.x-half_mass),int(this.y-half_mass),int(this.mass),int(this.mass));
      
  }
}

GNode.prototype.drawNodeSpecular = function () {
  // stamp node specular
  if (!this.hidden) {
    var half_mass = this.mass/2;
  //  blend(nodeIcoSpec,0,0,nodeIcoSpec.width,nodeIcoSpec.height,int(x-half_mass),int(y-half_mass),int(mass),int(mass),LIGHTEST);  
    image(nodeIcoSpec,int(this.x-half_mass),int(this.y-half_mass),int(this.mass),int(this.mass));
  }
}

GNode.prototype.drawNodeBase = function () {
  // stamp node base
  if (!this.hidden) {
    var half_mass = this.mass/2;
    image(nodeIcoBase,int(this.x-half_mass),int(this.y-half_mass),int(this.mass),int(this.mass));
//      blend(nodeIcoBase,0,0,nodeIcoBase.width,nodeIcoBase.height,int(x-half_mass),int(y-half_mass),int(mass),int(mass),DARKEST);  
  }
}
    
                
GNode.prototype.drawConnections = function () {
  
  var r = red(this.myc);
  var g = green(this.myc);
  var b = blue(this.myc);

  for (var n=0;n<this.numcons;n++) {
    // calculate connection distance
    var d = 4*dist(this.x,this.y,gnodes[this.cons[n]].x,gnodes[this.cons[n]].y);
    for (var i=0;i<d;i++) {
      // draw several points between connected gnodes  
      var a = i/d;
      // fuzz
      var fx = random(-0.42,0.42);
      var fy = random(-0.42,0.42);
      var cx = fx + this.x+(gnodes[this.cons[n]].x-this.x)*a;
      var cy = fy + this.y+(gnodes[this.cons[n]].y-this.y)*a;
      
      stroke(r,g,b,256*(0.05+(1-sin(a*PI))*0.16));
      point(cx,cy);
    }
  }   
}



// COLOR METHODS ----------------------------------------------------------------

function somecolor() {
  // pick some random good color
  return goodcolor[int(random(numpal))];
}

function takecolor(fn) {
  var b;
  b = fn;
  
  image(b,0,0);

  for (var x=0;x<b.width;x++){
    for (var y=0;y<b.height;y++) {
      var c = get(x,y);
      var exists = false;
      for (var n=0;n<numpal;n++) {
        if (c==goodcolor[n]) {
          exists = true;
          break;
        }
      }
      if (!exists) {
        // add color to pal
        if (numpal<maxpal) {
          goodcolor[numpal] = c;
          numpal++;
        }
      }
    }
  }
}
