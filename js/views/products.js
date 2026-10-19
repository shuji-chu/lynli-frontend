import { api } from '../api.js';
export async function render() {
    const res = await api.get('/api/shop/products');
    return `<div class="fade-in">${
        res.data.map(p=>`
        <div class="card" style="display:flex; gap:16px; align-items:center;">
            <img src="${p.image}" style="width:80px; height:80px; object-fit:cover; border-radius:8px; background:#f1f5f9;">
            <div style="flex:1;">
                <div style="font-weight:600; font-size:14px; margin-bottom:8px;">${p.name}</div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:12px; color:#94a3b8;">成本: ¥${p.cost_price}</span>
                    <span style="font-weight:bold; font-size:16px;">¥${p.price}</span>
                </div>
            </div>
        </div>`).join('') || '暂无商品'
    }</div>`;
}
