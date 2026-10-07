import { caseByUrl, caseHref, productHref } from "./case-studies.mjs";
import { latestWork, latestWorkByUrl, latestWorkReviewedAt, reviewedText } from "./latest-work.mjs";
import { accountProfiles, accountReviewByCid, accountReviewSummary, accountStateLabel } from "./account-review.mjs";
import { mapsProjects } from "./google-maps-work.mjs";
import { projectAudit } from "./web-projects.mjs";
import { products } from "./products.mjs";

const dateLabel = en => en ? "7 October 2026" : "7 أكتوبر 2026";
const prefix = en => en ? "/en" : "";
const external = (url, label, { esc, icon }) => `<a class="evidence-link" href="${esc(url)}" target="_blank" rel="noopener">${esc(label)}${icon("external")}</a>`;

function workLinks(item, options) {
  const { english = false, esc, icon } = options;
  const study = caseByUrl.get(item.liveUrl);
  return `<div class="evidence-actions"><a class="evidence-link evidence-link-primary" href="${caseHref(study, english)}">${english ? "Project case study" : "دراسة المشروع"}${icon("arrow")}</a>${item.productSlug ? `<a class="evidence-link" href="${productHref(item.productSlug, english)}">${english ? "System experience" : "تجربة النظام"}${icon("layers")}</a>` : ""}${item.links.map(link => external(link.url, reviewedText(link.label, english), options)).join("")}${item.cid ? external(`https://maps.google.com/maps?cid=${item.cid}`, english ? "Google profile" : "الملف على Google", options) : ""}</div>`;
}

function recentCard(item, options, compact = false) {
  const { english = false, esc } = options;
  const t = value => reviewedText(value, english);
  const study = caseByUrl.get(item.liveUrl);
  const profile = accountReviewByCid.get(item.cid);
  return `<article class="evidence-work-card reveal${compact ? " evidence-work-compact" : ""}" data-reviewed-work="${item.slug}"><a class="evidence-work-image" href="${caseHref(study, english)}"><img src="${item.image}" alt="${esc(english ? `Reviewed interface of ${t(item.title)}` : `واجهة مشروع ${t(item.title)}`)}" width="1348" height="926" loading="lazy" decoding="async"><span>${esc(t(item.category))}</span></a><div class="evidence-work-copy"><p class="evidence-date">${english ? "Reviewed" : "مراجعة"} <time datetime="${latestWorkReviewedAt}">${dateLabel(english)}</time></p><h3><a href="${caseHref(study, english)}">${esc(t(item.title))}</a></h3><p>${esc(t(item.summary))}</p>${profile ? `<span class="evidence-status evidence-status-${profile.state}">${esc(accountStateLabel(profile.state, english))}</span>` : ""}${compact ? "" : `<h4>${english ? "What I delivered" : "ما نفذته في المشروع"}</h4><ul class="evidence-deliverables">${item.delivered.map(value => `<li>${esc(t(value))}</li>`).join("")}</ul>${item.note ? `<p class="evidence-context">${esc(t(item.note))}</p>` : ""}`}${workLinks(item, options)}</div></article>`;
}

// Every preview uses an existing capture; operating-system tours identify their demo data.
const previewSources = {
  "kermez-cafe": [
    ["/assets/projects/kermez-home-20261007.webp", "الموقع", "Website", "واجهة الموقع العام", "Public website interface"],
    ["/assets/projects/kermez-menu-20261007.webp", "المنيو", "Menu", "المنيو المنشور · أصناف وتصنيفات وبحث", "Published menu · items, categories and search"],
    ["/assets/products/kermez-overview-20261007.webp", "نظام التشغيل", "Operations", "جولة نظام التشغيل · بيانات عرض توضيحية", "Operations walkthrough · demonstration data"]
  ],
  "dahanat-alya-riyadh": [
    ["/assets/projects/alya-home-20261007.webp", "الموقع", "Website", "واجهة موقع دهانات عليا العام", "Alya's public website interface"],
    ["/assets/projects/alya-catalog-20261007.webp", "الكتالوج", "Catalog", "كتالوج المنتجات المنشور · لوحة الإدارة خاصة بالفريق", "Published product catalog · administration is private to the team"]
  ],
  "sama-scan": [
    ["/assets/projects/sama-scan.webp", "الموقع", "Website", "واجهة موقع المركز العام", "The center's public website interface"],
    ["/assets/products/sama-overview.webp", "مركز القيادة", "Control center", "جولة الإدارة · بيانات عرض توضيحية", "Administration walkthrough · demonstration data"]
  ],
  "tawod-contracting": [
    ["/assets/projects/tawod.webp", "الموقع", "Website", "واجهة موقع الشركة العام", "The company's public website interface"],
    ["/assets/products/tawod-overview.webp", "مركز القيادة", "Control center", "جولة الإدارة · بيانات عرض توضيحية", "Administration walkthrough · demonstration data"]
  ]
};

