const DB_KEY = "lynli_real_db_v1";

const initData = {
  products: [
    { id: "P001", name: "极简纯棉短袖T恤", price: 59.9, stock: 120, category: "服饰", status: 1 },
    { id: "P002", name: "日系复古工装裤", price: 129.0, stock: 45, category: "服饰", status: 1 },
    { id: "P003", name: "便携式迷你小风扇", price: 29.9, stock: 0, category: "数码", status: 0 }
  ],
  orders: [
    { id: "ORD-20231024-001", user: "张三", amount: 258.0, status: "待发货", time: "2023-10-24 10:00" },
    { id: "ORD-20231024-002", user: "李四", amount: 129.0, status: "已完成", time: "2023-10-23 15:30" }
  ],
  coupons: [
    { id: "C001", name: "新人专享 9 折券", type: "折扣", amount: 0.9, total: 10000, used: 1200, status: "进行中" }
  ]
};

function getDB() {
  const data = localStorage.getItem(DB_KEY);
  return data ? JSON.parse(data) : initData;
}
function setDB(data) { localStorage.setItem(DB_KEY, JSON.stringify(data)); }

export const store = {
  get(table) { return getDB()[table] || []; },
  add(table, item) { const db = getDB(); db[table].unshift(item); setDB(db); },
  update(table, id, updates) { const db = getDB(); const i = db[table].findIndex(x => x.id === id); if(i > -1){ db[table][i] = {...db[table][i], ...updates}; setDB(db); } },
  remove(table, id) { const db = getDB(); db[table] = db[table].filter(x => x.id !== id); setDB(db); }
};
