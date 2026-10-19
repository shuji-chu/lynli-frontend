import { toast } from "../ui.js";

export async function render(container) {
  container.innerHTML = `
    <!-- 复杂工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <input type="text" class="filter-input" placeholder="搜索订单号/买家昵称">
        <select class="select-input">
          <option>全部状态</option>
          <option>待付款</option>
          <option>待发货</option>
          <option>已发货</option>
          <option>已完成</option>
        </select>
        <button class="btn" style="width:auto; padding:8px 16px; margin:0;">查询</button>
        <button class="btn" style="width:auto; padding:8px 16px; margin:0; background:var(--sur); border:1px solid var(--line);">重置</button>
      </div>
      <div class="toolbar-right">
        <button class="btn" style="width:auto; padding:8px 16px; margin:0; background:rgba(16,185,129,0.15); color:#10b981; border:1px solid #10b981;">批量发货</button>
        <button class="btn" style="width:auto; padding:8px 16px; margin:0; background:rgba(248,113,113,0.15); color:#f87171; border:1px solid #f87171;">导出订单</button>
      </div>
    </div>

    <!-- 选中后的批量提示条 (默认隐藏) -->
    <div class="batch-bar" id="batch-bar" style="display:none;">
      <span>已选中 <b>0</b> 条订单</span>
      <button class="btn" style="width:auto; padding:4px 12px; margin:0; font-size:12px;" onclick="alert('执行批量操作')">批量处理</button>
    </div>

    <div class="table-container" style="overflow-x:auto;">
      <table class="table">
        <thead>
          <tr>
            <th style="width:40px;"><input type="checkbox" id="check-all"></th>
            <th>订单信息</th>
            <th>买家</th>
            <th>金额</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody id="order-list">
          ${[1, 2, 3, 4, 5].map(i => `
            <tr>
              <td><input type="checkbox" class="row-check"></td>
              <td>
                <div style="font-weight:bold; color:var(--pri); cursor:pointer;">ORD-2023-00${i}</div>
                <div style="font-size:12px; color:var(--dim); margin-top:4px;">2023-10-24 10:0${i}</div>
              </td>
              <td>用户_${1000 + i}</td>
              <td style="font-weight:bold;">¥ ${(i * 128.5).toFixed(2)}</td>
              <td>
                ${i % 2 === 0 ? '<span class="badge badge-warning">待发货</span>' : '<span class="badge badge-success">已完成</span>'}
              </td>
              <td>
                <a href="javascript:;" style="color:var(--pri); margin-right:8px;">详情</a>
                ${i % 2 === 0 ? '<a href="javascript:;" style="color:#10b981;">发货</a>' : ''}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  // 全选逻辑
  const checkAll = container.querySelector('#check-all');
  const rowChecks = container.querySelectorAll('.row-check');
  const batchBar = container.querySelector('#batch-bar');

  const updateBatchBar = () => {
    const checkedCount = Array.from(rowChecks).filter(c => c.checked).length;
    if (checkedCount > 0) {
      batchBar.style.display = 'flex';
      batchBar.querySelector('b').textContent = checkedCount;
    } else {
      batchBar.style.display = 'none';
    }
  };

  checkAll.onchange = (e) => {
    rowChecks.forEach(c => c.checked = e.target.checked);
    updateBatchBar();
  };

  rowChecks.forEach(c => c.onchange = () => {
    if (!c.checked) checkAll.checked = false;
    if (Array.from(rowChecks).every(c => c.checked)) checkAll.checked = true;
    updateBatchBar();
  });
}
