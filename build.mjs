import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { site, services, projects, mapsProjects, posts, homeFaq, localSeoFaq } from "./src/content.mjs";
import { guides } from "./src/guides.mjs";
import { serviceTranslations, enrichPost, guideToPost, completeFaqs } from "./src/editorial.mjs";
import { renderAbout } from "./src/about.mjs";

const root = dirname(fileURLToPath(import.meta.url));
const outFlag = process.argv.find((arg) => arg.startsWith("--out="));
const outDir = outFlag ? resolve(root, outFlag.slice(6)) : root;
const isDistBuild = outDir !== root;
const generatedRoutes = [];
const version = "3.6.5";
const profilePhoto = "/assets/brand/eslam-elshikh-portrait-20260827.webp";

const esc = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");

const safeJson = (value) => JSON.stringify(value).replaceAll("<", "\\u003c");
const absolute = (path = "/") => new URL(path, `${site.url}/`).href;
const routeFile = (path) => path === "/" ? "index.html" : join(path.replace(/^\//, "").replace(/\/$/, ""), "index.html");
const serviceBySlug = (slug) => services.find((service) => service.slug === slug);
const allPosts = [...posts.map(enrichPost), ...guides.map(guideToPost)].sort((left, right) => {
  const dateDifference = new Date(`${right.modified || right.date}T12:00:00Z`) - new Date(`${left.modified || left.date}T12:00:00Z`);
  return dateDifference || new Date(`${right.date}T12:00:00Z`) - new Date(`${left.date}T12:00:00Z`);
});
const postBySlug = (slug) => allPosts.find((post) => post.slug === slug);

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
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  home: '<path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5h6v2m-12 5h18M10 12v2h4v-2"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  book: '<path d="M4 4h10a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3V4Z"/><path d="M7 16h10m0-9h3v13h-3"/>',
  external: '<path d="M14 4h6v6m0-6-9 9"/><path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/>',
  moon: '<path d="M20.5 14.3A8.5 8.5 0 0 1 9.7 3.5 8.5 8.5 0 1 0 20.5 14.3Z"/>',
  target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3"/>',
  layers: '<path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.4 2.5 3.7 5.5 3.7 9S14.4 18.5 12 21c-2.4-2.5-3.7-5.5-3.7-9S9.6 5.5 12 3Z"/>',
  chevron: '<path d="m9 18 6-6-6-6"/>',
  quote: '<path d="M7 17H4a1 1 0 0 1-1-1v-4c0-4 2-7 6-9v3c-2 1-3 3-3 5h1a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2Zm10 0h-3a1 1 0 0 1-1-1v-4c0-4 2-7 6-9v3c-2 1-3 3-3 5h1a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2Z"/>',
  whatsapp: '<path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.4-4A8 8 0 1 1 20 11.5Z"/><path d="M8.5 8.2c.3 3 2.4 5.4 5.5 6.2.8.2 1.6-.5 1.8-1.2l-2.2-1-1 1c-1.4-.7-2.5-1.8-3.2-3.2l1-1-1-2.2c-.5.2-1 .7-.9 1.4Z"/>'
};

const icon = (name, className = "icon") => `<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${icons[name] ?? icons.shield}</svg>`;
const logo = (className = "brand-logo", alt = "") => {
  const size = /(?:hero|profile)-logo/.test(className) ? 280 : 128;
  return `<img class="${className}" src="${site.logo}" width="${size}" height="${size}" alt="${esc(alt)}" decoding="async">`;
};

const socialLinks = [
  ["GitHub", site.social.github, "GH"],
  ["X", site.social.x, "X"],
  ["Instagram", site.social.instagram, "IG"],
  ["YouTube", site.social.youtube, "YT"]
];

const baseGraph = () => ([
  {
    "@type": "Person",
    "@id": `${site.url}/#person`,
    name: site.nameAr,
    honorificPrefix: "المهندس",
    alternateName: site.alternateNames,
    givenName: "إسلام",
    familyName: "الشيخ",
    url: `${site.url}/`,
    image: absolute(site.logo),
    description: site.description,
    jobTitle: ["مهندس أمن سيبراني", "مطور برمجيات", "خبير منتجات Google"],
    email: `mailto:${site.email}`,
    telephone: site.phone,
    workLocation: { "@type": "Place", name: site.city, address: { "@type": "PostalAddress", addressLocality: site.city, addressRegion: site.region, addressCountry: site.countryCode } },
    areaServed: { "@type": "Country", name: site.country },
    alumniOf: [
      { "@type": "CollegeOrUniversity", name: "جامعة 6 أكتوبر", alternateName: "October 6 University" },
      { "@type": "CollegeOrUniversity", name: "الجامعة العربية المفتوحة", alternateName: "Arab Open University" }
    ],
    hasCredential: [
      { "@type": "EducationalOccupationalCredential", name: "بكالوريوس أمن المعلومات", credentialCategory: "Bachelor degree", recognizedBy: { "@type": "CollegeOrUniversity", name: "جامعة 6 أكتوبر" } },
      { "@type": "EducationalOccupationalCredential", name: "دبلوم الأمن السيبراني", credentialCategory: "Diploma", recognizedBy: { "@type": "CollegeOrUniversity", name: "الجامعة العربية المفتوحة" } }
    ],
    knowsAbout: [...services.map((service) => service.title), "خرائط Google", "Google Business Profile", "Google Search", "Google Search Console", "السيو المحلي", "إعلانات Google", "إدارة حملات Google Ads"],
    sameAs: [site.social.wikidata, site.social.googleDeveloper, site.social.github, site.social.x, site.social.instagram, site.social.youtube]
  },
  {
    "@type": "WebSite",
    "@id": `${site.url}/#website`,
    url: `${site.url}/`,
    name: site.brandName,
    alternateName: site.siteAlternateNames,
    inLanguage: ["ar-SA", "en"],
    publisher: { "@id": `${site.url}/#person` }
  },
  {
    "@type": "ProfessionalService",
    "@id": `${site.url}/#professional-service`,
    name: "خدمات المهندس إسلام الشيخ التقنية والاستشارية",
    alternateName: "Eslam Elshikh Digital Engineering Services",
    url: site.url,
    logo: absolute(site.logo),
    image: absolute(site.shareImage),
    hasMap: site.googleMapsProfile,
    sameAs: [site.googleMapsProfile, site.social.googleDeveloper, site.social.wikidata, site.social.github],
    email: site.email,
    telephone: site.phone,
    founder: { "@id": `${site.url}/#person` },
    address: { "@type": "PostalAddress", addressLocality: site.city, addressRegion: site.region, addressCountry: site.countryCode },
    areaServed: [{ "@type": "City", name: site.city }, { "@type": "Country", name: site.country }],
    openingHoursSpecification: [{
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "00:00",
      closes: "23:59"
    }],
    availableLanguage: ["ar", "en"],
    priceRange: "$$"
  }
]);

const breadcrumbSchema = (items) => ({
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: absolute(item.path) }))
});

const faqSchema = (faq) => ({
  "@type": "FAQPage",
  mainEntity: faq.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } }))
});

