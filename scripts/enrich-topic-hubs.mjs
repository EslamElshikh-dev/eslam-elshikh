import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const outDir = process.argv[2] || "dist";
const canonicalBase = "https://www.eslam-elshikh.com";

const topics = {
  "google-business-profile": {
    title: "ملفات Google التجارية",
    heading: "من أهلية الملف إلى الاستقرار والظهور المحلي",
    lead: "هذا المسار يجمع ما تحتاجه لفهم ملف Google التجاري كمنظومة تشغيل وبيانات وثقة، لا كقائمة حقول تُملأ مرة واحدة.",
    paragraphs: [
      "الخطوة الأولى دائمًا هي مطابقة الملف مع الواقع: هل يستقبل النشاط العملاء في موقع مؤهل أم يعمل في نطاق خدمة؟ هل الاسم والفئة والعنوان أو مناطق الخدمة وساعات العمل تعكس طريقة التشغيل الفعلية؟ هذا الأساس يسبق أي محاولة للتحقق أو تحسين الظهور، لأن التناقضات في الأهلية والبيانات قد تجعل التعديلات اللاحقة أقل فاعلية أو تزيد تعقيد الحالة.",
      "بعد استقرار الأهلية والملكية، ينتقل التركيز إلى الاتساق بين الملف والموقع والمحتوى المحلي والسمعة والقياس. عند وجود تعليق أو رفض تحقق أو فقدان وصول، الأفضل توثيق الحالة والتغييرات السابقة وتجهيز الأدلة المرتبطة بالمشكلة قبل إرسال طلب جديد. أما تحسين الظهور فيأتي بعد ذلك عبر بيانات دقيقة وصفحات مفيدة وروابط داخلية وسياق محلي حقيقي، لا بإضافة كلمات إلى الاسم أو تكرار المدينة بلا قيمة."
    ],
    cards: [
      ["الأهلية أولًا", "حدد نموذج النشاط وموقعه أو نطاق خدمته قبل تغيير الاسم أو الفئات أو العنوان."],
      ["الدليل قبل الاستئناف", "اربط كل ادعاء أو تصحيح بدليل مناسب وسجل واضح للتغييرات والمحاولات السابقة."],
      ["الظهور بعد الاستقرار", "اربط الملف بموقع قوي ومحتوى محلي واتساق وقياس بدل مطاردة ترتيب مؤقت."]
    ],
    links: [
      ["/google-expert/", "دليل خبير خرائط جوجل"],
      ["/services/google-business-profile/", "خدمة ملفات Google التجارية"],
      ["/local-seo/", "منهج السيو المحلي"]
    ]
  },
  "local-seo-saudi": {
    title: "السيو المحلي في السعودية",
    heading: "السيو المحلي يبدأ من واقع النشاط لا من تكرار اسم المدينة",
    lead: "الظهور المحلي القابل للاستمرار يبنى عندما يفهم Google والمستخدم من أنت، وما الذي تقدمه، وأين تقدمه، ولماذا صفحتك هي النتيجة المناسبة لهذا البحث.",
    paragraphs: [
      "ابدأ بخريطة نية البحث: الخدمات التي يطلبها العميل فعلًا، المناطق التي تخدمها بواقعية، والصفحات التي تستطيع تقديم إجابة مختلفة ومفيدة عنها. الصفحة المحلية الجيدة لا تغيّر اسم الحي داخل قالب مكرر؛ بل توضح نطاق الخدمة، الحالات التي تعالجها، طريقة التنفيذ، الأدلة أو الأعمال المرتبطة، والأسئلة التي تسبق قرار العميل في تلك السوق.",
      "بعد المحتوى يأتي اتساق الكيان: الاسم والهاتف والموقع وملف Google التجاري والروابط والبيانات المنظمة يجب أن تروي القصة نفسها. ثم تُقاس النتيجة بالنقرات المؤهلة والمكالمات ورسائل WhatsApp والنماذج، لا بعدد مرات تكرار الكلمة المفتاحية. بهذه الطريقة يصبح السيو المحلي حلقة تربط الاكتشاف بالثقة ثم التحويل، مع قابلية تحسينها اعتمادًا على بيانات حقيقية."
    ],
    cards: [
      ["نية محلية واضحة", "ابنِ الصفحة حول حاجة ومدينة أو منطقة تخدمها فعلًا، مع محتوى يختلف في القيمة لا في الاسم فقط."],
      ["اتساق الكيان", "وحّد بيانات النشاط وسياقه بين الموقع وملف Google والمصادر العامة والبيانات المنظمة."],
      ["قياس التحويل", "اربط الظهور بالمكالمات والرسائل والطلبات حتى تعرف الصفحات والاستفسارات التي تصنع قيمة."]
    ],
    links: [
      ["/local-seo/", "دليل السيو المحلي"],
      ["/local-seo/riyadh/", "السيو المحلي في الرياض"],
      ["/services/seo/", "خدمة تحسين محركات البحث"]
    ]
  },
  cybersecurity: {
    title: "الأمن السيبراني",
    heading: "الأمن السيبراني كقرار مخاطر قابل للتنفيذ",
    lead: "الهدف من التقييم الأمني ليس إنتاج أكبر عدد من الملاحظات، بل معرفة ما الذي قد يضر العمل فعلًا وما الإجراء الذي يخفض هذا الخطر بصورة يمكن التحقق منها.",
    paragraphs: [
      "يبدأ المسار بحصر الأصول الحساسة ومسارات الدخول والاعتماديات والصلاحيات، ثم تحديد نطاق مكتوب لأي فحص نشط. وجود نطاق وتصريح واضحين يحمي الأنظمة والبيانات والأطراف، ويساعد على اختيار عمق الاختبار المناسب بدل تشغيل أدوات واسعة بلا سياق. بعد ذلك تُرتب النتائج بحسب الاحتمال والأثر التجاري وقابلية الاستغلال، لا بحسب اسم الأداة أو عدد التنبيهات.",
      "المعالجة الجيدة تربط كل ملاحظة بمالك وأولوية وخطوة إصلاح ومعيار تحقق. وقد تشمل تقوية المصادقة والجلسات والصلاحيات والأسرار والنسخ الاحتياطي ورؤوس الحماية وسلاسل النشر، حسب النظام. بعد الإصلاح تُراجع النقاط الحرجة مرة أخرى للتأكد من إغلاق السبب لا إخفاء العرض، ثم تُوثق الدروس والإجراءات التي تقلل تكرار المشكلة في الإصدارات التالية."
    ],
    cards: [
      ["نطاق مصرح", "حدد الأصول والقيود ونوافذ الاختبار وقنوات التصعيد قبل أي فحص أمني نشط."],
      ["أولوية حسب الأثر", "رتب المخاطر وفق تأثيرها واحتمالها وسياق العمل بدل التعامل مع كل تنبيه بالطريقة نفسها."],
      ["إعادة تحقق", "اختبر الإصلاحات الحرجة بعد تنفيذها ووثق معيار الإغلاق حتى لا تعود المشكلة في إصدار لاحق."]
    ],
    links: [
      ["/services/cybersecurity/", "خدمات الأمن السيبراني"],
      ["/services/cloud-solutions/", "الحلول السحابية الآمنة"],
      ["/services/web-development/", "تطوير مواقع آمنة"]
    ]
  },
  "ai-agents": {
    title: "وكلاء الذكاء الاصطناعي",
    heading: "الوكيل الناجح يبدأ من مهمة محددة وحدود واضحة",
    lead: "قبل اختيار النموذج أو بناء واجهة محادثة، حدد القرار أو المهمة التي يجب أن ينجزها الوكيل وما البيانات والأدوات المسموح له باستخدامها وكيف ستقيس نجاحه.",
    paragraphs: [
      "الوكيل العملي ليس مجرد نموذج لغوي متصل بعدة خدمات. يجب فصل المعرفة عن الأدوات والصلاحيات، وتحديد ما يستطيع قراءته أو تغييره، وما الذي يحتاج موافقة بشرية قبل تنفيذه. عندما تكون المهمة قابلة للقياس—مثل تصنيف طلبات، استخراج حقول، البحث في قاعدة معرفة أو تجهيز إجراء—يمكن بناء اختبارات واقعية تقارن الجودة والسرعة والتكلفة ومعدل الخطأ قبل التوسع.",
      "في الإنتاج تصبح المراقبة جزءًا من التصميم: سجلات للقرارات والأدوات، حدود للمحاولات والتكلفة، معالجة للفشل، ومجموعة تقييم تتكرر بعد تغيير النموذج أو البيانات أو التعليمات. ويجب تجنب إرسال أسرار أو بيانات حساسة دون حاجة، واستخدام أقل صلاحية ممكنة للتكاملات. بهذه الضوابط يتحول الوكيل من عرض تجريبي جذاب إلى مكوّن يمكن تشغيله ومراجعته وتحسينه بأمان."
    ],
    cards: [
      ["مهمة قابلة للقياس", "عرّف المدخل والنتيجة ومعيار النجاح قبل اختيار النموذج أو إضافة أدوات جديدة."],
      ["أدوات بصلاحيات محدودة", "امنح الوكيل أقل قدر من الوصول، واجعل الإجراءات الحساسة تحتاج تحققًا أو موافقة بشرية."],
      ["تقييم ورقابة", "اختبر سيناريوهات واقعية وراقب الأخطاء والتكلفة والسجلات بعد كل تغيير جوهري."]
    ],
    links: [
      ["/services/ai-agents/", "تطوير وكلاء الذكاء الاصطناعي"],
      ["/services/knowledge-bases/", "قواعد المعرفة والبحث الذكي"],
      ["/services/cloud-solutions/", "البنية السحابية للأنظمة الذكية"]
    ]
  },
  "web-development": {
    title: "تطوير المواقع والتطبيقات",
    heading: "الموقع القابل للفهرسة منتج متكامل لا واجهة فقط",
    lead: "أفضل نتائج التطوير تظهر عندما تُبنى بنية المعلومات والمحتوى والأداء والأمان والسيو معًا، بدل معالجة كل محور بعد الإطلاق.",
    paragraphs: [
      "ابدأ من رحلة المستخدم وهيكل الصفحات: ما السؤال الذي تجيب عنه كل صفحة؟ وما الإجراء التالي؟ يجب أن يكون لكل خدمة أو موضوع عنوان واضح ومحتوى أصلي وروابط داخلية قابلة للزحف، مع canonical صحيح واستجابة HTTP منطقية وsitemap يعكس الصفحات العامة الحقيقية. هذا يقلل الغموض أمام المستخدم ومحرك البحث ويجعل التطوير اللاحق أكثر تنظيمًا.",
      "الأداء والأمان جزء من جودة الصفحة نفسها. حدّد أبعاد الصور، قلل JavaScript غير الضروري، اختبر الجوال وRTL ولوحة المفاتيح، واحمِ الأسرار والمدخلات والصلاحيات من البداية. ثم أضف البيانات المنظمة التي تطابق ما يراه المستخدم بدل استخدامها كطبقة تعويضية. بعد النشر راقب الفهرسة وتجربة الاستخدام والتحويلات، واجعل كل تحديث مهم قابلًا للقياس والرجوع والمراجعة."
    ],
    cards: [
      ["هيكل واضح", "اجعل لكل صفحة نية ومحتوى وروابط داخلية وcanonical واستجابة HTTP متسقة مع وظيفتها."],
      ["أداء وأمان", "قلل الحمل، ثبّت التخطيط، اختبر الأجهزة، واحمِ الصلاحيات والأسرار والمدخلات من التصميم."],
      ["سيو قابل للصيانة", "اربط المحتوى بالبيانات المنظمة والـsitemap والقياس دون حشو أو صفحات آلية متشابهة."]
    ],
    links: [
      ["/services/web-development/", "تصميم وتطوير المواقع"],
      ["/services/seo/", "السيو التقني وتحسين البحث"],
      ["/services/cybersecurity/", "حماية المواقع والأنظمة"]
    ]
  }
};

