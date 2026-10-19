export async function renderUsers(container) {
    const user = JSON.parse(localStorage.getItem('user_info') || '{}');
    container.innerHTML = `
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <table class="w-full text-left">
                <thead class="bg-slate-50 text-xs text-slate-400"><tr><th class="p-4">用户</th><th class="p-4">角色</th><th class="p-4">状态</th></tr></thead>
                <tbody class="divide-y divide-slate-100">
                    <tr>
                        <td class="p-4 flex items-center gap-3"><img src="${user.avatar}" class="w-8 h-8 rounded-full"><div><div class="font-bold">${user.nickname}</div><div class="text-xs text-slate-400">${user.username}</div></div></td>
                        <td class="p-4"><span class="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs">超级管理员</span></td>
                        <td class="p-4 text-emerald-500 text-xs font-bold">正常</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
}
