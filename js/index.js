var intro01 = document.getElementById('intro01'),
    intro02 = document.getElementById('intro02'),
    start = document.getElementById('start'),
    rules = document.getElementById('rules'),
    pause = document.getElementById('pause'),
    reset = document.getElementById('reset'),
    resume = document.getElementById('resume'),
    pongPaddle = document.getElementById('pongPaddle'),
    pongOut = document.getElementById('pongOut'),
    canvas = document.getElementById("game"),
    theLoop,
    game,
    collisionDiff,
    k,
    y;

///////////////EVENT LISTENERS///////////////
start.addEventListener('click', function(){
  game = new Game();
  mainLoop();
}, false);

pause.addEventListener('click', function(){
  pause.style.display = "none";
  resume.style.display = "block";
  clearTimeout(theLoop);
}, false);

resume.addEventListener('click', function(){
  resume.style.display = "none";
  pause.style.display = "block";
  mainLoop();
}, false);

reset.addEventListener('click', function(){
  clearTimeout(theLoop);
  game = new Game();
  mainLoop();
}, false);

rules.addEventListener('click', function(){
  intro01.style.display = "none";
  intro02.style.display = "block";
  rules.style.display = "none";
}, false);

///////////////OBJECTS///////////////
///GAME 
function Game() {
  this.width = canvas.width;
  this.height = canvas.height;
  this.context = canvas.getContext("2d");
  this.context.fillStyle = "white";
  this.keys = new KeyListener();

  this.p1 = new Paddle(5, 0);
  this.p1.y = this.height/2 - this.p1.height/2;
  this.display1 = new Display(this.width/4, 25);
  this.p2 = new Paddle(this.width - 5 - 15, 0);
  this.p2.y = this.height/2 - this.p2.height/2;
  this.display2 = new Display(this.width*3/4, 25);

  this.ball = new Ball();
  this.ball.x = this.width/2;
  this.ball.y = this.height/2;
  this.ball.vy = Math.floor(Math.random()*12 - 6);
  this.ball.vx = 14 - Math.abs(this.ball.vy);
}

Game.prototype.draw = function(){
  this.context.clearRect(0, 0, this.width, this.height);
  this.context.fillRect(this.width/2, 0, 2, this.height);
    
  this.ball.draw(this.context);
    
  this.p1.draw(this.context);
  this.p2.draw(this.context);
  this.display1.draw(this.context);
  this.display2.draw(this.context);
};
 
Game.prototype.update = function(){
  if (this.paused) return;
    
  this.ball.update();
  this.display1.value = this.p1.score;
  this.display2.value = this.p2.score;
 
  // Left Paddle's Directions
  if (this.keys.isPressed(83)) { // DOWN
    this.p1.y = Math.min(this.height - this.p1.height, this.p1.y + 4);
  } else if (this.keys.isPressed(87)) { // UP
    this.p1.y = Math.max(0, this.p1.y - 4);
  }
 
  //Right Paddle's Directions
  if (this.keys.isPressed(40)) { // DOWN
    this.p2.y = Math.min(this.height - this.p2.height, this.p2.y + 4);
  } else if (this.keys.isPressed(38)) { // UP
    this.p2.y = Math.max(0, this.p2.y - 4);
  }
 
  //Collision Detenction
  if (this.ball.vx > 0) {
    if (this.p2.x <= this.ball.x + this.ball.ballRadius && this.p2.x > this.ball.x - this.ball.vx + this.ball.ballRadius) {
      collisionDiff = this.ball.x + this.ball.ballRadius - this.p2.x;
      k = collisionDiff / this.ball.vx;
      y = this.ball.vy * k + (this.ball.y - this.ball.vy);
      if (y >= this.p2.y && y + this.ball.ballRadius <= this.p2.y + this.p2.height) {
        // collides with right paddle
        pongPaddle.play();
        this.ball.x = this.p2.x - this.ball.ballRadius;
        this.ball.y = Math.floor(this.ball.y - this.ball.vy + this.ball.vy * k);
        this.ball.vx = -this.ball.vx;
        }
      }
    } else {
      if (this.p1.x + this.p1.width >= this.ball.x) {
        collisionDiff = this.p1.x + this.p1.width - this.ball.x;
        k = collisionDiff / -this.ball.vx;
        y = this.ball.vy * k + (this.ball.y - this.ball.vy);
        if (y >= this.p1.y && y + this.ball.ballRadius <= this.p1.y + this.p1.height) {
          // collides with the left paddle
          pongPaddle.play();
          this.ball.x = this.p1.x + this.p1.width;
          this.ball.y = Math.floor(this.ball.y - this.ball.vy + this.ball.vy * k);
          this.ball.vx = -this.ball.vx;
          }
        }
      }
 
  // Top and bottom collision
  if ((this.ball.vy < 0 && this.ball.y < 0) || (this.ball.vy > 0 && this.ball.y + this.ball.ballRadius > this.height)) {
    pongPaddle.play();
    this.ball.vy = -this.ball.vy * 1.05;
  }
  
  //Ball goes off screen
  if (this.ball.x >= this.width) {
    pongOut.play();
    this.score(this.p1);
    } else if (this.ball.x + this.ball.ballRadius <= 0) {
      this.score(this.p2);
      pongOut.play();
      }
  };

