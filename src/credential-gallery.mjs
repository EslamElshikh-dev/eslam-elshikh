import { renderGooglePartnerBadge } from "./google-partner.mjs";

const communities = [
  ["pin", "Google Maps Platform Innovators"],
  ["cloud", "Google Cloud Innovator"],
  ["code", "Firebase Studio Developer Community"]
];

function renderShowcase(items, { english, esc, icon }) {
  const t = (ar, en) => english ? en : ar;
  const slides = items.map((item, index) => {
    const art = item.artwork;
    return `<figure class="folio-slide" data-slide data-subject="${esc(item.subject[english ? 1 : 0])}"${index ? " hidden" : ""}>
      <a class="folio-frame" href="${esc(art.src)}" data-enlarge="${esc(item.id)}" aria-label="${esc(t("تكبير", "Enlarge") + " " + item.name)}">
        <span class="folio-mount"><img src="${esc(art.src)}" width="${art.width}" height="${art.height}"
          alt="${esc(item.name + ' — ' + item.issuer.name)}" ${index ? 'loading="lazy"' : 'fetchpriority="high"'} decoding="async"></span>
      </a>
    </figure>`;
  }).join("");
  const first = items[0];
  return `<div class="folio-showcase" role="region" aria-label="${t("معرض صور الشهادات", "Certificate gallery")}">
    <div class="folio-stage"><div class="folio-slides">${slides}</div></div>
    <div class="folio-caption">
      <div class="folio-caption-text" role="status" aria-live="polite" aria-atomic="true">
        <span class="folio-counter" dir="ltr"><span data-position>1</span> / ${items.length}</span>
        <strong data-subject-label>${esc(first.subject[english ? 1 : 0])}</strong>
      </div>
      <div class="folio-tools">
        <a class="folio-zoom" data-current-zoom data-enlarge="${esc(first.id)}" href="${esc(first.artwork.src)}" aria-label="${t("تكبير الشهادة المعروضة", "Enlarge the displayed certificate")}">${icon("search")}<span>${t("تكبير", "Enlarge")}</span></a>
        <div class="folio-controls" data-controls hidden>
        <button type="button" data-step="-1" aria-label="${t("الشهادة السابقة", "Previous certificate")}">${icon("chevron")}</button>
        <button type="button" data-step="1" aria-label="${t("الشهادة التالية", "Next certificate")}">${icon("chevron")}</button>
      </div>
      </div>
    </div>
  </div>`;
}

function renderRecord(item, { english, site, esc, icon }, formatter) {
  const t = (ar, en) => english ? en : ar;
  const time = value => `<time datetime="${esc(value)}">${esc(formatter.format(new Date(value + "T12:00:00Z")))}</time>`;
  const evidence = `data-identity-event="credential_open" data-identity-item="${esc(item.id)}"`;
  const art = item.artwork;
  return `<article class="id-credential">
    <div class="folio-record" data-record="${esc(item.id)}">
      <a class="folio-thumb" href="${esc(art.src)}" data-enlarge="${esc(item.id)}" aria-label="${esc(t("تكبير", "Enlarge") + " " + item.name)}">
        <img src="${esc(art.src)}" width="${art.width}" height="${art.height}" alt="" loading="lazy" decoding="async">
      </a>
      <div class="folio-record-copy">
        <span class="folio-issuer" lang="en" dir="ltr">${esc(item.issuer.name)}</span>
        <h3><bdi lang="en" dir="ltr">${esc(item.name)}</bdi></h3>
        <p>${esc(item.scope[english ? 1 : 0])}</p>
      </div>
      <div class="folio-record-links">
        <a class="folio-verify" data-verify href="${esc(item.url)}" target="_blank" rel="noopener noreferrer" ${evidence}>${t("تحقّق من الشهادة", "Verify credential")}${icon("external")}</a>
        ${item.pdfUrl ? `<a class="folio-pdf" href="${esc(item.pdfUrl)}" target="_blank" rel="noopener noreferrer" ${evidence}>${t("نسخة PDF", "View PDF")}</a>` : ""}
      </div>
      <details class="folio-details">
        <summary>${t("تفاصيل الشهادة", "Credential details")}${icon("chevron")}</summary>
        <dl>
          <div><dt>${t("الاسم على الشهادة", "Certificate holder")}</dt><dd><bdi lang="en">${esc(site.nameEn)}</bdi></dd></div>
          <div><dt>${t("رقم الشهادة", "Credential ID")}</dt><dd><bdi dir="ltr">${esc(item.id)}</bdi></dd></div>
          <div><dt>${item.issued ? t("تاريخ الإصدار", "Issued") : t("تأكيد اجتياز الاختبار", "Exam pass confirmed")}</dt><dd>${time(item.issued ?? item.passConfirmed)}</dd></div>
          <div><dt>${t("تاريخ الانتهاء", "Expires")}</dt><dd>${time(item.expires)}</dd></div>
          <div><dt>${t("آخر مراجعة للسجل", "Record reviewed")}</dt><dd>${time(item.reviewed)}</dd></div>
        </dl>
      </details>
    </div>
  </article>`;
}