function head({ title, description, path = "/", lang = "ar", schema = [], image = site.shareImage, type = "website", published, modified, keywords = [], articleSection = "", stylesheets = [], robots = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" }) {
  const isEnglish = lang === "en";
  const canonical = absolute(path);
  const titleHasBrand = title.includes(site.nameAr) || title.includes(site.nameEn) || title.includes(site.brandName);
  const fullTitle = title === site.brandName || titleHasBrand ? title : `${title} | ${site.brandName}`;
  const graph = [
    ...baseGraph(),
    {
      "@type": type === "article" ? "BlogPosting" : "WebPage",
      "@id": `${canonical}#${type === "article" ? "article" : "webpage"}`,
      url: canonical,
      name: fullTitle,
      description,
      inLanguage: isEnglish ? "en" : "ar-SA",
      isPartOf: { "@id": `${site.url}/#website` },
      about: { "@id": `${site.url}/#person` },
      ...(published ? { datePublished: published } : {}),
      dateModified: modified || site.lastUpdated,
      ...(type === "article" ? {
        headline: title,
        mainEntityOfPage: canonical,
        author: { "@id": `${site.url}/#person` },
        publisher: { "@id": `${site.url}/#person` },
        image: absolute(image),
        ...(articleSection ? { articleSection } : {}),
        ...(keywords.length ? { keywords } : {})
      } : {})
    },
    ...schema
  ];
  return `<!doctype html>
<html lang="${lang}" dir="${isEnglish ? "ltr" : "rtl"}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(fullTitle)}</title>
  <meta name="description" content="${esc(description)}">
  ${keywords.length ? `<meta name="keywords" content="${esc(keywords.join(", "))}">` : ""}
  <meta name="robots" content="${esc(robots)}">
  <meta name="author" content="${esc(site.nameAr)}">
  <meta name="application-name" content="${esc(site.brandName)}">
  <meta name="theme-color" content="#06131f" data-theme-color>
  <meta name="color-scheme" content="dark light">
  <meta name="referrer" content="strict-origin-when-cross-origin">
  <meta name="format-detection" content="telephone=yes">
  <meta name="geo.region" content="SA-01">
  <meta name="geo.placename" content="${esc(site.city)}">
  <link rel="canonical" href="${canonical}">
  ${path === "/" || path === "/en/" ? `<link rel="alternate" hreflang="ar" href="${site.url}/"><link rel="alternate" hreflang="ar-SA" href="${site.url}/"><link rel="alternate" hreflang="en" href="${site.url}/en/"><link rel="alternate" hreflang="x-default" href="${site.url}/">` : `<link rel="alternate" hreflang="ar-SA" href="${canonical}"><link rel="alternate" hreflang="x-default" href="${canonical}">`}
  <link rel="me" href="${site.social.googleDeveloper}">
  <link rel="me" href="${site.social.wikidata}">
  <link rel="me" href="${site.social.github}">
  <link rel="icon" href="/assets/icons/favicon.svg" type="image/svg+xml" sizes="any">
  <link rel="apple-touch-icon" href="/assets/icons/apple-touch-icon.png">
  <link rel="manifest" href="/manifest.webmanifest">
  <link rel="alternate" type="application/rss+xml" title="${isEnglish ? "Eslam Elshikh Insights" : `مدونة ${esc(site.brandName)}`}" href="/feed.xml">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-title" content="${esc(site.brandName)}">
  <meta property="og:locale" content="${isEnglish ? "en_US" : "ar_SA"}">
  <meta property="og:type" content="${type}">
  <meta property="og:site_name" content="${esc(site.brandName)}">
  <meta property="og:title" content="${esc(fullTitle)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${absolute(image)}">
  <meta property="og:image:secure_url" content="${absolute(image)}">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${esc(fullTitle)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@remoesoo10">
  <meta name="twitter:creator" content="@remoesoo10">
  <meta name="twitter:title" content="${esc(fullTitle)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${absolute(image)}">
  <meta name="twitter:image:alt" content="${esc(fullTitle)}">
  <script src="/assets/js/theme.js?v=${version}"></script>
  <link rel="stylesheet" href="/assets/css/main.css?v=${version}">
  ${stylesheets.map((href) => `<link rel="stylesheet" href="${esc(href)}">`).join("\n  ")}
  <script src="/assets/js/analytics.js?v=${version}" defer></script>
  <script type="application/ld+json">${safeJson({ "@context": "https://schema.org", "@graph": graph })}</script>
</head>`;
}

function header(active = "", language = "ar") {
  const isEnglish = language === "en";
  const nav = isEnglish ? [
    ["home", "/en/", "Home"],
    ["services", "/en/#services", "Services"],
    ["projects", "/projects/", "Work"],
    ["maps", "/google-maps-projects/", "Maps work"],
    ["about", "/about/", "About"],
    ["google", "/google-expert/", "Google expertise"],
    ["blog", "/blog/", "Insights"]
  ] : [
    ["home", "/", "الرئيسية"],
    ["services", "/services/", "الخدمات"],
    ["projects", "/projects/", "الأعمال"],
    ["maps", "/google-maps-projects/", "أعمال الخرائط"],
    ["about", "/about/", "عن إسلام"],
    ["google", "/google-expert/", "خبير خرائط جوجل"],
    ["blog", "/blog/", "المدونة"]
  ];
  const links = nav.map(([key, href, label]) => `<a href="${href}"${active === key ? ' class="is-active" aria-current="page"' : ""}>${label}</a>`).join("");
  return `<a class="skip-link" href="#main">${isEnglish ? "Skip to content" : "انتقل إلى المحتوى"}</a>
<header class="site-header" data-header>
  <div class="container header-inner">
    <a class="brand" href="${isEnglish ? "/en/" : "/"}" aria-label="${isEnglish ? `Eng. ${site.nameEn} home` : `${site.brandName} — الصفحة الرئيسية`}">
      ${logo("brand-logo")}
      <span class="brand-copy"><strong>${isEnglish ? `Eng. ${site.nameEn}` : site.brandName}</strong><small>${isEnglish ? "Cybersecurity & Digital Engineering" : "أمن سيبراني · برمجيات · ذكاء اصطناعي"}</small></span>
    </a>
    <nav class="desktop-nav" aria-label="${isEnglish ? "Main navigation" : "التنقل الرئيسي"}">${links}</nav>
    <div class="header-tools">
      <a class="language-switch" href="${isEnglish ? "/" : "/en/"}" lang="${isEnglish ? "ar" : "en"}" dir="${isEnglish ? "rtl" : "ltr"}" aria-label="${isEnglish ? "النسخة العربية" : "English version"}">${isEnglish ? "عربي" : "EN"}</a>
      <button class="theme-toggle" type="button" aria-label="${isEnglish ? "Change color theme" : "تغيير نمط الألوان"}" aria-pressed="false" data-theme-toggle><span class="theme-sun">${icon("sun")}</span><span class="theme-moon">${icon("moon")}</span></button>
      <a class="button button-small header-cta" href="${site.whatsapp}?text=${encodeURIComponent(isEnglish ? "Hello Eng. Eslam, I would like to discuss a digital project." : "مرحبًا م. إسلام، أرغب في مناقشة مشروع تقني.")}" target="_blank" rel="noopener">${isEnglish ? "Start a project" : "ناقش مشروعك"} ${icon("arrow", "button-icon")}</a>
      <button class="menu-toggle" type="button" aria-label="${isEnglish ? "Open menu" : "فتح القائمة"}" aria-expanded="false" aria-controls="mobile-menu" data-menu-toggle><span class="menu-open">${icon("menu")}</span><span class="menu-close">${icon("close")}</span></button>
    </div>
  </div>
  <nav class="mobile-menu" id="mobile-menu" aria-label="${isEnglish ? "Mobile navigation" : "قائمة الجوال"}" data-mobile-menu>
    <div class="mobile-menu-inner">${links}<a class="mobile-language" href="${isEnglish ? "/" : "/en/"}">${isEnglish ? "النسخة العربية" : "English version"}</a><a class="button" href="${site.whatsapp}?text=${encodeURIComponent(isEnglish ? "Hello Eng. Eslam, I would like to discuss a digital project." : "مرحبًا م. إسلام، أرغب في مناقشة مشروع تقني.")}" target="_blank" rel="noopener">${isEnglish ? "Start a project" : "ابدأ محادثة"}</a></div>
  </nav>
</header>`;
}

function footer(language = "ar") {
  const isEnglish = language === "en";
  const social = socialLinks.map(([label, href, mark]) => `<a href="${href}" target="_blank" rel="noopener" aria-label="${label}" title="${label}">${mark}</a>`).join("");
  return `<footer class="site-footer">
  <div class="container footer-grid">
    <div class="footer-intro">
      <a class="brand" href="${isEnglish ? "/en/" : "/"}">${logo("brand-logo")}<span class="brand-copy"><strong>${isEnglish ? `Eng. ${site.nameEn}` : site.brandName}</strong><small>${isEnglish ? "Cybersecurity & Digital Engineering" : site.nameEn}</small></span></a>
      <p>${isEnglish ? "Secure digital products, practical AI systems, Google product expertise, and search visibility for ambitious businesses." : site.positioning}</p>
      <div class="social-row" aria-label="${isEnglish ? "Social profiles" : "الحسابات الاجتماعية"}">${social}</div>
    </div>
    <div class="footer-column"><h2>${isEnglish ? "Explore" : "روابط سريعة"}</h2><a href="/about/">${isEnglish ? "About" : "عن إسلام"}</a><a href="/projects/">${isEnglish ? "Selected work" : "أعمال المواقع"}</a><a href="/google-maps-projects/">${isEnglish ? "Google Maps work" : "أعمال خرائط Google"}</a><a href="/local-seo/riyadh/">${isEnglish ? "Local SEO in Riyadh" : "السيو المحلي في الرياض"}</a><a href="/google-ads/">${isEnglish ? "Google Ads" : "إعلانات جوجل"}</a><a href="/google-expert/">${isEnglish ? "Google expertise" : "خبير خرائط جوجل"}</a><a href="/blog/">${isEnglish ? "Insights" : "المدونة"}</a><a href="/contact/">${isEnglish ? "Contact" : "تواصل"}</a></div>
    <div class="footer-column footer-services"><h2>${isEnglish ? "Core services" : "الخدمات الرئيسية"}</h2>${services.slice(0, 6).map((service) => `<a href="/services/${service.slug}/">${esc(isEnglish ? serviceTranslations[service.slug]?.title || service.title : service.title)}</a>`).join("")}<a class="footer-more" href="/services/">${isEnglish ? "View all services" : "عرض جميع الخدمات"}</a></div>
    <div class="footer-column footer-contact"><h2>${isEnglish ? "Contact" : "بيانات التواصل"}</h2><a dir="ltr" href="tel:${site.phone}">${icon("phone")}<span>${site.phoneDisplay}</span></a><a href="${site.whatsapp}" target="_blank" rel="noopener">${icon("whatsapp")}<span>WhatsApp</span></a><a href="mailto:${site.email}">${icon("mail")}<span>${site.email}</span></a><a href="${site.googleMapsProfile}" target="_blank" rel="noopener">${icon("pin")}<span>${isEnglish ? "Google Maps business profile" : "الملف التجاري على خرائط Google"}</span></a><span>${icon("globe")}<span>${isEnglish ? "Riyadh service area" : `نطاق الخدمة: ${site.city}`}</span></span></div>
  </div>
  <div class="container footer-bottom"><p>© ${new Date().getFullYear()} ${isEnglish ? `Eng. ${site.nameEn}` : site.brandName}. ${isEnglish ? "All rights reserved." : "جميع الحقوق محفوظة."}</p><div><a href="/privacy/">${isEnglish ? "Privacy" : "الخصوصية"}</a><a href="/terms/">${isEnglish ? "Terms" : "الشروط"}</a><a href="/.well-known/security.txt">${isEnglish ? "Security" : "الإبلاغ الأمني"}</a></div></div>
</footer>
<div class="floating-contact" role="group" aria-label="${isEnglish ? "Quick contact" : "تواصل سريع"}">
  <a class="floating-action floating-call" href="tel:${site.phone}" aria-label="${isEnglish ? "Call Eng. Eslam" : "اتصال مباشر بالمهندس إسلام الشيخ"}">${icon("phone")}<span>${isEnglish ? "Call" : "اتصال"}</span></a>
  <a class="floating-action floating-whatsapp" href="${site.whatsapp}?text=${encodeURIComponent(isEnglish ? "Hello Eng. Eslam, I would like to discuss a project." : "مرحبًا م. إسلام، أرغب في مناقشة مشروع.")}" target="_blank" rel="noopener" aria-label="${isEnglish ? "WhatsApp Eng. Eslam" : "تواصل عبر واتساب"}">${icon("whatsapp")}<span>WhatsApp</span></a>
</div>
<nav class="mobile-bottom-nav" aria-label="${isEnglish ? "Mobile quick navigation" : "التنقل السريع للجوال"}"><a href="${isEnglish ? "/en/" : "/"}">${icon("home")}<span>${isEnglish ? "Home" : "الرئيسية"}</span></a><a href="${isEnglish ? "/en/#services" : "/services/"}">${icon("briefcase")}<span>${isEnglish ? "Services" : "الخدمات"}</span></a><a href="/projects/">${icon("layers")}<span>${isEnglish ? "Work" : "الأعمال"}</span></a><a href="/contact/">${icon("mail")}<span>${isEnglish ? "Contact" : "تواصل"}</span></a></nav>
<button class="back-to-top" type="button" aria-label="${isEnglish ? "Back to top" : "العودة إلى أعلى الصفحة"}" data-back-to-top>${icon("chevron")}</button>
<script src="/assets/js/main.js?v=${version}" defer></script>`;
}

function page({ title, description, path, active = "", body, schema = [], lang = "ar", type = "website", published, modified, image, keywords = [], articleSection = "", stylesheets = [], pageScripts = [] }) {
  return `${head({ title, description, path, lang, schema, type, published, modified, image, keywords, articleSection, stylesheets })}
<body>${header(active, lang)}<main id="main">${body}${businessMapSection(lang)}</main>${footer(lang)}${pageScripts.map((src) => `<script src="${esc(src)}" defer></script>`).join("")}</body></html>`;
}

const eyebrow = (text) => `<span class="eyebrow"><span aria-hidden="true"></span>${esc(text)}</span>`;
const button = (href, label, variant = "", external = false) => `<a class="button${variant ? ` ${variant}` : ""}" href="${href}"${external ? ' target="_blank" rel="noopener"' : ""}>${esc(label)} ${icon(external ? "external" : "arrow", "button-icon")}</a>`;
const checkList = (items, className = "") => `<ul class="check-list${className ? ` ${esc(className)}` : ""}">${items.map((item) => `<li>${icon("check")}<span>${esc(item)}</span></li>`).join("")}</ul>`;
const faqBlock = (faq) => `<div class="accordion">${faq.map(([question, answer], index) => `<details class="reveal"${index === 0 ? " open" : ""}><summary>${esc(question)}<span aria-hidden="true">+</span></summary><div><p>${esc(answer)}</p></div></details>`).join("")}</div>`;

function serviceCard(service) {
  return `<article class="service-card reveal" data-service-group="${esc(service.group)}">
    <div class="service-card-top"><span class="service-number">${service.number}</span><span class="service-icon">${icon(service.icon)}</span></div>
    <p class="service-group">${esc(service.group)}</p>
    <h3><a href="/services/${service.slug}/">${esc(service.title)}</a></h3>
    <p>${esc(service.short)}</p>
    <a class="text-link" href="/services/${service.slug}/" aria-label="تفاصيل خدمة ${esc(service.title)}">تفاصيل الخدمة ${icon("arrow")}</a>
  </article>`;
}

function projectActions(project, className = "") {
  const requestMessage = `مرحبًا م. إسلام، شاهدت مشروع «${project.title}» وأرغب في تنفيذ مشروع مشابه يناسب نشاطي.`;
  const caseStudyLink = project.caseStudy && project.slug
    ? `<a class="button button-small" href="/projects/${project.slug}/" aria-label="قراءة دراسة حالة ${esc(project.title)}">دراسة الحالة ${icon("arrow", "button-icon")}</a>`
    : "";
  return `<div class="portfolio-actions${className ? ` ${className}` : ""}">${caseStudyLink}<a class="button button-small button-ghost" href="${project.liveUrl}" target="_blank" rel="noopener" aria-label="معاينة موقع ${esc(project.title)} المنشور">الموقع الحي ${icon("external", "button-icon")}</a><a class="portfolio-request-link" href="${site.whatsapp}?text=${encodeURIComponent(requestMessage)}" target="_blank" rel="noopener" aria-label="طلب مشروع مشابه لمشروع ${esc(project.title)}">ابدأ مشروعًا مشابهًا ${icon("whatsapp")}</a></div>`;
}

const projectHeading = (project) => project.caseStudy && project.slug
  ? `<a href="/projects/${project.slug}/">${esc(project.title)}</a>`
  : esc(project.title);

function projectImage(project, { eager = false } = {}) {
  return `<img src="${project.image}" width="1200" height="750" alt="لقطة من واجهة موقع ${esc(project.title)}" loading="${eager ? "eager" : "lazy"}" decoding="async"${eager ? ' fetchpriority="high"' : ""}>`;
}

function featuredProject(project) {
  const domain = new URL(project.liveUrl).hostname.replace(/^www\./, "");
  return `<article class="portfolio-featured reveal"><div class="portfolio-featured-copy"><span class="portfolio-index" dir="ltr">FEATURED / 01</span><p class="portfolio-kicker">${esc(project.category)}</p><h3>${projectHeading(project)}</h3><p class="portfolio-description">${esc(project.description)}</p><div class="tag-row">${project.tags.map((tag) => `<span>${esc(tag)}</span>`).join("")}</div>${projectActions(project)}</div><a class="portfolio-stage" href="${project.liveUrl}" target="_blank" rel="noopener" aria-label="فتح موقع ${esc(project.title)} المنشور"><span class="portfolio-stage-orbit" aria-hidden="true"></span><span class="portfolio-browser"><span class="portfolio-browser-bar"><span class="browser-dots" aria-hidden="true"><i></i><i></i><i></i></span><span dir="ltr">${esc(domain)}</span></span>${projectImage(project)}</span></a></article>`;
}

function showcaseProject(project, index) {
  return `<article class="portfolio-project reveal"><a class="portfolio-project-media" href="${project.liveUrl}" target="_blank" rel="noopener" aria-label="فتح موقع ${esc(project.title)} المنشور"><span class="portfolio-project-number" dir="ltr">${String(index + 1).padStart(2, "0")}</span>${projectImage(project)}</a><div class="portfolio-project-copy"><p class="portfolio-kicker">${esc(project.category)}</p><h3>${projectHeading(project)}</h3><p>${esc(project.description)}</p><div class="tag-row">${project.tags.map((tag) => `<span>${esc(tag)}</span>`).join("")}</div>${projectActions(project)}</div></article>`;
}

function archiveProject(project, index) {
  return `<article class="portfolio-archive-row reveal"><span class="portfolio-archive-number" dir="ltr">${String(index + 1).padStart(2, "0")}</span><a class="portfolio-archive-media" href="${project.liveUrl}" target="_blank" rel="noopener" aria-label="فتح موقع ${esc(project.title)} المنشور">${projectImage(project)}</a><div class="portfolio-archive-copy"><p class="portfolio-kicker">${esc(project.category)}</p><h3>${projectHeading(project)}</h3><p>${esc(project.description)}</p></div>${projectActions(project, "portfolio-archive-actions")}</article>`;
}

function projectsShowcase({ home = false } = {}) {
  const highlights = projects.slice(1, home ? 3 : 5);
  const archive = home ? [] : projects.slice(5);
  return `<div class="portfolio-showcase">${featuredProject(projects[0])}<div class="portfolio-highlight-grid">${highlights.map((project, index) => showcaseProject(project, index + 1)).join("")}</div>${archive.length ? `<div class="portfolio-archive" aria-label="المزيد من الأعمال">${archive.map((project, index) => archiveProject(project, index + 5)).join("")}</div>` : ""}</div>`;
}

function postCard(post, { featured = false } = {}) {
  const keywords = (post.keywords || []).slice(0, featured ? 4 : 3);
  const relatedService = serviceBySlug(post.relatedService);
  const formattedDate = new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium" }).format(new Date(`${post.date}T12:00:00Z`));
  return `<article class="post-card${featured ? " post-card-featured" : ""} reveal">
    <a class="post-art post-art-${post.relatedService}" href="/blog/${post.slug}/" aria-label="اقرأ: ${esc(post.title)}"><span>${esc(post.category)}</span><strong class="post-art-title">${esc(relatedService?.title || post.category)}</strong><span class="post-art-mark">${icon(relatedService?.icon || "book", "post-icon")}</span></a>
    <div class="post-card-content">
      <div class="post-meta"><time datetime="${post.date}">${formattedDate}</time><span>${esc(post.readTime)}</span></div>
      <h3><a href="/blog/${post.slug}/">${esc(post.title)}</a></h3>
      <p>${esc(post.excerpt)}</p>
      ${keywords.length ? `<div class="keyword-row" aria-label="أهم موضوعات المقال">${keywords.map((keyword) => `<span>${esc(keyword)}</span>`).join("")}</div>` : ""}
      <a class="text-link post-card-link" href="/blog/${post.slug}/" aria-label="اقرأ الدليل كاملًا: ${esc(post.title)}">اقرأ الدليل كاملًا ${icon("arrow")}</a>
    </div>
  </article>`;
}

function homePage() {
  const faq = homeFaq;
  const body = `
<section class="hero section-pad">
  <div class="container hero-grid">
    <div class="hero-copy reveal">
      ${eyebrow("مهندس أمن سيبراني · مطور برمجيات · خبير منتجات Google")}
      <h1>مهندس أمن سيبراني ومطور مواقع وخبير Google <span>في الرياض</span></h1>
      <p class="hero-tagline">أبني حضورك الرقمي ليكون آمنًا، سريعًا، ومؤثرًا.</p>
      <p class="hero-lead">أنا المهندس إسلام الشيخ. أوحّد الأمن السيبراني وتطوير المواقع ووكلاء الذكاء الاصطناعي وخبرة Google والسيو في حلول عملية تساعد الشركات على حماية أعمالها، تحسين تجربة عملائها، وزيادة ظهورها بثقة.</p>
      <p class="hero-support">من التشخيص والاستراتيجية إلى التصميم والتطوير والقياس، تحصل على مسار واضح ومخرجات قابلة للمراجعة بدل حلول متفرقة يصعب تشغيلها أو تطويرها.</p>
      <div class="hero-actions">${button("/contact/", "ناقش مشروعك")}${button("/services/", "استكشف الخدمات", "button-ghost")}</div>
      <div class="hero-trust"><a href="${site.googleMapsProfile}" target="_blank" rel="noopener"><span class="trust-dot trust-google"></span>الملف التجاري على خرائط Google</a><a href="${site.social.googleDeveloper}" target="_blank" rel="noopener"><span class="trust-dot"></span>ملف Google للمطورين</a><a href="${site.social.wikidata}" target="_blank" rel="noopener"><span class="trust-dot"></span>Wikidata Q138800449</a><span><span class="trust-dot trust-live"></span>متاح للمشروعات في السعودية</span></div>
    </div>
    <div class="hero-visual reveal" aria-label="منظومة خدمات المهندس إسلام الشيخ">
      <div class="visual-glow" aria-hidden="true"></div>
      <div class="visual-shell">
        <div class="visual-top"><span>Digital Engineering</span><span class="visual-status"><i></i> Operational</span></div>
        <div class="visual-core">${logo("hero-logo", `شعار ${site.brandName}`)}<div><strong>${site.nameEn}</strong><span>SECURE · BUILD · GROW</span></div></div>
        <div class="visual-capabilities"><span>${icon("shield")}Cybersecurity</span><span>${icon("code")}Web & Apps</span><span>${icon("spark")}AI Agents</span><span>${icon("google")}Google</span><span>${icon("chart")}SEO</span><span>${icon("cloud")}Cloud</span></div>
        <div class="visual-metric"><span>Approach</span><strong>360°</strong><p>أمان وتجربة مستخدم وظهور رقمي داخل قرار واحد.</p></div>
      </div>
      <div class="visual-orbit orbit-a" aria-hidden="true"></div><div class="visual-orbit orbit-b" aria-hidden="true"></div>
    </div>
  </div>
  <div class="container stats-bar reveal">${site.stats.map((stat) => `<div><strong>${esc(stat.value)}</strong><span>${esc(stat.label)}</span></div>`).join("")}</div>
  <p class="container stats-note">أرقام خبرة محدثة حتى سبتمبر 2026؛ ويمكن مراجعة النماذج العامة المنشورة في قسمي الأعمال وخرائط Google.</p>
</section>
<section class="section-pad services-section" id="services"><div class="container">
  <div class="section-heading reveal">${eyebrow("الخدمات المتخصصة")}<h2>حلول مترابطة تبدأ من المشكلة وتنتهي بنتيجة قابلة للقياس</h2><p>كل خدمة لها نطاق واضح ومخرجات محددة، ويمكن دمج المسارات عند الحاجة لبناء مشروع متكامل يجمع الحماية والتطوير والظهور والنمو.</p></div>
  <div class="service-filters" role="tablist" aria-label="تصفية الخدمات"><button type="button" role="tab" aria-selected="true" data-service-filter="all">كل الخدمات</button>${[...new Set(services.map((s) => s.group))].map((group) => `<button type="button" role="tab" aria-selected="false" data-service-filter="${esc(group)}">${esc(group)}</button>`).join("")}</div>
  <div class="services-grid" data-services-grid>${services.map(serviceCard).join("")}</div>
</div></section>
<section class="section-pad promise-section"><div class="container promise-grid"><div class="promise-copy reveal">${eyebrow("منهجية التنفيذ")}<h2>واجهة جميلة وحدها لا تصنع مشروعًا ناجحًا</h2><p>المشروع الاحترافي يجب أن يكون مفهومًا للعميل، متينًا تقنيًا، آمنًا في التشغيل، قابلًا للفهرسة، وسهل التطوير بعد الإطلاق. لذلك تُراجع جميع الطبقات باعتبارها منتجًا واحدًا.</p>${button("/about/", "تعرف على منهجية العمل", "button-ghost")}</div><div class="principles-grid">
  <article class="principle reveal"><span>01</span>${icon("target")}<h3>هدف تجاري واضح</h3><p>نحدد القرار أو التحويل المطلوب قبل اختيار التقنية أو شكل الواجهة.</p></article>
  <article class="principle reveal"><span>02</span>${icon("shield")}<h3>أمان من التصميم</h3><p>الصلاحيات والبيانات والمخاطر تُراجع من البداية، لا بعد وقوع المشكلة.</p></article>
  <article class="principle reveal"><span>03</span>${icon("user")}<h3>تجربة لكل جهاز</h3><p>Mobile First مع اختبار iOS وAndroid وHuawei والتابلت والكمبيوتر.</p></article>
  <article class="principle reveal"><span>04</span>${icon("chart")}<h3>قياس وتحسين</h3><p>السيو والأداء والتحويلات جزء من التشغيل، وليست إضافات لاحقة.</p></article>
</div></div></section>
<section class="section-pad results-section"><div class="container"><div class="section-heading reveal">${eyebrow("ما الذي تحصل عليه؟")}<h2>مخرجات تساعدك على اتخاذ القرار والتشغيل بثقة</h2></div><div class="result-grid"><article class="result-card reveal">${icon("layers")}<h3>بنية قابلة للتوسع</h3><p>محتوى وكود ومسارات واضحة تقلل إعادة العمل وتسمح بإضافة خدمات وصفحات وتكاملات دون فوضى.</p></article><article class="result-card reveal">${icon("search")}<h3>وضوح لمحركات البحث والعملاء</h3><p>عناوين ومحتوى وروابط وبيانات منظمة تشرح من أنت، ماذا تقدم، ولمن، وأين، دون حشو أو تكرار.</p></article><article class="result-card reveal">${icon("shield")}<h3>مخاطر أقل وتشغيل أفضل</h3><p>قرارات أمنية وتقنية موثقة، وأولويات قابلة للمتابعة، وتجربة متجاوبة لا تعتمد على جهاز واحد.</p></article></div></div></section>
<section class="section-pad projects-section"><div class="container"><div class="section-heading reveal">${eyebrow("مختارات من الأعمال")}<h2>مشروعات حقيقية، لكل واحد منها قصة وهوية</h2><p>نماذج حية من مواقع ومنتجات رقمية تم تطويرها للشركات والأنشطة، مع الجمع بين التصميم والتقنية والسيو ومسارات التحويل.</p></div>${projectsShowcase({ home: true })}<div class="section-action">${button("/projects/", "استكشف جميع الأعمال", "button-ghost")}</div></div></section>
${mapsWorkTeaser()}
<section class="section-pad google-proof-section"><div class="container proof-panel reveal"><div class="proof-icon">${icon("google")}</div><div><span>إسلام الشيخ — خبير خرائط جوجل</span><h2>خبرة موثقة في خرائط Google والملفات التجارية</h2><p>تشخيص مشكلات التحقق والتعليق والملكية والفئات، وتحسين اتساق بيانات النشاط والظهور المحلي وفق سياسات Google، مع نماذج أعمال منشورة يمكن مراجعتها.</p><div class="proof-numbers"><span><strong>472</strong> ملفًا تم دعم توثيقه</span><span><strong>233</strong> مشكلة ملف تجاري تمت معالجتها</span><span><strong>${mapsProjects.length}</strong> نموذجًا عامًا منشورًا</span></div></div><div class="proof-actions">${button("/google-expert/", "تعرف على خبير خرائط جوجل")}${button(site.social.googleDeveloper, "عرض الملف الرسمي", "button-ghost", true)}</div></div></section>
<section class="section-pad process-section"><div class="container"><div class="section-heading reveal">${eyebrow("مسار العمل")}<h2>وضوح من أول سؤال حتى ما بعد الإطلاق</h2></div><ol class="process-list"><li class="reveal"><span>01</span><h3>تشخيص الهدف</h3><p>فهم المستخدم والنتيجة والقيود والمخاطر والبيانات المتاحة قبل اختيار الأدوات.</p></li><li class="reveal"><span>02</span><h3>تصميم الحل</h3><p>تحديد البنية والمحتوى والنطاق والمخرجات ومعايير القبول وخطة التنفيذ.</p></li><li class="reveal"><span>03</span><h3>تنفيذ ومراجعة</h3><p>بناء على مراحل قصيرة قابلة للاختبار، مع توثيق القرارات والملاحظات.</p></li><li class="reveal"><span>04</span><h3>إطلاق وتحسين</h3><p>فحص الأداء والأجهزة والفهرسة والروابط، ثم متابعة المؤشرات وفرص التطوير.</p></li></ol></div></section>
<section class="section-pad blog-section"><div class="container"><div class="section-heading reveal">${eyebrow("معرفة عملية")}<h2>مقالات تساعدك على اتخاذ قرارات تقنية أكثر وضوحًا</h2></div><div class="posts-grid">${allPosts.slice(0, 3).map((post) => postCard(post)).join("")}</div><div class="section-action">${button("/blog/", "استكشف المدونة", "button-ghost")}</div></div></section>
<section class="section-pad faq-section"><div class="container faq-grid"><div class="faq-intro reveal">${eyebrow("الأسئلة الشائعة")}<h2>إجابات صريحة قبل بدء المشروع</h2><p>لا توجد باقة واحدة تناسب الجميع؛ لذلك أوضح الحدود والمخرجات والاعتماديات من البداية.</p>${button("/contact/", "أرسل تفاصيل مشروعك", "button-ghost")}</div>${faqBlock(faq)}</div></section>
${finalCta()}`;
  return page({ title: "المهندس إسلام الشيخ | أمن سيبراني وتطوير مواقع وخبير Google بالرياض", description: site.description, path: "/", active: "home", body, schema: [faqSchema(faq)] });
}

function finalCta(title = "لنحوّل فكرتك أو مشكلتك إلى خطة واضحة قابلة للتنفيذ", text = "أرسل الهدف والوضع الحالي والروابط المتاحة والموعد المتوقع. ستحصل على نقطة بداية منظمة تساعدك على اتخاذ القرار الصحيح.") {
  return `<section class="section-pad final-cta"><div class="container"><div class="cta-panel reveal"><div>${eyebrow("ابدأ من تشخيص صحيح")}<h2>${esc(title)}</h2><p>${esc(text)}</p></div><div class="cta-actions">${button(`${site.whatsapp}?text=${encodeURIComponent("مرحبًا م. إسلام، أرغب في مناقشة مشروع تقني.")}`, "ابدأ عبر واتساب", "button-light", true)}<a class="cta-phone" href="tel:${site.phone}" dir="ltr">${site.phoneDisplay}</a></div></div></div></section>`;
}

function innerHero({ eyebrowText, title, lead, path, crumbs = [], aside, afterLead = "", className = "" }) {
  const breadcrumb = [{ name: "الرئيسية", path: "/" }, ...crumbs];
  return `<section class="inner-hero${className ? ` ${esc(className)}` : ""}"><div class="container"><nav class="breadcrumbs" aria-label="مسار الصفحة">${breadcrumb.map((item, index) => `${index ? icon("chevron") : ""}<a href="${item.path}"${index === breadcrumb.length - 1 ? ' aria-current="page"' : ""}>${esc(item.name)}</a>`).join("")}</nav><div class="inner-hero-grid"><div class="inner-hero-copy reveal">${eyebrow(eyebrowText)}<h1>${title}</h1><p>${esc(lead)}</p>${afterLead}</div>${aside ? `<div class="inner-hero-aside reveal">${aside}</div>` : ""}</div></div></section>`;
}

function businessMapSection(language = "ar") {
  const isEnglish = language === "en";
  return `<section class="business-map-section" id="google-business-map" aria-labelledby="google-business-map-title"><div class="wide-map-container"><div class="business-map-heading reveal"><div>${eyebrow(isEnglish ? "Google Business Profile" : "الملف التجاري على Google")}<h2 id="google-business-map-title">${isEnglish ? "Eng. Eslam Elshikh on Google Maps" : "المهندس إسلام الشيخ على خرائط Google"}</h2><p>${isEnglish ? "View the verified business profile, service area, and contact options directly on Google Maps." : "استعرض الملف التجاري ونطاق الخدمة وبيانات التواصل مباشرة على خرائط Google."}</p></div><a class="text-link map-profile-link" href="${site.googleMapsProfile}" target="_blank" rel="noopener">${isEnglish ? "Open the business profile" : "فتح الملف التجاري"} ${icon("external")}</a></div><div class="business-map-frame reveal"><iframe src="${esc(site.googleMapsEmbed)}" width="600" height="450" title="${isEnglish ? "Google Maps business profile for Eng. Eslam Elshikh" : "خريطة الملف التجاري للمهندس إسلام الشيخ على Google Maps"}" loading="lazy" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe><a class="business-map-name-tag" href="${site.googleMapsProfile}" target="_blank" rel="noopener" aria-label="${isEnglish ? "Open Eng. Eslam Elshikh on Google Maps" : "فتح ملف المهندس إسلام الشيخ على خرائط Google"}"><span class="business-map-name-icon">${icon("pin")}</span><span><strong>${isEnglish ? "Eng. Eslam Elshikh" : "المهندس إسلام الشيخ"}</strong><small>${isEnglish ? "Google Business Profile · Riyadh" : "ملف تجاري على Google · الرياض"}</small></span></a></div><div class="business-map-bar reveal"><span>${icon("pin")}<span>${isEnglish ? "Service area: Riyadh, Saudi Arabia" : `نطاق الخدمة: ${site.city}، ${site.country}`}</span></span><span>${icon("clock")}<span>${isEnglish ? "Requests accepted 24/7" : "استقبال الطلبات على مدار الساعة"}</span></span><a href="tel:${site.phone}" dir="ltr">${icon("phone")}<span>${esc(site.phoneDisplay)}</span></a></div></div></section>`;
}

function servicesIndexPage() {
  const groups = [...new Set(services.map((service) => service.group))];
  const body = `${innerHero({ eyebrowText: "خدمات هندسية واستشارية", title: "خدمات رقمية متكاملة للأمان والتطوير والظهور والنمو", lead: "اختر خدمة مستقلة أو ابنِ مشروعًا متعدد المسارات يجمع الأمن السيبراني والبرمجيات والذكاء الاصطناعي وخبرة Google والسيو في خطة واضحة ومخرجات قابلة للقياس.", path: "/services/", crumbs: [{ name: "الخدمات", path: "/services/" }], aside: `<span class="aside-kicker">9 مسارات متخصصة</span><strong>من التشخيص إلى الإطلاق والتحسين</strong><p>كل صفحة توضح النطاق والمخرجات والخطوات والأسئلة الشائعة قبل التواصل.</p>` })}
<section class="section-pad"><div class="container"><div class="service-filters" role="tablist" aria-label="تصفية الخدمات"><button type="button" role="tab" aria-selected="true" data-service-filter="all">كل الخدمات</button>${groups.map((group) => `<button type="button" role="tab" aria-selected="false" data-service-filter="${esc(group)}">${esc(group)}</button>`).join("")}</div><div class="services-grid services-grid-index" data-services-grid>${services.map(serviceCard).join("")}</div></div></section>
<section class="section-pad muted-section"><div class="container decision-grid"><div class="decision-copy reveal">${eyebrow("كيف تختار نقطة البداية؟")}<h2>ابدأ بالمشكلة والنتيجة، لا باسم الأداة</h2><p>قد يكون بطء الموقع سببه التصميم أو الاستضافة أو الصور أو JavaScript، وقد يكون ضعف الظهور سببه الفهرسة أو المحتوى أو الملف التجاري أو القياس. التشخيص الصحيح يمنع الإنفاق على حل لا يعالج السبب.</p></div><div class="decision-steps"><article class="reveal"><span>01</span><h3>صف الوضع الحالي</h3><p>الرابط، المشكلة، أثرها، وما الذي جُرّب سابقًا.</p></article><article class="reveal"><span>02</span><h3>حدد النتيجة المطلوبة</h3><p>تحسين أمان، إطلاق منتج، ظهور محلي، أو أتمتة عملية.</p></article><article class="reveal"><span>03</span><h3>رتب القيود</h3><p>الموعد والميزانية والفريق والأنظمة والاعتماديات.</p></article><article class="reveal"><span>04</span><h3>اختر النطاق</h3><p>تدقيق، تنفيذ كامل، تحسين مرحلي، أو متابعة مستمرة.</p></article></div></div></section>
${finalCta("لست متأكدًا أي خدمة تناسب حالتك؟", "أرسل المشكلة والهدف والروابط المتاحة، وسنحدد نقطة البداية والنطاق الأكثر منطقية دون إضافة خدمات لا تحتاجها.")}`;
  return page({ title: "الخدمات التقنية والاستشارية", description: "خدمات المهندس إسلام الشيخ في الأمن السيبراني وتطوير المواقع ووكلاء الذكاء الاصطناعي وخدمات Google والسيو والحلول السحابية والإعلانات في السعودية.", path: "/services/", active: "services", body, schema: [breadcrumbSchema([{ name: "الرئيسية", path: "/" }, { name: "الخدمات", path: "/services/" }])] });
}

const serviceSectionCopy = {
  cybersecurity: {
    quick: "أصول وصلاحيات وأعراض تساعد على تحديد الخطر",
    scope: "نقاط الحماية التي يمكن تقييمها وتقويتها",
    deliverables: "تقرير وخطة معالجة يمكن إغلاقها وإعادة التحقق منها",
    audience: "متى يصبح التقييم الأمني أولوية؟",
    process: "من التصريح المكتوب إلى إعادة التحقق",
    faq: "حدود الفحص والتصريح والأدلة",
    related: "مسارات تقلل المخاطر المحيطة بالنظام"
  },
  "cloud-solutions": {
    quick: "حمل النظام والبيانات والاعتماديات قبل اختيار السحابة",
    scope: "طبقات بنية سحابية قابلة للتشغيل والاستعادة",
    deliverables: "معمارية وصلاحيات ومراقبة يفهمها فريقك",
    audience: "حالات تحتاج إعادة تصميم أو ترحيلًا سحابيًا",
    process: "من قياس الحمل إلى تشغيل بيئة مستقرة",
    faq: "المنصة والتكلفة والترحيل والمتابعة",
    related: "خدمات تكمل استقرار البنية السحابية"
  },
  "ai-agents": {
    quick: "مهمة محددة ومصدر موثوق وحدود واضحة للوكيل",
    scope: "قدرات AI يمكن ربطها بسير العمل الحقيقي",
    deliverables: "نموذج مُقيّم بصلاحيات وحالات فشل موثقة",
    audience: "عمليات تستحق تجربة وكيل ذكاء اصطناعي",
    process: "من حالة استخدام ضيقة إلى إطلاق مراقَب",
    faq: "البيانات والدقة والتكلفة والرقابة البشرية",
    related: "بنية ومعرفة تساعد الوكيل على العمل بثقة"
  },
  "web-development": {
    quick: "جمهور وهدف ومحتوى قبل اختيار شكل الواجهة",
    scope: "طبقات الموقع من المحتوى حتى الأداء والقياس",
    deliverables: "موقع قابل للاستخدام والفهرسة والتطوير",
    audience: "مشروعات تحتاج بناءً جديدًا أو إعادة هندسة",
    process: "من بنية المحتوى إلى الاختبار والإطلاق",
    faq: "التقنية والملكية والصيانة وموعد التسليم",
    related: "مسارات تزيد أمان الموقع وظهوره وتحويله"
  },
  "google-support": {
    quick: "المنتج والحساب ورسالة الخطأ وتسلسل المحاولات",
    scope: "تشخيص منظم لمسارات منتجات Google ودعمها",
    deliverables: "ملف حالة واضح وخطوات تصعيد قابلة للمتابعة",
    audience: "مشكلات تحتاج فهم القرار والمسار الرسمي",
    process: "من جمع الأدلة إلى المتابعة دون تشتيت الحالة",
    faq: "الصلاحيات والضمانات وقنوات الدعم الرسمية",
    related: "خدمات تربط منتجات Google بحضورك الرقمي"
  },
  "google-business-profile": {
    quick: "رابط الملف والأهلية والملكية وما يظهر في اللوحة",
    scope: "التوثيق والتعليق والملكية والظهور المحلي",
    deliverables: "تشخيص وأدلة ومسار مراجعة منظم",
    audience: "حالات ملفات تجارية تحتاج تدخلًا دقيقًا",
    process: "من فحص الأهلية إلى المراجعة والمتابعة",
    faq: "قرارات Google والأدلة والتعديلات الآمنة",
    related: "مسارات تقوي اتساق الملف والموقع والبحث المحلي"
  },
  "knowledge-bases": {
    quick: "المصادر والمستخدمون والأسئلة قبل اختيار محرك البحث",
    scope: "من تنظيم المعرفة إلى الاسترجاع والصلاحيات",
    deliverables: "قاعدة معرفة قابلة للبحث والقياس والتحديث",
    audience: "فرق تعاني معرفة مبعثرة أو إجابات غير متسقة",
    process: "من جرد المصادر إلى تقييم جودة الاسترجاع",
    faq: "التحديث والدقة والصلاحيات وربط الأنظمة",
    related: "خدمات تحول المعرفة إلى أداة عمل يومية"
  },
  seo: {
    quick: "الصفحات والاستعلامات والفهرسة قبل كتابة محتوى جديد",
    scope: "محاور السيو التقني والمحتوى والبحث المحلي",
    deliverables: "أولويات إصلاح وقياس بدل قائمة توصيات عامة",
    audience: "مواقع تحتاج استعادة الوضوح أو بناء نمو عضوي",
    process: "من خط الأساس إلى الإصلاح والقياس",
    faq: "المدة والترتيب والمحتوى وقياس الأثر",
    related: "مسارات تدعم الفهرسة والتجربة والتحويل"
  },
  "digital-advertising": {
    quick: "العرض والجمهور والصفحة والقياس قبل إطلاق الميزانية",
    scope: "الحملة وصفحة الهبوط وتتبع التحويل في مسار واحد",
    deliverables: "إعلانات وقياس وتحسين يمكن مراجعتها",
    audience: "حملات تحتاج وضوحًا أكبر في الطلب والتكلفة",
    process: "من فرضية الاستهداف إلى تحسين عبارات البحث",
    faq: "الميزانية والنتائج والصفحة وجودة العملاء",
    related: "خدمات تحسن الصفحة والظهور والقياس"
  }
};

function serviceDetailPage(service) {
  const path = `/services/${service.slug}/`;
  const sectionCopy = serviceSectionCopy[service.slug];
  const related = services.filter((item) => item.slug !== service.slug && (item.group === service.group || ["web-development", "seo", "cybersecurity"].includes(item.slug))).slice(0, 3);
  const serviceSchema = {
    "@type": "Service",
    "@id": `${absolute(path)}#service`,
    name: service.title,
    serviceType: service.title,
    description: service.meta,
    url: absolute(path),
    provider: { "@id": `${site.url}/#professional-service` },
    areaServed: [{ "@type": "City", name: site.city }, { "@type": "Country", name: site.country }],
    availableChannel: { "@type": "ServiceChannel", serviceUrl: absolute("/contact/"), availableLanguage: ["ar", "en"] },
    hasOfferCatalog: { "@type": "OfferCatalog", name: `نطاق ${service.title}`, itemListElement: service.scope.map((item) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: item } })) }
  };
  const specializedPageLink = service.slug === "digital-advertising"
    ? `<section class="section-pad"><div class="container proof-panel reveal"><div class="proof-icon">${icon("megaphone")}</div><div><span>صفحة متخصصة في Google Ads</span><h2>هل هدفك الأساسي هو الظهور المدفوع في بحث Google؟</h2><p>انتقل إلى الصفحة المخصصة لإعلانات جوجل للتعرف على إدارة حملات البحث، وبحث الكلمات، والكلمات السلبية، وتتبع التحويلات، وتحسين الميزانية وصفحة الهبوط.</p></div><div class="proof-actions">${button("/google-ads/", "خدمات إعلانات جوجل")}</div></div></section>`
    : service.slug === "seo"
      ? `<section class="section-pad"><div class="container proof-panel reveal"><div class="proof-icon">${icon("pin")}</div><div><span>مسار محلي مخصص للرياض</span><h2>هل هدفك الظهور للعملاء الباحثين داخل الرياض؟</h2><p>تجمع الصفحة المحلية بين بنية الموقع وصفحات الخدمات وملف Google التجاري والاتساق والسمعة والقياس، مع محتوى خاص بسوق الرياض دون تكرار صفحات الأحياء.</p></div><div class="proof-actions">${button("/local-seo/riyadh/", "السيو المحلي في الرياض")}</div></div></section>`
      : "";
  const body = `${innerHero({ eyebrowText: service.group, title: esc(service.h1), lead: service.short, path, crumbs: [{ name: "الخدمات", path: "/services/" }, { name: service.title, path }], aside: `<span class="service-hero-number">${service.number}</span><span class="service-hero-icon">${icon(service.icon)}</span><strong>${esc(service.value)}</strong>` })}
<section class="section-pad service-intro-section"><div class="container service-intro-grid"><div class="rich-copy reveal">${service.intro.map((paragraph) => `<p>${esc(paragraph)}</p>`).join("")}</div><aside class="service-quick-card reveal"><span>نقطة البداية</span><h2>${esc(sectionCopy.quick)}</h2>${checkList(["الهدف أو المشكلة الحالية", "الأنظمة أو الروابط المتأثرة", "الأثر على العملاء أو التشغيل", "الموعد المتوقع والقيود الرئيسية"])}${button(`${site.whatsapp}?text=${encodeURIComponent(`مرحبًا م. إسلام، أرغب في مناقشة خدمة ${service.title}.`)}`, "ناقش الخدمة عبر واتساب", "", true)}</aside></div></section>
${specializedPageLink}
<section class="section-pad muted-section"><div class="container"><div class="section-heading reveal">${eyebrow("نطاق الخدمة")}<h2>${esc(sectionCopy.scope)}</h2><p>${esc(service.value)}</p></div><div class="scope-grid">${service.scope.map((item, index) => `<article class="scope-card reveal"><span>${String(index + 1).padStart(2, "0")}</span>${icon(service.icon)}<p>${esc(item)}</p></article>`).join("")}</div></div></section>
<section class="section-pad deliverables-section"><div class="container split-heading"><div class="section-heading reveal">${eyebrow("المخرجات")}<h2>${esc(sectionCopy.deliverables)}</h2></div><div class="deliverables-panel reveal">${checkList(service.deliverables, "deliverables-list")}</div></div></section>
<section class="section-pad audience-section"><div class="container"><div class="section-heading reveal">${eyebrow("لمن تناسب الخدمة؟")}<h2>${esc(sectionCopy.audience)}</h2></div><div class="audience-grid">${service.forWho.map((item, index) => `<article class="audience-card reveal"><span>${String(index + 1).padStart(2, "0")}</span><p>${esc(item)}</p></article>`).join("")}</div></div></section>
<section class="section-pad process-section"><div class="container"><div class="section-heading reveal">${eyebrow("خطوات التنفيذ")}<h2>${esc(sectionCopy.process)}</h2></div><ol class="process-list service-process">${service.steps.map((step, index) => `<li class="reveal"><span>${String(index + 1).padStart(2, "0")}</span><h3>${esc(step.title)}</h3><p>${esc(step.text)}</p></li>`).join("")}</ol></div></section>
<section class="section-pad faq-section"><div class="container faq-grid"><div class="faq-intro reveal">${eyebrow("أسئلة الخدمة")}<h2>${esc(sectionCopy.faq)}</h2>${button("/contact/", "أرسل تفاصيل حالتك", "button-ghost")}</div>${faqBlock(service.faq)}</div></section>
<section class="section-pad related-section"><div class="container"><div class="section-heading reveal">${eyebrow("خدمات مترابطة")}<h2>${esc(sectionCopy.related)}</h2></div><div class="services-grid related-services">${related.map(serviceCard).join("")}</div></div></section>
${finalCta(`هل تحتاج ${service.title} ضمن مشروع واضح؟`, `أرسل الوضع الحالي والنتيجة المطلوبة، وسنحدد نطاقًا واقعيًا ومخرجات واضحة وخطوات قابلة للمتابعة.`)}`;
  return page({ title: service.seoTitle || service.title, description: service.meta, path, active: "services", body, schema: [serviceSchema, faqSchema(service.faq), breadcrumbSchema([{ name: "الرئيسية", path: "/" }, { name: "الخدمات", path: "/services/" }, { name: service.title, path }])] });
}

