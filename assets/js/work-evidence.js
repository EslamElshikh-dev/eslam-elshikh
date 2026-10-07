(() => {
  "use strict";
  const page = document.querySelector("[data-work-evidence]");
  if (!page) return;
  const english = document.documentElement.lang === "en";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Static images and direct links remain available if enhancement is unavailable.
  page.querySelectorAll("[data-evidence-gallery]").forEach(gallery => {
    const image = gallery.querySelector("[data-evidence-preview]");
    const caption = gallery.querySelector("[data-evidence-caption]");
    const controls = gallery.querySelector("[data-evidence-switches]");
    if (!image || !caption || !controls) return;
    const buttons = [...controls.querySelectorAll("[data-evidence-image]")];
    buttons.forEach(button => {
      button.addEventListener("click", () => {
        if (button.getAttribute("aria-pressed") === "true") return;
        buttons.forEach(item => item.setAttribute("aria-pressed", String(item === button)));
        image.alt = button.dataset.evidenceAlt;
        caption.textContent = button.dataset.evidenceCaptionText;
        image.src = button.dataset.evidenceImage;
      });
    });
    image.addEventListener("load", () => {
      if (reducedMotion.matches || typeof image.animate !== "function") return;
      image.getAnimations?.().forEach(animation => animation.cancel());
      image.animate([{ opacity: .55 }, { opacity: 1 }], { duration: 280, easing: "ease-out" });
    });
    controls.hidden = false;
  });

  const directory = page.querySelector("[data-evidence-directory]");
  if (directory) {
    const search = directory.querySelector("[data-evidence-search]");
    const filters = [...directory.querySelectorAll("[data-evidence-filter]")];
    const result = directory.querySelector("[data-evidence-result]");
    const empty = page.querySelector("[data-evidence-empty]");
    const normalize = text => text.normalize("NFKD").toLowerCase().replace(/[\u064b-\u065f\u0670\u0640]/g, "").replace(/[أإآٱ]/g, "ا").replace(/ى/g, "ي").trim();
    const profiles = [...page.querySelectorAll("[data-profile-review]")].map(row => ({ row, name: normalize(row.querySelector("th").textContent), state: row.dataset.profileReview }));
    let activeFilter = "all";
    const filterProfiles = () => {
      const query = normalize(search.value);
      let visible = 0;
      profiles.forEach(({ row, name, state }) => {
        const stateMatches = activeFilter === "all" || (activeFilter === "verified" ? state === "verified" : state !== "verified");
        row.hidden = !stateMatches || !name.includes(query);
        if (!row.hidden) visible++;
      });
      result.textContent = english ? `${visible} of ${profiles.length} profiles` : `عرض ${visible} من ${profiles.length} ملفًا`;
      empty.hidden = visible > 0;
      // Opening or filtering the directory changes the available scroll distance.
      queueNavigationUpdate();
    };
    filters.forEach(button => button.addEventListener("click", () => {
      activeFilter = button.dataset.evidenceFilter;
      filters.forEach(item => item.setAttribute("aria-pressed", String(item === button)));
      filterProfiles();
    }));
    search.addEventListener("input", filterProfiles);
    directory.hidden = false;
    // Run after navigation setup below, so the scroll updater is available.
    queueMicrotask(filterProfiles);
  }

  const navigation = page.querySelector("[data-evidence-nav]");
  const progress = page.querySelector("[data-evidence-progress]");
  const links = [...page.querySelectorAll("[data-evidence-nav-link]")];
  const sections = links.map(link => page.querySelector(link.getAttribute("href")));
  let frame = 0;
  let active = -1;
  const updateNavigation = () => {
    frame = 0;
    const marker = navigation.getBoundingClientRect().bottom + 28;
    let next = -1;
    sections.forEach((section, index) => {
      if (section && section.getBoundingClientRect().top <= marker) next = index;
    });
    if (next !== active) {
      active = next;
      links.forEach((link, index) => {
        if (index === active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    }
    const pageRect = page.getBoundingClientRect();
    const total = Math.max(1, pageRect.height - window.innerHeight);
    const value = Math.max(0, Math.min(1, -pageRect.top / total));
    progress.style.transform = `scaleX(${value})`;
  };
  function queueNavigationUpdate() {
    if (!frame) frame = window.requestAnimationFrame(updateNavigation);
  }
  window.addEventListener("scroll", queueNavigationUpdate, { passive: true });
  window.addEventListener("resize", queueNavigationUpdate, { passive: true });
  window.addEventListener("load", queueNavigationUpdate, { once: true });
  page.querySelector(".evidence-account-details")?.addEventListener("toggle", queueNavigationUpdate);
  queueNavigationUpdate();
})();
