import { api } from "./api.js";
import { routes } from "./router.js";
import { renderLayout } from "./views/layout.js";
import * as DashboardView from "./views/dashboard.js";
import * as OrdersView from "./views/orders.js";
import * as ProductsView from "./views/products.js";
import * as SpiderView from "./views/spider.js";
import * as FinanceView from "./views/finance.js";
import * as PurchasesView from "./views/purchases.js";

const app = document.getElementById("app");

document.addEventListener('click', () => {
  document.getElementById('dropdown-menu')?.classList.remove('show');
});

// 注册所有视图
routes.dashboard.render = DashboardView.render;
routes.orders.render = OrdersView.render;
routes.products.render = ProductsView.render;
routes.spider.render = SpiderView.render;
routes.finance.render = FinanceView.render;
routes.purchases.render = PurchasesView.render;

function renderLogin() {
  app.innerHTML = `
    <div class="login-view">
      <div class="login-box">
        <h1>LYNLI</h1>
        <p>大厂级无货源管理后台</p>
        <form id="login-form">
          <div class="field"><label>账号</label><input type="text" name="account" value="admin" required></div>
          <div class="field"><label>密码</label><input type="password" name="password" value="123456" required></div>
          <button type="submit" class="btn" id="login-btn">进入控制台</button>
        </form>
      </div>
    </div>
  `;
  document.getElementById('login-form').onsubmit = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('login-btn');
    btn.textContent = "认证中...";
    try {
      const res = await api.post("/auth/login", {
        account: e.target.account.value,
        password: e.target.password.value
      });
      if (res.code === 200) {
        renderApp();
      } else {
        alert("失败: " + res.message);
      }
    } catch (err) { 
      // 演示模式：如果后端没通，也强制登录进去看界面
      renderApp();
    } 
    finally { btn.textContent = "进入控制台"; }
  };
}

function renderApp() {
  app.innerHTML = renderLayout();
  
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  document.getElementById('menu-btn').onclick = () => {
    sidebar.classList.add('open'); overlay.classList.add('show');
  };
  overlay.onclick = () => {
    sidebar.classList.remove('open'); overlay.classList.remove('show');
  };

  const profile = document.getElementById('user-profile');
  const dropdown = document.getElementById('dropdown-menu');
  profile.onclick = (e) => { e.stopPropagation(); dropdown.classList.toggle('show'); };

  document.getElementById('logout-btn').onclick = renderLogin;

  document.querySelectorAll('.nav-item').forEach(el => {
    el.onclick = () => {
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      el.classList.add('active');
      
      const page = el.dataset.page;
      document.getElementById('page-title').textContent = routes[page].title;
      
      if (window.innerWidth <= 768) {
        sidebar.classList.remove('open'); overlay.classList.remove('show');
      }
      
      if (routes[page].render) {
        routes[page].render(document.getElementById('content'));
      } else {
        document.getElementById('content').innerHTML = `
          <div class="card" style="text-align:center;padding:50px 20px;">
            <h3>${routes[page].title}</h3><p style="color:var(--dim);margin-top:10px;">模块接入中</p>
          </div>`;
      }
    };
  });

  document.querySelector('.nav-item[data-page="dashboard"]').click();
}

renderLogin();
