document.addEventListener("DOMContentLoaded", () => {
  // 1. 登录逻辑
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.onsubmit = async (e) => {
      e.preventDefault();
      const btn = loginForm.querySelector("button");
      btn.textContent = "登录中...";
      btn.disabled = true;

      try {
        const res = await fetch("https://spider.lynli.me/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            account: e.target.account.value,
            password: e.target.password.value
          })
        });
        const data = await res.json();

        if (data.code === 200) {
          document.getElementById("login-view").style.display = "none";
          document.getElementById("app-view").hidden = false;
          window.loadPage("dashboard"); // 默认加载看板
        } else {
          alert("登录失败: " + data.message);
        }
      } catch (err) {
        alert("网络异常");
      } finally {
        btn.textContent = "进入控制台";
        btn.disabled = false;
      }
    };
  }

  // 2. 路由切换逻辑
  window.loadPage = async (route) => {
    const content = document.getElementById("content");
    content.innerHTML = '<div class="card"><h2>数据加载中...</h2></div>';
    
    // 菜单高亮
    document.querySelectorAll(".nav-item").forEach(el => {
      el.classList.toggle("active", el.dataset.route === route);
    });
    
    const titleMap = { dashboard: "数据看板", orders: "全部订单", purchase: "采购与代发", products: "商品库", spider: "AI选品矩阵" };
    document.getElementById("page-title").textContent = titleMap[route] || "系统";

    try {
      if (route === "dashboard") {
        const res = await fetch("https://spider.lynli.me/api/dashboard");
        const { data } = await res.json();
        content.innerHTML = `
          <div class="kpi-grid">
            <div class="card kpi"><div class="kpi__label">今日营收</div><div class="kpi__value" style="color:#3b82f6;">¥ ${data.revenue.toFixed(2)}</div></div>
            <div class="card kpi"><div class="kpi__label">今日订单</div><div class="kpi__value">${data.orders_today}</div></div>
            <div class="card kpi"><div class="kpi__label">待发货</div><div class="kpi__value" style="color:#f87171;">${data.pending_ship}</div></div>
            <div class="card kpi"><div class="kpi__label">在售商品</div><div class="kpi__value">${data.total_prod}</div></div>
          </div>
          <div class="card"><h2>欢迎回来，系统管理员！</h2></div>
        `;
      } else if (route === "orders") {
        const res = await fetch("https://spider.lynli.me/api/orders");
        const { data } = await res.json();
        content.innerHTML = `
          <div class="card">
            <table class="table">
              <thead><tr><th>订单号</th><th>买家</th><th>金额</th><th>状态</th></tr></thead>
              <tbody>${data.map(o => `<tr><td>${o.id}</td><td>${o.buyer}</td><td>¥${o.amount}</td><td>${o.status}</td></tr>`).join('')}</tbody>
            </table>
          </div>
        `;
      } else {
        content.innerHTML = `<div class="card"><h2>该模块已接通真实数据库，正在开发中。</h2></div>`;
      }
    } catch (err) {
      content.innerHTML = `<div class="card"><h2 style="color:red;">数据加载失败</h2></div>`;
    }
  };

  // 3. 绑定侧边栏点击
  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.onclick = () => window.loadPage(btn.dataset.route);
  });
});
