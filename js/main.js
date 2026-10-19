import { storage } from "./utils/storage.js";
import { findRouteMeta } from "./router/routes.js";
import { registerRoute, navigate } from "./router/index.js";
import { renderLayout } from "./components/layout.js";
import { initAuth } from "./views/auth.js";
import { $ } from "./utils/dom.js";

registerRoute("dashboard", () => import("./views/dashboard.js"));
registerRoute("orders-all", () => import("./views/orders.js"));
registerRoute("products-list", () => import("./views/products.js"));
registerRoute("spider", () => import("./views/spider.js"));
registerRoute("finance", () => import("./views/finance.js"));
registerRoute("users", () => import("./views/users.js"));
registerRoute("settings", () => import("./views/settings.js"));

const PlaceholderView = { render: async (mount) => { mount.innerHTML = '<div class="view-empty"><h2>模块建设中</h2><p>敬请期待...</p></div>'; } };
registerRoute("data-center", () => Promise.resolve(PlaceholderView));
registerRoute("orders-delivery", () => Promise.resolve(PlaceholderView));
registerRoute("orders-refund", () => Promise.resolve(PlaceholderView));
registerRoute("products-category", () => Promise.resolve(PlaceholderView));
registerRoute("products-inventory", () => Promise.resolve(PlaceholderView));
registerRoute("marketing-coupon", () => Promise.resolve(PlaceholderView));
registerRoute("marketing-promo", () => Promise.resolve(PlaceholderView));

function boot() {
  if (!storage.getToken()) { initAuth(); return; }
  $("#login-view").hidden = true;
  $("#app-view").hidden = false;
  renderLayout();

  document.addEventListener("click", (e) => {
    const navItem = e.target.closest(".nav-item[data-route]");
    if (navItem) { location.hash = `#/${navItem.dataset.route}`; document.body.classList.remove("sidebar-open"); }
  });

  window.addEventListener("hashchange", () => {
    const key = location.hash.replace(/^#\/?/, "") || "dashboard";
    const meta = findRouteMeta(key);
    if (meta) { $("#page-title").textContent = meta.label; $("#page-sub").textContent = meta.sub || ""; }
    document.querySelectorAll(".nav-item").forEach(el => el.classList.toggle("is-active", el.dataset.route === key));
    navigate(key);
  });

  if (!location.hash) location.hash = "#/dashboard";
  else navigate(location.hash.replace(/^#\/?/, ""));
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
