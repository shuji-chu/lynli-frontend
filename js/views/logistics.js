export async function render(container) {
  container.innerHTML = `
    <div class="card" style="margin-bottom: 20px;">
      <h3 style="margin-bottom:15px;">发货地址管理</h3>
      <div style="display:flex; gap:10px; align-items:center;">
        <div style="flex:1; padding:15px; border:1px dashed var(--line); border-radius:8px;">广东省广州市白云区xx路 (默认发货地)</div>
        <button class="btn" style="width:auto; margin:0; padding:10px 20px;">新增地址</button>
      </div>
    </div>
    <div class="table-container" style="overflow-x:auto;">
      <h3 style="margin: 15px;">运费模板</h3>
      <table class="table">
        <thead><tr><th>模板名称</th><th>计费方式</th><th>首件/首重</th><th>续件/续重</th><th>操作</th></tr></thead>
        <tbody>
          <tr><td>全国包邮模板</td><td>按件计费</td><td>0元</td><td>0元</td><td><a href="javascript:;" style="color:var(--pri);">编辑</a></td></tr>
          <tr><td>偏远地区加价</td><td>按重量</td><td>1kg内 8元</td><td>每增加1kg加 5元</td><td><a href="javascript:;" style="color:var(--pri);">编辑</a></td></tr>
        </tbody>
      </table>
    </div>
  `;
}
