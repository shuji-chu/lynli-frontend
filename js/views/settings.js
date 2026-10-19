import { initTabs } from "../components/tabs.js";
import { showToast } from "../components/toast.js";

export async function render(mount) {
  mount.innerHTML = `
    <div class="card" style="max-width: 800px;">
      <div class="tabs-header" id="settings-tabs">
        <div class="tab-item is-active" data-target="pane-profile">个人资料</div>
        <div class="tab-item" data-target="pane-security">账号安全</div>
        <div class="tab-item" data-target="pane-notify">消息通知</div>
      </div>
      
      <div class="tabs-content" style="padding-top:28px;">
        <div class="tab-pane is-active" id="pane-profile">
          <div style="display:flex;align-items:center;gap:24px;margin-bottom:28px;">
            <div class="user-chip__avatar" style="width:72px;height:72px;font-size:28px;">A</div>
            <div>
              <button class="btn btn--outline btn--sm">更换头像</button>
              <p style="font-size:12px;color:var(--text-faint);margin-top:8px;">支持 JPG, PNG，小于 2MB</p>
            </div>
          </div>
          <div class="field" style="max-width:400px;"><span class="field__label">昵称</span><input type="text" class="field__input" value="超级管理员"></div>
          <div class="field" style="max-width:400px;"><span class="field__label">绑定邮箱</span><input type="text" class="field__input" value="admin@lynli.me" disabled></div>
          <button class="btn btn--primary" style="width:120px;" onclick="alert('资料已保存')">保存修改</button>
        </div>

        <div class="tab-pane" id="pane-security">
          <div class="field" style="max-width:400px;"><span class="field__label">当前密码</span><input type="password" class="field__input" placeholder="输入当前密码"></div>
          <div class="field" style="max-width:400px;"><span class="field__label">新密码</span><input type="password" class="field__input" placeholder="至少8位，含字母和数字"></div>
          <button class="btn btn--primary" style="width:120px;" onclick="alert('密码已更新')">更新密码</button>
        </div>

        <div class="tab-pane" id="pane-notify">
          <label class="check" style="margin-bottom:16px;display:flex;"><input type="checkbox" checked style="margin-right:8px;"> 订单发货时通过邮件通知我</label>
          <label class="check" style="display:flex;"><input type="checkbox" checked style="margin-right:8px;"> 每日营业数据日报</label>
        </div>
      </div>
    </div>
  `;
  initTabs(mount.querySelector("#settings-tabs"));
}
