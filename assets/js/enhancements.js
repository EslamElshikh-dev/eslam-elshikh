(() => {
  "use strict";
  const counters = [...document.querySelectorAll("[data-counter]")];
  if (!counters.length) return;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const animate = (el) => {
    if (el.dataset.counted === "true") return;
    el.dataset.counted = "true";
    const target = Number(el.dataset.counter || 0);
    const suffix = el.dataset.suffix || "";
    if (reduceMotion || !Number.isFinite(target)) {
      el.textContent = `${target.toLocaleString("en-US")}${suffix}`;
      return;
    }
    const duration = Math.min(1800, 850 + target * 0.35);
    const start = performance.now();
    const frame = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      el.textContent = `${value.toLocaleString("en-US")}${suffix}`;
      if (progress < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  };
  if (!("IntersectionObserver" in window) || reduceMotion) counters.forEach(animate);
  else {
    const observer = new IntersectionObserver((entries, current) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animate(entry.target);
        current.unobserve(entry.target);
      });
    }, { threshold: 0.45 });
    counters.forEach((counter) => observer.observe(counter));
  }
})();
