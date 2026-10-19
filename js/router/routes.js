export const ROUTES = [
  { group: "概览", items: [{ key: "dashboard", label: "数据看板", icon: '<path d="M4 13h6V4H4v9Z"/>' }] },
  { group: "交易中心", items: [{ key: "order-group", label: "订单管理", icon: '<path d="M6 4h12l1 16H5L6 4Z"/>', children: [{ key: "orders-all", label: "全部订单" }, { key: "orders-refund", label: "退款售后" }] }] },
  { group: "商品中心", items: [{ key: "product-group", label: "商品管理", icon: '<path d="M4 8l8-4 8 4v8l-8 4-8-4V8Z"/>', children: [{ key: "products-list", label: "在售商品" }, { key: "products-category", label: "类目管理" }] }, { key: "spider", label: "多平台抓取", icon: '<circle cx="12" cy="12" r="3"/>' }] },
  { group: "财务与系统", items: [{ key: "finance", label: "财务对账", icon: '<path d="M4 19V9"/>' }, { key: "users", label: "账号与权限", icon: '<circle cx="12" cy="8" r="3.5"/>' }, { key: "settings", label: "系统设置", icon: '<circle cx="12" cy="12" r="3"/>' }] }
];
export function findRouteMeta(key) { for (const g of ROUTES) { for (const i of g.items) { if (i.key === key) return i; if (i.children) { const c = i.children.find(x => x.key === key); if (c) return c; } } } return null; }
