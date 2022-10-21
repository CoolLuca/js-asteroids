const game_window = document.getElementById("game-window");
const window_ctx = game_window.getContext("2d");
const WINDOW_WIDTH = 600;
const WINDOW_HEIGHT = 600;

const draw_background = function () {
  window_ctx.fillStyle = "black";
  window_ctx.fillRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
};

const setup_window = function () {
  game_window.width = WINDOW_WIDTH;
  game_window.height = WINDOW_HEIGHT;
  draw_background();
  window.requestAnimationFrame(gameLoop);
};

setup_window();

let key_state = {
  d: false,
  a: false,
  w: false,
  s: false,
  space: false,
};

document.onkeydown = function keyDown(event) {
  if (event.key in key_state) {
    key_state[event.key] = true;
    //console.log(event.key + " is " + key_state[event.key]);
  }
  if (event.code == "Space") {
    key_state.space = true;
  }
};
document.onkeyup = function keyUp(event) {
  if (event.key in key_state) {
    key_state[event.key] = false;
    //console.log(event.key + " is " + key_state[event.key]);
  }
  if (event.code == "Space") {
    key_state.space = false;
  }
};

class Player {
  constructor() {
    this.key_map = {
      up: "w",
      left: "a",
      down: "s",
      right: "d",
      fire: "space",
    };

    this.position = {
      x: WINDOW_WIDTH / 2,
      y: WINDOW_HEIGHT / 2,
    };
    this.vel = {
      x: 0,
      y: 0,
    };
    this.angle = -Math.PI / 2;
    this.speed = 0;
    this.MAX_SPEED = 500;
    this.ACC_ON_CLICK = 800;
    this.RADIUS = 15;
    this.DRAG = 1;
    this.has_fired = false;
  }

  update(delta_time) {
    if (isNaN(delta_time)) {
      return;
    }

    if (key_state[this.key_map.left]) {
      //console.log("left");
      this.angle -= 7 * delta_time;
    }

    if (key_state[this.key_map.right]) {
      //console.log("right");
      this.angle += 7 * delta_time;
    }

    if (key_state[this.key_map.up]) {
      //console.log("up");
      let new_x_vel = this.ACC_ON_CLICK * Math.cos(this.angle) * delta_time;
      let new_y_vel = this.ACC_ON_CLICK * Math.sin(this.angle) * delta_time;

      this.vel.x += new_x_vel;
      this.vel.y += new_y_vel;

      let xv = this.vel.x;
      let yv = this.vel.y;
      let new_speed = Math.sqrt(xv * xv + yv * yv);

      if (new_speed >= this.MAX_SPEED) {
        this.vel.x = this.MAX_SPEED * (xv / new_speed);
        this.vel.y = this.MAX_SPEED * (yv / new_speed);
      }
    } else if (!key_state.ArrowUp) {
      if (this.vel.x != 0) this.vel.x -= this.DRAG * this.vel.x * delta_time;
      if (this.vel.y != 0) this.vel.y -= this.DRAG * this.vel.y * delta_time;
    }
    this.position.x += this.vel.x * delta_time;
    this.position.y += this.vel.y * delta_time;

    if (key_state[this.key_map.down]) {
      //console.log("down");
    }

    if (key_state[this.key_map.fire] && this.has_fired == false) {
      this.has_fired = true;
      Bullet.bullets.push(
        new Bullet(
          this.angle,
          this.position.x + this.RADIUS * Math.cos(this.angle),
          this.position.y + this.RADIUS * Math.sin(this.angle)
        )
      );
      console.log(Bullet.bullets);
      // console.log(this.position);
      // console.log(this.angle);
    } else if (!key_state[this.key_map.fire]) {
      this.has_fired = false;
    }

    if (this.position.x > WINDOW_WIDTH + this.RADIUS / 2) {
      this.position.x = 0;
    } else if (this.position.x < 0 - this.RADIUS / 2) {
      this.position.x = WINDOW_WIDTH;
    } else if (this.position.y > WINDOW_HEIGHT + this.RADIUS / 2) {
      this.position.y = 0;
    } else if (this.position.y < 0 - this.RADIUS / 2) {
      this.position.y = WINDOW_HEIGHT;
    }

    this.draw();
  }

