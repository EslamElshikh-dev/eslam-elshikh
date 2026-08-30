import { readFile } from "node:fs/promises";
import { join } from "node:path";

const outDirArg = process.argv.find((arg) => arg.startsWith("--dir="));
const outDir = outDirArg ? outDirArg.slice(6) : "dist";
const canonicalBase = "https://www.eslam-elshikh.com";

const topics = {
  "google-business-profile": "ملفات Google التجارية",
  "local-seo-saudi": "السيو المحلي في السعودية",
  cybersecurity: "الأمن السيبراني",
  "ai-agents": "وكلاء الذكاء الاصطناعي",
  "web-development": "تطوير المواقع والتطبيقات"
};

for (const [slug, title] of Object.entries(topics)) {
  const file = join(outDir, "blog", "topics", slug, "index.html");
  const html = await readFile(file, "utf8");
  const marker = `data-topic-editorial="${slug}"`;
  const markerMatches = html.match(new RegExp(`data-topic-editorial=["']${slug}["']`, "g")) || [];
  if (markerMatches.length !== 1) throw new Error(`${slug}: expected exactly one editorial marker, found ${markerMatches.length}`);

  const markerPosition = html.indexOf(marker);
  const beforeMarker = html.slice(Math.max(0, markerPosition - 40), markerPosition);
  if (!beforeMarker.endsWith("</div></div></div></section>\n<section class=\"section-pad topic-editorial-section\" ")) {
    throw new Error(`${slug}: editorial section is not directly after the topic hero`);
  }

  const articleAnchor = `<section class="section-pad"><div class="container"><div class="section-heading reveal"><span class="eyebrow"><span aria-hidden="true"></span>المقالات</span><h2>أدلة مرتبطة بموضوع ${title}</h2>`;
  const articlePosition = html.indexOf(articleAnchor, markerPosition);
  if (articlePosition < 0) throw new Error(`${slug}: article section is missing after editorial content`);
  const beforeArticles = html.slice(Math.max(markerPosition, articlePosition - 40), articlePosition);
  if (!beforeArticles.endsWith("</div></div></section>\n")) throw new Error(`${slug}: editorial section is not cleanly closed before articles`);

  const jsonMatch = html.match(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/i);
  if (!jsonMatch) throw new Error(`${slug}: missing JSON-LD`);
  const data = JSON.parse(jsonMatch[1]);
  const graph = Array.isArray(data?.["@graph"]) ? data["@graph"] : [];
  const pageId = `${canonicalBase}/blog/topics/${slug}/#webpage`;
  const pageNode = graph.find((node) => node?.["@id"] === pageId);
  if (!pageNode || pageNode["@type"] !== "CollectionPage") throw new Error(`${slug}: missing CollectionPage node`);
  if (pageNode.about?.name !== title) throw new Error(`${slug}: CollectionPage topic does not match visible topic`);
  if (pageNode.mainEntity?.["@type"] !== "ItemList" || !Array.isArray(pageNode.mainEntity.itemListElement) || pageNode.mainEntity.itemListElement.length < 1) {
    throw new Error(`${slug}: missing article ItemList in structured data`);
  }

  const openSections = (html.match(/<section\b/gi) || []).length;
  const closeSections = (html.match(/<\/section>/gi) || []).length;
  if (openSections !== closeSections) throw new Error(`${slug}: unbalanced section tags (${openSections}/${closeSections})`);
}

console.log(`Validated ${Object.keys(topics).length} enriched topic hubs and their CollectionPage structure.`);
