import { $ } from "./core/utils.js";
import { register, nav } from "./router/index.js";
import { findMeta } from "./router/routes.js";
import { initAuth } from "./views/auth.js";
import { bus } from "./store/eventBus.js";

register("dashboard", () => import("./views/dashboard.js"));
register("trade-orders", () => import("./views/trade/orders.js"));
register("trade-purchase", () => import("./views/trade/purchase.js"));
register("product-list", () => import("./views/product/list.js"));
register("product-spider", () => import("./views/product/spider.js"));
register("marketing-coupon", () => import("./views/marketing/coupon.js"));
register("finance-report", () => import("./views/finance/report.js"));
register("system-users", () => import("./views/system/users.js"));
register("system-email", () => import("./views/system/email.js")); // 注册邮件系统

window.addEventListener("hashchange", () => {
  const key = location.hash.replace(/^#\/?/, "") || "dashboard";
  const meta = findMeta(key);
  if(meta) { $("#page-title").textContent = meta.label; document.querySelectorAll(".nav-item").forEach(el => el.classList.toggle("active", el.dataset.route === key)); }
  nav(key);
});

bus.on("dataChanged", () => { if(location.hash === "#/dashboard" || !location.hash) nav("dashboard"); });
initAuth();
if(!location.hash) location.hash = "#/dashboard"; else nav(location.hash.replace(/^#\/?/, ""));
