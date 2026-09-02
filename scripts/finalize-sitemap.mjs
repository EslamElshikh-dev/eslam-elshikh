import { readFile, readdir, writeFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";

const outDir = process.argv[2] || "dist";
const canonical = "https://www.eslam-elshikh.com";

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
  const html = await readFile(file, "utf8");
  const dates = [];
  for (const match of html.matchAll(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi)) {
    try { collectModifiedDates(JSON.parse(match[1]), dates); } catch {}
  }
  const lastmod = dates.sort().at(-1);
  if (!lastmod) throw new Error(`Missing verifiable dateModified metadata for ${route}`);
  return lastmod;
}

function alternateLinksFor(route) {
  if (route !== "/" && route !== "/en/") return "";
  return [
    ["ar-SA", `${canonical}/`],
    ["en", `${canonical}/en/`],
    ["x-default", `${canonical}/`]
  ].map(([hreflang, href]) => `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${href}" />`).join("\n");
}

const htmlFiles = (await walk(outDir)).filter((file) => file.endsWith("index.html"));
const routes = [...new Set(htmlFiles.map(routeFromFile).filter(Boolean))]
  .filter((route) => !route.startsWith("/.") && !route.startsWith("/assets/") && !route.startsWith("/dist/") && !route.startsWith("/node_modules/"))
  .sort((a, b) => a.localeCompare(b, "en"));

const urls = (await Promise.all(routes.map(async (route) => {
  const file = htmlFiles.find((candidate) => routeFromFile(candidate) === route);
  const loc = route === "/" ? `${canonical}/` : `${canonical}${route}`;
  const html = await readFile(file, "utf8");
  const canonicalHref = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)/i)?.[1];
  const robots = html.match(/<meta\s+name=["']robots["']\s+content=["']([^"']+)/i)?.[1] || "";
  if (canonicalHref !== loc) throw new Error(`Canonical mismatch for ${route}: ${canonicalHref || "missing"}`);
  if (!/\bindex\b/i.test(robots) || /\bnoindex\b/i.test(robots)) throw new Error(`Non-indexable page found in public routes: ${route}`);
  const lastmod = await lastmodFor(file, route);
  const alternates = alternateLinksFor(route);
  return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>${alternates ? `\n${alternates}` : ""}\n  </url>`;
}))).join("\n");

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`;

await writeFile(join(outDir, "sitemap.xml"), sitemap, "utf8");
await writeFile(join(outDir, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${canonical}/sitemap.xml\n`, "utf8");

console.log(`Finalized sitemap with ${routes.length} canonical URLs.`);
