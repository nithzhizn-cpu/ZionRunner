export class AudioManager {
  constructor() {
    this.enabled = true;
    this.ctx = null;
    this.master = null;
    this.musicTimer = null;
    this.paused = false;
  }

  setEnabled(value) {
    this.enabled = Boolean(value);
    if (!this.enabled) this.stopMusic();
  }

  async unlock() {
    if (!this.enabled) return;
    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.gain.value = .12;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") await this.ctx.resume();
  }

  tone(freq=440,duration=.08,type="sine",volume=.6) {
    if (!this.enabled || !this.ctx || this.paused) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(volume, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(.001, this.ctx.currentTime+duration);
    o.connect(g); g.connect(this.master);
    o.start(); o.stop(this.ctx.currentTime+duration);
  }

  play(name) {
    const map = {
      jump:[520,.07,"square"],
      collect:[880,.09,"sine"],
      shield:[660,.16,"triangle"],
      boost:[980,.14,"triangle"],
      node:[760,.12,"square"],
      hit:[120,.18,"sawtooth"],
      route:[740,.22,"triangle"],
      threat:[72,.5,"sawtooth"],
      achievement:[1240,.3,"sine"],
      win:[1040,.5,"sine"],
      fail:[90,.42,"sawtooth"]
    };
    if (map[name]) this.tone(...map[name]);
  }

  startMusic() {
    if (!this.enabled || this.musicTimer) return;
    const notes = [110,165,220,165];
    let i = 0;
    this.musicTimer = setInterval(() => {
      this.tone(notes[i++%notes.length], .22, "sine", .12);
    }, 420);
  }

  stopMusic() {
    clearInterval(this.musicTimer);
    this.musicTimer = null;
  }

  setPaused(value) { this.paused = Boolean(value); }
  destroy() { this.stopMusic(); this.ctx?.close(); }
}
