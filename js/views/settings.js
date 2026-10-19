import { api } from '../api.js';
export async function renderSettings(container) {
    const user = JSON.parse(localStorage.getItem('user_info') || '{}');
    container.innerHTML = `
        <div class="max-w-2xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8">
            <h2 class="text-lg font-bold text-slate-800 mb-6 border-b pb-4">个人设置</h2>
            <div class="flex items-center gap-6 mb-8">
                <img id="set-avatar-preview" src="${user.avatar}" class="w-20 h-20 rounded-2xl bg-slate-100 border border-slate-200 object-cover">
                <div>
                    <p class="text-xs text-slate-400 mt-2">当前角色：<span class="text-blue-600 font-bold">${user.role === 'admin' ? '超级管理员' : '普通员工'}</span></p>
                </div>
            </div>
            <form id="settingsForm" class="space-y-5">
                <div><label class="block text-sm font-medium text-slate-700 mb-1">账号 (不可修改)</label><input type="text" value="${user.username}" disabled class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed outline-none"></div>
                <div><label class="block text-sm font-medium text-slate-700 mb-1">昵称</label><input type="text" id="set-nickname" value="${user.nickname}" class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none"></div>
                <div><label class="block text-sm font-medium text-slate-700 mb-1">头像 URL</label><input type="text" id="set-avatar" value="${user.avatar}" class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none"></div>
                <button type="submit" class="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition active:scale-95">保存修改</button>
            </form>
        </div>
    `;
    document.getElementById('settingsForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const newNick = document.getElementById('set-nickname').value;
        const newAvatar = document.getElementById('set-avatar').value;
        const res = await api.updateProfile(newNick, newAvatar);
        if(res.code === 200) {
            localStorage.setItem('user_info', JSON.stringify(res.user));
            alert('设置已更新！');
            window.location.reload();
        } else alert(res.msg);
    });
}