function aboutPage() {
  const body = renderAbout({
    site,
    mapsCount: mapsProjects.length,
    projectCount: projects.length,
    projects,
    profilePhoto,
    innerHero,
    icon,
    eyebrow,
    button,
    esc,
    projectImage,
    finalCta
  });
  const profileSchema = {
    "@type": "ProfilePage",
    "@id": `${site.url}/about/#profile`,
    url: `${site.url}/about/`,
    name: "الملف المهني للمهندس إسلام الشيخ",
    mainEntity: { "@id": `${site.url}/#person` },
    relatedLink: projects.filter((project) => project.caseStudy && project.slug).slice(0, 3).map((project) => `${site.url}/projects/${project.slug}/`),
    dateModified: site.lastUpdated
  };
  return page({
    title: "عن المهندس إسلام الشيخ | أمن سيبراني وتطوير مواقع وخبير Google بالرياض",
    description: "تعرّف على المهندس إسلام الشيخ، مهندس أمن سيبراني ومطور مواقع وبرمجيات في الرياض وخبير منتجات Google، مع مشروعات منشورة في تطوير الويب والذكاء الاصطناعي وخرائط جوجل والسيو المحلي.",
    path: "/about/",
    active: "about",
    body,
    stylesheets: [`/assets/css/about.css?v=${version}`],
    pageScripts: [`/assets/js/about.js?v=${version}`],
    schema: [profileSchema, breadcrumbSchema([{ name: "الرئيسية", path: "/" }, { name: "عن إسلام", path: "/about/" }])]
  });
}

