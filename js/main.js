import { $ } from "./core/utils.js";
import { register, nav } from "./router/index.js";
import { findMeta } from "./router/routes.js";
import { initAuth } from "./views/auth.js";
import { store } from "./store/data.js";
import { bus } from "./store/eventBus.js";

register("dashboard", () => import("./views/dashboard.js"));
register("trade-orders", () => import("./views/trade/orders.js"));
register("trade-purchase", () => import("./views/trade/purchase.js"));
register("product-list", () => import("./views/product/list.js"));
register("product-spider", () => import("./views/product/spider.js"));
register("finance-report", () => import("./views/finance/report.js"));

window.addEventListener("hashchange", () => {
  const key = location.hash.replace(/^#\/?/, "") || "dashboard";
  const meta = findMeta(key);
  if(meta) { $("#page-title").textContent = meta.label; document.querySelectorAll(".nav-item").forEach(el => el.classList.toggle("active", el.dataset.route === key)); }
  nav(key);
});

// 核心联动：只要有数据改变，看板自动刷新
bus.on("dataChanged", () => {
  if(location.hash === "#/dashboard" || !location.hash) nav("dashboard");
});

initAuth();
if(!location.hash) location.hash = "#/dashboard"; else nav(location.hash.replace(/^#\/?/, ""));