  draw() {
    let xpos = this.position.x;
    let ypos = this.position.y;

    let angle = this.angle;

    let x_head = xpos + this.RADIUS * Math.cos(angle);
    let y_head = ypos + this.RADIUS * Math.sin(angle);

    let x_p2 = xpos + this.RADIUS * Math.cos(angle + (2.2 * Math.PI) / 3);
    let y_p2 = ypos + this.RADIUS * Math.sin(angle + (2.2 * Math.PI) / 3);

    let x_p3 = xpos + this.RADIUS * Math.cos(angle - (2.2 * Math.PI) / 3);
    let y_p3 = ypos + this.RADIUS * Math.sin(angle - (2.2 * Math.PI) / 3);

    let x_p4 = xpos - (this.RADIUS / 3.5) * Math.cos(angle);
    let y_p4 = ypos - (this.RADIUS / 3.5) * Math.sin(angle);

    window_ctx.beginPath();
    window_ctx.strokeStyle = "White";
    window_ctx.fillStyle = "Black";
    window_ctx.lineWidth = 1.5;
    window_ctx.moveTo(x_head, y_head);
    window_ctx.lineTo(x_p2, y_p2);
    window_ctx.lineTo(x_p4, y_p4);
    window_ctx.lineTo(x_p3, y_p3);
    window_ctx.closePath();
    window_ctx.fill();
    window_ctx.stroke();
  }
}

class Asteroid {
  static radius = [40, 20, 10];
  static speed = [100, 200, 350];
  static asteroids = [];
  static update_asteroids(delta_time) {
    for (let i = 0; i < Asteroid.asteroids.length; i++) {
      Asteroid.asteroids[i].update(delta_time);
    }
  }
  constructor() {
    this.level = 0;
    this.position = {
      x: 0,
      y: 0,
    };
    this.SPEED = Asteroid.speed[this.level];
    this.angle = Math.random() * 2 * Math.PI;
    this.vel = {
      x: this.SPEED * Math.cos(this.angle),
      y: this.SPEED * Math.sin(this.angle),
    };
    this.RADIUS = Asteroid.radius[this.level];
    0, 1, 2, 3;
    let side = Math.floor(Math.random() * 4);

    if (side == 0) {
      //left wall
      this.position.x = 0;
      this.position.y = Math.random() * WINDOW_HEIGHT;
    } else if (side == 1) {
      //top wall
      this.position.y = 0;
      this.position.x = Math.random() * WINDOW_WIDTH;
    } else if (side == 2) {
      //right wall
      this.position.x = WINDOW_WIDTH;
      this.position.y = Math.random() * WINDOW_HEIGHT;
    } else if (side == 3) {
      //bot wall
      this.position.y = WINDOW_HEIGHT;
      this.position.x = Math.random() * WINDOW_WIDTH;
    }
  }

  draw() {
    window_ctx.beginPath();
    window_ctx.strokeStyle = "White";
    window_ctx.fillStyle = "black";
    window_ctx.lineWidth = 1.5;
    window_ctx.arc(
      this.position.x,
      this.position.y,
      this.RADIUS,
      0,
      2 * Math.PI
    );
    window_ctx.fill();
    window_ctx.stroke();
    window_ctx.closePath();
  }
  update(delta_time) {
    if (isNaN(delta_time)) {
      return;
    }
    this.position.x += this.vel.x * delta_time;
    this.position.y += this.vel.y * delta_time;

    /*//TODO   check if distance from each bullet/player is < radius
      //TODO   for bullet, splice bullet from array, delete asteroid, 
      //TODO   then dependning on asteroid level spawn new asteroid with 1 more level need to create spawn() method
      //TODO   for player: end game
    */

    if (this.position.x > WINDOW_WIDTH + this.RADIUS) {
      this.position.x = 0;
    } else if (this.position.x < 0 - this.RADIUS) {
      this.position.x = WINDOW_WIDTH;
    } else if (this.position.y > WINDOW_HEIGHT + this.RADIUS) {
      this.position.y = 0;
    } else if (this.position.y < 0 - this.RADIUS) {
      this.position.y = WINDOW_HEIGHT;
    }

    this.draw();
  }
}

