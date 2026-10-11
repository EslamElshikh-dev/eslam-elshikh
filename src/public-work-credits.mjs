// Review dates describe the public credit check, not the project delivery date.
export const publicWorkCreditsReviewedAt = "2026-10-11";
const pair = (ar, en) => ({ ar, en });

export const publicWorkCredits = {
  "kermez-cafe": {
    sourceUrl: "https://kermez-cafe.vercel.app/menu/",
    sourceTitle: pair("منيو كرمز كافيه", "Kermez Cafe menu"),
    role: pair("تصميم وتطوير الموقع والمنيو", "Website and menu design and development"),
    credit: pair("يذكر تذييل المنيو اسمي تحت «تصميم وتطوير»، مع رابط إلى موقعي الرسمي.", "The menu footer names Eslam Elshikh for design and development and links to my official website.")
  },
  "dahanat-alya-riyadh": {
    sourceUrl: "https://dahanat-alya-riyadh.vercel.app/products",
    sourceTitle: pair("كتالوج منتجات دهانات عليا", "Alya Paints product catalog"),
    role: pair("تصميم وتطوير الموقع وكتالوج المنتجات", "Website and product catalog design and development"),
    credit: pair("يذكر تذييل كتالوج المنتجات اسمي تحت «تصميم وتطوير»، مع رابط إلى موقعي الرسمي.", "The product catalog footer names Eslam Elshikh for design and development and links to my official website.")
  },
  "sama-scan": {
    sourceUrl: "https://samascan.vercel.app/",
    sourceTitle: pair("موقع مركز سما سكان", "Sama Scan website"),
    role: pair("تطوير موقع المركز", "Center website development"),
    credit: pair("يذكر تذييل الموقع المهندس إسلام الشيخ وEng. Eslam Elshikh في نسبة التطوير، مع رابط إلى موقعي الرسمي.", "The website footer credits Eng. Eslam Elshikh for development and links to my official website.")
  }
};

export function renderPublicWorkCredit(slug, { english = false, esc, icon }, headingLevel = 4) {
  const record = publicWorkCredits[slug];
  if (!record) return "";
  const t = value => value[english ? "en" : "ar"];
  const level = headingLevel === 3 ? 3 : 4;
  const reviewedLabel = new Intl.DateTimeFormat(english ? "en-GB" : "ar-SA", {
    day: "numeric", month: "long", year: "numeric", calendar: "gregory", timeZone: "UTC"
  }).format(new Date(`${publicWorkCreditsReviewedAt}T12:00:00Z`));
  return `<aside class="public-work-credit" data-public-work-credit="${esc(slug)}" aria-label="${english ? "Published development credit" : "نسبة التنفيذ المنشورة"}"><h${level}>${english ? "Published development credit" : "نسبة التنفيذ المنشورة"}</h${level}><dl><div><dt>${english ? "My role" : "دوري"}</dt><dd>${esc(t(record.role))}</dd></div><div><dt>${english ? "Public evidence" : "الدليل المنشور"}</dt><dd><p>${esc(t(record.credit))}</p><a class="evidence-link" href="${esc(record.sourceUrl)}" target="_blank" rel="noopener">${esc(t(record.sourceTitle))}${icon("external")}</a></dd></div><div><dt>${english ? "Source reviewed" : "مراجعة المصدر"}</dt><dd><time datetime="${publicWorkCreditsReviewedAt}">${esc(reviewedLabel)}</time></dd></div></dl></aside>`;
}
