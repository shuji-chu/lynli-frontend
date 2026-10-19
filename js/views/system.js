import { toast } from "../ui.js";

export async function render(container) {
  let activeTab = 'basic';

  const renderUI = () => {
    container.innerHTML = `
      <div class="settings-layout">
        <!-- 左侧设置菜单 -->
        <div class="settings-sidebar">
          <div class="settings-menu-item ${activeTab === 'basic' ? 'active' : ''}" data-tab="basic">基础设置</div>
          <div class="settings-menu-item ${activeTab === 'payment' ? 'active' : ''}" data-tab="payment">支付与提现</div>
          <div class="settings-menu-item ${activeTab === 'theme' ? 'active' : ''}" data-tab="theme">个性化外观</div>
          <div class="settings-menu-item ${activeTab === 'security' ? 'active' : ''}" data-tab="security">安全与接口</div>
        </div>

        <!-- 右侧内容区 -->
        <div class="settings-content" id="settings-body">
          ${renderTabContent(activeTab)}
        </div>
      </div>
    `;

    // 绑定左侧菜单切换
    container.querySelectorAll('.settings-menu-item').forEach(item => {
      item.onclick = () => {
        activeTab = item.dataset.tab;
        renderUI();
      };
    });

    bindEvents();
  };

  const renderTabContent = (tab) => {
    if (tab === 'basic') {
      return `
        <div class="settings-section-title">基础信息</div>
        <div class="settings-section-desc">配置系统名称、域名及联系方式，这些信息将展示在前台页面。</div>
        
        <div class="setting-row">
          <div class="setting-info">
            <div class="setting-label">系统名称</div>
            <div class="setting-hint">显示在浏览器标题和侧边栏顶部。</div>
          </div>
          <div class="setting-control"><input type="text" value="LYNLI PRO 管理面板"></div>
        </div>
        
        <div class="setting-row">
          <div class="setting-info">
            <div class="setting-label">网站域名</div>
            <div class="setting-hint">当前绑定的主域名。</div>
          </div>
          <div class="setting-control"><input type="text" value="https://select.lynli.me" disabled style="background:#f8fafc; cursor:not-allowed;"></div>
        </div>
        
        <div class="setting-row">
          <div class="setting-info">
            <div class="setting-label">客服电话</div>
            <div class="setting-hint">展示在前台底部的联系电话。</div>
          </div>
          <div class="setting-control"><input type="text" value="400-888-8888"></div>
        </div>
        
        <div style="margin-top:30px; text-align:right;">
          <button class="btn" id="save-basic" style="width:auto; padding:10px 24px;">保存基础设置</button>
        </div>
      `;
    }
    
    if (tab === 'payment') {
      return `
        <div class="settings-section-title">支付与提现接口</div>
        <div class="settings-section-desc">配置微信、支付宝等支付通道，设置用户提现审核阈值。</div>
        
        <div class="setting-row">
          <div class="setting-info">
            <div class="setting-label">微信支付</div>
            <div class="setting-hint">开启后用户可通过微信完成订单支付。</div>
          </div>
          <div class="setting-control">
            <label class="toggle-switch"><input type="checkbox" checked><span class="slider"></span></label>
          </div>
        </div>
        
        <div class="setting-row">
          <div class="setting-info">
            <div class="setting-label">支付宝当面付</div>
            <div class="setting-hint">开启后用户可通过支付宝扫码支付。</div>
          </div>
          <div class="setting-control">
            <label class="toggle-switch"><input type="checkbox" checked><span class="slider"></span></label>
          </div>
        </div>
        
        <div class="setting-row">
          <div class="setting-info">
            <div class="setting-label">MchID (微信商户号)</div>
            <div class="setting-hint">填写微信支付商户号。</div>
          </div>
          <div class="setting-control"><input type="password" value="1234567890"></div>
        </div>
        
        <div class="setting-row">
          <div class="setting-info">
            <div class="setting-label">提现自动审核额度</div>
            <div class="setting-hint">低于此额度，系统将自动打款给用户。</div>
          </div>
          <div class="setting-control"><input type="text" value="50 元"></div>
        </div>
        
        <div style="margin-top:30px; text-align:right;">
          <button class="btn" id="save-payment" style="width:auto; padding:10px 24px;">保存支付配置</button>
        </div>
      `;
    }

    if (tab === 'theme') {
      return `
        <div class="settings-section-title">个性化外观</div>
        <div class="settings-section-desc">调整系统主题色、界面风格，实时生效。</div>
        
        <div class="setting-row">
          <div class="setting-info">
            <div class="setting-label">全局主题色</div>
            <div class="setting-hint">修改按钮、高亮文字和侧边栏选中状态的颜色。</div>
          </div>
          <div class="setting-control">
            <div class="theme-colors">
              <div class="color-dot blue active" data-color="#2563eb"></div>
              <div class="color-dot green" data-color="#10b981"></div>
              <div class="color-dot purple" data-color="#8b5cf6"></div>
              <div class="color-dot orange" data-color="#f97316"></div>
            </div>
          </div>
        </div>
        
        <div class="setting-row">
          <div class="setting-info">
            <div class="setting-label">暗黑模式</div>
            <div class="setting-hint">开启后全站切换为暗色背景（开发中）。</div>
          </div>
          <div class="setting-control">
            <label class="toggle-switch"><input type="checkbox" id="dark-mode-toggle"><span class="slider"></span></label>
          </div>
        </div>
        
        <div class="setting-row">
          <div class="setting-info">
            <div class="setting-label">开启侧边栏磨砂效果</div>
            <div class="setting-hint">让侧边栏呈现半透明的毛玻璃质感。</div>
          </div>
          <div class="setting-control">
            <label class="toggle-switch"><input type="checkbox" checked><span class="slider"></span></label>
          </div>
        </div>
      `;
    }

    if (tab === 'security') {
      return `
        <div class="settings-section-title">安全与 API 接口</div>
        <div class="settings-section-desc">控制系统的防爬风控策略，以及第三方 API 接入密钥。</div>
        
        <div class="setting-row">
          <div class="setting-info">
            <div class="setting-label">管理员 API 密钥</div>
            <div class="setting-hint">用于外部脚本调用本系统的接口，请妥善保管。</div>
          </div>
          <div class="setting-control">
            <input type="text" value="sk_live_51H8...x920a" id="api-key-input" readonly>
            <button class="btn btn-sm" id="copy-api-key" style="margin-left:8px; background:#f1f5f9; color:var(--text-main);">复制</button>
          </div>
        </div>
        
        <div class="setting-row">
          <div class="setting-info">
            <div class="setting-label">防爬虫限流</div>
            <div class="setting-hint">同一 IP 1 分钟内最多请求 60 次，防止恶意采集。</div>
          </div>
          <div class="setting-control">
            <label class="toggle-switch"><input type="checkbox" checked><span class="slider"></span></label>
          </div>
        </div>
        
        <div class="setting-row">
          <div class="setting-info">
            <div class="setting-label">异地登录二次验证</div>
            <div class="setting-hint">检测到新设备登录时，要求邮箱验证码。</div>
          </div>
          <div class="setting-control">
            <label class="toggle-switch"><input type="checkbox"><span class="slider"></span></label>
          </div>
        </div>
        
        <div style="margin-top:30px; text-align:right;">
          <button class="btn" id="save-security" style="width:auto; padding:10px 24px; background:#ef4444;">重置安全策略</button>
        </div>
      `;
    }
  };

  const bindEvents = () => {
    // 保存基础
    const btnBasic = document.getElementById('save-basic');
    if (btnBasic) btnBasic.onclick = () => toast("基础设置已保存并生效");

    // 保存支付
    const btnPay = document.getElementById('save-payment');
    if (btnPay) btnPay.onclick = () => toast("支付接口配置已更新");

    // 保存安全
    const btnSec = document.getElementById('save-security');
    if (btnSec) btnSec.onclick = () => toast("安全策略已重置", "error");

    // 复制 API Key
    const btnCopy = document.getElementById('copy-api-key');
    if (btnCopy) {
      btnCopy.onclick = () => {
        const val = document.getElementById('api-key-input').value;
        navigator.clipboard.writeText(val).then(() => toast("API 密钥已复制到剪贴板"));
      };
    }

    // 主题色切换 (高级特效)
    container.querySelectorAll('.color-dot').forEach(dot => {
      dot.onclick = () => {
        container.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        const color = dot.dataset.color;
        // 动态修改 CSS 变量
        document.documentElement.style.setProperty('--brand-primary', color);
        toast("主题色已切换");
      };
    });
  };

  renderUI();
}
