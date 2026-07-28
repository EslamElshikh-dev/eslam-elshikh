import { access, readFile, readdir } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const errors = [];
const warnings = [];
const seenTitles = new Map();
const seenDescriptions = new Map();
const seenCanonicals = new Map();

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if ([".git", "dist", "node_modules", "src", "scripts"].includes(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else files.push(path);
  }
  return files;
}

const files = await walk(root);
const htmlFiles = files.filter(file => file.endsWith(".html"));
const htmlSet = new Set(htmlFiles.map(file => relative(root, file)));
let indexableHtmlCount = 0;

for (const file of htmlFiles) {
  const name = relative(root, file);
  const html = await readFile(file, "utf8");
  const isArabic = /<html lang="ar" dir="rtl">/i.test(html);
  const isEnglish = /<html lang="en" dir="ltr">/i.test(html);
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim();
  const description = html.match(/<meta name="description" content="([^"]*)">/i)?.[1]?.trim();
  const canonical = html.match(/<link rel="canonical" href="([^"]+)">/i)?.[1];
  const robots = html.match(/<meta name="robots" content="([^"]+)">/i)?.[1] ?? "";
  const h1Count = (html.match(/<h1(?:\s|>)/gi) || []).length;
  let hasWebPageSchema = false;
  let schemaTypes = [];

  if (!isArabic && !isEnglish) errors.push(`${name}: missing valid language and direction attributes`);
  if (!title) errors.push(`${name}: missing title`);
  if (!description) errors.push(`${name}: missing meta description`);
  if (!canonical) errors.push(`${name}: missing canonical`);
  if (!/<meta property="og:title"/i.test(html) || !/<meta property="og:description"/i.test(html) || !/<meta property="og:image"/i.test(html)) errors.push(`${name}: incomplete Open Graph metadata`);
  if (!/<meta name="twitter:card" content="summary_large_image">/i.test(html)) errors.push(`${name}: missing Twitter card metadata`);
  if (!/<link rel="alternate" hreflang="ar"/i.test(html) || !/<link rel="alternate" hreflang="ar-SA"/i.test(html) || !/<link rel="alternate" hreflang="x-default"/i.test(html)) errors.push(`${name}: incomplete Arabic/x-default hreflang cluster`);
  if (["index.html", "en/index.html"].includes(name) && !/<link rel="alternate" hreflang="en"/i.test(html)) errors.push(`${name}: missing reciprocal English hreflang`);
  if (h1Count !== 1) errors.push(`${name}: expected one H1, found ${h1Count}`);
  if (/href="#"/i.test(html)) errors.push(`${name}: contains placeholder href="#"`);
  if (/<a[^>]+target="_blank"(?![^>]+rel="[^"]*noopener)/i.test(html)) errors.push(`${name}: target=_blank link missing noopener`);
  if (title && title.length > 82) warnings.push(`${name}: long title (${title.length})`);
  if (description && (description.length < 90 || description.length > 190)) warnings.push(`${name}: description length ${description.length}`);
  if (title && seenTitles.has(title)) errors.push(`${name}: duplicate title also used by ${seenTitles.get(title)}`);
  else if (title) seenTitles.set(title, name);
  if (description && seenDescriptions.has(description)) errors.push(`${name}: duplicate description also used by ${seenDescriptions.get(description)}`);
  else if (description) seenDescriptions.set(description, name);
  if (canonical && seenCanonicals.has(canonical)) errors.push(`${name}: duplicate canonical also used by ${seenCanonicals.get(canonical)}`);
  else if (canonical) seenCanonicals.set(canonical, name);
  if (name === "index.html" && title !== "المهندس إسلام الشيخ") errors.push(`${name}: homepage title must match the site name`);
  if (!robots.includes("noindex") && isArabic && title && !title.includes("إسلام الشيخ")) errors.push(`${name}: indexable Arabic title is missing Eslam Elshikh`);
  if (!robots.includes("noindex") && isEnglish && title && !title.includes("Eslam Elshikh")) errors.push(`${name}: indexable English title is missing Eslam Elshikh`);
  if (name === "404.html" && !robots.includes("noindex")) errors.push(`${name}: 404 page must be noindex`);
  if (!robots.includes("noindex")) indexableHtmlCount += 1;
  if (/<span>\s*ES\s*<\/span>/i.test(html)) errors.push(`${name}: legacy ES text mark is still present`);
  if (!html.includes("/assets/brand/eslam-elshikh-logo-transparent.png")) errors.push(`${name}: transparent full logo is not used`);
  if (!html.includes("/assets/og/eslam-elshikh-og-transparent.png")) errors.push(`${name}: transparent sharing image is not used`);

  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) {
    try {
      const data = JSON.parse(match[1]);
      const nodes = data["@graph"] ?? [data];
      schemaTypes.push(...nodes.flatMap(node => Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]]).filter(Boolean));
      if (nodes.some(node => node["@type"] === "WebPage")) hasWebPageSchema = true;
    } catch (error) {
      errors.push(`${name}: invalid JSON-LD (${error.message})`);
    }
  }
  if (!hasWebPageSchema) errors.push(`${name}: missing WebPage structured data`);
  if (name === "index.html") {
    for (const requiredType of ["Person", "ProfessionalService", "LocalBusiness", "FAQPage"]) {
      if (!schemaTypes.includes(requiredType)) errors.push(`${name}: schema graph missing ${requiredType}`);
    }
  }

  for (const match of html.matchAll(/(?:href|src)="(\/[^"]+)"/gi)) {
    const url = match[1].split(/[?#]/)[0];
    if (!url || url === "/" || url.startsWith("/.well-known/")) continue;
    const local = url.endsWith("/") ? `${url.slice(1)}index.html` : url.slice(1);
    if (url.endsWith("/") && !htmlSet.has(local)) errors.push(`${name}: broken internal page ${url}`);
    if (/\.(css|js|png|svg|webp|webmanifest|ico)$/i.test(url)) {
      try { await access(join(root, local)); }
      catch { errors.push(`${name}: missing asset ${url}`); }
    }
  }
}