function googleExpertPage() {
  const faq = [
    ["من هو إسلام الشيخ في مجال خرائط جوجل؟", "إسلام الشيخ خبير منتجات Google ومتخصص في خرائط جوجل والملفات التجارية، يساعد أصحاب الأنشطة في الرياض والسعودية على تشخيص مشكلات التحقق والتعليق والملكية والفئات وتحسين الظهور المحلي وفق سياسات Google."],
    ["كيف يساعد خبير خرائط جوجل النشاط التجاري؟", "يبدأ العمل بمراجعة أهلية النشاط ونموذجه وبيانات الملف والموقع المرتبط والمشكلات السابقة، ثم تحديد التصحيحات والأدلة والمسار المناسب للتحقق أو الاستئناف أو تحسين الظهور المحلي."],
    ["متى أحتاج إلى خبير جوجل ماب؟", "تحتاج إلى مراجعة متخصصة عند تعذر إثبات الملكية أو تعليق الملف أو فقدان الوصول أو وجود ملف مكرر أو رفض تعديلات مهمة أو انخفاض الظهور بسبب بيانات وفئات ومحتوى غير متسق."],
    ["ما الفرق بين خبير منتجات Google ومتخصص الملفات التجارية؟", "خبرة منتجات Google تعكس المساهمة العملية في مساعدة المستخدمين وفهم إرشادات المنتج، بينما يركز العمل المتخصص للملفات التجارية على تحليل نشاطك وبياناته وأدلته وموقعه وخطة ظهوره المحلي."],
    ["كيف أحل مشكلة إثبات الملكية بعد رفض الفيديو؟", "تتم مراجعة سبب الرفض وتسلسل اللقطات ومدى وضوح الموقع أو نطاق الخدمة واللافتة ومعدات العمل وإثبات الإدارة، ثم تجهيز الدليل وفق نموذج النشاط الحقيقي أو استخدام مسار التحقق الرسمي المتاح."],
    ["هل إضافة كلمات مفتاحية إلى اسم النشاط تحسن الظهور؟", "يجب أن يطابق الاسم المستخدم في الملف الاسم الحقيقي المعروف للنشاط. يتم تحسين الظهور من خلال الفئة والخدمات والموقع والمحتوى والسمعة والاتساق، وليس بإضافة كلمات غير موجودة في الاسم الفعلي."],
    ["هل يمكن تحسين الظهور على خرائط Google؟", "يمكن تحسين اكتمال الملف ودقة بياناته وارتباطه بالموقع والمحتوى والسمعة المحلية، ثم قياس الاستفسارات والإجراءات. أما ترتيب النتائج فيتغير حسب الصلة والمسافة والشهرة والمنافسة."],
    ["هل تضمن توثيق الملف أو تصدر خرائط جوجل؟", "لا يمكن ضمان قرار التحقق أو الاستعادة أو ترتيب محدد، لكن التشخيص الصحيح وتجهيز الأدلة وتحسين الاتساق والالتزام بالإرشادات يقلل الأخطاء ويبني ملفًا أقوى على المدى الطويل."]
  ];
  const expertService = {
    "@type": "Service",
    "@id": `${site.url}/google-expert/#service`,
    name: "استشارات خبير خرائط جوجل والملفات التجارية",
    serviceType: ["استشارات خرائط Google", "إدارة وتحسين Google Business Profile", "تحسين الظهور المحلي"],
    url: `${site.url}/google-expert/`,
    description: "خدمات إسلام الشيخ في خرائط جوجل والملفات التجارية تشمل تشخيص التحقق والتعليق والملكية والفئات وتحسين البيانات والظهور المحلي في السعودية.",
    provider: { "@id": `${site.url}/#person` },
    areaServed: [{ "@type": "City", name: "الرياض" }, { "@type": "Country", name: "المملكة العربية السعودية" }]
  };
  const body = `${innerHero({ eyebrowText: "خبير منتجات Google · الرياض والسعودية", title: "إسلام الشيخ — خبير خرائط جوجل والملفات التجارية", lead: "أنا إسلام الشيخ، خبير منتجات Google ومتخصص في خرائط جوجل والملفات التجارية. أساعد أصحاب الأنشطة على حل مشكلات التحقق والتعليق وإثبات الملكية وتحسين بيانات النشاط ورفع كفاءة الظهور في نتائج البحث وخرائط Google من خلال حلول عملية متوافقة مع السياسات.", path: "/google-expert/", crumbs: [{ name: "خبير خرائط جوجل", path: "/google-expert/" }], aside: `<span class="google-mark">G</span><strong>خبرة موثقة في Google Maps</strong><p>مساهمات عملية في منتجات Google ونماذج ملفات تجارية منشورة يمكن مراجعتها مباشرة.</p>` })}
<section class="section-pad"><div class="container google-stats"><div class="google-stat reveal"><strong>472</strong><span>ملفًا تجاريًا على Google تم دعم توثيقه</span></div><div class="google-stat reveal"><strong>233</strong><span>مشكلة ملف تجاري تم حلها ومعالجتها</span></div><div class="google-stat reveal"><strong>${mapsProjects.length}</strong><span>نموذجًا عامًا منشورًا يمكن مراجعته</span></div><div class="google-stat reveal"><strong>Google</strong><span>ملف خبير منتجات ومساهمات عملية</span></div></div></section>
<section class="section-pad muted-section"><div class="container service-intro-grid"><div class="rich-copy reveal"><h2>خبير جوجل ماب يساعدك على اتخاذ القرار الصحيح</h2><p>أبدأ بفهم نموذج النشاط الحقيقي، سواء كان يستقبل العملاء في موقع واضح أو يعمل في نطاق خدمة، ثم أراجع الاسم والفئة والعنوان أو المناطق والخدمات والموقع الإلكتروني والمستخدمين والتغييرات السابقة وإشعارات Google.</p><p>بعد التشخيص أحدد التناقضات والمخاطر والتصحيحات المطلوبة، وأرتب الأدلة والخطوات المناسبة للتحقق أو الاستئناف أو استعادة الوصول. وبعد استقرار الملف أعمل على تحسين اكتمال البيانات وربطها بالموقع والمحتوى والسيو المحلي وقياس التفاعل.</p>${button("/services/google-business-profile/", "عرض خدمات الملفات التجارية")}</div><aside class="disclaimer-card professional-summary-card reveal"><span>عن إسلام الشيخ</span><h2>خبرة منتجات Google مدعومة بمساهمات ونماذج منشورة</h2><p>يجمع إسلام الشيخ بين خبرة منتجات Google وإدارة الملفات التجارية والسيو المحلي وتطوير المواقع، لتقديم معالجة مترابطة تبدأ من صحة الملف وتصل إلى تجربة الموقع والتحويل والقياس.</p><a class="text-link" href="${site.social.googleDeveloper}" target="_blank" rel="noopener">عرض ملف خبير منتجات Google ${icon("external")}</a><a class="text-link" href="${site.googleMapsProfile}" target="_blank" rel="noopener">عرض الملف التجاري على خرائط Google ${icon("external")}</a></aside></div></section>
<section class="section-pad"><div class="container"><div class="section-heading reveal">${eyebrow("الحالات التي أتعامل معها")}<h2>من إنشاء الملف إلى استعادة الاستقرار والظهور</h2></div><div class="scope-grid"><article class="scope-card reveal"><span>01</span>${icon("pin")}<p>إعداد ملف مؤهل يعكس نموذج النشاط الحقيقي والفئة والخدمات ونطاق العمل.</p></article><article class="scope-card reveal"><span>02</span>${icon("shield")}<p>تشخيص تعليق الملف أو تعطيله ومراجعة التغييرات والمخاطر والملكية.</p></article><article class="scope-card reveal"><span>03</span>${icon("google")}<p>تجهيز إثبات الملكية بالفيديو أو الأدلة المتاحة بصورة منظمة ومتوافقة.</p></article><article class="scope-card reveal"><span>04</span>${icon("search")}<p>ربط الملف بالموقع والسيو المحلي والاتساق والمحتوى والقياس.</p></article><article class="scope-card reveal"><span>05</span>${icon("layers")}<p>مراجعة الملفات المكررة والملكية والمستخدمين والمواقع والفروع.</p></article><article class="scope-card reveal"><span>06</span>${icon("chart")}<p>تحليل الظهور والاستفسارات وجودة التحويل بعد استقرار الملف.</p></article></div></div></section>
<section class="section-pad maps-section"><div class="container"><div class="section-heading reveal">${eyebrow("نماذج منشورة")}<h2>ملفات تجارية حقيقية يمكن فتحها على خرائط Google</h2><p>مختارات من قطاعات ومدن مختلفة، مع صفحة مستقلة تضم السجل الكامل للأعمال.</p></div><div class="map-case-grid">${mapsProjects.filter((item) => item.featured).slice(0, 6).map(featuredMapCard).join("")}</div><div class="section-action">${button("/google-maps-projects/", `استعرض ${mapsProjects.length} ملفًا تجاريًا`, "button-ghost")}</div></div></section>
<section class="section-pad faq-section"><div class="container faq-grid"><div class="faq-intro reveal">${eyebrow("أسئلة خبير خرائط جوجل")}<h2>إجابات واضحة قبل تعديل ملفك التجاري</h2><p>الدقة والاتساق والأهلية أهم من كثرة المحاولات والتغييرات العشوائية.</p>${button(`${site.whatsapp}?text=${encodeURIComponent("مرحبًا م. إسلام، لدي مشكلة في ملف Google التجاري وأرغب في تشخيصها.")}`, "أرسل تفاصيل الحالة", "button-ghost", true)}</div>${faqBlock(faq)}</div></section>
${finalCta("ملفك التجاري معلق أو تعذر إثبات ملكيته؟", "أرسل رابط الملف ونص الإشعار وتسلسل التعديلات والمحاولات السابقة دون مشاركة كلمة مرور أو رمز تحقق.")}`;
  return page({ title: "إسلام الشيخ — خبير خرائط جوجل والملفات التجارية", description: "إسلام الشيخ خبير منتجات Google ومتخصص في خرائط جوجل والملفات التجارية بالسعودية، يقدم حلول التحقق والتعليق وتحسين الظهور المحلي وفق السياسات.", path: "/google-expert/", active: "google", body, schema: [expertService, faqSchema(faq), breadcrumbSchema([{ name: "الرئيسية", path: "/" }, { name: "خبير خرائط جوجل", path: "/google-expert/" }])] });
}

