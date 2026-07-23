export class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  reset() {
    this.particles = [];
  }

  burst(x,y,color="#5fd7ff",count=14) {
    for (let i=0;i<count;i++) {
      const a = Math.random()*Math.PI*2;
      const speed = 60+Math.random()*220;
      const life = .35+Math.random()*.55;
      this.particles.push({
        x,y,
        vx:Math.cos(a)*speed,
        vy:Math.sin(a)*speed,
        life,
        maxLife:life,
        size:2+Math.random()*4,
        color
      });
    }
  }

  trail(x,y,color="#5fd7ff") {
    if (Math.random() > .55) return;
    this.particles.push({
      x,y,vx:-40-Math.random()*80,vy:(Math.random()-.5)*35,
      life:.25,maxLife:.25,size:2+Math.random()*3,color
    });
    if (this.particles.length > 240) this.particles.splice(0, this.particles.length - 240);
  }

  update(dt) {
    for (const p of this.particles) {
      p.life -= dt;
      p.x += p.vx*dt;
      p.y += p.vy*dt;
      p.vy += 90*dt;
    }
    this.particles = this.particles.filter(p => p.life > 0);
  }
}
