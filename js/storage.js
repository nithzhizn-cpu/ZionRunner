export class StorageManager {
  constructor(prefix="zion-runner-3") {
    this.prefix = prefix;
  }

  key(name) { return `${this.prefix}:${name}`; }

  get(name, fallback) {
    try {
      const value = localStorage.getItem(this.key(name));
      return value === null ? fallback : JSON.parse(value);
    } catch {
      return fallback;
    }
  }

  set(name, value) {
    try { localStorage.setItem(this.key(name), JSON.stringify(value)); } catch {}
  }

  getSoundEnabled() { return this.get("sound", true); }
  setSoundEnabled(value) { this.set("sound", Boolean(value)); }
  getBestScore() { return this.get("bestScore", 0); }
  getCredits() { return Math.max(0, Number(this.get("credits", 0)) || 0); }
  setCredits(value) { this.set("credits", Math.max(0, Math.floor(value))); }
  addCredits(value) {
    const credits = this.getCredits() + Math.max(0, Math.floor(value));
    this.setCredits(credits);
    return credits;
  }
  getDeliveries() { return Math.max(0, Number(this.get("deliveries", 0)) || 0); }
  getUpgrades() { return this.get("upgrades", {}); }
  setUpgrades(value) { this.set("upgrades", value); }
  getAchievements() { return this.get("achievements", {}); }
  setAchievements(value) { this.set("achievements", value); }

  saveScore(score) {
    const best = Math.max(score, this.getBestScore());
    this.set("bestScore", best);
    return best;
  }

  saveRun(summary) {
    const history = this.get("runs", []);
    history.unshift({
      ...summary,
      date:new Date().toISOString()
    });
    this.set("runs", history.slice(0, 10));
    if (summary.delivered) {
      this.set("deliveries", this.getDeliveries() + 1);
    }
  }
}
