import { toast } from "../../components/ui/toast.js";

export async function render(m) {
  m.innerHTML = `
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <h2>优惠券管理</h2>
        <button class="btn btn-primary" onclick="alert('创建优惠券')">+ 新建券</button>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;margin-top:20px;">
        <div style="background:linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1));border:1px solid var(--pri);border-radius:12px;padding:20px;position:relative;">
          <div style="font-size:24px;font-weight:bold;color:var(--pri);margin-bottom:8px;">¥ 10.00</div>
          <div style="font-size:14px;margin-bottom:4px;">新人专享立减券</div>
          <div style="font-size:12px;color:var(--dim);">满 50 元可用 | 剩余 980 张</div>
          <button style="position:absolute;right:20px;bottom:20px;background:none;border:1px solid var(--line);color:var(--text);padding:4px 12px;border-radius:6px;cursor:pointer;" onclick="alert('编辑规则')">编辑</button>
        </div>
      </div>
    </div>
  `;
}
