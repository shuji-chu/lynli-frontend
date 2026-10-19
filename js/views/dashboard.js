export async function render(mount) {
  mount.innerHTML = `
    <div class="kpi-grid">
      <article class="card kpi"><div class="kpi__label">今日营收</div><div class="kpi__value">¥ 12,480</div><div class="kpi__delta">+8.2%</div></article>
      <article class="card kpi"><div class="kpi__label">今日订单</div><div class="kpi__value">86</div><div class="kpi__delta">+5.1%</div></article>
      <article class="card kpi"><div class="kpi__label">待发货</div><div class="kpi__value">23</div><div class="kpi__delta is-down">需处理</div></article>
      <article class="card kpi"><div class="kpi__label">在售商品</div><div class="kpi__value">412</div><div class="kpi__delta">+12</div></article>
    </div>
    <div class="panel-grid">
      <section class="card panel">
        <div class="card__head"><h2>营收趋势</h2><span>近 7 天</span></div>
        <div id="chart-line" style="height:260px;width:100%;"></div>
      </section>
      <section class="card panel">
        <div class="card__head"><h2>订单构成</h2><span>实时</span></div>
        <div id="chart-pie" style="height:260px;width:100%;"></div>
      </section>
    </div>
  `;

  // 渲染图表（如果有 ECharts 的话）
  if (typeof echarts !== 'undefined') {
    const lineChart = echarts.init(document.getElementById('chart-line'));
    lineChart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
      xAxis: { type: 'category', boundaryGap: false, data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'], axisLine: { lineStyle: { color: '#334155' } }, axisLabel: { color: '#8b97ad' } },
      yAxis: { type: 'value', splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }, axisLabel: { color: '#8b97ad' } },
      series: [{ type: 'line', smooth: true, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(59,130,246,0.5)' }, { offset: 1, color: 'rgba(59,130,246,0)' }]) }, itemStyle: { color: '#3b82f6' }, data: [8200, 9320, 9010, 10340, 12900, 11300, 12480] }]
    });

    const pieChart = echarts.init(document.getElementById('chart-pie'));
    pieChart.setOption({
      tooltip: { trigger: 'item' },
      legend: { top: 'bottom', textStyle: { color: '#8b97ad' } },
      series: [{ type: 'pie', radius: ['45%', '70%'], itemStyle: { borderRadius: 6, borderColor: '#070b14', borderWidth: 2 }, label: { show: false }, data: [{ value: 45, name: '已发货', itemStyle: { color: '#34d399' } }, { value: 23, name: '待发货', itemStyle: { color: '#fbbf24' } }, { value: 18, name: '待付款', itemStyle: { color: '#f87171' } }] }]
    });

    window.addEventListener('resize', () => { lineChart.resize(); pieChart.resize(); });
  }
}
