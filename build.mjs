import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { site, services, projects, posts } from "./src/content.mjs";

const root = dirname(fileURLToPath(import.meta.url));

const esc = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const icons = {
  shield: '<path d="M12 3 5 6v5c0 4.7 2.8 8.1 7 10 4.2-1.9 7-5.3 7-10V6l-7-3Z"/><path d="m9.4 12 1.7 1.7 3.8-4"/>',
  cloud: '<path d="M7.5 18h9.7a3.8 3.8 0 0 0 .5-7.6 6 6 0 0 0-11.5-1.7A4.7 4.7 0 0 0 7.5 18Z"/><path d="M12 11v5m-2-2 2 2 2-2"/>',
  spark: '<path d="m12 3 .9 3.1A4.2 4.2 0 0 0 15.8 9l3.2 1-3.2 1a4.2 4.2 0 0 0-2.9 2.9L12 17l-.9-3.1A4.2 4.2 0 0 0 8.2 11L5 10l3.2-1a4.2 4.2 0 0 0 2.9-2.9L12 3Z"/><path d="m18.5 15 .4 1.2a2 2 0 0 0 1.3 1.3l1.3.5-1.3.4a2 2 0 0 0-1.3 1.3l-.4 1.3-.5-1.3a2 2 0 0 0-1.3-1.3l-1.2-.4 1.2-.5a2 2 0 0 0 1.3-1.3l.5-1.2Z"/>',
  code: '<path d="m8.5 8-4 4 4 4M15.5 8l4 4-4 4M14 5l-4 14"/>',
  google: '<path d="M20 12.2c0-.7-.1-1.4-.2-2.1H12v4h4.5a3.9 3.9 0 0 1-1.7 2.5v2.6h2.8c1.7-1.6 2.4-3.9 2.4-7Z"/><path d="M12 20.3c2.4 0 4.4-.8 5.9-2.1l-3-2.4c-.8.6-1.8.9-2.9.9a5.2 5.2 0 0 1-4.9-3.6H4v2.7a8.9 8.9 0 0 0 8 4.5Z"/><path d="M7.1 13.1a5.4 5.4 0 0 1 0-3.3V7.1H4a8.8 8.8 0 0 0 0 8.7l3.1-2.7Z"/><path d="M12 6.3c1.3 0 2.5.5 3.4 1.4L18 5.1A8.7 8.7 0 0 0 4 7.1l3.1 2.7A5.2 5.2 0 0 1 12 6.3Z"/>',
  pin: '<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  nodes: '<circle cx="6" cy="7" r="2.5"/><circle cx="18" cy="7" r="2.5"/><circle cx="12" cy="18" r="2.5"/><path d="m8.1 8.4 2.5 7.2m5.3-7.2-2.5 7.2M8.5 7h7"/>',
  chart: '<path d="M4 20V10m6 10V4m6 16v-7m4 7H2"/><path d="m4 8 5-4 6 5 5-4"/>',
  megaphone: '<path d="M4 13v-2a2 2 0 0 1 2-2h3l8-4v14l-8-4H6a2 2 0 0 1-2-2Z"/><path d="m9 15 1 5H7l-1-5m14-6a4 4 0 0 1 0 6"/>',
  arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  phone: '<path d="M7 3H4a1 1 0 0 0-1 1c0 9.4 7.6 17 17 17a1 1 0 0 0 1-1v-3l-4-1-1 2c-4.2-1.2-7.8-4.8-9-9l2-1-1-4-1-1Z"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  home: '<path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5h6v2m-12 5h18M10 12v2h4v-2"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  book: '<path d="M4 4h10a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3V4Z"/><path d="M7 16h10m0-9h3v13h-3"/>',
  external: '<path d="M14 4h6v6m0-6-9 9"/><path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6"/>',
  whatsapp: '<path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.4-4A8 8 0 1 1 20 11.5Z"/><path d="M8.5 8.2c.3 3 2.4 5.4 5.5 6.2.8.2 1.6-.5 1.8-1.2l-2.2-1-1 1c-1.4-.7-2.5-1.8-3.2-3.2l1-1-1-2.2c-.5.2-1 .7-.9 1.4Z"/>',
  eye: '<path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/>'
};

function icon(name, className = "icon") {
  return `<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${icons[name] ?? icons.shield}</svg>`;
}

function header(active = "") {
  const nav = [
    ["home", "/", "الرئيسية"],
    ["services", "/services/", "الخدمات"],
    ["projects", "/projects/", "الأعمال"],
    ["about", "/about/", "عن إسلام"],
    ["google", "/google-expert/", "خبرة Google"],
    ["blog", "/blog/", "المدونة"]
  ];
  const links = nav.map(([key, href, label]) => `<a href="${href}"${active === key ? ' aria-current="page" class="is-active"' : ""}>${label}</a>`).join("");
  return `
    <a class="skip-link" href="#main">انتقل إلى المحتوى</a>
    <header class="site-header" data-header>
      <div class="container header-inner">
        <a class="brand" href="/" aria-label="${site.nameAr} — الصفحة الرئيسية">
          <span class="brand-mark" aria-hidden="true"><span>ES</span></span>
          <span><strong>${site.nameAr}</strong><small>${site.nameEn}</small></span>
        </a>
        <nav class="desktop-nav" aria-label="التنقل الرئيسي">${links}</nav>
        <a class="button button-small header-cta" href="/contact/">ابدأ مشروعك ${icon("arrow", "button-icon")}</a>
        <button class="menu-toggle" type="button" aria-label="فتح القائمة" aria-expanded="false" aria-controls="mobile-menu" data-menu-toggle>
          <span class="menu-open">${icon("menu")}</span><span class="menu-close">${icon("close")}</span>
        </button>
      </div>
      <nav class="mobile-menu" id="mobile-menu" aria-label="قائمة الجوال" data-mobile-menu>${links}<a class="button" href="/contact/">ابدأ مشروعك</a></nav>
    </header>`;
}

