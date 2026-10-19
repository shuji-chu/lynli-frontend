import { register, navigate } from "./router.js";

const TOKEN_KEY = "lynli.token";
const USER_KEY = "lynli.user";

const state = {
  loading: false,
  user: null,
};

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const ICONS = {
  dashboard: '<path d="M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6v-9h-6v9Zm0-16v5h6V4h-6Z"/>',
  orders: '<path d="M6 4h12l1 16H5L6 4Z"/><path d="M9 8h6"/>',
  products: '<path d="M4 8l8-4 8 4v8l-8 4-8-4V8Z"/><path d="M4 8l8 4 8-4M12 12v8"/>',
  users: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c1.2-3.4 3.9-5 7-5s5.8 1.6 7 5"/>',
  spider: '<circle cx="12" cy="12" r="3"/><path d="M12 4v5M12 15v5M4 12h5M15 12h5M6.5 6.5l3.5 3.5M14 14l3.5 3.5M17.5 6.5L14 10M10 14l-3.5 3.5"/>',
  email: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  finance: '<path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/>',
  marketing: '<path d="M4 10v4l10 5V5L4 10Z"/><path d="M14 8a3 3 0 0 1 0 8"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>',
};

const NAV = [
  { key: "dashboard", label: "数据看板", sub: "经营概览", roles: ["super_admin", "operator", "support"] },
  { key: "orders", label: "订单管理", sub: "收件与物流", roles: ["super_admin", "operator", "support"] },
  { key: "products", label: "商品库", sub: "已上架商品", roles: ["super_admin", "operator"] },
  { key: "users", label: "会员列表", sub: "邮箱与头像", roles: ["super_admin", "support"] },
  { key: "spider", label: "AI 选品", sub: "抓取与上架", roles: ["super_admin", "operator"] },
  { key: "email", label: "邮件通知", sub: "群发与模板", roles: ["super_admin", "operator"] },
  { key: "finance", label: "财务对账", sub: "成本与利润", roles: ["super_admin"] },
  { key: "marketing", label: "营销活动", sub: "优惠与投放", roles: ["super_admin", "operator"] },
  { key: "settings", label: "系统设置", sub: "账号与权限", roles: ["super_admin"] },
];

const ROLE_LABEL = {
  super_admin: "超级管理员",
  operator: "运营",
  support: "客服",
};

register("dashboard", () => import("./views/dashboard.js"));

/* ---------- 登录交互 ---------- */
function showError(msg) {
  const el = $("#login-error");
  el.textContent = msg;
  el.hidden = false;
}

function clearError() {
  const el = $("#login-error");
  if (!el) return;
  el.textContent = "";
  el.hidden = true;
}

const REMEMBER_KEY = "lynli.remember.account";

function restoreRememberedAccount() {
  const saved = localStorage.getItem(REMEMBER_KEY);
  if (!saved) return;
  const input = $('#login-form [name="account"]');
  const check = $('#login-form [name="remember"]');
  if (!input || !check) return;
  input.value = saved;
  check.checked = true;
}

function persistRememberedAccount(account, remember) {
  if (remember) localStorage.setItem(REMEMBER_KEY, account);
  else localStorage.removeItem(REMEMBER_KEY);
}

// 核心登录逻辑（目前模拟登录）
async function handleLogin(e) {
  e.preventDefault();
  if (state.loading) return;

  clearError();

  const form = e.currentTarget;
  const account = form.account.value.trim();
  const password = form.password.value;
  const remember = form.remember.checked;

  if (!account) {
    form.account.classList.add("is-invalid");
    showError("请输入账号");
    return;
  }
  form.account.classList.remove("is-invalid");

  if (!password || password.length < 6) {
    form.password.classList.add("is-invalid");
    showError("密码至少 6 位");
    return;
  }
  form.password.classList.remove("is-invalid");

  const submitBtn = $('.btn[type="submit"]');
  state.loading = true;
  submitBtn.classList.add("is-loading");
  submitBtn.disabled = true;

  try {
    // 模拟网络延迟，显得真实一点
    await new Promise((resolve) => setTimeout(resolve, 600));

    // ==========================================
    // 【超级管理员测试账号】
    // 账号：admin
    // 密码：123456
    // ==========================================
    if (account === "admin" && password === "123456") {
      
      const user = { 
        email: "admin@lynli.me", 
        role: "super_admin", 
        nickname: "最高指挥官" 
      };
      
      localStorage.setItem(TOKEN_KEY, "mock_token_123456");
      localStorage.setItem(USER_KEY, JSON.stringify(user));

      persistRememberedAccount(account, remember);
      enterApp(user);
      
    } else if (account === "yunying" && password === "123456") {
      
      // 运营测试账号：yunying / 123456
      const user = { 
        email: "yunying@lynli.me", 
        role: "operator", 
        nickname: "运营专员" 
      };
      
      localStorage.setItem(TOKEN_KEY, "mock_token_operator");
      localStorage.setItem(USER_KEY, JSON.stringify(user));

      persistRememberedAccount(account, remember);
      enterApp(user);

    } else {
      throw new Error("账号或密码错误，请重试");
    }
  } catch (err) {
    showError(err.message || "网络异常，请稍后重试");
  } finally {
    state.loading = false;
    submitBtn.classList.remove("is-loading");
    submitBtn.disabled = false;
  }
}

