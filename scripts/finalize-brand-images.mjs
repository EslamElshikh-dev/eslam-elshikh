import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const outDir = process.argv[2] || "dist";
const approvedLogo = "https://i.ibb.co/QjrZzVgv/7756-removebg-preview.webp?v=20260730-1638";
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

  if (hasType("Person")) value.image = approvedLogo;
  if (hasType("ProfessionalService", "LocalBusiness", "Organization")) {
    value.logo = approvedLogo;
    value.image = approvedLogo;
  }
  if (hasType("WebSite", "WebPage", "ProfilePage", "Article", "BlogPosting", "Service")) value.image = approvedLogo;

  for (const [key, child] of Object.entries(value)) {
    if (key !== "@context") value[key] = updateSchemaImages(child);
  }
  return value;
}

const iconTags = [
  `<link rel="icon" href="${approvedLogo}" type="image/webp" sizes="any">`,
  `<link rel="shortcut icon" href="${approvedLogo}" type="image/webp">`,
  `<link rel="apple-touch-icon" href="${approvedLogo}">`
].join("\n  ");

const htmlFiles = (await walk(outDir)).filter((path) => path.endsWith(".html"));
for (const path of htmlFiles) {
  let html = await readFile(path, "utf8");

  html = html.replace(/\s*<link\b[^>]*\brel=["'](?:icon|shortcut icon|apple-touch-icon)["'][^>]*>\s*/gi, "\n");
  html = html.replace("</head>", `  ${iconTags}\n</head>`);

  html = upsertMeta(html, "property", "og:image", approvedLogo);
  html = upsertMeta(html, "property", "og:image:secure_url", approvedLogo);
  html = upsertMeta(html, "property", "og:image:type", "image/webp");
  html = upsertMeta(html, "property", "og:image:alt", brandName);
  html = html.replace(/\s*<meta\b[^>]*\bproperty=["']og:image:(?:width|height)["'][^>]*>\s*/gi, "\n");

  html = upsertMeta(html, "name", "twitter:card", "summary");
  html = upsertMeta(html, "name", "twitter:image", approvedLogo);
  html = upsertMeta(html, "name", "twitter:image:alt", brandName);
  html = upsertMeta(html, "name", "image", approvedLogo);
  html = upsertMeta(html, "itemprop", "image", approvedLogo);

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
  manifest.icons = [{ src: approvedLogo, sizes: "any", type: "image/webp", purpose: "any maskable" }];
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
} catch (error) {
  console.warn("Manifest icon update skipped:", error.message);
}

try {
  const profilePath = join(outDir, "profile.json");
  const profile = JSON.parse(await readFile(profilePath, "utf8"));
  profile.image = approvedLogo;
  await writeFile(profilePath, JSON.stringify(profile, null, 2), "utf8");
} catch (error) {
  console.warn("Profile image update skipped:", error.message);
}

console.log(`Applied the approved brand logo to favicon, social previews, search metadata and schema across ${htmlFiles.length} HTML files.`);
