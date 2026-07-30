import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outArg = process.argv[2] || "dist";
const outDir = resolve(root, outArg);
const slugs = [
  "web-design-riyadh-guide",
  "technical-seo-saudi-business",
  "local-seo-riyadh",
  "google-business-profile-verification",
  "cybersecurity-small-business",
  "ai-agents-business",
  "cloud-solutions-security",
  "ecommerce-development-saudi",
  "landing-pages-conversion",
  "website-maintenance-security"
];

const articleShell = join(root, "assets", "guides", "article.html");
const hubShell = join(root, "assets", "guides", "index.html");
const hubDir = join(outDir, "blog", "pro-guides");
await mkdir(hubDir, { recursive: true });
await copyFile(hubShell, join(hubDir, "index.html"));

for (const slug of slugs) {
  const targetDir = join(hubDir, slug);
  await mkdir(targetDir, { recursive: true });
  await copyFile(articleShell, join(targetDir, "index.html"));
}

const sitemapPath = join(outDir, "sitemap.xml");
try {
  let sitemap = await readFile(sitemapPath, "utf8");
  const entries = ["/blog/pro-guides/", ...slugs.map((slug) => `/blog/pro-guides/${slug}/`)]
    .filter((path) => !sitemap.includes(`<loc>https://www.eslam-elshikh.com${path}</loc>`))
    .map((path) => `  <url><loc>https://www.eslam-elshikh.com${path}</loc><lastmod>2026-07-30</lastmod><changefreq>monthly</changefreq><priority>0.75</priority></url>`)
    .join("\n");
  if (entries) sitemap = sitemap.replace("</urlset>", `${entries}\n</urlset>`);
  await writeFile(sitemapPath, sitemap, "utf8");
} catch (error) {
  console.warn("Professional guides were published, but sitemap update was skipped:", error.message);
}

console.log(`Published ${slugs.length} professional SEO guides plus the guide hub.`);