function footer() {
  return `
    <footer class="site-footer">
      <div class="container footer-grid">
        <div class="footer-intro">
          <a class="brand" href="/"><span class="brand-mark" aria-hidden="true"><span>ES</span></span><span><strong>${site.nameAr}</strong><small>${site.nameEn}</small></span></a>
          <p>حلول رقمية تجمع الأمن السيبراني والبرمجة والذكاء الاصطناعي وخبرة Google والسيو في تجربة واحدة مترابطة.</p>
          <div class="social-row">
            <a href="${site.social.github}" target="_blank" rel="noopener" aria-label="GitHub">GH</a>
            <a href="${site.social.linkedin}" target="_blank" rel="noopener" aria-label="LinkedIn">in</a>
            <a href="${site.social.x}" target="_blank" rel="noopener" aria-label="X">X</a>
            <a href="${site.social.youtube}" target="_blank" rel="noopener" aria-label="YouTube">YT</a>
          </div>
        </div>
        <div><h2>روابط سريعة</h2><a href="/about/">عن إسلام</a><a href="/projects/">الأعمال</a><a href="/google-expert/">خبرة Google</a><a href="/blog/">المدونة</a></div>
        <div><h2>خدمات رئيسية</h2><a href="/services/cybersecurity/">الأمن السيبراني</a><a href="/services/ai-agents/">وكلاء الذكاء الاصطناعي</a><a href="/services/web-development/">تطوير المواقع والتطبيقات</a><a href="/services/google-business-profile/">ملفات Google التجارية</a><a href="/services/seo/">تحسين محركات البحث</a></div>
        <div><h2>تواصل</h2><a dir="ltr" href="tel:${site.phone}">${site.phoneDisplay}</a><a href="mailto:${site.email}">${site.email}</a><span>${site.city}، ${site.country}</span><a href="${site.whatsapp}" target="_blank" rel="noopener">تواصل عبر WhatsApp</a></div>
      </div>
      <div class="container footer-bottom"><p>© ${new Date().getFullYear()} ${site.nameAr}. جميع الحقوق محفوظة.</p><p>تصميم وتطوير ${site.nameEn}</p></div>
    </footer>
    <a class="floating-whatsapp" href="${site.whatsapp}?text=${encodeURIComponent("مرحبًا م. إسلام، أريد مناقشة خدمة تقنية")}" target="_blank" rel="noopener" aria-label="تواصل مع إسلام الشيخ عبر WhatsApp">${icon("whatsapp")}<span>تواصل مباشر</span></a>
    <nav class="mobile-bottom-nav" aria-label="تنقل سريع للجوال">
      <a href="/">${icon("home")}<span>الرئيسية</span></a>
      <a href="/services/">${icon("briefcase")}<span>الخدمات</span></a>
      <a href="/projects/">${icon("eye")}<span>الأعمال</span></a>
      <a href="/contact/">${icon("mail")}<span>تواصل</span></a>
    </nav>`;
}

function schemaScript(data) {
  return `<script type="application/ld+json">${JSON.stringify(data).replaceAll("<", "\\u003c")}</script>`;
}

function layout({ title, description, path = "/", active = "", body, schema = [], type = "website", image = "/assets/og/eslam-elshikh-og.png" }) {
  const canonical = `${site.url}${path === "/" ? "/" : path}`;
  const pageTitle = title.includes(site.nameAr) ? title : `${title} | ${site.nameAr}`;
  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(pageTitle)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta name="theme-color" content="#08131f">
  <link rel="canonical" href="${canonical}">
  <link rel="icon" href="/assets/icons/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/assets/icons/apple-touch-icon.png">
  <link rel="manifest" href="/manifest.webmanifest">
  <meta property="og:locale" content="ar_SA">
  <meta property="og:type" content="${type}">
  <meta property="og:site_name" content="${site.nameAr} | ${site.nameEn}">
  <meta property="og:title" content="${esc(pageTitle)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${site.url}${image}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(pageTitle)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${site.url}${image}">
  <link rel="stylesheet" href="/assets/css/main.css">
${schema.map(schemaScript).join("\n")}
</head>
<body>
${header(active).trim()}
  <main id="main">${body}</main>
${footer().trim()}
  <script src="/assets/js/main.js" defer></script>
</body>
</html>`;
}

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${site.url}/#person`,
  name: site.nameAr,
  alternateName: [site.nameEn, "Islam Elshikh", "Eslam El Sheikh"],
  url: site.url,
  image: `${site.url}/assets/og/eslam-elshikh-og.png`,
  jobTitle: ["مهندس أمن سيبراني", "مطور برمجيات", "خبير منتجات Google"],
  description: site.description,
  email: `mailto:${site.email}`,
  telephone: site.phone,
  workLocation: { "@type": "Place", name: site.city },
  knowsAbout: ["Cybersecurity", "Software Development", "Artificial Intelligence Agents", "Google Business Profile", "Search Engine Optimization", "Cloud Solutions"],
  sameAs: Object.values(site.social)
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${site.url}/#website`,
  url: site.url,
  name: `${site.nameAr} | ${site.nameEn}`,
  inLanguage: "ar-SA",
  publisher: { "@id": `${site.url}/#person` }
};

const breadcrumbs = (items) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: `${site.url}${item.path}` }))
});

