import { verifiedCaseResults } from "./verified-case-results.mjs";
import { practiceNotes, noteHref } from "./practice-notes.mjs";

export const professionalRevision = "2026-10-18";
export const identityAssetRoot = "/assets/identity-20261018";
export const identityStylesheet = "/assets/css/professional-identity.css";

export const professionalBios = {
  short: [
    "إسلام الشيخ، مهندس أمن سيبراني ومطور برمجيات في الرياض. أعمل على المواقع ووكلاء الذكاء الاصطناعي وخرائط Google والسيو المحلي.",
    "Eslam Elshikh is a Riyadh-based cybersecurity engineer and software developer working across websites, AI agents, Google Maps and local SEO."
  ],
  medium: [
    "أنا إسلام الشيخ، مهندس أمن سيبراني ومطور مواقع وبرمجيات أعمل من الرياض. أجمع بين تصميم التجربة وتطوير الأنظمة ووكلاء الذكاء الاصطناعي وتحسين الظهور المحلي. أبدأ بفهم الهدف، ثم أحدد نطاق التنفيذ، وأعرض أعمالي مع أدلتها وحدود نتائجها. تشمل نماذج عملي مواقع شركات وخدمات صحية وأدلة محلية ولوحات إدارة وCRM.",
    "I’m Eslam Elshikh, a cybersecurity engineer and software and web developer based in Riyadh. My work connects interface design, custom systems, AI agents and local search. I begin with the business objective, define a delivery scope and present work with evidence and clearly defined outcomes. My portfolio includes business and healthcare websites, local directories, administration interfaces and CRM products."
  ],
  editorial: [
    "إسلام الشيخ مهندس أمن سيبراني ومطور مواقع وبرمجيات يعمل من الرياض، ويركز على بناء حلول رقمية تجمع تجربة المستخدم والأمان وقابلية التشغيل. تشمل مجالات عمله تطوير المواقع والأنظمة المخصصة، ووكلاء الذكاء الاصطناعي والأتمتة، وخرائط Google والسيو المحلي. يعرض موقعه دراسات حالة توضح دوره ومخرجات التنفيذ ومصادر القياس، منها تعاود للمقاولات وسما سكان ودليل نقادة. يساهم في مجتمعات مساعدة منتجات Google، ويعرض روابط شهادتَي Google Ads Search وGoogle Ads Measurement ضمن ملفه المهني. للتعريف والأعمال والتواصل: www.eslam-elshikh.com.",
    "Eslam Elshikh is a Riyadh-based cybersecurity engineer and software and web developer focused on digital products that connect user experience, security and practical operations. His work spans websites and custom systems, AI agents and automation, Google Maps and local SEO. His portfolio presents delivery roles, implementation outputs and measurement sources through case studies including Tawod General Contracting, Sama Scan and Naqada Directory. He contributes to Google product help communities and provides issuer links for his Google Ads Search and Google Ads Measurement credentials. His professional profile, selected work and contact information are available at www.eslam-elshikh.com."
  ]
};

// Issuer records reviewed on the dates below; the current session did not
// obtain a new issuer verification. Never relabel this as a fresh live check.
export const professionalCredentials = [
  {
    name: "Google Ads Search Certification (2026)",
    id: "196860691", issued: "2026-10-11", expires: "2027-10-11", reviewed: "2026-10-11",
    url: "https://skillshop.credential.net/f10c0d9f-1417-41a8-b35c-a56c6a2d358d#acc.BUlXLe7J",
    scope: ["إعلانات البحث: ربط هدف العمل بالكلمات والإعلانات والمزايدات والقياس.", "Search advertising: connecting business objectives with keywords, ads, bidding and measurement."]
  },
  {
    name: "Google Ads Measurement Certification",
    id: "191833453", issued: "2026-08-19", expires: "2027-08-19", reviewed: "2026-10-11",
    url: "https://skillshop.credential.net/2e22949d-fa03-429b-b367-58be9ee2350d#acc.4fkdDFEJ",
    scope: ["قياس الإعلانات: تحديد ما يُقاس، وقراءة المؤشرات، وربط التفاعل بأهداف النشاط.", "Advertising measurement: defining useful measures and interpreting interactions against business objectives."]
  }
];

export const credentialGraph = () => professionalCredentials.map(item => ({
  "@type": "EducationalOccupationalCredential", name: item.name,
  credentialCategory: "Professional certification", identifier: item.id, url: item.url,
  recognizedBy: { "@type": "Organization", name: "Google Skillshop", url: "https://skillshop.withgoogle.com/" }
}));

