(() => {
  "use strict";

  const root = document.documentElement;
  root.classList.add("js");

  try {
    const stored = localStorage.getItem("es-theme");
    const theme = stored || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    root.dataset.theme = theme;
    document.querySelector("meta[data-theme-color]")?.setAttribute("content", theme === "light" ? "#f0f2f5" : "#101c19");
  } catch (_) {
    root.dataset.theme = "dark";
  }
})();