function eyebrow(text) { return `<span class="eyebrow"><span></span>${text}</span>`; }
function sectionHead(kicker, title, text = "") { return `<div class="section-head reveal">${eyebrow(kicker)}<h2>${title}</h2>${text ? `<p>${text}</p>` : ""}</div>`; }
function serviceCard(s) {
  return `<article class="service-card reveal"><div class="service-card-top"><span class="service-number">${s.number}</span><span class="service-icon">${icon(s.icon)}</span></div><p class="service-group">${s.group}</p><h3><a href="/services/${s.slug}/">${s.title}</a></h3><p>${s.short}</p><a class="text-link" href="/services/${s.slug}/">تفاصيل الخدمة ${icon("arrow")}</a></article>`;
}
function projectCard(p) {
  return `<article class="project-card reveal"><div class="project-visual"><span>${p.category}</span><div class="project-lines" aria-hidden="true"></div></div><div class="project-content"><h3>${p.title}</h3><p>${p.description}</p><div class="tag-row">${p.tags.map(tag => `<span>${tag}</span>`).join("")}</div><a class="text-link" href="${p.url}" target="_blank" rel="noopener">معاينة المشروع ${icon("external")}</a></div></article>`;
}
function postCard(p) {
  return `<article class="post-card reveal"><a class="post-art post-art-${p.relatedService}" href="/blog/${p.slug}/" aria-label="اقرأ: ${p.title}"><span>${p.category}</span>${icon(services.find(s => s.slug === p.relatedService)?.icon ?? "book", "post-icon")}</a><div class="post-meta"><time datetime="${p.date}">${new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium" }).format(new Date(`${p.date}T12:00:00Z`))}</time><span>${p.readTime}</span></div><h3><a href="/blog/${p.slug}/">${p.title}</a></h3><p>${p.excerpt}</p><a class="text-link" href="/blog/${p.slug}/">اقرأ المقال ${icon("arrow")}</a></article>`;
}

