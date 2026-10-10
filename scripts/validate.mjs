import { access, readFile, readdir } from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { posts, projects, mapsProjects, services } from "../src/content.mjs";
import { projectAudit, webProjects } from "../src/web-projects.mjs";
import { projectPreviews } from "../src/project-previews.mjs";
import { caseStudies } from "../src/case-studies.mjs";
import { products } from "../src/products.mjs";
import { guides } from "../src/guides.mjs";
import { articleVisuals } from "../src/article-visuals.mjs";
import { englishArticles, englishServices, englishTopics } from "../src/english.mjs";

const buildVersion = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8")).version;

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const dirArg = process.argv.find((arg) => arg.startsWith("--dir="));
const output = resolve(root, dirArg ? dirArg.slice(6) : "dist");
const canonicalBase = "https://www.eslam-elshikh.com";
const deprecatedCanonicalBase = "https://eslam-elshikh.com";
const errors = [];
const warnings = [];

const requiredRoutes = [
  "/", "/en/", "/services/", "/local-seo/riyadh/", "/about/", "/google-expert/", "/google-ads/", "/projects/", "/google-maps-projects/", "/google-business-profile-audit/", "/book/", "/blog/", "/contact/", "/privacy/", "/terms/",
  "/services/cybersecurity/", "/services/cloud-solutions/", "/services/ai-agents/", "/services/web-development/", "/services/google-support/", "/services/google-business-profile/", "/services/knowledge-bases/", "/services/seo/", "/services/digital-advertising/",
  "/blog/google-business-profile-suspension/", "/blog/secure-website-development/", "/blog/ecommerce-development-saudi/",
  "/blog/topics/google-business-profile/", "/blog/topics/local-seo-saudi/", "/blog/topics/cybersecurity/", "/blog/topics/ai-agents/", "/blog/topics/web-development/"
];
const expectedArticleRoutes = [...posts, ...guides].map((post) => `/blog/${post.slug}/`);
for (const route of expectedArticleRoutes) if (!requiredRoutes.includes(route)) requiredRoutes.push(route);
const expectedCaseStudyRoutes = caseStudies.map((project) => `/projects/${project.slug}/`);
for (const route of expectedCaseStudyRoutes) if (!requiredRoutes.includes(route)) requiredRoutes.push(route);
const expectedProductRoutes = ["/products/", ...products.map(product => `/products/${product.slug}/`)];
for (const route of expectedProductRoutes) requiredRoutes.push(route);
const arabicRoutes = [...requiredRoutes].filter((route) => route !== "/en/");
const englishMirrorRoute = (route) => route === "/" ? "/en/" : `/en${route}`;
const arabicMirrorRoute = (route) => route === "/en/" ? "/" : route.replace(/^\/en/, "") || "/";
for (const route of arabicRoutes.map(englishMirrorRoute)) if (!requiredRoutes.includes(route)) requiredRoutes.push(route);
const expectedEnglishArticleRoutes = englishArticles.map((post) => `/en/blog/${post.slug}/`);
const expectedEnglishCaseStudyRoutes = expectedCaseStudyRoutes.map(englishMirrorRoute);

