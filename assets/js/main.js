(() => {
  const header = document.querySelector("[data-header]");
  const menuButton = document.querySelector("[data-menu-toggle]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");

  const updateHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 16);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  const closeMenu = () => {
    if (!menuButton || !mobileMenu) return;
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "فتح القائمة");
    mobileMenu.classList.remove("is-open");
  };

  menuButton?.addEventListener("click", () => {
    const willOpen = menuButton.getAttribute("aria-expanded") !== "true";
    menuButton.setAttribute("aria-expanded", String(willOpen));
    menuButton.setAttribute("aria-label", willOpen ? "إغلاق القائمة" : "فتح القائمة");
    mobileMenu?.classList.toggle("is-open", willOpen);
  });

  mobileMenu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -30px" });
    reveals.forEach((element) => observer.observe(element));
  } else {
    reveals.forEach((element) => element.classList.add("is-visible"));
  }

  const filterButtons = document.querySelectorAll("[data-service-filter]");
  const serviceCards = document.querySelectorAll("[data-services-grid] .service-card");
  const applyFilter = (group) => {
    filterButtons.forEach((button) => button.setAttribute("aria-selected", String(button.dataset.serviceFilter === group)));
    serviceCards.forEach((card) => {
      const cardGroup = card.querySelector(".service-group")?.textContent?.trim();
      card.hidden = cardGroup !== group;
    });
  };
  if (filterButtons.length && serviceCards.length) {
    const firstGroup = filterButtons[0].dataset.serviceFilter;
    if (firstGroup) applyFilter(firstGroup);
    filterButtons.forEach((button) => button.addEventListener("click", () => applyFilter(button.dataset.serviceFilter)));
  }

  document.querySelectorAll(".accordion details").forEach((detail) => {
    detail.addEventListener("toggle", () => {
      if (!detail.open) return;
      const container = detail.closest(".accordion");
      container?.querySelectorAll("details[open]").forEach((other) => {
        if (other !== detail) other.open = false;
      });
    });
  });

  const serviceNames = {
    cybersecurity: "الأمن السيبراني وحماية الأنظمة",
    "cloud-solutions": "الحلول السحابية الآمنة",
    "ai-agents": "تطوير الذكاء الاصطناعي ووكلاء AI",
    "web-development": "تطوير المواقع والتطبيقات",
    "google-support": "استشارات ودعم منتجات Google",
    "google-business-profile": "إدارة وتوثيق الأنشطة التجارية على Google",
    "knowledge-bases": "قواعد المعرفة والبحث الذكي",
    seo: "تحسين محركات البحث SEO",
    "digital-advertising": "إدارة الإعلانات الرقمية"
  };
  const form = document.querySelector("[data-contact-form]");
  if (form) {
    const serviceSelect = form.elements.service;
    const selectedService = new URLSearchParams(window.location.search).get("service");
    if (selectedService && serviceNames[selectedService]) serviceSelect.value = selectedService;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const values = new FormData(form);
      const name = String(values.get("name") || "").trim();
      const service = String(values.get("service") || "");
      const goal = String(values.get("goal") || "").trim();
      const message = [
        "مرحبًا م. إسلام الشيخ،",
        `الاسم أو النشاط: ${name}`,
        `الخدمة المطلوبة: ${serviceNames[service] || service}`,
        "تفاصيل الهدف:",
        goal
      ].join("\n");
      const url = `https://wa.me/966547194788?text=${encodeURIComponent(message)}`;
      const opened = window.open(url, "_blank", "noopener,noreferrer");
      const status = form.querySelector(".form-status");
      if (status) status.textContent = opened ? "تم تجهيز الرسالة. راجعها في WhatsApp قبل الإرسال." : "تعذر فتح نافذة جديدة. استخدم زر WhatsApp المباشر.";
    });
  }

  const currentPath = window.location.pathname.replace(/index\.html$/, "");
  document.querySelectorAll(".mobile-bottom-nav a").forEach((link) => {
    const path = new URL(link.href).pathname;
    const active = path === "/" ? currentPath === "/" : currentPath.startsWith(path);
    if (active) link.setAttribute("aria-current", "page");
  });
})();
