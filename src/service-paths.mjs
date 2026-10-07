const pair = (ar, en) => ({ ar, en });
const paths = [
 {
  id: 'presence', icon: 'globe',
  label: pair('أُبرز قيمة أعمالي', 'Show my business at its best'),
  title: pair('من أول انطباع، إلى تواصلٍ واضح.', 'From a first impression to a clear next step.'),
  text: pair('نربط تعريف خدماتك، وتجربة الموقع، والاستعداد للبحث والخرائط؛ ليجد العميل ما يحتاج إليه ويفهم كيف يبدأ معك.', 'Connect your services, website experience and search readiness so customers can understand the offer and how to reach you.'),
  steps: [
   ['layers', pair('نُعرّف خدماتك', 'Define the offer'), pair('محتوى يشرح القيمة', 'Content with a clear purpose')],
   ['code', pair('نصمّم الرحلة', 'Design the journey'), pair('واجهة ومسار تواصل', 'Interface and contact flow')],
   ['search', pair('نراجع الظهور', 'Review discovery'), pair('بنية البحث والخرائط', 'Search and Maps foundations')],
  ],
  services: [['web-development', pair('المواقع', 'Websites')], ['seo', pair('السيو', 'SEO')], ['google-business-profile', pair('ملف Google', 'Google Business Profile')]],
  question: pair('هل أحتاج إلى جميع هذه الخدمات؟', 'Do I need every service in this path?'),
  answer: pair('نبدأ بما ينقص مشروعك فعلًا. قد تكون الأولوية إعادة صياغة الموقع، أو تحسين مسار التواصل، أو معالجة الظهور المحلي؛ ويُحدَّد النطاق بعد مراجعة وضعك الحالي.', 'Start with what the project actually needs: clearer website content, a better contact flow or local visibility work. The scope follows a review of your current position.'),
  cta: pair('استكشف تطوير المواقع', 'Explore website development'), href: '/services/web-development/',
  proof: pair('شاهد مثال تعاود للمقاولات', 'Explore the Tawod case study'), proofHref: '/projects/tawod-contracting/',
 },
 {
  id: 'operations', icon: 'nodes',
  label: pair('أُنظّم طريقة العمل', 'Organize the way we work'),
  title: pair('كلّ طلبٍ يعرف وجهته.', 'Every request has a clear next step.'),
  text: pair('نصمّم النظام حول مهام فريقك: ما الذي يدخل، ومن يتابع، وكيف ينتقل العمل. ثم نختبر مسارًا واضحًا قبل اعتماد نطاق التنفيذ الكامل.', 'Shape the system around your team: what comes in, who owns it and how work changes hands. Test an agreed workflow before defining the full implementation.'),
  steps: [
   ['user', pair('نفهم الأدوار', 'Understand the roles'), pair('مسؤوليات ومراحل', 'Owners and stages')],
   ['layers', pair('نبني التجربة', 'Shape the trial'), pair('مهام بهوية منشأتك', 'Tasks in your business identity')],
   ['check', pair('نختبر الانتقال', 'Test the handoff'), pair('متابعة وملاحظات', 'Follow-up and feedback')],
  ],
  services: [['crm-systems', pair('CRM', 'CRM')], ['ai-agents', pair('أتمتة المهام', 'Task automation')], ['knowledge-bases', pair('قواعد المعرفة', 'Knowledge bases')]],
  question: pair('كيف أعرف أن النظام يناسب فريقي؟', 'How do I know the system fits my team?'),
  answer: pair('نحدّد مهامًا يكررها فريقك، ثم نجهّز تجربة فعلية مخصصة بعد الاتفاق على النطاق والموعد والشروط التجارية. تكون المراجعة مبنية على طريقة عملك وملاحظات مستخدميك.', 'Choose tasks your team repeats, then prepare a working custom trial after agreeing scope, timing and commercial terms. Review it against your workflow and user feedback.'),
  cta: pair('اختبر محاكاة المسار', 'Try the workflow simulation'), href: '/services/crm-systems/#crm-demo-company',
  proof: pair('استكشف تجربة سما سكان', 'Explore the Sama Scan experience'), proofHref: '/products/sama-scan-control-center/',
 },
 {
  id: 'security', icon: 'shield',
  label: pair('أُحسّن أمان البنية', 'Strengthen the foundations'),
  title: pair('بنيةٌ تفهمها، وتطوّرها بثقة.', 'Foundations you can understand and improve.'),
  text: pair('نراجع المخاطر والصلاحيات والاستضافة ضمن نطاقٍ مصرح، ونرتّب المعالجة حسب أثرها على التشغيل؛ لتصبح القرارات التقنية واضحة وقابلة للمراجعة.', 'Review risk, access and hosting within an authorized scope, then prioritize remediation by operational impact. Keep technical decisions understandable and reviewable.'),
  steps: [
   ['search', pair('نُحدّد النطاق', 'Define the scope'), pair('أنظمة وأصول مصرح بها', 'Authorized systems and assets')],
   ['shield', pair('نرتّب المعالجة', 'Prioritize the work'), pair('أولويات مرتبطة بالأثر', 'Priorities linked to impact')],
   ['check', pair('نتحقق ونوثّق', 'Verify and document'), pair('نتائج يمكن مراجعتها', 'Reviewable findings')],
  ],
  services: [['cybersecurity', pair('الأمن السيبراني', 'Cybersecurity')], ['cloud-solutions', pair('الحلول السحابية', 'Cloud solutions')], ['web-development', pair('التطوير', 'Development')]],
  question: pair('كيف تُحدَّد أولوية المعالجة؟', 'How are remediation priorities decided?'),
  answer: pair('بحسب النطاق المعتمد، وطبيعة الأصل، واحتمال الخطر وأثره على أعمالك. نميّز ما يحتاج إلى معالجة عاجلة وما يمكن جدولته، ثم نتحقق من التعديلات داخل النطاق المتفق عليه.', 'Use the agreed scope, asset context, likelihood and business impact. Separate urgent work from scheduled improvements, then verify changes within the authorized scope.'),
  cta: pair('استكشف نطاق الأمان', 'Explore the security scope'), href: '/services/cybersecurity/',
  proof: pair('تعرّف على منهجية العمل', 'Explore the delivery approach'), proofHref: '/about/',
 },
];

