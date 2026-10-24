/* ============================================================
   LynLi 全局用户信息同步中心（user-store.js）
   ------------------------------------------------------------
   定位：管理面板、商城前台、卖号站等所有子站的统一用户信息来源。
   规则：
   1) 唯一真实来源 = 后端 /api/v1/user/info（Bearer token）
   2) localStorage 仅作缓存/离线兜底，禁止写死任何假账号假 Token
   3) 任何站点引入本脚本后：
        window.getUserInfo()            → 同步返回缓存用户对象
        window.LynliUser.refresh()      → 强制拉取最新（改头像后调它即全站同步）
        window.LynliUser.onChange(cb)   → 订阅用户信息变更
   4) 用户信息变更后派发事件 'lynli:user-updated'，
      顶栏 / 抽屉 / 个人中心 / 各子站监听该事件实时重渲染。
   ============================================================ */
(function () {
  "use strict";

  const API_BASE = (location.hostname === "web.lynli.me")
    ? "/api/v1"
    : "https://api.lynli.me/api/v1";

  const KEYS = {
    token: "lynli_admin_token",
    email: "lynli_admin_email",
    role: "lynli_admin_role",
    isadmin: "lynli_admin_isadmin",
    user_id: "lynli_admin_user_id",
    short_id: "lynli_admin_short_id",
    nickname: "lynli_admin_nickname",
    avatar: "lynli_admin_avatar",
    remember: "lynli_admin",
  };

  const listeners = new Set();
  let _refreshing = null;

  function _get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function _set(k, v) { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) {} }
  function _del(k) { try { localStorage.removeItem(k); } catch (e) {} }

  /* ---------- 同步读取（缓存优先，无网络也能渲染） ---------- */
  function get() {
    return {
      token: _get(KEYS.token) || "",
      email: _get(KEYS.email) || "",
      role: _get(KEYS.role) || "user",
      isAdmin: _get(KEYS.isadmin) === "1",
      userId: _get(KEYS.user_id) || "",
      shortId: _get(KEYS.short_id) || "",
      nickname: _get(KEYS.nickname) || "",
      avatar: _get(KEYS.avatar) || "",
    };
  }

  /* ---------- 展示名：绝不直接暴露长邮箱 ----------
     优先级：用户主动设置的昵称 > 超级管理员显示「老板」> 邮箱 @ 前缀 > 「用户」 */
  function displayName(u) {
    u = u || get();
    const nick = (u.nickname || "").trim();
    if (nick) return nick;
    if (u.role === "admin" || u.role === "super" || u.isAdmin) return "老板";
    if (u.email) {
      const prefix = u.email.split("@")[0].trim();
      if (prefix) return prefix;
    }
    return "用户";
  }

  /* ---------- 实时拉取（唯一真实来源） ---------- */
  async function refresh(force = false) {
    const tok = _get(KEYS.token);
    if (!tok) return null;
    if (_refreshing && !force) return _refreshing;
    _refreshing = (async () => {
      try {
        const res = await fetch(`${API_BASE}/user/info`, {
          headers: { "Authorization": "Bearer " + tok },
        });
        const json = await res.json().catch(() => null);
        const u = json && json.data ? json.data : null;
        if (!u) return null;
        // 后端字段 → 本地缓存（严格按后端返回，不臆造）
        _set(KEYS.email, u.email || _get(KEYS.email) || "");
        _set(KEYS.short_id, String(u.shortId ?? u.short_id ?? "") || "");
        _set(KEYS.nickname, u.nickname || "");
        _set(KEYS.avatar, u.avatarURL || u.avatar || "");
        // role 缺失时探测管理权限自愈（旧版本会话兼容）
        if (!_get(KEYS.role)) {
          let role = "user";
          try {
            const ar = await fetch(`${API_BASE}/admin/dashboard`, {
              headers: { "Authorization": "Bearer " + tok },
            });
            const aj = await ar.json().catch(() => null);
            if (aj && (aj.code === 1 || aj.status === "success")) role = "admin";
          } catch (e) { /* 探测失败按普通用户 */ }
          _set(KEYS.role, role);
        }
        _emit();
        return get();
      } catch (e) {
        return null; // 网络异常：保留缓存，不清场
      } finally {
        _refreshing = null;
      }
    })();
    return _refreshing;
  }

  /* ---------- 登录成功后写入（login 只返回 token/role/isAdmin，其余立即补拉） ---------- */
  async function afterLogin(payload, account) {
    payload = payload || {};
    _set(KEYS.token, payload.token || "");
    _set(KEYS.email, account || payload.email || "");
    _set(KEYS.role, payload.role || "user");
    _set(KEYS.isadmin, payload.isAdmin ? "1" : "0");
    // user_id / short_id / nickname / avatar：login 不返回，立即向真实来源补齐
    await refresh(true);
    _emit();
    return get();
  }

  /* ---------- 本地字段更新（上传头像/改昵称成功后调用，先更新缓存再全站广播） ---------- */
  function patch(fields) {
    Object.keys(fields || {}).forEach((f) => {
      const key = KEYS[f];
      if (!key) return;
      const v = fields[f];
      v == null || v === "" ? _del(key) : _set(key, String(v));
    });
    _emit();
    return get();
  }

  /* ---------- 清空（退出/失效重登） ---------- */
  function clear() {
    Object.values(KEYS).forEach(_del);
    _emit();
  }

  /* ---------- 订阅与广播 ---------- */
  function onChange(cb) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  }
  function _emit() {
    const u = get();
    listeners.forEach((cb) => { try { cb(u); } catch (e) {} });
    window.dispatchEvent(new CustomEvent("lynli:user-updated", { detail: u }));
  }

  /* ---------- 通用头像渲染辅助（所有站点复用） ---------- */
  function avatarHtml(u, cls) {
    u = u || get();
    cls = cls || "u-avatar";
    if (u.avatar) {
      return `<img class="${cls}" src="${escapeAttr(u.avatar)}" alt="avatar" referrerpolicy="no-referrer"
        onerror="this.onerror=null;this.replaceWith(document.createTextNode('${(displayName(u)[0] || "U").toUpperCase()}'))">`;
    }
    return `<span class="${cls} ${cls}-text">${escapeHtml((displayName(u)[0] || "U").toUpperCase())}</span>`;
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function escapeAttr(s) { return escapeHtml(s); }

  /* ---------- 顶栏渲染（管理面板右上角：头像 + 昵称 + 角色） ---------- */
  function renderTop() {
    const u = get();
    const box = document.getElementById("topbar-user-box");
    if (!box) return;
    const nameEl = document.getElementById("topbar-user");
    const avEl = document.getElementById("topbar-avatar");
    const roleEl = document.getElementById("topbar-role");
    if (avEl) avEl.outerHTML = avatarHtml(u, "topbar-avatar u-avatar").replace('class="topbar-avatar u-avatar"', 'id="topbar-avatar" class="topbar-avatar u-avatar"');
    if (nameEl) {
      nameEl.innerHTML = `${escapeHtml(displayName(u))}${u.shortId ? ` <i class="uid-chip">#${escapeHtml(u.shortId)}</i>` : ""}`;
      nameEl.title = "点击进入个人中心";
    }
    if (roleEl) {
      const label = u.role === "admin" || u.role === "super" ? "超级管理员" : (u.role === "user" ? "普通用户" : u.role);
      roleEl.innerText = label;
    }
  }

  /* ---------- 抽屉渲染（抽屉头部：头像 + 昵称 + 角色） ---------- */
  function renderDrawerHead() {
    const u = get();
    const avBox = document.getElementById("drawer-avatar");
    if (avBox) avBox.outerHTML = avatarHtml(u, "drawer-avatar u-avatar").replace('class="drawer-avatar u-avatar"', 'id="drawer-avatar" class="drawer-avatar u-avatar"');
    const de = document.getElementById("drawer-email");
    if (de) {
      de.innerHTML = `${escapeHtml(displayName(u))}${u.email ? `<small>${escapeHtml(u.email)}</small>` : ""}`;
    }
    const dr = document.getElementById("drawer-role");
    if (dr) {
      const label = u.role === "admin" || u.role === "super" ? "超级管理员" : (u.role === "user" ? "普通用户" : u.role);
      dr.innerText = label;
    }
  }

  function renderAll() { renderTop(); renderDrawerHead(); }

  // 用户信息一变，全站（顶栏/抽屉/个人中心/子站监听者）同步重渲染
  onChange(() => renderAll());
  document.addEventListener("DOMContentLoaded", () => { if (_get(KEYS.token)) renderAll(); });

  /* ---------- 多标签页同步：其他标签改头像/昵称后本标签即时生效 ---------- */
  window.addEventListener("storage", (e) => {
    if (Object.values(KEYS).includes(e.key)) renderAll();
  });

  /* ---------- 对外暴露 ---------- */
  window.getUserInfo = get;                       // 全局统一方法（任务1核心）
  window.LynliUser = {
    get, refresh, afterLogin, patch, clear, onChange,
    renderAll, renderTop, renderDrawerHead,
    displayName, avatarHtml,
    KEYS,
  };
})();
