/* ============================================================
   全域可视化地图 —— Leaflet 卫星影像 + 发光节点 Marker + 真实定位
   数据源：GET /api/v1/public/nodes（servers 表真实节点）
   定位：navigator.geolocation（浏览器原生，需用户授权）
   图层：节点分布（nodes）/ 电商物流（logistics）/ 服务器机房（idc）
   双实例：工作台首屏小图（#dash-map）+ 全屏大图（#node-map）
   ============================================================ */

let _nodeMap = null;       // 全屏地图实例
let _dashMap = null;       // 工作台首屏小图实例
let _nodeLayer = null;
let _dashLayer = null;
let _meMarker = null;
let _meCircle = null;
let _meLoc = null;         // { lat, lng }
let _locating = false;
let _nodeData = [];        // 缓存的真实节点数据
let _curLayer = 'nodes';   // 当前图层：nodes / logistics / idc

const SAT_TILES = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const LAYER_LABELS = { nodes: "节点分布", logistics: "电商物流", idc: "服务器机房" };

// 域名说明：仅 web.lynli.me（面板）走同源 /api/v1；tg.lynli.me 等商城域名走 api.lynli.me
function _apiBase() {
  return (location.hostname === "web.lynli.me")
    ? "/api/v1"
    : "https://api.lynli.me/api/v1";
}

// ---------- 定位状态芯片 ----------
function _setGeoChip(state, text) {
  const chip = document.getElementById('geo-chip');
  const t = document.getElementById('geo-text');
  if (!chip || !t) return;
  chip.classList.remove('ok', 'err');
  if (state === 'ok') chip.classList.add('ok');
  if (state === 'err') chip.classList.add('err');
  t.innerText = text;
}

// ---------- 真实定位 ----------
function locateMe(silent = false) {
  if (_locating) return;
  if (!navigator.geolocation) {
    _setGeoChip('err', '浏览器不支持定位');
    if (!silent) showToast('当前浏览器不支持定位', 'warn');
    return;
  }
  _locating = true;
  _setGeoChip('', '定位中...');

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      _locating = false;
      const { latitude: lat, longitude: lng, accuracy } = pos.coords;
      _meLoc = { lat, lng };
      _setGeoChip('ok', `已定位 (${lat.toFixed(3)}, ${lng.toFixed(3)})`);
      if (!silent) showToast('已定位到您的当前位置', 'success');

      if (!_nodeMap && !_dashMap) { initNodeMap(); return; }
      _addMeMarker();
    },
    (err) => {
      _locating = false;
      const msg = err.code === 1 ? '定位权限被拒绝' : (err.code === 2 ? '位置获取失败' : '定位超时');
      _setGeoChip('err', msg);
      if (!silent) showToast(msg + '，可点击按钮重试', 'warn');
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
  );
}

// ---------- 我的位置 Marker（呼吸光晕，双图同步） ----------
function _addMeMarker() {
  if (!_meLoc) return;
  const meIcon = L.divIcon({
    className: "",
    html: `<div class="me-marker"><div class="me-halo"></div><div class="me-ring"></div><div class="me-core"></div></div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -14],
  });
  const popup = `<div class="node-popup"><b>我的位置</b><div class="row"><span>纬度</span><span>${_meLoc.lat.toFixed(5)}</span></div><div class="row"><span>经度</span><span>${_meLoc.lng.toFixed(5)}</span></div></div>`;
  [_nodeMap, _dashMap].forEach(map => {
    if (!map) return;
    const old = map._meMarker;
    if (old) { map.removeLayer(old); }
    const oldC = map._meCircle;
    if (oldC) { map.removeLayer(oldC); }
    const mk = L.marker([_meLoc.lat, _meLoc.lng], { icon: meIcon, zIndexOffset: 1000 })
      .addTo(map).bindPopup(popup);
    map._meMarker = mk;
  });
  // 视野适配：全屏图以我的位置 + 全部节点为中心
  if (_nodeMap && _nodeData.length) {
    const pts = _nodeData.map(n => [parseFloat(n.lat), parseFloat(n.lng)]).filter(p => !isNaN(p[0]) && !isNaN(p[1]));
    pts.push([_meLoc.lat, _meLoc.lng]);
    if (pts.length > 1) _nodeMap.fitBounds(pts, { padding: [70, 70], animate: true, maxZoom: 9 });
  }
}

// ---------- 自定义缩放控件 ----------
function mapZoomIn() {
  if (_nodeMap) _nodeMap.zoomIn(1, { animate: true });
}
function mapZoomOut() {
  if (_nodeMap) _nodeMap.zoomOut(1, { animate: true });
}

// ---------- Marker 图标工厂 ----------
function _nodeIcon(live) {
  return L.divIcon({
    className: "",
    html: `<div class="node-marker ${live ? "" : "offline"}"><div class="halo"></div><div class="pulse"></div><div class="pulse pulse2"></div><div class="core"></div></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14],
  });
}
function _idcIcon() {
  return L.divIcon({
    className: "",
    html: `<div class="idc-marker"><div class="halo"></div><div class="pulse"></div><div class="core"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M4 6h16M4 12h16M4 18h16"/></svg></div></div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -14],
  });
}

// ---------- 节点图层渲染 ----------
function _renderNodeLayer(map, layer) {
  if (!map || !layer) return;
  layer.clearLayers();
  const bounds = [];
  _nodeData.forEach(n => {
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
      </div>
    `);
    bounds.push([lat, lng]);
  });
  return bounds;
}

