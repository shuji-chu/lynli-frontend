import { $ } from "../utils/dom.js"; import { showToast } from "../components/toast.js"; import { storage } from "../utils/storage.js"; import { renderLayout } from "../components/layout.js";
export function initAuth() {
  $("#login-form").onsubmit = (e) => {
    e.preventDefault(); const acc = e.target.account.value; const pwd = e.target.password.value;
    if (acc === "admin" && pwd === "123456") {
      showToast("欢迎回来"); storage.setToken("mock"); storage.setUser({ email: "admin@lynli.me", nickname: "超管" });
      $("#login-view").hidden = true; $("#app-view").hidden = false; renderLayout(); location.hash = "#/dashboard";
    } else { showToast("账号或密码错误", "error"); }
  };
}