function workDossier(item, index, options) {
  const { english = false, esc, icon } = options;
  const t = value => reviewedText(value, english);
  const study = caseByUrl.get(item.liveUrl);
  const profile = accountReviewByCid.get(item.cid);
  const views = previewSources[item.slug] || [[item.image, "الواجهة", "Interface", "واجهة الدليل المحلي", "Local directory interface"]];
  const viewLabel = view => view[english ? 2 : 1];
  const viewCaption = view => view[english ? 4 : 3];
  const viewAlt = view => `${t(item.title)} · ${viewCaption(view)}`;
  const number = String(index + 1).padStart(2, "0");
  return `<article class="evidence-dossier evidence-dossier-${item.slug}" id="work-${item.slug}" data-evidence-section data-reviewed-work="${item.slug}" aria-labelledby="title-${item.slug}">
    <div class="evidence-dossier-visual reveal" data-evidence-gallery>
      <div class="evidence-project-label"><span dir="ltr">${number} / ${String(latestWork.length).padStart(2, "0")}</span><span>${esc(t(item.category))}</span></div>
      <figure class="evidence-preview"><a href="${caseHref(study, english)}" aria-label="${esc(english ? `Explore ${t(item.title)} case study` : `استعرض دراسة مشروع ${t(item.title)}`)}"><div class="evidence-browser-bar" aria-hidden="true"><i></i><i></i><i></i><span>${esc(new URL(item.liveUrl).hostname)}</span>${icon("external")}</div><img data-evidence-preview src="${views[0][0]}" alt="${esc(viewAlt(views[0]))}" width="1348" height="926" loading="lazy" decoding="async"></a><figcaption data-evidence-caption aria-live="polite">${esc(viewCaption(views[0]))}</figcaption></figure>
      ${views.length > 1 ? `<div class="evidence-preview-switches" role="group" aria-label="${esc(english ? `${t(item.title)} interface previews` : `معاينات واجهات ${t(item.title)}`)}" data-evidence-switches hidden>${views.map((view, position) => `<button type="button" aria-pressed="${position === 0}" data-evidence-image="${view[0]}" data-evidence-alt="${esc(viewAlt(view))}" data-evidence-caption-text="${esc(viewCaption(view))}"><span dir="ltr">0${position + 1}</span>${esc(viewLabel(view))}</button>`).join("")}</div>` : ""}
      <a class="evidence-visual-link" href="${caseHref(study, english)}">${english ? "Explore the full project story" : "اكتشف قصة المشروع كاملة"}${icon("arrow")}</a>
    </div>
    <div class="evidence-dossier-copy reveal"><p class="evidence-date">${english ? "DELIVERY RECORD" : "سجل التنفيذ"}<span aria-hidden="true">/</span><time datetime="${latestWorkReviewedAt}">${dateLabel(english)}</time></p><h3 id="title-${item.slug}"><a href="${caseHref(study, english)}">${esc(t(item.title))}</a></h3><p class="evidence-dossier-summary">${esc(t(item.summary))}</p>${profile ? `<span class="evidence-status evidence-status-${profile.state}">${icon("check")}${esc(accountStateLabel(profile.state, english))}</span>` : ""}<h4>${english ? "What I delivered" : "ما نفذته في المشروع"}</h4><ul class="evidence-deliverables">${item.delivered.map(value => `<li>${esc(t(value))}</li>`).join("")}</ul>${item.note ? `<p class="evidence-context">${esc(t(item.note))}</p>` : ""}${workLinks(item, options)}</div>
  </article>`;
}

