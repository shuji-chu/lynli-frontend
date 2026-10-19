export async function render(mount) {
  mount.innerHTML = `
    <div class="card">
      <div class="card__head"><h2>订单管理</h2></div>
      <p style="color:var(--text-dim);">这里是正规的订单模块代码，只负责渲染 UI，逻辑与 API 分离。</p>
    </div>
  `;
}
