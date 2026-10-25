// ============================================================
// shop_admin.js - 电商业务中台（商品管理 / 订单与代发）
// 真实接口，无假数据：
//   GET  /admin/shop/overview            商品与订单 KPI
//   GET  /admin/shop/categories          分类聚合
//   GET  /admin/shop/products            商品列表（keyword/category/status 过滤）
//   POST /admin/shop/product/save        新增 / 编辑
//   POST /admin/shop/product/delete      删除
//   POST /admin/shop/product/status      上下架
//   POST /admin/upload                   商品主图直传 OSS
//   GET  /admin/shop/orders              订单列表（trade_no/status 过滤）
//   GET  /admin/shop/order/detail        订单详情（收货信息 + 商品明细）
//   GET  /admin/shop/order/purchase      采购文本（1688 拍单用）
//   POST /admin/shop/order/ship          发货（填快递单号）
//   POST /admin/shop/order/status        状态流转
// 依赖：app.js 的 API_BASE / showToast / escapeHtml
// ============================================================

const SHOP_STATUS = {
  0: { text: "待付款", cls: "warn" },
  1: { text: "待发货", cls: "pending" },
  2: { text: "已发货", cls: "ok" },
  3: { text: "已完结", cls: "done" },
  4: { text: "已退款", cls: "refund" },
};

// 线路图标（纯色 SVG 线条，用于头像/无图占位）
const SHOP_SVG = {
  search: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
  image: '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M21 15l-5-5-9 9"/></svg>',
  copy: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M15 9V5a1 1 0 00-1-1H5a1 1 0 00-1 1v9a1 1 0 001 1h4"/></svg>',
  truck: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 7h11v9H2z"/><path d="M13 10h4l3 3v3h-7"/><circle cx="6" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/></svg>',
  edit: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>',
  trash: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>',
  check: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 6L9 17l-5-5"/></svg>',
  eyeoff: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 3l18 18"/><path d="M10.6 6.3A9 9 0 0121 12s-1.4 2.3-3.9 3.7"/><path d="M6.2 7.7C4 9.2 3 12 3 12s3.5 5.4 9 5.4c1.4 0 2.6-.3 3.7-.8"/><path d="M9.9 9.9a3 3 0 004.2 4.2"/></svg>',
  close: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 6L6 18M6 6l12 12"/></svg>',
  sparkles: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z"/><path d="M18.5 15.5l.9 2.4 2.4.9-2.4.9-.9 2.4-.9-2.4-2.4-.9 2.4-.9.9-2.4z"/></svg>',
};

