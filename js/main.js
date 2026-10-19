import { storage } from "./utils/storage.js";
import { ROUTES } from "./router/routes.js";
import { registerRoute, navigate } from "./router/index.js";
import { renderLayout } from "./components/layout.js";
import { initAuth } from "./views/auth.js";
import { $ } from "./utils/dom.js";

// 1. 注册所有路由模块
registerRoute("dashboard", () => import("./views/dashboard.js"));
registerRoute("orders", () => import("./views/orders.js"));
registerRoute("products", () => import("./views/products.js"));
registerRoute("spider", () => import("./views/spider.js"));
registerRoute("finance", () => import("./views/finance.js"));
registerRoute("marketing", () => import("./views/marketing.js"));
registerRoute("users", () => import("./views/users.js"));
registerRoute("settings", () => import("./views/settings.js"));

// 2. 初始化
function boot() {
  if (!storage.getToken()) {
    initAuth();
    return;
  }

  $("#login-view").hidden = true;
  $("#app-view").hidden = false;
  renderLayout();

  document.addEventListener("click", (e) => {
    const navItem = e.target.closest(".nav-item");
    if (navItem) {
      location.hash = `#/${navItem.dataset.route}`;
      document.body.classList.remove("sidebar-open");
    }
  });

  window.addEventListener("hashchange", () => {
    const key = location.hash.replace(/^#\/?/, "") || "dashboard";
    const meta = ROUTES.find(r => r.key === key);
    if (meta) {
      $("#page-title").textContent = meta.label;
      $("#page-sub").textContent = meta.sub;
      
      // 自动高亮当前菜单
      document.querySelectorAll(".nav-item").forEach(el => {
        el.classList.toggle("is-active", el.dataset.route === key);
      });
    }
    navigate(key);
  });

  const initialKey = location.hash.replace(/^#\/?/, "") || "dashboard";
  if (!location.hash) location.hash = "#/dashboard";
  else navigate(initialKey);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();
