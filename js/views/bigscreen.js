export function showBigScreen() {
  if (document.getElementById('big-screen-root')) {
    document.getElementById('big-screen-root').classList.add('show');
    return;
  }

  const html = `
    <div class="big-screen" id="big-screen-root">
      <div class="bs-header">
        <div class="bs-title">LYNLI 全球商业智能监控驾驶舱</div>
        <div class="bs-close" id="bs-close">退出大屏</div>
      </div>
      <div class="bs-content">
        <!-- 左侧面板 -->
        <div class="bs-panel">
          <div class="bs-card">
            <h4 style="color:#60a5fa; margin-bottom:10px; font-size:13px;">全网 GMV 实时热力</h4>
            <div id="bs-chart-1" style="height: 200px;"></div>
          </div>
          <div class="bs-card">
            <h4 style="color:#60a5fa; margin-bottom:10px; font-size:13px;">核心类目转化率</h4>
            <div id="bs-chart-2" style="height: 200px;"></div>
          </div>
        </div>
        <!-- 中间大屏 -->
        <div class="bs-panel">
          <div class="bs-card" style="flex: 2; display:flex; flex-direction:column;">
            <div style="display:flex; justify-content:space-around; text-align:center; margin-bottom: 20px;">
              <div><div style="color:#8b97ad; font-size:12px;">实时成交总额</div><div style="font-size:32px; font-weight:bold; color:#60a5fa; font-family:monospace;">¥ 8,450,231</div></div>
              <div><div style="color:#8b97ad; font-size:12px;">实时订单量</div><div style="font-size:32px; font-weight:bold; color:#a78bfa; font-family:monospace;">12,405</div></div>
              <div><div style="color:#8b97ad; font-size:12px;">活跃用户</div><div style="font-size:32px; font-weight:bold; color:#34d399; font-family:monospace;">58,201</div></div>
            </div>
            <div id="bs-chart-map" style="flex:1;"></div>
          </div>
          <div class="bs-card" style="flex: 1;">
             <h4 style="color:#60a5fa; margin-bottom:10px; font-size:13px;">全国仓储物流吞吐监控</h4>
             <div id="bs-chart-3" style="height: 100%;"></div>
          </div>
        </div>
        <!-- 右侧面板 -->
        <div class="bs-panel">
          <div class="bs-card">
            <h4 style="color:#60a5fa; margin-bottom:10px; font-size:13px;">TOP 爆款商品排行</h4>
            <div style="display:flex; flex-direction:column; gap:10px; margin-top:15px;">
              <div style="display:flex; justify-content:space-between; font-size:13px; border-bottom:1px dashed rgba(255,255,255,0.1); padding-bottom:5px;"><span>1. 纯棉短袖T恤</span><span style="color:#34d399;">8,240单</span></div>
              <div style="display:flex; justify-content:space-between; font-size:13px; border-bottom:1px dashed rgba(255,255,255,0.1); padding-bottom:5px;"><span>2. 日系复古工装裤</span><span style="color:#34d399;">5,122单</span></div>
              <div style="display:flex; justify-content:space-between; font-size:13px; border-bottom:1px dashed rgba(255,255,255,0.1); padding-bottom:5px;"><span>3. 便携迷你小风扇</span><span style="color:#34d399;">3,890单</span></div>
              <div style="display:flex; justify-content:space-between; font-size:13px; border-bottom:1px dashed rgba(255,255,255,0.1); padding-bottom:5px;"><span>4. 法式碎花连衣裙</span><span style="color:#34d399;">2,450单</span></div>
            </div>
          </div>
          <div class="bs-card">
            <h4 style="color:#60a5fa; margin-bottom:10px; font-size:13px;">系统实时预警</h4>
            <div style="font-size:12px; color:#f87171; background:rgba(248,113,113,0.1); padding:10px; border-radius:4px; margin-bottom:10px;">⚠ 华南仓库存告急，请及时补货</div>
            <div style="font-size:12px; color:#eab308; background:rgba(234,179,8,0.1); padding:10px; border-radius:4px;">ℹ 接口调用频次接近阈值上限</div>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', html);

  document.getElementById('bs-close').onclick = () => {
    document.getElementById('big-screen-root').classList.remove('show');
  };

  // 渲染大屏专属图表
  setTimeout(() => {
    const chart1 = echarts.init(document.getElementById('bs-chart-1'));
    chart1.setOption({ xAxis: { type: 'category', data: ['A', 'B', 'C', 'D', 'E'], axisLabel: { color: '#8b97ad' } }, yAxis: { type: 'value', splitLine: { show: false }, axisLabel: { color: '#8b97ad' } }, series: [{ type: 'bar', data: [120, 200, 150, 80, 70], itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#60a5fa' }, { offset: 1, color: '#3b82f6' }]) } }] });

    const chart2 = echarts.init(document.getElementById('bs-chart-2'));
    chart2.setOption({ series: [{ type: 'pie', radius: ['50%', '70%'], label: { color: '#8b97ad' }, data: [{ value: 300, name: '服饰' }, { value: 200, name: '数码' }, { value: 100, name: '家居' }] }] });

    const chartMap = echarts.init(document.getElementById('bs-chart-map'));
    chartMap.setOption({ geo: { map: 'china', roam: true, itemStyle: { areaColor: 'rgba(59,130,246,0.1)', borderColor: 'rgba(59,130,246,0.3)' }, emphasis: { itemStyle: { areaColor: 'rgba(59,130,246,0.3)' } } }, series: [{ type: 'effectScatter', coordinateSystem: 'geo', data: [{ name: '广州', value: [113.23, 23.16] }, { name: '杭州', value: [120.19, 30.26] }, { name: '北京', value: [116.46, 39.92] }], rippleEffect: { brushType: 'stroke' }, itemStyle: { color: '#60a5fa' } }] });

    const chart3 = echarts.init(document.getElementById('bs-chart-3'));
    chart3.setOption({ xAxis: { type: 'category', data: ['10:00', '11:00', '12:00', '13:00', '14:00'], axisLabel: { color: '#8b97ad' } }, yAxis: { type: 'value', splitLine: { show: false }, axisLabel: { color: '#8b97ad' } }, series: [{ type: 'line', data: [400, 800, 600, 1200, 900], smooth: true, lineStyle: { color: '#34d399' }, areaStyle: { color: 'rgba(52,211,153,0.2)' } }] });

    // 引入中国地图的简版 Base64 (ECharts 需要地图注册，这里为了演示省略复杂地图引入，用散点效果代替)
    chartMap.setOption({
      title: { text: '数据流实时飞线', left: 'center', top: 10, textStyle: { color: '#8b97ad', fontSize: 12 } },
      xAxis: { show: false, min: 70, max: 140 },
      yAxis: { show: false, min: 10, max: 60 },
      series: [{
        type: 'lines',
        coordinateSystem: 'cartesian2d',
        polyline: true,
        data: [{ coords: [[113.23, 23.16], [120.19, 30.26], [116.46, 39.92]] }],
        lineStyle: { color: '#60a5fa', width: 2, opacity: 0.6, curveness: 0.2 },
        effect: { show: true, period: 4, trailLength: 0.7, color: '#fff', symbolSize: 3 }
      }]
    });
  }, 100);
}
