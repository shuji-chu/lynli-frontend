export async function render(mount) {
  mount.innerHTML = `
    <div class="card">
      <div class="card__head"><h2>素材图库</h2><button class="btn btn--primary btn--sm">+ 上传图片</button></div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;margin-top:16px;">
        ${Array.from({length:12}).map((_,i)=>`<div style="aspect-ratio:1;border-radius:8px;overflow:hidden;border:1px solid var(--line);"><img src="https://picsum.photos/200?random=${i}" style="width:100%;height:100%;object-fit:cover;"></div>`).join('')}
      </div>
    </div>`;
}
