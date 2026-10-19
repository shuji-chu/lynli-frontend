import { storage } from "./utils/storage.js";
import { ROUTES } from "./router/routes.js";
import { registerRoute, navigate } from "./router/index.js";
import { renderLayout } from "./components/layout.js";
import { initAuth } from "./views/auth.js";
import { $, $$ } from "./utils/dom.js";

// 1. 注册路由模块（按需加载，性能极好）
registerRoute("dashboard", () => import("./views/dashboard.js"));
registerRoute("orders", () => import("./views/orders.js"));

// 2. 初始化
function boot() {
  // 如果没登录，显示登录页
  if (!storage.getToken()) {
    initAuth();
    return;
  }

  // 如果已登录，直接进主系统
  $("#login-view").hidden = true;
  $("#app-view").hidden = false;
  renderLayout();

  // 监听侧边栏点击
  document.addEventListener("click", (e) => {
    const navItem = e.target.closest(".nav-item");
    if (navItem) {
      location.hash = `#/${navItem.dataset.route}`;
      document.body.classList.remove("sidebar-open");
    }
  });

  // 监听路由变化
  window.addEventListener("hashchange", () => {
    const key = location.hash.replace(/^#\/?/, "") || "dashboard";
    const meta = ROUTES.find(r => r.key === key);
    if (meta) {
      $("#page-title").textContent = meta.label;
      $("#page-sub").textContent = meta.sub;
    }
    navigate(key);
  });

  // 启动时触发一次当前路由
  const initialKey = location.hash.replace(/^#\/?/, "") || "dashboard";
  if (!location.hash) location.hash = "#/dashboard";
  else navigate(initialKey);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();
