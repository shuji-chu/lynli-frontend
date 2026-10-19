export const routes = {
  dashboard: { title: "数据大盘", render: null },
  orders: { title: "交易中心", render: null },
  aftersales: { title: "售后工单", render: null },
  products: { title: "商品中心", render: null },
  spider: { title: "AI选品采集", render: null },
  proxy: { title: "爬虫与代理池", render: null },
  purchases: { title: "采购与代发", render: null },
  suppliers: { title: "供应商管理", render: null },
  marketing: { title: "营销中心", render: null },
  crm: { title: "客户与会员", render: null },
  finance: { title: "财务与提现", render: null },
  logistics: { title: "运费与仓储", render: null },
  organization: { title: "组织架构", render: null },
  roles: { title: "角色与权限", render: null },
  system: { title: "系统设置", render: null }
};

export const navGroups = [
  { group: "概览", items: ["dashboard"] },
  { group: "交易与售后", items: ["orders", "aftersales"] },
  { group: "商品与供应链", items: ["products", "spider", "proxy", "purchases", "suppliers"] },
  { group: "运营与客户", items: ["marketing", "crm"] },
  { group: "财务与仓储", items: ["finance", "logistics"] },
  { group: "组织与系统", items: ["organization", "roles", "system"] }
];
