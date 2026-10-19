import { showModal, toast } from "../ui.js";

export function openProfileModal(onUpdate) {
  const userInfo = JSON.parse(localStorage.getItem("lynli_user") || '{"name":"系统管理员","avatar":"管"}');
  const hasImg = userInfo.avatar.startsWith('data:image');
  
  showModal({
    title: "个人中心设置",
    contentHTML: `
      <div style="text-align:center; margin-bottom:20px;">
        <label class="upload-avatar-wrap" for="avatar-upload" style="width:80px; height:80px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.05); border:2px dashed var(--border-light); cursor:pointer; overflow:hidden;">
          <img id="avatar-img-preview" src="${hasImg ? userInfo.avatar : ''}" style="width:100%; height:100%; object-fit:cover; display:${hasImg ? 'block' : 'none'};">
          <span id="avatar-text" style="font-size:12px; color:var(--text-muted); display:${hasImg ? 'none' : 'block'};">上传头像</span>
        </label>
        <input type="file" id="avatar-upload" accept="image/*" style="display:none;">
      </div>
      
      <div class="field" style="margin-bottom: 16px;"><label>修改昵称</label><input type="text" id="m-nickname" value="${userInfo.name}" style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--border-light);"></div>
      
      <div style="border-top: 1px dashed var(--border-light); margin: 20px 0; padding-top: 20px;">
        <p style="font-size: 13px; font-weight: bold; margin-bottom: 12px; color: var(--text-main);">修改登录密码</p>
        <div class="field" style="margin-bottom: 12px;"><input type="password" id="m-old-pwd" placeholder="输入当前密码" style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--border-light);"></div>
        <div class="field" style="margin-bottom: 12px;"><input type="password" id="m-new-pwd" placeholder="输入新密码" style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--border-light);"></div>
        <div class="field"><input type="password" id="m-confirm-pwd" placeholder="确认新密码" style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--border-light);"></div>
      </div>
    `,
    onConfirm: (mask, close) => {
      const newName = mask.querySelector('#m-nickname').value;
      const imgPreview = mask.querySelector('#avatar-img-preview');
      const oldPwd = mask.querySelector('#m-old-pwd').value;
      const newPwd = mask.querySelector('#m-new-pwd').value;
      const confirmPwd = mask.querySelector('#m-confirm-pwd').value;

      if (!newName) return toast("昵称不能为空", "error");

      let newAvatar = userInfo.avatar;
      if (imgPreview.src && imgPreview.src.startsWith('data:image')) newAvatar = imgPreview.src;
      localStorage.setItem("lynli_user", JSON.stringify({ name: newName, avatar: newAvatar }));

      // 如果用户填写了密码相关的框，则进行密码修改逻辑
      if (oldPwd || newPwd || confirmPwd) {
        const savedAuth = JSON.parse(localStorage.getItem('lynli_auth') || '{"acc":"admin","pwd":"123456"}');
        
        if (oldPwd !== savedAuth.pwd) return toast("当前密码错误", "error");
        if (newPwd.length < 6) return toast("新密码不能少于6位", "error");
        if (newPwd !== confirmPwd) return toast("两次输入的新密码不一致", "error");
        
        // 保存新密码
        localStorage.setItem('lynli_auth', JSON.stringify({ acc: savedAuth.acc, pwd: newPwd }));
        toast("资料与密码均已更新");
      } else {
        toast("资料已更新");
      }

      close();
      onUpdate(); 
    }
  });

  setTimeout(() => {
    const fileInput = document.getElementById('avatar-upload');
    if (fileInput) {
      fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (re) => {
            const img = document.getElementById('avatar-img-preview');
            img.src = re.target.result;
            img.style.display = 'block';
            document.getElementById('avatar-text').style.display = 'none';
          };
          reader.readAsDataURL(file);
        }
      };
    }
  }, 100);
}
