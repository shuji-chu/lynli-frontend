export const routes = {
  dashboard: { title: "数据大盘", render: null },
  chat: { title: "客服工作台", render: null },
  orders: { title: "交易中心", render: null },
  aftersales: { title: "售后工单", render: null },
  account: { title: "账号售卖商城", render: null },
  products: { title: "电商商品库", render: null },
  proxy: { title: "节点与代理", render: null },
  users: { title: "客户与会员", render: null },
  finance: { title: "财务与提现", render: null },
  docs: { title: "开发者文档", render: null },
  system: { title: "系统设置", render: null }
};

export const navGroups = [
  { group: "工作台", items: ["dashboard", "chat"] },
  { group: "核心业务", items: ["orders", "account", "products", "proxy"] },
  { group: "客户与财务", items: ["users", "aftersales", "finance"] },
  { group: "开发与系统", items: ["docs", "system"] }
];
