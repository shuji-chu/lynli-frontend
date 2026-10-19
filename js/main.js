import { storage } from "./utils/storage.js";
import { findRouteMeta } from "./router/routes.js";
import { registerRoute, navigate } from "./router/index.js";
import { renderLayout } from "./components/layout.js";
import { initAuth } from "./views/auth.js";
import { $ } from "./utils/dom.js";

const pages = {
  "dashboard": "./views/dashboard.js", "data-screen": "./views/data-screen.js",
  "orders-all": "./views/orders.js", "logistics": "./views/logistics.js",
  "purchase-pending": "./views/purchase.js",
  "cs-chat": "./views/customer-service.js", "cs-tickets": "./views/customer-tickets.js",
  "products-list": "./views/products.js", "spider": "./views/spider.js", "materials": "./views/materials.js",
  "marketing-coupon": "./views/marketing-coupon.js", "marketing-seckill": "./views/marketing-seckill.js",
  "finance": "./views/finance.js", "users": "./views/users.js", "settings": "./views/settings.js"
};

Object.entries(pages).forEach(([k, path]) => registerRoute(k, () => import(path)));

const PlaceholderView = { render: async (mount) => { mount.innerHTML = '<div class="view-empty"><h2>模块建设中</h2></div>'; } };
["orders-refund","purchase-shipped","products-category"].forEach(k => registerRoute(k, () => Promise.resolve(PlaceholderView)));

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