export function renderCredentialGallery({ credentials, contributions, work, ...options }) {
  const { english = false, esc, icon, site } = options;
  const t = (ar, en) => english ? en : ar;
  const path = english ? "/en" : "";
  const locale = english ? "en-GB" : "ar-SA";
  const formatter = new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric", calendar: "gregory", timeZone: "UTC" });
  const byDate = credentials.toSorted((a, b) => (b.issued ?? b.passConfirmed).localeCompare(a.issued ?? a.passConfirmed));
  const sections = [
    ["certifications", "book", t("الشهادات", "Credentials")],
    ["developer-communities", "nodes", t("المجتمع", "Community")],
    ["selected-evidence", "briefcase", t("الأعمال", "Projects")]
  ];
  return `<div class="credential-gallery">
    <section class="folio-hero" aria-labelledby="folio-page-title">
      <div class="folio-wrap folio-opening">
        <div class="folio-intro">
          <a class="folio-author" href="${path}/about/">
            <img src="/assets/brand/eslam-elshikh-portrait-20260827.webp" width="48" height="48" alt="" decoding="async">
            <span>${esc(t(site.nameAr, site.nameEn))}</span>
          </a>
          <h1 id="folio-page-title">${t("شهاداتي", "Professional")} <em>${t("المهنية", "credentials")}</em></h1>
          <p>${t("تعلّمت أساسيات السيو المحلي مع Semrush، وإعلانات البحث وقياس أدائها مع Google. هنا أضع الشهادات الأصلية ومختارات من أعمالي.", "I studied local SEO with Semrush and search advertising and measurement with Google. Explore the original certificates and a selection of my work.")}</p>
          <a class="folio-button" href="#certifications">${t("تصفّح الشهادات", "Explore credentials")}${icon("arrow")}</a>
        </div>
        ${renderShowcase(byDate, options)}
      </div>
      <div class="folio-ribbon"><div class="folio-wrap folio-ribbon-inner">
        ${renderGooglePartnerBadge({ english, placement: "identity" })}
        <nav class="folio-chapters" aria-label="${t("أقسام الصفحة", "On this page")}">
          ${sections.map(([id, glyph, name]) => `<a href="#${id}">${icon(glyph)}${name}</a>`).join("")}
        </nav>
      </div></div>
    </section>

    <section class="folio-archive" id="certifications" aria-labelledby="folio-cert-title"><div class="folio-wrap">
      <div class="folio-section-title">
        <h2 id="folio-cert-title">${t("سجلّ الشهادات", "Credential records")}</h2>
        <p>${t("مرتّبة من الأحدث، مع رابط التحقق لدى كل جهة مانحة.", "Newest first, with a verification link for each issuer.")}</p>
      </div>
      <div class="folio-records">${byDate.map(item => renderRecord(item, options, formatter)).join("")}</div>
    </div></section>

    <div class="folio-community"><div class="folio-wrap folio-community-grid">
      <section class="folio-members" id="developer-communities" aria-labelledby="folio-members-title">
        <h2 id="folio-members-title">${t("مجتمعات المطوّرين", "Developer communities")}</h2>
        <p>${t("برامج أشارك فيها بصفتي عضوًا في مجتمع مطوّري Google.", "Programs I take part in as a member of the Google developer community.")}</p>
        <ul>${communities.map(([glyph, name]) => `<li>${icon(glyph)}<bdi lang="en">${name}</bdi></li>`).join("")}</ul>
        <a class="folio-member-link" href="${esc(site.social.googleDeveloper)}" target="_blank" rel="noopener noreferrer">${t("ملفي على Google للمطوّرين", "My Google Developer profile")}${icon("external")}</a>
      </section>
      <section class="folio-answers" id="community-contributions" aria-labelledby="folio-answers-title">
        <h2 id="folio-answers-title">${t("من إجاباتي في المجتمع", "Community answers")}</h2>
        <p>${t("مشاركاتي في مجتمع مساعدة الملف التجاري على Google، في 18 أكتوبر 2026.", "Answers I published in the Google Business Profile Help Community on 18 October 2026.")}</p>
        <ul>${contributions.map((item, i) => `<li><a href="${esc(item.url)}" target="_blank" rel="noopener noreferrer" data-identity-event="contribution_open" data-identity-item="community-${i + 1}">
          <span><strong>${esc(item.title[english ? 1 : 0])}</strong><small>${esc(item.description[english ? 1 : 0])}</small></span>${icon("external")}
        </a></li>`).join("")}</ul>
      </section>
    </div></div>

    ${work}

    <section class="folio-closing"><div class="folio-wrap folio-closing-inner">
      <div><h2>${t("لنتحدّث عن مشروعك", "Tell me about your project")}</h2>
        <nav aria-label="${t("المزيد عن إسلام", "More from Eslam")}"><a href="${path}/about/">${t("نبذة عنّي", "About me")}</a><a href="${path}/notes/">${t("ملاحظات من العمل", "Practice notes")}</a><a href="${path}/media-kit/">${t("الملف الإعلامي", "Media kit")}</a></nav>
      </div>
      <a class="folio-button" href="${path}/contact/">${t("تواصل معي", "Get in touch")}${icon("arrow")}</a>
    </div></section>
    <dialog class="folio-dialog" aria-labelledby="folio-dialog-title">
      <div class="folio-dialog-bar"><h2 id="folio-dialog-title" lang="en" dir="ltr"></h2>
        <button type="button" data-close aria-label="${t("إغلاق المعاينة", "Close preview")}">${icon("close")}</button>
      </div>
      <div class="folio-dialog-paper"></div>
      <a class="folio-dialog-verify" target="_blank" rel="noopener noreferrer" data-identity-event="credential_open">${t("تحقّق لدى الجهة المانحة", "Verify with the issuer")}${icon("external")}</a>
    </dialog>
  </div>`;
}
