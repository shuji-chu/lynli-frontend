/* ============================================================
   极客工具箱真实交互（geek-tools.js）
   ------------------------------------------------------------
   1) IP 归属地查询：GET  /api/v1/geek/ip（代理 ip-api.com 实时数据）
   2) 网络测速：延迟探针 /api/v1/geek/speed/ping + 10MB 测速文件
      /api/v1/geek/speed/file，前端按真实下载耗时计算带宽
   3) 天气：GET  /api/v1/geek/weather（代理 wttr.in）
      汇率：GET  /api/v1/geek/forex（open.er-api.com）
   4) 二维码：POST /api/v1/geek/qrcode（服务端实时生成 PNG）
   所有数据均为后端真实返回，无任何本地假数据。
   ============================================================ */
(function () {
  "use strict";

  const API_BASE = (location.hostname === "web.lynli.me")
    ? "/api/v1"
    : "https://api.lynli.me/api/v1";

  /* ---------- 天气描述英中映射（仅翻译上游真实返回的描述文本） ---------- */
  const WX_ZH = {
    "Sunny": "晴", "Clear": "晴", "Partly cloudy": "局部多云", "Cloudy": "多云",
    "Overcast": "阴", "Mist": "薄雾", "Fog": "雾", "Freezing fog": "冻雾",
    "Light drizzle": "小雨", "Drizzle": "毛毛雨", "Heavy drizzle": "强毛毛雨",
    "Light rain": "小雨", "Moderate rain": "中雨", "Heavy rain": "大雨",
    "Torrential rain": "暴雨", "Rain": "雨", "Light rain shower": "阵雨",
    "Heavy rain at times": "时段大雨", "Patchy rain nearby": "局部有雨",
    "Thunderstorm": "雷阵雨", "Thundery outbreaks": "雷暴", "Snow": "雪",
    "Light snow": "小雪", "Moderate snow": "中雪", "Heavy snow": "大雪",
    "Haze": "霾", "Smoky haze": "烟雾霾", "Sandstorm": "沙尘暴", "Dust": "浮尘",
  };
  function wxZh(en) {
    if (!en) return "--";
    const key = String(en).trim().toLowerCase();
    for (const k in WX_ZH) {
      if (k.toLowerCase() === key) return WX_ZH[k];
    }
    for (const k in WX_ZH) {
      if (key.indexOf(k.toLowerCase()) !== -1) return WX_ZH[k];
    }
    return String(en).trim();
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, c =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  async function _get(path) {
    const r = await fetch(API_BASE + path);
    const j = await r.json().catch(() => null);
    if (!j || j.code !== 1) throw new Error((j && j.msg) || ("HTTP " + r.status));
    return j.data;
  }
  async function _post(path, body) {
    const r = await fetch(API_BASE + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
    });
    const j = await r.json().catch(() => null);
    if (!j || j.code !== 1) throw new Error((j && j.msg) || ("HTTP " + r.status));
    return j.data;
  }

  /* ==================== IP 归属地 ==================== */
  async function ipQuery(ip) {
    const result = document.getElementById("geek-ip-result");
    const empty = document.getElementById("geek-ip-empty");
    if (empty) empty.textContent = "查询中…";
    try {
      const d = await _get("/geek/ip" + (ip ? "?ip=" + encodeURIComponent(ip) : ""));
      if (result) result.style.display = "";
      if (empty) empty.style.display = "none";
      const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v || "--"; };
      set("gir-ip", d.ip);
      set("gir-cc", d.countryCode || "--");
      set("gir-country", d.country);
      set("gir-region", d.region);
      set("gir-city", d.city);
      set("gir-zip", d.zip);
      set("gir-tz", d.timezone);
      set("gir-geo", (d.lat != null && d.lon != null) ? (d.lat + ", " + d.lon) : "--");
      set("gir-isp", d.isp);
      set("gir-org", d.org);
      set("gir-as", d.as);
    } catch (e) {
      if (empty) { empty.style.display = ""; empty.textContent = "查询失败：" + e.message; }
    }
  }

  /* ==================== 网络测速 ==================== */
  const GAUGE_ARC = 518.4;      // 270° 弧长（r=110）
  let _speedRunning = false;

  function _gaugeSet(mbps) {
    const arc = document.getElementById("gs-arc");
    const needle = document.getElementById("gs-needle");
    const val = document.getElementById("gs-value");
    const v = Math.max(0, Math.min(Number(mbps) || 0, 1000));
    const ratio = v / 1000;
    if (arc) arc.setAttribute("stroke-dashoffset", String(GAUGE_ARC * (1 - ratio)));
    if (needle) needle.setAttribute("transform", "rotate(" + (-135 + ratio * 270) + " 150 150)");
    if (val) val.textContent = v.toFixed(1);
  }

  async function speedTest() {
    if (_speedRunning) return;
    _speedRunning = true;
    const startBtn = document.getElementById("gs-start");
    const tip = document.getElementById("gs-tip");
    if (startBtn) { startBtn.classList.add("is-loading"); startBtn.disabled = true; }
    if (tip) tip.textContent = "正在测量延迟…";
    try {
      // 1) 延迟：3 次 ping 取平均
      let total = 0, n = 0;
      for (let i = 0; i < 3; i++) {
        const t0 = performance.now();
        await _get("/geek/speed/ping?_=" + Date.now());
        total += performance.now() - t0; n++;
      }
      const latency = total / n;
      const latEl = document.getElementById("gs-latency");
      if (latEl) latEl.textContent = latency.toFixed(0) + " ms";

      // 2) 下载 10MB 测速文件，按真实耗时计算带宽
      if (tip) tip.textContent = "正在下载 10MB 测速文件…";
      const t1 = performance.now();
      const resp = await fetch(API_BASE + "/geek/speed/file?_=" + Date.now(), { cache: "no-store" });
      if (!resp.ok) throw new Error("HTTP " + resp.status);
      const buf = await resp.arrayBuffer();
      const ms = performance.now() - t1;
      const bytes = buf.byteLength;
      const mbps = (bytes * 8) / (ms / 1000) / 1e6;

      const sp = document.getElementById("gs-speed");
      const du = document.getElementById("gs-duration");
      const sz = document.getElementById("gs-size");
      if (sp) sp.textContent = mbps.toFixed(1) + " Mbps";
      if (du) du.textContent = (ms / 1000).toFixed(2) + " s";
      if (sz) sz.textContent = (bytes / 1048576).toFixed(1) + " MB";
      _gaugeSet(mbps);
      if (tip) tip.textContent = "测速完成：延迟 " + latency.toFixed(0) + " ms，下行 " + mbps.toFixed(1) + " Mbps";
    } catch (e) {
      if (tip) tip.textContent = "测速失败：" + e.message;
    } finally {
      _speedRunning = false;
      if (startBtn) { startBtn.classList.remove("is-loading"); startBtn.disabled = false; }
    }
  }

  /* ==================== 天气 ==================== */
  async function weatherQuery(city) {
    const card = document.getElementById("wx-card");
    const empty = document.getElementById("wx-empty");
    if (empty) { empty.style.display = ""; empty.textContent = "查询中…"; }
    try {
      const d = await _get("/geek/weather?city=" + encodeURIComponent(city || "Beijing"));
      if (card) card.style.display = "";
      if (empty) empty.style.display = "none";
      const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
      set("wx-city", d.city);
      set("wx-country", d.country ? "· " + d.country : "");
      set("wx-temp", d.tempC != null ? d.tempC : "--");
      set("wx-desc", wxZh(d.desc) + (d.observationTime ? " · 观测于 " + d.observationTime : ""));
      set("wx-feels", (d.feelsLikeC != null ? d.feelsLikeC + "°C" : "--"));
      set("wx-humidity", (d.humidity != null ? d.humidity + "%" : "--"));
      set("wx-wind", (d.windKmph != null ? d.windKmph + " km/h" + (d.windDir ? " " + d.windDir : "") : "--"));
      set("wx-cloud", (d.cloudcover != null ? d.cloudcover + "%" : "--"));
      const fc = document.getElementById("wx-forecast");
      if (fc) {
        fc.innerHTML = (d.forecast || []).map(f =>
          '<div class="wx-fc-item"><span>' + esc(f.date) + '</span><b>' + esc(f.minC) + "° / " + esc(f.maxC) + '°</b><i>' + esc(wxZh(f.desc)) + "</i></div>"
        ).join("");
      }
    } catch (e) {
      if (empty) { empty.style.display = ""; empty.textContent = "天气查询失败：" + e.message; }
      if (card) card.style.display = "none";
    }
  }

  /* ==================== 汇率 ==================== */
  function _fxRender(d, amount) {
    const table = document.getElementById("fx-table");
    const time = document.getElementById("fx-time");
    const empty = document.getElementById("fx-empty");
    if (!table) return;
    if (empty) empty.style.display = "none";
    const amt = Number(amount);
    const baseOk = isFinite(amt) && amt >= 0;
    table.innerHTML = Object.keys(d.rates || {}).map(code => {
      const rate = d.rates[code];
      const name = (d.names && d.names[code]) || code;
      const conv = baseOk ? (amt * rate) : rate;
      return '<div class="fx-row">' +
        '<span class="fx-code">' + esc(code) + "<i>" + esc(name) + "</i></span>" +
        '<b class="fx-val">' + (conv >= 100 ? conv.toFixed(2) : conv.toFixed(4)) + "</b>" +
        "</div>";
    }).join("");
    if (time) time.textContent = "基准 " + esc(d.base) + " · 更新于 " + esc(d.updatedUtc) + " · 来源 " + esc(d.source);
  }
  async function forexLoad(amount) {
    const base = (document.getElementById("fx-base") || {}).value || "CNY";
    const amt = amount != null ? amount : (document.getElementById("fx-amount") || {}).value;
    const empty = document.getElementById("fx-empty");
    if (empty) { empty.style.display = ""; empty.textContent = "汇率加载中…"; }
    try {
      const d = await _get("/geek/forex?base=" + encodeURIComponent(base));
      _fxRender(d, amt);
    } catch (e) {
      if (empty) { empty.style.display = ""; empty.textContent = "汇率加载失败：" + e.message; }
      const table = document.getElementById("fx-table");
      if (table) table.innerHTML = "";
    }
  }

  /* ==================== 二维码 ==================== */
  async function qrGenerate() {
    const text = (document.getElementById("qr-text") || {}).value || "";
    const empty = document.getElementById("qr-empty");
    if (!text.trim()) { if (empty) { empty.style.display = ""; empty.textContent = "请先输入文本或链接"; } return; }
    if (empty) { empty.style.display = ""; empty.textContent = "生成中…"; }
    try {
      const d = await _post("/geek/qrcode", { text: text.trim() });
      const box = document.getElementById("qr-preview");
      const img = document.getElementById("qr-img");
      const dl = document.getElementById("qr-download");
      if (img) img.src = d.url;
      if (dl) dl.href = d.url;
      if (box) box.style.display = "";
      if (empty) empty.style.display = "none";
    } catch (e) {
      if (empty) { empty.style.display = ""; empty.textContent = "生成失败：" + e.message; }
    }
  }

  /* ==================== 事件绑定与页面进入 ==================== */
  let _bound = false;
  function _bind() {
    if (_bound) return;
    _bound = true;
    const on = (id, fn, ev) => { const el = document.getElementById(id); if (el) el.addEventListener(ev || "click", fn); };
    on("geek-ip-btn", () => ipQuery((document.getElementById("geek-ip-input") || {}).value || ""));
    on("geek-ip-self", () => { const i = document.getElementById("geek-ip-input"); if (i) i.value = ""; ipQuery(""); });
    const ipi = document.getElementById("geek-ip-input");
    if (ipi) ipi.addEventListener("keydown", e => { if (e.key === "Enter") ipQuery(ipi.value || ""); });
    on("gs-start", speedTest);
    on("gf-wbtn", () => weatherQuery((document.getElementById("gf-city") || {}).value || "Beijing"));
    const gfc = document.getElementById("gf-city");
    if (gfc) gfc.addEventListener("keydown", e => { if (e.key === "Enter") weatherQuery(gfc.value || "Beijing"); });
    on("qr-btn", qrGenerate);
    const fxa = document.getElementById("fx-amount");
    const fxb = document.getElementById("fx-base");
    if (fxa) fxa.addEventListener("change", () => forexLoad(fxa.value));
    if (fxb) fxb.addEventListener("change", () => forexLoad(fxa ? fxa.value : 100));
  }

  const _loaded = {};
  function enter(tab) {
    _bind();
    if (_loaded[tab]) return;
    _loaded[tab] = true;
    if (tab === "geek-forex") {
      // 进入即自动加载默认城市天气 + 人民币基准汇率（真实数据）
      const city = (document.getElementById("gf-city") || {}).value || "Beijing";
      weatherQuery(city);
      forexLoad(100);
    }
  }

  window.Geek = { enter, ipQuery, speedTest, weatherQuery, forexLoad, qrGenerate };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", _bind);
  else _bind();
})();