/* ---------- 主布局 ---------- */
function enterApp(user) {
  state.user = user;
  $("#login-view").hidden = true;
  $("#app-view").hidden = false;

  renderNav();
  renderUser();
  bindShell();
  initRouting();

  const initial = (location.hash.replace(/^#\/?/, "") || "dashboard");
  if (!location.hash) location.hash = "#/dashboard";
  else navigateTo(initial);
}

function renderNav() {
  const role = state.user?.role || "super_admin";
  const items = NAV.filter((n) => n.roles.includes(role));

  $("#nav").innerHTML = items
    .map(
      (n) => `
      <button class="nav-item" type="button" data-route="${n.key}" data-sub="${n.sub}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONS[n.key] || ""}</svg>
        <span>${n.label}</span>
      </button>`
    )
    .join("");

  $$(".nav-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      location.hash = `#/${btn.dataset.route}`;
      closeSidebar();
    });
  });
}

function renderUser() {
  const user = state.user || {};
  const role = user.role || "super_admin";
  const email = user.email || "未登录";
  const name = user.nickname || email.split("@")[0];
  const initial = (name || "U").slice(0, 1).toUpperCase();

  const chip = `
    <div class="user-chip">
      <div class="user-chip__avatar">${initial}</div>
      <div class="user-chip__meta">
        <strong>${escapeHtml(name)}</strong>
        <span>${escapeHtml(email)}</span>
      </div>
    </div>`;

  $("#sidebar-foot").innerHTML = chip;

  $("#topbar-user").innerHTML = `
    <span class="role-badge">${ROLE_LABEL[role] || role}</span>
    <button class="icon-btn" id="logout-btn" type="button" aria-label="退出登录">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 4H5v16h4M16 8l4 4-4 4M20 12H9"/>
      </svg>
    </button>`;

  $("#logout-btn").addEventListener("click", logout);
  $("#menu-toggle").addEventListener("click", toggleSidebar);
  $("#sidebar-scrim").addEventListener("click", closeSidebar);
}

function bindShell() {
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSidebar();
  });
}

let routingBound = false;

function initRouting() {
  if (routingBound) return;
  routingBound = true;
  window.addEventListener("hashchange", () => {
    const key = location.hash.replace(/^#\/?/, "") || "dashboard";
    navigateTo(key);
  });
}

function navigateTo(key) {
  const meta = NAV.find((n) => n.key === key);
  $("#page-title").textContent = meta ? meta.label : key;
  $("#page-sub").textContent = meta ? meta.sub : "";

  navigate(key, $("#content"), { title: meta?.label });
  $("#content").focus({ preventScroll: true });
  window.scrollTo({ top: 0 });
}

function toggleSidebar() {
  document.body.classList.toggle("sidebar-open");
}

function closeSidebar() {
  document.body.classList.remove("sidebar-open");
}

function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  state.user = null;
  $("#app-view").hidden = true;
  $("#login-view").hidden = false;
  history.replaceState(null, "", location.pathname);
}

/* ---------- 启动 ---------- */
function boot() {
  restoreRememberedAccount();

  const form = $("#login-form");
  form.addEventListener("submit", handleLogin);
  form.addEventListener("input", (e) => {
    e.target.classList.remove("is-invalid");
    clearError();
  });

  const token = localStorage.getItem(TOKEN_KEY);
  const cached = localStorage.getItem(USER_KEY);
  if (token && cached) {
    try {
      enterApp(JSON.parse(cached));
    } catch {
      localStorage.removeItem(USER_KEY);
    }
  }
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