const esc = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");

function editorialSection(slug, topic) {
  return `<section class="section-pad topic-editorial-section" data-topic-editorial="${slug}"><div class="container"><div class="section-heading reveal"><span class="eyebrow"><span aria-hidden="true"></span>الأساس العملي</span><h2>${esc(topic.heading)}</h2><p>${esc(topic.lead)}</p></div><div class="rich-copy reveal"><p>${esc(topic.paragraphs[0])}</p><p>${esc(topic.paragraphs[1])}</p></div><div class="audience-grid">${topic.cards.map(([title, text], index) => `<article class="audience-card reveal"><span>${String(index + 1).padStart(2, "0")}</span><h3>${esc(title)}</h3><p>${esc(text)}</p></article>`).join("")}</div><div class="section-action">${topic.links.map(([href, label]) => `<a class="button button-ghost" href="${href}">${esc(label)}</a>`).join("")}</div></div></section>`;
}

function enrichStructuredData(html, slug, topic) {
  const pattern = /<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/i;
  const match = html.match(pattern);
  if (!match) throw new Error(`Missing JSON-LD on topic hub ${slug}`);

  const data = JSON.parse(match[1]);
  const graph = Array.isArray(data?.["@graph"]) ? data["@graph"] : [];
  const pageId = `${canonicalBase}/blog/topics/${slug}/#webpage`;
  const pageNode = graph.find((node) => node?.["@id"] === pageId);
  if (!pageNode) throw new Error(`Missing WebPage node on topic hub ${slug}`);

  const articlePaths = [...new Set([...html.matchAll(/<a\s+class=["'][^"']*\bpost-art\b[^"']*["']\s+href=["']([^"']+)["']/gi)].map((entry) => entry[1]))];
  pageNode["@type"] = "CollectionPage";
  pageNode.about = { "@type": "Thing", name: topic.title };
  if (articlePaths.length) {
    pageNode.mainEntity = {
      "@type": "ItemList",
      name: `أدلة ${topic.title}`,
      numberOfItems: articlePaths.length,
      itemListElement: articlePaths.map((path, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: new URL(path, `${canonicalBase}/`).href
      }))
    };
  }

  const serialized = JSON.stringify(data).replaceAll("<", "\\u003c");
  return html.replace(pattern, `<script type="application/ld+json">${serialized}</script>`);
}

let enriched = 0;
for (const [slug, topic] of Object.entries(topics)) {
  const file = join(outDir, "blog", "topics", slug, "index.html");
  let html = await readFile(file, "utf8");
  const marker = `data-topic-editorial="${slug}"`;
  if (html.includes(marker)) throw new Error(`Duplicate topic editorial marker on ${slug}`);

  const anchor = `<section class="section-pad"><div class="container"><div class="section-heading reveal"><span class="eyebrow"><span aria-hidden="true"></span>المقالات</span><h2>أدلة مرتبطة بموضوع ${topic.title}</h2>`;
  const position = html.indexOf(anchor);
  if (position < 0) throw new Error(`Could not find article section anchor on topic hub ${slug}`);

  html = `${html.slice(0, position)}${editorialSection(slug, topic)}\n${html.slice(position)}`;
  html = enrichStructuredData(html, slug, topic);

  const markerPosition = html.indexOf(marker);
  const mainPosition = html.indexOf('<main id="main">');
  const footerPosition = html.indexOf('<footer class="site-footer">');
  if (markerPosition < mainPosition || markerPosition > footerPosition) throw new Error(`Topic editorial section is outside main content on ${slug}`);
  if ((html.match(new RegExp(`data-topic-editorial=["']${slug}["']`, "g")) || []).length !== 1) {
    throw new Error(`Topic editorial marker validation failed on ${slug}`);
  }
  if (!html.includes('"@type":"CollectionPage"')) throw new Error(`CollectionPage schema missing on ${slug}`);

  await writeFile(file, html, "utf8");
  enriched += 1;
}

console.log(`Enriched ${enriched} topic hubs with unique editorial content and CollectionPage semantics.`);
