/* ============================================================
   晴天资源站管理（qingtian.js）—— 仅超管可见
   ------------------------------------------------------------
   对接后端 /api/v1/admin/qingtian/*（api_qingtian.py）：
   - 商品与卡密：商品列表/上下架/新增编辑 + 卡池导入/删除
   - 订单管理：资源站订单 + 补发卡密
   - 资源站用户：下单用户消费榜
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

  const Qt = { _products: [], _cardsProduct: 0 };

  /* ---------------- 弹窗基础（深色风格，同 biz-modal） ---------------- */
  Qt.openModal = function (title, bodyHtml, footerHtml) {
    Qt.closeModal();
    const wrap = document.createElement("div");
    wrap.className = "biz-modal-mask";
    wrap.id = "qt-modal-mask";
    wrap.innerHTML =
      '<div class="biz-modal">' +
      '  <div class="biz-modal-head"><h3>' + title + '</h3>' +
      '    <button class="biz-modal-x" onclick="Qt.closeModal()" aria-label="关闭">' +
      '      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
      "    </button></div>" +
      '  <div class="biz-modal-body">' + bodyHtml + "</div>" +
      (footerHtml ? '<div class="biz-modal-foot">' + footerHtml + "</div>" : "") +
      "</div>";
    wrap.addEventListener("click", (e) => { if (e.target === wrap) Qt.closeModal(); });
    document.body.appendChild(wrap);
    requestAnimationFrame(() => wrap.classList.add("show"));
  };
  Qt.closeModal = function () {
    const w = document.getElementById("qt-modal-mask");
    if (w) w.remove();
  };

  /* ---------------- 商品与卡密 ---------------- */
  Qt.loadProducts = async function () {
    const tbody = document.querySelector("#qt-p-table tbody");
    if (tbody) tbody.innerHTML = '<tr><td colspan="7" class="empty-tip">加载中...</td></tr>';
    try {
      const json = await _req("GET", "/admin/qingtian/products");
      const list = (json && json.data) || [];
      Qt._products = list;
      if (!tbody) return;
      if (!list.length) { tbody.innerHTML = '<tr><td colspan="7" class="empty-tip">暂无商品，点击「新增商品」创建</td></tr>'; return; }
      tbody.innerHTML = list.map(function (p) {
        return "<tr><td>#" + p.id + "</td><td><b>" + _esc(p.name) + "</b><small>" + _esc(p.description || "-") + "</small></td>" +
          "<td>" + _esc(p.category || "-") + "</td>" +
          '<td><span class="delta ' + (p.type === "card" ? "ok" : "warn") + '">' + (p.type === "card" ? "卡密" : "服务") + "</span></td>" +
          '<td><b class="qt-amount">¥' + _money(p.price) + '</b><small> ' + (p.min_qty || 1) + "~" + (p.max_qty || "?") + "</small></td>" +
          '<td><span class="delta ' + (p.status === 1 ? "ok" : "flat") + '">' + (p.status === 1 ? "上架" : "下架") + "</span></td>" +
          "<td>" +
          '<button class="btn btn-ghost btn-sm" onclick="Qt.toggle(' + p.id + ',' + (p.status === 1 ? 0 : 1) + ')">' + (p.status === 1 ? "下架" : "上架") + "</button> " +
          '<button class="btn btn-ghost btn-sm" onclick="Qt.edit(' + p.id + ')">编辑</button> ' +
          '<button class="btn btn-ghost btn-sm" onclick="Qt.cardsOf(' + p.id + ')">卡池</button>' +
          "</td></tr>";
      }).join("");
    } catch (e) {
      if (tbody) tbody.innerHTML = '<tr><td colspan="7" class="empty-tip">加载失败：' + _esc(String(e).slice(0, 60)) + "</td></tr>";
    }
  };

  Qt.openNew = function () { Qt.editForm(null); };

  Qt.edit = function (id) {
    const p = Qt._products.find(x => x.id === id);
    if (p) Qt.editForm(p);
  };

  Qt.editForm = function (p) {
    p = p || {};
    const body =
      '<div class="field"><label class="field-label">商品名称</label><input class="input" id="qt-p-name" value="' + _esc(p.name || "") + '" /></div>' +
      '<div class="f-row" style="display:flex;gap:12px">' +
      '<div class="field" style="flex:1"><label class="field-label">分类</label><input class="input" id="qt-p-cat" value="' + _esc(p.category || "") + '" placeholder="如：会员 / 软件" /></div>' +
      '<div class="field" style="flex:1"><label class="field-label">类型</label><select class="input" id="qt-p-type"><option value="card"' + (p.type === "card" ? " selected" : "") + '>卡密（自动发货）</option><option value="service"' + (p.type === "service" ? " selected" : "") + '>服务（人工处理）</option></select></div>' +
      "</div>" +
      '<div class="f-row" style="display:flex;gap:12px">' +
      '<div class="field" style="flex:1"><label class="field-label">单价（元）</label><input class="input" id="qt-p-price" type="number" step="0.01" value="' + (p.price || "") + '" /></div>' +
      '<div class="field" style="flex:1"><label class="field-label">最低数量</label><input class="input" id="qt-p-min" type="number" value="' + (p.min_qty || 1) + '" /></div>' +
      '<div class="field" style="flex:1"><label class="field-label">最高数量</label><input class="input" id="qt-p-max" type="number" value="' + (p.max_qty || 99) + '" /></div>' +
      "</div>" +
      '<div class="field"><label class="field-label">商品说明</label><textarea class="input" id="qt-p-desc" rows="3">' + _esc(p.description || "") + "</textarea></div>";
    const foot =
      '<button class="btn btn-ghost" onclick="Qt.closeModal()">取消</button>' +
      '<button class="btn btn-primary" onclick="Qt.save(' + (p.id || 0) + ')">保存</button>';
    Qt.openModal(p.id ? "编辑商品 #" + p.id : "新增商品", body, foot);
  };

  Qt.save = async function (pid) {
    const body = {
      id: pid || 0,
      name: document.getElementById("qt-p-name").value.trim(),
      category: document.getElementById("qt-p-cat").value.trim() || "其他",
      type: document.getElementById("qt-p-type").value,
      price: Number(document.getElementById("qt-p-price").value) || 0,
      min_qty: Number(document.getElementById("qt-p-min").value) || 1,
      max_qty: Number(document.getElementById("qt-p-max").value) || 99,
      description: document.getElementById("qt-p-desc").value.trim(),
      status: 1,
    };
    if (!body.name) return _toast("请填写商品名称", false);
    if (body.price <= 0) return _toast("请填写正确的单价", false);
    try {
      const json = await _req("POST", "/admin/qingtian/product/save", body);
      if (json && (json.status === "success" || json.code === 1)) {
        _toast(body.id ? "商品已更新" : "商品已创建");
        Qt.closeModal();
        Qt.loadProducts();
      } else _toast((json && (json.message || json.msg)) || "保存失败", false);
    } catch (e) { _toast(String(e).slice(0, 80), false); }
  };

  Qt.toggle = async function (id, status) {
    if (!confirm("确认" + (status === 1 ? "上架" : "下架") + "该商品？")) return;
    try {
      const json = await _req("POST", "/admin/qingtian/product/delete", { id: id, status: status });
      if (json && (json.status === "success" || json.code === 1)) {
        _toast(status === 1 ? "已上架" : "已下架");
        Qt.loadProducts();
      } else _toast("操作失败", false);
    } catch (e) { _toast(String(e).slice(0, 80), false); }
  };

  /* ---------------- 卡池 ---------------- */
  Qt.cardsOf = async function (pid) {
    Qt._cardsProduct = pid || 0;
    Qt._cardsModal();
    Qt._cardsLoad();
  };

  Qt._cardsModal = function () {
    const body =
      '<div class="page-actions" style="display:flex;gap:10px;margin-bottom:12px">' +
      '<select class="input" id="qt-c-status" onchange="Qt._cardsLoad()" style="max-width:140px">' +
      '<option value="">全部状态</option><option value="0">未售</option><option value="1">已售</option></select>' +
      '<button class="btn btn-ghost btn-sm" onclick="Qt._cardsLoad()">刷新</button>' +
      '<button class="btn btn-primary btn-sm" onclick="Qt.importModal()">导入卡密</button>' +
      "</div>" +
      '<div class="table-wrap"><table class="table" id="qt-c-table">' +
      "<thead><tr><th>ID</th><th>商品</th><th>卡密内容</th><th>状态</th><th>操作 / 订单</th></tr></thead>" +
      '<tbody><tr><td colspan="5" class="empty-tip">加载中...</td></tr></tbody></table></div>';
    Qt.openModal("卡池管理" + (Qt._cardsProduct ? " · 商品 #" + Qt._cardsProduct : ""), body);
  };

  Qt._cardsLoad = async function () {
    const tbody = document.querySelector("#qt-c-table tbody");
    if (tbody) tbody.innerHTML = '<tr><td colspan="5" class="empty-tip">加载中...</td></tr>';
    try {
      const st = document.getElementById("qt-c-status").value;
      const p = Qt._cardsProduct ? "&product_id=" + Qt._cardsProduct : "";
      const json = await _req("GET", "/admin/qingtian/cards?status=" + st + p);
      const list = (json && json.data) || [];
      if (!tbody) return;
      if (!list.length) { tbody.innerHTML = '<tr><td colspan="5" class="empty-tip">卡池为空，请导入卡密</td></tr>'; return; }
      tbody.innerHTML = list.map(function (c) {
        return "<tr><td>#" + c.id + "</td><td>#" + c.product_id + "</td>" +
          '<td><code class="qt-code">' + _esc(c.content) + "</code></td>" +
          '<td><span class="delta ' + (c.status === 0 ? "ok" : "flat") + '">' + (c.status === 0 ? "未售" : "已售") + "</span></td>" +
          "<td>" + (c.status === 0
            ? '<button class="btn btn-ghost btn-sm" onclick="Qt.cardDel(' + c.id + ')">删除</button>'
            : '<small>' + _esc(c.order_trade_no) + "</small>") + "</td></tr>";
      }).join("");
    } catch (e) {
      if (tbody) tbody.innerHTML = '<tr><td colspan="5" class="empty-tip">加载失败：' + _esc(String(e).slice(0, 60)) + "</td></tr>";
    }
  };

  Qt.cardDel = async function (id) {
    if (!confirm("删除该未售卡密？")) return;
    try {
      await _req("POST", "/admin/qingtian/card/delete", { id: id });
      _toast("已删除");
      Qt._cardsLoad();
    } catch (e) { _toast(String(e).slice(0, 80), false); }
  };

  Qt.importModal = function () {
    const body =
      '<div class="field"><label class="field-label">商品 ID</label><input class="input" id="qt-i-product" type="number" value="' + (Qt._cardsProduct || "") + '" placeholder="如：1" /></div>' +
      '<div class="field"><label class="field-label">卡密内容（每行一条，单次最多 2000 条）</label><textarea class="input" id="qt-i-content" rows="8" placeholder="XXXX-XXXX-XXXX&#10;XXXX-XXXX-XXXX"></textarea></div>';
    const foot =
      '<button class="btn btn-ghost" onclick="Qt.closeModal()">取消</button>' +
      '<button class="btn btn-primary" onclick="Qt.import()">导入</button>';
    Qt.openModal("导入卡密", body, foot);
  };

  Qt.import = async function () {
    const pid = Number(document.getElementById("qt-i-product").value) || 0;
    const contents = document.getElementById("qt-i-content").value.trim();
    if (!pid) return _toast("请填写商品 ID", false);
    if (!contents) return _toast("请粘贴卡密内容（每行一条）", false);
    try {
      const json = await _req("POST", "/admin/qingtian/cards/import", { product_id: pid, contents: contents });
      if (json && (json.status === "success" || json.code === 1)) {
        _toast("已导入 " + ((json.data && json.data.imported) || 0) + " 条卡密");
        Qt._cardsProduct = pid;
        Qt._cardsLoad();
      } else _toast((json && (json.message || json.msg)) || "导入失败", false);
    } catch (e) { _toast(String(e).slice(0, 80), false); }
  };

  /* ---------------- 订单管理 ---------------- */
  Qt.loadOrders = async function () {
    const tbody = document.querySelector("#qt-o-table tbody");
    if (tbody) tbody.innerHTML = '<tr><td colspan="8" class="empty-tip">加载中...</td></tr>';
    try {
      const st = document.getElementById("qt-o-status").value;
      const json = await _req("GET", "/admin/qingtian/orders" + (st === "" ? "" : "?status=" + st));
      const list = (json && json.data) || [];
      if (!tbody) return;
      if (!list.length) { tbody.innerHTML = '<tr><td colspan="8" class="empty-tip">暂无订单</td></tr>'; return; }
      tbody.innerHTML = list.map(function (o) {
        const ok = Number(o.status) >= 1;
        return '<tr><td><code class="qt-code">' + _esc(o.trade_no) + "</code></td>" +
          "<td>" + _esc(o.email || ("UID " + o.user_id)) + "</td>" +
          "<td>" + _esc(o.product_name) + " ×" + o.qty + "</td>" +
          '<td><b class="qt-amount">¥' + _money(o.amount) + "</b></td>" +
          "<td>" + _esc(o.method || "-") + "</td>" +
          '<td><span class="delta ' + (ok ? "ok" : "warn") + '">' + _esc(o.status_text || (ok ? "已完成" : "待支付")) + "</span></td>" +
          "<td>" + _time(o.created_at) + "</td>" +
          "<td>" + (ok
            ? (o.card_content ? '<small>' + _esc(o.card_content.slice(0, 30)) + "…</small>" : "-")
            : '<button class="btn btn-primary btn-sm" onclick="Qt.deliver(\'' + o.trade_no + '\')">补发</button>') + "</td></tr>";
      }).join("");
    } catch (e) {
      if (tbody) tbody.innerHTML = '<tr><td colspan="8" class="empty-tip">加载失败：' + _esc(String(e).slice(0, 60)) + "</td></tr>";
    }
  };

  Qt.deliver = async function (tradeNo) {
    const card = prompt("订单号：" + tradeNo + "\n请粘贴需补发的卡密内容（留空则仅标记完成）：") || "";
    if (card === null) return;
    try {
      const json = await _req("POST", "/admin/qingtian/order/deliver", { trade_no: tradeNo, card_content: card });
      if (json && (json.status === "success" || json.code === 1)) {
        _toast("已补发 / 完成");
        Qt.loadOrders();
      } else _toast((json && (json.message || json.msg)) || "操作失败", false);
    } catch (e) { _toast(String(e).slice(0, 80), false); }
  };

  /* ---------------- 资源站用户 ---------------- */
  Qt.loadUsers = async function () {
    const tbody = document.querySelector("#qt-u-table tbody");
    if (tbody) tbody.innerHTML = '<tr><td colspan="6" class="empty-tip">加载中...</td></tr>';
    try {
      const json = await _req("GET", "/admin/qingtian/users");
      const list = (json && json.data) || [];
      if (!tbody) return;
      if (!list.length) { tbody.innerHTML = '<tr><td colspan="6" class="empty-tip">暂无下单用户</td></tr>'; return; }
      tbody.innerHTML = list.map(function (u, i) {
        return "<tr><td>" + (i + 1) + "</td><td><b>" + _esc(u.nickname || "-") + "</b><small>" + _esc(u.email) + "</small></td>" +
          "<td>UID " + u.user_id + "</td><td>" + u.orders + "</td>" +
          '<td><b class="qt-amount">¥' + _money(u.spent) + "</b></td>" +
          "<td>" + _time(u.last_at) + "</td></tr>";
      }).join("");
    } catch (e) {
      if (tbody) tbody.innerHTML = '<tr><td colspan="6" class="empty-tip">加载失败：' + _esc(String(e).slice(0, 60)) + "</td></tr>";
    }
  };

  window.Qt = Qt;
})();