function homePage() {
  const grouped = ["الأمن والحلول المتقدمة", "البرمجة والذكاء الاصطناعي", "خدمات Google", "التسويق والبحث الذكي"];
  const groupTabs = grouped.map((g, i) => `<button type="button" role="tab" aria-selected="${i === 0}" data-service-filter="${g}">${g}</button>`).join("");
  const faq = [
    ["ما نوع المشروعات التي تعمل عليها؟", "أعمل مع الشركات وأصحاب الأعمال على مشروعات الأمن السيبراني، تطوير المواقع والتطبيقات، وكلاء الذكاء الاصطناعي، حلول Google والسيو والإعلانات، مع تحديد نطاق مناسب لكل مشروع."],
    ["هل يمكن جمع أكثر من خدمة في مشروع واحد؟", "نعم، وهذه إحدى نقاط القوة الرئيسية. يمكن مثلًا بناء موقع آمن، ثم تهيئته للسيو وربطه بملف Google ونظام قياس وحملة تسويق ضمن خطة مترابطة."],
    ["كيف تبدأ الاستشارة؟", "ترسل وصفًا مختصرًا للهدف والوضع الحالي والموعد المتوقع. بعد ذلك نحدد مكالمة أو محادثة تشخيصية، ثم نطاق العمل والمخرجات والخطوات."],
    ["هل تقدم خدماتك داخل الرياض فقط؟", "أعمل من الرياض وأقدم معظم الخدمات التقنية عن بُعد داخل السعودية وخارجها، بينما تختلف متطلبات الزيارات الميدانية حسب نوع المشروع."]
  ];
  return layout({
    title: "إسلام الشيخ | أمن سيبراني وتطوير برمجيات وخدمات Google",
    description: site.description,
    active: "home",
    schema: [personSchema, websiteSchema, { "@context":"https://schema.org", "@type":"FAQPage", mainEntity: faq.map(([q,a])=>({"@type":"Question",name:q,acceptedAnswer:{"@type":"Answer",text:a}})) }],
    body: `
      <section class="hero section-pad">
        <div class="hero-grid container">
          <div class="hero-copy reveal">
            ${eyebrow("مهندس أمن سيبراني · مطور برمجيات · خبير منتجات Google")}
            <h1>أهندس حلولًا رقمية <span>آمنة وذكية</span> تنمو مع أعمالك</h1>
            <p class="hero-lead">أنا إسلام الشيخ. أجمع الأمن السيبراني والبرمجة والذكاء الاصطناعي وخبرة Google والسيو لبناء أنظمة وتجارب رقمية متماسكة من الاستراتيجية إلى الإطلاق.</p>
            <div class="hero-actions"><a class="button" href="/contact/">ناقش مشروعك ${icon("arrow", "button-icon")}</a><a class="button button-ghost" href="/services/">استكشف الخدمات</a></div>
            <div class="hero-proof"><a href="${site.social.googleDeveloper}" target="_blank" rel="noopener"><span class="proof-dot proof-google"></span>ملف Google للمطورين</a><a href="${site.social.wikidata}" target="_blank" rel="noopener"><span class="proof-dot"></span>Wikidata Q138800449</a></div>
          </div>
          <div class="hero-visual reveal" aria-label="تصور يجمع الأمن السيبراني والبرمجة والذكاء الاصطناعي">
            <div class="visual-grid" aria-hidden="true"></div>
            <div class="orbit orbit-one"><span>AI</span><span>SEO</span><span>Cloud</span></div>
            <div class="orbit orbit-two"><span>Secure</span><span>Google</span></div>
            <div class="core-mark"><div class="core-shield">${icon("shield", "core-icon")}<strong>ES</strong></div><p>Secure Digital<br>Engineering</p></div>
          </div>
        </div>
        <div class="container stats-bar reveal">
          <div><strong>472</strong><span>مساهمة في توثيق ملفات Google</span></div>
          <div><strong>233</strong><span>مشكلة ملف تجاري تمت معالجتها</span></div>
          <div><strong>9</strong><span>مسارات خدمة مترابطة</span></div>
          <div><strong>360°</strong><span>رؤية أمنية وتقنية وتسويقية</span></div>
        </div>
      </section>
      <section class="section-pad services-section" id="services">
        <div class="container">
          ${sectionHead("الخدمات", "خبرة متعددة التخصصات حول هدف واحد", "بدل التعامل مع الأمن والتطوير والتسويق كجزر منفصلة، تُبنى الحلول ضمن رحلة رقمية واحدة قابلة للقياس والتوسع.")}
          <div class="service-filters" role="tablist" aria-label="تصنيفات الخدمات">${groupTabs}</div>
          <div class="services-grid" data-services-grid>${services.map(serviceCard).join("")}</div>
          <div class="section-action"><a class="button button-ghost" href="/services/">عرض جميع الخدمات ${icon("arrow", "button-icon")}</a></div>
        </div>
      </section>
      <section class="section-pad approach-section">
        <div class="container approach-grid">
          <div class="approach-copy reveal">${eyebrow("لماذا هذا النهج؟")}<h2>المشروع القوي لا يكتفي بواجهة جميلة</h2><p>يجب أن يكون مفهومًا للمستخدم، آمنًا في التشغيل، قابلًا للفهرسة، ومهيأً للتحسين بعد الإطلاق. لذلك أتعامل مع كل طبقة بوصفها جزءًا من المنتج نفسه.</p><a class="text-link" href="/about/">تعرف على منهجية العمل ${icon("arrow")}</a></div>
          <div class="pillars">
            <article class="pillar reveal"><span>01</span>${icon("shield")}<h3>Secure by design</h3><p>الأمان والصلاحيات والبيانات تُراجع من البداية، لا بعد حدوث المشكلة.</p></article>
            <article class="pillar reveal"><span>02</span>${icon("code")}<h3>Built for people</h3><p>بنية واضحة وتجربة متجاوبة تجعل الوصول إلى القرار أسهل على كل جهاز.</p></article>
            <article class="pillar reveal"><span>03</span>${icon("chart")}<h3>Ready to grow</h3><p>قياس وسيو ومحتوى يجعل التحسين المستمر جزءًا من التشغيل.</p></article>
          </div>
        </div>
      </section>
      <section class="section-pad projects-section"><div class="container">${sectionHead("مختارات من الأعمال", "مشروعات تحوّل الهدف التجاري إلى تجربة رقمية", "نماذج عامة من مشروعات منشورة في تطوير المواقع وتحسين البحث المحلي وبناء بنية محتوى قابلة للتوسع.")}<div class="projects-grid">${projects.map(projectCard).join("")}</div><div class="section-action"><a class="button button-ghost" href="/projects/">كل الأعمال ${icon("arrow", "button-icon")}</a></div></div></section>
      <section class="section-pad process-section"><div class="container">${sectionHead("مسار العمل", "وضوح من أول سؤال حتى ما بعد الإطلاق")}<ol class="process-list"><li class="reveal"><span>01</span><h3>تشخيص الهدف</h3><p>نفهم المستخدم والنتيجة والقيود والمخاطر قبل اختيار الأدوات.</p></li><li class="reveal"><span>02</span><h3>تصميم الحل</h3><p>نحدد البنية والمحتوى والنطاق والمخرجات ومعيار القبول.</p></li><li class="reveal"><span>03</span><h3>تنفيذ قابل للمراجعة</h3><p>نبني على مراحل قصيرة مع اختبارات وقرارات موثقة.</p></li><li class="reveal"><span>04</span><h3>إطلاق وتحسين</h3><p>نراقب المؤشرات ونغلق الملاحظات ونرتب فرص التطوير.</p></li></ol></div></section>
      <section class="section-pad blog-section"><div class="container">${sectionHead("من المدونة", "معرفة عملية للقرارات التقنية المعقدة")}<div class="posts-grid">${posts.map(postCard).join("")}</div><div class="section-action"><a class="button button-ghost" href="/blog/">استكشف المدونة ${icon("arrow", "button-icon")}</a></div></div></section>
      <section class="section-pad faq-section"><div class="container faq-grid"><div class="faq-intro reveal">${eyebrow("الأسئلة الشائعة")}<h2>إجابات واضحة قبل بدء المشروع</h2><p>إذا كانت حالتك مختلفة، أرسل ملخصًا وسأقترح نقطة البداية المناسبة.</p><a class="button button-ghost" href="/contact/">أرسل تفاصيل مشروعك</a></div><div class="accordion">${faq.map(([q,a],i)=>`<details class="reveal"${i===0?" open":""}><summary>${q}<span>+</span></summary><p>${a}</p></details>`).join("")}</div></div></section>
      ${ctaSection()}`
  });
}

function ctaSection() {
  return `<section class="section-pad final-cta"><div class="container"><div class="cta-panel reveal"><div>${eyebrow("لديك تحدٍ تقني؟")}<h2>لنحوّل التعقيد إلى خطة واضحة قابلة للتنفيذ</h2><p>أرسل الهدف، الوضع الحالي، والموعد المتوقع. ستحصل على تشخيص أولي ونقطة بداية مناسبة.</p></div><div class="cta-actions"><a class="button button-light" href="/contact/">ابدأ الآن ${icon("arrow", "button-icon")}</a><a class="cta-phone" href="tel:${site.phone}" dir="ltr">${site.phoneDisplay}</a></div></div></div></section>`;
}

function pageHero(kicker, title, description, extra = "") {
  return `<section class="page-hero"><div class="container page-hero-grid"><div class="reveal">${eyebrow(kicker)}<h1>${title}</h1><p>${description}</p>${extra}</div><div class="page-hero-mark reveal"><span>ES</span><div></div></div></div></section>`;
}

