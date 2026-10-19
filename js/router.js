/* LYNLI 管理面板 · 视图路由 */

const routes = new Map();

export function register(key, loader) {
  routes.set(key, loader);
}

export function has(key) {
  return routes.has(key);
}

export async function navigate(key, mount, { title, sub } = {}) {
  if (typeof document !== "undefined") {
    document.querySelectorAll(".nav-item").forEach((el) => {
      el.classList.toggle("is-active", el.dataset.route === key);
    });
  }

  mount.innerHTML = skeleton();

  if (!routes.has(key)) {
    mount.innerHTML = `
      <div class="view-empty">
        <div>
          <h2>模块建设中</h2>
          <p>「${escapeHtml(title || key)}」尚未接入，稍后开放。</p>
        </div>
      </div>`;
    return;
  }

  try {
    const mod = await routes.get(key)();
    mount.innerHTML = "";
    await mod.render(mount);
  } catch (err) {
    console.error("[router] 渲染失败", err);
    mount.innerHTML = `
      <div class="view-empty">
        <div>
          <h2>加载失败</h2>
          <p>${escapeHtml(err.message || "未知错误")}</p>
        </div>
      </div>`;
  }
}

function skeleton() {
  return `
    <div class="kpi-grid">
      ${Array.from({ length: 4 })
        .map(() => `<div class="card kpi skeleton"></div>`)
        .join("")}
    </div>
    <div class="panel-grid">
      <div class="card panel skeleton"></div>
      <div class="card panel skeleton"></div>
    </div>`;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}
