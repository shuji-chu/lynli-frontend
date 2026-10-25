/* ============================================================
   全域可视化地图 —— Leaflet 开源能力全功能版
   ------------------------------------------------------------
   底图（均无需 API Key 的免费开源图源）：
     · 矢量浅色   → OpenStreetMap 标准瓦片
     · 地形图     → OpenTopoMap（CC-BY-SA）
     · 卫星影像   → Esri ArcGIS World Imagery
   搜索：Nominatim 开源地理编码（左上搜索框，防抖 + 结果列表）
   定位：navigator.geolocation 真实 GPS
   路线：OSRM 开源路线引擎（router.project-osrm.org），蓝线轨迹
   周边：Nominatim 视野内 POI 检索（餐饮/酒店/加油站/ATM/医院）
   控件：全自定义毛玻璃（缩放 / 底图切换 / 图层切换），隐藏 Leaflet 默认 UI
   数据：GET /api/v1/public/nodes（servers 表真实节点）
   ============================================================ */

let _nodeMap = null;       // 全屏地图实例
let _dashMap = null;       // 工作台首屏小图实例
let _nodeLayer = null;
let _dashLayer = null;
let _meMarker = null;
let _meLoc = null;
let _locating = false;
let _nodeData = [];
let _curLayer = "nodes";   // nodes / logistics / idc
let _baseLayer = null;     // 当前底图 tileLayer
let _curBase = "light";    // light / dark / sat
let _routeLine = null;     // OSRM 路线蓝线
let _routeMarkers = [];    // 起终点 marker
let _poiMarkers = [];      // 周边 POI marker
let _searchMarker = null;  // 搜索结果 marker
let _pickMode = null;      // 'start' | 'end' | null（地图点选模式）

/* ---------- 免费开源底图（全部无需 API Key） ---------- */
const OSM_TILES = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const TOPO_TILES = "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png";
const SAT_TILES = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const BASEMAPS = {
  light:   { name: "矢量浅色", url: OSM_TILES,  sub: "abc", attr: "&copy; OpenStreetMap 贡献者" },
  terrain: { name: "地形图",   url: TOPO_TILES, sub: "abc", attr: "© OpenTopoMap (CC-BY-SA)" },
  sat:     { name: "卫星影像", url: SAT_TILES,  sub: "abc", attr: "Imagery &copy; Esri" },
};
const LAYER_LABELS = { nodes: "节点分布", logistics: "电商物流", idc: "服务器机房" };
const NOMINATIM = "https://nominatim.openstreetmap.org";
const PHOTON = "https://photon.komoot.io"; // 备用开源地理编码（Komoot，OSM 数据）
const OSRM = "https://router.project-osrm.org/route/v1/driving";

/* ---------- 双引擎地理编码：Nominatim 优先，不可达/超时自动降级 Photon ----------
   两个均为免费开源 OSM 地理编码服务；带 6s 超时，避免部分网络下挂起。 */
function _fetchTimeout(url, ms = 5000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { signal: ctrl.signal }).finally(() => clearTimeout(timer));
}

function _normNominatim(list) {
  return (list || []).map((it) => ({
    name: it.name || (it.display_name || "").split(",")[0],
    display_name: it.display_name || "",
    lat: parseFloat(it.lat), lon: parseFloat(it.lon),
  })).filter((x) => !isNaN(x.lat) && !isNaN(x.lon));
}

function _normPhoton(json) {
  const feats = (json && json.features) || [];
  return feats.map((f) => {
    const p = f.properties || {};
    const full = [p.name, p.street, p.housenumber && p.street ? null : (p.city || p.town || p.village || p.municipality), p.state, p.country].filter(Boolean).join(" · ");
    return {
      name: p.name || full.split(" · ")[0] || "地点",
      display_name: full,
      lat: f.geometry.coordinates[1], lon: f.geometry.coordinates[0],
    };
  }).filter((x) => !isNaN(x.lat) && !isNaN(x.lon));
}