function servicesPage() {
  return layout({ title:"الخدمات التقنية المتكاملة", description:"خدمات إسلام الشيخ في الأمن السيبراني والحلول السحابية ووكلاء الذكاء الاصطناعي وتطوير المواقع وخدمات Google والسيو والإعلانات.", path:"/services/", active:"services", schema:[personSchema, breadcrumbs([{name:"الرئيسية",path:"/"},{name:"الخدمات",path:"/services/"}])], body:`${pageHero("الخدمات", "حلول تقنية مترابطة من الحماية إلى النمو", "اختر الخدمة الأقرب لهدفك، أو ابدأ باستشارة تشخيصية إذا كان التحدي يجمع أكثر من مسار.", `<a class="button" href="/contact/">اطلب تشخيصًا أوليًا ${icon("arrow", "button-icon")}</a>`)}<section class="section-pad"><div class="container"><div class="services-grid services-grid-all">${services.map(serviceCard).join("")}</div></div></section><section class="section-pad compact-section"><div class="container split-callout reveal"><div><h2>لا تعرف أي خدمة تحتاج؟</h2><p>قد يكون أصل المشكلة في البنية أو البيانات أو تجربة المستخدم لا في الأداة الظاهرة. ابدأ بوصف النتيجة المطلوبة وسأساعدك على تحديد النطاق.</p></div><a class="button button-ghost" href="/contact/">ناقش التحدي</a></div></section>${ctaSection()}` });
}

function servicePage(s) {
  const path = `/services/${s.slug}/`;
  const serviceSchema = { "@context":"https://schema.org", "@type":"Service", "@id":`${site.url}${path}#service`, name:s.title, description:s.meta, provider:{"@id":`${site.url}/#person`}, areaServed:[{"@type":"City",name:"Riyadh"},{"@type":"Country",name:"Saudi Arabia"}], url:`${site.url}${path}` };
  const faqSchema = { "@context":"https://schema.org", "@type":"FAQPage", mainEntity:s.faq.map(([q,a])=>({"@type":"Question",name:q,acceptedAnswer:{"@type":"Answer",text:a}})) };
  return layout({ title:s.title, description:s.meta, path, active:"services", schema:[personSchema,serviceSchema,faqSchema,breadcrumbs([{name:"الرئيسية",path:"/"},{name:"الخدمات",path:"/services/"},{name:s.title,path}])], body:`
    <section class="service-hero"><div class="container service-hero-grid"><div class="reveal">${eyebrow(s.group)}<span class="service-hero-number">${s.number}</span><h1>${s.title}</h1><p>${s.intro}</p><div class="hero-actions"><a class="button" href="/contact/?service=${s.slug}">اطلب الخدمة ${icon("arrow", "button-icon")}</a><a class="button button-ghost" href="${site.whatsapp}?text=${encodeURIComponent(`مرحبًا م. إسلام، أريد الاستفسار عن خدمة ${s.title}`)}" target="_blank" rel="noopener">تحدث عبر WhatsApp</a></div></div><div class="service-emblem reveal"><span>${icon(s.icon, "service-emblem-icon")}</span><p>${s.group}</p></div></div></section>
    <section class="section-pad"><div class="container detail-grid"><div class="detail-copy reveal">${eyebrow("القيمة التي تحصل عليها")}<h2>مخرجات مفهومة وقابلة للمتابعة</h2><p>يُضبط النطاق بعد فهم حالتك، مع تعريف واضح للمخرجات والمسؤوليات وحدود الخدمة قبل بدء التنفيذ.</p></div><ul class="check-list">${s.outcomes.map(x=>`<li class="reveal">${icon("check")}<span>${x}</span></li>`).join("")}</ul></div></section>
    <section class="section-pad muted-section"><div class="container">${sectionHead("نطاق الخدمة", "ما الذي يمكن أن يشمله المشروع؟", "تُختار العناصر المناسبة فقط وفق الاحتياج، حتى يبقى المشروع مركزًا وقابلًا للقياس.")}<div class="scope-grid">${s.scope.map((x,i)=>`<article class="scope-card reveal"><span>${String(i+1).padStart(2,"0")}</span><h3>${x}</h3></article>`).join("")}</div></div></section>
    <section class="section-pad"><div class="container">${sectionHead("آلية التنفيذ", "أربع مراحل تبقي القرار واضحًا")}<ol class="service-steps">${s.steps.map((x,i)=>`<li class="reveal"><span>${String(i+1).padStart(2,"0")}</span><h3>${x}</h3></li>`).join("")}</ol></div></section>
    <section class="section-pad faq-section"><div class="container faq-grid"><div class="faq-intro reveal">${eyebrow("أسئلة الخدمة")}<h2>قبل أن تبدأ</h2><p>تفاصيل النطاق والمدة تعتمد على حجم النظام والوضع الحالي والأطراف المشاركة.</p></div><div class="accordion">${s.faq.map(([q,a],i)=>`<details class="reveal"${i===0?" open":""}><summary>${q}<span>+</span></summary><p>${a}</p></details>`).join("")}</div></div></section>
    ${ctaSection()}` });
}