function evidenceNavigation(options) {
  const { english = false, esc, icon } = options;
  const shortNames = english ? ["Kermez", "Alya", "Sama", "Tawod", "Naqada"] : ["كرمز", "عليا", "سما", "تعاود", "نقادة"];
  return `<nav class="evidence-navigation" aria-label="${english ? "Explore the evidence record" : "تنقل بين الأعمال والأدلة"}" data-evidence-nav><div class="container"><span class="evidence-nav-label">${icon("layers")}${english ? "EXPLORE" : "استكشف"}</span><div class="evidence-nav-links">${latestWork.map((item, index) => `<a href="#work-${item.slug}" data-evidence-nav-link><span dir="ltr">0${index + 1}</span>${esc(shortNames[index])}</a>`).join("")}<a href="#profile-review" data-evidence-nav-link>${icon("pin")}${english ? "Profiles" : "الملفات"}</a><a href="#evidence-method" data-evidence-nav-link>${english ? "The evidence" : "التوثيق"}</a></div></div><div class="evidence-scroll-progress" aria-hidden="true" data-evidence-progress></div></nav>`;
}

export function renderRecentWork(options = {}) {
  const { english = false, icon } = options;
  return `<section class="section-pad evidence-recent" id="latest-work"><div class="container"><div class="evidence-heading"><div><p class="story-kicker">${english ? "LATEST WORK / REVIEWED" : "أحدث الأعمال / مراجعة موثقة"}</p><h2>${english ? "The work evolves.<br>The record keeps up." : "الأعمال تتطور.<br>وسجلها يتجدد."}</h2></div><div><p>${english ? "Explore the latest websites and operating systems, with a clear account of my delivery and direct links to the result." : "استعرض أحدث المواقع والأنظمة التي عملت عليها، مع نطاق التنفيذ وروابط مباشرة للنتيجة التي يمكنك مراجعتها."}</p><a class="evidence-link" href="${prefix(english)}/work-evidence/">${english ? "Explore the evidence record" : "استعرض سجل الأعمال وأدلتها"}${icon("arrow")}</a></div></div><div class="evidence-recent-grid">${latestWork.slice(0, 3).map(item => recentCard(item, options, true)).join("")}</div></div></section>`;
}

