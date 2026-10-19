import { api } from '../api.js';

export async function renderProducts() {
    const res = await api.getProducts();
    const products = res.data || [];
    
    const cards = products.map(p => `
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group">
            <div class="h-48 overflow-hidden bg-gray-100">
                <img src="${p.image}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
            </div>
            <div class="p-5">
                <h4 class="font-bold text-gray-800 mb-2 truncate">${p.name}</h4>
                <div class="flex justify-between items-center">
                    <span class="text-xs text-gray-400">成本: ¥${p.cost_price}</span>
                    <span class="text-lg font-bold text-red-500">¥${p.price}</span>
                </div>
            </div>
        </div>
    `).join('');

    return `<div class="fade-in grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">${cards || '暂无商品'}</div>`;
}

export async function renderUsers() {
    const res = await api.getUsers();
    const users = res.data || [];
    
    const rows = users.map(u => `
        <tr class="border-b border-gray-100 hover:bg-gray-50">
            <td class="p-4"><img src="${u.avatar || 'https://via.placeholder.com/40'}" class="w-10 h-10 rounded-full bg-gray-200"></td>
            <td class="p-4 font-medium text-gray-800">${u.nickname || '未命名'}</td>
            <td class="p-4 text-gray-500">${u.email}</td>
        </tr>
    `).join('');

    return `
        <div class="fade-in bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table class="w-full text-left border-collapse">
                <thead class="bg-gray-50 text-gray-500 text-sm uppercase">
                    <tr><th class="p-4">头像</th><th class="p-4">昵称</th><th class="p-4">邮箱</th></tr>
                </thead>
                <tbody>${rows || '<tr><td colspan="3" class="p-4 text-center">暂无用户</td></tr>'}</tbody>
            </table>
        </div>
    `;
}
