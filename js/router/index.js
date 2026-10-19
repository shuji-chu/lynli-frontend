import { $ } from "../utils/dom.js";
const views = new Map();
export function registerRoute(key, loader) { views.set(key, loader); }
export async function navigate(key) {
  const content = $("#content");
  content.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-dim);">加载中...</div>`;
  if (!views.has(key)) {
    content.innerHTML = `<div class="view-empty"><h2>模块建设中</h2><p>该模块已规划，正在开发中。</p></div>`;
    return;
  }
  try {
    const mod = await views.get(key)();
    content.innerHTML = "";
    await mod.render(content);
  } catch (err) {
    content.innerHTML = `<div class="view-empty"><h2>加载失败</h2><p>${err.message}</p></div>`;
  }
}
