import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { articleVisuals } from "../src/article-visuals.mjs";
import { caseStudies } from "../src/case-studies.mjs";
import { products } from "../src/products.mjs";

const outDir = process.argv[2] || "dist";
const canonical = "https://www.eslam-elshikh.com";
const approvedLogo = `${canonical}/assets/brand/eslam-elshikh-logo-20260827.webp`;
const interfaceLogo = `${canonical}/assets/brand/eslam-elshikh-logo-ui-20260827.webp`;
const profilePhoto = `${canonical}/assets/brand/eslam-elshikh-portrait-20260827.webp`;
const shareImage = `${canonical}/assets/og/eslam-elshikh-social-card.png`;
const brandName = "المهندس إسلام الشيخ";

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

function upsertMeta(html, attribute, key, content) {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`<meta\\b[^>]*\\b${attribute}=["']${escapedKey}["'][^>]*>`, "gi");
  const tag = `<meta ${attribute}="${key}" content="${content}">`;
  if (pattern.test(html)) return html.replace(pattern, tag);
  return html.replace("</head>", `  ${tag}\n</head>`);
}

function updateSchemaImages(value) {
  if (Array.isArray(value)) return value.map(updateSchemaImages);
  if (!value || typeof value !== "object") return value;

  const types = Array.isArray(value["@type"]) ? value["@type"] : [value["@type"]];
  const hasType = (...names) => names.some((name) => types.includes(name));

  if (hasType("Person")) value.image = profilePhoto;
  const isSiteOrganization = hasType("Organization")
    && String(value["@id"] || value.url || "").startsWith("https://www.eslam-elshikh.com/");
  if (hasType("ProfessionalService", "LocalBusiness") || isSiteOrganization) {
    value.logo = approvedLogo;
    value.image = profilePhoto;
  }

  for (const [key, child] of Object.entries(value)) {
    if (key !== "@context") value[key] = updateSchemaImages(child);
  }
  return value;
}

const iconTags = [
  `<link rel="icon" href="${interfaceLogo}" type="image/webp" sizes="192x192">`,
  `<link rel="shortcut icon" href="${interfaceLogo}" type="image/webp">`,
  `<link rel="apple-touch-icon" href="${interfaceLogo}" sizes="192x192">`
].join("\n  ");

const htmlFiles = (await walk(outDir)).filter((path) => path.endsWith(".html"));
for (const path of htmlFiles) {
  let html = await readFile(path, "utf8");
  const isEnglish = /<html\s+lang="en"\s+dir="ltr"/i.test(html);
  const articleSlug = path.replaceAll("\\", "/").match(/(?:^|\/)(?:en\/)?blog\/([^/]+)\/index\.html$/)?.[1];
  const articleVisual = articleVisuals[articleSlug];
  const storySlug = path.replaceAll("\\", "/").match(/(?:^|\/)(?:en\/)?(projects|products)\/([^/]+)\/index\.html$/);
  const study = storySlug?.[1] === "projects" ? caseStudies.find(item => item.slug === storySlug[2]) : null;
  const product = storySlug?.[1] === "products" ? products.find(item => item.slug === storySlug[2]) : null;
  const storyVisual = study ? { src: study.image, width: 1200, height: 750, altAr: study.title, altEn: study.englishName }
    : product ? { src: product.image, width: 1200, height: 750, altAr: product.name.ar, altEn: product.name.en } : null;
  const customVisual = articleVisual || storyVisual;
  const socialImage = customVisual ? `${canonical}${customVisual.src}` : shareImage;
  const socialAlt = customVisual ? isEnglish ? customVisual.altEn : customVisual.altAr : isEnglish ? "Eslam Elshikh" : brandName;

  html = html.replace(/\s*<link\b[^>]*\brel=["'](?:icon|shortcut icon|apple-touch-icon)["'][^>]*>\s*/gi, "\n");
  html = html.replace("</head>", `  ${iconTags}\n</head>`);

  html = upsertMeta(html, "property", "og:image", socialImage);
  html = upsertMeta(html, "property", "og:image:secure_url", socialImage);
  html = upsertMeta(html, "property", "og:image:type", customVisual ? "image/webp" : "image/png");
  html = upsertMeta(html, "property", "og:image:alt", socialAlt);
  html = upsertMeta(html, "property", "og:image:width", String(customVisual?.width || 1200));
  html = upsertMeta(html, "property", "og:image:height", String(customVisual?.height || 630));

  html = upsertMeta(html, "name", "twitter:card", "summary_large_image");
  html = upsertMeta(html, "name", "twitter:image", socialImage);
  html = upsertMeta(html, "name", "twitter:image:alt", socialAlt);
  html = upsertMeta(html, "name", "image", socialImage);
  html = upsertMeta(html, "itemprop", "image", socialImage);

  html = html.replace(/(<script type=["']application\/ld\+json["']>)([\s\S]*?)(<\/script>)/gi, (match, open, payload, close) => {
    try {
      const data = JSON.parse(payload);
      return `${open}${JSON.stringify(updateSchemaImages(data))}${close}`;
    } catch {
      return match;
    }
  });

  await writeFile(path, html, "utf8");
}

try {
  const manifestPath = join(outDir, "manifest.webmanifest");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  manifest.icons = [{ src: interfaceLogo, sizes: "192x192", type: "image/webp", purpose: "any maskable" }];
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
} catch (error) {
  console.warn("Manifest icon update skipped:", error.message);
}

try {
  const profilePath = join(outDir, "profile.json");
  const profile = JSON.parse(await readFile(profilePath, "utf8"));
  profile.image = profilePhoto;
  await writeFile(profilePath, JSON.stringify(profile, null, 2), "utf8");
} catch (error) {
  console.warn("Profile image update skipped:", error.message);
}

console.log(`Applied the approved brand logo to favicon, social previews, search metadata and schema across ${htmlFiles.length} HTML files.`);
