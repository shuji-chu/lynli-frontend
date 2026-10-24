/* ============================================================
   个人中心真实交互（profile-page.js）
   ------------------------------------------------------------
   1) 头像上传：点击头像 → 原生文件菜单（相册/拍照）→ Canvas 压缩
      → POST /api/v1/upload（type=avatar）→ POST /api/v1/user/update-avatar
      → LynliUser.patch 本地刷新 + refresh 全站广播
   2) 昵称修改：弹窗输入 → POST /api/v1/user/update-nickname
   3) 修改密码：弹窗（旧密码 + 真实验证码，双通道二选一）
      → POST /api/v1/user/send_code（邮箱验证码，发至当前登录邮箱，6 位数字）
      → GET  /api/v1/auth/captcha（点选式图形验证码，接口未部署时的兜底通道）
      → POST /api/v1/auth/captcha/check（坐标校验）
      → POST /api/v1/user/update-password（old_password + new_password [+ code]）
   全部调用真实 V1 接口，无任何写死数据。
   ============================================================ */
(function () {
  "use strict";

  const API_BASE = (location.hostname === "web.lynli.me")
    ? "/api/v1"
    : "https://api.lynli.me/api/v1";

  /* ================= 头像上传 ================= */
  let _avatarUploading = false;

  function _pickAvatar() {
    const inp = document.getElementById("avatar-file-input");
    if (inp) inp.click();
  }

  function _bindAvatarInput() {
    const inp = document.getElementById("avatar-file-input");
    if (!inp || inp._bound) return;
    inp._bound = true;
    inp.addEventListener("change", async () => {
      const file = inp.files && inp.files[0];
      inp.value = "";
      if (!file) return;
      if (!/^image\//.test(file.type)) { showToast("请选择图片文件", "warn"); return; }
      if (file.size > 12 * 1024 * 1024) { showToast("图片不能超过 12MB", "warn"); return; }
      await _uploadAvatar(file);
    });
  }

  // Canvas 压缩：最长边 512，JPEG 0.82
  function _compressImage(file, maxSide = 512, quality = 0.82) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          let { width: w, height: h } = img;
          const scale = Math.min(1, maxSide / Math.max(w, h));
          w = Math.round(w * scale); h = Math.round(h * scale);
          const canvas = document.createElement("canvas");
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.onerror = reject;
        img.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function _uploadAvatar(file) {
    if (_avatarUploading) return;
    _avatarUploading = true;
    showToast("正在压缩并上传头像...", "info");
    try {
      const dataUrl = await _compressImage(file);
      const tok = localStorage.getItem("lynli_admin_token");
      if (!tok) { showToast("登录状态异常，请重新登录", "warn"); return; }

      // 1) 上传 OSS
      const upRes = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + tok },
        body: JSON.stringify({ file: dataUrl, filename: "avatar.jpg", type: "avatar" }),
      });
      const upJson = await upRes.json().catch(() => null);
      const url = upJson && upJson.data && upJson.data.url;
      if (!url) { showToast((upJson && upJson.msg) || "头像上传失败", "error"); return; }

      // 2) 保存到 MySQL
      const saveRes = await fetch(`${API_BASE}/user/update-avatar`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + tok },
        body: JSON.stringify({ avatar: url }),
      });
      const saveJson = await saveRes.json().catch(() => null);
      if (saveJson && saveJson.status === "success") {
        // 3) 本地缓存 + 全站广播（管理面板改了头像，其他站点同步生效）
        window.LynliUser.patch({ avatar: url });
        await window.LynliUser.refresh(true);
        showToast("头像更新成功，全站已同步", "success");
      } else {
        showToast((saveJson && saveJson.message) || "头像保存失败", "error");
      }
    } catch (e) {
      showToast("头像上传异常：" + (e && e.message ? e.message : "网络错误"), "error");
    } finally {
      _avatarUploading = false;
    }
  }

  /* ================= 弹窗基础 ================= */
  function _ensureModalLayer() {
    let layer = document.getElementById("modal-layer");
    if (!layer) {
      layer = document.createElement("div");
      layer.id = "modal-layer";
      layer.className = "modal-layer";
      document.body.appendChild(layer);
    }
    return layer;
  }

  function _openModal(html, onClose) {
    const layer = _ensureModalLayer();
    layer.innerHTML = `
      <div class="modal-mask" data-close="1"></div>
      <div class="modal-box" role="dialog" aria-modal="true">
        ${html}
      </div>`;
    layer.classList.add("show");
    const close = () => {
      layer.classList.remove("show");
      layer.innerHTML = "";
      if (typeof onClose === "function") onClose();
    };
    layer.querySelector('[data-close="1"]').addEventListener("click", close);
    layer._close = close;
    return { layer, close };
  }

  /* ================= 昵称修改 ================= */
  function openNicknameModal() {
    const u = window.getUserInfo();
    const { layer } = _openModal(`
      <div class="modal-head">
        <h3>修改昵称</h3>
        <button class="modal-x" data-close="1" aria-label="关闭">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
      </div>
      <div class="modal-body">
        <label class="field-label">新昵称（最多 20 字）</label>
        <input type="text" id="nickname-input" class="input" maxlength="20" placeholder="请输入新昵称" value="${escapeAttr(window.LynliUser.displayName(u))}">
      </div>
      <div class="modal-foot">
        <button class="btn btn-ghost" data-close="1">取消</button>
        <button class="btn btn-primary" id="nickname-save">保存</button>
      </div>`);
    const input = layer.querySelector("#nickname-input");
    input.focus(); input.select();
    layer.querySelector("#nickname-save").addEventListener("click", async () => {
      const nick = input.value.trim();
      if (!nick) { showToast("昵称不能为空", "warn"); return; }
      const btn = layer.querySelector("#nickname-save");
      btn.disabled = true; btn.classList.add("is-loading");
      try {
        const tok = localStorage.getItem("lynli_admin_token");
        const res = await fetch(`${API_BASE}/user/update-nickname`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": "Bearer " + tok },
          body: JSON.stringify({ nickname: nick }),
        });
        const json = await res.json().catch(() => null);
        if (json && json.status === "success") {
          window.LynliUser.patch({ nickname: nick });
          if (typeof loadProfile === "function") loadProfile();
          showToast("昵称修改成功", "success");
          layer._close();
        } else {
          showToast((json && json.message) || "昵称修改失败", "error");
        }
      } catch (e) {
        showToast("网络异常，请稍后再试", "error");
      } finally {
        btn.disabled = false; btn.classList.remove("is-loading");
      }
    });
  }

  /* ================= 修改密码（旧密码 + 真实验证码） =================
     双通道真实验证（二选一，均为服务端校验）：
       A. 邮箱验证码：点击「获取验证码」→ POST /api/v1/user/send_code
          （后端发送到当前登录账号绑定邮箱）→ 输入 6 位验证码，
          提交时随 update-password 一并校验（后端接口上线后自动成为首选通道）
       B. 点选图形验证码：GET /api/v1/auth/captcha → POST /api/v1/auth/captcha/check
     最后 POST /api/v1/user/update-password（old_password + new_password [+ code]）。
     后端未部署 send_code 时响应会落入 catch-all（message:"ok" + data:null），
     前端识别后自动提示并切换图形验证码通道，保证改密流程始终可用。 */
  let _captcha = null;       // { id, image, hint, w, h, passed }
  let _emailCodeOk = false;  // 邮箱验证码通道是否已就绪

  // 后端 catch-all 兜底响应特征（用于识别 send_code 接口是否真正部署）
  function _isCatchAll(json) {
    return !!json && json.message === "ok" && json.data === null
      && json.status === "success" && !("code" in json);
  }

  async function _loadCaptcha(box) {
    const img = box.querySelector("#pwd-captcha-img");
    const hint = box.querySelector("#pwd-captcha-hint");
    try {
      const res = await fetch(`${API_BASE}/auth/captcha`, { method: "GET" });
      const json = await res.json().catch(() => null);
      const d = json && json.data;
      if (!d || !d.image) { showToast("验证码加载失败", "error"); return; }
      _captcha = { id: d.id, hint: d.hint, w: d.width || 320, h: d.height || 200, passed: false };
      img.src = d.image;
      img.style.display = "block";
      img.classList.remove("captcha-ok");
      hint.innerText = d.hint || "请按提示点击";
    } catch (e) {
      showToast("验证码加载失败，请检查网络", "error");
    }
  }

  // 获取邮箱验证码 → POST /api/v1/user/send_code（任务4）
  async function _sendEmailCode(btn) {
    const tok = localStorage.getItem("lynli_admin_token");
    if (!tok) { showToast("登录状态异常，请重新登录", "warn"); return; }
    btn.disabled = true;
    try {
      const res = await fetch(`${API_BASE}/user/send_code`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + tok },
        body: JSON.stringify({}),
      });
      const json = await res.json().catch(() => null);
      if (_isCatchAll(json)) {
        // 接口未部署：后端 catch-all 返回了兜底响应，并未真正发信
        _emailCodeOk = false;
        showToast("邮箱验证码接口尚未部署，请使用下方图形验证码完成校验", "warn");
        btn.disabled = false;
        return;
      }
      if (json && (json.status === "success" || json.code === 1)) {
        _emailCodeOk = true;
        const email = (window.getUserInfo ? getUserInfo().email : "") || "当前登录邮箱";
        showToast(`验证码已发送至 ${email}，请查收`, "success");
        let s = 60;
        btn.innerText = `${s}s 后重发`;
        const timer = setInterval(() => {
          s -= 1;
          if (s <= 0) {
            clearInterval(timer);
            btn.disabled = false;
            btn.innerText = "获取验证码";
          } else {
            btn.innerText = `${s}s 后重发`;
          }
        }, 1000);
      } else {
        showToast((json && json.message) || "验证码发送失败", "error");
        btn.disabled = false;
      }
    } catch (e) {
      showToast("验证码发送失败，请检查网络", "error");
      btn.disabled = false;
    }
  }

  function openPasswordModal() {
    const { layer } = _openModal(`
      <div class="modal-head">
        <h3>修改密码</h3>
        <button class="modal-x" data-close="1" aria-label="关闭">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
      </div>
      <div class="modal-body">
        <div class="field">
          <label class="field-label">当前密码</label>
          <input type="password" id="pwd-old" class="input" placeholder="请输入当前密码" autocomplete="current-password">
        </div>
        <div class="field">
          <label class="field-label">新密码（至少 6 位）</label>
          <input type="password" id="pwd-new" class="input" placeholder="请输入新密码" autocomplete="new-password">
        </div>
        <div class="field">
          <label class="field-label">确认新密码</label>
          <input type="password" id="pwd-new2" class="input" placeholder="请再次输入新密码" autocomplete="new-password">
        </div>
        <div class="field">
          <label class="field-label">邮箱验证码 <span class="field-tip">发送至当前登录账号绑定邮箱</span></label>
          <div class="captcha-row">
            <input type="text" id="pwd-email-code" class="input captcha-input" maxlength="6" placeholder="6 位数字验证码" autocomplete="one-time-code" inputmode="numeric" style="letter-spacing:4px">
            <button type="button" class="btn btn-ghost btn-xs" id="pwd-send-code">获取验证码</button>
          </div>
        </div>
        <div class="field">
          <label class="field-label">图形验证码 <span class="field-tip">点击图中对应字母完成校验（与邮箱验证码二选一）</span></label>
          <div class="captcha-click-wrap" id="pwd-captcha-box">
            <img id="pwd-captcha-img" class="captcha-click-img" alt="验证码" title="点击图中提示的字母">
            <div class="captcha-click-side">
              <span class="captcha-hint" id="pwd-captcha-hint">加载中...</span>
              <button type="button" class="btn btn-ghost btn-xs" id="pwd-captcha-refresh">换一张</button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn btn-ghost" data-close="1">取消</button>
        <button class="btn btn-primary" id="pwd-save">确认修改</button>
      </div>`);

    const img = layer.querySelector("#pwd-captcha-img");
    // 点击图片坐标 → 后端校验
    img.addEventListener("click", async (ev) => {
      if (!_captcha) { showToast("验证码未就绪", "warn"); return; }
      const rect = img.getBoundingClientRect();
      const scaleX = _captcha.w / rect.width;
      const scaleY = _captcha.h / rect.height;
      const x = Math.round((ev.clientX - rect.left) * scaleX);
      const y = Math.round((ev.clientY - rect.top) * scaleY);
      const tok = localStorage.getItem("lynli_admin_token");
      try {
        const res = await fetch(`${API_BASE}/auth/captcha/check`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": "Bearer " + tok },
          body: JSON.stringify({ id: _captcha.id, x, y }),
        });
        const json = await res.json().catch(() => null);
        if (json && json.code === 1) {
          showToast("验证码校验通过", "success");
          img.classList.add("captcha-ok");
          _captcha = Object.assign({}, _captcha, { passed: true });
        } else {
          showToast((json && json.message) || "验证码错误，请重试", "error");
          _loadCaptcha(layer.querySelector("#pwd-captcha-box"));
        }
      } catch (e) {
        showToast("验证码校验失败，请检查网络", "error");
      }
    });
    layer.querySelector("#pwd-captcha-refresh").addEventListener("click", () => _loadCaptcha(layer.querySelector("#pwd-captcha-box")));
    layer.querySelector("#pwd-send-code").addEventListener("click", function () { _sendEmailCode(this); });
    _loadCaptcha(layer.querySelector("#pwd-captcha-box"));

    layer.querySelector("#pwd-save").addEventListener("click", async () => {
      const oldPw = layer.querySelector("#pwd-old").value;
      const newPw = layer.querySelector("#pwd-new").value;
      const newPw2 = layer.querySelector("#pwd-new2").value;
      const emailCode = (layer.querySelector("#pwd-email-code").value || "").trim();
      if (!oldPw) { showToast("请输入当前密码", "warn"); return; }
      if (!newPw || newPw.length < 6) { showToast("新密码至少 6 位", "warn"); return; }
      if (newPw !== newPw2) { showToast("两次输入的新密码不一致", "warn"); return; }
      // 真实验证码二选一：邮箱验证码（6 位数字）或点选图形验证码（服务端校验通过）
      const codeOk = /^\d{6}$/.test(emailCode);
      const capOk = !!(_captcha && _captcha.passed);
      if (!codeOk && !capOk) {
        showToast("请先完成验证：输入邮箱验证码，或点击图形验证码", "warn");
        return;
      }
      const btn = layer.querySelector("#pwd-save");
      btn.disabled = true; btn.classList.add("is-loading");
      try {
        const tok = localStorage.getItem("lynli_admin_token");
        const body = { old_password: oldPw, new_password: newPw };
        if (codeOk) body.code = emailCode; // 供后端校验邮箱验证码
        const res = await fetch(`${API_BASE}/user/update-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": "Bearer " + tok },
          body: JSON.stringify(body),
        });
        const json = await res.json().catch(() => null);
        if (json && json.status === "success") {
          showToast("密码修改成功，请使用新密码登录", "success");
          layer._close();
          setTimeout(() => { if (typeof doLogout === "function") doLogout(); }, 1200);
        } else {
          showToast((json && json.message) || "密码修改失败", "error");
          _loadCaptcha(layer.querySelector("#pwd-captcha-box"));
        }
      } catch (e) {
        showToast("网络异常，请稍后再试", "error");
      } finally {
        btn.disabled = false; btn.classList.remove("is-loading");
      }
    });
  }

  /* ================= 工具 ================= */
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function escapeAttr(s) { return escapeHtml(s); }

  /* ================= 暴露 ================= */
  window.LynliProfile = {
    pickAvatar: _pickAvatar,
    openNicknameModal,
    openPasswordModal,
  };

  document.addEventListener("DOMContentLoaded", () => {
    _bindAvatarInput();
    // 个人中心头像点击 → 原生文件菜单（移动端可选相册/拍照）
    const av = document.getElementById("profile-avatar");
    if (av && !av._bound) {
      av._bound = true;
      av.addEventListener("click", _pickAvatar);
    }
  });
})();
