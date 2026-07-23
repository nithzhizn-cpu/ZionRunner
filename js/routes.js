export const ROUTES = [
  {
    id:"internet", name:"Internet", icon:"🌐", color:"#5fd7ff", latency:"38 ms",
    goal:1450, speed:250, message:"Fast global route active.",
    eventTitle:"Internet lost", eventText:"The public network collapsed. UPL found a nearby Bluetooth relay."
  },
  {
    id:"bluetooth", name:"Bluetooth", icon:"🔵", color:"#7c9cff", latency:"52 ms",
    goal:1580, speed:265, message:"Nearby device relay established.",
    eventTitle:"Bluetooth range weak", eventText:"The peer is leaving range. UPL is upgrading the packet to Wi‑Fi Direct."
  },
  {
    id:"wifi", name:"Wi‑Fi Direct", icon:"📶", color:"#62f7b7", latency:"24 ms",
    goal:1710, speed:280, message:"High-speed local path active.",
    eventTitle:"Local link blocked", eventText:"Direct delivery failed. UPL built a trusted multi-hop Mesh route."
  },
  {
    id:"mesh", name:"Mesh", icon:"🟢", color:"#8dff75", latency:"71 ms",
    goal:1840, speed:292, message:"Message hopping between trusted nodes.",
    eventTitle:"Mesh congested", eventText:"Relay capacity is exhausted. UPL detected an available LAN gateway."
  },
  {
    id:"lan", name:"LAN", icon:"🖥", color:"#ffd36a", latency:"12 ms",
    goal:1970, speed:304, message:"Local infrastructure route active.",
    eventTitle:"Full network blackout", eventText:"Every terrestrial route is down. UPL is activating the Satellite path."
  },
  {
    id:"satellite", name:"Satellite", icon:"🛰", color:"#c98cff", latency:"620 ms",
    goal:2150, speed:316, message:"Blackout survival route established.",
    eventTitle:"Recipient reached", eventText:"The encrypted packet arrived and its integrity was verified."
  }
];

export class RouteManager {
  constructor() {
    this.reset();
  }

  reset() {
    this.index = 0;
    this.routeStart = 0;
    this.bonusProgress = 0;
    this.completed = 0;
    this.pending = false;
  }

  get current() {
    return ROUTES[this.index];
  }

  get total() {
    return ROUTES.length;
  }

  progress(distance) {
    return Math.min(1, Math.max(0, (distance - this.routeStart + this.bonusProgress) / this.current.goal));
  }

  addProgress(amount) {
    this.bonusProgress += Math.max(0, amount);
  }

  update(distance) {
    if (this.pending || this.progress(distance) < 1) return null;
    this.pending = true;
    const isFinal = this.index === ROUTES.length - 1;
    return {
      completed: this.current,
      next: isFinal ? null : ROUTES[this.index + 1],
      isFinal
    };
  }

  advance(distance) {
    if (!this.pending || this.index >= ROUTES.length - 1) return this.current;
    this.completed = Math.max(this.completed, this.index + 1);
    this.index = (this.index + 1) % ROUTES.length;
    this.routeStart = distance;
    this.bonusProgress = 0;
    this.pending = false;
    return this.current;
  }
}
