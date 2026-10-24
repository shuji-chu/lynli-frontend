import { api } from '../api.js';

export async function render(container) {
  container.innerHTML = `
    <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
      <h2 style="margin: 0; font-size: 20px; font-weight: bold; color: #1e293b;">🌍 全球节点动态大屏 (3D)</h2>
      <button id="btn-refresh" style="padding: 8px 16px; border-radius: 6px; background: #3b82f6; color: #fff; border: none; cursor: pointer;">🔄 刷新数据</button>
    </div>
    <div id="map-container" style="width: 100%; height: 550px; background: #0b0f19; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); margin-bottom: 20px; overflow: hidden; position: relative; z-index: 1;"></div>
    <div id="node-table-container" class="table-container" style="background:#fff; border-radius:8px; padding:15px; position: relative; z-index: 2;">
      <div style="text-align:center; padding: 20px;">正在加载数据...</div>
    </div>
  `;

  const mapContainer = document.getElementById('map-container');
  const tableContainer = document.getElementById('node-table-container');
  let map = null;

  async function loadMapLibre() {
    if (window.maplibregl) return;
    return new Promise((resolve) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css';
      document.head.appendChild(link);
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js';
      script.onload = resolve;
      document.head.appendChild(script);
    });
  }

  async function initMap() {
    try {
      await loadMapLibre();
      const res = await api.get('/v1/map/nodes');
      const nodes = res.data || [];
      renderTable(nodes);

      if (!map) {
        map = new window.maplibregl.Map({
          container: 'map-container',
          style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
          center: [105.0, 35.0],
          zoom: 2.5,
          pitch: 45,
          bearing: 0
        });
        map.addControl(new window.maplibregl.NavigationControl(), 'top-right');
      }

      document.querySelectorAll('.maplibregl-marker').forEach(el => el.remove());

      nodes.forEach(n => {
        if (n.lat && n.lng) {
          const el = document.createElement('div');
          el.className = 'custom-marker';
          el.style.width = '12px';
          el.style.height = '12px';
          el.style.backgroundColor = '#3b82f6';
          el.style.borderRadius = '50%';
          el.style.boxShadow = '0 0 15px 5px rgba(59, 130, 246, 0.6)';
          el.style.border = '2px solid #fff';

          const popup = new window.maplibregl.Popup({ offset: 15 })
            .setHTML(`
              <div style="font-family: sans-serif; font-size: 13px; color: #333;">
                <b style="font-size: 14px;">${n.name}</b><br/>
                <span style="color: #666;">地区:</span> ${n.region} / ${n.city}<br/>
                <span style="color: #666;">IP:</span> ${n.ip}<br/>
                <span style="color: #10b981; font-weight: bold;">● 在线</span>
              </div>
            `);

          new window.maplibregl.Marker(el)
            .setLngLat([n.lng, n.lat])
            .setPopup(popup)
            .addTo(map);
        }
      });
    } catch (err) {
      mapContainer.innerHTML = `<div style="color:red; padding:20px;">地图加载失败：${err.message}</div>`;
    }
  }

  function renderTable(nodes) {
    if (nodes.length === 0) {
      tableContainer.innerHTML = '<div style="text-align:center; padding:20px;">暂无节点</div>';
      return;
    }
    tableContainer.innerHTML = `
      <table style="width:100%; text-align:left; border-collapse:collapse;">
        <thead><tr style="border-bottom:1px solid #eee; color:#666; font-size:13px;"><th style="padding:10px;">节点名称</th><th style="padding:10px;">IP / 地址</th><th style="padding:10px;">地理位置</th><th style="padding:10px;">状态</th></tr></thead>
        <tbody>
          ${nodes.map(n => `
            <tr style="border-bottom:1px solid #f9f9f9; font-size:14px;">
              <td style="padding:10px; font-weight:500;">${n.name}</td>
              <td style="padding:10px; color:#666;">${n.ip}</td>
              <td style="padding:10px;">${n.region} / ${n.city}</td>
              <td style="padding:10px;"><span style="color:#10b981;">在线</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  document.getElementById('btn-refresh').addEventListener('click', () => {
    tableContainer.innerHTML = '<div style="text-align:center; padding:20px;">正在刷新...</div>';
    initMap();
  });

  await initMap();
}
