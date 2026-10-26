// ================= 终极防锁死机制 =================
// 在 DOM 加载和页面切换时，强制干掉 body 上的 no-scroll 锁
document.addEventListener('DOMContentLoaded', () => {
  const unlock = () => {
    document.body.classList.remove('no-scroll');
    document.body.style.overflow = '';
    document.body.style.height = '';
    const main = document.querySelector('.console-main');
    if (main) {
      main.style.setProperty('overflow', 'visible', 'important');
      main.style.setProperty('height', 'auto', 'important');
      main.style.setProperty('max-height', 'none', 'important');
    }
  };
  unlock();
  // 定时巡检，防止点开抽屉后关闭时卡死
  setInterval(unlock, 500);
});
