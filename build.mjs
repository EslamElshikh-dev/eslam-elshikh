import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { site, services, projects, mapsProjects, posts, homeFaq, localSeoFaq } from "./src/content.mjs";
import { projectAudit, webProjects } from "./src/web-projects.mjs";
import { guides } from "./src/guides.mjs";
import { serviceTranslations, enrichPost, guideToPost, completeFaqs } from "./src/editorial.mjs";
import { renderAbout } from "./src/about.mjs";
import {
  englishArticles,
  englishProjectStudies,
  englishSectorNames,
  englishServices,
  englishTopics
} from "./src/english.mjs";

const root = dirname(fileURLToPath(import.meta.url));
const outFlag = process.argv.find((arg) => arg.startsWith("--out="));
const outDir = outFlag ? resolve(root, outFlag.slice(6)) : root;
const isDistBuild = outDir !== root;
const generatedRoutes = [];
const version = JSON.parse(await readFile(join(root, "package.json"), "utf8")).version;
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
const englishServiceBySlug = (slug) => englishServices.find((service) => service.slug === slug);
const englishArticleBySlug = (slug) => englishArticles.find((post) => post.slug === slug);
const routePair = (path = "/") => {
  if (path === "/" || path === "/en/") return { ar: "/", en: "/en/" };
  if (path.startsWith("/en/")) return { ar: path.slice(3) || "/", en: path };
  return { ar: path, en: `/en${path}` };
};

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
  const priority = className === "hero-logo" ? ' loading="eager" fetchpriority="high"' : "";
  const source = /(?:hero|profile)-logo/.test(className) ? profilePhoto : site.logo;
  return `<img class="${className}" src="${source}" width="${size}" height="${size}" alt="${esc(alt)}" decoding="async"${priority}>`;
};

const socialLinks = [
  ["GitHub", site.social.github, "GH"],
  ["X", site.social.x, "X"],
  ["Instagram", site.social.instagram, "IG"],
  ["YouTube", site.social.youtube, "YT"]
];

// Person profiles only: a blog and a business listing describe separate entities.
// The Facebook handle differs between public sources, so exclude it until verified.
const personSameAs = [...new Set([
  site.social.github, site.social.x, site.social.instagram, site.social.threads,
  site.social.youtube, site.social.tiktok, site.social.wikidata, site.social.googleDeveloper
])];
const personIdentifier = {
  "@type": "PropertyValue",
  propertyID: "Wikidata",
  value: "Q138800449",
  url: site.social.wikidata
};

const baseGraph = (language = "ar") => {
  const isEnglish = language === "en";
  return ([
  {
    "@type": "Person",
    "@id": `${site.url}/#person`,
    name: isEnglish ? site.nameEn : site.nameAr,
    honorificPrefix: isEnglish ? "Eng." : "المهندس",
    alternateName: site.alternateNames,
    givenName: isEnglish ? "Eslam" : "إسلام",
    familyName: isEnglish ? "Elshikh" : "الشيخ",
    url: `${site.url}/`,
    mainEntityOfPage: { "@id": `${site.url}${isEnglish ? "/en/about/" : "/about/"}#profile` },
    image: absolute(profilePhoto),
    description: isEnglish
      ? "Eslam Elshikh is a cybersecurity engineer, software developer, and Google Maps specialist in Riyadh, building secure digital products and measurable search experiences."
      : site.description,
    jobTitle: isEnglish
      ? ["Cybersecurity Engineer", "Software Developer", "Google Maps Specialist"]
      : ["مهندس أمن سيبراني", "مطور برمجيات", "متخصص خرائط Google"],
    email: `mailto:${site.email}`,
    telephone: site.phone,
    workLocation: { "@type": "Place", name: isEnglish ? "Riyadh" : site.city, address: { "@type": "PostalAddress", addressLocality: isEnglish ? "Riyadh" : site.city, addressRegion: isEnglish ? "Riyadh Province" : site.region, addressCountry: site.countryCode } },
    areaServed: { "@type": "Country", name: isEnglish ? "Saudi Arabia" : site.country },
    alumniOf: [
      { "@type": "CollegeOrUniversity", name: isEnglish ? "October 6 University" : "جامعة 6 أكتوبر", alternateName: isEnglish ? "جامعة 6 أكتوبر" : "October 6 University" },
      { "@type": "CollegeOrUniversity", name: isEnglish ? "Arab Open University" : "الجامعة العربية المفتوحة", alternateName: isEnglish ? "الجامعة العربية المفتوحة" : "Arab Open University" }
    ],
    hasCredential: [
      { "@type": "EducationalOccupationalCredential", name: isEnglish ? "Bachelor's degree in Information Security" : "بكالوريوس أمن المعلومات", credentialCategory: "Bachelor degree", recognizedBy: { "@type": "CollegeOrUniversity", name: isEnglish ? "October 6 University" : "جامعة 6 أكتوبر" } },
      { "@type": "EducationalOccupationalCredential", name: isEnglish ? "Diploma in Cybersecurity" : "دبلوم الأمن السيبراني", credentialCategory: "Diploma", recognizedBy: { "@type": "CollegeOrUniversity", name: isEnglish ? "Arab Open University" : "الجامعة العربية المفتوحة" } }
    ],
    knowsAbout: isEnglish
      ? [...englishServices.map((service) => service.title), "Google Maps", "Google Business Profile", "Google Search", "Google Search Console", "Local SEO", "Google Ads"]
      : [...services.map((service) => service.title), "خرائط Google", "Google Business Profile", "Google Search", "Google Search Console", "السيو المحلي", "إعلانات Google", "إدارة حملات Google Ads"],
    identifier: personIdentifier,
    knowsLanguage: ["ar", "en"],
    sameAs: personSameAs
  },
  {
    "@type": "WebSite",
    "@id": `${site.url}/#website`,
    url: `${site.url}/`,
    name: isEnglish ? site.nameEn : site.brandName,
    alternateName: site.siteAlternateNames,
    inLanguage: ["ar-SA", "en"],
    creator: { "@id": `${site.url}/#person` },
    publisher: { "@id": `${site.url}/#person` }
  },
  {
    "@type": "ProfessionalService",
    "@id": `${site.url}/#professional-service`,
    name: isEnglish ? site.nameEn : site.brandName,
    alternateName: isEnglish ? site.brandName : site.nameEn,
    url: `${site.url}/`,
    description: isEnglish
      ? "Independent digital engineering services in Riyadh spanning cybersecurity, software development, Google Business Profile, technical SEO, and digital growth."
      : site.description,
    logo: absolute(site.logo),
    image: absolute(site.shareImage),
    hasMap: site.googleMapsProfile,
    sameAs: [site.googleMapsProfile],
    email: site.email,
    telephone: site.phone,
    founder: { "@id": `${site.url}/#person` },
    address: { "@type": "PostalAddress", streetAddress: site.streetAddress, postalCode: site.postalCode, addressLocality: isEnglish ? "Riyadh" : site.city, addressRegion: isEnglish ? "Riyadh Province" : site.region, addressCountry: site.countryCode },
    areaServed: [{ "@type": "City", name: isEnglish ? "Riyadh" : site.city }, { "@type": "Country", name: isEnglish ? "Saudi Arabia" : site.country }],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      telephone: site.phone,
      availableLanguage: ["ar", "en"],
      hoursAvailable: [{
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "00:00",
        closes: "23:59"
      }]
    },
    availableLanguage: ["ar", "en"]
  }
  ]);
};

const breadcrumbSchema = (items) => ({
  "@type": "BreadcrumbList",
  "@id": `${absolute(items.at(-1)?.path || "/")}#breadcrumb`,
  itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: absolute(item.path) }))
});

const faqSchema = (faq) => ({
  "@type": "FAQPage",
  mainEntity: faq.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } }))
});

function head({ title, description, path = "/", lang = "ar", schema = [], image = site.shareImage, type = "website", published, modified, keywords = [], articleSection = "", stylesheets = [], preloadImage = "", robots = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" }) {
  const isEnglish = lang === "en";
  const canonical = absolute(path);
  const alternates = path === "/404.html" ? null : routePair(path);
  const titleBrand = isEnglish ? site.nameEn : site.brandName;
  const titleHasBrand = title.includes(site.nameAr) || title.includes(site.nameEn) || title.includes(site.brandName);
  const brandedTitle = `${title} | ${titleBrand}`;
  const fullTitle = title === titleBrand || titleHasBrand || brandedTitle.length > 65 ? title : brandedTitle;
  const suppliedProfilePage = schema.find((item) => item?.["@type"] === "ProfilePage");
  const breadcrumb = schema.find((item) => item?.["@type"] === "BreadcrumbList");
  const pageNode = {
      "@type": suppliedProfilePage ? "ProfilePage" : type === "article" ? "BlogPosting" : "WebPage",
      "@id": suppliedProfilePage?.["@id"] || `${canonical}#${type === "article" ? "article" : "webpage"}`,
      url: canonical,
      name: fullTitle,
      description,
      inLanguage: isEnglish ? "en" : "ar-SA",
      isPartOf: { "@id": `${site.url}/#website` },
      about: { "@id": `${site.url}/#person` },
      ...(breadcrumb ? { breadcrumb: { "@id": breadcrumb["@id"] } } : {}),
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
      } : {}),
      ...(suppliedProfilePage || {})
    };
  const graph = [
    ...baseGraph(lang),
    pageNode,
    ...schema.filter((item) => item !== suppliedProfilePage)
  ];
  return `<!doctype html>
<html lang="${lang}" dir="${isEnglish ? "ltr" : "rtl"}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(fullTitle)}</title>
  <meta name="description" content="${esc(description)}">
${keywords.length ? `  <meta name="keywords" content="${esc(keywords.join(", "))}">\n` : ""}  <meta name="robots" content="${esc(robots)}">
  <meta name="author" content="${esc(isEnglish ? site.nameEn : site.nameAr)}">
  <meta name="application-name" content="${esc(isEnglish ? site.nameEn : site.brandName)}">
  <meta name="theme-color" content="#06131f" data-theme-color>
  <meta name="color-scheme" content="dark light">
  <meta name="referrer" content="strict-origin-when-cross-origin">
  <meta name="format-detection" content="telephone=yes">
  <meta name="geo.region" content="SA-01">
  <meta name="geo.placename" content="${esc(isEnglish ? "Riyadh" : site.city)}">
  <link rel="canonical" href="${canonical}">
  <link rel="sitemap" type="application/xml" href="${site.url}/sitemap.xml">
  ${preloadImage ? `<link rel="preload" as="image" href="${absolute(preloadImage)}" type="image/webp" fetchpriority="high">` : ""}
  ${alternates ? `<link rel="alternate" hreflang="ar" href="${absolute(alternates.ar)}"><link rel="alternate" hreflang="ar-SA" href="${absolute(alternates.ar)}"><link rel="alternate" hreflang="en" href="${absolute(alternates.en)}"><link rel="alternate" hreflang="x-default" href="${absolute(alternates.ar)}">` : ""}
  <link rel="me" href="${site.social.googleDeveloper}">
  <link rel="me" href="${site.social.wikidata}">
  <link rel="me" href="${site.social.github}">
  <link rel="icon" href="/assets/icons/favicon.svg" type="image/svg+xml" sizes="any">
  <link rel="apple-touch-icon" href="/assets/icons/apple-touch-icon.png">
  <link rel="manifest" href="/manifest.webmanifest">
  <link rel="alternate" type="application/rss+xml" title="${isEnglish ? "Eslam Elshikh Insights" : `مدونة ${esc(site.brandName)}`}" href="${isEnglish ? "/en/feed.xml" : "/feed.xml"}">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-title" content="${esc(isEnglish ? site.nameEn : site.brandName)}">
  <meta property="og:locale" content="${isEnglish ? "en_US" : "ar_SA"}">
  <meta property="og:type" content="${type}">
  <meta property="og:site_name" content="${esc(isEnglish ? site.nameEn : site.brandName)}">
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
${stylesheets.length ? `${stylesheets.map((href) => `  <link rel="stylesheet" href="${esc(href)}">`).join("\n")}\n` : ""}  <script src="/assets/js/analytics.js?v=${version}" defer></script>
  <script type="application/ld+json">${safeJson({ "@context": "https://schema.org", "@graph": graph })}</script>
</head>`;
}

