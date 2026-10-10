const copy = (value, english) => value[english ? 1 : 0];
const number = value => String(value).padStart(2, "0");
const format = value => new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value);

export function renderCaseOpening(study, { english = false, esc, icon }, { breadcrumbs, sectionLinks }) {
  const proof = study.proof;
  const name = english ? study.englishName : study.title;
  const domain = new URL(study.liveUrl).hostname.replace(/^www\./, "");
  const metric = proof.metrics[0];
  return `<div class="case-opening"><div class="container">${breadcrumbs}
    <div class="case-opening-grid"><div class="case-opening-copy">
      <p class="story-kicker"><span class="case-edition" dir="ltr">${number(study.number)}</span>${english ? "A PROJECT, FROM IDEA TO EVIDENCE" : "مشروع، من الفكرة إلى الدليل"}</p>
      <h1>${esc(name)}</h1><p class="case-opening-focus">${esc(english ? study.englishFocus : study.focus)}</p>
      <div class="case-opening-tags"><span>${esc(english ? study.englishSector : study.sector)}</span><span>${english ? "Published project" : "مشروع منشور"}</span></div>
      <div class="case-opening-actions"><a class="button" href="#brief">${english ? "Explore the story" : "ابدأ القصة"}${icon("arrow", "button-icon")}</a><a class="case-outline-action" href="#visual-proof">${english ? "See the transformation" : "شاهد التحوّل"}${icon("layers")}</a></div>
      <a class="case-opening-author" href="${english ? "/en" : ""}/about/"><span aria-hidden="true" dir="ltr">ES</span><span><small>${english ? "DESIGN · DEVELOPMENT · MEASUREMENT" : "تصميم · تطوير · قياس"}</small><strong>${english ? "Eslam Elshikh" : "المهندس إسلام الشيخ"}</strong></span>${icon("arrow")}</a>
    </div><div class="case-opening-visual"><span class="case-visual-orbit" aria-hidden="true"></span>
      <a class="case-opening-capture" href="${proof.currentImage}" target="_blank" rel="noopener" aria-label="${english ? "Open the current project interface" : "افتح الواجهة الحالية للمشروع"}"><span class="case-window-bar"><span class="case-window-dots" aria-hidden="true"><i></i><i></i><i></i></span><span dir="ltr">${esc(domain)}</span>${icon("external")}</span><img src="${proof.currentImage}" alt="${esc(english ? `Current published interface of ${name}` : `الواجهة الحالية المنشورة لمشروع ${name}`)}" width="${proof.currentWidth}" height="${proof.currentHeight}" loading="eager" decoding="async" fetchpriority="high"><span class="case-capture-stamp">${icon("check")}${english ? "Actual website capture · 10 October 2026" : "صورة فعلية من الموقع · 10 أكتوبر 2026"}</span></a>
      <a class="case-opening-signal" href="#results"><span class="case-signal-icon">${icon("layers")}</span><span><small>${english ? "FROM THE DATED REPORT" : "من التقرير الموثق"}</small><strong>${esc(copy(metric.label, english))} <bdi dir="ltr">${format(metric.before)} → ${format(metric.after)}</bdi></strong><span>${proof.days} ${english ? "complete days in each period" : "يومًا مكتملًا لكل فترة"}</span></span>${icon("arrow")}</a>
    </div></div>
    <div class="case-opening-paths"><a href="#solution"><span dir="ltr">01</span><span><small>${english ? "THE BUILD" : "ما تم تنفيذه"}</small><strong>${english ? "Explore the solution" : "اكتشف الحل"}</strong></span>${icon("arrow")}</a><a href="#results"><span dir="ltr">02</span><span><small>${english ? "THE EVIDENCE" : "ما تقوله الأرقام"}</small><strong>${english ? "Review the performance" : "راجع الأداء"}</strong></span>${icon("arrow")}</a><a href="${english ? "/en" : ""}/products/${study.productSlug}/"><span dir="ltr">03</span><span><small>${english ? "THE WORKFLOW" : "من الموقع إلى الإدارة"}</small><strong>${english ? "Take the product tour" : "استكشف النظام"}</strong></span>${icon("arrow")}</a></div>
  </div></div>
  <nav class="case-index case-story-nav" aria-label="${english ? "Case study sections" : "أقسام دراسة الحالة"}"><div class="container"><div class="case-section-links">${sectionLinks.map(([id, label], index) => `<a href="#${id}" data-case-section="${id}"><span aria-hidden="true" dir="ltr">${number(index + 1)}</span>${esc(label)}</a>`).join("")}</div><a class="case-index-all" href="${english ? "/en" : ""}/projects/">${english ? "All work" : "كل الأعمال"}${icon("arrow")}</a><div class="case-section-picker" hidden><label for="case-section-select">${english ? "Jump to" : "انتقل إلى"}</label><select id="case-section-select">${sectionLinks.map(([id, label], index) => `<option value="${id}">${number(index + 1)} · ${esc(label)}</option>`).join("")}</select><span class="case-step-count" aria-hidden="true" dir="ltr">01 / ${number(sectionLinks.length)}</span></div></div><progress class="case-reading-progress" value="0" max="${sectionLinks.length}" aria-label="${english ? "Case study reading progress" : "تقدم قراءة دراسة الحالة"}"></progress></nav>`;
}

export function renderCaseCompanion(companion, { english = false, esc, icon }) {
  if (!companion?.proof) return "";
  const name = english ? companion.englishName : companion.title;
  const href = `${english ? "/en" : ""}/projects/${companion.slug}/`;
  return `<aside class="case-companion"><div><p class="story-kicker">${english ? "ANOTHER PROJECT. ANOTHER PERSPECTIVE." : "مشروع آخر. زاوية مختلفة."}</p><h2>${english ? "Continue exploring." : "كمّل الرحلة."}</h2><p>${english ? "Explore the approach, the real interface and the dated results of another project." : "اكتشف الفكرة والواجهة الحقيقية والنتائج الموثقة في مشروع آخر."}</p></div><a href="${href}"><img src="${companion.proof.currentImage}" alt="" width="${companion.proof.currentWidth}" height="${companion.proof.currentHeight}" loading="lazy" decoding="async"><span><small>${esc(english ? companion.englishSector : companion.sector)}</small><strong>${esc(name)}</strong><span>${english ? "Explore the case study" : "ادخل دراسة المشروع"}</span></span>${icon("arrow")}</a></aside>`;
}
