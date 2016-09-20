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


  this.setPosition = function (X, Y) {
    this.x = X;
    this.y = Y;
  }
  
  this.setTheta = function (T) {
    this.theta = T;
  }
  
  this.traceInto = function (MT) {
    // skip into the future
    for (time=random(MT);time<MT*2;time+=random(0.1,2.0)) {
      this.grow();
    }
  }

  this.grow = function () {
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
  
  this.draw = function () {
    stroke(85,26);
    line(this.x,this.y,this.xx,this.yy);
  }
  
}



// -----------------------

function GNode() {
  var id;
  var x, y;
  var mass;

  // connections
  var numcons;
  var maxcons = 11;
  var cons = [];
  
  var hidden;
  
  var myc;
      
  function GNode(Id) {
    // set identification number
    id = Id;
    // create connection list
    cons = new int[maxcons];
    // initialize one time
    initSelf();
  }

  this.initSelf = function () { 
    // initialize connections
    initConnections();
    // pick color
    myc = somecolor();
    hidden = false;
  }
  
  this.initConnections = function () {
    // set number of connections to zero
    numcons=0;
  }
  
  this.calcHidden = function () {
    // determine if hidden by larger gnode
    for (var n=0;n<numNodes;n++) {
      if (n!=id) {
        if (gnodes[n].mass>mass) {
          var d = dist(x,y,gnodes[n].x,gnodes[n].y);
          if (d<abs(mass*0.321-gnodes[n].mass*0.321)) {
              hidden = true;
          }
        }
      }
    }
  }
  
  this.setPosition = function (X, Y) {
    // position self
    x=X;
    y=Y;
  }
  
  this.setMass = function (Sz) {
    // set size
    mass=Sz;
  }
   
  this.findRandomConnection = function () {
    // check for available connection element
    if ((numcons<maxcons) && (numcons<mass)) {
      // pick other gnode at large
      var cid = int(random(numNodes));
      if (cid!=id) {
        cons[numcons]=cid;
        numcons++;
//        println(id+" connected to "+cid);
      } else {
        // random connection failed
      }
    } else {
      // no connection elements available
    }
  }
  
  this.findNearConnection = function () {
    // find closest node
    if ((numcons<maxcons) && (numcons<mass)) {
      // sample 5% of nodes for near connection
      var dd = dim;
      var dcid = -1;
      for (var k=0;k<(numNodes/20);k++) {
        var cid = int(random(numNodes-1));
        var d = sqrt((x-gnodes[cid].x)*(x-gnodes[cid].x)+(y-gnodes[cid].y)*(y-gnodes[cid].y));
        if ((d<dd) && (d<mass*6)) {
          // closer gnode has been found
          dcid = cid;
          dd = d;
        }
      }
    
      if (dcid>=0) {
        // close node has been found, connect to it
        connectTo(dcid);
      }
    }
  }

  this.connectTo = function (Id) {
    if (numcons<maxcons) {
      var duplicate = false;
      for (var n=0;n<numcons;n++) {
        if (cons[n]==Id) {
          duplicate = true;
        }
      }
      if (!duplicate) {
        cons[numcons]=Id;
        numcons++;  
      }
    }
  }
                         
  this.drawNodeDark = function () {
    // stamp node icon down
    if (!hidden) {
      var half_mass = mass/2;
      image(nodeIcoDark,int(x-half_mass),int(y-half_mass),int(mass),int(mass));  
    }
  }

  this.drawNodeSpecular = function () {
    // stamp node specular
    if (!hidden) {
      var half_mass = mass/2;
      image(nodeIcoSpec,int(x-half_mass),int(y-half_mass),int(mass),int(mass));  
    }
  }

  this.drawNodeBase = function () {
    // stamp node base
    if (!hidden) {
      var half_mass = mass/2;
      image(nodeIcoBase,int(x-half_mass),int(y-half_mass),int(mass),int(mass));  
    }
  }
      
                  
  this.drawConnections = function () {
    for (var n=0;n<numcons;n++) {
      // calculate connection distance
      var d = 4*dist(x,y,gnodes[cons[n]].x,gnodes[cons[n]].y);
      for (var i=0;i<d;i++) {
        // draw several points between connected gnodes  
        var a = i/d;
        // fuzz
        var fx = random(-0.42,0.42);
        var fy = random(-0.42,0.42);
        var cx = fx + x+(gnodes[cons[n]].x-x)*a;
        var cy = fy + y+(gnodes[cons[n]].y-y)*a;
        
        stroke(red(myc),green(myc),blue(myc),256*(0.05+(1-sin(a*PI))*0.16));
        point(cx,cy);
      }
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