function header(active = "", language = "ar", path = "/") {
  const isEnglish = language === "en";
  const alternatePath = isEnglish ? routePair(path).ar : routePair(path).en;
  const nav = isEnglish ? [
    ["home", "/en/", "Home"],
    ["services", "/en/services/", "Services"],
    ["projects", "/en/projects/", "Work"],
    ["maps", "/en/google-maps-projects/", "Google Maps"],
    ["about", "/en/about/", "About"],
    ["google", "/en/google-expert/", "Google expertise"],
    ["blog", "/en/blog/", "Insights"]
  ] : [
    ["home", "/", "الرئيسية"],
    ["services", "/services/", "الخدمات"],
    ["projects", "/projects/", "الأعمال"],
    ["maps", "/google-maps-projects/", "أعمال الخرائط"],
    ["about", "/about/", "عن إسلام"],
    ["google", "/google-expert/", "متخصص خرائط Google"],
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
      <a class="language-switch" href="${alternatePath}" lang="${isEnglish ? "ar" : "en"}" dir="${isEnglish ? "rtl" : "ltr"}" aria-label="${isEnglish ? "النسخة العربية من هذه الصفحة" : "English version of this page"}">${isEnglish ? "عربي" : "EN"}</a>
      <button class="theme-toggle" type="button" aria-label="${isEnglish ? "Change color theme" : "تغيير نمط الألوان"}" aria-pressed="false" data-theme-toggle><span class="theme-sun">${icon("sun")}</span><span class="theme-moon">${icon("moon")}</span></button>
      <a class="button button-small header-cta" href="${isEnglish ? "/en/book/" : "/book/"}">${isEnglish ? "Book" : "احجز استشارة"} ${icon("clock", "button-icon")}</a>
      <button class="menu-toggle" type="button" aria-label="${isEnglish ? "Open menu" : "فتح القائمة"}" aria-expanded="false" aria-controls="mobile-menu" data-menu-toggle><span class="menu-open">${icon("menu")}</span><span class="menu-close">${icon("close")}</span></button>
    </div>
  </div>
  <nav class="mobile-menu" id="mobile-menu" aria-label="${isEnglish ? "Mobile navigation" : "قائمة الجوال"}" data-mobile-menu>
    <div class="mobile-menu-inner">${links}<a class="mobile-language" href="${alternatePath}">${isEnglish ? "النسخة العربية" : "English version"}</a><a class="button" href="${isEnglish ? "/en/book/" : "/book/"}">${isEnglish ? "Book a consultation" : "احجز استشارة"}</a></div>
  </nav>
</header>`;
}

function footer(language = "ar") {
  const isEnglish = language === "en";
  const social = socialLinks.map(([label, href, mark]) => `<a href="${href}" target="_blank" rel="noopener" aria-label="${label}" title="${label}">${mark}</a>`).join("");
  const exploreLinks = isEnglish
    ? `<a href="/en/about/">About</a><a href="/en/projects/">Selected work</a><a href="/en/google-maps-projects/">Google Maps work</a><a href="/en/google-business-profile-audit/">Free GBP audit</a><a href="/en/book/">Book a consultation</a><a href="/en/local-seo/riyadh/">Local SEO in Riyadh</a><a href="/en/google-expert/">Google expertise</a><a href="/en/blog/">Insights</a><a href="/en/contact/">Contact</a>`
    : `<a href="/about/">عن إسلام</a><a href="/projects/">أعمال المواقع</a><a href="/google-maps-projects/">أعمال خرائط Google</a><a href="/google-business-profile-audit/">فحص ملف Google مجانًا</a><a href="/book/">احجز استشارة</a><a href="/local-seo/riyadh/">السيو المحلي في الرياض</a><a href="/google-expert/">متخصص خرائط Google</a><a href="/blog/">المدونة</a><a href="/contact/">تواصل</a>`;
  const serviceLinks = services.slice(0, 6).map((service) => `<a href="${isEnglish ? `/en/services/${service.slug}/` : `/services/${service.slug}/`}">${esc(isEnglish ? englishServiceBySlug(service.slug)?.title || serviceTranslations[service.slug]?.title || service.title : service.title)}</a>`).join("");
  return `<footer class="site-footer">
  <div class="container footer-grid">
    <div class="footer-intro">
      <a class="brand" href="${isEnglish ? "/en/" : "/"}">${logo("brand-logo")}<span class="brand-copy"><strong>${isEnglish ? `Eng. ${site.nameEn}` : site.brandName}</strong><small>${isEnglish ? "Cybersecurity & Digital Engineering" : site.nameEn}</small></span></a>
      <p>${isEnglish ? "Secure digital products, practical AI systems, Google Maps and Business Profile experience, and search visibility for ambitious businesses." : site.positioning}</p>
      <div class="social-row" aria-label="${isEnglish ? "Social profiles" : "الحسابات الاجتماعية"}">${social}</div>
    </div>
    <div class="footer-column"><h2>${isEnglish ? "Explore" : "روابط سريعة"}</h2>${exploreLinks}</div>
    <div class="footer-column footer-services"><h2>${isEnglish ? "Core services" : "الخدمات الرئيسية"}</h2>${serviceLinks}<a class="footer-more" href="${isEnglish ? "/en/services/" : "/services/"}">${isEnglish ? "View all services" : "عرض جميع الخدمات"}</a></div>
    <div class="footer-column footer-contact"><h2>${isEnglish ? "Contact" : "بيانات التواصل"}</h2><a dir="ltr" href="tel:${site.phone}">${icon("phone")}<span>${site.phoneDisplay}</span></a><a href="${site.whatsapp}" target="_blank" rel="noopener">${icon("whatsapp")}<span>WhatsApp</span></a><a href="mailto:${site.email}">${icon("mail")}<span>${site.email}</span></a><a href="${site.googleMapsProfile}" target="_blank" rel="noopener">${icon("pin")}<span>${isEnglish ? "Google Maps business profile" : "الملف التجاري على خرائط Google"}</span></a><span>${icon("globe")}<span>${isEnglish ? "Riyadh service area" : `نطاق الخدمة: ${site.city}`}</span></span></div>
  </div>
  <div class="container footer-bottom"><p>© ${new Date().getFullYear()} ${isEnglish ? `Eng. ${site.nameEn}` : site.brandName}. ${isEnglish ? "All rights reserved." : "جميع الحقوق محفوظة."}</p><div><a href="${isEnglish ? "/en/privacy/" : "/privacy/"}">${isEnglish ? "Privacy" : "الخصوصية"}</a><a href="${isEnglish ? "/en/terms/" : "/terms/"}">${isEnglish ? "Terms" : "الشروط"}</a><a href="/.well-known/security.txt">${isEnglish ? "Security" : "الإبلاغ الأمني"}</a></div></div>
</footer>
<div class="floating-contact" role="group" aria-label="${isEnglish ? "Quick contact" : "تواصل سريع"}">
  <a class="floating-action floating-call" href="tel:${site.phone}" aria-label="${isEnglish ? "Call Eng. Eslam" : "اتصال مباشر بالمهندس إسلام الشيخ"}">${icon("phone")}<span>${isEnglish ? "Call" : "اتصال"}</span></a>
  <a class="floating-action floating-whatsapp" href="${site.whatsapp}?text=${encodeURIComponent(isEnglish ? "Hello Eng. Eslam, I would like to discuss a project." : "مرحبًا م. إسلام، أرغب في مناقشة مشروع.")}" target="_blank" rel="noopener" aria-label="${isEnglish ? "WhatsApp Eng. Eslam" : "تواصل عبر واتساب"}">${icon("whatsapp")}<span>WhatsApp</span></a>
</div>
<button class="back-to-top" type="button" aria-label="${isEnglish ? "Back to top" : "العودة إلى أعلى الصفحة"}" data-back-to-top>${icon("chevron")}</button>
<script src="/assets/js/main.js?v=${version}" defer></script>`;
}

function page({ title, description, path, active = "", body, schema = [], lang = "ar", type = "website", published, modified, image, keywords = [], articleSection = "", stylesheets = [], pageScripts = [], preloadImage = "", robots }) {
  return `${head({ title, description, path, lang, schema, type, published, modified, image, keywords, articleSection, stylesheets, preloadImage, ...(robots ? { robots } : {}) })}
<body>${header(active, lang, path)}<main id="main">${body}${businessMapSection(lang)}</main>${footer(lang)}${pageScripts.map((src) => `<script src="${esc(src)}" defer></script>`).join("")}</body></html>`;
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

function verifiedWorkArchive() {
  const sectors = [...new Set(webProjects.map((project) => project.sector))];
  const cards = webProjects.map((project, index) => {
    const domain = new URL(project.liveUrl).hostname.replace(/^www\./, "");
    const sourceLink = project.sourceUrl
      ? `<a href="${esc(project.sourceUrl)}" target="_blank" rel="noopener" aria-label="عرض مصدر مشروع ${esc(project.title)} على GitHub">المصدر ${icon("code")}</a>`
      : "";
    return `<article class="work-ledger-card reveal" data-work-card data-work-sector="${esc(project.sector)}"><div class="work-ledger-top"><span dir="ltr">${String(index + 1).padStart(2, "0")}</span><span>${esc(project.sector)}</span></div><h3>${esc(project.title)}</h3><p dir="ltr">${esc(domain)}</p><div class="work-ledger-actions"><a href="${esc(project.liveUrl)}" target="_blank" rel="noopener" aria-label="فتح الموقع الحي لمشروع ${esc(project.title)}">الموقع الحي ${icon("external")}</a>${sourceLink}</div></article>`;
  }).join("");

  return `<section class="section-pad work-ledger-section" data-work-archive><div class="container"><div class="section-heading reveal">${eyebrow("السجل الكامل الموثق")}<h2>${projectAudit.verifiedLiveProjects} مشروع ويب حيًا وفريدًا</h2><p>راجعت ${projectAudit.githubRepositories} مستودعًا على GitHub و${projectAudit.vercelProjects} مشروعًا على Vercel، ثم استبعدت المستودعات الفارغة والنسخ المكررة والتجارب والروابط غير العامة. النتيجة أدناه هي الأعمال الحية التي أمكن فتحها والتحقق منها بتاريخ 2 سبتمبر 2026.</p></div><div class="work-audit-summary reveal" aria-label="ملخص تدقيق أعمال الويب"><div><strong>${projectAudit.githubRepositories}</strong><span>مستودع GitHub تمت مراجعته</span></div><div><strong>${projectAudit.vercelProjects}</strong><span>مشروع Vercel تمت مراجعته</span></div><div><strong>${projectAudit.verifiedLiveProjects}</strong><span>مشروعًا حيًا وفريدًا</span></div></div><div class="work-ledger-controls reveal"><label class="work-search"><span>ابحث في الأعمال</span><span class="work-search-field">${icon("search")}<input type="search" inputmode="search" autocomplete="off" placeholder="اسم المشروع أو القطاع أو النطاق" data-work-search></span></label><div class="work-sector-filters" aria-label="تصفية الأعمال حسب القطاع">${[`الكل`, ...sectors].map((sector, index) => `<button type="button" data-work-filter="${index === 0 ? "all" : esc(sector)}" aria-pressed="${index === 0 ? "true" : "false"}">${esc(sector)}</button>`).join("")}</div><p class="work-results-status" data-work-status aria-live="polite">عرض ${webProjects.length} من أصل ${webProjects.length} مشروعًا</p></div><div class="work-ledger-grid">${cards}</div><div class="work-ledger-more"><button class="button button-ghost" type="button" data-work-more hidden>عرض المزيد ${icon("arrow", "button-icon")}</button></div><p class="work-empty" data-work-empty hidden>لا توجد أعمال مطابقة لعبارة البحث أو القطاع المحدد.</p><div class="independent-note reveal">${icon("shield")}<p><strong>حدود الدليل:</strong> الروابط تثبت وجود المشروع العام وقت المراجعة، ولا تعني ادعاء أرقام زيارات أو تحويلات أو ملكية تجارية للجهات المعروضة. الروابط الخارجية قد تتغير بعد النشر.</p></div></div></section>`;
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
      ${eyebrow("مهندس أمن سيبراني · مطور برمجيات · متخصص خرائط Google")}
      <h1>المهندس إسلام الشيخ <span>مواقع آمنة وحضور رقمي أقوى.</span></h1>
      <p class="hero-tagline">تطوير مواقع · أمن سيبراني · خرائط Google والسيو المحلي</p>
      <p class="hero-lead">أساعد الشركات في الرياض والسعودية على بناء مواقع واضحة وسريعة، وحماية أنظمتها، وتحسين ظهورها في البحث وخرائط Google. شاهد أعمالي، واختر المسار المناسب لاحتياجك.</p>
      <p class="hero-support">نطاق واضح، تنفيذ على مراحل، وتسليم يمكنك مراجعته وتطويره.</p>
      <div class="hero-actions">${button("/contact/", "اطلب عرضًا لمشروعك")}${button("/projects/", "شاهد أعمالي", "button-ghost")}</div>
      <div class="hero-trust"><a href="${site.googleMapsProfile}" target="_blank" rel="noopener"><span class="trust-dot trust-google"></span>الملف التجاري على خرائط Google</a><a href="${site.social.googleDeveloper}" target="_blank" rel="noopener"><span class="trust-dot"></span>ملف Google للمطورين</a><a href="${site.social.wikidata}" target="_blank" rel="noopener"><span class="trust-dot"></span>Wikidata Q138800449</a><span><span class="trust-dot trust-live"></span>متاح للمشروعات في السعودية</span></div>
    </div>
    <div class="hero-visual reveal" aria-label="منظومة خدمات المهندس إسلام الشيخ">
      <div class="visual-glow" aria-hidden="true"></div>
      <div class="visual-shell">
        <div class="visual-top"><span>Digital Engineering</span><span class="visual-status"><i></i> Operational</span></div>
        <div class="visual-core">${logo("hero-logo", `صورة ${site.brandName}`)}<div><strong>${site.nameEn}</strong><span>SECURE · BUILD · GROW</span></div></div>
        <div class="visual-capabilities"><span>${icon("shield")}Cybersecurity</span><span>${icon("code")}Web & Apps</span><span>${icon("spark")}AI Agents</span><span>${icon("google")}Google</span><span>${icon("chart")}SEO</span><span>${icon("cloud")}Cloud</span></div>
        <div class="visual-metric"><span>Approach</span><strong>360°</strong><p>أمان وتجربة مستخدم وظهور رقمي داخل قرار واحد.</p></div>
      </div>
      <div class="visual-orbit orbit-a" aria-hidden="true"></div><div class="visual-orbit orbit-b" aria-hidden="true"></div>
    </div>
  </div>
  <div class="container stats-bar reveal">${site.stats.map((stat) => `<div><strong>${esc(stat.value)}</strong><span>${esc(stat.label)}</span></div>`).join("")}</div>
  <p class="container stats-note">أرقام خبرة محدثة حتى سبتمبر 2026؛ ويمكن مراجعة النماذج العامة المنشورة في قسمي الأعمال وخرائط Google.</p>
</section>
<section class="section-pad projects-section"><div class="container"><div class="section-heading reveal">${eyebrow("مختارات من الأعمال")}<h2>مشروعات حقيقية، لكل واحد منها قصة وهوية</h2><p>نماذج حية من مواقع ومنتجات رقمية تم تطويرها للشركات والأنشطة، مع الجمع بين التصميم والتقنية والسيو ومسارات التحويل.</p></div>${projectsShowcase({ home: true })}<div class="section-action">${button("/projects/", "استكشف جميع الأعمال", "button-ghost")}</div></div></section>
<section class="section-pad needs-section" aria-labelledby="needs-title"><div class="container"><div class="section-heading reveal">${eyebrow("كيف أساعدك؟")}<h2 id="needs-title">ابدأ بما يحتاجه مشروعك</h2><p>اختر هدفك لتتعرف على نطاق العمل والمخرجات والخطوة التالية.</p></div><div class="needs-grid">${[
  ["web-development", "code", "أحتاج موقعًا لشركتي", "موقع يشرح خدماتك ويجعل التواصل معك أسهل.", "تصميم وتطوير المواقع"],
  ["google-business-profile", "pin", "ملفي التجاري يحتاج معالجة", "مراجعة التحقق والتعليق والبيانات وخطة الظهور المحلي.", "حلول ملفات Google"],
  ["ai-agents", "spark", "أريد أتمتة العمل", "مساعد ذكي أو أتمتة لمهمة محددة داخل فريقك.", "وكلاء الذكاء الاصطناعي"],
  ["cybersecurity", "shield", "أحتاج مراجعة أمان", "تقييم المخاطر وترتيب المعالجة ضمن نطاق مصرح.", "خدمات الأمن السيبراني"]
].map(([slug, mark, title, copy, label]) => `<a class="need-card reveal" href="/services/${slug}/">${icon(mark)}<h3>${title}</h3><p>${copy}</p><span>${label} ${icon("arrow")}</span></a>`).join("")}</div></div></section>
<section class="section-pad services-section" id="services"><div class="container">
  <div class="section-heading reveal">${eyebrow("الخدمات المتخصصة")}<h2>حلول مترابطة تبدأ من المشكلة وتنتهي بنتيجة قابلة للقياس</h2><p>كل خدمة لها نطاق واضح ومخرجات محددة، ويمكن دمج المسارات عند الحاجة لبناء مشروع متكامل يجمع الحماية والتطوير والظهور والنمو.</p></div>
  <div class="service-filters" role="group" aria-label="تصفية الخدمات"><button type="button" aria-pressed="true" data-service-filter="all">كل الخدمات</button>${[...new Set(services.map((s) => s.group))].map((group) => `<button type="button" aria-pressed="false" data-service-filter="${esc(group)}">${esc(group)}</button>`).join("")}</div>
  <div class="services-grid" data-services-grid>${services.map(serviceCard).join("")}</div>
</div></section>
<section class="section-pad promise-section"><div class="container promise-grid"><div class="promise-copy reveal">${eyebrow("منهجية التنفيذ")}<h2>واجهة جميلة وحدها لا تصنع مشروعًا ناجحًا</h2><p>المشروع الاحترافي يجب أن يكون مفهومًا للعميل، متينًا تقنيًا، آمنًا في التشغيل، قابلًا للفهرسة، وسهل التطوير بعد الإطلاق. لذلك تُراجع جميع الطبقات باعتبارها منتجًا واحدًا.</p>${button("/about/", "تعرف على منهجية العمل", "button-ghost")}</div><div class="principles-grid">
  <article class="principle reveal"><span>01</span>${icon("target")}<h3>هدف تجاري واضح</h3><p>نحدد القرار أو التحويل المطلوب قبل اختيار التقنية أو شكل الواجهة.</p></article>
  <article class="principle reveal"><span>02</span>${icon("shield")}<h3>أمان من التصميم</h3><p>الصلاحيات والبيانات والمخاطر تُراجع من البداية، لا بعد وقوع المشكلة.</p></article>
  <article class="principle reveal"><span>03</span>${icon("user")}<h3>تجربة لكل جهاز</h3><p>Mobile First مع اختبار iOS وAndroid وHuawei والتابلت والكمبيوتر.</p></article>
  <article class="principle reveal"><span>04</span>${icon("chart")}<h3>قياس وتحسين</h3><p>السيو والأداء والتحويلات جزء من التشغيل، وليست إضافات لاحقة.</p></article>
</div></div></section>
<section class="section-pad results-section"><div class="container"><div class="section-heading reveal">${eyebrow("ما الذي تحصل عليه؟")}<h2>مخرجات تساعدك على اتخاذ القرار والتشغيل بثقة</h2></div><div class="result-grid"><article class="result-card reveal">${icon("layers")}<h3>بنية قابلة للتوسع</h3><p>محتوى وكود ومسارات واضحة تقلل إعادة العمل وتسمح بإضافة خدمات وصفحات وتكاملات دون فوضى.</p></article><article class="result-card reveal">${icon("search")}<h3>وضوح لمحركات البحث والعملاء</h3><p>عناوين ومحتوى وروابط وبيانات منظمة تشرح من أنت، ماذا تقدم، ولمن، وأين، دون حشو أو تكرار.</p></article><article class="result-card reveal">${icon("shield")}<h3>مخاطر أقل وتشغيل أفضل</h3><p>قرارات أمنية وتقنية موثقة، وأولويات قابلة للمتابعة، وتجربة متجاوبة لا تعتمد على جهاز واحد.</p></article></div></div></section>

${mapsWorkTeaser()}
${googleGrowthTeaser()}
<section class="section-pad google-proof-section"><div class="container proof-panel reveal"><div class="proof-icon">${icon("google")}</div><div><span>إسلام الشيخ — متخصص خرائط Google</span><h2>خبرة عملية موثقة في الملفات التجارية والظهور المحلي</h2><p>تشخيص مشكلات التحقق والتعليق والملكية والفئات، وتحسين اتساق بيانات النشاط والظهور المحلي وفق سياسات Google، مع نماذج أعمال منشورة يمكن مراجعتها.</p><div class="proof-numbers"><span><strong>472</strong> ملفًا تم دعم توثيقه</span><span><strong>233</strong> مشكلة ملف تجاري تمت معالجتها</span><span><strong>${mapsProjects.length}</strong> نموذجًا عامًا منشورًا</span></div></div><div class="proof-actions">${button("/google-expert/", "تعرف على خدمات خرائط Google")}${button(site.social.googleDeveloper, "ملف Google للمطورين", "button-ghost", true)}</div></div></section>
<section class="section-pad process-section"><div class="container"><div class="section-heading reveal">${eyebrow("مسار العمل")}<h2>وضوح من أول سؤال حتى ما بعد الإطلاق</h2></div><ol class="process-list"><li class="reveal"><span>01</span><h3>تشخيص الهدف</h3><p>فهم المستخدم والنتيجة والقيود والمخاطر والبيانات المتاحة قبل اختيار الأدوات.</p></li><li class="reveal"><span>02</span><h3>تصميم الحل</h3><p>تحديد البنية والمحتوى والنطاق والمخرجات ومعايير القبول وخطة التنفيذ.</p></li><li class="reveal"><span>03</span><h3>تنفيذ ومراجعة</h3><p>بناء على مراحل قصيرة قابلة للاختبار، مع توثيق القرارات والملاحظات.</p></li><li class="reveal"><span>04</span><h3>إطلاق وتحسين</h3><p>فحص الأداء والأجهزة والفهرسة والروابط، ثم متابعة المؤشرات وفرص التطوير.</p></li></ol></div></section>
<section class="section-pad blog-section"><div class="container"><div class="section-heading reveal">${eyebrow("معرفة عملية")}<h2>مقالات تساعدك على اتخاذ قرارات تقنية أكثر وضوحًا</h2></div><div class="posts-grid">${allPosts.slice(0, 3).map((post) => postCard(post)).join("")}</div><div class="section-action">${button("/blog/", "استكشف المدونة", "button-ghost")}</div></div></section>
<section class="section-pad faq-section"><div class="container faq-grid"><div class="faq-intro reveal">${eyebrow("الأسئلة الشائعة")}<h2>إجابات صريحة قبل بدء المشروع</h2><p>لا توجد باقة واحدة تناسب الجميع؛ لذلك أوضح الحدود والمخرجات والاعتماديات من البداية.</p>${button("/contact/", "أرسل تفاصيل مشروعك", "button-ghost")}</div>${faqBlock(faq)}</div></section>
${finalCta()}`;
  return page({ title: "المهندس إسلام الشيخ | أمن سيبراني وتطوير مواقع بالرياض", description: site.description, path: "/", active: "home", body, schema: [faqSchema(faq)], preloadImage: profilePhoto });
}

function finalCta(title = "لنحوّل فكرتك أو مشكلتك إلى خطة واضحة قابلة للتنفيذ", text = "أرسل الهدف والوضع الحالي والروابط المتاحة والموعد المتوقع. ستحصل على نقطة بداية منظمة تساعدك على اتخاذ القرار الصحيح.") {
  return `<section class="section-pad final-cta"><div class="container"><div class="cta-panel reveal"><div>${eyebrow("ابدأ من تشخيص صحيح")}<h2>${esc(title)}</h2><p>${esc(text)}</p></div><div class="cta-actions">${button(`${site.whatsapp}?text=${encodeURIComponent("مرحبًا م. إسلام، أرغب في مناقشة مشروع تقني.")}`, "ابدأ عبر واتساب", "button-light", true)}<a class="cta-phone" href="tel:${site.phone}" dir="ltr">${site.phoneDisplay}</a></div></div></div></section>`;
}

function innerHero({ eyebrowText, title, lead, path, crumbs = [], aside, afterLead = "", className = "", language = "ar" }) {
  const isEnglish = language === "en";
  const breadcrumb = [{ name: isEnglish ? "Home" : "الرئيسية", path: isEnglish ? "/en/" : "/" }, ...crumbs];
  return `<section class="inner-hero${className ? ` ${esc(className)}` : ""}"><div class="container"><nav class="breadcrumbs" aria-label="${isEnglish ? "Breadcrumb" : "مسار الصفحة"}">${breadcrumb.map((item, index) => `${index ? icon("chevron") : ""}<a href="${item.path}"${index === breadcrumb.length - 1 ? ' aria-current="page"' : ""}>${esc(item.name)}</a>`).join("")}</nav><div class="inner-hero-grid"><div class="inner-hero-copy reveal">${eyebrow(eyebrowText)}<h1>${title}</h1><p>${esc(lead)}</p>${afterLead}</div>${aside ? `<div class="inner-hero-aside reveal">${aside}</div>` : ""}</div></div></section>`;
}

function businessMapSection(language = "ar") {
  const isEnglish = language === "en";
  return `<section class="business-map-section" id="google-business-map" aria-labelledby="google-business-map-title"><div class="wide-map-container"><div class="business-map-heading reveal"><div>${eyebrow(isEnglish ? "Google Business Profile" : "الملف التجاري على Google")}<h2 id="google-business-map-title">${isEnglish ? "Office location in Al Masif, Riyadh" : "موقع العمل في حي المصيف، الرياض"}</h2><p>${isEnglish ? "Digital enquiries are accepted 24/7. Office visits are available after the appointment is confirmed; remote collaboration is available across Saudi Arabia." : "تُستقبل الطلبات رقميًا على مدار الساعة. الزيارة إلى موقع العمل متاحة بعد تأكيد الموعد، كما تتوفر الخدمة عن بُعد داخل السعودية."}</p></div><a class="text-link map-profile-link" href="${site.googleMapsProfile}" target="_blank" rel="noopener">${isEnglish ? "Open the business profile and directions" : "فتح الملف التجاري والاتجاهات"} ${icon("external")}</a></div><div class="business-map-frame reveal"><iframe src="${esc(site.googleMapsEmbed)}" width="600" height="450" title="${isEnglish ? "Office map in Al Masif, Riyadh" : "خريطة موقع العمل في حي المصيف بالرياض"}" loading="lazy" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div><div class="business-map-bar reveal"><span>${icon("pin")}<span>${isEnglish ? `${site.streetAddress}, Riyadh ${site.postalCode}` : `${site.streetAddress}، الرياض ${site.postalCode}`}</span></span><span>${icon("clock")}<span>${isEnglish ? "Digital intake 24/7 · visits by appointment" : "استقبال رقمي 24/7 · الزيارة بموعد مؤكد"}</span></span><a href="tel:${site.phone}" dir="ltr">${icon("phone")}<span>${esc(site.phoneDisplay)}</span></a></div></div></section>`;
}

function servicesIndexPage() {
  const groups = [...new Set(services.map((service) => service.group))];
  const body = `${innerHero({ eyebrowText: "خدمات هندسية واستشارية", title: "خدمات رقمية متكاملة للأمان والتطوير والظهور والنمو", lead: "اختر خدمة مستقلة أو ابنِ مشروعًا متعدد المسارات يجمع الأمن السيبراني والبرمجيات والذكاء الاصطناعي وخبرة Google والسيو في خطة واضحة ومخرجات قابلة للقياس.", path: "/services/", crumbs: [{ name: "الخدمات", path: "/services/" }], aside: `<span class="aside-kicker">9 مسارات متخصصة</span><strong>من التشخيص إلى الإطلاق والتحسين</strong><p>كل صفحة توضح النطاق والمخرجات والخطوات والأسئلة الشائعة قبل التواصل.</p>` })}
<section class="section-pad"><div class="container"><div class="service-filters" role="group" aria-label="تصفية الخدمات"><button type="button" aria-pressed="true" data-service-filter="all">كل الخدمات</button>${groups.map((group) => `<button type="button" aria-pressed="false" data-service-filter="${esc(group)}">${esc(group)}</button>`).join("")}</div><div class="services-grid services-grid-index" data-services-grid>${services.map(serviceCard).join("")}</div></div></section>
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
<section class="section-pad faq-section"><div class="container faq-grid"><div class="faq-intro reveal">${eyebrow("أسئلة الخدمة")}<h2>${esc(sectionCopy.faq)}</h2>${button(`/contact/?service=${service.slug}#project-brief`, "اطلب عرضًا لهذه الخدمة", "button-ghost")}</div>${faqBlock(service.faq)}</div></section>
<section class="section-pad related-section"><div class="container"><div class="section-heading reveal">${eyebrow("خدمات مترابطة")}<h2>${esc(sectionCopy.related)}</h2></div><div class="services-grid related-services">${related.map(serviceCard).join("")}</div></div></section>
${finalCta(`هل تحتاج ${service.title} ضمن مشروع واضح؟`, `أرسل الوضع الحالي والنتيجة المطلوبة، وسنحدد نطاقًا واقعيًا ومخرجات واضحة وخطوات قابلة للمتابعة.`)}`;
  return page({ title: service.seoTitle || service.title, description: service.meta, path, active: "services", body, schema: [serviceSchema, faqSchema(service.faq), breadcrumbSchema([{ name: "الرئيسية", path: "/" }, { name: "الخدمات", path: "/services/" }, { name: service.title, path }])] });
}

function aboutPage() {
  const body = renderAbout({
    site,
    mapsCount: mapsProjects.length,
    projectCount: webProjects.length,
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
    // Google ProfilePage expects DateTime rather than a date-only value.
    dateModified: `${site.lastUpdated}T00:00:00+03:00`
  };
  return page({
    title: "عن المهندس إسلام الشيخ | مهندس برمجيات وأمن سيبراني",
    description: "تعرّف على المهندس إسلام الشيخ، مهندس أمن سيبراني ومطور مواقع وبرمجيات في الرياض، وشاهد مشروعات موثقة في الويب والذكاء الاصطناعي وخرائط Google والسيو.",
    path: "/about/",
    active: "about",
    body,
    stylesheets: [`/assets/css/about.css?v=${version}`],
    pageScripts: [`/assets/js/about.js?v=${version}`],
    preloadImage: profilePhoto,
    schema: [profileSchema, breadcrumbSchema([{ name: "الرئيسية", path: "/" }, { name: "عن إسلام", path: "/about/" }])]
  });
}

function googleExpertPage() {
  const faq = [
    ["من هو إسلام الشيخ في مجال خرائط جوجل؟", "إسلام الشيخ متخصص في خرائط Google والملفات التجارية، يساعد أصحاب الأنشطة في الرياض والسعودية على تشخيص مشكلات التحقق والتعليق والملكية والفئات وتحسين الظهور المحلي وفق سياسات Google."],
    ["كيف يساعد متخصص خرائط Google النشاط التجاري؟", "يبدأ العمل بمراجعة أهلية النشاط ونموذجه وبيانات الملف والموقع المرتبط والمشكلات السابقة، ثم تحديد التصحيحات والأدلة والمسار المناسب للتحقق أو الاستئناف أو تحسين الظهور المحلي."],
    ["متى أحتاج إلى متخصص في ملفات Google التجارية؟", "تحتاج إلى مراجعة متخصصة عند تعذر إثبات الملكية أو تعليق الملف أو فقدان الوصول أو وجود ملف مكرر أو رفض تعديلات مهمة أو انخفاض الظهور بسبب بيانات وفئات ومحتوى غير متسق."],
    ["هل تمثل Google عند تقديم الخدمة؟", "أقدم استشارات مستقلة في خرائط Google والملفات التجارية، ولا أمثل Google. يشمل عملي مراجعة بيانات النشاط وتجهيز الأدلة ومتابعة المسار الرسمي المناسب؛ قرارات التحقق والاستعادة والترتيب تخص Google."],
    ["كيف أحل مشكلة إثبات الملكية بعد رفض الفيديو؟", "تتم مراجعة سبب الرفض وتسلسل اللقطات ومدى وضوح الموقع أو نطاق الخدمة واللافتة ومعدات العمل وإثبات الإدارة، ثم تجهيز الدليل وفق نموذج النشاط الحقيقي أو استخدام مسار التحقق الرسمي المتاح."],
    ["هل إضافة كلمات مفتاحية إلى اسم النشاط تحسن الظهور؟", "يجب أن يطابق الاسم المستخدم في الملف الاسم الحقيقي المعروف للنشاط. يتم تحسين الظهور من خلال الفئة والخدمات والموقع والمحتوى والسمعة والاتساق، وليس بإضافة كلمات غير موجودة في الاسم الفعلي."],
    ["هل يمكن تحسين الظهور على خرائط Google؟", "يمكن تحسين اكتمال الملف ودقة بياناته وارتباطه بالموقع والمحتوى والسمعة المحلية، ثم قياس الاستفسارات والإجراءات. أما ترتيب النتائج فيتغير حسب الصلة والمسافة والشهرة والمنافسة."],
    ["هل تضمن توثيق الملف أو تصدر خرائط جوجل؟", "لا يمكن ضمان قرار التحقق أو الاستعادة أو ترتيب محدد، لكن التشخيص الصحيح وتجهيز الأدلة وتحسين الاتساق والالتزام بالإرشادات يقلل الأخطاء ويبني ملفًا أقوى على المدى الطويل."]
  ];
  const expertService = {
    "@type": "Service",
    "@id": `${site.url}/google-expert/#service`,
    name: "استشارات خرائط Google والملفات التجارية",
    serviceType: ["استشارات خرائط Google", "إدارة وتحسين Google Business Profile", "تحسين الظهور المحلي"],
    url: `${site.url}/google-expert/`,
    description: "خدمات إسلام الشيخ في خرائط جوجل والملفات التجارية تشمل تشخيص التحقق والتعليق والملكية والفئات وتحسين البيانات والظهور المحلي في السعودية.",
    provider: { "@id": `${site.url}/#person` },
    areaServed: [{ "@type": "City", name: "الرياض" }, { "@type": "Country", name: "المملكة العربية السعودية" }]
  };
  const body = `${innerHero({ eyebrowText: "متخصص خرائط Google · الرياض والسعودية", title: "إسلام الشيخ — متخصص خرائط Google والملفات التجارية", lead: "أنا إسلام الشيخ، متخصص في خرائط Google والملفات التجارية. أساعد أصحاب الأنشطة على حل مشكلات التحقق والتعليق وإثبات الملكية وتحسين بيانات النشاط ورفع كفاءة الظهور في نتائج البحث وخرائط Google من خلال حلول عملية متوافقة مع السياسات.", path: "/google-expert/", crumbs: [{ name: "متخصص خرائط Google", path: "/google-expert/" }], aside: `<span class="google-mark">G</span><strong>خبرة عملية في Google Maps</strong><p>مساهمات عملية في منتجات Google ونماذج ملفات تجارية منشورة يمكن مراجعتها مباشرة.</p>` })}
<section class="section-pad"><div class="container google-stats"><div class="google-stat reveal"><strong>472</strong><span>ملفًا تجاريًا على Google تم دعم توثيقه</span></div><div class="google-stat reveal"><strong>233</strong><span>مشكلة ملف تجاري تم حلها ومعالجتها</span></div><div class="google-stat reveal"><strong>${mapsProjects.length}</strong><span>نموذجًا عامًا منشورًا يمكن مراجعته</span></div><div class="google-stat reveal"><strong>Google</strong><span>خبرة عملية في الملفات التجارية</span></div></div></section>
<section class="section-pad muted-section"><div class="container service-intro-grid"><div class="rich-copy reveal"><h2>مراجعة متخصصة تساعدك على اتخاذ القرار الصحيح</h2><p>أبدأ بفهم نموذج النشاط الحقيقي، سواء كان يستقبل العملاء في موقع واضح أو يعمل في نطاق خدمة، ثم أراجع الاسم والفئة والعنوان أو المناطق والخدمات والموقع الإلكتروني والمستخدمين والتغييرات السابقة وإشعارات Google.</p><p>بعد التشخيص أحدد التناقضات والمخاطر والتصحيحات المطلوبة، وأرتب الأدلة والخطوات المناسبة للتحقق أو الاستئناف أو استعادة الوصول. وبعد استقرار الملف أعمل على تحسين اكتمال البيانات وربطها بالموقع والمحتوى والسيو المحلي وقياس التفاعل.</p>${button("/services/google-business-profile/", "عرض خدمات الملفات التجارية")}</div><aside class="disclaimer-card professional-summary-card reveal"><span>عن إسلام الشيخ</span><h2>خبرة عملية مدعومة بمساهمات ونماذج منشورة</h2><p>يجمع إسلام الشيخ بين العمل على منتجات Google وإدارة الملفات التجارية والسيو المحلي وتطوير المواقع، لتقديم معالجة مترابطة تبدأ من صحة الملف وتصل إلى تجربة الموقع والتحويل والقياس.</p><a class="text-link" href="${site.social.googleDeveloper}" target="_blank" rel="noopener">عرض ملف Google للمطورين ${icon("external")}</a><a class="text-link" href="${site.googleMapsProfile}" target="_blank" rel="noopener">عرض الملف التجاري على خرائط Google ${icon("external")}</a></aside></div></section>
<section class="section-pad"><div class="container case-method reveal"><div><span>توحيد الهوية في البحث</span><h2>المهندس إسلام الشيخ هو Eslam Elshikh</h2></div><p>الاسم العربي الرسمي هو «المهندس إسلام الشيخ»، والاسم الإنجليزي المستخدم مهنيًا هو «Eslam Elshikh»، وتظهر أحيانًا كتابة «Islam Elshikh». لذلك فإن عمليات البحث مثل «إسلام الشيخ جوجل» و«المهندس إسلام الشيخ جوجل» و«Eslam Elshikh Google» تشير إلى هذا الملف المهني الرسمي.</p>${button("/about/", "تحقق من الملف المهني", "button-ghost")}</div></section>
<section class="section-pad"><div class="container"><div class="section-heading reveal">${eyebrow("الحالات التي أتعامل معها")}<h2>من إنشاء الملف إلى استعادة الاستقرار والظهور</h2></div><div class="scope-grid"><article class="scope-card reveal"><span>01</span>${icon("pin")}<p>إعداد ملف مؤهل يعكس نموذج النشاط الحقيقي والفئة والخدمات ونطاق العمل.</p></article><article class="scope-card reveal"><span>02</span>${icon("shield")}<p>تشخيص تعليق الملف أو تعطيله ومراجعة التغييرات والمخاطر والملكية.</p></article><article class="scope-card reveal"><span>03</span>${icon("google")}<p>تجهيز إثبات الملكية بالفيديو أو الأدلة المتاحة بصورة منظمة ومتوافقة.</p></article><article class="scope-card reveal"><span>04</span>${icon("search")}<p>ربط الملف بالموقع والسيو المحلي والاتساق والمحتوى والقياس.</p></article><article class="scope-card reveal"><span>05</span>${icon("layers")}<p>مراجعة الملفات المكررة والملكية والمستخدمين والمواقع والفروع.</p></article><article class="scope-card reveal"><span>06</span>${icon("chart")}<p>تحليل الظهور والاستفسارات وجودة التحويل بعد استقرار الملف.</p></article></div></div></section>
<section class="section-pad maps-section"><div class="container"><div class="section-heading reveal">${eyebrow("نماذج منشورة")}<h2>ملفات تجارية حقيقية يمكن فتحها على خرائط Google</h2><p>مختارات من قطاعات ومدن مختلفة، مع صفحة مستقلة تضم السجل الكامل للأعمال.</p></div><div class="map-case-grid">${mapsProjects.filter((item) => item.featured).slice(0, 6).map(featuredMapCard).join("")}</div><div class="section-action">${button("/google-maps-projects/", `استعرض ${mapsProjects.length} ملفًا تجاريًا`, "button-ghost")}</div></div></section>
<section class="section-pad faq-section"><div class="container faq-grid"><div class="faq-intro reveal">${eyebrow("أسئلة ملفات Google التجارية")}<h2>إجابات واضحة قبل تعديل ملفك التجاري</h2><p>الدقة والاتساق والأهلية أهم من كثرة المحاولات والتغييرات العشوائية.</p>${button(`${site.whatsapp}?text=${encodeURIComponent("مرحبًا م. إسلام، لدي مشكلة في ملف Google التجاري وأرغب في تشخيصها.")}`, "أرسل تفاصيل الحالة", "button-ghost", true)}</div>${faqBlock(faq)}</div></section>
${finalCta("ملفك التجاري معلق أو تعذر إثبات ملكيته؟", "أرسل رابط الملف ونص الإشعار وتسلسل التعديلات والمحاولات السابقة دون مشاركة كلمة مرور أو رمز تحقق.")}`;
  return page({ title: "إسلام الشيخ | متخصص خرائط Google والملفات التجارية", description: "خدمات المهندس إسلام الشيخ في خرائط Google والملفات التجارية بالسعودية: تشخيص التحقق والتعليق والملكية وتحسين البيانات والظهور المحلي.", path: "/google-expert/", active: "google", body, schema: [expertService, faqSchema(faq), breadcrumbSchema([{ name: "الرئيسية", path: "/" }, { name: "متخصص خرائط Google", path: "/google-expert/" }])] });
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

const proofRegion = (item) => item.location.includes("الرياض") ? "riyadh"
  : item.location.includes("خميس") ? "khamis"
  : item.location.includes("نجران") ? "najran"
  : "service";

const normalizeProjectName = (value) => String(value || "").replace(/[^\p{L}\p{N}]+/gu, "").toLowerCase();

function linkedWebProject(item) {
  const target = normalizeProjectName(item.title);
  return webProjects.find((project) => {
    const candidate = normalizeProjectName(project.title);
    return target === candidate || (Math.min(target.length, candidate.length) > 8 && (target.includes(candidate) || candidate.includes(target)));
  });
}

function linkedCaseStudy(item) {
  const target = normalizeProjectName(item.title);
  return projects.find((project) => project.caseStudy && project.slug && normalizeProjectName(project.title) === target);
}

function proofCard(item, index, language = "ar") {
  const isEnglish = language === "en";
  const webProject = linkedWebProject(item);
  const caseStudy = linkedCaseStudy(item);
  const region = proofRegion(item);
  const category = isEnglish ? englishMapCategory(item.category) : item.category;
  const location = isEnglish ? englishMapLocation(item.location) : item.location;
  const searchText = `${item.title} ${category} ${location}`.toLocaleLowerCase("ar");
  const workType = webProject
    ? (isEnglish ? "Website delivery and alignment with the public profile" : "تطوير موقع ومواءمة الحضور الرقمي مع الملف العام")
    : (isEnglish ? "Public example within the Business Profile support record" : "نموذج عام ضمن سجل دعم الملفات التجارية");
  const request = isEnglish
    ? `Hello Eng. Eslam, I reviewed the public example for ${item.title} and would like a similar Google and website assessment.`
    : `مرحبًا م. إسلام، شاهدت نموذج «${item.title}» وأرغب في مشروع مشابه يجمع ملف Google والموقع.`;
  return `<article class="proof-card" id="proof-${index + 1}" data-proof-card data-region="${region}" data-search="${esc(searchText)}"><span class="proof-card-index" dir="ltr">${String(index + 1).padStart(2, "0")}</span><div><p>${esc(category)} · ${esc(location)}</p><h3${isEnglish ? ' lang="ar" dir="rtl"' : ""}>${esc(item.title)}</h3><small>${esc(workType)}</small><small>${isEnglish ? "Verified evidence: public profile link available" : "الدليل الموثق: رابط الملف العام متاح للمراجعة"}</small></div><div class="proof-card-actions"><a href="${item.url}" target="_blank" rel="noopener" title="${isEnglish ? "Open public profile" : "فتح الملف العام"}" aria-label="${isEnglish ? "Open public Google Maps profile" : `فتح ملف ${esc(item.title)} على خرائط Google`}">${icon("pin")}</a>${webProject ? `<a href="${esc(webProject.liveUrl)}" target="_blank" rel="noopener" title="${isEnglish ? "Open website" : "فتح الموقع"}" aria-label="${isEnglish ? "Open the related live website" : `فتح الموقع المرتبط بنموذج ${esc(item.title)}`}">${icon("globe")}</a>` : ""}${caseStudy ? `<a href="${isEnglish ? `/en/projects/${caseStudy.slug}/` : `/projects/${caseStudy.slug}/`}" title="${isEnglish ? "Case study" : "دراسة الحالة"}">${icon("book")}</a>` : ""}<a href="${site.whatsapp}?text=${encodeURIComponent(request)}" target="_blank" rel="noopener" title="${isEnglish ? "Request similar work" : "أريد مشروعًا مشابهًا"}" aria-label="${isEnglish ? "Request similar work" : `أريد مشروعًا مشابهًا لنموذج ${esc(item.title)}`}">${icon("whatsapp")}</a></div></article>`;
}

function proofEngine(language = "ar") {
  const isEnglish = language === "en";
  const regionCounts = mapsProjects.reduce((counts, item) => ({ ...counts, [proofRegion(item)]: (counts[proofRegion(item)] || 0) + 1 }), {});
  const nodes = isEnglish ? [
    ["service", "Service-area", regionCounts.service || 0], ["riyadh", "Riyadh", regionCounts.riyadh || 0], ["khamis", "Khamis Mushait", regionCounts.khamis || 0], ["najran", "Najran", regionCounts.najran || 0]
  ] : [
    ["service", "نطاق خدمة", regionCounts.service || 0], ["riyadh", "الرياض", regionCounts.riyadh || 0], ["khamis", "خميس مشيط", regionCounts.khamis || 0], ["najran", "نجران", regionCounts.najran || 0]
  ];
  return `<section class="section-pad proof-engine" data-proof-engine><div class="container"><div class="section-heading reveal">${eyebrow(isEnglish ? "Google Local Proof Engine" : "Google Local Proof Engine")}<h2>${isEnglish ? "A map of public work—not a map of branches" : "خريطة أعمال المهندس إسلام الشيخ على Google"}</h2><p>${isEnglish ? "Each point is an evidence cluster for independent work. It does not represent a branch, owned business, or shared local entity." : "كل نقطة تجمع نماذج أعمال مستقلة حسب النطاق الجغرافي. لا تمثل فرعًا تابعًا لإسلام، ولا ملكية للنشاط، ولا كيان Local SEO مشتركًا."}</p></div><div class="proof-map-layout"><aside class="proof-map-canvas reveal" aria-label="${isEnglish ? "Geographic distribution filters" : "مرشحات توزيع الأعمال جغرافيًا"}"><div class="proof-map-head"><span class="eyebrow"><span></span>${isEnglish ? "Evidence distribution" : "توزيع الدليل"}</span><h2>${isEnglish ? "Saudi public examples" : "نماذج عامة داخل السعودية"}</h2><p>${isEnglish ? "Approximate clusters for browsing; not exact customer pins." : "تجميع تقريبي للتصفح، وليس تحديدًا دقيقًا لمواقع العملاء."}</p></div><div class="proof-map-nodes">${nodes.map(([key, label, count]) => `<button class="proof-node proof-node-${key}" type="button" data-proof-region="${key}" aria-pressed="false"><strong>${count}</strong><span>${esc(label)}</span></button>`).join("")}</div></aside><div class="proof-browser reveal"><div class="proof-controls"><label class="proof-search"><span>${isEnglish ? "Search by activity, sector, or area" : "ابحث باسم النشاط أو القطاع أو المنطقة"}</span><input type="search" autocomplete="off" data-proof-search placeholder="${isEnglish ? "Search public examples" : "مثال: مقاولات، المصيف، مطعم"}"></label><button class="button button-ghost proof-all" type="button" data-proof-region="all" aria-pressed="true">${isEnglish ? "All examples" : "كل الأعمال"}</button></div><p class="proof-results" data-proof-status aria-live="polite"></p><div class="proof-cards">${mapsProjects.map((item, index) => proofCard(item, index, language)).join("")}</div><p class="proof-empty" data-proof-empty hidden>${isEnglish ? "No examples match the current filter." : "لا توجد نماذج مطابقة للتصفية الحالية."}</p></div></div><div class="independent-note reveal">${icon("shield")}<p><strong>${isEnglish ? "Entity separation:" : "فصل الكيانات:"}</strong> ${isEnglish ? "The structured data describes this page as a creative portfolio and list of evidence. Customer businesses are not marked as LocalBusiness entities owned by Eslam Elshikh." : "البيانات المنظمة تصف الصفحة كبورتفوليو إبداعي وقائمة أدلة. لا تُعرّف أنشطة العملاء ككيانات LocalBusiness مملوكة أو تابعة للمهندس إسلام الشيخ."}</p></div></div></section>`;
}

function googleMapsProjectsPage() {
  const categories = [...new Set(mapsProjects.map((item) => item.category))];
  const mapListSchema = {
    "@type": "ItemList",
    "@id": `${site.url}/google-maps-projects/#proof-list`,
    name: "نماذج أعمال خرائط Google والملفات التجارية",
    numberOfItems: mapsProjects.length,
    itemListElement: mapsProjects.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "CreativeWork",
        "@id": `${site.url}/google-maps-projects/#proof-${index + 1}`,
        name: `نموذج عمل عام: ${item.title}`,
        creator: { "@id": `${site.url}/#person` },
        about: item.category,
        contentLocation: { "@type": "Place", name: item.location },
        sameAs: item.url
      }
    }))
  };
  const body = `${innerHero({ eyebrowText: "أعمال خرائط Google", title: `${mapsProjects.length} دليل عمل عامًا داخل محرك إثبات محلي`, lead: "خريطة تفاعلية تربط القطاع والموقع ونوع العمل بالدليل العام المتاح، مع فصل واضح بين بورتفوليو إسلام والكيانات التجارية المستقلة.", path: "/google-maps-projects/", crumbs: [{ name: "الأعمال", path: "/projects/" }, { name: "أعمال خرائط Google", path: "/google-maps-projects/" }], aside: `<span class="aside-kicker">Google Local Proof Engine</span><strong>كل رابط يقود إلى ملف عام فعلي على خرائط Google</strong><p>الأنشطة المعروضة ليست فروعًا لإسلام. لا نختلق نتائج أو نَعِد بترتيب ثابت.</p>` })}
<section class="section-pad maps-method-section"><div class="container"><div class="maps-work-stats reveal"><div><strong>${mapsProjects.length}</strong><span>ملفًا فريدًا</span></div><div><strong>${categories.length}</strong><span>قطاعًا مختلفًا</span></div><div><strong>${mapWorkTracks.length}</strong><span>مسارات دعم رئيسية</span></div><div><strong>Google</strong><span>روابط عامة قابلة للمعاينة</span></div></div><div class="section-heading reveal">${eyebrow("نطاق الخبرة")}<h2>من إثبات الأهلية إلى حضور محلي أوضح</h2><p>الخدمة لا تعتمد على تعديل واحد؛ بل تبدأ بتشخيص حالة الملف والنشاط، ثم اختيار المسار المتوافق مع سياسات Google والهدف التجاري.</p></div><div class="map-track-grid">${mapWorkTracks.map((track) => `<article class="map-track-card reveal"><span dir="ltr">${track.number}</span><h3>${esc(track.title)}</h3><p>${esc(track.text)}</p></article>`).join("")}</div></div></section>
${proofEngine()}
<section class="section-pad muted-section"><div class="container"><div class="section-heading reveal">${eyebrow("الخطوة التالية")}<h2>حوّل مشاهدة الدليل إلى فحص لحالتك</h2><p>ابدأ بفحص مجاني للبيانات العامة، أو اطلب استشارة إذا كانت الحالة تتضمن تحققًا أو تعليقًا أو تعارض ملكية.</p></div><div class="section-action">${button("/google-business-profile-audit/", "افحص ملفك خلال 60 ثانية")}${button("/book/", "احجز استشارة", "button-ghost")}</div></div></section>
${finalCta("هل لديك ملف يحتاج توثيقًا أو استعادة ملكية أو رفع قيود؟", "أرسل رابط الملف ووضعه الحالي وما يظهر في لوحة الإدارة، وسأبدأ بتشخيص المسار الصحيح قبل أي تعديل أو طلب مراجعة.")}`;
  return page({ title: "خريطة أعمال Google ودراسات الإثبات | إسلام الشيخ", description: `استعرض ${mapsProjects.length} نموذجًا عامًا داخل خريطة أعمال تفاعلية تفصل بوضوح بين بورتفوليو إسلام الشيخ والكيانات التجارية المستقلة.`, path: "/google-maps-projects/", active: "maps", body, stylesheets: [`/assets/css/google-growth.css?v=${version}`], pageScripts: [`/assets/js/google-proof.js?v=${version}`], keywords: ["أعمال خرائط جوجل", "توثيق خرائط جوجل", "دراسات حالة سيو محلي", "تحسين ظهور خرائط جوجل", "خبير خرائط جوجل"], schema: [mapListSchema, breadcrumbSchema([{ name: "الرئيسية", path: "/" }, { name: "الأعمال", path: "/projects/" }, { name: "أعمال خرائط Google", path: "/google-maps-projects/" }])] });
}