export function renderAccountReview(options = {}, expanded = false) {
  const { english = false, esc, icon } = options;
  const s = accountReviewSummary;
  const directoryTools = options.interactive ? `<div class="evidence-directory-tools" data-evidence-directory hidden><label class="evidence-directory-search"><span>${english ? "Search business profiles" : "ابحث في الملفات التجارية"}</span><div>${icon("search")}<input type="search" maxlength="100" autocomplete="off" placeholder="${english ? "Search by business name…" : "اسم النشاط الذي تبحث عنه…"}" data-evidence-search></div></label><div class="evidence-directory-filters" role="group" aria-label="${english ? "Filter by profile state" : "تصفية حسب حالة الملف"}"><button type="button" data-evidence-filter="all" aria-pressed="true">${english ? "All" : "الكل"}<span>${s.clientProfiles}</span></button><button type="button" data-evidence-filter="verified" aria-pressed="false">${english ? "Verified" : "مثبتة"}<span>${s.verifiedClientProfiles}</span></button><button type="button" data-evidence-filter="ongoing" aria-pressed="false">${english ? "In progress" : "قيد المتابعة"}<span>${s.ongoingClientProfiles}</span></button></div><p class="evidence-directory-result" data-evidence-result role="status" aria-live="polite"></p></div>` : "";
  const rows = accountProfiles.map(item => {
    const sample = mapsProjects.find(map => map.cid === item.cid);
    const study = sample?.website ? caseByUrl.get(sample.website) : null;
    return `<tr data-profile-review="${item.state}"><th scope="row"${english ? ' lang="ar" dir="rtl"' : ""}>${esc(item.title)}</th><td><span class="evidence-status evidence-status-${item.state}">${esc(accountStateLabel(item.state, english))}</span></td><td>${item.state === "verified" && item.publicUrl ? external(item.publicUrl, "Google Maps", options) : `<span class="evidence-row-note">${english ? "Ongoing profile work" : "ملف قيد المتابعة"}</span>`}${study ? `<a class="evidence-link" href="${caseHref(study, english)}">${english ? "Website case study" : "دراسة الموقع"}${icon("arrow")}</a>` : ""}</td></tr>`;
  }).join("");
  return `<section class="section-pad evidence-account" id="profile-review" data-evidence-section><div class="container"><div class="evidence-heading"><div><p class="story-kicker">${english ? "GOOGLE BUSINESS PROFILES / DATED REVIEW" : "الملفات التجارية / مراجعة بتاريخ محدد"}</p><h2>${english ? "The current picture,<br>profile by profile." : "الصورة الحالية،<br>ملفًا بملف."}</h2></div><p>${english ? `On ${dateLabel(true)}, I reviewed ${s.reviewedProfiles} profiles in the signed-in Business Profile manager: ${s.clientProfiles} business profiles and my own profile. The table records each business's displayed state.` : `في ${dateLabel(false)} راجعت ${s.reviewedProfiles} ملفًا من داخل لوحة الملفات التجارية: ${s.clientProfiles} ملفًا لأنشطة العملاء، إضافة إلى ملفي الشخصي. يوضح السجل حالة كل نشاط كما ظهرت وقت المراجعة.`}</p></div><dl class="evidence-account-counts reveal"><div><dt>${english ? "Business profiles reviewed" : "ملفات أنشطة رُوجعت"}</dt><dd>${s.clientProfiles}</dd></div><div><dt>${english ? "Verified at this review" : "مثبتة وقت هذه المراجعة"}</dt><dd>${s.verifiedClientProfiles}</dd></div><div><dt>${english ? "Work in progress" : "ملفات قيد المتابعة"}</dt><dd>${s.ongoingClientProfiles}</dd></div></dl><details class="evidence-account-details"${expanded ? " open" : ""}><summary>${english ? "View all reviewed business profiles" : "استعرض جميع الملفات التي تمت مراجعتها"}<span>${s.clientProfiles}</span>${icon("chevron")}</summary>${directoryTools}<div class="evidence-table-wrap"><table class="evidence-profile-table"><caption>${english ? `Business Profile state on ${dateLabel(true)}` : `حالة الملفات التجارية في ${dateLabel(false)}`}</caption><thead><tr><th scope="col">${english ? "Business" : "النشاط"}</th><th scope="col">${english ? "State at review" : "الحالة وقت المراجعة"}</th><th scope="col">${english ? "Reviewable evidence" : "أدلة متاحة للمراجعة"}</th></tr></thead><tbody>${rows}${options.interactive ? `<tr data-evidence-empty hidden><td colspan="3">${english ? "No matching profiles. Try another business name or state." : "لم نعثر على ملفات مطابقة. جرّب اسمًا آخر أو غيّر الحالة."}</td></tr>` : ""}</tbody></table></div></details><p class="evidence-context">${english ? "This records the profiles I currently follow. My implementation scope is explained in the related case studies. An in-progress file remains in progress; profile state can change after the review date. My own listing is excluded from the client counts." : "هذا سجل للملفات التي أتابعها حاليًا. نطاق التنفيذ موضح في دراسات الأعمال المرتبطة، والملفات الجاري العمل عليها تُعرض بحالتها الحالية. قد تتغير الحالة بعد تاريخ المراجعة، وملفي الشخصي غير محسوب ضمن أعداد العملاء."}</p></div></section>`;
}

