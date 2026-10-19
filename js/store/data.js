import { bus } from "./eventBus.js";
const KEY = "lynli_db_v2";
const init = {
  orders: [{ id: "ORD-001", buyer: "张三", pid: "P1", count: 2, amount: 140, status: "unpaid" }],
  purchases: [],
  products: [{ id: "P1", title: "投影灯", cost: 18, price: 70, stock: 100 }],
  finance: { revenue: 0, cost: 0 }
};
export const store = {
  get: () => JSON.parse(localStorage.getItem(KEY) || JSON.stringify(init)),
  set: (d) => { localStorage.setItem(KEY, JSON.stringify(d)); bus.emit("dataChanged", d); },
  pay: (oid) => {
    const d = store.get(); const o = d.orders.find(x => x.id === oid); const p = d.products.find(x => x.id === o.pid);
    if(p.stock < o.count) return false;
    p.stock -= o.count; o.status = "pending"; d.finance.revenue += o.amount; d.finance.cost += p.cost * o.count;
    d.purchases.push({ id: "PO-" + Date.now(), oid: o.id, title: p.title, count: o.count, cost: p.cost * o.count, status: "pending" });
    store.set(d); return true;
  },
  ship: (poid, track) => {
    const d = store.get(); const po = d.purchases.find(x => x.id === poid);
    po.status = "shipped"; po.track = track;
    const o = d.orders.find(x => x.id === po.oid); if(o) o.status = "shipped";
    store.set(d);
  }
};
