import { $ } from "../utils/dom.js";
import { ROUTES } from "../router/routes.js";
import { storage } from "../utils/storage.js";

export function renderLayout() {
  const user = storage.getUser() || {};
  const role = user.role || "super_admin";

  // 渲染侧边栏菜单
  const navHtml = ROUTES.filter(r => r.roles.includes(role)).map(r => `
    <button class="nav-item" type="button" data-route="${r.key}">
      <span>${r.label}</span>
    </button>
  `).join("");
  $("#nav").innerHTML = navHtml;

  // 渲染左下角用户信息
  $("#sidebar-foot").innerHTML = `
    <div class="user-chip">
      <div class="user-chip__avatar">${(user.nickname || "U")[0]}</div>
      <div class="user-chip__meta">
        <strong>${user.nickname || "未登录"}</strong>
        <span>${user.email || ""}</span>
      </div>
    </div>`;

  // 顶栏用户操作
  $("#topbar-user").innerHTML = `
    <button class="icon-btn" id="logout-btn" type="button">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 4H5v16h4M16 8l4 4-4 4M20 12H9"/></svg>
    </button>`;
    
  $("#logout-btn").addEventListener("click", () => {
    storage.clear();
    location.reload();
  });

  $("#menu-toggle").addEventListener("click", () => document.body.classList.toggle("sidebar-open"));
  $("#sidebar-scrim").addEventListener("click", () => document.body.classList.remove("sidebar-open"));
}