export function renderWorkEvidence(options) {
  const { english = false, esc, icon } = options;
  return `<div class="evidence-page" data-work-evidence>
    <section class="evidence-hero" id="evidence-intro"><div class="container">
      <nav class="breadcrumbs" aria-label="${english ? "Breadcrumb" : "مسار التنقل"}"><a href="${prefix(english)}/">${english ? "Home" : "الرئيسية"}</a><span>/</span><a href="${prefix(english)}/projects/">${english ? "Work" : "الأعمال"}</a><span>/</span><span aria-current="page">${english ? "Evidence" : "الأدلة"}</span></nav>
      <div class="evidence-hero-grid">
        <div class="evidence-hero-copy"><p class="evidence-eyebrow"><span aria-hidden="true"></span>${english ? "DIGITAL CRAFT / REAL DELIVERY" : "هندسة رقمية / أعمال يمكنك مراجعتها"}</p><h1>${english ? "The work.<br><em>With its evidence.</em>" : "الأعمال،<br><em>بأدلتها.</em>"}</h1><p class="evidence-hero-lead">${english ? "From the first interface to everyday operations. Explore what I built, how its parts connect, and inspect the result for yourself." : "من أول واجهة إلى تفاصيل التشغيل. استكشف ما بنيته، وكيف ترتبط أجزاؤه، وراجع النتيجة بنفسك."}</p><div class="evidence-actions"><a class="button" href="#work-kermez-cafe">${english ? "Explore the work" : "ابدأ رحلة الأعمال"}${icon("arrow")}</a><a class="evidence-hero-secondary" href="#profile-review">${icon("pin")}${english ? "Business Profile record" : "سجل الملفات التجارية"}</a></div><p class="evidence-hero-signature"><span dir="ltr">ESLAM ELSHIKH</span><span>${english ? "Web · Systems · Local presence" : "مواقع · أنظمة · حضور محلي"}</span></p></div>
        <div class="evidence-hero-stage" data-evidence-stage>
          <div class="evidence-stage-grid" aria-hidden="true"></div><span class="evidence-stage-orbit" aria-hidden="true"></span>
          <a class="evidence-stage-main" href="#work-kermez-cafe"><span class="evidence-stage-bar"><i aria-hidden="true"></i><span dir="ltr">KERMEZ / WEB EXPERIENCE</span>${icon("external")}</span><img src="/assets/projects/kermez-home-20261007.webp" alt="${english ? "Actual Kermez Cafe website interface" : "واجهة موقع كرمز كافيه الفعلية"}" width="1348" height="926" loading="eager" fetchpriority="high" decoding="async"></a>
          <a class="evidence-stage-secondary" href="#work-dahanat-alya-riyadh"><img src="/assets/projects/alya-home-20261007.webp" alt="${english ? "Actual Alya Paints website interface" : "واجهة موقع دهانات عليا الفعلية"}" width="1348" height="926" loading="eager" decoding="async"><span dir="ltr">ALYA / BRAND & CATALOG ${icon("arrow")}</span></a>
          <div class="evidence-stage-seal">${icon("code")}<div><strong>${english ? "Built. Connected. Documented." : "بناء. ربط. توثيق."}</strong><span>${english ? "Actual interfaces, direct evidence" : "واجهات فعلية وأدلة مباشرة"}</span></div></div>
          <p class="evidence-stage-caption">${english ? "A glimpse of two recent deliveries" : "لمحة من أحدث أعمال كرمز وعليا"}</p>
        </div>
      </div>
      <div class="evidence-metrics"><div class="evidence-metrics-intro"><span>${english ? "THE WIDER RECORD" : "سجل الأعمال الأوسع"}</span><p>${english ? "Different scopes.<br>One reviewable record." : "نطاقات متنوعة.<br>وسجل يمكنك مراجعته."}</p></div><dl><div><dt>${english ? "Web project case studies" : "دراسة لمشروعات الويب"}</dt><dd>${projectAudit.listedProjects}</dd></div><div><dt>${english ? "Public Maps examples" : "نموذجًا في معرض الخرائط"}</dt><dd>${mapsProjects.length}</dd></div><div><dt>${english ? "System experiences" : "جولات منتجات مستقلة"}</dt><dd>${products.length}</dd></div></dl><p class="evidence-metrics-date">${icon("clock")}<span>${english ? "Latest review" : "أحدث مراجعة"}<time datetime="${latestWorkReviewedAt}">${dateLabel(english)}</time></span></p></div>
    </div></section>
    ${evidenceNavigation(options)}
    <section class="section-pad evidence-projects" id="reviewed-projects"><div class="container"><div class="evidence-heading reveal"><div><p class="story-kicker">${english ? "SELECTED RECENT DELIVERIES" : "أحدث الأعمال والتطويرات"}</p><h2>${english ? "Every project,<br>a connected story." : "كل مشروع،<br>حكاية متكاملة."}</h2></div><p>${english ? "Explore the interface, understand the delivery and follow the evidence. Each project has its own identity and a clearly described scope." : "تصفّح الواجهة، وافهم نطاق التنفيذ، ثم افتح الدليل. لكل مشروع هويته، وتفاصيله، وروابط تتيح مراجعته."}</p></div><div class="evidence-dossiers">${latestWork.map((item, index) => workDossier(item, index, options)).join("")}</div></div></section>
    ${renderAccountReview({ ...options, interactive: true }, false)}
    <section class="section-pad evidence-method" id="evidence-method" data-evidence-section><div class="container"><div class="reveal"><p class="story-kicker">${english ? "THE EVIDENCE BEHIND THE WORK" : "الدليل وراء كل عمل"}</p><h2>${english ? "See the output.<br>Understand the scope." : "شاهد المخرجات.<br>وافهم نطاق العمل."}</h2><a class="evidence-link" href="${prefix(english)}/projects/">${english ? "Explore the wider portfolio" : "استعرض معرض الأعمال كاملًا"}${icon("arrow")}</a></div><ol><li class="reveal"><strong>${english ? "Actual interfaces" : "واجهات فعلية"}</strong><p>${english ? "Kermez and Alya screenshots were captured from their public websites during this review. Product tours identify demonstration data and interactive concepts." : "صور كرمز وعليا مأخوذة من النسخ العامة أثناء هذه المراجعة. تُوضح جولات الأنظمة بيانات العرض، وتُعرّف التصورات التفاعلية بمرحلتها."}</p></li><li class="reveal"><strong>${english ? "Direct evidence" : "روابط مباشرة"}</strong><p>${english ? "Case studies link to a live website, a product walkthrough or an identified archived version. Profile examples have their own public links." : "ترتبط دراسة العمل بالموقع الحي أو تجربة النظام أو نسخة محفوظة موضحة. ولكل نموذج خرائط رابطه العام المستقل."}</p></li><li class="reveal"><strong>${english ? "Dated status" : "حالة بتاريخها"}</strong><p>${english ? "A current account review complements the wider Maps collection. It describes state and delivery without turning them into revenue or ranking claims." : "تكمل مراجعة الحساب الحالية معرض الخرائط الأوسع. توثق الحالة ونطاق التنفيذ، وتترك نتائج الترتيب والعائد لتقارير القياس الخاصة بكل مشروع."}</p></li></ol></div></section>
    <section class="section-pad evidence-close"><div class="container"><div class="evidence-close-panel reveal"><span class="evidence-close-orbit" aria-hidden="true"></span><p class="story-kicker">${english ? "YOUR NEXT PROJECT" : "مشروعك القادم"}</p><h2>${english ? "Your business.<br>A new story to build." : "نشاطك،<br>وحكاية جديدة نبنيها."}</h2><p>${english ? "Start with the business, the work it needs and the evidence you want to measure." : "نبدأ من طبيعة النشاط، والعمل الذي يحتاجه، والنتيجة التي تريد قياسها."}</p><a class="button" href="${prefix(english)}/contact/">${english ? "Discuss your project" : "ناقش مشروعك"}${icon("arrow")}</a></div></div></section>
  </div>`;
}

export function renderReviewedCaseEvidence(study, options) {
  const item = latestWorkByUrl.get(study.liveUrl);
  if (!item) return "";
  const { english = false, esc } = options;
  return `<section class="evidence-case-update" id="latest-delivery"><div><p class="story-kicker">${english ? "LATEST DELIVERY REVIEW" : "مراجعة أحدث نطاق منفذ"}</p><h2>${english ? "The current scope, with direct evidence." : "نطاق العمل الحالي، بأدلته المباشرة."}</h2><p class="evidence-date"><time datetime="${latestWorkReviewedAt}">${dateLabel(english)}</time></p></div><div><ul class="evidence-deliverables">${item.delivered.map(value => `<li>${esc(reviewedText(value, english))}</li>`).join("")}</ul>${workLinks(item, options)}${item.note ? `<p class="evidence-context">${esc(reviewedText(item.note, english))}</p>` : ""}</div></section>`;
}
