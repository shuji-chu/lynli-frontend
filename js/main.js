import { storage } from "./utils/storage.js";
import { findRouteMeta } from "./router/routes.js";
import { registerRoute, navigate } from "./router/index.js";
import { renderLayout } from "./components/layout.js";
import { initAuth } from "./views/auth.js";
import { $ } from "./utils/dom.js";

// 核心页面注册
registerRoute("dashboard", () => import("./views/dashboard.js"));
registerRoute("orders-all", () => import("./views/orders.js"));
registerRoute("products-list", () => import("./views/products.js"));
registerRoute("finance", () => import("./views/finance.js"));
registerRoute("users", () => import("./views/users.js"));
registerRoute("settings", () => import("./views/settings.js"));
registerRoute("spider", () => import("./views/spider.js"));

// 客服模块注册
registerRoute("cs-chat", () => import("./views/customer-service.js"));
registerRoute("cs-tickets", () => import("./views/customer-tickets.js"));

// 占位页面
const PlaceholderView = { render: async (mount) => { mount.innerHTML = '<div class="view-empty"><h2>模块建设中</h2></div>'; } };
["data-center","orders-delivery","orders-refund","products-category","marketing-coupon"].forEach(k => registerRoute(k, () => Promise.resolve(PlaceholderView)));

function boot() {
  if (!storage.getToken()) { initAuth(); return; }
  $("#login-view").hidden = true; $("#app-view").hidden = false; renderLayout();

  document.addEventListener("click", (e) => {
    const navItem = e.target.closest(".nav-item[data-route]");
    if (navItem) { location.hash = `#/${navItem.dataset.route}`; document.body.classList.remove("sidebar-open"); }
  });

  window.addEventListener("hashchange", () => {
    const key = location.hash.replace(/^#\/?/, "") || "dashboard"; const meta = findRouteMeta(key);
    if (meta) { $("#page-title").textContent = meta.label; $("#page-sub").textContent = meta.sub || ""; }
    document.querySelectorAll(".nav-item").forEach(el => el.classList.toggle("is-active", el.dataset.route === key));
    navigate(key);
  });

  if (!location.hash) location.hash = "#/dashboard"; else navigate(location.hash.replace(/^#\/?/, ""));
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
