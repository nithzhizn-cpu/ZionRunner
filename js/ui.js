export class UI {
  constructor() {
    this.events = new Map();
    this.menu = document.getElementById("menu-screen");
    this.hud = document.getElementById("game-hud");
    this.assistant = document.getElementById("upl-assistant");
    this.mobile = document.getElementById("mobile-controls");
    this.pauseScreen = document.getElementById("pause-screen");
    this.missionScreen = document.getElementById("mission-screen");
    this.resultScreen = document.getElementById("result-screen");
    this.pauseButton = document.getElementById("pause-button");
    this.progressWrap = document.getElementById("route-progress-wrap");
    this.progress = document.getElementById("route-progress");
    this.effectChip = document.getElementById("effect-chip");
    this.threatHud = document.getElementById("threat-hud");
    this.threatBar = document.getElementById("threat-bar");
    this.toast = document.getElementById("status-toast");
    this.score = document.getElementById("score-value");
    this.shields = document.getElementById("shield-value");
    this.keys = document.getElementById("key-value");
    this.combo = document.getElementById("combo-value");
    this.route = document.getElementById("current-route-name");
    this.latency = document.getElementById("route-latency");
    this.assistantMessage = document.getElementById("upl-assistant-message");
    this.missionTitle = document.getElementById("mission-title");
    this.missionText = document.getElementById("mission-text");
    this.resultTitle = document.getElementById("result-title");
    this.resultMessage = document.getElementById("result-message");
    this.finalScore = document.getElementById("final-score");
    this.finalRoutes = document.getElementById("final-routes");
    this.finalKeys = document.getElementById("final-keys");
    this.bestScore = document.getElementById("best-score");
    this.finalHits = document.getElementById("final-hits");
    this.creditBalance = document.getElementById("credit-balance");
    this.unlockMessage = document.getElementById("unlock-message");
    this.profileCredits = document.getElementById("profile-credits");
    this.profileDeliveries = document.getElementById("profile-deliveries");
    this.profileBest = document.getElementById("profile-best");
    this.upgradeList = document.getElementById("upgrade-list");
    this.achievementList = document.getElementById("achievement-list");
    this.soundButton = document.getElementById("sound-toggle-button");

    this.bind("start-game-button","startGame");
    this.bind("sound-toggle-button","toggleSound");
    this.bind("pause-button","pauseGame");
    this.bind("resume-button","resumeGame");
    this.bind("restart-from-pause-button","restartGame");
    this.bind("continue-mission-button","continueMission");
    this.bind("play-again-button","playAgain");
    this.bind("back-to-menu-button","returnMenu");
    document.querySelectorAll("[data-upgrade]").forEach(button => {
      button.addEventListener("click", () => this.emit("purchaseUpgrade",button.dataset.upgrade));
    });
  }

  bind(id,event) {
    document.getElementById(id)?.addEventListener("click", () => this.emit(event));
  }

  on(event, handler) {
    if (!this.events.has(event)) this.events.set(event, []);
    this.events.get(event).push(handler);
  }

  emit(event, data) {
    for (const handler of this.events.get(event) || []) handler(data);
  }

  showMenu() {
    this.menu.classList.remove("hidden");
    this.pauseScreen.classList.add("hidden");
    this.missionScreen.classList.add("hidden");
    this.resultScreen.classList.add("hidden");
    this.hud.classList.add("hidden");
    this.assistant.classList.add("hidden");
    this.mobile.classList.add("hidden");
    this.pauseButton.classList.add("hidden");
    this.progressWrap.classList.add("hidden");
    this.effectChip.classList.add("hidden");
    this.threatHud.classList.add("hidden");
  }

  showGame() {
    this.menu.classList.add("hidden");
    this.pauseScreen.classList.add("hidden");
    this.missionScreen.classList.add("hidden");
    this.resultScreen.classList.add("hidden");
    this.hud.classList.remove("hidden");
    this.assistant.classList.remove("hidden");
    this.mobile.classList.remove("hidden");
    this.pauseButton.classList.remove("hidden");
    this.progressWrap.classList.remove("hidden");
    this.threatHud.classList.add("hidden");
  }

  showPause() { this.pauseScreen.classList.remove("hidden"); }
  hidePause() { this.pauseScreen.classList.add("hidden"); }

  showMission(event) {
    this.missionTitle.textContent = event.completed.eventTitle;
    this.missionText.textContent = event.completed.eventText;
    this.missionScreen.classList.remove("hidden");
  }

  hideMission() {
    this.missionScreen.classList.add("hidden");
  }

  showFinalThreat() {
    this.threatHud.classList.remove("hidden");
    this.assistantMessage.textContent = "Quantum jammer active. Keep the encrypted packet alive.";
  }

  showResult(summary) {
    this.resultTitle.textContent = summary.delivered ? "Message delivered" : "Delivery interrupted";
    this.resultMessage.textContent = summary.delivered
      ? "UPL found a secure path through every network disruption."
      : "All available shields were lost before the packet reached its recipient.";
    this.finalScore.textContent = Math.floor(summary.score).toLocaleString();
    this.finalRoutes.textContent = `${summary.routes}/${summary.totalRoutes}`;
    this.finalKeys.textContent = summary.keys.toLocaleString();
    this.bestScore.textContent = Math.floor(summary.best).toLocaleString();
    this.finalHits.textContent = summary.hits.toLocaleString();
    this.creditBalance.textContent = summary.credits.toLocaleString();
    if (summary.achievements?.length) {
      this.unlockMessage.textContent = `Achievement unlocked: ${summary.achievements.map(item => `${item.icon} ${item.name}`).join(", ")}`;
      this.unlockMessage.classList.remove("hidden");
    } else {
      this.unlockMessage.classList.add("hidden");
    }
    this.resultScreen.classList.remove("hidden");
    this.hud.classList.add("hidden");
    this.assistant.classList.add("hidden");
    this.mobile.classList.add("hidden");
    this.pauseButton.classList.add("hidden");
    this.progressWrap.classList.add("hidden");
    this.effectChip.classList.add("hidden");
    this.threatHud.classList.add("hidden");
  }

  update({score,shields,keys,combo,route,progress,effect,threat}) {
    this.score.textContent = Math.floor(score).toLocaleString();
    this.shields.textContent = shields;
    this.keys.textContent = keys;
    this.combo.textContent = `×${combo.toFixed(1)}`;
    this.route.textContent = `${route.icon} ${route.name}`;
    this.latency.textContent = `${route.latency} · Stable`;
    this.progress.style.width = `${Math.round(progress * 100)}%`;
    if (effect?.seconds > 0) {
      this.effectChip.textContent = `${effect.label} · ${effect.seconds.toFixed(1)}s`;
      this.effectChip.classList.remove("hidden");
    } else {
      this.effectChip.classList.add("hidden");
    }
    if (threat) {
      this.threatBar.style.width = `${Math.round(threat.integrity)}%`;
      this.threatHud.classList.remove("hidden");
    }
  }

  routeChanged(route) {
    this.assistantMessage.textContent = route.message;
    this.showToast(`UPL switched to ${route.name}`);
  }

  showToast(text) {
    this.toast.textContent = text;
    this.toast.classList.add("show");
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.classList.remove("show"), 1600);
  }

  setSoundEnabled(enabled) {
    this.soundButton.textContent = `Sound: ${enabled ? "On" : "Off"}`;
  }

  renderProfile(profile) {
    this.profileCredits.textContent = profile.credits.toLocaleString();
    this.profileDeliveries.textContent = profile.deliveries.toLocaleString();
    this.profileBest.textContent = profile.best.toLocaleString();

    for (const upgrade of profile.upgrades) {
      const card = this.upgradeList.querySelector(`[data-upgrade-card="${upgrade.id}"]`);
      if (!card) continue;
      const button = card.querySelector("[data-upgrade]");
      const level = card.querySelector("[data-upgrade-level]");
      const maxed = upgrade.level >= upgrade.costs.length;
      level.textContent = `Level ${upgrade.level}/${upgrade.costs.length}`;
      button.textContent = maxed ? "Maxed" : `Upgrade · ${upgrade.costs[upgrade.level]} keys`;
      button.disabled = maxed;
    }

    this.achievementList.innerHTML = profile.achievements.map(item =>
      `<span class="${item.unlocked ? "unlocked" : "locked"}" title="${item.name}">${item.unlocked ? item.icon : "◌"} ${item.name}</span>`
    ).join("");
  }
}