export const communityContributions = [
  {
    title: ["اعتراض إعادة التفعيل: تحديد المرحلة المعطلة", "Reinstatement appeals: identifying the blocked stage"],
    description: ["تمييز قرار قابل للاعتراض من طلب تعذّر إرساله، وتحديد البيانات التي تغيّر الخطوة التالية.", "Distinguishing an appeal-eligible decision from a request that has not been submitted, and identifying the next useful evidence."],
    url: "https://support.google.com/business/thread/473419294?hl=en&msgid=473421122"
  },
  {
    title: ["تقييم خارج الموضوع: تطبيق السياسة على المحتوى", "Off-topic reviews: applying the policy to the content"],
    description: ["ربط التشخيص بمحتوى التقييم ومرحلة الاعتراض، مع توضيح حدود المعلومات المتاحة.", "Connecting the review content with the relevant policy and appeal stage while stating the limits of the available information."],
    url: "https://support.google.com/business/thread/473419252?hl=en&msgid=473421191"
  },
  {
    title: ["صور غير مرتبطة بالنشاط: اختيار دليل محدد", "Unrelated business photos: selecting specific evidence"],
    description: ["توجيه صاحب النشاط إلى الصورة ورابطها وسبب عدم ارتباطها بالمكان، بدل تكرار بلاغ عام.", "Focusing on the photo, its direct link and the reason it is unrelated to the location, rather than repeating a general report."],
    url: "https://support.google.com/business/thread/473413848?hl=en&msgid=473421330"
  }
];

export const selectedWorkSlugs = ["tawod-contracting", "sama-scan", "naqada-directory"];

const label = (pair, english) => pair[english ? 1 : 0];
const prefix = english => english ? "/en" : "";
const date = (value, english) => new Intl.DateTimeFormat(english ? "en-GB" : "ar-SA", { day: "numeric", month: "short", year: "numeric", calendar: "gregory", timeZone: "UTC" }).format(new Date(`${value}T12:00:00Z`));
const ext = (url, title, { esc, icon }, attrs = "") => `<a href="${esc(url)}" target="_blank" rel="noopener" ${attrs}>${esc(title)}${icon("external")}</a>`;
const sectionHead = (number, kicker, title, text = "") => `<div class="id-section-heading"><p class="id-kicker"><span dir="ltr">${number}</span>${kicker}</p><h2>${title}</h2>${text ? `<p>${text}</p>` : ""}</div>`;

export function identityNavigation(english, current = "") {
  return `<nav class="id-navigation" aria-label="${english ? "Professional profile sections" : "أقسام الملف المهني"}">${[["/about/", "التعريف", "Profile"], ["/credentials/", "الشهادات والمساهمات", "Credentials & contributions"], ["/notes/", "ملاحظات من العمل", "Practice notes"], ["/media-kit/", "ملف التعريف والمشاركة", "Media kit"]].map(([path, ar, en]) => `<a href="${prefix(english)}${path}"${path === current ? ' aria-current="page"' : ""}>${english ? en : ar}</a>`).join("")}</nav>`;
}

function studioHero({ english, title, lead, kicker, path, site, esc, portrait = true }) {
  return `<div class="id-hero"><div class="container"><p class="id-kicker">${kicker}<span dir="ltr">ESLAM ELSHIKH / RIYADH</span></p><div class="id-hero-grid"><div><h1>${title}</h1><p class="id-hero-lead">${lead}</p><a class="id-action" href="${prefix(english)}/contact/">${english ? "Discuss a project" : "ناقش مشروعك"}<span aria-hidden="true">↗</span></a></div>${portrait ? `<figure class="id-portrait"><img src="/assets/brand/eslam-elshikh-portrait-20260827.webp" width="280" height="280" alt="${english ? "Eslam Elshikh" : "إسلام الشيخ"}" decoding="async"><figcaption><strong>${esc(site.nameEn)}</strong><span>${english ? "Cybersecurity · Software · AI · Local search" : "أمن سيبراني · برمجيات · ذكاء اصطناعي · ظهور محلي"}</span></figcaption></figure>` : ""}</div>${identityNavigation(english, path)}</div></div>`;
}