function projectsPage() {
  const projectList = {
    "@type": "ItemList",
    "@id": `${site.url}/projects/#project-list`,
    name: "مشروعات المواقع المنشورة للمهندس إسلام الشيخ",
    numberOfItems: webProjects.length,
    itemListElement: webProjects.map((project, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: project.title,
      url: project.liveUrl
    }))
  };
  const collectionSchema = {
    "@type": "CollectionPage",
    "@id": `${site.url}/projects/#collection`,
    url: `${site.url}/projects/`,
    name: "أعمال ومشروعات المهندس إسلام الشيخ",
    description: `${projectAudit.verifiedLiveProjects} مشروع ويب حيًا وموثقًا من أعمال إسلام الشيخ، إلى جانب مجموعة مختارة بدراسات حالة وتفاصيل تنفيذ.`,
    creator: { "@id": `${site.url}/#person` },
    mainEntity: { "@id": projectList["@id"] },
    dateModified: site.lastUpdated
  };
  const body = `${innerHero({ eyebrowText: "الأعمال والمشروعات", title: `${projectAudit.verifiedLiveProjects} مشروعًا حيًا موثقًا، ومختارات تشرح طريقة التنفيذ`, lead: "سجل عام جرى التحقق من روابطه، مع مشروعات مختارة توضح كيف يتحول الهدف التجاري إلى بنية محتوى وتجربة متجاوبة ومسارات تواصل وقياس على الجوال وسطح المكتب.", path: "/projects/", crumbs: [{ name: "الأعمال", path: "/projects/" }], aside: `<span class="aside-kicker">VERIFIED WORK / ${projectAudit.verifiedLiveProjects}</span><strong>تصميم وتطوير وسيو في منظومة واحدة</strong><p>تدقيق GitHub وVercel يفصل الأعمال الحية عن النسخ التجريبية والمكررة، مع روابط مباشرة قابلة للمراجعة.</p>` })}
<section class="section-pad portfolio-page-section"><div class="container"><div class="portfolio-page-heading reveal"><span>${projects.length} مشروعًا مختارًا</span><p>مجموعة منتقاة مرتبة بصريًا لتوضّح تنوع القطاعات وطبيعة الحل، ثم يأتي بعدها السجل الكامل لجميع الأعمال الحية الموثقة.</p></div>${projectsShowcase()}</div></section>
${verifiedWorkArchive()}
${mapsWorkTeaser()}
${googleGrowthTeaser()}
<section class="section-pad"><div class="container case-method reveal"><div><span>منهج المشروع</span><h2>لا توجد نسخة واحدة تُكرر على كل نشاط</h2></div><p>تختلف بنية الموقع والمحتوى والدعوات والبيانات المنظمة حسب نموذج النشاط ورحلة العميل والمنافسة والقدرة التشغيلية. الهدف هو حل يناسب العمل الحقيقي، لا قالبًا يغير الألوان والشعار فقط.</p>${button("/contact/", "ناقش مشروعًا مشابهًا")}</div></section>
${finalCta("هل تريد تحويل نشاطك إلى تجربة رقمية احترافية؟", "أرسل رابط الموقع أو الملف التجاري والخدمات المستهدفة والمدينة والهدف، وسنحدد ما يحتاج إعادة بناء وما يمكن تحسينه تدريجيًا.")}`;
  return page({ title: `${projectAudit.verifiedLiveProjects} مشروع ويب موثق | أعمال المهندس إسلام الشيخ`, description: `استعرض ${projectAudit.verifiedLiveProjects} مشروع ويب حيًا وموثقًا من أعمال المهندس إسلام الشيخ في تطوير المواقع والمنصات وتجربة المستخدم والسيو التقني والمحلي.`, path: "/projects/", active: "projects", body, schema: [collectionSchema, projectList, breadcrumbSchema([{ name: "الرئيسية", path: "/" }, { name: "الأعمال", path: "/projects/" }])] });
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

function localSeoPage() {
  const citySpecific = true;
  const path = "/local-seo/riyadh/";
  const title = "تحسين السيو المحلي وظهور الأنشطة في الرياض";
  const seoTitle = "خدمات السيو المحلي في الرياض | إسلام الشيخ";
  const lead = "خدمة سيو محلي للشركات والأنشطة في الرياض تربط الموقع بملف Google التجاري والمحتوى والاتساق والسمعة وقياس المكالمات والطلبات.";
  const faq = localSeoFaq;
  const body = `${innerHero({ eyebrowText: citySpecific ? "سيو محلي لمدينة الرياض" : "الظهور المحلي في السعودية", title, lead, path, crumbs: citySpecific ? [{ name: "السيو المحلي في الرياض", path }] : [{ name: "السيو المحلي", path }], aside: `<span class="service-hero-icon">${icon("pin")}</span><strong>${citySpecific ? "الرياض سوق واسع ومنافسة تختلف حسب الخدمة والحي ونموذج النشاط." : "الموقع والملف التجاري والمحتوى والسمعة تعمل كمنظومة واحدة."}</strong><p>نبدأ من البيانات الفعلية ونية العميل، ثم نحدد الصفحات والإصلاحات والأولويات القابلة للقياس.</p>` })}
<section class="section-pad"><div class="container service-intro-grid"><div class="rich-copy reveal"><h2>${citySpecific ? "كيف نبني حضورًا محليًا أقوى في الرياض؟" : "ما الذي يجعل السيو المحلي مختلفًا؟"}</h2><p>${citySpecific ? "مدينة الرياض تضم كثافة عالية من الأنشطة ومناطق خدمة واسعة وسلوك بحث متنوع. لا يكفي ذكر أسماء الأحياء أو إنشاء صفحات متشابهة؛ يجب أن تعكس بنية الموقع الخدمات الفعلية، وتجيب عن أسئلة العميل، وتدعم الملف التجاري ببيانات متسقة ومحتوى مفيد." : "عندما يبحث العميل عن خدمة قريبة، يجمع محرك البحث بين معنى الخدمة والموقع والملاءمة والثقة وتجربة الصفحة والبيانات المتاحة عن النشاط. لذلك قد لا ينجح تحسين الملف وحده إذا كان الموقع ضعيفًا أو البيانات متناقضة أو المحتوى لا يجيب عن نية البحث."}</p><p>أبدأ بمراجعة الفهرسة والأداء والصفحات الحالية وملف Google والفئات والخدمات والروابط والمنصات الأخرى. ثم نبني خريطة موضوعات ومناطق ذات قيمة حقيقية، ونربطها بمؤشرات مثل المكالمات والنماذج والاتجاهات وجودة الاستفسارات.</p></div><aside class="service-quick-card reveal"><span>تدقيق البداية</span><h2>المصادر التي نراجعها</h2>${checkList(["الموقع والصفحات المفهرسة", "ملف Google التجاري والفئات والخدمات", "اتساق الاسم والهاتف والموقع", "المنافسون ونتائج البحث المحلية", "المحتوى والمراجعات والروابط", "المكالمات والنماذج وبيانات القياس"])}${button(`${site.whatsapp}?text=${encodeURIComponent(citySpecific ? "مرحبًا م. إسلام، أريد تحسين السيو المحلي لنشاطي في الرياض." : "مرحبًا م. إسلام، أريد تدقيق السيو المحلي لنشاطي.")}`, "اطلب تدقيقًا أوليًا", "", true)}</aside></div></section>
<section class="section-pad muted-section"><div class="container"><div class="section-heading reveal">${eyebrow("محاور العمل")}<h2>من الأساس التقني إلى الظهور والتحويل</h2></div><div class="scope-grid"><article class="scope-card reveal"><span>01</span>${icon("search")}<p>تدقيق الزحف والفهرسة والعناوين والسرعة وتجربة الجوال والروابط الداخلية.</p></article><article class="scope-card reveal"><span>02</span>${icon("pin")}<p>مراجعة أهلية ملف Google والفئات والخدمات ونطاق الخدمة والبيانات.</p></article><article class="scope-card reveal"><span>03</span>${icon("layers")}<p>خريطة صفحات وخدمات وموضوعات محلية تمنع التكرار والتنافس الداخلي.</p></article><article class="scope-card reveal"><span>04</span>${icon("globe")}<p>اتساق الاسم والهاتف والعنوان أو نطاق الخدمة عبر المنصات والمصادر المهمة.</p></article><article class="scope-card reveal"><span>05</span>${icon("quote")}<p>استراتيجية سمعة ومراجعات ومحتوى يجيب عن اعتراضات العميل الحقيقية.</p></article><article class="scope-card reveal"><span>06</span>${icon("chart")}<p>قياس الظهور والنقرات والمكالمات والنماذج وجودة الفرص حسب الخدمة والمنطقة.</p></article></div></div></section>
<section class="section-pad"><div class="container split-heading"><div class="section-heading reveal">${eyebrow("الخطة العملية")}<h2>أولويات تُنفذ على مراحل بدل قائمة إصلاحات بلا ترتيب</h2><p>نرتب العمل حسب أثره واحتمال نجاحه واعتمادياته، ونفصل بين إصلاح مشكلة أساسية وفرصة نمو طويلة المدى.</p></div><div class="deliverables-panel reveal">${checkList(["تقرير تدقيق مع المشكلات والأدلة والأولوية", "خريطة كلمات وموضوعات وخدمات ومناطق", "تحسين صفحات الخدمة والميتا والروابط والبيانات المنظمة", "خطة ملف Google والاتساق والمحتوى والمراجعات", "لوحة مؤشرات للظهور والتحويل وجودة الاستفسارات"] , "deliverables-list")}</div></div></section>
${citySpecific ? `<section class="section-pad muted-section"><div class="container"><div class="section-heading reveal">${eyebrow("خدمة مدينة الرياض")}<h2>تغطية محلية دون حشو أسماء الأحياء</h2><p>يمكن ذكر أحياء ومناطق الرياض عندما تضيف معنى حقيقيًا للتغطية أو الخدمة، مع تجنب إنشاء صفحات متطابقة. من المناطق الشائعة التي قد تدخل ضمن تحليل الطلب: شمال الرياض، وسط الرياض، شرق الرياض، غرب الرياض، جنوب الرياض، وأحياء مثل الملقا والياسمين والنرجس وحطين والعقيق والصحافة وقرطبة والروابي، حسب نطاق النشاط الحقيقي.</p></div><div class="neighborhood-cloud" aria-label="مناطق وأحياء الرياض"><span>شمال الرياض</span><span>الملقا</span><span>الياسمين</span><span>النرجس</span><span>حطين</span><span>العقيق</span><span>الصحافة</span><span>قرطبة</span><span>شرق الرياض</span><span>وسط الرياض</span><span>غرب الرياض</span><span>جنوب الرياض</span></div></div></section>` : ""}
<section class="section-pad"><div class="container local-paths"><article class="reveal"><span>للأنشطة ذات الموقع</span><h3>متجر أو مكتب يستقبل العملاء</h3><p>نراجع أهلية العنوان والواجهة والساعات والفئات والصفحات المحلية والاتساق والاتجاهات.</p></article><article class="reveal"><span>لأنشطة نطاق الخدمة</span><h3>خدمة تصل إلى العميل</h3><p>نضبط إخفاء العنوان ونطاق الخدمة والمحتوى الذي يوضح التغطية دون إنشاء مواقع وهمية.</p></article><article class="reveal"><span>للشركات متعددة الفروع</span><h3>فروع حقيقية وتجارب محلية</h3><p>نبني صفحات وملفات وصلاحيات ومحتوى متمايزًا لكل فرع حقيقي، مع تقليل التكرار وتوضيح علاقة كل موقع بالخدمات التي يقدمها.</p></article></div></section>
<section class="section-pad faq-section"><div class="container faq-grid"><div class="faq-intro reveal">${eyebrow("أسئلة السيو المحلي")}<h2>قرارات تمنع التكرار والوعود غير الواقعية</h2><p>الظهور المحلي نتيجة تراكمية تعتمد على السوق وحالة الموقع والملف وسرعة التنفيذ.</p>${button("/services/seo/", "استعرض خدمة تحسين محركات البحث", "button-ghost")}</div>${faqBlock(faq)}</div></section>
${finalCta(citySpecific ? "هل تريد تحسين ظهور نشاطك داخل الرياض؟" : "هل تريد بناء حضور محلي أقوى في السعودية؟", "أرسل رابط الموقع وملف Google والمدينة والخدمات المستهدفة، وسنحدد أين تضيع الفرص وما الأولويات الأكثر تأثيرًا.")}`;
  const schema = [{ "@type": "Service", name: title, serviceType: "Local SEO", provider: { "@id": `${site.url}/#professional-service` }, areaServed: citySpecific ? { "@type": "City", name: "الرياض" } : { "@type": "Country", name: site.country }, description: lead }, faqSchema(faq), breadcrumbSchema([{ name: "الرئيسية", path: "/" }, { name: citySpecific ? "السيو المحلي في الرياض" : "السيو المحلي", path }])];
  return page({ title: seoTitle, description: lead, path, active: "services", body, schema });
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
  const topicSlug = topicDefinitions[post.topic] ? post.topic : "web-development";
  const topic = topicDefinitions[topicSlug];
  const topicPath = `/blog/topics/${topicSlug}/`;
  const faq = completeFaqs(post);
  const publishedDate = new Intl.DateTimeFormat("ar-SA", { dateStyle: "long" }).format(new Date(`${post.date}T12:00:00Z`));
  const modifiedDate = new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium" }).format(new Date(`${post.modified}T12:00:00Z`));
  const keywords = (post.keywords || []).slice(0, 6);
  const roadmapCopy = [
    (heading) => `اجمع البيانات والقيود المرتبطة بمحور «${heading}»، وسجّل الوضع الحالي قبل تنفيذ أي تغيير.`,
    (heading) => `حوّل متطلبات «${heading}» إلى قرارات ومسؤوليات ومعيار قبول واضح يمكن مراجعته.`,
    (heading) => `طبّق ما يخص «${heading}» على نطاق محدود، واختبر النتيجة وحالات الفشل قبل التوسع.`,
    (heading) => `راقب أثر «${heading}» بالمؤشر المناسب، ووثّق النتيجة والقرار التالي وموعد المراجعة.`
  ];
  const roadmap = (post.roadmap || post.sections.slice(0, 4).map(([heading], index) => ({
    title: heading,
    text: roadmapCopy[index](heading)
  })));
  const deliverableCopy = [
    (heading) => `خط أساس موثق لمحور «${heading}» يوضح الوضع والمعلومات الناقصة`,
    (heading) => `قائمة قرارات ومسؤوليات ومعايير قبول تخص «${heading}»`,
    (heading) => `نتائج اختبار وأدلة مراجعة مرتبطة بمحور «${heading}»`,
    (heading) => `مؤشر متابعة وقرار تحسين واضح لمحور «${heading}»`
  ];
  const deliverables = post.deliverables || post.sections.slice(-4).map(([heading], index) => deliverableCopy[index](heading));
  const firstFocus = post.sections[0]?.[0] || post.category;
  const finalFocus = post.sections.at(-1)?.[0] || post.category;
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
  const body = `${innerHero({ eyebrowText: post.category, title: esc(post.title), lead: post.excerpt, path, crumbs: [{ name: "المدونة", path: "/blog/" }, { name: topic.title, path: topicPath }, { name: post.title, path }], aside: `<div class="article-meta-card"><span>دليل مهني محدث</span><strong>${esc(post.readTime)}</strong><p>نُشر في ${publishedDate}</p><p>آخر مراجعة: ${modifiedDate}</p></div>`, className: "article-hero" })}
<div class="container article-hero-keywords" aria-label="الكلمات والموضوعات الرئيسية">${keywords.map((keyword) => `<span>${esc(keyword)}</span>`).join("")}</div>
<section class="section-pad article-section"><div class="container article-layout"><article class="article-content reveal"><p class="article-intro">${esc(post.description)}</p>
${post.sections.map(([heading, ...paragraphs], index) => `<section id="section-${index + 1}"><span class="article-number">${String(index + 1).padStart(2, "0")}</span><h2>${esc(heading)}</h2>${paragraphs.map((paragraph) => `<p>${esc(paragraph)}</p>`).join("")}</section>`).join("")}
<section id="implementation-roadmap" class="article-roadmap-section"><span class="article-number">${String(post.sections.length + 1).padStart(2, "0")}</span><h2>خطة تطبيق الدليل على مشروع حقيقي</h2><p>يتحول موضوع «${esc(post.title)}» إلى عمل قابل للمراجعة عندما يُنفذ على مراحل قصيرة، ولكل مرحلة مالك ودليل نجاح وحد واضح للتوقف أو التصعيد.</p><ol class="article-roadmap">${roadmap.map((step, index) => `<li><span>${String(index + 1).padStart(2, "0")}</span><div><h3>${esc(step.title)}</h3><p>${esc(step.text)}</p></div></li>`).join("")}</ol></section>
<section id="expected-deliverables" class="article-deliverables-section"><span class="article-number">${String(post.sections.length + 2).padStart(2, "0")}</span><h2>المخرجات التي تثبت اكتمال العمل</h2><p>المخرج الجيد في «${esc(keywords[0] || post.category)}» يوضح ما تم تنفيذه، والدليل الذي يراجعه الفريق، والمؤشر الذي يحدد نجاح الخطوة أو حاجتها إلى تعديل.</p><ul class="article-deliverables">${deliverables.map((item) => `<li>${icon("check")}<span>${esc(item)}</span></li>`).join("")}</ul></section>
<section id="article-summary" class="article-conclusion"><span class="article-number">${String(post.sections.length + 3).padStart(2, "0")}</span><h2>الخلاصة التنفيذية: ${esc(keywords[0] || post.category)}</h2><p>ابدأ بمحور «${esc(firstFocus)}» لتثبيت الأساس، ثم انتقل عبر الخطوات القابلة للاختبار حتى تصل إلى «${esc(finalFocus)}». سجّل خط الأساس والقرار والنتيجة في كل مرحلة حتى تعرف ما الذي نجح وما الذي يحتاج تعديلًا.</p></section></article>
<aside class="article-sidebar"><section class="article-author-card reveal" aria-labelledby="article-author-name"><div class="article-author-head"><img class="article-author-photo" src="${profilePhoto}" width="128" height="128" alt="المهندس إسلام الشيخ" loading="lazy" decoding="async"><div><span>كتبه وراجعه</span><h2 id="article-author-name">${esc(site.nameAr)}</h2><p>مهندس أمن سيبراني · مطور برمجيات · متخصص خرائط Google</p></div></div><dl><div><dt>تاريخ النشر</dt><dd><time datetime="${post.date}">${publishedDate}</time></dd></div><div><dt>آخر تحديث</dt><dd><time datetime="${post.modified}">${modifiedDate}</time></dd></div></dl><div class="article-author-keywords" aria-label="أهم كلمات المقال">${keywords.slice(0, 4).map((keyword) => `<span>${esc(keyword)}</span>`).join("")}</div><a class="text-link" href="/about/">تعرف على الكاتب ${icon("arrow")}</a></section>
<div class="toc-card reveal"><span>محتويات الدليل</span><nav aria-label="محتويات المقال">${contents.map((item, index) => `<a href="#${item.id}"><span>${String(index + 1).padStart(2, "0")}</span>${esc(item.title)}</a>`).join("")}</nav></div>
<div class="related-service-card reveal"><span>المسار المعرفي</span><div>${icon(topic.icon)}<h2>${esc(topic.title)}</h2></div><p>${esc(topic.description)}</p>${button(topicPath, "استكشف المسار كاملًا", "button-ghost")}</div>
<div class="related-service-card reveal"><span>الخدمة المرتبطة</span><div>${icon(service?.icon || "briefcase")}<h2>${esc(service?.title || "الخدمات التقنية")}</h2></div><p>${esc(service?.short || site.positioning)}</p>${button(service ? `/services/${service.slug}/` : "/services/", "استكشف نطاق الخدمة", "button-ghost")}</div></aside></div></section>
<section class="section-pad muted-section article-faq-section" id="article-faq"><div class="container article-faq-grid"><div class="article-faq-intro reveal">${eyebrow("الأسئلة الشائعة")}<h2>إجابات مرتبطة مباشرة بموضوع الدليل</h2><p>أسئلة مختارة من أكثر ما يسبق القرار في هذا الموضوع، بإجابات محددة دون تكرار أسئلة عامة بين المقالات.</p><div class="faq-count" aria-label="عدد الأسئلة"><strong>${faq.length}</strong><span>أسئلة وإجابات متخصصة</span></div></div>${faqBlock(faq)}</div></section>
<section class="section-pad related-articles-section"><div class="container"><div class="section-heading reveal">${eyebrow("أدلة مرتبطة")}<h2>واصل بناء الصورة الكاملة</h2><p>موضوعات منتقاة تكمل هذا الدليل من زاوية الخدمة أو الأمان أو الظهور والقياس.</p></div><div class="posts-grid">${relatedPosts.map((item) => postCard(item)).join("")}</div></div></section>
${finalCta("هل تريد تطبيق هذا الإطار على مشروعك؟", "أرسل الحالة الحالية والهدف والبيانات المتاحة، وسنحدد خطوة أولى صغيرة وواضحة وقابلة للقياس.")}`;
  return page({ title: post.seoTitle, description: post.description, path, active: "blog", body, type: "article", published: post.date, modified: post.modified, keywords, articleSection: post.category, schema: [faqSchema(faq), breadcrumbSchema([{ name: "الرئيسية", path: "/" }, { name: "المدونة", path: "/blog/" }, { name: topic.title, path: topicPath }, { name: post.title, path }])] });
}

const topicDefinitions = {
  "google-business-profile": { title: "ملفات Google التجارية", description: "مقالات عملية حول إنشاء ملفات Google التجارية والتحقق والتعليق والأهلية والملكية والبيانات وربط الملف بالموقع والظهور المحلي.", icon: "pin", services: ["google-business-profile", "google-support", "seo"] },
  "local-seo-saudi": { title: "السيو المحلي في السعودية", description: "أدلة عملية لربط الموقع بملف Google والمحتوى المحلي واتساق البيانات والسمعة والروابط الداخلية وقياس المكالمات والطلبات في السعودية.", icon: "search", services: ["seo", "google-business-profile", "web-development"] },
  cybersecurity: { title: "الأمن السيبراني", description: "محتوى عملي حول تقييم المخاطر وحماية المواقع والحسابات والبنية السحابية والصلاحيات والاستجابة للحوادث والمسؤولية في الاختبارات الأمنية.", icon: "shield", services: ["cybersecurity", "cloud-solutions", "web-development"] },
  "ai-agents": { title: "وكلاء الذكاء الاصطناعي", description: "أدلة لبناء وكلاء ومساعدين يعتمدون على معرفة الشركة وأدوات محدودة، مع الصلاحيات والتقييم والأمان والرقابة البشرية وقياس أثر التشغيل.", icon: "spark", services: ["ai-agents", "knowledge-bases", "cloud-solutions"] },
  "web-development": { title: "تطوير المواقع والتطبيقات", description: "مقالات حول تصميم المواقع المتجاوبة وتجربة الجوال والأداء والأمان والسيو والبيانات المنظمة وقياس التحويل وبناء منتجات قابلة للصيانة.", icon: "code", services: ["web-development", "cybersecurity", "seo"] }
};

