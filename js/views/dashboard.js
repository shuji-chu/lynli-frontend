export async function render(container) {
  container.innerHTML = `
    <div class="kpi-grid">
      <div class="card"><div class="kpi-label">今日营收</div><div class="kpi-val" style="color:#3b82f6;">¥ 124,500</div></div>
      <div class="card"><div class="kpi-label">今日订单</div><div class="kpi-val">342</div></div>
      <div class="card"><div class="kpi-label">待发货</div><div class="kpi-val" style="color:#f87171;">56</div></div>
      <div class="card"><div class="kpi-label">在售商品</div><div class="kpi-val">1280</div></div>
    </div>
    
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; margin-bottom: 20px;">
      <!-- 待办事项卡片 -->
      <div class="card">
        <h3 style="margin-bottom: 15px; border-bottom: 1px solid var(--line); padding-bottom: 10px;">📌 待办事项</h3>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div style="display: flex; justify-content: space-between; font-size: 14px;">
            <span style="color:var(--text);">待处理售后工单</span>
            <span class="badge badge-danger">3 笔</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 14px;">
            <span style="color:var(--text);">库存预警商品</span>
            <span class="badge badge-warning">12 件</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 14px;">
            <span style="color:var(--text);">待付款采购单</span>
            <span class="badge badge-info">5 单</span>
          </div>
        </div>
      </div>

      <!-- 快捷入口卡片 -->
      <div class="card">
        <h3 style="margin-bottom: 15px; border-bottom: 1px solid var(--line); padding-bottom: 10px;">⚡ 快捷操作</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <button class="btn" style="background: rgba(59,130,246,0.1); color: var(--pri); border: 1px solid rgba(59,130,246,0.3); margin:0;">发布新商品</button>
          <button class="btn" style="background: rgba(16,185,129,0.1); color: #10b981; border: 1px solid rgba(16,185,129,0.3); margin:0;">生成对账单</button>
          <button class="btn" style="background: rgba(139,92,246,0.1); color: #8b5cf6; border: 1px solid rgba(139,92,246,0.3); margin:0;">AI 抓取选品</button>
          <button class="btn" style="background: rgba(245,158,11,0.1); color: #f59e0b; border: 1px solid rgba(245,158,11,0.3); margin:0;">一键同步库存</button>
        </div>
      </div>
    </div>

    <div class="card">
      <h3 style="margin-bottom: 5px;">近 7 日营收趋势</h3>
      <div class="css-chart">
        <div class="chart-bar" style="height: 40%;"><span>4.2k</span></div>
        <div class="chart-bar" style="height: 60%;"><span>6.1k</span></div>
        <div class="chart-bar" style="height: 35%;"><span>3.8k</span></div>
        <div class="chart-bar" style="height: 80%;"><span>8.5k</span></div>
        <div class="chart-bar" style="height: 55%;"><span>5.9k</span></div>
        <div class="chart-bar" style="height: 90%;"><span>9.2k</span></div>
        <div class="chart-bar" style="height: 70%;"><span>7.4k</span></div>
      </div>
    </div>
  `;
}
