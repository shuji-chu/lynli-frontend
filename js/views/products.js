export async function render(container) {
  container.innerHTML = `
    <div class="card" style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
      <div style="display: flex; gap: 10px;">
        <input type="text" placeholder="搜索商品名称/ID" style="padding: 8px 12px; background: rgba(0,0,0,0.3); border: 1px solid var(--line); border-radius: 6px; color: #fff;">
        <button class="btn" style="width: auto; padding: 8px 16px; margin: 0;">搜索</button>
      </div>
      <button class="btn" style="width: auto; padding: 8px 16px; margin: 0;">+ 新增商品</button>
    </div>
    <div class="card" style="overflow-x: auto;">
      <table class="table">
        <thead><tr><th>商品信息</th><th>价格</th><th>库存</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>
          <tr><td>高级纯棉短袖T恤（白/黑）</td><td>¥59.00</td><td>120</td><td><span style="color:#10b981;">在售</span></td><td><a href="#" style="color:var(--pri);">编辑</a> | <a href="#" style="color:#f87171;">下架</a></td></tr>
          <tr><td>日系复古工装裤</td><td>¥129.00</td><td>45</td><td><span style="color:#10b981;">在售</span></td><td><a href="#" style="color:var(--pri);">编辑</a> | <a href="#" style="color:#f87171;">下架</a></td></tr>
          <tr><td>便携式迷你小风扇</td><td>¥29.90</td><td>0</td><td><span style="color:#f87171;">缺货</span></td><td><a href="#" style="color:var(--pri);">编辑</a> | <a href="#" style="color:var(--dim);">下架</a></td></tr>
        </tbody>
      </table>
    </div>
  `;
}