// 关键词地理编码（搜索框）：返回 { engine, list }
async function _geocode(q, limit = 8) {
  try {
    const res = await _fetchTimeout(`${NOMINATIM}/search?format=jsonv2&limit=${limit}&accept-language=zh-CN&q=${encodeURIComponent(q)}`);
    const list = _normNominatim(await res.json());
    if (list.length) return { engine: "Nominatim", list };
  } catch (e) { /* 超时/网络异常 → 降级 */ }
  try {
    const res = await _fetchTimeout(`${PHOTON}/api/?q=${encodeURIComponent(q)}&limit=${limit}`);
    return { engine: "Photon", list: _normPhoton(await res.json()) };
  } catch (e) {
    return { engine: null, list: [] };
  }
}

// 视野内 POI 检索（周边 Tab）：b = Leaflet LatLngBounds；type = POI_TYPES 项
async function _geocodePoi(type, b, limit = 15) {
  const viewbox = `${b.getWest()},${b.getNorth()},${b.getEast()},${b.getSouth()}`;
  try {
    const res = await _fetchTimeout(`${NOMINATIM}/search?format=jsonv2&limit=${limit}&accept-language=zh-CN&viewbox=${encodeURIComponent(viewbox)}&bounded=1&q=${encodeURIComponent(type.q)}`);
    const list = _normNominatim(await res.json());
    if (list.length) return { engine: "Nominatim", list };
  } catch (e) { /* 超时/网络异常 → 降级 */ }
  // 降级：Overpass（bbox 顺序 = 南,西,北,东）
  try {
    const bbox = `${b.getSouth()},${b.getWest()},${b.getNorth()},${b.getEast()}`;
    const q = `[out:json][timeout:8];node${type.osm || `["amenity"="${type.key}"]`}(${bbox});out ${limit};`;
    const res = await _fetchTimeout(`${OVERPASS}?data=${encodeURIComponent(q)}`, 9000);
    const json = await res.json();
    const list = (json.elements || []).map((el) => {
      const t = el.tags || {};
      const addr = [t["addr:street"], t["addr:housenumber"], t["addr:city"]].filter(Boolean).join(" ");
      return { name: t.name || "", display_name: addr || type.label, lat: el.lat, lon: el.lon };
    }).filter((x) => !isNaN(x.lat) && !isNaN(x.lon));
    return { engine: "Overpass", list };
  } catch (e) {
    return { engine: null, list: [] };
  }
}
const POI_TYPES = [
  { key: "restaurant", label: "餐饮", q: "restaurant", osm: '["amenity"="restaurant"]' },
  { key: "hotel", label: "酒店", q: "hotel", osm: '["tourism"="hotel"]' },
  { key: "fuel", label: "加油站", q: "fuel", osm: '["amenity"="fuel"]' },
  { key: "atm", label: "ATM", q: "atm", osm: '["amenity"="atm"]' },
  { key: "hospital", label: "医院", q: "hospital", osm: '["amenity"="hospital"]' },
];
// Overpass：OSM 官方 POI 检索引擎（周边检索降级通道）
const OVERPASS = "https://overpass-api.de/api/interpreter";

function _apiBase() {
  return (location.hostname === "web.lynli.me") ? "/api/v1" : "https://api.lynli.me/api/v1";
}

/* ================= 定位 ================= */
function _setGeoChip(state, text) {
  const chip = document.getElementById("geo-chip");
  const t = document.getElementById("geo-text");
  if (!chip || !t) return;
  chip.classList.remove("ok", "err");
  if (state === "ok") chip.classList.add("ok");
  if (state === "err") chip.classList.add("err");
  t.innerText = text;
}

function locateMe(silent = false) {
  if (_locating) return;
  if (!navigator.geolocation) {
    _setGeoChip("err", "浏览器不支持定位");
    if (!silent) showToast("当前浏览器不支持定位", "warn");
    return;
  }
  _locating = true;
  _setGeoChip("", "定位中...");
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      _locating = false;
      const { latitude: lat, longitude: lng } = pos.coords;
      _meLoc = { lat, lng };
      _setGeoChip("ok", `已定位 (${lat.toFixed(3)}, ${lng.toFixed(3)})`);
      if (!silent) showToast("已定位到您的当前位置", "success");
      if (!_nodeMap && !_dashMap) { initNodeMap(); return; }
      _addMeMarker();
    },
    (err) => {
      _locating = false;
      const msg = err.code === 1 ? "定位权限被拒绝" : (err.code === 2 ? "位置获取失败" : "定位超时");
      _setGeoChip("err", msg);
      if (!silent) showToast(msg + "，可点击按钮重试", "warn");
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
  );
}

