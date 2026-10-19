export function initTabs(container, onTabChange) {
  const tabs = container.querySelectorAll(".tab-item");
  const panes = container.querySelectorAll(".tab-pane");
  
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetId = tab.dataset.target;
      tabs.forEach(t => t.classList.remove("is-active"));
      panes.forEach(p => p.classList.remove("is-active"));
      
      tab.classList.add("is-active");
      container.querySelector(`#${targetId}`).classList.add("is-active");
      
      if (onTabChange) onTabChange(targetId);
    });
  });
}
