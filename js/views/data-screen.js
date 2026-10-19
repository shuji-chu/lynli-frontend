export async function render(mount) {
  mount.innerHTML = `
    <div style="background:#04070d; color:#fff; margin:-20px; padding:20px; height:calc(100dvh - 60px); display:flex; flex-direction:column;">
      <h1 style="text-align:center;color:#00f0ff;letter-spacing:2px;margin:0 0 20px;">LYNLI 实时交易大屏</h1>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;flex:1;">
        <div style="border:1px solid rgba(0,240,255,0.3);padding:20px;background:rgba(0,240,255,0.05);"><h3>全网GMV</h3><h2 style="font-size:36px;color:#00f0ff;">¥ 1,248,900</h2></div>
        <div style="border:1px solid rgba(0,240,255,0.3);padding:20px;background:rgba(0,240,255,0.05);"><h3>实时订单数</h3><h2 style="font-size:36px;color:#00f0ff;">8,642</h2></div>
        <div style="border:1px solid rgba(0,240,255,0.3);padding:20px;background:rgba(0,240,255,0.05);"><h3>在线客服</h3><h2 style="font-size:36px;color:#00f0ff;">12</h2></div>
      </div>
    </div>`;
}
