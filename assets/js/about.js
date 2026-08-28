(() => {
  "use strict";

  const root = document.querySelector("[data-about-focus]");
  if (!root) return;

  const tabs = [...root.querySelectorAll("[data-about-focus-tab]")];
  const panels = [...root.querySelectorAll("[data-about-focus-panel]")];
  if (!tabs.length || tabs.length !== panels.length) return;

  const activate = (tab, { focus = false } = {}) => {
    const key = tab.dataset.aboutFocusTab;
    tabs.forEach((item) => {
      const selected = item === tab;
      item.setAttribute("aria-selected", String(selected));
      item.tabIndex = selected ? 0 : -1;
    });
    panels.forEach((panel) => {
      const selected = panel.dataset.aboutFocusPanel === key;
      panel.hidden = !selected;
      panel.classList.toggle("is-active", selected);
    });
    if (focus) tab.focus({ preventScroll: true });
  };

  root.classList.add("is-enhanced");
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activate(tab));
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = tabs.length - 1;
      if (event.key === "ArrowRight") next = (index + (document.documentElement.dir === "rtl" ? -1 : 1) + tabs.length) % tabs.length;
      if (event.key === "ArrowLeft") next = (index + (document.documentElement.dir === "rtl" ? 1 : -1) + tabs.length) % tabs.length;
      activate(tabs[next], { focus: true });
    });
  });

  activate(tabs.find((tab) => tab.getAttribute("aria-selected") === "true") || tabs[0]);
})();
