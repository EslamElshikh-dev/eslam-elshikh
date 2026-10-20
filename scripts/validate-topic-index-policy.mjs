import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { posts } from "../src/content.mjs";
import { guides } from "../src/guides.mjs";
import { guideToPost } from "../src/editorial.mjs";
import { englishArticles } from "../src/english.mjs";

const outDirArg = process.argv.find((arg) => arg.startsWith("--dir="));
const outDir = outDirArg ? outDirArg.slice(6) : "dist";
const canonicalBase = "https://www.eslam-elshikh.com";
const topicSlugs = [
  "google-business-profile",
  "local-seo-saudi",
  "cybersecurity",
  "ai-agents",
  "web-development"
];

const routes = topicSlugs.flatMap((slug) => [
  `/blog/topics/${slug}/`,
  `/en/blog/topics/${slug}/`
]);
const sitemap = await readFile(join(outDir, "sitemap.xml"), "utf8");
const errors = [];

for (const route of routes) {
  const file = join(outDir, route.replace(/^\//, "").replace(/\/$/, ""), "index.html");
  const html = await readFile(file, "utf8");
  const robots = html.match(/<meta\s+name=["']robots["']\s+content=["']([^"']*)/i)?.[1] || "";
  const canonical = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']*)/i)?.[1] || "";
  const absolute = `${canonicalBase}${route}`;

  if (!/\bnoindex\b/i.test(robots) || !/\bfollow\b/i.test(robots)) {
    errors.push(`${route}: expected robots noindex,follow; found ${robots || "missing"}`);
  }
  if (canonical !== absolute) {
    errors.push(`${route}: expected self canonical ${absolute}; found ${canonical || "missing"}`);
  }
  if (sitemap.includes(`<loc>${absolute}</loc>`)) {
    errors.push(`${route}: noindex topic hub must not appear in sitemap`);
  }
}

// Run after every HTML transformation and the final sitemap generation. A
// correct source revision must survive in both article metadata and lastmod.
const articles = [
  ...[...posts, ...guides.map(guideToPost)].map((post) => ({ post, prefix: "" })),
  ...englishArticles.map((post) => ({ post, prefix: "/en" }))
];
for (const { post, prefix } of articles) {
  const route = `${prefix}/blog/${post.slug}/`;
  const html = await readFile(join(outDir, route.slice(1), "index.html"), "utf8");
  const expected = ["2026-10-03", post.modified || post.date].sort().at(-1);
  const graph = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap((match) => {
    const data = JSON.parse(match[1]);
    return Array.isArray(data?.["@graph"]) ? data["@graph"] : [data];
  });
  for (const type of ["BlogPosting", "WebPage"]) {
    const node = graph.find((item) => item["@type"] === type);
    // Article pages use BlogPosting as the page entity; WebPage is optional.
    if (type === "WebPage" && !node) continue;
    if (node?.dateModified !== expected) errors.push(`${route}: ${type} revision lost after publishing; expected ${expected}, found ${node?.dateModified}`);
  }
  if (!html.includes(`<time datetime="${expected}">`)) errors.push(`${route}: visible review date does not preserve source revision ${expected}`);
  const entry = sitemap.match(new RegExp(`<url>\\s*<loc>${canonicalBase.replaceAll(".", "\\.")}${route}</loc>[\\s\\S]*?</url>`))?.[0] || "";
  if (!entry.includes(`<lastmod>${expected}</lastmod>`)) errors.push(`${route}: sitemap revision does not preserve source revision ${expected}`);
}

if (errors.length) {
  console.error(`Topic indexing policy failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Validated topic indexing policy for ${routes.length} noindex,follow hubs; all are absent from sitemap.`);
console.log(`Validated final revision dates for ${articles.length} bilingual articles against source, visible dates, schema and sitemap.`);
