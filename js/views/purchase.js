import { showToast } from "../components/toast.js";
import { showModal } from "../components/modal.js";
import { initTabs } from "../components/tabs.js";
import { db } from "../api/db.js";

export async function render(mount) {
  // 动态读取数据
  const data = db.get();
  const pendingList = data.purchases.filter(p => p.status === "pending");
  const shippedList = data.purchases.filter(p => p.status === "shipped");

  mount.innerHTML = `
    <div class="card">
      <div class="card__head" style="align-items:flex-start;flex-wrap:wrap;gap:16px;">
        <div class="tabs-header" style="flex:1;border:0;" id="pur-tabs">
          <div class="tab-item is-active" data-target="p-pending">待采购 <span class="badge-num">${pendingList.length}</span></div>
          <div class="tab-item" data-target="p-shipped">已代发</div>
        </div>
      </div>

      <div class="tabs-content" style="margin-top:20px;">
        <div class="tab-pane is-active" id="p-pending">
          <div class="table-wrap">
            ${pendingList.length === 0 ? '<div class="view-empty"><h2>暂无待采购单</h2></div>' : `
            <table class="data-table">
              <thead><tr><th>采购单号</th><th>关联订单</th><th>商品</th><th>预估成本</th><th>操作</th></tr></thead>
              <tbody>
                ${pendingList.map(item => `
                  <tr>
                    <td><strong>${item.id}</strong></td>
                    <td>${item.orderId}</td>
                    <td>${item.item}</td>
                    <td style="color:#f87171;">¥ ${item.cost.toFixed(2)}</td>
                    <td><button class="btn btn--primary btn--sm ship-btn" data-id="${item.id}">录入发货单号</button></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>`}
          </div>
        </div>
        
        <div class="tab-pane" id="p-shipped">
          <div class="table-wrap">
            ${shippedList.length === 0 ? '<div class="view-empty"><h2>暂无记录</h2></div>' : `
            <table class="data-table">
              <thead><tr><th>采购单号</th><th>关联订单</th><th>商品</th><th>物流单号</th></tr></thead>
              <tbody>
                ${shippedList.map(item => `
                  <tr>
                    <td><strong>${item.id}</strong></td>
                    <td>${item.orderId}</td>
                    <td>${item.item}</td>
                    <td><span class="status-tag is-ok">${item.trackingNum}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>`}
          </div>
        </div>
      </div>
    </div>
  `;

  initTabs(mount.querySelector("#pur-tabs"));

  // 核心交互：录入单号 -> 真实改变底层数据
  mount.querySelectorAll(".ship-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const poId = e.target.dataset.id;
      
      showModal({
        title: "确认代发录入单号",
        content: `<input type="text" class="field__input" id="tracking-number" placeholder="请输入快递单号">`,
        onConfirm: () => {
          const trackNum = document.querySelector("#tracking-number").value;
          if (!trackNum) { showToast("单号不能为空", "error"); return false; }
          
          // 1. 写入数据库
          const success = db.shipOrder(poId, trackNum);
          
          if (success) {
            showToast("发货成功！订单状态已同步", "success");
            // 2. 重新渲染页面（刷新数据，你会看到这行数据真的消失了）
            render(mount); 
          }
          return true;
        }
      });
    });
  });
}
