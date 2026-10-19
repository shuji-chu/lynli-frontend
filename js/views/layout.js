import { navGroups, routes } from "../router.js";

export function renderLayout() {
  // 获取本地保存的用户信息
  const userInfo = JSON.parse(localStorage.getItem("lynli_user") || '{"name":"系统管理员","avatar":"管"}');

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
            <span class="page-title" id="page-title">数据大盘</span>
          </div>
          
          <div class="topbar-right" style="display: flex; align-items: center; gap: 15px;">
            <!-- 全屏按钮 -->
            <button id="fullscreen-btn" style="background:none; border:none; color:var(--dim); font-size: 18px; cursor:pointer;" title="全屏">⛶</button>
            <!-- 消息通知 -->
            <div style="position:relative; cursor:pointer;" title="消息">
              <span style="color:var(--dim); font-size: 18px;">🔔</span>
              <span style="position:absolute; top:-2px; right:-5px; background:#f87171; color:#fff; font-size:10px; border-radius:50%; padding:1px 4px;">3</span>
            </div>
            
            <!-- 个人中心 -->
            <div class="user-profile" id="user-profile" style="position: relative; display: flex; align-items: center; gap: 10px; cursor: pointer;">
              <span style="font-size:13px; color:var(--dim);" class="hide-mobile">${userInfo.name}</span>
              <div class="avatar" id="header-avatar" style="width:36px; height:36px; background:linear-gradient(135deg,#3b82f6,#8b5cf6); border-radius:50%; display:grid; place-items:center; color:#fff; font-weight:bold; font-size:14px;">
                ${userInfo.avatar}
              </div>
              <div class="dropdown" id="dropdown-menu">
                <div class="dropdown-item" id="profile-btn">👤 个人中心</div>
                <div class="dropdown-item">⚙️ 偏好设置</div>
                <div class="dropdown-item danger" id="logout-btn">🚪 退出登录</div>
              </div>
            </div>
          </div>

        </div>
        <div class="content" id="content"></div>
      </div>
    </div>
  `;
}
