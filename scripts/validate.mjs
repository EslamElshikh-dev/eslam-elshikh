import { access, readFile, readdir } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const errors = [];
const warnings = [];

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
  const h1Count = (html.match(/<h1(?:\s|>)/gi) || []).length;

  if (!/<html lang="ar" dir="rtl">/i.test(html)) errors.push(`${name}: missing Arabic RTL document attributes`);
  if (!title) errors.push(`${name}: missing title`);
  if (!description) errors.push(`${name}: missing meta description`);
  if (!canonical) errors.push(`${name}: missing canonical`);
  if (h1Count !== 1) errors.push(`${name}: expected one H1, found ${h1Count}`);
  if (/href="#"/i.test(html)) errors.push(`${name}: contains placeholder href="#"`);
  if (/<a[^>]+target="_blank"(?![^>]+rel="[^"]*noopener)/i.test(html)) errors.push(`${name}: target=_blank link missing noopener`);
  if (title && title.length > 78) warnings.push(`${name}: long title (${title.length})`);
  if (description && (description.length < 90 || description.length > 190)) warnings.push(`${name}: description length ${description.length}`);

  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) {
    try { JSON.parse(match[1]); }
    catch (error) { errors.push(`${name}: invalid JSON-LD (${error.message})`); }
  }

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