function _addMeMarker() {
  if (!_meLoc) return;
  const meIcon = L.divIcon({
    className: "",
    html: `<div class="me-marker"><div class="me-halo"></div><div class="me-ring"></div><div class="me-core"></div></div>`,
    iconSize: [26, 26], iconAnchor: [13, 13], popupAnchor: [0, -14],
  });
  const popup = `<div class="node-popup"><b>我的位置</b><div class="row"><span>纬度</span><span>${_meLoc.lat.toFixed(5)}</span></div><div class="row"><span>经度</span><span>${_meLoc.lng.toFixed(5)}</span></div></div>`;
  [_nodeMap, _dashMap].forEach((map) => {
    if (!map) return;
    if (map._meMarker) map.removeLayer(map._meMarker);
    map._meMarker = L.marker([_meLoc.lat, _meLoc.lng], { icon: meIcon, zIndexOffset: 1000 }).addTo(map).bindPopup(popup);
  });
  if (_nodeMap && _nodeData.length) {
    const pts = _nodeData.map((n) => [parseFloat(n.lat), parseFloat(n.lng)]).filter((p) => !isNaN(p[0]) && !isNaN(p[1]));
    pts.push([_meLoc.lat, _meLoc.lng]);
    if (pts.length > 1) _nodeMap.fitBounds(pts, { padding: [70, 70], animate: true, maxZoom: 9 });
  }
}

/* ================= 自定义缩放控件（毛玻璃） ================= */
function mapZoomIn() { if (_nodeMap) _nodeMap.zoomIn(1, { animate: true }); }
function mapZoomOut() { if (_nodeMap) _nodeMap.zoomOut(1, { animate: true }); }

/* ================= 底图切换（毛玻璃控件） ================= */
function switchBase(base) {
  if (!_nodeMap || !BASEMAPS[base]) return;
  _curBase = base;
  document.querySelectorAll(".base-btn").forEach((b) => b.classList.toggle("active", b.dataset.base === base));
  if (_baseLayer) _nodeMap.removeLayer(_baseLayer);
  const conf = BASEMAPS[base];
  _baseLayer = L.tileLayer(conf.url, {
    subdomains: conf.sub, attribution: conf.attr, maxZoom: 18,
  }).addTo(_nodeMap);
  _baseLayer.bringToBack();
  showToast(`底图已切换：${conf.name}`, "info", 1800);
}

/* ================= 节点 / 机房 Marker ================= */
function _nodeIcon(live) {
  return L.divIcon({
    className: "",
    html: `<div class="node-marker ${live ? "" : "offline"}"><div class="halo"></div><div class="pulse"></div><div class="pulse pulse2"></div><div class="core"></div></div>`,
    iconSize: [24, 24], iconAnchor: [12, 12], popupAnchor: [0, -14],
  });
}
function _idcIcon() {
  return L.divIcon({
    className: "",
    html: `<div class="idc-marker"><div class="halo"></div><div class="pulse"></div><div class="core"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M4 6h16M4 12h16M4 18h16"/></svg></div></div>`,
    iconSize: [26, 26], iconAnchor: [13, 13], popupAnchor: [0, -14],
  });
}

function _renderNodeLayer(map, layer) {
  if (!map || !layer) return;
  layer.clearLayers();
  const bounds = [];
  _nodeData.forEach((n) => {
    const lat = parseFloat(n.lat), lng = parseFloat(n.lng);
    if (isNaN(lat) || isNaN(lng)) return;
    const live = n.status ? n.status === "online" : (n.enabled === 1 || n.enabled === "1");
    const marker = L.marker([lat, lng], { icon: _nodeIcon(live) }).addTo(layer);
    marker.bindPopup(`
      <div class="node-popup">
        <b>${escapeHtml(n.name || "未命名节点")}</b>
        <div class="row"><span>状态</span><span class="${live ? "badge-live" : ""}">${live ? "● 在线" : "○ 离线"}</span></div>
        <div class="row"><span>IP</span><span>${escapeHtml(n.ip || "-")}</span></div>
        ${n.domain ? `<div class="row"><span>域名</span><span>${escapeHtml(n.domain)}</span></div>` : ""}
        <div class="row"><span>地区</span><span>${escapeHtml(n.region_name || n.region || "-")}</span></div>
        <div class="row"><span>坐标</span><span>${lat.toFixed(2)}, ${lng.toFixed(2)}</span></div>
      </div>`);
    bounds.push([lat, lng]);
  });
  return bounds;
}

