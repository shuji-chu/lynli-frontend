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
        <div class="bs-panel">
          <div class="bs-card">
            <h4 style="color:#60a5fa; margin-bottom:10px; font-size:13px;">全网 GMV 实时热力</h4>
            <div style="height: 200px; display:flex; align-items:flex-end; gap:10px; padding-top:20px;">
               <div style="flex:1; background:#60a5fa; height:40%;"></div>
               <div style="flex:1; background:#60a5fa; height:70%;"></div>
               <div style="flex:1; background:#60a5fa; height:50%;"></div>
               <div style="flex:1; background:#60a5fa; height:90%;"></div>
               <div style="flex:1; background:#60a5fa; height:60%;"></div>
            </div>
          </div>
          <div class="bs-card">
            <h4 style="color:#60a5fa; margin-bottom:10px; font-size:13px;">核心类目转化率</h4>
            <div style="height: 200px; display:flex; justify-content:center; align-items:center;">
               <div style="width:150px; height:150px; border-radius:50%; border:20px solid #8b5cf6; border-top-color:#3b82f6; border-right-color:#34d399; display:grid; place-items:center; font-size:20px; font-weight:bold;">85%</div>
            </div>
          </div>
        </div>
        <div class="bs-panel">
          <div class="bs-card" style="flex: 2; display:flex; flex-direction:column;">
            <div style="display:flex; justify-content:space-around; text-align:center; margin-bottom: 20px;">
              <div><div style="color:#8b97ad; font-size:12px;">实时成交总额</div><div style="font-size:32px; font-weight:bold; color:#60a5fa; font-family:monospace;">¥ 8,450,231</div></div>
              <div><div style="color:#8b97ad; font-size:12px;">实时订单量</div><div style="font-size:32px; font-weight:bold; color:#a78bfa; font-family:monospace;">12,405</div></div>
              <div><div style="color:#8b97ad; font-size:12px;">活跃用户</div><div style="font-size:32px; font-weight:bold; color:#34d399; font-family:monospace;">58,201</div></div>
            </div>
            <div style="flex:1; border:1px solid rgba(59,130,246,0.2); border-radius:8px; background:url('data:image/svg+xml;utf8,<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(59,130,246,0.1)" stroke-width="1"/></pattern></defs><rect width="100%" height="100%" fill="url(%23grid)"/></svg>'); display:grid; place-items:center; position:relative;">
               <div style="color:#60a5fa; font-size:18px; letter-spacing:2px; text-shadow:0 0 10px #3b82f6;">全国物流热力路由追踪</div>
               <!-- 飞线动效点 -->
               <div style="position:absolute; top:30%; left:40%; width:8px; height:8px; background:#fff; border-radius:50%; box-shadow:0 0 10px #fff;"></div>
               <div style="position:absolute; bottom:40%; right:30%; width:8px; height:8px; background:#fff; border-radius:50%; box-shadow:0 0 10px #fff;"></div>
            </div>
          </div>
        </div>
        <div class="bs-panel">
          <div class="bs-card">
            <h4 style="color:#60a5fa; margin-bottom:10px; font-size:13px;">TOP 爆款商品排行</h4>
            <div style="display:flex; flex-direction:column; gap:10px; margin-top:15px;">
              <div style="display:flex; justify-content:space-between; font-size:13px; border-bottom:1px dashed rgba(255,255,255,0.1); padding-bottom:5px;"><span>1. 纯棉短袖T恤</span><span style="color:#34d399;">8,240单</span></div>
              <div style="display:flex; justify-content:space-between; font-size:13px; border-bottom:1px dashed rgba(255,255,255,0.1); padding-bottom:5px;"><span>2. 日系复古工装裤</span><span style="color:#34d399;">5,122单</span></div>
              <div style="display:flex; justify-content:space-between; font-size:13px; border-bottom:1px dashed rgba(255,255,255,0.1); padding-bottom:5px;"><span>3. 便携迷你小风扇</span><span style="color:#34d399;">3,890单</span></div>
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
}