export function renderSelectedProof({ english = false, esc, icon, studies }) {
  const cards = selectedWorkSlugs.map((slug, i) => {
    const study = studies.find(item => item.slug === slug);
    if (!study) throw new Error(`Missing selected case: ${slug}`);
    const proof = verifiedCaseResults[slug];
    const metric = proof?.metrics[0];
    const name = english ? study.englishName : study.title;
    return `<article class="id-work-card"><a class="id-work-image" href="${prefix(english)}/projects/${slug}/"><img src="${study.image}" alt="${esc(english ? `${name} project interface` : `واجهة مشروع ${name}`)}" width="1200" height="750" loading="lazy" decoding="async"><span dir="ltr">0${i + 1} / CASE STUDY</span></a><div class="id-work-copy"><p class="id-kicker">${proof ? english ? "DATED PERFORMANCE EVIDENCE" : "أداء موثق بفترة قياس" : english ? "TECHNICAL DELIVERY" : "دراسة تنفيذ تقني"}</p><h3><a href="${prefix(english)}/projects/${slug}/">${esc(name)}</a></h3>${metric ? `<dl class="id-metric"><div><dt>${esc(label(metric.label, english))}</dt><dd dir="ltr">${metric.before.toLocaleString("en")} <span aria-hidden="true">→</span> ${metric.after.toLocaleString("en")}</dd></div></dl><p class="id-period"><time datetime="${proof.before.start}">${esc(label(proof.before.label, english))}</time><br><time datetime="${proof.after.start}">${esc(label(proof.after.label, english))}</time></p><p class="id-method-note">${english ? "Observed comparison. Contact interactions do not establish completed enquiries or sales." : "مقارنة وصفية؛ تفاعلات التواصل لا تعني طلبات مكتملة أو مبيعات."}</p>` : `<p>${english ? "An Arabic directory connecting business, category and location routes with normalized search and explicit publication rules." : "دليل عربي يربط الأنشطة والتصنيفات والمواضع، ببحث مطبّع وقواعد واضحة لنشر البيانات."}</p><p class="id-method-note">${english ? "Implementation and repository evidence; no audience-growth claim." : "الدليل هنا تقني ومن المستودع؛ لا يتضمن ادعاء نمو الجمهور."}</p>`}<a class="id-inline-link" href="${prefix(english)}/projects/${slug}/" data-identity-event="case_study_open" data-identity-item="${slug}">${english ? "Read the scope, evidence and results" : "اقرأ النطاق والأدلة والنتائج"}${icon("arrow")}</a></div></article>`;
  }).join("");
  return `<section class="identity-studio id-section" id="selected-evidence"><div class="container">${sectionHead("04", english ? "SELECTED WORK" : "أعمال مختارة", english ? "Three projects. A clear record of the work." : "ثلاثة أعمال، وسجل واضح لما نُفّذ.", english ? "Two measured comparisons and one technical case show different sides of my delivery. Each links to the full context." : "مقارنتا أداء ودراسة تقنية تعرض زوايا مختلفة من التنفيذ؛ ولكل عمل سياقه وتفاصيله.")}<div class="id-three-grid">${cards}</div></div></section>`;
}

export function renderIdentityHighlights(options) {
  const { english = false, esc, icon } = options;
  return `<section class="identity-studio id-profile-extension"><div class="container"><div class="id-profile-intro"><p class="id-kicker">${english ? "EXPERIENCE, WITH EVIDENCE" : "خبرة يمكن مراجعتها"}</p><h2>${english ? "Explore the credentials.<br>See the decisions behind the work." : "راجع الشهادات،<br>واكتشف القرارات وراء العمل."}</h2><p>${english ? "Issuer links, original practice notes, selected projects and a bilingual introduction you can share." : "روابط الجهات المانحة، وملاحظات أصلية من التنفيذ، وأعمال مختارة، وملف تعريفي جاهز للمشاركة."}</p></div><div class="id-three-grid">${[["shield", "/credentials/", "الشهادات والمساهمات", "Credentials & contributions", "شهادتان بروابط تحقق، وعضويات ومساهمات موضحة بنوعها.", "Two issuer-linked credentials, clearly described memberships and community contributions."], ["code", "/notes/", "ملاحظات من العمل", "Notes from the work", "قرارات فعلية في القياس، والدليل العربي، وتوحيد الهوية.", "Practical decisions in measurement, Arabic directories and a shared identity."], ["globe", "/media-kit/", "ملف التعريف والمشاركة", "A bilingual media kit", "نبذات عربية وإنجليزية وصور مشاركة وقوالب قابلة للتنزيل.", "Arabic and English bios, sharing images and downloadable assets."]].map(([glyph, path, ar, en, arText, enText]) => `<a class="id-route-card" href="${prefix(english)}${path}">${icon(glyph)}<h3>${esc(english ? en : ar)}</h3><p>${esc(english ? enText : arText)}</p><span>${english ? "Explore" : "استعرض"}${icon("arrow")}</span></a>`).join("")}</div></div></section>${english ? renderSelectedProof(options) : ""}`;
}

