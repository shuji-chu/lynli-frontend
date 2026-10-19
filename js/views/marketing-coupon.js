import { showModal } from "../components/modal.js";
import { showToast } from "../components/toast.js";
export async function render(mount) {
  mount.innerHTML = `
    <div class="card">
      <div class="card__head"><h2>优惠券管理</h2><button class="btn btn--primary btn--sm" id="add-btn">+ 新建优惠券</button></div>
      <div class="product-grid" style="grid-template-columns:repeat(auto-fill,minmax(280px,1fr));">
        <div class="card" style="border-color:var(--primary);">
          <div style="display:flex;justify-content:space-between;margin-bottom:12px;"><h3 style="margin:0;">新人立减券</h3><span class="status-tag is-ok">生效中</span></div>
          <div style="font-size:28px;color:var(--primary);font-weight:bold;margin-bottom:8px;">¥ 10.00</div>
          <p style="font-size:12px;color:var(--text-dim);">满 50 元可用 | 剩余 980 张</p>
        </div>
      </div>
    </div>`;
  mount.querySelector("#add-btn").onclick = () => showModal({ title: "新建优惠券", content: `<input class="field__input" placeholder="券名称"><br><input class="field__input" placeholder="面额" type="number">`, onConfirm: () => showToast("创建成功") });
}
