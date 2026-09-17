import { readFile, readdir, writeFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";

const root = resolve(process.argv[2] || ".");
const REVISION_DATE = "2026-09-17";
const AR_REVISION_LABEL = "١٧‏/٠٩‏/٢٠٢٦";
const EN_REVISION_LABEL = "17 Sep 2026";

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

function replaceExact(html, from, to) {
  return html.includes(from) ? html.replaceAll(from, to) : html;
}

function removeTopicGridSection(html, topicPrefix) {
  return html.replace(/<section class="section-pad muted-section">[\s\S]*?<\/section>/g, (section) => {
    if (!section.includes('class="topics-grid"')) return section;
    if (!section.includes(`href="${topicPrefix}`)) return section;
    return "";
  });
}

function removeTopicCrumb(html, topicPrefix) {
  const escapedPrefix = topicPrefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`<svg class="icon"[^>]*>[\\s\\S]*?<\\/svg><a href="${escapedPrefix}[^\"]+\/"[^>]*>[\\s\\S]*?<\\/a>`);
  return html.replace(pattern, "");
}

function removeTopicSidebarCard(html, topicPrefix) {
  const escapedPrefix = topicPrefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`<div class="related-service-card reveal">[\\s\\S]*?<a class="button button-ghost" href="${escapedPrefix}[^\"]+\/"[\\s\\S]*?<\\/a><\\/div>\\n?`);
  return html.replace(pattern, "");
}

function removeGenericArticleSections(html) {
  for (const id of ["implementation-roadmap", "expected-deliverables", "article-summary"]) {
    const sectionPattern = new RegExp(`<section id="${id}"[\\s\\S]*?<\\/section>`, "g");
    const tocPattern = new RegExp(`<a href="#${id}">[\\s\\S]*?<\\/a>`, "g");
    html = html.replace(sectionPattern, "").replace(tocPattern, "");
  }
  return html;
}

