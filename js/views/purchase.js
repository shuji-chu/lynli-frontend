import { showToast } from "../components/toast.js";
import { showModal } from "../components/modal.js";
import { initTabs } from "../components/tabs.js";

// 模拟真实的采购订单数据（包含利润核算、源链接）
const MOCK_PURCHASE_DATA = [
  { 
    id: "PO-20231019-001", 
    orderId: "ORD-8812", 
    buyer: "张三 (138****1234)",
    items: [{ name: "宇航员星空投影灯", spec: "白色充电款", count: 2, price: 18.50, source: "https://detail.1688.com/offer/123.html" }],
    totalCost: 37.00,
    totalRevenue: 99.80,
    status: "pending",
    createTime: "10分钟前"
  },
  { 
    id: "PO-20231019-002", 
    orderId: "ORD-8813", 
    buyer: "李四 (139****5678)",
    items: [{ name: "智能感应垃圾桶", spec: "12L 灰色", count: 1, price: 25.00, source: "https://detail.1688.com/offer/456.html" }],
    totalCost: 25.00,
    totalRevenue: 69.90,
    status: "pending",
    createTime: "1小时前"
  }
];

export async function render(mount) {
  mount.innerHTML = `
    <div class="card">
      <div class="card__head" style="align-items:flex-start;flex-wrap:wrap;gap:16px;">
        <div class="tabs-header" style="flex:1;border:0;" id="pur-tabs">
          <div class="tab-item is-active" data-target="p-pending">待采购 <span class="badge-num">2</span></div>
          <div class="tab-item" data-target="p-shipped">已代发</div>
        </div>
        <div style="display:flex;gap:10px;">
          <button class="btn btn--outline btn--sm" id="batch-btn">批量打开采购链接</button>
        </div>
      </div>

      <div class="tabs-content" style="margin-top:20px;">
        <div class="tab-pane is-active" id="p-pending">
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr><th>采购单 / 订单号</th><th>商品与规格</th><th>财务核算</th><th>状态</th><th>采购操作</th></tr></thead>
              <tbody>
                ${MOCK_PURCHASE_DATA.map(item => `
                  <tr>
                    <td>
                      <strong>${item.id}</strong>
                      <div style="font-size:11px;color:var(--text-faint);margin-top:4px;">关联: ${item.orderId} | ${item.buyer}</div>
                    </td>
                    <td>
                      <div style="display:flex;flex-direction:column;gap:6px;">
                        ${item.items.map(i => `
                          <div style="font-size:13px;">
                            ${i.name} <span style="color:var(--text-faint);">(${i.spec})</span> <strong style="color:var(--primary);">x${i.count}</strong>
                          </div>
                        `).join('')}
                      </div>
                    </td>
                    <td>
                      <div style="font-size:12px;line-height:1.6;">
                        成本: <span style="color:#f87171;">¥${item.totalCost.toFixed(2)}</span><br>
                        售价: <span style="color:#34d399;">¥${item.totalRevenue.toFixed(2)}</span><br>
                        利润: <strong style="color:var(--primary);">¥${(item.totalRevenue - item.totalCost).toFixed(2)}</strong>
                      </div>
                    </td>
                    <td><span class="status-tag is-warn">待1688下单</span></td>
                    <td>
                      <div class="btn-group" style="flex-direction:column;gap:8px;align-items:stretch;">
                        <button class="btn btn--primary btn--sm go-buy-btn" data-url="${item.items[0].source}">1. 去1688采购</button>
                        <button class="btn btn--outline btn--sm fill-track-btn" data-id="${item.id}">2. 录入发货单号</button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
        <div class="tab-pane" id="p-shipped">
          <div class="view-empty"><h2>暂无已代发记录</h2></div>
        </div>
      </div>
    </div>
  `;

  initTabs(mount.querySelector("#pur-tabs"));

  // 1. 绑定：去 1688 采购
  mount.querySelectorAll(".go-buy-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const url = e.target.dataset.url;
      showToast("正在打开源头厂家链接...", "info");
      // 真实场景：用 window.open(url, '_blank') 打开
    });
  });

  // 2. 绑定：录入发货单号（核心业务闭环）
  mount.querySelectorAll(".fill-track-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const poId = e.target.dataset.id;
      
      // 调起高级弹窗
      showModal({
        title: "录入物流单号 (完成代发)",
        confirmText: "确认发货",
        content: `
          <div class="field">
            <span class="field__label">快递公司</span>
            <select class="field__input" id="logistics-company">
              <option value="SF">顺丰速运</option>
              <option value="ZTO">中通快递</option>
              <option value="YTO">圆通速递</option>
              <option value="JD">京东物流</option>
            </select>
          </div>
          <div class="field">
            <span class="field__label">快递单号</span>
            <input type="text" class="field__input" id="tracking-number" placeholder="请粘贴 1688 返回的快递单号">
          </div>
          <p style="font-size:12px;color:var(--text-faint);margin-top:8px;">* 确认后，系统将自动向买家发送发货邮件通知。</p>
        `,
        onConfirm: () => {
          const trackNum = document.querySelector("#tracking-number").value;
          if (!trackNum) {
            showToast("请填写物流单号", "error");
            return false; // 返回 false 阻止弹窗关闭
          }
          
          // 真实场景：这里会发起 fetch 请求到后端
          // 模拟成功
          showToast(`采购单 ${poId} 已发货，邮件已发送！`, "success");
          
          // UI 层面流转（把这一行从待采购移除）
          e.target.closest("tr").remove();
          return true; // 允许弹窗关闭
        }
      });
    });
  });

  // 3. 批量打开
  mount.querySelector("#batch-btn").addEventListener("click", () => {
    showToast("已阻止浏览器拦截，正在依次打开 2 个 1688 标签页...", "success");
  });
}
