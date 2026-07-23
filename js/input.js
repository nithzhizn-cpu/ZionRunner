export class Input {
  constructor({ canvas, leftButton, rightButton, jumpButton }) {
    this.left = false;
    this.right = false;
    this.jumpQueued = false;
    this.touchStartY = null;
    this.handlers = [];
    this.bindKeyboard();
    this.bindButton(leftButton, "left");
    this.bindButton(rightButton, "right");
    this.bindJump(jumpButton);
    this.bindCanvas(canvas);
  }

  bindKeyboard() {
    const down = e => {
      if (["ArrowLeft","KeyA"].includes(e.code)) this.left = true;
      if (["ArrowRight","KeyD"].includes(e.code)) this.right = true;
      if (["ArrowUp","Space","KeyW"].includes(e.code)) {
        e.preventDefault();
        this.jumpQueued = true;
      }
    };
    const up = e => {
      if (["ArrowLeft","KeyA"].includes(e.code)) this.left = false;
      if (["ArrowRight","KeyD"].includes(e.code)) this.right = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    this.handlers.push([window,"keydown",down],[window,"keyup",up]);
  }

  bindButton(button, key) {
    if (!button) return;
    const on = e => {
      e.preventDefault();
      button.setPointerCapture?.(e.pointerId);
      this[key] = true;
      button.classList.add("active");
    };
    const off = e => { e.preventDefault(); this[key] = false; button.classList.remove("active"); };
    button.addEventListener("pointerdown", on);
    ["pointerup","pointercancel","lostpointercapture"].forEach(type => button.addEventListener(type,off));
  }

  bindJump(button) {
    if (!button) return;
    const jump = e => { e.preventDefault(); this.jumpQueued = true; };
    button.addEventListener("pointerdown", jump);
  }

  bindCanvas(canvas) {
    canvas.addEventListener("pointerdown", e => {
      if (e.pointerType !== "mouse") this.touchStartY = e.clientY;
    });
    canvas.addEventListener("pointerup", e => {
      if (e.pointerType !== "mouse" && this.touchStartY !== null) this.jumpQueued = true;
      this.touchStartY = null;
    });
  }

  consumeJump() {
    const value = this.jumpQueued;
    this.jumpQueued = false;
    return value;
  }

  reset() {
    this.left = false;
    this.right = false;
    this.jumpQueued = false;
  }

  destroy() {
    for (const [target,type,handler] of this.handlers) target.removeEventListener(type,handler);
  }
}
