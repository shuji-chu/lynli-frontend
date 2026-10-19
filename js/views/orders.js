import { toast, showModal } from "../ui.js";

export async function render(container) {
  container.innerHTML = `
    <div class="toolbar">
      <div class="toolbar-left">
        <input type="text" class="filter-input" placeholder="搜索订单号/买家昵称">
        <select class="select-input">
          <option>全部状态</option>
          <option>待付款</option>
          <option>待发货</option>
          <option>已发货</option>
        </select>
        <button class="btn" style="width:auto; padding:8px 16px; margin:0;">查询</button>
      </div>
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
          ${[1, 2, 3].map(i => `
            <tr id="row-${i}">
              <td><input type="checkbox" class="row-check"></td>
              <td>
                <div style="font-weight:bold; color:var(--pri);">ORD-2023-00${i}</div>
                <div style="font-size:12px; color:var(--dim); margin-top:4px;">2023-10-24 10:0${i}</div>
              </td>
              <td>用户_${1000 + i}</td>
              <td style="font-weight:bold;">¥ ${(i * 128.5).toFixed(2)}</td>
              <td>
                ${i % 2 === 0 ? '<span class="badge badge-warning">待发货</span>' : '<span class="badge badge-success">已完成</span>'}
              </td>
              <td>
                <a href="javascript:;" style="color:var(--pri); margin-right:8px;">详情</a>
                ${i % 2 === 0 ? `<a href="javascript:;" class="ship-btn" data-id="${i}" style="color:#10b981;">发货</a>` : ''}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  // 发货弹窗逻辑
  container.querySelectorAll('.ship-btn').forEach(btn => {
    btn.onclick = () => {
      const orderId = btn.dataset.id;
      showModal({
        title: "订单发货",
        contentHTML: `
          <div class="field"><label>物流公司</label>
            <select class="form-select" id="m-express">
              <option value="SF">顺丰速运</option>
              <option value="YTO">圆通速递</option>
              <option value="ZTO">中通快递</option>
            </select>
          </div>
          <div class="field"><label>物流单号</label><input type="text" id="m-tracking" placeholder="请输入快递单号" style="width:100%;"></div>
        `,
        onConfirm: (mask, close) => {
          const tracking = mask.querySelector('#m-tracking').value;
          if (!tracking) return toast("请输入快递单号", "error");
          
          toast("发货成功！");
          close();
          // 修改界面状态为已发货
          const row = document.getElementById(`row-${orderId}`);
          if (row) {
            row.querySelector('.badge').outerHTML = '<span class="badge badge-info">已发货</span>';
            btn.remove(); // 移除发货按钮
          }
        }
      });
    };
  });
}
