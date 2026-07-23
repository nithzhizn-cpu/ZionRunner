import { Game } from "./game.js";
import { UI } from "./ui.js";
import { Input } from "./input.js";
import { AudioManager } from "./audio.js";
import { StorageManager } from "./storage.js";
import { ProgressionManager } from "./progression.js";

class ZionRunnerApp {
  constructor() {
    this.canvas = document.getElementById("game-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.storage = new StorageManager();
    this.progression = new ProgressionManager(this.storage);
    this.audio = new AudioManager();
    this.ui = new UI();
    this.input = new Input({
      canvas: this.canvas,
      leftButton: document.getElementById("move-left-button"),
      rightButton: document.getElementById("move-right-button"),
      jumpButton: document.getElementById("jump-button")
    });
    this.game = new Game({
      canvas: this.canvas,
      context: this.ctx,
      input: this.input,
      ui: this.ui,
      audio: this.audio,
      storage: this.storage,
      progression: this.progression
    });
  }

  async init() {
    this.bind();
    this.resize();
    this.audio.setEnabled(this.storage.getSoundEnabled());
    this.ui.setSoundEnabled(this.audio.enabled);
    this.ui.renderProfile(this.progression.snapshot());
    this.game.initialize();
    this.ui.showMenu();
    this.game.renderMenuBackground();
    window.zionRunner = this;
  }

  bind() {
    window.addEventListener("resize", () => this.resize());
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && this.game.isRunning && !this.game.isPaused) {
        this.game.pause();
        this.ui.showPause();
      }
    });
    document.addEventListener("keydown", event => {
      if (!["Escape","KeyP"].includes(event.code) || event.repeat) return;
      event.preventDefault();
      if (!this.game.isRunning) return;
      if (this.game.isPaused && !this.game.isAtRouteEvent) {
        this.ui.hidePause();
        this.game.resume();
      } else if (!this.game.isPaused) {
        this.game.pause();
        this.ui.showPause();
      }
    });

    this.ui.on("startGame", async () => {
      await this.audio.unlock();
      this.ui.showGame();
      this.game.start();
      this.audio.startMusic();
    });

    this.ui.on("toggleSound", async () => {
      const enabled = !this.audio.enabled;
      this.audio.setEnabled(enabled);
      this.storage.setSoundEnabled(enabled);
      this.ui.setSoundEnabled(enabled);
      if (enabled) {
        await this.audio.unlock();
        if (this.game.isRunning && !this.game.isPaused) this.audio.startMusic();
      }
    });

    this.ui.on("pauseGame", () => {
      this.game.pause();
      this.ui.showPause();
    });

    this.ui.on("resumeGame", () => {
      this.ui.hidePause();
      this.game.resume();
    });

    this.ui.on("restartGame", () => {
      this.ui.showGame();
      this.game.restart();
    });

    this.ui.on("continueMission", () => {
      this.ui.hideMission();
      this.game.continueMission();
    });

    this.ui.on("playAgain", () => {
      this.ui.showGame();
      this.game.restart();
    });

    this.ui.on("returnMenu", () => {
      this.ui.renderProfile(this.progression.snapshot());
      this.ui.showMenu();
      this.game.renderMenuBackground();
    });

    this.ui.on("purchaseUpgrade", id => {
      const result = this.progression.purchase(id);
      this.ui.showToast(result.ok ? `${result.item.name} upgraded` : result.reason);
      this.ui.renderProfile(this.progression.snapshot());
    });
  }

  resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    this.canvas.width = Math.floor(innerWidth * dpr);
    this.canvas.height = Math.floor(innerHeight * dpr);
    this.canvas.style.width = innerWidth + "px";
    this.canvas.style.height = innerHeight + "px";
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.canvas.dataset.width = String(innerWidth);
    this.canvas.dataset.height = String(innerHeight);
    this.game?.resize();
  }
}

const app = new ZionRunnerApp();
app.init().catch(console.error);
