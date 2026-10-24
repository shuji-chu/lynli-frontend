/* ============================================================
   节点地图 —— Leaflet 卫星影像 + 发光节点 Marker + 真实定位
   数据源：GET /api/v1/public/nodes（servers 表真实节点）
   定位：navigator.geolocation（浏览器原生，需用户授权）
   ============================================================ */

let _nodeMap = null;
let _markerLayer = null;
let _meMarker = null;
let _meCircle = null;
let _meLoc = null;        // { lat, lng }
let _locating = false;

const SAT_TILES = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

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
    if (!silent) showToast('当前浏览器不支持定位', '⚠️');
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
      if (!silent) showToast('已定位到您的当前位置', '📍');

      if (!_nodeMap) { initNodeMap(); return; }

      // 呼吸光晕 Marker
      if (_meMarker) { _nodeMap.removeLayer(_meMarker); }
      if (_meCircle) { _nodeMap.removeLayer(_meCircle); }
      const meIcon = L.divIcon({
        className: "",
        html: `<div class="me-marker"><div class="me-halo"></div><div class="me-ring"></div><div class="me-core"></div></div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
        popupAnchor: [0, -14],
      });
      _meMarker = L.marker([lat, lng], { icon: meIcon, zIndexOffset: 1000 })
        .addTo(_nodeMap)
        .bindPopup(`<div class="node-popup"><b>📍 我的位置</b><div class="row"><span>纬度</span><span>${lat.toFixed(5)}</span></div><div class="row"><span>经度</span><span>${lng.toFixed(5)}</span></div><div class="row"><span>精度</span><span>±${Math.round(accuracy)} m</span></div></div>`);
      _meCircle = L.circle([lat, lng], {
        radius: Math.max(accuracy, 60),
        color: '#2563eb', weight: 1, fillColor: '#2563eb', fillOpacity: .08,
      }).addTo(_nodeMap);

      // 地图飞到我的位置（有节点时保留节点视野，仅我的位置时放大）
      if (!_markerLayer || !_markerLayer.getLayers().length) {
        _nodeMap.setView([lat, lng], 10, { animate: true });
      }
    },
    (err) => {
      _locating = false;
      const msg = err.code === 1 ? '定位权限被拒绝' : (err.code === 2 ? '位置获取失败' : '定位超时');
      _setGeoChip('err', msg);
      if (!silent) showToast(msg + '，可点击按钮重试', '📍');
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
  );
}

// ---------- 自定义缩放控件 ----------
function mapZoomIn() {
  if (_nodeMap) _nodeMap.zoomIn(1, { animate: true });
}
function mapZoomOut() {
  if (_nodeMap) _nodeMap.zoomOut(1, { animate: true });
}

async function initNodeMap(force = false) {
  if (typeof L === "undefined") {
    showToast("地图库加载失败（请检查网络 CDN）", "📡");
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
    _markerLayer = L.layerGroup().addTo(_nodeMap);
  }

  // 页面加载即尝试真实定位（静默模式，失败只更新芯片不弹窗）
  if (!_meLoc && !_locating) locateMe(true);

  try {
    const res = await fetch(`${_apiBase()}/public/nodes`);
    const json = await res.json().catch(() => ({}));
    const nodes = (json.code === 1 && json.data) ? json.data : [];
    _markerLayer.clearLayers();

    if (!nodes.length) {
      showToast("暂无节点数据", "⚠️");
      return;
    }

    const bounds = [];
    nodes.forEach(n => {
      const lat = parseFloat(n.lat), lng = parseFloat(n.lng);
      if (isNaN(lat) || isNaN(lng)) return;
      // 公开接口返回 status: "online"/"offline"（兼容旧字段 enabled）
      const live = n.status ? n.status === "online" : (n.enabled === 1 || n.enabled === "1");
      const icon = L.divIcon({
        className: "",
        html: `<div class="node-marker ${live ? "" : "offline"}"><div class="halo"></div><div class="pulse"></div><div class="pulse pulse2"></div><div class="core"></div></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -14],
      });
      const marker = L.marker([lat, lng], { icon }).addTo(_markerLayer);
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

    // 已定位：以我的位置为中心适配全部视野；否则适配节点
    if (_meLoc) {
      bounds.push([_meLoc.lat, _meLoc.lng]);
      _nodeMap.fitBounds(bounds, { padding: [70, 70], animate: true, maxZoom: 9 });
    } else if (bounds.length === 1) {
      _nodeMap.setView(bounds[0], 6, { animate: true });
    } else if (bounds.length > 1) {
      _nodeMap.fitBounds(bounds, { padding: [60, 60], animate: true });
    }
    showToast(`已加载 ${nodes.length} 个节点`, "🌍");
  } catch (e) {
    showToast("节点数据加载失败", "❌");
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
