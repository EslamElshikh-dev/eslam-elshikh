import { readFile } from "node:fs/promises";
import { join } from "node:path";

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

if (errors.length) {
  console.error(`Topic indexing policy failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Validated topic indexing policy for ${routes.length} noindex,follow hubs; all are absent from sitemap.`);