function googleAdsPage() {
  const path = "/google-ads/";
  const whatsappMessage = "مرحبًا م. إسلام، أرغب في مناقشة إدارة حملة إعلانات جوجل لنشاطي.";
  const scope = [
    "مراجعة حساب Google Ads الحالي والأهداف والميزانية وجودة البيانات قبل زيادة الإنفاق",
    "إنشاء حملات إعلانات البحث وتقسيمها حسب الخدمة والمنطقة ونية العميل",
    "بحث الكلمات المفتاحية وتحليل عبارات البحث وبناء قوائم الكلمات السلبية",
    "كتابة الإعلانات المتجاوبة وتجهيز مواد العرض والمكالمات وروابط الأقسام",
    "ضبط المواقع الجغرافية واللغة والجداول والأجهزة واستراتيجية عروض الأسعار",
    "إعداد تتبع التحويلات للمكالمات والنماذج والشراء والأحداث المهمة حسب الإمكانات",
    "مراجعة سرعة صفحة الهبوط ورسالتها وتجربة الجوال واتساقها مع الإعلان",
    "تحسين دوري للميزانية والاستعلامات والإعلانات وصفحات الهبوط مع تقارير قرار واضحة"
  ];
  const searchIntents = [
    { title: "إعلانات جوجل", text: "العبارة الأساسية للصفحة، وتغطي إنشاء وإدارة الحملات المدفوعة على منصة Google Ads." },
    { title: "إدارة حملات جوجل", text: "طلب تجاري مباشر من نشاط يحتاج بناء الحملة ومتابعتها وتحسينها، لا مجرد شرح نظري للمنصة." },
    { title: "خبير إعلانات جوجل", text: "بحث يركز على الشخص القادر على تحليل الحساب والكلمات والقياس واتخاذ قرارات تحسين مستمرة." },
    { title: "إعلان ممول على جوجل", text: "نية مناسبة لصاحب نشاط يريد بدء إعلان بحث مدفوع بميزانية ونطاق جغرافي وهدف واضح." }
  ];
  const process = [
    { title: "تشخيص الهدف والحساب", text: "تحديد الخدمة والجمهور والمنطقة وقيمة العميل، ثم مراجعة الحساب والبيانات والحملات السابقة إن وجدت." },
    { title: "بناء القياس والصفحة", text: "تعريف التحويلات المهمة، وفحص صفحة الهبوط وسرعتها ورسالتها، وتجهيز التتبع الممكن قبل الإطلاق." },
    { title: "إنشاء الحملة والإعلانات", text: "تقسيم الكلمات والمجموعات والمناطق، وكتابة الإعلانات، وضبط الميزانية والاستبعادات والإعدادات." },
    { title: "تحسين مبني على الجودة", text: "مراجعة عبارات البحث والتكلفة والتحويل وجودة الطلبات، ثم تقليل الهدر وتوسيع ما يثبت جدواه." }
  ];
  const audiences = [
    "شركة خدمات في الرياض أو السعودية تريد مكالمات واستفسارات من أشخاص يبحثون الآن",
    "متجر إلكتروني يحتاج حملات قابلة للقياس مرتبطة بالمنتجات والشراء وقيمة الطلب",
    "نشاط B2B يريد فصل الخدمات والمناطق ورسائل القرار بدل إرسال كل الزيارات إلى الصفحة الرئيسية",
    "حساب قائم ينفق دون وضوح في التحويلات أو عبارات البحث أو جودة العملاء المحتملين"
  ];
  const faq = [
    ["ما هي خدمة إدارة حملات إعلانات جوجل؟", "تشمل مراجعة الهدف والحساب، وبحث الكلمات، وبناء الحملات والمجموعات الإعلانية، وكتابة الإعلانات، وضبط المواقع والميزانية والكلمات السلبية، وربط التحويلات الممكنة، ثم المتابعة والتحسين والتقارير."],
    ["كيف أسوي إعلان ممول على جوجل لنشاطي؟", "يبدأ الإعلان بتحديد خدمة واضحة ومنطقة وجمهور وإجراء مطلوب مثل اتصال أو نموذج أو شراء. بعد ذلك يتم تجهيز حساب Google Ads وصفحة الهبوط والقياس، ثم بناء حملة بحث واختيار الكلمات والإعلانات والميزانية قبل الإطلاق."],
    ["كم تكلفة إعلانات جوجل في السعودية؟", "لا توجد تكلفة ثابتة؛ فسعر النقرة والميزانية المناسبة يتأثران بالمجال والمدينة والمنافسة والكلمات والهدف وجودة الصفحة. تُفصل ميزانية المنصة عن أتعاب الإدارة، ويُقترح نطاق إنفاق بعد مراجعة السوق والهدف."],
    ["هل إعلانات جوجل مناسبة للأنشطة المحلية في الرياض؟", "تكون مناسبة عندما يبحث العميل عن الخدمة في منطقة محددة ويمكن للنشاط استقبال الطلبات وقياس المكالمات أو النماذج. يتم ضبط الاستهداف الجغرافي والرسالة والصفحة وساعات استقبال الطلبات وفق التشغيل الفعلي."],
    ["هل تشمل الإدارة الكلمات السلبية وعبارات البحث؟", "نعم. تتم مراجعة عبارات البحث الفعلية لإضافة الاستبعادات وتقليل النقرات غير المناسبة، مع فصل نوايا الخدمات والمناطق قدر الإمكان بدل جمع كلمات مختلفة في مجموعة واحدة."],
    ["هل يلزم تتبع التحويلات قبل تشغيل الحملة؟", "يفضل إعداد التحويلات الأساسية الممكنة قبل الإطلاق، مثل إرسال النموذج أو الاتصال أو الشراء، لأن التحسين دون قياس يجعل القرار معتمدًا على النقرات فقط. قد يحتاج التنفيذ إلى Google tag أو Google Analytics أو Tag Manager حسب الموقع."],
    ["ما الفرق بين إعلانات جوجل وتحسين محركات البحث SEO؟", "إعلانات جوجل تشتري ظهورًا مدفوعًا يمكن تشغيله وتحسينه ضمن ميزانية، بينما يبني SEO ظهورًا عضويًا يحتاج وقتًا ومحتوى وبنية وسمعة. يمكن للمسارين العمل معًا، لكن لكل منهما صفحة وميزانية ومؤشرات مختلفة."],
    ["هل تضمن الحملة مبيعات أو عدد عملاء محددًا؟", "لا يمكن ضمان مبيعات أو عدد ثابت لأن السعر والعرض والمنافسة والصفحة وسرعة الرد والمبيعات عوامل خارج المنصة أيضًا. ما يمكن ضبطه هو بنية الحملة والقياس والاستهداف والاختبار والشفافية في قرارات التحسين."]
  ];
  const adsService = {
    "@type": "Service",
    "@id": `${site.url}${path}#service`,
    name: "إدارة حملات إعلانات جوجل Google Ads",
    alternateName: ["إعلانات جوجل", "إدارة حملات جوجل", "إعلان ممول على جوجل"],
    serviceType: ["إدارة حملات إعلانات Google", "Google Ads Management", "إعلانات البحث المدفوعة"],
    url: `${site.url}${path}`,
    description: "خدمات إدارة إعلانات جوجل في الرياض والسعودية تشمل حملات البحث وبحث الكلمات والكلمات السلبية وتتبع التحويلات وتحسين الميزانية وصفحات الهبوط.",
    provider: { "@id": `${site.url}/#professional-service` },
    areaServed: [{ "@type": "City", name: "الرياض" }, { "@type": "Country", name: "المملكة العربية السعودية" }],
    availableChannel: { "@type": "ServiceChannel", serviceUrl: `${site.url}/contact/`, availableLanguage: ["ar", "en"] },
    hasOfferCatalog: { "@type": "OfferCatalog", name: "نطاق إدارة حملات إعلانات جوجل", itemListElement: scope.map((item) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: item } })) }
  };
  const body = `${innerHero({ eyebrowText: "إعلانات Google · الرياض والسعودية", title: "إسلام الشيخ — خبير إعلانات جوجل وإدارة حملات Google Ads", lead: "أخطط وأدير حملات إعلانات جوجل للأنشطة والشركات التي تريد الوصول إلى عملاء يبحثون عن خدماتها الآن. يبدأ العمل من نية البحث والهدف وصفحة الهبوط وتتبع التحويل، ثم تتحول الكلمات والميزانية والإعلانات إلى قرارات تحسين قابلة للقياس بدل الاكتفاء بعدد النقرات.", path, crumbs: [{ name: "إعلانات جوجل", path }], aside: `<span class="aside-kicker">Google Ads</span><strong>حملات مبنية على نية البحث والقياس</strong><p>بحث كلمات، إعلانات متجاوبة، كلمات سلبية، تحويلات، صفحات هبوط، وتحسين مستمر للميزانية.</p>` })}
<section class="section-pad"><div class="container google-stats"><div class="google-stat reveal"><strong>Search</strong><span>استهداف طلب موجود في لحظة البحث</span></div><div class="google-stat reveal"><strong>Leads</strong><span>مكالمات ونماذج وإجراءات تجارية مهمة</span></div><div class="google-stat reveal"><strong>Tracking</strong><span>قياس قبل توسيع الميزانية والإنفاق</span></div><div class="google-stat reveal"><strong>السعودية</strong><span>حملات للرياض ومناطق الخدمة المناسبة</span></div></div></section>
<section class="section-pad muted-section"><div class="container service-intro-grid"><div class="rich-copy reveal"><h2>إدارة إعلانات جوجل تبدأ قبل الضغط على زر إطلاق الحملة</h2><p>الحملة القوية لا تبدأ بقائمة كلمات كبيرة؛ بل بخدمة محددة، وعميل واضح، ومنطقة يستطيع النشاط خدمتها، وصفحة تجيب عن سؤال الباحث وتقوده إلى اتصال أو نموذج أو شراء. لذلك أراجع العرض والموقع وتجربة الجوال والرسالة والقياس قبل اقتراح زيادة الميزانية.</p><p>بعد الإطلاق تتم قراءة عبارات البحث الفعلية، وتكاليف النقر والتحويل، ونوعية المكالمات أو الطلبات، ثم تعديل الكلمات السلبية والمطابقات والإعلانات والصفحة والميزانية. الهدف هو معرفة أين يذهب الإنفاق وما الذي ينتج عنه، دون وعود مصطنعة بمبيعات أو مركز ثابت.</p><div class="hero-actions">${button(`${site.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`, "ناقش حملة Google Ads", "", true)}${button("/services/digital-advertising/", "الإعلانات الرقمية وصفحات الهبوط", "button-ghost")}</div></div><aside class="service-quick-card reveal"><span>قبل بدء الإعلان</span><h2>أرسل هذه المعلومات لتقييم نقطة البداية</h2>${checkList(["الخدمة أو المنتجات ذات الأولوية", "المدن أو مناطق الاستهداف", "رابط الموقع أو صفحة الهبوط", "الميزانية التقريبية والهدف", "هل توجد حملات وبيانات سابقة؟"])}<p>لا ترسل كلمة مرور. يفضّل أن يبقى الحساب باسمك وتُمنح صلاحية الإدارة المناسبة عند الاتفاق.</p></aside></div></section>
<section class="section-pad"><div class="container"><div class="section-heading reveal">${eyebrow("نطاق إدارة Google Ads")}<h2>ما الذي يمكن أن تشمله إدارة حملتك؟</h2><p>يُحدد النطاق النهائي حسب نوع النشاط والحساب والموقع والهدف، وتُستخدم فقط أنواع الحملات والإعدادات المناسبة للحالة.</p></div><div class="scope-grid">${scope.map((item, index) => `<article class="scope-card reveal"><span>${String(index + 1).padStart(2, "0")}</span>${icon(index === 5 ? "chart" : index === 6 ? "globe" : "megaphone")}<p>${esc(item)}</p></article>`).join("")}</div></div></section>
<section class="section-pad muted-section"><div class="container"><div class="section-heading reveal">${eyebrow("نية العميل والكلمات")}<h2>مجموعات بحث تجارية تخدمها الصفحة دون حشو</h2><p>تستهدف الصفحة موضوعًا رئيسيًا واحدًا هو إعلانات Google، وتغطي الصيغ القريبة عندما تعبر عن احتياج مختلف داخل رحلة العميل.</p></div><div class="audience-grid">${searchIntents.map((item, index) => `<article class="audience-card reveal"><span>${String(index + 1).padStart(2, "0")}</span><h3>${esc(item.title)}</h3><p>${esc(item.text)}</p></article>`).join("")}</div></div></section>
<section class="section-pad process-section"><div class="container"><div class="section-heading reveal">${eyebrow("منهج إدارة الحملة")}<h2>أربع مراحل تربط الإعلان بجودة الطلب</h2><p>التحسين عملية دورية تبدأ ببيانات صحيحة، ثم تختبر فرضيات واضحة بدل التغييرات العشوائية.</p></div><ol class="process-list service-process">${process.map((step, index) => `<li class="reveal"><span>${String(index + 1).padStart(2, "0")}</span><h3>${esc(step.title)}</h3><p>${esc(step.text)}</p></li>`).join("")}</ol></div></section>
<section class="section-pad audience-section"><div class="container"><div class="section-heading reveal">${eyebrow("لمن تناسب الخدمة؟")}<h2>حالات تستفيد من إدارة Google Ads المتخصصة</h2></div><div class="audience-grid">${audiences.map((item, index) => `<article class="audience-card reveal"><span>${String(index + 1).padStart(2, "0")}</span><p>${esc(item)}</p></article>`).join("")}</div></div></section>
<section class="section-pad muted-section"><div class="container promise-grid"><div class="promise-copy reveal">${eyebrow("القياس والملكية")}<h2>حسابك وبياناتك أساس الاستمرارية</h2><p>يفضل إنشاء الحملة داخل حساب يملكه النشاط مع منح صلاحيات الإدارة اللازمة، وفصل ميزانية Google عن أتعاب الخدمة. تُوثق التحويلات والإعدادات والتغييرات المهمة لتتمكن من مراجعة الأداء واتخاذ القرار.</p>${button("/services/seo/", "قارن مع خدمات SEO", "button-ghost")}</div><div class="principles-grid"><article class="principle reveal"><span>01</span>${icon("target")}<h3>هدف واضح</h3><p>اتصال أو نموذج أو شراء أو إجراء محدد يمكن تقييمه.</p></article><article class="principle reveal"><span>02</span>${icon("search")}<h3>طلب مناسب</h3><p>فصل الكلمات ذات النية التجارية عن الاستعلامات غير المناسبة.</p></article><article class="principle reveal"><span>03</span>${icon("chart")}<h3>قياس مفهوم</h3><p>تقارير تربط الإنفاق بالتحويلات وجودة الطلبات قدر الإمكان.</p></article><article class="principle reveal"><span>04</span>${icon("layers")}<h3>تحسين موثق</h3><p>كل تعديل له سبب ومؤشر للمراجعة وخطوة تالية.</p></article></div></div></section>
<section class="section-pad faq-section"><div class="container faq-grid"><div class="faq-intro reveal">${eyebrow("أسئلة إعلانات جوجل")}<h2>إجابات مهمة قبل استثمار ميزانيتك</h2><p>التكلفة ونوع الحملة وخطة القياس تختلف من نشاط لآخر؛ لذلك تبدأ الإدارة بالتشخيص لا بباقة عامة.</p>${button(`${site.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`, "أرسل تفاصيل نشاطك", "button-ghost", true)}</div>${faqBlock(faq)}</div></section>
${finalCta("هل تريد إطلاق إعلان ممول على جوجل بصورة قابلة للقياس؟", "أرسل الخدمة والمنطقة ورابط الموقع والهدف والميزانية التقريبية، وسنحدد ما يحتاج إلى تجهيز قبل الإطلاق وما يمكن تحسينه داخل الحملة.")}`;
  return page({
    title: "إعلانات جوجل وإدارة حملات Google Ads | إسلام الشيخ",
    description: "إدارة إعلانات جوجل وحملات Google Ads في الرياض والسعودية: بحث الكلمات، الكلمات السلبية، تتبع التحويلات، تحسين الميزانية وصفحات الهبوط لجذب استفسارات أفضل.",
    path,
    active: "services",
    body,
    schema: [adsService, faqSchema(faq), breadcrumbSchema([{ name: "الرئيسية", path: "/" }, { name: "إعلانات جوجل", path }])]
  });
}

const mapWorkTracks = [
  { number: "01", title: "دعم التوثيق والتحقق", text: "تجهيز متطلبات التحقق ومراجعة أهلية النشاط والبيانات والأدلة قبل اختيار مسار الإثبات المناسب." },
  { number: "02", title: "إثبات الملكية واستعادة الوصول", text: "تشخيص تعارضات الملكية وطلبات الوصول وتجميع المعلومات اللازمة للوصول إلى القناة الصحيحة دون مشاركة كلمات المرور." },
  { number: "03", title: "معالجة القيود والتعليق", text: "فهم سبب القيد، إصلاح المشكلات القابلة للمعالجة، ثم تجهيز طلب مراجعة واضح ومدعوم بالمستندات المتاحة." },
  { number: "04", title: "تحسين الظهور المحلي والسيو", text: "تحسين الفئات والخدمات والمحتوى واتساق البيانات وربط الملف بالموقع والصفحات المحلية وقياس التفاعل." }
];

function mapRequestHref(item) {
  const message = `مرحبًا م. إسلام، شاهدت ملف «${item.title}» ضمن أعمال خرائط Google، ولدي حالة مشابهة وأرغب في تشخيصها.`;
  return `${site.whatsapp}?text=${encodeURIComponent(message)}`;
}

function featuredMapCard(item, index) {
  return `<article class="map-case-card reveal"><div class="map-case-top"><span class="map-case-number" dir="ltr">${String(index + 1).padStart(2, "0")}</span><span class="map-case-pin">${icon("pin")}</span></div><p class="map-case-category">${esc(item.category)}</p><h3>${esc(item.title)}</h3><p class="map-case-location">${icon("pin")}<span>${esc(item.location)}</span></p><div class="map-case-actions"><a class="button button-small" href="${item.url}" target="_blank" rel="noopener" aria-label="عرض ملف ${esc(item.title)} على خرائط Google">عرض الملف ${icon("external", "button-icon")}</a><a class="button button-small button-ghost" href="${mapRequestHref(item)}" target="_blank" rel="noopener" aria-label="مناقشة حالة خرائط مشابهة لملف ${esc(item.title)}">ناقش حالة مشابهة ${icon("whatsapp", "button-icon")}</a></div></article>`;
}

function mapLedgerCard(item, index) {
  return `<article class="map-ledger-card reveal"><span class="map-ledger-number" dir="ltr">${String(index + 1).padStart(2, "0")}</span><div><p>${esc(item.category)}</p><h3>${esc(item.title)}</h3><span>${icon("pin")} ${esc(item.location)}</span></div><a href="${item.url}" target="_blank" rel="noopener" aria-label="عرض ملف ${esc(item.title)} على خرائط Google">${icon("external")}</a></article>`;
}

function mapsWorkTeaser() {
  const samples = mapsProjects.filter((item) => item.featured).slice(0, 5);
  return `<section class="section-pad maps-work-teaser"><div class="container"><div class="maps-teaser-panel reveal"><div class="maps-teaser-copy">${eyebrow("أعمال خرائط Google")}<h2>سجل أعمال حقيقي عبر قطاعات ومدن مختلفة</h2><p>${mapsProjects.length} ملفًا تجاريًا فريدًا يمكن فتحها مباشرة، ضمن خبرة تشمل دعم التوثيق وإثبات الملكية ومعالجة القيود وتحسين الظهور المحلي.</p><div class="maps-teaser-actions">${button("/google-maps-projects/", "استعرض أعمال الخرائط")} ${button(`${site.whatsapp}?text=${encodeURIComponent("مرحبًا م. إسلام، لدي ملف تجاري على Google وأرغب في تشخيصه.")}`, "ناقش حالة ملفك", "button-ghost", true)}</div></div><div class="maps-teaser-stack" aria-label="نماذج من أعمال خرائط Google">${samples.map((item, index) => `<a href="${item.url}" target="_blank" rel="noopener"><span dir="ltr">${String(index + 1).padStart(2, "0")}</span><strong>${esc(item.title)}</strong>${icon("external")}</a>`).join("")}</div></div></div></section>`;
}

function googleMapsProjectsPage() {
  const featured = mapsProjects.filter((item) => item.featured);
  const archive = mapsProjects.filter((item) => !item.featured);
  const categories = [...new Set(mapsProjects.map((item) => item.category))];
  const mapListSchema = {
    "@type": "ItemList",
    name: "نماذج أعمال خرائط Google والملفات التجارية",
    numberOfItems: mapsProjects.length,
    itemListElement: mapsProjects.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.title, url: item.url }))
  };
  const body = `${innerHero({ eyebrowText: "أعمال خرائط Google", title: `${mapsProjects.length} ملفًا تجاريًا حقيقيًا، لا أرقامًا بلا دليل`, lead: "نماذج عامة من ملفات تجارية عملت عليها ضمن مسارات دعم التوثيق والتحقق، وإثبات الملكية واستعادة الوصول، ومعالجة القيود، وتحسين الظهور المحلي والسيو.", path: "/google-maps-projects/", crumbs: [{ name: "الأعمال", path: "/projects/" }, { name: "أعمال خرائط Google", path: "/google-maps-projects/" }], aside: `<span class="aside-kicker">Google Business Profile</span><strong>كل رابط يقود إلى ملف عام فعلي على خرائط Google</strong><p>نعرض الملفات كما هي دون اختلاق نتائج أو وعود بترتيب ثابت، لأن كل حالة لها ظروفها وأهليتها ومنافسوها.</p>` })}
<section class="section-pad maps-method-section"><div class="container"><div class="maps-work-stats reveal"><div><strong>${mapsProjects.length}</strong><span>ملفًا فريدًا</span></div><div><strong>${categories.length}</strong><span>قطاعًا مختلفًا</span></div><div><strong>${mapWorkTracks.length}</strong><span>مسارات دعم رئيسية</span></div><div><strong>Google</strong><span>روابط عامة قابلة للمعاينة</span></div></div><div class="section-heading reveal">${eyebrow("نطاق الخبرة")}<h2>من إثبات الأهلية إلى حضور محلي أوضح</h2><p>الخدمة لا تعتمد على تعديل واحد؛ بل تبدأ بتشخيص حالة الملف والنشاط، ثم اختيار المسار المتوافق مع سياسات Google والهدف التجاري.</p></div><div class="map-track-grid">${mapWorkTracks.map((track) => `<article class="map-track-card reveal"><span dir="ltr">${track.number}</span><h3>${esc(track.title)}</h3><p>${esc(track.text)}</p></article>`).join("")}</div></div></section>
<section class="section-pad muted-section maps-featured-section"><div class="container"><div class="portfolio-page-heading reveal"><span>${featured.length} حالة مختارة</span><p>مختارات متنوعة من المقاولات والخدمات المنزلية والصحة والمطاعم والمتاجر والأنظمة الأمنية.</p></div><div class="map-case-grid">${featured.map(featuredMapCard).join("")}</div></div></section>
<section class="section-pad maps-ledger-section"><div class="container"><div class="section-heading reveal">${eyebrow("السجل الكامل")}<h2>جميع الملفات الفريدة التي أرسلتها</h2><p>تم استبعاد رابط واحد مكرر كان يقود إلى الملف نفسه، والإبقاء على ${mapsProjects.length} ملفًا فريدًا. اختلاف الاسم أو الفرع مع اختلاف الرابط والموقع يُعرض كحالة مستقلة.</p></div><div class="map-category-cloud" aria-label="قطاعات أعمال خرائط Google">${categories.map((category) => `<span>${esc(category)}</span>`).join("")}</div><div class="map-ledger-grid">${archive.map((item, index) => mapLedgerCard(item, index + featured.length)).join("")}</div><div class="independent-note reveal">${icon("shield")}<p><strong>شفافية مهمة:</strong> إسلام الشيخ مستشار مستقل وخبير منتجات في مجتمع Google، وليس موظفًا لدى Google. لا يمكن ضمان قبول التحقق أو رفع القيد أو مركز ثابت في النتائج؛ القرار النهائي والترتيب يخضعان لأنظمة Google وأهلية كل نشاط.</p></div></div></section>
${finalCta("هل لديك ملف يحتاج توثيقًا أو استعادة ملكية أو رفع قيود؟", "أرسل رابط الملف ووضعه الحالي وما يظهر في لوحة الإدارة، وسأبدأ بتشخيص المسار الصحيح قبل أي تعديل أو طلب مراجعة.")}`;
  return page({ title: "أعمال خرائط Google والملفات التجارية | إسلام الشيخ", description: `استعرض ${mapsProjects.length} نموذجًا فعليًا من أعمال إسلام الشيخ في ملفات Google التجارية: دعم التوثيق وإثبات الملكية ومعالجة القيود وتحسين الظهور المحلي والسيو.`, path: "/google-maps-projects/", active: "maps", body, keywords: ["أعمال خرائط جوجل", "توثيق خرائط جوجل", "إثبات ملكية ملف جوجل", "رفع تعليق الملف التجاري", "تحسين ظهور خرائط جوجل", "خبير خرائط جوجل"], schema: [mapListSchema, breadcrumbSchema([{ name: "الرئيسية", path: "/" }, { name: "الأعمال", path: "/projects/" }, { name: "أعمال خرائط Google", path: "/google-maps-projects/" }])] });
}

function projectsPage() {
  const projectList = {
    "@type": "ItemList",
    "@id": `${site.url}/projects/#project-list`,
    name: "مشروعات المواقع المنشورة للمهندس إسلام الشيخ",
    numberOfItems: projects.length,
    itemListElement: projects.map((project, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: project.title,
      url: project.slug ? `${site.url}/projects/${project.slug}/` : project.liveUrl
    }))
  };
  const collectionSchema = {
    "@type": "CollectionPage",
    "@id": `${site.url}/projects/#collection`,
    url: `${site.url}/projects/`,
    name: "أعمال ومشروعات المهندس إسلام الشيخ",
    description: "مجموعة منتقاة من أعمال إسلام الشيخ المنشورة في تطوير المواقع وتجربة المستخدم والسيو التقني والمحلي.",
    creator: { "@id": `${site.url}/#person` },
    mainEntity: { "@id": projectList["@id"] },
    dateModified: site.lastUpdated
  };
  const body = `${innerHero({ eyebrowText: "الأعمال والمشروعات", title: "نماذج من تطوير المواقع والسيو المحلي والحضور الرقمي", lead: "مشروعات عامة توضح كيف يتحول الهدف التجاري إلى بنية محتوى وتجربة متجاوبة ومسارات تواصل وقياس، مع الاهتمام بالتفاصيل التي تظهر على الجوال قبل سطح المكتب.", path: "/projects/", crumbs: [{ name: "الأعمال", path: "/projects/" }], aside: `<span class="aside-kicker">Selected Work</span><strong>تصميم وتطوير وسيو في منظومة واحدة</strong><p>كل مشروع يعالج سياقًا مختلفًا؛ من المقاولات والخدمات المحلية إلى شركات التقنية والذكاء الاصطناعي.</p>` })}
<section class="section-pad portfolio-page-section"><div class="container"><div class="portfolio-page-heading reveal"><span>${projects.length} مشروعًا منشورًا</span><p>مجموعة منتقاة من المواقع والمنصات العامة، مرتبة بصريًا لتوضّح تنوع القطاعات وطبيعة الحل في كل مشروع.</p></div>${projectsShowcase()}</div></section>
${mapsWorkTeaser()}
<section class="section-pad"><div class="container case-method reveal"><div><span>منهج المشروع</span><h2>لا توجد نسخة واحدة تُكرر على كل نشاط</h2></div><p>تختلف بنية الموقع والمحتوى والدعوات والبيانات المنظمة حسب نموذج النشاط ورحلة العميل والمنافسة والقدرة التشغيلية. الهدف هو حل يناسب العمل الحقيقي، لا قالبًا يغير الألوان والشعار فقط.</p>${button("/contact/", "ناقش مشروعًا مشابهًا")}</div></section>
${finalCta("هل تريد تحويل نشاطك إلى تجربة رقمية احترافية؟", "أرسل رابط الموقع أو الملف التجاري والخدمات المستهدفة والمدينة والهدف، وسنحدد ما يحتاج إعادة بناء وما يمكن تحسينه تدريجيًا.")}`;
  return page({ title: "أعمال ومشروعات المهندس إسلام الشيخ", description: "نماذج أعمال المهندس إسلام الشيخ في تطوير المواقع وتجربة المستخدم والسيو التقني والمحلي وملفات Google التجارية للشركات والأنشطة في السعودية.", path: "/projects/", active: "projects", body, schema: [collectionSchema, projectList, breadcrumbSchema([{ name: "الرئيسية", path: "/" }, { name: "الأعمال", path: "/projects/" }])] });
}

