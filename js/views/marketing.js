import { store } from "../store.js";
import { showModal, toast } from "../ui.js";

export async function render(container) {
  const renderList = () => {
    const list = store.get("coupons");
    container.innerHTML = `
      <div class="card" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <h3>优惠券管理</h3>
        <button class="btn" id="btn-add-coupon" style="width:auto; margin:0; padding:8px 16px;">+ 创建优惠券</button>
      </div>
      <div class="table-container" style="overflow-x:auto;">
        <table class="table">
          <thead><tr><th>名称</th><th>类型</th><th>面额/折扣</th><th>发放/使用</th><th>状态</th><th>操作</th></tr></thead>
          <tbody>
            ${list.map(c => `
              <tr>
                <td style="font-weight:bold;">${c.name}</td>
                <td>${c.type}</td>
                <td style="color:#f87171;">${c.type === '折扣' ? c.amount + ' 折' : '¥ ' + c.amount}</td>
                <td>${c.total} / ${c.used}</td>
                <td><span class="badge badge-success">${c.status}</span></td>
                <td><a href="javascript:;" class="btn-del-c" data-id="${c.id}" style="color:#ef4444;">删除</a></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    container.querySelectorAll('.btn-del-c').forEach(b => {
      b.onclick = () => { store.remove("coupons", b.dataset.id); renderList(); toast("已删除"); };
    });

    container.querySelector('#btn-add-coupon').onclick = () => {
      showModal({
        title: "创建优惠券",
        contentHTML: `
          <div class="field"><label>名称</label><input type="text" id="c-name" placeholder="如：双十一满减券"></div>
          <div class="field"><label>面额 (元)</label><input type="number" id="c-amt" value="10"></div>
          <div class="field"><label>发放总量</label><input type="number" id="c-total" value="1000"></div>
        `,
        onConfirm: (mask, close) => {
          store.add("coupons", {
            id: "C" + Date.now(), name: mask.querySelector('#c-name').value || "未命名",
            type: "满减", amount: parseFloat(mask.querySelector('#c-amt').value),
            total: parseInt(mask.querySelector('#c-total').value), used: 0, status: "进行中"
          });
          close(); renderList(); toast("创建成功");
        }
      });
    };
  };
  renderList();
}
