import { showModal, toast } from "../ui.js";

export function openProfileModal(onUpdate) {
  const userInfo = JSON.parse(localStorage.getItem("lynli_user") || '{"name":"系统管理员","avatar":"管"}');
  const hasImg = userInfo.avatar.startsWith('data:image');
  
  showModal({
    title: "个人中心设置",
    contentHTML: `
      <div style="text-align:center; margin-bottom:20px;">
        <label class="upload-avatar-wrap" for="avatar-upload" style="width:90px; height:90px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.05); border:2px dashed var(--line); cursor:pointer; overflow:hidden;">
          <img id="avatar-img-preview" src="${hasImg ? userInfo.avatar : ''}" style="width:100%; height:100%; object-fit:cover; display:${hasImg ? 'block' : 'none'};">
          <span id="avatar-text" style="font-size:12px; color:var(--text-muted); display:${hasImg ? 'none' : 'block'};">点击上传<br>头像</span>
        </label>
        <input type="file" id="avatar-upload" accept="image/*" style="display:none;">
      </div>
      <div class="field"><label>修改昵称</label><input type="text" id="m-nickname" value="${userInfo.name}" style="width:100%; padding:12px; border-radius:8px; border:1px solid rgba(0,0,0,0.1); outline:none;"></div>
    `,
    onConfirm: (mask, close) => {
      const newName = mask.querySelector('#m-nickname').value;
      const imgPreview = mask.querySelector('#avatar-img-preview');
      let newAvatar = userInfo.avatar;
      if (imgPreview.src && imgPreview.src.startsWith('data:image')) newAvatar = imgPreview.src;
      if (!newName) return toast("昵称不能为空", "error");
      
      localStorage.setItem("lynli_user", JSON.stringify({ name: newName, avatar: newAvatar }));
      close();
      onUpdate(); // 通知外部刷新 UI
      toast("个人信息已更新");
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