const routeFile = (route) => route === "/" ? join(output, "index.html") : join(output, route.replace(/^\//, "").replace(/\/$/, ""), "index.html");
const normalizeRoute = (route) => route === "/" ? "/" : `/${route.replace(/^\//, "").replace(/\/$/, "")}/`;
const textContent = (html) => html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&[a-zA-Z#0-9]+;/g, " ").replace(/\s+/g, " ").trim();
const matchOne = (html, regex) => html.match(regex)?.[1]?.trim() || "";
const wordCount = (html) => textContent(html).split(/\s+/).filter(Boolean).length;
const articleCore = (html) => matchOne(html, /<article\s+class=["'][^"']*\barticle-content\b[^"']*["'][^>]*>([\s\S]*?)<\/article>/i);
const schemaNodes = (html) => [...html.matchAll(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi)]
  .flatMap((match) => {
    try {
      const value = JSON.parse(match[1]);
      return Array.isArray(value?.["@graph"]) ? value["@graph"] : [value];
    } catch {
      return [];
    }
  });
const shingles = (html, size = 5) => {
  const words = textContent(html).split(/\s+/).filter(Boolean);
  const values = new Set();
  for (let index = 0; index + size <= words.length; index += 1) values.add(words.slice(index, index + size).join(" "));
  return values;
};

async function exists(path) {
  try { await access(path); return true; } catch { return false; }
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else files.push(path);
  }
  return files;
}

function routeFromFile(file) {
  const normalized = relative(output, file).split(sep).join("/");
  if (normalized === "index.html") return "/";
  if (!normalized.endsWith("/index.html") || normalized.startsWith("assets/") || normalized.startsWith(".")) return null;
  return `/${normalized.slice(0, -"index.html".length)}`;
}

const sitemapPath = join(output, "sitemap.xml");
const sitemap = await readFile(sitemapPath, "utf8").catch(() => "");
if (!sitemap) errors.push("Missing sitemap.xml");

const sitemapEntries = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/gi)].map((match) => ({
  loc: matchOne(match[1], /<loc>([^<]+)<\/loc>/i),
  lastmod: matchOne(match[1], /<lastmod>([^<]+)<\/lastmod>/i),
  alternates: [...match[1].matchAll(/<xhtml:link\s+rel=["']alternate["']\s+hreflang=["']([^"']+)["']\s+href=["']([^"']+)["']\s*\/>/gi)]
    .map((alternate) => ({ hreflang: alternate[1], href: alternate[2] }))
}));
const sitemapRoutes = [];
const seenLocations = new Set();
const today = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Riyadh",
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
}).format(new Date());

for (const entry of sitemapEntries) {
  if (!entry.loc.startsWith(`${canonicalBase}/`)) errors.push(`Sitemap URL is not canonical: ${entry.loc}`);
  if (seenLocations.has(entry.loc)) errors.push(`Duplicate sitemap URL: ${entry.loc}`);
  seenLocations.add(entry.loc);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.lastmod)) errors.push(`Invalid sitemap lastmod for ${entry.loc}: ${entry.lastmod || "missing"}`);
  else if (entry.lastmod > today) errors.push(`Future sitemap lastmod for ${entry.loc}: ${entry.lastmod}`);
  try { sitemapRoutes.push(normalizeRoute(new URL(entry.loc).pathname)); }
  catch { errors.push(`Invalid sitemap URL: ${entry.loc}`); }
}

if (!/xmlns:xhtml=["']http:\/\/www\.w3\.org\/1999\/xhtml["']/.test(sitemap)) errors.push("Sitemap is missing the xhtml namespace for language alternates");
if (/<(?:changefreq|priority)>/i.test(sitemap)) errors.push("Sitemap contains changefreq or priority fields that Google ignores");
for (const route of requiredRoutes) {
  const loc = `${canonicalBase}${route}`;
  const entry = sitemapEntries.find((item) => item.loc === loc);
  const alternates = new Map((entry?.alternates || []).map((item) => [item.hreflang, item.href]));
  const arabicRoute = route.startsWith("/en/") ? arabicMirrorRoute(route) : route;
  const englishRoute = route.startsWith("/en/") ? route : englishMirrorRoute(route);
  const expectedAlternates = new Map([
    ["ar-SA", `${canonicalBase}${arabicRoute}`],
    ["en", `${canonicalBase}${englishRoute}`],
    ["x-default", `${canonicalBase}${arabicRoute}`]
  ]);
  for (const [hreflang, href] of expectedAlternates) {
    if (alternates.get(hreflang) !== href) errors.push(`Sitemap ${route} is missing reciprocal ${hreflang} alternate ${href}`);
  }
}

for (const route of requiredRoutes) if (!sitemapRoutes.includes(route)) errors.push(`Sitemap missing required route ${route}`);

const htmlFiles = (await walk(output)).filter((file) => file.endsWith("index.html"));
const publicRoutes = [...new Set(htmlFiles.map(routeFromFile).filter(Boolean))].sort();
for (const route of publicRoutes) {
  if (sitemapRoutes.includes(route)) continue;
  const html = await readFile(routeFile(route), "utf8").catch(() => "");
  if (!/<meta\s+name=["']robots["']\s+content=["'][^"']*noindex/i.test(html)) {
    errors.push(`Indexable public HTML route is absent from sitemap: ${route}`);
  }
}
for (const route of sitemapRoutes) if (!publicRoutes.includes(route)) errors.push(`Sitemap lists a missing HTML route: ${route}`);

const vercelConfig = JSON.parse(await readFile(join(root, "vercel.json"), "utf8"));
const globalHeaders = vercelConfig.headers?.find((entry) => entry.source === "/(.*)")?.headers || [];
const contentSecurityPolicy = globalHeaders.find((header) => header.key.toLowerCase() === "content-security-policy")?.value || "";
if (!/frame-src[^;]*https:\/\/www\.google\.com\b/.test(contentSecurityPolicy)) {
  errors.push("Global Content-Security-Policy does not permit the Google Maps embed origin");
}
if (/['\"]unsafe-inline['\"]/.test(contentSecurityPolicy)) errors.push("Global Content-Security-Policy still permits unsafe-inline resources");
if (!/form-action\s+'none'/.test(contentSecurityPolicy)) errors.push("Global Content-Security-Policy must block native form submissions");
for (const redirect of vercelConfig.redirects || []) {
  if (vercelConfig.trailingSlash && (!redirect.source.endsWith("/") || !redirect.destination.endsWith("/"))) {
    errors.push(`Redirect must use trailing-slash paths when trailingSlash is enabled: ${redirect.source} -> ${redirect.destination}`);
  }
}
const redirects = new Map((vercelConfig.redirects || []).map((redirect) => [normalizeRoute(redirect.source), normalizeRoute(redirect.destination)]));
const requiredConsolidationRedirects = new Map([
  ["/local-seo/", "/local-seo/riyadh/"],
  ["/blog/ai-agent-business/", "/blog/ai-agents-for-business-saudi/"]
]);
for (const [source, destination] of requiredConsolidationRedirects) {
  if (redirects.get(source) !== destination) errors.push(`Missing SEO consolidation redirect: ${source} -> ${destination}`);
}
for (const [source, destination] of redirects) {
  if (sitemapRoutes.includes(source)) errors.push(`Redirect source must not be in sitemap: ${source}`);
  if (!publicRoutes.includes(destination)) errors.push(`Redirect target is not a public HTML route: ${source} -> ${destination}`);
}

const pages = new Map();
const titles = new Map();
const descriptions = new Map();

for (const route of sitemapRoutes) {
  const file = routeFile(route);
  if (!(await exists(file))) continue;
  const html = await readFile(file, "utf8");
  pages.set(route, html);

  if (html.includes(deprecatedCanonicalBase)) errors.push(`${route}: contains deprecated non-www canonical references`);

  const title = matchOne(html, /<title>([\s\S]*?)<\/title>/i);
  const description = matchOne(html, /<meta\s+name=["']description["']\s+content=["']([^"']*)/i);
  const canonical = matchOne(html, /<link\s+rel=["']canonical["']\s+href=["']([^"']*)/i);
  const robots = matchOne(html, /<meta\s+name=["']robots["']\s+content=["']([^"']*)/i);
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  const viewportCount = (html.match(/<meta\s+name=["']viewport["']/gi) || []).length;
  const words = wordCount(html);
  const structuredNodes = schemaNodes(html);

  if (!/^<!doctype html>/i.test(html)) errors.push(`${route}: missing HTML5 doctype`);
  if (!/<html\s+lang=["'](?:ar|en)["']\s+dir=["'](?:rtl|ltr)["']/i.test(html)) errors.push(`${route}: missing correct lang/dir attributes`);
  if (route.startsWith("/en/") && !/<html\s+lang=["']en["']\s+dir=["']ltr["']/i.test(html)) errors.push(`${route}: English route must declare lang=en and dir=ltr`);
  if (!route.startsWith("/en/") && !/<html\s+lang=["']ar["']\s+dir=["']rtl["']/i.test(html)) errors.push(`${route}: Arabic route must declare lang=ar and dir=rtl`);
  if (viewportCount !== 1) errors.push(`${route}: expected one viewport meta, found ${viewportCount}`);
  if (h1Count !== 1) errors.push(`${route}: expected exactly one H1, found ${h1Count}`);
  if (!title) errors.push(`${route}: missing title`);
  if (title.length < 12 || title.length > 65) warnings.push(`${route}: title length ${title.length}`);
  if (!description) errors.push(`${route}: missing meta description`);
  if (description.length < 110 || description.length > 170) warnings.push(`${route}: description length ${description.length}`);
  if (!robots || !/\bindex\b/i.test(robots) || !/\bfollow\b/i.test(robots) || /\bnoindex\b/i.test(robots)) errors.push(`${route}: invalid robots directive (${robots || "missing"})`);
  if (canonical !== `${canonicalBase}${route}`) errors.push(`${route}: canonical mismatch (${canonical})`);
  const headAlternates = new Map([...html.matchAll(/<link\s+rel=["']alternate["']\s+hreflang=["']([^"']+)["']\s+href=["']([^"']+)["']/gi)].map((match) => [match[1], match[2]]));
  const arabicAlternateRoute = route.startsWith("/en/") ? arabicMirrorRoute(route) : route;
  const englishAlternateRoute = route.startsWith("/en/") ? route : englishMirrorRoute(route);
  for (const [hreflang, href] of [["ar-SA", `${canonicalBase}${arabicAlternateRoute}`], ["en", `${canonicalBase}${englishAlternateRoute}`], ["x-default", `${canonicalBase}${arabicAlternateRoute}`]]) {
    if (headAlternates.get(hreflang) !== href) errors.push(`${route}: missing head hreflang ${hreflang} alternate ${href}`);
  }
  if (!html.includes(`<link rel="sitemap" type="application/xml" href="${canonicalBase}/sitemap.xml">`)) errors.push(`${route}: missing canonical sitemap discovery link`);
  if (!/<meta\s+property=["']og:title["']/i.test(html) || !/<meta\s+name=["']twitter:card["']/i.test(html)) errors.push(`${route}: incomplete social metadata`);
  if (!/<script\s+type=["']application\/ld\+json["']>/i.test(html)) errors.push(`${route}: missing JSON-LD`);
  const personNode = structuredNodes.find((node) => node?.["@type"] === "Person");
  const professionalServiceNode = structuredNodes.find((node) => node?.["@type"] === "ProfessionalService");
  const expectedProfessionalName = route.startsWith("/en/") ? "Eslam Elshikh" : "المهندس إسلام الشيخ";
  if (personNode?.image !== `${canonicalBase}/assets/brand/eslam-elshikh-portrait-20260827.webp`) errors.push(`${route}: Person schema must use the canonical profile portrait`);
  if (professionalServiceNode?.name !== expectedProfessionalName || professionalServiceNode?.url !== `${canonicalBase}/`) errors.push(`${route}: ProfessionalService identity is inconsistent with the public brand`);
  if (!/<link\s+rel=["']stylesheet["']\s+href=["']\/assets\/css\/main\.css\?v=/i.test(html)) errors.push(`${route}: missing versioned main stylesheet`);
  const stylesheetCount = (html.match(/<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi) || []).length;
  const growthStyleRoutes = new Set(["/book/", "/google-business-profile-audit/", "/google-maps-projects/", "/en/book/", "/en/google-business-profile-audit/", "/en/google-maps-projects/"]);
  if (!/<link\s+rel=["']stylesheet["']\s+href=["']\/assets\/css\/studio\.css\?v=/i.test(html)) errors.push(`${route}: missing versioned studio stylesheet`);
  const hasProjectGallery = /^(\/en)?\/projects\//.test(route);
  const hasProjectStories = /^(\/en)?\/(projects|products)\//.test(route);
  const hasMapsExhibition = /class="[^"]*\bmaps-(?:exhibit-hero|portfolio-teaser|sample-card)\b/.test(html);
  const hasWorkEvidence = /^(\/en)?\/(projects|products|google-maps-projects|work-evidence)\//.test(route);
  const hasCrmStudio = ["/projects/", "/en/projects/"].includes(route) || /^(\/en)?\/products\//.test(route) || /^(\/en)?\/services\/crm-systems\//.test(route);
  const hasCrmShowcase = /^(\/en)?\/services\/crm-systems\/$/.test(route);
  const hasServiceStudio = ["/services/", "/en/services/"].includes(route);
  const hasVerifiedCase = caseStudies.some(study => study.proof && [`/projects/${study.slug}/`, `/en/projects/${study.slug}/`].includes(route));
  const hasHomeMagic = route === "/" || route === "/en/";
  const expectedStylesheets = Number(hasHomeMagic) + Number(hasVerifiedCase) + Number(hasCrmShowcase) + Number(hasServiceStudio) + Number(hasCrmStudio) + Number(hasWorkEvidence) + 2 + Number(hasMapsExhibition) + Number(route === "/about/" || growthStyleRoutes.has(route)) + Number(hasProjectGallery) + Number(hasProjectStories);
  if (hasHomeMagic && (!html.includes('/assets/css/home-magic.css?v=') || !html.includes('/assets/js/home-magic.js?v='))) errors.push(`${route}: missing versioned home experience assets`);
  if (hasVerifiedCase && !html.includes("/assets/css/case-results.css?v=")) errors.push(`${route}: missing the versioned results stylesheet`);
  if (hasProjectGallery && !html.includes(`/assets/css/project-gallery.css?v=${buildVersion}`)) errors.push(`${route}: missing versioned project gallery stylesheet`);
  if (hasProjectStories && !html.includes(`/assets/css/project-stories.css?v=${buildVersion}`)) errors.push(`${route}: missing versioned case and product stylesheet`);
  if (hasMapsExhibition && !html.includes(`/assets/css/maps-exhibition.css?v=${buildVersion}`)) errors.push(`${route}: missing versioned Google Maps exhibition stylesheet`);
  if (hasWorkEvidence && !html.includes(`/assets/css/work-evidence.css?v=${buildVersion}`)) errors.push(`${route}: missing versioned work evidence stylesheet`);
  if (hasCrmShowcase && !html.includes('/assets/css/crm-showcase.css?v=')) errors.push(`${route}: missing versioned CRM showcase stylesheet`);
  if (stylesheetCount !== expectedStylesheets) errors.push(`${route}: expected ${expectedStylesheets} stylesheet link(s), found ${stylesheetCount}`);
  if (/improvements\.css|brand\.css|seo-cro\.css/.test(html)) errors.push(`${route}: references legacy CSS`);
  if (/<script\b(?![^>]*\bsrc=)(?![^>]*\btype=["']application\/ld\+json["'])[^>]*>/i.test(html)) errors.push(`${route}: contains executable inline JavaScript`);
  if (/<style\b|\sstyle=["']/i.test(html)) errors.push(`${route}: contains inline CSS that weakens the CSP`);
  if (!html.includes(`/assets/js/theme.js?v=${buildVersion}`) || !html.includes(`/assets/js/analytics.js?v=${buildVersion}`)) errors.push(`${route}: missing versioned theme or consent-based analytics script`);
  const articleVisual = articleVisuals[route.match(/^\/(?:en\/)?blog\/([^/]+)\/$/)?.[1]];
  const storyRoute = route.match(/^\/(?:en\/)?(projects|products)\/([^/]+)\/$/);
  const story = storyRoute?.[1] === "projects" ? caseStudies.find(item => item.slug === storyRoute[2])
    : storyRoute?.[1] === "products" ? products.find(item => item.slug === storyRoute[2]) : null;
  const expectedShareImage = `${canonicalBase}${articleVisual?.src || story?.image || "/assets/og/eslam-elshikh-social-card.png"}`;
  const socialImage = matchOne(html, /<meta\s+property=["']og:image["']\s+content=["']([^"']*)/i);
  const twitterImage = matchOne(html, /<meta\s+name=["']twitter:image["']\s+content=["']([^"']*)/i);
  if (socialImage !== expectedShareImage || twitterImage !== expectedShareImage) errors.push(`${route}: social metadata does not use its expected sharing image`);
  if (story && (!html.includes('property="og:image:type" content="image/webp"') || !html.includes('property="og:image:height" content="750"'))) errors.push(`${route}: incorrect project sharing-image format or dimensions`);
  if (articleVisual) {
    const articleNode = structuredNodes.find((node) => node?.["@type"] === "BlogPosting");
    if (articleNode?.image !== expectedShareImage) errors.push(`${route}: article schema image does not match its custom cover`);
    for (const asset of [articleVisual.src, articleVisual.small]) {
      const bytes = await readFile(join(output, asset.slice(1))).catch(() => null);
      if (!bytes || bytes.length < 20 || bytes.toString("ascii", 0, 4) !== "RIFF" || bytes.toString("ascii", 8, 12) !== "WEBP") errors.push(`${route}: missing or invalid WebP article illustration ${asset}`);
    }
    if (!html.includes('class="container article-cover"')) errors.push(`${route}: custom cover is missing from the visible article`);
  }
  if (/https:\/\/(?:i\.ibb\.co|avatars\.githubusercontent\.com)/i.test(html)) errors.push(`${route}: references a legacy third-party image host`);
  for (const image of html.matchAll(/<img\b([^>]*)>/gi)) {
    if (!/\bwidth=["']\d+["']/i.test(image[1]) || !/\bheight=["']\d+["']/i.test(image[1])) errors.push(`${route}: image is missing explicit width and height`);
  }
  if (!/<main\s+id=["']main["']>/i.test(html)) errors.push(`${route}: missing main landmark`);
  if (!/<footer\s+class=["']site-footer["']>/i.test(html)) errors.push(`${route}: missing footer`);
  if (route === "/about/") {
    if (!/class=["'][^"']*\babout-hero-actions\b/i.test(html) || !/class=["'][^"']*\babout-quick-facts\b/i.test(html)) errors.push(`${route}: missing contextual hero actions or quick facts`);
    const caseStudyCount = (html.match(/class=["'][^"']*\babout-case-card\b/gi) || []).length;
    if (caseStudyCount !== 3) errors.push(`${route}: expected exactly 3 featured case studies, found ${caseStudyCount}`);
    if (!/class=["'][^"']*\babout-h1-line\b/i.test(html) || /إسلام الشيخ\.<br/i.test(html)) errors.push(`${route}: H1 text separation is not accessible`);
    if (/<article\b[^>]*\brole=["']tabpanel["']/i.test(html)) errors.push(`${route}: tabpanel uses an incompatible article element`);
    if (!/مهندس أمن سيبراني ومطور مواقع وبرمجيات في الرياض/.test(html)) errors.push(`${route}: hero is missing its primary location and service intent`);
    if (!/الهندسةُ الحقّة لا تتباهى بذكائها/.test(html) || /الهندسة الجيدة لا تجعل الحل يبدو أذكى/.test(html)) errors.push(`${route}: engineering quote was not upgraded`);
    if (!html.includes('"relatedLink"')) errors.push(`${route}: ProfilePage schema does not reference the featured case studies`);
    if (!/class=["'][^"']*\babout-name-registry\b/i.test(html)) errors.push(`${route}: missing the visible Arabic and English identity registry`);
    for (const identityName of ["المهندس إسلام الشيخ", "المهندس اسلام الشيخ", "اسلام الشيخ", "Eslam Elshikh", "Islam Elshikh"]) {
      if (!html.includes(identityName)) errors.push(`${route}: missing identity spelling ${identityName}`);
    }
  }
  if (route === "/about/" || route === "/en/about/") {
    const profilePages = structuredNodes.filter((node) => node?.["@type"] === "ProfilePage");
    const duplicateWebPages = structuredNodes.filter((node) => node?.["@type"] === "WebPage" && node?.url === `${canonicalBase}${route}`);
    if (profilePages.length !== 1) errors.push(`${route}: expected exactly one ProfilePage node, found ${profilePages.length}`);
    if (duplicateWebPages.length) errors.push(`${route}: ProfilePage must not be duplicated by a second WebPage node`);
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/.test(profilePages[0]?.dateModified || "")) errors.push(`${route}: ProfilePage dateModified must be a timezone-qualified DateTime`);
    if (profilePages[0]?.mainEntity?.["@id"] !== `${canonicalBase}/#person`) errors.push(`${route}: ProfilePage mainEntity must reference the canonical Person`);
    if (!html.includes(`rel="preload" as="image" href="${canonicalBase}/assets/brand/eslam-elshikh-portrait-20260827.webp"`)) errors.push(`${route}: profile portrait is not preloaded`);
  }
  const breadcrumbNodes = structuredNodes.filter((node) => node?.["@type"] === "BreadcrumbList");
  for (const breadcrumbNode of breadcrumbNodes) {
    if (!breadcrumbNode["@id"]?.endsWith("#breadcrumb")) errors.push(`${route}: BreadcrumbList is missing its stable @id`);
    const pageNode = structuredNodes.find((node) => ["WebPage", "ProfilePage", "BlogPosting", "CollectionPage"].includes(node?.["@type"]) && node?.url === `${canonicalBase}${route}`);
    if (pageNode?.breadcrumb?.["@id"] !== breadcrumbNode["@id"]) errors.push(`${route}: page schema does not reference its BreadcrumbList`);
  }
  const isArticle = /^\/(?:en\/)?blog\/[^/]+\/$/.test(route);
  if (isArticle) {
    const coreWords = wordCount(articleCore(html));
    if (coreWords < 450) errors.push(`${route}: core article content is too thin (${coreWords} words; expected at least 450)`);
    for (const className of ["header-tools", "footer-grid", "floating-contact", "article-author-card"]) {
      if (!new RegExp(`class=["'][^"']*\\b${className}\\b`, "i").test(html)) errors.push(`${route}: article is missing the standard ${className} shell`);
    }
    const faqCount = (html.match(/<details\s+class="reveal"/g) || []).length;
    if (faqCount !== 4) errors.push(`${route}: expected exactly 4 topic-specific FAQ entries, found ${faqCount}`);
    if (!html.includes('"@type":"FAQPage"')) errors.push(`${route}: missing FAQPage structured data`);
    if (!html.includes('"@type":"BlogPosting"')) errors.push(`${route}: missing BlogPosting structured data`);
    if (!/<meta\s+name=["']keywords["']/i.test(html)) errors.push(`${route}: missing article keyword metadata`);
    const topicPath = html.match(/href=["'](\/(?:en\/)?blog\/topics\/[^"']+\/)["']/i)?.[1];
    if (!topicPath) errors.push(`${route}: missing a crawlable topic-hub link`);
    else if (!html.includes(`"item":"${canonicalBase}${topicPath}"`)) errors.push(`${route}: topic hub is absent from BreadcrumbList structured data`);
  }

  for (const match of html.matchAll(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi)) {
    try { JSON.parse(match[1]); } catch (error) { errors.push(`${route}: invalid JSON-LD (${error.message})`); }
  }

  if (title) {
    if (titles.has(title)) warnings.push(`${route}: duplicate title with ${titles.get(title)}`);
    else titles.set(title, route);
  }
  if (description) {
    if (descriptions.has(description)) warnings.push(`${route}: duplicate description with ${descriptions.get(description)}`);
    else descriptions.set(description, route);
  }
  if (/^\/(?:en\/)?services\/[^/]+\/$/.test(route) && words < 520) warnings.push(`${route}: service page is shorter than 520 words (${words})`);
}

const linkedFiles = new Set(["/feed.xml", "/en/feed.xml", "/manifest.webmanifest", "/sitemap.xml", "/robots.txt", "/profile.json", "/llms.txt", "/humans.txt", "/favicon.ico", "/.well-known/security.txt"]);
for (const [route, html] of pages) {
  for (const match of html.matchAll(/href=["']([^"']+)["']/gi)) {
    const href = match[1];
    if (!href.startsWith("/") || href.startsWith("//")) continue;
    const clean = href.split("#")[0].split("?")[0];
    if (!clean) continue;
    if (clean.startsWith("/assets/")) {
      if (!(await exists(join(output, clean.replace(/^\//, ""))))) errors.push(`${route}: missing asset ${clean}`);
      continue;
    }
    if (linkedFiles.has(clean)) {
      if (!(await exists(join(output, clean.replace(/^\//, ""))))) errors.push(`${route}: missing linked file ${clean}`);
      continue;
    }
    const targetRoute = normalizeRoute(clean);
    if (redirects.has(targetRoute)) errors.push(`${route}: internal link points to redirect source ${href}`);
    if (!(await exists(routeFile(targetRoute)))) errors.push(`${route}: broken internal link ${href}`);
  }
}

for (const required of ["robots.txt", "manifest.webmanifest", "feed.xml", "en/feed.xml", "profile.json", "llms.txt", "llms-full.txt", "humans.txt", "CNAME", ".well-known/security.txt", "404.html"]) {
  if (!(await exists(join(output, required)))) errors.push(`Missing generated file: ${required}`);
}
const notFound = await readFile(join(output, "404.html"), "utf8").catch(() => "");
const notFoundRobots = matchOne(notFound, /<meta\s+name=["']robots["']\s+content=["']([^"']*)/i);
if (!/\bnoindex\b/i.test(notFoundRobots) || !/\bfollow\b/i.test(notFoundRobots)) errors.push(`404 page must use noindex, follow (${notFoundRobots || "missing"})`);

for (const publicFile of ["sitemap.xml", "robots.txt", "feed.xml", "en/feed.xml", "profile.json", "llms.txt", "llms-full.txt", ".well-known/security.txt"]) {
  const content = await readFile(join(output, publicFile), "utf8").catch(() => "");
  if (content.includes(deprecatedCanonicalBase)) errors.push(`${publicFile}: contains deprecated non-www canonical references`);
  if (/\+966547194788|054\s*719\s*4788/.test(content)) errors.push(`${publicFile}: contains the retired developer phone number`);
}

const profileJson = await readFile(join(output, "profile.json"), "utf8").then(JSON.parse).catch(() => null);
if (!profileJson || profileJson["@id"] !== `${canonicalBase}/#person`) errors.push("profile.json is missing the canonical Person @id");
for (const identityName of ["المهندس إسلام الشيخ", "المهندس اسلام الشيخ", "المهندس إسلام", "المهندس اسلام", "اسلام الشيخ", "إسلام الشيخ", "إسلام الشيخ | Eslam Elshikh", "Eslam Elshikh", "ESLAM ELSHIKH", "Islam Elshikh", "ISLAM ELSHIKH"]) {
  if (!profileJson?.alternateName?.includes(identityName)) errors.push(`profile.json is missing alternateName ${identityName}`);
}
if (profileJson?.telephone !== "+966579395299") errors.push("profile.json does not use the confirmed primary phone number");

const robotsText = await readFile(join(output, "robots.txt"), "utf8").catch(() => "");
if (!robotsText.includes(`Sitemap: ${canonicalBase}/sitemap.xml`)) errors.push("robots.txt does not reference the canonical sitemap");
if (!/User-agent:\s*\*[\s\S]*Allow:\s*\//i.test(robotsText)) errors.push("robots.txt does not allow public crawling");
if (/^Host:/im.test(robotsText)) errors.push("robots.txt contains the unsupported Host directive");

const home = pages.get("/") || "";
if ((home.match(/\bdata-home-catalog-link\b/g) || []).length !== services.length) errors.push("Homepage does not render the complete service catalog");
if ((home.match(/aria-label=["']تفاصيل خدمة /g) || []).length !== services.length) errors.push("Homepage service detail links need unique accessible labels");
for (const service of services) {
  if (!home.includes(`href="/services/${service.slug}/" aria-label="تفاصيل خدمة `)) errors.push(`Homepage service directory is missing /services/${service.slug}/`);
}
if (/<script\b[^>]*\bsrc=["']https:\/\/www\.googletagmanager\.com/i.test(home)) errors.push("Homepage loads Google Analytics before consent");
const homeMetrics = matchOne(home, /<div\s+class="container stats-bar reveal">([\s\S]*?)<\/div>/);
if (![472, 233, mapsProjects.length, projectAudit.listedProjects].every(value => new RegExp(`<strong\\b[^>]*>${value}<\\/strong>`).test(homeMetrics))) errors.push(`Homepage trust metrics are missing the 472/233/${mapsProjects.length}/${projectAudit.listedProjects} figures`);
if (!/href=["']\/local-seo\/riyadh\/["']/.test(home)) errors.push("Homepage needs a direct internal link to /local-seo/riyadh/");
if (wordCount(home) < 900) warnings.push(`Homepage content is shorter than 900 words (${wordCount(home)})`);
for (const [route, html] of pages) {
  if (/\+966547194788|054\s*719\s*4788/.test(html)) errors.push(`${route}: contains the retired developer phone number`);
}

const projectsPageHtml = pages.get("/projects/") || "";
if (!projectsPageHtml.includes('"@type":"CollectionPage"') || !projectsPageHtml.includes('"@id":"https://www.eslam-elshikh.com/projects/#project-list"')) {
  errors.push("Projects page is missing CollectionPage and ItemList identity evidence");
}
const workCardCount = (projectsPageHtml.match(/\bdata-work-card(?:\s|>)/g) || []).length;
if (workCardCount !== webProjects.length) errors.push(`Projects page renders ${workCardCount} verified work cards; expected ${webProjects.length}`);
if (!projectsPageHtml.includes(`"numberOfItems":${webProjects.length}`)) errors.push(`Projects ItemList does not declare ${webProjects.length} items`);
for (const marker of ["data-work-search", "data-work-filter=\"all\"", "data-work-more", `${projectAudit.githubRepositories} مستودعًا على GitHub`, `${projectAudit.vercelProjects} مشروعًا على Vercel`]) {
  if (!projectsPageHtml.includes(marker)) errors.push(`Projects page is missing verified archive marker: ${marker}`);
}
const englishProjectsPageHtml = pages.get("/en/projects/") || "";
if (!englishProjectsPageHtml.includes('"@type":"CollectionPage"') || !englishProjectsPageHtml.includes('"@id":"https://www.eslam-elshikh.com/en/projects/#project-list"')) {
  errors.push("English projects page is missing CollectionPage and ItemList identity evidence");
}
const englishWorkCardCount = (englishProjectsPageHtml.match(/\bdata-work-card(?:\s|>)/g) || []).length;
if (englishWorkCardCount !== webProjects.length) errors.push(`English projects page renders ${englishWorkCardCount} verified work cards; expected ${webProjects.length}`);
if (!englishProjectsPageHtml.includes(`"numberOfItems":${webProjects.length}`)) errors.push(`English projects ItemList does not declare ${webProjects.length} items`);
for (const marker of ["data-work-search", "data-work-filter=\"all\"", "data-work-more", `${projectAudit.listedProjects} web projects in the portfolio`]) {
  if (!englishProjectsPageHtml.includes(marker)) errors.push(`English projects page is missing verified archive marker: ${marker}`);
}
const uniqueLiveUrls = new Set(webProjects.map((project) => project.liveUrl));
if (uniqueLiveUrls.size !== webProjects.length) errors.push(`Verified work data contains ${webProjects.length - uniqueLiveUrls.size} duplicate live URL(s)`);
for (const project of webProjects) {
  const preview = projectPreviews[project.liveUrl];
  if (!preview?.src?.startsWith("/assets/projects/") || !preview.src.endsWith(".webp")) {
    errors.push(`Project is missing a self-hosted preview: ${project.title}`);
    continue;
  }
  try { await access(join(output, preview.src)); } catch { errors.push(`Project preview file is missing: ${preview.src}`); }
}
for (const [route, html] of [["/projects/", projectsPageHtml], ["/en/projects/", englishProjectsPageHtml]]) {
  const previewCount = (html.match(/\bdata-work-preview(?:\s|>)/g) || []).length;
  if (previewCount !== webProjects.length) errors.push(`${route}: expected ${webProjects.length} image previews, found ${previewCount}`);
  if (!html.includes('data-work-dialog aria-labelledby="work-preview-title"')) errors.push(`${route}: project preview dialog is missing its accessible title`);
}
for (const [route, html] of pages) {
  const mapSectionCount = (html.match(/id="google-business-map"/g) || []).length;
  if (mapSectionCount !== 1) errors.push(`${route}: expected one sitewide Google Maps section, found ${mapSectionCount}`);
  if (!html.includes("www.google.com/maps?q=6619%20%D8%A3%D8%A8%D9%8A%20%D8%B2%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A8%D9%84%D8%AE%D9%8A%D8%8C%20%D8%AD%D9%8A%20%D8%A7%D9%84%D9%85%D8%B5%D9%8A%D9%81%D8%8C%20%D8%A7%D9%84%D8%B1%D9%8A%D8%A7%D8%B6%2012465&amp;z=16&amp;output=embed")) errors.push(`${route}: Google Maps embed must use the verified Al Masif office address at zoom 16`);
  if (!html.includes('referrerpolicy="strict-origin-when-cross-origin"')) errors.push(`${route}: Google Maps embed is missing its referrer policy`);
  if (!html.includes("https://maps.app.goo.gl/EbiR3AKJEZhkbMn66")) errors.push(`${route}: missing direct Google Business Profile link`);
  if (!html.includes('width="600" height="450"')) errors.push(`${route}: map embed does not preserve the supplied iframe dimensions`);
  if (!/id="google-business-map"[\s\S]*<\/section><\/main><footer class="site-footer">/.test(html)) errors.push(`${route}: sitewide map is not placed immediately before the footer`);
}
for (const route of expectedCaseStudyRoutes) {
  const html = pages.get(route) || "";
  if (!html.includes('"@type":"CreativeWork"')) errors.push(`${route}: missing CreativeWork structured data`);
  const proof = caseStudies.find(study => `/projects/${study.slug}/` === route)?.proof;
  if (proof) validateVerifiedCaseEvidence(route, html, proof);
  else if (!html.includes("لا تتضمن هذه الدراسة أرقام زيارات أو تحويلات")) errors.push(`${route}: missing the evidence boundary for unverified business outcomes`);
  for (const section of ["brief", "solution", "experience", "decisions", "output"]) if (!html.includes(`id="${section}"`)) errors.push(`${route}: missing case study section ${section}`);
}

for (const english of [false, true]) {
  const prefix = english ? "/en" : "";
  const archive = pages.get(`${prefix}/projects/`) || "";
  if ((archive.match(/class="work-card-case"/g) || []).length !== caseStudies.length) errors.push(`${prefix}/projects/: every project needs a case-study action`);
  for (const study of caseStudies) {
    const html = pages.get(`${prefix}/projects/${study.slug}/`) || "";
    if (!html.includes(`data-case-study="${study.slug}"`)) errors.push(`${study.slug}: missing dedicated case content`);
    if (!html.includes(study.image)) errors.push(`${study.slug}: missing project interface`);
    if (!archive.includes(`href="${prefix}/projects/${study.slug}/"`)) errors.push(`${study.slug}: missing archive link`);
  }
  for (const product of products) {
    const route = `${prefix}/products/${product.slug}/`;
    const html = pages.get(route) || "";
    if (!html.includes(`data-product="${product.slug}"`)) errors.push(`${route}: missing dedicated product story`);
    if ((html.match(/data-product-panel=/g) || []).length !== product.tour.length) errors.push(`${route}: missing public tour views`);
    if (/data-product-panel=[^>]*\bhidden\b/.test(html)) errors.push(`${route}: tour must be readable without JavaScript`);
    if (product.stage === "concept" && !html.includes(english ? "Interactive product concept" : "تصور منتج تفاعلي")) errors.push(`${route}: concept delivery stage must be explicit`);
    for (const view of product.tour) if (!await exists(join(output, view.image.slice(1)))) errors.push(`${route}: missing product tour image ${view.image}`);
  }
}
for (const route of expectedEnglishCaseStudyRoutes) {
  const html = pages.get(route) || "";
  if (!html.includes('"@type":"CreativeWork"')) errors.push(`${route}: missing CreativeWork structured data`);
  const proof = caseStudies.find(study => `/en/projects/${study.slug}/` === route)?.proof;
  if (proof) validateVerifiedCaseEvidence(route, html, proof);
  else if (!html.includes("does not claim traffic, conversion, or return-on-investment figures")) errors.push(`${route}: missing the English evidence boundary for unverified business outcomes`);
}

function validateVerifiedCaseEvidence(route, html, proof) {
  const days = period => (Date.parse(period.end) - Date.parse(period.start)) / 86400000 + 1;
  if (days(proof.before) !== proof.days || days(proof.after) !== proof.days || proof.before.end >= proof.after.start) {
    errors.push(`${route}: performance periods must be equal, complete and non-overlapping`);
  }
  if (proof.sourceDate < proof.after.end || !proof.sourceTitle?.every(Boolean) || !proof.sourceFile || !proof.sourcePages?.length) {
    errors.push(`${route}: dated performance source is incomplete`);
  }
  for (const metric of proof.metrics) {
    if (!Number.isFinite(metric.before) || !Number.isFinite(metric.after) || metric.before <= 0 || metric.after < 0 ||
      !["count", "rate"].includes(metric.type) || metric.type === "rate" && (metric.before > 100 || metric.after > 100)) {
      errors.push(`${route}: invalid recorded metric ${metric.key}`);
    }
  }
  const caseScript = "/assets/js/case-experience.js?v=";
  if (!html.includes(caseScript)) errors.push(`${route}: case experience controls are missing`);
  for (const metric of proof.metrics) {
    const card = html.match(new RegExp(`<article[^>]+data-case-metric="${metric.key}"[\\s\\S]*?</article>`))?.[0];
    const format = value => new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value);
    if (!card || !card.includes(format(metric.before)) || !card.includes(format(metric.after))) {
      errors.push(`${route}: recorded metric ${metric.key} is missing from the visible comparison`);
    }
    if (metric.after < metric.before && !card?.includes("case-metric-decline")) {
      errors.push(`${route}: a declining metric is presented as growth`);
    }
  }
  for (const section of ["brief", "role", "solution", "experience", "decisions", "output", "results", "visual-proof"]) {
    if (!html.includes(`data-case-section="${section}"`) || !html.includes(`id="${section}"`)) {
      errors.push(`${route}: case navigation points to a missing section ${section}`);
    }
  }
  for (const section of ["role", "results", "visual-proof"]) {
    if (!html.includes(`id="${section}"`)) errors.push(`${route}: dated evidence is missing ${section}`);
  }
  const english = route.startsWith("/en/");
  for (const text of [proof.sourceDate, proof.before.label[english ? 1 : 0], proof.after.label[english ? 1 : 0],
    proof.methodology[english ? 1 : 0], proof.previousImage, proof.currentImage]) {
    if (!html.includes(text)) errors.push(`${route}: source dates, definitions or authentic images are missing`);
  }
  if (!html.includes(`"dateModified":"${proof.updatedAt}"`)) errors.push(`${route}: case evidence modification date is stale`);
}

for (const [route, html] of pages) {
  if (html.includes('class="mobile-bottom-nav"')) errors.push(`${route}: retired mobile bottom navigation is still rendered`);
  if (/<strong[^>]*data-counter="[1-9][0-9]*"[^>]*>0<\/strong>/.test(html)) errors.push(`${route}: server-rendered experience counters must not show zero`);
  if (!/title="(?:خريطة موقع العمل في حي المصيف بالرياض|Office map in Al Masif, Riyadh)"/.test(html)) errors.push(`${route}: office map is not accurately labeled`);
}
if (home.indexOf('class="section-pad projects-section"') > home.indexOf('id="services"')) errors.push("Homepage work examples must precede the detailed services");
const contactPageHtml = pages.get("/contact/") || "";
if (/<form\b[^>]*data-project-form/i.test(contactPageHtml)) errors.push("Contact project composer must not use a native form submission fallback");
if (!/<div\b[^>]*data-project-form[^>]*role="form"/i.test(contactPageHtml) || !/data-project-submit/.test(contactPageHtml)) errors.push("Contact page is missing the safe client-side project message composer");
const englishContactPageHtml = pages.get("/en/contact/") || "";
if (/<form\b[^>]*data-project-form/i.test(englishContactPageHtml)) errors.push("English contact project composer must not use a native form submission fallback");
if (!/<div\b[^>]*data-project-form[^>]*role="form"/i.test(englishContactPageHtml) || !/data-project-submit/.test(englishContactPageHtml)) errors.push("English contact page is missing the safe client-side project message composer");
if (!home.includes('"hasMap":"https://maps.app.goo.gl/EbiR3AKJEZhkbMn66"')) errors.push("Homepage ProfessionalService schema is missing hasMap");
for (const [route, html] of pages) {
  if (/^\/(?:en\/)?services\/[^/]+\/$/.test(route) && !html.includes('class="check-list deliverables-list"')) {
    errors.push(`${route}: deliverables list is missing shared checklist styling`);
  }
}

const blog = pages.get("/blog/") || "";
const blogCardCount = (blog.match(/class=["']post-card(?:\s|["'])/g) || []).length;
if (blogCardCount !== expectedArticleRoutes.length) errors.push(`Blog index renders ${blogCardCount} article cards; expected ${expectedArticleRoutes.length}`);
for (const route of expectedArticleRoutes) {
  if (!new RegExp(`href=["']${route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`).test(blog)) errors.push(`Blog index does not link to ${route}`);
}

const englishBlog = pages.get("/en/blog/") || "";
const englishBlogCardCount = (englishBlog.match(/class=["']post-card(?:\s|["'])/g) || []).length;
if (englishBlogCardCount !== expectedEnglishArticleRoutes.length) errors.push(`English blog index renders ${englishBlogCardCount} article cards; expected ${expectedEnglishArticleRoutes.length}`);
for (const route of expectedEnglishArticleRoutes) {
  if (!new RegExp(`href=["']${route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`).test(englishBlog)) errors.push(`English blog index does not link to ${route}`);
}

const articleShingles = expectedArticleRoutes
  .map((route) => ({ route, values: shingles(articleCore(pages.get(route) || "")) }))
  .filter((article) => article.values.size > 0);
for (let left = 0; left < articleShingles.length; left += 1) {
  for (let right = left + 1; right < articleShingles.length; right += 1) {
    const first = articleShingles[left];
    const second = articleShingles[right];
    let intersection = 0;
    for (const value of first.values) if (second.values.has(value)) intersection += 1;
    const union = first.values.size + second.values.size - intersection;
    const similarity = union ? intersection / union : 0;
    if (similarity > 0.3) errors.push(`${first.route} and ${second.route}: core article similarity is ${(similarity * 100).toFixed(1)}%; expected at most 30%`);
  }
}

const englishArticleShingles = expectedEnglishArticleRoutes
  .map((route) => ({ route, values: shingles(articleCore(pages.get(route) || "")) }))
  .filter((article) => article.values.size > 0);
for (let left = 0; left < englishArticleShingles.length; left += 1) {
  for (let right = left + 1; right < englishArticleShingles.length; right += 1) {
    const first = englishArticleShingles[left];
    const second = englishArticleShingles[right];
    let intersection = 0;
    for (const value of first.values) if (second.values.has(value)) intersection += 1;
    const union = first.values.size + second.values.size - intersection;
    const similarity = union ? intersection / union : 0;
    if (similarity > 0.3) errors.push(`${first.route} and ${second.route}: English core article similarity is ${(similarity * 100).toFixed(1)}%; expected at most 30%`);
  }
}

const english = pages.get("/en/") || "";
const englishServicesSection = matchOne(english, /<section\s+class=["'][^"']*\bsection-pad\b[^"']*["']\s+id=["']services["']>([\s\S]*?)<\/section>/i);
const englishFooterServices = matchOne(english, /<div\s+class=["']footer-column footer-services["']>([\s\S]*?)<\/div>/i);
if ((englishServicesSection.match(/\bdata-home-catalog-link\b/g) || []).length !== services.length) errors.push("English homepage does not render the complete translated service catalog");
if ((englishServicesSection.match(/aria-label=["']View /g) || []).length !== services.length) errors.push("English service links need unique accessible labels");
for (const service of services) {
  if (!englishServicesSection.includes(`href="/en/services/${service.slug}/" aria-label="View `)) errors.push(`English homepage service directory is missing /en/services/${service.slug}/`);
}
if (/[\u0600-\u06ff]/.test(englishServicesSection)) errors.push("English service cards still contain Arabic text");
if (/[\u0600-\u06ff]/.test(englishFooterServices)) errors.push("English footer service links still contain Arabic text");
if (/اتصل الآن|راسلني واتساب/.test(textContent(english))) errors.push("English page still contains Arabic floating-contact labels");
if (!english.includes('href="/en/services/')) errors.push("English homepage does not link to the complete English service routes");
if (!english.includes('href="/en/blog/')) errors.push("English homepage does not link to the English insight routes");

for (const [route, html] of pages) {
  const expectedSwitch = route.startsWith("/en/") ? arabicMirrorRoute(route) : englishMirrorRoute(route);
  if (!new RegExp(`<a class=["']language-switch["'] href=["']${expectedSwitch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`).test(html)) {
    errors.push(`${route}: language switch does not preserve the equivalent route (${expectedSwitch})`);
  }
}

const productionCss = await readFile(join(output, "assets", "css", "main.css"), "utf8").catch(() => "");
if (!productionCss.includes(".js .hero .hero-copy.reveal")) errors.push("Production CSS is missing the above-the-fold reveal override");
if (!productionCss.includes("/* Production enhancements */")) errors.push("Production CSS did not include the merged enhancements stylesheet");
if (/floating-contact-breathe/.test(productionCss)) errors.push("Production CSS still animates non-composited box-shadow values");

console.log(`Validated ${pages.size} canonical HTML routes in ${output}; ${redirects.size} permanent redirects checked.`);
if (warnings.length) {
  console.log(`\nWarnings (${warnings.length}):`);
  warnings.forEach((warning) => console.log(`- ${warning}`));
}
if (errors.length) {
  console.error(`\nErrors (${errors.length}):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}
console.log("\nValidation passed.");