function topicPage(slug) {
  const topic = topicDefinitions[slug];
  const matchingPosts = allPosts.filter((post) => post.topic === slug || (slug === "local-seo-saudi" && post.topic === "google-business-profile"));
  const relatedServices = topic.services.map(serviceBySlug).filter(Boolean);
  const path = `/blog/topics/${slug}/`;
  const body = `${innerHero({ eyebrowText: "مسار معرفي", title: esc(topic.title), lead: topic.description, path, crumbs: [{ name: "المدونة", path: "/blog/" }, { name: topic.title, path }], aside: `<span class="service-hero-icon">${icon(topic.icon)}</span><strong>أدلة متخصصة مرتبطة بالتنفيذ</strong><p>روابط مباشرة للمقالات والخدمات التي تساعد على تحويل المعرفة إلى خطة عمل.</p>` })}
<section class="section-pad"><div class="container"><div class="section-heading reveal">${eyebrow("المقالات")}<h2>أدلة مرتبطة بموضوع ${esc(topic.title)}</h2></div>${matchingPosts.length ? `<div class="posts-grid">${matchingPosts.map(postCard).join("")}</div>` : `<div class="empty-state"><h2>يتم تطوير هذا المسار</h2><p>يمكنك البدء بالخدمات المرتبطة أو قراءة بقية المقالات.</p></div>`}</div></section>
<section class="section-pad muted-section"><div class="container"><div class="section-heading reveal">${eyebrow("الخدمات المرتبطة")}<h2>حوّل المعرفة إلى خطة تنفيذ</h2></div><div class="services-grid related-services">${relatedServices.map(serviceCard).join("")}</div></div></section>
${slug === "local-seo-saudi" ? `<section class="section-pad"><div class="container case-method reveal"><div><span>دليل محلي</span><h2>السيو المحلي في الرياض والسعودية</h2></div><p>استكشف منهجًا يربط الموقع بملف Google والصفحات المحلية والمحتوى والاتساق والقياس دون حشو أو صفحات متكررة.</p>${button("/local-seo/riyadh/", "خدمات السيو المحلي في الرياض")}</div></section>` : ""}
${finalCta("لديك حالة تحتاج تطبيقًا عمليًا؟", "أرسل تفاصيل المشروع والروابط والنتيجة المطلوبة لنحدد النطاق والخطوات المناسبة.")}`;
  return page({ title: topic.title, description: topic.description, path, active: "blog", body, schema: [breadcrumbSchema([{ name: "الرئيسية", path: "/" }, { name: "المدونة", path: "/blog/" }, { name: topic.title, path }])] });
}

function googleGrowthTeaser(language = "ar") {
  const isEnglish = language === "en";
  const items = isEnglish ? [
    ["search", "Free 60-second profile audit", "Check the public foundations, receive a readiness score, and identify three priorities.", "/en/google-business-profile-audit/", "Run the audit"],
    ["pin", "Google Local Proof Engine", "Explore public work as independent case evidence—not branches or entities owned by Eslam.", "/en/google-maps-projects/", "Explore the proof map"],
    ["clock", "Book a focused consultation", "Request a Google profile, website, SEO, security, or AI session with a structured brief.", "/en/book/", "Request a time"]
  ] : [
    ["search", "فحص ملف Google خلال 60 ثانية", "افحص الأساس العام، واحصل على درجة جاهزية وثلاث أولويات قابلة للتنفيذ.", "/google-business-profile-audit/", "ابدأ الفحص المجاني"],
    ["pin", "Google Local Proof Engine", "تصفح الأعمال العامة كدليل مستقل، لا كفروع أو كيانات تجارية تابعة لإسلام.", "/google-maps-projects/", "افتح خريطة الإثبات"],
    ["clock", "حجز استشارة مركزة", "اطلب موعدًا لملف Google أو موقع أو SEO أو أمان أو ذكاء اصطناعي بملخص واضح.", "/book/", "اطلب موعدًا"]
  ];
  return `<section class="section-pad muted-section growth-teaser"><div class="container"><div class="section-heading reveal">${eyebrow(isEnglish ? "Google Local Proof Engine" : "محرك الإثبات المحلي")}<h2>${isEnglish ? "Turn public evidence into diagnosis, trust, and a clear next step" : "حوّل الدليل العام إلى تشخيص وثقة وخطوة تالية واضحة"}</h2><p>${isEnglish ? "Three connected tools make the public portfolio useful to the visitor and measurable for the business." : "ثلاث أدوات مترابطة تجعل سجل الأعمال مفيدًا للزائر وقابلًا للقياس للنشاط."}</p></div><div class="result-grid">${items.map(([mark, title, copy, href, label]) => `<article class="result-card reveal">${icon(mark)}<h3>${esc(title)}</h3><p>${esc(copy)}</p><a class="text-link" href="${href}">${esc(label)} ${icon("arrow")}</a></article>`).join("")}</div></div></section>`;
}

function googleBusinessAuditPage() {
  const path = "/google-business-profile-audit/";
  const faq = [
    ["هل هذه الدرجة هي ترتيب Google؟", "لا. هي درجة جاهزية أولية مبنية على اكتمال إشارات عامة محددة، وليست توقعًا للترتيب أو ضمانًا للظهور."],
    ["هل تحفظ الأداة اسم النشاط أو الرابط؟", "لا. يعمل الفحص بالكامل داخل متصفحك ولا يرسل الاسم أو الرابط أو إجابات القائمة إلى خادم الموقع أو Google. عند اختيار WhatsApp تراجع الرسالة بنفسك قبل إرسالها."],
    ["هل يفحص الموقع تقنيًا؟", "يعتمد هذا الفحص على المؤشرات التي تؤكدها من الملف العام. فحص السرعة والجوال والفهرسة يحتاج زحفًا منفصلًا ويُراجع في التشخيص الاحترافي."],
    ["هل يمكن استخدام رابط Google Maps؟", "نعم، استخدم الرابط العام كمرجع ثم راجع المؤشرات الثمانية بنفسك. الأداة لا تفتح الرابط أو تجمع بيانات منه تلقائيًا."]
  ];
  const auditService = {
    "@type": "Service",
    "@id": `${absolute(path)}#service`,
    name: "فحص أولي مجاني لملف Google التجاري",
    description: "فحص إرشادي محلي لاكتمال أساسيات الملف التجاري مع درجة جاهزية وأولويات، دون اتصال بواجهة Google أو وعد بترتيب أو قرار منها.",
    provider: { "@id": `${site.url}/#professional-service` },
    areaServed: { "@type": "Country", name: site.country },
    offers: { "@type": "Offer", price: "0", priceCurrency: "SAR", availability: "https://schema.org/OnlineOnly", url: absolute(path) }
  };
  const manualChecks = [
    ["name", 5, "اسم النشاط مطابق للاستخدام الحقيقي", "اسم النشاط ظاهر"],
    ["address", 15, "العنوان أو نطاق الخدمة يعكس التشغيل الفعلي", "عنوان أو نطاق خدمة ظاهر"],
    ["category", 10, "الفئة الأساسية تصف الخدمة الأهم", "الفئة الأساسية ظاهرة"],
    ["phone", 15, "رقم هاتف مباشر ومتسق", "رقم الهاتف ظاهر"],
    ["website", 15, "موقع HTTPS مرتبط بالملف", "رابط الموقع موجود"],
    ["hours", 15, "ساعات الحضور الفعلية منشورة", "ساعات العمل منشورة"],
    ["reviews", 15, "خمس مراجعات حقيقية أو أكثر ومتوسط 4+", "حد أدنى أولي من الثقة بالمراجعات"],
    ["photos", 10, "ثلاث صور أصلية حديثة أو أكثر", "صور عامة متاحة"]
  ];
  const body = `${innerHero({ eyebrowText: "أداة مجانية لأصحاب الأنشطة", title: "فحص ملف Google التجاري خلال 60 ثانية", lead: "اكتب اسم نشاطك أو رابط Google Maps كمرجع، ثم راجع ثمانية مؤشرات ظاهرة في ملفك. تحصل فورًا على درجة شفافة من 100 وثلاث أولويات — بلا مفتاح API أو فوترة أو إرسال بيانات إلى Google.", path, crumbs: [{ name: "فحص ملف Google", path }], aside: `<span class="aside-kicker">Google Business Profile Audit</span><strong>يعمل محليًا داخل متصفحك</strong><p>لا تطلب الأداة الدخول إلى حسابك، ولا تتصل بواجهة Google، ولا تدّعي أنها تتنبأ بالترتيب أو قرار التحقق.</p>` })}
<section class="section-pad growth-shell"><div class="container growth-grid"><div class="growth-panel reveal" data-gbp-audit role="form" aria-labelledby="audit-title"><h2 id="audit-title">ابدأ الفحص المجاني</h2><p>اكتب الاسم كما يظهر على Google مع المدينة، أو الصق رابط الملف العام كمرجع. يمكنك إضافة موقعك ورقمك المتوقعين لمراجعة اتساق NAP.</p><div class="audit-fields"><label><span>اسم النشاط والمدينة أو رابط Google Maps</span><input type="text" maxlength="220" autocomplete="organization" placeholder="مثال: اسم النشاط، الرياض" data-audit-query required></label><div class="audit-optional"><label><span>موقعك المتوقع — اختياري</span><input type="url" maxlength="240" inputmode="url" autocomplete="url" placeholder="https://example.com" data-audit-website></label><label><span>هاتفك المتوقع — اختياري</span><input type="tel" maxlength="30" inputmode="tel" autocomplete="tel" placeholder="05xxxxxxxx" data-audit-phone></label></div><div class="audit-action-row"><button class="button" type="button" data-audit-submit>افتح قائمة الفحص ${icon("search", "button-icon")}</button><span>كل المدخلات تبقى داخل جهازك.</span></div><p class="audit-status" role="status" aria-live="polite" data-audit-status></p></div><div class="manual-audit" data-manual-audit hidden><h2>راجع ملفك العام بنفسك</h2><p>حدد فقط ما تستطيع تأكيده الآن من Google Maps. لا تُرسل الاختيارات إلى الخادم أو Google.</p><div class="manual-checks">${manualChecks.map(([name, weight, label, dataLabel]) => `<label><input type="checkbox" name="${name}" value="${weight}" data-label="${esc(dataLabel)}"><span>${esc(label)} <strong dir="ltr">+${weight}</strong></span></label>`).join("")}</div><button class="button button-ghost" type="button" data-manual-calculate>احسب الدرجة والإجراءات</button></div><section class="audit-result" data-audit-results hidden><div class="audit-result-head"><div class="audit-score"><strong data-score>0</strong><span>من 100</span></div><div><span class="eyebrow"><span></span><b data-score-label>النتيجة</b></span><h2 data-result-name></h2><p data-result-meta></p><p data-result-rating></p></div></div><div class="audit-result-grid"><div class="audit-result-card"><h3>ما أكدته في الفحص</h3><ul class="audit-checks" data-audit-checks></ul></div><div class="audit-result-card"><h3>أول ثلاث أولويات</h3><ol class="audit-priorities" data-audit-priorities></ol></div></div><div class="audit-result-actions"><a class="button" href="${site.whatsapp}" target="_blank" rel="noopener" data-audit-whatsapp>أرسل النتيجة للمراجعة ${icon("whatsapp", "button-icon")}</a><a class="button button-ghost" href="#" target="_blank" rel="noopener" data-result-maps hidden>فتح الملف العام ${icon("external", "button-icon")}</a></div></section></div><aside class="growth-panel reveal"><h2>ماذا تقيس الدرجة؟</h2>${checkList(["وضوح الاسم والفئة والموقع الجغرافي", "الهاتف والموقع وساعات الحضور", "حد أولي من المراجعات والصور العامة", "اتساق الهاتف والنطاق عند إدخالهما"])}<div class="growth-note">${icon("shield")}<p><strong>حدود الفحص:</strong> الدرجة مبنية على إجاباتك ولا ترى لوحة الإدارة أو حالة التحقق أو التعديلات المعلقة أو المنافسين. هي تشخيص أولي وليست اعتمادًا من Google.</p></div><div class="section-action">${button("/book/", "احجز مراجعة احترافية", "button-ghost")}${button("/local-visibility-dashboard/", "افتح لوحة القياس الخاصة", "button-ghost")}</div></aside></div></section>
<section class="section-pad muted-section"><div class="container faq-grid"><div class="faq-intro reveal">${eyebrow("قبل استخدام النتيجة")}<h2>درجة مفهومة وليست صندوقًا أسود</h2><p>كل نقطة مرتبطة بإشارة عامة تستطيع مراجعتها. أي قرار حساس مثل تغيير الاسم أو العنوان أو الفئة يبدأ من واقع النشاط وسياسات Google.</p></div>${faqBlock(faq)}</div></section>`;
  return page({ title: "فحص ملف Google التجاري مجانًا خلال 60 ثانية", description: "افحص ملف Google التجاري مجانًا داخل جهازك: قائمة شفافة، درجة جاهزية من 100، وثلاث أولويات لتحسين الملف بلا API أو فوترة.", path, active: "google", body, stylesheets: [`/assets/css/google-growth.css?v=${version}`], pageScripts: [`/assets/js/google-audit.js?v=${version}`], keywords: ["فحص ملف جوجل التجاري", "تحليل خرائط جوجل", "Google Business Profile audit", "تحسين ملف جوجل"], schema: [auditService, faqSchema(faq), breadcrumbSchema([{ name: "الرئيسية", path: "/" }, { name: "فحص ملف Google", path }])] });
}

function bookingPage() {
  const path = "/book/";
  const service = { "@type": "Service", "@id": `${absolute(path)}#service`, name: "استشارة Google أو تطوير موقع", provider: { "@id": `${site.url}/#professional-service` }, areaServed: { "@type": "Country", name: site.country }, availableChannel: [{ "@type": "ServiceChannel", serviceUrl: absolute(path), availableLanguage: ["ar", "en"] }] };
  const body = `${innerHero({ eyebrowText: "موعد منظم قبل بدء العمل", title: "احجز استشارة Google أو تطوير موقع", lead: "اختر نوع الاستشارة وطريقة اللقاء والوقت المفضل، ثم راجع الطلب داخل WhatsApp قبل إرساله. استقبال الطلبات يعمل 24/7؛ الزيارة إلى المكتب تكون بعد تأكيد الموعد.", path, crumbs: [{ name: "احجز استشارة", path }], aside: `<span class="aside-kicker">Consultation Request</span><strong>طلب موعد، وليس تأكيدًا تلقائيًا</strong><p>سأراجع الهدف والوقت المقترح وأؤكد الموعد أو أقترح بديلًا مناسبًا.</p>` })}
<section class="section-pad"><div class="container booking-layout"><div class="growth-panel reveal" data-booking-builder role="form" aria-labelledby="booking-title"><h2 id="booking-title">جهّز طلب الموعد</h2><p>لا ترسل كلمة مرور أو رمز تحقق أو مفتاح API. يكفي رابط عام ووصف مختصر للحالة.</p><div class="booking-fields"><label><span>الاسم أو المنشأة *</span><input type="text" name="name" maxlength="80" autocomplete="name" required></label><div class="booking-pair"><label><span>نوع الاستشارة *</span><select name="consultation" required><option value="">اختر</option><option>ملف Google التجاري والسيو المحلي</option><option>تصميم أو تطوير موقع</option><option>الأمن السيبراني</option><option>وكيل ذكاء اصطناعي وأتمتة</option><option>استشارة تقنية متعددة المسارات</option></select></label><label><span>طريقة اللقاء *</span><select name="channel" required><option value="">اختر</option><option>مكالمة هاتفية</option><option>اجتماع فيديو</option><option>زيارة المكتب بعد التأكيد</option></select></label></div><div class="booking-pair"><label><span>اليوم المفضل *</span><input type="date" name="date" required></label><label><span>الوقت المفضل *</span><input type="time" name="time" required></label></div><label><span>رابط الموقع أو الملف العام — اختياري</span><input type="url" name="url" maxlength="300" inputmode="url" placeholder="https://"></label><label><span>ملخص الهدف والحالة — اختياري</span><textarea name="details" maxlength="1000" rows="5" placeholder="ما المشكلة أو النتيجة التي تريدها؟"></textarea></label><div class="form-message" role="status" aria-live="polite" data-booking-status></div><button class="button" type="button" data-booking-submit>راجع الطلب في WhatsApp ${icon("whatsapp", "button-icon")}</button></div></div><aside class="booking-aside"><article class="reveal"><span>01 · قبل الموعد</span><h2>رابط عام وهدف واحد</h2><p>يساعدان على تحويل اللقاء من أسئلة تمهيدية إلى تشخيص مفيد.</p></article><article class="reveal"><span>02 · الزيارة</span><h2>المصيف، الرياض</h2><p>${esc(site.streetAddress)}، الرياض ${site.postalCode}. الزيارة بعد تأكيد الموعد.</p></article><article class="reveal"><span>03 · التوافر</span><h2>استقبال رقمي 24/7</h2><p>المساعد الرقمي يستقبل الطلب في أي وقت؛ الموعد البشري أو الزيارة يُؤكدان قبل الحضور.</p></article><div class="growth-note">${icon("shield")}<p>الطلب يُجهز داخل متصفحك ويُفتح في WhatsApp للمراجعة. لا توجد عملية دفع أو حجز ملزم داخل الموقع.</p></div></aside></div></section>`;
  return page({ title: "احجز استشارة Google أو تطوير موقع", description: "اطلب موعد استشارة مع المهندس إسلام الشيخ لملف Google التجاري أو السيو المحلي أو تطوير المواقع أو الأمن السيبراني أو حلول الذكاء الاصطناعي.", path, body, stylesheets: [`/assets/css/google-growth.css?v=${version}`], pageScripts: [`/assets/js/booking.js?v=${version}`], schema: [service, breadcrumbSchema([{ name: "الرئيسية", path: "/" }, { name: "احجز استشارة", path }])] });
}

function localDashboardPage(language = "ar") {
  const isEnglish = language === "en";
  const path = isEnglish ? "/en/local-visibility-dashboard/" : "/local-visibility-dashboard/";
  const sources = isEnglish ? [
    ["gbp", "Google Business Profile", "Export performance data as CSV."],
    ["search", "Search Console", "Export query or page performance as CSV."],
    ["ga4", "Google Analytics 4", "Export sessions and key events as CSV."],
    ["leads", "Calls, WhatsApp, bookings", "Use a CSV with calls, whatsapp, bookings, or leads columns."]
  ] : [
    ["gbp", "Google Business Profile", "صدّر بيانات الأداء بصيغة CSV."],
    ["search", "Search Console", "صدّر أداء الاستعلامات أو الصفحات بصيغة CSV."],
    ["ga4", "Google Analytics 4", "صدّر الجلسات والأحداث الرئيسية بصيغة CSV."],
    ["leads", "المكالمات وواتساب والحجوزات", "استخدم CSV بأعمدة calls أو whatsapp أو bookings أو leads."]
  ];
  const metrics = isEnglish ? [
    ["gbp.views", "Profile views"], ["gbp.interactions", "Profile interactions"], ["search.clicks", "Search clicks"], ["search.impressions", "Search impressions"],
    ["ga4.sessions", "Website sessions"], ["ga4.users", "Website users"], ["ga4.conversions", "Key events"], ["leads.leads", "Recorded leads"]
  ] : [
    ["gbp.views", "مشاهدات الملف"], ["gbp.interactions", "تفاعلات الملف"], ["search.clicks", "نقرات البحث"], ["search.impressions", "مرات الظهور في البحث"],
    ["ga4.sessions", "جلسات الموقع"], ["ga4.users", "مستخدمو الموقع"], ["ga4.conversions", "الأحداث الرئيسية"], ["leads.leads", "العملاء المحتملون المسجلون"]
  ];
  const body = `${innerHero({ eyebrowText: isEnglish ? "Private local intelligence" : "لوحة ذكاء محلية خاصة", title: isEnglish ? "Combine Google visibility and lead data without uploading the files" : "اجمع ظهور Google والعملاء المحتملين دون رفع الملفات", lead: isEnglish ? "Import exported CSV reports. Parsing and aggregation happen in your browser, and the dashboard does not send the file contents to this website." : "استورد تقارير CSV التي تصدرها من المنصات. القراءة والتجميع يحدثان داخل متصفحك، ولا ترسل اللوحة محتوى الملفات إلى الموقع.", path, language: isEnglish ? "en" : "ar", crumbs: [{ name: isEnglish ? "Local visibility dashboard" : "لوحة الظهور المحلي", path }], aside: `<span class="aside-kicker">Browser-only Dashboard</span><strong>${isEnglish ? "Your performance data remains on this device" : "بيانات الأداء تبقى على جهازك"}</strong><p>${isEnglish ? "Nothing is stored after you close or refresh the page unless you export the summary yourself." : "لا تُحفظ البيانات بعد إغلاق الصفحة أو تحديثها إلا إذا صدّرت الملخص بنفسك."}</p>` })}
<section class="section-pad"><div class="container" data-local-dashboard><div class="dashboard-privacy reveal">${icon("shield")}<div><h2>${isEnglish ? "Local processing by design" : "خصوصية بالتخطيط"}</h2><p>${isEnglish ? "CSV contents are read with browser APIs only. Imported names, queries, and rows are not sent to analytics or the server." : "تُقرأ ملفات CSV بواجهات المتصفح فقط. لا تُرسل الأسماء أو عبارات البحث أو الصفوف إلى التحليلات أو الخادم."}</p></div></div><div class="dashboard-imports">${sources.map(([key, title, copy]) => `<article class="dashboard-import reveal"><span>${esc(key.toUpperCase())}</span><h2>${esc(title)}</h2><small>${esc(copy)}</small><label>${isEnglish ? "Choose CSV" : "اختر ملف CSV"}<input type="file" accept=".csv,text/csv" data-dashboard-file="${key}"></label><small data-file-status="${key}">${isEnglish ? "No file loaded" : "لم يُحمّل ملف"}</small></article>`).join("")}</div><div class="dashboard-metrics">${metrics.map(([key, label]) => `<article class="dashboard-metric"><span>${esc(label)}</span><strong data-metric="${key}">—</strong></article>`).join("")}</div><p class="dashboard-state" data-dashboard-empty>${isEnglish ? "Import one or more reports to build the local summary." : "استورد تقريرًا واحدًا أو أكثر لبناء الملخص المحلي."}</p><p class="dashboard-state" data-dashboard-ready hidden>${isEnglish ? "The visible totals were calculated locally. Confirm the report date ranges before comparing channels." : "حُسبت المجاميع الظاهرة محليًا. تأكد من توحيد نطاقات التاريخ قبل مقارنة القنوات."}</p><div class="dashboard-actions"><button class="button button-ghost" type="button" data-dashboard-export disabled>${isEnglish ? "Export summary JSON" : "تصدير ملخص JSON"}</button><a class="button" href="${isEnglish ? "/en/book/" : "/book/"}">${isEnglish ? "Book a measurement review" : "احجز مراجعة قياس"} ${icon("arrow", "button-icon")}</a></div></div></section>`;
  return page({ title: isEnglish ? "Private Local Visibility Dashboard" : "لوحة الظهور المحلي الخاصة", description: isEnglish ? "A browser-only dashboard for combining exported Google Business Profile, Search Console, GA4, and lead CSV reports." : "لوحة خاصة داخل المتصفح تجمع تقارير Google Business Profile وSearch Console وGA4 والعملاء المحتملين دون رفع الملفات.", path, body, lang: isEnglish ? "en" : "ar", robots: "noindex, nofollow", stylesheets: [`/assets/css/google-growth.css?v=${version}`], pageScripts: [`/assets/js/google-dashboard.js?v=${version}`], schema: [breadcrumbSchema([{ name: isEnglish ? "Home" : "الرئيسية", path: isEnglish ? "/en/" : "/" }, { name: isEnglish ? "Local visibility dashboard" : "لوحة الظهور المحلي", path }])] });
}

function englishGoogleBusinessAuditPage() {
  const path = "/en/google-business-profile-audit/";
  const body = `${innerHero({ eyebrowText: "Free Google Business Profile tool", title: "Run an initial profile readiness audit", lead: "The Arabic guided tool reviews eight visible profile signals and prepares three priorities. It runs in your browser without a Places API key, billing account, or automated Google lookup.", path, language: "en", crumbs: [{ name: "Google Business Profile audit", path }], aside: `<span class="aside-kicker">60-second audit</span><strong>No passwords, API key, or account access</strong><p>The score is a transparent self-check, not a ranking forecast or a Google decision.</p>` })}<section class="section-pad"><div class="container growth-grid"><div class="growth-panel reveal"><h2>Use the free guided audit</h2><p>Enter the business name and city or keep a public Google Maps URL as your reference. The Arabic tool also accepts your expected website and phone for a basic consistency check; entries stay in the browser.</p>${button("/google-business-profile-audit/", "Open the guided audit")}</div><aside class="growth-panel reveal"><h2>What it covers</h2>${checkList(["Public identity, category, location, and contact fields", "Published hours, review baseline, and public photos", "Optional website and phone consistency", "Three clear priorities and a WhatsApp review handoff"])}<div class="growth-note">${icon("shield")}<p>The tool does not access Google, the management console, verification state, pending edits, or competitors. A professional review is still needed before sensitive changes.</p></div></aside></div></section>`;
  return page({ title: "Free Google Business Profile Audit", description: "Run a free browser-only Google Business Profile readiness self-check and identify three practical priorities without API billing.", path, active: "google", body, lang: "en", stylesheets: [`/assets/css/google-growth.css?v=${version}`], schema: [breadcrumbSchema([{ name: "Home", path: "/en/" }, { name: "Google Business Profile audit", path }])] });
}

function englishBookingPage() {
  const path = "/en/book/";
  const body = `${innerHero({ eyebrowText: "Structured consultation request", title: "Book a Google, website, security, or AI consultation", lead: "Choose the consultation type, meeting channel, and preferred time. Review the request inside WhatsApp before sending. Digital enquiries are accepted 24/7; office visits require confirmation.", path, language: "en", crumbs: [{ name: "Book a consultation", path }], aside: `<span class="aside-kicker">Consultation Request</span><strong>A request, not an automatic confirmation</strong><p>The proposed time and objective are reviewed before the appointment is confirmed.</p>` })}<section class="section-pad"><div class="container booking-layout"><div class="growth-panel reveal" data-booking-builder role="form" aria-labelledby="booking-title-en"><h2 id="booking-title-en">Prepare the request</h2><p>Do not include passwords, one-time codes, API keys, or sensitive customer data.</p><div class="booking-fields"><label><span>Name or company *</span><input type="text" name="name" maxlength="80" autocomplete="name" required></label><div class="booking-pair"><label><span>Consultation *</span><select name="consultation" required><option value="">Choose</option><option>Google Business Profile and local SEO</option><option>Website design or development</option><option>Cybersecurity</option><option>AI agent and automation</option><option>Cross-disciplinary technical consultation</option></select></label><label><span>Meeting channel *</span><select name="channel" required><option value="">Choose</option><option>Phone call</option><option>Video meeting</option><option>Office visit after confirmation</option></select></label></div><div class="booking-pair"><label><span>Preferred date *</span><input type="date" name="date" required></label><label><span>Preferred time *</span><input type="time" name="time" required></label></div><label><span>Public website or profile — optional</span><input type="url" name="url" maxlength="300" inputmode="url" placeholder="https://"></label><label><span>Objective and current state — optional</span><textarea name="details" maxlength="1000" rows="5"></textarea></label><div class="form-message" role="status" aria-live="polite" data-booking-status></div><button class="button" type="button" data-booking-submit>Review in WhatsApp ${icon("whatsapp", "button-icon")}</button></div></div><aside class="booking-aside"><article><span>OFFICE</span><h2>Al Masif, Riyadh</h2><p>${esc(site.streetAddress)}, Riyadh ${site.postalCode}. Visits are available after confirmation.</p></article><article><span>AVAILABILITY</span><h2>Digital intake 24/7</h2><p>The digital assistant can receive the request at any time; the human meeting or visit is confirmed separately.</p></article></aside></div></section>`;
  return page({ title: "Book a Consultation with Eslam Elshikh", description: "Request a consultation with Eslam Elshikh for Google Business Profile, web development, cybersecurity, SEO, or AI automation.", path, body, lang: "en", stylesheets: [`/assets/css/google-growth.css?v=${version}`], pageScripts: [`/assets/js/booking.js?v=${version}`], schema: [breadcrumbSchema([{ name: "Home", path: "/en/" }, { name: "Book a consultation", path }])] });
}

