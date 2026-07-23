import { Player } from "./player.js";
import { World } from "./world.js";
import { Renderer } from "./renderer.js";
import { ObstacleManager } from "./obstacles.js";
import { ItemManager } from "./items.js";
import { ParticleSystem } from "./particles.js";
import { RouteManager } from "./routes.js";
import { FinalThreat } from "./final-threat.js";

export class Game {
  constructor({canvas,context,input,ui,audio,storage,progression}) {
    this.canvas = canvas;
    this.ctx = context;
    this.input = input;
    this.ui = ui;
    this.audio = audio;
    this.storage = storage;
    this.progression = progression;

    this.world = new World();
    this.player = new Player();
    this.renderer = new Renderer(context);
    this.obstacles = new ObstacleManager();
    this.items = new ItemManager();
    this.particles = new ParticleSystem();
    this.routes = new RouteManager();
    this.finalThreat = new FinalThreat();

    this.isRunning = false;
    this.isPaused = false;
    this.isAtRouteEvent = false;
    this.score = 0;
    this.shields = 3;
    this.keys = 0;
    this.combo = 1;
    this.secureShield = 0;
    this.hits = 0;
    this.maxCombo = 1;
    this.bonuses = { extraShields:0, magnetRadius:0, scoreMultiplier:1 };
    this.lastTime = 0;
    this.frameId = null;
  }

  initialize() {
    this.resize();
  }

  resize() {
    const width = Number(this.canvas.dataset.width || innerWidth);
    const height = Number(this.canvas.dataset.height || innerHeight);
    this.world.resize(width,height);
    if (!this.isRunning) this.player.reset(Math.min(180,width*.2),this.world.groundY);
  }

  reset() {
    this.world.reset();
    this.player.reset(Math.min(180,this.world.width*.2),this.world.groundY);
    this.obstacles.reset();
    this.items.reset();
    this.particles.reset();
    this.routes.reset();
    this.finalThreat.reset();
    this.input.reset();
    this.bonuses = this.progression.bonuses;
    this.score = 0;
    this.shields = 3 + this.bonuses.extraShields;
    this.startingShields = this.shields;
    this.keys = 0;
    this.combo = 1;
    this.maxCombo = 1;
    this.hits = 0;
    this.secureShield = 0;
    this.isAtRouteEvent = false;
    this.world.setRoute(this.routes.current);
    this.updateUI();
  }

