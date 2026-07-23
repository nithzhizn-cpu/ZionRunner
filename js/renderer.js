export class Renderer {
  constructor(ctx) {
    this.ctx = ctx;
  }

  clear(width,height) {
    const ctx = this.ctx;
    const g = ctx.createLinearGradient(0,0,0,height);
    g.addColorStop(0,"#07111d");
    g.addColorStop(.62,"#090d18");
    g.addColorStop(1,"#030508");
    ctx.fillStyle = g;
    ctx.fillRect(0,0,width,height);
  }

  background(world, route, menu=false) {
    const ctx = this.ctx;
    const w = world.width;
    const h = world.height;
    ctx.save();
    ctx.globalAlpha = .14;
    ctx.strokeStyle = route?.color || "#5fd7ff";
    ctx.lineWidth = 1;

    const offset = -(world.distance * .18) % 80;
    for (let x=offset;x<w+80;x+=80) {
      ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke();
    }
    for (let y=0;y<h;y+=80) {
      ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke();
    }

    ctx.globalAlpha = menu ? .2 : .32;
    for (let i=0;i<18;i++) {
      const x = ((i*137 - world.distance*.08) % (w+160)) - 80;
      const bh = 60 + (i*53)%220;
      ctx.fillStyle = i%2 ? "#101b2a" : "#0d1724";
      ctx.fillRect(x, world.groundY-bh, 70, bh);
      ctx.fillStyle = route?.color || "#5fd7ff";
      for (let wy=world.groundY-bh+16; wy<world.groundY-12; wy+=22) {
        if ((i+wy)%3===0) ctx.fillRect(x+14,wy,5,3);
      }
    }

    ctx.globalAlpha = .5;
    for (let i=0;i<24;i++) {
      const x = ((i*173 - world.distance*.12) % (w+120)) - 60;
      const y = 45 + ((i*97) % Math.max(120,h-170));
      const pulse = 1 + Math.sin(world.time*2 + i) * .6;
      ctx.fillStyle = route?.color || "#5fd7ff";
      ctx.beginPath();
      ctx.arc(x,y,1.4*pulse,0,Math.PI*2);
      ctx.fill();
    }
    ctx.restore();
  }

  ground(world, route) {
    const ctx = this.ctx;
    ctx.fillStyle = "#071019";
    ctx.fillRect(0,world.groundY,world.width,world.height-world.groundY);
    ctx.strokeStyle = route.color;
    ctx.globalAlpha = .75;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0,world.groundY);
    ctx.lineTo(world.width,world.groundY);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  player(player, route, effect={}) {
    const ctx = this.ctx;
    if (player.invulnerable > 0 && Math.floor(player.invulnerable*12)%2===0) return;
    ctx.save();
    ctx.translate(player.x+player.width/2,player.y+player.height/2);
    ctx.rotate(player.rotation);
    ctx.shadowColor = route.color;
    ctx.shadowBlur = 24;
    ctx.fillStyle = "#f4fbff";
    ctx.beginPath();
    ctx.roundRect(-23,-17,46,34,8);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = route.color;
    ctx.fillRect(-17,-10,34,4);
    ctx.fillStyle = "#06101a";
    ctx.beginPath();
    ctx.moveTo(-17,-10); ctx.lineTo(0,4); ctx.lineTo(17,-10);
    ctx.strokeStyle = route.color; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = route.color;
    ctx.beginPath();
    ctx.arc(18,-13,4,0,Math.PI*2);
    ctx.fill();
    if (effect.shield > 0) {
      ctx.shadowColor = "#62f7b7";
      ctx.shadowBlur = 16;
      ctx.strokeStyle = "#62f7b7";
      ctx.globalAlpha = .72 + Math.sin(performance.now()*.008)*.16;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0,0,37,0,Math.PI*2);
      ctx.stroke();
    }
    if (effect.boost > 0) {
      ctx.globalAlpha = .75;
      ctx.strokeStyle = "#8ae8ff";
      ctx.lineWidth = 3;
      for (let i=0;i<3;i++) {
        ctx.beginPath();
        ctx.moveTo(-28-i*8,-9+i*8);
        ctx.lineTo(-46-i*14,-9+i*8);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  obstacles(manager) {
    const ctx = this.ctx;
    for (const o of manager.items) {
      ctx.save();
      if (o.hit) ctx.globalAlpha = .18;
      ctx.shadowColor = "#ff5f7a";
      ctx.shadowBlur = 16;
      ctx.fillStyle = "#32111a";
      ctx.strokeStyle = "#ff5f7a";
      ctx.lineWidth = 2;
      if (o.kind === "gap") {
        ctx.globalAlpha = o.hit ? .1 : .6;
        ctx.setLineDash([8,7]);
        ctx.strokeRect(o.x,o.y,o.width,o.height);
        ctx.setLineDash([]);
        ctx.fillStyle = "rgba(255,95,122,.12)";
        ctx.fillRect(o.x,o.y,o.width,o.height);
      } else {
        ctx.beginPath();
        ctx.roundRect(o.x,o.y,o.width,o.height,8);
        ctx.fill(); ctx.stroke();
      }
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#fff";
      ctx.font = "22px system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      if (o.icon) ctx.fillText(o.icon,o.x+o.width/2,o.y+o.height/2);
      ctx.restore();
    }
  }

  finalThreat(threat,world) {
    const ctx = this.ctx;
    const x = world.width * .82;
    const y = Math.max(150,world.groundY * .43);
    const pulse = 1 + Math.sin(threat.pulse) * .08;
    ctx.save();
    ctx.translate(x,y);
    ctx.scale(pulse,pulse);
    ctx.shadowColor = "#ff4fd8";
    ctx.shadowBlur = 36;
    ctx.fillStyle = "rgba(255,79,216,.16)";
    ctx.strokeStyle = "#ff4fd8";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0,0,52,0,Math.PI*2);
    ctx.fill();
    ctx.stroke();
    ctx.rotate(-threat.pulse*.18);
    for (let i=0;i<6;i++) {
      ctx.rotate(Math.PI/3);
      ctx.beginPath();
      ctx.moveTo(62,0);
      ctx.lineTo(88,0);
      ctx.stroke();
    }
    ctx.rotate(threat.pulse*.18);
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#fff";
    ctx.font = "700 13px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("JAMMER",0,1);
    ctx.restore();
  }

  items(manager) {
    const ctx = this.ctx;
    for (const item of manager.items) {
      const config = {
        key:{color:"#ffd36a",glyph:"🔑"},
        shield:{color:"#62f7b7",glyph:"🛡"},
        boost:{color:"#5fd7ff",glyph:"⚡"},
        node:{color:"#8dff75",glyph:"◎"}
      }[item.type];
      const color = config.color;
      ctx.save();
      ctx.translate(item.x+15,item.y+15+Math.sin(item.phase)*7);
      ctx.rotate(item.spin);
      ctx.shadowColor = color;
      ctx.shadowBlur = 18;
      ctx.fillStyle = color;
      ctx.globalAlpha = .16;
      ctx.beginPath();
      ctx.arc(0,0,19,0,Math.PI*2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.rotate(-item.spin);
      ctx.fillStyle = color;
      ctx.font = "20px system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(config.glyph,0,1);
      ctx.restore();
    }
  }

  particles(system) {
    const ctx = this.ctx;
    for (const p of system.particles) {
      ctx.globalAlpha = Math.max(0,p.life/p.maxLife);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x,p.y,p.size,p.size);
    }
    ctx.globalAlpha = 1;
  }
}
