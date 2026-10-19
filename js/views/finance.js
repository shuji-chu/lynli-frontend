export async function render(mount) {
  mount.innerHTML = `
    <div class="kpi-grid" style="grid-template-columns:repeat(3, 1fr);">
      <article class="card kpi"><div class="kpi__label">本月总营收</div><div class="kpi__value">¥ 348,200</div></article>
      <article class="card kpi"><div class="kpi__label">本月总成本 (1688)</div><div class="kpi__value" style="color:#f87171;">¥ 124,500</div></article>
      <article class="card kpi"><div class="kpi__label">本月毛利润</div><div class="kpi__value" style="color:#34d399;">¥ 223,700</div></article>
    </div>
    <div class="card" style="margin-top:20px;">
      <div class="card__head"><h2>每日财务明细</h2><button class="btn btn--outline btn--sm">导出 Excel</button></div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>日期</th><th>订单量</th><th>营收总额</th><th>采购支出</th><th>净利润</th></tr></thead>
          <tbody>
            <tr><td>2023-10-19</td><td>86</td><td>¥ 12,480</td><td>¥ 4,120</td><td style="color:#34d399;">¥ 8,360</td></tr>
            <tr><td>2023-10-18</td><td>92</td><td>¥ 14,200</td><td>¥ 4,900</td><td style="color:#34d399;">¥ 9,300</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}
