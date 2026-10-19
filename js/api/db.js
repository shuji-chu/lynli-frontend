const DB_KEY = "lynli_shop_engine";

const INIT_DATA = {
  products: [
    { id: "P1001", title: "宇航员星空投影灯", cost: 18.5, price: 69.9, stock: 120, status: "on", img: "https://picsum.photos/200/200?random=1" },
    { id: "P1002", title: "极简陶瓷马克杯", cost: 12.0, price: 39.9, stock: 0, status: "on", img: "https://picsum.photos/200/200?random=2" }
  ],
  orders: [
    { id: "ORD-001", buyer: "张三", productId: "P1001", count: 2, amount: 139.8, status: "unpaid", createTime: "2023-10-19 10:00" },
    { id: "ORD-002", buyer: "李四", productId: "P1002", count: 1, amount: 39.9, status: "pending", createTime: "2023-10-19 11:30" }
  ],
  purchases: [],
  finances: { totalRevenue: 0, totalCost: 0 }
};

export const db = {
  init() {
    if (!localStorage.getItem(DB_KEY)) {
      localStorage.setItem(DB_KEY, JSON.stringify(INIT_DATA));
    }
  },
  get() {
    this.init();
    return JSON.parse(localStorage.getItem(DB_KEY));
  },
  save(data) { localStorage.setItem(DB_KEY, JSON.stringify(data)); },
  
  // 业务动作：支付成功 -> 扣库存 -> 生成采购单
  payOrder(orderId) {
    const data = this.get();
    const order = data.orders.find(o => o.id === orderId);
    if (!order) return { success: false, msg: "订单不存在" };
    
    const product = data.products.find(p => p.id === order.productId);
    if (product.stock < order.count) return { success: false, msg: "库存不足" };

    // 扣库存
    product.stock -= order.count;
    // 更新订单状态
    order.status = "pending";
    
    // 自动生成采购单（按成本价）
    data.purchases.push({
      id: "PO-" + Math.floor(Math.random() * 10000),
      orderId: order.id,
      productTitle: product.title,
      count: order.count,
      cost: product.cost * order.count,
      status: "pending"
    });

    data.finances.totalRevenue += order.amount;
    data.finances.totalCost += product.cost * order.count;

    this.save(data);
    return { success: true };
  },

  // 业务动作：采购代发填单 -> 订单变已发货
  shipPurchase(purchaseId, trackingNum) {
    const data = this.get();
    const po = data.purchases.find(p => p.id === purchaseId);
    if (!po) return false;

    po.status = "shipped";
    po.tracking = trackingNum;

    const order = data.orders.find(o => o.id === po.orderId);
    if (order) order.status = "shipped";

    this.save(data);
    return true;
  },

  reset() { localStorage.removeItem(DB_KEY); }
};
