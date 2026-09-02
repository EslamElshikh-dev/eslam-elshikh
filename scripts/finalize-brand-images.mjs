import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

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
  if (hasType("ProfessionalService", "LocalBusiness", "Organization")) {
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

  html = html.replace(/\s*<link\b[^>]*\brel=["'](?:icon|shortcut icon|apple-touch-icon)["'][^>]*>\s*/gi, "\n");
  html = html.replace("</head>", `  ${iconTags}\n</head>`);

  html = upsertMeta(html, "property", "og:image", shareImage);
  html = upsertMeta(html, "property", "og:image:secure_url", shareImage);
  html = upsertMeta(html, "property", "og:image:type", "image/png");
  html = upsertMeta(html, "property", "og:image:alt", brandName);
  html = upsertMeta(html, "property", "og:image:width", "1200");
  html = upsertMeta(html, "property", "og:image:height", "630");

  html = upsertMeta(html, "name", "twitter:card", "summary_large_image");
  html = upsertMeta(html, "name", "twitter:image", shareImage);
  html = upsertMeta(html, "name", "twitter:image:alt", brandName);
  html = upsertMeta(html, "name", "image", shareImage);
  html = upsertMeta(html, "itemprop", "image", shareImage);

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
