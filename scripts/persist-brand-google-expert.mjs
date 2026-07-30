import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const outDir = process.argv[2] || "dist";
const approvedLogo = "https://i.ibb.co/QjrZzVgv/7756-removebg-preview.webp?v=20260730-1638";

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

const statsHtml = `<section class="section-pad"><div class="container google-stats"><div class="google-stat reveal"><strong data-counter="1411" data-suffix="+">0+</strong><span>مساهمة في توثيق وإدارة ملفات Google التجارية</span></div><div class="google-stat reveal"><strong data-counter="105" data-suffix="+">0+</strong><span>موقع وتطبيق ومتجر إلكتروني تم تصميمها وتطويرها</span></div><div class="google-stat reveal"><strong data-counter="653" data-suffix="+">0+</strong><span>مساعد بالذكاء الاصطناعي ومشروع سحابي</span></div><div class="google-stat reveal"><strong data-counter="360" data-suffix="°">0°</strong><span>رؤية تجمع الأمن والتطوير والظهور الرقمي</span></div></div></section>`;

const professionalBio = `<aside class="disclaimer-card professional-summary-card reveal"><span>نبذة مهنية</span><h2>خبرة تقنية تبني الثقة وتحول التحديات إلى نتائج</h2><p>المهندس إسلام الشيخ مصمم مواقع ويب ومستشار تقني في الرياض، يجمع بين تطوير المواقع والتطبيقات، وتحسين الظهور في Google، والأمن السيبراني، والذكاء الاصطناعي والحلول السحابية. يبدأ كل مشروع بفهم الهدف التجاري وتجربة المستخدم، ثم تحويله إلى خطة واضحة وتنفيذ متقن ومخرجات قابلة للقياس والتطوير.</p></aside>`;

const logoPaths = [
  "/assets/brand/eslam-elshikh-primary.svg",
  "/assets/brand/eslam-elshikh-logo-2026.svg",
  "/assets/brand/eslam-elshikh-logo-transparent.png",
  "/assets/brand/eslam-elshikh-logo.webp"
];

const htmlFiles = (await walk(outDir)).filter((path) => path.endsWith(".html"));
for (const path of htmlFiles) {
  let html = await readFile(path, "utf8");

  for (const logoPath of logoPaths) html = html.replaceAll(logoPath, approvedLogo);

  if (path.replaceAll("\\", "/").endsWith("/google-expert/index.html")) {
    html = html.replace(
      /<section class="section-pad"><div class="container google-stats">[\s\S]*?<\/div><\/section>/,
      statsHtml
    );
    html = html.replace(
      /<aside class="disclaimer-card(?: professional-summary-card)? reveal">[\s\S]*?<\/aside>/,
      professionalBio
    );
  }

  await writeFile(path, html, "utf8");
}

console.log(`Persisted approved ImgBB brand and Google expert updates across ${htmlFiles.length} HTML files.`);
