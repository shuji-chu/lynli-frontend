import { $ } from "../utils/dom.js";
import { loginApi } from "../api/auth.js";
import { storage } from "../utils/storage.js";
import { renderLayout } from "../components/layout.js";
import { navigate } from "../router/index.js";

export function initAuth() {
  const form = $("#login-form");
  const errorEl = $("#login-error");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const account = form.account.value.trim();
    const password = form.password.value;

    if (!account || !password) {
      errorEl.textContent = "请填写完整信息";
      errorEl.hidden = false;
      return;
    }

    const btn = $('.btn[type="submit"]');
    btn.classList.add("is-loading");
    btn.disabled = true;
    errorEl.hidden = true;

    try {
      const res = await loginApi(account, password);
      storage.setToken(res.token);
      storage.setUser(res.user);
      
      // 登录成功，切换视图
      $("#login-view").hidden = true;
      $("#app-view").hidden = false;
      renderLayout();
      
      // 触发路由跳转
      location.hash = "#/dashboard";
      if(!location.hash) navigate("dashboard");
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.hidden = false;
    } finally {
      btn.classList.remove("is-loading");
      btn.disabled = false;
    }
  });
}
