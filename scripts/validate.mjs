import { access, readFile, readdir } from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { posts, projects } from "../src/content.mjs";
import { guides } from "../src/guides.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const dirArg = process.argv.find((arg) => arg.startsWith("--dir="));
const output = resolve(root, dirArg ? dirArg.slice(6) : "dist");
const canonicalBase = "https://www.eslam-elshikh.com";
const deprecatedCanonicalBase = "https://eslam-elshikh.com";
const errors = [];
const warnings = [];

const requiredRoutes = [
  "/", "/en/", "/services/", "/local-seo/", "/local-seo/riyadh/", "/about/", "/google-expert/", "/google-ads/", "/projects/", "/blog/", "/contact/", "/privacy/", "/terms/",
  "/services/cybersecurity/", "/services/cloud-solutions/", "/services/ai-agents/", "/services/web-development/", "/services/google-support/", "/services/google-business-profile/", "/services/knowledge-bases/", "/services/seo/", "/services/digital-advertising/",
  "/blog/ai-agent-business/", "/blog/google-business-profile-suspension/", "/blog/secure-website-development/", "/blog/ecommerce-development-saudi/",
  "/blog/topics/google-business-profile/", "/blog/topics/local-seo-saudi/", "/blog/topics/cybersecurity/", "/blog/topics/ai-agents/", "/blog/topics/web-development/"
];
const expectedArticleRoutes = [...posts, ...guides].map((post) => `/blog/${post.slug}/`);
for (const route of expectedArticleRoutes) if (!requiredRoutes.includes(route)) requiredRoutes.push(route);
const expectedCaseStudyRoutes = projects.filter((project) => project.slug && project.caseStudy).map((project) => `/projects/${project.slug}/`);
for (const route of expectedCaseStudyRoutes) if (!requiredRoutes.includes(route)) requiredRoutes.push(route);

