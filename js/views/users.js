import { showModal } from "../components/modal.js"; import { showToast } from "../components/toast.js";
export async function render(mount) {
  mount.innerHTML = `<div class="card"><div class="card__head"><h2>账号管理</h2><button class="btn btn--primary btn--sm" id="add">+ 新增</button></div><p style="color:var(--text-dim);margin-top:20px;">此处展示账号列表...</p></div>`;
  mount.querySelector("#add").onclick = () => showModal({ title: "新增账号", content: `<input class="field__input" placeholder="邮箱">`, onConfirm: () => showToast("创建成功") });
}
