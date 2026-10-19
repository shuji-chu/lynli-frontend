import { showToast } from "../components/toast.js";

export async function render(mount) {
  mount.innerHTML = `
    <div class="card" style="margin-bottom:20px; display:flex; gap:12px; align-items:center;">
      <input class="field__input" type="text" id="tracking-num" placeholder="输入快递单号，如：SF1234567890" style="flex:1; max-width:400px;">
      <button class="btn btn--primary" id="search-btn" style="width:auto; padding:0 24px;">查询物流</button>
    </div>

    <div class="panel-grid" style="grid-template-columns: 350px 1fr; height: calc(100dvh - 220px);">
      <!-- 左侧时间轴 -->
      <div class="card" style="overflow-y:auto;">
        <div class="card__head"><h2>物流轨迹</h2><span class="status-tag is-ok">已揽收</span></div>
        <div class="timeline">
          <div class="timeline-item is-active">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <div class="timeline-time">今天 14:30</div>
              <div class="timeline-text" style="color:var(--primary);font-weight:bold;">【派送中】快递员正在为您派件</div>
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <div class="timeline-time">今天 08:15</div>
              <div class="timeline-text">【运输中】快件已到达杭州西湖集散中心</div>
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <div class="timeline-time">昨天 20:00</div>
              <div class="timeline-text">【已揽收】顺丰速运已收取快件</div>
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <div class="timeline-time">昨天 18:30</div>
              <div class="timeline-text">【已发货】商家已通知快递揽件</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧地图 -->
      <div class="card" style="padding:0; overflow:hidden; position:relative;">
        <div id="map-chart" style="width:100%; height:100%;"></div>
        <!-- 地图浮层信息 -->
        <div style="position:absolute; top:20px; left:20px; background:rgba(17,24,39,0.8); padding:12px 20px; border-radius:var(--radius-md); border:1px solid var(--line); backdrop-filter:blur(10px);">
          <div style="font-size:12px;color:var(--text-faint);margin-bottom:4px;">当前运单号</div>
          <div style="font-size:16px;font-weight:bold;letter-spacing:1px;" id="map-waybill">SF1234567890</div>
        </div>
      </div>
    </div>
  `;

  const searchBtn = mount.querySelector("#search-btn");
  const input = mount.querySelector("#tracking-num");
  
  searchBtn.addEventListener("click", () => {
    if(!input.value) return showToast("请输入单号", "error");
    showToast("正在拉取轨迹...", "info");
    mount.querySelector("#map-waybill").textContent = input.value;
    
    // 重新播放动画
    if(window.trackChart) {
      window.trackChart.dispose();
      initMap(mount);
    }
  });

  // 初始化地图
  initMap(mount);
}

function initMap(mount) {
  if (typeof echarts === 'undefined') return;

  const chartDom = mount.querySelector("#map-chart");
  const myChart = echarts.init(chartDom);
  window.trackChart = myChart;

  // 模拟：广州（发货） -> 杭州（收货）
  const startCoord = [113.2644, 23.1291]; // 广州
  const endCoord = [120.1551, 30.2741];   // 杭州

  const option = {
    backgroundColor: 'transparent',
    geo: {
      map: 'china', // 注意：为了不依赖外部 JSON，如果没加载 china 地图，可以用折线代替，这里直接画带光效的散点和飞线
      roam: true,
      itemStyle: {
        areaColor: 'rgba(17, 24, 39, 0.5)',
        borderColor: 'rgba(59, 130, 246, 0.3)',
      },
      emphasis: { itemStyle: { areaColor: 'rgba(59, 130, 246, 0.1)' } }
    },
    // 如果没有真实的中国地图 JSON，用同心圆坐标系模拟一下科技感路线
    xAxis: { show: false, min: 100, max: 130 },
    yAxis: { show: false, min: 15, max: 45 },
    series: [
      // 飞线特效
      {
        type: 'lines',
        coordinateSystem: 'cartesian2d',
        zlevel: 2,
        effect: {
          show: true,
          period: 3,
          trailLength: 0.4,
          symbol: 'arrow',
          symbolSize: 6,
          color: '#34d399'
        },
        lineStyle: {
          color: '#3b82f6',
          width: 2,
          curveness: 0.3, // 弧线
          opacity: 0.6
        },
        data: [
          {
            coords: [[113.26, 23.12], [120.15, 30.27]], // 广州 -> 杭州
          }
        ]
      },
      // 起点（发货地）
      {
        type: 'effectScatter',
        coordinateSystem: 'cartesian2d',
        zlevel: 3,
        rippleEffect: { brushType: 'stroke', scale: 4 },
        symbolSize: 10,
        itemStyle: { color: '#f59e0b' }, // 橙光
        data: [{ value: [113.26, 23.12], name: '发货地' }]
      },
      // 终点（收货地）
      {
        type: 'effectScatter',
        coordinateSystem: 'cartesian2d',
        zlevel: 3,
        rippleEffect: { brushType: 'stroke', scale: 4 },
        symbolSize: 12,
        itemStyle: { color: '#34d399' }, // 绿光
        data: [{ value: [120.15, 30.27], name: '收货地' }]
      }
    ]
  };

  myChart.setOption(option);
  window.addEventListener('resize', () => myChart.resize());
}
