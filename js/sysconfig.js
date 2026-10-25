// ============================================================
// 系统配置中枢 · 邮件配置 / 支付配置 真实接口联动
// ------------------------------------------------------------
// 数据全部来自后端 /api/v1/admin/*（无假数据、无本地占位）
//   GET/POST /admin/config/mail     SMTP 发信配置
//   GET/POST /admin/config/pay      支付宝 / USDT 收款配置
//   POST    /admin/mail/send_broadcast  全站真实群发
//   POST    /admin/mail/ai_template     智谱生成 HTML 邮件
//   GET/POST /admin/mail/templates      触发邮件文案
// 鉴权：复用 LynLi 登录态（localStorage.lynli_admin_token）
// ============================================================
(function () {
  "use strict";

  function _apiBase() {
    return (location.hostname === "web.lynli.me") ? "/api/v1" : "https://api.lynli.me/api/v1";
  }
  function _token() { return localStorage.getItem("lynli_admin_token") || ""; }
  function _headers() {
    return { "Authorization": "Bearer " + _token(), "Content-Type": "application/json" };
  }
  function _get(id) { return document.getElementById(id); }
  function _val(id) { const e = _get(id); return e ? e.value : ""; }
  function _setVal(id, v) { const e = _get(id); if (e) e.value = (v == null ? "" : String(v)); }
  function _checked(id) { const e = _get(id); return e ? e.checked : false; }
  function _setChecked(id, v) { const e = _get(id); if (e) e.checked = !!v; }

  async function _api(path, opts) {
    try {
      const res = await fetch(_apiBase() + path, opts);
      let j = null;
      try { j = await res.json(); } catch (e) { j = null; }
      return { ok: res.ok, status: res.status, json: j };
    } catch (e) {
      return { ok: false, status: 0, json: null };
    }
  }

  function _spin(id, on) {
    const b = _get(id);
    if (!b) return;
    b.classList.toggle("is-loading", on);
    b.disabled = on;
  }

  // ---------------- 邮件配置 ----------------
  const MailCfg = {
    async load() {
      // SMTP 配置（真实后端）
      const r = await _api("/admin/config/mail", { headers: _headers() });
      if (r.ok && r.json && r.json.code === 1 && r.json.data) {
        const d = r.json.data;
        _setVal("mail-smtp-host", d.smtp_host);
        _setVal("mail-smtp-port", d.smtp_port);
        _setVal("mail-smtp-user", d.smtp_user);
        _setVal("mail-smtp-pass", d.smtp_pass);
        _setVal("mail-sender-email", d.sender_email);
        _setVal("mail-sender-name", d.sender_name);
      } else if (r.json && r.json.code === 0) {
        showToast("邮件配置读取失败：" + (r.json.message || ""), "error");
      }
      // 触发邮件文案（复用现有模板接口）
      const t = await _api("/admin/mail/templates", { headers: _headers() });
      if (t.ok && t.json && Array.isArray(t.json.data)) {
        t.json.data.forEach(function (row) {
          if (row.key === "register_verify") _setVal("mail-tpl-register", row.body);
          if (row.key === "pay_success") _setVal("mail-tpl-pay", row.body);
        });
      }
    },

    async saveMail() {
      _spin("mail-save-btn", true);
      const payload = {
        smtp_host: _val("mail-smtp-host"),
        smtp_port: parseInt(_val("mail-smtp-port"), 10) || 465,
        smtp_user: _val("mail-smtp-user"),
        smtp_pass: _val("mail-smtp-pass"),
        sender_email: _val("mail-sender-email"),
        sender_name: _val("mail-sender-name"),
      };
      const r = await _api("/admin/config/mail", {
        method: "POST", headers: _headers(), body: JSON.stringify(payload),
      });
      _spin("mail-save-btn", false);
      if (r.ok && r.json && r.json.code === 1) showToast("邮件配置已保存", "success");
      else showToast((r.json && r.json.message) || "保存失败", "error");
    },

    async genAITemplate() {
      const prompt = _val("mail-ai-prompt").trim();
      if (!prompt) { showToast("请先填写 AI 提示词", "warn"); return; }
      _spin("mail-ai-btn", true);
      const r = await _api("/admin/mail/ai_template", {
        method: "POST", headers: _headers(), body: JSON.stringify({ prompt: prompt }),
      });
      _spin("mail-ai-btn", false);
      if (r.ok && r.json && r.json.code === 1 && r.json.data && r.json.data.html) {
        _setVal("mail-bc-body", r.json.data.html);
        showToast("AI 模板已生成，可微调后发送", "success");
      } else {
        showToast((r.json && r.json.msg) || "AI 生成失败", "error");
      }
    },

    async sendBroadcast() {
      const subject = _val("mail-bc-subject").trim();
      const body = _val("mail-bc-body").trim();
      if (!subject || !body) { showToast("请填写标题与内容", "warn"); return; }
      _spin("mail-bc-btn", true);
      const r = await _api("/admin/mail/send_broadcast", {
        method: "POST", headers: _headers(), body: JSON.stringify({ subject: subject, body: body }),
      });
      _spin("mail-bc-btn", false);
      const tip = _get("mail-queue-tip");
      if (r.ok && r.json && r.json.code === 1) {
        const q = (r.json.data && r.json.data.queued) || 0;
        if (tip) tip.innerText = "已加入发送队列：" + q + " 位用户，正在后台逐封投递";
        showToast("已提交全站群发，共 " + q + " 封", "success");
      } else {
        if (tip) tip.innerText = "";
        showToast((r.json && r.json.msg) || "群发失败", "error");
      }
    },

    async saveTemplates() {
      _spin("mail-tpl-btn", true);
      const items = [
        { key: "register_verify", name: "注册验证码邮件", body: _val("mail-tpl-register") },
        { key: "pay_success", name: "支付成功通知", body: _val("mail-tpl-pay") },
      ];
      let done = 0, fail = 0;
      for (const it of items) {
        const r = await _api("/admin/mail/templates/save", {
          method: "POST", headers: _headers(),
          body: JSON.stringify({ key: it.key, name: it.name, subject: it.name, body: it.body }),
        });
        if (r.ok && r.json && r.json.code === 1) done++; else fail++;
      }
      _spin("mail-tpl-btn", false);
      if (fail === 0) showToast("触发文案已保存", "success");
      else showToast("部分文案保存失败", "error");
    },
  };

  // ---------------- 支付配置 ----------------
  const PayCfg = {
    async load() {
      const r = await _api("/admin/config/pay", { headers: _headers() });
      if (r.ok && r.json && r.json.code === 1 && r.json.data) {
        const d = r.json.data;
        const a = d.alipay || {}, u = d.usdt || {};
        _setVal("pay-alipay-appid", a.appid);
        _setVal("pay-alipay-private", a.private_key);
        _setVal("pay-alipay-public", a.public_key);
        _setChecked("pay-alipay-enabled", a.enabled);
        _setVal("pay-usdt-address", u.address);
        _setVal("pay-usdt-key", u.api_key);
        _setChecked("pay-usdt-enabled", u.enabled);
      } else if (r.json && r.json.code === 0) {
        showToast("支付配置读取失败：" + (r.json.message || ""), "error");
      }
    },

    async save() {
      _spin("pay-save-btn", true);
      const payload = {
        alipay: {
          appid: _val("pay-alipay-appid"),
          private_key: _val("pay-alipay-private"),
          public_key: _val("pay-alipay-public"),
          enabled: _checked("pay-alipay-enabled"),
        },
        usdt: {
          address: _val("pay-usdt-address"),
          api_key: _val("pay-usdt-key"),
          enabled: _checked("pay-usdt-enabled"),
        },
      };
      const r = await _api("/admin/config/pay", {
        method: "POST", headers: _headers(), body: JSON.stringify(payload),
      });
      _spin("pay-save-btn", false);
      if (r.ok && r.json && r.json.code === 1) showToast("配置已保存", "success");
      else showToast((r.json && r.json.message) || "保存失败", "error");
    },
  };

  window.MailCfg = MailCfg;
  window.PayCfg = PayCfg;
})();
