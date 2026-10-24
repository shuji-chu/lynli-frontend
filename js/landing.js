/* ============================================================
   SOCKS5 落地页逻辑
   - 真实商品 / 套餐（后端 API）
   - 邮箱验证码注册 + 自动登录
   - 本地支付弹窗（二维码 + 3 秒轮询查单，绝不跳转）
   ============================================================ */

// ---------- API 基址（同源优先） ----------
const API_BASE = (location.hostname.endsWith("lynli.me") && location.hostname !== "api.lynli.me")
  ? "/api/v1"
  : "https://api.lynli.me/api/v1";

// ---------- 工具 ----------
function toast(msg, type = "info", duration = 2600) {
  const stack = document.getElementById("toast-stack");
  const el = document.createElement("div");
  el.className = "toast" + (type !== "info" ? " " + type : "");
  el.textContent = msg;
  stack.appendChild(el);
  const timer = setTimeout(remove, duration);
  function remove() {
    clearTimeout(timer);
    el.classList.add("leaving");
    setTimeout(() => el.remove(), 200);
  }
  el.addEventListener("click", remove);
}

function getUserToken() { return localStorage.getItem("lynli_user_token") || ""; }
function setUserToken(t) { localStorage.setItem("lynli_user_token", t); }

function openModal(id) {
  const m = document.getElementById(id);
  m.classList.add("show");
  if (window.anime) {
    anime({ targets: m.querySelector(".modal"), scale: [0.85, 1], opacity: [0, 1], duration: 380, easing: "easeOutBack" });
  }
}
function closeModal(id) { document.getElementById(id).classList.remove("show"); }

function openRegister() { openModal("register-modal"); }
function openLogin() { openModal("login-modal"); }

// ---------- 用户状态 ----------
function refreshUserPill() {
  const pill = document.getElementById("user-pill");
  const emailEl = document.getElementById("user-email");
  if (getUserToken()) {
    pill.style.display = "flex";
    emailEl.textContent = localStorage.getItem("lynli_user_email") || "已登录";
  } else {
    pill.style.display = "none";
  }
}

function logout() {
  localStorage.removeItem("lynli_user_token");
  localStorage.removeItem("lynli_user_email");
  refreshUserPill();
  toast("已退出登录", "info");
}

// ---------- 注册 ----------
let regCodeCooldown = 0;

async function sendRegCode() {
  const email = (document.getElementById("reg-email").value || "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast("请输入正确的邮箱地址", "warning"); return; }
  const btn = document.getElementById("btn-send-code");
  if (regCodeCooldown > 0) return;
  btn.disabled = true;
  btn.textContent = "发送中...";
  try {
    const res = await fetch(`${API_BASE}/passport/auth/send-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok && (json.message === "" || json.message === undefined || json.code === 1)) {
      toast("验证码已发送，请查收邮件", "success");
      regCodeCooldown = 60;
      const timer = setInterval(() => {
        regCodeCooldown--;
        btn.textContent = regCodeCooldown > 0 ? `${regCodeCooldown}s 后重发` : "重新发送";
        if (regCodeCooldown <= 0) { clearInterval(timer); btn.disabled = false; }
      }, 1000);
    } else {
      toast(json.message || "发送失败，请稍后再试", "error");
      btn.disabled = false; btn.textContent = "获取验证码";
    }
  } catch (e) {
    toast("网络错误：" + e.message, "error");
    btn.disabled = false; btn.textContent = "获取验证码";
  }
}

async function doRegister() {
  const email = (document.getElementById("reg-email").value || "").trim();
  const code = (document.getElementById("reg-code").value || "").trim();
  const pass = document.getElementById("reg-pass").value || "";
  if (!email || !code || pass.length < 6) { toast("请填写邮箱、验证码和至少 6 位密码", "warning"); return; }
  try {
    const res = await fetch(`${API_BASE}/passport/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: pass, code })
    });
    const json = await res.json().catch(() => ({}));
    if (json.data && json.data.token) {
      // 注册成功，自动登录
      setUserToken(json.data.token);
      localStorage.setItem("lynli_user_email", email);
      refreshUserPill();
      closeModal("register-modal");
      toast("注册成功，已自动登录 🎉", "success", 3200);
    } else {
      toast(json.message || "注册失败", "error");
    }
  } catch (e) {
    toast("网络错误：" + e.message, "error");
  }
}

