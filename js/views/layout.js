import { navGroups, routes } from "../router.js";

export function renderLayout() {
  const sidebarNav = navGroups.map(g => `
    <div class="nav-group">${g.group}</div>
    ${g.items.map(key => `<div class="nav-item" data-page="${key}">${routes[key].title}</div>`).join('')}
  `).join('');

  return `
    <div class="overlay" id="overlay"></div>
    <div class="layout">
      <div class="sidebar" id="sidebar">
        <h2>LYNLI</h2>
        ${sidebarNav}
      </div>
      <div class="main">
        <div class="topbar">
          <div class="topbar-left">
            <button class="menu-btn" id="menu-btn">☰</button>
            <span class="page-title" id="page-title">数据看板</span>
          </div>
          <div class="user-profile" id="user-profile">
            <span style="font-size:13px; color:var(--dim);" class="hide-mobile">系统管理员</span>
            <div class="avatar">管</div>
            <div class="dropdown" id="dropdown-menu">
              <div class="dropdown-item">个人中心</div>
              <div class="dropdown-item danger" id="logout-btn">退出登录</div>
            </div>
          </div>
        </div>
        <div class="content" id="content"></div>
      </div>
    </div>
  `;
}
