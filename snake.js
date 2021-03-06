var can = document.getElementById("myCan"),
    c = can.getContext('2d');

/* Canvas dimensions */
var cw = can.width,
    ch = can.height,
    
    Step = {ver: 0, hor: 0};

/* Base functions */
function compObj(obj1, obj2){ // Compare two object
  return (JSON.stringify(obj1) == JSON.stringify(obj2));
}

/* Board griding */
var grid = {
  size: 0,
  
  setSize: function(s){
    this.size = s;
    
    Step.ver = parseInt(cw/s);
    Step.hor = parseInt(ch/s);
  },
  getSize: function(){return this.size;},
  setColor: function(color){c.strokeStyle = color;},
  getColor: function(){return c.strokeStyle;},
  getbgColor: function(){return can.style.backgroundColor;},
  
  draw: function(){
    var size = this.getSize();
    
    c.beginPath();
  
    for(var x = 0; x <= Step.ver; x++) {
      c.moveTo(size*x, 0);
      c.lineTo(size*x, ch);
    
      for(var y = 0; y <= Step.hor; y++) {
        c.moveTo(0, size*y);
        c.lineTo(cw, size*y);
      }
    }
    c.stroke();
  },
  clear: function(){
    c.beginPath();
    c.fillStyle = "darkgreen";
    c.fillRect(0, 0, cw, ch);
    c.stroke();
  }
}

/* On-screen user interface */
var hud = {
  create: undefined,
  lay: { // Layouts
    addTo: function(layName, elm){},
    delFrom: function(layName, elm){},
    play: [
      "score",
      "lives"
    ],
    pause: [
      "toast",
      "legend"
    ],
    gOver: ["gameOver"]
  },
  getElm: function(elm){
    return document.getElementById(elm);
  },
  setText: function(elm, txt){
    elm.innerText = txt;
  },
  init: function(){
    
  },
  msg: {
    elm: "toast",
    addText: function(txt){hud.getElm(this.elm).innerText=txt;},

    show: function(){hud.show(this.elm);},
    hide: function(){hud.hide(this.elm);}
  },
  score: {
    elm: "score",
    val: 0,
    
    add: function(inc){
      this.val += inc;
      this.print();
    },    
    reset: function(){
      this.val = 0;
      this.print();
    },
    print: function() {
      hud.getElm("score").innerText = "Score: " + this.val;
    }
  },
  lives: {
    elm: "lives",
    val: 3,
    
    dead: function(){
      this.val -= 1;
      this.print();
    },    
    reset: function(){
      this.val = 3;
      this.print();
    },
    print: function() {
      hud.getElm("lives").innerText = this.val + ' lives left';
    }
  },
  show: function(elm){
    if (Array.isArray(elm)) {
      for (var i=0; i < elm.length;i++) {
        this.getElm(elm[i]).style.display = "initial"
      }
    } else this.getElm(elm).style.display = "initial";
  },
  hide: function(elm){
    if (Array.isArray(elm)) {
      for (var i=0; i < elm.length;i++) {
        this.getElm(elm[i]).style.display = "none"
      }
    } else this.getElm(elm).style.display = "none";
  },
}

/* Snake */
var snake = {
  coords: Array(0),
  afterCoord: {x:0, y:0},
  direction: "",
  isGrow: false,
  //getLen: function(){return this.coords.length;},
  init: function(){
    this.coords = Array(0);
    this.coords.push({x:parseInt(Step.ver/2),
                      y:parseInt(Step.hor/2)});
    this.draw();
  },
  setDir: function(dir){this.direction = dir;},
  getDir: function(){return this.direction;},
  find: function(coord){
    return this.coords.findIndex(function(obj){
      return (compObj(obj, coord));
    });
  },
  bite: function(coord){
    return this.coords.slice(1).findIndex(function(obj){
      return (compObj(obj, coord));
    });
  },
  move: function(direction){
    var dir = direction || this.direction;
    var coords = this.coords;
    var head = coords[0];
    
    switch(dir) {
      /* Y axis */
      case "up":    coords.unshift({x:head.x, y:head.y-1}); break; // Y-
      case "down":  coords.unshift({x:head.x, y:head.y+1}); break; // Y+
      /* X axis */
      case "left":  coords.unshift({x:head.x-1, y:head.y}); break; // X-
      case "right": coords.unshift({x:head.x+1, y:head.y}); break; // X+
      default: ;
    }
    
    // Update head after step
    head = coords[0];
    
    /* Head on the food */
    var index = food.find(head);
    if (index > -1) {
      food.eat(index);
      
      this.isGrow = true;
      
      hud.score.add(10);
            
      food.place();
    }
    
    /* Assign after snake coords */
    if (!this.isGrow) this.afterCoord = coords.pop();
      else this.isGrow = false;
    
    /* Bite yourself */
    if (this.bite(head)>-1) {
      game.end();
    }
    
    /* Hit the wall */
    if ((head.y < 0 || head.y >= Step.hor) ||
        (head.x < 0 || head.x >= Step.ver)) {
      dir = "";
      game.end();
    }
    
    this.setDir(dir);
  },
  draw: function() {
    var head = this.coords[0];
    
    c.beginPath();
    c.fillStyle = "#030";

    // Draw Snake's head
    c.fillRect(head.x*grid.getSize()+1,
               head.y*grid.getSize()+1,
               grid.getSize()-2,
               grid.getSize()-2);

    // Hide Snake's track
    if (!this.isGrow) {
      c.fillStyle = "darkgreen";
      c.fillRect(this.afterCoord.x*grid.getSize()+1,
                 this.afterCoord.y*grid.getSize()+1,
                 grid.getSize()-2,
                 grid.getSize()-2);
    }
    
    c.stroke();
  }
}

