export async function render(container) {
  container.innerHTML = `
    <div class="kpi-grid">
      <div class="card"><div class="kpi-label">总营业额</div><div class="kpi-val" style="color:#3b82f6;">¥ 124,560.00</div></div>
      <div class="card"><div class="kpi-label">总支出（采购+运费）</div><div class="kpi-val" style="color:#f87171;">¥ 45,230.00</div></div>
      <div class="card"><div class="kpi-label">账户总利润</div><div class="kpi-val" style="color:#10b981;">¥ 79,330.00</div></div>
    </div>
    <div class="card" style="overflow-x:auto;">
      <table class="table">
        <thead><tr><th>时间</th><th>类型</th><th>金额</th><th>备注</th></tr></thead>
        <tbody>
          <tr><td>2023-10-24 10:20</td><td>订单收入</td><td style="color:#10b981;">+ ¥ 258.00</td><td>订单 #99201 结算</td></tr>
          <tr><td>2023-10-24 09:15</td><td>采购支出</td><td style="color:#f87171;">- ¥ 890.00</td><td>采购单 CG20231024002 付款</td></tr>
        </tbody>
      </table>
    </div>
  `;
}
