(() => {
  "use strict";

  const doc = document;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const portraitUrl = "https://avatars.githubusercontent.com/u/264218940?v=4";
  const brandLogoUrl = "/assets/brand/eslam-elshikh-logo-transparent.png";
  const canonicalBase = "https://www.eslam-elshikh.com";
  const normalizedPath = location.pathname === "/" || location.pathname.endsWith("/")
    ? location.pathname
    : `${location.pathname}/`;
  const canonicalUrl = `${canonicalBase}${normalizedPath}`;

  const desiredStats = [
    { value: 1411, suffix: "+", label: "مساهمة في توثيق وإدارة ملفات Google التجارية" },
    { value: 105, suffix: "+", label: "موقع وتطبيق ومتجر إلكتروني تم تصميمها وتطويرها" },
    { value: 653, suffix: "+", label: "مساعد بالذكاء الاصطناعي ومشروع سحابي" },
    { value: 360, suffix: "°", label: "رؤية تجمع الأمن والتطوير والظهور الرقمي" }
  ];

  // Use the approved transparent brand mark everywhere a site logo appears.
  const brandSelectors = [
    ".brand-logo",
    ".site-logo img",
    "header .brand img",
    "footer .brand img",
    'img[src*="eslam-elshikh-primary.svg"]',
    'img[src*="eslam-elshikh-logo-2026.svg"]'
  ].join(",");

  doc.querySelectorAll(brandSelectors).forEach((img) => {
    if (!(img instanceof HTMLImageElement)) return;
    img.src = brandLogoUrl;
    img.alt = doc.documentElement.lang.startsWith("en")
      ? "Eslam Elshikh logo"
      : "شعار المهندس إسلام الشيخ";
    img.classList.add("brand-logo-approved");
  });

  // Keep the approved portrait only in the two profile placements.
  const profileSelectors = ".hero-logo, .profile-card img, .about-profile img, [class*=profile-card] img";
  doc.querySelectorAll(profileSelectors).forEach((img) => {
    if (!(img instanceof HTMLImageElement)) return;
    img.src = portraitUrl;
    img.alt = doc.documentElement.lang.startsWith("en") ? "Eslam Elshikh" : "المهندس إسلام الشيخ";
    img.classList.add("profile-portrait-image");
    img.removeAttribute("width");
    img.removeAttribute("height");
  });

  const statsMarkup = desiredStats.map((item) => `
    <div class="reveal is-visible">
      <strong data-counter="${item.value}" data-suffix="${item.suffix}">0${item.suffix}</strong>
      <span>${item.label}</span>
    </div>`).join("");

  const googleStats = doc.querySelector(".google-stats");
  if (googleStats) googleStats.innerHTML = statsMarkup;

  const animateCounter = (element) => {
    if (!(element instanceof HTMLElement) || element.dataset.counted === "true") return;
    element.dataset.counted = "true";
    const target = Number(element.dataset.counter || 0);
    const suffix = element.dataset.suffix || "";
    if (reducedMotion || !Number.isFinite(target)) {
      element.textContent = `${target.toLocaleString("en-US")}${suffix}`;
      return;
    }

    const duration = 1350;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = `${Math.round(target * eased).toLocaleString("en-US")}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const pageCounters = [...doc.querySelectorAll(".google-stats [data-counter]")];
  if (pageCounters.length) {
    if (reducedMotion || !("IntersectionObserver" in window)) {
      pageCounters.forEach(animateCounter);
    } else {
      const counterObserver = new IntersectionObserver((entries, currentObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCounter(entry.target);
          currentObserver.unobserve(entry.target);
        });
      }, { threshold: 0.35 });
      pageCounters.forEach((counter) => counterObserver.observe(counter));
    }
  }

  // Replace the defensive disclaimer with a professional, trust-building introduction.
  const disclaimer = doc.querySelector(".disclaimer-card");
  if (disclaimer) {
    disclaimer.classList.add("professional-summary-card");
    const copy = disclaimer.querySelector(":scope > div:last-child");
    if (copy) {
      copy.innerHTML = `
        <span>نبذة مهنية</span>
        <h2>خبرة تقنية تبني الثقة وتحول التحديات إلى نتائج</h2>
        <p>المهندس إسلام الشيخ مصمم مواقع ويب ومستشار تقني في الرياض، يجمع بين تطوير المواقع والتطبيقات، وتحسين الظهور في Google، والأمن السيبراني، والذكاء الاصطناعي والحلول السحابية. يبدأ كل مشروع بفهم الهدف التجاري وتجربة المستخدم، ثم تحويله إلى خطة واضحة وتنفيذ متقن ومخرجات قابلة للقياس والتطوير.</p>`;
    }
  }

  // Normalize visible copy and publish the service-area statement without exposing a private address.
  doc.querySelectorAll("h1,h2,h3,p,span").forEach((node) => {
    if (node.childElementCount) return;
    node.textContent = node.textContent.replace(/الخدمات المتخصصة[.،]?تط/g, "الخدمات المتخصصة");
  });

  const contactSection = doc.querySelector("#contact, .contact-section");
  if (contactSection && !doc.querySelector("[data-service-area-note]")) {
    const note = doc.createElement("p");
    note.dataset.serviceAreaNote = "true";
    note.className = "service-area-note";
    note.textContent = "نطاق الخدمة: جميع أحياء مدينة الرياض — زيارات مواقع العملاء والاجتماعات بموعد مسبق، مع توفر الاستشارات عن بُعد.";
    contactSection.appendChild(note);
  }

  // Repair profile structured data and retain public service-area details only.
  doc.querySelectorAll('script[type="application/ld+json"]').forEach((script) => {
    try {
      const data = JSON.parse(script.textContent || "{}");
      const graphs = Array.isArray(data) ? data : Array.isArray(data["@graph"]) ? data["@graph"] : [data];
      let personId = `${canonicalBase}/#person`;

      graphs.forEach((item) => {
        if (!item || typeof item !== "object") return;
        const types = Array.isArray(item["@type"]) ? item["@type"] : [item["@type"]];

        if (types.includes("Person")) {
          item["@id"] = item["@id"] || personId;
          personId = item["@id"];
          item.image = portraitUrl;
          item.homeLocation = { "@type": "City", name: "الرياض" };
          item.knowsAbout = ["تصميم مواقع الويب", "الأمن السيبراني", "الذكاء الاصطناعي", "تحسين محركات البحث", "Google Business Profile", "الحلول السحابية"];
        }

        if (types.includes("ProfilePage")) {
          item.url = canonicalUrl;
          item["@id"] = `${canonicalUrl}#profile-page`;
          item.dateModified = "2026-07-30";
          item.mainEntity = { "@id": personId };
        }

        if (types.includes("ProfessionalService") || types.includes("LocalBusiness")) {
          item.name = "المهندس إسلام الشيخ";
          item.url = canonicalBase;
          item.logo = `${canonicalBase}${brandLogoUrl}`;
          item.image = portraitUrl;
          item.areaServed = { "@type": "City", name: "الرياض" };
          item.address = { "@type": "PostalAddress", addressLocality: "الرياض", addressRegion: "منطقة الرياض", addressCountry: "SA" };
          delete item.geo;
          item.additionalType = ["https://schema.org/WebSite", "https://schema.org/ProfessionalService"];
          item.description = "مصمم مواقع ويب ومستشار تقني يقدم خدمات تطوير المواقع والتطبيقات والسيو والأمن السيبراني والذكاء الاصطناعي داخل الرياض وعن بُعد.";
        }

        if (item.logo && typeof item.logo === "string" && item.logo.includes("/assets/brand/")) {
          item.logo = `${canonicalBase}${brandLogoUrl}`;
        }
      });

      script.textContent = JSON.stringify(data);
    } catch (_) {
      // Preserve the original JSON-LD if a third-party block cannot be parsed.
    }
  });
})();