function projectCaseStudyPage(project) {
  const path = `/projects/${project.slug}/`;
  const study = project.caseStudy;
  const domain = new URL(project.liveUrl).hostname.replace(/^www\./, "");
  const requestMessage = `مرحبًا م. إسلام، قرأت دراسة حالة «${project.title}» وأرغب في مناقشة مشروع مشابه.`;
  const creativeWorkSchema = {
    "@type": "CreativeWork",
    "@id": `${absolute(path)}#project`,
    name: project.title,
    description: project.description,
    url: absolute(path),
    image: absolute(project.image),
    sameAs: project.liveUrl,
    creator: { "@id": `${site.url}/#person` },
    keywords: project.tags,
    dateModified: site.lastUpdated
  };
  const body = `${innerHero({ eyebrowText: "دراسة حالة مشروع", title: esc(project.title), lead: project.description, path, crumbs: [{ name: "الأعمال", path: "/projects/" }, { name: project.title, path }], aside: `<div class="case-study-preview"><span>${esc(project.category)}</span>${projectImage(project, { eager: true })}<small dir="ltr">${esc(domain)}</small></div>` })}
<section class="section-pad case-study-overview"><div class="container case-study-layout"><article class="rich-copy reveal"><span class="case-study-label">الهدف</span><h2>ما الذي كان مطلوبًا من التجربة؟</h2><p>${esc(study.objective)}</p><div class="tag-row" aria-label="محاور المشروع">${project.tags.map((tag) => `<span>${esc(tag)}</span>`).join("")}</div></article><aside class="case-study-facts reveal"><span>بطاقة المشروع</span><dl><div><dt>نوع العمل</dt><dd>${esc(project.category)}</dd></div><div><dt>النطاق المعروض</dt><dd>تصميم وتنفيذ وتجربة رقمية</dd></div><div><dt>حالة النسخة</dt><dd>رابط عام قابل للمراجعة</dd></div></dl>${button(project.liveUrl, "فتح المشروع الحي", "button-ghost", true)}</aside></div></section>
<section class="section-pad muted-section"><div class="container"><div class="section-heading reveal">${eyebrow("نطاق التنفيذ")}<h2>الأجزاء التي شملها العمل</h2><p>العناصر التالية تصف نطاق النسخة العامة المنشورة ولا تفترض نتائج تجارية لم يتم قياسها أو توثيقها.</p></div><div class="case-study-scope">${study.scope.map((item, index) => `<article class="scope-card reveal"><span>${String(index + 1).padStart(2, "0")}</span>${icon("layers")}<p>${esc(item)}</p></article>`).join("")}</div></div></section>
<section class="section-pad"><div class="container split-heading"><div class="section-heading reveal">${eyebrow("قرارات التصميم")}<h2>لماذا اتُّخذت هذه القرارات؟</h2><p>القرار الجيد يربط طريقة العرض بهدف المستخدم وطبيعة النشاط، لا بالشكل البصري وحده.</p></div><ol class="case-study-decisions">${study.decisions.map((item, index) => `<li class="reveal"><span>${String(index + 1).padStart(2, "0")}</span><p>${esc(item)}</p></li>`).join("")}</ol></div></section>
<section class="section-pad deliverables-section"><div class="container split-heading"><div class="section-heading reveal">${eyebrow("المخرجات")}<h2>ما الذي يمكن مراجعته اليوم؟</h2><p>هذه المخرجات مرتبطة بما يظهر في النسخة المنشورة، ولذلك يمكن التحقق منها مباشرة عبر رابط المشروع.</p></div><div class="deliverables-panel reveal">${checkList(study.delivered, "deliverables-list")}<p class="case-study-disclaimer">لا تتضمن هذه الدراسة أرقام زيارات أو تحويلات أو عائد استثمار؛ لم تُنشر بيانات موثقة تسمح بإسناد تلك النتائج للمشروع.</p></div></div></section>
<section class="section-pad"><div class="container case-method reveal"><div><span>الخطوة التالية</span><h2>هل تحتاج مشروعًا يناسب سياق نشاطك؟</h2></div><p>يمكن الاستفادة من المنهج، لكن بنية الصفحات والمحتوى والتقنية تُحدد بعد فهم نشاطك ومستخدميك والنتيجة المطلوبة.</p><div class="hero-actions">${button(`${site.whatsapp}?text=${encodeURIComponent(requestMessage)}`, "ناقش مشروعًا مشابهًا", "", true)}${button("/projects/", "العودة إلى جميع الأعمال", "button-ghost")}</div></div></section>`;
  return page({ title: `دراسة حالة ${project.title}`, description: `دراسة حالة مشروع ${project.title}: الهدف، نطاق التنفيذ، قرارات التصميم، والمخرجات القابلة للمراجعة مع رابط النسخة المنشورة.`, path, active: "projects", body, schema: [creativeWorkSchema, breadcrumbSchema([{ name: "الرئيسية", path: "/" }, { name: "الأعمال", path: "/projects/" }, { name: project.title, path }])] });
}

function localSeoPage(citySpecific = false) {
  const path = citySpecific ? "/local-seo/riyadh/" : "/local-seo/";
  const title = citySpecific ? "خدمات السيو المحلي في الرياض وتحسين الظهور على خرائط Google" : "السيو المحلي في السعودية: الموقع وملف Google والمحتوى المحلي";
  const lead = citySpecific
    ? "خطة متكاملة للشركات والأنشطة في الرياض تربط الموقع بملف Google التجاري والصفحات المحلية والاتساق والسمعة والقياس؛ بهدف جذب استفسارات أكثر صلة بدل مطاردة ترتيب مؤقت."
    : "السيو المحلي ليس تعديل ملف Google أو تكرار اسم المدينة؛ بل منظومة تربط أهلية النشاط وموقعه الإلكتروني وبياناته وسمعته ومحتواه وقياس التحويلات ضمن نية بحث محلية واضحة.";
  const faq = localSeoFaq;
  const body = `${innerHero({ eyebrowText: citySpecific ? "سيو محلي لمدينة الرياض" : "الظهور المحلي في السعودية", title, lead, path, crumbs: [{ name: "السيو المحلي", path: "/local-seo/" }, ...(citySpecific ? [{ name: "الرياض", path }] : [])], aside: `<span class="service-hero-icon">${icon("pin")}</span><strong>${citySpecific ? "الرياض سوق واسع ومنافسة تختلف حسب الخدمة والحي ونموذج النشاط." : "الموقع والملف التجاري والمحتوى والسمعة تعمل كمنظومة واحدة."}</strong><p>نبدأ من البيانات الفعلية ونية العميل، ثم نحدد الصفحات والإصلاحات والأولويات القابلة للقياس.</p>` })}
<section class="section-pad"><div class="container service-intro-grid"><div class="rich-copy reveal"><h2>${citySpecific ? "كيف نبني حضورًا محليًا أقوى في الرياض؟" : "ما الذي يجعل السيو المحلي مختلفًا؟"}</h2><p>${citySpecific ? "مدينة الرياض تضم كثافة عالية من الأنشطة ومناطق خدمة واسعة وسلوك بحث متنوع. لا يكفي ذكر أسماء الأحياء أو إنشاء صفحات متشابهة؛ يجب أن تعكس بنية الموقع الخدمات الفعلية، وتجيب عن أسئلة العميل، وتدعم الملف التجاري ببيانات متسقة ومحتوى مفيد." : "عندما يبحث العميل عن خدمة قريبة، يجمع محرك البحث بين معنى الخدمة والموقع والملاءمة والثقة وتجربة الصفحة والبيانات المتاحة عن النشاط. لذلك قد لا ينجح تحسين الملف وحده إذا كان الموقع ضعيفًا أو البيانات متناقضة أو المحتوى لا يجيب عن نية البحث."}</p><p>أبدأ بمراجعة الفهرسة والأداء والصفحات الحالية وملف Google والفئات والخدمات والروابط والمنصات الأخرى. ثم نبني خريطة موضوعات ومناطق ذات قيمة حقيقية، ونربطها بمؤشرات مثل المكالمات والنماذج والاتجاهات وجودة الاستفسارات.</p></div><aside class="service-quick-card reveal"><span>تدقيق البداية</span><h2>المصادر التي نراجعها</h2>${checkList(["الموقع والصفحات المفهرسة", "ملف Google التجاري والفئات والخدمات", "اتساق الاسم والهاتف والموقع", "المنافسون ونتائج البحث المحلية", "المحتوى والمراجعات والروابط", "المكالمات والنماذج وبيانات القياس"])}${button(`${site.whatsapp}?text=${encodeURIComponent(citySpecific ? "مرحبًا م. إسلام، أريد تحسين السيو المحلي لنشاطي في الرياض." : "مرحبًا م. إسلام، أريد تدقيق السيو المحلي لنشاطي.")}`, "اطلب تدقيقًا أوليًا", "", true)}</aside></div></section>
<section class="section-pad muted-section"><div class="container"><div class="section-heading reveal">${eyebrow("محاور العمل")}<h2>من الأساس التقني إلى الظهور والتحويل</h2></div><div class="scope-grid"><article class="scope-card reveal"><span>01</span>${icon("search")}<p>تدقيق الزحف والفهرسة والعناوين والسرعة وتجربة الجوال والروابط الداخلية.</p></article><article class="scope-card reveal"><span>02</span>${icon("pin")}<p>مراجعة أهلية ملف Google والفئات والخدمات ونطاق الخدمة والبيانات.</p></article><article class="scope-card reveal"><span>03</span>${icon("layers")}<p>خريطة صفحات وخدمات وموضوعات محلية تمنع التكرار والتنافس الداخلي.</p></article><article class="scope-card reveal"><span>04</span>${icon("globe")}<p>اتساق الاسم والهاتف والعنوان أو نطاق الخدمة عبر المنصات والمصادر المهمة.</p></article><article class="scope-card reveal"><span>05</span>${icon("quote")}<p>استراتيجية سمعة ومراجعات ومحتوى يجيب عن اعتراضات العميل الحقيقية.</p></article><article class="scope-card reveal"><span>06</span>${icon("chart")}<p>قياس الظهور والنقرات والمكالمات والنماذج وجودة الفرص حسب الخدمة والمنطقة.</p></article></div></div></section>
<section class="section-pad"><div class="container split-heading"><div class="section-heading reveal">${eyebrow("الخطة العملية")}<h2>أولويات تُنفذ على مراحل بدل قائمة إصلاحات بلا ترتيب</h2><p>نرتب العمل حسب أثره واحتمال نجاحه واعتمادياته، ونفصل بين إصلاح مشكلة أساسية وفرصة نمو طويلة المدى.</p></div><div class="deliverables-panel reveal">${checkList(["تقرير تدقيق مع المشكلات والأدلة والأولوية", "خريطة كلمات وموضوعات وخدمات ومناطق", "تحسين صفحات الخدمة والميتا والروابط والبيانات المنظمة", "خطة ملف Google والاتساق والمحتوى والمراجعات", "لوحة مؤشرات للظهور والتحويل وجودة الاستفسارات"] , "deliverables-list")}</div></div></section>
${citySpecific ? `<section class="section-pad muted-section"><div class="container"><div class="section-heading reveal">${eyebrow("خدمة مدينة الرياض")}<h2>تغطية محلية دون حشو أسماء الأحياء</h2><p>يمكن ذكر أحياء ومناطق الرياض عندما تضيف معنى حقيقيًا للتغطية أو الخدمة، مع تجنب إنشاء صفحات متطابقة. من المناطق الشائعة التي قد تدخل ضمن تحليل الطلب: شمال الرياض، وسط الرياض، شرق الرياض، غرب الرياض، جنوب الرياض، وأحياء مثل الملقا والياسمين والنرجس وحطين والعقيق والصحافة وقرطبة والروابي، حسب نطاق النشاط الحقيقي.</p></div><div class="neighborhood-cloud" aria-label="مناطق وأحياء الرياض"><span>شمال الرياض</span><span>الملقا</span><span>الياسمين</span><span>النرجس</span><span>حطين</span><span>العقيق</span><span>الصحافة</span><span>قرطبة</span><span>شرق الرياض</span><span>وسط الرياض</span><span>غرب الرياض</span><span>جنوب الرياض</span></div></div></section>` : `<section class="section-pad muted-section"><div class="container local-paths"><article class="reveal"><span>للأنشطة ذات الموقع</span><h3>متجر أو مكتب يستقبل العملاء</h3><p>نراجع أهلية العنوان والواجهة والساعات والفئات والصفحات المحلية والاتساق والاتجاهات.</p></article><article class="reveal"><span>لأنشطة نطاق الخدمة</span><h3>خدمة تصل إلى العميل</h3><p>نضبط إخفاء العنوان ونطاق الخدمة والمحتوى الذي يوضح التغطية دون إنشاء مواقع وهمية.</p></article><article class="reveal"><span>للشركات متعددة الفروع</span><h3>فروع حقيقية وتجارب محلية</h3><p>بنية صفحات وملفات وصلاحيات ومحتوى واتساق تقلل التكرار وتوضح كل موقع.</p></article></div></section>`}
<section class="section-pad faq-section"><div class="container faq-grid"><div class="faq-intro reveal">${eyebrow("أسئلة السيو المحلي")}<h2>قرارات تمنع التكرار والوعود غير الواقعية</h2><p>الظهور المحلي نتيجة تراكمية تعتمد على السوق وحالة الموقع والملف وسرعة التنفيذ.</p>${button(citySpecific ? "/local-seo/" : "/local-seo/riyadh/", citySpecific ? "دليل السيو المحلي" : "السيو المحلي في الرياض", "button-ghost")}</div>${faqBlock(faq)}</div></section>
${finalCta(citySpecific ? "هل تريد تحسين ظهور نشاطك داخل الرياض؟" : "هل تريد بناء حضور محلي أقوى في السعودية؟", "أرسل رابط الموقع وملف Google والمدينة والخدمات المستهدفة، وسنحدد أين تضيع الفرص وما الأولويات الأكثر تأثيرًا.")}`;
  const schema = [{ "@type": "Service", name: title, serviceType: "Local SEO", provider: { "@id": `${site.url}/#professional-service` }, areaServed: citySpecific ? { "@type": "City", name: "الرياض" } : { "@type": "Country", name: site.country }, description: lead }, faqSchema(faq), breadcrumbSchema([{ name: "الرئيسية", path: "/" }, { name: "السيو المحلي", path: "/local-seo/" }, ...(citySpecific ? [{ name: "الرياض", path }] : [])])];
  return page({ title, description: lead, path, active: "services", body, schema });
}

function blogIndexPage() {
  const topics = [
    ["google-business-profile", "ملفات Google التجارية", "pin"],
    ["local-seo-saudi", "السيو المحلي في السعودية", "search"],
    ["cybersecurity", "الأمن السيبراني", "shield"],
    ["ai-agents", "وكلاء الذكاء الاصطناعي", "spark"],
    ["web-development", "تطوير الويب", "code"]
  ];
  const [featuredPost, ...remainingPosts] = allPosts;
  const itemListSchema = {
    "@type": "ItemList",
    name: "أدلة ومقالات المهندس إسلام الشيخ",
    itemListElement: allPosts.map((post, index) => ({ "@type": "ListItem", position: index + 1, url: absolute(`/blog/${post.slug}/`), name: post.title }))
  };
  const body = `${innerHero({ eyebrowText: "المدونة والمعرفة", title: "أدلة عربية عميقة لبناء حضور رقمي آمن ومرئي وقابل للنمو", lead: "مقالات طويلة ومنظمة تربط الأمن والتطوير والذكاء الاصطناعي وخدمات Google والسيو بالقرارات التي تهم الشركات في السعودية؛ من التشخيص إلى التنفيذ والقياس.", path: "/blog/", crumbs: [{ name: "المدونة", path: "/blog/" }], aside: `<span class="aside-kicker">Practical Insights</span><strong>معرفة عملية وليست نصائح معزولة</strong><p>كل دليل يشرح السياق والمخاطر وخطة التنفيذ ومؤشرات النجاح، ثم يجيب عن الأسئلة التي تسبق قرار الشراء أو التطوير.</p>`, className: "blog-hero" })}
<section class="section-pad blog-latest-section"><div class="container"><div class="section-heading reveal">${eyebrow("الدليل الأحدث")}<h2>ابدأ من موضوع يجمع القرار التجاري بالتنفيذ التقني</h2><p>محتوى عربي فصيح، واضح في وعوده، ومصمم ليساعدك على الانتقال من الفكرة العامة إلى قائمة أولويات قابلة للتطبيق.</p></div><div class="blog-featured-shell">${postCard(featuredPost, { featured: true })}</div></div></section>
<section class="section-pad muted-section"><div class="container"><div class="section-heading reveal">${eyebrow("مكتبة الأدلة")}<h2>موضوعات متخصصة لخدمات الشركات في السعودية</h2><p>استكشف الأدلة حسب المشكلة التي تريد حلها، ثم انتقل إلى الخدمة أو الخطوة العملية المناسبة من داخل المقال.</p></div><div class="posts-grid blog-library-grid">${remainingPosts.map((post) => postCard(post)).join("")}</div></div></section>
<section class="section-pad muted-section"><div class="container"><div class="section-heading reveal">${eyebrow("مسارات المعرفة")}<h2>استكشف المحتوى حسب الموضوع</h2></div><div class="topics-grid">${topics.map(([slug, title, iconName]) => `<a class="topic-card reveal" href="/blog/topics/${slug}/">${icon(iconName)}<strong>${esc(title)}</strong><span>مقالات وخدمات مرتبطة ${icon("arrow")}</span></a>`).join("")}</div></div></section>
${finalCta("لديك سؤال يحتاج تشخيصًا يخص حالتك؟", "المقالات توضح الإطار العام، بينما يعتمد القرار الصحيح على بيانات مشروعك ووضعه الحالي والهدف المطلوب.")}`;
  return page({ title: "مدونة المهندس إسلام الشيخ", description: "أدلة عربية عميقة للشركات في السعودية حول الأمن السيبراني وتصميم المواقع ووكلاء الذكاء الاصطناعي وملفات Google والسيو المحلي والتقني.", path: "/blog/", active: "blog", body, keywords: ["مدونة تقنية عربية", "خبير سيو في السعودية", "تصميم مواقع الرياض", "الأمن السيبراني للشركات", "وكلاء الذكاء الاصطناعي"], schema: [itemListSchema, breadcrumbSchema([{ name: "الرئيسية", path: "/" }, { name: "المدونة", path: "/blog/" }])] });
}

