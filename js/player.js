export class Player {
  constructor() {
    this.width = 46;
    this.height = 34;
    this.reset(180, 300);
  }

  reset(x, groundY) {
    this.x = x;
    this.y = groundY - this.height;
    this.vx = 0;
    this.vy = 0;
    this.onGround = true;
    this.jumpsLeft = 2;
    this.invulnerable = 0;
    this.rotation = 0;
  }

  update(dt, input, world) {
    const accel = 1500;
    const maxSpeed = 360;
    const drag = 0.82;

    if (input.left) this.vx -= accel * dt;
    if (input.right) this.vx += accel * dt;
    if (!input.left && !input.right) this.vx *= Math.pow(drag, dt * 60);
    this.vx = Math.max(-maxSpeed, Math.min(maxSpeed, this.vx));

    let jumped = false;
    if (input.consumeJump() && this.jumpsLeft > 0) {
      this.vy = -610;
      this.jumpsLeft--;
      this.onGround = false;
      jumped = true;
    }

    this.vy += world.gravity * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    if (this.y + this.height >= world.groundY) {
      this.y = world.groundY - this.height;
      this.vy = 0;
      this.onGround = true;
      this.jumpsLeft = 2;
    }

    this.x = Math.max(26, Math.min(world.width - this.width - 26, this.x));
    this.rotation = Math.max(-0.22, Math.min(0.22, this.vy / 1400));
    if (this.invulnerable > 0) this.invulnerable -= dt;
    return { jumped };
  }

  get bounds() {
    return { x:this.x, y:this.y, width:this.width, height:this.height };
  }

  hit() {
    if (this.invulnerable > 0) return false;
    this.invulnerable = 1.2;
    return true;
  }

  protect(seconds=1.4) {
    this.invulnerable = Math.max(this.invulnerable, seconds);
  }
}
