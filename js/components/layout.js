import { $ } from "../utils/dom.js";
import { ROUTES } from "../router/routes.js";
import { storage } from "../utils/storage.js";

export function renderLayout() {
  const user = storage.getUser() || {};
  let navHtml = "";
  ROUTES.forEach((group, index) => {
    navHtml += `<div class="nav-group-title">${group.group}</div>`;
    group.items.forEach(item => {
      if (item.children) {
        const subItemsHtml = item.children.map(child => `<button class="nav-item nav-item--sub" type="button" data-route="${child.key}"><span>${child.label}</span></button>`).join("");
        navHtml += `
          <div class="nav-parent-wrap">
            <button class="nav-item nav-parent" type="button" data-toggle="sub-${index}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">${item.icon}</svg>
              <span style="flex:1;text-align:left;">${item.label}</span>
              <svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            <div class="nav-sub" id="sub-${index}">${subItemsHtml}</div>
          </div>`;
      } else {
        navHtml += `<button class="nav-item" type="button" data-route="${item.key}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">${item.icon}</svg><span>${item.label}</span></button>`;
      }
    });
  });
  $("#nav").innerHTML = navHtml;

  document.querySelectorAll(".nav-parent").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = document.getElementById(btn.dataset.toggle);
      const isOpen = target.classList.contains("is-open");
      target.classList.toggle("is-open");
      btn.querySelector(".arrow").style.transform = isOpen ? "rotate(0deg)" : "rotate(180deg)";
    });
  });

  $("#sidebar-foot").innerHTML = `<div class="user-chip"><div class="user-chip__avatar">${(user.nickname||"A")[0]}</div><div class="user-chip__meta"><strong>${user.nickname||"管理员"}</strong><span>${user.email||""}</span></div></div>`;
  $("#topbar-user").innerHTML = `<button class="icon-btn" id="logout-btn" type="button"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 4H5v16h4M16 8l4 4-4 4M20 12H9"/></svg></button>`;
  
  $("#logout-btn").addEventListener("click", () => { storage.clear(); location.reload(); });
  $("#menu-toggle").addEventListener("click", () => document.body.classList.toggle("sidebar-open"));
  $("#sidebar-scrim").addEventListener("click", () => document.body.classList.remove("sidebar-open"));
}
