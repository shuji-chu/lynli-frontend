const API_BASE = "https://spider.lynli.me";

const state = {
  role: "super_admin",
  loading: false,
};

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

function initRoleSwitch() {
  const items = $$(".role-switch__item");
  items.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (state.loading) return;
      items.forEach((b) => {
        b.classList.toggle("is-active", b === btn);
        b.setAttribute("aria-selected", String(b === btn));
      });
      state.role = btn.dataset.role;
    });
  });
}

function showError(msg) {
  const el = $("#login-error");
  el.textContent = msg;
  el.hidden = false;
}

function clearError() {
  const el = $("#login-error");
  el.textContent = "";
  el.hidden = true;
}

const REMEMBER_KEY = "lynli.remember.email";

function restoreRememberedEmail() {
  const saved = localStorage.getItem(REMEMBER_KEY);
  if (!saved) return;
  const input = $('#login-form [name="email"]');
  const check = $('#login-form [name="remember"]');
  input.value = saved;
  check.checked = true;
}

function persistRememberedEmail(email, remember) {
  if (remember) localStorage.setItem(REMEMBER_KEY, email);
  else localStorage.removeItem(REMEMBER_KEY);
}

async function handleLogin(e) {
  e.preventDefault();
  if (state.loading) return;

  clearError();

  const form = e.currentTarget;
  const email = form.email.value.trim();
  const password = form.password.value;
  const remember = form.remember.checked;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    form.email.classList.add("is-invalid");
    showError("请输入有效的邮箱地址");
    return;
  }
  form.email.classList.remove("is-invalid");

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
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role: state.role }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || "登录失败，请检查账号或密码");
    }

    if (!data.token) {
      throw new Error("服务端未返回登录凭证");
    }

    localStorage.setItem("lynli.token", data.token);
    if (data.user) {
      localStorage.setItem("lynli.user", JSON.stringify(data.user));
    }
    persistRememberedEmail(email, remember);

    location.hash = "#/dashboard";
    document.dispatchEvent(new CustomEvent("lynli:login", { detail: data }));
  } catch (err) {
    showError(err.message || "网络异常，请稍后重试");
  } finally {
    state.loading = false;
    submitBtn.classList.remove("is-loading");
    submitBtn.disabled = false;
  }
}

function boot() {
  initRoleSwitch();
  restoreRememberedEmail();

  const form = $("#login-form");
  form.addEventListener("submit", handleLogin);
  form.addEventListener("input", (e) => {
    e.target.classList.remove("is-invalid");
    clearError();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
