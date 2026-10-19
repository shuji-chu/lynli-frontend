import { showToast } from "../components/toast.js";

export async function render(mount) {
  const tickets = [
    { id: "TK-1029", order: "ORD-20231019-002", user: "李四", reason: "商品破损", amount: "89.00", status: "待处理", time: "10分钟前" },
    { id: "TK-1028", order: "ORD-20231018-099", user: "王五", reason: "七天无理由", amount: "299.00", status: "已同意", time: "2小时前" },
  ];

  mount.innerHTML = `
    <div class="card">
      <div class="card__head">
        <h2>售后工单处理</h2>
        <div style="display:flex;gap:10px;">
          <button class="btn btn--outline btn--sm">批量同意</button>
        </div>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>工单号</th><th>关联订单</th><th>买家</th><th>退款原因</th><th>退款金额</th><th>状态</th><th>操作</th></tr></thead>
          <tbody>
            ${tickets.map(t => `
              <tr>
                <td><strong>${t.id}</strong><div style="font-size:11px;color:var(--text-faint);">${t.time}</div></td>
                <td>${t.order}</td>
                <td>${t.user}</td>
                <td><span class="status-tag is-warn">${t.reason}</span></td>
                <td style="color:#f87171;font-weight:bold;">¥ ${t.amount}</td>
                <td><span class="status-tag ${t.status === '待处理' ? 'is-warn' : 'is-ok'}">${t.status}</span></td>
                <td>
                  ${t.status === '待处理' 
                    ? `<div class="btn-group"><button class="btn btn--primary btn--sm act-btn" data-ok="1">同意退款</button><button class="btn btn--outline btn--sm act-btn" data-ok="0">拒绝</button></div>`
                    : `<button class="btn btn--outline btn--sm">查看详情</button>`
                  }
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  mount.querySelectorAll(".act-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const isOk = e.target.dataset.ok === "1";
      showToast(isOk ? "已同意退款并原路退回" : "已拒绝售后申请", isOk ? "success" : "info");
      e.target.closest("tr").querySelector(".status-tag").outerHTML = `<span class="status-tag is-ok">${isOk ? '已同意' : '已拒绝'}</span>`;
      e.target.closest(".btn-group").innerHTML = `<button class="btn btn--outline btn--sm">查看详情</button>`;
    });
  });
}
