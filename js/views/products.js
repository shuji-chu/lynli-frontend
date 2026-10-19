export function renderProducts(list) {
    return list.map(p => `
        <div class="data-card" style="padding:0; overflow:hidden;">
            <img src="${p.image}" style="width:100%; height:160px; object-fit:cover;">
            <div style="padding:15px;">
                <div style="font-weight:bold; height:40px; overflow:hidden;">${p.name}</div>
                <div style="display:flex; justify-content:space-between; margin-top:10px;">
                    <span style="color:var(--text-sub)">进价: ¥${p.cost_price}</span>
                    <b style="color:var(--danger)">售价: ¥${p.price}</b>
                </div>
            </div>
        </div>
    `).join('');
}

export function renderDrafts(list) {
    return list.map(d => `
        <div class="data-card" style="padding:0; overflow:hidden;">
            <img src="${d.image_url.replace('http://','https://')}" style="width:100%; height:160px; object-fit:cover;">
            <div style="padding:15px;">
                <div style="font-weight:bold; height:40px; overflow:hidden;">${d.title}</div>
                <div style="display:flex; justify-content:space-between; margin-top:10px; align-items:center;">
                    <span style="color:var(--danger)">¥${d.price}</span>
                    <button class="btn btn-blue" onclick="window.doPublish(${d.id})">上架</button>
                </div>
            </div>
        </div>
    `).join('');
}
