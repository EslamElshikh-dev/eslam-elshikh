(() => {
  "use strict";

  const root = document.documentElement;
  root.classList.add("js");

  try {
    const stored = localStorage.getItem("es-theme");
    const theme = stored || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    root.dataset.theme = theme;
    document.querySelector("meta[data-theme-color]")?.setAttribute("content", theme === "light" ? "#f5f8fb" : "#06131f");
  } catch (_) {
    root.dataset.theme = "dark";
  }
})();
