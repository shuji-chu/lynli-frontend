export async function render(container) {
  container.innerHTML = `
    <div class="card" style="margin-bottom: 20px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
        <h3>角色权限分配 (RBAC)</h3>
        <button class="btn" style="width:auto; margin:0; padding:8px 16px;">+ 新建角色</button>
      </div>
      <div style="overflow-x:auto;">
        <table class="table">
          <thead><tr><th>角色名称</th><th>包含成员</th><th>菜单权限</th><th>操作</th></tr></thead>
          <tbody>
            <tr><td>超级管理员</td><td>1 人</td><td><span class="badge badge-success">全部权限</span></td><td><a href="javascript:;" style="color:var(--pri);">编辑</a></td></tr>
            <tr><td>运营专员</td><td>3 人</td><td>商品中心、AI选品、营销中心</td><td><a href="javascript:;" style="color:var(--pri);">编辑</a></td></tr>
            <tr><td>客服人员</td><td>5 人</td><td>交易中心、售后工单、客户管理</td><td><a href="javascript:;" style="color:var(--pri);">编辑</a></td></tr>
            <tr><td>财务专员</td><td>1 人</td><td>财务对账、采购代发</td><td><a href="javascript:;" style="color:var(--pri);">编辑</a></td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="card" style="overflow-x:auto;">
      <h3 style="margin-bottom:15px;">系统操作日志</h3>
      <table class="table">
        <thead><tr><th>操作人</th><th>操作行为</th><th>IP 地址</th><th>时间</th></tr></thead>
        <tbody>
          <tr><td>admin</td><td>修改了商品 "高级纯棉短袖" 价格</td><td>112.11.22.33</td><td>2023-10-24 10:00</td></tr>
          <tr><td>admin</td><td>生成了 API Token</td><td>112.11.22.33</td><td>2023-10-24 09:30</td></tr>
        </tbody>
      </table>
    </div>
  `;
}
