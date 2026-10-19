import { storage } from "./utils/storage.js"; import { findRouteMeta } from "./router/routes.js"; import { registerRoute, navigate } from "./router/index.js"; import { renderLayout } from "./components/layout.js"; import { initAuth } from "./views/auth.js"; import { $ } from "./utils/dom.js";

registerRoute("dashboard", () => import("./views/dashboard.js")); registerRoute("orders-all", () => import("./views/orders.js"));
registerRoute("users", () => import("./views/users.js")); registerRoute("spider", () => import("./views/spider.js"));
registerRoute("finance", () => import("./views/finance.js")); registerRoute("settings", () => import("./views/settings.js"));
const Ph = { render: async (m) => { m.innerHTML = '<div class="view-empty"><h2>建设中</h2></div>'; } };
["data-center","orders-delivery","orders-refund","products-list","products-category","marketing-coupon"].forEach(k => registerRoute(k, () => Promise.resolve(Ph)));

function boot() {
  if (!storage.getToken()) { initAuth(); return; }
  $("#login-view").hidden = true; $("#app-view").hidden = false; renderLayout();
  document.addEventListener("click", (e) => { const n = e.target.closest(".nav-item[data-route]"); if (n) { location.hash = `#/${n.dataset.route}`; document.body.classList.remove("sidebar-open"); } });
  window.addEventListener("hashchange", () => {
    const k = location.hash.replace(/^#\/?/, "") || "dashboard"; const m = findRouteMeta(k);
    if (m) { $("#page-title").textContent = m.label; $("#page-sub").textContent = m.sub || ""; }
    document.querySelectorAll(".nav-item").forEach(el => el.classList.toggle("is-active", el.dataset.route === k));
    navigate(k);
  });
  if (!location.hash) location.hash = "#/dashboard"; else navigate(location.hash.replace(/^#\/?/, ""));
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
