export async function render(container) {
  container.innerHTML = `
    <div class="card" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
       <h3>优惠券管理</h3>
       <button class="btn" style="width:auto; margin:0; padding:8px 16px;">+ 创建优惠券</button>
    </div>
    <div class="card" style="overflow-x:auto;">
      <table class="table">
        <thead><tr><th>活动名称</th><th>类型</th><th>面额/折扣</th><th>发放量</th><th>状态</th></tr></thead>
        <tbody>
          <tr><td>双十一预热满减</td><td>满减券</td><td>满200减20</td><td>10,000</td><td><span class="badge badge-success">进行中</span></td></tr>
          <tr><td>新人首单礼</td><td>折扣券</td><td>9折</td><td>不限量</td><td><span class="badge badge-success">进行中</span></td></tr>
        </tbody>
      </table>
    </div>
  `;
}
