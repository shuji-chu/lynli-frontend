import { store } from "../store.js";
import { showModal, toast } from "../ui.js";

export async function render(container) {
  const renderTable = () => {
    const list = store.get("orders");
    container.innerHTML = `
      <div class="toolbar">
        <div class="toolbar-left">
          <input type="text" class="filter-input" placeholder="搜索订单号/买家">
          <select class="select-input"><option>全部状态</option><option>待发货</option><option>已完成</option></select>
          <button class="btn" style="width:auto; padding:8px 16px; margin:0;">查询</button>
        </div>
      </div>

      <div class="table-container" style="overflow-x:auto;">
        <table class="table">
          <thead><tr><th>订单信息</th><th>买家</th><th>金额</th><th>状态</th><th>操作</th></tr></thead>
          <tbody>
            ${list.map(o => `
              <tr>
                <td><div style="font-weight:bold;">${o.id}</div><div style="font-size:12px; color:var(--text-muted);">${o.time}</div></td>
                <td>${o.user}</td>
                <td style="color:#f87171; font-weight:bold;">¥ ${o.amount.toFixed(2)}</td>
                <td><span class="badge ${o.status === '待发货' ? 'badge-warning' : 'badge-success'}">${o.status}</span></td>
                <td>
                  <a href="javascript:;" class="btn-detail" data-id="${o.id}" style="color:var(--pri); margin-right:8px;">详情</a>
                  ${o.status === '待发货' ? `<a href="javascript:;" class="btn-ship" data-id="${o.id}" style="color:#10b981;">发货</a>` : ''}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    container.querySelectorAll('.btn-ship').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        showModal({
          title: "订单发货",
          contentHTML: `
            <div class="field"><label>物流公司</label><select class="form-select"><option>顺丰速运</option><option>中通快递</option><option>圆通速递</option></select></div>
            <div class="field"><label>快递单号</label><input type="text" id="m-track" placeholder="请输入单号"></div>
          `,
          onConfirm: (mask, close) => {
            if(!mask.querySelector('#m-track').value) return toast("请输入单号", "error");
            store.update("orders", id, { status: "已发货" }); close(); renderTable(); toast("发货成功");
          }
        });
      };
    });

    container.querySelectorAll('.btn-detail').forEach(btn => {
      btn.onclick = () => {
        const o = list.find(x => x.id === btn.dataset.id);
        // 抽屉渲染
        const drawerHtml = `
          <div class="drawer-mask show" id="drawer-mask"></div>
          <div class="drawer show" id="drawer">
            <div class="drawer-header"><h3>订单详情</h3><span class="drawer-close" id="d-close">×</span></div>
            <div class="drawer-body">
              <h4 style="margin-bottom:10px; color:var(--pri);">基本信息</h4>
              <p style="font-size:13px; margin-bottom:5px;">订单号：${o.id}</p>
              <p style="font-size:13px; margin-bottom:5px;">买家：${o.user}</p>
              <p style="font-size:13px; margin-bottom:20px;">金额：¥ ${o.amount}</p>
              <h4 style="margin-bottom:10px; color:var(--pri);">物流轨迹</h4>
              <div class="timeline">
                <div class="timeline-item">${o.time}<br>买家提交订单</div>
                <div class="timeline-item">已完成支付，等待发货</div>
              </div>
            </div>
          </div>
        `;
        document.body.insertAdjacentHTML('beforeend', drawerHtml);
        const closeD = () => document.getElementById('drawer').remove() || document.getElementById('drawer-mask').remove();
        document.getElementById('d-close').onclick = closeD;
        document.getElementById('drawer-mask').onclick = closeD;
      };
    });
  };
  renderTable();
}
