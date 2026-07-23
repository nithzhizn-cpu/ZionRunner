export class FinalThreat {
  constructor() {
    this.reset();
  }

  reset() {
    this.active = false;
    this.integrity = 100;
    this.elapsed = 0;
    this.duration = 24;
    this.pulse = 0;
  }

  start() {
    this.active = true;
    this.integrity = 100;
    this.elapsed = 0;
    this.pulse = 0;
  }

  update(dt) {
    if (!this.active) return false;
    this.elapsed += dt;
    this.pulse += dt * 4.5;
    this.integrity = Math.max(0, 100 * (1 - this.elapsed / this.duration));
    if (this.integrity <= 0) {
      this.active = false;
      return true;
    }
    return false;
  }

  get progress() {
    return Math.max(0, Math.min(1, 1 - this.integrity / 100));
  }
}
