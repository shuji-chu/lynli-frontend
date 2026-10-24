/* ============================================================
   节点地图 —— Leaflet 卫星影像 + 发光节点 Marker
   数据源：GET /api/v1/public/nodes（servers 表真实节点）
   ============================================================ */

let _nodeMap = null;
let _markerLayer = null;

const SAT_TILES = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

// 域名说明：仅 web.lynli.me（面板）走同源 /api/v1；tg.lynli.me 等商城域名走 api.lynli.me
function _apiBase() {
  return (location.hostname === "web.lynli.me")
    ? "/api/v1"
    : "https://api.lynli.me/api/v1";
}

async function initNodeMap(force = false) {
  if (typeof L === "undefined") {
    showToast("地图库加载失败（请检查网络 CDN）", "📡");
    return;
  }
  if (_nodeMap && !force) { _nodeMap.invalidateSize(); return; }

  if (!_nodeMap) {
    _nodeMap = L.map("node-map", {
      center: [30, 110],
      zoom: 2,
      worldCopyJump: true,
      zoomControl: true,
    });
    // 卫星影像图层（ArcGIS World Imagery）
    L.tileLayer(SAT_TILES, {
      attribution: "Imagery © Esri",
      maxZoom: 18,
    }).addTo(_nodeMap);
    _markerLayer = L.layerGroup().addTo(_nodeMap);
  }

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
        html: `<div class="node-marker ${live ? "" : "offline"}"><div class="pulse"></div><div class="core"></div></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
        popupAnchor: [0, -12],
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

    if (bounds.length === 1) {
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
