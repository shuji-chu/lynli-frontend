import { register, navigate } from "./router.js";

const TOKEN_KEY = "lynli.token";
const USER_KEY = "lynli.user";
const state = { loading: false, user: null };
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const ICONS = {
  dashboard: '<path d="M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6v-9h-6v9Zm0-16v5h6V4h-6Z"/>',
  orders: '<path d="M6 4h12l1 16H5L6 4Z"/><path d="M9 8h6"/>',
  products: '<path d="M4 8l8-4 8 4v8l-8 4-8-4V8Z"/><path d="M4 8l8 4 8-4M12 12v8"/>',
  users: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c1.2-3.4 3.9-5 7-5s5.8 1.6 7 5"/>',
  spider: '<circle cx="12" cy="12" r="3"/><path d="M12 4v5M12 15v5M4 12h5M15 12h5M6.5 6.5l3.5 3.5M14 14l3.5 3.5M17.5 6.5L14 10M10 14l-3.5 3.5"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>',
};

const NAV = [
  { key: "dashboard", label: "数据看板", sub: "经营概览" },
  { key: "orders", label: "订单管理", sub: "收件与物流" },
  { key: "products", label: "商品库", sub: "已上架商品" },
  { key: "spider", label: "AI 选品", sub: "抓取与上架" },
  { key: "users", label: "账号与权限", sub: "员工与角色" },
  { key: "settings", label: "系统设置", sub: "个人资料" },
];

// ==========================================
// 这里注册你要加载的模块
// ==========================================
register("dashboard", () => import("./views/dashboard.js"));
register("orders", () => import("./views/orders.js"));
// 其他的先不注册，点击会显示“建设中”
// register("products", () => import("./views/products.js"));

function showError(msg) { const el = $("#login-error"); el.textContent = msg; el.hidden = false; }
function clearError() { const el = $("#login-error"); if(el) { el.textContent = ""; el.hidden = true; } }

async function handleLogin(e) {
  e.preventDefault();
  if (state.loading) return;
  clearError();
  const form = e.currentTarget;
  const emailInput = form.querySelector('input[type="text"]');
  const account = emailInput.value.trim();
  const password = form.password.value;

  if (!account) { emailInput.classList.add("is-invalid"); showError("请输入账号"); return; }
  if (!password || password.length < 6) { form.password.classList.add("is-invalid"); showError("密码至少 6 位"); return; }

  const submitBtn = $('.btn[type="submit"]');
  state.loading = true;
  submitBtn.classList.add("is-loading");
  submitBtn.disabled = true;

  try {
    await new Promise(r => setTimeout(r, 500));
    if (account === "admin" && password === "123456") {
      const user = { email: "admin@lynli.me", role: "super_admin", nickname: "最高指挥官" };
      localStorage.setItem(TOKEN_KEY, "mock_token_admin");
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      enterApp(user);
    } else {
      throw new Error("账号或密码错误 (admin/123456)");
    }
  } catch (err) { showError(err.message); } 
  finally { state.loading = false; submitBtn.classList.remove("is-loading"); submitBtn.disabled = false; }
}

function enterApp(user) {
  state.user = user;
  $("#login-view").hidden = true;
  $("#app-view").hidden = false;
  renderNav(); renderUser(); bindShell(); initRouting();
  const initial = (location.hash.replace(/^#\/?/, "") || "dashboard");
  if (!location.hash) location.hash = "#/dashboard";
  else navigateTo(initial);
}

function renderNav() {
  $("#nav").innerHTML = NAV.map(n => `
      <button class="nav-item" type="button" data-route="${n.key}" data-sub="${n.sub}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONS[n.key] || ""}</svg>
        <span>${n.label}</span>
      </button>`
  ).join("");
  $$(".nav-item").forEach((btn) => {
    btn.addEventListener("click", () => { location.hash = `#/${btn.dataset.route}`; closeSidebar(); });
  });
}

function renderUser() {
  const user = state.user || {};
  const name = user.nickname || "Admin";
  $("#sidebar-foot").innerHTML = `
    <div class="user-chip">
      <div class="user-chip__avatar">${name[0]}</div>
      <div class="user-chip__meta"><strong>${name}</strong><span>${user.email}</span></div>
    </div>`;
  $("#topbar-user").innerHTML = `
    <button class="icon-btn" id="logout-btn" type="button">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4H5v16h4M16 8l4 4-4 4M20 12H9"/></svg>
    </button>`;
  $("#logout-btn").addEventListener("click", logout);
  $("#menu-toggle").addEventListener("click", () => document.body.classList.toggle("sidebar-open"));
  $("#sidebar-scrim").addEventListener("click", closeSidebar);
}

function bindShell() { document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeSidebar(); }); }
let routingBound = false;
function initRouting() {
  if (routingBound) return; routingBound = true;
  window.addEventListener("hashchange", () => navigateTo(location.hash.replace(/^#\/?/, "") || "dashboard"));
}
function navigateTo(key) {
  const meta = NAV.find((n) => n.key === key);
  $("#page-title").textContent = meta ? meta.label : key;
  $("#page-sub").textContent = meta ? meta.sub : "";
  navigate(key, $("#content"), { title: meta?.label });
  window.scrollTo({ top: 0 });
}
function closeSidebar() { document.body.classList.remove("sidebar-open"); }
function logout() { localStorage.clear(); location.reload(); }

function boot() {
  const form = $("#login-form");
  if (form) {
    form.addEventListener("submit", handleLogin);
    form.addEventListener("input", (e) => { e.target.classList.remove("is-invalid"); clearError(); });
  }
  const token = localStorage.getItem(TOKEN_KEY);
  const cached = localStorage.getItem(USER_KEY);
  if (token && cached) { try { enterApp(JSON.parse(cached)); } catch { localStorage.clear(); } }
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
