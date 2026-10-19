import { toast } from "../../components/ui/toast.js";
import { modal } from "../../components/ui/modal.js";

export async function render(m) {
  const res = await fetch("https://spider.lynli.me/api/emails");
  const json = await res.json();

  m.innerHTML = `
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <h2>邮件发送日志</h2>
        <button class="btn btn-primary" id="send-btn">+ 发送新邮件</button>
      </div>
      <table class="table">
        <thead><tr><th>收件人</th><th>邮件主题</th><th>状态</th><th>发送时间</th></tr></thead>
        <tbody>
          ${json.data.map(e => `
            <tr><td>${e.to_email}</td><td>${e.subject}</td>
            <td><span style="color:#34d399;">${e.status}</span></td><td>${e.created_at}</td></tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  m.querySelector("#send-btn").onclick = () => {
    modal({
      title: "发送邮件",
      content: `
        <div style="margin-bottom:12px;"><label>收件人</label><input class="input" id="to-email"></div>
        <div style="margin-bottom:12px;"><label>主题</label><input class="input" id="email-sub"></div>
      `,
      onConfirm: async () => {
        const to = document.querySelector("#to-email").value;
        if(!to) { toast("收件人不能为空", "error"); return false; }
        await fetch("https://spider.lynli.me/api/emails/send", {
          method: "POST", headers: {"Content-Type": "application/json"},
          body: JSON.stringify({ to, subject: document.querySelector("#email-sub").value })
        });
        toast("邮件已发送"); render(m); return true;
      }
    });
  };
}
