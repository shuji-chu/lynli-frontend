export const routes = {
  dashboard: { title: "数据大盘", render: null },
  orders: { title: "交易中心", render: null },
  aftersales: { title: "售后工单", render: null },
  products: { title: "商品中心", render: null },
  spider: { title: "AI选品采集", render: null },
  purchases: { title: "采购与代发", render: null },
  suppliers: { title: "供应商管理", render: null },
  marketing: { title: "营销中心", render: null },
  crm: { title: "客户管理", render: null },
  finance: { title: "财务对账", render: null },
  system: { title: "系统与权限", render: null }
};

export const navGroups = [
  { group: "概览", items: ["dashboard"] },
  { group: "交易与售后", items: ["orders", "aftersales"] },
  { group: "商品与供应链", items: ["products", "spider", "purchases", "suppliers"] },
  { group: "运营与客户", items: ["marketing", "crm"] },
  { group: "财务与系统", items: ["finance", "system"] }
];
