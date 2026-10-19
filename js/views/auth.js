import { $ } from "../core/utils.js";
import { renderLayout } from "../components/ui/layout.js";
import { ROUTES } from "../router/routes.js";
import { nav } from "../router/index.js";
import { toast } from "../components/ui/toast.js";

export function initAuth() {
  const form = $("#login-form");
  if (!form) return;

  form.onsubmit = async (e) => {
    e.preventDefault();
    const account = form.querySelector('input[name="account"]').value;
    const password = form.querySelector('input[name="password"]').value;
    const btn = form.querySelector('button[type="submit"]');

    btn.disabled = true;
    btn.textContent = "正在认证...";

    try {
      const res = await fetch("https://spider.lynli.me/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account, password })
      });
      const data = await res.json();

      if (data.code === 200) {
        localStorage.setItem("lynli_token", data.token);
        
        // 隐藏登录页，显示主界面
        $("#login-view").style.display = "none"; 
        $("#app-view").hidden = false;
        
        // 渲染左侧菜单（使用的是正规名字）
        renderLayout(ROUTES, data.user);
        
        // 跳转并渲染看板
        location.hash = "#/dashboard";
        nav("dashboard");
        toast("欢迎回来，系统管理员", "success");
      } else {
        alert("登录失败：" + data.message);
      }
    } catch (err) {
      alert("网络异常：" + err.message);
    } finally {
      btn.disabled = false;
      btn.textContent = "进入控制台";
    }
  };
}
