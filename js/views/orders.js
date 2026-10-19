import { api } from '../api.js';

export async function renderOrders() {
    const res = await api.get('/api/shop/orders');
    const orders = res.data || [];
    
    const cards = orders.map(o => {
        // 解析该订单里的商品列表和采购链接
        const items = o.items || [];
        const itemsHtml = items.map(it => `
            <div class="flex justify-between items-center bg-gray-50 p-2 rounded mb-2 text-sm border border-gray-100">
                <div>
                    <span class="font-medium text-gray-800">${it.name}</span>
                    <span class="text-gray-400 ml-2">x${it.qty}</span>
                </div>
                <!-- 一键去 1688 采购 -->
                <a href="${it.source_url}" target="_blank" class="text-blue-600 font-medium hover:underline flex items-center gap-1">
                    🛒 去1688采购
                </a>
            </div>
        `).join('');

        return `
        <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3">
            <div class="flex justify-between items-center pb-3 border-b border-gray-100">
                <span class="font-bold text-gray-700">${o.trade_no}</span>
                <span class="text-xs px-2 py-1 rounded-full ${o.status === 0 ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}">${o.status === 0 ? '待采购发货' : '已发货'}</span>
            </div>
            
            <!-- 订单商品与源链接 -->
            <div class="my-2">
                ${itemsHtml || '无商品明细'}
            </div>

            <div class="text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
                <p>收件人：${o.receiver} <span class="text-gray-400">(${o.phone})</span></p>
                <p>地址：${o.address}</p>
            </div>
            <div class="flex justify-between items-center mt-2">
                <span class="text-lg font-bold text-red-500">¥${o.total_amount}</span>
                ${o.status === 0 
                    ? `<button onclick="window.doShip('${o.trade_no}')" class="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700">我已买完，填单号发货</button>`
                    : `<button onclick="window.showMap('${o.tracking_no}')" class="text-blue-600 text-sm font-medium hover:underline">查看物流 (${o.tracking_no})</button>`
                }
            </div>
        </div>
        `;
    }).join('');

    return `<div class="fade-in grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">${cards || '暂无订单'}</div>`;
}
