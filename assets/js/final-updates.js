(() => {
  "use strict";

  const doc = document;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const portraitUrl = "https://avatars.githubusercontent.com/u/264218940?v=4";

  // Google Analytics 4
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag(){ window.dataLayer.push(arguments); };
  if (!doc.querySelector('script[src*="googletagmanager.com/gtag/js?id=G-MDJ2HGF9E1"]')) {
    const analytics = doc.createElement("script");
    analytics.async = true;
    analytics.src = "https://www.googletagmanager.com/gtag/js?id=G-MDJ2HGF9E1";
    doc.head.appendChild(analytics);
  }
  window.gtag("js", new Date());
  window.gtag("config", "G-MDJ2HGF9E1", { anonymize_ip: true });

  // Replace identity visuals in the two profile placements while keeping the brand mark in metadata/icons.
  const replaceProfileVisuals = () => {
    const candidates = [
      ...doc.querySelectorAll('.hero-logo, .profile-card img, .about-profile img, [class*="profile"] img')
    ];
    candidates.forEach((img) => {
      if (!(img instanceof HTMLImageElement)) return;
      img.src = portraitUrl;
      img.alt = document.documentElement.lang.startsWith("en") ? "Eslam Elshikh" : "المهندس إسلام الشيخ";
      img.classList.add("profile-portrait-image");
      img.removeAttribute("width");
      img.removeAttribute("height");
    });
  };
  replaceProfileVisuals();

  // Update the public achievement statistics and animate their values once they enter the viewport.
  const desiredStats = [
    { value: 1411, suffix: "+", label: "مساهمة في توثيق وإدارة ملفات Google التجارية" },
    { value: 105, suffix: "+", label: "موقع وتطبيق ومتجر إلكتروني تم تصميمها وتطويرها" },
    { value: 653, suffix: "+", label: "مساعد بالذكاء الاصطناعي ومشروع سحابي" },
    { value: 360, suffix: "°", label: "رؤية تجمع الأمن والتطوير والظهور الرقمي" }
  ];

  const statCards = [...doc.querySelectorAll('.stat-card, [class*="stat-card"], .stats-grid > *')].slice(0, 4);
  statCards.forEach((card, index) => {
    const item = desiredStats[index];
    if (!item) return;
    const number = card.querySelector('strong, .stat-value, [class*="stat-value"]') || card.firstElementChild;
    const label = card.querySelector('span, p, .stat-label, [class*="stat-label"]');
    if (number) {
      number.dataset.counterTarget = String(item.value);
      number.dataset.counterSuffix = item.suffix;
      number.textContent = reducedMotion ? `${item.value}${item.suffix}` : `0${item.suffix}`;
    }
    if (label) label.textContent = item.label;
  });

  const animateCounter = (element) => {
    if (element.dataset.counterDone === "true") return;
    element.dataset.counterDone = "true";
    const target = Number(element.dataset.counterTarget || 0);
    const suffix = element.dataset.counterSuffix || "";
    if (reducedMotion || !target) {
      element.textContent = `${target.toLocaleString("en-US")}${suffix}`;
      return;
    }
    const duration = 1300;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = `${Math.floor(target * eased).toLocaleString("en-US")}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const counters = [...doc.querySelectorAll('[data-counter-target]')];
  if ("IntersectionObserver" in window && !reducedMotion) {
    const observer = new IntersectionObserver((entries, current) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        current.unobserve(entry.target);
      });
    }, { threshold: 0.35 });
    counters.forEach((counter) => observer.observe(counter));
  } else {
    counters.forEach(animateCounter);
  }
})();