function contactPage() {
  const body = `${innerHero({ eyebrowText: "ابدأ التواصل", title: "لنحدد الخطوة المناسبة لمشروعك", lead: "اختر طريقة التواصل، أو جهّز رسالة قصيرة بالخدمة والهدف. نراجع احتياجك ثم نحدد النطاق والمخرجات والمدة والتكلفة.", path: "/contact/", crumbs: [{ name: "تواصل", path: "/contact/" }], aside: `<span class="aside-kicker">Response Ready</span><strong>ابدأ عبر WhatsApp أو الاتصال أو البريد</strong><p>لا ترسل كلمات مرور أو رموز تحقق أو مفاتيح API أو بيانات حساسة في الرسالة الأولى.</p>` })}
<section class="section-pad"><div class="container contact-grid"><div class="contact-options"><a class="contact-card reveal" href="${site.whatsapp}?text=${encodeURIComponent("مرحبًا م. إسلام، أرغب في مناقشة مشروع تقني.")}" target="_blank" rel="noopener"><span class="contact-icon contact-whatsapp">${icon("whatsapp")}</span><div><small>الأسرع لبدء التشخيص</small><h2>WhatsApp</h2><p dir="ltr">${site.phoneDisplay}</p></div>${icon("external")}</a><a class="contact-card reveal" href="tel:${site.phone}"><span class="contact-icon contact-call">${icon("phone")}</span><div><small>اتصال مباشر</small><h2>الهاتف</h2><p dir="ltr">${site.phoneDisplay}</p></div>${icon("arrow")}</a><a class="contact-card reveal" href="mailto:${site.email}"><span class="contact-icon contact-mail">${icon("mail")}</span><div><small>للتفاصيل والمرفقات</small><h2>البريد الإلكتروني</h2><p dir="ltr">${site.email}</p></div>${icon("arrow")}</a><div class="contact-note reveal"><span>${icon("shield")}</span><div><h2>حماية معلوماتك</h2><p>أرسل وصفًا عامًا وروابط عامة في البداية. تُحدد قناة آمنة عند الحاجة إلى معلومات حساسة أو وصول تقني.</p></div></div></div>
<div class="project-form reveal" data-project-form role="form" aria-labelledby="project-form-title" id="project-brief"><div class="form-head"><span>نموذج تجهيز رسالة المشروع</span><h2 id="project-form-title">كوّن رسالة WhatsApp منظمة</h2><p>اكتب تفاصيل مشروعك، ثم راجع الرسالة داخل WhatsApp قبل إرسالها. يمكنك أيضًا استخدام روابط الاتصال المباشر أعلاه.</p></div><label><span>الاسم أو اسم الشركة</span><input type="text" name="name" autocomplete="name" maxlength="80" required placeholder="مثال: شركة ..."></label><label><span>الخدمة الأقرب</span><select name="service" required><option value="">اختر الخدمة</option>${services.map((service) => `<option value="${service.slug}">${esc(service.title)}</option>`).join("")}<option value="consultation">استشارة متعددة التخصصات</option></select></label><label><span>رابط الموقع أو الملف — اختياري</span><input type="url" name="url" inputmode="url" autocomplete="url" maxlength="300" placeholder="https://"></label><label><span>الهدف والوضع الحالي</span><textarea name="details" rows="6" maxlength="1500" required placeholder="اشرح المشكلة، ما الذي تريد تحقيقه، وما الذي جربته حتى الآن..."></textarea><small><span data-character-count>0</span> / 1500</small></label><label><span>الموعد المتوقع — اختياري</span><input type="text" name="timeline" maxlength="120" placeholder="مثال: خلال شهر أو قبل إطلاق محدد"></label><div class="form-message" role="status" aria-live="polite" data-form-message></div><button class="button" type="button" data-project-submit>فتح الرسالة في WhatsApp ${icon("whatsapp", "button-icon")}</button></div></div></section>
<section class="section-pad muted-section"><div class="container"><div class="section-heading reveal">${eyebrow("ماذا ترسل؟")}<h2>أربع نقاط تختصر وقت التشخيص</h2></div><div class="audience-grid"><article class="audience-card reveal"><span>01</span><h3>الهدف</h3><p>ما النتيجة التي تريد الوصول إليها، ولماذا هي مهمة الآن؟</p></article><article class="audience-card reveal"><span>02</span><h3>الوضع الحالي</h3><p>الروابط والأنظمة والمشكلة والتأثير وما الذي يعمل وما الذي لا يعمل.</p></article><article class="audience-card reveal"><span>03</span><h3>المحاولات السابقة</h3><p>التعديلات أو الأدوات أو طلبات الدعم التي تمت ونتيجتها.</p></article><article class="audience-card reveal"><span>04</span><h3>القيود</h3><p>الموعد والميزانية التقريبية والفريق والاعتماديات أو الموافقات.</p></article></div></div></section>`;
  return page({ title: "تواصل مع المهندس إسلام الشيخ", description: "تواصل مع المهندس إسلام الشيخ لمناقشة الأمن السيبراني وتطوير المواقع ووكلاء الذكاء الاصطناعي وخدمات Google والسيو والحلول السحابية في السعودية.", path: "/contact/", body, schema: [breadcrumbSchema([{ name: "الرئيسية", path: "/" }, { name: "تواصل", path: "/contact/" }])] });
}

function privacyPage() {
  const body = `${innerHero({ eyebrowText: "الخصوصية", title: "سياسة الخصوصية", lead: "توضح هذه الصفحة نوع البيانات التي قد تُعالج عند استخدام الموقع أو التواصل، وكيف يتم التعامل معها بصورة مسؤولة.", path: "/privacy/", crumbs: [{ name: "سياسة الخصوصية", path: "/privacy/" }] })}
<section class="section-pad legal-section"><div class="container legal-content"><section><h2>1. المسؤول عن معالجة البيانات والغرض</h2><p>يدير المهندس إسلام الشيخ هذا الموقع للتعريف بالخدمات، استقبال طلبات التواصل، حماية الخدمة، وفهم أداء الصفحات بعد موافقة الزائر على التحليلات. يمكن التواصل بخصوص الخصوصية عبر <a href="mailto:${site.email}">${site.email}</a>.</p></section><section><h2>2. البيانات التي تقدمها عند التواصل</h2><p>لا يطلب الموقع إنشاء حساب. قد تقدم اسمك أو اسم منشأتك أو بريدك أو رقمك أو رابطًا عامًا أو تفاصيل مشروعك عند التواصل عبر الهاتف أو البريد أو WhatsApp. تُستخدم هذه المعلومات للرد على طلبك، تشخيص الاحتياج، وإدارة العلاقة أو المشروع عند الاتفاق. لا ترسل كلمات مرور أو رموز تحقق أو مفاتيح API أو بيانات حساسة في الرسالة الأولى.</p></section><section><h2>3. مُنشئا رسائل التواصل والحجز</h2><p>أداتا التواصل والحجز تعملان داخل متصفحك لتجهيز نص، ثم تفتحان WhatsApp لمراجعته قبل الإرسال. لا تُرسل الحقول إلى خادم الموقع، ولا يعني تجهيز الرسالة أنها أُرسلت أو أن الموعد تأكد.</p></section><section><h2>4. أداة فحص ملف Google</h2><p>عند تشغيل البحث المباشر، يُرسل اسم النشاط أو رابط Google Maps العام الذي أدخلته إلى خادم الموقع ثم إلى Google Places للحصول على بيانات النشاط العامة. لا تطلب الأداة الدخول إلى حسابك، ولا تحفظ الاستعلام في قاعدة بيانات. وضع الفحص الإرشادي يعمل داخل جهازك. يمكن أن تحتوي سجلات الحماية المؤقتة لدى Vercel على بيانات طلب تقنية مثل عنوان IP والمسار والتوقيت، دون استخدام نص الاستعلام للتسويق.</p></section><section><h2>5. لوحة الظهور المحلي</h2><p>ملفات CSV التي تختارها في لوحة القياس تُقرأ وتُجمع داخل متصفحك فقط، ولا تُرفع إلى خادم الموقع أو Google Analytics. تُمحى الحالة الظاهرة عند تحديث الصفحة، ويمكنك تنزيل ملخص JSON إلى جهازك باختيارك.</p></section><section><h2>6. السجلات التقنية والاستضافة</h2><p>قد تعالج منصة الاستضافة Vercel معلومات تقنية لازمة لتقديم الموقع وحمايته، مثل عنوان IP ونوع المتصفح والمسار ووقت الطلب وسجلات الأمان. يكون الغرض تشغيل الموقع، منع إساءة الاستخدام، تشخيص الأعطال، والمحافظة على أمن الخدمة.</p></section><section><h2>7. التحليلات وملفات الارتباط</h2><p>يستخدم الموقع Google Analytics 4 بالمعرّف G-MDJ2HGF9E1 فقط بعد اختيار «السماح بالتحليلات». تشمل الأحداث نقرات التواصل وبدء أو اكتمال أدوات الفحص والحجز والتفاعل مع خريطة الإثبات، مع نوع الخدمة وموضع الأداة فقط. لا تُرسل أسماء الأنشطة أو العملاء أو نصوص الرسائل أو الروابط المدخلة أو محتوى CSV ضمن أحداث التحليلات. يمكنك رفض التحليلات أو سحب الموافقة دون تعطيل الوظائف الأساسية.</p><button class="button button-ghost privacy-preferences" type="button" data-analytics-preferences>تغيير تفضيلات التحليلات</button><p>يستخدم الموقع التخزين المحلي لحفظ اختيار الوضع الفاتح أو الداكن وقرار الموافقة؛ وهما إعدادان وظيفيان على جهازك.</p></section><section><h2>8. الجهات الخارجية ونقل البيانات</h2><p>قد تنتقل بيانات إلى Vercel للاستضافة والحماية، Google Analytics بعد موافقتك، Google Maps عند تحميل الخريطة، Google Places عند طلب الفحص المباشر، وWhatsApp أو البريد عندما تبدأ التواصل. تخضع كل جهة لسياستها وبنيتها وضوابطها.</p></section><section><h2>9. الأساس والاحتفاظ والأمان</h2><p>تُعالج مراسلاتك للرد على طلبك واتخاذ خطوات نحو اتفاق لاحق، وتعتمد التحليلات على موافقتك. لا تُباع بيانات الزوار. تُحفظ المراسلات بالقدر اللازم للتنفيذ أو التوثيق النظامي، وتُطبق ضوابط معقولة مع الإقرار بعدم وجود وسيلة إلكترونية تضمن أمانًا مطلقًا.</p></section><section><h2>10. حقوقك والتحديثات</h2><p>وفق الأنظمة السارية، يمكنك طلب الوصول أو التصحيح أو الإتلاف عندما تنطبق الشروط، وسحب موافقتك على التحليلات في أي وقت. أرسل الطلب إلى <a href="mailto:${site.email}">${site.email}</a>. قد تُحدّث السياسة عند تغيير الأدوات أو أغراض المعالجة.</p></section><p class="legal-updated">آخر تحديث: 12 سبتمبر 2026</p></div></section>`;
  const privacySafeBody = body
    .replace("عند تشغيل البحث المباشر، يُرسل اسم النشاط أو رابط Google Maps العام الذي أدخلته إلى خادم الموقع ثم إلى Google Places للحصول على بيانات النشاط العامة. لا تطلب الأداة الدخول إلى حسابك، ولا تحفظ الاستعلام في قاعدة بيانات. وضع الفحص الإرشادي يعمل داخل جهازك. يمكن أن تحتوي سجلات الحماية المؤقتة لدى Vercel على بيانات طلب تقنية مثل عنوان IP والمسار والتوقيت، دون استخدام نص الاستعلام للتسويق.", "تعمل أداة الفحص الإرشادي داخل متصفحك فقط. لا يُرسل اسم النشاط أو رابط Google Maps أو الموقع أو الهاتف أو اختيارات قائمة الفحص إلى خادم الموقع أو Google. لا تطلب الأداة الدخول إلى حسابك، وتُنشأ رسالة WhatsApp داخل جهازك لتراجعها قبل الإرسال.")
    .replace("Google Maps عند تحميل الخريطة، Google Places عند طلب الفحص المباشر، وWhatsApp أو البريد عندما تبدأ التواصل", "Google Maps عند تحميل الخريطة، وWhatsApp أو البريد عندما تبدأ التواصل");
  return page({ title: "سياسة الخصوصية", description: "سياسة خصوصية موقع المهندس إسلام الشيخ وتوضيح البيانات المستخدمة عند تصفح الموقع أو التواصل بخصوص الخدمات التقنية.", path: "/privacy/", body: privacySafeBody, schema: [breadcrumbSchema([{ name: "الرئيسية", path: "/" }, { name: "سياسة الخصوصية", path: "/privacy/" }])] });
}

function termsPage() {
  const body = `${innerHero({ eyebrowText: "الشروط", title: "شروط الاستخدام", lead: "باستخدام الموقع، تقر بأن المحتوى عام وإرشادي، وأن نطاق أي خدمة تجارية أو تقنية يُحدد باتفاق مستقل وواضح.", path: "/terms/", crumbs: [{ name: "شروط الاستخدام", path: "/terms/" }] })}
<section class="section-pad legal-section"><div class="container legal-content"><section><h2>1. طبيعة المحتوى</h2><p>المعلومات المنشورة للتعريف بالخدمات وتقديم معرفة عامة، ولا تشكل وحدها عقدًا أو ضمانًا أو استشارة قانونية أو قرارًا فنيًا نهائيًا لحالة لم تتم مراجعتها.</p></section><section><h2>2. نطاق الخدمات</h2><p>يُحدد نطاق كل مشروع ومخرجاته وجدوله واعتمادياته ومسؤوليات الأطراف في عرض أو اتفاق مستقل. أي أمثلة أو قوائم داخل الموقع توضح إمكانات عامة ولا تعني شمولها تلقائيًا في كل مشروع.</p></section><section><h2>3. الأدوات والجهات الخارجية</h2><p>درجات فحص الملف التجاري مؤشرات جاهزية أولية مبنية على بيانات عامة واختيارات المستخدم؛ وليست تقييمًا رسميًا من Google أو وعدًا بالترتيب. لا يمكن ضمان قرارات Google أو منصات الإعلان أو الاستضافة أو محركات البحث، ويبقى القرار النهائي لدى الجهة المختصة.</p></section><section><h2>4. الأمن والاستخدام المصرح</h2><p>لا يتم تنفيذ فحص أمني نشط دون تصريح ونطاق مكتوبين. يحظر استخدام محتوى الموقع أو وسائل التواصل لطلب نشاط غير مصرح أو ضار أو مخالف للأنظمة.</p></section><section><h2>5. الملكية الفكرية</h2><p>يعود محتوى الموقع وتصميمه وهوية المهندس إسلام الشيخ لأصحابها، ما لم يُذكر خلاف ذلك. لا يجوز نسخ المحتوى أو إعادة نشره تجاريًا بصورة كاملة دون إذن، ويُسمح بالاقتباس المحدود مع الإشارة إلى المصدر.</p></section><section><h2>6. التعديلات والتواصل</h2><p>قد تُحدّث الشروط لتواكب التغييرات في الموقع والخدمات. للاستفسار تواصل عبر <a href="mailto:${site.email}">${site.email}</a>.</p></section><p class="legal-updated">آخر تحديث: 12 سبتمبر 2026</p></div></section>`;
  return page({ title: "شروط الاستخدام", description: "شروط استخدام موقع المهندس إسلام الشيخ وحدود المحتوى والخدمات التقنية والاستشارية والأمنية وخدمات الجهات الخارجية.", path: "/terms/", body, schema: [breadcrumbSchema([{ name: "الرئيسية", path: "/" }, { name: "شروط الاستخدام", path: "/terms/" }])] });
}

function englishFinalCta(title = "Turn the next technical decision into a clear delivery plan", text = "Share the objective, current state, public links, constraints, and expected timing. You will receive a structured starting point without unnecessary scope.") {
  return `<section class="section-pad final-cta"><div class="container"><div class="cta-panel reveal"><div>${eyebrow("Start with the right diagnosis")}<h2>${esc(title)}</h2><p>${esc(text)}</p></div><div class="cta-actions">${button(`${site.whatsapp}?text=${encodeURIComponent("Hello Eng. Eslam, I would like to discuss a digital project.")}`, "Start on WhatsApp", "button-light", true)}<a class="cta-phone" href="mailto:${site.email}">${esc(site.email)}</a></div></div></div></section>`;
}

function englishServiceCard(service) {
  return `<article class="service-card reveal" data-service-group="${esc(service.group)}">
    <div class="service-card-top"><span class="service-number">${service.number}</span><span class="service-icon">${icon(service.icon)}</span></div>
    <p class="service-group">${esc(service.group)}</p>
    <h3><a href="/en/services/${service.slug}/">${esc(service.title)}</a></h3>
    <p>${esc(service.short)}</p>
    <a class="text-link" href="/en/services/${service.slug}/" aria-label="View ${esc(service.title)} service details">Explore this service ${icon("arrow")}</a>
  </article>`;
}

function englishServicesIndexPage() {
  const groups = [...new Set(englishServices.map((service) => service.group))];
  const path = "/en/services/";
  const body = `${innerHero({ eyebrowText: "Engineering & advisory services", title: "Specialist services for security, software, visibility, and growth", lead: "Choose a focused engagement or combine several disciplines into one delivery plan with clear scope, evidence, ownership, and measurable acceptance criteria.", path, language: "en", crumbs: [{ name: "Services", path }], aside: `<span class="aside-kicker">9 specialist tracks</span><strong>From diagnosis to launch and improvement</strong><p>Each service page explains the scope, deliverables, process, fit, and practical limits before you make contact.</p>` })}
<section class="section-pad"><div class="container"><div class="service-filters" role="group" aria-label="Filter services"><button type="button" aria-pressed="true" data-service-filter="all">All services</button>${groups.map((group) => `<button type="button" aria-pressed="false" data-service-filter="${esc(group)}">${esc(group)}</button>`).join("")}</div><div class="services-grid services-grid-index" data-services-grid>${englishServices.map(englishServiceCard).join("")}</div></div></section>
<section class="section-pad muted-section"><div class="container decision-grid"><div class="decision-copy reveal">${eyebrow("Choose the right starting point")}<h2>Begin with the problem and the outcome—not the tool name</h2><p>A slow website can be caused by architecture, hosting, images, or JavaScript. Weak search visibility may begin with indexing, content, the business profile, or measurement. A short diagnosis prevents investment in a solution that never reaches the root cause.</p></div><div class="decision-steps"><article class="reveal"><span>01</span><h3>Describe the current state</h3><p>Share the public link, the observed problem, its impact, and what has already been tried.</p></article><article class="reveal"><span>02</span><h3>Define the outcome</h3><p>Clarify whether success means safer operations, a launch, local discovery, or a faster workflow.</p></article><article class="reveal"><span>03</span><h3>Surface the constraints</h3><p>List timing, budget, team capacity, existing systems, approvals, and non-negotiable boundaries.</p></article><article class="reveal"><span>04</span><h3>Shape the engagement</h3><p>Choose an audit, complete delivery, staged improvement, or ongoing support based on evidence.</p></article></div></div></section>
${englishFinalCta("Not sure which service fits your situation?", "Send the problem, desired outcome, and available links. I will help identify the most logical starting point without adding work the project does not need.")}`;
  return page({ title: "Digital Engineering Services", description: "Explore Eslam Elshikh's services in cybersecurity, web development, AI agents, Google Business Profile, cloud architecture, SEO, and digital advertising.", path, active: "services", body, lang: "en", schema: [breadcrumbSchema([{ name: "Home", path: "/en/" }, { name: "Services", path }])] });
}

function englishServiceDetailPage(service) {
  const path = `/en/services/${service.slug}/`;
  const related = englishServices.filter((item) => item.slug !== service.slug && (item.group === service.group || ["web-development", "seo", "cybersecurity"].includes(item.slug))).slice(0, 3);
  const serviceSchema = {
    "@type": "Service",
    "@id": `${absolute(path)}#service`,
    name: service.title,
    serviceType: service.title,
    description: service.meta,
    url: absolute(path),
    provider: { "@id": `${site.url}/#professional-service` },
    areaServed: [{ "@type": "City", name: "Riyadh" }, { "@type": "Country", name: "Saudi Arabia" }],
    availableChannel: { "@type": "ServiceChannel", serviceUrl: absolute("/en/contact/"), availableLanguage: ["en", "ar"] },
    hasOfferCatalog: { "@type": "OfferCatalog", name: `${service.title} scope`, itemListElement: service.scope.map((item) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: item } })) }
  };
  const specializedLink = service.slug === "digital-advertising"
    ? `<section class="section-pad"><div class="container proof-panel reveal"><div class="proof-icon">${icon("megaphone")}</div><div><span>Dedicated Google Ads service</span><h2>Is paid search your immediate acquisition priority?</h2><p>Review the dedicated page for search campaign structure, search-term control, conversion tracking, budget decisions, and landing-page alignment.</p></div><div class="proof-actions">${button("/en/google-ads/", "Explore Google Ads")}</div></div></section>`
    : service.slug === "seo"
      ? `<section class="section-pad"><div class="container proof-panel reveal"><div class="proof-icon">${icon("pin")}</div><div><span>Dedicated Riyadh market page</span><h2>Do you need stronger discovery for customers searching in Riyadh?</h2><p>The local program connects the website, service pages, Google Business Profile, reputation, consistency, and qualified-enquiry measurement.</p></div><div class="proof-actions">${button("/en/local-seo/riyadh/", "Local SEO in Riyadh")}</div></div></section>`
      : "";
  const body = `${innerHero({ eyebrowText: service.group, title: esc(service.h1), lead: service.short, path, language: "en", crumbs: [{ name: "Services", path: "/en/services/" }, { name: service.title, path }], aside: `<span class="service-hero-number">${service.number}</span><span class="service-hero-icon">${icon(service.icon)}</span><strong>${esc(service.value)}</strong>` })}
<section class="section-pad service-intro-section"><div class="container service-intro-grid"><div class="rich-copy reveal">${service.intro.map((paragraph) => `<p>${esc(paragraph)}</p>`).join("")}</div><aside class="service-quick-card reveal"><span>Useful first brief</span><h2>Give the diagnosis enough context</h2>${checkList(["The business outcome or current problem", "Affected systems, accounts, or public links", "Operational or customer impact", "Expected timing and major constraints"])}${button(`${site.whatsapp}?text=${encodeURIComponent(`Hello Eng. Eslam, I would like to discuss ${service.title}.`)}`, "Discuss on WhatsApp", "", true)}</aside></div></section>
${specializedLink}
<section class="section-pad muted-section"><div class="container"><div class="section-heading reveal">${eyebrow("Service scope")}<h2>What the engagement can cover</h2><p>${esc(service.value)}</p></div><div class="scope-grid">${service.scope.map((item, index) => `<article class="scope-card reveal"><span>${String(index + 1).padStart(2, "0")}</span>${icon(service.icon)}<p>${esc(item)}</p></article>`).join("")}</div></div></section>
<section class="section-pad deliverables-section"><div class="container split-heading"><div class="section-heading reveal">${eyebrow("Reviewable deliverables")}<h2>Evidence your team can use after handover</h2><p>The exact format follows the project, but each output has an owner, purpose, and acceptance check.</p></div><div class="deliverables-panel reveal">${checkList(service.deliverables, "deliverables-list")}</div></div></section>
<section class="section-pad audience-section"><div class="container"><div class="section-heading reveal">${eyebrow("Who it is for")}<h2>Situations where this service creates the most value</h2></div><div class="audience-grid">${service.forWho.map((item, index) => `<article class="audience-card reveal"><span>${String(index + 1).padStart(2, "0")}</span><p>${esc(item)}</p></article>`).join("")}</div></div></section>
<section class="section-pad process-section"><div class="container"><div class="section-heading reveal">${eyebrow("Delivery process")}<h2>Four stages from context to a verified result</h2></div><ol class="process-list service-process">${service.steps.map((step, index) => `<li class="reveal"><span>${String(index + 1).padStart(2, "0")}</span><h3>${esc(step.title)}</h3><p>${esc(step.text)}</p></li>`).join("")}</ol></div></section>
<section class="section-pad faq-section"><div class="container faq-grid"><div class="faq-intro reveal">${eyebrow("Service questions")}<h2>Scope, risk, ownership, and expectations</h2>${button(`/en/contact/?service=${service.slug}#project-brief`, "Request a scoped discussion", "button-ghost")}</div>${faqBlock(service.faq)}</div></section>
<section class="section-pad related-section"><div class="container"><div class="section-heading reveal">${eyebrow("Connected capabilities")}<h2>Services that can strengthen the same outcome</h2></div><div class="services-grid related-services">${related.map(englishServiceCard).join("")}</div></div></section>
${englishFinalCta(`Need ${service.title} within a clearly bounded project?`, "Share the current state and desired outcome. We can define realistic scope, reviewable deliverables, dependencies, and a practical first release.")}`;
  return page({ title: service.seoTitle, description: service.meta, path, active: "services", body, lang: "en", keywords: service.keywords, schema: [serviceSchema, faqSchema(service.faq), breadcrumbSchema([{ name: "Home", path: "/en/" }, { name: "Services", path: "/en/services/" }, { name: service.title, path }])] });
}

function englishLocalSeoPage() {
  const path = "/en/local-seo/riyadh/";
  const faq = [
    ["Do I need a page for every Riyadh neighborhood?", "No. Create a location page only when it adds distinct, useful information. Thin neighborhood pages can dilute quality and compete with stronger service pages."],
    ["Can a service-area business rank without showing an address?", "An eligible service-area business can hide its address and use realistic areas. Visibility still varies with relevance, distance, prominence, competition, and context."],
    ["Can you guarantee a top local ranking?", "No. Local results vary by query, location, device, competition, and search-system decisions. The engagement guarantees scope, implementation, and measurement—not a fixed position."],
    ["How should we measure local SEO?", "Combine queries and landing pages with Business Profile actions, calls, WhatsApp, forms, directions, booked work, and lead quality by service where possible."]
  ];
  const lead = "Local SEO for Riyadh service businesses connecting the website, Google Business Profile, genuine coverage, reputation, content, and qualified enquiries.";
  const body = `${innerHero({ eyebrowText: "Local SEO for Riyadh", title: "Build local visibility around a real business—not a list of district names", lead, path, language: "en", crumbs: [{ name: "Local SEO in Riyadh", path }], aside: `<span class="service-hero-icon">${icon("pin")}</span><strong>Riyadh is a large, competitive market with different intent by service and location.</strong><p>The work starts with real demand, eligibility, and customer decisions, then prioritizes pages and fixes that can be measured.</p>` })}
<section class="section-pad"><div class="container service-intro-grid"><div class="rich-copy reveal"><h2>How a stronger local presence is built</h2><p>Local search combines service meaning, location, relevance, trust, website experience, business data, and real-world prominence. Improving the profile alone may not work when the website is thin, important pages are not indexed, or the business is represented inconsistently.</p><p>I review the website, indexed pages, Business Profile, categories, services, operating model, competitors, reputation, and conversion paths. The resulting roadmap separates urgent foundation work from longer-term opportunities across content, local authority, and measurement.</p></div><aside class="service-quick-card reveal"><span>Starting audit</span><h2>Evidence reviewed first</h2>${checkList(["Website and indexable service pages", "Business Profile eligibility, categories, and services", "Name, phone, location, and service-area consistency", "Local results and relevant competitors", "Content, reviews, links, and real-world proof", "Calls, messages, forms, and lead-quality data"])}${button(`${site.whatsapp}?text=${encodeURIComponent("Hello Eng. Eslam, I would like a local SEO review for my Riyadh business.")}`, "Request an initial review", "", true)}</aside></div></section>
<section class="section-pad muted-section"><div class="container"><div class="section-heading reveal">${eyebrow("Connected workstreams")}<h2>From technical access to discovery and conversion</h2></div><div class="scope-grid">${[
    ["search", "Crawlability, indexing, metadata, speed, mobile UX, and internal links"],
    ["pin", "Business Profile eligibility, categories, services, coverage, and ownership"],
    ["layers", "Service and topic architecture that prevents duplication and cannibalization"],
    ["globe", "Consistent business identity across important websites and platforms"],
    ["quote", "Genuine-review and content systems based on real customer questions"],
    ["chart", "Measurement for visibility, calls, messages, forms, and qualified demand"]
  ].map(([mark, copy], index) => `<article class="scope-card reveal"><span>${String(index + 1).padStart(2, "0")}</span>${icon(mark)}<p>${esc(copy)}</p></article>`).join("")}</div></div></section>
