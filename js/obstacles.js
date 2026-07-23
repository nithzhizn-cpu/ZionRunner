const TYPES = [
  { name:"Firewall", icon:"🔥", width:46, height:68, kind:"ground" },
  { name:"Jammer", icon:"⌁", width:56, height:76, kind:"ground" },
  { name:"Malware", icon:"✹", width:44, height:44, kind:"air" },
  { name:"Dead zone", icon:"", width:74, height:30, kind:"gap" }
];

export class ObstacleManager {
  constructor() {
    this.items = [];
    this.timer = 0;
  }

  reset() {
    this.items = [];
    this.timer = 0.8;
  }

  update(dt, world) {
    this.timer -= dt;
    if (this.timer <= 0) {
      const type = TYPES[Math.floor(Math.random() * TYPES.length)];
      this.items.push({
        ...type,
        x: world.width + 80,
        y: type.kind === "air"
          ? world.groundY - 120 - Math.random() * 65
          : world.groundY - type.height,
        hit:false
      });
      this.timer = Math.max(0.7, 1.65 - world.speed / 650) + Math.random() * 0.58;
    }

    for (const item of this.items) item.x -= world.speed * dt;
    this.items = this.items.filter(item => item.x + item.width > -40);
  }

  collides(bounds) {
    return this.items.find(item =>
      !item.hit &&
      bounds.x + 5 < item.x + item.width &&
      bounds.x + bounds.width - 5 > item.x &&
      bounds.y + 4 < item.y + item.height &&
      bounds.y + bounds.height - 2 > item.y
    );
  }

  remove(item) {
    item.hit = true;
  }
}
