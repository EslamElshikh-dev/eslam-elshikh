export const serviceTranslations = {
  cybersecurity: {
    group: "Security & Digital Infrastructure",
    title: "Cybersecurity & Systems Protection",
    short: "Authorized risk and vulnerability assessments for websites, accounts, and cloud environments, followed by a prioritized remediation plan your team can execute and verify."
  },
  "cloud-solutions": {
    group: "Security & Digital Infrastructure",
    title: "Secure Cloud Solutions",
    short: "Reliable cloud architecture with clear environments, least-privilege access, protected secrets, tested backups, practical monitoring, and controlled operating costs."
  },
  "ai-agents": {
    group: "Software & Artificial Intelligence",
    title: "AI Agents & Business Automation",
    short: "Purpose-built AI assistants connected to approved knowledge and tools, with measurable quality, limited permissions, human approval, and safe escalation paths."
  },
  "web-development": {
    group: "Software & Artificial Intelligence",
    title: "Website & Application Development",
    short: "Fast, secure, search-ready digital experiences engineered mobile-first for iPhone, Android, Huawei, tablets, laptops, and modern desktop browsers."
  },
  "google-support": {
    group: "Google & Local Visibility",
    title: "Google Product Support & Consulting",
    short: "Structured diagnosis of Google product issues, official support paths, evidence preparation, and realistic next steps without unsafe credential sharing or false guarantees."
  },
  "google-business-profile": {
    group: "Google & Local Visibility",
    title: "Google Business Profile Solutions",
    short: "Eligibility, ownership, verification, suspension, category, service-area, and consistency reviews aligned with Google guidance and the business's real operating model."
  },
  "knowledge-bases": {
    group: "Knowledge & Automation",
    title: "Knowledge Bases & Enterprise Search",
    short: "Organized, permission-aware knowledge systems that make approved company information easier to find, maintain, cite, and connect to AI assistants."
  },
  seo: {
    group: "Visibility & Growth",
    title: "Technical, Content & Local SEO",
    short: "A measurable search strategy covering crawlability, indexing, information architecture, useful content, internal linking, local intent, and qualified conversions."
  },
  "digital-advertising": {
    group: "Visibility & Growth",
    title: "Digital Advertising & Landing Pages",
    short: "Search campaigns and conversion-focused landing pages aligned around intent, message, mobile speed, trust signals, analytics, and lead quality."
  }
};

const guideRoutes = {
  "/services/web-development/": { relatedService: "web-development", topic: "web-development", category: "تصميم وتطوير المواقع" },
  "/services/seo/": { relatedService: "seo", topic: "local-seo-saudi", category: "تحسين محركات البحث" },
  "/services/google-business-profile/": { relatedService: "google-business-profile", topic: "google-business-profile", category: "ملفات Google التجارية" },
  "/services/ai-agents/": { relatedService: "ai-agents", topic: "ai-agents", category: "وكلاء الذكاء الاصطناعي" },
  "/services/cybersecurity/": { relatedService: "cybersecurity", topic: "cybersecurity", category: "الأمن السيبراني" },
  "/services/cloud-solutions/": { relatedService: "cloud-solutions", topic: "cybersecurity", category: "الحلول السحابية" },
  "/services/knowledge-bases/": { relatedService: "knowledge-bases", topic: "ai-agents", category: "قواعد المعرفة" },
  "/services/digital-advertising/": { relatedService: "digital-advertising", topic: "web-development", category: "الإعلانات وصفحات الهبوط" },
  "/local-seo/riyadh/": { relatedService: "seo", topic: "local-seo-saudi", category: "السيو المحلي في الرياض" }
};

