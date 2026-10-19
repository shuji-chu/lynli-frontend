import { store } from "../store.js";
import { showModal, toast } from "../ui.js";

export async function render(container) {
  const renderTable = () => {
    const list = store.get("products");
    container.innerHTML = `
      <div class="toolbar">
        <div class="toolbar-left">
          <input type="text" class="filter-input" placeholder="搜索商品名称">
          <select class="select-input">
            <option>全部分类</option><option>服饰</option><option>数码</option>
          </select>
          <button class="btn" style="width:auto; padding:8px 16px; margin:0;">搜索</button>
        </div>
        <button class="btn" id="btn-add-prod" style="width:auto; padding:8px 16px; margin:0;">+ 新增商品</button>
      </div>

      <div class="table-container" style="overflow-x:auto;">
        <table class="table">
          <thead><tr><th>商品信息</th><th>分类</th><th>价格</th><th>库存</th><th>状态</th><th>操作</th></tr></thead>
          <tbody>
            ${list.length === 0 ? '<tr><td colspan="6" style="text-align:center;">暂无商品</td></tr>' : ''}
            ${list.map(item => `
              <tr>
                <td><div style="font-weight:bold;">${item.name}</div><div style="font-size:12px; color:var(--text-muted);">ID: ${item.id}</div></td>
                <td>${item.category}</td>
                <td style="color:#f87171; font-weight:bold;">¥ ${item.price.toFixed(2)}</td>
                <td>${item.stock} 件</td>
                <td><span class="badge ${item.status === 1 ? 'badge-success' : 'badge-danger'}">${item.status === 1 ? '在售' : '已下架'}</span></td>
                <td>
                  <button class="btn btn-sm btn-toggle" data-id="${item.id}">${item.status === 1 ? '下架' : '上架'}</button>
                  <button class="btn btn-sm btn-edit" data-id="${item.id}" style="background:#3b82f6;">改库存</button>
                  <button class="btn btn-sm btn-del" data-id="${item.id}" style="background:#ef4444;">删除</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    // 绑定操作
    container.querySelectorAll('.btn-toggle').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        const p = store.get("products").find(x => x.id === id);
        store.update("products", id, { status: p.status === 1 ? 0 : 1 });
        renderTable(); toast("状态已更新");
      };
    });
    container.querySelectorAll('.btn-del').forEach(btn => {
      btn.onclick = () => {
        if(confirm('确定删除该商品吗？')) { store.remove("products", btn.dataset.id); renderTable(); toast("已删除"); }
      };
    });
    container.querySelectorAll('.btn-edit').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        const p = store.get("products").find(x => x.id === id);
        showModal({
          title: "修改库存",
          contentHTML: `<div class="field"><label>当前库存</label><input type="number" id="m-stock" value="${p.stock}"></div>`,
          onConfirm: (mask, close) => { store.update("products", id, { stock: parseInt(mask.querySelector('#m-stock').value) }); close(); renderTable(); toast("库存已更新"); }
        });
      };
    });
    container.querySelector('#btn-add-prod').onclick = () => {
      showModal({
        title: "新增商品",
        contentHTML: `
          <div class="field"><label>商品名称</label><input type="text" id="m-name" placeholder="请输入"></div>
          <div class="field"><label>价格</label><input type="number" id="m-price" value="99.00"></div>
          <div class="field"><label>库存</label><input type="number" id="m-stock" value="100"></div>
          <div class="field"><label>分类</label><select id="m-cat" class="form-select"><option>服饰</option><option>数码</option></select></div>
        `,
        onConfirm: (mask, close) => {
          const name = mask.querySelector('#m-name').value;
          if(!name) return toast("请输入名称", "error");
          store.add("products", {
            id: "P" + Date.now().toString().slice(-4),
            name, price: parseFloat(mask.querySelector('#m-price').value),
            stock: parseInt(mask.querySelector('#m-stock').value),
            category: mask.querySelector('#m-cat').value, status: 1
          });
          close(); renderTable(); toast("新增成功");
        }
      });
    };
  };
  renderTable();
}
