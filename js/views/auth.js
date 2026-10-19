import { $ } from "../core/utils.js";
import { renderLayout } from "../components/ui/layout.js";
import { ROUTES } from "../router/routes.js";
import { toast } from "../components/ui/toast.js";

export function initAuth() {
  $("#login-form").onsubmit = async (e) => {
    e.preventDefault();
    const account = e.target.account.value;
    const password = e.target.password.value;

    try {
      const res = await fetch("https://spider.lynli.me/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account, password })
      });
      const data = await res.json();

      if (data.code === 200) {
        localStorage.setItem("lynli_token", data.token);
        $("#login-view").hidden = true; 
        $("#app-view").hidden = false;
        renderLayout(ROUTES, data.user);
        location.hash = "#/dashboard";
        toast("登录成功", "success");
      } else {
        toast(data.message, "error");
      }
    } catch (err) {
      toast("网络请求失败，请检查后端", "error");
    }
  };
}
