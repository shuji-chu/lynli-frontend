import { $ } from "./core/utils.js";
import { register, nav } from "./router/index.js";
import { findMeta } from "./router/routes.js";
import { initAuth } from "./views/auth.js"; // 引入登录模块
import { bus } from "./store/eventBus.js";

// 注册页面模块
register("dashboard", () => import("./views/dashboard.js"));
register("trade-orders", () => import("./views/trade/orders.js"));
register("trade-purchase", () => import("./views/trade/purchase.js"));
register("product-list", () => import("./views/product/list.js"));
register("product-spider", () => import("./views/product/spider.js"));
register("marketing-coupon", () => import("./views/marketing/coupon.js"));
register("finance-report", () => import("./views/finance/report.js"));
register("system-users", () => import("./views/system/members.js"));
register("system-email", () => import("./views/system/email.js"));

// 监听路由变化
window.addEventListener("hashchange", () => {
  const key = location.hash.replace(/^#\/?/, "") || "dashboard";
  const meta = findMeta(key);
  if(meta) { 
    $("#page-title").textContent = meta.label; 
    document.querySelectorAll(".nav-item").forEach(el => el.classList.toggle("active", el.dataset.route === key)); 
  }
  nav(key);
});

bus.on("dataChanged", () => { 
  if(location.hash === "#/dashboard" || !location.hash) nav("dashboard"); 
});

// 启动！初始化登录表单
initAuth(); 

if(!location.hash) location.hash = "#/dashboard"; 
else nav(location.hash.replace(/^#\/?/, ""));
