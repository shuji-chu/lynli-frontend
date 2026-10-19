import { api } from "./api.js";
import * as dashboard from "./views/dashboard.js";
import * as orders from "./views/orders.js";

const routes = {
  dashboard: { title: "数据看板", view: dashboard },
  orders: { title: "全部订单", view: orders }
};

// 1. 登录逻辑
document.getElementById("login-form").onsubmit = async (e) => {
  e.preventDefault();
  const btn = document.getElementById("login-btn");
  btn.textContent = "认证中...";
  try {
    const res = await api.post("/auth/login", {
      account: e.target.account.value,
      password: e.target.password.value
    });
    if (res.code === 200) {
      document.getElementById("login-view").hidden = true;
      document.getElementById("app-view").hidden = false;
      initApp();
    } else {
      alert("登录失败: " + res.message);
    }
  } catch (err) {
    alert("网络异常");
  } finally {
    btn.textContent = "进入控制台";
  }
};

// 2. 初始化侧边栏与路由
function initApp() {
  const nav = document.getElementById("nav-menu");
  nav.innerHTML = Object.keys(routes).map(key => 
    `<div class="nav-item" data-route="${key}">${routes[key].title}</div>`
  ).join("");

  nav.onclick = (e) => {
    if (!e.target.classList.contains("nav-item")) return;
    const route = e.target.dataset.route;
    document.querySelectorAll(".nav-item").forEach(el => el.classList.remove("active"));
    e.target.classList.add("active");
    document.getElementById("page-title").textContent = routes[route].title;
    routes[route].view.render(document.getElementById("content"));
  };

  // 默认加载看板
  document.querySelector('.nav-item[data-route="dashboard"]').click();
}