export function renderServicePaths({ english = false, esc, icon }) {
 const t = value => value[english ? 'en' : 'ar'];
 const prefix = english ? '/en' : '';
 return `<div class="service-compass" id="services-compass" data-service-paths aria-label="${english ? 'Service compass' : 'بوصلة الخدمات'}">
  <div class="service-compass-top"><div><span dir="ltr">A PURPOSE. A PATH.</span><p>${english ? 'What would you like to change?' : 'ما الذي تريد أن يتغيّر في أعمالك؟'}</p></div><span class="service-compass-mark" aria-hidden="true">${icon('spark')}</span></div>
  <div class="service-path-tabs" role="tablist" aria-label="${english ? 'Choose your goal' : 'اختر هدفك'}" data-service-path-controls hidden>${paths.map((path, i) => `<button type="button" id="service-path-tab-${path.id}" role="tab" aria-controls="service-path-panel-${path.id}" aria-selected="${i === 0}" tabindex="${i ? -1 : 0}" data-service-path-tab="${i}"><span dir="ltr">0${i + 1}</span>${icon(path.icon)}<strong>${esc(t(path.label))}</strong></button>`).join('')}</div>
  <div class="service-path-panels">${paths.map((path, i) => `<div class="service-path-panel" id="service-path-panel-${path.id}" role="tabpanel" aria-labelledby="service-path-tab-${path.id}" tabindex="0" data-service-path-panel="${i}">
   <div class="service-path-story"><span class="service-path-code" dir="ltr">0${i + 1} / ${path.id.toUpperCase()}</span><h3>${esc(t(path.title))}</h3><p>${esc(t(path.text))}</p><nav class="service-path-links" aria-label="${english ? 'Services in this path' : 'خدمات هذا المسار'}">${path.services.map(([slug, title]) => `<a href="${prefix}/services/${slug}/">${esc(t(title))}${icon('arrow')}</a>`).join('')}</nav><div class="service-path-actions"><a class="service-path-cta" href="${prefix}${path.href}">${esc(t(path.cta))}${icon('arrow')}</a><a class="service-path-proof" href="${prefix}${path.proofHref}">${esc(t(path.proof))}</a></div></div>
   <div class="service-path-map"><p>${english ? 'HOW THE PATH TAKES SHAPE' : 'هكذا يتشكّل المسار'}</p><ol>${path.steps.map(([glyph, title, detail], j) => `<li><span class="service-path-step-icon">${icon(glyph)}</span><div><strong>${esc(t(title))}</strong><small>${esc(t(detail))}</small></div><span class="service-path-step-number" dir="ltr">0${j + 1}</span></li>`).join('')}</ol><details><summary>${esc(t(path.question))}<span aria-hidden="true">+</span></summary><p>${esc(t(path.answer))}</p></details></div>
  </div>`).join('')}</div>
 </div>`;
}