const routeFile = (route) => route === "/" ? join(output, "index.html") : join(output, route.replace(/^\//, "").replace(/\/$/, ""), "index.html");
const normalizeRoute = (route) => route === "/" ? "/" : `/${route.replace(/^\//, "").replace(/\/$/, "")}/`;
const textContent = (html) => html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&[a-zA-Z#0-9]+;/g, " ").replace(/\s+/g, " ").trim();
const matchOne = (html, regex) => html.match(regex)?.[1]?.trim() || "";
const wordCount = (html) => textContent(html).split(/\s+/).filter(Boolean).length;
const articleCore = (html) => matchOne(html, /<article\s+class=["'][^"']*\barticle-content\b[^"']*["'][^>]*>([\s\S]*?)<\/article>/i);
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
const expectedHomeAlternates = new Map([
  ["ar-SA", `${canonicalBase}/`],
  ["en", `${canonicalBase}/en/`],
  ["x-default", `${canonicalBase}/`]
]);
for (const route of ["/", "/en/"]) {
  const loc = `${canonicalBase}${route}`;
  const entry = sitemapEntries.find((item) => item.loc === loc);
  const alternates = new Map((entry?.alternates || []).map((item) => [item.hreflang, item.href]));
  for (const [hreflang, href] of expectedHomeAlternates) {
    if (alternates.get(hreflang) !== href) errors.push(`Sitemap ${route} is missing reciprocal ${hreflang} alternate ${href}`);
  }
}

for (const route of requiredRoutes) if (!sitemapRoutes.includes(route)) errors.push(`Sitemap missing required route ${route}`);

const htmlFiles = (await walk(output)).filter((file) => file.endsWith("index.html"));
const publicRoutes = [...new Set(htmlFiles.map(routeFromFile).filter(Boolean))].sort();
for (const route of publicRoutes) if (!sitemapRoutes.includes(route)) errors.push(`Public HTML route is absent from sitemap: ${route}`);
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

  if (!/^<!doctype html>/i.test(html)) errors.push(`${route}: missing HTML5 doctype`);
  if (!/<html\s+lang=["'](?:ar|en)["']\s+dir=["'](?:rtl|ltr)["']/i.test(html)) errors.push(`${route}: missing correct lang/dir attributes`);
  if (viewportCount !== 1) errors.push(`${route}: expected one viewport meta, found ${viewportCount}`);
  if (h1Count !== 1) errors.push(`${route}: expected exactly one H1, found ${h1Count}`);
  if (!title) errors.push(`${route}: missing title`);
  if (title.length < 12 || title.length > 110) warnings.push(`${route}: title length ${title.length}`);
  if (!description) errors.push(`${route}: missing meta description`);
  if (description.length < 85 || description.length > 230) warnings.push(`${route}: description length ${description.length}`);
  if (!robots || !/\bindex\b/i.test(robots) || !/\bfollow\b/i.test(robots) || /\bnoindex\b/i.test(robots)) errors.push(`${route}: invalid robots directive (${robots || "missing"})`);
  if (canonical !== `${canonicalBase}${route}`) errors.push(`${route}: canonical mismatch (${canonical})`);
  if (!/<meta\s+property=["']og:title["']/i.test(html) || !/<meta\s+name=["']twitter:card["']/i.test(html)) errors.push(`${route}: incomplete social metadata`);
  if (!/<script\s+type=["']application\/ld\+json["']>/i.test(html)) errors.push(`${route}: missing JSON-LD`);
  if (!/<link\s+rel=["']stylesheet["']\s+href=["']\/assets\/css\/main\.css\?v=/i.test(html)) errors.push(`${route}: missing versioned main stylesheet`);
  const stylesheetCount = (html.match(/<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi) || []).length;
  const expectedStylesheets = route === "/about/" ? 2 : 1;
  if (stylesheetCount !== expectedStylesheets) errors.push(`${route}: expected ${expectedStylesheets} stylesheet link(s), found ${stylesheetCount}`);
  if (/improvements\.css|brand\.css|seo-cro\.css/.test(html)) errors.push(`${route}: references legacy CSS`);
  if (/<script\b(?![^>]*\bsrc=)(?![^>]*\btype=["']application\/ld\+json["'])[^>]*>/i.test(html)) errors.push(`${route}: contains executable inline JavaScript`);
  if (/<style\b|\sstyle=["']/i.test(html)) errors.push(`${route}: contains inline CSS that weakens the CSP`);
  if (!html.includes('/assets/js/theme.js?v=3.6.4') || !html.includes('/assets/js/analytics.js?v=3.6.4')) errors.push(`${route}: missing versioned theme or consent-based analytics script`);
  if (!html.includes('/assets/og/eslam-elshikh-social-card.png')) errors.push(`${route}: social metadata does not use the 1200x630 sharing card`);
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
  }
  const isArticle = route.startsWith("/blog/") && route !== "/blog/" && !route.startsWith("/blog/topics/");
  if (isArticle) {
    const coreWords = wordCount(articleCore(html));
    if (coreWords < 450) errors.push(`${route}: core article content is too thin (${coreWords} words; expected at least 450)`);
    for (const className of ["header-tools", "footer-grid", "mobile-bottom-nav", "article-author-card"]) {
      if (!new RegExp(`class=["'][^"']*\\b${className}\\b`, "i").test(html)) errors.push(`${route}: article is missing the standard ${className} shell`);
    }
    const faqCount = (html.match(/<details\s+class="reveal"/g) || []).length;
    if (faqCount !== 4) errors.push(`${route}: expected exactly 4 topic-specific FAQ entries, found ${faqCount}`);
    if (!html.includes('"@type":"FAQPage"')) errors.push(`${route}: missing FAQPage structured data`);
    if (!html.includes('"@type":"BlogPosting"')) errors.push(`${route}: missing BlogPosting structured data`);
    if (!/<meta\s+name=["']keywords["']/i.test(html)) errors.push(`${route}: missing article keyword metadata`);
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
  if (route.startsWith("/services/") && route !== "/services/" && words < 520) warnings.push(`${route}: service page is shorter than 520 words (${words})`);
}

const linkedFiles = new Set(["/feed.xml", "/manifest.webmanifest", "/sitemap.xml", "/robots.txt", "/profile.json", "/llms.txt", "/humans.txt", "/favicon.ico", "/.well-known/security.txt"]);
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

for (const required of ["robots.txt", "manifest.webmanifest", "feed.xml", "profile.json", "llms.txt", "llms-full.txt", "humans.txt", "CNAME", ".well-known/security.txt", "404.html"]) {
  if (!(await exists(join(output, required)))) errors.push(`Missing generated file: ${required}`);
}
const notFound = await readFile(join(output, "404.html"), "utf8").catch(() => "");
const notFoundRobots = matchOne(notFound, /<meta\s+name=["']robots["']\s+content=["']([^"']*)/i);
if (!/\bnoindex\b/i.test(notFoundRobots) || !/\bfollow\b/i.test(notFoundRobots)) errors.push(`404 page must use noindex, follow (${notFoundRobots || "missing"})`);

for (const publicFile of ["sitemap.xml", "robots.txt", "feed.xml", "profile.json", "llms.txt", "llms-full.txt", ".well-known/security.txt"]) {
  const content = await readFile(join(output, publicFile), "utf8").catch(() => "");
  if (content.includes(deprecatedCanonicalBase)) errors.push(`${publicFile}: contains deprecated non-www canonical references`);
}

const robotsText = await readFile(join(output, "robots.txt"), "utf8").catch(() => "");
if (!robotsText.includes(`Sitemap: ${canonicalBase}/sitemap.xml`)) errors.push("robots.txt does not reference the canonical sitemap");
if (!/User-agent:\s*\*[\s\S]*Allow:\s*\//i.test(robotsText)) errors.push("robots.txt does not allow public crawling");
if (/^Host:/im.test(robotsText)) errors.push("robots.txt contains the unsupported Host directive");

const home = pages.get("/") || "";
if ((home.match(/class=["']service-card reveal["']/g) || []).length !== 9) errors.push("Homepage does not render all 9 services");
if ((home.match(/aria-label=["']تفاصيل خدمة /g) || []).length !== 9) errors.push("Homepage service detail links need unique accessible labels");
if (/<script\b[^>]*\bsrc=["']https:\/\/www\.googletagmanager\.com/i.test(home)) errors.push("Homepage loads Google Analytics before consent");
if (!home.includes('<strong>472</strong>') || !home.includes('<strong>233</strong>') || !home.includes('<strong>63</strong>') || !home.includes('<strong>12</strong>')) errors.push("Homepage trust metrics are missing the verified 472/233/63/12 figures");
if (!/href=["']\/local-seo\/riyadh\/["']/.test(home)) errors.push("Homepage needs a direct internal link to /local-seo/riyadh/");
if (wordCount(home) < 900) warnings.push(`Homepage content is shorter than 900 words (${wordCount(home)})`);
for (const [route, html] of pages) {
  const mapSectionCount = (html.match(/id="google-business-map"/g) || []).length;
  if (mapSectionCount !== 1) errors.push(`${route}: expected one sitewide Google Maps section, found ${mapSectionCount}`);
  if (!html.includes("www.google.com/maps/embed?pb=")) errors.push(`${route}: missing Google Maps embed`);
  if (!html.includes('referrerpolicy="strict-origin-when-cross-origin"')) errors.push(`${route}: Google Maps embed is missing its referrer policy`);
  if (!html.includes("https://maps.app.goo.gl/EbiR3AKJEZhkbMn66")) errors.push(`${route}: missing direct Google Business Profile link`);
  if (!html.includes('width="600" height="450"')) errors.push(`${route}: map embed does not preserve the supplied iframe dimensions`);
  if (!/id="google-business-map"[\s\S]*<\/section><\/main><footer class="site-footer">/.test(html)) errors.push(`${route}: sitewide map is not placed immediately before the footer`);
}
for (const route of expectedCaseStudyRoutes) {
  const html = pages.get(route) || "";
  if (!html.includes('"@type":"CreativeWork"')) errors.push(`${route}: missing CreativeWork structured data`);
  if (!html.includes("لا تتضمن هذه الدراسة أرقام زيارات أو تحويلات")) errors.push(`${route}: missing the evidence boundary for unverified business outcomes`);
}

const contactPageHtml = pages.get("/contact/") || "";
if (/<form\b[^>]*data-project-form/i.test(contactPageHtml)) errors.push("Contact project composer must not use a native form submission fallback");
if (!/<div\b[^>]*data-project-form[^>]*role="form"/i.test(contactPageHtml) || !/data-project-submit/.test(contactPageHtml)) errors.push("Contact page is missing the safe client-side project message composer");
if (!home.includes('"hasMap":"https://maps.app.goo.gl/EbiR3AKJEZhkbMn66"')) errors.push("Homepage ProfessionalService schema is missing hasMap");
for (const [route, html] of pages) {
  if (route.startsWith("/services/") && route !== "/services/" && !html.includes('class="check-list deliverables-list"')) {
    errors.push(`${route}: deliverables list is missing shared checklist styling`);
  }
}

const blog = pages.get("/blog/") || "";
const blogCardCount = (blog.match(/class=["']post-card(?:\s|["'])/g) || []).length;
if (blogCardCount !== expectedArticleRoutes.length) errors.push(`Blog index renders ${blogCardCount} article cards; expected ${expectedArticleRoutes.length}`);
for (const route of expectedArticleRoutes) {
  if (!new RegExp(`href=["']${route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`).test(blog)) errors.push(`Blog index does not link to ${route}`);
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

const english = pages.get("/en/") || "";
const englishServices = matchOne(english, /<section\s+class=["']section-pad["']\s+id=["']services["']>([\s\S]*?)<\/section>/i);
const englishFooterServices = matchOne(english, /<div\s+class=["']footer-column footer-services["']>([\s\S]*?)<\/div>/i);
if ((englishServices.match(/class=["']service-card reveal["']/g) || []).length !== 9) errors.push("English homepage does not render all 9 translated services");
if ((englishServices.match(/aria-label=["']View details for /g) || []).length !== 9) errors.push("English service detail links need unique accessible labels");
if (/[\u0600-\u06ff]/.test(englishServices)) errors.push("English service cards still contain Arabic text");
if (/[\u0600-\u06ff]/.test(englishFooterServices)) errors.push("English footer service links still contain Arabic text");
if (/اتصل الآن|راسلني واتساب/.test(textContent(english))) errors.push("English page still contains Arabic floating-contact labels");

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
