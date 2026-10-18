// First-hand engineering notes. Performance periods and source-review dates
// are deliberately separate from the publication date of these notes.
export const practiceNotes = [
  {
    slug: "contact-clicks-and-qualified-enquiries",
    date: "2026-10-18",
    category: ["القياس وتجربة التواصل", "Measurement & contact journeys"],
    title: ["من نقرة التواصل إلى طلب مؤهل: ماذا أقيس فعلًا؟", "From a contact click to a qualified enquiry"],
    description: ["من تجربتَي تعاود وسما سكان: كيف أقرأ نقرات التواصل ومؤشرات التفاعل، وأربطها بمتابعة الطلبات دون تحويل كل نقرة إلى عميل.", "A practical note from Tawod and Sama Scan on interpreting contact clicks, engagement and enquiry follow-up without treating every click as a customer."],
    opening: ["وجود زر اتصال واضح خطوة مهمة في تجربة الموقع. لكن الضغط عليه لا يجيب وحده عن سؤال صاحب العمل: هل وصلني طلب مناسب؟ في تطوير مسارات التواصل أتعامل مع القياس كسلسلة تبدأ بالفعل داخل الواجهة، وتستكمل في استقبال الطلب ومراجعته.", "A clear call button is part of a usable website. Its click does not, by itself, answer the business question: did a suitable enquiry arrive? I treat measurement as a sequence that starts with an interface action and continues through enquiry receipt, review and follow-up."],
    sections: [
      {
        id: "definitions", title: ["أضع تعريفًا لكل مرحلة", "Give each stage a definition"],
        paragraphs: [["نقرة الهاتف تعني أن الزائر اختار رابط الاتصال. ونقرة واتساب تعني أنه فتح وجهة المراسلة؛ قد يكتب رسالة وقد يغادر قبل إرسالها. أما الطلب المستلم فيحتاج سجلًا لدى الفريق، والطلب المؤهل يحتاج معايير تناسب النشاط، مثل الخدمة المطلوبة والموقع وإمكانية التنفيذ.", "A phone click means someone selected the calling link. A WhatsApp click means someone opened the messaging destination; they may send a message or leave first. A received enquiry requires a business record. Qualification then requires criteria appropriate to the service, location and delivery capacity."], ["أحافظ على هذه التسميات في التقرير وفي نظام المتابعة. لا أجمع تفاعلين للشخص نفسه وأعرضهما كعميلين، ولا أستخدم قيمة افتراضية للطلب باعتبارها إيرادًا محققًا. توحيد التعريف أهم من ارتفاع رقم لا يعرف الفريق كيف يفسره.", "I keep those definitions consistent between reporting and the follow-up system. Two actions from one person are not automatically two customers. An assigned conversion value is not booked revenue. A shared definition is more useful than an impressive number the team cannot interpret."]]
      },
      {
        id: "tawod", title: ["أقرأ التحسن والتراجع معًا", "Read improvements and declines together"],
        paragraphs: [["في دراسة تعاود قارنت فترتين مكتملتين، مدة كل منهما 14 يومًا: 10–23 سبتمبر و24 سبتمبر–7 أكتوبر 2026. ارتفعت الجلسات من 946 إلى 1,334، والأحداث الرئيسية من 289 إلى 325. وفي المقابل انخفضت نسبة الجلسات المتفاعلة من 60.25% إلى 54.42%، ونسبة الجلسات التي سجلت حدثًا رئيسيًا من 23.68% إلى 18.07%.", "The Tawod study compares two complete 14-day periods: 10–23 September and 24 September–7 October 2026. Sessions increased from 946 to 1,334 and key events from 289 to 325. At the same time, the engaged-session rate fell from 60.25% to 54.42%, and the session key-event rate fell from 23.68% to 18.07%."], ["هذه القراءة توجهني إلى مراجعة مصادر الزيارة وصفحات الدخول وسهولة اختيار الخدمة، ثم ربط ذلك بجودة الطلبات المستلمة. المقارنة تصف ما حدث؛ لا تعزل أثر التصميم عن الإعلانات أو السيو أو اختلاف الجمهور بين الفترتين.", "That combination directs attention to acquisition sources, landing pages and service selection, followed by the quality of enquiries received. The comparison describes what happened. It does not isolate design from advertising, SEO or changes in the audience between periods."]]
      },
      {
        id: "sama", title: ["أحافظ على اسم المؤشر كما هو", "Keep the metric's actual meaning"],
        paragraphs: [["في دراسة سما سكان ارتفعت ضغطات زر الاتصال في الملف التجاري من 18 إلى 118 خلال فترتين متساويتين من 32 يومًا: 25 يوليو–25 أغسطس و26 أغسطس–26 سبتمبر 2026. أسميها ضغطات زر الاتصال، وأعرض المشاهدات وطلبات الاتجاهات ونقرات الموقع كمؤشرات مستقلة.", "The Sama Scan study records call-button clicks increasing from 18 to 118 across equal 32-day periods: 25 July–25 August and 26 August–26 September 2026. I report them as call-button clicks. Profile views, direction requests and website clicks remain separate measures."], ["لا أستنتج من هذه الأرقام عدد المكالمات المكتملة أو الحجوزات الطبية، ولا أنسبها إلى منشور نُشر بعد انتهاء فترة المقارنة. تاريخ المصدر وحدود المؤشر جزء من النتيجة نفسها، وليسا حاشية يمكن حذفها عند المشاركة.", "Those figures do not establish completed calls or medical bookings. Nor can they be attributed to a post published after the comparison period ended. The source date and the metric's limits belong with the result whenever it is shared."]]
      },
      {
        id: "implementation", title: ["أربط الأزرار بقياس محدود وواضح", "Instrument intent with a small, clear event set"],
        paragraphs: [["في موقعي تُجمع أحداث الهاتف وواتساب والبريد بعد السماح بالتحليلات. أسجل نوع التفاعل وموضع الزر والصفحة، مع قائمة قيم مسموحة. يظل الاتصال متاحًا عند رفض التحليلات، ولا أرسل نص الرسالة أو اسم الزائر أو رقمه ضمن خصائص الحدث.", "On my website, phone, WhatsApp and email events are collected after analytics consent. The event records interaction type, placement and page, with an allowlist for parameter values. Contact remains available when analytics is declined. Message content, visitor names and phone numbers are excluded from event parameters."], ["عند إضافة تنزيل ملف تعريفي أو فتح شهادة، أعطيه حدثًا يصف هذا الاهتمام، وأبقيه منفصلًا عن أحداث التواصل. أراجع التنفيذ أيضًا عند الرجوع للصفحة أو النقر المتكرر حتى لا تعطل آلية القياس الإجراء الذي جاء الزائر لإتمامه.", "A profile download or credential visit receives an event describing that interest, separate from contact actions. I also review repeated clicks and returning to the page so that measurement does not obstruct the action the visitor came to complete."]]
      },
      {
        id: "review", title: ["أكمل الصورة في المتابعة", "Close the loop with follow-up"],
        paragraphs: [["أبدأ مراجعة الأداء بسؤالين: هل زادت فرص التواصل، وهل استطاع الفريق التعامل معها وتحويل المناسب منها إلى خطوة تالية؟ أسجل مصدر الطلب وحالته وسبب عدم التأهل عند معرفته، ثم أقارن مددًا مكتملة وبنفس المنطقة الزمنية. بذلك تصبح قرارات المحتوى والمزايدات وتجربة الموقع أقرب إلى واقع العمل.", "My review starts with two questions: did opportunities to make contact increase, and could the team move suitable enquiries forward? Recording source, status and known disqualification reasons helps connect reporting with operations. Comparisons use complete periods and a consistent timezone, bringing content, bidding and interface decisions closer to the business reality."]]
      }
    ],
    related: ["/projects/tawod-contracting/", "/projects/sama-scan/"],
    sources: [
      ["تنفيذ قياس الموقع على GitHub", "Website measurement implementation", "https://github.com/EslamElshikh-dev/eslam-elshikh/blob/main/assets/js/analytics.js"],
      ["إعداد الأحداث في Google Analytics", "Google Analytics event setup", "https://developers.google.com/analytics/devguides/collection/ga4/events"]
    ]
  },
  {
    slug: "arabic-directory-data-and-discovery",
    date: "2026-10-18",
    category: ["تطوير الويب وتجربة عربية", "Web engineering & Arabic UX"],
    title: ["كيف أنظّم دليلًا عربيًا يبدأ من احتياج الناس؟", "Building an Arabic directory around local tasks"],
    description: ["من مشروع دليل نقادة: قرارات تنظيم البيانات والبحث العربي والصفحات المستقلة، وكيف أفصل جودة السجل عن مجرد ظهوره في الواجهة.", "Lessons from Naqada Directory: data eligibility, Arabic search, independent content routes and a review process that supports useful local discovery."],
    opening: ["الدليل المحلي يجمع معلومات يعرفها الناس بصيغ مختلفة: اسم نشاط، قرية، خدمة أو معلم. في دليل نقادة أعمل على تحويل هذه المعرفة إلى مسارات يمكن البحث فيها والرجوع إليها، مع إبقاء مصدر المعلومة وحالة مراجعتها ضمن تصميم التجربة.", "A local directory brings together information people describe in different ways: a business name, a village, a service or a landmark. In Naqada Directory, I organize that knowledge into routes people can search and revisit while keeping provenance and review state part of the experience."],
    sections: [
      {
        id: "task", title: ["أبدأ بالمهمة قبل التصنيف", "Start with the task before the taxonomy"],
        paragraphs: [["قد يبحث الزائر عن فني قريب، وقد يريد معرفة قرية أو قراءة قصة من المجتمع. لذلك تحتاج الواجهة مداخل واضحة، ويحتاج كل سجل نوعًا محددًا وعلاقة مفهومة بالتصنيف والمكان. لا يكفي وضع جميع المعلومات في قائمة واحدة طويلة ثم إضافة مربع بحث.", "One visitor needs a nearby tradesperson; another wants to learn about a village or read a community story. The interface therefore needs distinct entry points. Each record needs a defined type and an understandable relationship to its category and location. A long undifferentiated list with a search box does not resolve that structure."], ["أراجع مسارًا قصيرًا: يحدد المستخدم ما يبحث عنه، ثم يضيّق النطاق، ثم يقرأ التفاصيل أو يختار إجراءً متاحًا. أسماء الأقسام ينبغي أن تساعده على هذا الاختيار دون أن يحتاج إلى فهم بنية قاعدة البيانات.", "I review a short sequence: identify the task, narrow its scope, inspect the record, then choose an available action. Section names should help the visitor make those choices without requiring knowledge of the underlying data model."]]
      },
      {
        id: "eligibility", title: ["قرار النشر يسبق عرض البطاقة", "Publication eligibility comes before presentation"],
        paragraphs: [["توثيق المستودع يميز السجلات الجاهزة من حالات المراجعة، ويحجب حالات manual_review وofficial_review وresearch_only ودرجة C. هذه القاعدة تمنع تحوّل معلومة ما زالت تحتاج فحصًا إلى حقيقة مؤكدة لمجرد أن لها بطاقة جميلة أو رابطًا قابلًا للمشاركة.", "The repository documentation separates ready records from review states and excludes manual_review, official_review, research_only and grade C from publication. This prevents an unresolved item from acquiring the appearance of a confirmed fact merely because it has a polished card and a shareable URL."], ["في المحتوى التاريخي لا أستنتج نسبًا من تشابه الأسماء. وفي بيانات الأنشطة لا أقدّم الدليل بوصفه اعتمادًا حكوميًا أو ضمانًا لجودة الخدمة. نوع المصدر وحدوده يحددان ما يصح أن تقوله الصفحة.", "Historical material does not infer lineage from similar names. Business records do not present the directory as government accreditation or a service guarantee. The source type and its limits determine what the page can responsibly say."]]
      },
      {
        id: "search", title: ["أطبّع البحث وأحافظ على الاسم المعروض", "Normalize search while preserving displayed names"],
        paragraphs: [["البحث العربي يحتاج التعامل مع اختلافات الكتابة الشائعة دون تغيير هوية الاسم المنشور. أفصل النص المستخدم للمطابقة عن الاسم المعروض، وأربط النتائج بتصنيفات ومواضع محددة. وعندما لا توجد نتيجة، تكون الخطوة التالية واضحة بدل شاشة فارغة.", "Arabic search needs to accommodate common spelling variations without rewriting the published name. I separate matching text from display labels and connect results to explicit categories and locations. An empty search state should offer a clear next step instead of a blank screen."], ["أراجع النصوص المختلطة كذلك: الاسم العربي من اليمين إلى اليسار، بينما يحتاج الهاتف والرابط إلى اتجاه مناسب. ترتيب الأيقونات وأهداف اللمس ومواضع التصفية تُراجع في ضوء المهمة التي يؤديها المستخدم على الهاتف.", "Mixed-direction content also needs attention. Arabic names read right to left, while phone numbers and URLs need suitable isolation. Icon order, touch targets and filter placement are considered in relation to the task being completed on a phone."]]
      },
      {
        id: "routes", title: ["أعطي المحتوى المهم عنوانًا مستقلًا", "Give important content its own address"],
        paragraphs: [["يستخدم المشروع Next.js وصفحات مستقلة للأنشطة والتصنيفات والمواضع، مع بيانات وصفية وروابط داخلية وملفات Sitemap وRobots. يتيح ذلك مشاركة سجل بعينه وربطه بسياقه، بدل إجبار كل زائر على إعادة البحث من البداية.", "The project uses Next.js with independent business, category and location routes, metadata, internal links, Sitemap and Robots outputs. That makes it possible to share a particular record and its context instead of forcing every visitor to restart the search."], ["وجود صفحة أو خريطة موقع لا يثبت فهرستها. أفرّق بين سجل منشور، وصفحة متاحة للزحف، وصفحة ظهرت فعلًا في فهرس البحث. تتطلب الأخيرة بيانات فهرسة، ولا أستبدلها بعدد الروابط الناتجة من البناء.", "A generated page or sitemap entry does not establish indexing. A published record, a crawlable page and a page actually present in a search index are different states. The final state needs indexing evidence; build output counts cannot substitute for it."]]
      },
      {
        id: "maintenance", title: ["أصمّم للتصحيح بعد الإطلاق", "Design for correction after launch"],
        paragraphs: [["قد يتغير رقم أو اسم أو وصف خدمة. لذلك أتعامل مع الدليل كسجل قابل للمراجعة، وأربط التحديث بمصدر وتاريخ عندما يتوفران. أفضّل قاعدة نشر واضحة يمكن اختبارها، ومعرفات مستقرة يمكن ربطها بالمحتوى، على زيادة عدد السجلات دون طريقة لإدارة تغيرها.", "Phone numbers, names and service descriptions change. I treat the directory as a reviewable record, attaching a source and date where available. A testable publication rule and stable identifiers are more useful than expanding the collection without a way to manage change."], ["هذه الدراسة تصف قرارات تقنية ومحتوى موثقة في المشروع. لا تتضمن ادعاءً بعدد مستخدمين أو نمو زيارات لم تُعرض له بيانات قياس مستقلة.", "This note describes technical and content decisions documented in the project. It makes no claim about audience size or traffic growth without a separate measurement record."]]
      }
    ],
    related: ["/projects/naqada-directory/", "/work-evidence/"],
    sources: [
      ["مستودع دليل نقادة ومنهج البيانات", "Naqada Directory repository and data policy", "https://github.com/EslamElshikh-dev/naqada-directory"],
      ["سجل القرارات التقنية للمشروع", "Project implementation notes", "https://github.com/EslamElshikh-dev/naqada-directory/blob/main/PROJECT_NOTES.md"]
    ]
  },
  {
    slug: "one-professional-identity-two-languages",
    date: "2026-10-18",
    category: ["الهوية والسيو التقني", "Identity & technical SEO"],
    title: ["هوية مهنية واحدة بين موقع عربي وملفات إنجليزية", "One professional identity across two languages"],
    description: ["كيف أوحّد الاسم والملفات الرسمية والبيانات المنظمة في موقعي، وأربط صفحات التعريف والأعمال بمرجع واحد مع الحفاظ على اختلاف وظيفة كل رابط.", "How I connect Arabic and English profile pages, official accounts and work evidence through one stable identity reference on my professional website."],
    opening: ["يظهر اسمي بالعربية إسلام الشيخ وبالإنجليزية Eslam Elshikh. وقد تظهر تهجئات أخرى في البحث. بدل إنشاء تعريف منفصل في كل صفحة، أستخدم مرجعًا واحدًا للشخص، وأجعل المحتوى والروابط العامة يوضحان أن هذه الصيغ تعود إلى الهوية المهنية نفسها.", "My name appears as إسلام الشيخ in Arabic and Eslam Elshikh in English, with other spellings sometimes used in search. I use one stable person reference and connect visible profile content and public accounts to it, rather than maintaining an unrelated identity definition on every page."],
    sections: [
      {
        id: "reference", title: ["مرجع ثابت للشخص", "Use a stable person reference"],
        paragraphs: [["يستخدم موقعي المعرف https://www.eslam-elshikh.com/#person للشخص نفسه في اللغتين. تشير صفحة التعريف العربية والإنجليزية إليه عبر mainEntity، وتربط المقالات بصاحبها. تختلف اللغة والصياغة، بينما يبقى الشخص واحدًا.", "My website uses https://www.eslam-elshikh.com/#person for the same person in both languages. Arabic and English profile pages refer to it through mainEntity, and articles link to their author. Language and wording vary while the person reference stays the same."], ["أفصل كذلك تعريف الشخص عن تعريف الخدمة المهنية. الاسم الشخصي والخبرة لا يؤديان وظيفة عنوان النشاط وبيانات التواصل التجارية نفسها، حتى عندما يجتمعان في الموقع. الفصل يساعدني على تحديث كل جزء دون خلط صفات الأشخاص بالمنشآت.", "I also separate the person from the professional-service entity. A person's name and expertise serve a different purpose from a business address and commercial contact details, even when they share a website. Keeping those definitions distinct makes subsequent updates clearer."]]
      },
      {
        id: "profiles", title: ["مصدر واحد للملفات الرسمية", "Keep one list of official profiles"],
        paragraphs: [["جمعت روابط الحسابات الرسمية في دالة مشتركة تستخدمها بطاقات الصفحة وقائمة sameAs والمراجع النصية. عندما يتغير رابط مهني، أراجعه في المصدر نفسه بدل تعديل نسخ متعددة قد تختلف بعد فترة. وملف profile.json يستمد تعريف الشخص من البيانات نفسها المستخدمة في الصفحة.", "A shared function supplies official-account links to the visible profile cards, sameAs and text references. When a professional URL changes, I review the central source rather than maintaining several copies that may drift apart. The profile.json export derives its person definition from the same graph used by the page."], ["لا أضع رابط مقال عن شخص يشبهني في الاسم ضمن حساباتي. ولا أعتبر صفحة مجتمع عامة أو موقع جهة مانحة حسابًا شخصيًا لي. كل رابط يحتاج تعريفًا مناسبًا لوظيفته: حساب رسمي، شهادة، عمل منفذ، أو مصدر خارجي.", "An article about someone with a similar name does not become one of my accounts. A general community page or an issuer's homepage is not my personal profile either. Every link needs a suitable role: official account, credential, delivered work or external source."]]
      },
      {
        id: "evidence", title: ["البيانات المنظمة تلخص ما يراه القارئ", "Structured data should summarize visible evidence"],
        paragraphs: [["أعرض اسم الشهادة وجهتها ورابطها وتاريخها في المحتوى قبل ربطها بتعريف الشخص. وأذكر عضوية البرنامج بوصفها عضوية، ودراسة الحالة بوصفها نطاق تنفيذ له دليل. هذه العلاقات أغنى من إضافة ألقاب عامة لا يعرف الزائر كيف يتحقق منها.", "A credential's name, issuer, URL and dates appear in the page content before it is connected to the person definition. A program membership is described as membership, and a case study explains a delivery scope with evidence. Those relationships are more useful than broad titles a visitor cannot verify."], ["عند حذف مصدر أو تغيير هويته أراجع الروابط النشطة والبيانات المنظمة والمراجع القابلة للتنزيل معًا. سلامة ملف JSON وحدها لا تكفي إذا كانت الصفحة المرئية ما زالت تعرض معلومة قديمة.", "When a source is removed or changes identity, I review active links, structured data and downloadable references together. Valid JSON does not resolve a stale statement still visible on the page."]]
      },
      {
        id: "languages", title: ["أراجع اللغتين كتجربتين كاملتين", "Review both language experiences"],
        paragraphs: [["أربط النسختين بعناوين canonical وhreflang متسقة، وأكتب نبذة إنجليزية مفهومة بذاتها. في التصميم أستخدم خصائص اتجاه منطقية وأعزل أسماء الحسابات والأرقام، حتى لا يتغير ترتيبها مع النص العربي. وأحافظ على نفس وسائل التواصل وروابط الشهادات في النسختين.", "Consistent canonical and hreflang references connect the language versions. English copy needs to make sense on its own. Logical layout properties and direction isolation help account names and numbers retain their order within Arabic content. Contact destinations and credential URLs stay consistent across both versions."], ["للملفات الاجتماعية قيود مختلفة على الطول والصورة. لذلك أجهز نبذات قصيرة ومتوسطة ومطولة من المصدر نفسه، وأستخدم صورة وشعارًا معتمدين مع مساحة آمنة حول العناصر الأساسية. الاتساق لا يتطلب حشر نفس النص في كل منصة.", "Social platforms impose different text and image constraints. I prepare short, medium and longer biographies from the same source, using approved portrait and logo assets with space around essential elements. Consistency does not require forcing identical text into every format."]]
      },
      {
        id: "verification", title: ["أراجع النتيجة دون وعد بالترتيب", "Verify the result and measure discovery"],
        paragraphs: [["أتحقق من الروابط الداخلية وبنية البيانات وتطابق المحتوى بعد النشر، ثم أراجع الفهرسة والظهور عندما تتاح بيانات Search Console للنطاق. بطاقة المعرفة وقرار تعديلها تديرهما Google. توحيد الهوية يسهّل فهم المعلومات ومراجعتها، لكنه لا يحدد وحده شكل نتيجة البحث أو ترتيبها.", "I check internal links, the data graph and visible content after publication, then review indexing and discovery when the domain's Search Console data is available. Google manages Knowledge Panels and their edit decisions. A consistent identity makes information easier to understand and review; it does not determine search presentation or ranking on its own."]]
      }
    ],
    related: ["/about/", "/credentials/"],
    sources: [
      ["مصدر الهوية الموحد في موقعي", "Shared identity source in my website", "https://github.com/EslamElshikh-dev/eslam-elshikh/blob/main/src/identity.mjs"],
      ["توثيق Google لصفحات التعريف", "Google ProfilePage documentation", "https://developers.google.com/search/docs/appearance/structured-data/profile-page"]
    ]
  }
];

export const noteHref = (note, english = false) => `${english ? "/en" : ""}/notes/${note.slug}/`;
