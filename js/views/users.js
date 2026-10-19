import { showModal } from "../components/modal.js";
import { showToast } from "../components/toast.js";

export async function render(mount) {
  mount.innerHTML = `
    <div class="card">
      <div class="card__head">
        <h2>账号与权限</h2>
        <button class="btn btn--primary btn--sm" style="width:auto;" id="create-btn">+ 创建账号</button>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>成员</th><th>邮箱</th><th>角色</th><th>状态</th><th>操作</th></tr></thead>
          <tbody>
            <tr><td>最高指挥官</td><td>admin@lynli.me</td><td><span class="role-badge">超级管理员</span></td><td><span class="status-tag is-ok">正常</span></td><td><button class="btn btn--outline btn--sm">编辑</button></td></tr>
            <tr><td>运营专员</td><td>yunying@lynli.me</td><td><span class="role-badge" style="background:rgba(59,130,246,0.15);color:#60a5fa;border-color:rgba(59,130,246,0.3);">运营</span></td><td><span class="status-tag is-ok">正常</span></td><td><button class="btn btn--outline btn--sm">编辑</button></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  mount.querySelector("#create-btn").addEventListener("click", () => {
    showModal({
      title: "创建系统账号",
      content: `
        <label class="field"><span class="field__label">邮箱</span><input type="email" class="field__input" placeholder="name@lynli.me"></label>
        <label class="field"><span class="field__label">初始密码</span><input type="password" class="field__input" placeholder="至少 8 位"></label>
        <label class="field"><span class="field__label">分配角色</span>
          <select class="field__input"><option>运营专员</option><option>客服</option></select>
        </label>
      `,
      onConfirm: () => showToast("账号创建成功，已发送邮件通知", "success")
    });
  });
}
