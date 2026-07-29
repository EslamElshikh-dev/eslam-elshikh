import { access, readFile, readdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const dirArg = process.argv.find((arg) => arg.startsWith("--dir="));
const output = resolve(root, dirArg ? dirArg.slice(6) : "dist");
const errors = [];
const warnings = [];

const expectedRoutes = [
  "/", "/en/", "/services/", "/local-seo/", "/local-seo/riyadh/", "/about/", "/google-expert/", "/projects/", "/blog/", "/contact/", "/privacy/", "/terms/",
  "/services/cybersecurity/", "/services/cloud-solutions/", "/services/ai-agents/", "/services/web-development/", "/services/google-support/", "/services/google-business-profile/", "/services/knowledge-bases/", "/services/seo/", "/services/digital-advertising/",
  "/blog/ai-agent-business/", "/blog/google-business-profile-suspension/", "/blog/secure-website-development/",
  "/blog/topics/google-business-profile/", "/blog/topics/local-seo-saudi/", "/blog/topics/cybersecurity/", "/blog/topics/ai-agents/", "/blog/topics/web-development/"
];

const routeFile = (route) => route === "/" ? join(output, "index.html") : join(output, route.replace(/^\//, "").replace(/\/$/, ""), "index.html");
const textContent = (html) => html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&[a-zA-Z#0-9]+;/g, " ").replace(/\s+/g, " ").trim();
const matchOne = (html, regex) => html.match(regex)?.[1]?.trim() || "";
const wordCount = (html) => textContent(html).split(/\s+/).filter(Boolean).length;

async function exists(path) {
  try { await access(path); return true; } catch { return false; }
}

const pages = new Map();
const titles = new Map();
const descriptions = new Map();

for (const route of expectedRoutes) {
  const file = routeFile(route);
  if (!(await exists(file))) {
    errors.push(`Missing route file: ${route}`);
    continue;
  }
  const html = await readFile(file, "utf8");
  pages.set(route, html);

  const title = matchOne(html, /<title>([\s\S]*?)<\/title>/i);
  const description = matchOne(html, /<meta\s+name="description"\s+content="([^"]*)"/i);
  const canonical = matchOne(html, /<link\s+rel="canonical"\s+href="([^"]+)"/i);
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  const viewportCount = (html.match(/<meta\s+name="viewport"/gi) || []).length;

  if (!/^<!doctype html>/i.test(html)) errors.push(`${route}: missing HTML5 doctype`);
  if (!/<html\s+lang="(?:ar|en)"\s+dir="(?:rtl|ltr)"/i.test(html)) errors.push(`${route}: missing correct lang/dir attributes`);
  if (viewportCount !== 1) errors.push(`${route}: expected one viewport meta, found ${viewportCount}`);
  if (h1Count !== 1) errors.push(`${route}: expected exactly one H1, found ${h1Count}`);
  if (!title) errors.push(`${route}: missing title`);
  if (title.length < 12 || title.length > 110) warnings.push(`${route}: title length ${title.length}`);
  if (!description) errors.push(`${route}: missing meta description`);
  if (description.length < 85 || description.length > 230) warnings.push(`${route}: description length ${description.length}`);
  if (canonical !== `https://eslam-elshikh.com${route}`) errors.push(`${route}: canonical mismatch (${canonical})`);
  if (!/<meta\s+property="og:title"/i.test(html) || !/<meta\s+name="twitter:card"/i.test(html)) errors.push(`${route}: incomplete social metadata`);
  if (!/<script\s+type="application\/ld\+json">/i.test(html)) errors.push(`${route}: missing JSON-LD`);
  if (!/<link\s+rel="stylesheet"\s+href="\/assets\/css\/main\.css\?v=/i.test(html)) errors.push(`${route}: missing versioned main stylesheet`);
  if (/improvements\.css|brand\.css|seo-cro\.css/.test(html)) errors.push(`${route}: references legacy CSS`);
  if (!/<main\s+id="main">/i.test(html)) errors.push(`${route}: missing main landmark`);
  if (!/<footer\s+class="site-footer">/i.test(html)) errors.push(`${route}: missing footer`);
  if (!/mobile-bottom-nav/.test(html)) errors.push(`${route}: missing mobile bottom navigation`);

  for (const match of html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) {
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

  if (route.startsWith("/services/") && route !== "/services/" && wordCount(html) < 520) warnings.push(`${route}: service page is shorter than 520 words (${wordCount(html)})`);
}

for (const [route, html] of pages) {
  for (const match of html.matchAll(/href="([^"]+)"/gi)) {
    const href = match[1];
    if (!href.startsWith("/") || href.startsWith("//")) continue;
    const clean = href.split("#")[0].split("?")[0];
    if (!clean) continue;
    if (clean.startsWith("/assets/")) {
      if (!(await exists(join(output, clean.replace(/^\//, ""))))) errors.push(`${route}: missing asset ${clean}`);
      continue;
    }
    if (["/feed.xml", "/manifest.webmanifest", "/sitemap.xml", "/robots.txt", "/profile.json", "/llms.txt", "/.well-known/security.txt"].includes(clean)) {
      if (!(await exists(join(output, clean.replace(/^\//, ""))))) errors.push(`${route}: missing linked file ${clean}`);
      continue;
    }
    const target = clean.endsWith(".html") ? join(output, clean.replace(/^\//, "")) : routeFile(clean.endsWith("/") ? clean : `${clean}/`);
    if (!(await exists(target))) errors.push(`${route}: broken internal link ${href}`);
  }
}

const sitemapPath = join(output, "sitemap.xml");
if (!(await exists(sitemapPath))) errors.push("Missing sitemap.xml");
else {
  const sitemap = await readFile(sitemapPath, "utf8");
  const entries = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  if (entries.length !== expectedRoutes.length) errors.push(`Sitemap has ${entries.length} URLs; expected ${expectedRoutes.length}`);
  for (const route of expectedRoutes) if (!entries.includes(`https://eslam-elshikh.com${route}`)) errors.push(`Sitemap missing ${route}`);
}

for (const required of ["robots.txt", "manifest.webmanifest", "feed.xml", "profile.json", "llms.txt", "humans.txt", "CNAME", ".well-known/security.txt", "404.html"]) {
  if (!(await exists(join(output, required)))) errors.push(`Missing generated file: ${required}`);
}

const robots = await readFile(join(output, "robots.txt"), "utf8").catch(() => "");
if (!robots.includes("Sitemap: https://eslam-elshikh.com/sitemap.xml")) errors.push("robots.txt does not reference the canonical sitemap");

const home = pages.get("/") || "";
if ((home.match(/class="service-card reveal"/g) || []).length !== 9) errors.push("Homepage does not render all 9 services");
if (wordCount(home) < 900) warnings.push(`Homepage content is shorter than 900 words (${wordCount(home)})`);

console.log(`Validated ${pages.size} HTML routes in ${output}`);
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
