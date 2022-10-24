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
  KeyD: false,
  KeyA: false,
  KeyW: false,
  KeyS: false,
  space: false,
  Escape: false,
};

document.onkeydown = function keyDown(event) {
  if (event.code in key_state) {
    key_state[event.code] = true;
    //console.log(event.key + " is " + key_state[event.key]);
  }
  if (event.code == "Space") {
    key_state.space = true;
  }
};
document.onkeyup = function keyUp(event) {
  if (event.code in key_state) {
    key_state[event.code] = false;
    //console.log(event.key + " is " + key_state[event.key]);
  }
  if (event.code == "Space") {
    key_state.space = false;
  }
};

class Player {
  constructor() {
    this.asteroid_kills = 0;
    this.key_map = {
      up: "KeyW",
      left: "KeyA",
      down: "KeyS",
      right: "KeyD",
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
      // console.log(Bullet.bullets);
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
    window_ctx.strokeStyle = "Lime";
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
  static MAXLVL = 2;
  static radius = [40, 30, 20];
  static speed = [100, 200, 300];
  static asteroids = [];
  static update_asteroids(delta_time, plyr) {
    for (let i = 0; i < Asteroid.asteroids.length; i++) {
      Asteroid.asteroids[i].update(delta_time);
      // console.log(plyr.position);
      //* Check player
      let player_distance = Math.sqrt(
        (Asteroid.asteroids[i].position.x - plyr.position.x) *
          (Asteroid.asteroids[i].position.x - plyr.position.x) +
          (Asteroid.asteroids[i].position.y - plyr.position.y) *
            (Asteroid.asteroids[i].position.y - plyr.position.y)
      );

      if (player_distance < Asteroid.asteroids[i].RADIUS + plyr.RADIUS / 3) {
        //* Player loose
        // console.log("Player hit");
        Menu.in_end_menu = true;
      }

      let del_flag = false;
      for (let j = 0; j < Bullet.bullets.length; j++) {
        let bullet_distance = Math.sqrt(
          (Asteroid.asteroids[i].position.x - Bullet.bullets[j].position.x) *
            (Asteroid.asteroids[i].position.x - Bullet.bullets[j].position.x) +
            (Asteroid.asteroids[i].position.y - Bullet.bullets[j].position.y) *
              (Asteroid.asteroids[i].position.y - Bullet.bullets[j].position.y)
        );

        if (
          bullet_distance <
          Asteroid.asteroids[i].RADIUS + Bullet.bullets[j].RADIUS
        ) {
          //* remove bullet
          Bullet.bullets.splice(j, 1);
          j--;
          del_flag = true;
        }
      }

      //* delete asteriod, spawn with level+1
      if (del_flag) {
        let level = Asteroid.asteroids[i].level;
        let xpos = Asteroid.asteroids[i].position.x;
        let ypos = Asteroid.asteroids[i].position.y;
        Asteroid.asteroids.splice(i, 1);
        i--;
        if (level != Asteroid.MAXLVL) {
          for (let k = 0; k < 2; k++) {
            let new_asteroid = new Asteroid();
            new_asteroid.spawn(xpos, ypos, level + 1);
            Asteroid.asteroids.push(new_asteroid);
          }
        }
        plyr.asteroid_kills++;
      }
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

  spawn(posx, posy, level) {
    this.level = level;
    this.position = {
      x: posx,
      y: posy,
    };
    this.SPEED = Asteroid.speed[this.level];
    this.angle = Math.random() * 2 * Math.PI;
    this.vel = {
      x: this.SPEED * Math.cos(this.angle),
      y: this.SPEED * Math.sin(this.angle),
    };
    this.RADIUS = Asteroid.radius[this.level];
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
        // console.log(Bullet.bullets);
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
    window_ctx.strokeStyle = "Yellow";
    window_ctx.fillStyle = "Black";
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

class Menu {
  static in_start_menu = false;
  static in_pause_menu = false;
  static pause_is_held = false;
  static in_end_menu = false;
  static updateStartMenu() {
    if (key_state.KeyS && Menu.in_start_menu) {
      Menu.in_start_menu = false;
    }
    if (Menu.in_start_menu) {
      Menu.drawStartMenu();
    }
  }
  static drawStartMenu() {
    window_ctx.font = "25px helvetica";
    window_ctx.fillStyle = "white";
    window_ctx.textAlign = "center";
    window_ctx.fillText(
      "Press *s* to Start!",
      WINDOW_WIDTH / 2,
      WINDOW_HEIGHT / 2
    );
  }
  static updatePauseMenu() {
    if (Menu.in_start_menu || Menu.in_end_menu) {
      return;
    }
    if (key_state.Escape && !Menu.in_pause_menu && !Menu.pause_is_held) {
      Menu.in_pause_menu = true;
      Menu.pause_is_held = true;
    }
    if (!key_state.Escape) {
      Menu.pause_is_held = false;
    }
    if (key_state.Escape && Menu.in_pause_menu && !Menu.pause_is_held) {
      Menu.in_pause_menu = false;
      Menu.pause_is_held = true;
    }
    if (Menu.in_pause_menu) {
      Menu.drawPauseMenu();
    }
  }
  static drawPauseMenu() {
    window_ctx.font = "25px helvetica";
    window_ctx.fillStyle = "white";
    window_ctx.textAlign = "center";
    window_ctx.fillText("Paused", WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2);
  }
  static updateEndMenu() {
    if (Menu.in_end_menu) {
      Menu.drawEndMenu();
    }
    if (Menu.in_end_menu && key_state.KeyS) {
      p1 = new Player();
      Menu.in_end_menu = false;
      Asteroid.asteroids = [];
      Bullet.bullets = [];
      //* restart game
    }
  }
  static drawEndMenu() {
    window_ctx.font = "25px helvetica";
    window_ctx.fillStyle = "white";
    window_ctx.textAlign = "center";
    window_ctx.fillText("Game Over!", WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2 - 20);
    window_ctx.fillText(
      "<s> to play again",
      WINDOW_WIDTH / 2,
      WINDOW_HEIGHT / 2 + 20
    );
  }
  constructor() {}
}

class UIInfo {
  static drawFps(fps) {
    window_ctx.textAlign = "left";
    window_ctx.font = "20px Helvetica";
    window_ctx.fillStyle = "white";
    window_ctx.fillText("FPS: " + fps, 5, WINDOW_HEIGHT - 20);
  }

  static drawEscHelper() {
    window_ctx.textAlign = "right";
    window_ctx.font = "20px Helvetica";
    window_ctx.fillStyle = "white";
    window_ctx.fillText("*esc* to pause", WINDOW_WIDTH - 5, 20);
  }
}

let p1 = new Player();

Asteroid.asteroids.push(new Asteroid());
// console.log(Asteroid.asteroids);

let delta_time;
let oldTimeStamp;
let fps;
let since_last_asteroid = 0;
let max_time_between_spawn = 250;
Menu.in_start_menu = true;
Menu.in_pause_menu = false;
Menu.in_end_menu = false;

//GAME LOOP
function gameLoop(timestamp) {
  draw_background();

  delta_time = (timestamp - oldTimeStamp) / 1000;
  if (isNaN(delta_time)) delta_time = 0;
  oldTimeStamp = timestamp;
  fps = Math.round(1 / delta_time);

  // UIInfo.drawFps(fps);

  Menu.updateStartMenu();

  Menu.updatePauseMenu();

  Menu.updateEndMenu();

  if (!Menu.in_start_menu && !Menu.in_pause_menu) {
    if (!Menu.in_end_menu) {
      UIInfo.drawEscHelper();
    }

    window_ctx.textAlign = "left";
    window_ctx.fillText("Kills: " + p1.asteroid_kills, 5, 20);

    //* Still update bullets & asteroids in end menu

    Asteroid.update_asteroids(delta_time, p1);
    Bullet.update_bullets(delta_time);
    if (!Menu.in_end_menu) {
      //* handling asteroid spawning
      since_last_asteroid += delta_time * 60;

      if (
        Math.floor(
          Math.random() *
            (max_time_between_spawn - since_last_asteroid) *
            Asteroid.asteroids.length *
            2
        ) <= 0
      ) {
        // console.log(since_last_asteroid);
        Asteroid.asteroids.push(new Asteroid());
        since_last_asteroid = 0;
      }
      p1.update(delta_time);
    }
  }

  window.requestAnimationFrame(gameLoop);
}
