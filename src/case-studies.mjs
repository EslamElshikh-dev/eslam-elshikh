import { webProjects } from "./web-projects.mjs";
import { projects } from "./content.mjs";
import { projectPreviews } from "./project-previews.mjs";
import { caseEditorial } from "./case-editorial.mjs";
import { caseEvidence } from "./case-evidence.mjs";
import { englishSectorNames } from "./english.mjs";
import { latestWorkByUrl } from "./latest-work.mjs";

const slugOverrides = {
  1: "tawod-contracting", 2: "tawod-maintenance", 6: "bowdy-labs", 7: "sama-scan",
  8: "sama-scan-control-center", 9: "alargan-crm-concept", 96: "najar-abu-yousef", 97: "kermez-cafe"
};
const productSlugs = { 1: "tawod-control-center", 7: "sama-scan-control-center", 8: "sama-scan-control-center", 9: "alargan-crm", 13: "alya-catalog-control", 97: "kermez-control-center" };
const sectorMethods = {
  "المقاولات والتشطيبات": ["صاحب مشروع يبحث عن نطاق تنفيذ واضح", "الانتقال من تخصص البناء أو التشطيب إلى وصف المشروع والموقع وحجم العمل.", "تجميع الخدمات بحسب نوع العمل يجعل النقاش عن النطاق أسهل، ويمنع خلط التأسيس بالصيانة أو التشطيب.", "المشروعات والصور تشرح طبيعة التنفيذ؛ وتأتي وسيلة التواصل بعد تعريف الزائر بالخدمة.", ["يحدد نوع العمل", "يراجع التخصص والتفاصيل", "يجهّز وصف المشروع", "يتواصل لتنسيق الخطوة التالية"]],
  "النجارة والديكور": ["عميل يخطط لمساحة أو قطعة تُنفذ حسب الطلب", "تحويل فكرة بصرية إلى استفسار محدد عن المقاس والاستخدام والتقسيم المطلوب.", "البدء بنوع القطعة أو المساحة يساعد على مقارنة الخيارات المناسبة قبل السؤال عن السعر.", "تستفيد رحلة التواصل من المقاسات والصور؛ لذلك تخدم الواجهة وصف الاحتياج بدل الاكتفاء بعرض اسم النشاط.", ["يختار القطعة أو المساحة", "يراجع الخيارات والصور", "يجهّز المقاسات أو الفكرة", "يناقش تفاصيل التنفيذ"]],
  "السباكة والكهرباء": ["عميل يحتاج تحديد الخدمة قبل التواصل مع الفني", "توضيح نوع العطل أو العمل وموقعه، مع فصل طلب الصيانة عن احتياج التأسيس أو التوريد.", "تسمية الخدمات بشكل مباشر تختصر سؤال العميل الأول وتساعده على اختيار المسار الأقرب لحالته.", "وسائل التواصل القريبة من المحتوى تحافظ على تسلسل بسيط: فهم الخدمة، ثم شرح الحالة للفني.", ["يحدد الخدمة المطلوبة", "يقرأ نطاق العمل", "يصف الحالة والموقع", "يتواصل لتنسيق الطلب"]],
  "التبريد والتكييف": ["عميل يصف جهازًا أو احتياج تبريد وصيانة", "تحديد نوع الجهاز ومشكلته قبل التنسيق، بدل جمع كل احتياجات التبريد تحت عنوان واحد.", "تفصيل المسارات بحسب الجهاز أو المهمة يوضح الفرق بين الصيانة والتركيب والخدمات المرتبطة بها.", "الشرح المختصر وبيانات التواصل يساندان الاستفسار عن الحالة دون افتراض تشخيص فني عن بعد.", ["يحدد الجهاز أو الخدمة", "يراجع نطاق الصيانة", "يجهّز وصف الحالة", "يتواصل مع النشاط"]],
  "الصيانة والتشغيل": ["مسؤول منشأة أو عميل يرتب احتياج صيانة", "جمع نوع الخدمة والموقع والتفاصيل الأساسية في طلب يمكن للفريق فهمه ومراجعته.", "تنظيم الاحتياجات في مجموعات يجعل اختيار الخدمة أكثر وضوحًا، خاصة عندما تشمل المنشأة أكثر من نظام.", "توضيح الخطوة التالية قبل التواصل يربط الواجهة بعمل الفريق الذي سيستقبل الطلب وينسق تنفيذه.", ["يحدد احتياج المنشأة", "يراجع الخدمة والنطاق", "يجهّز تفاصيل الموقع", "ينسق الطلب والمتابعة"]],
  "الحدائق والمناسبات": ["عميل يخطط لتنسيق مساحة أو مناسبة", "تحويل الفكرة البصرية إلى احتياج محدد يمكن مناقشة عناصره وتفاصيله.", "عرض الخيارات بأسماء وصور يسهل المقارنة بحسب المساحة أو المناسبة التي يخطط لها الزائر.", "التواصل بعد فهم الخيارات يساعد على وصف التفاصيل المطلوبة بدل البدء برسالة عامة عن النشاط.", ["يحدد المساحة أو المناسبة", "يراجع الخيارات والأمثلة", "يجهّز تفاصيل الفكرة", "يناقش التنسيق المطلوب"]],
  "الصحة والخدمات المهنية": ["زائر يبحث عن خدمة متخصصة وطريقة الوصول إليها", "شرح نوع الخدمة والخطوة الإدارية التالية بلغة مفهومة تحترم طبيعة التخصص.", "تقسيم المعلومات بحسب الخدمة يساعد الزائر على فهم ما يحتاج إلى السؤال عنه قبل التواصل.", "بيانات الوصول والتواصل تكمل التعريف؛ ويظل تقديم الخدمة المهنية نفسها من اختصاص الجهة المعنية.", ["يتعرف على الخدمة", "يراجع المعلومات المتاحة", "يسأل عن تفاصيل الزيارة", "ينسق مع الجهة المختصة"]],
  "التجارة والخدمات الغذائية": ["عميل يتحقق من النشاط قبل زيارته أو الاستفسار", "جمع معلومات المنتجات أو الخدمة والمكان والتواصل في تجربة سهلة الرجوع إليها.", "وضوح تصنيفات العرض وبيانات النشاط يساعد الزائر على طرح سؤال محدد عن ما يحتاجه.", "تقديم معلومات الزيارة والتواصل قريبًا من التعريف يربط التصفح بخطوة عملية تناسب النشاط.", ["يتعرف على العرض", "يحدد احتياجه", "يراجع بيانات النشاط", "يتواصل أو يخطط للزيارة"]],
  "المنصات والحلول الرقمية": ["مستخدم يبحث عن معلومة أو مسار عمل داخل تجربة رقمية", "إظهار العلاقة بين المعلومة والتصنيف والخطوة التالية دون زيادة تعقيد الواجهة.", "المداخل المحددة تقلل مساحة البحث وتربط الاختيار بالوظيفة التي يريد المستخدم الوصول إليها.", "تقسيم الواجهة إلى مسارات مفهومة يجعل المنصة قابلة للشرح، لا مجرد مجموعة شاشات متجاورة.", ["يختار مدخل التجربة", "يستعرض المسار المناسب", "يراجع التفاصيل", "ينتقل إلى الإجراء التالي"]]
};

