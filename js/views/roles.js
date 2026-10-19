export async function render(container) {
  container.innerHTML = `
    <div class="card" style="margin-bottom: 20px; display: flex; justify-content: space-between;">
      <h3>角色权限管理</h3>
      <button class="btn" style="width:auto; margin:0; padding:8px 16px;">+ 新增角色</button>
    </div>
    <div style="display: flex; gap: 20px; flex-wrap: wrap;">
      <div class="card" style="flex: 1; min-width: 250px;">
        <h4 style="margin-bottom: 15px;">系统角色列表</h4>
        <div class="nav-item active" style="margin-bottom: 5px;">超级管理员 (默认)</div>
        <div class="nav-item" style="margin-bottom: 5px;">运营人员</div>
        <div class="nav-item" style="margin-bottom: 5px;">客服专员</div>
        <div class="nav-item">财务专员</div>
      </div>
      <div class="card" style="flex: 2; min-width: 300px;">
        <h4 style="margin-bottom: 15px;">权限配置 (运营人员)</h4>
        <div style="display: flex; flex-direction: column; gap: 15px;">
          <div>
            <label style="font-size:14px; font-weight:bold; display:flex; align-items:center; gap:8px;"><input type="checkbox" checked> 商品管理</label>
            <div style="padding-left: 25px; margin-top: 8px; font-size: 13px; color: var(--dim);">
              <label style="margin-right:15px;"><input type="checkbox" checked> 查看商品</label>
              <label style="margin-right:15px;"><input type="checkbox" checked> 编辑商品</label>
              <label><input type="checkbox"> 删除商品</label>
            </div>
          </div>
          <div>
            <label style="font-size:14px; font-weight:bold; display:flex; align-items:center; gap:8px;"><input type="checkbox" checked> 订单管理</label>
            <div style="padding-left: 25px; margin-top: 8px; font-size: 13px; color: var(--dim);">
              <label style="margin-right:15px;"><input type="checkbox" checked> 查看订单</label>
              <label style="margin-right:15px;"><input type="checkbox" checked> 订单发货</label>
              <label><input type="checkbox"> 处理售后</label>
            </div>
          </div>
          <div>
            <label style="font-size:14px; font-weight:bold; display:flex; align-items:center; gap:8px;"><input type="checkbox"> 财务权限</label>
          </div>
        </div>
        <button class="btn" style="width: auto; padding: 10px 30px; margin-top: 30px;">保存权限更改</button>
      </div>
    </div>
  `;
}
