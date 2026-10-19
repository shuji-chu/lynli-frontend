import { api } from '../api.js';

export async function renderOrders(container) {
    container.innerHTML = `
        <div class="flex flex-col space-y-4">
            <!-- Tab 切换 -->
            <div class="flex bg-slate-200/60 p-1 rounded-xl text-sm font-medium">
                <button class="flex-1 py-2 bg-white text-slate-800 shadow-sm rounded-lg transition">全部</button>
                <button class="flex-1 py-2 text-slate-500 hover:text-slate-800 transition">待发货</button>
                <button class="flex-1 py-2 text-slate-500 hover:text-slate-800 transition">已发货</button>
            </div>

            <!-- 订单列表 -->
            <div id="order-list" class="space-y-4 pb-10">
                <div class="flex justify-center items-center py-10 text-slate-400"><i class="fa-solid fa-spinner fa-spin mr-2"></i>加载中...</div>
            </div>
        </div>
    `;

    try {
        const res = await api.getOrders();
        const list = res.data || [];
        const listEl = document.getElementById('order-list');

        if (list.length === 0) {
            listEl.innerHTML = `<div class="text-center py-10 text-slate-400">暂无订单数据</div>`;
            return;
        }

        listEl.innerHTML = list.map(order => `
            <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                <!-- 订单头 -->
                <div class="flex justify-between items-center pb-3 border-b border-slate-100 border-dashed">
                    <div class="flex items-center gap-2">
                        <i class="fa-solid fa-receipt text-slate-400"></i>
                        <span class="text-xs font-mono text-slate-600">${order.order_no}</span>
                    </div>
                    <span class="${order.status === '待发货' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'} text-xs px-2 py-1 rounded-md border font-bold">
                        ${order.status}
                    </span>
                </div>
                
                <!-- 收件信息 -->
                <div class="py-3 flex flex-col gap-1 text-sm">
                    <div class="flex items-center text-slate-700">
                        <i class="fa-solid fa-user w-5 text-slate-400"></i> 
                        <span class="font-medium">${order.receiver_name}</span>
                    </div>
                    <div class="flex items-center text-slate-500">
                        <i class="fa-solid fa-phone w-5 text-slate-400"></i> 
                        <span>${order.receiver_phone}</span>
                    </div>
                </div>

                <!-- 操作栏 -->
                <div class="flex justify-end gap-3 pt-3 border-t border-slate-100 border-dashed">
                    <button class="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100">去1688采购</button>
                    ${order.status === '待发货' 
                        ? `<button class="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-xl shadow-sm hover:bg-blue-700 transition">填写单号发货</button>` 
                        : `<button class="px-4 py-2 text-sm font-medium text-slate-400 bg-slate-50 rounded-xl cursor-not-allowed">查看物流</button>`
                    }
                </div>
            </div>
        `).join('');
    } catch (e) {
        document.getElementById('order-list').innerHTML = `<div class="text-center py-10 text-red-500">加载失败</div>`;
    }
}
