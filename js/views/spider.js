import { api } from '../api.js';
export async function render() {
    const res = await api.get('/api/spider/list');
    return `<div class="fade-in">
        <div class="card" style="display:flex; gap:12px; padding:12px;">
            <input type="text" id="crawl-kw" placeholder="输入商品关键词..." style="flex:1; padding:12px; border:1px solid #e2e8f0; border-radius:8px; outline:none;">
            <button onclick="window.startCrawl()" style="background:#0f172a; color:#fff; border:none; padding:0 20px; border-radius:8px; cursor:pointer;">抓取</button>
        </div>
        <div id="draft-list">
            ${(res.data||[]).map(d=>`
            <div class="card" style="display:flex; gap:16px; align-items:center;">
                <img src="${(d.image_url||'').replace('http://','https://')}" style="width:80px; height:80px; object-fit:cover; border-radius:8px; background:#f1f5f9;">
                <div style="flex:1;">
                    <div style="font-weight:600; font-size:14px; margin-bottom:8px;">${d.title}</div>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-weight:bold; color:#ef4444;">¥${d.price}</span>
                        <button onclick="window.doPublish(${d.id})" style="background:#eff6ff; color:#2563eb; border:none; padding:6px 12px; border-radius:6px; font-weight:600; cursor:pointer;">一键上架</button>
                    </div>
                </div>
            </div>`).join('') || '暂无草稿'}
        </div>
    </div>`;
}
