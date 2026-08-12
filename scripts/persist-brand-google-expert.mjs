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
const socialIcons = {
  GitHub: '<svg class="social-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .7a11.5 11.5 0 0 0-3.6 22.4c.6.1.8-.2.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.5-1.4-1.3-1.8-1.3-1.8-1.1-.8.1-.8.1-.8 1.2.1 1.9 1.3 1.9 1.3 1.1 1.9 2.8 1.4 3.5 1.1.1-.8.4-1.4.8-1.7-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.6.1-3.2 0 0 1-.3 3.3 1.2a11.4 11.4 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.9.1 3.2.8.9 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .4.2.7.8.6A11.5 11.5 0 0 0 12 .7Z"/></svg>',
  LinkedIn: '<svg class="social-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5.4 7.8H1.8V22h3.6V7.8ZM3.6 2A2.1 2.1 0 1 0 3.6 6.2 2.1 2.1 0 0 0 3.6 2Zm9.1 5.8H9.2V22h3.6v-7c0-1.8.3-3.6 2.6-3.6 2.2 0 2.3 2.1 2.3 3.7V22h3.6v-7.7c0-3.8-.8-6.7-5.2-6.7-2.1 0-3.5 1.2-4.1 2.3h-.1V7.8Z"/></svg>',
  X: '<svg class="social-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-4.9-6.4L6.4 22H3.2l7.3-8.4L2.8 2h6.5l4.4 5.8L18.9 2Zm-1.1 17.8h1.7L8.4 4.1H6.6l11.2 15.7Z"/></svg>',
  Instagram: '<svg class="social-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2Zm-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6Zm9.1 1.5a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"/></svg>',
  YouTube: '<svg class="social-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.3 31.3 0 0 0 0 12a31.3 31.3 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.3 31.3 0 0 0 24 12a31.3 31.3 0 0 0-.5-5.8ZM9.6 15.6V8.4L15.8 12l-6.2 3.6Z"/></svg>'
};

const htmlFiles = (await walk(outDir)).filter((path) => path.endsWith(".html"));
for (const path of htmlFiles) {
  let html = await readFile(path, "utf8");
  const isEnglish = /<html\s+lang="en"\s+dir="ltr"/i.test(html);
  html = html.replace(/\/assets\/css\/enhancements\.css\?v=[^"]+/g, "/assets/css/enhancements.css?v=1.0.2");

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

  for (const [label, svg] of Object.entries(socialIcons)) {
    const pattern = new RegExp(`(<a[^>]+aria-label="${label}"[^>]*>)[\\s\\S]*?(<\\/a>)`, "g");
    html = html.replace(pattern, `$1${svg}$2`);
  }

  html = html.replace(/(<a class="floating-action floating-call"[^>]*>[\s\S]*?<span>)[^<]*(<\/span>)/g, `$1${isEnglish ? "Call now" : "اتصل الآن"}$2`);
  html = html.replace(/(<a class="floating-action floating-whatsapp"[^>]*>[\s\S]*?<span>)[^<]*(<\/span>)/g, `$1${isEnglish ? "Message on WhatsApp" : "راسلني واتساب"}$2`);

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

console.log(`Persisted approved branding, official social icons, floating action labels, counter animation, cache-busted enhancements CSS, and llms.txt across ${htmlFiles.length} HTML files.`);
