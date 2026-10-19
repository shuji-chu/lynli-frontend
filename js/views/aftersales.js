import { toast, showModal } from "../ui.js";

export async function render(container) {
  container.innerHTML = `
    <div class="table-container" style="overflow-x:auto;">
      <table class="table">
        <thead><tr><th>售后单号</th><th>关联订单</th><th>售后类型</th><th>退款金额</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>
          <tr id="as-row-1">
            <td>AS-001</td><td>ORD-001</td><td>仅退款</td><td>¥ 59.00</td>
            <td><span class="badge badge-danger">待处理</span></td>
            <td><a href="javascript:;" class="audit-btn" style="color:var(--pri);">去审核</a></td>
          </tr>
          <tr>
            <td>AS-002</td><td>ORD-009</td><td>退货退款</td><td>¥ 129.00</td>
            <td><span class="badge badge-info">退货中</span></td><td><a href="javascript:;" style="color:var(--dim);">查看物流</a></td>
          </tr>
        </tbody>
      </table>
    </div>
  `;

  container.querySelector('.audit-btn').onclick = () => {
    showModal({
      title: "售后审核",
      contentHTML: `
        <div class="field"><label>审核意见</label>
          <select class="form-select" id="m-audit-result">
            <option value="agree">同意退款</option>
            <option value="reject">拒绝退款</option>
          </select>
        </div>
        <div class="field"><label>处理备注</label><textarea id="m-audit-remark" placeholder="给买家留言..." style="width:100%; padding:10px; background:rgba(0,0,0,0.3); border:1px solid var(--line); border-radius:8px; color:#fff; height:80px;"></textarea></div>
      `,
      onConfirm: (mask, close) => {
        const result = mask.querySelector('#m-audit-result').value;
        close();
        const row = document.getElementById('as-row-1');
        if (result === 'agree') {
          toast("已同意退款");
          row.querySelector('.badge').outerHTML = '<span class="badge badge-success">退款完成</span>';
        } else {
          toast("已拒绝退款", "error");
          row.querySelector('.badge').outerHTML = '<span class="badge badge-info">已驳回</span>';
        }
        row.querySelector('.audit-btn').remove();
      }
    });
  };
}
