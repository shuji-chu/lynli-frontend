// 大厂级 Tabs 切换组件
export function initTabs(container, onTabChange) {
  const tabs = container.querySelectorAll(".tab-item");
  const panes = container.querySelectorAll(".tab-pane");
  
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // 移除所有激活态
      tabs.forEach(t => t.classList.remove("is-active"));
      panes.forEach(p => p.classList.remove("is-active"));
      
      // 激活当前
      tab.classList.add("is-active");
      const targetId = tab.dataset.target;
      if (targetId) {
        const pane = container.querySelector(`#${targetId}`);
        if (pane) pane.classList.add("is-active");
      }
      
      // 触发外部回调
      if (onTabChange) onTabChange(tab.dataset.value || targetId);
    });
  });
}
