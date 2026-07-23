export class World {
  constructor() {
    this.width = innerWidth;
    this.height = innerHeight;
    this.gravity = 1750;
    this.groundY = this.height * 0.78;
    this.reset();
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    this.groundY = height * (height < 650 ? 0.76 : 0.8);
  }

  reset() {
    this.baseSpeed = 250;
    this.speed = 250;
    this.distance = 0;
    this.time = 0;
    this.boostTimer = 0;
  }

  setRoute(route) {
    this.baseSpeed = route?.speed || 250;
  }

  activateBoost(seconds=2.4) {
    this.boostTimer = Math.max(this.boostTimer, seconds);
  }

  update(dt) {
    this.time += dt;
    this.boostTimer = Math.max(0, this.boostTimer - dt);
    const difficulty = Math.min(150, this.time * 3.8);
    const boost = this.boostTimer > 0 ? 135 : 0;
    this.speed = this.baseSpeed + difficulty + boost;
    this.distance += this.speed * dt;
  }
}