function _renderIdcLayer(map, layer) {
  if (!map || !layer) return;
  layer.clearLayers();
  const bounds = [];
  _nodeData.forEach((n) => {
    const lat = parseFloat(n.lat), lng = parseFloat(n.lng);
    if (isNaN(lat) || isNaN(lng)) return;
    const live = n.status ? n.status === "online" : (n.enabled === 1 || n.enabled === "1");
    const marker = L.marker([lat, lng], { icon: _idcIcon() }).addTo(layer);
    marker.bindPopup(`
      <div class="node-popup">
        <b>${escapeHtml(n.name || "未命名机房")}</b>
        <div class="row"><span>类型</span><span>服务器机房</span></div>
        <div class="row"><span>探针状态</span><span class="${live ? "badge-live" : ""}">${live ? "● 在线" : "○ 离线"}</span></div>
        <div class="row"><span>IP</span><span>${escapeHtml(n.ip || "-")}</span></div>
        <div class="row"><span>地区</span><span>${escapeHtml(n.region_name || n.region || "-")}</span></div>
      </div>`);
    bounds.push([lat, lng]);
  });
  return bounds;
}

function switchMapLayer(layer) {
  _curLayer = layer;
  document.querySelectorAll(".map-layer-switch .layer-btn").forEach((b) => b.classList.toggle("active", b.dataset.layer === layer));
  const note = document.getElementById("map-layer-note");
  if (note) note.innerText = `当前图层：${LAYER_LABELS[layer] || layer}`;
  const empty = document.getElementById("map-empty-layer");
  if (layer === "nodes") {
    if (empty) empty.classList.remove("show");
    if (_nodeMap && _nodeLayer) {
      const b = _renderNodeLayer(_nodeMap, _nodeLayer);
      if (b && b.length === 1) _nodeMap.setView(b[0], 6, { animate: true });
      else if (b && b.length > 1) _nodeMap.fitBounds(b, { padding: [60, 60], animate: true });
    }
  } else if (layer === "idc") {
    if (empty) empty.classList.remove("show");
    if (_nodeMap && _nodeLayer) {
      const b = _renderIdcLayer(_nodeMap, _nodeLayer);
      if (b && b.length === 1) _nodeMap.setView(b[0], 6, { animate: true });
      else if (b && b.length > 1) _nodeMap.fitBounds(b, { padding: [60, 60], animate: true });
    }
  } else if (layer === "logistics") {
    if (_nodeMap && _nodeLayer) _nodeLayer.clearLayers();
    if (empty) {
      empty.classList.add("show");
      showToast("电商物流图层即将上线，轨迹数据接入后自动点亮", "info");
    }
  }
}

/* ================= Nominatim 搜索 ================= */
let _searchTimer = null;
function _bindMapSearch() {
  const input = document.getElementById("map-search-input");
  const panel = document.getElementById("map-search-panel");
  if (!input || !panel || input._bound) return;
  input._bound = true;

  const doSearch = async () => {
    const q = input.value.trim();
    if (!q) { panel.classList.remove("show"); panel.innerHTML = ""; return; }
    panel.innerHTML = `<div class="search-loading">搜索中...</div>`;
    panel.classList.add("show");
    const { engine, list } = await _geocode(q);
    if (!list.length) {
      panel.innerHTML = `<div class="search-empty">${engine === null ? "搜索服务暂不可用（Nominatim/Photon）" : "未找到相关地点，换个关键词试试"}</div>`;
      return;
    }
    panel.innerHTML = list.map((it, i) => `
      <div class="search-item" data-i="${i}">
        <div class="search-item-name">${escapeHtml(it.name)}</div>
        <div class="search-item-sub">${escapeHtml(it.display_name)}</div>
      </div>`).join("");
    panel.querySelectorAll(".search-item").forEach((el) => {
      el.addEventListener("click", () => {
        const it = list[Number(el.dataset.i)];
        _gotoSearchResult(it.lat, it.lon, it);
        panel.classList.remove("show");
        input.value = it.name;
      });
    });
  };

  input.addEventListener("input", () => {
    clearTimeout(_searchTimer);
    _searchTimer = setTimeout(doSearch, 450);
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { clearTimeout(_searchTimer); doSearch(); }
  });
  // 点击空白处收起结果
  document.addEventListener("click", (e) => {
    if (!panel.contains(e.target) && e.target !== input) panel.classList.remove("show");
  });
}

