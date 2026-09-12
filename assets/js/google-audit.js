(() => {
  "use strict";

  const root = document.querySelector("[data-gbp-audit]");
  if (!root) return;

  const query = root.querySelector("[data-audit-query]");
  const website = root.querySelector("[data-audit-website]");
  const phone = root.querySelector("[data-audit-phone]");
  const submit = root.querySelector("[data-audit-submit]");
  const status = root.querySelector("[data-audit-status]");
  const results = root.querySelector("[data-audit-results]");
  const choices = root.querySelector("[data-audit-choices]");
  const manual = root.querySelector("[data-manual-audit]");
  const manualButton = root.querySelector("[data-manual-calculate]");
  let currentPlace = null;

  const text = (selector, value) => {
    const element = root.querySelector(selector);
    if (element) element.textContent = value;
  };

  const normalizePhone = (value) => String(value || "").replace(/\D/g, "").replace(/^966/, "0");
  const normalizeHost = (value) => {
    try { return new URL(value).hostname.replace(/^www\./, "").toLowerCase(); }
    catch { return ""; }
  };

  function scorePlace(place) {
    const checks = [
      [Boolean(place.name), 5, "اسم النشاط ظاهر"],
      [Boolean(place.address), 15, "عنوان أو نطاق خدمة ظاهر"],
      [Boolean(place.category), 10, "الفئة الأساسية ظاهرة"],
      [Boolean(place.phone), 15, "رقم الهاتف ظاهر"],
      [Boolean(place.website), 15, "رابط الموقع موجود"],
      [Boolean(place.hoursAvailable), 15, "ساعات العمل منشورة"],
      [place.reviewCount >= 5 && place.rating >= 4, 15, "حد أدنى أولي من الثقة بالمراجعات"],
      [place.photoCount >= 3, 10, "صور عامة متاحة"],
    ];
    const expectedWebsite = normalizeHost(website.value.trim());
    const expectedPhone = normalizePhone(phone.value.trim());
    const nap = [];
    if (expectedWebsite) nap.push([expectedWebsite === normalizeHost(place.website), "الموقع متسق مع الرابط المتوقع"]);
    if (expectedPhone) nap.push([expectedPhone === normalizePhone(place.phone), "الهاتف متسق مع الرقم المتوقع"]);
    let score = checks.reduce((sum, [ok, weight]) => sum + (ok ? weight : 0), 0);
    if (nap.length) score = Math.max(0, score - nap.filter(([ok]) => !ok).length * 5);
    const priorities = checks.filter(([ok]) => !ok).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([, , label]) => label);
    nap.filter(([ok]) => !ok).forEach(([, label]) => priorities.unshift(label));
    return { score, checks, nap, priorities: priorities.slice(0, 3) };
  }

  function priorityCopy(label) {
    const copies = {
      "عنوان أو نطاق خدمة ظاهر": "راجع أهلية إظهار العنوان أو اضبط نطاق الخدمة بما يطابق طريقة استقبال العملاء.",
      "رقم الهاتف ظاهر": "أضف رقمًا مباشرًا يخص النشاط وتأكد من مطابقته للموقع.",
      "رابط الموقع موجود": "اربط صفحة خدمة واضحة وسريعة مع UTM مخصص للملف.",
      "ساعات العمل منشورة": "انشر ساعات الحضور الفعلية وافصلها عن توافر المساعد الرقمي.",
      "حد أدنى أولي من الثقة بالمراجعات": "اطلب مراجعات حقيقية تدريجيًا من عملاء تعاملوا معك دون حوافز أو نصوص ملقنة.",
      "صور عامة متاحة": "أضف صورًا أصلية حديثة للمكان والفريق والنتائج المسموح بعرضها.",
      "الفئة الأساسية ظاهرة": "راجع الفئة الأساسية لتصف الخدمة الأهم بدقة.",
      "اسم النشاط ظاهر": "راجع الاسم العام ليطابق الاسم المستخدم فعليًا دون إضافات تسويقية.",
      "الموقع متسق مع الرابط المتوقع": "وحّد رابط الموقع بين الملف التجاري وصفحات التواصل العامة.",
      "الهاتف متسق مع الرقم المتوقع": "وحّد رقم الهاتف بصيغة واحدة في الملف والموقع والمصادر العامة."
    };
    return copies[label] || label;
  }

  function renderPlace(place, overrides = {}) {
    currentPlace = place;
    const audit = scorePlace(place);
    if (Number.isFinite(overrides.score)) audit.score = overrides.score;
    if (Array.isArray(overrides.priorities)) audit.priorities = overrides.priorities;
    results.hidden = false;
    choices.hidden = true;
    manual.hidden = true;
    text("[data-score]", String(audit.score));
    text("[data-score-label]", audit.score >= 80 ? "جاهزية قوية" : audit.score >= 60 ? "أساس جيد يحتاج تحسينًا" : "فجوات واضحة تقلل الثقة");
    text("[data-result-name]", place.name || "نشاط دون اسم ظاهر");
    text("[data-result-meta]", [place.category, place.address].filter(Boolean).join(" · ") || "بيانات عامة محدودة");
    text("[data-result-rating]", place.rating ? `${place.rating.toFixed(1)} من 5 (${place.reviewCount} مراجعة)` : "لا توجد بيانات تقييم كافية");
    const checksList = root.querySelector("[data-audit-checks]");
    checksList.replaceChildren(...[...audit.checks, ...audit.nap.map(([ok, label]) => [ok, 0, label])].map(([ok, , label]) => {
      const item = document.createElement("li");
      item.className = ok ? "is-pass" : "is-gap";
      item.textContent = `${ok ? "✓" : "!"} ${label}`;
      return item;
    }));
    const priorityList = root.querySelector("[data-audit-priorities]");
    const priorities = audit.priorities.length ? audit.priorities : ["حافظ على البيانات محدثة، وانشر دليل عمل جديدًا، وقِس التحويلات شهريًا."];
    priorityList.replaceChildren(...priorities.map((label) => {
      const item = document.createElement("li");
      item.textContent = priorityCopy(label);
      return item;
    }));
    const mapsLink = root.querySelector("[data-result-maps]");
    mapsLink.hidden = !place.googleMapsUrl;
    if (place.googleMapsUrl) mapsLink.href = place.googleMapsUrl;
    const issue = priorities.map(priorityCopy).join(" | ");
    const message = `مرحبًا م. إسلام، أجريت فحص الملف التجاري.\nالنشاط: ${place.name || query.value.trim()}\nPlace ID: ${place.id || "غير متاح"}\nالدرجة الأولية: ${audit.score}/100\nالأولويات: ${issue}\nأرغب في مراجعة احترافية.`;
    const whatsapp = root.querySelector("[data-audit-whatsapp]");
    whatsapp.href = `https://wa.me/966579395299?text=${encodeURIComponent(message)}`;
    window.esAnalytics?.track("gbp_audit_complete", { service: "google-business-profile", placement: "audit_tool" });
    results.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function showManual(message) {
    status.textContent = message;
    status.className = "audit-status is-notice";
    manual.hidden = false;
  }

  function renderChoices(places) {
    if (places.length === 1) return renderPlace(places[0]);
    choices.hidden = false;
    choices.replaceChildren(...places.map((place) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "audit-choice";
      const strong = document.createElement("strong");
      strong.textContent = place.name;
      const span = document.createElement("span");
      span.textContent = place.address || place.category;
      button.append(strong, span);
      button.addEventListener("click", () => renderPlace(place), { once: true });
      return button;
    }));
  }

  async function runAudit() {
    const value = query.value.trim();
    if (value.length < 3) {
      status.textContent = "اكتب اسم النشاط مع المدينة، أو الصق رابط Google Maps العام.";
      status.className = "audit-status is-error";
      query.focus();
      return;
    }
    submit.disabled = true;
    results.hidden = true;
    choices.hidden = true;
    status.textContent = "جارٍ البحث في البيانات العامة وتجهيز الفحص…";
    status.className = "audit-status is-loading";
    window.esAnalytics?.track("gbp_audit_start", { service: "google-business-profile", placement: "audit_tool" });
    try {
      const response = await fetch("/api/google-place-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: value })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const messages = {
          place_not_found: "لم نعثر على تطابق واضح. أضف المدينة أو استخدم الفحص الإرشادي.",
          map_link_needs_business_name: "الرابط المختصر لم يكشف اسم النشاط. اكتب الاسم والمدينة أو استخدم الفحص الإرشادي.",
          unsupported_url: "نقبل روابط Google Maps العامة فقط.",
          rate_limited: "وصلت إلى حد الفحوصات المؤقت. جرّب لاحقًا أو استخدم الفحص الإرشادي."
        };
        showManual(messages[payload.error] || "التكامل المباشر غير متاح الآن؛ الفحص الإرشادي يعمل بالكامل داخل جهازك.");
        return;
      }
      status.textContent = payload.places.length > 1 ? "اختر النشاط الصحيح لإكمال الفحص." : "اكتمل الفحص الأولي للبيانات العامة.";
      status.className = "audit-status is-success";
      renderChoices(payload.places);
    } catch {
      showManual("تعذر الاتصال مؤقتًا؛ يمكنك إكمال الفحص الإرشادي الآن دون إرسال بيانات.");
    } finally {
      submit.disabled = false;
    }
  }

  function runManualAudit() {
    const checked = [...manual.querySelectorAll("input[type=checkbox]")].filter((input) => input.checked);
    const score = checked.reduce((sum, input) => sum + Number(input.value || 0), 0);
    const labels = [...manual.querySelectorAll("input[type=checkbox]")].filter((input) => !input.checked).map((input) => input.dataset.label);
    renderPlace({
      id: "",
      name: query.value.trim() || "فحص إرشادي",
      address: checked.some((input) => input.name === "address") ? "العنوان أو نطاق الخدمة مؤكد" : "",
      category: checked.some((input) => input.name === "category") ? "الفئة الأساسية مؤكدة" : "",
      phone: checked.some((input) => input.name === "phone") ? phone.value.trim() || "موجود" : "",
      website: checked.some((input) => input.name === "website") ? website.value.trim() || "https://example.com" : "",
      hoursAvailable: checked.some((input) => input.name === "hours"),
      rating: checked.some((input) => input.name === "reviews") ? 4 : null,
      reviewCount: checked.some((input) => input.name === "reviews") ? 5 : 0,
      photoCount: checked.some((input) => input.name === "photos") ? 3 : 0,
      googleMapsUrl: /^https:\/\//.test(query.value.trim()) ? query.value.trim() : ""
    }, { score, priorities: labels.slice(0, 3) });
  }

  submit.addEventListener("click", runAudit);
  query.addEventListener("keydown", (event) => { if (event.key === "Enter") runAudit(); });
  manualButton.addEventListener("click", runManualAudit);
  root.querySelector("[data-audit-whatsapp]")?.addEventListener("click", () => {
    if (currentPlace) window.esAnalytics?.track("gbp_audit_whatsapp", { service: "google-business-profile", placement: "audit_result" });
  });
})();
