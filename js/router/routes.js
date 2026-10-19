export const ROUTES = [
  { group: "概览", items: [
    { key: "dashboard", label: "数据看板", icon: '<path d="M4 13h6V4H4v9Z"/>' },
    { key: "data-screen", label: "实时数据大屏", icon: '<rect x="3" y="3" width="18" height="18" rx="2"/>' }
  ]},
  { group: "交易中心", items: [
    { key: "order-group", label: "订单管理", icon: '<path d="M6 4h12l1 16H5L6 4Z"/>', children: [
      { key: "orders-all", label: "全部订单" }, { key: "orders-refund", label: "退款售后" }
    ]},
    { key: "purchase", label: "采购与代发", icon: '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>', children: [
      { key: "purchase-pending", label: "待采购单" }, { key: "purchase-shipped", label: "已代发" }
    ]},
    { key: "logistics", label: "物流轨迹与地图", icon: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>' },
    { key: "cs-group", label: "客服中心", icon: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>', children: [
      { key: "cs-chat", label: "在线工作台" }, { key: "cs-tickets", label: "售后工单" }
    ]}
  ]},
  { group: "商品中心", items: [
    { key: "product-group", label: "商品管理", icon: '<path d="M4 8l8-4 8 4v8l-8 4-8-4V8Z"/>', children: [
      { key: "products-list", label: "在售商品" }, { key: "products-category", label: "类目管理" }
    ]},
    { key: "spider", label: "多平台抓取", icon: '<circle cx="12" cy="12" r="3"/>' },
    { key: "materials", label: "素材图库", icon: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>' }
  ]},
  { group: "营销中心", items: [
    { key: "marketing-coupon", label: "优惠券管理", icon: '<path d="M20 12a2 2 0 0 1-2-2V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4Z"/>' },
    { key: "marketing-seckill", label: "限时秒杀", icon: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>' }
  ]},
  { group: "系统设置", items: [
    { key: "finance", label: "财务对账", icon: '<path d="M4 19V9"/>' },
    { key: "users", label: "成员与权限", icon: '<circle cx="12" cy="8" r="3.5"/>' },
    { key: "settings", label: "系统设置", icon: '<circle cx="12" cy="12" r="3"/>' }
  ]}
];
export function findRouteMeta(key) {
  for (const g of ROUTES) { for (const i of g.items) { if (i.key === key) return i; if (i.children) { const c = i.children.find(x => x.key === key); if (c) return c; } } } return null;
}
