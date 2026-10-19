export function showBigScreen() {
  const existing = document.getElementById('big-screen-root');
  if (existing) {
    existing.classList.add('show');
    return;
  }

  // 使用纯 CSS 绝对干净的 DOM 结构，避免任何内联 SVG 或乱码
  const html = `
    <div class="big-screen" id="big-screen-root">
      <div class="bs-header">
        <div class="bs-title">LYNLI 商业智能驾驶舱</div>
        <div class="bs-close" id="bs-close">退出大屏</div>
      </div>
      
      <div class="bs-content">
        <!-- 面板 1 -->
        <div class="bs-panel">
          <div class="bs-card">
            <h4>全网 GMV 实时热力</h4>
            <div style="height: 150px; display:flex; align-items:flex-end; gap:8px; padding-top:20px;">
               <div style="flex:1; background:linear-gradient(to top, rgba(59,130,246,0.2), #60a5fa); height:40%; border-radius:4px 4px 0 0;"></div>
               <div style="flex:1; background:linear-gradient(to top, rgba(59,130,246,0.2), #60a5fa); height:70%; border-radius:4px 4px 0 0;"></div>
               <div style="flex:1; background:linear-gradient(to top, rgba(59,130,246,0.2), #60a5fa); height:50%; border-radius:4px 4px 0 0;"></div>
               <div style="flex:1; background:linear-gradient(to top, rgba(59,130,246,0.2), #60a5fa); height:90%; border-radius:4px 4px 0 0;"></div>
               <div style="flex:1; background:linear-gradient(to top, rgba(59,130,246,0.2), #60a5fa); height:60%; border-radius:4px 4px 0 0;"></div>
            </div>
          </div>
          <div class="bs-card">
            <h4>核心类目转化率</h4>
            <div style="height: 150px; display:flex; justify-content:center; align-items:center;">
               <div style="width:120px; height:120px; border-radius:50%; border:15px solid #8b5cf6; border-top-color:#3b82f6; border-right-color:#34d399; display:grid; place-items:center; font-size:20px; font-weight:bold;">85%</div>
            </div>
          </div>
        </div>

        <!-- 面板 2 (中间) -->
        <div class="bs-panel">
          <div class="bs-card" style="flex: 2;">
            <div class="bs-center-data">
              <div><div>实时成交总额</div><div>¥ 8,450,231</div></div>
              <div><div>实时订单量</div><div class="purple">12,405</div></div>
              <div><div>活跃用户</div><div class="green">58,201</div></div>
            </div>
            <div class="bs-map-placeholder">
              全国物流热力路由追踪
            </div>
          </div>
        </div>

        <!-- 面板 3 -->
        <div class="bs-panel">
          <div class="bs-card">
            <h4>TOP 爆款商品排行</h4>
            <div style="display:flex; flex-direction:column; gap:10px; margin-top:10px; font-size:12px;">
              <div style="display:flex; justify-content:space-between; border-bottom:1px dashed rgba(255,255,255,0.1); padding-bottom:5px;"><span>1. 纯棉短袖T恤</span><span style="color:#34d399;">8,240单</span></div>
              <div style="display:flex; justify-content:space-between; border-bottom:1px dashed rgba(255,255,255,0.1); padding-bottom:5px;"><span>2. 日系复古工装裤</span><span style="color:#34d399;">5,122单</span></div>
              <div style="display:flex; justify-content:space-between; border-bottom:1px dashed rgba(255,255,255,0.1); padding-bottom:5px;"><span>3. 便携迷你小风扇</span><span style="color:#34d399;">3,890单</span></div>
            </div>
          </div>
          <div class="bs-card">
            <h4>系统实时预警</h4>
            <div style="font-size:11px; color:#f87171; background:rgba(248,113,113,0.1); padding:10px; border-radius:4px; margin-bottom:10px;">⚠ 华南仓库存告急</div>
            <div style="font-size:11px; color:#eab308; background:rgba(234,179,8,0.1); padding:10px; border-radius:4px;">ℹ 接口频次接近上限</div>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', html);

  document.getElementById('bs-close').onclick = () => {
    document.getElementById('big-screen-root').classList.remove('show');
  };
}
