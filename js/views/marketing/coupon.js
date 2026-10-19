import { toast } from "../../components/ui/toast.js";
import { modal } from "../../components/ui/modal.js";

export async function render(m) {
  m.innerHTML = `
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
        <h2>优惠券管理</h2>
        <button class="btn btn-primary" id="add-coupon">+ 新建券</button>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;">
        <div style="background:linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1));border:1px solid var(--pri);border-radius:12px;padding:20px;position:relative;">
          <div style="font-size:24px;font-weight:bold;color:var(--pri);margin-bottom:8px;">¥ 10.00</div>
          <div style="font-size:14px;margin-bottom:4px;">新人专享立减券</div>
          <div style="font-size:12px;color:var(--dim);">满 50 元可用 | 剩余 980 张</div>
          <button style="position:absolute;right:20px;bottom:20px;background:none;border:1px solid var(--line);color:var(--text);padding:4px 12px;border-radius:6px;cursor:pointer;" id="edit-coupon">编辑</button>
        </div>
      </div>
    </div>
  `;

  const openForm = (isEdit) => {
    modal({
      title: isEdit ? "编辑优惠券" : "新建优惠券",
      content: `
        <div style="margin-bottom:12px;"><label style="font-size:12px;color:var(--dim);">优惠券名称</label><input class="input" placeholder="例如：双11大促券" value="${isEdit?'新人专享立减券':''}"></div>
        <div style="margin-bottom:12px;"><label style="font-size:12px;color:var(--dim);">面额 (元)</label><input class="input" type="number" value="${isEdit?'10':''}"></div>
        <div style="margin-bottom:12px;"><label style="font-size:12px;color:var(--dim);">使用门槛 (满X元可用)</label><input class="input" type="number" value="${isEdit?'50':''}"></div>
      `,
      onConfirm: () => { toast(isEdit ? "优惠券已更新" : "优惠券创建成功", "success"); return true; }
    });
  };

  m.querySelector("#add-coupon").onclick = () => openForm(false);
  m.querySelector("#edit-coupon").onclick = () => openForm(true);
}
