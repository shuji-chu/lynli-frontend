import { api } from '../api.js';
export async function renderSettings(container) {
    const user = JSON.parse(localStorage.getItem('user_info') || '{}');
    container.innerHTML = `
        <div class="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
            <h2 class="text-lg font-bold text-slate-800 mb-6 border-b pb-4">个人资料与设置</h2>
            <form id="settingsForm" class="space-y-5">
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">登录账号</label>
                    <input type="text" value="${user.username}" disabled class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed outline-none">
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">显示昵称</label>
                    <input type="text" id="set-nickname" value="${user.nickname}" class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">头像 URL</label>
                    <input type="text" id="set-avatar" value="${user.avatar}" class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                </div>
                <button type="submit" class="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition">保存修改</button>
            </form>
        </div>
    `;
    document.getElementById('settingsForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const res = await api.updateProfile(document.getElementById('set-nickname').value, document.getElementById('set-avatar').value);
        if(res.code === 200) {
            localStorage.setItem('user_info', JSON.stringify(res.user));
            toast('资料更新成功！'); // 调用大厂 Toast
            setTimeout(() => window.location.reload(), 1000);
        } else toast(res.msg, 'error');
    });
}
