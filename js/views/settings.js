import { api } from '../api.js';
export async function renderSettings(container) {
    const user = JSON.parse(localStorage.getItem('user_info') || '{}');
    container.innerHTML = `
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 max-w-xl">
            <form id="form" class="space-y-4">
                <div><label class="text-xs font-medium text-slate-500">账号</label><input type="text" disabled value="${user.username}" class="w-full px-4 py-2 bg-slate-50 border rounded-xl text-slate-400 mt-1"></div>
                <div><label class="text-xs font-medium text-slate-500">昵称</label><input type="text" id="nick" value="${user.nickname}" class="w-full px-4 py-2 border rounded-xl mt-1 focus:ring-2 focus:ring-blue-500 outline-none"></div>
                <div><label class="text-xs font-medium text-slate-500">头像URL</label><input type="text" id="ava" value="${user.avatar}" class="w-full px-4 py-2 border rounded-xl mt-1 focus:ring-2 focus:ring-blue-500 outline-none"></div>
                <button type="submit" class="w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl mt-4">保存</button>
            </form>
        </div>
    `;
    document.getElementById('form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const res = await api.updateProfile(document.getElementById('nick').value, document.getElementById('ava').value);
        if(res.code === 200) { localStorage.setItem('user_info', JSON.stringify(res.user)); toast('资料更新成功'); setTimeout(()=>window.location.reload(), 1000); }
    });
}
