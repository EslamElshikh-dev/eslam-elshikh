export function renderAbout({ site, mapsCount, projectCount, projects, profilePhoto, innerHero, icon, eyebrow, button, esc, projectImage, finalCta }) {
  const signatureWords = ["SECURE", "BUILD", "AUTOMATE", "GROW", "ESLAM ELSHIKH"];
  const signatureTrack = [...signatureWords, ...signatureWords]
    .map((word) => `<span>${word}<i></i></span>`)
    .join("");

  const focusAreas = [
    {
      key: "secure",
      number: "01",
      label: "الأمن",
      english: "SECURE",
      icon: "shield",
      title: "أحمي القرار قبل أن أحمي النظام.",
      text: "الأمان عندي ليس فحصًا في آخر المشروع. يبدأ من فهم البيانات والصلاحيات ومسارات الدخول والأثر التجاري، ثم تحويل المخاطر إلى أولويات يستطيع الفريق تنفيذها ومراجعتها.",
      points: ["تقييم المخاطر والثغرات", "مراجعة الصلاحيات والبنية", "خطة معالجة قابلة للتحقق"],
      href: "/services/cybersecurity/",
      cta: "استكشف مسار الأمن السيبراني"
    },
    {
      key: "build",
      number: "02",
      label: "البرمجيات",
      english: "BUILD",
      icon: "code",
      title: "أبني تجربة يفهمها العميل ويثق بها.",
      text: "أحوّل هدف المشروع إلى بنية محتوى وواجهة وكود سريع ومتجاوب. كل تفصيلة تخدم مسارًا واضحًا: من أول انطباع حتى الإجراء المطلوب، مع قابلية للصيانة والتوسع بعد الإطلاق.",
      points: ["تجربة عربية Mobile First", "أداء وسيو تقني من البداية", "مسارات تحويل وقياس واضحة"],
      href: "/services/web-development/",
      cta: "استكشف تطوير المواقع"
    },
    {
      key: "automate",
      number: "03",
      label: "الذكاء الاصطناعي",
      english: "AUTOMATE",
      icon: "spark",
      title: "أؤتمت المهمة، لا الحوار فقط.",
      text: "أبدأ من العملية التي تستهلك وقت الفريق، ثم أحدد مصادر المعرفة والأدوات والصلاحيات ومتى يجب أن يتدخل الإنسان. النتيجة وكيل يؤدي وظيفة محددة ويمكن تقييمه ومراقبته.",
      points: ["وكلاء AI لحالات استخدام فعلية", "RAG وربط المعرفة والأدوات", "تقييم وحواجز ورقابة بشرية"],
      href: "/services/ai-agents/",
      cta: "استكشف وكلاء الذكاء الاصطناعي"
    },
    {
      key: "grow",
      number: "04",
      label: "Google والظهور",
      english: "GROW",
      icon: "google",
      title: "أحوّل الظهور المحلي إلى أصل رقمي موثوق.",
      text: "أربط الملف التجاري بالموقع والمحتوى والبيانات والسياسات، وأتعامل مع التحقق والملكية والقيود والتصنيف بمنهج تشخيصي واضح، دون وعود بقرار منصة أو ترتيب مضمون.",
      points: ["إثبات الملكية والتوثيق", "تشخيص القيود والمشكلات", "تحسين السيو والظهور المحلي"],
      href: "/google-expert/",
      cta: "استكشف خبرة خرائط Google"
    }
  ];

  const focusTabs = focusAreas.map((area, index) => `<button type="button" id="about-focus-tab-${area.key}" role="tab" aria-controls="about-focus-panel-${area.key}" aria-selected="${index === 0 ? "true" : "false"}" tabindex="${index === 0 ? "0" : "-1"}" data-about-focus-tab="${area.key}"><span>${area.number}</span><span><strong>${area.label}</strong><small>${area.english}</small></span></button>`).join("");
  const focusPanels = focusAreas.map((area, index) => `<article class="about-focus-panel${index === 0 ? " is-active" : ""}" id="about-focus-panel-${area.key}" role="tabpanel" aria-labelledby="about-focus-tab-${area.key}" tabindex="0" data-about-focus-panel="${area.key}"><div class="about-focus-art" aria-hidden="true"><span>${area.number}</span><div>${icon(area.icon)}</div><small>${area.english}</small></div><div class="about-focus-copy"><span>زاوية الخبرة · ${area.label}</span><h3>${area.title}</h3><p>${area.text}</p><ul>${area.points.map((point) => `<li>${icon("check")}<span>${point}</span></li>`).join("")}</ul><a class="text-link" href="${area.href}">${area.cta} ${icon("arrow")}</a></div></article>`).join("");
  const caseStudyProjects = projects.filter((project) => project.caseStudy && project.slug).slice(0, 3);
  const caseStudyCards = caseStudyProjects.map((project, index) => `<article class="about-case-card reveal"><a class="about-case-media" href="/projects/${project.slug}/" aria-label="قراءة دراسة حالة ${esc(project.title)}"><span dir="ltr">CASE / ${String(index + 1).padStart(2, "0")}</span>${projectImage(project)}</a><div class="about-case-copy"><p class="about-case-category">${esc(project.category)}</p><h4><a href="/projects/${project.slug}/">${esc(project.title)}</a></h4><p>${esc(project.description)}</p><div class="about-case-tags" aria-label="مجالات المشروع">${project.tags.slice(0, 2).map((tag) => `<span>${esc(tag)}</span>`).join("")}</div><div class="about-case-links"><a class="text-link" href="/projects/${project.slug}/" aria-label="قراءة دراسة حالة ${esc(project.title)}">دراسة الحالة ${icon("arrow")}</a><a class="about-case-live" href="${project.liveUrl}" target="_blank" rel="noopener" aria-label="فتح موقع ${esc(project.title)} المنشور">الموقع الحي ${icon("external")}</a></div></div></article>`).join("");
  const heroUtility = `<div class="about-hero-actions">${button("/contact/", "ناقش مشروعك")}${button("/projects/", "شاهد دراسات الحالة", "button-ghost")}</div><ul class="about-quick-facts" aria-label="معلومات سريعة عن إسلام الشيخ"><li>${icon("pin")}<span><small>الموقع</small><strong>الرياض، السعودية</strong></span></li><li>${icon("nodes")}<span><small>نطاق التعاون</small><strong>السعودية وعن بُعد</strong></span></li><li>${icon("target")}<span><small>نقطة البداية</small><strong>تشخيص ونطاق واضح</strong></span></li></ul>`;

  return `${innerHero({ eyebrowText: "عن إسلام · ملف مهندس رقمي", title: `أنا إسلام الشيخ. <span class="about-h1-line">أرى النظام كاملًا، ثم أبني ما يحتاجه فعلًا.</span>`, lead: "مهندس أمن سيبراني ومطور برمجيات وخبير منتجات Google في الرياض. أساعد أصحاب الأعمال والفرق على تحويل المشكلات الرقمية المعقدة إلى قرارات وحلول آمنة وواضحة وقابلة للقياس.", afterLead: heroUtility, path: "/about/", crumbs: [{ name: "عن إسلام", path: "/about/" }], className: "about-hero about-hero-v2", aside: `<div class="about-identity-card about-identity-card-v2"><span class="about-system-status"><i></i>PROFILE / ACTIVE</span><div class="about-orbit-map"><span class="about-orbit-ring about-orbit-ring-a" aria-hidden="true"></span><span class="about-orbit-ring about-orbit-ring-b" aria-hidden="true"></span><img class="about-portrait" src="${profilePhoto}" width="280" height="280" alt="صورة المهندس إسلام الشيخ" decoding="async"><span class="about-orbit-node about-orbit-secure" aria-hidden="true">${icon("shield")}<b>SECURE</b></span><span class="about-orbit-node about-orbit-build" aria-hidden="true">${icon("code")}<b>BUILD</b></span><span class="about-orbit-node about-orbit-ai" aria-hidden="true">${icon("spark")}<b>AI</b></span><span class="about-orbit-node about-orbit-grow" aria-hidden="true">${icon("google")}<b>GROW</b></span></div><div class="about-identity-copy"><span class="about-identity-label">DIGITAL ENGINEER · RIYADH</span><strong>${site.nameAr}</strong><p>Cybersecurity · Software · AI · Google</p><div class="about-identity-links"><a href="${site.social.googleDeveloper}" target="_blank" rel="noopener">ملف Google ${icon("external")}</a><a href="${site.social.github}" target="_blank" rel="noopener">GitHub ${icon("external")}</a><a href="${site.social.wikidata}" target="_blank" rel="noopener">Wikidata ${icon("external")}</a></div><small>خبير مستقل؛ لا أمثل Google أو أي منصة خارجية.</small></div></div>` })}
<div class="about-signature-strip" role="note" aria-label="منهج إسلام الشيخ: حماية، بناء، أتمتة، ونمو"><div class="about-signature-track" aria-hidden="true">${signatureTrack}</div></div>
<section class="section-pad about-manifesto-section"><div class="container about-manifesto"><div class="about-section-marker reveal"><span>01</span><small>طريقة التفكير</small></div><div class="about-manifesto-copy reveal">${eyebrow("الصورة الكاملة أولًا")}<h2>لا أحل العرض الظاهر وأترك السبب الحقيقي.</h2><p class="about-lead">المشكلة الواحدة نادرًا ما تعيش في طبقة واحدة. موقع بطيء قد يكون أزمة محتوى أو استضافة أو قياس، وضعف الظهور قد يبدأ من تجربة الجوال أو بيانات الملف التجاري، لا من الكلمات المفتاحية وحدها.</p><div class="about-story-columns"><p>لهذا لا أتعامل مع الموقع كواجهة، ولا مع الأمن كفحص منفصل، ولا مع الذكاء الاصطناعي كتجربة استعراضية. أبدأ بفهم المستخدم والبيانات والصلاحيات والبنية والهدف التجاري، ثم أحدد أين يجب أن نتدخل فعلًا.</p><p>أعمل من الرياض مع أصحاب أعمال وفرق داخل السعودية وخارجها. كل تعاون يبدأ بتعريف المشكلة والنطاق والمخرجات ومعيار النجاح، مع فصل ما يمكن تنفيذه وقياسه عما يعتمد على قرار منصة أو جهة خارجية.</p></div></div><blockquote class="about-quote reveal">${icon("quote")}<p>الهندسة الجيدة لا تجعل الحل يبدو أذكى؛ بل تجعل المشروع أوضح، أكثر أمانًا، وأسهل في التشغيل.</p><span>— Eslam Elshikh</span></blockquote></div></section>
<section class="section-pad muted-section about-journey-section"><div class="container about-journey-grid"><div class="about-journey-intro reveal">${eyebrow("ما وراء المسمى الوظيفي")}<h2>محطات صنعت طريقة التفكير قبل شكل الحل.</h2><p>الدراسة منحتني أساس أمن المعلومات، والتطبيق العملي ربطه بالبرمجيات وتجربة المستخدم ومنتجات Google. لذلك أرى كل مشروع من أكثر من زاوية، دون أن أفقد الهدف الأساسي.</p><div class="about-journey-seal" aria-hidden="true"><span>ENGINEERING</span><strong>360°</strong><small>MINDSET</small></div></div><ol class="about-journey-rail"><li class="reveal"><span>01</span><div><small>ACADEMIC FOUNDATION</small><h3>بكالوريوس أمن المعلومات</h3><p>كلية الحاسبات والمعلومات · جامعة 6 أكتوبر</p></div><b>CYBERSECURITY</b></li><li class="reveal"><span>02</span><div><small>ADVANCED STUDY</small><h3>دبلوم الأمن السيبراني</h3><p>الجامعة العربية المفتوحة · الرياض</p></div><b>SECURITY</b></li><li class="reveal"><span>03</span><div><small>APPLIED ENGINEERING</small><h3>برمجيات وتجارب رقمية</h3><p>تطوير مواقع وتطبيقات وهوية واجهات وسيو تقني من واقع مشروعات منشورة.</p></div><b>SOFTWARE</b></li><li class="reveal"><span>04</span><div><small>PRODUCT COMMUNITY</small><h3>خبير منتجات Google</h3><p>مساهمة عملية في مساعدة المستخدمين وفهم مشكلات الملفات التجارية وخرائط Google.</p></div><b>GOOGLE</b></li></ol></div></section>
<section class="section-pad about-focus-section"><div class="container"><div class="about-heading-row reveal"><div>${eyebrow("مختبر الخبرة")}<h2>اختر زاوية، وشاهد كيف أفكر فيها</h2></div><p>المسارات مختلفة، لكن المنهج واحد: تشخيص قبل التنفيذ، حدود واضحة، ومخرجات يمكن مراجعتها وقياسها.</p></div><div class="about-focus-shell reveal" data-about-focus><div class="about-focus-tabs" role="tablist" aria-label="مجالات خبرة إسلام الشيخ">${focusTabs}</div><div class="about-focus-stage">${focusPanels}</div></div></div></section>
<section class="section-pad muted-section about-proof-section"><div class="container"><div class="about-proof-heading reveal"><div>${eyebrow("أدلة لا شعارات")}<h2>أرقام مرتبطة بعمل يمكنك مراجعته</h2></div><div class="about-proof-actions">${button("/projects/", "استعرض المواقع", "button-ghost")}${button("/google-maps-projects/", "استعرض أعمال الخرائط")}</div></div><div class="about-proof-strip reveal"><article data-code="GBP / VERIFIED"><strong data-counter="472">472</strong><span>ملفًا تم دعم توثيقه</span><small>ملفات Google التجارية</small></article><article data-code="GBP / SOLVED"><strong data-counter="233">233</strong><span>مشكلة تمت معالجتها</span><small>حالات ملفات تجارية متنوعة</small></article><article data-code="MAPS / PUBLIC"><strong data-counter="${mapsCount}">${mapsCount}</strong><span>نموذج خرائط منشور</span><small>روابط عامة قابلة للفتح</small></article><article data-code="WEB / LIVE"><strong data-counter="${projectCount}">${projectCount}</strong><span>مشروع ويب حيًا</span><small>نماذج منشورة ضمن معرض الأعمال</small></article></div><section class="about-case-evidence" aria-labelledby="about-case-evidence-title"><div class="about-case-heading reveal"><div><span dir="ltr">SELECTED CASES / ${String(caseStudyProjects.length).padStart(2, "0")}</span><h3 id="about-case-evidence-title">ثلاثة مشروعات تشرح طريقة العمل، لا النتيجة فقط.</h3></div><p>كل دراسة تعرض الهدف والنطاق والقرارات والمخرجات التي يمكن مراجعتها، من دون اختلاق أرقام زيارات أو تحويلات لم تُنشر بياناتها.</p></div><div class="about-case-grid">${caseStudyCards}</div></section></div></section>
<section class="section-pad about-method-section"><div class="container about-method-grid"><div class="about-method-intro reveal">${eyebrow("منهج العمل")}<h2>وضوح في كل محطة، من أول سؤال حتى ما بعد الإطلاق.</h2><p>لا أبدأ من اسم التقنية. أبدأ من القرار الذي نريد أن يصبح ممكنًا، ثم أبني الطريق الأقصر والأكثر مسؤولية للوصول إليه.</p>${button(`${site.whatsapp}?text=${encodeURIComponent("مرحبًا م. إسلام، أرغب في مناقشة مشروعي ومعرفة نقطة البداية المناسبة.")}`, "ناقش نقطة البداية", "", true)}</div><ol class="about-method-list"><li class="reveal"><span>01</span><div><h3>أفهم السياق</h3><p>الهدف والمستخدم والوضع الحالي والقيود والاعتماديات وما جُرّب من قبل.</p></div></li><li class="reveal"><span>02</span><div><h3>أصمم القرار</h3><p>نطاق واضح، أولويات ومخرجات ومعايير قبول، قبل اختيار الأدوات أو شكل الواجهة.</p></div></li><li class="reveal"><span>03</span><div><h3>أنفّذ وأراجع</h3><p>مراحل قصيرة قابلة للاختبار، مع توثيق القرارات ومراجعة الأمان والأداء والتجربة.</p></div></li><li class="reveal"><span>04</span><div><h3>أسلّم وأقيس</h3><p>تسليم مفهوم وخطة تشغيل وقياس، ثم تحسين مبني على بيانات بدل التخمين.</p></div></li></ol></div></section>
<section class="section-pad muted-section about-standards-section"><div class="container"><div class="section-heading reveal">${eyebrow("اتفاق واضح من البداية")}<h2>يناسبنا التعاون عندما تحتاج وضوحًا ومسؤولية، لا وعودًا سريعة.</h2><p>هذه الحدود ليست نصًا قانونيًا صغيرًا؛ هي الطريقة التي أحمي بها قرارك وبياناتك وجودة ما يُسلَّم لك.</p></div><div class="about-standards-panel reveal"><section><span class="about-standard-label is-positive">${icon("check")}ألتزم به</span><ul><li>نطاق ومخرجات ومعيار نجاح يمكن مراجعته</li><li>احترام البيانات والصلاحيات وحدود الوصول</li><li>قرار تقني يمكن شرحه وصيانته بعد التسليم</li><li>وضوح في المخاطر والاعتماديات وما يحتاج متابعة</li></ul></section><section><span class="about-standard-label">${icon("close")}لن أعدك به</span><ul><li>ترتيب مضمون في Google أو قرار من منصة خارجية</li><li>وصول غير ضروري إلى الحسابات أو كلمات المرور</li><li>حل معقد لمجرد أنه يستخدم تقنية أحدث</li><li>نتائج غير قابلة للقياس أو ادعاءات بلا دليل</li></ul></section></div></div></section>
${finalCta("هل تبحث عن شخص يرى المشروع كاملًا، لا جزءًا واحدًا منه؟", "أرسل الهدف والوضع الحالي والروابط المتاحة. سأساعدك على تحديد نقطة البداية، والنطاق المنطقي، والخطوة التالية بوضوح.")}`;
}