Game.prototype.score = function(p){
  // player scores
  p.score++;
  if (this.p1.score === 12 || this.p2.score === 4){
    clearTimeout(theLoop);
    canvas.style.display = "none";
    pause.style.display = "none";
    reset.style.display = "none";
    start.style.display = "block";
    if (this.p1.score === 12){
      youWin.style.display = "block";
    } else {
      youLose.style.display = "block";
    }
    }
  var player = p == this.p1 ? 0 : 1;
  // set ball position
  this.ball.x = this.width/2;
  this.ball.y = p.y + p.height/2;
  // set ball velocity
  this.ball.vy = Math.floor(Math.random()*12 - 6);
  this.ball.vx = 14 - Math.abs(this.ball.vy);
  if (player == 1) this.ball.vx *= -1;
};

///PADDLE
function Paddle(x,y) {
  this.x = x;
  this.y = y;
  this.width = 15;
  this.height = 60;
  this.score = 0;
}

Paddle.prototype.draw = function(p){
  p.fillRect(this.x, this.y, this.width, this.height);
};

/// BALL
function Ball() {
  this.x = 0;
  this.y = 0;
  this.vx = 0;
  this.vy = 0;
  this.ballRadius = 10;
}
 
Ball.prototype.update = function(){
  this.x += this.vx;
  this.y += this.vy;
};
 
Ball.prototype.draw = function(p){
  p.beginPath();
  p.arc(this.x, this.y, this.ballRadius, 0, Math.PI*2, false);
  p.fill();
  p.closePath();
};

///DISPLAY SCORE
function Display(x, y) {
  this.x = x;
  this.y = y;
  this.value = 0;
}
 
Display.prototype.draw = function(p){
  p.font = "48px Geo";
  p.fillText(this.value, this.x, this.y);
};

///KEY LISTENER
function KeyListener() {
  this.pressedKeys = [];
  this.keydown = function(e) { this.pressedKeys[e.keyCode] = true; };
  this.keyup = function(e) { this.pressedKeys[e.keyCode] = false; };
  document.addEventListener("keydown", this.keydown.bind(this));
  document.addEventListener("keyup", this.keyup.bind(this));
}
 
KeyListener.prototype.isPressed = function(key){
  return this.pressedKeys[key] ? true : false;
};
 
KeyListener.prototype.addKeyPressListener = function(keyCode, callback){
  document.addEventListener("keypress", function(e) {
    if (e.keyCode == keyCode) callback(e);
  });
};

///////////////FUNCTIONS///////////////
function mainLoop() {
  intro01.style.display = "none";
  intro02.style.display = "none";
  canvas.style.display = "block";
  youWin.style.display = "none";
  youLose.style.display = "none";
  pause.style.display = "block";
  reset.style.display = "block";
  resume.style.display = "none";
  start.style.display = "none";
  rules.style.display = "none";  
  theLoop = setInterval(function(){
  game.update();
  game.draw();    
  }, 33.3333);
}