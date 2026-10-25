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
      desc: "输入任意 IP 或域名，秒级返回国家地区、运营商、ASN 与网络类型画像。",
      points: ["IPv4 / IPv6 双栈查询", "国家/城市/邮编定位", "运营商与 ASN 画像", "代理/VPN 风险识别"],
    },
    "geek-speed": {
      title: "网络测速", ep: "/geek/speed", method: "GET",
      sub: "服务端探针 · 延迟丢包抖动",
      icon: '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 18a8 8 0 1116 0"/><path d="M12 14l4-4"/><circle cx="12" cy="14" r="1.4" fill="currentColor" stroke="none"/></svg>',
      desc: "服务端探针聚合多点测速数据，实时掌握各节点延迟、丢包与抖动表现。",
      points: ["多探针节点同时测速", "延迟/丢包/抖动三指标", "测速历史曲线", "劣化节点自动排名"],
    },
    "geek-forex": {
      title: "天气 / 汇率", ep: "/geek/forex", method: "GET",
      sub: "实时天气 · 汇率换算",
      icon: '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M17 18a4 4 0 000-8 6 6 0 00-11.6 1.6A3.5 3.5 0 006 18z"/><path d="M8 21l1-2M12 21l1-2M16 21l1-2"/></svg>',
      desc: "全球城市实时天气与多币种汇率换算，出海业务随手查。",
      points: ["全球城市实时天气", "多币种实时汇率", "常用货币对速查", "离线缓存最近查询"],
    },
    "geek-qrcode": {
      title: "二维码生成", ep: "/geek/qrcode", method: "POST",
      sub: "本地生成 · 即贴即用",
      icon: '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM19 19h2v2h-2z"/></svg>',
      desc: "文本/链接一键生成高清二维码，支持 Logo 嵌入与容错级别调节。",
      points: ["文本/链接/WiFi 生成", "容错级别可调", "Logo 中心嵌入", "PNG/SVG 导出"],
    },
  };

  /* ================= 通用：探测后端空壳接口 ================= */
  function _isCatchAll(json) {
    return !!json && json.message === "ok" && json.data === null
      && json.status === "success" && !("code" in json);
  }

  function _setEpState(tab, state, raw) {
    // state: ready(接口已就绪) / offline(未部署) / error(异常)
    const badge = document.getElementById("ep-badge-" + tab);
    const st = document.getElementById("ep-status-" + tab);
    const box = document.getElementById("ep-raw-" + tab);
    const label = { ready: ["已就绪", "ok"], offline: ["未部署", "warn"], error: ["异常", "err"] }[state] || ["--", ""];
    if (badge) {
      badge.textContent = label[0];
      badge.className = "ep-badge " + label[1];
    }
    if (st) st.textContent = label[0];
    if (box && raw != null) {
      box.textContent = typeof raw === "string" ? raw : JSON.stringify(raw, null, 2);
    }
  }

  async function loadBizPage(tab) {
    const mod = BIZ[tab];
    if (!mod) return;
    _setEpState(tab, "offline", "探测中...");
    try {
      const res = await fetch(API_BASE + mod.ep, { method: mod.method });
      const json = await res.json().catch(() => null);
      if (json && json.message === "待开发" && json.data && json.data.module) {
        _setEpState(tab, "ready", json);
        showToast(mod.title + "：后端接口已就绪（待开发）", "success");
      } else if (_isCatchAll(json)) {
        _setEpState(tab, "offline", json);
        showToast(mod.title + "：后端尚未部署该接口", "warn");
      } else {
        _setEpState(tab, "error", json || ("HTTP " + res.status));
      }
    } catch (e) {
      _setEpState(tab, "error", String(e));
    }
  }

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

  /* ================= 阶段四 · 海报生成器 ================= */
  const POSTER_SIZES = [
    { v: "1024x1024", t: "方形 1:1", d: "朋友圈 / 商品图" },
    { v: "768x1344", t: "竖版 9:16", d: "短视频封面" },
    { v: "1344x768", t: "横版 16:9", d: " Banner 头图" },
    { v: "720x1280", t: "全屏 9:16", d: "手机全屏海报" },
    { v: "1280x720", t: "宽屏 16:9", d: "桌面端主视觉" },
  ];
  let _posterSize = "1024x1024";

  function pickPosterSize(v, el) {
    _posterSize = v;
    document.querySelectorAll(".size-opt").forEach(n => n.classList.remove("active"));
    if (el) el.classList.add("active");
  }
  window.pickPosterSize = pickPosterSize;

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
      "  <p>智谱 CogView 正在绘制海报…</p>" +
      "  <small>通常需要 8-16 秒，请稍候</small>" +
      "</div>";
    try {
      const res = await fetch(API_BASE + "/ai/poster", {
        method: "POST", headers: _authHeaders(),
        body: JSON.stringify({ prompt: prompt, size: _posterSize, model: modelEl.value }),
      });
      const json = await res.json().catch(() => null);
      if (json && json.code === 1 && json.data && json.data.url) {
        result.innerHTML =
          '<img class="poster-img" src="' + json.data.url + '" alt="AI 海报">' +
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
  function _productImage(p) {
    return (p && (p.image || p.icon_url || p.cover || "")) || "";
  }

  function aiSceneOpen(idx) {
    const p = (window.__products || [])[idx];
    if (!p) return;
    const img = _productImage(p);
    _openModal(
      "AI 生成场景图",
      '<p class="biz-tip">智谱 GLM-4V 将先读懂商品图，再生成一张带场景氛围的主图（约 15-30 秒）。</p>' +
      '<label class="biz-label">商品图 URL' + (img ? '（已自动填入）' : "") + "</label>" +
      '<input class="biz-input" id="ai-scene-img" placeholder="https://… 可公网访问的图片地址" value="' + img.replace(/"/g, "&quot;") + '">' +
      '<label class="biz-label">场景描述（可选）</label>' +
      '<input class="biz-input" id="ai-scene-prompt" placeholder="如：放在木质桌面上，午后阳光，暖色调" value="">' +
      '<div class="biz-out" id="ai-scene-out"></div>',
      '<button class="btn btn-primary btn-sm" id="ai-scene-go" onclick="aiSceneGo(' + idx + ')">开始生成</button>'
    );
  }
  window.aiSceneOpen = aiSceneOpen;

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
        body: JSON.stringify({ image: image, prompt: prompt || ("为「" + (p.title || "商品") + "」生成一张电商主图场景") }),
      });
      const json = await res.json().catch(() => null);
      if (json && json.code === 1 && json.data && json.data.url) {
        out.innerHTML =
          '<img class="biz-out-img" src="' + json.data.url + '" alt="AI 场景图">' +
          '<a class="btn btn-primary btn-sm" href="' + json.data.url + '" target="_blank" rel="noopener">查看原图</a>';
        showToast("场景图生成成功", "success");
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
