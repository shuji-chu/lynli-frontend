export async function render(container) {
  container.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 16px;">
      <div class="card">
        <h3 style="margin-bottom: 15px;">部门架构</h3>
        <div class="nav-item" style="color:var(--text); background:rgba(255,255,255,0.05);">LYNLI 总部</div>
        <div style="padding-left: 20px;">
          <div class="nav-item">├─ 运营部</div>
          <div class="nav-item">├─ 商品部</div>
          <div class="nav-item">├─ 客服部</div>
          <div class="nav-item">└─ 财务部</div>
        </div>
      </div>
      <div class="card" style="overflow-x:auto;">
        <h3 style="margin-bottom: 15px;">员工管理</h3>
        <table class="table">
          <thead><tr><th>姓名</th><th>岗位</th><th>所属部门</th><th>状态</th></tr></thead>
          <tbody>
            <tr><td>张三</td><td>运营总监</td><td>运营部</td><td><span class="badge badge-success">在职</span></td></tr>
            <tr><td>李四</td><td>高级买手</td><td>商品部</td><td><span class="badge badge-success">在职</span></td></tr>
            <tr><td>王五</td><td>售后客服</td><td>客服部</td><td><span class="badge badge-warning">休假</span></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}