window.ShopAdmin = {
  _products: [],
  _cats: [],
  _orders: [],
  _current: null,     // 当前订单详情
  _uploading: false,

  _token() { return localStorage.getItem("lynli_admin_token") || ""; },
  _headers() { return { "Authorization": "Bearer " + this._token(), "Content-Type": "application/json" }; },

  async _get(path) {
    const res = await fetch(`${API_BASE}${path}`, { headers: { "Authorization": "Bearer " + this._token() } });
    let j = null;
    try { j = await res.json(); } catch (e) { j = null; }
    if (!j) throw new Error("后端无响应");
    if (j.code !== 1) throw new Error(j.msg || j.message || "请求失败");
    return j.data;
  },
  async _post(path, body) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST", headers: this._headers(), body: JSON.stringify(body || {}),
    });
    let j = null;
    try { j = await res.json(); } catch (e) { j = null; }
    if (!j) throw new Error("后端无响应");
    if (j.code !== 1) throw new Error(j.msg || j.message || "操作失败");
    return j;
  },

  // ==================================================== 入口
  load() { this.loadOverview(); this.loadCats(); this.loadProducts(); },

  money(v) {
    const n = Number(v || 0);
    return "¥" + n.toFixed(2);
  },

  async loadOverview() {
    const box = document.getElementById("shop-kpis");
    if (!box) return;
    box.innerHTML = '<div class="empty-tip">加载中...</div>';
    try {
      const d = await this._get("/admin/shop/overview");
      const kpis = [
        { label: "商品总数", value: d.products_total, tip: "在售 " + d.products_online },
        { label: "可用库存", value: d.stock_total, tip: "在售商品库存合计" },
        { label: "待发货", value: d.orders_toship, tip: "待付款 " + d.orders_pending },
        { label: "今日成交额", value: this.money(d.today_amount), tip: "今日 " + d.today_count + " 单" },
      ];
      box.innerHTML = kpis.map(k => `
        <div class="shop-kpi">
          <div class="sk-label">${escapeHtml(k.label)}</div>
          <div class="sk-value">${escapeHtml(String(k.value))}</div>
          <div class="sk-tip">${escapeHtml(k.tip)}</div>
        </div>`).join("");
    } catch (e) {
      box.innerHTML = '<div class="empty-tip">' + escapeHtml(e.message) + '</div>';
    }
  },

  // ==================================================== 商品
  async loadCats() {
    try {
      this._cats = await this._get("/admin/shop/categories");
      const sel = document.getElementById("shop-cat");
      if (!sel) return;
      const keep = sel.value;
      sel.innerHTML = '<option value="">全部分类</option>' + this._cats.map(c =>
        `<option value="${escapeHtml(c.category)}">${escapeHtml(c.category)}（${c.count}）</option>`).join("");
      sel.value = keep;
    } catch (e) { /* 分类不阻塞列表 */ }
  },

  async loadProducts() {
    const box = document.getElementById("shop-products");
    if (!box) return;
    box.innerHTML = '<div class="empty-tip">加载中...</div>';
    const kw = encodeURIComponent((document.getElementById("shop-kw") || {}).value || "");
    const cat = encodeURIComponent((document.getElementById("shop-cat") || {}).value || "");
    const status = (document.getElementById("shop-status") || {}).value || "";
    try {
      const d = await this._get(`/admin/shop/products?keyword=${kw}&category=${cat}&status=${status}&size=60`);
      this._products = d.list || [];
      window.__products = this._products;   // 供 AI 场景图 / 图转视频弹窗读取（同一份真实商品）
      this.renderProducts();
    } catch (e) {
      box.innerHTML = '<div class="empty-tip">' + escapeHtml(e.message) + '</div>';
    }
  },

  renderProducts() {
    const box = document.getElementById("shop-products");
    if (!box) return;
    if (!this._products.length) {
      box.innerHTML = '<div class="empty-tip">暂无商品，点击右上角「上架商品」录入真实商品</div>';
      return;
    }
    box.innerHTML = this._products.map((p, idx) => {
      const img = p.image
        ? `<img class="sp-img" src="${escapeHtml(p.image)}" alt="" onerror="this.remove();">`
        : '';
      const profit = (Number(p.price) - Number(p.cost)).toFixed(2);
      return `
      <div class="shop-card">
        <div class="sp-media">${img}${!p.image ? '<span class="sp-noimg">' + SHOP_SVG.image + '</span>' : ''}
          <span class="sp-badge ${p.status ? 'on' : 'off'}">${p.status ? '在售' : '已下架'}</span>
        </div>
        <div class="sp-body">
          <div class="sp-cat">${escapeHtml(p.category || '未分类')}</div>
          <div class="sp-title">${escapeHtml(p.title)}</div>
          <div class="sp-sub">${escapeHtml(p.subtitle || '—')}</div>
          <div class="sp-prices">
            <span class="sp-price">${this.money(p.price)}</span>
            <span class="sp-cost">成本 ${this.money(p.cost)}</span>
            <span class="sp-profit">毛利 ${escapeHtml(profit)}</span>
          </div>
          <div class="sp-meta">
            <span>库存 <b>${p.stock}</b></span>
            <span>已售 <b>${p.sold || 0}</b></span>
          </div>
          <div class="sp-ops">
            <button class="btn btn-ghost btn-xs" onclick="ShopAdmin.openForm(${p.id})">${SHOP_SVG.edit} 编辑</button>
            <button class="btn btn-ghost btn-xs" onclick="ShopAdmin.toggleStatus(${p.id},${p.status ? 0 : 1})">${p.status ? SHOP_SVG.eyeoff + ' 下架' : SHOP_SVG.check + ' 上架'}</button>
            <button class="btn btn-ghost btn-xs" onclick="ShopAdmin.removeProduct(${p.id})">${SHOP_SVG.trash}</button>
          </div>
          <div class="sp-ai">
            <span class="sp-ai-label">${SHOP_SVG.sparkles} AI 视觉</span>
            <button class="btn btn-ghost btn-xs" onclick="aiSceneOpen(${idx})">生成场景图</button>
            <button class="btn btn-ghost btn-xs" onclick="aiVideoOpen(${idx})">图转视频</button>
          </div>
        </div>
        </div>
      </div>`;
    }).join("");
  },

  async toggleStatus(id, status) {
    try {
      const r = await this._post("/admin/shop/product/status", { id: id, status: status });
      showToast(r.msg || "已更新");
      this.loadProducts(); this.loadOverview(); this.loadCats();
    } catch (e) { showToast(e.message, "error"); }
  },

  removeProduct(id) {
    const box = document.getElementById("shop-confirm");
    document.getElementById("shop-confirm-text").innerText = "删除后不可恢复，确定删除该商品？";
    document.getElementById("shop-confirm-ok").onclick = async () => {
      this.closeConfirm();
      try {
        const r = await this._post("/admin/shop/product/delete", { id: id });
        showToast(r.msg || "已删除");
        this.loadProducts(); this.loadOverview(); this.loadCats();
      } catch (e) { showToast(e.message, "error"); }
    };
    box.classList.add("show");
  },

  closeConfirm() { document.getElementById("shop-confirm").classList.remove("show"); },

  // ---------- 上架 / 编辑表单 ----------
  async openForm(id) {
    const modal = document.getElementById("shop-form");
    const p = id ? this._products.find(x => String(x.id) === String(id)) : null;
    document.getElementById("shop-form-title").innerText = p ? "编辑商品" : "上架商品";
    this._formImage = p ? (p.image || "") : "";
    const set = (k, v) => { const el = document.getElementById(k); if (el) el.value = (v == null ? "" : v); };
    set("f-id", p ? p.id : 0);
    set("f-title", p ? p.title : "");
    set("f-subtitle", p ? p.subtitle : "");
    set("f-category", p ? p.category : "");
    set("f-cost", p ? p.cost : "");
    set("f-price", p ? p.price : "");
    set("f-stock", p ? p.stock : 0);
    set("f-detail", p ? p.detail : "");
    set("f-source", p ? p.source_url : "");
    const st = document.getElementById("f-status");
    if (st) st.value = p ? String(p.status) : "1";
    this._renderFormImage();
    modal.classList.add("show");
  },

  _renderFormImage() {
    const box = document.getElementById("f-image-preview");
    if (!box) return;
    box.innerHTML = this._formImage
      ? `<img src="${escapeHtml(this._formImage)}" alt="">`
      : `<span class="sp-noimg">${SHOP_SVG.image}</span><em>未上传主图</em>`;
  },

  pickImage() {
    if (this._uploading) return;
    const input = document.getElementById("f-image-input");
    if (input) input.click();
  },

  async onImagePicked(input) {
    const file = input.files && input.files[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { showToast("图片不能超过 8MB", "error"); input.value = ""; return; }
    this._uploading = true;
    const label = document.getElementById("f-image-btn");
    if (label) label.classList.add("is-loading");
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => resolve(fr.result);
        fr.onerror = () => reject(new Error("读取图片失败"));
        fr.readAsDataURL(file);
      });
      const res = await fetch(`${API_BASE}/admin/upload`, {
        method: "POST", headers: this._headers(),
        body: JSON.stringify({ filename: file.name || "product.jpg", content: dataUrl }),
      });
      const j = await res.json().catch(() => null);
      if (!j || j.code !== 1) throw new Error((j && (j.msg || j.message)) || "上传失败");
      this._formImage = j.data.url;
      this._renderFormImage();
      showToast("主图已上传到 OSS");
    } catch (e) {
      showToast("主图上传失败：" + e.message, "error");
    } finally {
      this._uploading = false;
      if (label) label.classList.remove("is-loading");
      input.value = "";
    }
  },

  async submitProduct() {
    const v = id => { const el = document.getElementById(id); return el ? el.value : ""; };
    const body = {
      id: v("f-id"), title: v("f-title").trim(), subtitle: v("f-subtitle").trim(),
      category: v("f-category").trim() || "未分类", cost: v("f-cost"), price: v("f-price"),
      stock: v("f-stock"), image: this._formImage, detail: v("f-detail").trim(),
      source_url: v("f-source").trim(), status: v("f-status"),
    };
    if (!body.title) { showToast("请填写商品标题", "error"); return; }
    const btn = document.getElementById("shop-form-save");
    if (btn) btn.classList.add("is-loading");
    try {
      const r = await this._post("/admin/shop/product/save", body);
      showToast(r.msg || "已保存");
      this.closeForm();
      this.loadProducts(); this.loadOverview(); this.loadCats();
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      if (btn) btn.classList.remove("is-loading");
    }
  },

  closeForm() { document.getElementById("shop-form").classList.remove("show"); },

  // ==================================================== 订单
  async loadOrders() {
    const box = document.getElementById("shop-orders");
    if (!box) return;
    box.innerHTML = '<div class="empty-tip">加载中...</div>';
    const trade = encodeURIComponent((document.getElementById("ord-no") || {}).value || "");
    const status = (document.getElementById("ord-status") || {}).value || "";
    try {
      const d = await this._get(`/admin/shop/orders?trade_no=${trade}&status=${status}&size=60`);
      this._orders = d.list || [];
      this.renderOrders();
    } catch (e) {
      box.innerHTML = '<div class="empty-tip">' + escapeHtml(e.message) + '</div>';
    }
  },

  renderOrders() {
    const box = document.getElementById("shop-orders");
    if (!box) return;
    if (!this._orders.length) {
      box.innerHTML = '<div class="empty-tip">暂无订单数据</div>';
      return;
    }
    box.innerHTML = this._orders.map(o => {
      const st = SHOP_STATUS[o.status] || { text: "未知", cls: "done" };
      const itemsHtml = (o.items || []).slice(0, 3).map(it => `
        <div class="so-item">
          ${it.image ? `<img class="so-img" src="${escapeHtml(it.image)}" alt="" onerror="this.remove();">` : ''}
          <span class="so-item-title">${escapeHtml(it.title)}</span>
          <span class="so-item-qty">x${o.items.length ? it.qty : it.qty}</span>
        </div>`).join("") || '<div class="so-item"><span class="so-item-title">无商品明细</span></div>';
      const more = (o.items || []).length > 3 ? `<div class="so-item"><span class="so-item-title">等 ${o.items.length} 件商品</span></div>` : "";
      return `
      <div class="shop-order-card">
        <div class="so-top">
          <div class="so-no">${escapeHtml(o.trade_no)}</div>
          <span class="shop-badge ${st.cls}">${escapeHtml(st.text)}</span>
        </div>
        <div class="so-time">下单 ${escapeHtml(o.created_text || '—')}</div>
        <div class="so-addr">
          <span class="so-name">${escapeHtml(o.receiver_name)}</span>
          <span class="so-phone">${escapeHtml(o.receiver_phone)}</span>
          <span class="so-addrtext">${escapeHtml([o.province, o.city, o.district, o.receiver_address].filter(Boolean).join(" "))}</span>
        </div>
        <div class="so-items">${itemsHtml}${more}</div>
        <div class="so-bottom">
          <div class="so-amount">${this.money(o.total_amount)}<em>${o.tracking_no ? ' · ' + escapeHtml(o.tracking_no) : ''}</em></div>
          <div class="so-ops">
            <button class="btn btn-ghost btn-xs" onclick="ShopAdmin.openDetail('${escapeHtml(o.trade_no)}')">详情</button>
            <button class="btn btn-ghost btn-xs" onclick="ShopAdmin.copyPurchase('${escapeHtml(o.trade_no)}')">${SHOP_SVG.copy} 采购</button>
            ${o.status === 1 ? `<button class="btn btn-primary btn-xs" onclick="ShopAdmin.openShip('${escapeHtml(o.trade_no)}')">${SHOP_SVG.truck} 发货</button>` : ''}
          </div>
        </div>
      </div>`;
    }).join("");
  },

  async openDetail(tradeNo) {
    const modal = document.getElementById("shop-order-modal");
    try {
      const d = await this._get(`/admin/shop/order/detail?trade_no=${encodeURIComponent(tradeNo)}`);
      this._current = d;
      const st = SHOP_STATUS[d.status] || { text: "未知", cls: "done" };
      const itemsHtml = (d.items || []).map(it => `
        <div class="sd-item">
          ${it.image ? `<img class="sd-img" src="${escapeHtml(it.image)}" alt="" onerror="this.remove();">` : ''}
          <div class="sd-item-main">
            <div class="sd-item-title">${escapeHtml(it.title)}</div>
            <div class="sd-item-meta">单价 ${this.money(it.price)} · 数量 x${it.qty}</div>
          </div>
          <div class="sd-item-amount">${this.money(it.amount)}</div>
        </div>`).join("") || '<div class="empty-tip">该订单无商品明细</div>';
      document.getElementById("shop-order-body").innerHTML = `
        <div class="sd-head">
          <div>
            <div class="sd-no">${escapeHtml(d.trade_no)}</div>
            <div class="sd-time">下单 ${escapeHtml(d.created_text || '—')}</div>
          </div>
          <span class="shop-badge ${st.cls}">${escapeHtml(st.text)}</span>
        </div>
        <div class="sd-block">
          <div class="sd-block-title">收货信息</div>
          <div class="sd-grid">
            <div><label>收货人</label><span>${escapeHtml(d.receiver_name || '—')}</span></div>
            <div><label>联系电话</label><span>${escapeHtml(d.receiver_phone || '—')}</span></div>
            <div><label>所在地区</label><span>${escapeHtml([d.province, d.city, d.district].filter(Boolean).join(" ") || '—')}</span></div>
            <div><label>详细地址</label><span>${escapeHtml(d.receiver_address || '—')}</span></div>
            ${d.remark ? `<div class="sd-full"><label>买家备注</label><span>${escapeHtml(d.remark)}</span></div>` : ''}
            ${d.tracking_no ? `<div class="sd-full"><label>快递单号</label><span>${escapeHtml(d.tracking_no)}${d.tracking_company ? '（' + escapeHtml(d.tracking_company) + '）' : ''}</span></div>` : ''}
          </div>
        </div>
        <div class="sd-block">
          <div class="sd-block-title">商品清单（${d.item_count || 0} 件）</div>
          ${itemsHtml}
        </div>
        <div class="sd-sum">
          <span>订单金额</span><b>${this.money(d.total_amount)}</b>
          <span>成本合计</span><b class="sd-cost">${this.money(d.cost_amount)}</b>
        </div>`;
      const foot = document.getElementById("shop-order-foot");
      let ops = `<button class="btn btn-ghost btn-sm" onclick="ShopAdmin.closeDetail()">关闭</button>
                 <button class="btn btn-primary btn-sm" onclick="ShopAdmin.copyPurchase('${escapeHtml(d.trade_no)}')">${SHOP_SVG.copy} 一键复制采购信息</button>`;
      if (d.status === 1) ops += `<button class="btn btn-primary btn-sm" onclick="ShopAdmin.openShip('${escapeHtml(d.trade_no)}')">${SHOP_SVG.truck} 发货</button>`;
      if (d.status === 2) ops += `<button class="btn btn-ghost btn-sm" onclick="ShopAdmin.setStatus('${escapeHtml(d.trade_no)}',3)">${SHOP_SVG.check} 标记完结</button>`;
      foot.innerHTML = ops;
      modal.classList.add("show");
    } catch (e) {
      showToast(e.message, "error");
    }
  },

  closeDetail() { document.getElementById("shop-order-modal").classList.remove("show"); },

  async copyPurchase(tradeNo) {
    try {
      const d = await this._get(`/admin/shop/order/purchase?trade_no=${encodeURIComponent(tradeNo)}`);
      const text = d.text || "";
      let ok = false;
      try {
        await navigator.clipboard.writeText(text);
        ok = true;
      } catch (e) { ok = false; }
      if (!ok) {
        // 非 HTTPS / 无权限时的降级复制（真实写入剪贴板）
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
        ta.remove();
      }
      showToast(ok ? "采购信息已复制，可直接去 1688 拍单" : "复制失败，请手动选择文本", ok ? "success" : "error");
    } catch (e) {
      showToast(e.message, "error");
    }
  },

  openShip(tradeNo) {
    const el = document.getElementById("shop-ship-no");
    if (el) el.value = "";
    const co = document.getElementById("shop-ship-company");
    if (co) co.value = "shunfeng";
    document.getElementById("shop-ship-trade").innerText = tradeNo;
    document.getElementById("shop-ship").classList.add("show");
  },

  closeShip() { document.getElementById("shop-ship").classList.remove("show"); },

  async submitShip() {
    const tradeNo = document.getElementById("shop-ship-trade").innerText.trim();
    const trackingNo = (document.getElementById("shop-ship-no").value || "").trim();
    const company = (document.getElementById("shop-ship-company").value || "").trim();
    if (!trackingNo) { showToast("请填写快递单号", "error"); return; }
    const btn = document.getElementById("shop-ship-save");
    if (btn) btn.classList.add("is-loading");
    try {
      const r = await this._post("/admin/shop/order/ship", {
        trade_no: tradeNo, tracking_no: trackingNo, tracking_company: company,
      });
      showToast(r.msg || "发货成功");
      this.closeShip();
      this.closeDetail();
      this.loadOrders(); this.loadOverview();
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      if (btn) btn.classList.remove("is-loading");
    }
  },

  async setStatus(tradeNo, status) {
    try {
      const r = await this._post("/admin/shop/order/status", { trade_no: tradeNo, status: status });
      showToast(r.msg || "已更新");
      this.closeDetail();
      this.loadOrders(); this.loadOverview();
    } catch (e) { showToast(e.message, "error"); }
  },
};

window.loadShopAdmin = () => ShopAdmin.load();
window.loadShopOrders = () => ShopAdmin.loadOrders();
