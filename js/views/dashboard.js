export async function render(mount) {
  mount.innerHTML = `
    <div class="kpi-grid">
      <article class="card kpi"><div class="kpi__label">今日营收</div><div class="kpi__value">¥ 12,480</div><div class="kpi__delta">+8.2%</div></article>
      <article class="card kpi"><div class="kpi__label">今日订单</div><div class="kpi__value">86</div><div class="kpi__delta">+5.1%</div></article>
    </div>
    <div class="panel-grid">
      <section class="card panel"><div class="card__head"><h2>营收趋势</h2></div><div id="chart-line" style="height:260px;"></div></section>
    </div>
  `;
  if (typeof echarts !== 'undefined') {
    const line = echarts.init(document.getElementById('chart-line'));
    line.setOption({
      xAxis: { type: 'category', data: ['周一','周二','周三','周四','周五','周六','周日'], axisLabel: { color: '#8b97ad' } },
      yAxis: { type: 'value', splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }, axisLabel: { color: '#8b97ad' } },
      series: [{ type: 'line', smooth: true, data: [8200, 9320, 9010, 10340, 12900, 11300, 12480], itemStyle: { color: '#3b82f6' }, areaStyle: { color: new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'rgba(59,130,246,0.3)'},{offset:1,color:'transparent'}]) } }]
    });
    window.addEventListener('resize', () => line.resize());
  }
}
