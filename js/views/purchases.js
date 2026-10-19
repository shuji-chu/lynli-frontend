export async function render(container) {
  container.innerHTML = `
    <div class="kpi-grid">
      <div class="card"><div class="kpi-label">待付款采购</div><div class="kpi-val" style="color:#f87171;">12</div></div>
      <div class="card"><div class="kpi-label">待发货代发</div><div class="kpi-val" style="color:#eab308;">45</div></div>
      <div class="card"><div class="kpi-label">今日代发完成</div><div class="kpi-val" style="color:#10b981;">128</div></div>
    </div>
    <div class="card" style="overflow-x:auto;">
      <table class="table">
        <thead><tr><th>采购单号</th><th>供应商</th><th>商品数</th><th>总金额</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>
          <tr><td>CG20231024001</td><td>广州服饰工厂</td><td>50</td><td>¥1,250.00</td><td><span style="color:#f87171;">待付款</span></td><td><button class="btn" style="width:auto;padding:4px 8px;font-size:12px;margin:0;">去付款</button></td></tr>
          <tr><td>CG20231024002</td><td>义乌小商品城</td><td>100</td><td>¥890.00</td><td><span style="color:#eab308;">代发中</span></td><td><button class="btn" style="width:auto;padding:4px 8px;font-size:12px;margin:0;background:var(--sur);">查看物流</button></td></tr>
        </tbody>
      </table>
    </div>
  `;
}
