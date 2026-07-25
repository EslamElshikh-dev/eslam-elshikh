(() => {
  const header = document.querySelector("[data-header]");
  const menuButton = document.querySelector("[data-menu-toggle]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");
  const themeButton = document.querySelector("[data-theme-toggle]");
  const themeColor = document.querySelector("[data-theme-color]");

  if (!document.querySelector('link[href="/assets/css/improvements.css"]')) {
    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = "/assets/css/improvements.css";
    document.head.appendChild(stylesheet);
  }

  const applyTheme = (theme, persist = false) => {
    const normalized = theme === "light" ? "light" : "dark";
    document.documentElement.dataset.theme = normalized;
    themeColor?.setAttribute("content", normalized === "light" ? "#f4f8fb" : "#07111b");
    themeButton?.setAttribute("aria-pressed", String(normalized === "light"));
    themeButton?.setAttribute("aria-label", normalized === "light" ? "تفعيل الوضع الداكن" : "تفعيل الوضع الفاتح");
    if (persist) {
      try { localStorage.setItem("es-theme", normalized); } catch {}
    }
  };

  applyTheme(document.documentElement.dataset.theme || "dark");
  themeButton?.addEventListener("click", () => {
    applyTheme(document.documentElement.dataset.theme === "light" ? "dark" : "light", true);
  });

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

  const credentialsMarkup = `
    <section class="section-pad credentials-section" id="credentials">
      <div class="container">
        <div class="section-head reveal"><span class="eyebrow"><span></span>الاعتمادات والخبرة</span><h2>هوية مهنية يمكن التحقق منها</h2><p>مسارات تقنية ومساهمات موثقة تربط الأمن السيبراني والبرمجيات وخبرة منتجات Google بالتنفيذ العملي.</p></div>
        <div class="credentials-grid">
          <article class="credential-card reveal"><span class="credential-kicker">Google</span><h3>خبير منتجات Google</h3><p>خبرة عملية في دعم منتجات Google وتشخيص مشكلات ملفات الأنشطة التجارية وتوجيه المستخدمين إلى المسارات الرسمية.</p><a class="text-link" href="https://me.developers.google.com/u/EslamElshikh" target="_blank" rel="noopener">عرض الملف الرسمي</a></article>
          <article class="credential-card reveal"><span class="credential-kicker">Google Developers</span><h3>Google Developer Expert</h3><p>خبرة تقنية تجمع التطوير والحلول السحابية والذكاء الاصطناعي وتجارب الويب الآمنة والقابلة للتوسع.</p><a class="text-link" href="https://me.developers.google.com/u/EslamElshikh" target="_blank" rel="noopener">التحقق من الملف المهني</a></article>
          <article class="credential-card reveal"><span class="credential-number">472</span><h3>مساهمة في توثيق ملفات Google</h3><p>خبرة تراكمية في مراجعة أهلية الأنشطة والبيانات وإشارات الثقة المطلوبة لملفات الأعمال.</p><a class="text-link" href="/google-expert/">تفاصيل خبرة Google</a></article>
          <article class="credential-card reveal"><span class="credential-number">233</span><h3>مشكلة ملف تجاري تمت معالجتها</h3><p>تشخيص مشكلات التعليق والتحقق والملكية والظهور مع التركيز على الالتزام بالإرشادات.</p><a class="text-link" href="/projects/#google-maps-work">مشاهدة نماذج الأعمال</a></article>
        </div>
        <div class="credentials-proof reveal"><span>مصادر هوية إضافية</span><a href="https://www.wikidata.org/wiki/Q138800449" target="_blank" rel="noopener">Wikidata Q138800449</a><a href="https://github.com/EslamElshikh-dev" target="_blank" rel="noopener">GitHub</a><a href="/about/">الملف المهني الكامل</a></div>
      </div>
    </section>`;

  const caseStudiesMarkup = `
    <section class="section-pad case-studies-section" id="case-studies"><div class="container"><div class="section-head reveal"><span class="eyebrow"><span></span>دراسات حالة</span><h2>المشكلة والحل والمخرجات في كل مشروع</h2><p>تفاصيل عملية توضح القرارات التي بُنيت عليها المشروعات دون ادعاء أرقام أو نتائج غير موثقة.</p></div><div class="case-studies-grid">
      <article class="case-study-card reveal"><div class="case-study-head"><span>01</span><div><p>مقاولات وخدمات محلية</p><h3>شركة تعاود للمقاولات</h3></div></div><dl><div><dt>التحدي</dt><dd>تنظيم خدمات مقاولات متعددة داخل تجربة عربية واضحة تدعم القرار والبحث المحلي.</dd></div><div><dt>الحل</dt><dd>بناء هيكل صفحات خدمات ومقالات وأسئلة شائعة مع تجربة متجاوبة وبيانات منظمة وربط داخلي.</dd></div><div><dt>المخرجات</dt><dd>موقع قابل للتوسع وبنية محتوى محلية ونقاط تواصل مباشرة وأساس تقني للتحسين المستمر.</dd></div></dl><div class="tag-row"><span>Web Development</span><span>Technical SEO</span><span>Content Architecture</span></div><a class="button button-ghost button-small" href="https://github.com/EslamElshikh-dev/tawod" target="_blank" rel="noopener">معاينة المشروع</a></article>
      <article class="case-study-card reveal"><div class="case-study-head"><span>02</span><div><p>نجارة وديكور خشبي</p><h3>مؤسسة العنود للديكور الخشبي</h3></div></div><dl><div><dt>التحدي</dt><dd>عرض عدد كبير من خدمات التفصيل والصيانة بطريقة متناسقة على الجوال ومفهومة لمحركات البحث.</dd></div><div><dt>الحل</dt><dd>هيكلة الخدمات والصفحات المحلية وتحسين التسلسل البصري وإضافة Schema وروابط داخلية.</dd></div><div><dt>المخرجات</dt><dd>واجهة متجاوبة ومسارات خدمة واضحة وصفحات قابلة للفهرسة وربط مباشر بالتواصل.</dd></div></dl><div class="tag-row"><span>Local SEO</span><span>Responsive UI</span><span>Schema</span></div><a class="button button-ghost button-small" href="https://github.com/EslamElshikh-dev/alanood-contracting" target="_blank" rel="noopener">معاينة المشروع</a></article>
      <article class="case-study-card reveal"><div class="case-study-head"><span>03</span><div><p>خدمات منزلية بالرياض</p><h3>أمين لخدمات الصيانة</h3></div></div><dl><div><dt>التحدي</dt><dd>تحويل زيارات الجوال إلى اتصال أو WhatsApp بسرعة مع وضوح الخدمات والمناطق المستهدفة.</dd></div><div><dt>الحل</dt><dd>صفحة هبوط خفيفة وأزرار تواصل ثابتة ومحتوى خدمات وأحياء وأسئلة شائعة محلية.</dd></div><div><dt>المخرجات</dt><dd>رحلة استخدام مختصرة ووصول مباشر للتواصل وبنية مناسبة للحملات والبحث المحلي.</dd></div></dl><div class="tag-row"><span>Landing Page</span><span>Conversion UX</span><span>Local Search</span></div><a class="button button-ghost button-small" href="https://ameenservse.vercel.app/" target="_blank" rel="noopener">زيارة الموقع</a></article>
    </div></div></section>`;

  const pathname = window.location.pathname.replace(/index\.html$/, "");
  if (pathname === "/" && !document.querySelector("#credentials")) {
    const projectsSection = document.querySelector(".projects-section");
    projectsSection?.insertAdjacentHTML("beforebegin", credentialsMarkup);
  }
  if (pathname.startsWith("/projects/") && !document.querySelector("#case-studies")) {
    const mapsSection = document.querySelector("#google-maps-work");
    mapsSection?.insertAdjacentHTML("beforebegin", caseStudiesMarkup);
  }

  document.querySelectorAll(".services-grid, .projects-grid, .maps-portfolio-grid, .posts-grid, .values-grid, .google-stats, .credentials-grid, .case-studies-grid").forEach((group) => {
    [...group.children].forEach((element, index) => element.style.setProperty("--reveal-delay", `${Math.min(index, 6) * 55}ms`));
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

  const filterButtons = [...document.querySelectorAll("[data-service-filter]")];
  const serviceCards = document.querySelectorAll("[data-services-grid] .service-card");
  const servicesList = document.querySelector("[data-services-grid]");
  if (servicesList) servicesList.id = servicesList.id || "services-list";
  const applyFilter = (group) => {
    filterButtons.forEach((button) => {
      const active = button.dataset.serviceFilter === group;
      button.setAttribute("aria-selected", String(active));
      button.setAttribute("tabindex", active ? "0" : "-1");
      button.setAttribute("aria-controls", "services-list");
    });
    serviceCards.forEach((card) => {
      card.hidden = group !== "all" && card.dataset.serviceGroup !== group;
    });
  };
  if (filterButtons.length && serviceCards.length) {
    applyFilter(filterButtons[0].dataset.serviceFilter);
    filterButtons.forEach((button, index) => {
      button.addEventListener("click", () => applyFilter(button.dataset.serviceFilter));
      button.addEventListener("keydown", (event) => {
        if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const direction = document.documentElement.dir === "rtl" ? -1 : 1;
        let target = index;
        if (event.key === "Home") target = 0;
        else if (event.key === "End") target = filterButtons.length - 1;
        else if (event.key === "ArrowRight") target = (index + direction + filterButtons.length) % filterButtons.length;
        else target = (index - direction + filterButtons.length) % filterButtons.length;
        filterButtons[target].focus();
        filterButtons[target].click();
      });
    });
  }

  document.querySelectorAll(".accordion details").forEach((detail) => {
    detail.addEventListener("toggle", () => {
      if (!detail.open) return;
      detail.closest(".accordion")?.querySelectorAll("details[open]").forEach((other) => {
        if (other !== detail) other.open = false;
      });
    });
  });

  const trackConversion = (eventName, details = {}) => {
    const payload = { event: eventName, page_path: window.location.pathname, ...details };
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
    window.dispatchEvent(new CustomEvent("eslam:conversion", { detail: payload }));
  };

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link) return;
    const href = link.getAttribute("href") || "";
    let eventName = "link_click";
    if (href.startsWith("tel:")) eventName = "phone_click";
    else if (href.includes("wa.me/")) eventName = "whatsapp_click";
    else if (href.startsWith("mailto:")) eventName = "email_click";
    else if (href.includes("maps.app.goo.gl") || href.includes("google.com/maps")) eventName = "google_maps_click";
    else if (link.closest(".project-card, .case-study-card, .maps-project-card")) eventName = "portfolio_click";
    else if (href.startsWith("/services/")) eventName = "service_click";
    trackConversion(eventName, { link_url: link.href, link_text: (link.textContent || "").trim().slice(0, 100) });
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
      const message = ["مرحبًا م. إسلام الشيخ،", `الاسم أو النشاط: ${name}`, `الخدمة المطلوبة: ${serviceNames[service] || service}`, "تفاصيل الهدف:", goal].join("\n");
      const url = `https://wa.me/966579395299?text=${encodeURIComponent(message)}`;
      trackConversion("contact_form_submit", { requested_service: serviceNames[service] || service });
      const opened = window.open(url, "_blank", "noopener,noreferrer");
      const status = form.querySelector(".form-status");
      if (status) status.textContent = opened ? "تم تجهيز الرسالة. راجعها في WhatsApp قبل الإرسال." : "تعذر فتح نافذة جديدة. استخدم زر WhatsApp المباشر.";
    });
  }

  document.querySelectorAll(".mobile-bottom-nav a").forEach((link) => {
    const path = new URL(link.href).pathname;
    const active = path === "/" ? pathname === "/" : pathname.startsWith(path);
    if (active) link.setAttribute("aria-current", "page");
  });

  document.querySelectorAll(".footer-bottom").forEach((footerBottom) => {
    if (footerBottom.querySelector(".footer-legal")) return;
    footerBottom.insertAdjacentHTML("beforeend", '<div class="footer-legal"><a href="/privacy/">سياسة الخصوصية</a><a href="/terms/">شروط الاستخدام</a><a href="/.well-known/security.txt">الإبلاغ الأمني</a></div>');
  });

  const mapFrames = document.querySelectorAll("iframe[data-map-src]");
  const loadMapFrame = (frame) => {
    if (!frame.dataset.mapSrc || frame.src !== "about:blank") return;
    frame.src = frame.dataset.mapSrc;
    frame.addEventListener("load", () => { frame.style.opacity = "1"; }, { once: true });
  };
  if ("IntersectionObserver" in window) {
    const mapObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        loadMapFrame(entry.target);
        mapObserver.unobserve(entry.target);
      });
    }, { rootMargin: "350px 0px" });
    mapFrames.forEach((frame) => mapObserver.observe(frame));
  } else {
    mapFrames.forEach(loadMapFrame);
  }
})();
