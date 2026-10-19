import { $ } from "../utils/dom.js";
import { ROUTES } from "../router/routes.js";
import { storage } from "../utils/storage.js";
export function renderLayout() {
  const user = storage.getUser() || {}; let html = "";
  ROUTES.forEach((g, idx) => {
    html += `<div class="nav-group-title">${g.group}</div>`;
    g.items.forEach(i => {
      if (i.children) {
        const subs = i.children.map(c => `<button class="nav-item nav-item--sub" data-route="${c.key}"><span>${c.label}</span></button>`).join("");
        html += `<div class="nav-parent-wrap"><button class="nav-item nav-parent" data-toggle="sub-${idx}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">${i.icon}</svg><span style="flex:1;text-align:left;">${i.label}</span><svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m6 9 6 6 6-6"/></svg></button><div class="nav-sub" id="sub-${idx}">${subs}</div></div>`;
      } else { html += `<button class="nav-item" data-route="${i.key}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">${i.icon}</svg><span>${i.label}</span></button>`; }
    });
  });
  $("#nav").innerHTML = html;
  document.querySelectorAll(".nav-parent").forEach(b => b.addEventListener("click", () => { const t = document.getElementById(b.dataset.toggle); t.classList.toggle("is-open"); b.querySelector(".arrow").style.transform = t.classList.contains("is-open") ? "rotate(180deg)" : "rotate(0deg)"; }));
  $("#sidebar-foot").innerHTML = `<div class="user-chip"><div class="user-chip__avatar">${(user.nickname||"A")[0]}</div><div class="user-chip__meta"><strong>${user.nickname||"Admin"}</strong><span>${user.email||""}</span></div></div>`;
  $("#topbar-user").innerHTML = `<button class="icon-btn" id="logout-btn"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 4H5v16h4M16 8l4 4-4 4M20 12H9"/></svg></button>`;
  $("#logout-btn").onclick = () => { storage.clear(); location.reload(); };
  $("#menu-toggle").onclick = () => document.body.classList.toggle("sidebar-open");
  $("#sidebar-scrim").onclick = () => document.body.classList.remove("sidebar-open");
}
