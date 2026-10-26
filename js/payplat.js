/* ============================================================
   晴天支付平台管理（payplat.js）—— 仅超管可见
   ------------------------------------------------------------
   对接后端 /api/v1/admin/payplat/*（api_pay_platform.py）：
   - 数据大盘：总流水 / 手续费收益 / 活跃商户 KPI + 14 日趋势
   - 商户审批：带用户ID，通过（生成 app_id/app_secret）/ 拒绝
   - 提现审核：确认打款 / 拒绝退回
   全部真实 fetch，无 Mock；黑底 showToast。
   ============================================================ */
(function () {
  "use strict";

  const API_BASE = (location.hostname === "web.lynli.me")
    ? "/api/v1"
    : "https://api.lynli.me/api/v1";

  function _h() {
    const tok = (window.LynliUser && LynliUser.get().token) || "";
    return { "Authorization": "Bearer " + tok, "Content-Type": "application/json" };
  }

  async function _req(method, path, body) {
    const opts = { method: method, headers: _h() };
    if (body !== undefined) opts.body = JSON.stringify(body);
    const res = await fetch(API_BASE + path, opts);
    if (res.status === 401 || res.status === 403) throw new Error("无权限访问（仅超管）");
    return await res.json().catch(() => null);
  }

  function _esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, c =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function _money(v) {
    const n = Number(v);
    return isNaN(n) ? "0.00" : n.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function _time(ts) {
    if (!ts) return "--";
    const d = new Date(Number(ts) * 1000);
    if (isNaN(d.getTime())) return "--";
    const p = n => String(n).padStart(2, "0");
    return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) + " " + p(d.getHours()) + ":" + p(d.getMinutes());
  }

  function _toast(msg, ok) {
    if (typeof showToast === "function") showToast(msg, ok === false ? "error" : "ok");
    else if (ok === false) alert(msg);
  }

  const PayPlat = { _tab: "dashboard", _merchants: [], _withdrawals: [] };

  /* ---------------- 页签切换 ---------------- */
  PayPlat.tab = function (name) {
    PayPlat._tab = name;
    document.querySelectorAll(".pptab-pane").forEach(p => p.classList.remove("active"));
    const pane = document.getElementById("pp-" + name);
    if (pane) pane.classList.add("active");
    document.querySelectorAll("#pp-tabs .btn").forEach(b => b.classList.toggle("btn-primary", b.dataset.t === name));
    if (name === "dashboard") PayPlat.loadDashboard();
    if (name === "merchants") PayPlat.loadMerchants();
    if (name === "withdrawals") PayPlat.loadWithdrawals();
  };

  /* ---------------- 数据大盘 ---------------- */
  PayPlat.loadDashboard = async function () {
    const box = document.getElementById("pp-dash");
    if (box) box.innerHTML = '<div class="empty-tip">加载中...</div>';
    try {
      const json = await _req("GET", "/admin/payplat/dashboard");
      const d = (json && json.data) || {};
      const kpi = [
        ["总流水（已结算）", "¥" + _money(d.amount_total), "订单 " + (d.order_paid || 0) + " / " + (d.order_total || 0) + " 笔"],
        ["手续费收益（10%）", "¥" + _money(d.fee_total), "商户净入账 ¥" + _money(d.credit_total)],
        ["活跃商户", String(d.merchant_active || 0), "待审 " + (d.merchant_pending || 0) + " / 共 " + (d.merchant_total || 0)],
        ["商户余额合计", "¥" + _money(d.balance_total), "提现冻结 ¥" + _money(d.frozen_total) + " · 待审提现 " + (d.withdraw_pending || 0)],
      ];
      const trend = d.trend || [];
      const max = Math.max(1, ...trend.map(t => t.amount));
      const bars = trend.length
        ? trend.map(t =>
            '<div class="pp-bar" title="' + _esc(t.date) + ' 流水 ¥' + _money(t.amount) + ' 手续费 ¥' + _money(t.fee) + '">' +
            '<i style="height:' + Math.round(t.amount / max * 100) + '%"></i>' +
            '<em>' + _esc(t.date) + "</em></div>").join("")
        : '<div class="empty-tip">近 14 日暂无已结算流水</div>';
      if (box) box.innerHTML =
        '<div class="pp-kpis">' + kpi.map(k =>
          '<div class="card pp-kpi"><b>' + _esc(k[1]) + "</b><span>" + _esc(k[0]) + "</span><small>" + _esc(k[2]) + "</small></div>").join("") +
        "</div>" +
        '<div class="card pp-chart"><h3>近 14 日流水趋势</h3><div class="pp-bars">' + bars + "</div></div>";
    } catch (e) {
      if (box) box.innerHTML = '<div class="empty-tip">加载失败：' + _esc(String(e).slice(0, 80)) + "</div>";
    }
  };

  /* ---------------- 商户审批 ---------------- */
  PayPlat.loadMerchants = async function () {
    const tbody = document.querySelector("#pp-m-table tbody");
    if (tbody) tbody.innerHTML = '<tr><td colspan="7" class="empty-tip">加载中...</td></tr>';
    try {
      const st = document.getElementById("pp-m-status").value;
      const json = await _req("GET", "/admin/payplat/merchants" + (st === "" ? "" : "?status=" + st));
      const list = (json && json.data) || [];
      PayPlat._merchants = list;
      if (!tbody) return;
      if (!list.length) { tbody.innerHTML = '<tr><td colspan="7" class="empty-tip">暂无商户</td></tr>'; return; }
      const ST = { 0: ["待审核", "warn"], 1: ["已通过", "ok"], 2: ["已拒绝", "flat"] };
      tbody.innerHTML = list.map(function (m, i) {
        const s = ST[m.status] || ["未知", "flat"];
        const ops = m.status === 0
          ? '<button class="btn btn-primary btn-sm" onclick="PayPlat.review(' + m.id + ',\'approve\')">通过</button> ' +
            '<button class="btn btn-ghost btn-sm" onclick="PayPlat.review(' + m.id + ',\'reject\')">拒绝</button>'
          : (m.app_id ? '<code class="pp-code">' + _esc(m.app_id) + "</code>" : "-");
        return "<tr><td>#" + m.id + "</td><td>" + _esc(m.site_name) +
          '</td><td><div class="pp-user"><b>' + _esc(m.nickname || m.email || ("UID " + m.user_id)) + "</b><small>" + _esc(m.email) + " · UID " + m.user_id + "</small></div></td>" +
          "<td>" + _esc(m.site_url || "-") + "</td><td>¥" + _money(m.balance) + "</td>" +
          '<td><span class="delta ' + s[1] + '">' + s[0] + "</span></td><td>" + ops + "</td></tr>";
      }).join("");
    } catch (e) {
      if (tbody) tbody.innerHTML = '<tr><td colspan="7" class="empty-tip">加载失败：' + _esc(String(e).slice(0, 60)) + "</td></tr>";
    }
  };

  PayPlat.review = async function (id, action) {
    let reason = "";
    if (action === "reject") {
      reason = prompt("请输入拒绝原因：") || "";
      if (!reason) return;
    } else if (!confirm("确认通过该商户入驻？将生成 app_id / app_secret。")) return;
    try {
      const json = await _req("POST", "/admin/payplat/merchant/review", { id: id, action: action, reason: reason });
      if (json && (json.status === "success" || json.code === 1)) {
        _toast(action === "approve" ? "已通过，密钥已生成" : "已拒绝");
        PayPlat.loadMerchants();
      } else _toast((json && (json.message || json.msg)) || "操作失败", false);
    } catch (e) { _toast(String(e).slice(0, 80), false); }
  };

  PayPlat.showSecret = function (i) {
    const m = PayPlat._merchants[i];
    if (!m) return;
    alert("站点：" + m.site_name + "\napp_id: " + (m.app_id || "-") + "\napp_secret: " + (m.app_secret || "-"));
  };

  /* ---------------- 提现审核 ---------------- */
  PayPlat.loadWithdrawals = async function () {
    const tbody = document.querySelector("#pp-w-table tbody");
    if (tbody) tbody.innerHTML = '<tr><td colspan="7" class="empty-tip">加载中...</td></tr>';
    try {
      const st = document.getElementById("pp-w-status").value;
      const json = await _req("GET", "/admin/payplat/withdrawals" + (st === "" ? "" : "?status=" + st));
      const list = (json && json.data) || [];
      PayPlat._withdrawals = list;
      if (!tbody) return;
      if (!list.length) { tbody.innerHTML = '<tr><td colspan="7" class="empty-tip">暂无提现申请</td></tr>'; return; }
      const ST = { 0: ["待审核", "warn"], 1: ["已打款", "ok"], 2: ["已拒绝", "flat"] };
      tbody.innerHTML = list.map(function (w) {
        const s = ST[w.status] || ["未知", "flat"];
        const ops = w.status === 0
          ? '<button class="btn btn-primary btn-sm" onclick="PayPlat.wreview(' + w.id + ',\'approve\')">确认打款</button> ' +
            '<button class="btn btn-ghost btn-sm" onclick="PayPlat.wreview(' + w.id + ',\'reject\')">拒绝</button>'
          : _esc(w.remark || "-");
        return "<tr><td>#" + w.id + "</td><td>" + _esc(w.site_name || ("商户 " + w.merchant_id)) +
          '</td><td><b class="pp-amount">¥' + _money(w.amount) + "</b></td>" +
          "<td>" + _esc(w.account_type) + "</td><td>" + _esc(w.account) + "</td>" +
          '<td><span class="delta ' + s[1] + '">' + s[0] + "</span></td><td>" + ops + "</td></tr>";
      }).join("");
    } catch (e) {
      if (tbody) tbody.innerHTML = '<tr><td colspan="7" class="empty-tip">加载失败：' + _esc(String(e).slice(0, 60)) + "</td></tr>";
    }
  };

  PayPlat.wreview = async function (id, action) {
    const tip = action === "approve"
      ? "确认已向商户完成打款？确认后冻结金额将正式划扣。"
      : "拒绝该提现申请？金额将退回商户余额。";
    if (!confirm(tip)) return;
    try {
      const json = await _req("POST", "/admin/payplat/withdrawal/review", {
        id: id, action: action,
        remark: action === "approve" ? "已确认打款" : (prompt("拒绝原因：") || "审核未通过"),
      });
      if (json && (json.status === "success" || json.code === 1)) {
        _toast(action === "approve" ? "已确认打款" : "已拒绝并退回");
        PayPlat.loadWithdrawals();
      } else _toast((json && (json.message || json.msg)) || "操作失败", false);
    } catch (e) { _toast(String(e).slice(0, 80), false); }
  };

  window.PayPlat = PayPlat;
})();
