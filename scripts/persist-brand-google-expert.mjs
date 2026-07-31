import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const outDir = process.argv[2] || "dist";
const canonical = "https://www.eslam-elshikh.com";
const approvedLogo = "https://i.ibb.co/QjrZzVgv/7756-removebg-preview.webp?v=20260730-1638";
const profilePhoto = "https://avatars.githubusercontent.com/u/264218940?v=4";

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

const connectionHints = [
  '<link rel="preconnect" href="https://i.ibb.co" crossorigin>',
  '<link rel="preconnect" href="https://avatars.githubusercontent.com" crossorigin>',
  '<link rel="dns-prefetch" href="//i.ibb.co">',
  '<link rel="dns-prefetch" href="//avatars.githubusercontent.com">'
].join("\n");

const counterScript = '<script src="/assets/js/enhancements.js?v=1.0.0" defer></script>';

const htmlFiles = (await walk(outDir)).filter((path) => path.endsWith(".html"));
for (const path of htmlFiles) {
  let html = await readFile(path, "utf8");

  for (const logoPath of logoPaths) html = html.replaceAll(logoPath, approvedLogo);
  html = html.replaceAll(`${canonical}${approvedLogo}`, approvedLogo);

  html = html.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/g, (match, open, payload, close) => {
    try {
      const data = JSON.parse(payload);
      const graph = Array.isArray(data?.["@graph"]) ? data["@graph"] : [];
      for (const item of graph) {
        const types = Array.isArray(item?.["@type"]) ? item["@type"] : [item?.["@type"]];
        if (types.includes("Person")) item.image = profilePhoto;
        if (types.includes("ProfessionalService") || types.includes("LocalBusiness") || types.includes("Organization")) item.logo = approvedLogo;
      }
      return `${open}${JSON.stringify(data)}${close}`;
    } catch {
      return match;
    }
  });

  if (!html.includes('rel="preconnect" href="https://i.ibb.co"')) {
    html = html.replace("</head>", `${connectionHints}\n</head>`);
  }

  if (!html.includes("/assets/js/enhancements.js")) {
    html = html.replace("</body>", `${counterScript}\n</body>`);
  }

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

const llmsTxt = `# المهندس إسلام الشيخ

> مهندس أمن سيبراني ومطور برمجيات وخبير منتجات Google في الرياض، يقدم تطوير المواقع ووكلاء الذكاء الاصطناعي والسيو والحلول السحابية للشركات في السعودية.

## الخدمات الرئيسية

- [الأمن السيبراني وحماية الأنظمة](${canonical}/services/cybersecurity/)
- [الحلول السحابية الآمنة](${canonical}/services/cloud-solutions/)
- [تطوير وكلاء الذكاء الاصطناعي وأتمتة الأعمال](${canonical}/services/ai-agents/)
- [تصميم وتطوير المواقع والتطبيقات](${canonical}/services/web-development/)
- [استشارات ودعم منتجات Google](${canonical}/services/google-support/)
- [حل مشكلات ملفات Google التجارية](${canonical}/services/google-business-profile/)
- [قواعد المعرفة والبحث الذكي](${canonical}/services/knowledge-bases/)
- [تحسين محركات البحث والسيو المحلي](${canonical}/services/seo/)
- [إدارة الإعلانات الرقمية وصفحات الهبوط](${canonical}/services/digital-advertising/)

## صفحات مهمة

- [عن المهندس إسلام الشيخ](${canonical}/about/)
- [خبرة Google](${canonical}/google-expert/)
- [السيو المحلي](${canonical}/local-seo/)
- [الأعمال والمشروعات](${canonical}/projects/)
- [المدونة](${canonical}/blog/)
- [التواصل](${canonical}/contact/)
`;

await writeFile(join(outDir, "llms.txt"), llmsTxt, "utf8");

console.log(`Persisted approved branding, valid llms.txt Markdown, counter animation, and non-visual loading optimizations across ${htmlFiles.length} HTML files.`);
