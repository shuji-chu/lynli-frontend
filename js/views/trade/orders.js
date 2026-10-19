import { store } from "../../store/data.js";
import { toast } from "../../components/ui/toast.js";
import { modal } from "../../components/ui/modal.js";
import { fmtMoney } from "../../core/utils.js";

export async function render(m) {
  const d = store.get();
  m.innerHTML = `<div class="card"><h2>全部订单</h2><table class="table">
    <thead><tr><th>订单号</th><th>买家</th><th>金额</th><th>状态</th><th>操作</th></tr></thead>
    <tbody>${d.orders.map(o => `<tr>
      <td>${o.id}</td><td>${o.buyer}</td><td>${fmtMoney(o.amount)}</td>
      <td><span class="tag tag-${o.status}">${o.status === 'unpaid' ? '待付款' : o.status === 'pending' ? '待发货' : '已发货'}</span></td>
      <td>
        <button class="btn btn-sm" style="border:1px solid var(--line);background:none;color:var(--text);" onclick="window.showOrderDetail('${o.id}')">查看详情</button>
        ${o.status === 'unpaid' ? `<button class="btn btn-sm btn-primary pay" data-id="${o.id}">确认付款</button>` : ''}
      </td>
    </tr>`).join('')}</tbody>
  </table></div>`;

  m.querySelectorAll(".pay").forEach(b => b.onclick = (e) => { 
    if(store.pay(e.target.dataset.id)) { toast("支付成功，采购单已生成"); render(m); } 
  });

  window.showOrderDetail = (oid) => {
    const order = d.orders.find(x => x.id === oid);
    const product = d.products.find(p => p.id === order.pid);
    modal({
      title: `订单详情 - ${order.id}`,
      content: `
        <div style="line-height:1.8;color:var(--text);">
          <p><strong>买家信息：</strong>${order.buyer} (138****8888)</p>
          <p><strong>收货地址：</strong>浙江省杭州市西湖区文一西路 88 号</p>
          <hr style="border-color:var(--line);margin:12px 0;">
          <p><strong>商品：</strong>${product.title} x ${order.count}</p>
          <p><strong>订单总额：</strong><span style="color:var(--pri);font-size:18px;">${fmtMoney(order.amount)}</span></p>
          <p><strong>当前状态：</strong>${order.status}</p>
        </div>
      `,
      onConfirm: () => true
    });
  };
}
