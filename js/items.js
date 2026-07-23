export class ItemManager {
  constructor() {
    this.items = [];
    this.timer = 0;
  }

  reset() {
    this.items = [];
    this.timer = 1.2;
  }

  update(dt, world) {
    this.timer -= dt;
    if (this.timer <= 0) {
      const roll = Math.random();
      const type = roll < .57 ? "key" : roll < .73 ? "boost" : roll < .89 ? "shield" : "node";
      this.items.push({
        type,
        x: world.width + 40,
        y: world.groundY - 70 - Math.random() * 175,
        width: 30,
        height: 30,
        spin: Math.random() * Math.PI * 2,
        phase: Math.random() * Math.PI * 2
      });
      this.timer = 1.05 + Math.random() * 1.35;
    }

    for (const item of this.items) {
      item.x -= world.speed * dt;
      item.spin += dt * 5;
      item.phase += dt * 3.5;
    }

    this.items = this.items.filter(item => item.x > -50);
  }

  collect(bounds, radius=0) {
    const collected = [];
    this.items = this.items.filter(item => {
      const hit =
        bounds.x - radius < item.x + item.width &&
        bounds.x + bounds.width + radius > item.x &&
        bounds.y - radius < item.y + Math.sin(item.phase) * 7 + item.height &&
        bounds.y + bounds.height + radius > item.y + Math.sin(item.phase) * 7;
      if (hit) collected.push(item);
      return !hit;
    });
    return collected;
  }
}
