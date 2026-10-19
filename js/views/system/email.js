import { toast } from "../../components/ui/toast.js";
import { modal } from "../../components/ui/modal.js";

export async function render(m) {
  m.innerHTML = `
    <div class="card">
      <div class="tabs-header" style="display:flex;gap:24px;border-bottom:1px solid var(--line);margin-bottom:20px;">
        <div class="tab-item active" data-target="tab-logs" style="padding:10px 0;cursor:pointer;color:var(--pri);border-bottom:2px solid var(--pri);font-weight:bold;">发送记录</div>
        <div class="tab-item" data-target="tab-templates" style="padding:10px 0;cursor:pointer;color:var(--dim);">邮件模板</div>
        <div class="tab-item" data-target="tab-config" style="padding:10px 0;cursor:pointer;color:var(--dim);">通道配置</div>
      </div>

      <!-- 1. 发送记录 -->
      <div id="tab-logs" class="tab-pane" style="display:block;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h2>邮件发送日志</h2>
          <button class="btn btn-primary" id="send-btn">+ 发送新邮件</button>
        </div>
        <table class="table">
          <thead><tr><th>收件人</th><th>邮件主题</th><th>状态</th><th>发送时间</th></tr></thead>
          <tbody>
            <tr><td>buyer1@qq.com</td><td>【LYNLI】您的订单已发货</td><td><span style="color:#34d399;">已送达</span></td><td>2023-10-19 14:30</td></tr>
            <tr><td>buyer2@163.com</td><td>【LYNLI】您的订单已发货</td><td><span style="color:#34d399;">已送达</span></td><td>2023-10-19 13:20</td></tr>
            <tr><td>invalid@test.com</td><td>【LYNLI】退款成功通知</td><td><span style="color:#f87171;">发送失败</span></td><td>2023-10-19 10:15</td></tr>
          </tbody>
        </table>
      </div>

      <!-- 2. 邮件模板 -->
      <div id="tab-templates" class="tab-pane" style="display:none;">
        <h2>系统通知模板</h2>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:20px;">
          <div style="border:1px solid var(--line);padding:16px;border-radius:8px;background:rgba(255,255,255,0.02);">
            <h3 style="margin-bottom:8px;">订单发货通知</h3>
            <p style="font-size:12px;color:var(--dim);">当录入快递单号后，自动触发此模板发送给买家。</p>
            <button class="btn btn-sm" style="margin-top:12px;border:1px solid var(--line);background:none;color:var(--text);" onclick="alert('进入模板编辑器')">编辑内容</button>
          </div>
          <div style="border:1px solid var(--line);padding:16px;border-radius:8px;background:rgba(255,255,255,0.02);">
            <h3 style="margin-bottom:8px;">退款成功通知</h3>
            <p style="font-size:12px;color:var(--dim);">售后工单同意退款后，自动发送。</p>
            <button class="btn btn-sm" style="margin-top:12px;border:1px solid var(--line);background:none;color:var(--text);" onclick="alert('进入模板编辑器')">编辑内容</button>
          </div>
        </div>
      </div>

      <!-- 3. 通道配置 -->
      <div id="tab-config" class="tab-pane" style="display:none;">
        <h2>发件通道配置</h2>
        <div class="card" style="margin-top:20px;max-width:500px;border:1px solid var(--line);">
          <div style="margin-bottom:16px;">
            <label style="font-size:12px;color:var(--dim);">服务商</label>
            <select class="input" style="margin-top:4px;"><option>Resend API (官方推荐)</option><option>阿里云邮件推送</option><option>SMTP 自建</option></select>
          </div>
          <div style="margin-bottom:16px;">
            <label style="font-size:12px;color:var(--dim);">API Key</label>
            <input class="input" type="password" value="re_xxxxxxxxx_12345" style="margin-top:4px;">
            <p style="font-size:11px;color:var(--text-faint);margin-top:4px;">* 请前往 Resend 后台获取并绑定 lynli.me 域名。</p>
          </div>
          <div style="margin-bottom:16px;">
            <label style="font-size:12px;color:var(--dim);">发件人邮箱</label>
            <input class="input" value="onboarding@resend.dev" style="margin-top:4px;">
          </div>
          <button class="btn btn-primary" id="save-config">保存配置</button>
        </div>
      </div>
    </div>
  `;

  // Tabs 切换逻辑
  const tabs = m.querySelectorAll(".tab-item");
  const panes = m.querySelectorAll(".tab-pane");
  tabs.forEach(tab => {
    tab.onclick = () => {
      tabs.forEach(t => { t.style.color = "var(--dim)"; t.style.borderBottom = "none"; t.style.fontWeight = "normal"; });
      panes.forEach(p => p.style.display = "none");
      
      tab.style.color = "var(--pri)"; tab.style.borderBottom = "2px solid var(--pri)"; tab.style.fontWeight = "bold";
      m.querySelector("#" + tab.dataset.target).style.display = "block";
    };
  });

  // 发送邮件弹窗
  m.querySelector("#send-btn").onclick = () => {
    modal({
      title: "发送新邮件",
      content: `
        <div style="margin-bottom:12px;"><label style="font-size:12px;color:var(--dim);">收件人</label><input class="input" id="to-email" placeholder="例如：user@example.com" style="margin-top:4px;"></div>
        <div style="margin-bottom:12px;"><label style="font-size:12px;color:var(--dim);">主题</label><input class="input" id="email-sub" placeholder="邮件主题" style="margin-top:4px;"></div>
        <div style="margin-bottom:12px;"><label style="font-size:12px;color:var(--dim);">内容 (支持 HTML)</label><textarea class="input" id="email-body" rows="4" placeholder="输入邮件内容..." style="margin-top:4px;resize:vertical;"></textarea></div>
      `,
      onConfirm: () => {
        const to = document.querySelector("#to-email").value;
        if(!to) { toast("收件人不能为空", "error"); return false; }
        toast("邮件已进入发送队列", "success");
        return true;
      }
    });
  };

  // 保存通道配置
  m.querySelector("#save-config").onclick = () => {
    toast("邮件通道配置已保存生效", "success");
  };
}
