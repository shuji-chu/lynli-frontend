document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  
  if (!loginForm) {
    alert("严重错误：找不到登录表单！");
    return;
  }

  loginForm.onsubmit = async (e) => {
    e.preventDefault(); // 阻止页面刷新
    
    const account = loginForm.querySelector('input[name="account"]').value;
    const password = loginForm.querySelector('input[name="password"]').value;
    const btn = loginForm.querySelector('button');

    btn.textContent = "登录中...";
    btn.disabled = true;

    try {
      const res = await fetch("https://spider.lynli.me/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account, password })
      });
      
      const data = await res.json();
      
      if (data.code === 200) {
        alert("登录成功！准备进入后台...");
        document.getElementById("login-view").style.display = "none";
        document.getElementById("app-view").hidden = false;
        
        // 临时写死一个后台界面，证明登录通了
        document.getElementById("nav").innerHTML = `
          <button class="nav-item active">数据看板</button>
          <button class="nav-item">订单管理</button>
          <button class="nav-item">商品库</button>
        `;
        document.getElementById("content").innerHTML = `
          <div class="card" style="margin-top:20px;">
            <h2>欢迎回来，最高指挥官！</h2>
            <p style="color:var(--text-dim); margin-top:10px;">系统已成功连接阿里云后端数据库。</p>
          </div>
        `;
      } else {
        alert("登录失败：" + (data.message || "账号或密码错误"));
      }
    } catch (err) {
      alert("网络请求失败，请检查服务器：" + err.message);
    } finally {
      btn.textContent = "进入控制台";
      btn.disabled = false;
    }
  };
});
