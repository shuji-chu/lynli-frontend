export const ROUTES = [
  { group: "概览", items: [{ key: "dashboard", label: "数据看板", icon: '<path d="M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6v-9h-6v9Zm0-16v5h6V4h-6Z"/>' }] },
  { group: "交易中心", items: [
    { key: "order-group", label: "订单管理", icon: '<path d="M6 4h12l1 16H5L6 4Z"/>', children: [
      { key: "orders-all", label: "全部订单" }, { key: "orders-refund", label: "退款售后" }
    ]}
  ]},
  { group: "商品中心", items: [
    { key: "product-group", label: "商品管理", icon: '<path d="M4 8l8-4 8 4v8l-8 4-8-4V8Z"/>', children: [
      { key: "products-list", label: "商品列表" }, { key: "products-category", label: "类目管理" }
    ]},
    // 扩展 AI 选品模块
    { key: "spider-group", label: "AI 智能选品", icon: '<circle cx="12" cy="12" r="3"/><path d="M12 4v5M12 15v5M4 12h5M15 12h5"/>', children: [
      { key: "spider", label: "多平台抓取", sub: "全网比价与选品" },
      { key: "spider-tasks", label: "抓取任务中心", sub: "任务队列与历史" },
      { key: "spider-rules", label: "选品过滤规则", sub: "利润率与词库配置" }
    ]}
  ]},
  { group: "财务与系统", items: [
    { key: "finance", label: "财务对账", icon: '<path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/>' },
    { key: "users", label: "账号与权限", icon: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c1.2-3.4 3.9-5 7-5s5.8 1.6 7 5"/>' },
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
