export async function render(container) {
  container.innerHTML = `
    <div class="card">
      <div class="tabs-bar" style="background: transparent; border-bottom: 1px solid var(--line); margin-bottom: 20px;">
        <div class="tab-item active" style="background: transparent; color: var(--pri);">基础设置</div>
        <div class="tab-item" style="background: transparent;">支付接口</div>
        <div class="tab-item" style="background: transparent;">物流接口</div>
      </div>
      
      <div style="max-width: 600px;">
        <div class="field"><label>系统名称</label><input type="text" value="LYNLI PRO 智能系统"></div>
        <div class="field"><label>网站域名</label><input type="text" value="https://select.lynli.me"></div>
        <div class="field"><label>客服电话</label><input type="text" value="400-888-8888"></div>
        <div class="field"><label>底部版权信息</label><input type="text" value="© 2024 LYNLI 版权所有"></div>
        <button class="btn" style="width: auto; padding: 10px 30px; margin-top: 10px;">保存基础设置</button>
      </div>
    </div>
  `;
}
