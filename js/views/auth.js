import { $ } from "../core/utils.js";
import { renderLayout } from "../components/ui/layout.js";
import { ROUTES } from "../router/routes.js";
import { nav } from "../router/index.js";
import { toast } from "../components/ui/toast.js";

export function initAuth() {
  const form = $("#login-form");
  if (!form) return;

  form.onsubmit = async (e) => {
    e.preventDefault(); // 阻止表单默认刷新
    
    const accountInput = form.querySelector('input[name="account"]').value;
    const passwordInput = form.querySelector('input[name="password"]').value;
    const submitBtn = form.querySelector('button[type="submit"]');
    const btnLabel = submitBtn.querySelector('.btn__label');

    // 视觉反馈：变成登录中
    submitBtn.disabled = true;
    btnLabel.textContent = "登录中...";

    try {
      const res = await fetch("https://spider.lynli.me/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account: accountInput, password: passwordInput })
      });
      
      const data = await res.json();

      if (data.code === 200) {
        localStorage.setItem("lynli_token", data.token);
        $("#login-view").hidden = true; 
        $("#app-view").hidden = false;
        
        // 渲染侧边栏
        renderLayout(ROUTES, data.user);
        
        // 跳转到看板
        location.hash = "#/dashboard";
        nav("dashboard");
        toast("登录成功", "success");
      } else {
        alert("登录失败：" + (data.message || "账号或密码错误"));
      }
    } catch (err) {
      alert("网络异常：请检查后端服务器是否存活。\n" + err.message);
    } finally {
      // 恢复按钮状态
      submitBtn.disabled = false;
      btnLabel.textContent = "进入控制台";
    }
  };
}