// ---------- 登录 ----------
async function doLogin() {
  const email = (document.getElementById("login-email").value || "").trim();
  const pass = document.getElementById("login-pass").value || "";
  if (!email || !pass) { toast("请输入邮箱和密码", "warning"); return; }
  try {
    const res = await fetch(`${API_BASE}/passport/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: pass })
    });
    const json = await res.json().catch(() => ({}));
    if (json.data && json.data.token) {
      setUserToken(json.data.token);
      localStorage.setItem("lynli_user_email", email);
      refreshUserPill();
      closeModal("login-modal");
      toast("登录成功", "success");
    } else {
      toast(json.message || "账号或密码错误", "error");
    }
  } catch (e) {
    toast("网络错误：" + e.message, "error");
  }
}

// ---------- 套餐 ----------
async function loadPlans() {
  const grid = document.getElementById("plan-grid");
  try {
    const res = await fetch(`${API_BASE}/plans`);
    const json = await res.json().catch(() => ({}));
    const plans = (json.data || json.plans || []).filter(p => p.show !== 0);
    if (!plans.length) throw new Error("empty");
    grid.innerHTML = "";
    plans.forEach((p, i) => {
      const price = ((p.month_price || 0) / 100).toFixed(2);
      const card = document.createElement("div");
      card.className = "card glass plan-card" + (i === 1 ? " featured" : "");
      card.innerHTML = `
        ${i === 1 ? '<div class="plan-tag">最受欢迎</div>' : ""}
        <div class="plan-name">${escapeHtml(p.name || "套餐")}</div>
        <div class="plan-price">¥${price}<small> /月</small></div>
        <div class="plan-desc">${escapeHtml(p.tagline || p.content || "全节点访问 · 不限设备")}</div>
        <button class="btn btn-primary btn-block" onclick="buyPlan(${p.id}, '${escapeHtml(p.name || "")}', ${p.month_price || 0})">立即购买</button>
      `;
      grid.appendChild(card);
      if (window.anime) {
        anime({ targets: card, translateY: [30, 0], opacity: [0, 1], delay: i * 90, duration: 600, easing: "easeOutQuad" });
      }
    });
  } catch (e) {
    grid.innerHTML = '<div class="card glass plan-card skeleton">套餐加载失败，请刷新重试</div>';
  }
}

// ---------- 商品 ----------
async function loadProducts() {
  const grid = document.getElementById("product-grid");
  try {
    const res = await fetch(`${API_BASE}/account/products`);
    const json = await res.json().catch(() => ({}));
    const list = json.data || [];
    if (!list.length) throw new Error("empty");
    grid.innerHTML = "";
    list.slice(0, 12).forEach((p, i) => {
      const card = document.createElement("div");
      card.className = "card glass product-card";
      card.innerHTML = `
        <h4>${escapeHtml(p.title || "")}</h4>
        <div class="product-meta">
          <span class="product-price">¥${(p.price || 0).toFixed(2)}</span>
          <span class="product-stock">库存 ${p.stock || 0}</span>
        </div>
        <button class="btn btn-primary btn-block btn-sm" onclick="buyProduct(${p.id}, '${escapeHtml(p.title || "")}', ${p.price || 0})">立即购买</button>
      `;
      grid.appendChild(card);
      if (window.anime) {
        anime({ targets: card, translateY: [24, 0], opacity: [0, 1], delay: i * 60, duration: 550, easing: "easeOutQuad" });
      }
    });
  } catch (e) {
    grid.innerHTML = '<div class="card glass product-card skeleton">商品加载失败，请刷新重试</div>';
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// ---------- 购买（套餐） ----------
let currentOrder = null;   // { trade_no, amount, title }
let payPollTimer = null;
let currentPayMethod = "alipay";

async function buyPlan(planId, planName, monthPrice) {
  if (!getUserToken()) { toast("请先登录 / 注册", "warning"); openLogin(); return; }
  try {
    const res = await fetch(`${API_BASE}/user/order/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + getUserToken() },
      body: JSON.stringify({ plan_id: planId, period: "month_price", payment: currentPayMethod })
    });
    const json = await res.json().catch(() => ({}));
    if (json.status === "success" && json.data) {
      currentOrder = { trade_no: json.data, amount: (monthPrice / 100).toFixed(2), title: planName };
      openPayModal();
    } else {
      toast(json.message || "创建订单失败", "error");
    }
  } catch (e) {
    toast("网络错误：" + e.message, "error");
  }
}

// ---------- 购买（商品，余额直购） ----------
async function buyProduct(prodId, title, price) {
  if (!getUserToken()) { toast("请先登录 / 注册", "warning"); openLogin(); return; }
  if (!confirm(`确认使用余额购买「${title}」（¥${price.toFixed(2)}）吗？`)) return;
  try {
    const res = await fetch(`${API_BASE}/account/buy`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + getUserToken() },
      body: JSON.stringify({ product_id: prodId })
    });
    const json = await res.json().catch(() => ({}));
    if (json.code === 1) {
      toast("购买成功，已自动发货", "success", 3200);
    } else {
      toast(json.msg || "购买失败（可能需要先充值余额）", "error", 3200);
    }
  } catch (e) {
    toast("网络错误：" + e.message, "error");
  }
}

