import { initTabs } from "../components/tabs.js";
import { showToast } from "../components/toast.js";

export async function render(mount) {
  mount.innerHTML = `
    <div class="card">
      <div class="tabs-header">
        <div class="tab-item is-active" data-target="pane-profile">个人资料</div>
        <div class="tab-item" data-target="pane-security">安全设置</div>
        <div class="tab-item" data-target="pane-logs">操作日志</div>
      </div>
      
      <div class="tabs-content" style="padding-top:20px;">
        <div class="tab-pane is-active" id="pane-profile">
          <form style="max-width:400px;">
            <label class="field"><span class="field__label">头像</span><div style="display:flex;gap:16px;align-items:center;"><div class="user-chip__avatar" style="width:56px;height:56px;font-size:20px;">最</div><button class="btn btn--outline btn--sm" type="button">上传新头像</button></div></label>
            <label class="field"><span class="field__label">昵称</span><input type="text" class="field__input" value="最高指挥官"></label>
            <button class="btn btn--primary" type="button" onclick="alert('保存成功')">保存修改</button>
          </form>
        </div>
        <div class="tab-pane" id="pane-security">
          <form style="max-width:400px;">
            <label class="field"><span class="field__label">当前密码</span><input type="password" class="field__input" placeholder="输入当前密码"></label>
            <label class="field"><span class="field__label">新密码</span><input type="password" class="field__input" placeholder="至少 8 位"></label>
            <button class="btn btn--primary" type="button" id="pwd-btn">更新密码</button>
          </form>
        </div>
        <div class="tab-pane" id="pane-logs">
          <p style="color:var(--text-dim);font-size:14px;">最近登录：2023-10-19 15:30 (IP: 112.12.x.x)</p>
          <p style="color:var(--text-dim);font-size:14px;margin-top:10px;">最近操作：修改了商品《马克杯》的售价</p>
        </div>
      </div>
    </div>
  `;
  
  initTabs(mount);
  mount.querySelector("#pwd-btn").addEventListener("click", () => showToast("密码已更新，请重新登录", "success"));
}
