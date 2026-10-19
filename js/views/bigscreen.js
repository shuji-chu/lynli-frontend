export function showBigScreen() {
  const existing = document.getElementById('big-screen-root');
  if (existing) {
    existing.classList.add('show');
    return;
  }

  const html = `
    <div class="big-screen" id="big-screen-root">
      <div class="bs-header">
        <div class="bs-title">LYNLI 全球商业智能监控中心</div>
        <div class="bs-close" id="bs-close">退出大屏</div>
      </div>
      
      <div class="bs-content">
        <!-- 左侧面板 -->
        <div class="bs-panel">
          <div class="bs-card">
            <h4>全网 GMV 实时热力</h4>
            <div class="chart-bar-box">
               <div class="chart-bar" style="height:40%;"><span>4.2k</span></div>
               <div class="chart-bar" style="height:70%;"><span>7.1k</span></div>
               <div class="chart-bar" style="height:50%;"><span>5.8k</span></div>
               <div class="chart-bar" style="height:90%;"><span>9.4k</span></div>
               <div class="chart-bar" style="height:60%;"><span>6.2k</span></div>
               <div class="chart-bar" style="height:80%;"><span>8.5k</span></div>
            </div>
          </div>
          <div class="bs-card">
            <h4>核心品类转化雷达</h4>
            <div class="radar-box">
               <div class="radar-inner"></div>
               <div class="radar-core"></div>
            </div>
            <div style="text-align:center; margin-top:15px; color:#8b97ad; font-size:12px;">女装 85% | 男装 60% | 百货 45%</div>
          </div>
        </div>

        <!-- 中间主面板 -->
        <div class="bs-panel">
          <div class="bs-card" style="flex: 2;">
            <div style="display:flex; flex-direction:column; text-align:center; margin-bottom: 20px; gap:10px;">
              <div><div style="color:#8b97ad; font-size:12px;">实时成交总额</div><div style="font-size:32px; font-weight:bold; color:#60a5fa; font-family:monospace;">¥ 8,450,231</div></div>
              <div style="display:flex; justify-content:space-around;">
                <div><div style="color:#8b97ad; font-size:12px;">订单量</div><div style="font-size:20px; font-weight:bold; color:#a78bfa;">12,405</div></div>
                <div><div style="color:#8b97ad; font-size:12px;">活跃用户</div><div style="font-size:20px; font-weight:bold; color:#34d399;">58,201</div></div>
              </div>
            </div>
            <div style="height: 200px; border:1px dashed rgba(59,130,246,0.3); border-radius:8px; display:flex; align-items:center; justify-content:center; position:relative;">
               <div style="color:#60a5fa; font-size:16px; letter-spacing:2px; opacity:0.5;">全国物流热力路由追踪</div>
               <div style="position:absolute; top:20%; left:30%; width:10px; height:10px; background:#34d399; border-radius:50%; box-shadow:0 0 10px #34d399; animation: pulse 2s infinite;"></div>
               <div style="position:absolute; bottom:30%; right:20%; width:10px; height:10px; background:#60a5fa; border-radius:50%; box-shadow:0 0 10px #60a5fa; animation: pulse 2s infinite 1s;"></div>
            </div>
          </div>
        </div>

        <!-- 右侧面板 -->
        <div class="bs-panel">
          <div class="bs-card">
            <h4>TOP 爆款商品排行</h4>
            <div style="display:flex; flex-direction:column; gap:10px; font-size:12px;">
              <div style="display:flex; justify-content:space-between; border-bottom:1px dashed rgba(255,255,255,0.1); padding-bottom:5px;"><span>1. 纯棉短袖T恤</span><span style="color:#34d399;">8,240单</span></div>
              <div style="display:flex; justify-content:space-between; border-bottom:1px dashed rgba(255,255,255,0.1); padding-bottom:5px;"><span>2. 日系复古工装裤</span><span style="color:#34d399;">5,122单</span></div>
              <div style="display:flex; justify-content:space-between; border-bottom:1px dashed rgba(255,255,255,0.1); padding-bottom:5px;"><span>3. 便携迷你小风扇</span><span style="color:#34d399;">3,890单</span></div>
            </div>
          </div>
          
          <div class="bs-card">
            <h4>供应商履约监控</h4>
            <div class="progress-item">
              <div style="display:flex; justify-content:space-between;"><span>广州服饰工厂</span><span>98%</span></div>
              <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:98%;"></div></div>
            </div>
            <div class="progress-item">
              <div style="display:flex; justify-content:space-between;"><span>义乌小商品城</span><span>85%</span></div>
              <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:85%;"></div></div>
            </div>
          </div>

          <div class="bs-card" style="flex: 1;">
            <h4>实时大单播报</h4>
            <div class="scroll-list-box">
              <div class="scroll-list">
                <div style="font-size:12px; color:#eab308; background:rgba(234,179,8,0.1); padding:8px; border-radius:4px;">杭州买家 刚刚下单 128件 纯棉T恤</div>
                <div style="font-size:12px; color:#34d399; background:rgba(52,211,153,0.1); padding:8px; border-radius:4px;">广州买家 完成支付 ¥ 5,240.00</div>
                <div style="font-size:12px; color:#60a5fa; background:rgba(59,130,246,0.1); padding:8px; border-radius:4px;">深圳买家 采购了 50件 复古工装裤</div>
                <!-- 重复一遍以实现无缝滚动 -->
                <div style="font-size:12px; color:#eab308; background:rgba(234,179,8,0.1); padding:8px; border-radius:4px;">杭州买家 刚刚下单 128件 纯棉T恤</div>
                <div style="font-size:12px; color:#34d399; background:rgba(52,211,153,0.1); padding:8px; border-radius:4px;">广州买家 完成支付 ¥ 5,240.00</div>
                <div style="font-size:12px; color:#60a5fa; background:rgba(59,130,246,0.1); padding:8px; border-radius:4px;">深圳买家 采购了 50件 复古工装裤</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <style>
      @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.5); opacity: 0.5; } 100% { transform: scale(1); opacity: 1; } }
    </style>
  `;
  document.body.insertAdjacentHTML('beforeend', html);

  document.getElementById('bs-close').onclick = () => {
    document.getElementById('big-screen-root').classList.remove('show');
  };
}
