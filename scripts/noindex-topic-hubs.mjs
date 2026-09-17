import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const outDir = process.argv[2] || "dist";
const topicSlugs = [
  "google-business-profile",
  "local-seo-saudi",
  "cybersecurity",
  "ai-agents",
  "web-development"
];
const localeRoots = [
  ["ar", ["blog", "topics"]],
  ["en", ["en", "blog", "topics"]]
];

const indexRobots = '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">';
const noindexRobots = '<meta name="robots" content="noindex, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">';

let updated = 0;
for (const [locale, rootParts] of localeRoots) {
  for (const slug of topicSlugs) {
    const file = join(outDir, ...rootParts, slug, "index.html");
    let html = await readFile(file, "utf8");

    if (html.includes(noindexRobots)) {
      continue;
    }
    if (!html.includes(indexRobots)) {
      throw new Error(`${locale}/${slug}: expected indexable robots meta before applying topic-hub policy`);
    }

    html = html.replace(indexRobots, noindexRobots);
    await writeFile(file, html, "utf8");
    updated += 1;
  }
}

console.log(`Applied noindex,follow to ${updated} topic hub pages; finalize-sitemap will omit them automatically.`);
