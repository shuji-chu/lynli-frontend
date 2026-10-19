export const ROUTES = [
  { key: "dashboard", label: "数据看板", sub: "经营概览", roles: ["super_admin", "operator", "support"], icon: '<path d="M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6v-9h-6v9Zm0-16v5h6V4h-6Z"/>' },
  { key: "orders", label: "订单管理", sub: "收件与物流", roles: ["super_admin", "operator", "support"], icon: '<path d="M6 4h12l1 16H5L6 4Z"/><path d="M9 8h6"/>' },
  { key: "products", label: "商品库", sub: "已上架商品", roles: ["super_admin", "operator"], icon: '<path d="M4 8l8-4 8 4v8l-8 4-8-4V8Z"/><path d="M4 8l8 4 8-4M12 12v8"/>' },
  { key: "spider", label: "AI 选品", sub: "抓取与上架", roles: ["super_admin", "operator"], icon: '<circle cx="12" cy="12" r="3"/><path d="M12 4v5M12 15v5M4 12h5M15 12h5M6.5 6.5l3.5 3.5M14 14l3.5 3.5M17.5 6.5L14 10M10 14l-3.5 3.5"/>' },
  { key: "finance", label: "财务对账", sub: "成本与利润", roles: ["super_admin"], icon: '<path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/>' },
  { key: "marketing", label: "营销活动", sub: "优惠与投放", roles: ["super_admin", "operator"], icon: '<path d="M4 10v4l10 5V5L4 10Z"/><path d="M14 8a3 3 0 0 1 0 8"/>' },
  { key: "users", label: "账号与权限", sub: "员工与角色", roles: ["super_admin"], icon: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c1.2-3.4 3.9-5 7-5s5.8 1.6 7 5"/>' },
  { key: "settings", label: "系统设置", sub: "个人资料", roles: ["super_admin", "operator", "support"], icon: '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>' },
];