const keywordAdditions = {
  cybersecurity: ["خدمات الأمن السيبراني في السعودية", "حماية المواقع من الاختراق", "تقييم مخاطر الشركات"],
  "cloud-solutions": ["حلول سحابية للشركات", "أمن الحوسبة السحابية", "إدارة البنية السحابية"],
  "ai-agents": ["تطوير وكيل ذكاء اصطناعي", "حلول الذكاء الاصطناعي للشركات", "أتمتة الأعمال بالذكاء الاصطناعي"],
  "web-development": ["تصميم مواقع في الرياض", "شركة تصميم مواقع السعودية", "تطوير متجر إلكتروني"],
  "google-support": ["دعم منتجات Google", "حل مشكلات حسابات Google", "خبير منتجات Google"],
  "google-business-profile": ["حل تعليق ملف Google التجاري", "توثيق ملف Google التجاري", "تحسين الظهور في خرائط Google"],
  "knowledge-bases": ["إنشاء قاعدة معرفة للشركات", "بحث ذكي في مستندات الشركة", "ربط قاعدة المعرفة بالذكاء الاصطناعي"],
  seo: ["خبير سيو في السعودية", "تحسين محركات البحث في الرياض", "سيو محلي الرياض"],
  "digital-advertising": ["إعلانات Google في السعودية", "تصميم صفحات هبوط", "تحسين معدل التحويل"]
};