function articlePage(post) {
  const path = `/blog/${post.slug}/`;
  const service = serviceBySlug(post.relatedService);
  const faq = completeFaqs(post);
  const publishedDate = new Intl.DateTimeFormat("ar-SA", { dateStyle: "long" }).format(new Date(`${post.date}T12:00:00Z`));
  const modifiedDate = new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium" }).format(new Date(`${post.modified}T12:00:00Z`));
  const keywords = (post.keywords || []).slice(0, 6);
  const roadmap = service?.steps || [
    { title: "تشخيص الوضع", text: "تحديد المشكلة والهدف والبيانات والقيود قبل اختيار الحل." },
    { title: "تصميم النطاق", text: "تثبيت المخرجات والمسؤوليات ومعايير القبول ومؤشرات النجاح." },
    { title: "تنفيذ واختبار", text: "تطبيق مرحلي مع مراجعة الحالات الأساسية والحساسة على بيانات واقعية." },
    { title: "إطلاق وتحسين", text: "مراقبة النتيجة وتوثيق التغييرات وتحسينها بناءً على الأدلة." }
  ];
  const deliverables = service?.deliverables || ["تشخيص موثق للوضع الحالي", "خطة أولويات قابلة للتنفيذ", "معايير قبول وقياس واضحة", "توصيات للمتابعة والتحسين"];
  const contents = [
    ...post.sections.map(([heading], index) => ({ id: `section-${index + 1}`, title: heading })),
    { id: "implementation-roadmap", title: "منهج التنفيذ الاحترافي" },
    { id: "expected-deliverables", title: "المخرجات ومعايير الجودة" },
    { id: "article-summary", title: "الخلاصة التنفيذية" }
  ];
  const relatedPosts = allPosts
    .filter((item) => item.slug !== post.slug)
    .map((item) => ({ item, score: Number(item.relatedService === post.relatedService) * 3 + Number(item.topic === post.topic) * 2 }))
    .sort((left, right) => right.score - left.score)
    .slice(0, 3)
    .map(({ item }) => item);
  const body = `${innerHero({ eyebrowText: post.category, title: esc(post.title), lead: post.excerpt, path, crumbs: [{ name: "المدونة", path: "/blog/" }, { name: post.category, path }], aside: `<div class="article-meta-card"><span>دليل مهني محدث</span><strong>${esc(post.readTime)}</strong><p>نُشر في ${publishedDate}</p><p>آخر مراجعة: ${modifiedDate}</p></div>`, className: "article-hero" })}
<div class="container article-hero-keywords" aria-label="الكلمات والموضوعات الرئيسية">${keywords.map((keyword) => `<span>${esc(keyword)}</span>`).join("")}</div>
<section class="section-pad article-section"><div class="container article-layout"><article class="article-content reveal"><p class="article-intro">${esc(post.description)}</p>
${post.sections.map(([heading, ...paragraphs], index) => `<section id="section-${index + 1}"><span class="article-number">${String(index + 1).padStart(2, "0")}</span><h2>${esc(heading)}</h2>${paragraphs.map((paragraph) => `<p>${esc(paragraph)}</p>`).join("")}</section>`).join("")}
<section id="implementation-roadmap" class="article-roadmap-section"><span class="article-number">${String(post.sections.length + 1).padStart(2, "0")}</span><h2>خطة تنفيذ ${esc(post.category)} خطوة بخطوة</h2><p>${esc(service?.value || post.description)} توضح الخطوات التالية كيف يتحول موضوع هذا الدليل إلى نطاق عمل يمكن اختباره ومراجعته قبل التوسع.</p><ol class="article-roadmap">${roadmap.map((step, index) => `<li><span>${String(index + 1).padStart(2, "0")}</span><div><h3>${esc(step.title)}</h3><p>${esc(step.text)}</p></div></li>`).join("")}</ol></section>
<section id="expected-deliverables" class="article-deliverables-section"><span class="article-number">${String(post.sections.length + 2).padStart(2, "0")}</span><h2>مخرجات قابلة للمراجعة في ${esc(post.category)}</h2><p>عند تطبيق «${esc(post.title)}»، استخدم مخرجات واضحة توثق ما نُفذ ومن يراجعه وكيف تُقاس النتيجة، بدل الاكتفاء بعبارات عامة لا يمكن قبولها أو تحسينها.</p><ul class="article-deliverables">${deliverables.map((item) => `<li>${icon("check")}<span>${esc(item)}</span></li>`).join("")}</ul>${service?.value ? `<div class="article-value-note"><span>القيمة المستهدفة</span><p>${esc(service.value)}</p></div>` : ""}</section>
<section id="article-summary" class="article-conclusion"><span class="article-number">${String(post.sections.length + 3).padStart(2, "0")}</span><h2>الخلاصة التنفيذية: ${esc(keywords[0] || post.category)}</h2><p>${esc(post.description)} ابدأ بالجزء الذي يزيل أكبر مخاطرة أو يثبت أهم افتراض، ثم وثق خط الأساس والقرار والنتيجة قبل الانتقال إلى المرحلة التالية.</p>${service?.value ? `<p>النتيجة المستهدفة من هذا المسار هي: ${esc(service.value)}</p>` : ""}</section></article>
<aside class="article-sidebar"><section class="article-author-card reveal" aria-labelledby="article-author-name"><div class="article-author-head"><img class="article-author-photo" src="${profilePhoto}" width="128" height="128" alt="المهندس إسلام الشيخ" loading="lazy" decoding="async"><div><span>كتبه وراجعه</span><h2 id="article-author-name">${esc(site.nameAr)}</h2><p>مهندس أمن سيبراني · مطور برمجيات · خبير منتجات Google</p></div></div><dl><div><dt>تاريخ النشر</dt><dd><time datetime="${post.date}">${publishedDate}</time></dd></div><div><dt>آخر تحديث</dt><dd><time datetime="${post.modified}">${modifiedDate}</time></dd></div></dl><div class="article-author-keywords" aria-label="أهم كلمات المقال">${keywords.slice(0, 4).map((keyword) => `<span>${esc(keyword)}</span>`).join("")}</div><a class="text-link" href="/about/">تعرف على الكاتب ${icon("arrow")}</a></section>
<div class="toc-card reveal"><span>محتويات الدليل</span><nav aria-label="محتويات المقال">${contents.map((item, index) => `<a href="#${item.id}"><span>${String(index + 1).padStart(2, "0")}</span>${esc(item.title)}</a>`).join("")}</nav></div>
<div class="related-service-card reveal"><span>الخدمة المرتبطة</span><div>${icon(service?.icon || "briefcase")}<h2>${esc(service?.title || "الخدمات التقنية")}</h2></div><p>${esc(service?.short || site.positioning)}</p>${button(service ? `/services/${service.slug}/` : "/services/", "استكشف نطاق الخدمة", "button-ghost")}</div></aside></div></section>
<section class="section-pad muted-section article-faq-section" id="article-faq"><div class="container article-faq-grid"><div class="article-faq-intro reveal">${eyebrow("الأسئلة الشائعة")}<h2>إجابات مرتبطة مباشرة بموضوع الدليل</h2><p>أسئلة مختارة من أكثر ما يسبق القرار في هذا الموضوع، بإجابات محددة دون تكرار أسئلة عامة بين المقالات.</p><div class="faq-count" aria-label="عدد الأسئلة"><strong>${faq.length}</strong><span>أسئلة وإجابات متخصصة</span></div></div>${faqBlock(faq)}</div></section>
<section class="section-pad related-articles-section"><div class="container"><div class="section-heading reveal">${eyebrow("أدلة مرتبطة")}<h2>واصل بناء الصورة الكاملة</h2><p>موضوعات منتقاة تكمل هذا الدليل من زاوية الخدمة أو الأمان أو الظهور والقياس.</p></div><div class="posts-grid">${relatedPosts.map((item) => postCard(item)).join("")}</div></div></section>
${finalCta("هل تريد تطبيق هذا الإطار على مشروعك؟", "أرسل الحالة الحالية والهدف والبيانات المتاحة، وسنحدد خطوة أولى صغيرة وواضحة وقابلة للقياس.")}`;
  return page({ title: post.seoTitle, description: post.description, path, active: "blog", body, type: "article", published: post.date, modified: post.modified, keywords, articleSection: post.category, schema: [faqSchema(faq), breadcrumbSchema([{ name: "الرئيسية", path: "/" }, { name: "المدونة", path: "/blog/" }, { name: post.title, path }])] });
}

const topicDefinitions = {
  "google-business-profile": { title: "ملفات Google التجارية", description: "مقالات وخدمات حول إنشاء ملفات Google التجارية والتحقق والتعليق والأهلية والبيانات والظهور المحلي.", icon: "pin", services: ["google-business-profile", "google-support", "seo"] },
  "local-seo-saudi": { title: "السيو المحلي في السعودية", description: "أدلة عملية لربط الموقع بملف Google والمحتوى المحلي والاتساق والسمعة والقياس داخل السوق السعودي.", icon: "search", services: ["seo", "google-business-profile", "web-development"] },
  cybersecurity: { title: "الأمن السيبراني", description: "محتوى يشرح تقييم المخاطر وحماية المواقع والأنظمة والصلاحيات والاستجابة والمسؤولية في الاختبارات الأمنية.", icon: "shield", services: ["cybersecurity", "cloud-solutions", "web-development"] },
  "ai-agents": { title: "وكلاء الذكاء الاصطناعي", description: "أطر عملية لبناء وكلاء ومساعدين يعتمدون على بيانات الشركة مع أدوات محدودة وتقييم وأمان ورقابة بشرية.", icon: "spark", services: ["ai-agents", "knowledge-bases", "cloud-solutions"] },
  "web-development": { title: "تطوير المواقع والتطبيقات", description: "مقالات حول التصميم المتجاوب والأداء والأمان والسيو وتجربة المستخدم وبناء مواقع قابلة للتوسع والصيانة.", icon: "code", services: ["web-development", "cybersecurity", "seo"] }
};

function topicPage(slug) {
  const topic = topicDefinitions[slug];
  const matchingPosts = allPosts.filter((post) => post.topic === slug || (slug === "local-seo-saudi" && post.topic === "google-business-profile"));
  const relatedServices = topic.services.map(serviceBySlug).filter(Boolean);
  const path = `/blog/topics/${slug}/`;
  const body = `${innerHero({ eyebrowText: "مسار معرفي", title: esc(topic.title), lead: topic.description, path, crumbs: [{ name: "المدونة", path: "/blog/" }, { name: topic.title, path }], aside: `<span class="service-hero-icon">${icon(topic.icon)}</span><strong>أدلة متخصصة مرتبطة بالتنفيذ</strong><p>روابط مباشرة للمقالات والخدمات التي تساعد على تحويل المعرفة إلى خطة عمل.</p>` })}
<section class="section-pad"><div class="container"><div class="section-heading reveal">${eyebrow("المقالات")}<h2>أدلة مرتبطة بموضوع ${esc(topic.title)}</h2></div>${matchingPosts.length ? `<div class="posts-grid">${matchingPosts.map(postCard).join("")}</div>` : `<div class="empty-state"><h2>يتم تطوير هذا المسار</h2><p>يمكنك البدء بالخدمات المرتبطة أو قراءة بقية المقالات.</p></div>`}</div></section>
<section class="section-pad muted-section"><div class="container"><div class="section-heading reveal">${eyebrow("الخدمات المرتبطة")}<h2>حوّل المعرفة إلى خطة تنفيذ</h2></div><div class="services-grid related-services">${relatedServices.map(serviceCard).join("")}</div></div></section>
${slug === "local-seo-saudi" ? `<section class="section-pad"><div class="container case-method reveal"><div><span>دليل محلي</span><h2>السيو المحلي في الرياض والسعودية</h2></div><p>استكشف منهجًا يربط الموقع بملف Google والصفحات المحلية والمحتوى والاتساق والقياس دون حشو أو صفحات متكررة.</p>${button("/local-seo/", "دليل السيو المحلي")}</div></section>` : ""}
${finalCta("لديك حالة تحتاج تطبيقًا عمليًا؟", "أرسل تفاصيل المشروع والروابط والنتيجة المطلوبة لنحدد النطاق والخطوات المناسبة.")}`;
  return page({ title: topic.title, description: topic.description, path, active: "blog", body, schema: [breadcrumbSchema([{ name: "الرئيسية", path: "/" }, { name: "المدونة", path: "/blog/" }, { name: topic.title, path }])] });
}

function contactPage() {
  const body = `${innerHero({ eyebrowText: "ابدأ التواصل", title: "أرسل تفاصيل تساعد على تشخيص مشروعك من أول رسالة", lead: "كلما كان وصف الهدف والوضع الحالي والروابط والموعد أوضح، كان من الأسهل تحديد نقطة البداية والنطاق والمخرجات دون جولات طويلة من الأسئلة العامة.", path: "/contact/", crumbs: [{ name: "تواصل", path: "/contact/" }], aside: `<span class="aside-kicker">Response Ready</span><strong>ابدأ عبر WhatsApp أو الاتصال أو البريد</strong><p>لا ترسل كلمات مرور أو رموز تحقق أو مفاتيح API أو بيانات حساسة في الرسالة الأولى.</p>` })}
<section class="section-pad"><div class="container contact-grid"><div class="contact-options"><a class="contact-card reveal" href="${site.whatsapp}?text=${encodeURIComponent("مرحبًا م. إسلام، أرغب في مناقشة مشروع تقني.")}" target="_blank" rel="noopener"><span class="contact-icon contact-whatsapp">${icon("whatsapp")}</span><div><small>الأسرع لبدء التشخيص</small><h2>WhatsApp</h2><p dir="ltr">${site.phoneDisplay}</p></div>${icon("external")}</a><a class="contact-card reveal" href="tel:${site.phone}"><span class="contact-icon contact-call">${icon("phone")}</span><div><small>اتصال مباشر</small><h2>الهاتف</h2><p dir="ltr">${site.phoneDisplay}</p></div>${icon("arrow")}</a><a class="contact-card reveal" href="mailto:${site.email}"><span class="contact-icon contact-mail">${icon("mail")}</span><div><small>للتفاصيل والمرفقات</small><h2>البريد الإلكتروني</h2><p dir="ltr">${site.email}</p></div>${icon("arrow")}</a><div class="contact-note reveal"><span>${icon("shield")}</span><div><h2>حماية معلوماتك</h2><p>أرسل وصفًا عامًا وروابط عامة في البداية. تُحدد قناة آمنة عند الحاجة إلى معلومات حساسة أو وصول تقني.</p></div></div></div>
<div class="project-form reveal" data-project-form role="form" aria-labelledby="project-form-title"><div class="form-head"><span>نموذج تجهيز رسالة المشروع</span><h2 id="project-form-title">كوّن رسالة WhatsApp منظمة</h2><p>لن تُرسل البيانات إلى خادم؛ يُفتح WhatsApp برسالة جاهزة بعد مراجعتك. إذا كان JavaScript متوقفًا، استخدم رابط WhatsApp المباشر أعلاه.</p></div><label><span>الاسم أو اسم الشركة</span><input type="text" name="name" autocomplete="name" maxlength="80" required placeholder="مثال: شركة ..."></label><label><span>الخدمة الأقرب</span><select name="service" required><option value="">اختر الخدمة</option>${services.map((service) => `<option value="${esc(service.title)}">${esc(service.title)}</option>`).join("")}<option value="استشارة متعددة التخصصات">استشارة متعددة التخصصات</option></select></label><label><span>رابط الموقع أو الملف — اختياري</span><input type="url" name="url" inputmode="url" autocomplete="url" maxlength="300" placeholder="https://"></label><label><span>الهدف والوضع الحالي</span><textarea name="details" rows="6" maxlength="1500" required placeholder="اشرح المشكلة، ما الذي تريد تحقيقه، وما الذي جربته حتى الآن..."></textarea><small><span data-character-count>0</span> / 1500</small></label><label><span>الموعد المتوقع — اختياري</span><input type="text" name="timeline" maxlength="120" placeholder="مثال: خلال شهر أو قبل إطلاق محدد"></label><div class="form-message" role="status" aria-live="polite" data-form-message></div><button class="button" type="button" data-project-submit>فتح الرسالة في WhatsApp ${icon("whatsapp", "button-icon")}</button></div></div></section>
<section class="section-pad muted-section"><div class="container"><div class="section-heading reveal">${eyebrow("ماذا ترسل؟")}<h2>أربع نقاط تختصر وقت التشخيص</h2></div><div class="audience-grid"><article class="audience-card reveal"><span>01</span><h3>الهدف</h3><p>ما النتيجة التي تريد الوصول إليها، ولماذا هي مهمة الآن؟</p></article><article class="audience-card reveal"><span>02</span><h3>الوضع الحالي</h3><p>الروابط والأنظمة والمشكلة والتأثير وما الذي يعمل وما الذي لا يعمل.</p></article><article class="audience-card reveal"><span>03</span><h3>المحاولات السابقة</h3><p>التعديلات أو الأدوات أو طلبات الدعم التي تمت ونتيجتها.</p></article><article class="audience-card reveal"><span>04</span><h3>القيود</h3><p>الموعد والميزانية التقريبية والفريق والاعتماديات أو الموافقات.</p></article></div></div></section>`;
  return page({ title: "تواصل مع المهندس إسلام الشيخ", description: "تواصل مع المهندس إسلام الشيخ لمناقشة الأمن السيبراني وتطوير المواقع ووكلاء الذكاء الاصطناعي وخدمات Google والسيو والحلول السحابية في السعودية.", path: "/contact/", body, schema: [breadcrumbSchema([{ name: "الرئيسية", path: "/" }, { name: "تواصل", path: "/contact/" }])] });
}

