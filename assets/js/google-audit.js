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
  const manual = root.querySelector("[data-manual-audit]");
  const manualButton = root.querySelector("[data-manual-calculate]");
  const editButton = root.querySelector("[data-manual-edit]");
  let currentAudit = null;

  const text = (selector, value) => {
    const element = root.querySelector(selector);
    if (element) element.textContent = value;
  };

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

  function renderAudit(audit) {
    currentAudit = audit;
    results.hidden = false;
    manual.hidden = true;
    text("[data-score]", String(audit.score));
    text("[data-score-label]", audit.score >= 80 ? "أساس قوي بحسب إجاباتك" : audit.score >= 60 ? "أساس جيد يحتاج مراجعة" : "مؤشرات تحتاج تأكيدًا أو تحسينًا");
    text("[data-result-name]", audit.mapsUrl ? "فحصك الذاتي للملف التجاري" : query.value.trim());
    text("[data-result-meta]", "النتيجة من اختياراتك فقط؛ لم تُجلب بيانات من Google. عدم التأكيد لا يثبت وجود خطأ في الملف.");
    text("[data-result-rating]", audit.reviewsConfirmed ? "أكدت تحقق معيار المراجعات. الأداة لا تعرف متوسط التقييم أو عدد المراجعات الفعلي." : "معيار المراجعات غير مؤكد. الأداة لم تتحقق من التقييمات أو عددها.");
    const references = [website.value.trim(), phone.value.trim()].filter(Boolean);
    text("[data-result-reference]", references.length ? `بياناتك المرجعية: ${references.join(" · ")}. قارنها بنفسك بما يظهر في الملف؛ لم تُفحص المطابقة تلقائيًا.` : "مطابقة الهاتف والموقع تُراجع يدويًا من الملف العام.");
    const checksList = root.querySelector("[data-audit-checks]");
    checksList.replaceChildren(...audit.checks.map(({ confirmed, label }) => {
      const item = document.createElement("li");
      item.className = confirmed ? "is-pass" : "is-gap";
      item.textContent = `${confirmed ? "✓ أكدت:" : "غير مؤكد:"} ${label}`;
      return item;
    }));
    const priorityList = root.querySelector("[data-audit-priorities]");
    const priorities = audit.priorities.length ? audit.priorities : ["أكدت المؤشرات الثمانية. حافظ على البيانات محدثة، وقِس الاستفسارات الفعلية؛ اكتمال القائمة لا يضمن الترتيب أو الأهلية."];
    priorityList.replaceChildren(...priorities.map((label) => {
      const item = document.createElement("li");
      item.textContent = priorityCopy(label);
      return item;
    }));
    const mapsLink = root.querySelector("[data-result-maps]");
    mapsLink.hidden = !audit.mapsUrl;
    if (audit.mapsUrl) mapsLink.href = audit.mapsUrl;
    else mapsLink.removeAttribute("href");
    const issue = priorities.map(priorityCopy).join(" | ");
    const message = `مرحبًا م. إسلام، أجريت الفحص الذاتي لملف Google التجاري.\nالاسم أو الرابط: ${query.value.trim()}\nالدرجة من إجاباتي: ${audit.score}/100\nالأولويات: ${issue}\nلم تُجلب بيانات من Google أو تُفحص المطابقة تلقائيًا.\nأرغب في مراجعة احترافية.`;
    const whatsapp = root.querySelector("[data-audit-whatsapp]");
    whatsapp.href = `https://wa.me/966579395299?text=${encodeURIComponent(message)}`;
    window.esAnalytics?.track("gbp_audit_complete", { service: "google-business-profile", placement: "audit_tool" });
    results.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function isGoogleMapsUrl(value) {
    try {
      const host = new URL(value).hostname.toLowerCase();
      const url = new URL(value);
      if (url.protocol !== "https:") return false;
      return host === "maps.app.goo.gl" || (host === "goo.gl" && url.pathname.startsWith("/maps")) || host === "maps.google.com" || ((host === "www.google.com" || host === "google.com") && url.pathname.startsWith("/maps"));
    } catch {
      return false;
    }
  }

  function runAudit() {
    const value = query.value.trim();
    if (value.length < 3) {
      status.textContent = "اكتب اسم النشاط مع المدينة، أو الصق رابط Google Maps العام.";
      status.className = "audit-status is-error";
      query.focus();
      return;
    }
    results.hidden = true;
    manual.hidden = false;
    currentAudit = null;
    status.textContent = "الفحص جاهز. راجع المؤشرات الظاهرة كما تراها في ملفك العام، ثم احسب النتيجة.";
    status.className = "audit-status is-success";
    window.esAnalytics?.track("gbp_audit_start", { service: "google-business-profile", placement: "audit_tool" });
    manual.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function runManualAudit() {
    if (query.value.trim().length < 3) { runAudit(); return; }
    const checks = [...manual.querySelectorAll("input[type=checkbox]")].map((input) => ({
      confirmed: input.checked,
      weight: Number(input.value),
      label: input.dataset.confirmation,
      priority: input.dataset.label,
      name: input.name
    }));
    const score = checks.reduce((sum, check) => sum + (check.confirmed ? check.weight : 0), 0);
    const priorities = checks.filter(check => !check.confirmed).sort((a, b) => b.weight - a.weight).slice(0, 3).map(check => check.priority);
    const rawQuery = query.value.trim();
    const mapsUrl = isGoogleMapsUrl(rawQuery) ? rawQuery : "";
    renderAudit({ score, checks, priorities, mapsUrl, reviewsConfirmed: checks.some(check => check.name === "reviews" && check.confirmed) });
  }

  submit.addEventListener("click", runAudit);
  query.addEventListener("keydown", (event) => { if (event.key === "Enter") runAudit(); });
  manualButton.addEventListener("click", runManualAudit);
  editButton?.addEventListener("click", runAudit);
  root.querySelector("[data-audit-whatsapp]")?.addEventListener("click", () => {
    if (currentAudit) window.esAnalytics?.track("gbp_audit_whatsapp", { service: "google-business-profile", placement: "audit_result" });
  });
})();
