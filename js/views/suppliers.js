export async function render(container) {
  container.innerHTML = `
    <div class="card" style="overflow-x: auto;">
      <h3 style="margin-bottom: 15px;">合作供应商列表</h3>
      <table class="table">
        <thead><tr><th>供应商名称</th><th>主营类目</th><th>合作状态</th><th>结算周期</th><th>操作</th></tr></thead>
        <tbody>
          <tr><td>广州服饰源头工厂</td><td>女装/男装</td><td><span class="badge badge-success">深度合作</span></td><td>T+1</td><td><a href="javascript:;" style="color:var(--pri);">查看采购单</a></td></tr>
          <tr><td>义乌小商品批发城</td><td>百货/饰品</td><td><span class="badge badge-info">普通合作</span></td><td>T+3</td><td><a href="javascript:;" style="color:var(--pri);">查看采购单</a></td></tr>
        </tbody>
      </table>
    </div>
  `;
}