function aboutPage() {
  return layout({ title:"عن إسلام الشيخ", description:"تعرف على إسلام الشيخ، مهندس أمن سيبراني ومطور برمجيات وخبير منتجات Google يعمل من الرياض على حلول رقمية آمنة وذكية.", path:"/about/", active:"about", schema:[personSchema,breadcrumbs([{name:"الرئيسية",path:"/"},{name:"عن إسلام",path:"/about/"}])], body:`${pageHero("عن إسلام", "أربط التقنية بالقرار التجاري، دون فقدان الدقة", "مهندس أمن سيبراني ومطور برمجيات وخبير منتجات Google أعمل من الرياض على تحويل المشكلات المعقدة إلى حلول قابلة للفهم والتنفيذ والقياس.")}<section class="section-pad"><div class="container bio-grid"><div class="bio-panel reveal"><div class="bio-monogram">ES</div><p>Cybersecurity<br>Software<br>Google<br>AI & Search</p></div><div class="bio-copy reveal">${eyebrow("الملف المهني")}<h2>خبرة تقنية عابرة للتخصصات</h2><p>لا أنظر إلى الموقع أو النظام بوصفه كودًا فقط. الأمان، تجربة المستخدم، البنية السحابية، طريقة ظهور المحتوى في البحث، ومسار تواصل العميل كلها أجزاء تؤثر في النتيجة النهائية.</p><p>عملي يركز على الحلول القابلة للتطبيق: نطاق واضح، قرارات موثقة، أقل تعقيد ممكن، واختبارات مناسبة للمخاطر. وعندما يكون القرار بيد منصة خارجية مثل Google، ألتزم بالمسارات الرسمية دون تقديم وعود لا يمكن ضمانها.</p><div class="credentials"><a href="${site.social.googleDeveloper}" target="_blank" rel="noopener">ملف Google للمطورين ${icon("external")}</a><a href="${site.social.wikidata}" target="_blank" rel="noopener">Wikidata ${icon("external")}</a><a href="${site.social.github}" target="_blank" rel="noopener">GitHub ${icon("external")}</a></div></div></div></section><section class="section-pad muted-section"><div class="container">${sectionHead("مبادئ العمل", "ما الذي يحكم القرارات داخل المشروع؟")}<div class="values-grid"><article class="reveal"><span>01</span><h3>الدليل قبل الانطباع</h3><p>أفصل بين ما تم التحقق منه، وما هو استنتاج، وما يحتاج اختبارًا إضافيًا.</p></article><article class="reveal"><span>02</span><h3>الأمان حسب المخاطر</h3><p>لا أضيف تعقيدًا بلا سبب، ولا أتنازل عن الضوابط التي تحمي الأصول الحساسة.</p></article><article class="reveal"><span>03</span><h3>المستخدم في المركز</h3><p>جودة الحل تظهر في سهولة فهمه واستخدامه والوصول إلى نتيجته.</p></article><article class="reveal"><span>04</span><h3>قابلية التطوير</h3><p>التوثيق والبنية النظيفة والقياس تجعل التحسين اللاحق أسرع وأقل مخاطرة.</p></article></div></div></section><section class="section-pad"><div class="container skills-panel reveal"><div>${eyebrow("مجالات الخبرة")}<h2>من الدفاع الرقمي إلى تجربة البحث</h2></div><div class="skills-cloud">${["Cybersecurity","Secure Web Development","Cloud Solutions","AI Agents","RAG & Knowledge Bases","Google Business Profile","Technical SEO","Local SEO","GitHub","Firebase","Digital Advertising","Structured Data"].map(x=>`<span>${x}</span>`).join("")}</div></div></section>${ctaSection()}` });
}

function googlePage() {
  return layout({ title:"خبير منتجات Google ودعم الملفات التجارية", description:"خبرة إسلام الشيخ في دعم منتجات Google وملفات الأنشطة التجارية: تشخيص المشكلات والتوثيق والظهور على الخرائط وفق الإرشادات الرسمية.", path:"/google-expert/", active:"google", schema:[personSchema,breadcrumbs([{name:"الرئيسية",path:"/"},{name:"خبرة Google",path:"/google-expert/"}])], body:`${pageHero("خبرة Google", "تشخيص منظم بدل التجارب العشوائية", "خبرة عملية في ملفات Google التجارية ودعم المستخدمين، مع التزام واضح بالسياسات والمسارات الرسمية وشرح ما يمكن التحكم فيه وما يظل قرارًا للمنصة.", `<a class="button" href="${site.social.googleDeveloper}" target="_blank" rel="noopener">عرض ملف Google ${icon("external", "button-icon")}</a>`)}<section class="section-pad"><div class="container google-stats"><article class="reveal"><strong>472</strong><h2>مساهمة في التوثيق</h2><p>خبرة تراكمية في تجهيز ومراجعة حالات ملفات الأنشطة التجارية.</p></article><article class="reveal"><strong>233</strong><h2>مشكلة تمت معالجتها</h2><p>تشخيص حالات تتعلق بالتحقق والتعليق والتكرار والبيانات والظهور.</p></article><article class="reveal"><strong>100%</strong><h2>شفافية في المسار</h2><p>لا كلمات مرور، لا ضمان لقرارات Google، ولا وعود بتجاوز السياسات.</p></article></div></section><section class="section-pad muted-section"><div class="container approach-grid"><div class="approach-copy reveal">${eyebrow("حدود الدور")}<h2>خبرة مستقلة موثقة، وليست تمثيلًا لشركة Google</h2><p>أقدّم استشارات مستقلة اعتمادًا على الخبرة في المنتجات والإرشادات العامة. لا يعني ذلك أنني موظف لدى Google أو أتحكم في قرارات المراجعة أو الاستعادة. هذا الفصل مهم لحماية العميل وبناء توقعات صحيحة.</p><a class="text-link" href="/services/google-support/">استشارات منتجات Google ${icon("arrow")}</a></div><div class="pillars"><article class="pillar reveal">${icon("google")}<h3>قراءة الحالة</h3><p>فهم الإشعار والتغييرات السابقة وما إذا كانت المشكلة سياسة أم بيانات أم صلاحيات.</p></article><article class="pillar reveal">${icon("nodes")}<h3>تنظيم الأدلة</h3><p>تحديد المستندات والصور والروابط المطلوبة وربطها بالنقطة التي تثبتها.</p></article><article class="pillar reveal">${icon("chart")}<h3>متابعة واعية</h3><p>تسجيل ما تم إرساله ومتى، وتجنب التعديلات المتكررة التي تربك الحالة.</p></article></div></div></section><section class="section-pad"><div class="container split-callout reveal"><div><h2>لديك مشكلة في ملف Google التجاري؟</h2><p>لا ترسل كلمات مرور أو رموز تحقق. جهّز رابط الملف، نص الإشعار، وتسلسل ما حدث، ثم أرسل ملخص الحالة.</p></div><a class="button" href="/contact/?service=google-business-profile">ابدأ التشخيص</a></div></section>${ctaSection()}` });
}

