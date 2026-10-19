class EventBus {
  constructor() { this.events = {}; }
  on(event, cb) { (this.events[event] = this.events[event] || []).push(cb); }
  emit(event, data) { if (this.events[event]) this.events[event].forEach(cb => cb(data)); }
}
export const bus = new EventBus();
