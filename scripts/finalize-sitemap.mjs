import { readFile, readdir, writeFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";

const outDir = process.argv[2] || "dist";
const canonical = "https://www.eslam-elshikh.com";
const fallbackLastmod = "2026-07-29";
const blogIndexLastmod = "2026-08-12";

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
  const normalized = relative(outDir, file).split(sep).join("/");
  if (normalized === "index.html") return "/";
  if (!normalized.endsWith("/index.html")) return null;
  return `/${normalized.slice(0, -"index.html".length)}`;
}

function priorityFor(route) {
  if (route === "/") return "1.0";
  if (route === "/services/") return "0.9";
  if (route.startsWith("/services/")) return "0.85";
  if (route === "/blog/") return "0.8";
  if (route.startsWith("/blog/")) return "0.75";
  if (["/privacy/", "/terms/"].includes(route)) return "0.3";
  return "0.8";
}

function collectModifiedDates(value, dates = []) {
  if (Array.isArray(value)) {
    for (const item of value) collectModifiedDates(item, dates);
    return dates;
  }
  if (!value || typeof value !== "object") return dates;
  if (typeof value.dateModified === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.dateModified)) dates.push(value.dateModified);
  for (const child of Object.values(value)) collectModifiedDates(child, dates);
  return dates;
}

async function lastmodFor(file, route) {
  if (route === "/blog/") return blogIndexLastmod;
  const html = await readFile(file, "utf8");
  const dates = [];
  for (const match of html.matchAll(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi)) {
    try { collectModifiedDates(JSON.parse(match[1]), dates); } catch {}
  }
  return dates.sort().at(-1) || fallbackLastmod;
}

const htmlFiles = (await walk(outDir)).filter((file) => file.endsWith("index.html"));
const routes = [...new Set(htmlFiles.map(routeFromFile).filter(Boolean))]
  .filter((route) => !route.startsWith("/.") && !route.startsWith("/assets/"))
  .sort((a, b) => a.localeCompare(b, "en"));

const urls = (await Promise.all(routes.map(async (route) => {
  const file = htmlFiles.find((candidate) => routeFromFile(candidate) === route);
  const loc = route === "/" ? `${canonical}/` : `${canonical}${route}`;
  const lastmod = await lastmodFor(file, route);
  return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>${priorityFor(route)}</priority>\n  </url>`;
}))).join("\n");

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

await writeFile(join(outDir, "sitemap.xml"), sitemap, "utf8");
await writeFile(join(outDir, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${canonical}/sitemap.xml\nHost: ${canonical}\n`, "utf8");

console.log(`Finalized sitemap with ${routes.length} canonical URLs.`);