function projectsPage() {
  return layout({ title:"مشروعات وأعمال رقمية", description:"نماذج من أعمال إسلام الشيخ في تطوير المواقع وتجربة المستخدم والسيو المحلي والبيانات المنظمة والهوية الرقمية للمشروعات السعودية.", path:"/projects/", active:"projects", schema:[personSchema,breadcrumbs([{name:"الرئيسية",path:"/"},{name:"الأعمال",path:"/projects/"}])], body:`${pageHero("الأعمال", "مشروعات مبنية حول النتيجة، لا حول القالب", "مختارات من أعمال منشورة تركز على هندسة المحتوى وتجربة الجوال والتحويل والسيو التقني والمحلي.")}<section class="section-pad"><div class="container projects-grid projects-grid-page">${projects.map(projectCard).join("")}</div></section><section class="section-pad muted-section"><div class="container">${sectionHead("ما وراء الواجهة", "ما الذي أراجعه في كل مشروع ويب؟")}<div class="values-grid"><article class="reveal"><span>UX</span><h3>رحلة المستخدم</h3><p>وضوح الخدمة والثقة ودعوة الإجراء وترتيب المعلومات على الجوال.</p></article><article class="reveal"><span>SEO</span><h3>قابلية الاكتشاف</h3><p>بنية العناوين والروابط والميتا والـSchema والفهرسة والأداء.</p></article><article class="reveal"><span>SEC</span><h3>أساس آمن</h3><p>تقليل التبعيات وضبط النشر وعدم تعريض الأسرار أو المدخلات.</p></article><article class="reveal"><span>OPS</span><h3>قابلية التشغيل</h3><p>ملفات مشروع منظمة وتوثيق وتشغيل وتحديث يمكن متابعتهما.</p></article></div></div></section>${ctaSection()}` });
}

function blogPage() {
  return layout({ title:"المدونة التقنية", description:"مقالات إسلام الشيخ عن الأمن السيبراني ووكلاء الذكاء الاصطناعي وتطوير المواقع وخدمات Google وSEO والبحث الذكي.", path:"/blog/", active:"blog", schema:[websiteSchema,breadcrumbs([{name:"الرئيسية",path:"/"},{name:"المدونة",path:"/blog/"}])], body:`${pageHero("المدونة", "محتوى تقني يساعدك على اتخاذ قرار أفضل", "مقالات عملية تشرح المخاطر والخيارات والخطوات في الأمن السيبراني والذكاء الاصطناعي وتطوير الويب ومنتجات Google والسيو.")}<section class="section-pad"><div class="container posts-grid posts-grid-page">${posts.map(postCard).join("")}</div></section><section class="section-pad compact-section"><div class="container external-blog reveal"><div>${eyebrow("الأرشيف السابق")}<h2>مقالات إضافية على المدونة الخارجية</h2><p>يمكنك أيضًا استكشاف المقالات المنشورة سابقًا حول خرائط Google وملفات الأنشطة التجارية والممارسات الرقمية.</p></div><a class="button button-ghost" href="${site.social.blog}" target="_blank" rel="noopener">زيارة الأرشيف ${icon("external", "button-icon")}</a></div></section>${ctaSection()}` });
}

function articlePage(p) {
  const path = `/blog/${p.slug}/`;
  const service = services.find(s=>s.slug===p.relatedService);
  const articleSchema = { "@context":"https://schema.org", "@type":"BlogPosting", headline:p.title, description:p.description, datePublished:p.date, dateModified:p.date, inLanguage:"ar-SA", mainEntityOfPage:`${site.url}${path}`, author:{"@id":`${site.url}/#person`}, publisher:{"@id":`${site.url}/#person`}, image:`${site.url}/assets/og/eslam-elshikh-og.png` };
  return layout({ title:p.title, description:p.description, path, active:"blog", type:"article", schema:[personSchema,articleSchema,breadcrumbs([{name:"الرئيسية",path:"/"},{name:"المدونة",path:"/blog/"},{name:p.title,path}])], body:`<article class="article"><header class="article-header"><div class="container article-head-inner reveal">${eyebrow(p.category)}<h1>${p.title}</h1><p>${p.excerpt}</p><div class="article-byline"><span>بقلم ${site.nameAr}</span><time datetime="${p.date}">${new Intl.DateTimeFormat("ar-SA",{dateStyle:"long"}).format(new Date(`${p.date}T12:00:00Z`))}</time><span>${p.readTime}</span></div></div></header><div class="container article-layout"><aside class="article-aside reveal"><p>في هذا المقال</p><ol>${p.sections.map(([h])=>`<li><a href="#${slugify(h)}">${h}</a></li>`).join("")}</ol><a class="aside-service" href="/services/${service.slug}/">${icon(service.icon)}<span><small>الخدمة المرتبطة</small><strong>${service.title}</strong></span></a></aside><div class="article-body">${p.sections.map(([h,c],i)=>`<section id="${slugify(h)}" class="reveal"><span class="article-section-number">${String(i+1).padStart(2,"0")}</span><h2>${h}</h2><p>${c}</p></section>`).join("")}<div class="article-note reveal"><h2>الخلاصة</h2><p>ابدأ بنطاق صغير يمكن قياسه، وثّق الافتراضات، وافصل بين ما يمكنك التحكم فيه وقرارات الأطراف الخارجية. الاستراتيجية الجيدة تجعل الخطوة التالية أوضح وأقل مخاطرة.</p></div></div></div></article>${ctaSection()}` });
}