export function renderCredentials(options) {
  const { site, english = false, esc, icon } = options;
  const certCards = professionalCredentials.map((item, i) => `<article class="id-credential"><div class="id-card-top"><span class="id-pill">Google / Skillshop</span><span dir="ltr">0${i + 1}</span></div><h3 lang="en" dir="ltr">${esc(item.name)}</h3><p>${esc(label(item.scope, english))}</p><dl class="id-facts"><div><dt>${english ? "Holder" : "الحاصل على الشهادة"}</dt><dd dir="ltr">Eslam Elshikh</dd></div><div><dt>${english ? "Credential ID" : "رقم الشهادة"}</dt><dd dir="ltr">${item.id}</dd></div><div><dt>${english ? "Issued" : "الإصدار"}</dt><dd><time datetime="${item.issued}">${esc(date(item.issued, english))}</time></dd></div><div><dt>${english ? "Expires" : "الانتهاء"}</dt><dd><time datetime="${item.expires}">${esc(date(item.expires, english))}</time></dd></div></dl>${ext(item.url, english ? "View issuer credential" : "راجع الشهادة لدى الجهة المانحة", options, `class="id-inline-link" data-identity-event="credential_open" data-identity-item="${item.id}"`)}<p class="id-fine-print">${english ? "Credential record reviewed" : "مراجعة سجل الشهادة"}: <time datetime="${item.reviewed}">${esc(date(item.reviewed, english))}</time></p></article>`).join("");
  const communities = [
    ["Google Maps Platform Innovators", "عضوية مجتمع المطورين المهتمين ببناء حلول الخرائط.", "Developer community membership focused on building with mapping tools."],
    ["Google Cloud Innovator", "عضوية برنامج مجتمع Google Cloud.", "Membership in the Google Cloud community program."],
    ["Firebase Studio Developer Community", "عضوية مجتمع مطوري Firebase Studio.", "Membership in the Firebase Studio developer community."]
  ];
  return `<div class="identity-studio">${studioHero({ ...options, path: "/credentials/", kicker: english ? "CREDENTIALS / COMMUNITY / DELIVERY" : "شهادات / مجتمع / تنفيذ", title: english ? "Experience you can<br><em>trace to its source.</em>" : "خبرة يمكنك<br><em>الرجوع إلى مصدرها.</em>", lead: english ? "Professional certifications, developer-community memberships and public contributions, connected to the work they support." : "شهادات مهنية وعضويات مجتمعات المطورين ومساهمات عامة، مرتبطة بالأعمال التي تدعمها." })}
  <section class="id-section" id="certifications"><div class="container">${sectionHead("01", english ? "PROFESSIONAL CERTIFICATIONS" : "الشهادات المهنية", english ? "The credential, its scope and its issuer." : "الشهادة، ونطاقها، والجهة التي أصدرتها.", english ? "The issuer links are the reference for each credential's details and current status." : "روابط الجهات المانحة هي المرجع لتفاصيل كل شهادة وحالتها الحالية.")}<div class="id-two-grid">${certCards}</div></div></section>
  <section class="id-section id-soft" id="developer-communities"><div class="container">${sectionHead("02", english ? "DEVELOPER COMMUNITIES" : "مجتمعات المطورين", english ? "Participation that supports continued practice." : "مشاركة تدعم التعلّم والممارسة.", english ? "Program and community badges appear on my Google Developer profile. They describe membership, separately from professional certifications." : "يعرض ملفي على Google للمطورين شارات البرامج والمجتمعات. تُذكر هنا بوصفها عضويات، بصورة مستقلة عن الشهادات المهنية.")}<div class="id-three-grid">${communities.map(([name, ar, en]) => `<article class="id-membership">${icon("nodes")}<span class="id-pill">${english ? "Program membership" : "عضوية برنامج"}</span><h3 lang="en" dir="ltr">${name}</h3><p>${esc(english ? en : ar)}</p></article>`).join("")}</div><div class="id-section-action">${ext(site.social.googleDeveloper, english ? "Open my Google Developer profile" : "افتح ملفي على Google للمطورين", options, 'class="id-inline-link"')}</div></div></section>
  <section class="id-section" id="community-contributions"><div class="container">${sectionHead("03", english ? "PUBLIC CONTRIBUTIONS" : "مساهمات عامة", english ? "Helping people find the next useful step." : "تشخيص يساعد المستخدم على خطوته التالية.", english ? "Selected Google Business Profile help-community answers published on 18 October 2026. These links identify contributions, not an endorsement or a recommended-answer claim." : "نماذج من إجاباتي في مجتمع مساعدة الملف التجاري، منشورة في 18 أكتوبر 2026. الروابط توثق المساهمات، ولا تعني اعتمادًا أو تصنيفًا كإجابة مقترحة.")}<div class="id-three-grid">${communityContributions.map((item, i) => `<article class="id-contribution"><span class="id-index" dir="ltr">0${i + 1}</span><h3>${esc(label(item.title, english))}</h3><p>${esc(label(item.description, english))}</p>${ext(item.url, english ? "Read the published answer" : "اقرأ الإجابة المنشورة", options, `class="id-inline-link" data-identity-event="contribution_open" data-identity-item="community-${i + 1}"`)}</article>`).join("")}</div></div></section>
  ${renderSelectedProof(options)}
  <section class="id-section id-dark"><div class="container id-closing"><div><p class="id-kicker">${english ? "LET’S CONNECT" : "لنتواصل"}</p><h2>${english ? "Bring a clear problem.<br>We’ll define the next step." : "ابدأ بمشكلة واضحة،<br>لنحدد الخطوة المناسبة."}</h2></div><a class="id-action" href="${prefix(english)}/contact/">${english ? "Discuss your project" : "ناقش مشروعك"}${icon("arrow")}</a></div></section></div>`;
}

