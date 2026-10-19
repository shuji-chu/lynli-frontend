import { showToast } from "../components/toast.js";

export async function render(mount) {
  mount.innerHTML = `
    <div class="card" style="max-width: 800px;">
      <div class="card__head"><h2>自动过滤与利润规则</h2></div>
      <div style="padding: 20px 0;">
        <label class="field">
          <span class="field__label">最低利润率限制 (%)</span>
          <input type="number" class="field__input" value="30" style="width:200px;">
          <p style="font-size:12px;color:var(--text-faint);margin-top:8px;">低于此利润率的商品将自动拦截，不进入审核池。</p>
        </label>
        
        <label class="field" style="margin-top:24px;">
          <span class="field__label">排除敏感词（多个词用逗号隔开）</span>
          <textarea class="field__input" rows="3" style="resize:vertical;">尾货, 次品, 微商专供, 仿品</textarea>
        </label>

        <label class="field" style="margin-top:24px;">
          <span class="field__label">默认比价平台</span>
          <div style="display:flex;gap:16px;margin-top:8px;">
            <label class="check"><input type="checkbox" checked> 1688</label>
            <label class="check"><input type="checkbox" checked> 淘宝</label>
            <label class="check"><input type="checkbox" checked> 拼多多</label>
            <label class="check"><input type="checkbox"> 京东</label>
            <label class="check"><input type="checkbox"> 抖音</label>
          </div>
        </label>

        <button class="btn btn--primary" style="margin-top:30px;width:200px;" id="save-btn">保存配置</button>
      </div>
    </div>
  `;
  mount.querySelector("#save-btn").addEventListener("click", () => showToast("选品规则已保存生效", "success"));
}
