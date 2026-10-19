export async function renderDashboard(container) {
    container.innerHTML = `
        <div class="grid grid-cols-2 gap-3 mb-4">
            <div class="bg-white p-4 rounded-2xl shadow-sm">
                <p class="text-xs text-slate-500 mb-1">今日营收</p>
                <h3 class="text-xl font-black text-slate-800">¥ 12,450</h3>
            </div>
            <div class="bg-white p-4 rounded-2xl shadow-sm">
                <p class="text-xs text-slate-500 mb-1">订单总数</p>
                <h3 class="text-xl font-black text-slate-800">142</h3>
            </div>
        </div>
        <div class="bg-white p-4 rounded-2xl shadow-sm mb-4">
            <h3 class="font-bold text-sm mb-3 text-slate-700">近 7 天营收</h3>
            <div id="chart" class="w-full h-64"></div>
        </div>
    `;

    // 延迟一点点等 DOM 渲染完再画图，解决手机端尺寸计算问题
    setTimeout(() => {
        const chartDom = document.getElementById('chart');
        if (chartDom && window.echarts) {
            const myChart = echarts.init(chartDom);
            myChart.setOption({
                grid: { top: 10, right: 10, bottom: 20, left: 40 },
                xAxis: { type: 'category', data: ['周一','周二','周三','周四','周五','周六','周日'], axisLine: { lineStyle: { color: '#e2e8f0' } }, axisLabel: { fontSize: 10 } },
                yAxis: { type: 'value', splitLine: { lineStyle: { color: '#f1f5f9' } }, axisLabel: { fontSize: 10 } },
                series: [{ 
                    data: [1200, 2000, 1500, 3000, 2400, 4000, 3200], 
                    type: 'line', 
                    smooth: true,
                    itemStyle: { color: '#3b82f6' },
                    areaStyle: { 
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: 'rgba(59, 130, 246, 0.5)' }, 
                            { offset: 1, color: 'rgba(59, 130, 246, 0.01)' }
                        ]) 
                    } 
                }]
            });
            // 屏幕旋转或缩放时自动重绘
            window.addEventListener('resize', () => myChart.resize());
        }
    }, 100);
}
