import { modal } from "../../components/ui/modal.js";
import { toast } from "../../components/ui/toast.js";

export async function render(m) {
  const users = [
    { name: "最高指挥官", email: "admin@lynli.me", role: "超级管理员", status: "正常" },
    { name: "运营专员", email: "op@lynli.me", role: "运营", status: "正常" },
    { name: "客服一号", email: "cs1@lynli.me", role: "客服", status: "已禁用" }
  ];

  m.innerHTML = `
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <h2>系统成员与权限</h2>
        <button class="btn btn-primary" id="add-btn">+ 新增成员</button>
      </div>
      <table class="table">
        <thead><tr><th>成员</th><th>邮箱</th><th>角色</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>
          ${users.map(u => `
            <tr>
              <td><strong>${u.name}</strong></td>
              <td>${u.email}</td>
              <td><span style="padding:2px 8px;background:rgba(59,130,246,0.1);color:#3b82f6;border-radius:4px;font-size:12px;">${u.role}</span></td>
              <td><span style="color:${u.status === '正常' ? '#34d399' : '#f87171'};">${u.status}</span></td>
              <td><button class="btn btn-sm" style="border:1px solid var(--line);background:none;color:var(--text);">编辑</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  m.querySelector("#add-btn").onclick = () => {
    modal({
      title: "新增系统成员",
      content: `
        <div style="margin-bottom:12px;"><label style="font-size:12px;color:var(--dim);">姓名</label><input class="input" id="uname" placeholder="姓名" style="margin-top:4px;"></div>
        <div style="margin-bottom:12px;"><label style="font-size:12px;color:var(--dim);">邮箱</label><input class="input" id="uemail" placeholder="邮箱" style="margin-top:4px;"></div>
        <div style="margin-bottom:12px;"><label style="font-size:12px;color:var(--dim);">角色</label><select class="input" id="urole" style="margin-top:4px;"><option>运营</option><option>客服</option></select></div>
      `,
      onConfirm: () => {
        toast("成员创建成功，已发送邮件通知", "success");
        return true;
      }
    });
  };
}