<section class="section-pad"><div class="container split-heading"><div class="section-heading reveal">${eyebrow("Practical roadmap")}<h2>Prioritized releases instead of an unranked audit dump</h2><p>Work is ordered by impact, likelihood, dependency, and the team's ability to implement. A foundational problem is treated differently from a long-term growth opportunity.</p></div><div class="deliverables-panel reveal">${checkList(["Evidence-backed audit with priority and ownership", "Service, topic, query, and location map", "Page, metadata, internal-link, and schema improvements", "Business Profile, consistency, content, and genuine-review plan", "Dashboard for visibility, actions, and enquiry quality"], "deliverables-list")}</div></div></section>
<section class="section-pad muted-section"><div class="container"><div class="section-heading reveal">${eyebrow("Riyadh market coverage")}<h2>Use neighborhood context only when it helps the customer</h2><p>North, central, east, west, and south Riyadh—and districts such as Al Malqa, Al Yasmin, An Narjis, Hittin, Al Aqiq, As Sahafah, Qurtubah, and Ar Rawabi—may matter when they reflect real coverage, travel, branches, or customer needs. They should not become interchangeable doorway pages.</p></div><div class="neighborhood-cloud" aria-label="Riyadh areas"><span>North Riyadh</span><span>Al Malqa</span><span>Al Yasmin</span><span>An Narjis</span><span>Hittin</span><span>Al Aqiq</span><span>As Sahafah</span><span>Qurtubah</span><span>East Riyadh</span><span>Central Riyadh</span><span>West Riyadh</span><span>South Riyadh</span></div></div></section>
<section class="section-pad"><div class="container local-paths"><article class="reveal"><span>Customer-facing locations</span><h3>Stores and offices that receive visitors</h3><p>Review address eligibility, frontage, hours, categories, local pages, consistency, and direction requests.</p></article><article class="reveal"><span>Service-area businesses</span><h3>Teams that travel to the customer</h3><p>Configure hidden addresses and realistic service areas while describing coverage without false locations.</p></article><article class="reveal"><span>Multi-location companies</span><h3>Real branches with distinct local journeys</h3><p>Give each eligible branch accurate ownership, content, and pages while managing duplication centrally.</p></article></div></section>
<section class="section-pad faq-section"><div class="container faq-grid"><div class="faq-intro reveal">${eyebrow("Local SEO questions")}<h2>Realistic decisions before implementation</h2><p>Local visibility is cumulative and depends on the market, current website and profile, eligibility, competition, and execution speed.</p>${button("/en/services/seo/", "Explore the full SEO service", "button-ghost")}</div>${faqBlock(faq)}</div></section>
${englishFinalCta("Want to improve qualified local discovery in Riyadh?", "Share the website, Business Profile, target services, and genuine service coverage. I will identify where visibility or conversion is being lost and what to address first.")}`;
  const schema = [{ "@type": "Service", name: "Local SEO in Riyadh", serviceType: "Local SEO", provider: { "@id": `${site.url}/#professional-service` }, areaServed: { "@type": "City", name: "Riyadh" }, description: lead }, faqSchema(faq), breadcrumbSchema([{ name: "Home", path: "/en/" }, { name: "Local SEO in Riyadh", path }])];
  return page({ title: "Local SEO Services in Riyadh", description: lead, path, active: "services", body, lang: "en", keywords: ["local SEO Riyadh", "Google Maps visibility", "service business SEO Saudi Arabia"], schema });
}

function englishAboutPage() {
  const path = "/en/about/";
  const body = `${innerHero({ eyebrowText: "About Eslam Elshikh", title: "Cybersecurity engineer, software developer, and digital problem-solver in Riyadh", lead: "I combine secure engineering, web and application development, practical AI, Google product experience, and search visibility to turn complex digital work into clear, reviewable outcomes.", path, language: "en", crumbs: [{ name: "About", path }], aside: `<div class="article-author-head"><img class="article-author-photo" src="${profilePhoto}" width="128" height="128" alt="Eslam Elshikh" loading="eager" decoding="async"><div><span>Based in Riyadh</span><strong>${esc(site.nameEn)}</strong><p>Saudi Arabia & remote collaboration</p></div></div>` })}
<section class="section-pad"><div class="container service-intro-grid"><div class="rich-copy reveal"><h2>I work across the boundaries where digital projects usually break</h2><p>A website can look polished and still be difficult to find, insecure to operate, or unclear to customers. An AI assistant can be impressive in a demo and unreliable inside a real workflow. A Business Profile can contain complete fields and still represent the business incorrectly. My work connects these disciplines so decisions remain coherent from diagnosis through launch.</p><p>I begin with the business outcome, the current system, the people who operate it, and the evidence available. Technology is selected after the problem is framed. The engagement is then divided into reviewable stages with explicit scope, dependencies, risk, acceptance criteria, and handover.</p><p>My public work includes live web projects and Google Maps examples across companies and service businesses. Public links demonstrate the existence and presentation of those projects; they do not imply invented revenue, traffic, or ranking results. Where outcome data is unavailable, I say so.</p></div><aside class="service-quick-card reveal"><span>Professional focus</span><h2>One accountable delivery perspective</h2>${checkList(["Cybersecurity and systems protection", "Websites, applications, and technical products", "AI agents, knowledge systems, and automation", "Google Business Profile and product support", "Technical, content, and local SEO", "Cloud architecture, analytics, and conversion"])}${button("/en/contact/", "Discuss a project")}</aside></div></section>
<section class="section-pad muted-section"><div class="container"><div class="section-heading reveal">${eyebrow("Working principles")}<h2>Good engineering makes the important decisions easier to see</h2><p>The work should remain understandable to the business, maintainable by the team, and testable after delivery.</p></div><div class="principles-grid"><article class="principle reveal"><span>01</span>${icon("target")}<h3>Outcome before tooling</h3><p>Define the decision, user, constraint, and evidence of success before choosing a platform.</p></article><article class="principle reveal"><span>02</span>${icon("shield")}<h3>Security by design</h3><p>Consider identities, permissions, data, recovery, and failure paths from the beginning.</p></article><article class="principle reveal"><span>03</span>${icon("user")}<h3>Built for real use</h3><p>Design for actual devices, content, operating capacity, accessibility, and edge cases.</p></article><article class="principle reveal"><span>04</span>${icon("chart")}<h3>Evidence over theatre</h3><p>Measure useful outcomes and state clearly where third-party or business results cannot be guaranteed.</p></article></div></div></section>
<section class="section-pad"><div class="container"><div class="section-heading reveal">${eyebrow("Education and professional foundation")}<h2>Formal study connected to applied delivery</h2><p>The professional profile combines an academic foundation in information security with advanced cybersecurity study and hands-on work across software, web products, search, and Google business tools.</p></div><div class="principles-grid"><article class="principle reveal"><span>01</span>${icon("shield")}<h3>Bachelor's degree in Information Security</h3><p>Faculty of Computers and Information · October 6 University.</p></article><article class="principle reveal"><span>02</span>${icon("shield")}<h3>Diploma in Cybersecurity</h3><p>Arab Open University · Riyadh.</p></article><article class="principle reveal"><span>03</span>${icon("code")}<h3>Applied software engineering</h3><p>Live websites, applications, interface systems, technical SEO, and maintainable delivery workflows.</p></article><article class="principle reveal"><span>04</span>${icon("google")}<h3>Google Maps specialist</h3><p>Practical experience with Business Profiles, verification, ownership, policy-aware correction, and local visibility.</p></article></div></div></section>
<section class="section-pad"><div class="container case-method reveal"><div><span>Identity across languages</span><h2>Eslam Elshikh · إسلام الشيخ</h2></div><p>The professional English name used across the website and public profiles is “Eslam Elshikh”. Arabic references such as “إسلام الشيخ” and “المهندس إسلام الشيخ” refer to the same person and official digital identity.</p><div class="hero-actions">${button(site.social.wikidata, "View Wikidata", "button-ghost", true)}${button(site.social.github, "View GitHub", "button-ghost", true)}</div></div></section>
<section class="section-pad muted-section"><div class="container"><div class="section-heading reveal">${eyebrow("Public evidence")}<h2>Work you can open and review</h2><p>Explore selected case studies, the verified live web-project archive, and public Google Maps examples.</p></div><div class="stats-bar reveal"><div><strong>${projectAudit.verifiedLiveProjects}</strong><span>verified live web projects</span></div><div><strong>${mapsProjects.length}</strong><span>public Google Maps examples</span></div><div><strong>${projectAudit.githubRepositories}</strong><span>GitHub repositories reviewed</span></div><div><strong>${projectAudit.vercelProjects}</strong><span>Vercel projects reviewed</span></div></div><div class="section-action">${button("/en/projects/", "Explore the work")}</div></div></section>
${englishFinalCta("Have a project that crosses several disciplines?", "Share the business objective and the current technical situation. We can separate the problem into a practical sequence without losing the connections between security, experience, visibility, and operations.")}`;
  const profileSchema = { "@type": "ProfilePage", "@id": `${absolute(path)}#profile`, url: absolute(path), name: "Professional profile of Eslam Elshikh", mainEntity: { "@id": `${site.url}/#person` }, inLanguage: "en", dateModified: `${site.lastUpdated}T00:00:00+03:00`, relatedLink: projects.filter((item) => item.slug && item.caseStudy).map((item) => absolute(`/en/projects/${item.slug}/`)) };
  return page({ title: "About Eslam Elshikh | Cybersecurity & Software Engineer", description: "Meet Eslam Elshikh, a Riyadh-based cybersecurity engineer and software developer working across websites, AI agents, Google products, cloud systems, and SEO.", path, active: "about", body, lang: "en", schema: [profileSchema, breadcrumbSchema([{ name: "Home", path: "/en/" }, { name: "About", path }])], preloadImage: profilePhoto });
}

function englishGoogleExpertPage() {
  const path = "/en/google-expert/";
  const faq = [
    ["What does a Google Maps and Business Profile specialist do?", "The work starts with eligibility, ownership, business model, data, website alignment, notices, and prior changes. It then identifies the safest correction, evidence, and official route for verification, recovery, appeal, or local improvement."],
    ["Are you employed by or representing Google?", "No. I provide independent consulting based on practical product experience and official processes. Google makes all final verification, reinstatement, product, and ranking decisions."],
    ["Can you guarantee profile approval or a top map position?", "No independent specialist can responsibly guarantee a platform decision or fixed ranking. I can provide structured diagnosis, evidence preparation, policy-aware corrections, and measurable local improvements."],
    ["What should I send for an initial diagnosis?", "Share the public profile link, exact notice, business model, non-sensitive timeline, and previous changes or support attempts. Never send passwords, one-time codes, recovery codes, or private keys."]
  ];
  const expertService = { "@type": "Service", "@id": `${absolute(path)}#service`, name: "Google Maps and Business Profile consulting", serviceType: ["Google Business Profile consulting", "Google Maps profile support", "Local visibility consulting"], url: absolute(path), description: "Independent consulting for Google Business Profile verification, suspension, ownership, data quality, and local visibility in Riyadh and Saudi Arabia.", provider: { "@id": `${site.url}/#person` }, areaServed: [{ "@type": "City", name: "Riyadh" }, { "@type": "Country", name: "Saudi Arabia" }] };
  const body = `${innerHero({ eyebrowText: "Google Maps specialist · Riyadh & Saudi Arabia", title: "Eslam Elshikh — Google Maps and Business Profile specialist", lead: "I help eligible businesses diagnose verification, suspension, ownership, category, and local visibility issues through policy-aware corrections, organized evidence, and the appropriate official route.", path, language: "en", crumbs: [{ name: "Google expertise", path }], aside: `<span class="google-mark">G</span><strong>Practical Google Maps experience</strong><p>Public contribution profiles and business examples can be reviewed directly, alongside clear limits on claims and platform decisions.</p>` })}
<section class="section-pad"><div class="container google-stats"><div class="google-stat reveal"><strong>472</strong><span>Business Profiles supported through verification</span></div><div class="google-stat reveal"><strong>233</strong><span>Profile issues handled and resolved</span></div><div class="google-stat reveal"><strong>${mapsProjects.length}</strong><span>Public business examples available to review</span></div><div class="google-stat reveal"><strong>Google</strong><span>Hands-on product and profile experience</span></div></div></section>
<section class="section-pad muted-section"><div class="container service-intro-grid"><div class="rich-copy reveal"><h2>Understand the case before changing the profile</h2><p>I first identify how the business serves customers: at a genuine staffed location, within a service area, or through an eligible hybrid model. I then review the name, categories, address or coverage, services, website, users, prior changes, and notices.</p><p>The diagnosis separates eligibility, identity, access, data, and policy problems. Corrections are made deliberately, evidence is matched to the point it proves, and the official verification, recovery, or reinstatement route is used without fragmenting the case through repeated random requests.</p>${button("/en/services/google-business-profile/", "Explore profile support")}</div><aside class="disclaimer-card professional-summary-card reveal"><span>Independent specialist</span><h2>Google experience connected to web and local search</h2><p>The profile does not operate in isolation. Website content, technical SEO, business identity, reputation, and conversion measurement are reviewed as one local discovery system.</p><a class="text-link" href="${site.social.googleDeveloper}" target="_blank" rel="noopener">Google Developer Profile ${icon("external")}</a><a class="text-link" href="${site.googleMapsProfile}" target="_blank" rel="noopener">Google Maps business profile ${icon("external")}</a></aside></div></section>
<section class="section-pad"><div class="container"><div class="section-heading reveal">${eyebrow("Cases I work on")}<h2>From eligibility and ownership to a healthier local presence</h2></div><div class="scope-grid">${[
    ["pin", "Set up an eligible profile that matches the real business model and customer contact."],
    ["shield", "Diagnose suspension, restriction, risky edits, ownership, and access history."],
    ["google", "Prepare video verification or supporting evidence in a clear proof sequence."],
    ["search", "Connect the profile to service pages, technical SEO, content, and measurement."],
    ["layers", "Review duplicates, branches, users, locations, and permission structures."],
    ["chart", "Analyze discovery, calls, directions, website actions, and enquiry quality."]
  ].map(([mark, copy], index) => `<article class="scope-card reveal"><span>${String(index + 1).padStart(2, "0")}</span>${icon(mark)}<p>${esc(copy)}</p></article>`).join("")}</div></div></section>
<section class="section-pad maps-section"><div class="container"><div class="section-heading reveal">${eyebrow("Public examples")}<h2>Business Profiles you can open on Google Maps</h2><p>A selection across industries and cities, with a separate archive containing the full public set.</p></div><div class="map-case-grid">${mapsProjects.filter((item) => item.featured).slice(0, 6).map((item, index) => englishFeaturedMapCard(item, index)).join("")}</div><div class="section-action">${button("/en/google-maps-projects/", `Explore ${mapsProjects.length} Google Maps examples`, "button-ghost")}</div></div></section>
<section class="section-pad faq-section"><div class="container faq-grid"><div class="faq-intro reveal">${eyebrow("Google profile questions")}<h2>Clear expectations before making another change</h2><p>Eligibility, accurate representation, and relevant evidence matter more than the number of edits or support requests.</p>${button(`${site.whatsapp}?text=${encodeURIComponent("Hello Eng. Eslam, I need help diagnosing a Google Business Profile issue.")}`, "Share the case", "button-ghost", true)}</div>${faqBlock(faq)}</div></section>
${englishFinalCta("Is your profile suspended, unverified, or inaccessible?", "Send the public link, exact notice, and a safe timeline of changes. I will help identify the right diagnosis before another edit or review request.")}`;
  return page({ title: "Google Maps & Business Profile Specialist | Eslam Elshikh", description: "Independent Google Maps and Business Profile specialist in Riyadh for verification, suspension, ownership, categories, evidence, website alignment, and local visibility.", path, active: "google", body, lang: "en", keywords: ["Google Maps specialist Riyadh", "Google Business Profile expert Saudi Arabia", "profile verification support"], schema: [expertService, faqSchema(faq), breadcrumbSchema([{ name: "Home", path: "/en/" }, { name: "Google expertise", path }])] });
}

function englishGoogleAdsPage() {
  const path = "/en/google-ads/";
  const faq = [
    ["Can you guarantee a specific number of leads?", "No. Demand, competition, offer, pricing, sales response, and platform auctions all influence results. The work guarantees a clear campaign structure, tested measurement, and evidence-based optimization."],
    ["Do I need a dedicated landing page?", "Often yes. A focused page can match search intent, explain the offer, present relevant proof, load quickly on mobile, and make the conversion action easier to measure."],
    ["How is the starting budget decided?", "It follows expected demand, click costs, service economics, conversion capacity, and the amount of data required for a useful test—not an arbitrary platform minimum."],
    ["Who should own the advertising account?", "The client should normally retain ownership and billing control. Access can be granted through the platform's proper manager and user permissions rather than shared passwords."]
  ];
  const body = `${innerHero({ eyebrowText: "Google Ads management", title: "Paid search built around qualified intent—not click volume", lead: "Campaign structure, search terms, landing pages, conversion tracking, and lead-quality feedback are designed as one system for businesses in Saudi Arabia.", path, language: "en", crumbs: [{ name: "Google Ads", path }], aside: `<span class="service-hero-icon">${icon("megaphone")}</span><strong>Campaign and landing page in one decision journey</strong><p>The promise in the keyword and ad continues through the page, contact action, and measurement model.</p>` })}
<section class="section-pad"><div class="container service-intro-grid"><div class="rich-copy reveal"><h2>Start with commercial intent and delivery capacity</h2><p>Before launching spend, I clarify the offer, target customer, service area, exclusions, unit economics, response process, and meaningful conversion. This reveals which searches deserve budget and which messages the business can support.</p><p>Campaigns are organized around tightly related intent with deliberate negative keywords. Landing pages are written and designed for the same decision, while calls, WhatsApp, forms, and qualified opportunities are measured separately so click volume does not disguise weak commercial outcomes.</p></div><aside class="service-quick-card reveal"><span>Campaign readiness</span><h2>What to prepare before launch</h2>${checkList(["Priority services, margins, and operating capacity", "Target cities, schedules, and genuine exclusions", "Existing account, campaign, and search-term history", "Current pages, offers, proof, and response process", "Conversion definitions and lead-quality feedback"])}${button(`${site.whatsapp}?text=${encodeURIComponent("Hello Eng. Eslam, I would like to discuss Google Ads and landing pages.")}`, "Discuss the campaign", "", true)}</aside></div></section>
<section class="section-pad muted-section"><div class="container"><div class="section-heading reveal">${eyebrow("Campaign system")}<h2>Five connected layers that can be reviewed and improved</h2></div><div class="scope-grid">${[
    ["target", "Intent, offer, audience, location, exclusions, and commercial hypothesis"],
    ["search", "Campaign, ad group, keyword, match type, and negative-keyword structure"],
    ["quote", "Original ads and extensions aligned with the actual landing-page promise"],
    ["code", "Fast, focused mobile landing pages with relevant proof and clear actions"],
    ["chart", "Tracking, search-term review, qualified-lead feedback, and budget decisions"],
    ["shield", "Account ownership, permissions, policy awareness, and safe handover"]
  ].map(([mark, copy], index) => `<article class="scope-card reveal"><span>${String(index + 1).padStart(2, "0")}</span>${icon(mark)}<p>${esc(copy)}</p></article>`).join("")}</div></div></section>
<section class="section-pad deliverables-section"><div class="container split-heading"><div class="section-heading reveal">${eyebrow("Delivery evidence")}<h2>What a campaign engagement should leave behind</h2><p>The account remains understandable: assumptions, structure, tracking, changes, and business outcomes can be reviewed without relying on a dashboard screenshot.</p></div><div class="deliverables-panel reveal">${checkList(["Campaign architecture and documented targeting assumptions", "Keyword, search-term, and negative-keyword framework", "Ad variants and conversion-focused landing page", "Verified call, WhatsApp, and form event definitions", "Reporting across spend, queries, actions, and lead quality", "Account ownership and handover notes"], "deliverables-list")}</div></div></section>
<section class="section-pad"><div class="container case-method reveal"><div><span>Landing-page alignment</span><h2>Advertising cannot repair an unclear offer</h2></div><p>If the ad promises one service and the page presents a broad company introduction, the visitor must solve the message gap. The page should confirm the search, explain the offer, reduce the relevant risk, and make the next step clear on mobile.</p>${button("/en/blog/landing-pages-google-ads/", "Read the landing-page guide", "button-ghost")}</div></section>
<section class="section-pad faq-section"><div class="container faq-grid"><div class="faq-intro reveal">${eyebrow("Google Ads questions")}<h2>Budgets, ownership, tracking, and realistic expectations</h2>${button("/en/services/digital-advertising/", "Explore digital advertising", "button-ghost")}</div>${faqBlock(faq)}</div></section>
${englishFinalCta("Want a paid-search plan you can actually audit?", "Share the offer, target market, current account or landing page, expected budget, and sales process. We can define a controlled first test and the evidence needed to improve it.")}`;
  const serviceSchema = { "@type": "Service", "@id": `${absolute(path)}#service`, name: "Google Ads management and landing pages", serviceType: "Google Ads management", url: absolute(path), description: "Google Ads campaign management and landing page delivery for Saudi businesses, with search intent, conversion measurement, and lead-quality review.", provider: { "@id": `${site.url}/#professional-service` }, areaServed: { "@type": "Country", name: "Saudi Arabia" } };
  return page({ title: "Google Ads Management & Landing Pages", description: "Google Ads management in Saudi Arabia with search-intent structure, negative keywords, conversion landing pages, tracking, and qualified-lead optimization.", path, active: "services", body, lang: "en", keywords: ["Google Ads management Saudi Arabia", "paid search Riyadh", "landing page design"], schema: [serviceSchema, faqSchema(faq), breadcrumbSchema([{ name: "Home", path: "/en/" }, { name: "Google Ads", path }])] });
}

const englishProjectCategory = (value) => ({
  "منصة شركة ومحتوى خدمات": "Corporate platform & service content",
  "هوية تقنية وموقع شركة ذكاء اصطناعي": "Technology identity & AI company website",
  "موقع طبي متعدد الصفحات": "Multi-page healthcare website",
  "عرض تنفيذي تفاعلي": "Interactive executive proposal",
  "موقع شركة خدمات في جدة": "Service company website in Jeddah",
  "موقع تجارة ومقاولات": "Trading and contracting website",
  "موقع خدمات تشطيب محلية": "Local finishing-services website",
  "منصة خدمات ديكور وخزائن": "Interior and cabinetry service platform",
  "موقع خدمات محلية": "Local service-business website",
  "صفحة هبوط تحويلية": "Conversion-focused landing page",
  "موقع خدمات منزلية": "Home-services website",
  "موقع نجارة وديكور محلي": "Local carpentry and interior website"
}[value] || "Digital web project");

const englishProjectDescription = (project) => englishProjectStudies[project.slug]?.description || ({
  "موقع شركة خدمات في جدة": "A responsive service-business website designed to explain the offer, build local confidence, and move mobile visitors toward a direct enquiry.",
  "موقع تجارة ومقاولات": "A focused corporate presence that organizes trading and contracting services into clear customer paths with accessible contact actions.",
  "موقع خدمات تشطيب محلية": "A local service experience structured around customer intent, visual proof, mobile usability, and fast call or WhatsApp access.",
  "منصة خدمات ديكور وخزائن": "A scalable content system for interior and cabinetry services, connecting detailed pages with local discovery and conversion paths.",
  "موقع خدمات محلية": "A search-ready local website that presents services, coverage, evidence, and direct customer contact without unnecessary complexity.",
  "صفحة هبوط تحويلية": "A concise landing experience built around one service decision, relevant trust signals, mobile speed, and measurable contact actions.",
  "موقع خدمات منزلية": "A mobile-first home-services website that makes urgent service choices and direct contact straightforward.",
  "موقع نجارة وديكور محلي": "A visual local-business website balancing craftsmanship, service detail, discovery, and conversion across devices."
}[project.category] || "A live digital project with a responsive interface, clear content hierarchy, and practical customer journeys.");

const officialProjectName = (project, customTitle) => {
  const title = customTitle || project.title;
  return /[\u0600-\u06ff]/.test(title) ? `<span lang="ar" dir="rtl">${esc(title)}</span>` : esc(title);
};

function englishProjectImage(project, { eager = false } = {}) {
  const title = englishProjectStudies[project.slug]?.title || project.title;
  return `<img src="${project.image}" width="1200" height="750" alt="Interface preview of ${esc(title)}" loading="${eager ? "eager" : "lazy"}" decoding="async"${eager ? ' fetchpriority="high"' : ""}>`;
}

function englishProjectActions(project, className = "") {
  const title = englishProjectStudies[project.slug]?.title || project.title;
  const requestMessage = `Hello Eng. Eslam, I reviewed the ${title} project and would like to discuss a project with a similar delivery approach.`;
  const caseStudyLink = project.caseStudy && project.slug ? `<a class="button button-small" href="/en/projects/${project.slug}/" aria-label="Read the ${esc(title)} case study">Case study ${icon("arrow", "button-icon")}</a>` : "";
  return `<div class="portfolio-actions${className ? ` ${className}` : ""}">${caseStudyLink}<a class="button button-small button-ghost" href="${project.liveUrl}" target="_blank" rel="noopener" aria-label="Open the live ${esc(title)} website">Live site ${icon("external", "button-icon")}</a><a class="portfolio-request-link" href="${site.whatsapp}?text=${encodeURIComponent(requestMessage)}" target="_blank" rel="noopener" aria-label="Discuss a project similar to ${esc(title)}">Discuss a similar project ${icon("whatsapp")}</a></div>`;
}

function englishFeaturedProject(project) {
  const study = englishProjectStudies[project.slug];
  const domain = new URL(project.liveUrl).hostname.replace(/^www\./, "");
  return `<article class="portfolio-featured reveal"><div class="portfolio-featured-copy"><span class="portfolio-index" dir="ltr">FEATURED / 01</span><p class="portfolio-kicker">${esc(study?.category || englishProjectCategory(project.category))}</p><h3><a href="/en/projects/${project.slug}/">${officialProjectName(project, study?.title)}</a></h3><p class="portfolio-description">${esc(englishProjectDescription(project))}</p><div class="tag-row">${project.tags.map((tag) => `<span>${esc(tag)}</span>`).join("")}</div>${englishProjectActions(project)}</div><a class="portfolio-stage" href="${project.liveUrl}" target="_blank" rel="noopener" aria-label="Open the live ${esc(study?.title || project.title)} website"><span class="portfolio-stage-orbit" aria-hidden="true"></span><span class="portfolio-browser"><span class="portfolio-browser-bar"><span class="browser-dots" aria-hidden="true"><i></i><i></i><i></i></span><span dir="ltr">${esc(domain)}</span></span>${englishProjectImage(project)}</span></a></article>`;
}

function englishShowcaseProject(project, index) {
  const study = englishProjectStudies[project.slug];
  const heading = project.caseStudy && project.slug ? `<a href="/en/projects/${project.slug}/">${officialProjectName(project, study?.title)}</a>` : officialProjectName(project);
  return `<article class="portfolio-project reveal"><a class="portfolio-project-media" href="${project.liveUrl}" target="_blank" rel="noopener" aria-label="Open the live ${esc(study?.title || project.title)} website"><span class="portfolio-project-number" dir="ltr">${String(index + 1).padStart(2, "0")}</span>${englishProjectImage(project)}</a><div class="portfolio-project-copy"><p class="portfolio-kicker">${esc(study?.category || englishProjectCategory(project.category))}</p><h3>${heading}</h3><p>${esc(englishProjectDescription(project))}</p><div class="tag-row">${project.tags.map((tag) => `<span>${esc(tag)}</span>`).join("")}</div>${englishProjectActions(project)}</div></article>`;
}

function englishArchiveProject(project, index) {
  const study = englishProjectStudies[project.slug];
  const heading = project.caseStudy && project.slug ? `<a href="/en/projects/${project.slug}/">${officialProjectName(project, study?.title)}</a>` : officialProjectName(project);
  return `<article class="portfolio-archive-row reveal"><span class="portfolio-archive-number" dir="ltr">${String(index + 1).padStart(2, "0")}</span><a class="portfolio-archive-media" href="${project.liveUrl}" target="_blank" rel="noopener" aria-label="Open the live ${esc(study?.title || project.title)} website">${englishProjectImage(project)}</a><div class="portfolio-archive-copy"><p class="portfolio-kicker">${esc(study?.category || englishProjectCategory(project.category))}</p><h3>${heading}</h3><p>${esc(englishProjectDescription(project))}</p></div>${englishProjectActions(project, "portfolio-archive-actions")}</article>`;
}

function englishProjectsShowcase({ home = false } = {}) {
  const highlights = projects.slice(1, home ? 3 : 5);
  const archive = home ? [] : projects.slice(5);
  return `<div class="portfolio-showcase">${englishFeaturedProject(projects[0])}<div class="portfolio-highlight-grid">${highlights.map((project, index) => englishShowcaseProject(project, index + 1)).join("")}</div>${archive.length ? `<div class="portfolio-archive" aria-label="More selected work">${archive.map((project, index) => englishArchiveProject(project, index + 5)).join("")}</div>` : ""}</div>`;
}

