// 这是一个真实的前端本地数据库，通过 localStorage 持久化
const DB_KEY = "lynli_mock_db";

// 初始模拟数据
const initData = {
  orders: [
    { id: "ORD-1001", buyer: "张三", amount: 299, status: "pending", createTime: "2023-10-19" },
    { id: "ORD-1002", buyer: "李四", amount: 129, status: "pending", createTime: "2023-10-19" }
  ],
  purchases: [
    { id: "PO-1001", orderId: "ORD-1001", item: "宇航员投影灯", cost: 50, status: "pending" },
    { id: "PO-1002", orderId: "ORD-1002", item: "极简马克杯", cost: 20, status: "pending" }
  ]
};

export const db = {
  // 获取数据
  get: () => {
    let data = localStorage.getItem(DB_KEY);
    if (!data) {
      localStorage.setItem(DB_KEY, JSON.stringify(initData));
      return initData;
    }
    return JSON.parse(data);
  },

  // 保存数据（覆盖）
  save: (data) => {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
  },

  // 核心操作：发货（联动订单和采购单）
  shipOrder: (purchaseId, trackingNum) => {
    const data = db.get();
    const po = data.purchases.find(p => p.id === purchaseId);
    if (po) {
      po.status = "shipped";
      po.trackingNum = trackingNum;
      
      // 联动更新对应的订单状态
      const order = data.orders.find(o => o.id === po.orderId);
      if (order) order.status = "shipped";
      
      db.save(data);
      return true;
    }
    return false;
  }
};
