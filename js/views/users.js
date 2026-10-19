import { api } from '../api.js';
export async function render() {
    const res = await api.get('/api/admin/users');
    return `<div class="fade-in">${
        res.data.map(u=>`
        <div class="card" style="display:flex; gap:16px; align-items:center;">
            <img src="${u.avatar||'https://api.dicebear.com/7.x/adventurer/svg?seed=fallback'}" style="width:48px; height:48px; border-radius:50%; background:#f1f5f9;">
            <div>
                <div style="font-weight:600; font-size:15px;">${u.nickname||'未命名'}</div>
                <div style="font-size:13px; color:#64748b;">${u.email}</div>
            </div>
        </div>`).join('') || '暂无会员'
    }</div>`;
}
