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
    if (["node_modules", "src", "scripts"].includes(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else files.push(path);
  }
  return files;
}

const files = await walk(root);
const htmlFiles = files.filter(file => file.endsWith(".html"));
const htmlSet = new Set(htmlFiles.map(file => relative(root, file)));

for (const file of htmlFiles) {
  const name = relative(root, file);
  const html = await readFile(file, "utf8");
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim();
  const description = html.match(/<meta name="description" content="([^"]*)">/i)?.[1]?.trim();
  const canonical = html.match(/<link rel="canonical" href="([^"]+)">/i)?.[1];
  const robots = html.match(/<meta name="robots" content="([^"]+)">/i)?.[1] ?? "";
  const h1Count = (html.match(/<h1(?:\s|>)/gi) || []).length;
  let hasWebPageSchema = false;

  if (!/<html lang="ar" dir="rtl">/i.test(html)) errors.push(`${name}: missing Arabic RTL document attributes`);
  if (!title) errors.push(`${name}: missing title`);
  if (!description) errors.push(`${name}: missing meta description`);
  if (!canonical) errors.push(`${name}: missing canonical`);
  if (!/<meta property="og:title"/i.test(html) || !/<meta property="og:description"/i.test(html) || !/<meta property="og:image"/i.test(html)) errors.push(`${name}: incomplete Open Graph metadata`);
  if (!/<meta name="twitter:card" content="summary_large_image">/i.test(html)) errors.push(`${name}: missing Twitter card metadata`);
  if (!/<link rel="alternate" hreflang="ar-SA"/i.test(html) || !/<link rel="alternate" hreflang="x-default"/i.test(html)) errors.push(`${name}: missing language alternates`);
  if (h1Count !== 1) errors.push(`${name}: expected one H1, found ${h1Count}`);
  if (/href="#"/i.test(html)) errors.push(`${name}: contains placeholder href="#"`);
  if (/<a[^>]+target="_blank"(?![^>]+rel="[^"]*noopener)/i.test(html)) errors.push(`${name}: target=_blank link missing noopener`);
  if (title && title.length > 78) warnings.push(`${name}: long title (${title.length})`);
  if (description && (description.length < 90 || description.length > 190)) warnings.push(`${name}: description length ${description.length}`);
  if (title && seenTitles.has(title)) errors.push(`${name}: duplicate title also used by ${seenTitles.get(title)}`);
  else if (title) seenTitles.set(title, name);
  if (description && seenDescriptions.has(description)) errors.push(`${name}: duplicate description also used by ${seenDescriptions.get(description)}`);
  else if (description) seenDescriptions.set(description, name);
  if (canonical && seenCanonicals.has(canonical)) errors.push(`${name}: duplicate canonical also used by ${seenCanonicals.get(canonical)}`);
  else if (canonical) seenCanonicals.set(canonical, name);
  if (name === "index.html" && title !== "المهندس إسلام الشيخ") errors.push(`${name}: homepage title must match the site name`);
  if (!robots.includes("noindex") && title && !title.includes("المهندس إسلام الشيخ")) errors.push(`${name}: indexable title is missing the site name`);
  if (name === "404.html" && !robots.includes("noindex")) errors.push(`${name}: 404 page must be noindex`);

  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) {
    try {
      const data = JSON.parse(match[1]);
      if (data["@type"] === "WebPage") hasWebPageSchema = true;
    }
    catch (error) { errors.push(`${name}: invalid JSON-LD (${error.message})`); }
  }
  if (!hasWebPageSchema) errors.push(`${name}: missing WebPage structured data`);

  for (const match of html.matchAll(/(?:href|src)="(\/[^"]+)"/gi)) {
    const url = match[1].split(/[?#]/)[0];
    if (!url || url === "/") continue;
    const local = url.endsWith("/") ? `${url.slice(1)}index.html` : url.slice(1);
    if (url.endsWith("/") && !htmlSet.has(local)) errors.push(`${name}: broken internal page ${url}`);
    if (/\.(css|js|png|svg|webmanifest)$/i.test(url)) {
      try { await access(join(root, local)); }
      catch { errors.push(`${name}: missing asset ${url}`); }
    }
  }
}

const sitemap = await readFile(join(root, "sitemap.xml"), "utf8");
const sitemapCount = (sitemap.match(/<url>/g) || []).length;
if (sitemapCount !== htmlFiles.length - 1) warnings.push(`sitemap has ${sitemapCount} URLs for ${htmlFiles.length - 1} indexable pages`);

for (const asset of ["profile.json", "llms.txt", "llms-full.txt", "feed.xml", "manifest.webmanifest", "assets/brand/eslam-elshikh-mark.svg"]) {
  try { await access(join(root, asset)); }
  catch { errors.push(`missing discovery asset ${asset}`); }
}

try {
  const profile = JSON.parse(await readFile(join(root, "profile.json"), "utf8"));
  if (profile["@type"] !== "Person" || profile.identifier?.value !== "Q138800449") errors.push("profile.json: incomplete identity data");
} catch (error) {
  errors.push(`profile.json: invalid JSON (${error.message})`);
}

if (errors.length) {
  console.error(`Validation failed with ${errors.length} error(s):`);
  errors.forEach(error => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log(`Validated ${htmlFiles.length} HTML pages with no blocking errors.`);
}

if (warnings.length) {
  console.log(`Warnings (${warnings.length}):`);
  warnings.forEach(warning => console.log(`- ${warning}`));
}
