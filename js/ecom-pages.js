/* ============================================================
   电商自动化五模块真实前端（ecom-pages.js）
   ------------------------------------------------------------
   上游挂机拉单 / 快递追踪 / 全网比价 / 哨兵监控 / 财务OCR对账
   全部对接 api_ecom.py 真实端点，无任何 Mock 数据；
   所有操作统一走黑底 showToast 提示。
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
    const json = await res.json().catch(() => null);
    return json;
  }

  function _esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, c =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function _yuan(fen) {
    const n = Number(fen || 0) / 100;
    return "¥" + n.toFixed(2);
  }

  function _setBadge(tab, text, cls) {
    const b = document.getElementById("ep-badge-" + tab);
    if (b) { b.textContent = text; b.className = "ep-badge " + (cls || ""); }
  }

  function _btn(btn, loading) {
    if (!btn) return;
    if (loading) { btn.classList.add("is-loading"); btn.disabled = true; }
    else { btn.classList.remove("is-loading"); btn.disabled = false; }
  }

  function _empty(tbody, colspan, msg) {
    tbody.innerHTML = '<tr><td colspan="' + colspan + '" class="empty-tip">' + _esc(msg) + "</td></tr>";
  }

  /* ================================================================
     1. 上游挂机拉单（1688 开放平台）
     ================================================================ */
  async function loadConfig() {
    try {
      const json = await _req("GET", "/ecom/pull-orders/config");
      if (json && json.code === 1 && json.data) {
        const d = json.data;
        // 配置为脱敏返回（后 4 位可见），仅回显不覆盖真实值
        if (d.a1688_app_key && !/\*/.test(d.a1688_app_key)) {
          document.getElementById("pull-ak").value = d.a1688_app_key;
        } else if (d.a1688_app_key) {
          document.getElementById("pull-ak").placeholder = "已保存：" + d.a1688_app_key;
        }
        if (d.kd_ebid) document.getElementById("pull-kw").placeholder =
          "当前已保存 EBID：" + d.kd_ebid;
        _setBadge("ecom-pull", "配置已就绪", "ok");
        showToast("1688 配置读取成功（密钥脱敏）", "success");
      } else {
        showToast((json && json.msg) || "配置读取失败", "error");
      }
    } catch (e) {
      showToast("网络异常：" + String(e).slice(0, 60), "error");
    }
  }

  async function saveConfig() {
    const ak = (document.getElementById("pull-ak").value || "").trim();
    const sk = (document.getElementById("pull-sk").value || "").trim();
    if (!ak || !sk) { showToast("AppKey 与 AppSecret 均需填写", "warn"); return; }
    const btn = document.querySelector('#page-ecom-pull .ecom-form-ops .btn-primary');
    _btn(btn, true);
    try {
      const json = await _req("POST", "/ecom/pull-orders/config", {
        a1688_app_key: ak, a1688_app_secret: sk,
      });
      if (json && json.code === 1) {
        showToast("配置已保存（服务端脱敏存储）", "success");
        document.getElementById("pull-sk").value = "";
      } else {
        showToast((json && json.msg) || "保存失败", "error");
      }
    } catch (e) {
      showToast("网络异常：" + String(e).slice(0, 60), "error");
    } finally {
      _btn(btn, false);
    }
  }

  async function syncOrders() {
    const btn = document.getElementById("pull-sync-orders");
    _btn(btn, true); btn.textContent = "同步中...";
    try {
      const json = await _req("POST", "/ecom/pull-orders", { action: "sync_orders" });
      if (json && json.code === 1) {
        showToast(json.msg + "（新增 " + (json.data && json.data.added || 0) + " 单）", "success");
        loadUpstreamOrders();
      } else {
        // 上游错误（如凭据未配置/签名被拒）如实展示
        showToast((json && json.msg) || "同步失败", "error");
      }
    } catch (e) {
      showToast("网络异常：" + String(e).slice(0, 60), "error");
    } finally {
      _btn(btn, false); btn.textContent = "同步上游订单";
    }
  }

  async function syncOffers() {
    const kw = (document.getElementById("pull-kw").value || "").trim();
    const btn = document.getElementById("pull-sync-offers");
    _btn(btn, true); btn.textContent = "同步中...";
    try {
      const json = await _req("POST", "/ecom/pull-orders", { action: "sync_offers", keyword: kw });
      if (json && json.code === 1) {
        showToast(json.msg + "（新增 " + (json.data && json.data.added || 0) + " 款）", "success");
      } else {
        showToast((json && json.msg) || "同步失败", "error");
      }
    } catch (e) {
      showToast("网络异常：" + String(e).slice(0, 60), "error");
    } finally {
      _btn(btn, false); btn.textContent = "同步上游商品";
    }
  }

  async function loadUpstreamOrders() {
    const tbody = document.querySelector("#pull-table tbody");
    _empty(tbody, 5, "加载中...");
    try {
      const json = await _req("GET", "/ecom/pull-orders?limit=50");
      const list = (json && json.code === 1 && json.data && json.data.list) || [];
      if (!list.length) { _empty(tbody, 5, "暂无上游订单，配置 1688 凭据后点击同步"); return; }
      tbody.innerHTML = list.map(function (r) {
        return "<tr><td>" + _esc(r.order_id || r.id) + "</td><td>" + _esc(r.title || "-") +
          "</td><td>¥" + Number(r.amount || 0).toFixed(2) + "</td><td>" + _esc(r.status || "-") +
          "</td><td>" + (window.fmtTime ? fmtTime(r.created_at) : r.created_at) + "</td></tr>";
      }).join("");
      _setBadge("ecom-pull", "接口已就绪", "ok");
    } catch (e) {
      _empty(tbody, 5, "加载失败：" + String(e).slice(0, 60));
    }
  }

  /* ================================================================
     2. 快递追踪（快递鸟 + 物流时间轴）
     ================================================================ */
  async function loadExpressOrders() {
    const tbody = document.querySelector("#express-orders-table tbody");
    _empty(tbody, 5, "加载中...");
    try {
      const json = await _req("GET", "/ecom/express");
      const list = (json && json.code === 1 && json.data && json.data.list) || [];
      if (!list.length) { _empty(tbody, 5, "暂无已发货订单"); return; }
      tbody.innerHTML = list.map(function (r) {
        return "<tr><td>" + _esc(r.trade_no) + "</td><td>" + _esc(r.tracking_company || "-") +
          "</td><td>" + _esc(r.tracking_no) + "</td><td>" +
          (window.fmtTime ? fmtTime(r.shipped_at) : "-") +
          '</td><td><button class="btn btn-ghost btn-sm" onclick="Ecom.pickExpress(\'' +
          _esc(r.tracking_no) + "','" + _esc(r.tracking_company || "") + "')\">查轨迹</button></td></tr>";
      }).join("");
      _setBadge("ecom-express", "接口已就绪", "ok");
    } catch (e) {
      _empty(tbody, 5, "加载失败：" + String(e).slice(0, 60));
    }
  }

  function pickExpress(no, company) {
    document.getElementById("express-no").value = no;
    document.getElementById("express-company").value = company || "";
    queryExpress();
  }
  window.__ecomPickExpress = pickExpress;

  async function queryExpress() {
    const no = (document.getElementById("express-no").value || "").trim();
    const company = (document.getElementById("express-company").value || "").trim();
    const box = document.getElementById("express-result");
    const btn = document.getElementById("express-query-btn");
    if (!no) { showToast("请输入快递单号", "warn"); return; }
    _btn(btn, true); btn.textContent = "查询中...";
    box.innerHTML = '<div class="poster-loading"><div class="poster-spinner"></div><p>快递鸟查询中…</p></div>';
    try {
      const json = await _req("POST", "/ecom/express", { tracking_no: no, company: company });
      if (json && json.code === 1 && json.data) {
        renderTimeline(box, json.data);
        showToast("轨迹查询成功" + (json.data.cached ? "（缓存）" : ""), "success");
      } else {
        box.innerHTML = '<div class="empty-tip">查询失败：' + _esc((json && json.msg) || "未知错误") + "</div>";
        showToast((json && json.msg) || "查询失败", "error");
      }
    } catch (e) {
      box.innerHTML = '<div class="empty-tip">网络异常：' + _esc(String(e).slice(0, 80)) + "</div>";
    } finally {
      _btn(btn, false); btn.textContent = "查询轨迹";
    }
  }

  // 真实物流时间轴（快递鸟 Traces 倒序渲染为时间正序）
  function renderTimeline(box, d) {
    const traces = (d.traces || []).slice().reverse();
    const stateText = { 2: "在途", 3: "签收", 4: "问题件" }[d.state] || ("状态码 " + (d.state || "-"));
    if (!traces.length) {
      box.innerHTML = '<div class="empty-tip">暂无轨迹（' + _esc(stateText) + "）</div>";
      return;
    }
    box.innerHTML =
      '<div class="tl-head"><span class="tl-state s' + _esc(d.state) + '">' + _esc(stateText) + "</span>" +
      "<span>单号 " + _esc(d.tracking_no) + "</span></div>" +
      '<div class="timeline">' + traces.map(function (t, i) {
        const last = i === traces.length - 1;
        return '<div class="tl-item' + (last ? " tl-latest" : "") + '">' +
          '<div class="tl-dot"></div>' +
          '<div class="tl-body"><div class="tl-time">' + _esc(t.time) + "</div>" +
          '<div class="tl-desc">' + _esc(t.desc) + "</div></div></div>";
      }).join("") + "</div>";
  }

  /* ================================================================
     3. 全网比价（本地在售 vs 上游同步商品）
     ================================================================ */
  async function compare() {
    const kw = (document.getElementById("price-kw").value || "").trim();
    const tbody = document.querySelector("#price-table tbody");
    _empty(tbody, 6, "比价计算中...");
    try {
      const json = await _req("POST", "/ecom/price", { keyword: kw });
      const d = (json && json.code === 1 && json.data) || {};
      const list = d.rows || [];
      if (!list.length) {
        _empty(tbody, 6, "暂无可比价数据（需先在售商品与上游同步商品标题相近）");
        showToast("比价完成：本地 " + (d.local_total || 0) + " 款 / 上游 " + (d.upstream_total || 0) +
          " 款 / 匹配 " + (d.matched || 0) + " 款", "info");
        return;
      }
      tbody.innerHTML = list.map(function (r) {
        const margin = Number(r.margin_pct || 0);
        const marginCls = margin >= 20 ? "up" : (margin > 0 ? "flat" : "down");
        const advice = margin >= 20 ? "利润充足，可加大推广"
          : (margin > 0 ? "利润偏薄，可微调售价" : "倒挂风险，建议上调售价或换货源");
        return "<tr><td>" + _esc(r.local_title) + "</td><td>¥" + Number(r.local_price || 0).toFixed(2) +
          "</td><td>" + (r.upstream_price ? "¥" + Number(r.upstream_price).toFixed(2) : "无上游数据") +
          "</td><td>" + (r.diff >= 0 ? "+" : "") + Number(r.diff || 0).toFixed(2) +
          '</td><td><span class="delta ' + marginCls + '">' +
          margin.toFixed(1) + "%</span></td><td>" + _esc(advice) + "</td></tr>";
      }).join("");
      _setBadge("ecom-price", "接口已就绪", "ok");
      showToast("比价完成：匹配 " + list.length + " 款", "success");
    } catch (e) {
      _empty(tbody, 6, "比价失败：" + String(e).slice(0, 60));
    }
  }

  /* ================================================================
     4. 哨兵监控（规则 CRUD + 巡检 + 告警日志）
     ================================================================ */
  const RULE_TEXT = {
    price_lt: "价格低于", price_gt: "价格高于",
    stock_lt: "库存低于", stock_gt: "库存高于",
  };

  async function loadSentinel() {
    try {
      const json = await _req("GET", "/ecom/sentinel");
      if (!(json && json.code === 1 && json.data)) {
        showToast((json && json.msg) || "加载失败", "error"); return;
      }
      const items = json.data.items || [], logs = json.data.logs || [];
      const t1 = document.querySelector("#sentinel-table tbody");
      if (!items.length) _empty(t1, 7, "暂无监控规则，点击「新建监控」创建");
      else {
        t1.innerHTML = items.map(function (r) {
          const rk = (r.rule_type || "price") + "_" + (r.rule_op || "lt");
          return "<tr><td>" + _esc(r.title) + "</td><td>" +
            _esc({ price: "价格", stock: "库存" }[r.rule_type] || r.rule_type) + "</td><td>" +
            _esc(RULE_TEXT[rk] || r.rule_op) + "</td><td>" + _esc(r.rule_value) + "</td><td>" +
            Math.round((r.check_interval || 300) / 60) + " 分钟</td><td>" +
            (r.enabled ? '<span class="delta up">启用</span>' : '<span class="delta flat">停用</span>') +
            "</td><td>" +
            '<button class="btn btn-ghost btn-sm" onclick="Ecom.runSentinel(' + r.id + ')">巡检</button> ' +
            '<button class="btn btn-ghost btn-sm" onclick="Ecom.delSentinel(' + r.id + ')">删除</button>' +
            "</td></tr>";
        }).join("");
      }
      const t2 = document.querySelector("#sentinel-log-table tbody");
      if (!logs.length) _empty(t2, 4, "暂无告警日志");
      else {
        const LV = { warn: ["告警", "warn"], info: ["信息", "ok"], error: ["异常", "err"] };
        t2.innerHTML = logs.map(function (r) {
          const lv = LV[r.level] || LV.info;
          return "<tr><td>" + (window.fmtTime ? fmtTime(r.created_at) : r.created_at) + "</td><td>#" +
            _esc(r.sentinel_id) + "</td><td>" +
            '<span class="delta ' + lv[1] + '">' + lv[0] + "</span></td><td>" +
            _esc(r.message) + (r.snapshot ? ' <small class="tk-muted">' + _esc(r.snapshot) + "</small>" : "") +
            "</td></tr>";
        }).join("");
      }
      _setBadge("ecom-sentinel", "接口已就绪", "ok");
    } catch (e) {
      showToast("网络异常：" + String(e).slice(0, 60), "error");
    }
  }

  function openSentinel() {
    const wrap = document.createElement("div");
    wrap.className = "biz-modal-mask"; wrap.id = "biz-modal-mask";
    wrap.innerHTML =
      '<div class="biz-modal">' +
      '  <div class="biz-modal-head"><h3>新建监控规则</h3>' +
      '    <button class="biz-modal-x" onclick="_closeBizModal()" aria-label="关闭">' +
      '      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
      "    </button></div>" +
      '  <div class="biz-modal-body">' +
      '    <label class="biz-label">监控标题</label>' +
      '    <input class="biz-input" id="sn-title" placeholder="例如：热销款价格破位巡检">' +
      '    <label class="biz-label">监控类型</label>' +
      '    <select class="biz-input" id="sn-type"><option value="price">价格</option><option value="stock">库存</option></select>' +
      '    <label class="biz-label">触发规则</label>' +
      '    <select class="biz-input" id="sn-op"><option value="lt">低于阈值时告警</option><option value="gt">高于阈值时告警</option></select>' +
      '    <label class="biz-label">阈值</label>' +
      '    <input class="biz-input" id="sn-value" type="number" step="0.01" placeholder="价格单位元 / 库存单位件">' +
      '    <label class="biz-label">巡检间隔（秒，最小 60）</label>' +
      '    <input class="biz-input" id="sn-interval" type="number" value="300">' +
      "  </div>" +
      '  <div class="biz-modal-foot"><button class="btn btn-primary btn-sm" id="sn-save" onclick="Ecom.saveSentinel()">创建规则</button></div>' +
      "</div>";
    wrap.addEventListener("click", (e) => { if (e.target === wrap) _closeBizModal(); });
    document.body.appendChild(wrap);
    requestAnimationFrame(() => wrap.classList.add("show"));
  }

  async function saveSentinel() {
    const title = (document.getElementById("sn-title").value || "").trim();
    const rule_value = document.getElementById("sn-value").value;
    if (!title || rule_value === "") { showToast("标题与阈值不能为空", "warn"); return; }
    const btn = document.getElementById("sn-save");
    _btn(btn, true);
    try {
      const json = await _req("POST", "/ecom/sentinel/save", {
        title: title,
        target_type: "local",
        rule_type: document.getElementById("sn-type").value,
        rule_op: document.getElementById("sn-op").value,
        rule_value: Number(rule_value),
        interval: Number(document.getElementById("sn-interval").value || 300),
      });
      if (json && json.code === 1) {
        showToast("监控规则已创建", "success");
        if (window._closeBizModal) _closeBizModal();
        loadSentinel();
      } else {
        showToast((json && json.msg) || "创建失败", "error");
      }
    } catch (e) {
      showToast("网络异常：" + String(e).slice(0, 60), "error");
    } finally {
      _btn(btn, false);
    }
  }

  async function delSentinel(id) {
    if (!confirm("确认删除该监控规则及其告警日志？")) return;
    try {
      const json = await _req("POST", "/ecom/sentinel/delete", { id: id });
      if (json && json.code === 1) { showToast("已删除", "success"); loadSentinel(); }
      else showToast((json && json.msg) || "删除失败", "error");
    } catch (e) {
      showToast("网络异常：" + String(e).slice(0, 60), "error");
    }
  }

  async function runSentinel(id) {
    showToast("巡检进行中...", "info");
    try {
      const json = await _req("POST", "/ecom/sentinel/run", { id: id || 0 });
      if (json && json.code === 1 && json.data) {
        const d = json.data;
        showToast("巡检完成：检查 " + d.checked + " 项，触发 " + d.fired + " 条告警",
          d.fired > 0 ? "warn" : "success");
        loadSentinel();
      } else {
        showToast((json && json.msg) || "巡检失败", "error");
      }
    } catch (e) {
      showToast("网络异常：" + String(e).slice(0, 60), "error");
    }
  }

  /* ================================================================
     5. 财务 OCR 对账（智谱 GLM-4V）
     ================================================================ */
  async function runOcr() {
    const image = (document.getElementById("ocr-image").value || "").trim();
    const order_no = (document.getElementById("ocr-order-no").value || "").trim();
    const box = document.getElementById("ocr-result");
    const btn = document.getElementById("ocr-run-btn");
    if (!/^https?:\/\//.test(image)) { showToast("请填写可公网访问的票据图片 URL", "warn"); return; }
    _btn(btn, true); btn.textContent = "识别中...";
    box.innerHTML = '<div class="poster-loading"><div class="poster-spinner"></div><p>GLM-4V 识别票据中…</p><small>约 5-15 秒</small></div>';
    try {
      const json = await _req("POST", "/ecom/ocr", { image: image, order_no: order_no });
      if (json && json.code === 1 && json.data) {
        renderOcr(box, json.data);
        showToast("识别完成", "success");
        _setBadge("ecom-ocr", "接口已就绪", "ok");
      } else {
        box.innerHTML = '<div class="empty-tip">识别失败：' + _esc((json && json.msg) || "未知错误") + "</div>";
        showToast((json && json.msg) || "识别失败", "error");
      }
    } catch (e) {
      box.innerHTML = '<div class="empty-tip">网络异常：' + _esc(String(e).slice(0, 80)) + "</div>";
    } finally {
      _btn(btn, false); btn.textContent = "开始识别对账";
    }
  }

  function renderOcr(box, d) {
    const ok = !!d.reconciled;
    const order = d.order || null;
    box.innerHTML =
      '<div class="ocr-amount"><span>识别金额</span><b>¥' + _esc(Number(d.amount || 0).toFixed(2)) + "</b></div>" +
      (d.ocr_order_no && d.ocr_order_no !== "无" ? '<div class="ocr-match"><span>识别单号</span><b>' + _esc(d.ocr_order_no) + "</b></div>" : "") +
      '<div class="ocr-match">' +
      "  <span>匹配订单</span><b>" + (order ? _esc(order.trade_no) : "未匹配") +
      "  <span>匹配方式</span><b>" + _esc(d.match_mode || "-") + "</b>" +
      "  <span>订单金额</span><b>" + (order ? "¥" + Number(order.total_amount || 0).toFixed(2) : "-") + "</b>" +
      "  <span>差额</span><b>" + (d.diff != null ? (d.diff >= 0 ? "+" : "") + Number(d.diff).toFixed(2) : "-") + "</b>" +
      "</div>" +
      '<div class="ocr-verdict ' + (ok ? "ok" : "bad") + '">' +
      (ok ? "账实相符" : (order ? "账实不符，请人工复核" : "未找到匹配订单")) + "</div>" +
      (d.ocr_text ? '<pre class="ocr-raw">' + _esc(String(d.ocr_text).slice(0, 600)) + "</pre>" : "");
  }

  /* ================================================================
     入口：进入页面即加载真实数据
     ================================================================ */
  function enter(tab) {
    if (tab === "ecom-pull") { loadUpstreamOrders(); }
    else if (tab === "ecom-express") { loadExpressOrders(); }
    else if (tab === "ecom-price") { compare(); }
    else if (tab === "ecom-sentinel") { loadSentinel(); }
    // ecom-ocr 无自动加载（需用户主动上传）
  }

  window.Ecom = {
    enter: enter,
    loadConfig: loadConfig, saveConfig: saveConfig,
    syncOrders: syncOrders, syncOffers: syncOffers, loadUpstreamOrders: loadUpstreamOrders,
    loadExpressOrders: loadExpressOrders, queryExpress: queryExpress,
    pickExpress: function (no, company) { window.__ecomPickExpress(no, company); },
    compare: compare,
    loadSentinel: loadSentinel, openSentinel: openSentinel, saveSentinel: saveSentinel,
    delSentinel: delSentinel, runSentinel: runSentinel,
    runOcr: runOcr,
  };
})();