function englishVerifiedWorkArchive() {
  const sectors = [...new Set(webProjects.map((project) => project.sector))];
  const cards = webProjects.map((project, index) => {
    const domain = new URL(project.liveUrl).hostname.replace(/^www\./, "");
    const sector = englishSectorNames[project.sector] || "Digital project";
    const sourceLink = project.sourceUrl ? `<a href="${esc(project.sourceUrl)}" target="_blank" rel="noopener" aria-label="View the source for ${esc(project.title)} on GitHub">Source ${icon("code")}</a>` : "";
    return `<article class="work-ledger-card reveal" data-work-card data-work-sector="${esc(sector)}"><div class="work-ledger-top"><span dir="ltr">${String(index + 1).padStart(2, "0")}</span><span>${esc(sector)}</span></div><h3>${officialProjectName(project)}</h3><p dir="ltr">${esc(domain)}</p><div class="work-ledger-actions"><a href="${esc(project.liveUrl)}" target="_blank" rel="noopener" aria-label="Open the live website for ${esc(project.title)}">Live site ${icon("external")}</a>${sourceLink}</div></article>`;
  }).join("");
  const englishSectors = sectors.map((sector) => englishSectorNames[sector] || "Digital project");
  return `<section class="section-pad work-ledger-section" data-work-archive><div class="container"><div class="section-heading reveal">${eyebrow("Verified public archive")}<h2>${projectAudit.verifiedLiveProjects} unique live web projects</h2><p>I reviewed ${projectAudit.githubRepositories} GitHub repositories and ${projectAudit.vercelProjects} Vercel projects, then excluded empty repositories, duplicates, experiments, and non-public links. The archive below contains the live projects that could be opened and verified on September 2, 2026.</p></div><div class="work-audit-summary reveal" aria-label="Web work audit summary"><div><strong>${projectAudit.githubRepositories}</strong><span>GitHub repositories reviewed</span></div><div><strong>${projectAudit.vercelProjects}</strong><span>Vercel projects reviewed</span></div><div><strong>${projectAudit.verifiedLiveProjects}</strong><span>unique live projects</span></div></div><div class="work-ledger-controls reveal"><label class="work-search"><span>Search the archive</span><span class="work-search-field">${icon("search")}<input type="search" inputmode="search" autocomplete="off" placeholder="Project, sector, or domain" data-work-search></span></label><div class="work-sector-filters" aria-label="Filter projects by sector">${["All", ...englishSectors].map((sector, index) => `<button type="button" data-work-filter="${index === 0 ? "all" : esc(sector)}" aria-pressed="${index === 0 ? "true" : "false"}">${esc(sector)}</button>`).join("")}</div><p class="work-results-status" data-work-status aria-live="polite">Showing ${webProjects.length} of ${webProjects.length} projects</p></div><div class="work-ledger-grid">${cards}</div><div class="work-ledger-more"><button class="button button-ghost" type="button" data-work-more hidden>Show more ${icon("arrow", "button-icon")}</button></div><p class="work-empty" data-work-empty hidden>No projects match the current search and sector.</p><div class="independent-note reveal">${icon("shield")}<p><strong>Evidence boundary:</strong> these links verify that a public project existed at the review date. They do not claim traffic, conversion, revenue, or commercial ownership of the businesses shown. External links may change later.</p></div></div></section>`;
}

function englishMapsWorkTeaser() {
  const samples = mapsProjects.filter((item) => item.featured).slice(0, 5);
  return `<section class="section-pad maps-work-teaser"><div class="container"><div class="maps-teaser-panel reveal"><div class="maps-teaser-copy">${eyebrow("Google Maps work")}<h2>A public record across industries and Saudi cities</h2><p>${mapsProjects.length} unique Business Profile links demonstrate experience across verification support, ownership, restrictions, and local visibility. Official business names remain in their published language.</p><div class="maps-teaser-actions">${button("/en/google-maps-projects/", "Explore the Maps archive")} ${button(`${site.whatsapp}?text=${encodeURIComponent("Hello Eng. Eslam, I would like help diagnosing a Google Business Profile.")}`, "Discuss your profile", "button-ghost", true)}</div></div><div class="maps-teaser-stack" aria-label="Selected Google Maps work">${samples.map((item, index) => `<a href="${item.url}" target="_blank" rel="noopener"><span dir="ltr">${String(index + 1).padStart(2, "0")}</span><strong lang="ar" dir="rtl">${esc(item.title)}</strong>${icon("external")}</a>`).join("")}</div></div></div></section>`;
}

function englishProjectsPage() {
  const path = "/en/projects/";
  const projectList = { "@type": "ItemList", "@id": `${absolute(path)}#project-list`, name: "Verified live web projects by Eslam Elshikh", numberOfItems: webProjects.length, itemListElement: webProjects.map((project, index) => ({ "@type": "ListItem", position: index + 1, name: project.title, url: project.liveUrl })) };
  const collectionSchema = { "@type": "CollectionPage", "@id": `${absolute(path)}#collection`, url: absolute(path), name: "Web projects and case studies by Eslam Elshikh", description: `${projectAudit.verifiedLiveProjects} verified live web projects, supported by selected case studies explaining delivery decisions and public evidence.`, creator: { "@id": `${site.url}/#person` }, mainEntity: { "@id": projectList["@id"] }, dateModified: site.lastUpdated };
  const body = `${innerHero({ eyebrowText: "Work & case studies", title: `${projectAudit.verifiedLiveProjects} verified live projects—and selected stories behind the work`, lead: "A public archive of live websites, supported by case studies showing how a business objective becomes content architecture, responsive UX, technical implementation, and measurable contact paths.", path, language: "en", crumbs: [{ name: "Work", path }], aside: `<span class="aside-kicker">VERIFIED WORK / ${projectAudit.verifiedLiveProjects}</span><strong>Design, engineering, and search as one system</strong><p>The audit separates live public work from empty repositories, duplicates, experiments, and inaccessible links.</p>` })}
<section class="section-pad portfolio-page-section"><div class="container"><div class="portfolio-page-heading reveal"><span>${projects.length} selected projects</span><p>A curated visual collection demonstrates different sectors and delivery choices before the complete verified archive.</p></div>${englishProjectsShowcase()}</div></section>
${englishVerifiedWorkArchive()}
${englishMapsWorkTeaser()}
${googleGrowthTeaser("en")}
<section class="section-pad"><div class="container case-method reveal"><div><span>Project method</span><h2>No single template is repeated across every business</h2></div><p>Page structure, content, proof, calls to action, data, and technology follow the operating model, customer journey, market, and constraints. The objective is a system that fits the real business—not the same layout with a different logo.</p>${button("/en/contact/", "Discuss a similar project")}</div></section>
${englishFinalCta("Want to turn your business into a stronger digital experience?", "Share the current website or Business Profile, target services, market, and objective. We can decide what needs rebuilding and what can be improved in stages.")}`;
  return page({ title: `${projectAudit.verifiedLiveProjects} Verified Web Projects | Eslam Elshikh`, description: `Explore ${projectAudit.verifiedLiveProjects} verified live web projects by Eslam Elshikh across corporate websites, local services, platforms, responsive UX, and SEO.`, path, active: "projects", body, lang: "en", schema: [collectionSchema, projectList, breadcrumbSchema([{ name: "Home", path: "/en/" }, { name: "Work", path }])] });
}

function englishProjectCaseStudyPage(project) {
  const study = englishProjectStudies[project.slug];
  const path = `/en/projects/${project.slug}/`;
  const domain = new URL(project.liveUrl).hostname.replace(/^www\./, "");
  const requestMessage = `Hello Eng. Eslam, I read the ${study.title} case study and would like to discuss a project with a similar approach.`;
  const creativeWorkSchema = { "@type": "CreativeWork", "@id": `${absolute(path)}#project`, name: study.title, description: study.description, url: absolute(path), image: absolute(project.image), sameAs: project.liveUrl, creator: { "@id": `${site.url}/#person` }, keywords: project.tags, dateModified: site.lastUpdated };
  const body = `${innerHero({ eyebrowText: "Project case study", title: esc(study.title), lead: study.description, path, language: "en", crumbs: [{ name: "Work", path: "/en/projects/" }, { name: study.title, path }], aside: `<div class="case-study-preview"><span>${esc(study.category)}</span>${englishProjectImage(project, { eager: true })}<small dir="ltr">${esc(domain)}</small></div>` })}
<section class="section-pad case-study-overview"><div class="container case-study-layout"><article class="rich-copy reveal"><span class="case-study-label">Objective</span><h2>What the public experience needed to accomplish</h2><p>${esc(study.objective)}</p><div class="tag-row" aria-label="Project disciplines">${project.tags.map((tag) => `<span>${esc(tag)}</span>`).join("")}</div></article><aside class="case-study-facts reveal"><span>Project card</span><dl><div><dt>Type</dt><dd>${esc(study.category)}</dd></div><div><dt>Visible scope</dt><dd>Design, implementation, and digital experience</dd></div><div><dt>Evidence</dt><dd>Public link available for review</dd></div></dl>${button(project.liveUrl, "Open the live project", "button-ghost", true)}</aside></div></section>
<section class="section-pad muted-section"><div class="container"><div class="section-heading reveal">${eyebrow("Delivery scope")}<h2>What the work included</h2><p>These items describe the public version and do not assume commercial outcomes that have not been measured or independently documented.</p></div><div class="case-study-scope">${study.scope.map((item, index) => `<article class="scope-card reveal"><span>${String(index + 1).padStart(2, "0")}</span>${icon("layers")}<p>${esc(item)}</p></article>`).join("")}</div></div></section>
<section class="section-pad"><div class="container split-heading"><div class="section-heading reveal">${eyebrow("Design decisions")}<h2>Why the experience took this direction</h2><p>Each decision connects presentation to user intent and the operating model, not visual preference alone.</p></div><ol class="case-study-decisions">${study.decisions.map((item, index) => `<li class="reveal"><span>${String(index + 1).padStart(2, "0")}</span><p>${esc(item)}</p></li>`).join("")}</ol></div></section>
<section class="section-pad deliverables-section"><div class="container split-heading"><div class="section-heading reveal">${eyebrow("Reviewable output")}<h2>What can be inspected today</h2><p>The listed output is tied to the published experience and can be reviewed directly through the live-project link.</p></div><div class="deliverables-panel reveal">${checkList(study.delivered, "deliverables-list")}<p class="case-study-disclaimer">This case study does not claim traffic, conversion, or return-on-investment figures because verified data supporting those outcomes has not been published.</p></div></div></section>
<section class="section-pad"><div class="container case-method reveal"><div><span>Next step</span><h2>Need a project designed for your own context?</h2></div><p>The method can be reused, but the pages, content, and technology should follow your business, customers, evidence, and desired outcome.</p><div class="hero-actions">${button(`${site.whatsapp}?text=${encodeURIComponent(requestMessage)}`, "Discuss a similar project", "", true)}${button("/en/projects/", "Back to all work", "button-ghost")}</div></div></section>`;
  return page({ title: `${study.title} Case Study`, description: `${study.title} case study covering the objective, delivery scope, design decisions, and reviewable public output, with a direct link to the live project.`, path, active: "projects", body, lang: "en", schema: [creativeWorkSchema, breadcrumbSchema([{ name: "Home", path: "/en/" }, { name: "Work", path: "/en/projects/" }, { name: study.title, path }])] });
}

const englishMapCategory = (value) => ({
  "نجارة وديكور خشبي": "Carpentry & Wood Interiors",
  "ألمنيوم وزجاج": "Aluminum & Glass",
  "مقاولات وتشطيبات": "Contracting & Finishing",
  "سباكة وكهرباء": "Plumbing & Electrical",
  "تجارة وخدمات": "Trade & Services",
  "تبريد وتكييف": "Cooling & Air Conditioning",
  "ديكور وتشطيبات": "Interiors & Finishing",
  "دهانات وتشطيبات": "Painting & Finishing",
  "أنظمة أمنية ومراقبة": "Security & Surveillance Systems",
  "رعاية صحية": "Healthcare",
  "مطاعم وضيافة": "Restaurants & Hospitality",
  "زهور وهدايا": "Flowers & Gifts",
  "بناء وترميم": "Construction & Renovation",
  "ديكورات جبسية": "Gypsum Interiors",
  "بلاط وسيراميك": "Tile & Ceramic Services"
}[value] || "Local Business");

const englishMapLocation = (value) => ({
  "المصيف، الرياض": "Al Masif, Riyadh",
  "الياسمين، الرياض": "Al Yasmin, Riyadh",
  "الوادي، الرياض": "Al Wadi, Riyadh",
  "الصحافة، الرياض": "As Sahafah, Riyadh",
  "الروضة، الرياض": "Ar Rawdah, Riyadh",
  "الملك فيصل، الرياض": "King Faisal District, Riyadh",
  "الخليج، الرياض": "Al Khaleej, Riyadh",
  "طويق، الرياض": "Tuwaiq, Riyadh",
  "النهضة، الرياض": "An Nahdah, Riyadh",
  "قرطبة، الرياض": "Qurtubah, Riyadh",
  "النرجس، الرياض": "An Narjis, Riyadh",
  "اليرموك، الرياض": "Al Yarmuk, Riyadh",
  "الرمال، الرياض": "Ar Rimal, Riyadh",
  "الملك فهد، الرياض": "King Fahd District, Riyadh",
  "نشاط نطاق خدمة": "Service-area business",
  "نجران": "Najran",
  "خميس مشيط": "Khamis Mushait",
  "العارض، الرياض": "Al Arid, Riyadh",
  "النفل، الرياض": "An Nafal, Riyadh",
  "الملقا، الرياض": "Al Malqa, Riyadh",
  "إشبيلية، الرياض": "Ishbiliyah, Riyadh",
  "ظهرة لبن، الرياض": "Dhahrat Laban, Riyadh"
}[value] || "Saudi Arabia");

function englishMapRequestHref(item) {
  return `${site.whatsapp}?text=${encodeURIComponent(`Hello Eng. Eslam, I reviewed the public Google Maps example for ${item.title} and would like help with a similar Business Profile case.`)}`;
}

function englishFeaturedMapCard(item, index) {
  return `<article class="map-case-card reveal"><div class="map-case-top"><span class="map-case-number" dir="ltr">${String(index + 1).padStart(2, "0")}</span><span class="map-case-pin">${icon("pin")}</span></div><p class="map-case-category">${esc(englishMapCategory(item.category))}</p><h3 lang="ar" dir="rtl">${esc(item.title)}</h3><p class="map-case-location">${icon("pin")}<span>${esc(englishMapLocation(item.location))}</span></p><div class="map-case-actions"><a class="button button-small" href="${item.url}" target="_blank" rel="noopener" aria-label="Open the Google Maps profile for ${esc(item.title)}">Open profile ${icon("external", "button-icon")}</a><a class="button button-small button-ghost" href="${englishMapRequestHref(item)}" target="_blank" rel="noopener" aria-label="Discuss a similar Google Maps case">Discuss a similar case ${icon("whatsapp", "button-icon")}</a></div></article>`;
}

function englishMapLedgerCard(item, index) {
  return `<article class="map-ledger-card reveal"><span class="map-ledger-number" dir="ltr">${String(index + 1).padStart(2, "0")}</span><div><p>${esc(englishMapCategory(item.category))}</p><h3 lang="ar" dir="rtl">${esc(item.title)}</h3><span>${icon("pin")} ${esc(englishMapLocation(item.location))}</span></div><a href="${item.url}" target="_blank" rel="noopener" aria-label="Open the Google Maps profile for ${esc(item.title)}">${icon("external")}</a></article>`;
}

function englishGoogleMapsProjectsPage() {
  const path = "/en/google-maps-projects/";
  const categories = [...new Set(mapsProjects.map((item) => item.category))];
  const tracks = [
    { number: "01", title: "Verification readiness", text: "Review eligibility, business information, and evidence before selecting the available verification route." },
    { number: "02", title: "Ownership and access", text: "Diagnose ownership conflicts and access requests without exchanging passwords or one-time verification codes." },
    { number: "03", title: "Restrictions and suspension", text: "Identify the material issue, correct it, and prepare a focused official review supported by relevant evidence." },
    { number: "04", title: "Local visibility and SEO", text: "Improve services, categories, content, consistency, website alignment, reputation, and measurable customer actions." }
  ];
  const mapListSchema = { "@type": "ItemList", "@id": `${absolute(path)}#proof-list`, name: "Public Google Maps and Business Profile work", numberOfItems: mapsProjects.length, itemListElement: mapsProjects.map((item, index) => ({ "@type": "ListItem", position: index + 1, item: { "@type": "CreativeWork", "@id": `${absolute(path)}#proof-${index + 1}`, name: `Public work example: ${item.title}`, creator: { "@id": `${site.url}/#person` }, about: englishMapCategory(item.category), contentLocation: { "@type": "Place", name: englishMapLocation(item.location) }, sameAs: item.url } })) };
  const body = `${innerHero({ eyebrowText: "Google Maps work", title: `${mapsProjects.length} public evidence records in a local proof engine`, lead: "An interactive view connecting sector, geography, work type, and available public evidence while keeping every customer entity independent.", path, language: "en", crumbs: [{ name: "Work", path: "/en/projects/" }, { name: "Google Maps work", path }], aside: `<span class="aside-kicker">Google Local Proof Engine</span><strong>Every external link opens a real public profile</strong><p>The businesses shown are not Eslam's branches. No case implies a guaranteed decision, fixed ranking, or invented result.</p>` })}
<section class="section-pad maps-method-section"><div class="container"><div class="maps-work-stats reveal"><div><strong>${mapsProjects.length}</strong><span>unique public profiles</span></div><div><strong>${categories.length}</strong><span>business categories</span></div><div><strong>${tracks.length}</strong><span>core support tracks</span></div><div><strong>Google</strong><span>open links for direct review</span></div></div><div class="section-heading reveal">${eyebrow("Experience scope")}<h2>From eligibility and evidence to clearer local discovery</h2><p>There is rarely one decisive profile edit. The right sequence starts with the real business and current state, then uses the path that fits policy, risk, and the commercial objective.</p></div><div class="map-track-grid">${tracks.map((track) => `<article class="map-track-card reveal"><span dir="ltr">${track.number}</span><h3>${esc(track.title)}</h3><p>${esc(track.text)}</p></article>`).join("")}</div></div></section>
${proofEngine("en")}
<section class="section-pad muted-section"><div class="container"><div class="section-heading reveal">${eyebrow("Next step")}<h2>Turn the evidence into an audit of your situation</h2><p>Start with the free guided self-check or request a consultation for verification, suspension, or ownership conflicts.</p></div><div class="section-action">${button("/en/google-business-profile-audit/", "Run the free audit")}${button("/en/book/", "Book a consultation", "button-ghost")}</div></div></section>
${englishFinalCta("Does your Business Profile need verification, ownership recovery, or a restriction review?", "Send the public profile link, current status, and what appears in the management interface. I will begin by identifying the correct path before another change or request.")}`;
  return page({ title: "Google Maps Proof Engine & Public Work | Eslam Elshikh", description: `Explore ${mapsProjects.length} public work examples in an interactive proof map that keeps each customer business independent from Eslam Elshikh's entity.`, path, active: "maps", body, lang: "en", stylesheets: [`/assets/css/google-growth.css?v=${version}`], pageScripts: [`/assets/js/google-proof.js?v=${version}`], keywords: ["Google Maps portfolio", "Business Profile verification", "Google Maps proof engine", "local visibility Saudi Arabia"], schema: [mapListSchema, breadcrumbSchema([{ name: "Home", path: "/en/" }, { name: "Work", path: "/en/projects/" }, { name: "Google Maps work", path }])] });
}

function englishPostCard(post, { featured = false } = {}) {
  const keywords = (post.keywords || []).slice(0, featured ? 4 : 3);
  const relatedService = englishServiceBySlug(post.relatedService);
  const formattedDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${post.date}T12:00:00Z`));
  return `<article class="post-card${featured ? " post-card-featured" : ""} reveal"><a class="post-art post-art-${post.relatedService}" href="/en/blog/${post.slug}/" aria-label="Read ${esc(post.title)}"><span>${esc(post.category)}</span><strong class="post-art-title">${esc(relatedService?.title || post.category)}</strong><span class="post-art-mark">${icon(relatedService?.icon || "book", "post-icon")}</span></a><div class="post-card-content"><div class="post-meta"><time datetime="${post.date}">${formattedDate}</time><span>${esc(post.readTime)}</span></div><h3><a href="/en/blog/${post.slug}/">${esc(post.title)}</a></h3><p>${esc(post.excerpt)}</p>${keywords.length ? `<div class="keyword-row" aria-label="Key topics">${keywords.map((keyword) => `<span>${esc(keyword)}</span>`).join("")}</div>` : ""}<a class="text-link post-card-link" href="/en/blog/${post.slug}/" aria-label="Read the complete guide: ${esc(post.title)}">Read the complete guide ${icon("arrow")}</a></div></article>`;
}

function englishBlogIndexPage() {
  const path = "/en/blog/";
  const [featuredPost, ...remainingPosts] = englishArticles;
  const itemListSchema = { "@type": "ItemList", name: "English insights and guides by Eslam Elshikh", itemListElement: englishArticles.map((post, index) => ({ "@type": "ListItem", position: index + 1, url: absolute(`/en/blog/${post.slug}/`), name: post.title })) };
  const body = `${innerHero({ eyebrowText: "Insights & guides", title: "Original English guidance for secure, visible, maintainable digital work", lead: "Decision-focused articles connecting cybersecurity, software, AI, Google Business Profile, cloud architecture, SEO, and conversion to practical delivery for companies in Saudi Arabia.", path, language: "en", crumbs: [{ name: "Insights", path }], aside: `<span class="aside-kicker">Practical English Insights</span><strong>Written for the decision—not translated sentence by sentence</strong><p>Each guide explains context, risks, implementation, evidence, and the questions that matter before a company invests.</p>`, className: "blog-hero" })}
<section class="section-pad blog-latest-section"><div class="container"><div class="section-heading reveal">${eyebrow("Featured guide")}<h2>Begin with a topic that connects business risk to implementation</h2><p>The English library is written as original professional content, while covering the same service disciplines and decision needs as the Arabic site.</p></div><div class="blog-featured-shell">${englishPostCard(featuredPost, { featured: true })}</div></div></section>
<section class="section-pad muted-section"><div class="container"><div class="section-heading reveal">${eyebrow("Guide library")}<h2>Specialist topics for companies in Saudi Arabia</h2><p>Explore a problem in depth, then move directly to the related service, topic hub, or practical contact brief.</p></div><div class="posts-grid blog-library-grid">${remainingPosts.map((post) => englishPostCard(post)).join("")}</div></div></section>
<section class="section-pad muted-section"><div class="container"><div class="section-heading reveal">${eyebrow("Knowledge tracks")}<h2>Browse by discipline</h2></div><div class="topics-grid">${Object.entries(englishTopics).map(([slug, topic]) => `<a class="topic-card reveal" href="/en/blog/topics/${slug}/">${icon(topic.icon)}<strong>${esc(topic.title)}</strong><span>Related guides and services ${icon("arrow")}</span></a>`).join("")}</div></div></section>
${englishFinalCta("Have a question that depends on your specific situation?", "The guides provide a rigorous frame. The right implementation still depends on your current systems, evidence, operating constraints, and desired outcome.")}`;
  return page({ title: "Insights by Eslam Elshikh | Security, Web, AI & SEO", description: "Original English guides by Eslam Elshikh covering cybersecurity, web development, AI agents, Google Business Profile, cloud architecture, local SEO, and conversion.", path, active: "blog", body, lang: "en", keywords: ["cybersecurity guides", "web development insights", "AI agents Saudi Arabia", "Google Business Profile", "local SEO Riyadh"], schema: [itemListSchema, breadcrumbSchema([{ name: "Home", path: "/en/" }, { name: "Insights", path }])] });
}

function englishArticlePage(post) {
  const path = `/en/blog/${post.slug}/`;
  const service = englishServiceBySlug(post.relatedService);
  const topicSlug = englishTopics[post.topic] ? post.topic : "web-development";
  const topic = englishTopics[topicSlug];
  const topicPath = `/en/blog/topics/${topicSlug}/`;
  const publishedDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${post.date}T12:00:00Z`));
  const modifiedDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${post.modified}T12:00:00Z`));
  const keywords = (post.keywords || []).slice(0, 6);
  const roadmap = post.sections.slice(0, 4).map(([heading], index) => ({
    title: ["Establish the baseline", "Turn evidence into decisions", "Release within a controlled boundary", "Measure and decide what follows"][index],
    text: [
      `Collect the current evidence, constraints, ownership, and failure signals relevant to “${heading}” before making a change.`,
      `Translate the findings around “${heading}” into an owner, decision, dependency, and acceptance check the team can review.`,
      `Apply the approach to a limited scope, test normal and failure paths, and preserve a rollback or escalation route.`,
      `Track the indicator that proves whether “${heading}” improved, then document the result, remaining risk, and next review.`
    ][index]
  }));
  const deliverables = [
    `A documented baseline for ${keywords[0] || post.category}, including evidence gaps and current constraints`,
    `A prioritized decision log with owners, dependencies, and acceptance criteria`,
    `Test results covering the important success, failure, and recovery paths`,
    `A measurement view connecting implementation signals to a useful business outcome`
  ];
  const contents = [...post.sections.map(([heading], index) => ({ id: `section-${index + 1}`, title: heading })), { id: "implementation-roadmap", title: "Implementation roadmap" }, { id: "expected-deliverables", title: "Reviewable deliverables" }, { id: "article-summary", title: "Executive summary" }];
  const relatedPosts = englishArticles.filter((item) => item.slug !== post.slug).map((item) => ({ item, score: Number(item.relatedService === post.relatedService) * 3 + Number(item.topic === post.topic) * 2 })).sort((left, right) => right.score - left.score).slice(0, 3).map(({ item }) => item);
  const body = `${innerHero({ eyebrowText: post.category, title: esc(post.title), lead: post.excerpt, path, language: "en", crumbs: [{ name: "Insights", path: "/en/blog/" }, { name: topic.title, path: topicPath }, { name: post.title, path }], aside: `<div class="article-meta-card"><span>Professional guide</span><strong>${esc(post.readTime)}</strong><p>Published ${publishedDate}</p><p>Reviewed ${modifiedDate}</p></div>`, className: "article-hero" })}
<div class="container article-hero-keywords" aria-label="Key topics">${keywords.map((keyword) => `<span>${esc(keyword)}</span>`).join("")}</div>
<section class="section-pad article-section"><div class="container article-layout"><article class="article-content reveal"><p class="article-intro">${esc(post.description)}</p>
${post.sections.map(([heading, ...paragraphs], index) => `<section id="section-${index + 1}"><span class="article-number">${String(index + 1).padStart(2, "0")}</span><h2>${esc(heading)}</h2>${paragraphs.map((paragraph) => `<p>${esc(paragraph)}</p>`).join("")}</section>`).join("")}
<section id="implementation-roadmap" class="article-roadmap-section"><span class="article-number">${String(post.sections.length + 1).padStart(2, "0")}</span><h2>Apply the guide through a controlled implementation roadmap</h2><p>A useful framework becomes operational when it is divided into short stages. Each stage needs an accountable owner, a reviewable output, an acceptance check, and a clear point for rollback, escalation, or the next release.</p><ol class="article-roadmap">${roadmap.map((step, index) => `<li><span>${String(index + 1).padStart(2, "0")}</span><div><h3>${esc(step.title)}</h3><p>${esc(step.text)}</p></div></li>`).join("")}</ol></section>
<section id="expected-deliverables" class="article-deliverables-section"><span class="article-number">${String(post.sections.length + 2).padStart(2, "0")}</span><h2>Deliverables that prove the work is complete</h2><p>A credible output explains what changed, what evidence the team reviewed, what remains outside scope, and which indicator will determine whether the decision should be kept or revised.</p><ul class="article-deliverables">${deliverables.map((item) => `<li>${icon("check")}<span>${esc(item)}</span></li>`).join("")}</ul></section>
<section id="article-summary" class="article-conclusion"><span class="article-number">${String(post.sections.length + 3).padStart(2, "0")}</span><h2>Executive summary: ${esc(keywords[0] || post.category)}</h2><p>Begin with verified context, fix the highest-dependency problem, test within a limited boundary, and measure the outcome that matters. Keep the decision log and evidence visible so future changes build on what was learned instead of restarting the diagnosis.</p></section></article>
<aside class="article-sidebar"><section class="article-author-card reveal" aria-labelledby="article-author-name"><div class="article-author-head"><img class="article-author-photo" src="${profilePhoto}" width="128" height="128" alt="Eslam Elshikh" loading="lazy" decoding="async"><div><span>Written and reviewed by</span><h2 id="article-author-name">${esc(site.nameEn)}</h2><p>Cybersecurity Engineer · Software Developer · Google Maps Specialist</p></div></div><dl><div><dt>Published</dt><dd><time datetime="${post.date}">${publishedDate}</time></dd></div><div><dt>Last reviewed</dt><dd><time datetime="${post.modified}">${modifiedDate}</time></dd></div></dl><div class="article-author-keywords" aria-label="Article keywords">${keywords.slice(0, 4).map((keyword) => `<span>${esc(keyword)}</span>`).join("")}</div><a class="text-link" href="/en/about/">About the author ${icon("arrow")}</a></section>
<div class="toc-card reveal"><span>Inside this guide</span><nav aria-label="Article contents">${contents.map((item, index) => `<a href="#${item.id}"><span>${String(index + 1).padStart(2, "0")}</span>${esc(item.title)}</a>`).join("")}</nav></div>
<div class="related-service-card reveal"><span>Knowledge track</span><div>${icon(topic.icon)}<h2>${esc(topic.title)}</h2></div><p>${esc(topic.description)}</p>${button(topicPath, "Explore the topic", "button-ghost")}</div>
<div class="related-service-card reveal"><span>Related service</span><div>${icon(service?.icon || "briefcase")}<h2>${esc(service?.title || "Digital engineering")}</h2></div><p>${esc(service?.short || "A scoped technical engagement with reviewable outcomes.")}</p>${button(service ? `/en/services/${service.slug}/` : "/en/services/", "Explore the service", "button-ghost")}</div></aside></div></section>
<section class="section-pad muted-section article-faq-section" id="article-faq"><div class="container article-faq-grid"><div class="article-faq-intro reveal">${eyebrow("Frequently asked questions")}<h2>Answers tied directly to this guide</h2><p>Four practical questions that commonly arise before implementation, answered without generic promises.</p><div class="faq-count" aria-label="Question count"><strong>${post.faq.length}</strong><span>topic-specific answers</span></div></div>${faqBlock(post.faq)}</div></section>
<section class="section-pad related-articles-section"><div class="container"><div class="section-heading reveal">${eyebrow("Related guides")}<h2>Continue building the full decision picture</h2><p>Selected topics that connect this guide to security, delivery, visibility, or measurement.</p></div><div class="posts-grid">${relatedPosts.map((item) => englishPostCard(item)).join("")}</div></div></section>
${englishFinalCta("Want to apply this framework to your project?", "Share the current situation, desired outcome, and available evidence. We can identify one small, clear, measurable first step.")}`;
  return page({ title: post.seoTitle, description: post.description, path, active: "blog", body, lang: "en", type: "article", published: post.date, modified: post.modified, keywords, articleSection: post.category, schema: [faqSchema(post.faq), breadcrumbSchema([{ name: "Home", path: "/en/" }, { name: "Insights", path: "/en/blog/" }, { name: topic.title, path: topicPath }, { name: post.title, path }])] });
}

function englishTopicPage(slug) {
  const topic = englishTopics[slug];
  const matchingPosts = englishArticles.filter((post) => post.topic === slug || (slug === "local-seo-saudi" && post.topic === "google-business-profile"));
  const relatedServices = topic.services.map(englishServiceBySlug).filter(Boolean);
  const path = `/en/blog/topics/${slug}/`;
  const body = `${innerHero({ eyebrowText: "Knowledge track", title: esc(topic.title), lead: topic.description, path, language: "en", crumbs: [{ name: "Insights", path: "/en/blog/" }, { name: topic.title, path }], aside: `<span class="service-hero-icon">${icon(topic.icon)}</span><strong>Specialist guidance connected to implementation</strong><p>Move from the articles to the related services and practical next step without losing the decision context.</p>` })}