// ---------- 支付弹窗（本地轮询） ----------
function openPayModal() {
  document.getElementById("pay-amount").textContent = "¥" + currentOrder.amount;
  document.getElementById("pay-qr-box").innerHTML = '<div class="pay-qr-loading">正在获取收款二维码...</div>';
  const st = document.getElementById("pay-status");
  st.textContent = "等待支付..."; st.className = "pay-status";
  openModal("pay-modal");
  requestPayQr();
}

async function requestPayQr() {
  const method = currentPayMethod === "wxpay" ? "alipay" : currentPayMethod; // 后端按配置渠道返回
  try {
    const res = await fetch(`${API_BASE}/user/order/pay`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + getUserToken() },
      body: JSON.stringify({ trade_no: currentOrder.trade_no, method })
    });
    const json = await res.json().catch(() => ({}));
    if (json.code === 1 && json.data) {
      renderQr(json.data);
      startPayPolling();
    } else {
      document.getElementById("pay-qr-box").innerHTML =
        `<div class="pay-qr-loading">${escapeHtml(json.msg || "支付通道暂未配置")}<br>请联系站长开启支付</div>`;
      document.getElementById("pay-status").textContent = "支付通道不可用";
      document.getElementById("pay-status").className = "pay-status err";
    }
  } catch (e) {
    document.getElementById("pay-qr-box").innerHTML =
      `<div class="pay-qr-loading">网络错误<br>${escapeHtml(e.message)}</div>`;
  }
}

function renderQr(data) {
  const box = document.getElementById("pay-qr-box");
  const qr = data.qrcode || "";
  const info = data.pay_info || "";
  if (qr && (qr.startsWith("data:") || qr.startsWith("http"))) {
    box.innerHTML = `<img src="${qr}" alt="收款二维码">`;
  } else if (qr) {
    box.innerHTML = `<div class="pay-qr-loading">${escapeHtml(qr)}</div>`;
  } else if (info) {
    box.innerHTML = `<div class="pay-qr-loading">${escapeHtml(info)}</div>`;
  } else {
    box.innerHTML = `<div class="pay-qr-loading">请按支付平台指引完成支付</div>`;
  }
}

function switchPayMethod(btn) {
  document.querySelectorAll(".pay-method").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  currentPayMethod = btn.dataset.m;
  if (currentOrder) requestPayQr();
}

function startPayPolling() {
  stopPayPolling();
  payPollTimer = setInterval(pollOrder, 3000); // 每 3 秒查单
}

function stopPayPolling() {
  if (payPollTimer) { clearInterval(payPollTimer); payPollTimer = null; }
}

async function pollOrder() {
  if (!currentOrder) return;
  try {
    const res = await fetch(`${API_BASE}/user/order/query?trade_no=${encodeURIComponent(currentOrder.trade_no)}`, {
      headers: { "Authorization": "Bearer " + getUserToken() }
    });
    const json = await res.json().catch(() => ({}));
    if (json.code === 1 && json.data && json.data.paid) {
      stopPayPolling();
      closeModal("pay-modal");
      toast("支付成功！套餐已开通 🎉", "success", 4000);
      currentOrder = null;
    }
  } catch (e) { /* 网络抖动时静默重试 */ }
}

function closePay() {
  stopPayPolling();
  closeModal("pay-modal");
  currentOrder = null;
}

// ---------- 滚动显现 ----------
function initScrollReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        if (window.anime) {
          anime({ targets: en.target, translateY: [36, 0], opacity: [0, 1], duration: 700, easing: "easeOutQuad" });
        }
        observer.unobserve(en.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll(".feature-card, .plan-card, .product-card").forEach(el => {
    el.style.opacity = "0";
    observer.observe(el);
  });
}

// ---------- 数字滚动 ----------
function initCounters() {
  document.querySelectorAll(".counter").forEach(el => {
    const to = parseInt(el.dataset.to, 10) || 0;
    const step = Math.max(1, Math.round(to / 60));
    let cur = 0;
    const timer = setInterval(() => {
      cur += step;
      if (cur >= to) { cur = to; clearInterval(timer); }
      el.textContent = cur.toLocaleString();
    }, 24);
  });
}

// ---------- 启动 ----------
document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("anime-ready");
  refreshUserPill();
  loadPlans();
  loadProducts();
  initScrollReveal();
  initCounters();
});