  start() {
    cancelAnimationFrame(this.frameId);
    this.reset();
    this.isRunning = true;
    this.isPaused = false;
    this.audio.setPaused(false);
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  restart() {
    this.audio.stopMusic();
    this.start();
    this.audio.startMusic();
  }

  pause() {
    if (!this.isRunning || this.isPaused) return;
    this.isPaused = true;
    this.audio.setPaused(true);
  }

  resume() {
    if (!this.isRunning || !this.isPaused || this.isAtRouteEvent) return;
    this.isPaused = false;
    this.audio.setPaused(false);
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  continueMission() {
    if (!this.isAtRouteEvent || !this.pendingRouteEvent) return;
    const route = this.routes.advance(this.world.distance);
    this.world.setRoute(route);
    this.pendingRouteEvent = null;
    this.isAtRouteEvent = false;
    this.ui.routeChanged(route);
    this.audio.setPaused(false);
    this.audio.play("route");
    this.particles.burst(this.player.x+20,this.player.y+16,route.color,30);
    this.resume();
  }

  beginFinale() {
    this.finalThreat.start();
    this.obstacles.reset();
    this.audio.play("threat");
    this.ui.showFinalThreat();
    this.ui.showToast("Quantum Jammer intercepted the packet");
    this.particles.burst(
      this.world.width * .82,
      this.world.groundY * .45,
      "#ff4fd8",
      48
    );
  }

  loop = now => {
    if (!this.isRunning || this.isPaused) return;
    const dt = Math.min(.033,(now-this.lastTime)/1000 || .016);
    this.lastTime = now;
    this.update(dt);
    this.render();
    this.frameId = requestAnimationFrame(this.loop);
  };

  update(dt) {
    this.world.update(dt);
    const playerEvent = this.player.update(dt,this.input,this.world);
    if (playerEvent.jumped) this.audio.play("jump");
    this.obstacles.update(dt,this.world);
    this.items.update(dt,this.world);
    this.particles.update(dt);
    this.particles.trail(this.player.x,this.player.y+this.player.height/2,this.routes.current.color);
    this.secureShield = Math.max(0, this.secureShield - dt);

    this.score += dt * (10 + this.world.speed*.032) * this.combo * this.bonuses.scoreMultiplier;

    const obstacle = this.obstacles.collides(this.player.bounds);
    if (obstacle && this.secureShield > 0) {
      this.obstacles.remove(obstacle);
      this.secureShield = 0;
      this.audio.play("shield");
      this.ui.showToast("Secure tunnel absorbed the attack");
      this.particles.burst(this.player.x+20,this.player.y+16,"#62f7b7",28);
    } else if (obstacle && this.player.hit()) {
      this.obstacles.remove(obstacle);
      this.shields--;
      this.combo = 1;
      this.hits++;
      this.audio.play("hit");
      this.ui.showToast("Route interference detected");
      this.particles.burst(this.player.x+20,this.player.y+16,"#ff5f7a",28);
      if (this.shields <= 0) {
        this.finish(false);
        return;
      }
    }

    for (const item of this.items.collect(this.player.bounds,this.bonuses.magnetRadius)) {
      if (item.type === "shield") {
        this.secureShield = 8;
        this.audio.play("shield");
        this.ui.showToast("Secure tunnel active");
        this.particles.burst(item.x,item.y,"#62f7b7",18);
      } else if (item.type === "boost") {
        this.world.activateBoost(2.6);
        this.player.protect(1.35);
        this.score += 75;
        this.audio.play("boost");
        this.ui.showToast("Speed tunnel activated");
        this.particles.burst(item.x,item.y,"#5fd7ff",20);
      } else if (item.type === "node") {
        this.routes.addProgress(165);
        this.score += 150 * this.combo;
        this.audio.play("node");
        this.ui.showToast("Trusted mesh node added");
        this.particles.burst(item.x,item.y,"#8dff75",22);
      } else {
        this.keys++;
        this.score += 100 * this.combo;
        this.combo = Math.min(4, this.combo + .15);
        this.maxCombo = Math.max(this.maxCombo,this.combo);
        this.audio.play("collect");
        this.particles.burst(item.x,item.y,"#ffd36a",14);
      }
    }

    if (this.finalThreat.active) {
      if (this.finalThreat.update(dt)) {
        this.score += 2500 * this.bonuses.scoreMultiplier;
        this.finish(true);
        return;
      }
    } else {
      const routeEvent = this.routes.update(this.world.distance);
      if (routeEvent?.isFinal) {
        this.beginFinale();
      } else if (routeEvent) {
      this.pendingRouteEvent = routeEvent;
      this.isAtRouteEvent = true;
      this.pause();
      this.ui.showMission(routeEvent);
      return;
      }
    }

    this.updateUI();
  }

  updateUI() {
    const shieldEffect = this.secureShield > 0
      ? {label:"Secure tunnel",seconds:this.secureShield}
      : this.world.boostTimer > 0
        ? {label:"Speed tunnel",seconds:this.world.boostTimer}
        : null;
    this.ui.update({
      score:this.score,
      shields:this.shields,
      keys:this.keys,
      combo:this.combo,
      route:this.routes.current,
      progress:this.routes.progress(this.world.distance),
      effect:shieldEffect,
      threat:this.finalThreat.active ? this.finalThreat : null
    });
  }

  render() {
    this.renderer.clear(this.world.width,this.world.height);
    this.renderer.background(this.world,this.routes.current);
    this.renderer.ground(this.world,this.routes.current);
    this.renderer.items(this.items);
    this.renderer.obstacles(this.obstacles);
    if (this.finalThreat.active) this.renderer.finalThreat(this.finalThreat,this.world);
    this.renderer.player(this.player,this.routes.current,{
      shield:this.secureShield,
      boost:this.world.boostTimer
    });
    this.renderer.particles(this.particles);
  }

  renderMenuBackground() {
    this.renderer.clear(this.world.width,this.world.height);
    this.renderer.background(this.world,this.routes.current,true);
    this.renderer.ground(this.world,this.routes.current);
    this.renderer.player(this.player,this.routes.current);
  }

  finish(delivered=false) {
    this.isRunning = false;
    this.isPaused = false;
    this.isAtRouteEvent = false;
    cancelAnimationFrame(this.frameId);
    const best = this.storage.saveScore(Math.floor(this.score));
    const credits = this.storage.addCredits(this.keys);
    this.audio.stopMusic();
    this.audio.setPaused(false);
    this.audio.play(delivered ? "win" : "fail");
    const summary = {
      delivered,
      score:Math.floor(this.score),
      best,
      keys:this.keys,
      credits,
      hits:this.hits,
      maxCombo:this.maxCombo,
      shields:this.shields,
      startingShields:this.startingShields,
      routes:delivered ? this.routes.total : this.routes.index + 1,
      totalRoutes:this.routes.total
    };
    this.storage.saveRun(summary);
    summary.achievements = this.progression.evaluate(summary);
    if (summary.achievements.length) this.audio.play("achievement");
    this.ui.showResult(summary);
  }

  destroy() {
    cancelAnimationFrame(this.frameId);
  }
}
