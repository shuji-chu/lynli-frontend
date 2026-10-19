import { showToast } from "../components/toast.js";
import { initTabs } from "../components/tabs.js";
export async function render(mount) {
  mount.innerHTML = `
    <div class="card">
      <div class="tabs-header" id="pur-tabs">
        <div class="tab-item is-active" data-target="p-pending">待采购单 (12)</div>
        <div class="tab-item" data-target="p-shipped">已代发 (86)</div>
      </div>
      <div class="tabs-content" style="margin-top:20px;">
        <div class="tab-pane is-active" id="p-pending">
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr><th>采购单号</th><th>关联订单</th><th>商品信息</th><th>采购成本</th><th>操作</th></tr></thead>
              <tbody>
                <tr><td>PO-1001</td><td>ORD-001</td><td>保温杯 x 2</td><td>¥ 50.00</td><td><button class="btn btn--primary btn--sm" onclick="window.open('https://1688.com')">去1688采购</button></td></tr>
                <tr><td>PO-1002</td><td>ORD-002</td><td>投影灯 x 1</td><td>¥ 18.50</td><td><button class="btn btn--primary btn--sm" onclick="window.open('https://1688.com')">去1688采购</button></td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="tab-pane" id="p-shipped"><div class="view-empty"><h2>暂无记录</h2></div></div>
      </div>
    </div>`;
  initTabs(mount.querySelector("#pur-tabs"));
}
