import { access, readFile, readdir } from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const dirArg = process.argv.find((arg) => arg.startsWith("--dir="));
const output = resolve(root, dirArg ? dirArg.slice(6) : "dist");
const canonicalBase = "https://www.eslam-elshikh.com";
const errors = [];
const warnings = [];

const requiredRoutes = [
  "/", "/en/", "/services/", "/local-seo/", "/local-seo/riyadh/", "/about/", "/google-expert/", "/projects/", "/blog/", "/contact/", "/privacy/", "/terms/",
  "/services/cybersecurity/", "/services/cloud-solutions/", "/services/ai-agents/", "/services/web-development/", "/services/google-support/", "/services/google-business-profile/", "/services/knowledge-bases/", "/services/seo/", "/services/digital-advertising/",
  "/blog/ai-agent-business/", "/blog/google-business-profile-suspension/", "/blog/secure-website-development/", "/blog/ecommerce-development-saudi/",
  "/blog/topics/google-business-profile/", "/blog/topics/local-seo-saudi/", "/blog/topics/cybersecurity/", "/blog/topics/ai-agents/", "/blog/topics/web-development/"
];

const routeFile = (route) => route === "/" ? join(output, "index.html") : join(output, route.replace(/^\//, "").replace(/\/$/, ""), "index.html");
const normalizeRoute = (route) => route === "/" ? "/" : `/${route.replace(/^\//, "").replace(/\/$/, "")}/`;
const textContent = (html) => html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&[a-zA-Z#0-9]+;/g, " ").replace(/\s+/g, " ").trim();
const matchOne = (html, regex) => html.match(regex)?.[1]?.trim() || "";
const wordCount = (html) => textContent(html).split(/\s+/).filter(Boolean).length;

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
  lastmod: matchOne(match[1], /<lastmod>([^<]+)<\/lastmod>/i)
}));
const sitemapRoutes = [];
const seenLocations = new Set();
const today = new Date().toISOString().slice(0, 10);

for (const entry of sitemapEntries) {
  if (!entry.loc.startsWith(`${canonicalBase}/`)) errors.push(`Sitemap URL is not canonical: ${entry.loc}`);
  if (seenLocations.has(entry.loc)) errors.push(`Duplicate sitemap URL: ${entry.loc}`);
  seenLocations.add(entry.loc);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.lastmod)) errors.push(`Invalid sitemap lastmod for ${entry.loc}: ${entry.lastmod || "missing"}`);
  else if (entry.lastmod > today) errors.push(`Future sitemap lastmod for ${entry.loc}: ${entry.lastmod}`);
  try { sitemapRoutes.push(normalizeRoute(new URL(entry.loc).pathname)); }
  catch { errors.push(`Invalid sitemap URL: ${entry.loc}`); }
}

for (const route of requiredRoutes) if (!sitemapRoutes.includes(route)) errors.push(`Sitemap missing required route ${route}`);

const htmlFiles = (await walk(output)).filter((file) => file.endsWith("index.html"));
const publicRoutes = [...new Set(htmlFiles.map(routeFromFile).filter(Boolean))].sort();
for (const route of publicRoutes) if (!sitemapRoutes.includes(route)) errors.push(`Public HTML route is absent from sitemap: ${route}`);
for (const route of sitemapRoutes) if (!publicRoutes.includes(route)) errors.push(`Sitemap lists a missing HTML route: ${route}`);

const vercelConfig = JSON.parse(await readFile(join(root, "vercel.json"), "utf8"));
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
  if (/improvements\.css|brand\.css|seo-cro\.css/.test(html)) errors.push(`${route}: references legacy CSS`);
  if (!/<main\s+id=["']main["']>/i.test(html)) errors.push(`${route}: missing main landmark`);
  if (!/<footer\s+class=["']site-footer["']>/i.test(html)) errors.push(`${route}: missing footer`);
  if (route.startsWith("/blog/") && route !== "/blog/" && !route.startsWith("/blog/topics/") && words < 300) errors.push(`${route}: article content is too thin without JavaScript (${words} words)`);

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

for (const required of ["robots.txt", "manifest.webmanifest", "feed.xml", "profile.json", "llms.txt", "humans.txt", "CNAME", ".well-known/security.txt", "404.html"]) {
  if (!(await exists(join(output, required)))) errors.push(`Missing generated file: ${required}`);
}

const robotsText = await readFile(join(output, "robots.txt"), "utf8").catch(() => "");
if (!robotsText.includes(`Sitemap: ${canonicalBase}/sitemap.xml`)) errors.push("robots.txt does not reference the canonical sitemap");
if (!/User-agent:\s*\*[\s\S]*Allow:\s*\//i.test(robotsText)) errors.push("robots.txt does not allow public crawling");

const home = pages.get("/") || "";
if ((home.match(/class=["']service-card reveal["']/g) || []).length !== 9) errors.push("Homepage does not render all 9 services");
if (wordCount(home) < 900) warnings.push(`Homepage content is shorter than 900 words (${wordCount(home)})`);

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
