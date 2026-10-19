import { showToast } from "../components/toast.js";
import { initTabs } from "../components/tabs.js";

export async function render(mount) {
  mount.innerHTML = `
    <div class="card">
      <div class="card__head" style="align-items:flex-start;flex-wrap:wrap;gap:16px;">
        <div class="tabs-header" style="flex:1;border:0;" id="order-tabs">
          <div class="tab-item is-active" data-target="pane-all" data-value="all">全部订单</div>
          <div class="tab-item" data-target="pane-unpaid" data-value="unpaid">待付款</div>
          <div class="tab-item" data-target="pane-unship" data-value="unship">待发货 <span class="badge-num">3</span></div>
          <div class="tab-item" data-target="pane-shipped" data-value="shipped">已发货</div>
          <div class="tab-item" data-target="pane-refund" data-value="refund">退款售后</div>
        </div>
        <div style="display:flex;gap:10px;">
          <input type="text" class="field__input" placeholder="搜索订单号 / 收件人" style="width:220px;height:36px;font-size:13px;padding:0 12px;">
          <button class="btn btn--outline btn--sm" id="export-btn">导出报表</button>
        </div>
      </div>

      <div class="tabs-content" style="margin-top:20px;">
        <div class="tab-pane is-active" id="pane-all">
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr><th>订单号</th><th>买家信息</th><th>商品摘要</th><th>实付金额</th><th>状态</th><th>下单时间</th><th>操作</th></tr></thead>
              <tbody>
                ${generateRows(5)}
              </tbody>
            </table>
          </div>
          <div class="pagination">
            <span class="page-info">共 45 条记录</span>
            <div class="page-btns">
              <button class="btn btn--outline btn--sm" disabled>上一页</button>
              <button class="btn btn--primary btn--sm">1</button>
              <button class="btn btn--outline btn--sm">2</button>
              <button class="btn btn--outline btn--sm">3</button>
              <button class="btn btn--outline btn--sm">下一页</button>
            </div>
          </div>
        </div>
        
        <div class="tab-pane" id="pane-unpaid">
          <div class="view-empty"><h2>暂无待付款订单</h2></div>
        </div>
        <div class="tab-pane" id="pane-unship">
          <div class="table-wrap"><table class="data-table"><thead><tr><th>订单号</th><th>状态</th><th>操作</th></tr></thead><tbody>
            <tr><td>ORD-20231019-001</td><td><span class="status-tag is-warn">待发货</span></td><td><button class="btn btn--primary btn--sm">去1688采购</button></td></tr>
          </tbody></table></div>
        </div>
        <div class="tab-pane" id="pane-shipped">
          <div class="view-empty"><h2>已发货订单区</h2></div>
        </div>
        <div class="tab-pane" id="pane-refund">
          <div class="view-empty"><h2>无售后工单</h2></div>
        </div>
      </div>
    </div>
  `;

  initTabs(mount.querySelector("#order-tabs"));
  
  mount.querySelector("#export-btn").addEventListener("click", () => showToast("报表生成中，稍后自动下载...", "info"));
}

function generateRows(num) {
  const statuses = [
    { text: "待发货", class: "is-warn" }, { text: "已发货", class: "is-ok" },
    { text: "已完成", class: "" }, { text: "退款中", class: "is-danger" }
  ];
  let html = "";
  for (let i = 1; i <= num; i++) {
    const st = statuses[i % statuses.length];
    html += `
      <tr>
        <td><strong>ORD-20231019-00${i}</strong></td>
        <td><div style="font-weight:500;color:var(--text);">张三 (138****8888)</div><div style="font-size:12px;color:var(--text-faint);">浙江省杭州市西湖区</div></td>
        <td>极简陶瓷马克杯 等${i}件</td>
        <td style="color:var(--text);font-weight:600;">¥ ${(129 * i).toFixed(2)}</td>
        <td><span class="status-tag ${st.class}">${st.text}</span></td>
        <td>2023-10-19 14:20</td>
        <td><button class="btn btn--outline btn--sm">查看详情</button></td>
      </tr>
    `;
  }
  return html;
}
