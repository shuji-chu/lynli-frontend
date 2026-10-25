// ============================================================
// staff.js - 系统设置 · 员工权限管理（真实对接 /admin/admins，无假数据）
// 依赖：app.js 的 API_BASE / showToast / escapeHtml / fmtTime
// ============================================================

const ROLE_LABEL = { super: '超级管理员', operator: '运营', support: '客服', service: '客服' };

window.Staff = {
    _list: [],
    _kw: '',

    // 5位短ID：id 补零到 5 位
    sid(id) { return 'S' + String(id).padStart(4, '0'); },

    // 字母头像：昵称/邮箱首字符
    initials(a) {
        const n = (a.nickname || a.email || '?').trim();
        return (n[0] || '?').toUpperCase();
    },

    roleLabel(r) { return ROLE_LABEL[r] || '客服'; },

    // 秒级时间格式 YYYY-MM-DD HH:mm:ss
    fmtFull(ts) {
        if (!ts) return '--';
        const d = new Date(Number(ts) * 1000);
        if (isNaN(d.getTime())) return '--';
        const p = n => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
    },

    statusLabel(a) {
        return (a.status === 0 || a.status === '0') ? '已禁用' : '正常';
    },

    async load() {
        const box = document.getElementById('staff-list');
        if (!box) return;
        box.innerHTML = '<div class="empty-tip">加载中...</div>';
        const tok = localStorage.getItem('lynli_admin_token');
        if (!tok) { box.innerHTML = '<div class="empty-tip">未登录，无法加载员工列表</div>'; return; }
        try {
            const res = await fetch(`${API_BASE}/admin/admins`, { headers: { 'Authorization': 'Bearer ' + tok } });
            const json = await res.json();
            if (json.code !== 1) throw new Error(json.msg || '加载失败');
            this._list = Array.isArray(json.data) ? json.data : [];
            this.render();
        } catch (e) {
            box.innerHTML = '<div class="empty-tip">加载失败，请重试</div>';
            showToast('员工列表加载失败：' + (e.message || '网络错误'), 'error');
        }
    },

    search() {
        this._kw = (document.getElementById('staff-search-input')?.value || '').trim().toLowerCase();
        this.render();
    },

    render() {
        const box = document.getElementById('staff-list');
        const kw = this._kw;
        const rows = this._list.filter(a =>
            !kw || (a.email || '').toLowerCase().includes(kw) || (a.nickname || '').toLowerCase().includes(kw)
        );
        if (!rows.length) {
            box.innerHTML = `<div class="empty-tip">${kw ? '没有匹配的员工' : '暂无员工，点击「添加员工」创建'}</div>`;
            return;
        }
        const me = (localStorage.getItem('lynli_admin_email') || '').toLowerCase();
        box.innerHTML = rows.map(a => {
            const isMe = (a.email || '').toLowerCase() === me;
            const disabled = (a.status === 0 || a.status === '0');
            return `
            <div class="staff-item" data-id="${a.id}" onclick="Staff.openDetail(${a.id})">
              <div class="staff-avatar ${disabled ? 'staff-avatar-off' : ''}">${escapeHtml(this.initials(a))}</div>
              <div class="staff-main">
                <div class="staff-nick">${escapeHtml(a.nickname || a.email)}${isMe ? '<span class="staff-me">当前账号</span>' : ''}</div>
                <div class="staff-mail">${escapeHtml(a.email || '--')} · ${this.sid(a.id)}</div>
              </div>
              <div class="staff-side">
                <span class="staff-role staff-role-${escapeHtml(a.role || 'support')}">${this.roleLabel(a.role)}</span>
                <span class="staff-state ${disabled ? 'staff-state-off' : ''}">${disabled ? '已禁用' : '正常'}</span>
              </div>
              <div class="staff-ops" onclick="event.stopPropagation()">
                <button class="btn btn-ghost btn-xs" title="${disabled ? '启用' : '禁用'}" onclick="Staff.toggle(${a.id},${disabled ? 1 : 0})">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">${disabled
                    ? '<path d="M5 13l4 4L19 7"/>'
                    : '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'}</svg>
                  ${disabled ? '启用' : '禁用'}
                </button>
                <button class="btn btn-ghost btn-xs staff-del" title="删除" onclick="Staff.remove(${a.id},'${escapeHtml(a.email || '')}')">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>
                  删除
                </button>
              </div>
            </div>`;
        }).join('');
    },

    _headers() { return { 'Authorization': 'Bearer ' + localStorage.getItem('lynli_admin_token'), 'Content-Type': 'application/json' }; },

    // ---------- 详情弹窗 ----------
    openDetail(id) {
        const a = this._list.find(x => x.id === id);
        if (!a) return;
        const av = document.getElementById('sd-avatar');
        av.textContent = this.initials(a);
        document.getElementById('sd-nickname').textContent = a.nickname || a.email || '--';
        document.getElementById('sd-email').textContent = a.email || '--';
        document.getElementById('sd-sid').textContent = this.sid(a.id);
        document.getElementById('sd-role').textContent = this.roleLabel(a.role) + '（' + (a.role || 'support') + '）';
        const st = document.getElementById('sd-status');
        st.textContent = this.statusLabel(a);
        st.className = 'sd-value ' + ((a.status === 0 || a.status === '0') ? 'sd-status-off' : 'sd-status-on');
        document.getElementById('sd-created').textContent = this.fmtFull(a.created_at);
        document.getElementById('staff-detail-mask').dataset.id = String(a.id);
        document.getElementById('staff-detail-mask').style.display = 'flex';
    },

    closeDetail() { document.getElementById('staff-detail-mask').style.display = 'none'; },

    openEditFromDetail() {
        const id = Number(document.getElementById('staff-detail-mask').dataset.id || 0);
        this.closeDetail();
        this.openForm(id);
    },

    // ---------- 添加/编辑弹窗 ----------
    openAdd() { this.openForm(null); },

    openForm(id) {
        const a = id ? this._list.find(x => x.id === id) : null;
        document.getElementById('staff-form-title').textContent = a ? '编辑员工权限' : '添加员工';
        document.getElementById('staff-form-sub').textContent = a
            ? '修改成员角色与登录凭据（密码留空则不修改）'
            : '新成员将写入 admins 表并可登录后台';
        document.getElementById('sf-id').value = a ? a.id : '';
        document.getElementById('sf-email').value = a ? (a.email || '') : '';
        document.getElementById('sf-nickname').value = a ? (a.nickname || '') : '';
        document.getElementById('sf-password').value = '';
        document.getElementById('sf-role').value = a ? (a.role || 'support') : 'support';
        document.getElementById('staff-form-mask').style.display = 'flex';
    },

    closeForm() { document.getElementById('staff-form-mask').style.display = 'none'; },

    maskClose(e, id) { if (e.target && e.target.id === id) document.getElementById(id).style.display = 'none'; },

    async submit() {
        const btn = document.getElementById('staff-form-submit');
        const id = document.getElementById('sf-id').value;
        const email = (document.getElementById('sf-email').value || '').trim().toLowerCase();
        const nickname = (document.getElementById('sf-nickname').value || '').trim();
        const password = document.getElementById('sf-password').value || '';
        const role = document.getElementById('sf-role').value;
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast('请输入正确的邮箱', 'error'); return; }
        if (!id && !password) { showToast('新增员工必须设置初始密码', 'error'); return; }
        btn.disabled = true;
        const old = btn.textContent; btn.textContent = '保存中...';
        try {
            const body = { email, nickname, role };
            if (id) body.id = Number(id);
            if (password) body.password = password;
            const res = await fetch(`${API_BASE}/admin/admins/save`, { method: 'POST', headers: this._headers(), body: JSON.stringify(body) });
            const json = await res.json();
            if (json.code !== 1) throw new Error(json.msg || '保存失败');
            showToast(id ? '员工权限已更新' : '员工已添加', 'success');
            this.closeForm();
            this.load();
        } catch (e) {
            showToast(e.message || '保存失败', 'error');
        } finally {
            btn.disabled = false; btn.textContent = old;
        }
    },

    // ---------- 启用 / 禁用 ----------
    async toggle(id, next) {
        try {
            const res = await fetch(`${API_BASE}/admin/admins/status`, { method: 'POST', headers: this._headers(), body: JSON.stringify({ id, status: next }) });
            const json = await res.json();
            if (json.code !== 1) throw new Error(json.msg || '操作失败');
            showToast(next === 1 ? '账号已启用放行' : '账号已禁用，无法再登录后台', 'success');
            this.load();
        } catch (e) {
            showToast(e.message || '操作失败', 'error');
        }
    },

    // ---------- 删除（物理删除，自定义确认弹窗） ----------
    async remove(id, email) {
        document.getElementById('staff-confirm-text').textContent =
            `确认删除员工 ${email || id}？将从 admins 表物理删除，不可恢复。`;
        const mask = document.getElementById('staff-confirm-mask');
        mask.dataset.id = String(id);
        mask.style.display = 'flex';
    },

    confirmCancel() { document.getElementById('staff-confirm-mask').style.display = 'none'; },

    async confirmOk() {
        const id = Number(document.getElementById('staff-confirm-mask').dataset.id || 0);
        this.confirmCancel();
        if (!id) return;
        try {
            const res = await fetch(`${API_BASE}/admin/admins/delete`, { method: 'POST', headers: this._headers(), body: JSON.stringify({ id }) });
            const json = await res.json();
            if (json.code !== 1) throw new Error(json.msg || '删除失败');
            showToast('员工已删除', 'success');
            this.load();
        } catch (e) {
            showToast(e.message || '删除失败', 'error');
        }
    }
};

// 兼容旧入口：switchTab 里的 loadStaff()
window.loadStaff = () => Staff.load();
