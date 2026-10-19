export async function render(mount) {
  mount.innerHTML = `
    <div class="kpi-grid">
      <article class="card kpi"><div class="kpi__label">今日营收</div><div class="kpi__value">¥ 12,480</div></article>
      <article class="card kpi"><div class="kpi__label">今日订单</div><div class="kpi__value">86</div></article>
    </div>
  `;
}