export function renderTechnicalEvidence(study, options) {
  if (study.slug !== "naqada-directory") return "";
  const { english = false, esc, icon } = options;
  const points = [
    ["المهمة", "The task", "جمع الأنشطة والمعرفة المحلية في مداخل واضحة للمكان والخدمة والمحتوى.", "Connect local businesses and knowledge through clear location, service and content routes."],
    ["التنفيذ", "Implementation", "Next.js وصفحات مستقلة وبيانات وصفية وJSON-LD وخرائط موقع، مع بحث عربي مطبّع وتجربة RTL.", "Next.js routes with metadata, JSON-LD and sitemaps, normalized Arabic search and an RTL interface."],
    ["قاعدة النشر", "Publication rule", "عرض السجلات المؤهلة للنشر وحجب حالات المراجعة غير المعتمدة، مع الفصل بين الصور الموثقة والتوضيحية.", "Publish eligible records and exclude unresolved review states, distinguishing documented imagery from illustrations."],
    ["نوع النتيجة", "Evidence type", "مخرجات تقنية ومحتوى يمكن مراجعتهما في الموقع والمستودع؛ لا تُستنتج منهما أعداد زيارات أو مستخدمين.", "Reviewable software and content outputs; these do not establish visitor or audience counts."]
  ];
  return `<section class="case-section identity-studio id-technical" id="technical-evidence"><div class="case-section-label"><span>TECHNICAL / EVIDENCE</span><h2>${english ? "A delivery record grounded in the project." : "سجل تنفيذ يستند إلى المشروع."}</h2></div><div class="id-two-grid">${points.map(([ar, en, arText, enText]) => `<article class="id-membership"><h3>${english ? en : ar}</h3><p>${esc(english ? enText : arText)}</p></article>`).join("")}</div><p class="id-fine-print">${english ? "Repository documentation reviewed on 18 October 2026. Record totals are omitted because source files describe different revisions." : "رُوجع توثيق المستودع في 18 أكتوبر 2026. لا تُعرض أعداد السجلات هنا لاختلاف النسخ الموصوفة في ملفات التوثيق."}</p><div class="id-section-action">${ext("https://github.com/EslamElshikh-dev/naqada-directory", english ? "Review the source repository" : "راجع مستودع المشروع", options, 'class="id-inline-link"')}<a class="id-inline-link" href="${prefix(english)}/notes/arabic-directory-data-and-discovery/">${english ? "Read the engineering note" : "اقرأ الملاحظة الهندسية"}${icon("arrow")}</a></div></section>`;
}

export function renderNotesIndex(options) {
  const { english = false, site, esc, icon } = options;
  return `<div class="identity-studio">${studioHero({ ...options, path: "/notes/", portrait: false, kicker: english ? "PRACTICE NOTES / FIRST-HAND WORK" : "ملاحظات من العمل / تجربة مباشرة", title: english ? "The decisions<br><em>behind the delivery.</em>" : "القرارات التي<br><em>تصنع التنفيذ.</em>", lead: english ? "Original notes from projects I work on: what I measure, how I organize information and how I connect a professional identity across languages." : "ملاحظات أصلية من مشروعات أعمل عليها: ما الذي أقيسه، وكيف أنظم المعلومات، وكيف أربط الهوية المهنية بين اللغات." })}<section class="id-section"><div class="container id-notes-list">${practiceNotes.map((note, i) => `<article class="id-note-row"><div class="id-note-number" dir="ltr">0${i + 1}</div><div><p class="id-kicker">${esc(label(note.category, english))}<time datetime="${note.date}">${esc(date(note.date, english))}</time></p><h2><a href="${noteHref(note, english)}">${esc(label(note.title, english))}</a></h2><p>${esc(label(note.description, english))}</p><a class="id-inline-link" href="${noteHref(note, english)}">${english ? "Read the note" : "اقرأ الملاحظة"}${icon("arrow")}</a></div></article>`).join("")}</div></section><section class="id-section id-soft"><div class="container id-closing"><div><h2>${english ? "Start with the work itself." : "ابدأ بالعمل نفسه."}</h2><p>${english ? "The notes connect to case studies, implementation sources and the profile behind them." : "ترتبط الملاحظات بدراسات الحالة ومصادر التنفيذ وصاحب العمل."}</p></div><a class="id-action" href="${prefix(english)}/work-evidence/">${english ? "Explore work evidence" : "استعرض أدلة الأعمال"}${icon("arrow")}</a></div></section></div>`;
}

