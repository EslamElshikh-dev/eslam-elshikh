(() => {
  "use strict";

  const measurementId = "G-MDJ2HGF9E1";
  const storageKey = "es-analytics-consent";
  const isEnglish = document.documentElement.lang.startsWith("en");
  let sessionChoice = null;

  const readChoice = () => {
    try { return localStorage.getItem(storageKey); } catch (_) { return null; }
  };

  sessionChoice = readChoice();

  const saveChoice = (choice) => {
    sessionChoice = choice;
    try { localStorage.setItem(storageKey, choice); } catch (_) { /* Use the choice for this page only. */ }
  };

  const gtag = function () {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(arguments);
  };

  const loadAnalytics = () => {
    if (window.__esAnalyticsLoaded || sessionChoice !== "granted") return;
    window.__esAnalyticsLoaded = true;
    window[`ga-disable-${measurementId}`] = false;
    gtag("consent", "default", { analytics_storage: "granted" });
    gtag("js", new Date());
    gtag("config", measurementId, { anonymize_ip: true });
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);
  };

  const disableAnalytics = () => {
    window[`ga-disable-${measurementId}`] = true;
    if (window.dataLayer) gtag("consent", "update", { analytics_storage: "denied" });
    document.cookie.split(";").forEach((entry) => {
      const name = entry.split("=")[0]?.trim();
      if (name === "_ga" || name?.startsWith("_ga_")) {
        document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
        document.cookie = `${name}=; Max-Age=0; path=/; domain=.eslam-elshikh.com; SameSite=Lax`;
      }
    });
  };

  const eventNames = new Set(["call_click", "whatsapp_click", "email_click", "project_form_start", "project_message_ready", "gbp_audit_start", "gbp_audit_complete", "gbp_audit_whatsapp", "booking_message_ready", "proof_map_interaction"]);
  const serviceNames = new Set(["web-development", "cybersecurity", "cloud-solutions", "ai-agents", "google-support", "google-business-profile", "knowledge-bases", "seo", "digital-advertising", "consultation"]);
  const placements = new Set(["header", "footer", "floating", "hero", "contact_form", "audit_tool", "audit_result", "booking_form", "proof_map", "content"]);

  // Collect intent and placement only, never the message, name, phone or submitted URL.
  const track = (name, parameters = {}, onComplete) => {
    if (sessionChoice !== "granted" || !eventNames.has(name)) return false;
    loadAnalytics();
    const pathService = window.location.pathname.match(/^\/(?:en\/)?services\/([^/]+)\//)?.[1];
    const service = serviceNames.has(parameters.service) ? parameters.service : pathService;
    const values = {
      page_path: window.location.pathname,
      service: serviceNames.has(service) ? service : "general",
      placement: placements.has(parameters.placement) ? parameters.placement : "content",
      transport_type: "beacon"
    };
    if (typeof onComplete === "function") {
      values.event_callback = onComplete;
      values.event_timeout = 600;
    }
    gtag("event", name, values);
    return true;
  };
  window.esAnalytics = Object.freeze({ track });

  const trackContact = (event) => {
    if (event.type === "auxclick" && event.button !== 1) return;
    const link = event.target.closest?.("a[href]");
    if (!link) return;
    const href = link.getAttribute("href") || "";
    const name = href.startsWith("tel:+966579395299") ? "call_click"
      : /^https:\/\/wa\.me\/966579395299(?:\?|$)/.test(href) ? "whatsapp_click"
      : href.startsWith("mailto:info@eslam-elshikh.com") ? "email_click" : null;
    if (!name) return;
    const placement = link.closest(".floating-contact") ? "floating"
      : link.closest(".site-header") ? "header"
      : link.closest(".site-footer") ? "footer"
      : link.closest(".hero") ? "hero" : "content";
    track(name, { placement });
  };
  document.addEventListener("click", trackContact);
  document.addEventListener("auxclick", trackContact);

  const removeBanner = () => {
    document.querySelector("[data-analytics-consent]")?.remove();
    document.body.classList.remove("has-consent-dialog");
  };

  const showPreferences = () => {
    removeBanner();
    const banner = document.createElement("div");
    banner.className = "analytics-consent";
    banner.dataset.analyticsConsent = "true";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-modal", "false");
    banner.setAttribute("aria-labelledby", "analytics-consent-title");

    const copy = document.createElement("p");
    const title = document.createElement("strong");
    title.id = "analytics-consent-title";
    title.textContent = isEnglish ? "Optional analytics" : "تحليلات اختيارية";
    const description = document.createElement("span");
    description.textContent = isEnglish
      ? "Allow Google Analytics to help improve the site. Core features work without it."
      : "اسمح باستخدام Google Analytics لتحسين الموقع. تعمل الوظائف الأساسية من دونها.";
    copy.append(title, description);

    const actions = document.createElement("div");
    const privacy = document.createElement("a");
    privacy.href = isEnglish ? "/en/privacy/" : "/privacy/";
    privacy.textContent = isEnglish ? "Privacy" : "الخصوصية";
    const reject = document.createElement("button");
    reject.type = "button";
    reject.className = "button button-small button-ghost";
    reject.textContent = isEnglish ? "Reject" : "رفض";
    const accept = document.createElement("button");
    accept.type = "button";
    accept.className = "button button-small";
    accept.textContent = isEnglish ? "Allow analytics" : "السماح بالتحليلات";

    reject.addEventListener("click", () => {
      saveChoice("denied");
      disableAnalytics();
      removeBanner();
    });
    accept.addEventListener("click", () => {
      saveChoice("granted");
      removeBanner();
      loadAnalytics();
    });

    actions.append(privacy, reject, accept);
    banner.append(copy, actions);
    document.body.appendChild(banner);
    document.body.classList.add("has-consent-dialog");
    reject.focus({ preventScroll: true });
  };

  const initialize = () => {
    const choice = sessionChoice;
    if (choice === "granted") {
      if ("requestIdleCallback" in window) requestIdleCallback(loadAnalytics, { timeout: 3000 });
      else setTimeout(loadAnalytics, 1200);
    } else if (choice !== "denied") {
      showPreferences();
    }
    document.querySelectorAll("[data-analytics-preferences]").forEach((button) => {
      button.addEventListener("click", showPreferences);
    });
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true });
  else initialize();
})();