function _gotoSearchResult(lat, lng, it) {
  if (!_nodeMap) return;
  if (_searchMarker) _nodeMap.removeLayer(_searchMarker);
  const icon = L.divIcon({
    className: "",
    html: `<div class="search-marker"><div class="sm-halo"></div><div class="sm-core"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#fff" stroke-width="2.6"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg></div></div>`,
    iconSize: [30, 30], iconAnchor: [15, 15], popupAnchor: [0, -16],
  });
  _searchMarker = L.marker([lat, lng], { icon, zIndexOffset: 900 }).addTo(_nodeMap).bindPopup(`
    <div class="node-popup"><b>${escapeHtml(it.name || "搜索结果")}</b>
    <div class="row"><span>地址</span><span>${escapeHtml(it.display_name)}</span></div>
    <div class="row"><span>坐标</span><span>${lat.toFixed(4)}, ${lng.toFixed(4)}</span></div></div>`);
  _nodeMap.flyTo([lat, lng], 13, { duration: 1.2 });
  showToast("已定位到搜索结果", "success", 1600);
}

/* ================= 底部 Tab：地图 / 路线 / 周边 ================= */
function switchMapTab(tab) {
  document.querySelectorAll(".map-tab-btn").forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
  document.querySelectorAll(".map-tab-panel").forEach((p) => p.classList.toggle("show", p.dataset.tab === tab));
  if (tab === "route") { _bindRoutePanel(); }
  if (tab === "poi") { _bindPoiPanel(); }
  if (tab === "map") { setTimeout(() => _nodeMap && _nodeMap.invalidateSize(), 60); }
}

/* ---------- 路线规划（OSRM） ---------- */
let _routeBound = false;
let _routePts = { start: null, end: null }; // { lat, lng, label }

