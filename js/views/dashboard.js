import { api } from '../api.js';
export async function render() {
    const res = await api.get('/api/admin/stats');
    const d = res.data || {sales:0,orders:0,users:0};
    setTimeout(()=>{
        let c = echarts.init(document.getElementById('ch'));
        c.setOption({
            grid: {top: 20, right: 10, bottom: 20, left: 30},
            xAxis:{type:'category',data:['一','二','三','四','五','六','日']},
            yAxis:{type:'value', splitLine:{lineStyle:{color:'#f1f5f9'}}},
            series:[{data:[150,230,224,218,135,147,260],type:'line',smooth:true, itemStyle:{color:'#2563eb'}, areaStyle:{color: new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'rgba(37,99,235,0.2)'},{offset:1,color:'rgba(37,99,235,0)'}])}}]
        });
    },100);
    return `
        <div class="fade-in">
            <div class="card" style="background: linear-gradient(135deg, #2563eb, #3b82f6); color: white;">
                <div style="font-size: 13px; opacity: 0.8; margin-bottom: 6px;">总销售额 (已发货)</div>
                <div style="font-size: 28px; font-weight: 800;">¥${d.sales.toLocaleString()}</div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div class="card"><div style="font-size:12px; color:#64748b;">总订单</div><div style="font-size:20px; font-weight:bold;">${d.orders}</div></div>
                <div class="card"><div style="font-size:12px; color:#64748b;">会员总数</div><div style="font-size:20px; font-weight:bold;">${d.users}</div></div>
            </div>
            <div class="card" style="height: 280px;" id="ch"></div>
        </div>
    `;
}