export function renderPracticeNote(note, options) {
  const { site, english = false, esc, icon } = options;
  const otherNotes = practiceNotes.filter(item => item.slug !== note.slug);
  const relatedNames = {
    "/projects/tawod-contracting/": ["دراسة تعاود", "Tawod case study"],
    "/projects/sama-scan/": ["دراسة سما سكان", "Sama Scan case study"],
    "/projects/naqada-directory/": ["دراسة دليل نقادة", "Naqada Directory case study"],
    "/work-evidence/": ["أدلة الأعمال", "Work evidence"], "/about/": ["الملف المهني", "Professional profile"],
    "/credentials/": ["الشهادات والمساهمات", "Credentials & contributions"]
  };
  return `<div class="identity-studio"><article class="id-note"><div class="id-note-header container"><a class="id-back" href="${prefix(english)}/notes/">${icon("arrow")}${english ? "All practice notes" : "كل ملاحظات العمل"}</a><p class="id-kicker">${esc(label(note.category, english))}</p><h1>${esc(label(note.title, english))}</h1><div class="id-byline"><img src="/assets/brand/eslam-elshikh-portrait-20260827.webp" alt="" width="48" height="48"><span><a href="${prefix(english)}/about/">${english ? site.nameEn : site.nameAr}</a><time datetime="${note.date}">${esc(date(note.date, english))}</time></span><span class="id-pill">${english ? "First-hand practice" : "تجربة مباشرة"}</span></div><p class="id-note-opening">${esc(label(note.opening, english))}</p></div><div class="container id-reading-grid"><aside class="id-toc"><nav aria-label="${english ? "On this page" : "محتويات الملاحظة"}"><strong>${english ? "IN THIS NOTE" : "في هذه الملاحظة"}</strong>${note.sections.map((section, i) => `<a href="#${section.id}"><span dir="ltr">0${i + 1}</span>${esc(label(section.title, english))}</a>`).join("")}</nav></aside><div class="id-note-content">${note.sections.map(section => `<section id="${section.id}"><h2>${esc(label(section.title, english))}</h2>${section.paragraphs.map(pair => `<p>${esc(label(pair, english))}</p>`).join("")}</section>`).join("")}<section id="references"><h2>${english ? "Implementation and references" : "التنفيذ والمراجع"}</h2><ul class="id-source-list">${note.sources.map(([ar, en, url]) => `<li>${ext(url, english ? en : ar, options)}</li>`).join("")}</ul><div class="id-related-actions">${note.related.map(path => `<a class="id-inline-link" href="${prefix(english)}${path}">${esc(label(relatedNames[path], english))}${icon("arrow")}</a>`).join("")}</div></section><footer class="id-author-card"><strong>${english ? "About the author" : "عن الكاتب"}</strong><p>${esc(label(professionalBios.short, english))}</p><a href="${prefix(english)}/credentials/">${english ? "Credentials and contributions" : "الشهادات والمساهمات"}${icon("arrow")}</a></footer></div></div></article><section class="id-section id-soft"><div class="container">${sectionHead("NEXT", english ? "CONTINUE READING" : "واصل القراءة", english ? "More notes from the work." : "ملاحظات أخرى من العمل.")}<div class="id-two-grid">${otherNotes.map(item => `<a class="id-route-card" href="${noteHref(item, english)}"><p class="id-kicker">${esc(label(item.category, english))}</p><h3>${esc(label(item.title, english))}</h3><span>${english ? "Read" : "اقرأ"}${icon("arrow")}</span></a>`).join("")}</div></div></section></div>`;
}

export const mediaDownloads = [
  ["profile-bilingual-r2.pdf", "ملف مهني ثنائي اللغة", "Bilingual professional profile", "PDF · 4 pages"],
  ["share-ar-1200x630.png", "بطاقة المشاركة العربية", "Arabic sharing card", "PNG · 1200 × 630"],
  ["share-en-1200x630.png", "بطاقة المشاركة الإنجليزية", "English sharing card", "PNG · 1200 × 630"],
  ["professional-banner-1584x396.png", "غلاف مهني عريض", "Wide professional banner", "PNG · 1584 × 396"],
  ["facebook-cover-1640x624.png", "غلاف Facebook", "Facebook cover", "PNG · 1640 × 624"],
  ["youtube-banner-2560x1440.png", "غلاف YouTube", "YouTube banner", "PNG · 2560 × 1440"],
  ["square-1080x1080.png", "بطاقة منشور مربعة", "Square introduction card", "PNG · 1080 × 1080"],
  ["story-1080x1920.png", "بطاقة عمودية للقصص", "Vertical story card", "PNG · 1080 × 1920"],
  ["bios-ar-en.txt", "النبذات العربية والإنجليزية", "Arabic and English biographies", "TXT · UTF-8"],
  ["email-signature.html", "توقيع البريد الإلكتروني", "Email signature", "HTML"],
  ["social-captions-and-video-scripts.txt", "نصوص مشاركة وسكربتات قصيرة", "Captions and short video scripts", "TXT · UTF-8"]
];

