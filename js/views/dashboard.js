import { api } from '../api.js';

export async function renderDashboard() {
    const res = await api.getStats();
    const data = res.data || { sales: 0, orders: 0, users: 0 };
    
    // 延迟等待 DOM 渲染后再初始化 ECharts
    setTimeout(() => {
        var lineChart = echarts.init(document.getElementById('chart-line'));
        lineChart.setOption({
            tooltip: { trigger: 'axis' },
            xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] },
            yAxis: { type: 'value' },
            series: [{ data: [820, 932, 901, 934, 1290, 1330, 1320], type: 'line', smooth: true, itemStyle: { color: '#2563eb' }, areaStyle: { color: 'rgba(37,99,235,0.1)' } }]
        });
    }, 100);

    return `
        <div class="fade-in">
            <div class="grid grid-cols-3 gap-6 mb-6">
                <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div class="text-gray-500 text-sm mb-2">总销售额</div>
                    <div class="text-3xl font-bold text-gray-800">¥ ${data.sales}</div>
                </div>
                <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div class="text-gray-500 text-sm mb-2">总订单数</div>
                    <div class="text-3xl font-bold text-gray-800">${data.orders}</div>
                </div>
                <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div class="text-gray-500 text-sm mb-2">注册用户</div>
                    <div class="text-3xl font-bold text-gray-800">${data.users}</div>
                </div>
            </div>
            <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 class="text-lg font-bold mb-4">营收趋势图</h3>
                <div id="chart-line" class="w-full h-80"></div>
            </div>
        </div>
    `;
}