<section class="section-pad"><div class="container"><div class="section-heading reveal">${eyebrow("Guides")}<h2>Original English articles about ${esc(topic.title)}</h2></div>${matchingPosts.length ? `<div class="posts-grid">${matchingPosts.map((post) => englishPostCard(post)).join("")}</div>` : `<div class="empty-state"><h2>This track is growing</h2><p>Begin with a related service or explore the complete guide library.</p></div>`}</div></section>
<section class="section-pad muted-section"><div class="container"><div class="section-heading reveal">${eyebrow("Related services")}<h2>Turn the guidance into a scoped delivery plan</h2></div><div class="services-grid related-services">${relatedServices.map(englishServiceCard).join("")}</div></div></section>
${slug === "local-seo-saudi" ? `<section class="section-pad"><div class="container case-method reveal"><div><span>Riyadh service</span><h2>A dedicated local SEO program for Riyadh businesses</h2></div><p>Connect the website, Business Profile, genuine service coverage, content, consistency, reputation, and conversion measurement without manufacturing repetitive district pages.</p>${button("/en/local-seo/riyadh/", "Explore Local SEO in Riyadh")}</div></section>` : ""}
${englishFinalCta("Does your situation require practical implementation?", "Share the project context, public links, and desired outcome. We can identify the appropriate scope, dependencies, and first measurable release.")}`;
  const pageTitle = slug === "web-development" ? "Web Development Guides & Services" : `${topic.title} Guides & Services`;
  return page({ title: pageTitle, description: topic.description, path, active: "blog", body, lang: "en", schema: [breadcrumbSchema([{ name: "Home", path: "/en/" }, { name: "Insights", path: "/en/blog/" }, { name: topic.title, path }])] });
}

function englishContactPage() {
  const path = "/en/contact/";
  const body = `${innerHero({ eyebrowText: "Start a conversation", title: "Give the project enough context for a useful next step", lead: "Choose a contact route or prepare a short brief describing the objective and current state. I will review the need before defining scope, deliverables, timing, and cost.", path, language: "en", crumbs: [{ name: "Contact", path }], aside: `<span class="aside-kicker">Response ready</span><strong>Use WhatsApp, phone, or email</strong><p>Do not include passwords, one-time codes, API keys, recovery codes, or sensitive customer data in the first message.</p>` })}
<section class="section-pad"><div class="container contact-grid"><div class="contact-options"><a class="contact-card reveal" href="${site.whatsapp}?text=${encodeURIComponent("Hello Eng. Eslam, I would like to discuss a digital project.")}" target="_blank" rel="noopener"><span class="contact-icon contact-whatsapp">${icon("whatsapp")}</span><div><small>Fastest route for an initial brief</small><h2>WhatsApp</h2><p dir="ltr">${site.phoneDisplay}</p></div>${icon("external")}</a><a class="contact-card reveal" href="tel:${site.phone}"><span class="contact-icon contact-call">${icon("phone")}</span><div><small>Direct conversation</small><h2>Phone</h2><p dir="ltr">${site.phoneDisplay}</p></div>${icon("arrow")}</a><a class="contact-card reveal" href="mailto:${site.email}"><span class="contact-icon contact-mail">${icon("mail")}</span><div><small>Useful for context and safe attachments</small><h2>Email</h2><p dir="ltr">${site.email}</p></div>${icon("arrow")}</a><div class="contact-note reveal"><span>${icon("shield")}</span><div><h2>Protect your information</h2><p>Begin with a general description and public links. A safer channel and least-privilege access method can be agreed if sensitive technical information is genuinely required.</p></div></div></div>
<div class="project-form reveal" data-project-form role="form" aria-labelledby="project-form-title" id="project-brief"><div class="form-head"><span>Project brief builder</span><h2 id="project-form-title">Prepare a structured WhatsApp message</h2><p>Enter the useful context below, then review the message in WhatsApp before sending. The form does not submit data to this website.</p></div><label><span>Your name or company</span><input type="text" name="name" autocomplete="name" maxlength="80" required placeholder="Example: Company name"></label><label><span>Closest service</span><select name="service" required><option value="">Choose a service</option>${englishServices.map((service) => `<option value="${service.slug}">${esc(service.title)}</option>`).join("")}<option value="consultation">Cross-disciplinary consultation</option></select></label><label><span>Website or public profile — optional</span><input type="url" name="url" inputmode="url" autocomplete="url" maxlength="300" placeholder="https://"></label><label><span>Objective and current state</span><textarea name="details" rows="6" maxlength="1500" required placeholder="Describe the problem, desired outcome, impact, and what has already been tried..."></textarea><small><span data-character-count>0</span> / 1500</small></label><label><span>Expected timing — optional</span><input type="text" name="timeline" maxlength="120" placeholder="Example: within one month or before a specific launch"></label><div class="form-message" role="status" aria-live="polite" data-form-message></div><button class="button" type="button" data-project-submit>Review in WhatsApp ${icon("whatsapp", "button-icon")}</button></div></div></section>
<section class="section-pad muted-section"><div class="container"><div class="section-heading reveal">${eyebrow("What to include")}<h2>Four points that shorten the diagnosis</h2></div><div class="audience-grid"><article class="audience-card reveal"><span>01</span><h3>Outcome</h3><p>What needs to change, and why does it matter to the business now?</p></article><article class="audience-card reveal"><span>02</span><h3>Current state</h3><p>Share the public links, systems, symptoms, impact, and what still works.</p></article><article class="audience-card reveal"><span>03</span><h3>Previous attempts</h3><p>List meaningful edits, tools, releases, or support requests and their outcomes.</p></article><article class="audience-card reveal"><span>04</span><h3>Constraints</h3><p>Note timing, approximate budget, team capacity, dependencies, and approvals.</p></article></div></div></section>`;
  return page({ title: "Contact Eslam Elshikh", description: "Contact Eslam Elshikh in Riyadh to discuss cybersecurity, web development, AI agents, Google Business Profile, cloud architecture, SEO, or digital advertising.", path, active: "", body, lang: "en", schema: [breadcrumbSchema([{ name: "Home", path: "/en/" }, { name: "Contact", path }])] });
}

function englishPrivacyPage() {
  const path = "/en/privacy/";
  const body = `${innerHero({ eyebrowText: "Privacy", title: "Privacy policy", lead: "This policy explains what information may be processed when you browse the website or make contact, why it is used, and the choices available to you.", path, language: "en", crumbs: [{ name: "Privacy policy", path }] })}
<section class="section-pad legal-section"><div class="container legal-content"><section><h2>1. Controller and purpose</h2><p>Eslam Elshikh operates this website to present professional services, receive enquiries, protect the service, and understand page performance after analytics consent. Privacy questions can be sent to <a href="mailto:${site.email}">${site.email}</a>.</p></section><section><h2>2. Information you provide</h2><p>The website does not require an account. You may provide a name, company, contact information, public URL, or project context when you choose to make contact. Do not send passwords, one-time codes, recovery codes, API keys, or sensitive customer data in an initial message.</p></section><section><h2>3. Contact and booking builders</h2><p>The contact and booking tools prepare text in your browser and open WhatsApp for review. Their fields are not submitted to this website, and preparing a request does not prove it was sent or that an appointment was confirmed.</p></section><section><h2>4. Google Business Profile audit</h2><p>When direct lookup is used, the public business name or Google Maps URL you enter is sent to the website server and then to Google Places to retrieve public business information. The tool does not access your account and does not store the query in a database. Guided audit choices remain in your browser. Vercel may retain temporary security logs such as IP address, path, and request time.</p></section><section><h2>5. Local visibility dashboard</h2><p>CSV files selected in the dashboard are parsed and aggregated in your browser only. File contents are not uploaded to this website or Google Analytics. The visible state clears on refresh unless you download the summary yourself.</p></section><section><h2>6. Hosting and technical logs</h2><p>Vercel may process technical information required to deliver and protect the site, including IP address, browser information, requested path, request time, and security logs.</p></section><section><h2>7. Analytics and consent</h2><p>Google Analytics 4, property G-MDJ2HGF9E1, loads only after consent. Events may record contact clicks and starts or completions of the audit, booking builder, and proof-map interactions using service and placement categories only. Business names, customer names, message text, entered URLs, and CSV contents are not sent as analytics parameters.</p><button class="button button-ghost privacy-preferences" type="button" data-analytics-preferences>Change analytics preferences</button></section><section><h2>8. Third parties</h2><p>Depending on your choices, information may be processed by Vercel, Google Analytics after consent, Google Maps when loaded, Google Places for direct audit lookup, and WhatsApp or email when you initiate contact. Each provider applies its own policies and safeguards.</p></section><section><h2>9. Basis, retention, and security</h2><p>Enquiry information is used to respond and take steps toward a later agreement; optional analytics relies on consent. Visitor data is not sold. Correspondence is kept only as needed for delivery, documentation, or an applicable legal requirement. Reasonable safeguards are used, while no electronic method can promise absolute security.</p></section><section><h2>10. Rights and changes</h2><p>Subject to applicable law, you may request access, correction, or deletion where relevant and withdraw analytics consent at any time. Contact <a href="mailto:${site.email}">${site.email}</a>. This policy may change when tools or processing purposes change.</p></section><p class="legal-updated">Last updated: 12 September 2026</p></div></section>`;
  const privacySafeBody = body
    .replace("When direct lookup is used, the public business name or Google Maps URL you enter is sent to the website server and then to Google Places to retrieve public business information. The tool does not access your account and does not store the query in a database. Guided audit choices remain in your browser. Vercel may retain temporary security logs such as IP address, path, and request time.", "The guided profile audit runs entirely in your browser. The business name, Google Maps URL, website, phone, and checklist choices are not sent to this website or Google. The tool does not access your account, and it prepares any WhatsApp message locally for your review before sending.")
    .replace("Google Maps when loaded, Google Places for direct audit lookup, and WhatsApp or email when you initiate contact", "Google Maps when loaded, and WhatsApp or email when you initiate contact");
  return page({ title: "Privacy Policy", description: "Privacy policy for Eslam Elshikh's website, including contact information, local message preparation, hosting logs, analytics consent, third parties, and data rights.", path, body: privacySafeBody, lang: "en", schema: [breadcrumbSchema([{ name: "Home", path: "/en/" }, { name: "Privacy policy", path }])] });
}

function englishTermsPage() {
  const path = "/en/terms/";
  const body = `${innerHero({ eyebrowText: "Terms", title: "Terms of use", lead: "By using this website, you acknowledge that its content is general and informational, while the scope of any technical or commercial service requires a separate clear agreement.", path, language: "en", crumbs: [{ name: "Terms of use", path }] })}
<section class="section-pad legal-section"><div class="container legal-content"><section><h2>1. Nature of the content</h2><p>The website presents services and general professional guidance. The published material alone does not form a contract, guarantee, legal opinion, or final technical decision for a situation that has not been reviewed.</p></section><section><h2>2. Service scope</h2><p>Each project's scope, deliverables, schedule, dependencies, responsibilities, access, and commercial terms are defined in a separate proposal or agreement. Examples and capability lists describe possible work and do not automatically form part of every engagement.</p></section><section><h2>3. Tools and third-party platforms</h2><p>Profile-audit scores are preliminary readiness indicators based on public data and user selections. They are not official Google assessments or ranking promises. No independent consultant can guarantee decisions by Google, advertising platforms, hosting providers, search engines, or other third parties.</p></section><section><h2>4. Security and authorized use</h2><p>No active security testing is performed without explicit written authorization and a defined scope. You must not use the website, its content, or its contact channels to request unauthorized, harmful, deceptive, or unlawful activity.</p></section><section><h2>5. Intellectual property</h2><p>Unless otherwise stated, the website content, design, and Eslam Elshikh identity remain the property of their respective owners. Complete commercial copying or republication requires permission. Limited quotation with clear attribution and a source link is permitted where applicable.</p></section><section><h2>6. Changes and contact</h2><p>These terms may be updated as the website and services change. Questions can be sent to <a href="mailto:${site.email}">${site.email}</a>.</p></section><p class="legal-updated">Last updated: 12 September 2026</p></div></section>`;
  return page({ title: "Terms of Use", description: "Terms of use for Eslam Elshikh's website, covering informational content, project scope, third-party decisions, authorized security work, and intellectual property.", path, body, lang: "en", schema: [breadcrumbSchema([{ name: "Home", path: "/en/" }, { name: "Terms of use", path }])] });
}

const englishHomeFaq = [
  ["What types of projects does Eng. Eslam Elshikh deliver?", "I work with companies and business owners on cybersecurity, websites and applications, practical AI agents, secure cloud solutions, Google products, SEO, and digital advertising. Every engagement starts by defining the objective, scope, deliverables, constraints, and a measurable definition of success."],
  ["Can several services be combined in one project?", "Yes. A project can combine a fast and secure website, technical SEO, a Google Business Profile, analytics, landing pages, and advertising while keeping the message, data, and customer journey consistent."],
  ["How does a consultation or project begin?", "Send a concise description of the objective, current situation, relevant public links, constraints, and expected timing. I then identify the missing questions and propose a clear scope, deliverables, review process, and next step."],
  ["Are services limited to Riyadh?", "I am based in Riyadh, while most technical and advisory work can be delivered remotely across Saudi Arabia and internationally. On-site work depends on the project, location, and whether physical presence is genuinely required."],
  ["Do you guarantee a number-one Google ranking or Business Profile approval?", "No one can responsibly guarantee a fixed ranking or a decision controlled by an external platform. I provide evidence-based technical work, useful content, clear measurement, and official support paths while explaining the risks and dependencies."],
  ["Will the website or system work across mobile, tablet, and desktop devices?", "Yes. Delivery follows a mobile-first approach and is tested across representative iOS, Android, Huawei, tablet, and desktop sizes, with accessible touch targets, safe-area support, responsive typography, and protection against horizontal overflow."]
];

function englishPage() {
  const workCards = projects.slice(0, 3).map((project, index) => englishShowcaseProject(project, index)).join("");
  const insightCards = ["secure-website-development", "google-business-profile-suspension", "local-seo-riyadh-service-business"].map(englishArticleBySlug).filter(Boolean).map((post) => englishPostCard(post)).join("");
  const body = `<section class="hero section-pad hero-en"><div class="container hero-grid"><div class="hero-copy reveal"><span class="eyebrow"><span></span>Cybersecurity Engineer · Software Developer · Google Maps Specialist</span><h1>I build digital systems that are <span>secure, useful, and ready to grow.</span></h1><p class="hero-lead">I am Eslam Elshikh, based in Riyadh. I combine cybersecurity, web and software engineering, practical AI agents, Google Maps and Business Profile experience, cloud architecture, and search visibility into clear project scopes with reviewable outcomes.</p><p class="hero-support">From diagnosis and information architecture to implementation, testing, launch, and measurement, the goal is to reduce complexity and help your team make better technical decisions.</p><div class="hero-actions">${button(`${site.whatsapp}?text=${encodeURIComponent("Hello Eng. Eslam, I would like to discuss a digital project.")}`, "Start a conversation", "", true)}${button("/en/#services", "Explore services", "button-ghost")}</div><div class="hero-trust"><a href="${site.social.googleDeveloper}" target="_blank" rel="noopener"><span class="trust-dot trust-google"></span>Google Developer Profile</a><a href="${site.social.github}" target="_blank" rel="noopener"><span class="trust-dot"></span>GitHub</a><span><span class="trust-dot trust-live"></span>Saudi Arabia & remote</span></div></div><div class="hero-visual reveal"><div class="visual-glow"></div><div class="visual-shell"><div class="visual-top"><span>Digital Engineering</span><span class="visual-status"><i></i> Operational</span></div><div class="visual-core">${logo("hero-logo", "Eslam Elshikh logo")}<div><strong>${site.nameEn}</strong><span>SECURE · BUILD · GROW</span></div></div><div class="visual-capabilities"><span>${icon("shield")}Cybersecurity</span><span>${icon("code")}Web & Apps</span><span>${icon("spark")}AI Agents</span><span>${icon("google")}Google</span><span>${icon("chart")}SEO</span><span>${icon("cloud")}Cloud</span></div><div class="visual-metric"><span>Approach</span><strong>360°</strong><p>Security, user experience, discoverability, and measurement in one system.</p></div></div></div></div><div class="container stats-bar reveal">${site.stats.map((stat, index) => `<div><strong>${esc(stat.value)}</strong><span>${["Google Business Profiles supported through verification", "Business profile issues resolved", "Public Google Maps examples", "Verified live web projects"][index]}</span></div>`).join("")}</div></section>
<section class="section-pad" id="services"><div class="container"><div class="section-heading reveal"><span class="eyebrow"><span></span>Core capabilities</span><h2>Specialist work that can operate independently or as one delivery plan</h2><p>Each engagement starts with the business outcome, current state, constraints, risks, and a measurable definition of done.</p></div><div class="services-grid">${englishServices.map(englishServiceCard).join("")}</div><div class="section-action">${button("/en/services/", "Explore all services", "button-ghost")}</div></div></section>
<section class="section-pad muted-section" id="about"><div class="container promise-grid"><div class="promise-copy reveal"><span class="eyebrow"><span></span>About & approach</span><h2>A strong digital project is more than a polished interface</h2><p>I approach security, software, user experience, discoverability, and measurement as connected parts of one system. The work should remain understandable, maintainable, and reviewable after launch.</p></div><div class="principles-grid"><article class="principle reveal"><span>01</span>${icon("target")}<h3>Outcome first</h3><p>We define the user decision and business result before selecting tools.</p></article><article class="principle reveal"><span>02</span>${icon("shield")}<h3>Secure by design</h3><p>Data, permissions, and failure modes are considered from the start.</p></article><article class="principle reveal"><span>03</span>${icon("user")}<h3>Built for devices</h3><p>Mobile-first testing across iOS, Android, Huawei, tablets, and desktops.</p></article><article class="principle reveal"><span>04</span>${icon("chart")}<h3>Ready to improve</h3><p>Performance, SEO, analytics, and conversion are part of operations.</p></article></div></div></section>
<section class="section-pad projects-section" id="work"><div class="container"><div class="section-heading reveal"><span class="eyebrow"><span></span>Selected case studies</span><h2>Real projects with distinct goals, constraints, and delivery decisions</h2><p>Three live examples showing how content, design, engineering, search visibility, and conversion paths are shaped around the business rather than copied from a generic template.</p></div><div class="posts-grid">${workCards}</div><div class="section-action">${button("/en/projects/", "Explore all verified work", "button-ghost")}</div></div></section>
<section class="section-pad" id="google-expertise"><div class="container proof-panel reveal"><div class="proof-icon">${icon("google")}</div><div><span>Google Maps and Business Profile experience</span><h2>Structured diagnosis instead of random profile changes</h2><p>I help eligible businesses understand verification, suspension, ownership, category, consistency, and local visibility issues using official paths and realistic expectations.</p></div><div class="proof-actions">${button("/en/google-expert/", "Explore Google expertise")}${button(site.googleMapsProfile, "Business profile", "button-ghost", true)}</div></div></section>
<section class="section-pad muted-section blog-section" id="insights"><div class="container"><div class="section-heading reveal"><span class="eyebrow"><span></span>Practical insights</span><h2>Original English guidance for technical and growth decisions</h2><p>Decision-focused articles covering the same disciplines used in delivery, written for English readers rather than translated sentence by sentence.</p></div><div class="posts-grid">${insightCards}</div><div class="section-action">${button("/en/blog/", "Explore all English guides", "button-ghost")}</div></div></section>
<section class="section-pad faq-section" id="faq"><div class="container faq-grid"><div class="faq-intro reveal"><span class="eyebrow"><span></span>Frequently asked questions</span><h2>Direct answers before an engagement begins</h2><p>Scope, dependencies, evidence, and expected outcomes are clarified before implementation.</p><a class="button button-ghost" href="/en/contact/">Discuss your project ${icon("arrow", "button-icon")}</a></div>${faqBlock(englishHomeFaq)}</div></section>
<section class="section-pad final-cta" id="contact"><div class="container"><div class="cta-panel reveal"><div><span class="eyebrow"><span></span>Start with context</span><h2>Turn a complex technical problem into a clear delivery plan.</h2><p>Share your goal, current state, relevant links, constraints, and expected timing. Do not include passwords, verification codes, or API keys.</p></div><div class="cta-actions">${button(`${site.whatsapp}?text=${encodeURIComponent("Hello Eng. Eslam, I would like to discuss a digital project.")}`, "Start on WhatsApp", "button-light", true)}<a class="cta-phone" href="mailto:${site.email}">${site.email}</a></div></div></div></section>`;
  return page({ title: `${site.nameEn} | Cybersecurity & Software Engineer`, description: "Eslam Elshikh is a Riyadh-based cybersecurity engineer and software developer specializing in web development, AI agents, Google Maps, and technical SEO.", path: "/en/", active: "home", body, lang: "en", modified: site.lastUpdated, schema: [faqSchema(englishHomeFaq)], preloadImage: profilePhoto });
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
    const articleSlug = path.match(/^\/(?:en\/)?blog\/([^/]+)\/$/)?.[1];
    const lastmod = articleSlug ? postBySlug(articleSlug)?.modified || englishArticleBySlug(articleSlug)?.modified || site.lastUpdated : site.lastUpdated;
    const pair = routePair(path);
    const alternates = `<xhtml:link rel="alternate" hreflang="ar-SA" href="${absolute(pair.ar)}" /><xhtml:link rel="alternate" hreflang="en" href="${absolute(pair.en)}" /><xhtml:link rel="alternate" hreflang="x-default" href="${absolute(pair.ar)}" />`;
    return `  <url><loc>${absolute(path)}</loc><lastmod>${lastmod}</lastmod>${alternates}</url>`;
  }).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`;
}

function feedXml() {
  const items = allPosts.map((post) => `<item><title>${esc(post.title)}</title><link>${absolute(`/blog/${post.slug}/`)}</link><guid>${absolute(`/blog/${post.slug}/`)}</guid><pubDate>${new Date(`${post.date}T12:00:00Z`).toUTCString()}</pubDate><description>${esc(post.description)}</description></item>`).join("");
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>مدونة ${esc(site.brandName)}</title><link>${site.url}/blog/</link><description>${esc(site.description)}</description><language>ar-SA</language><lastBuildDate>${new Date(`${site.lastUpdated}T12:00:00Z`).toUTCString()}</lastBuildDate>${items}</channel></rss>`;
}

function englishFeedXml() {
  const items = englishArticles.map((post) => `<item><title>${esc(post.title)}</title><link>${absolute(`/en/blog/${post.slug}/`)}</link><guid>${absolute(`/en/blog/${post.slug}/`)}</guid><pubDate>${new Date(`${post.date}T12:00:00Z`).toUTCString()}</pubDate><description>${esc(post.description)}</description></item>`).join("");
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Eslam Elshikh Insights</title><link>${site.url}/en/blog/</link><description>Original English guidance on cybersecurity, software, AI, Google products, cloud architecture, SEO, and conversion.</description><language>en</language><lastBuildDate>${new Date(`${site.lastUpdated}T12:00:00Z`).toUTCString()}</lastBuildDate>${items}</channel></rss>`;
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
  await writeRoute("/local-seo/riyadh/", localSeoPage());
  await writeRoute("/about/", aboutPage());
  await writeRoute("/google-expert/", googleExpertPage());
  await writeRoute("/google-ads/", googleAdsPage());
  await writeRoute("/projects/", projectsPage());
  for (const project of projects.filter((item) => item.slug && item.caseStudy)) {
    await writeRoute(`/projects/${project.slug}/`, projectCaseStudyPage(project));
  }
  await writeRoute("/google-maps-projects/", googleMapsProjectsPage());
  await writeRoute("/google-business-profile-audit/", googleBusinessAuditPage());
  await writeRoute("/book/", bookingPage());
  await writeRoute("/local-visibility-dashboard/", localDashboardPage(), { index: false });
  await writeRoute("/blog/", blogIndexPage());
  for (const post of allPosts) await writeRoute(`/blog/${post.slug}/`, articlePage(post));
  for (const slug of Object.keys(topicDefinitions)) await writeRoute(`/blog/topics/${slug}/`, topicPage(slug));
  await writeRoute("/contact/", contactPage());
  await writeRoute("/privacy/", privacyPage());
  await writeRoute("/terms/", termsPage());
  await writeRoute("/en/services/", englishServicesIndexPage());
  for (const service of englishServices) await writeRoute(`/en/services/${service.slug}/`, englishServiceDetailPage(service));
  await writeRoute("/en/local-seo/riyadh/", englishLocalSeoPage());
  await writeRoute("/en/about/", englishAboutPage());
  await writeRoute("/en/google-expert/", englishGoogleExpertPage());
  await writeRoute("/en/google-ads/", englishGoogleAdsPage());
  await writeRoute("/en/projects/", englishProjectsPage());
  for (const project of projects.filter((item) => item.slug && item.caseStudy)) {
    await writeRoute(`/en/projects/${project.slug}/`, englishProjectCaseStudyPage(project));
  }
  await writeRoute("/en/google-maps-projects/", englishGoogleMapsProjectsPage());
  await writeRoute("/en/google-business-profile-audit/", englishGoogleBusinessAuditPage());
  await writeRoute("/en/book/", englishBookingPage());
  await writeRoute("/en/local-visibility-dashboard/", localDashboardPage("en"), { index: false });
  await writeRoute("/en/blog/", englishBlogIndexPage());
  for (const post of englishArticles) await writeRoute(`/en/blog/${post.slug}/`, englishArticlePage(post));
  for (const slug of Object.keys(englishTopics)) await writeRoute(`/en/blog/topics/${slug}/`, englishTopicPage(slug));
  await writeRoute("/en/contact/", englishContactPage());
  await writeRoute("/en/privacy/", englishPrivacyPage());
  await writeRoute("/en/terms/", englishTermsPage());
  await writeText("404.html", notFoundPage());

  await writeText("sitemap.xml", sitemapXml());
  await writeText("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`);
  await writeText("manifest.webmanifest", JSON.stringify({ name: site.brandName, short_name: site.nameAr, description: site.description, lang: "ar", dir: "rtl", start_url: "/", scope: "/", display: "standalone", background_color: "#06131f", theme_color: "#06131f", icons: [{ src: "/assets/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }, { src: "/assets/brand/eslam-elshikh-logo-transparent.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }] }, null, 2));
  await writeText("feed.xml", feedXml());
  await writeText(join("en", "feed.xml"), englishFeedXml());
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
    mainEntityOfPage: `${site.url}/about/#profile`,
    image: absolute(profilePhoto),
    telephone: site.phone,
    jobTitle: ["مهندس أمن سيبراني", "مطور برمجيات", "متخصص خرائط Google"],
    identifier: personIdentifier,
    sameAs: personSameAs,
    knowsAbout: [...services.map((service) => service.title), "خرائط Google", "Google Business Profile", "Google Search", "Google Search Console", "السيو المحلي", "إعلانات Google", "إدارة حملات Google Ads"]
  }, null, 2));
  await writeText("llms.txt", `# ${site.brandName}\n\n${site.description}\n\n## Verified public work\n- ${projectAudit.verifiedLiveProjects} unique live web projects, audited from ${projectAudit.githubRepositories} GitHub repositories and ${projectAudit.vercelProjects} Vercel projects on ${projectAudit.auditedAt}: ${absolute("/projects/")}\n- ${mapsProjects.length} public Google Maps examples: ${absolute("/google-maps-projects/")}\n\n## Core services\n${services.map((service) => `- ${service.title}: ${absolute(`/services/${service.slug}/`)}`).join("\n")}\n\n## Key pages\n- About: ${absolute("/about/")}\n- Google Maps specialist services: ${absolute("/google-expert/")}\n- Free Google Business Profile audit: ${absolute("/google-business-profile-audit/")}\n- Google Local Proof Engine: ${absolute("/google-maps-projects/")}\n- Book a consultation: ${absolute("/book/")}\n- Google Ads management: ${absolute("/google-ads/")}\n- Local SEO in Riyadh: ${absolute("/local-seo/riyadh/")}\n- Contact: ${absolute("/contact/")}\n`);
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