//* BULLET
class Bullet {
  static bullets = [];
  static update_bullets(delta_time) {
    for (let i = 0; i < Bullet.bullets.length; i++) {
      Bullet.bullets[i].update(delta_time);
      if (Bullet.bullets[i].time_since_spawn > Bullet.lifetime) {
        Bullet.bullets.splice(i, 1);
        console.log(Bullet.bullets);
      }
    }
  }
  static lifetime = 0.8;
  constructor(ang, posx, posy) {
    this.angle = ang;
    this.time_since_spawn = 0;

    this.SPEED = 700;
    this.RADIUS = 5;
    this.vel = {
      x: this.SPEED * Math.cos(this.angle),
      y: this.SPEED * Math.sin(this.angle),
    };
    this.position = {
      x: posx,
      y: posy,
    };

    this.draw_pt1 = {
      x: this.RADIUS * Math.cos(this.angle),
      y: this.RADIUS * Math.sin(this.angle),
    };

    this.draw_pt2 = {
      x: this.RADIUS * Math.cos(this.angle + (2.5 * Math.PI) / 3),
      y: this.RADIUS * Math.sin(this.angle + (2.5 * Math.PI) / 3),
    };

    this.draw_pt3 = {
      x: this.RADIUS * Math.cos(this.angle - (2.5 * Math.PI) / 3),
      y: this.RADIUS * Math.sin(this.angle - (2.5 * Math.PI) / 3),
    };
  }
  draw() {
    let p1x = this.position.x + this.draw_pt1.x;
    let p1y = this.position.y + this.draw_pt1.y;

    let p2x = this.position.x + this.draw_pt2.x;
    let p2y = this.position.y + this.draw_pt2.y;

    let p3x = this.position.x + this.draw_pt3.x;
    let p3y = this.position.y + this.draw_pt3.y;
    window_ctx.beginPath();
    window_ctx.strokeStyle = "White";
    window_ctx.fillStyle = "Yellow";
    window_ctx.lineWidth = 1.5;
    window_ctx.moveTo(p1x, p1y);
    window_ctx.lineTo(p2x, p2y);
    window_ctx.lineTo(p3x, p3y);
    window_ctx.closePath();
    window_ctx.fill();
    window_ctx.stroke();
  }

  update(delta_time) {
    if (isNaN(delta_time)) {
      return;
    }

    this.time_since_spawn += delta_time;

    this.position.x += this.vel.x * delta_time;
    this.position.y += this.vel.y * delta_time;

    if (this.position.x > WINDOW_WIDTH + this.RADIUS) {
      this.position.x = 0;
    } else if (this.position.x < 0 - this.RADIUS) {
      this.position.x = WINDOW_WIDTH;
    } else if (this.position.y > WINDOW_HEIGHT + this.RADIUS) {
      this.position.y = 0;
    } else if (this.position.y < 0 - this.RADIUS) {
      this.position.y = WINDOW_HEIGHT;
    }

    this.draw();
  }
}

let p1 = new Player();

Asteroid.asteroids.push(new Asteroid());
console.log(Asteroid.asteroids);

let b1 = new Bullet(0, 300, 300);

let delta_time;
let oldTimeStamp;
let fps;

function gameLoop(timestamp) {
  draw_background();

  delta_time = (timestamp - oldTimeStamp) / 1000;
  oldTimeStamp = timestamp;
  fps = Math.round(1 / delta_time);

  window_ctx.font = "20px Helvetica";
  window_ctx.fillStyle = "white";
  window_ctx.fillText("FPS: " + fps, 5, 20);

  Asteroid.update_asteroids(delta_time);
  Bullet.update_bullets(delta_time);
  p1.update(delta_time);

  window.requestAnimationFrame(gameLoop);
}
