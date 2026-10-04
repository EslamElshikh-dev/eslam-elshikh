import { projectPreviews } from "./project-previews.mjs";
import { caseByUrl, caseHref, productHref } from "./case-studies.mjs";

export function renderProjectCard(project, index, { english = false, sector, title, whatsapp, esc, icon }) {
  const preview = projectPreviews[project.liveUrl];
  const study = caseByUrl.get(project.liveUrl);
  if (!preview?.src) throw new Error(`Missing project preview: ${project.title}`);
  const domain = new URL(project.liveUrl).hostname.replace(/^www\./, "");
  const previewOnly = preview.liveAvailable === false;
  const previewSrc = study.image;
  const productOnly = study.status === "private-product" || study.status === "concept";
  const liveUrl = productOnly ? productHref(study.productSlug, english) : previewOnly ? previewSrc : project.liveUrl;
  const number = String(index + 1).padStart(2, "0");
  const request = english
    ? `Hello Eng. Eslam, I liked the ${project.title} project and would like to discuss a similar project for my business.`
    : `مرحبًا م. إسلام، أعجبني مشروع «${project.title}» وأرغب في تنفيذ مشروع مشابه يناسب نشاطي.`;
  const liveLabel = productOnly ? english ? "Product tour" : "جولة المنتج" : preview.liveAvailable === false
    ? english ? "View saved preview" : "شاهد المعاينة"
    : project.access === "restricted"
    ? english ? "Open sign-in page" : "صفحة الدخول"
    : english ? "Explore website" : "استكشف الموقع";
  const caption = productOnly ? english ? "Product interface with labelled demonstration data" : "واجهة المنتج مع بيانات تجريبية موضحة" : preview.origin === "public-source" || preview.origin === "repository"
    ? english ? "Preview from the public project version" : "معاينة من النسخة العامة للمشروع"
    : english ? "A preview of the project interface" : "لقطة من واجهة المشروع";
  return `<article class="work-ledger-card reveal" data-work-card data-work-sector="${esc(sector)}" data-work-title="${esc(project.title)}" data-work-position="${index % 5}">
    <a class="work-card-preview" href="${esc(previewSrc)}" data-work-preview data-preview-live="${esc(liveUrl)}" data-preview-archived="${previewOnly}" data-preview-label="${esc(liveLabel)}" data-preview-caption="${esc(caption)}" aria-label="${english ? "Enlarge the preview" : "تكبير معاينة"} — ${esc(project.title)}">
      <span class="work-browser-bar"><span class="work-browser-dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="work-browser-domain" dir="ltr">${esc(domain)}</span><span class="work-card-index" dir="ltr">${number}</span></span>
      <span class="work-preview-image"><img src="${esc(previewSrc)}" alt="${english ? "Interface preview of" : "لقطة من واجهة"} ${esc(project.title)}" width="1200" height="750" loading="lazy" decoding="async"><span class="work-preview-zoom">${icon("search")} ${english ? "Take a closer look" : "كبّر المعاينة"}</span></span>
    </a>
    <div class="work-card-body"><span class="work-card-sector">${esc(sector)}</span><h3><a href="${caseHref(study, english)}">${english ? esc(study.englishName) : title}</a></h3>
      ${productOnly ? `<p class="work-card-access">${icon("layers")}${study.status === "concept" ? english ? "Interactive concept · public tour" : "تصور تفاعلي · جولة مفتوحة" : english ? "Custom product · public tour" : "منتج مخصص · جولة مفتوحة"}</p>` : ""}
      ${preview.liveAvailable === false ? `<p class="work-card-access">${icon("book")}${english ? "Saved project preview" : "معاينة محفوظة للمشروع"}</p>` : ""}
      <div class="work-ledger-actions"><a class="work-card-case" href="${caseHref(study, english)}" aria-label="${english ? "Read the case study" : "اقرأ دراسة الحالة"} — ${esc(project.title)}"><span>${english ? "Read the case study" : "اقرأ دراسة الحالة"}</span>${icon("arrow")}</a><div class="work-card-secondary"><a class="work-card-open" href="${esc(liveUrl)}"${previewOnly ? ' data-work-open-preview target="_blank" rel="noopener"' : productOnly ? "" : ' target="_blank" rel="noopener"'} aria-label="${esc(liveLabel)} — ${esc(project.title)}"><span>${liveLabel}</span>${icon(productOnly ? "layers" : previewOnly ? "search" : "external")}</a><a class="work-card-request" href="${whatsapp}?text=${encodeURIComponent(request)}" target="_blank" rel="noopener" aria-label="${english ? "Discuss a similar project" : "طلب مشروع مشابه"} — ${esc(project.title)}">${icon("whatsapp")}<span>${english ? "Your project" : "مشروعك القادم"}</span></a></div></div>
    </div>
  </article>`;
}

export function renderProjectPreviewDialog(english, icon) {
  return `<dialog class="work-preview-dialog" data-work-dialog aria-labelledby="work-preview-title"><div class="work-dialog-header"><div><span>${english ? "THE PROJECT, UP CLOSE" : "المشروع عن قرب"}</span><h2 id="work-preview-title" data-preview-title></h2></div><button class="work-dialog-close" type="button" data-preview-close aria-label="${english ? "Close preview" : "إغلاق المعاينة"}" autofocus>${icon("close")}</button></div><div class="work-dialog-stage"><img data-preview-image alt="" width="1200" height="750" decoding="async"></div><div class="work-dialog-footer"><div class="work-dialog-navigation"><button type="button" data-preview-prev aria-label="${english ? "Previous project" : "المشروع السابق"}">${icon("chevron")}</button><span data-preview-position dir="ltr" aria-live="polite"></span><button type="button" data-preview-next aria-label="${english ? "Next project" : "المشروع التالي"}">${icon("chevron")}</button></div><p data-preview-caption></p><a class="work-card-live" data-preview-link target="_blank" rel="noopener"><span data-preview-link-label>${english ? "Open website" : "فتح الموقع"}</span>${icon("external")}</a></div></dialog>`;
}
