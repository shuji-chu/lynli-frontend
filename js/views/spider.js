export async function render(container) {
  container.innerHTML = `
    <div class="card" style="margin-bottom: 20px;">
      <h3 style="margin-bottom: 15px;">🤖 AI 智能采集与选品池</h3>
      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        <input type="text" placeholder="粘贴 1688 / 淘宝 商品链接..." style="flex: 1; min-width: 250px; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid var(--line); border-radius: 8px; color: #fff;">
        <button class="btn" style="width: auto; padding: 12px 24px; margin: 0;" onclick="alert('触发后端采集任务')">开始解析采集</button>
      </div>
    </div>
    <div class="kpi-grid" style="grid-template-columns: 1fr;">
      <div class="card" style="display: flex; gap: 20px; flex-wrap: wrap;">
        <div style="width: 120px; height: 120px; background: #2a3441; border-radius: 8px; display: grid; place-items: center; color: var(--dim);">商品主图</div>
        <div style="flex: 1; min-width: 200px;">
          <h3 style="margin-bottom: 10px;">法式复古碎花连衣裙</h3>
          <p style="color: var(--dim); font-size: 14px; margin-bottom: 10px;">来源：1688 | 采购价: ¥45.00</p>
          <div style="display: flex; gap: 10px;">
            <button class="btn" style="width: auto; padding: 8px 16px; margin: 0;">一键上架</button>
            <button class="btn" style="width: auto; padding: 8px 16px; margin: 0; background: var(--sur); border: 1px solid var(--line);">丢弃</button>
          </div>
        </div>
      </div>
    </div>
  `;
}
