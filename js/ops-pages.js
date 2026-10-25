/* ============================================================
   运营四页真实前端（ops-pages.js）
   ------------------------------------------------------------
   API 分发（api_gateway）/ 服务器探针（api_probe）/
   工单系统（api_tickets_admin）/ 签到分销（api_distribution）
   全部真实 fetch，无 Mock；所有操作黑底 showToast。
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
    return await res.json().catch(() => null);
  }

  function _esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, c =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function _empty(tbody, colspan, msg) {
    tbody.innerHTML = '<tr><td colspan="' + colspan + '" class="empty-tip">' + _esc(msg) + "</td></tr>";
  }

  function _btn(btn, loading) {
    if (!btn) return;
    if (loading) { btn.classList.add("is-loading"); btn.disabled = true; }
    else { btn.classList.remove("is-loading"); btn.disabled = false; }
  }

  /* ================================================================
     API 分发：密钥管理 + 调用日志 + 申请审批
     ================================================================ */
  const ApiKeys = {
    async load() {
      await Promise.all([ApiKeys.loadKeys(), ApiKeys.loadApplies(), ApiKeys.loadLogs()]);
    },

    async loadKeys() {
      const tbody = document.querySelector("#ak-table tbody");
      _empty(tbody, 7, "加载中...");
      try {
        const json = await _req("GET", "/admin/apikeys");
        const list = (json && json.code === 1 && json.data) || [];
        const kpis = document.getElementById("ak-kpis");
        if (kpis) {
          const enabled = list.filter(k => k.enabled).length;
          kpis.innerHTML =
            '<div class="ak-kpi"><b>' + list.length + '</b><span>密钥总数</span></div>' +
            '<div class="ak-kpi"><b>' + enabled + '</b><span>已启用</span></div>' +
            '<div class="ak-kpi"><b>' + (list.length - enabled) + '</b><span>已停用</span></div>';
        }
        if (!list.length) { _empty(tbody, 7, "暂无密钥，点击右上角「签发新 Key」"); return; }
        tbody.innerHTML = list.map(function (k) {
          return "<tr><td>" + _esc(k.name) + "</td><td><code class='ak-key'>" +
            _esc((k.key || "").slice(0, 12) + "…") + "</code></td><td>" + _esc(k.scopes || "read") +
            "</td><td>" + _esc(k.rate_limit || 60) + "</td><td>" +
            (k.enabled ? '<span class="delta up">启用</span>' : '<span class="delta flat">停用</span>') +
            "</td><td>" + (window.fmtTime ? fmtTime(k.created_at) : k.created_at) + "</td><td>" +
            '<button class="btn btn-ghost btn-sm" onclick="ApiKeys.toggle(' + k.id + "," +
            (k.enabled ? 0 : 1) + ')">' + (k.enabled ? "停用" : "启用") + "</button> " +
            '<button class="btn btn-ghost btn-sm" onclick="ApiKeys.del(' + k.id + ')">删除</button>' +
            "</td></tr>";
        }).join("");
      } catch (e) {
        _empty(tbody, 7, "加载失败：" + String(e).slice(0, 60));
      }
    },

    async loadApplies() {
      const tbody = document.querySelector("#ak-apply-table tbody");
      _empty(tbody, 6, "加载中...");
      try {
        const json = await _req("GET", "/admin/apply/list");
        const list = (json && json.code === 1 && json.data) || [];
        if (!list.length) { _empty(tbody, 6, "暂无接入申请"); return; }
        const ST = { 0: ["待审核", "warn"], 1: ["已通过", "ok"], 2: ["已拒绝", "err"] };
        tbody.innerHTML = list.map(function (a) {
          const st = ST[a.status] || ["未知", ""];
          const ops = a.status === 0
            ? '<button class="btn btn-primary btn-sm" onclick="ApiKeys.review(' + a.id + ',\'approve\')">通过并签发</button> ' +
              '<button class="btn btn-ghost btn-sm" onclick="ApiKeys.review(' + a.id + ',\'reject\')">拒绝</button>'
            : "-";
          return "<tr><td>" + _esc(a.app_name) + "</td><td>" + _esc(a.contact) + "</td><td>" +
            _esc((a.use_case || "").slice(0, 40)) + "</td><td>" +
            '<span class="delta ' + st[1] + '">' + st[0] + "</span></td><td>" +
            (window.fmtTime ? fmtTime(a.created_at) : a.created_at) + "</td><td>" + ops + "</td></tr>";
        }).join("");
      } catch (e) {
        _empty(tbody, 6, "加载失败：" + String(e).slice(0, 60));
      }
    },

    async loadLogs() {
      const tbody = document.querySelector("#ak-log-table tbody");
      _empty(tbody, 5, "加载中...");
      const kw = (document.getElementById("ak-log-kw").value || "").trim();
      try {
        const json = await _req("GET", "/admin/apilogs?limit=100" + (kw ? "&q=" + encodeURIComponent(kw) : ""));
        const d = (json && json.code === 1 && json.data) || {};
        const list = d.items || [];
        if (!list.length) { _empty(tbody, 5, "暂无调用日志"); return; }
        tbody.innerHTML = list.map(function (l) {
          return "<tr><td>" + (window.fmtTime ? fmtTime(l.ts) : l.ts) + "</td><td><code>" +
            _esc((l.path || "").slice(0, 60)) + "</code></td><td>" + _esc(l.method || "-") +
            "</td><td>" + _esc(l.ip || "-") + "</td><td>" +
            (l.code === 1 || l.code === 200 ? '<span class="delta up">' + _esc(l.code) + "</span>"
              : '<span class="delta down">' + _esc(l.code) + "</span>") + "</td></tr>";
        }).join("");
      } catch (e) {
        _empty(tbody, 5, "加载失败：" + String(e).slice(0, 60));
      }
    },

    openCreate() {
      const wrap = document.createElement("div");
      wrap.className = "biz-modal-mask"; wrap.id = "biz-modal-mask";
      wrap.innerHTML =
        '<div class="biz-modal">' +
        '  <div class="biz-modal-head"><h3>签发新 API Key</h3>' +
        '    <button class="biz-modal-x" onclick="_closeBizModal()" aria-label="关闭">' +
        '      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
        "    </button></div>" +
        '  <div class="biz-modal-body">' +
        '    <label class="biz-label">密钥名称</label>' +
        '    <input class="biz-input" id="ak-name" placeholder="例如：售卖站商品同步">' +
        '    <label class="biz-label">权限范围</label>' +
        '    <select class="biz-input" id="ak-scopes"><option value="read">只读 read</option><option value="read,write">读写 read,write</option></select>' +
        '    <label class="biz-label">频率限制（次/分钟）</label>' +
        '    <input class="biz-input" id="ak-rate" type="number" value="60" min="1">' +
        "  </div>" +
        '  <div class="biz-modal-foot"><button class="btn btn-primary btn-sm" id="ak-create-btn" onclick="ApiKeys.create()">签发</button></div>' +
        "</div>";
      wrap.addEventListener("click", (e) => { if (e.target === wrap) _closeBizModal(); });
      document.body.appendChild(wrap);
      requestAnimationFrame(() => wrap.classList.add("show"));
    },

    async create() {
      const name = (document.getElementById("ak-name").value || "").trim() || "未命名";
      const btn = document.getElementById("ak-create-btn");
      _btn(btn, true);
      try {
        const json = await _req("POST", "/admin/apikeys/create", {
          name: name,
          scopes: document.getElementById("ak-scopes").value,
          rate_limit: Number(document.getElementById("ak-rate").value || 60),
        });
        if (json && json.code === 1 && json.data && json.data.key) {
          showToast("Key 签发成功，请立即复制保存", "success");
          const wrap = document.getElementById("biz-modal-mask");
          if (wrap) {
            const body = wrap.querySelector(".biz-modal-body");
            body.innerHTML =
              '<div class="ak-key-reveal"><p>密钥仅完整展示这一次，请立即复制：</p>' +
              '<code id="ak-key-text">' + _esc(json.data.key) + "</code>" +
              '<button class="btn btn-primary btn-sm" onclick="ApiKeys.copyKey()">复制</button></div>';
          }
          ApiKeys.loadKeys();
        } else {
          showToast((json && json.msg) || "签发失败", "error");
        }
      } catch (e) {
        showToast("网络异常：" + String(e).slice(0, 60), "error");
      } finally {
        _btn(btn, false);
      }
    },

    copyKey() {
      const txt = document.getElementById("ak-key-text");
      if (!txt) return;
      const done = () => showToast("已复制到剪贴板", "success");
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt.textContent).then(done).catch(() => {
          const r = document.createRange(); r.selectNodeContents(txt);
          const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
          showToast("已选中，请按 Ctrl+C 复制", "info");
        });
      } else {
        const r = document.createRange(); r.selectNodeContents(txt);
        const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
        showToast("已选中，请按 Ctrl+C 复制", "info");
      }
    },

    async toggle(id, enabled) {
      try {
        const json = await _req("POST", "/admin/apikeys/toggle", { id: id, enabled: !!enabled });
        if (json && json.code === 1) {
          showToast(enabled ? "已启用" : "已停用", "success");
          ApiKeys.loadKeys();
        } else showToast("操作失败", "error");
      } catch (e) {
        showToast("网络异常：" + String(e).slice(0, 60), "error");
      }
    },

    async del(id) {
      if (!confirm("确认删除该密钥？删除后使用此 Key 的调用将全部失效。")) return;
      try {
        const json = await _req("POST", "/admin/apikeys/delete", { id: id });
        if (json && json.code === 1) { showToast("已删除", "success"); ApiKeys.loadKeys(); }
        else showToast("删除失败", "error");
      } catch (e) {
        showToast("网络异常：" + String(e).slice(0, 60), "error");
      }
    },

    async review(id, action) {
      const label = action === "approve" ? "通过并自动签发 Key" : "拒绝";
      if (!confirm("确认" + label + "该申请？")) return;
      try {
        const json = await _req("POST", "/admin/apply/review", { id: id, action: action, scopes: "read", rate_limit: 60 });
        if (json && json.code === 1) {
          showToast(json.msg || "已处理", "success");
          ApiKeys.loadApplies(); ApiKeys.loadKeys();
        } else showToast((json && json.msg) || "处理失败", "error");
      } catch (e) {
        showToast("网络异常：" + String(e).slice(0, 60), "error");
      }
    },
  };

  /* ================================================================
     服务器探针：真实 TCP 握手延迟
     ================================================================ */
  const Probe = {
    async load() {
      const grid = document.getElementById("probe-grid");
      grid.innerHTML = '<div class="empty-tip">探测中...</div>';
      try {
        // 节点清单来自公共节点接口（MySQL servers 表）
        const res = await fetch(API_BASE + "/public/nodes");
        const nj = await res.json().catch(() => null);
        const nodes = (nj && nj.code === 1 && nj.data) || [];
        if (!nodes.length) {
          grid.innerHTML = '<div class="empty-tip">暂无服务器节点，请先在节点监控中添加</div>';
          return;
        }
        const json = await _req("POST", "/admin/probe/run", {});
        const results = (json && json.code === 1 && json.data) || {};
        const byId = {};
        (results.list || results.items || []).forEach(function (r) { byId[r.id || r.server_id] = r; });
        grid.innerHTML = nodes.map(function (n) {
          const r = byId[n.id] || {};
          const ok = r.ok === true;
          const lat = ok && r.latency_ms != null ? r.latency_ms + " ms" : "不可达";
          const cls = ok ? (r.latency_ms < 120 ? "good" : (r.latency_ms < 300 ? "fair" : "poor")) : "bad";
          return '<div class="probe-card ' + cls + '">' +
            '<div class="probe-name">' + _esc(n.name) + "</div>" +
            '<div class="probe-host">' + _esc(n.ip || n.domain || "-") + ":" + _esc(n.api_port || 7001) + "</div>" +
            '<div class="probe-lat">' + _esc(lat) + "</div>" +
            '<div class="probe-region">' + _esc(n.region_name || n.region || "-") + "</div>" +
            "</div>";
        }).join("");
        showToast("探测完成", "success");
      } catch (e) {
        grid.innerHTML = '<div class="empty-tip">探测失败：' + _esc(String(e).slice(0, 80)) + "</div>";
      }
    },
    run() { Probe.load(); },
  };

  /* ================================================================
     工单系统：列表 + 详情 + 回复 + 状态流转
     ================================================================ */
  const Tickets = {
    _list: [],

    async load() {
      const tbody = document.querySelector("#tk-table tbody");
      _empty(tbody, 6, "加载中...");
      const status = document.getElementById("tk-status").value;
      const kw = (document.getElementById("tk-kw").value || "").trim();
      try {
        let path = "/admin/tickets?page=1&size=50";
        if (status !== "") path += "&status=" + encodeURIComponent(status);
        if (kw) path += "&kw=" + encodeURIComponent(kw);
        const json = await _req("GET", path);
        const d = (json && json.code === 1 && json.data) || {};
        Tickets._list = d.list || [];
        if (!Tickets._list.length) { _empty(tbody, 6, "暂无工单"); return; }
        const ST = { 1: ["待处理", "warn"], 2: ["处理中", "ok"], 3: ["已关闭", "flat"] };
        tbody.innerHTML = Tickets._list.map(function (t, i) {
          const st = ST[t.status] || ST[1];
          return '<tr onclick="Tickets.open(' + i + ')" style="cursor:pointer"><td>#' + t.id +
            "</td><td>" + _esc(t.subject) + "</td><td>" + _esc(t.nickname || t.email || ("UID " + t.user_id)) +
            "</td><td>" + _esc(t.category || "-") + "</td><td>" +
            '<span class="delta ' + st[1] + '">' + st[0] + "</span></td><td>" +
            (window.fmtTime ? fmtTime(t.updated_at) : t.updated_at) + "</td></tr>";
        }).join("");
      } catch (e) {
        _empty(tbody, 6, "加载失败：" + String(e).slice(0, 60));
      }
    },

    async open(i) {
      const t = Tickets._list[i];
      const box = document.getElementById("tk-detail");
      if (!t) return;
      box.innerHTML = '<div class="empty-tip">加载中...</div>';
      try {
        const json = await _req("GET", "/admin/ticket/detail?id=" + t.id);
        const d = (json && json.code === 1 && json.data) || t;
        const ST = { 1: "待处理", 2: "处理中", 3: "已关闭" };
        box.innerHTML =
          '<div class="tk-detail-head">' +
          '  <h3>#' + _esc(d.id) + " " + _esc(d.subject) + "</h3>" +
          '  <span class="delta ' + ({ 1: "warn", 2: "ok", 3: "flat" }[d.status] || "warn") + '">' +
          _esc(ST[d.status] || d.status) + "</span>" +
          "</div>" +
          '<div class="tk-detail-meta">用户 ' + _esc(d.nickname || d.email || d.user_id) +
          " · 分类 " + _esc(d.category || "-") + " · 创建于 " +
          (window.fmtTime ? fmtTime(d.created_at) : d.created_at) + "</div>" +
          '<div class="tk-detail-content">' + _esc(d.content).replace(/\n/g, "<br>") + "</div>" +
          (d.reply ? '<div class="tk-detail-reply"><b>客服回复：</b>' + _esc(d.reply) + "</div>" : "") +
          '<div class="tk-detail-ops">' +
          '  <textarea class="input tk-reply-box" id="tk-reply-text" placeholder="输入回复内容（用户将看到）"></textarea>' +
          '  <div class="tk-reply-btns">' +
          '    <button class="btn btn-primary btn-sm" id="tk-reply-btn" onclick="Tickets.reply(' + d.id + ')">发送回复</button>' +
          (d.status !== 3 ? '    <button class="btn btn-ghost btn-sm" onclick="Tickets.setStatus(' + d.id + ',3)">关闭工单</button>' : "") +
          (d.status === 1 ? '    <button class="btn btn-ghost btn-sm" onclick="Tickets.setStatus(' + d.id + ',2)">标记处理中</button>' : "") +
          "  </div>" +
          "</div>";
      } catch (e) {
        box.innerHTML = '<div class="empty-tip">加载失败：' + _esc(String(e).slice(0, 80)) + "</div>";
      }
    },

    async reply(id) {
      const txt = (document.getElementById("tk-reply-text").value || "").trim();
      if (!txt) { showToast("请输入回复内容", "warn"); return; }
      const btn = document.getElementById("tk-reply-btn");
      _btn(btn, true);
      try {
        const json = await _req("POST", "/admin/ticket/reply", { id: id, reply: txt });
        if (json && json.code === 1) {
          showToast("回复已发送", "success");
          Tickets.load();
          const t = Tickets._list.find(x => x.id === id);
          if (t) Tickets.open(Tickets._list.indexOf(t));
        } else showToast((json && json.msg) || "发送失败", "error");
      } catch (e) {
        showToast("网络异常：" + String(e).slice(0, 60), "error");
      } finally {
        _btn(btn, false);
      }
    },

    async setStatus(id, status) {
      try {
        const json = await _req("POST", "/admin/ticket/status", { id: id, status: status });
        if (json && json.code === 1) {
          showToast("状态已更新", "success");
          Tickets.load();
        } else showToast("更新失败", "error");
      } catch (e) {
        showToast("网络异常：" + String(e).slice(0, 60), "error");
      }
    },
  };

  /* ================================================================
     签到分销（运营视角）：KPI + 提现审核 + 签到记录 + 返利流水
     ================================================================ */
  const Distribution = {
    async load() {
      const filter = (document.getElementById("dist-wd-filter") || {}).value || "";
      const [ov, wd, ck, cm] = await Promise.all([
        _req("GET", "/admin/distribution/overview"),
        _req("GET", "/admin/distribution/withdrawals"),
        _req("GET", "/admin/distribution/checkins?limit=50"),
        _req("GET", "/admin/distribution/commissions?limit=100"),
      ]);

      // KPI
      const kpi = document.getElementById("dist-kpis");
      const o = (ov && ov.code === 1 && ov.data) || {};
      if (kpi) {
        kpi.innerHTML =
          '<div class="dist-kpi"><b>' + _esc(o.invited_users || 0) + '</b><span>邀请用户</span></div>' +
          '<div class="dist-kpi"><b>' + _esc(o.paid_invited_orders || 0) + '</b><span>返利订单</span></div>' +
          '<div class="dist-kpi"><b>¥' + ((o.commission_total_fen || 0) / 100).toFixed(2) + '</b><span>累计返利(' + _esc(o.rate || 15) + '%)</span></div>' +
          '<div class="dist-kpi"><b>' + _esc(o.today_checkins || 0) + '</b><span>今日签到</span></div>' +
          '<div class="dist-kpi warn"><b>' + _esc(o.pending_withdrawals || 0) + '</b><span>待审提现</span></div>';
      }

      // 提现审核
      let wlist = ((wd && wd.code === 1 && wd.data) || {}).list || [];
      if (filter !== "") wlist = wlist.filter(w => String(w.status) === filter);
      const t1 = document.querySelector("#dist-wd-table tbody");
      if (!wlist.length) _empty(t1, 7, "暂无提现申请");
      else {
        const ST = { 0: ["待审核", "warn"], 1: ["已通过", "up"], 2: ["已拒绝", "down"] };
        t1.innerHTML = wlist.map(function (w) {
          const st = ST[w.status] || ST[0];
          const ops = w.status === 0
            ? '<button class="btn btn-primary btn-sm" onclick="Distribution.review(' + w.id + ',\'approve\')">通过</button> ' +
              '<button class="btn btn-ghost btn-sm" onclick="Distribution.review(' + w.id + ',\'reject\')">拒绝</button>'
            : "-";
          return "<tr><td>#" + w.id + "</td><td>" + _esc(w.email || w.nickname || ("UID " + w.user_id)) +
            "</td><td>¥" + Number(w.amount || 0).toFixed(2) + "</td><td>" + _esc(w.method) + " / " +
            _esc(w.account) + "</td><td>" + '<span class="delta ' + st[1] + '">' + st[0] + "</span>" +
            "</td><td>" + (window.fmtTime ? fmtTime(w.created_at) : w.created_at) + "</td><td>" + ops + "</td></tr>";
        }).join("");
      }

      // 签到记录
      const clist = ((ck && ck.code === 1 && ck.data) || {}).list || [];
      const t2 = document.querySelector("#dist-checkin-table tbody");
      if (!clist.length) _empty(t2, 4, "暂无签到记录");
      else {
        t2.innerHTML = clist.map(function (c) {
          return "<tr><td>#" + c.id + "</td><td>" + _esc(c.email || c.nickname || ("UID " + c.user_id)) +
            "</td><td>" + _esc(c.day) + "</td><td>" +
            (window.fmtBytes ? fmtBytes(c.reward_bytes) : c.reward_bytes) + "</td></tr>";
        }).join("");
      }

      // 返利流水
      const cmlist = ((cm && cm.code === 1 && cm.data) || {}).list || [];
      const t3 = document.querySelector("#dist-comm-table tbody");
      if (!cmlist.length) _empty(t3, 6, "暂无返利流水（需要存在邀请关系的已付订单）");
      else {
        t3.innerHTML = cmlist.map(function (c) {
          return "<tr><td>" + _esc(c.trade_no || "-") + "</td><td>" + _esc(c.buyer_email || "-") +
            "</td><td>" + _esc(c.inviter_email || "-") + "</td><td>¥" +
            Number(c.amount || 0).toFixed(2) + "</td><td>¥" +
            ((c.commission_fen || 0) / 100).toFixed(2) + "</td><td>" +
            (window.fmtTime ? fmtTime(c.created_at) : c.created_at) + "</td></tr>";
        }).join("");
      }
    },

    async review(id, action) {
      const label = action === "approve" ? "通过并扣减该用户佣金余额" : "拒绝";
      if (!confirm("确认" + label + "？")) return;
      try {
        const json = await _req("POST", "/admin/distribution/withdrawal/review", { id: id, action: action });
        if (json && json.code === 1) {
          showToast(json.msg || "已处理", "success");
          Distribution.load();
        } else showToast((json && json.msg) || "处理失败", "error");
      } catch (e) {
        showToast("网络异常：" + String(e).slice(0, 60), "error");
      }
    },

    async checkin() {
      const btn = document.getElementById("dist-checkin-btn");
      _btn(btn, true);
      try {
        const json = await _req("POST", "/user/checkin", {});
        if (json && json.code === 1) {
          showToast(json.msg + "（连续 " + (json.data && json.data.streak || 1) + " 天）", "success");
        } else {
          showToast((json && json.msg) || "签到失败", "warn");
        }
      } catch (e) {
        showToast("网络异常：" + String(e).slice(0, 60), "error");
      } finally {
        _btn(btn, false);
      }
    },
  };

  /* ================================================================ */
  window.ApiKeys = ApiKeys;
  window.Probe = Probe;
  window.Tickets = Tickets;
  window.Distribution = Distribution;
})();
