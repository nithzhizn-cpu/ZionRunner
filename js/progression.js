const UPGRADES = [
  {
    id:"armor",
    name:"Packet Armor",
    description:"+1 starting shield per level",
    icon:"🛡",
    costs:[12,24,40]
  },
  {
    id:"magnet",
    name:"Key Magnet",
    description:"+24 px collection range per level",
    icon:"🧲",
    costs:[10,20,34]
  },
  {
    id:"relay",
    name:"Trusted Relay",
    description:"+10% score per level",
    icon:"◎",
    costs:[14,28,44]
  }
];

const ACHIEVEMENTS = [
  { id:"first-delivery", name:"First Contact", icon:"📨", test:s => s.delivered },
  { id:"untouched", name:"Zero Trust", icon:"🔒", test:s => s.delivered && s.hits === 0 },
  { id:"collector", name:"Key Custodian", icon:"🔑", test:s => s.keys >= 25 },
  { id:"combo", name:"Perfect Relay", icon:"⚡", test:s => s.maxCombo >= 3 },
  { id:"veteran", name:"UPL Veteran", icon:"🌐", test:(s,c) => s.delivered && c.deliveries >= 5 }
];

export class ProgressionManager {
  constructor(storage) {
    this.storage = storage;
  }

  get upgrades() {
    const saved = this.storage.getUpgrades();
    return UPGRADES.map(item => ({
      ...item,
      level:Math.max(0, Math.min(item.costs.length, Number(saved[item.id]) || 0))
    }));
  }

  get bonuses() {
    const levels = Object.fromEntries(this.upgrades.map(item => [item.id,item.level]));
    return {
      extraShields:levels.armor,
      magnetRadius:levels.magnet * 24,
      scoreMultiplier:1 + levels.relay * .1
    };
  }

  purchase(id) {
    const item = this.upgrades.find(upgrade => upgrade.id === id);
    if (!item) return { ok:false, reason:"Unknown upgrade" };
    if (item.level >= item.costs.length) return { ok:false, reason:"Upgrade already maxed" };
    const cost = item.costs[item.level];
    const credits = this.storage.getCredits();
    if (credits < cost) return { ok:false, reason:`Need ${cost - credits} more keys` };
    const levels = this.storage.getUpgrades();
    levels[id] = item.level + 1;
    this.storage.setUpgrades(levels);
    this.storage.setCredits(credits - cost);
    return { ok:true, item:{...item,level:item.level + 1}, credits:credits - cost };
  }

  evaluate(summary) {
    const unlocked = this.storage.getAchievements();
    const context = { deliveries:this.storage.getDeliveries() };
    const newlyUnlocked = [];
    for (const achievement of ACHIEVEMENTS) {
      if (!unlocked[achievement.id] && achievement.test(summary,context)) {
        unlocked[achievement.id] = new Date().toISOString();
        newlyUnlocked.push(achievement);
      }
    }
    this.storage.setAchievements(unlocked);
    return newlyUnlocked;
  }

  snapshot() {
    const unlocked = this.storage.getAchievements();
    return {
      credits:this.storage.getCredits(),
      deliveries:this.storage.getDeliveries(),
      best:this.storage.getBestScore(),
      upgrades:this.upgrades,
      achievements:ACHIEVEMENTS.map(item => ({...item,unlocked:Boolean(unlocked[item.id])}))
    };
  }
}
