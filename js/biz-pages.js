/* ============================================================
   阶段三/四前端：电商自动化 + 极客工具箱 + AI 视觉（biz-pages.js）
   ------------------------------------------------------------
   1) 9 个业务占位页：进入页面即真实 fetch 后端空壳接口，
      按返回特征渲染联调状态（已就绪 / 未部署 / 异常），不写死任何假数据
   2) 海报生成器：POST /api/v1/ai/poster（智谱 CogView 文生图 → OSS）
   3) 商品管理 AI 按钮：AI 场景图（/ai/product-scene，GLM-4V + CogView）、
      商品图转视频（/ai/product-video，CogVideoX-2 异步任务 + 轮询）
   ============================================================ */
(function () {
  "use strict";

  const API_BASE = (location.hostname === "web.lynli.me")
    ? "/api/v1"
    : "https://api.lynli.me/api/v1";

  /* ================= 9 个业务模块元数据 ================= */
  const BIZ = {
    "ecom-pull": {
      title: "上游挂机拉单", ep: "/ecom/pull-orders", method: "POST",
      sub: "上游商家开放 API · 定时自动拉单",
      icon: '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3v12"/><path d="M8 11l4 4 4-4"/><path d="M4 19h16"/><path d="M4 19v2M20 19v2"/></svg>',
      desc: "对接上游供货商开放 API，7×24 挂机定时拉取新订单，自动入库并触发发货流水线。",
      points: ["多上游账号轮询挂机", "订单增量拉取 + 去重", "自动入库与库存扣减", "拉单异常实时告警"],
    },
    "ecom-express": {
      title: "快递追踪", ep: "/ecom/express", method: "POST",
      sub: "物流轨迹聚合 · 签收自动确认",
      icon: '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 7h11v9H2z"/><path d="M13 10h4l3 3v3h-7"/><circle cx="6" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/></svg>',
      desc: "聚合快递公司轨迹查询接口，订单发货后自动追踪物流状态，签收后自动确认完成。",
      points: ["主流快递公司轨迹聚合", "关键节点推送通知", "超时未签收自动标红", "退货件逆向物流跟踪"],
    },
    "ecom-price": {
      title: "全网比价", ep: "/ecom/price", method: "POST",
      sub: "多平台价格监控 · 智能定价建议",
      icon: '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M20.6 13.4L11 3.8V2H9v2L2.6 8.4"/><path d="M6 8l8 8"/><circle cx="17.5" cy="17.5" r="3.5"/></svg>',
      desc: "定时抓取各平台同款商品价格，归一化对比后给出智能定价建议，掌握市场主动权。",
      points: ["多平台同款商品匹配", "价格历史趋势曲线", "智能定价建议", "竞品降价实时提醒"],
    },
    "ecom-sentinel": {
      title: "哨兵监控", ep: "/ecom/sentinel", method: "POST",
      sub: "价格库存巡检 · 异常秒级推送",
      icon: '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/><path d="M12 12l6-4"/></svg>',
      desc: "像哨兵一样定时巡检商品价格、库存、节点可用性，任何异常第一时间推送告警。",
      points: ["多维度巡检任务编排", "异常规则自定义", "秒级推送（邮件/Webhook）", "巡检报告自动生成"],
    },
    "ecom-ocr": {
      title: "财务 OCR 对账", ep: "/ecom/ocr", method: "POST",
      sub: "票据识别 · 订单流自动对账",
      icon: '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/><rect x="8" y="8" width="8" height="5" rx="1"/></svg>',
      desc: "上传支付票据与流水截图，OCR 识别金额后与订单流自动对账，账实不符自动标出。",
      points: ["票据/截图 OCR 识别", "订单流自动匹配", "账实差异一键定位", "对账报告导出"],
    },
    "geek-ip": {
      title: "IP 归属地查询", ep: "/geek/ip", method: "GET",
      sub: "IP 地理定位 · ASN 网络画像",
      icon: '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.8 2.6 4 5.6 4 9s-1.2 6.4-4 9c-2.8-2.6-4-5.6-4-9s1.2-6.4 4-9z"/></svg>',
      desc: "输入任意 IPv4 / IPv6 地址，秒级返回国家地区、城市、运营商与 ASN 画像；留空查本机出口 IP。",
      points: ["IPv4 / IPv6 双栈查询", "国家/省州/城市/邮编定位", "运营商与 ASN 画像", "实时数据来自 ip-api.com"],
    },
    "geek-speed": {
      title: "网络测速", ep: "/geek/speed/ping", method: "GET",
      sub: "真实带宽测量 · 延迟 + 10MB 下载测速",
      icon: '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 18a8 8 0 1116 0"/><path d="M12 14l4-4"/><circle cx="12" cy="14" r="1.4" fill="currentColor" stroke="none"/></svg>',
      desc: "先测量服务端延迟，再从服务端下载 10MB 测速文件，按真实耗时计算下行带宽。",
      points: ["3 次延迟探测取平均", "10MB 真实文件下载测速", "仪表盘实时显示带宽", "测速流量与耗时透明可查"],
    },
    "geek-forex": {
      title: "天气 / 汇率", ep: "/geek/forex", method: "GET",
      sub: "实时天气 · 汇率换算",
      icon: '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M17 18a4 4 0 000-8 6 6 0 00-11.6 1.6A3.5 3.5 0 006 18z"/><path d="M8 21l1-2M12 21l1-2M16 21l1-2"/></svg>',
      desc: "全球城市实时天气与多币种汇率换算，出海业务随手查。",
      points: ["全球城市实时天气（wttr.in）", "10 币种实时汇率（er-api）", "任意金额即时换算", "三日预报速览"],
    },
    "geek-qrcode": {
      title: "二维码生成", ep: "/geek/qrcode", method: "POST",
      probeBody: { text: "https://web.lynli.me" },
      sub: "服务端实时生成 · 即贴即用",
      icon: '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM19 19h2v2h-2z"/></svg>',
      desc: "文本 / 链接一键生成高清二维码，由服务端实时渲染，支持下载 PNG。",
      points: ["文本/链接一键生成", "服务端实时渲染", "PNG 一键下载", "容错级别 M（15%）"],
    },
  };

  /* ================= 通用：探测后端真实接口，渲染联调状态 ================= */
  function _isCatchAll(json) {
    return !!json && json.message === "ok" && json.data === null
      && json.status === "success" && !("code" in json);
  }
  // 后端预留空壳（api_stubs.py）：code 0 + message "待开发" + data.module
  function _isPlanned(json) {
    return !!json && json.message === "待开发" && json.data && json.data.module;
  }

  const EP_ICONS = {
    clock: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    check: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12.5l4.5 4.5L19 7"/></svg>',
    cloud: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 18a4 4 0 010-8 5 5 0 019.6-1.4A3.5 3.5 0 0117 18z"/></svg>',
    warn:  '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l9 16H3z"/><path d="M12 10v4M12 17h.01"/></svg>',
  };

  function _renderBanner(tab, state, meta) {
    const st = document.getElementById("ep-status-" + tab);
    const box = st && st.closest(".biz-api");
    if (!box) return;
    let banner = document.getElementById("ep-banner-" + tab);
    if (!banner) {
      banner = document.createElement("div");
      banner.id = "ep-banner-" + tab;
      banner.className = "ep-state-banner";
      box.insertBefore(banner, box.firstChild);
    }
    const MAP = {
      pending: { cls: "pending", ico: "clock", title: "功能联调中 · 敬请期待",
        desc: "后端接口已成功联通，模块能力正在紧锣密鼓联调中。当前为预留接口返回的状态码，正式能力上线后将自动点亮。" },
      ready:   { cls: "ready", ico: "check", title: "接口已就绪",
        desc: "后端已返回真实业务数据，模块能力已上线可用。" },
      offline: { cls: "offline", ico: "cloud", title: "接口尚未部署",
        desc: "后端尚未部署该接口（命中兜底响应），部署后自动可用，无需前端改动。" },
      error:   { cls: "error", ico: "warn", title: "接口异常",
        desc: "请求过程出现错误，请检查网络或后端服务状态后重试。" },
    };
    const c = MAP[state] || MAP.offline;
    const metaRows = _metaRows(meta);
    banner.className = "ep-state-banner " + c.cls;
    banner.innerHTML =
      '<div class="esb-ico">' + EP_ICONS[c.ico] + '</div>' +
      '<div class="esb-body"><div class="esb-title">' + c.title + '</div>' +
      '<div class="esb-desc">' + c.desc + '</div>' + metaRows + '</div>';
  }

  function _metaRows(d) {
    if (!d) return "";
    const rows = [
      ["模块名称", d.name || d.module || "-"],
      ["模块代码", d.module || "-"],
      ["后端端点", d.endpoint || "-"],
      ["接口状态", (d.status || "").toUpperCase() || "-"],
      ["返回时间", d.ts ? new Date(d.ts * 1000).toLocaleString("zh-CN") : "-"],
    ];
    return '<div class="esb-meta">' + rows.map(function (r) {
      return '<span class="esb-meta-row"><i>' + r[0] + '</i><b>' + String(r[1]).replace(/[<>&]/g, function (m) { return { "<": "&lt;", ">": "&gt;", "&": "&amp;" }[m]; }) + '</b></span>';
    }).join("") + '</div>';
  }

  // state: pending(功能联调中) / ready(已就绪) / offline(未部署) / error(异常)
  const EP_LABEL = {
    pending: ["功能联调中", "warn"], ready: ["已就绪", "ok"],
    offline: ["未部署", "warn"], error: ["异常", "err"],
  };

  function _setEpState(tab, state, raw, meta) {
    const badge = document.getElementById("ep-badge-" + tab);
    const st = document.getElementById("ep-status-" + tab);
    const box = document.getElementById("ep-raw-" + tab);
    const label = EP_LABEL[state] || ["--", ""];
    if (badge) { badge.textContent = label[0]; badge.className = "ep-badge " + label[1]; }
    if (st) st.textContent = label[0];
    if (box != null) box.textContent = typeof raw === "string" ? raw : JSON.stringify(raw, null, 2);
    _renderBanner(tab, state, meta);
  }

  async function loadBizPage(tab) {
    const mod = BIZ[tab];
    if (!mod) return;
    _setEpState(tab, "pending", "探测中...", null);
    try {
      const opts = { method: mod.method };
      if (mod.method === "POST") {
        opts.headers = { "Content-Type": "application/json" };
        opts.body = JSON.stringify(mod.probeBody || {});
      }
      const res = await fetch(API_BASE + mod.ep, opts);
      const json = await res.json().catch(() => null);
      if (_isPlanned(json)) {
        // 后端已联通但模块能力尚在联调 → 高质感「功能联调中 · 敬请期待」空状态卡片
        _setEpState(tab, "pending", json, json.data);
        showToast(mod.title + "：接口已联通，模块联调中", "info");
      } else if (json && json.code === 1) {
        _setEpState(tab, "ready", json, json.data);
        showToast(mod.title + "：接口已就绪", "success");
      } else if (_isCatchAll(json)) {
        _setEpState(tab, "offline", json, null);
        showToast(mod.title + "：后端尚未部署该接口", "warn");
      } else {
        _setEpState(tab, "error", json || ("HTTP " + res.status), null);
      }
    } catch (e) {
      _setEpState(tab, "error", String(e), null);
    }
  }

  // 进入业务页即真实探测；左卡按钮文案统一为「重新探测接口」
  function _initBizLabels() {
    document.querySelectorAll('.biz-feature button[onclick^="loadBizPage"]').forEach(function (b) {
      if (b.textContent.indexOf("重新探测") === -1) b.textContent = "重新探测接口";
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", _initBizLabels);
  else _initBizLabels();

  /* ================= 弹窗基础（与全站深色弹窗风格一致） ================= */
  function _openModal(title, bodyHtml, footerHtml) {
    _closeModal();
    const wrap = document.createElement("div");
    wrap.className = "biz-modal-mask";
    wrap.id = "biz-modal-mask";
    wrap.innerHTML =
      '<div class="biz-modal">' +
      '  <div class="biz-modal-head"><h3>' + title + '</h3>' +
      '    <button class="biz-modal-x" onclick="_closeBizModal()" aria-label="关闭">' +
      '      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
      "    </button></div>" +
      '  <div class="biz-modal-body">' + bodyHtml + "</div>" +
      (footerHtml ? '<div class="biz-modal-foot">' + footerHtml + "</div>" : "") +
      "</div>";
    wrap.addEventListener("click", (e) => { if (e.target === wrap) _closeModal(); });
    document.body.appendChild(wrap);
    requestAnimationFrame(() => wrap.classList.add("show"));
    return wrap;
  }
  function _closeModal() {
    const w = document.getElementById("biz-modal-mask");
    if (w) w.remove();
  }
  window._closeBizModal = _closeModal;

  function _authHeaders() {
    const tok = (window.LynliUser && LynliUser.get().token) || "";
    return { "Authorization": "Bearer " + tok, "Content-Type": "application/json" };
  }

  /* ================= 阶段四 · 海报生成器（双模式） ================= */
  const POSTER_SIZES = [
    { v: "1024x1024", t: "方形 1:1", d: "朋友圈 / 商品图" },
    { v: "768x1344", t: "竖版 9:16", d: "短视频封面" },
    { v: "1344x768", t: "横版 16:9", d: " Banner 头图" },
    { v: "720x1280", t: "全屏 9:16", d: "手机全屏海报" },
    { v: "1280x720", t: "宽屏 16:9", d: "桌面端主视觉" },
  ];
  let _posterSize = "1024x1024";
  let _posterRatio = "1:1";

  function pickPosterSize(v, el) {
    _posterSize = v;
    document.querySelectorAll("#poster-form-image .size-opt").forEach(n => n.classList.remove("active"));
    if (el) el.classList.add("active");
  }
  window.pickPosterSize = pickPosterSize;

  function pickPosterRatio(v, el) {
    _posterRatio = v;
    document.querySelectorAll("#poster-form-html .size-opt").forEach(n => n.classList.remove("active"));
    if (el) el.classList.add("active");
  }
  window.pickPosterRatio = pickPosterRatio;

  function switchPosterMode(mode) {
    document.getElementById("pm-html").classList.toggle("active", mode === "html");
    document.getElementById("pm-image").classList.toggle("active", mode === "image");
    document.getElementById("poster-form-html").style.display = mode === "html" ? "" : "none";
    document.getElementById("poster-form-image").style.display = mode === "image" ? "" : "none";
    _posterReset();
  }
  window.switchPosterMode = switchPosterMode;

  function _posterReset() {
    document.getElementById("poster-result").innerHTML =
      '<div class="poster-empty">' +
      '  <div class="placeholder-icon">' +
      '    <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="1.6"/><path d="M21 15l-5-5-9 9"/></svg>' +
      "  </div>" +
      '  <h3>等待创作</h3>' +
      '  <p>输入促销文案，点击「生成 HTML 海报」，GLM-4-Plus 将实时排版出带 S5 品牌元素的营销海报，可一键截图下载。</p>' +
      "</div>";
  }

  /* ---------- 模式一：glm-4-plus → 带 S5 品牌元素的 HTML 海报 ---------- */
  async function genPosterHtml() {
    const copy = (document.getElementById("poster-copy").value || "").trim();
    const title = (document.getElementById("poster-htitle").value || "").trim();
    const subtitle = (document.getElementById("poster-hsub").value || "").trim();
    const btn = document.getElementById("poster-html-btn");
    const result = document.getElementById("poster-result");
    if (copy.length < 2) { showToast("请先输入海报文案（至少 2 个字）", "warn"); return; }
    btn.classList.add("is-loading"); btn.disabled = true;
    result.innerHTML =
      '<div class="poster-loading">' +
      '  <div class="poster-spinner"></div>' +
      "  <p>GLM-4-Plus 正在排版海报…</p>" +
      "  <small>通常需要 5-15 秒，请稍候</small>" +
      "</div>";
    try {
      const res = await fetch(API_BASE + "/ai/poster-html", {
        method: "POST", headers: _authHeaders(),
        body: JSON.stringify({ copy: copy, title: title, subtitle: subtitle, ratio: _posterRatio, brand: "S5" }),
      });
      const json = await res.json().catch(() => null);
      if (json && json.code === 1 && json.data && json.data.html) {
        result.innerHTML =
          '<div class="poster-stage">' +
          '  <div id="poster-html-render" class="poster-html-render">' + json.data.html + "</div>" +
          "</div>" +
          '<div class="poster-acts">' +
          '  <button class="btn btn-primary btn-sm" id="poster-dl-btn" onclick="downloadPosterPng()">下载 PNG</button>' +
          '  <button class="btn btn-ghost btn-sm" onclick="genPosterHtml()">重新生成</button>' +
          "</div>";
        showToast("海报生成成功", "success");
      } else {
        const msg = (json && (json.msg || json.message)) || ("HTTP " + res.status);
        result.innerHTML = '<div class="empty-tip">生成失败：' + String(msg).slice(0, 140) + "</div>";
        showToast("海报生成失败", "error");
      }
    } catch (e) {
      result.innerHTML = '<div class="empty-tip">网络异常：' + String(e).slice(0, 100) + "</div>";
    } finally {
      btn.classList.remove("is-loading"); btn.disabled = false;
    }
  }
  window.genPosterHtml = genPosterHtml;

  /* ---------- HTML 海报截图下载（html2canvas，本地库无外部依赖） ----------
     三层兜底：foreignObject 原生渲染 → 默认渲染 → 剥离高危样式后渲染，
     保证 AI 输出的任意内联样式组合都能产出 PNG。 */
  async function downloadPosterPng() {
    const node = document.getElementById("poster-html-render");
    const btn = document.getElementById("poster-dl-btn");
    if (!node) { showToast("请先生成海报", "warn"); return; }
    if (typeof html2canvas !== "function") { showToast("截图组件未加载", "error"); return; }
    const old = btn ? btn.innerHTML : "";
    if (btn) { btn.innerHTML = "截图中…"; btn.disabled = true; }
    const base = { scale: 2, backgroundColor: "#ffffff", useCORS: true, logging: false, imageTimeout: 15000 };
    let canvas = null, lastErr = null;
    const attempts = [
      Object.assign({ foreignObjectRendering: true }, base),
      base,
      Object.assign({ foreignObjectRendering: false, onclone: function (doc) {
        // 剥离 html2canvas 不支持的高危样式后重试
        doc.querySelectorAll("*").forEach(function (el) {
          ["filter", "backdropFilter", "mixBlendMode", "clipPath", "mask", "maskImage",
           "backgroundClip", "animation", "transition", "willChange"].forEach(function (k) {
            if (el.style) el.style[k] = "";
          });
        });
      } }, base),
    ];
    for (const opt of attempts) {
      try {
        canvas = await html2canvas(node, opt);
        if (canvas) break;
      } catch (e) { lastErr = e; canvas = null; }
    }
    const finish = () => { if (btn) { btn.innerHTML = old; btn.disabled = false; } };
    if (!canvas) {
      finish();
      showToast("截图失败：" + String(lastErr || "unknown").slice(0, 80), "error");
      return;
    }
    try {
      const a = document.createElement("a");
      a.download = "s5-poster-" + new Date().toISOString().slice(0, 10) + "-" +
        String(Date.now()).slice(-6) + ".png";
      a.href = canvas.toDataURL("image/png");
      a.click();
      showToast("海报 PNG 已开始下载", "success");
    } catch (e) {
      showToast("截图失败：" + String(e).slice(0, 80), "error");
    } finally {
      finish();
    }
  }
  window.downloadPosterPng = downloadPosterPng;

  /* ---------- 模式二：CogView 文生图海报 ---------- */
  async function genPoster() {
    const promptEl = document.getElementById("poster-prompt");
    const modelEl = document.getElementById("poster-model");
    const btn = document.getElementById("poster-gen-btn");
    const result = document.getElementById("poster-result");
    const prompt = (promptEl.value || "").trim();
    if (prompt.length < 4) { showToast("请先输入至少 4 个字的海报描述", "warn"); promptEl.focus(); return; }
    btn.classList.add("is-loading"); btn.disabled = true;
    result.innerHTML =
      '<div class="poster-loading">' +
      '  <div class="poster-spinner"></div>' +
      '  <p>智谱 CogView 正在绘制海报…</p>' +
      '  <small>通常需要 8-16 秒，请稍候</small>' +
      "</div>";
    try {
      const res = await fetch(API_BASE + "/ai/poster", {
        method: "POST", headers: _authHeaders(),
        body: JSON.stringify({ prompt: prompt, size: _posterSize, model: modelEl.value }),
      });
      const json = await res.json().catch(() => null);
      if (json && json.code === 1 && json.data && json.data.url) {
        result.innerHTML =
          '<div class="poster-stage">' +
          '  <img class="poster-img" src="' + json.data.url + '" alt="AI 海报">' +
          "</div>" +
          '<div class="poster-acts">' +
          '  <a class="btn btn-primary btn-sm" href="' + json.data.url + '" target="_blank" rel="noopener">查看原图</a>' +
          '  <button class="btn btn-ghost btn-sm" onclick="genPoster()">重新生成</button>' +
          "</div>";
        showToast("海报生成成功", "success");
      } else {
        const msg = (json && (json.msg || json.message)) || ("HTTP " + res.status);
        result.innerHTML = '<div class="empty-tip">生成失败：' + String(msg).slice(0, 120) + "</div>";
        showToast("海报生成失败", "error");
      }
    } catch (e) {
      result.innerHTML = '<div class="empty-tip">网络异常：' + String(e).slice(0, 100) + "</div>";
    } finally {
      btn.classList.remove("is-loading"); btn.disabled = false;
    }
  }
  window.genPoster = genPoster;

  /* ================= 阶段四 · 商品管理 AI 按钮 ================= */
  const SCENE_PRESETS = [
    "放在高级酒店桌子上",
    "放在木质桌面上，午后阳光，暖色调",
    "干净明亮的电商摄影棚，纯白背景",
    "放在海边沙滩上，自然光，度假风",
    "放在卧室床头柜上，温馨氛围",
    "放在办公室桌面上，商务简洁风",
  ];
  let _scenePrompt = "";

  function _productImage(p) {
    return (p && (p.image || p.icon_url || p.cover || "")) || "";
  }

  function aiSceneOpen(idx) {
    const p = (window.__products || [])[idx];
    if (!p) return;
    const img = _productImage(p);
    _scenePrompt = "";
    const thumb = img
      ? '<img class="ai-scene-thumb" src="' + img.replace(/"/g, "&quot;") + '" alt="" onerror="this.remove();">'
      : '<span class="ai-scene-nothumb">该商品暂无主图</span>';
    _openModal(
      "AI 生成场景图",
      '<p class="biz-tip">智谱 GLM-4V 先读懂商品图，再以商品主图为参考图，由 CogView（默认免费档 CogView-3-Flash）生成带场景氛围的新图（约 15-40 秒）。</p>' +
      '<div class="ai-scene-prod">' + thumb +
      '  <div class="ai-scene-prod-info"><b>' + escapeHtml(p.title || "商品") + "</b>" +
      "    <span>ID " + p.id + " · " + escapeHtml(p.category || "未分类") + "</span></div>" +
      "</div>" +
      '<label class="biz-label">商品图 URL' + (img ? "（已自动填入）" : "") + "</label>" +
      '<input class="biz-input" id="ai-scene-img" placeholder="https://… 可公网访问的图片地址" value="' + img.replace(/"/g, "&quot;") + '">' +
      '<label class="biz-label">场景描述</label>' +
      '<div class="ai-scene-presets">' +
      SCENE_PRESETS.map((s, i) =>
        '<button type="button" class="ai-preset" data-i="' + i + '" onclick="pickScenePreset(' + i + ',this)">' + escapeHtml(s) + "</button>").join("") +
      "</div>" +
      '<input class="biz-input" id="ai-scene-prompt" placeholder="选择上方预设，或输入自定义场景，如：放在高级酒店桌子上" value="">' +
      '<div class="biz-out" id="ai-scene-out"></div>',
      '<button class="btn btn-primary btn-sm" id="ai-scene-go" onclick="aiSceneGo(' + idx + ')">开始生成</button>'
    );
  }
  window.aiSceneOpen = aiSceneOpen;

  function pickScenePreset(i, el) {
    _scenePrompt = SCENE_PRESETS[i] || "";
    document.querySelectorAll(".ai-preset").forEach(n => n.classList.remove("active"));
    if (el) el.classList.add("active");
    const input = document.getElementById("ai-scene-prompt");
    if (input) input.value = _scenePrompt;
  }
  window.pickScenePreset = pickScenePreset;

  async function aiSceneGo(idx) {
    const p = (window.__products || [])[idx] || {};
    const image = (document.getElementById("ai-scene-img").value || "").trim();
    const prompt = (document.getElementById("ai-scene-prompt").value || "").trim();
    const out = document.getElementById("ai-scene-out");
    const btn = document.getElementById("ai-scene-go");
    if (!/^https?:\/\//.test(image)) { showToast("请填写可公网访问的商品图 URL", "warn"); return; }
    btn.classList.add("is-loading"); btn.disabled = true;
    out.innerHTML = '<div class="poster-loading"><div class="poster-spinner"></div><p>GLM-4V 读图中…</p></div>';
    try {
      const res = await fetch(API_BASE + "/ai/product-scene", {
        method: "POST", headers: _authHeaders(),
        body: JSON.stringify({
          image: image, product_id: p.id || 0,
          prompt: prompt || ("为「" + (p.title || "商品") + "」生成一张电商主图场景"),
        }),
      });
      const json = await res.json().catch(() => null);
      if (json && json.code === 1 && json.data && json.data.url) {
        const d = json.data;
        out.innerHTML =
          '<img class="biz-out-img" src="' + d.url + '" alt="AI 场景图">' +
          '<div class="ai-scene-acts">' +
          '  <button class="btn btn-primary btn-sm" onclick="aiSceneReplace(' + idx + ')">替换原图</button>' +
          '  <a class="btn btn-ghost btn-sm" href="' + d.url + '" target="_blank" rel="noopener">查看原图</a>' +
          "</div>" +
          (d.subject ? '<p class="biz-tip">GLM-4V 识别主体：' + escapeHtml(d.subject) + "</p>" : "");
        if (d.oss === false) {
          showToast("OSS 暂不可用，当前为智谱临时直链（30 天有效），暂不可替换原图", "warn");
        } else {
          showToast("场景图生成成功，可点击「替换原图」", "success");
        }
      } else {
        const msg = (json && (json.msg || json.message)) || ("HTTP " + res.status);
        out.innerHTML = '<div class="empty-tip">生成失败：' + String(msg).slice(0, 140) + "</div>";
      }
    } catch (e) {
      out.innerHTML = '<div class="empty-tip">网络异常：' + String(e).slice(0, 100) + "</div>";
    } finally {
      btn.classList.remove("is-loading"); btn.disabled = false;
    }
  }
  window.aiSceneGo = aiSceneGo;

  /* 用刚生成的场景图替换商品主图（后端写库，前台商城同步可见） */
  async function aiSceneReplace(idx) {
    const p = (window.__products || [])[idx] || {};
    const out = document.getElementById("ai-scene-out");
    const img = out ? out.querySelector("img") : null;
    const url = img ? (img.getAttribute("src") || "").trim() : "";
    if (!p.id) { showToast("商品 ID 缺失，无法替换", "error"); return; }
    if (!/^https?:\/\//.test(url)) { showToast("请先成功生成一张场景图", "warn"); return; }
    out.innerHTML = '<div class="poster-loading"><div class="poster-spinner"></div><p>正在替换商品主图…</p></div>';
    try {
      const res = await fetch(API_BASE + "/ai/product-scene", {
        method: "POST", headers: _authHeaders(),
        body: JSON.stringify({ product_id: p.id, replace: 1, url: url }),
      });
      const json = await res.json().catch(() => null);
      if (json && json.code === 1 && json.data && json.data.replaced) {
        showToast("商品主图已替换", "success");
        _closeModal();
        if (window.ShopAdmin && ShopAdmin.loadProducts) ShopAdmin.loadProducts();
        if (window.ShopAdmin && ShopAdmin.loadOverview) ShopAdmin.loadOverview();
      } else {
        const msg = (json && (json.msg || json.message)) || ("HTTP " + res.status);
        out.innerHTML = '<div class="empty-tip">替换失败：' + String(msg).slice(0, 140) + "</div>";
        showToast("替换失败", "error");
      }
    } catch (e) {
      out.innerHTML = '<div class="empty-tip">网络异常：' + String(e).slice(0, 100) + "</div>";
    }
  }
  window.aiSceneReplace = aiSceneReplace;

  function aiVideoOpen(idx) {
    const p = (window.__products || [])[idx];
    if (!p) return;
    const img = _productImage(p);
    _openModal(
      "商品图转视频",
      '<p class="biz-tip">智谱 CogVideoX-2 将把静态商品图变成动态展示视频（约 1-3 分钟，生成中可关闭弹窗）。</p>' +
      '<label class="biz-label">商品图 URL' + (img ? '（已自动填入）' : "") + "</label>" +
      '<input class="biz-input" id="ai-video-img" placeholder="https://… 可公网访问的图片地址" value="' + img.replace(/"/g, "&quot;") + '">' +
      '<label class="biz-label">运镜描述（可选）</label>' +
      '<input class="biz-input" id="ai-video-prompt" placeholder="如：镜头围绕商品平滑环绕，背景虚化，电影感光线" value="">' +
      '<div class="biz-out" id="ai-video-out"></div>',
      '<button class="btn btn-primary btn-sm" id="ai-video-go" onclick="aiVideoGo(' + idx + ')">提交生成</button>'
    );
  }
  window.aiVideoOpen = aiVideoOpen;

  async function aiVideoGo(idx) {
    const p = (window.__products || [])[idx] || {};
    const image = (document.getElementById("ai-video-img").value || "").trim();
    const prompt = (document.getElementById("ai-video-prompt").value || "").trim();
    const out = document.getElementById("ai-video-out");
    const btn = document.getElementById("ai-video-go");
    if (!/^https?:\/\//.test(image)) { showToast("请填写可公网访问的商品图 URL", "warn"); return; }
    btn.classList.add("is-loading"); btn.disabled = true;
    out.innerHTML = '<div class="poster-loading"><div class="poster-spinner"></div><p>任务提交中…</p></div>';
    try {
      const res = await fetch(API_BASE + "/ai/product-video", {
        method: "POST", headers: _authHeaders(),
        body: JSON.stringify({ image: image, prompt: prompt || ("镜头围绕「" + (p.title || "商品") + "」平滑环绕，画面稳定高清") }),
      });
      const json = await res.json().catch(() => null);
      const task = json && json.data;
      if (json && json.code === 1 && task && task.task_id) {
        out.innerHTML = '<div class="poster-loading"><div class="poster-spinner"></div><p>视频生成队列中，约 1-3 分钟…</p><small id="ai-video-tick">已等待 0s</small></div>';
        _pollVideo(task.task_id, out, btn);
      } else {
        const msg = (json && (json.msg || json.message)) || ("HTTP " + res.status);
        out.innerHTML = '<div class="empty-tip">提交失败：' + String(msg).slice(0, 140) + "</div>";
        btn.classList.remove("is-loading"); btn.disabled = false;
      }
    } catch (e) {
      out.innerHTML = '<div class="empty-tip">网络异常：' + String(e).slice(0, 100) + "</div>";
      btn.classList.remove("is-loading"); btn.disabled = false;
    }
  }
  window.aiVideoGo = aiVideoGo;

  async function _pollVideo(taskId, out, btn) {
    const t0 = Date.now();
    const tick = () => {
      const el = document.getElementById("ai-video-tick");
      if (el) el.textContent = "已等待 " + Math.round((Date.now() - t0) / 1000) + "s";
    };
    const timer = setInterval(tick, 1000);
    for (let i = 0; i < 60; i++) {   // 最多轮询 5 分钟
      await new Promise(r => setTimeout(r, 5000));
      try {
        const res = await fetch(API_BASE + "/ai/product-video/" + taskId, { headers: _authHeaders() });
        const json = await res.json().catch(() => null);
        const d = json && json.data;
        if (d && d.status === "success" && d.url) {
          clearInterval(timer);
          out.innerHTML =
            '<video class="biz-out-video" src="' + d.url + '" controls playsinline poster=""></video>' +
            '<a class="btn btn-primary btn-sm" href="' + d.url + '" target="_blank" rel="noopener">查看视频</a>';
          showToast("视频生成完成", "success");
          btn.classList.remove("is-loading"); btn.disabled = false;
          return;
        }
        if (d && d.status === "failed") {
          clearInterval(timer);
          out.innerHTML = '<div class="empty-tip">生成失败：' + String(d.error || "未知错误").slice(0, 140) + "</div>";
          btn.classList.remove("is-loading"); btn.disabled = false;
          return;
        }
      } catch (e) { /* 网络抖动继续轮询 */ }
    }
    clearInterval(timer);
    out.innerHTML = '<div class="empty-tip">等待超时（5 分钟），任务仍在后台处理，可稍后重试查看。</div>';
    btn.classList.remove("is-loading"); btn.disabled = false;
  }

  /* ================= 导出 ================= */
  window.BIZ = BIZ;
  window.loadBizPage = loadBizPage;
})();