const sitemap = await readFile(join(root, "sitemap.xml"), "utf8");
const sitemapCount = (sitemap.match(/<url>/g) || []).length;
if (sitemapCount !== indexableHtmlCount) errors.push(`sitemap has ${sitemapCount} URLs for ${indexableHtmlCount} indexable pages`);

for (const asset of [
  "profile.json",
  "llms.txt",
  "llms-full.txt",
  "feed.xml",
  "manifest.webmanifest",
  "assets/brand/eslam-elshikh-logo-transparent.png",
  "assets/brand/eslam-elshikh-mark.svg",
  "assets/og/eslam-elshikh-og-transparent.png",
  "assets/css/seo-cro.css",
  "clients-footers.md",
  "blog/drafts/how-to-add-google-map-without-store.md",
  "blog/drafts/google-maps-video-call-verification-2026.md"
]) {
  try { await access(join(root, asset)); }
  catch { errors.push(`missing required asset ${asset}`); }
}

function pngDetails(buffer) {
  if (buffer.toString("hex", 0, 8) !== "89504e470d0a1a0a") throw new Error("not a PNG");
  return { width:buffer.readUInt32BE(16), height:buffer.readUInt32BE(20), colorType:buffer[25] };
}

try {
  const logo = pngDetails(await readFile(join(root, "assets/brand/eslam-elshikh-logo-transparent.png")));
  if (logo.width !== 1024 || logo.height !== 1024 || ![4, 6].includes(logo.colorType)) errors.push(`transparent logo has invalid dimensions or alpha (${logo.width}x${logo.height}, color type ${logo.colorType})`);
  const og = pngDetails(await readFile(join(root, "assets/og/eslam-elshikh-og-transparent.png")));
  if (og.width !== 1200 || og.height !== 630 || ![4, 6].includes(og.colorType)) errors.push(`sharing image has invalid dimensions or alpha (${og.width}x${og.height}, color type ${og.colorType})`);
} catch (error) {
  errors.push(`PNG validation failed: ${error.message}`);
}

try {
  const profile = JSON.parse(await readFile(join(root, "profile.json"), "utf8"));
  const requiredSameAs = [
    "https://www.wikidata.org/wiki/Q138800449",
    "https://me.developers.google.com/u/EslamElshikh",
    "https://github.com/EslamElshikh-dev",
    "https://x.com/remoesoo10"
  ];
  if (profile["@type"] !== "Person" || profile.identifier?.value !== "Q138800449") errors.push("profile.json: incomplete identity data");
  for (const url of requiredSameAs) if (!profile.sameAs?.includes(url)) errors.push(`profile.json: sameAs missing ${url}`);
} catch (error) {
  errors.push(`profile.json: invalid JSON (${error.message})`);
}

const googleBusinessHtml = await readFile(join(root, "services/google-business-profile/index.html"), "utf8");
if (!googleBusinessHtml.includes("<title>حل مشكلة تعليق جوجل بزنس وإثبات الملكية في السعودية | إسلام الشيخ</title>")) errors.push("Google Business page: exact requested title is missing");
if (!googleBusinessHtml.includes("خدمات احترافية لاسترجاع جوجل ماب المعلق، وإثبات ملكية قوقل ماب بالفيديو.")) errors.push("Google Business page: requested meta description is missing");
for (const phrase of ["حل مشكلة إثبات الملكية بعد عدم قبول الفيديو", "472 ملفًا تجاريًا", "233 مشكلة تعليق أو ملكية"]) {
  if (!googleBusinessHtml.includes(phrase)) errors.push(`Google Business page: missing required phrase "${phrase}"`);
}

for (const draft of [
  "blog/drafts/how-to-add-google-map-without-store.md",
  "blog/drafts/google-maps-video-call-verification-2026.md"
]) {
  const markdown = await readFile(join(root, draft), "utf8");
  if (!/status:\s*"draft"/i.test(markdown)) errors.push(`${draft}: not marked as draft`);
  if (!markdown.includes("/services/google-business-profile/")) errors.push(`${draft}: missing internal link to the Google Business pillar`);
}

if (errors.length) {
  console.error(`Validation failed with ${errors.length} error(s):`);
  errors.forEach(error => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log(`Validated ${htmlFiles.length} HTML pages, schema graphs, transparent brand assets, drafts, and internal links with no blocking errors.`);
}

if (warnings.length) {
  console.log(`Warnings (${warnings.length}):`);
  warnings.forEach(warning => console.log(`- ${warning}`));
}
