(() => {
  "use strict";

  const doc = document;
  const root = doc.documentElement;
  const body = doc.body;
  const header = doc.querySelector("[data-header]");
  const menuButton = doc.querySelector("[data-menu-toggle]");
  const mobileMenu = doc.querySelector("[data-mobile-menu]");
  const themeButton = doc.querySelector("[data-theme-toggle]");
  const backToTop = doc.querySelector("[data-back-to-top]");
  const floatingContact = doc.querySelector(".floating-contact");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const normalizePath = (pathname) => {
    const clean = pathname.replace(/index\.html$/, "");
    return clean.endsWith("/") ? clean : `${clean}/`;
  };
  const currentPath = normalizePath(window.location.pathname);

  const setTheme = (theme, persist = true) => {
    root.dataset.theme = theme;
    if (persist) {
      try { localStorage.setItem("es-theme", theme); } catch (_) { /* no-op */ }
    }
    const isLight = theme === "light";
    themeButton?.setAttribute("aria-pressed", String(isLight));
    themeButton?.setAttribute("aria-label", isLight ? "تفعيل الوضع الداكن / Switch to dark mode" : "تفعيل الوضع الفاتح / Switch to light mode");
    doc.querySelector("meta[data-theme-color]")?.setAttribute("content", isLight ? "#f5f8fb" : "#06131f");
  };

  if (themeButton) {
    setTheme(root.dataset.theme || "dark", false);
    themeButton.addEventListener("click", () => setTheme(root.dataset.theme === "light" ? "dark" : "light"));
  }

  const closeMenu = ({ restoreFocus = false } = {}) => {
    if (!menuButton || !mobileMenu) return;
    menuButton.setAttribute("aria-expanded", "false");
    mobileMenu.classList.remove("is-open");
    body.classList.remove("menu-open");
    if (restoreFocus) menuButton.focus();
  };

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", () => {
      const nextOpen = menuButton.getAttribute("aria-expanded") !== "true";
      menuButton.setAttribute("aria-expanded", String(nextOpen));
      mobileMenu.classList.toggle("is-open", nextOpen);
      body.classList.toggle("menu-open", nextOpen);
      if (nextOpen) mobileMenu.querySelector("a")?.focus({ preventScroll: true });
    });

    mobileMenu.addEventListener("click", (event) => {
      if (event.target.closest("a")) closeMenu();
    });

    doc.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && mobileMenu.classList.contains("is-open")) closeMenu({ restoreFocus: true });
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) closeMenu();
    }, { passive: true });
  }

  const onScroll = () => {
    const scrolled = window.scrollY > 16;
    header?.classList.toggle("is-scrolled", scrolled);
    backToTop?.classList.toggle("is-visible", window.scrollY > 600);
    floatingContact?.classList.toggle("is-visible", window.scrollY > 460 && currentPath !== "/contact/");
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  backToTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });

  const revealElements = [...doc.querySelectorAll(".reveal")];
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -7%", threshold: 0.08 });
    revealElements.forEach((element) => observer.observe(element));
  }

  const filterButtons = [...doc.querySelectorAll("[data-service-filter]")];
  const serviceCards = [...doc.querySelectorAll("[data-service-group]")];
  if (filterButtons.length && serviceCards.length) {
    const applyFilter = (selected) => {
      const value = selected.dataset.serviceFilter;
      filterButtons.forEach((button) => button.setAttribute("aria-selected", String(button === selected)));
      serviceCards.forEach((card) => {
        const visible = value === "all" || card.dataset.serviceGroup === value;
        card.hidden = !visible;
        if (visible) card.classList.add("is-visible");
      });
    };

    filterButtons.forEach((button, index) => {
      button.addEventListener("click", () => applyFilter(button));
      button.addEventListener("keydown", (event) => {
        if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        let nextIndex = index;
        if (event.key === "Home") nextIndex = 0;
        if (event.key === "End") nextIndex = filterButtons.length - 1;
        if (event.key === "ArrowRight") nextIndex = (index + (root.dir === "rtl" ? -1 : 1) + filterButtons.length) % filterButtons.length;
        if (event.key === "ArrowLeft") nextIndex = (index + (root.dir === "rtl" ? 1 : -1) + filterButtons.length) % filterButtons.length;
        filterButtons[nextIndex].focus();
        applyFilter(filterButtons[nextIndex]);
      });
    });
  }

  const workArchive = doc.querySelector("[data-work-archive]");
  if (workArchive) {
    const workCards = [...workArchive.querySelectorAll("[data-work-card]")];
    const workSearch = workArchive.querySelector("[data-work-search]");
    const workFilters = [...workArchive.querySelectorAll("[data-work-filter]")];
    const workStatus = workArchive.querySelector("[data-work-status]");
    const workMore = workArchive.querySelector("[data-work-more]");
    const workEmpty = workArchive.querySelector("[data-work-empty]");
    const pageSize = 18;
    let activeSector = "all";
    let visibleLimit = pageSize;

    const normalizeWorkText = (value) => String(value || "")
      .normalize("NFKD")
      .replace(/[\u064B-\u065F\u0670]/g, "")
      .replace(/[أإآٱ]/g, "ا")
      .replace(/ى/g, "ي")
      .replace(/ة/g, "ه")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();

    const applyWorkView = () => {
      const query = normalizeWorkText(workSearch?.value);
      const matches = workCards.filter((card) => {
        const sectorMatches = activeSector === "all" || card.dataset.workSector === activeSector;
        const queryMatches = !query || normalizeWorkText(card.textContent).includes(query);
        return sectorMatches && queryMatches;
      });
      const visible = new Set(matches.slice(0, visibleLimit));

      workCards.forEach((card) => {
        card.hidden = !visible.has(card);
        if (!card.hidden) card.classList.add("is-visible");
      });

      const shown = Math.min(matches.length, visibleLimit);
      if (workStatus) workStatus.textContent = matches.length
        ? `عرض ${shown} من أصل ${matches.length} مشروعًا مطابقًا — ${workCards.length} مشروعًا في السجل`
        : `لا توجد نتائج مطابقة — ${workCards.length} مشروعًا في السجل`;
      if (workMore) workMore.hidden = shown >= matches.length;
      if (workEmpty) workEmpty.hidden = matches.length !== 0;
    };

    workFilters.forEach((button) => {
      button.addEventListener("click", () => {
        activeSector = button.dataset.workFilter || "all";
        visibleLimit = pageSize;
        workFilters.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
        applyWorkView();
      });
    });

    workSearch?.addEventListener("input", () => {
      visibleLimit = pageSize;
      applyWorkView();
    });

    workMore?.addEventListener("click", () => {
      visibleLimit += pageSize;
      applyWorkView();
    });

    applyWorkView();
  }

  doc.querySelectorAll(".mobile-bottom-nav a").forEach((link) => {
    const baseOrigin = window.location.origin === "null" ? "https://www.eslam-elshikh.com" : window.location.origin;
    const linkPath = normalizePath(new URL(link.getAttribute("href") || "/", baseOrigin).pathname);
    const exact = currentPath === linkPath;
    const servicesSection = linkPath === "/services/" && (currentPath.startsWith("/services/") || currentPath.startsWith("/local-seo/"));
    const projectsSection = linkPath === "/projects/" && currentPath.startsWith("/projects/");
    const contactSection = linkPath === "/contact/" && currentPath.startsWith("/contact/");
    if (exact || servicesSection || projectsSection || contactSection) link.setAttribute("aria-current", "page");
  });

  const form = doc.querySelector("[data-project-form]");
  if (form) {
    const details = form.querySelector('[name="details"]');
    const counter = form.querySelector("[data-character-count]");
    const message = form.querySelector("[data-form-message]");
    const submitButton = form.querySelector("[data-project-submit]");

    const updateCount = () => {
      if (counter && details) counter.textContent = String(details.value.length);
    };
    updateCount();
    details?.addEventListener("input", updateCount);

    const openProjectMessage = () => {
      message.textContent = "";
      const valueOf = (name) => String(form.querySelector(`[name="${name}"]`)?.value || "").trim();
      const name = valueOf("name");
      const service = valueOf("service");
      const url = valueOf("url");
      const projectDetails = valueOf("details");
      const timeline = valueOf("timeline");

      if (!name || !service || projectDetails.length < 20) {
        message.textContent = "يرجى كتابة الاسم، واختيار الخدمة، وإضافة وصف لا يقل عن 20 حرفًا.";
        const invalid = !name ? form.querySelector('[name="name"]') : !service ? form.querySelector('[name="service"]') : details;
        invalid?.focus();
        return;
      }

      if (url) {
        try { new URL(url); } catch (_) {
          message.textContent = "يرجى كتابة رابط صحيح يبدأ بـ https:// أو ترك حقل الرابط فارغًا.";
          form.querySelector('[name="url"]')?.focus();
          return;
        }
      }

      const lines = [
        "مرحبًا م. إسلام، أرغب في مناقشة مشروع.",
        "",
        `الاسم / الشركة: ${name}`,
        `الخدمة: ${service}`,
        url ? `الرابط: ${url}` : "",
        `الهدف والوضع الحالي: ${projectDetails}`,
        timeline ? `الموعد المتوقع: ${timeline}` : "",
        "",
        "تم تجهيز الرسالة من خلال eslam-elshikh.com"
      ].filter(Boolean);

      const whatsappUrl = `https://wa.me/966579395299?text=${encodeURIComponent(lines.join("\n"))}`;
      message.textContent = "تم تجهيز الرسالة. سيفتح WhatsApp لمراجعتها قبل الإرسال.";
      const opened = window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      if (!opened) window.location.href = whatsappUrl;
    };

    submitButton?.addEventListener("click", openProjectMessage);
  }

  doc.querySelectorAll(".accordion details").forEach((details) => {
    details.addEventListener("toggle", () => {
      if (!details.open) return;
      const accordion = details.closest(".accordion");
      accordion?.querySelectorAll("details[open]").forEach((other) => {
        if (other !== details) other.open = false;
      });
    });
  });
})();