function _bindRoutePanel() {
  const panel = document.querySelector('.map-tab-panel[data-tab="route"]');
  if (!panel || _routeBound) return;
  _routeBound = true;

  const startInput = panel.querySelector("#route-start");
  const endInput = panel.querySelector("#route-end");
  const swapBtn = panel.querySelector("#route-swap");
  const planBtn = panel.querySelector("#route-plan");
  const info = panel.querySelector("#route-info");

  const fmt = (p) => (p ? (p.label || `${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}`) : "");
  const sync = () => { startInput.value = fmt(_routePts.start); endInput.value = fmt(_routePts.end); };

  // 「我的位置」快捷填充
  panel.querySelector("#route-start-me").addEventListener("click", () => {
    if (!_meLoc) { showToast("请先点击「定位」获取当前位置", "warn"); locateMe(true); return; }
    _routePts.start = { lat: _meLoc.lat, lng: _meLoc.lng, label: "我的位置" };
    sync(); showToast("起点已设为我的位置", "success", 1600);
  });
  // 地图点选：按钮自动补第一个缺失的点；点击输入框则可指定选起点/终点
  const setPick = (mode) => {
    _pickMode = _pickMode === mode ? null : mode;
    panel.querySelector("#route-pick").classList.toggle("active", !!_pickMode);
    if (_pickMode) showToast(_pickMode === "start" ? "请在地图上点击选择起点" : "请在地图上点击选择终点", "info", 2200);
  };
  panel.querySelector("#route-pick").addEventListener("click", () => {
    setPick(_routePts.start ? "end" : "start");
  });
  startInput.addEventListener("click", () => setPick("start"));
  endInput.addEventListener("click", () => setPick("end"));
  // 手动输入坐标（纬度,经度）也可直接设置起终点
  const parseLatLng = (txt) => {
    const m = (txt || "").match(/^\s*(-?\d+(?:\.\d+)?)\s*[,，]\s*(-?\d+(?:\.\d+)?)\s*$/);
    if (!m) return null;
    const lat = parseFloat(m[1]), lng = parseFloat(m[2]);
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
    return { lat, lng, label: `坐标 (${lat.toFixed(3)}, ${lng.toFixed(3)})` };
  };
  startInput.addEventListener("change", () => {
    const p = parseLatLng(startInput.value);
    if (p) { _routePts.start = p; sync(); showToast("起点已设置", "success", 1400); }
    else if (startInput.value.trim()) { showToast("格式应为：纬度,经度（如 39.9042,116.4074）", "warn"); startInput.value = fmt(_routePts.start); }
  });
  endInput.addEventListener("change", () => {
    const p = parseLatLng(endInput.value);
    if (p) { _routePts.end = p; sync(); showToast("终点已设置", "success", 1400); }
    else if (endInput.value.trim()) { showToast("格式应为：纬度,经度（如 31.2397,121.4998）", "warn"); endInput.value = fmt(_routePts.end); }
  });
  // 交换起终点
  swapBtn.addEventListener("click", () => {
    const t = _routePts.start; _routePts.start = _routePts.end; _routePts.end = t;
    sync();
  });

  planBtn.addEventListener("click", async () => {
    if (!_routePts.start || !_routePts.end) {
      showToast("请先设置起点与终点（可用「我的位置」或地图点选）", "warn");
      return;
    }
    planBtn.disabled = true; planBtn.classList.add("is-loading");
    info.innerHTML = `<div class="route-loading">正在规划路线...</div>`;
    try {
      const url = `${OSRM}/${_routePts.start.lng},${_routePts.start.lat};${_routePts.end.lng},${_routePts.end.lat}?overview=full&geometries=geojson&steps=false`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.code !== "Ok" || !json.routes || !json.routes.length) {
        info.innerHTML = `<div class="route-empty">未找到可行路线（OSRM 仅支持陆路交通）</div>`;
        return;
      }
      const r = json.routes[0];
      _drawRoute(r.geometry.coordinates);
      const km = (r.distance / 1000).toFixed(1);
      const min = Math.round(r.duration / 60);
      info.innerHTML = `
        <div class="route-summary">
          <div class="route-sum-item"><span>总距离</span><b>${km} 公里</b></div>
          <div class="route-sum-item"><span>预计用时</span><b>${min >= 60 ? Math.floor(min / 60) + " 小时 " + (min % 60) + " 分" : min + " 分钟"}</b></div>
        </div>
        <div class="route-engines">路线引擎：OSRM（开源） · 轨迹点 ${r.geometry.coordinates.length}</div>`;
      showToast("路线规划完成", "success", 1600);
    } catch (e) {
      info.innerHTML = `<div class="route-empty">路线服务暂不可用（OSRM）</div>`;
    } finally {
      planBtn.disabled = false; planBtn.classList.remove("is-loading");
    }
  });

  sync();
}

function _drawRoute(coords) {
  if (!_nodeMap) return;
  if (_routeLine) _nodeMap.removeLayer(_routeLine);
  // 轨迹线（蓝色）+ 柔光底衬
  _routeLine = L.layerGroup([
    L.polyline(coords, { color: "#ffffff", weight: 9, opacity: 0.55, lineCap: "round" }).addTo(_nodeMap),
    L.polyline(coords, { color: "#2563eb", weight: 5, opacity: 0.95, lineCap: "round" }).addTo(_nodeMap),
  ]).addTo(_nodeMap);
  // 起终点 marker
  _routeMarkers.forEach((m) => _nodeMap.removeLayer(m));
  _routeMarkers = [];
  const mkIcon = (cls, text) => L.divIcon({
    className: "",
    html: `<div class="route-pt ${cls}">${text}</div>`,
    iconSize: [26, 26], iconAnchor: [13, 13],
  });
  if (_routePts.start) _routeMarkers.push(L.marker([_routePts.start.lat, _routePts.start.lng], { icon: mkIcon("start", "起") }).addTo(_nodeMap));
  if (_routePts.end) _routeMarkers.push(L.marker([_routePts.end.lat, _routePts.end.lng], { icon: mkIcon("end", "终") }).addTo(_nodeMap));
  _nodeMap.fitBounds(_routeLine.getLayers()[1].getBounds(), { padding: [80, 90] });
}

