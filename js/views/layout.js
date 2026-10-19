import { navGroups, routes } from "../router.js";

export function renderLayout() {
  const userInfo = JSON.parse(localStorage.getItem("lynli_user") || '{"name":"系统管理员","avatar":"管"}');
  const sidebarNav = navGroups.map(g => `
    <div class="nav-group">${g.group.toUpperCase()}</div>
    ${g.items.map(key => `<div class="nav-item" data-page="${key}">${routes[key].title}</div>`).join('')}
  `).join('');

  const avatarHtml = userInfo.avatar.startsWith('data:image') 
    ? `<img src="${userInfo.avatar}" style="width:100%; height:100%; object-fit:cover;">`
    : userInfo.avatar;

  return `
    <div class="overlay" id="overlay"></div>
    <div class="layout">
      <div class="sidebar" id="sidebar">
        <h2>LYNLI PRO</h2>
        ${sidebarNav}
      </div>
      <div class="main">
        <div class="topbar">
          <div class="topbar-left">
            <button class="menu-btn" id="menu-btn">☰</button>
            <span class="page-title" id="page-title">数据大盘</span>
          </div>
          <div class="topbar-right" style="display: flex; align-items: center; gap: 8px;">
            <button id="theme-btn" class="icon-btn" title="主题"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg></button>
            <button id="fullscreen-btn" class="icon-btn" title="全屏"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg></button>
            <button id="notice-btn" class="icon-btn" style="position:relative;" title="消息">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            </button>
            
            <div class="user-profile" id="user-profile" style="position: relative; display: flex; align-items: center; gap: 12px; cursor: pointer; margin-left: 12px; padding-left: 12px; border-left: 1px solid var(--border-light);">
              <div class="avatar" style="width:32px; height:32px; background:var(--brand-primary); border-radius:50%; display:grid; place-items:center; color:#fff; font-weight:600; font-size:13px; overflow:hidden;">
                ${avatarHtml}
              </div>
              <span style="font-size:14px; font-weight:600; color:var(--text-main);" class="hide-mobile">${userInfo.name}</span>
              
              <div class="dropdown" id="dropdown-menu" style="position:absolute; top:48px; right:0; background:#fff; border:1px solid var(--border-light); border-radius:12px; width:160px; box-shadow:var(--shadow-lg); display:none; overflow:hidden;">
                <div class="dropdown-item" id="profile-btn" style="padding:12px 16px; font-size:14px; cursor:pointer;">个人中心</div>
                <div class="dropdown-item danger" id="logout-btn" style="padding:12px 16px; font-size:14px; cursor:pointer; color:#ef4444; border-top:1px solid var(--border-light);">退出登录</div>
              </div>
            </div>
          </div>
        </div>
        <div class="tabs-bar" id="tabs-bar">
          <div class="tab-item active" data-page="dashboard">数据大盘</div>
        </div>
        <div class="content" id="content"></div>
      </div>
    </div>
  `;
}
