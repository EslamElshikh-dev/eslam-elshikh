import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const outDir = process.argv[2] || "dist";
const approvedLogo = "/assets/brand/eslam-elshikh-logo-transparent.png";
const googleExpertPath = join(outDir, "google-expert", "index.html");

const oldStats = '<div class="container google-stats"><div class="google-stat reveal"><strong>472+</strong><span>مساهمة في توثيق وإدارة ملفات Google التجارية</span></div><div class="google-stat reveal"><strong>233+</strong><span>حالة ومشكلة تم تحليلها ومعالجتها</span></div><div class="google-stat reveal"><strong>رسمي</strong><span>الاعتماد على الإرشادات ومسارات الدعم المتاحة</span></div></div>';
const newStats = '<div class="container google-stats"><div class="google-stat reveal"><strong data-counter="1411" data-suffix="+">0+</strong><span>مساهمة في توثيق وإدارة ملفات Google التجارية</span></div><div class="google-stat reveal"><strong data-counter="105" data-suffix="+">0+</strong><span>موقع وتطبيق ومتجر إلكتروني تم تصميمها وتطويرها</span></div><div class="google-stat reveal"><strong data-counter="653" data-suffix="+">0+</strong><span>مساعد بالذكاء الاصطناعي ومشروع سحابي</span></div><div class="google-stat reveal"><strong data-counter="360" data-suffix="°">0°</strong><span>رؤية تجمع الأمن والتطوير والظهور الرقمي</span></div></div>';

const oldDisclaimer = '<aside class="disclaimer-card reveal"><span>تنبيه مهم</span><h2>استشارة مستقلة وليست تمثيلًا لـ Google</h2><p>أنا لست موظفًا لدى Google ولا أضمن قرار التحقق أو الاستعادة أو الترتيب. أقدم تشخيصًا وتنظيمًا للحالة وتوجيهًا للمسار الرسمي بناءً على المعلومات المتاحة.</p></aside>';
const newSummary = '<aside class="disclaimer-card professional-summary-card reveal"><span>نبذة مهنية</span><h2>خبرة تقنية تبني الثقة وتحول التحديات إلى نتائج</h2><p>المهندس إسلام الشيخ مصمم مواقع ويب ومستشار تقني في الرياض، يجمع بين تطوير المواقع والتطبيقات، وتحسين الظهور في Google، والأمن السيبراني، والذكاء الاصطناعي والحلول السحابية. يبدأ كل مشروع بفهم الهدف التجاري وتجربة المستخدم، ثم تحويله إلى خطة واضحة وتنفيذ متقن ومخرجات قابلة للقياس والتطوير.</p></aside>';

let html = await readFile(googleExpertPath, "utf8");
html = html
  .replaceAll("/assets/brand/eslam-elshikh-primary.svg", approvedLogo)
  .replaceAll("/assets/brand/eslam-elshikh-logo-2026.svg", approvedLogo)
  .replaceAll("https://www.eslam-elshikh.com/assets/brand/eslam-elshikh-primary.svg", `https://www.eslam-elshikh.com${approvedLogo}`)
  .replaceAll("https://www.eslam-elshikh.com/assets/brand/eslam-elshikh-logo-2026.svg", `https://www.eslam-elshikh.com${approvedLogo}`)
  .replace(oldStats, newStats)
  .replace(oldDisclaimer, newSummary);

await writeFile(googleExpertPath, html, "utf8");
console.log("Fixed approved logo, Google Expert statistics, and professional summary.");