/* ---------- 周边检索（Nominatim 视野内 POI） ---------- */
let _poiBound = false;
function _bindPoiPanel() {
  const panel = document.querySelector('.map-tab-panel[data-tab="poi"]');
  if (!panel || _poiBound) return;
  _poiBound = true;
  const listBox = panel.querySelector("#poi-list");
  panel.querySelectorAll(".poi-chip").forEach((chip) => {
    chip.addEventListener("click", async () => {
      panel.querySelectorAll(".poi-chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      const type = POI_TYPES.find((t) => t.key === chip.dataset.poi) || POI_TYPES[0];
      listBox.innerHTML = `<div class="poi-loading">正在检索附近${type.label}...</div>`;
      if (!_nodeMap) return;
      const b = _nodeMap.getBounds();
      const { engine, list } = await _geocodePoi(type, b);
      if (!list.length) {
        listBox.innerHTML = `<div class="poi-empty">${engine === null ? "周边服务暂不可用（Nominatim/Overpass）" : `当前视野内未找到${type.label}，可缩放地图后重试`}</div>`;
        return;
      }
      _clearPoiMarkers();
      list.forEach((it) => {
        const lat = parseFloat(it.lat), lng = parseFloat(it.lon);
        if (isNaN(lat) || isNaN(lng)) return;
        const icon = L.divIcon({
          className: "",
          html: `<div class="poi-marker"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#fff" stroke-width="2.4"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg></div>`,
          iconSize: [24, 24], iconAnchor: [12, 12], popupAnchor: [0, -12],
        });
        _poiMarkers.push(L.marker([lat, lng], { icon }).addTo(_nodeMap).bindPopup(
          `<div class="node-popup"><b>${escapeHtml(it.name || type.label)}</b><div class="row"><span>类型</span><span>${type.label}</span></div><div class="row"><span>地址</span><span>${escapeHtml(it.display_name)}</span></div></div>`));
      });
      listBox.innerHTML = list.slice(0, 8).map((it) => `
        <div class="poi-item" data-lat="${it.lat}" data-lon="${it.lon}">
          <div class="poi-item-name">${escapeHtml(it.name || type.label)}</div>
          <div class="poi-item-sub">${escapeHtml(it.display_name)}</div>
        </div>`).join("");
      listBox.querySelectorAll(".poi-item").forEach((el) => {
        el.addEventListener("click", () => {
          _nodeMap.flyTo([parseFloat(el.dataset.lat), parseFloat(el.dataset.lon)], 15, { duration: 1 });
        });
      });
    });
  });
}

function _clearPoiMarkers() {
  _poiMarkers.forEach((m) => _nodeMap && _nodeMap.removeLayer(m));
  _poiMarkers = [];
}

/* ================= 地图点选（路线终点） ================= */
function _bindMapPick() {
  if (!_nodeMap || _nodeMap._pickBound) return;
  _nodeMap._pickBound = true;
  _nodeMap.on("click", (e) => {
    if (!_pickMode) return;
    const { lat, lng } = e.latlng;
    if (_pickMode === "end") {
      _routePts.end = { lat, lng, label: `地图选点 (${lat.toFixed(3)}, ${lng.toFixed(3)})` };
      showToast("终点已设置", "success", 1600);
    } else if (_pickMode === "start") {
      _routePts.start = { lat, lng, label: `地图选点 (${lat.toFixed(3)}, ${lng.toFixed(3)})` };
      showToast("起点已设置", "success", 1600);
    }
    _pickMode = null;
    document.querySelectorAll("#route-pick").forEach((b) => b.classList.remove("active"));
    const si = document.getElementById("route-start");
    const ei = document.getElementById("route-end");
    if (si) si.value = _routePts.start ? (_routePts.start.label || `${_routePts.start.lat.toFixed(4)}, ${_routePts.start.lng.toFixed(4)}`) : "";
    if (ei) ei.value = _routePts.end ? (_routePts.end.label || `${_routePts.end.lat.toFixed(4)}, ${_routePts.end.lng.toFixed(4)}`) : "";
  });
}

/* ================= 节点数据 ================= */
async function _loadNodes(silent = false) {
  try {
    const res = await fetch(`${_apiBase()}/public/nodes`);
    const json = await res.json().catch(() => ({}));
    _nodeData = (json.code === 1 && json.data) ? json.data : [];
    if (_nodeMap && _nodeLayer) {
      if (_curLayer === "idc") _renderIdcLayer(_nodeMap, _nodeLayer);
      else if (_curLayer === "nodes") _renderNodeLayer(_nodeMap, _nodeLayer);
    }
    if (_dashMap && _dashLayer) {
      _renderNodeLayer(_dashMap, _dashLayer);
      const b = _nodeData.map((n) => [parseFloat(n.lat), parseFloat(n.lng)]).filter((p) => !isNaN(p[0]) && !isNaN(p[1]));
      if (b.length === 1) _dashMap.setView(b[0], 3, { animate: true });
      else if (b.length > 1) _dashMap.fitBounds(b, { padding: [50, 50], animate: true });
    }
    if (_nodeMap) {
      const pts = _nodeData.map((n) => [parseFloat(n.lat), parseFloat(n.lng)]).filter((p) => !isNaN(p[0]) && !isNaN(p[1]));
      if (_meLoc) pts.push([_meLoc.lat, _meLoc.lng]);
      if (pts.length === 1) _nodeMap.setView(pts[0], 6, { animate: true });
      else if (pts.length > 1) _nodeMap.fitBounds(pts, { padding: [70, 70], animate: true, maxZoom: 9 });
    }
    if (!silent) showToast(`已加载 ${_nodeData.length} 个节点`, "success");
  } catch (e) {
    if (!silent) showToast("节点数据加载失败", "error");
  }
}

/* ================= 地图初始化 ================= */
async function initNodeMap(force = false) {
  if (typeof L === "undefined") {
    showToast("地图库加载失败（请检查网络 CDN）", "error");
    return;
  }
  if (_nodeMap && !force) { _nodeMap.invalidateSize(); return; }

  if (!_nodeMap) {
    _nodeMap = L.map("node-map", {
      center: _meLoc ? [_meLoc.lat, _meLoc.lng] : [30, 110],
      zoom: _meLoc ? 8 : 2,
      worldCopyJump: true,
      zoomControl: false,          // 隐藏 Leaflet 默认控件 → 自定义毛玻璃控件
      attributionControl: true,
    });
    // 默认矢量浅色底图（与蓝白主题协调）
    const conf = BASEMAPS[_curBase] || BASEMAPS.light;
    _baseLayer = L.tileLayer(conf.url, { subdomains: conf.sub, attribution: conf.attr, maxZoom: 18 }).addTo(_nodeMap);
    _nodeLayer = L.layerGroup().addTo(_nodeMap);
    _bindMapSearch();
    _bindMapPick();
    switchMapTab("map");
  }

  if (!_meLoc && !_locating) locateMe(true);
  await _loadNodes(true);
}

async function initDashMap() {
  if (typeof L === "undefined") return;
  if (_dashMap) {
    _dashMap.invalidateSize();
    if (_nodeData.length && _dashLayer) _renderNodeLayer(_dashMap, _dashLayer);
    return;
  }
  const box = document.getElementById("dash-map");
  if (!box) return;
  _dashMap = L.map(box, {
    center: [30, 110], zoom: 2, worldCopyJump: true,
    zoomControl: false, attributionControl: false,
  });
  const conf = BASEMAPS.light;
  L.tileLayer(conf.url, { subdomains: conf.sub, maxZoom: 18 }).addTo(_dashMap);
  _dashLayer = L.layerGroup().addTo(_dashMap);
  if (_nodeData.length) {
    _renderNodeLayer(_dashMap, _dashLayer);
    const b = _nodeData.map((n) => [parseFloat(n.lat), parseFloat(n.lng)]).filter((p) => !isNaN(p[0]) && !isNaN(p[1]));
    if (b.length === 1) _dashMap.setView(b[0], 3, { animate: true });
    else if (b.length > 1) _dashMap.fitBounds(b, { padding: [50, 50], animate: true });
    if (_meLoc) _addMeMarker();
  } else {
    await _loadNodes(true);
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
