import { navGroups, routes } from "../router.js";

export function renderLayout() {
  const userInfo = JSON.parse(localStorage.getItem("lynli_user") || '{"name":"系统管理员","avatar":"管"}');
  const sidebarNav = navGroups.map(g => `
    <div class="nav-group">${g.group}</div>
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
      <div class="main" style="display: flex; flex-direction: column; height: 100vh;">
        <div class="topbar">
          <div class="topbar-left">
            <button class="menu-btn" id="menu-btn" style="display:flex; color:var(--text);"><svg class="icon" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg></button>
            <span class="page-title" id="page-title">数据大盘</span>
          </div>
          <div class="topbar-right" style="display: flex; align-items: center; gap: 10px;">
            <button id="theme-btn" class="icon-btn" title="切换主题"><svg class="icon" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg></button>
            <button id="fullscreen-btn" class="icon-btn" title="全屏"><svg class="icon" viewBox="0 0 24 24"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg></button>
            
            <button id="notice-btn" class="icon-btn" style="position:relative;" title="消息通知">
              <svg class="icon" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              <span style="position:absolute; top:0; right:0; background:#f87171; width:8px; height:8px; border-radius:50%;"></span>
            </button>
            
            <div class="user-profile" id="user-profile" style="position: relative; display: flex; align-items: center; gap: 10px; cursor: pointer; margin-left:8px;">
              <span style="font-size:13px; color:var(--dim);" class="hide-mobile">${userInfo.name}</span>
              <div class="avatar" style="width:36px; height:36px; background:linear-gradient(135deg,#3b82f6,#8b5cf6); border-radius:50%; display:grid; place-items:center; color:#fff; font-weight:bold; font-size:14px; overflow:hidden;">
                ${avatarHtml}
              </div>
              <div class="dropdown" id="dropdown-menu">
                <div class="dropdown-item" id="profile-btn">个人中心</div>
                <div class="dropdown-item danger" id="logout-btn">退出登录</div>
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
