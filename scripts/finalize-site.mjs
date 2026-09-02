import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const outDir = process.argv[2] || "dist";
const canonical = "https://www.eslam-elshikh.com";
const primaryLogo = "/assets/brand/eslam-elshikh-primary.svg";
const profilePhoto = "/assets/brand/eslam-elshikh-portrait-20260827.webp";

const isDistBuild = /(^|[\\/])dist$/.test(outDir);
const extraHead = isDistBuild ? "" : `<link rel="stylesheet" href="/assets/css/enhancements.css?v=1.0.2">`;
const extraBody = `<script src="/assets/js/enhancements.js?v=1.0.0" defer></script>`;
const json = (value) => JSON.stringify(value).replaceAll("<", "\\u003c");

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

function normalizeSchema(value) {
  if (Array.isArray(value)) return value.map(normalizeSchema);
  if (!value || typeof value !== "object") return value;
  const type = value["@type"];
  if (type === "ProfilePage") {
    value.mainEntity = { "@id": `${canonical}/#person` };
    value.url = value.url ? String(value.url).replace("https://eslam-elshikh.com", canonical) : `${canonical}/en/`;
  }
  if (type === "Person") {
    value.image = `${canonical}${primaryLogo}`;
    value.workLocation = { "@type": "Place", name: "الرياض", address: { "@type": "PostalAddress", addressLocality: "الرياض", addressRegion: "منطقة الرياض", addressCountry: "SA" } };
    value.areaServed = { "@type": "City", name: "الرياض" };
  }
  if (type === "ProfessionalService") {
    value.logo = `${canonical}${primaryLogo}`;
    value.areaServed = { "@type": "City", name: "الرياض" };
    value.category = ["مصمم مواقع ويب", "استشاري كمبيوتر", "خدمة التسويق عبر الإنترنت", "دعم الكمبيوتر والخدمات"];
  }
  for (const key of Object.keys(value)) value[key] = normalizeSchema(value[key]);
  return value;
}

const htmlFiles = (await walk(outDir)).filter((path) => path.endsWith(".html"));
for (const path of htmlFiles) {
  let html = await readFile(path, "utf8");
  const isEnglish = /<html\s+lang="en"\s+dir="ltr"/i.test(html);
  html = html.replaceAll("https://eslam-elshikh.com", canonical);
  html = html.replaceAll("/assets/brand/eslam-elshikh-logo-transparent.png", primaryLogo);
  html = html.replace(/(<img[^>]+class="hero-logo"[^>]+src=")[^"]+("[^>]*>)/g, `$1${profilePhoto}$2`);
  html = html.replace(/(<img[^>]+class="profile-logo"[^>]+src=")[^"]+("[^>]*>)/g, `$1${profilePhoto}$2`);
  html = html.replace(/(<img[^>]+class="hero-logo"[^>]+alt=")[^"]*(")/g, `$1${isEnglish ? "Portrait of Eng. Eslam Elshikh" : "صورة المهندس إسلام الشيخ"}$2`);
  html = html.replace(/(<img[^>]+class="profile-logo"[^>]+alt=")[^"]*(")/g, `$1${isEnglish ? "Portrait of Eng. Eslam Elshikh" : "صورة المهندس إسلام الشيخ"}$2`);
  if (extraHead && !html.includes("/assets/css/enhancements.css")) html = html.replace("</head>", `${extraHead}\n</head>`);
  if (!html.includes("/assets/js/enhancements.js")) html = html.replace("</body>", `${extraBody}\n</body>`);
  html = html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g, (full, raw) => {
    try { return `<script type="application/ld+json">${json(normalizeSchema(JSON.parse(raw)))}</script>`; } catch { return full; }
  });
  if ((path.endsWith("about/index.html") || path.endsWith("contact/index.html")) && !html.includes("service-area-note") && !html.includes("business-map-section")) {
    html = html.replace("</main>", `<section class="section-pad"><div class="container"><div class="service-area-note"><strong>نطاق الخدمة: مدينة الرياض بالكامل</strong><p>تُقدَّم الخدمات عن بُعد، مع إمكانية زيارة مواقع العملاء داخل الرياض بموعد مسبق. لا يوجد مقر لاستقبال العملاء.</p></div></div></section></main>`);
  }
  await writeFile(path, html);
}

console.log(`Finalized ${htmlFiles.length} pages.`);