function renderIdentityClips(options) {
  const { english = false, esc } = options;
  const clips = [
    ["measurement", "النقرة والطلب المؤهل", "Clicks and qualified enquiries"],
    ["arabic-directory", "دليل عربي يبدأ بالمهمة", "An Arabic directory built around tasks"],
    ["identity", "هوية واحدة بين لغتين", "One identity across two languages"]
  ];
  return `<section class="id-section" id="short-videos"><div class="container">${sectionHead("VIDEO", english ? "SHORT PRACTICE NOTES" : "ملاحظات قصيرة بالفيديو", english ? "Three ideas, ready to watch and share." : "ثلاث أفكار جاهزة للمشاهدة والمشاركة.", english ? "Silent, captioned motion-graphic clips with Arabic text and English context. Each is approximately 23 seconds and connects to a full practice note." : "مقاطع توضيحية صامتة بنص عربي وسياق إنجليزي، مدة كل منها نحو 23 ثانية، وترتبط بملاحظات العمل الكاملة.")}<div class="id-video-grid">${clips.map(([slug, ar, en]) => `<article class="id-video-card"><video controls playsinline preload="none" poster="${identityAssetRoot}/clip-${slug}-poster.png" aria-label="${esc(english ? en : ar)}"><source src="${identityAssetRoot}/clip-${slug}.mp4" type="video/mp4"><track kind="captions" src="${identityAssetRoot}/clip-${slug}-ar.vtt" srclang="ar" label="العربية"><track kind="captions" src="${identityAssetRoot}/clip-${slug}-en.vtt" srclang="en" label="English"><a href="${identityAssetRoot}/clip-${slug}.mp4" download>${english ? "Download the clip" : "نزّل المقطع"}</a></video><div><h3>${esc(english ? en : ar)}</h3><a class="id-inline-link" href="${identityAssetRoot}/clip-${slug}.mp4" download data-identity-event="identity_download" data-identity-item="clip-${slug}">${english ? "Download MP4" : "نزّل MP4"}</a></div></article>`).join("")}</div></div></section>`;
}

