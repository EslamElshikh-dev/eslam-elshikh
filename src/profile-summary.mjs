import { professionalCredentials } from "./professional-identity.mjs";

// The profile's editorial revision is separate from account-link review dates.
export const profileSummaryRevision = "2026-11-18";

export function renderProfileSummary({ english = false, site, esc }) {
  const prefix = english ? "/en" : "";
  const heading = english ? "Eslam Elshikh: background, work and sources" : "إسلام الشيخ: الدراسة والعمل والأدلة";
  const bio = english
    ? "I am Eslam Elshikh, a Riyadh-based software developer working on Arabic websites, business systems and local search. I studied at the Faculty of Computers and Information at 6 October University and completed a cybersecurity diploma at the Arab Open University in Riyadh. My portfolio connects the delivered interface with the implementation decisions and, where available, dated measurement records."
    : "أنا إسلام الشيخ، مطور مواقع وبرمجيات أعمل من الرياض على مواقع عربية وأنظمة لإدارة الأعمال والظهور المحلي. درست في كلية الحاسبات والمعلومات بجامعة 6 أكتوبر، وحصلت على دبلوم في الأمن السيبراني من الجامعة العربية المفتوحة بالرياض. أوثّق في معرضي ما نفّذته لكل مشروع، والقرارات التي اتخذتها، وبيانات القياس عندما تتوفر لها فترة ومصدر واضحان.";
  const sources = [
    {
      title: english ? "Code and implementation" : "الكود والتنفيذ",
      text: english ? "Public repositories show the implementation history. The Naqada case explains the directory's Arabic search and publication rules." : "المستودعات العامة تعرض سجل التنفيذ. وتشرح دراسة دليل نقادة طريقة البحث العربي وقواعد نشر بيانات الأنشطة.",
      links: [[site.social.github, "GitHub", true], [`${prefix}/projects/naqada-directory/`, english ? "Naqada implementation" : "تنفيذ دليل نقادة"]]
    },
    {
      title: english ? "Work and measurement" : "الأعمال والقياس",
      text: english ? "The Tawod and Sama Scan studies separate observed metrics from interpretation. My practice notes explain why a contact click is not a qualified enquiry." : "تفصل دراستا تعاود وسما سكان المؤشرات المرصودة عن تفسيرها. وفي ملاحظات العمل أوضح لماذا لا تساوي نقرة الاتصال طلبًا مؤهلًا.",
      links: [[`${prefix}/projects/tawod-contracting/`, english ? "Tawod case study" : "دراسة تعاود"], [`${prefix}/projects/sama-scan/`, english ? "Sama Scan case study" : "دراسة سما سكان"], [`${prefix}/notes/contact-clicks-and-qualified-enquiries/`, english ? "How I measure contact actions" : "كيف أقيس التواصل"]]
    },
    {
      title: english ? "Issuer-linked credentials" : "الشهادات وروابط التحقق",
      text: english ? "Google Skillshop issued my search advertising and measurement credentials. Semrush Academy issued my certificate in local SEO. Each covers the subject shown and does not imply Google employment or guarantee a Search or Maps result." : "حصلت على شهادتي إعلانات البحث وقياس الإعلانات من Google Skillshop، وشهادة أساسيات السيو المحلي من Semrush Academy. تخص كل شهادة مجالها المحدد، ولا تعني أنني موظف في Google أو أضمن نتيجة في البحث أو الخرائط.",
      links: professionalCredentials.map(item => [item.url, item.name, true])
    }
  ];
  return `<section class="about-name-registry" id="profile-evidence" aria-labelledby="profile-evidence-title"><div class="container"><div class="about-name-registry-head"><span>${english ? "BACKGROUND / PUBLIC EVIDENCE" : "نبذة وأدلة منشورة"}</span><h2 id="profile-evidence-title">${heading}</h2><p>${bio}</p></div><div class="about-name-grid">${sources.map(source => `<article><h3>${source.title}</h3><p>${source.text}</p><ul>${source.links.map(([url, label, external]) => `<li><a href="${esc(url)}"${external ? ' target="_blank" rel="noopener"' : ""}>${esc(label)}</a></li>`).join("")}</ul></article>`).join("")}</div></div></section>`;
}