const faqContexts = {
  cybersecurity: {
    fit: "وجود موقع أو حسابات أو بيانات حساسة أو توسع تقني يجعل التقييم المنظم أكثر فائدة من انتظار حادث ثم التعامل معه تحت الضغط.",
    preparation: "جهّز قائمة الأصول والنطاقات والحسابات الحساسة ومزودي الاستضافة والتغييرات الأخيرة، وحدد ما هو مصرح بفحصه وما يجب ألا يتأثر أثناء العمل.",
    phasing: "نعم؛ يبدأ العمل عادةً بجرد غير نشط ومراجعة الإعدادات، ثم تُنفذ الفحوص الحساسة داخل نافذة متفق عليها مع نقطة توقف وخطة تصعيد واضحة.",
    measurement: "تُقاس النتيجة بانخفاض المخاطر الحرجة، وإغلاق الملاحظات ضمن زمن محدد، وتفعيل المصادقة والنسخ والمراقبة، ونجاح إعادة التحقق بعد المعالجة.",
    risks: "أكثر الأخطاء كلفة هي الفحص دون تصريح، وتوسيع النطاق أثناء التنفيذ، وإخفاء الأدلة داخل تقرير تقني مبهم، أو اعتبار تثبيت أداة أمنية بديلًا عن إدارة الهوية والتحديثات والنسخ.",
    followUp: "بعد التنفيذ يلزم مالك واضح لكل ضابط، وجدول لمراجعة الصلاحيات والتحديثات والنسخ والتنبيهات، وإعادة تقييم بعد التغييرات الكبرى أو ظهور مؤشر حادث."
  },
  "cloud-solutions": {
    fit: "يصبح المسار مناسبًا عندما يعاني النظام توقفًا أو تكلفة غير مفهومة، أو عندما يحتاج المشروع إلى فصل البيئات والتوسع والنسخ والاستعادة بدل الاعتماد على إعداد واحد هش.",
    preparation: "يلزم توثيق التطبيقات وقواعد البيانات والتكاملات والحمل المتوقع وحساسية البيانات والميزانية والمدة المقبولة للتوقف، مع حصر الحسابات والنطاقات وملاكها.",
    phasing: "يمكن بناء بيئة اختبار أولًا، ثم نقل مكونات محددة مع اختبارات أداء واستعادة، قبل تحويل الحركة تدريجيًا والاحتفاظ بخطة رجوع قابلة للتنفيذ.",
    measurement: "تشمل المؤشرات التوافر وزمن الاستجابة ومعدل الأخطاء ونجاح النسخ والاستعادة واستخدام الموارد والتكلفة لكل خدمة، لا حجم الخوادم وحده.",
    risks: "من الأخطاء الشائعة منح صلاحيات واسعة، وترك الأسرار داخل الكود، وغياب ميزانية وتنبيهات، والاعتماد على نسخة احتياطية لم تُختبر استعادتها.",
    followUp: "تحتاج البنية بعد الإطلاق إلى مراجعة دورية للسجلات والصلاحيات والنسخ والتكلفة والسعة، مع توثيق أي تغيير يمكن أن يؤثر في الاستمرارية أو الأمان."
  },
  "ai-agents": {
    fit: "يكون المشروع مناسبًا عندما توجد عملية متكررة كثيرة التكلفة، ومصادر معرفة يمكن تنظيمها، ونتيجة يمكن مراجعتها، وحدود واضحة لما يبقى بيد الإنسان.",
    preparation: "اجمع عينات حقيقية من الطلبات والمستندات، وحدد المصادر المعتمدة والصلاحيات والعمليات الحساسة، ثم عرّف النجاح والفشل والحالات التي يجب تصعيدها للموظف.",
    phasing: "الأفضل إطلاق مساعد محدود لمجموعة صغيرة من المستخدمين، وقياس دقته وسلوكه، ثم توسيع المعرفة والأدوات والصلاحيات تدريجيًا بعد اجتياز اختبارات معلنة.",
    measurement: "تُقاس الجودة بصحة المصدر ودقة النتيجة ونسبة التصعيد ووقت الإنجاز والتكلفة لكل مهمة ورضا المستخدم، مع مجموعة تقييم ثابتة قبل كل تحديث.",
    risks: "أخطر الاختصارات هي منح الوكيل صلاحيات واسعة، وربطه بمستندات متعارضة، وإخفاء مصادر الإجابة، أو إطلاقه بلا سجلات ولا خيار إيقاف ولا موافقة بشرية.",
    followUp: "يلزم تحديث المعرفة ومراقبة الانحراف والتكلفة والأخطاء، وإعادة الاختبارات عند تغيير النموذج أو الأدوات أو سياسات الشركة، مع الاحتفاظ بمسؤول محتوى ومسؤول تقني."
  },
  "web-development": {
    fit: "يحتاج المشروع إلى تطوير احترافي عندما لا يشرح الموقع الخدمة بسرعة، أو لا يعمل جيدًا على الجوال، أو يصعب فهرسته وقياسه وتحديثه، أو لا يملك صاحبه بنيته وحساباته بوضوح.",
    preparation: "جهّز أهداف الموقع والجمهور والخدمات والهوية والمحتوى والأمثلة والوظائف المطلوبة وبيانات التواصل، وحدد النطاق واللغات والتكاملات ومعايير القبول قبل التصميم.",
    phasing: "يمكن البدء بهيكل المحتوى والنموذج البصري، ثم بناء الصفحات ذات الأولوية وإطلاقها بعد الاختبار، قبل إضافة التكاملات والمحتوى المتقدم على مراحل محسوبة.",
    measurement: "تُقاس النتيجة بسرعة الجوال واستقرار التخطيط وإتمام النماذج ونقرات الاتصال وجودة العملاء والفهرسة والظهور، مع مقارنة واضحة بما قبل الإطلاق.",
    risks: "أكثر الأخطاء شيوعًا اختيار الشكل قبل فهم رحلة العميل، وتحميل مكتبات وصور ثقيلة، وتكرار الصفحات، وإطلاق الموقع دون قياس أو نسخ أو خطة صيانة.",
    followUp: "بعد النشر يجب مراقبة الأداء والأخطاء والفهرسة والتحويلات، وتحديث المحتوى والتبعيات والنسخ، وإجراء تحسينات صغيرة مبنية على بيانات بدل انتظار إعادة تصميم كاملة."
  },
  "google-business-profile": {
    fit: "المراجعة مناسبة عند إنشاء الملف أو رفض التحقق أو التعليق أو تضارب الاسم والعنوان والفئة، أو عندما لا يعكس الملف نموذج النشاط الحقيقي ومناطق خدمته.",
    preparation: "جهّز السجل والمستندات المطابقة وصور المكان أو أدوات العمل وبريد النطاق وبيانات الموقع، مع توثيق الإشعارات والتغييرات السابقة دون إرسال كلمات مرور أو رموز تحقق.",
    phasing: "تبدأ العملية بتشخيص الأهلية والبيانات، ثم تصحيح السبب الحقيقي مرة واحدة، وبعد ذلك تُجهز الأدلة ويُستخدم المسار الرسمي المناسب دون تعديلات متكررة تربك المراجعة.",
    measurement: "تُقاس النتيجة بصحة البيانات واستقرار الملف وأهلية الظهور ونقرات الاتصال والاتجاهات وجودة الاستفسارات، لا بترتيب ثابت لا يمكن ضمانه.",
    risks: "من الأخطاء المكلفة حشو الاسم بالكلمات، واستخدام عنوان غير مؤهل، وتعدد الملفات للنشاط نفسه، وإرسال استئنافات متكررة قبل معالجة سبب التعليق.",
    followUp: "بعد الاستعادة أو التوثيق يلزم مراجعة الملاك والصلاحيات والاتساق والخدمات وساعات العمل، وتجنب تغييرات كبيرة متتابعة لا تستند إلى واقع النشاط."
  },
  "google-support": {
    fit: "يناسب التشخيص الحالات التي تتكرر فيها رسائل الرفض أو تتداخل الحسابات والصلاحيات أو لا يكون مسار الدعم المناسب واضحًا رغم وجود بيانات يمكن توثيقها.",
    preparation: "اجمع نص الخطأ والروابط ومعرفات الحالة غير الحساسة والتواريخ والخطوات المجربة، وافصل بين المشكلة التقنية ومشكلة الأهلية أو الملكية قبل التواصل مع الدعم.",
    phasing: "تُراجع الحالة أولًا دون تغييرات، ثم تُنفذ خطوة واحدة قابلة للقياس ويُحفظ أثرها، وبعدها يُستخدم مسار الدعم الرسمي مع ملخص مرتب وأدلة مرتبطة مباشرة بالمشكلة.",
    measurement: "تظهر الجودة في وضوح السبب وتقليل المحاولات العشوائية والوصول إلى قناة الدعم الصحيحة وتوثيق الرد والقرار التالي، حتى عندما يبقى القرار النهائي لدى Google.",
    risks: "تجنب مشاركة رموز التحقق أو كلمات المرور، وتكرار الطلب من حسابات متعددة، وتغيير البيانات أثناء المراجعة، والاعتماد على وعود قبول أو استعادة لا يملكها أي طرف خارجي.",
    followUp: "بعد حل الحالة ينبغي توثيق المالكين ووسائل الاسترداد وسجل التغييرات والسياسات المؤثرة، حتى لا يبدأ الفريق من الصفر إذا تكررت المشكلة."
  },
  "knowledge-bases": {
    fit: "يصبح الاستثمار مناسبًا عندما يضيع الموظفون وقتًا في البحث، أو تتكرر الإجابات، أو تتعارض نسخ المستندات، أو تحتاج الشركة إلى مصدر موثوق يدعم الإنسان والمساعد الذكي.",
    preparation: "احصر المصادر وملاكها وصلاحياتها وتاريخها، وحدد جمهور كل معلومة، ثم نظف التكرار والتعارض وأضف بيانات وصفية قبل التفكير في البحث الدلالي أو الذكاء الاصطناعي.",
    phasing: "ابدأ بقسم أو موضوع عالي الاستخدام، واختبر العثور على الإجابة والمصادر، ثم وسع النطاق بعد تثبيت الحوكمة ومسؤولية المراجعة والأرشفة.",
    measurement: "تُقاس النتيجة بزمن العثور على الإجابة ونسبة الأسئلة الناجحة والمحتوى القديم وعدد التذاكر المتكررة وثقة المستخدم في المصدر المعروض.",
    risks: "رفع الملفات كما هي دون تنظيف أو صلاحيات أو مالك محتوى يؤدي إلى بحث سريع في معلومات قديمة؛ كما أن إخفاء المصدر يجعل المراجعة والثقة أصعب.",
    followUp: "قاعدة المعرفة تحتاج تواريخ مراجعة وتنبيهات انتهاء وتقارير للأسئلة بلا نتائج ومسارًا واضحًا لتحديث أو أرشفة المحتوى عند تغير السياسات."
  },
  seo: {
    fit: "يكون العمل مناسبًا عندما تملك الخدمة طلبًا حقيقيًا لكن الصفحات لا تظهر أو لا تجذب استفسارات مؤهلة، أو عندما تتعارض إشارات الفهرسة والمحتوى والملف التجاري والقياس.",
    preparation: "اجمع بيانات Search Console والتحليلات والصفحات والخدمات والمناطق وأهم المنافسين والتحويلات، وحدد الكلمات بحسب نية العميل والمرحلة لا بحسب حجم افتراضي منفصل عن القيمة.",
    phasing: "تبدأ الأولوية بمشكلات الزحف والفهرسة والصفحات التجارية، ثم بنية المحتوى والروابط الداخلية، وبعدها التوسع في موضوعات تدعم القرار وتملك قيمة أصلية.",
    measurement: "تُقاس النتيجة بالنقرات المؤهلة والظهور للكلمات التجارية وصفحات الدخول والتحويلات وجودة العملاء، مع فصل المؤشرات المعلوماتية عن الإيراد الفعلي.",
    risks: "أخطر الممارسات حشو المدن والكلمات، وإنشاء صفحات متشابهة، وتغيير الروابط دون تحويلات، وشراء محتوى ضعيف، والحكم على النجاح من ترتيب كلمة واحدة.",
    followUp: "السيو يحتاج مراجعة للفهرسة والأداء والمنافسة والمحتوى والتحويلات بعد كل تحديث كبير، مع تحسينات تراكمية وتواريخ تعديل صادقة لا تتغير بلا سبب."
  },
  "digital-advertising": {
    fit: "يكون المسار مناسبًا عندما توجد خدمة وعرض واضحان وميزانية قابلة للقياس، لكن الزيارات الحالية لا تتحول أو لا يمكن معرفة الإعلان والكلمة والصفحة التي صنعت العميل.",
    preparation: "حدد الخدمة والمنطقة والجمهور والعرض والميزانية والهامش وقيمة العميل، وجهز صفحة هبوط ورسالة واتصالًا أو نموذجًا وأدوات قياس قبل إطلاق الإنفاق.",
    phasing: "ابدأ بمجموعة كلمات ورسائل ضيقة وصفحة متطابقة، ثم راقب جودة الاستفسارات قبل زيادة الميزانية أو توسيع المناطق والجماهير والحملات.",
    measurement: "لا يكفي سعر النقرة؛ راقب تكلفة العميل المؤهل ومعدل التحويل وجودة المكالمات والنماذج والإيراد، وافصل بين حدث تقني ناجح وطلب تجاري حقيقي.",
    risks: "من الأخطاء إرسال كل الإعلانات إلى الصفحة الرئيسية، وتوسيع المطابقة دون كلمات سلبية، وإهمال سرعة الجوال، وقياس النقرات بدل جودة العملاء.",
    followUp: "تحتاج الحملات إلى مراجعة عبارات البحث والميزانية والصفحة والأحداث وجودة العملاء، ثم تجارب محددة بعنصر واحد ومدة كافية قبل اتخاذ قرار."
  }
};

const unique = (values) => [...new Set(values.filter(Boolean))];

export function enrichPost(post) {
  const additions = keywordAdditions[post.relatedService] || [];
  return {
    ...post,
    keywords: unique([...(post.keywords || []), ...additions]).slice(0, 6)
  };
}

export function guideToPost(guide) {
  const routeMeta = guideRoutes[guide.service] || { relatedService: "web-development", topic: "web-development", category: "الهندسة الرقمية" };
  const sectionWords = guide.sections.flat().join(" ").split(/\s+/).filter(Boolean).length;
  return enrichPost({
    ...guide,
    seoTitle: guide.title,
    excerpt: guide.description,
    date: guide.published || "2026-07-30",
    modified: guide.modified || "2026-08-30",
    readTime: `${Math.max(6, Math.ceil(sectionWords / 150) + 3)} دقائق`,
    ...routeMeta
  });
}

export function completeFaqs(post) {
  const seen = new Set();
  return (post.faqs || []).filter(([question]) => {
    const key = question.trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 4);
}
