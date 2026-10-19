import { api } from '../api.js';
export async function renderUsers(container) {
    container.innerHTML = `
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div class="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h3 class="font-bold text-slate-700">系统用户列表</h3>
                <button class="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700">添加用户</button>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="text-xs text-slate-400 bg-slate-50/50">
                            <th class="p-4 font-medium">用户</th>
                            <th class="p-4 font-medium">角色</th>
                            <th class="p-4 font-medium">状态</th>
                            <th class="p-4 font-medium text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody id="user-list" class="divide-y divide-slate-100">
                        <tr><td colspan="4" class="p-8 text-center text-slate-400">加载中...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    // 这里真实对接应该请求后端 /api/users，目前展示后端已存入的 admin
    const user = JSON.parse(localStorage.getItem('user_info') || '{}');
    document.getElementById('user-list').innerHTML = `
        <tr class="hover:bg-slate-50">
            <td class="p-4 flex items-center gap-3">
                <img src="${user.avatar}" class="w-8 h-8 rounded-full">
                <div><div class="font-bold text-slate-800">${user.nickname}</div><div class="text-xs text-slate-400">${user.username}</div></div>
            </td>
            <td class="p-4"><span class="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-bold">超级管理员</span></td>
            <td class="p-4"><span class="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-1"></span>正常</td>
            <td class="p-4 text-right"><button class="text-blue-600 text-xs hover:underline">编辑</button></td>
        </tr>
    `;
}