function privacyPage() {
  const body = `${innerHero({ eyebrowText: "الخصوصية", title: "سياسة الخصوصية", lead: "توضح هذه الصفحة نوع البيانات التي قد تُعالج عند استخدام الموقع أو التواصل، وكيف يتم التعامل معها بصورة مسؤولة.", path: "/privacy/", crumbs: [{ name: "سياسة الخصوصية", path: "/privacy/" }] })}
<section class="section-pad legal-section"><div class="container legal-content"><section><h2>1. المسؤول عن معالجة البيانات والغرض</h2><p>يدير المهندس إسلام الشيخ هذا الموقع للتعريف بالخدمات، استقبال طلبات التواصل، حماية الخدمة، وفهم أداء الصفحات بعد موافقة الزائر على التحليلات. يمكن التواصل بخصوص الخصوصية عبر <a href="mailto:${site.email}">${site.email}</a>.</p></section><section><h2>2. البيانات التي تقدمها عند التواصل</h2><p>لا يطلب الموقع إنشاء حساب. قد تقدم اسمك أو اسم منشأتك أو بريدك أو رقمك أو رابطًا عامًا أو تفاصيل مشروعك عند التواصل عبر الهاتف أو البريد أو WhatsApp. تُستخدم هذه المعلومات للرد على طلبك، تشخيص الاحتياج، وإدارة العلاقة أو المشروع عند الاتفاق. لا ترسل كلمات مرور أو رموز تحقق أو مفاتيح API أو بيانات حساسة في الرسالة الأولى.</p></section><section><h2>3. نموذج تجهيز رسالة WhatsApp</h2><p>النموذج الموجود في صفحة التواصل يعمل داخل متصفحك لتجهيز نص الرسالة، ثم يفتح WhatsApp لمراجعتها قبل الإرسال. النموذج ليس نموذج إرسال إلى خادم الموقع، ولا يستخدم طلب GET أو POST. إذا تعطل JavaScript فلن تُرسل الحقول تلقائيًا، ويمكنك استخدام رابط WhatsApp المباشر.</p></section><section><h2>4. السجلات التقنية والاستضافة</h2><p>قد تعالج منصة الاستضافة Vercel معلومات تقنية لازمة لتقديم الموقع وحمايته، مثل عنوان IP ونوع المتصفح والمسار ووقت الطلب وسجلات الأمان. يكون الغرض تشغيل الموقع، منع إساءة الاستخدام، تشخيص الأعطال، والمحافظة على أمن الخدمة.</p></section><section><h2>5. التحليلات وملفات الارتباط</h2><p>يستخدم الموقع Google Analytics 4 بالمعرّف G-MDJ2HGF9E1 فقط بعد اختيار «السماح بالتحليلات». قد تضع Google عندها ملفات ارتباط أو معرّفات تقنية لقياس الصفحات والأجهزة والأحداث بصورة إجمالية. يمكنك رفض التحليلات من الإشعار دون أن تتأثر وظائف الموقع الأساسية، كما يمكنك سحب الموافقة وإظهار خياراتها مجددًا من الزر التالي.</p><button class="button button-ghost privacy-preferences" type="button" data-analytics-preferences>تغيير تفضيلات التحليلات</button><p>يستخدم الموقع التخزين المحلي أيضًا لحفظ اختيار الوضع الفاتح أو الداكن وقرار الموافقة؛ وهما إعدادان وظيفيان على جهازك وليسا نموذجًا لتعريف حساب شخصي.</p></section><section><h2>6. الجهات الخارجية ونقل البيانات</h2><p>قد تنتقل بيانات إلى مزودي الخدمة بحسب اختيارك واستخدامك: Vercel للاستضافة، Google Analytics عند الموافقة، Google Maps عند تحميل الخريطة، وWhatsApp أو البريد عند بدء التواصل. قد تعالج هذه الجهات بيانات خارج المملكة وفق بنيتها وسياساتها وضوابطها الخاصة؛ لذا راجع سياسة الجهة قبل استخدام خدمتها.</p></section><section><h2>7. الأساس والغرض وحدود الاستخدام</h2><p>تُعالج مراسلاتك لاتخاذ خطوات بناءً على طلبك والرد على استفسارك وتنفيذ أي اتفاق لاحق، بينما تعتمد التحليلات الاختيارية على موافقتك. لا تُباع بيانات الزوار، ولا تُستخدم تفاصيل المشروع لإرسال تسويق غير مطلوب.</p></section><section><h2>8. الاحتفاظ والأمان</h2><p>تُحفظ مراسلات المشروع بالقدر اللازم للرد والتنفيذ والتوثيق أو الوفاء بمتطلب نظامي، ثم تُحذف أو تُخفى هويتها عندما لا تبقى حاجة مشروعة لها. تخضع بيانات التحليلات لمدد الاحتفاظ المضبوطة في Google Analytics. تُطبق ضوابط تقنية وتنظيمية معقولة، مع الإقرار بأنه لا توجد وسيلة إلكترونية تضمن أمانًا مطلقًا.</p></section><section><h2>9. حقوق صاحب البيانات</h2><p>وفق الأنظمة السارية، يمكنك طلب العلم بكيفية استخدام بياناتك، الوصول إليها أو الحصول عليها بصيغة مقروءة، تصحيحها أو تحديثها، وطلب إتلافها عندما ينطبق ذلك، كما يمكنك سحب موافقتك على التحليلات في أي وقت. أرسل الطلب إلى <a href="mailto:${site.email}">${site.email}</a> مع معلومات كافية للتحقق من صلته بالمراسلة دون إرسال بيانات إضافية غير لازمة.</p></section><section><h2>10. التحديثات</h2><p>قد تُحدّث هذه السياسة عند تغيير أدوات الموقع أو أغراض المعالجة. سيظهر تاريخ المراجعة في هذه الصفحة، وتُطلب موافقة جديدة إذا أصبح التغيير مؤثرًا على التحليلات الاختيارية.</p></section><p class="legal-updated">آخر تحديث: 2 سبتمبر 2026</p></div></section>`;
  return page({ title: "سياسة الخصوصية", description: "سياسة خصوصية موقع المهندس إسلام الشيخ وتوضيح البيانات المستخدمة عند تصفح الموقع أو التواصل بخصوص الخدمات التقنية.", path: "/privacy/", body, schema: [breadcrumbSchema([{ name: "الرئيسية", path: "/" }, { name: "سياسة الخصوصية", path: "/privacy/" }])] });
}

function termsPage() {
  const body = `${innerHero({ eyebrowText: "الشروط", title: "شروط الاستخدام", lead: "باستخدام الموقع، تقر بأن المحتوى عام وإرشادي، وأن نطاق أي خدمة تجارية أو تقنية يُحدد باتفاق مستقل وواضح.", path: "/terms/", crumbs: [{ name: "شروط الاستخدام", path: "/terms/" }] })}
<section class="section-pad legal-section"><div class="container legal-content"><section><h2>1. طبيعة المحتوى</h2><p>المعلومات المنشورة للتعريف بالخدمات وتقديم معرفة عامة، ولا تشكل وحدها عقدًا أو ضمانًا أو استشارة قانونية أو قرارًا فنيًا نهائيًا لحالة لم تتم مراجعتها.</p></section><section><h2>2. نطاق الخدمات</h2><p>يُحدد نطاق كل مشروع ومخرجاته وجدوله واعتمادياته ومسؤوليات الأطراف في عرض أو اتفاق مستقل. أي أمثلة أو قوائم داخل الموقع توضح إمكانات عامة ولا تعني شمولها تلقائيًا في كل مشروع.</p></section><section><h2>3. خدمات الجهات الخارجية</h2><p>لا يمكن ضمان قرارات Google أو منصات الإعلان أو الاستضافة أو محركات البحث أو مزودي الخدمات الخارجيين. يتم العمل وفق المصادر والمسارات المتاحة، بينما يبقى القرار النهائي لدى الجهة المختصة.</p></section><section><h2>4. الأمن والاستخدام المصرح</h2><p>لا يتم تنفيذ فحص أمني نشط دون تصريح ونطاق مكتوبين. يحظر استخدام محتوى الموقع أو وسائل التواصل لطلب نشاط غير مصرح أو ضار أو مخالف للأنظمة.</p></section><section><h2>5. الملكية الفكرية</h2><p>يعود محتوى الموقع وتصميمه وهوية المهندس إسلام الشيخ لأصحابها، ما لم يُذكر خلاف ذلك. لا يجوز نسخ المحتوى أو إعادة نشره تجاريًا بصورة كاملة دون إذن، ويُسمح بالاقتباس المحدود مع الإشارة إلى المصدر.</p></section><section><h2>6. التعديلات والتواصل</h2><p>قد تُحدّث الشروط لتواكب التغييرات في الموقع والخدمات. للاستفسار تواصل عبر <a href="mailto:${site.email}">${site.email}</a>.</p></section><p class="legal-updated">آخر تحديث: 29 يوليو 2026</p></div></section>`;
  return page({ title: "شروط الاستخدام", description: "شروط استخدام موقع المهندس إسلام الشيخ وحدود المحتوى والخدمات التقنية والاستشارية والأمنية وخدمات الجهات الخارجية.", path: "/terms/", body, schema: [breadcrumbSchema([{ name: "الرئيسية", path: "/" }, { name: "شروط الاستخدام", path: "/terms/" }])] });
}

function englishPage() {
  const body = `<section class="hero section-pad hero-en"><div class="container hero-grid"><div class="hero-copy reveal"><span class="eyebrow"><span></span>Cybersecurity Engineer · Software Developer · Google Product Expert</span><h1>I build digital systems that are <span>secure, useful, and ready to grow.</span></h1><p class="hero-lead">I am Eslam Elshikh, based in Riyadh. I combine cybersecurity, web and software engineering, practical AI agents, Google product expertise, cloud architecture, and search visibility into clear project scopes with reviewable outcomes.</p><p class="hero-support">From diagnosis and information architecture to implementation, testing, launch, and measurement, the goal is to reduce complexity and help your team make better technical decisions.</p><div class="hero-actions">${button(`${site.whatsapp}?text=${encodeURIComponent("Hello Eng. Eslam, I would like to discuss a digital project.")}`, "Start a conversation", "", true)}${button("/services/", "Explore services", "button-ghost")}</div><div class="hero-trust"><a href="${site.social.googleDeveloper}" target="_blank" rel="noopener"><span class="trust-dot trust-google"></span>Google Developer Profile</a><a href="${site.social.github}" target="_blank" rel="noopener"><span class="trust-dot"></span>GitHub</a><span><span class="trust-dot trust-live"></span>Saudi Arabia & remote</span></div></div><div class="hero-visual reveal"><div class="visual-glow"></div><div class="visual-shell"><div class="visual-top"><span>Digital Engineering</span><span class="visual-status"><i></i> Operational</span></div><div class="visual-core">${logo("hero-logo", "Eslam Elshikh logo")}<div><strong>${site.nameEn}</strong><span>SECURE · BUILD · GROW</span></div></div><div class="visual-capabilities"><span>${icon("shield")}Cybersecurity</span><span>${icon("code")}Web & Apps</span><span>${icon("spark")}AI Agents</span><span>${icon("google")}Google</span><span>${icon("chart")}SEO</span><span>${icon("cloud")}Cloud</span></div><div class="visual-metric"><span>Approach</span><strong>360°</strong><p>Security, user experience, discoverability, and measurement in one system.</p></div></div></div></div><div class="container stats-bar reveal">${site.stats.map((stat, index) => `<div><strong>${esc(stat.value)}</strong><span>${["Google Business Profiles supported through verification", "Business profile issues resolved", "Public Google Maps examples", "Live web projects in the portfolio"][index]}</span></div>`).join("")}</div></section>
<section class="section-pad" id="services"><div class="container"><div class="section-heading reveal"><span class="eyebrow"><span></span>Core capabilities</span><h2>Specialist work that can operate independently or as one delivery plan</h2><p>Each engagement starts with the business outcome, current state, constraints, risks, and a measurable definition of done.</p></div><div class="services-grid">${services.map((service) => { const translation = serviceTranslations[service.slug]; return `<article class="service-card reveal"><div class="service-card-top"><span class="service-number">${service.number}</span><span class="service-icon">${icon(service.icon)}</span></div><p class="service-group">${esc(translation.group)}</p><h3><a href="/services/${service.slug}/">${esc(translation.title)}</a></h3><p>${esc(translation.short)}</p><a class="text-link" href="/services/${service.slug}/" aria-label="View details for ${esc(translation.title)}">View service details ${icon("arrow")}</a></article>`; }).join("")}</div></div></section>
<section class="section-pad muted-section"><div class="container promise-grid"><div class="promise-copy reveal"><span class="eyebrow"><span></span>How I work</span><h2>A strong digital project is more than a polished interface</h2><p>It should be understandable, secure in operation, responsive on real devices, discoverable by search engines, measurable, and maintainable after launch.</p></div><div class="principles-grid"><article class="principle reveal"><span>01</span>${icon("target")}<h3>Outcome first</h3><p>We define the user decision and business result before selecting tools.</p></article><article class="principle reveal"><span>02</span>${icon("shield")}<h3>Secure by design</h3><p>Data, permissions, and failure modes are considered from the start.</p></article><article class="principle reveal"><span>03</span>${icon("user")}<h3>Built for devices</h3><p>Mobile-first testing across iOS, Android, Huawei, tablets, and desktops.</p></article><article class="principle reveal"><span>04</span>${icon("chart")}<h3>Ready to improve</h3><p>Performance, SEO, analytics, and conversion are part of operations.</p></article></div></div></section>
<section class="section-pad"><div class="container proof-panel reveal"><div class="proof-icon">${icon("google")}</div><div><span>Google product expertise</span><h2>Structured diagnosis instead of random profile changes</h2><p>I help eligible businesses understand verification, suspension, ownership, category, consistency, and local visibility issues using official paths and realistic expectations.</p></div><div class="proof-actions">${button("/google-expert/", "Google expertise")}${button(site.social.googleDeveloper, "Official profile", "button-ghost", true)}</div></div></section>
<section class="section-pad final-cta"><div class="container"><div class="cta-panel reveal"><div><span class="eyebrow"><span></span>Start with context</span><h2>Turn a complex technical problem into a clear delivery plan.</h2><p>Share your goal, current state, relevant links, constraints, and expected timing. Do not include passwords, verification codes, or API keys.</p></div><div class="cta-actions">${button(`${site.whatsapp}?text=${encodeURIComponent("Hello Eng. Eslam, I would like to discuss a digital project.")}`, "Start on WhatsApp", "button-light", true)}<a class="cta-phone" href="mailto:${site.email}">${site.email}</a></div></div></div></section>`;
  return page({ title: `Eng. ${site.nameEn}`, description: "Eng. Eslam Elshikh is a cybersecurity engineer, software developer, Google Product Expert, AI agent builder, web developer, and SEO consultant based in Riyadh, Saudi Arabia.", path: "/en/", active: "home", body, lang: "en", modified: site.lastUpdated });
}

function notFoundPage() {
  return `${head({ title: "الصفحة غير موجودة", description: "تعذر العثور على الصفحة المطلوبة في موقع المهندس إسلام الشيخ.", path: "/404.html", robots: "noindex, follow" })}<body>${header()}<main id="main"><section class="not-found"><div class="container"><span>404</span><h1>الصفحة غير موجودة</h1><p>ربما تغير الرابط أو تمت كتابة العنوان بصورة غير صحيحة. ابدأ من الصفحة الرئيسية أو استعرض الخدمات.</p><div class="hero-actions">${button("/", "العودة للرئيسية")}${button("/services/", "استعراض الخدمات", "button-ghost")}</div></div></section></main>${footer()}</body></html>`;
}

async function writeText(relativePath, content) {
  const target = join(outDir, relativePath);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, content, "utf8");
}

async function writeRoute(path, html, options = {}) {
  await writeText(routeFile(path), html);
  if (options.index !== false && path !== "/404.html") generatedRoutes.push(path);
}

function sitemapXml() {
  const urls = generatedRoutes.map((path) => {
    const articleSlug = path.match(/^\/blog\/([^/]+)\/$/)?.[1];
    const lastmod = articleSlug ? postBySlug(articleSlug)?.modified || site.lastUpdated : site.lastUpdated;
    const alternates = path === "/" || path === "/en/"
      ? `<xhtml:link rel="alternate" hreflang="ar-SA" href="${site.url}/" /><xhtml:link rel="alternate" hreflang="en" href="${site.url}/en/" /><xhtml:link rel="alternate" hreflang="x-default" href="${site.url}/" />`
      : "";
    return `  <url><loc>${absolute(path)}</loc><lastmod>${lastmod}</lastmod>${alternates}</url>`;
  }).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`;
}

function feedXml() {
  const items = allPosts.map((post) => `<item><title>${esc(post.title)}</title><link>${absolute(`/blog/${post.slug}/`)}</link><guid>${absolute(`/blog/${post.slug}/`)}</guid><pubDate>${new Date(`${post.date}T12:00:00Z`).toUTCString()}</pubDate><description>${esc(post.description)}</description></item>`).join("");
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>مدونة ${esc(site.brandName)}</title><link>${site.url}/blog/</link><description>${esc(site.description)}</description><language>ar-SA</language><lastBuildDate>${new Date(`${site.lastUpdated}T12:00:00Z`).toUTCString()}</lastBuildDate>${items}</channel></rss>`;
}

async function build() {
  if (isDistBuild) {
    await rm(outDir, { recursive: true, force: true });
    await mkdir(outDir, { recursive: true });
    await cp(join(root, "assets"), join(outDir, "assets"), { recursive: true });
    const mainCssPath = join(outDir, "assets", "css", "main.css");
    const enhancementsCssPath = join(outDir, "assets", "css", "enhancements.css");
    const [mainCss, enhancementsCss] = await Promise.all([
      readFile(mainCssPath, "utf8"),
      readFile(enhancementsCssPath, "utf8")
    ]);
    await writeFile(mainCssPath, `${mainCss.trimEnd()}\n\n/* Production enhancements */\n${enhancementsCss.trim()}\n`, "utf8");
    await rm(enhancementsCssPath);
  }

  await writeRoute("/", homePage());
  await writeRoute("/en/", englishPage());
  await writeRoute("/services/", servicesIndexPage());
  for (const service of services) await writeRoute(`/services/${service.slug}/`, serviceDetailPage(service));
  await writeRoute("/local-seo/", localSeoPage(false));
  await writeRoute("/local-seo/riyadh/", localSeoPage(true));
  await writeRoute("/about/", aboutPage());
  await writeRoute("/google-expert/", googleExpertPage());
  await writeRoute("/google-ads/", googleAdsPage());
  await writeRoute("/projects/", projectsPage());
  for (const project of projects.filter((item) => item.slug && item.caseStudy)) {
    await writeRoute(`/projects/${project.slug}/`, projectCaseStudyPage(project));
  }
  await writeRoute("/google-maps-projects/", googleMapsProjectsPage());
  await writeRoute("/blog/", blogIndexPage());
  for (const post of allPosts) await writeRoute(`/blog/${post.slug}/`, articlePage(post));
  for (const slug of Object.keys(topicDefinitions)) await writeRoute(`/blog/topics/${slug}/`, topicPage(slug));
  await writeRoute("/contact/", contactPage());
  await writeRoute("/privacy/", privacyPage());
  await writeRoute("/terms/", termsPage());
  await writeText("404.html", notFoundPage());

  await writeText("sitemap.xml", sitemapXml());
  await writeText("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`);
  await writeText("manifest.webmanifest", JSON.stringify({ name: site.brandName, short_name: site.nameAr, description: site.description, lang: "ar", dir: "rtl", start_url: "/", scope: "/", display: "standalone", background_color: "#06131f", theme_color: "#06131f", icons: [{ src: "/assets/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }, { src: "/assets/brand/eslam-elshikh-logo-transparent.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }] }, null, 2));
  await writeText("feed.xml", feedXml());
  await writeText("profile.json", JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${site.url}/#person`,
    name: site.nameAr,
    honorificPrefix: "المهندس",
    alternateName: site.alternateNames,
    givenName: "إسلام",
    familyName: "الشيخ",
    url: `${site.url}/`,
    image: absolute(profilePhoto),
    telephone: site.phone,
    jobTitle: ["مهندس أمن سيبراني", "مطور برمجيات", "خبير منتجات Google"],
    sameAs: Object.values(site.social),
    knowsAbout: [...services.map((service) => service.title), "خرائط Google", "Google Business Profile", "Google Search", "Google Search Console", "السيو المحلي", "إعلانات Google", "إدارة حملات Google Ads"]
  }, null, 2));
  await writeText("llms.txt", `# ${site.brandName}\n\n${site.description}\n\n## Core services\n${services.map((service) => `- ${service.title}: ${absolute(`/services/${service.slug}/`)}`).join("\n")}\n\n## Key pages\n- About: ${absolute("/about/")}\n- Google expertise: ${absolute("/google-expert/")}\n- Google Maps work: ${absolute("/google-maps-projects/")}\n- Google Ads management: ${absolute("/google-ads/")}\n- Local SEO: ${absolute("/local-seo/")}\n- Work: ${absolute("/projects/")}\n- Contact: ${absolute("/contact/")}\n`);
  if (isDistBuild) await cp(join(root, "llms-full.txt"), join(outDir, "llms-full.txt"));
  await writeText("humans.txt", `Site: ${site.brandName}\nCanonical identity: ${site.nameAr} | ${site.nameEn}\nEnglish alternate: Islam Elshikh\nOfficial website: ${site.url}/\nLocation: ${site.city}, ${site.country}\nDesign and development: ${site.nameEn}\nUpdated: ${site.lastUpdated}\n`);
  await writeText("CNAME", "www.eslam-elshikh.com\n");
  await writeText(join(".well-known", "security.txt"), `Contact: mailto:${site.email}\nCanonical: ${site.url}/.well-known/security.txt\nPreferred-Languages: ar, en\nExpires: 2027-07-29T00:00:00.000Z\nPolicy: ${site.url}/terms/\n`);
  console.log(`Built ${generatedRoutes.length} indexed routes in ${outDir}`);
}

build().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
