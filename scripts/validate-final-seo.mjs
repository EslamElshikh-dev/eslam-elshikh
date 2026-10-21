import { readFile, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';

// Validate the actual published output after all HTML and sitemap transforms.
const directory = resolve(process.argv.find(arg => arg.startsWith('--dir='))?.slice(6) || 'dist');
const origin = 'https://www.eslam-elshikh.com';
const errors = [];
const pages = new Map();
let schemaCount = 0;
const entries = await readdir(directory, { recursive: true });
const attr = (tag, name) => tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, 'i'))?.[1];
for (const file of entries.filter(file => file.endsWith('.html'))) {
  const html = await readFile(join(directory, file), 'utf8');
  const route = file === 'index.html' ? '/' : file.endsWith('/index.html') ? `/${file.slice(0, -10)}` : null;
  const schemas = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const [, json] of schemas) {
    try { JSON.parse(json); schemaCount++; }
    catch (error) { errors.push(`${file}: invalid final JSON-LD (${error.message})`); }
  }
  if (!route) continue;
  if (!schemas.length) errors.push(`${route}: no final JSON-LD`);
  const canonicals = [...html.matchAll(/<link\b[^>]*>/gi)].map(match => match[0]).filter(tag => attr(tag, 'rel') === 'canonical');
  if (canonicals.length !== 1 || attr(canonicals[0] || '', 'href') !== origin + route) errors.push(`${route}: final canonical is not unique and self-referencing`);
  const robots = [...html.matchAll(/<meta\b[^>]*>/gi)].map(match => match[0]).find(tag => attr(tag, 'name') === 'robots');
  if (!robots) errors.push(`${route}: missing final robots directive`);
  pages.set(origin + route, { html, noindex: /\bnoindex\b/i.test(attr(robots || '', 'content') || '') });
}

const locations = async name => [...(await readFile(join(directory, name), 'utf8')).matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
const sitemap = await locations('sitemap.xml');
const indexed = new Set(sitemap);
if (!sitemap.length || sitemap.length !== indexed.size) errors.push('Final sitemap is empty or contains duplicates');
for (const url of sitemap) {
  if (!pages.has(url)) errors.push(`Final sitemap URL has no matching canonical HTML: ${url}`);
  else if (pages.get(url).noindex) errors.push(`Final sitemap includes a noindex page: ${url}`);
}
for (const [url, { html, noindex }] of pages) {
  if (!noindex && !indexed.has(url)) errors.push(`Final indexable page missing from sitemap: ${url}`);
  const alternates = [...html.matchAll(/<link\b[^>]*>/gi)].map(match => match[0]).filter(tag => attr(tag, 'rel') === 'alternate' && attr(tag, 'hreflang'));
  const route = url.slice(origin.length);
  const arabic = origin + (route.startsWith('/en/') ? route.slice(3) : route);
  const english = origin + (route.startsWith('/en/') ? route : `/en${route}`);
  const expected = new Map([['ar', arabic], ['ar-SA', arabic], ['en', english], ['x-default', arabic]]);
  if (alternates.length !== expected.size) errors.push(`${url}: expected exactly four final language alternates`);
  for (const [language, target] of expected) {
    if (!alternates.some(tag => attr(tag, 'hreflang') === language && attr(tag, 'href') === target)) errors.push(`${url}: missing final ${language} alternate ${target}`);
    const targetPage = pages.get(target);
    if (!targetPage) { errors.push(`${url}: missing final hreflang target ${target}`); continue; }
  }
}
const core = await locations('sitemap-core.xml');
if (!core.length || new Set(core).size !== core.length) errors.push('Core sitemap is empty or contains duplicates');
for (const url of core) if (!indexed.has(url)) errors.push(`Core sitemap URL absent from main sitemap: ${url}`);

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else console.log(`Final SEO passed: ${pages.size} HTML routes, ${sitemap.length} sitemap URLs, ${core.length} core URLs and ${schemaCount} valid JSON-LD blocks.`);