function slugify(text) {
  return text.normalize("NFKD").replace(/[\u064B-\u065F\u0670]/g,"").replace(/[^\p{L}\p{N}]+/gu,"-").replace(/^-|-$/g,"").toLowerCase();
}

function contactPage() {
  return layout({ title:"تواصل مع إسلام الشيخ", description:"تواصل مع إسلام الشيخ في الرياض لمناقشة مشروع أمن سيبراني أو تطوير برمجيات أو وكيل ذكاء اصطناعي أو خدمات Google أو SEO.", path:"/contact/", active:"contact", schema:[personSchema,breadcrumbs([{name:"الرئيسية",path:"/"},{name:"تواصل",path:"/contact/"}])], body:`${pageHero("تواصل", "ابدأ بوصف الهدف، وسنرتب الطريق إليه", "اختر الخدمة واكتب ملخصًا موجزًا عن الوضع الحالي والنتيجة المطلوبة. لن يطلب منك الموقع كلمات مرور أو مفاتيح سرية أو رموز تحقق.")}<section class="section-pad contact-section"><div class="container contact-grid"><div class="contact-options reveal"><article>${icon("whatsapp")}<div><small>WhatsApp</small><h2>محادثة مباشرة</h2><a href="${site.whatsapp}" target="_blank" rel="noopener" dir="ltr">${site.phoneDisplay}</a></div></article><article>${icon("mail")}<div><small>البريد الإلكتروني</small><h2>تفاصيل رسمية</h2><a href="mailto:${site.email}">${site.email}</a></div></article><article>${icon("pin")}<div><small>نطاق العمل</small><h2>${site.city}</h2><p>خدمات رقمية داخل السعودية وعن بُعد</p></div></article><div class="security-note">${icon("shield")}<p><strong>تنبيه أمني:</strong> لا ترسل كلمة مرور أو رمز تحقق أو مفتاح API. يمكن مناقشة المشكلة باستخدام وصف أو لقطات منزوعة البيانات الحساسة.</p></div></div><form class="contact-form reveal" data-contact-form><div class="form-head"><span>ملخص المشروع</span><h2>جهّز رسالة واضحة خلال دقيقة</h2><p>عند الإرسال ستفتح رسالة WhatsApp في جهازك، ويمكنك مراجعتها قبل الإرسال.</p></div><label>الاسم أو اسم النشاط<input type="text" name="name" autocomplete="name" maxlength="80" placeholder="مثال: محمد / شركة ..." required></label><label>الخدمة المطلوبة<select name="service" required><option value="">اختر الخدمة</option>${services.map(s=>`<option value="${s.slug}">${s.title}</option>`).join("")}</select></label><label>ما النتيجة التي تريد الوصول إليها؟<textarea name="goal" rows="5" maxlength="800" placeholder="اكتب الوضع الحالي والهدف والموعد المتوقع دون بيانات حساسة" required></textarea></label><button class="button" type="submit">فتح الرسالة في WhatsApp ${icon("arrow", "button-icon")}</button><p class="form-status" role="status" aria-live="polite"></p></form></div></section>` });
}

function notFoundPage() {
  return layout({ title:"الصفحة غير موجودة", description:"تعذر العثور على الصفحة المطلوبة في موقع إسلام الشيخ. يمكنك العودة إلى الصفحة الرئيسية أو استكشاف خدمات الأمن السيبراني والبرمجة وخدمات Google.", path:"/404.html", schema:[], body:`<section class="not-found"><div class="container reveal"><span>404</span><h1>الرابط لا يقود إلى صفحة موجودة</h1><p>قد يكون الرابط قديمًا أو تمت كتابة العنوان بصورة غير صحيحة. ابدأ من الرئيسية أو استكشف الخدمات.</p><div class="hero-actions"><a class="button" href="/">العودة للرئيسية</a><a class="button button-ghost" href="/services/">الخدمات</a></div></div></section>` });
}

async function output(relativePath, content) {
  const file = join(root, relativePath);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, content, "utf8");
}

const pages = [
  ["index.html", homePage()],
  ["services/index.html", servicesPage()],
  ["about/index.html", aboutPage()],
  ["google-expert/index.html", googlePage()],
  ["projects/index.html", projectsPage()],
  ["blog/index.html", blogPage()],
  ["contact/index.html", contactPage()],
  ["404.html", notFoundPage()]
];

for (const s of services) pages.push([`services/${s.slug}/index.html`, servicePage(s)]);
for (const p of posts) pages.push([`blog/${p.slug}/index.html`, articlePage(p)]);
for (const [path, content] of pages) await output(path, content);

const sitemapPaths = ["/", "/services/", ...services.map(s=>`/services/${s.slug}/`), "/about/", "/google-expert/", "/projects/", "/blog/", ...posts.map(p=>`/blog/${p.slug}/`), "/contact/"];
const lastmod = "2026-07-21";
await output("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapPaths.map((path,i)=>`  <url><loc>${site.url}${path}</loc><lastmod>${lastmod}</lastmod><changefreq>${path.startsWith("/blog/") ? "monthly" : "monthly"}</changefreq><priority>${path === "/" ? "1.0" : path === "/services/" ? "0.9" : "0.8"}</priority></url>`).join("\n")}\n</urlset>\n`);
await output("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`);
await output("CNAME", "eslam-elshikh.com\n");
await output(".nojekyll", "");
await output("manifest.webmanifest", JSON.stringify({ name:`${site.nameAr} | ${site.nameEn}`, short_name:site.nameAr, start_url:"/", display:"standalone", lang:"ar", dir:"rtl", background_color:"#08131f", theme_color:"#08131f", icons:[{src:"/assets/icons/icon-192.png",sizes:"192x192",type:"image/png"},{src:"/assets/icons/icon-512.png",sizes:"512x512",type:"image/png"}] }, null, 2));

console.log(`Built ${pages.length} HTML pages.`);
