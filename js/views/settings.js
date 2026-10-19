/* 系统设置 · 个人资料 */

export async function render(mount) {
  const user = JSON.parse(localStorage.getItem("lynli.user") || "{}");

  mount.innerHTML = `
    <div class="panel-grid">
      <section class="card">
        <div class="card__head">
          <h2>个人资料</h2>
        </div>
        <form id="profile-form" class="field" style="margin-top:20px;">
          <label class="field">
            <span class="field__label">头像</span>
            <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px;">
              <div class="user-chip__avatar" style="width:56px;height:56px;font-size:20px;">${(user.nickname||'A')[0]}</div>
              <button type="button" class="btn btn--outline btn--sm">上传新头像</button>
            </div>
          </label>
          <label class="field">
            <span class="field__label">昵称</span>
            <input class="field__input" type="text" value="${user.nickname || '未设置'}">
          </label>
          <label class="field">
            <span class="field__label">登录邮箱</span>
            <input class="field__input" type="email" value="${user.email || '未设置'}" disabled style="opacity:0.6;cursor:not-allowed;">
          </label>
          <button type="submit" class="btn btn--primary" style="margin-top:10px;">保存修改</button>
        </form>
      </section>

      <section class="card">
        <div class="card__head">
          <h2>安全设置</h2>
        </div>
        <form style="margin-top:20px;">
          <label class="field">
            <span class="field__label">当前密码</span>
            <input class="field__input" type="password" placeholder="输入当前密码">
          </label>
          <label class="field">
            <span class="field__label">新密码</span>
            <input class="field__input" type="password" placeholder="至少 8 位，含字母和数字">
          </label>
          <button type="submit" class="btn btn--outline" style="margin-top:10px;">更新密码</button>
        </form>
      </section>
    </div>
  `;

  mount.querySelector("#profile-form").addEventListener("submit", (e) => {
    e.preventDefault();
    alert("资料保存成功（模拟）");
  });
}