/* Food */
var food = {
  coords: Array(0),
  find: function(coord){
    return this.coords.findIndex(function(obj){
      return (obj.x == coord.x && obj.y == coord.y);
    });
  },
  add: function(coord){
    return this.coords.push(coord)-1; // Return index of added element
  },
  eat: function(id){
    this.coords.splice(id, 1);
  },
  reset: function(){
    this.coords = Array(0);
    this.place();
  },
  genRandCoord: function(){
    var rand = function(max){return Math.floor((Math.random()*max));};

    return {x:rand(Step.ver), y:rand(Step.hor)};
  },
  place: function(){
    var coords = this.genRandCoord(),
        pi = Math.PI,
        r = grid.getSize()/2;

    // Don't place food on snake
    while (snake.find(coords)>-1) {
      coords = this.genRandCoord();
    }
    
    // Possible to add multiple food (future feature)
    this.add(coords);

    c.fillStyle = "#C00";

    c.beginPath();
    c.arc(coords.x*grid.getSize()+r, coords.y*grid.getSize()+r, r-1, 0,2*pi);
    c.fill();
    c.stroke();
  }
}

/* Animation control */
var anim = {
  id: null,
  speed: 250,
  isPaused: true,
  
  setSpeed: function(spd){this.speed = spd;},
  getSpeed: function(){return this.speed;},
  play: function(){
    if (!this.id) this.id = setInterval(function(){ // Prevent the rerun
      snake.move();
      snake.draw();
    }, this.getSpeed());
    this.isPaused = false;
    return;
  },
  pause: function(){
    clearInterval(this.id);
    this.id = null;
    this.isPaused = true;
    return;
  },
  toggle: function(){
    if (this.isPaused === true) this.play();
      else this.pause();
  }
}

window.onkeyup = function(ev){
  /* Cross-browser event handling */
  var e = ev || event || window.event;
  var dir = snake.getDir();
  
  switch(e.keyCode){
    /* Opposite direction test, because the snake "Never Back Down" =) */
    case 38: if (dir !== "down")  dir = "up"; break;
    case 40: if (dir !== "up")    dir = "down"; break;
    case 37: if (dir !== "right") dir = "left"; break;
    case 39: if (dir !== "left")  dir = "right"; break;
    case 80: {
      anim.toggle();
      if (anim.isPaused) {
        hud.msg.addText("Paused");
        hud.msg.show();
      } else hud.msg.hide();
    }
      break;
    /*default: alert(e.keyCode);*/
  }
  
  if (36<e.keyCode && e.keyCode<41) {
    if (game.getStatus() == "end") game.reset(); else {
      hud.msg.hide();

      snake.setDir(dir);

      game.play();
    }
  }
}

var game = {
  status: "",
  
  setStatus: function(st){this.status = st;},
  getStatus: function(){return this.status;},
  
  start: function(){ //Set up for first launch
    this.setStatus("start");
    // Grid
    grid.setSize(25);
    grid.setColor("#333");
    grid.draw();
    
    // Hud
    hud.msg.addText("Press cursor keys to begin");
    
    // Snake
    snake.init();
    
    // Food
    food.place();
  },
  play: function(){
    // Hud
    hud.hide("title");
    hud.show(hud.lay.play);
    
    // Let's move
    anim.play();
  },
  end: function(){
    this.setStatus("end");
    // Hud
    hud.show("gameOver");
    hud.lives.dead();
    
    // Stop animation
    anim.pause();
  },
  reset: function(){
    this.setStatus("reset");
    // Grid (clean up)
    grid.clear();
    grid.draw();
    
    // Hud
    hud.hide("gameOver");
    hud.msg.addText("Press cursor keys to begin");
    hud.msg.show();
    if (hud.lives.val === 0) {
      hud.lives.reset();
      hud.score.reset();
    }
    
    // Snake
    snake.init();
    
    // Food
    food.reset();
  }
}
