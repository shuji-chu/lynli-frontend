import { api } from '../api.js';
export async function render() {
    const res = await api.get('/api/admin/stats');
    const d = res.data || {sales:0,orders:0,users:0};
    setTimeout(()=>{
        let lineChart = echarts.init(document.getElementById('chart-line'));
        lineChart.setOption({
            grid: {top: 20, right: 10, bottom: 20, left: 30},
            tooltip:{trigger:'axis'},
            xAxis:{type:'category',data:['一','二','三','四','五','六','日'], axisLine:{lineStyle:{color:'#e2e8f0'}}, axisLabel:{color:'#64748b'}},
            yAxis:{type:'value', splitLine:{lineStyle:{color:'#f1f5f9'}}, axisLabel:{color:'#64748b'}},
            series:[{data:[150,230,224,218,135,147,260],type:'line',smooth:true, symbolSize:6, itemStyle:{color:'#2563eb'}, areaStyle:{color: new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'rgba(37,99,235,0.2)'},{offset:1,color:'rgba(37,99,235,0)'}])}}]
        });
        
        let pieChart = echarts.init(document.getElementById('chart-pie'));
        pieChart.setOption({
            tooltip: { trigger: 'item' },
            legend: { bottom: '0%' },
            series: [{
                type: 'pie', radius: ['50%', '70%'], avoidLabelOverlap: false,
                label: { show: false },
                data: [
                    { value: 60, name: '智能设备', itemStyle: { color: '#2563eb' } },
                    { value: 30, name: '私密护理', itemStyle: { color: '#7c3aed' } },
                    { value: 10, name: '周边', itemStyle: { color: '#db2777' } }
                ]
            }]
        });
    },100);

    return `
        <div class="fade-in">
            <div class="card" style="background: linear-gradient(135deg, #1e293b, #0f172a); color: white; border: none;">
                <div style="font-size: 13px; opacity: 0.8; margin-bottom: 8px; display:flex; justify-content:space-between;">
                    <span>总销售额 (已发货)</span>
                    <span style="color:#10b981; font-weight:bold;">↑ 12.5%</span>
                </div>
                <div style="font-size: 32px; font-weight: 800;">¥${d.sales.toLocaleString()}</div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div class="card">
                    <div style="font-size:12px; color:#64748b; margin-bottom:4px;">总订单</div>
                    <div style="font-size:24px; font-weight:bold;">${d.orders}</div>
                </div>
                <div class="card">
                    <div style="font-size:12px; color:#64748b; margin-bottom:4px;">会员总数</div>
                    <div style="font-size:24px; font-weight:bold;">${d.users}</div>
                </div>
            </div>
            <div class="card" style="height: 260px; padding: 16px 0 0 0;">
                <h3 style="font-size:14px; font-weight:600; padding-left:20px; margin-bottom:10px;">7日营收趋势</h3>
                <div id="chart-line" style="width: 100%; height: 220px;"></div>
            </div>
            <div class="card" style="height: 260px; padding: 16px 0 0 0;">
                <h3 style="font-size:14px; font-weight:600; padding-left:20px; margin-bottom:10px;">销售品类占比</h3>
                <div id="chart-pie" style="width: 100%; height: 220px;"></div>
            </div>
        </div>
    `;
}
