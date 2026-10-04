import { projectPreviews } from "./project-previews.mjs";

export function renderProjectCard(project, index, { english = false, sector, title, whatsapp, esc, icon }) {
  const preview = projectPreviews[project.liveUrl];
  if (!preview?.src) throw new Error(`Missing project preview: ${project.title}`);
  const domain = new URL(project.liveUrl).hostname.replace(/^www\./, "");
  const previewOnly = preview.liveAvailable === false;
  const liveUrl = previewOnly ? preview.src : project.liveUrl;
  const number = String(index + 1).padStart(2, "0");
  const request = english
    ? `Hello Eng. Eslam, I liked the ${project.title} project and would like to discuss a similar project for my business.`
    : `مرحبًا م. إسلام، أعجبني مشروع «${project.title}» وأرغب في تنفيذ مشروع مشابه يناسب نشاطي.`;
  const liveLabel = preview.liveAvailable === false
    ? english ? "View saved preview" : "شاهد المعاينة"
    : project.access === "restricted"
    ? english ? "Open sign-in page" : "صفحة الدخول"
    : english ? "Explore website" : "استكشف الموقع";
  const caption = preview.origin === "public-source" || preview.origin === "repository"
    ? english ? "Preview from the public project version" : "معاينة من النسخة العامة للمشروع"
    : english ? "A preview of the project interface" : "لقطة من واجهة المشروع";
  return `<article class="work-ledger-card reveal" data-work-card data-work-sector="${esc(sector)}" data-work-title="${esc(project.title)}" data-work-position="${index % 5}">
    <a class="work-card-preview" href="${esc(preview.src)}" data-work-preview data-preview-live="${esc(liveUrl)}" data-preview-archived="${previewOnly}" data-preview-label="${esc(liveLabel)}" data-preview-caption="${esc(caption)}" aria-label="${english ? "Enlarge the preview" : "تكبير معاينة"} — ${esc(project.title)}">
      <span class="work-browser-bar"><span class="work-browser-dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="work-browser-domain" dir="ltr">${esc(domain)}</span><span class="work-card-index" dir="ltr">${number}</span></span>
      <span class="work-preview-image"><img src="${esc(preview.src)}" alt="${english ? "Interface preview of" : "لقطة من واجهة"} ${esc(project.title)}" width="1200" height="750" loading="lazy" decoding="async"><span class="work-preview-zoom">${icon("search")} ${english ? "Take a closer look" : "كبّر المعاينة"}</span></span>
    </a>
    <div class="work-card-body"><span class="work-card-sector">${esc(sector)}</span><h3>${title}</h3>
      ${project.access === "restricted" ? `<p class="work-card-access">${icon("shield")}${english ? "Sign-in required" : "يتطلب تسجيل الدخول"}</p>` : ""}
      ${preview.liveAvailable === false ? `<p class="work-card-access">${icon("book")}${english ? "Saved project preview" : "معاينة محفوظة للمشروع"}</p>` : ""}
      <div class="work-ledger-actions"><a class="work-card-live" href="${esc(liveUrl)}"${previewOnly ? " data-work-open-preview" : ""} target="_blank" rel="noopener" aria-label="${esc(liveLabel)} — ${esc(project.title)}"><span>${liveLabel}</span>${icon(previewOnly ? "search" : "external")}</a><div class="work-card-secondary"><a class="work-card-request" href="${whatsapp}?text=${encodeURIComponent(request)}" target="_blank" rel="noopener" aria-label="${english ? "Discuss a similar project" : "طلب مشروع مشابه"} — ${esc(project.title)}">${icon("whatsapp")}<span>${english ? "Build something similar" : "ابدأ مشروعًا مشابهًا"}</span></a></div></div>
    </div>
  </article>`;
}

export function renderProjectPreviewDialog(english, icon) {
  return `<dialog class="work-preview-dialog" data-work-dialog aria-labelledby="work-preview-title"><div class="work-dialog-header"><div><span>${english ? "THE PROJECT, UP CLOSE" : "المشروع عن قرب"}</span><h2 id="work-preview-title" data-preview-title></h2></div><button class="work-dialog-close" type="button" data-preview-close aria-label="${english ? "Close preview" : "إغلاق المعاينة"}" autofocus>${icon("close")}</button></div><div class="work-dialog-stage"><img data-preview-image alt="" width="1200" height="750" decoding="async"></div><div class="work-dialog-footer"><div class="work-dialog-navigation"><button type="button" data-preview-prev aria-label="${english ? "Previous project" : "المشروع السابق"}">${icon("chevron")}</button><span data-preview-position dir="ltr" aria-live="polite"></span><button type="button" data-preview-next aria-label="${english ? "Next project" : "المشروع التالي"}">${icon("chevron")}</button></div><p data-preview-caption></p><a class="work-card-live" data-preview-link target="_blank" rel="noopener"><span data-preview-link-label>${english ? "Open website" : "فتح الموقع"}</span>${icon("external")}</a></div></dialog>`;
}