export function renderMediaKit(options) {
  const { english = false, site, esc, icon } = options;
  const bios = Object.entries(professionalBios).map(([key, pair]) => {
    const names = { short: ["نبذة مختصرة", "Short biography"], medium: ["نبذة للتعريف المهني", "Professional introduction"], editorial: ["نبذة للقاءات والمقالات", "Editorial biography"] };
    return `<article class="id-bio"><div class="id-card-top"><h3>${label(names[key], english)}</h3><button type="button" data-copy-bio="bio-${key}" hidden>${english ? "Copy" : "انسخ"}${icon("code")}</button></div><p id="bio-${key}">${esc(label(pair, english))}</p></article>`;
  }).join("");
  return `<div class="identity-studio">${studioHero({ ...options, path: "/media-kit/", kicker: english ? "MEDIA KIT / BILINGUAL IDENTITY" : "ملف التعريف / هوية ثنائية اللغة", title: english ? "A clear introduction.<br><em>Ready to share.</em>" : "تعريف واضح،<br><em>وجاهز للمشاركة.</em>", lead: english ? "Approved biographies, portrait and logo references, social visuals and selected work for professional introductions, interviews and collaboration." : "نبذات معتمدة ومراجع الصورة والشعار وصور مشاركة وأعمال مختارة، للتعريف المهني واللقاءات والتعاون." })}
  <section class="id-section"><div class="container id-kit-opening"><div>${sectionHead("01", english ? "THE IDENTITY" : "الهوية", english ? "One name. A consistent introduction." : "اسم واحد، وتعريف متسق.", english ? "Use Eslam Elshikh in English and إسلام الشيخ in Arabic. Introductions connect cybersecurity and software delivery with AI workflows and local search." : "الاسم بالعربية إسلام الشيخ، وبالإنجليزية Eslam Elshikh. يربط التعريف الأمن السيبراني وتطوير البرمجيات ووكلاء الذكاء الاصطناعي بالظهور المحلي.")}<a class="id-action" href="${identityAssetRoot}/Eslam_Elshikh_Media_Kit_r2.zip" download data-identity-event="identity_download" data-identity-item="full-kit">${english ? "Download the complete kit" : "نزّل الحزمة كاملة"}${icon("arrow")}</a><p class="id-fine-print">${english ? "Includes PNG exports, editable SVG layouts, biographies, a profile PDF and usage notes." : "تضم صور PNG وقوالب SVG قابلة للتعديل ونبذات وملف PDF وإرشادات الاستخدام."}</p></div><figure class="id-kit-preview"><img src="${identityAssetRoot}/${english ? "share-en" : "share-ar"}-1200x630.png" width="1200" height="630" alt="${english ? "Eslam Elshikh professional sharing card" : "بطاقة التعريف المهنية لإسلام الشيخ"}" loading="lazy" decoding="async"><figcaption>${english ? "A shared visual language for professional introductions." : "لغة بصرية واحدة للتعريف المهني."}</figcaption></figure></div></section>
  <section class="id-section id-soft" id="biographies"><div class="container">${sectionHead("02", english ? "BIOGRAPHIES" : "النبذات", english ? "Choose the length that fits the occasion." : "اختر الطول المناسب للمناسبة.")}<div class="id-bio-list">${bios}</div><p class="id-copy-status" role="status" aria-live="polite" data-copy-status></p><a class="id-inline-link" href="${english ? "/media-kit/" : "/en/media-kit/"}#biographies">${english ? "View the Arabic biographies" : "استعرض النبذات الإنجليزية"}${icon("arrow")}</a></div></section>
  <section class="id-section" id="downloads"><div class="container">${sectionHead("03", english ? "DOWNLOADS" : "التنزيلات", english ? "Files for the places your identity appears." : "ملفات للمساحات التي تظهر فيها هويتك.", english ? "Artwork sizes are supplied as export dimensions. Keep essential text in the center and check each platform's current crop preview before applying a cover." : "المقاسات هنا أبعاد الملفات المصدّرة. حافظ على النص الأساسي في المنتصف، وراجع معاينة القص الحالية في المنصة قبل تطبيق الغلاف.")}<div class="id-download-grid">${mediaDownloads.map(([file, ar, en, format]) => `<a class="id-download" href="${identityAssetRoot}/${file}" download data-identity-event="identity_download" data-identity-item="${file.replace(/[^a-z0-9-]/gi, "-")}"><span>${icon(file.endsWith("png") ? "globe" : "code")}</span><strong>${esc(english ? en : ar)}</strong><small dir="ltr">${format}</small>${icon("arrow")}</a>`).join("")}</div></div></section>
  ${renderIdentityClips(options)}
  <section class="id-section id-soft" id="visual-language"><div class="container">${sectionHead("04", english ? "VISUAL LANGUAGE" : "اللغة البصرية", english ? "Calm, precise and recognizable." : "هادئة، دقيقة، ويمكن تمييزها.")}<div class="id-three-grid"><article class="id-membership"><span class="id-colour id-colour-navy" aria-hidden="true"></span><h3>${english ? "Midnight navy" : "كحلي عميق"}</h3><p dir="ltr">#102B37</p></article><article class="id-membership"><span class="id-colour id-colour-teal" aria-hidden="true"></span><h3>${english ? "Mineral teal" : "فيروزي معدني"}</h3><p dir="ltr">#167E78</p></article><article class="id-membership"><span class="id-colour id-colour-paper" aria-hidden="true"></span><h3>${english ? "Warm paper" : "ورقي دافئ"}</h3><p dir="ltr">#F7F5EF</p></article></div><div class="id-usage"><h3>${english ? "Portrait, logo and attribution" : "الصورة والشعار ونسبة العمل"}</h3><p>${english ? "Use the approved portrait and the complete existing logo with their original proportions. Keep clear space around both. Describe certifications by their exact names, and distinguish community membership from professional certification." : "استخدم الصورة المعتمدة والشعار الكامل الحالي بنسبهما الأصلية، مع مساحة واضحة حولهما. اذكر الشهادات بأسمائها المحددة، وافصل عضوية المجتمع عن الشهادة المهنية."}</p><div class="id-section-action"><a class="id-inline-link" href="/assets/brand/eslam-elshikh-portrait-20260827.webp" download>${english ? "Approved portrait" : "الصورة المعتمدة"}${icon("arrow")}</a><a class="id-inline-link" href="/assets/brand/eslam-elshikh-logo-transparent.png" download>${english ? "Complete logo" : "الشعار الكامل"}${icon("arrow")}</a></div></div></div></section>
  <section class="id-section" id="collaboration"><div class="container id-closing"><div>${sectionHead("05", english ? "EDITORIAL & PROFESSIONAL COLLABORATION" : "تعاون مهني وتحريري", english ? "Useful topics, grounded in the work." : "موضوعات مفيدة تستند إلى العمل.", english ? "Available topics include Arabic web experiences, responsible contact measurement, local-directory data and professional identity architecture. Project context and sources are available in the practice notes and case studies." : "تشمل موضوعات التعاون تجربة الويب العربي وقياس التواصل وبيانات الأدلة المحلية وبنية الهوية المهنية. تتوفر أمثلة التنفيذ والمصادر في الملاحظات ودراسات الحالة.")}<a class="id-inline-link" href="${prefix(english)}/notes/">${english ? "Explore the topics" : "استعرض الموضوعات"}${icon("arrow")}</a></div><div class="id-contact-block"><a href="mailto:${site.email}">${site.email}</a><a href="${prefix(english)}/about/">${english ? "Professional profile" : "الملف المهني"}</a><a href="/eslam-elshikh.vcf" download>${english ? "Save contact details" : "احفظ بيانات التواصل"}</a></div></div></section></div>`;
}