// ---------- 机房图层渲染（同数据源，紫色方形极客 Marker） ----------
function _renderIdcLayer(map, layer) {
  if (!map || !layer) return;
  layer.clearLayers();
  const bounds = [];
  _nodeData.forEach(n => {
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
        <div class="row"><span>坐标</span><span>${lat.toFixed(2)}, ${lng.toFixed(2)}</span></div>
      </div>
    `);
    bounds.push([lat, lng]);
  });
  return bounds;
}

// ---------- 图层切换器 ----------
function switchMapLayer(layer) {
  _curLayer = layer;
  document.querySelectorAll('.map-layer-switch .layer-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.layer === layer);
  });
  const note = document.getElementById('map-layer-note');
  if (note) note.innerText = `当前图层：${LAYER_LABELS[layer] || layer}`;
  const empty = document.getElementById('map-empty-layer');

  if (layer === 'nodes') {
    if (empty) empty.classList.remove('show');
    if (_nodeMap && _nodeLayer) {
      const b = _renderNodeLayer(_nodeMap, _nodeLayer);
      if (b && b.length === 1) _nodeMap.setView(b[0], 6, { animate: true });
      else if (b && b.length > 1) _nodeMap.fitBounds(b, { padding: [60, 60], animate: true });
    }
  } else if (layer === 'idc') {
    if (empty) empty.classList.remove('show');
    if (_nodeMap && _nodeLayer) {
      const b = _renderIdcLayer(_nodeMap, _nodeLayer);
      if (b && b.length === 1) _nodeMap.setView(b[0], 6, { animate: true });
      else if (b && b.length > 1) _nodeMap.fitBounds(b, { padding: [60, 60], animate: true });
    }
  } else if (layer === 'logistics') {
    if (_nodeMap && _nodeLayer) _nodeLayer.clearLayers();
    if (empty) {
      empty.classList.add('show');
      showToast('电商物流图层即将上线，轨迹数据接入后自动点亮', 'info');
    }
  }
}

// ---------- 节点数据加载（双图同步） ----------
async function _loadNodes(silent = false) {
  try {
    const res = await fetch(`${_apiBase()}/public/nodes`);
    const json = await res.json().catch(() => ({}));
    _nodeData = (json.code === 1 && json.data) ? json.data : [];

    // 全屏图：按当前图层渲染
    if (_nodeMap && _nodeLayer) {
      if (_curLayer === 'idc') _renderIdcLayer(_nodeMap, _nodeLayer);
      else if (_curLayer === 'nodes') _renderNodeLayer(_nodeMap, _nodeLayer);
    }
    // 工作台小图：始终节点图层
    if (_dashMap && _dashLayer) {
      _renderNodeLayer(_dashMap, _dashLayer);
      const b = _nodeData.map(n => [parseFloat(n.lat), parseFloat(n.lng)]).filter(p => !isNaN(p[0]) && !isNaN(p[1]));
      if (b.length === 1) _dashMap.setView(b[0], 3, { animate: true });
      else if (b.length > 1) _dashMap.fitBounds(b, { padding: [50, 50], animate: true });
    }

    // 全屏图视野适配
    if (_nodeMap) {
      const pts = _nodeData.map(n => [parseFloat(n.lat), parseFloat(n.lng)]).filter(p => !isNaN(p[0]) && !isNaN(p[1]));
      if (_meLoc) pts.push([_meLoc.lat, _meLoc.lng]);
      if (pts.length === 1) _nodeMap.setView(pts[0], 6, { animate: true });
      else if (pts.length > 1) _nodeMap.fitBounds(pts, { padding: [70, 70], animate: true, maxZoom: 9 });
    }

    if (!silent) showToast(`已加载 ${_nodeData.length} 个节点`, 'success');
  } catch (e) {
    if (!silent) showToast('节点数据加载失败', 'error');
  }
}

// ---------- 全屏地图初始化 ----------
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
      zoomControl: false,          // 隐藏默认控件，用自定义玻璃按钮
      attributionControl: true,
    });
    // 卫星影像图层（ArcGIS World Imagery）
    L.tileLayer(SAT_TILES, {
      attribution: "Imagery © Esri",
      maxZoom: 18,
    }).addTo(_nodeMap);
    _nodeLayer = L.layerGroup().addTo(_nodeMap);
  }

  // 页面加载即尝试真实定位（静默模式，失败只更新芯片不弹窗）
  if (!_meLoc && !_locating) locateMe(true);
  await _loadNodes(true);
}

// ---------- 工作台首屏小图初始化（仅一次） ----------
async function initDashMap() {
  if (typeof L === "undefined") return;
  if (_dashMap) {
    _dashMap.invalidateSize();
    if (_nodeData.length && _dashLayer) {
      _renderNodeLayer(_dashMap, _dashLayer);
    }
    return;
  }
  const box = document.getElementById('dash-map');
  if (!box) return;
  _dashMap = L.map(box, {
    center: [30, 110],
    zoom: 2,
    worldCopyJump: true,
    zoomControl: false,
    attributionControl: false,
  });
  L.tileLayer(SAT_TILES, { maxZoom: 18 }).addTo(_dashMap);
  _dashLayer = L.layerGroup().addTo(_dashMap);

  // 已缓存过节点则直接渲染，否则拉取
  if (_nodeData.length) {
    _renderNodeLayer(_dashMap, _dashLayer);
    const b = _nodeData.map(n => [parseFloat(n.lat), parseFloat(n.lng)]).filter(p => !isNaN(p[0]) && !isNaN(p[1]));
    if (b.length === 1) _dashMap.setView(b[0], 3, { animate: true });
    else if (b.length > 1) _dashMap.fitBounds(b, { padding: [50, 50], animate: true });
    if (_meLoc) _addMeMarker();
  } else {
    await _loadNodes(true);
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