export const caseStudies = webProjects.map((project, index) => {
  const number = index + 1;
  const reviewed = latestWorkByUrl.get(project.liveUrl)?.editorial;
  const [englishName, focus, challenge, solution, outcome, englishFocus, englishNarrative] = caseEditorial[index] || [reviewed.englishName, reviewed.focus, reviewed.challenge, reviewed.solution, reviewed.outcome, reviewed.englishFocus, reviewed.englishNarrative];
  const evidence = caseEvidence[index] || { topics: reviewed.topics, technology: reviewed.technology, hasPhone: true, hasWhatsApp: true, hasMap: true };
  const featured = projects.find(item => item.liveUrl === project.liveUrl);
  const preview = projectPreviews[project.liveUrl];
  const url = new URL(project.sourceUrl || project.liveUrl);
  const stem = project.sourceUrl ? url.pathname.split("/").filter(Boolean).at(-1)
    : url.hostname.endsWith("github.io") ? url.pathname.split("/").filter(Boolean).at(-1)
    : url.hostname.replace(/^www\./, "").replace(/\.vercel\.app$|\.com$|\.online$/, "");
  const slug = slugOverrides[number] || stem.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const method = sectorMethods[project.sector] || sectorMethods["التجارة والخدمات الغذائية"];
  return {
    ...project, ...evidence, slug, number, englishName, focus, challenge, solution, outcome, englishFocus, englishNarrative,
    englishSector: englishSectorNames[project.sector] || "Digital project", method,
    image: number === 8 ? "/assets/products/sama-overview.webp" : number === 9 ? "/assets/products/alargan-pipeline.webp" : preview.src,
    productSlug: productSlugs[number], liveAvailable: preview.liveAvailable !== false,
    status: number === 9 ? "concept" : project.access === "restricted" ? "private-product" : preview.liveAvailable === false ? "archived" : "published",
    tags: featured?.tags || ["Interface Design", evidence.technology === "Next.js" ? "Next.js" : "Web Development", "Arabic UX"],
    originalStudy: reviewed ? undefined : featured?.caseStudy,
    ...reviewed,
    ...(reviewed ? { hasPhone: true, hasWhatsApp: true, hasMap: true } : {})
  };
});

if (caseStudies.length !== webProjects.length || new Set(caseStudies.map(study => study.slug)).size !== webProjects.length) throw new Error("Every project must have a unique case study.");
export const caseByUrl = new Map(caseStudies.map(study => [study.liveUrl, study]));
export const caseHref = (study, english = false) => `${english ? "/en" : ""}/projects/${study.slug}/`;
export const productHref = (slug, english = false) => `${english ? "/en" : ""}/products/${slug}/`;