function updateVisibleArticleDate(html, language) {
  if (language === "ar") {
    html = html.replace(/(<p>آخر مراجعة:\s*)[^<]+(<\/p>)/, `$1${AR_REVISION_LABEL}$2`);
    html = html.replace(/(<dt>آخر تحديث<\/dt><dd><time datetime=")[^"]+("[^>]*>)[^<]+(<\/time><\/dd>)/, `$1${REVISION_DATE}$2${AR_REVISION_LABEL}$3`);
  } else {
    html = html.replace(/(<p>Reviewed\s*)[^<]+(<\/p>)/, `$1${EN_REVISION_LABEL}$2`);
    html = html.replace(/(<dt>Last updated<\/dt><dd><time datetime=")[^"]+("[^>]*>)[^<]+(<\/time><\/dd>)/, `$1${REVISION_DATE}$2${EN_REVISION_LABEL}$3`);
  }
  return html;
}

function patchJsonLd(html, { article = false, seoService = false } = {}) {
  return html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g, (full, jsonText) => {
    try {
      const data = JSON.parse(jsonText);
      const graph = Array.isArray(data?.["@graph"]) ? data["@graph"] : [data];
      for (const node of graph) {
        const type = node?.["@type"];
        if (type === "BreadcrumbList" && Array.isArray(node.itemListElement)) {
          node.itemListElement = node.itemListElement
            .filter((item) => {
              const target = String(item?.item || item?.url || "");
              return !target.includes("/blog/topics/");
            })
            .map((item, index) => ({ ...item, position: index + 1 }));
        }
        if (article && (type === "BlogPosting" || type === "Article")) {
          node.dateModified = REVISION_DATE;
        }
        if (seoService && type === "WebPage" && String(node.url || node["@id"] || "").includes("/services/seo/")) {
          node.dateModified = REVISION_DATE;
        }
      }
      return `<script type="application/ld+json">${JSON.stringify(data).replaceAll("<", "\\u003c")}</script>`;
    } catch {
      return full;
    }
  });
}

function patchSeoService(html, language) {
  if (language === "ar") {
    const pairs = [
      ["خبير SEO وسيو محلي في الرياض | إسلام الشيخ", "خدمات SEO وتحسين محركات البحث في السعودية | إسلام الشيخ"],
      ["خدمات تحسين محركات البحث والسيو المحلي في الرياض", "خدمات SEO وتحسين محركات البحث للشركات في السعودية"],
      ["خدمات SEO وسيو محلي في الرياض تشمل التدقيق التقني وبنية المحتوى والكلمات والكيانات وSchema وGoogle Business Profile وقياس الظهور والتحويل.", "خدمات SEO للشركات في السعودية تشمل التدقيق التقني والزحف والفهرسة وبنية المحتوى والكيانات والروابط الداخلية وSchema وSearch Console وقياس التحويل."]
    ];
    for (const [from, to] of pairs) html = replaceExact(html, from, to);
  } else {
    const pairs = [
      ["SEO Consultant in Riyadh | Technical & Local", "SEO Consultant for Saudi Businesses | Technical & Content"],
      ["Technical, content, and local SEO services in Riyadh covering indexing, site architecture, performance, service content, Google Business Profile, and conversions.", "Technical and content SEO services for Saudi businesses covering indexing, architecture, performance, service content, internal linking, Search Console, and conversions."]
    ];
    for (const [from, to] of pairs) html = replaceExact(html, from, to);
  }
  return patchJsonLd(html, { seoService: true });
}

function patchArticle(html, language) {
  const topicPrefix = language === "ar" ? "/blog/topics/" : "/en/blog/topics/";
  html = removeTopicCrumb(html, topicPrefix);
  html = removeTopicSidebarCard(html, topicPrefix);
  html = removeGenericArticleSections(html);
  html = updateVisibleArticleDate(html, language);
  html = patchJsonLd(html, { article: true });
  return html;
}

const files = await walk(root);
const htmlFiles = files.filter((file) => file.endsWith(".html"));
let changed = 0;
let patchedArticles = 0;

for (const file of htmlFiles) {
  const rel = relative(root, file).replaceAll("\\", "/");
  let html = await readFile(file, "utf8");
  const before = html;

  if (rel === "services/seo/index.html") html = patchSeoService(html, "ar");
  if (rel === "en/services/seo/index.html") html = patchSeoService(html, "en");

  if (rel === "blog/index.html") html = removeTopicGridSection(html, "/blog/topics/");
  if (rel === "en/blog/index.html") html = removeTopicGridSection(html, "/en/blog/topics/");

  const isArabicArticle = /^blog\/[^/]+\/index\.html$/.test(rel);
  const isEnglishArticle = /^en\/blog\/[^/]+\/index\.html$/.test(rel);
  if (isArabicArticle) {
    html = patchArticle(html, "ar");
    patchedArticles += 1;
  } else if (isEnglishArticle) {
    html = patchArticle(html, "en");
    patchedArticles += 1;
  }

  if (html !== before) {
    await writeFile(file, html, "utf8");
    changed += 1;
  }
}

for (const file of files.filter((file) => /(?:^|\/)(?:llms|llms-full)\.txt$/.test(file.replaceAll("\\", "/")))) {
  let text = await readFile(file, "utf8");
  const before = text;
  text = text
    .replaceAll("تحسين محركات البحث SEO والسيو المحلي", "تحسين محركات البحث SEO")
    .replaceAll("Technical, Content & Local SEO", "Technical & Content SEO");
  if (text !== before) {
    await writeFile(file, text, "utf8");
    changed += 1;
  }
}

const arSeo = await readFile(join(root, "services", "seo", "index.html"), "utf8");
const enSeo = await readFile(join(root, "en", "services", "seo", "index.html"), "utf8");
const arBlog = await readFile(join(root, "blog", "index.html"), "utf8");
const enBlog = await readFile(join(root, "en", "blog", "index.html"), "utf8");

if (!arSeo.includes("خدمات SEO وتحسين محركات البحث في السعودية | إسلام الشيخ")) throw new Error("Arabic SEO intent refinement did not apply");
if (!enSeo.includes("SEO Consultant for Saudi Businesses | Technical & Content")) throw new Error("English SEO intent refinement did not apply");
if (arBlog.includes('href="/blog/topics/')) throw new Error("Arabic blog index still promotes noindex topic hubs");
if (enBlog.includes('href="/en/blog/topics/')) throw new Error("English blog index still promotes noindex topic hubs");
if (patchedArticles === 0) throw new Error("No article pages were found for SEO architecture refinement");

for (const file of htmlFiles) {
  const rel = relative(root, file).replaceAll("\\", "/");
  if (!/^blog\/[^/]+\/index\.html$/.test(rel) && !/^en\/blog\/[^/]+\/index\.html$/.test(rel)) continue;
  const html = await readFile(file, "utf8");
  if (html.includes("implementation-roadmap") || html.includes("expected-deliverables") || html.includes("article-summary")) {
    throw new Error(`Generic article boilerplate remains in ${rel}`);
  }
  if (html.includes('href="/blog/topics/') || html.includes('href="/en/blog/topics/')) {
    throw new Error(`Noindex topic hub remains in article navigation: ${rel}`);
  }
}

console.log(`SEO architecture refined: ${patchedArticles} articles reviewed, ${changed} files changed in ${root}`);
