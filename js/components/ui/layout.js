import { $ } from "../../core/utils.js";
export function renderLayout(ROUTES, user) {
  let html = "";
  ROUTES.forEach(g => {
    html += `<div class="nav-title">${g.group}</div>`;
    g.items.forEach(i => {
      if(i.children) {
        html += `<div class="nav-parent-wrap"><button class="nav-item nav-parent"><span>${i.label}</span></button><div class="nav-sub">${i.children.map(c => `<button class="nav-item nav-sub-item" data-route="${c.key}">${c.label}</button>`).join("")}</div></div>`;
      } else { html += `<button class="nav-item" data-route="${i.key}"><span>${i.label}</span></button>`; }
    });
  });
  $("#nav").innerHTML = html;
  document.querySelectorAll(".nav-parent").forEach(b => b.onclick = () => { b.nextElementSibling.classList.toggle("open"); });
  $("#user-name").textContent = user.nickname;
}
