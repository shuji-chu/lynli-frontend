export const routes = {
  dashboard: { title: "数据看板", render: null },
  orders: { title: "全部订单", render: null },
  purchases: { title: "采购与代发", render: null },
  products: { title: "商品库", render: null },
  spider: { title: "AI选品", render: null },
  finance: { title: "财务对账", render: null }
};

export const navGroups = [
  { group: "概览", items: ["dashboard"] },
  { group: "交易中心", items: ["orders", "purchases"] },
  { group: "商品中心", items: ["products", "spider"] },
  { group: "财务与系统", items: ["finance"] }
];
