export const ROUTES = [
  { group: "概览", items: [{ key: "dashboard", label: "数据看板", icon: '<path d="M4 13h6V4H4v9Z"/>' }] },
  { group: "交易中心", items: [
    { key: "order-group", label: "订单管理", icon: '<path d="M6 4h12l1 16H5L6 4Z"/>', children: [
      { key: "orders-all", label: "全部订单" }, 
      { key: "orders-refund", label: "退款售后" },
      { key: "logistics", label: "物流轨迹与地图", sub: "实时查件" } // 新增物流
    ]},
    { key: "cs-group", label: "客服中心", icon: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>', children: [
      { key: "cs-chat", label: "在线会话工作台" }, { key: "cs-tickets", label: "售后工单处理" }
    ]}
  ]},
  { group: "商品中心", items: [
    { key: "product-group", label: "商品管理", icon: '<path d="M4 8l8-4 8 4v8l-8 4-8-4V8Z"/>', children: [
      { key: "products-list", label: "在售商品" }, { key: "products-category", label: "类目管理" }
    ]},
    { key: "spider", label: "多平台抓取", icon: '<circle cx="12" cy="12" r="3"/>' }
  ]},
  { group: "财务与系统", items: [
    { key: "finance", label: "财务对账", icon: '<path d="M4 19V9"/>' },
    { key: "users", label: "账号与权限", icon: '<circle cx="12" cy="8" r="3.5"/>' },
    { key: "settings", label: "系统设置", icon: '<circle cx="12" cy="12" r="3"/>' }
  ]}
];

export function findRouteMeta(key) {
  for (const group of ROUTES) {
    for (const item of group.items) {
      if (item.key === key) return item;
      if (item.children) {
        const child = item.children.find(c => c.key === key);
        if (child) return child;
      }
    }
  }
  return null;
}
