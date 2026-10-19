/* 账号管理 · 员工与权限 */

const MOCK_USERS = [
  { id: 1, name: "最高指挥官", email: "admin@lynli.me", role: "super_admin", status: "active", last_login: "2023-10-19 15:30" },
  { id: 2, name: "运营专员", email: "yunying@lynli.me", role: "operator", status: "active", last_login: "2023-10-19 14:10" },
  { id: 3, name: "客服一号", email: "kefu1@lynli.me", role: "support", status: "active", last_login: "2023-10-18 09:20" },
  { id: 4, name: "外包客服", email: "waibao@lynli.me", role: "support", status: "disabled", last_login: "2023-10-01 10:00" },
];

const ROLE_MAP = { super_admin: "超级管理员", operator: "运营", support: "客服" };

export async function render(mount) {
  mount.innerHTML = `
    <div class="card">
      <div class="card__head">
        <div>
          <h2>账号与权限</h2>
          <span style="font-size:12px;color:var(--text-faint);">管理后台系统成员，分配不同的操作权限</span>
        </div>
        <button class="btn btn--primary btn--sm" style="width:auto;" id="create-user-btn">+ 创建账号</button>
      </div>

      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>姓名 / 昵称</th>
              <th>登录邮箱</th>
              <th>系统角色</th>
              <th>状态</th>
              <th>最后登录</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody id="user-tbody">
            ${MOCK_USERS.map(u => `
              <tr>
                <td><strong>${u.name}</strong></td>
                <td>${u.email}</td>
                <td><span class="role-badge">${ROLE_MAP[u.role]}</span></td>
                <td>
                  <span class="status-tag ${u.status === 'active' ? 'is-ok' : 'is-danger'}">
                    ${u.status === 'active' ? '正常' : '已禁用'}
                  </span>
                </td>
                <td>${u.last_login}</td>
                <td>
                  <div class="btn-group">
                    <button class="btn btn--outline btn--sm">编辑</button>
                    <button class="btn btn--outline btn--sm" style="color:#f87171;border-color:rgba(248,113,113,0.3);">禁用</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  document.getElementById("create-user-btn").addEventListener("click", () => {
    alert("调起创建账号弹窗（待接入真实 API）");
  });
}
