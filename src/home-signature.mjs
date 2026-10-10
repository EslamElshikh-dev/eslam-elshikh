import { latestWorkReviewedAt } from './latest-work.mjs';

// Public captures and delivery links, rather than invented performance claims.
const signatureViews = [
 {
  id: 'website', label: ['موقع شركة', 'Website'], glyph: 'code',
  title: ['تعاود للمقاولات', 'Tawod Contracting'],
  image: '/assets/case-results/tawod-current-20261010.webp', width: 1348, height: 926,
  host: 'tawodco.com',
  caption: ['واجهة الموقع المنشور', 'Published website interface'],
  summary: ['خدماتٌ واضحة، ومحتوى منظّم، ومسارات تواصل تربط الزائر بما يحتاج إليه.', 'Clear service pages, structured content and contact paths shaped around the visitor’s needs.'],
  detail: ['بناء من الصفر · ملف تجاري · سيو محلي وتقني', 'Built from scratch · Business Profile · local & technical SEO'],
  proof: '/projects/tawod-contracting/', proofLabel: ['اكتشف المشروع', 'Explore the project'],
  question: ['ما الذي يجعل الموقع أكثر من واجهة جميلة؟', 'What makes a website more than a good-looking interface?'],
  answer: ['ترتيب الخدمات والمحتوى وخطوة التواصل. في تعاود، يخدم التصميم فهم نطاق العمل، وتدعم البنية التقنية وضوح الصفحات لمحركات البحث.', 'Service structure, useful content and a clear contact step. In Tawod, the design explains the work while the technical structure supports search discoverability.']
 },
 {
  id: 'operations', label: ['نظام تشغيل', 'Operations'], glyph: 'layers',
  title: ['كرمز كافيه', 'Kermez Cafe'],
  image: '/assets/products/kermez-overview-20261007.webp', width: 1348, height: 926,
  host: 'kermez-cafe.vercel.app',
  caption: ['جولة نظام التشغيل · بيانات توضيحية', 'Operations tour · demonstration data'],
  summary: ['مساحةٌ تجمع الطلبات والعملاء والمخزون والمتابعة؛ ليُرى العمل في سياقه.', 'A workspace for orders, customers, stock and follow-up, with the work kept in context.'],
  detail: ['طلبات وعملاء · إدارة منتجات · متابعة', 'Orders & customers · product management · follow-up'],
  proof: '/products/kermez-control-center/', proofLabel: ['استكشف النظام', 'Explore the system'],
  question: ['كيف تخدم لوحة التحكم طريقة العمل؟', 'How does a dashboard support the way a team works?'],
  answer: ['تجمع المهام والمعلومات في مسارات يسهل الرجوع إليها. جولة كرمز تعرض مكوّنات النظام ببيانات توضيحية، وتوضح كيف يرتبط الطلب بالعميل والمتابعة.', 'It brings tasks and information into paths the team can revisit. The Kermez tour uses demonstration data to explain the system and the relationship between orders, customers and follow-up.']
 },
 {
  id: 'catalog', label: ['كتالوج منتجات', 'Catalog'], glyph: 'search',
  title: ['دهانات عليا', 'Alya Paints'],
  image: '/assets/projects/alya-catalog-20261007.webp', width: 1348, height: 926,
  host: 'dahanat-alya-riyadh.vercel.app',
  caption: ['كتالوج المنتجات المنشور', 'Published product catalog'],
  summary: ['منتجاتٌ يسهل اكتشافها، وصفحات تشرح استخدامها، ومحتوى يُدار من داخل النشاط.', 'Products that are easy to explore, pages explaining their use and content managed by the business.'],
  detail: ['بحث وتصنيفات · صفحات منتجات · إدارة محتوى', 'Search & categories · product pages · content management'],
  proof: '/projects/dahanat-alya-riyadh/', proofLabel: ['اكتشف المشروع', 'Explore the project'],
  question: ['هل يستطيع الفريق تحديث المنتجات بنفسه؟', 'Can the team update its own products?'],
  answer: ['في مشروع عليا، ترتبط أسماء المنتجات وصورها وأوصافها وأسعارها ونشرها بلوحة خاصة بالفريق. المعاينة هنا للكتالوج العام؛ وتفاصيل الإدارة موضّحة في دراسة المشروع.', 'In Alya, product names, images, descriptions, prices and publication are managed in a private team workspace. This preview shows the public catalog; the case study explains its administration.']
 }
];

export function renderHomeSignature({ english = false, site, portrait, esc, icon }) {
 const t = pair => pair[english ? 1 : 0];
 const prefix = english ? '/en' : '';
 const date = new Intl.DateTimeFormat(english ? 'en-GB' : 'ar-SA', { day: 'numeric', month: 'long', year: 'numeric', calendar: 'gregory', timeZone: 'UTC' }).format(new Date(`${latestWorkReviewedAt}T12:00:00Z`));
 return `<aside class="hero-visual home-signature reveal" id="signature-work" data-home-signature aria-labelledby="signature-title">
  <div class="signature-card">
   <div class="signature-topline"><span dir="ltr">ES / DIGITAL ENGINEERING</span><span>${icon('pin')}${english ? 'Riyadh' : 'الرياض'}</span></div>
   <div class="signature-owner"><a class="signature-portrait" href="${prefix}/about/" aria-label="${english ? 'About Eslam Elshikh' : 'تعرف على إسلام الشيخ'}"><img src="${esc(portrait)}" width="96" height="96" alt="${english ? 'Portrait of Eslam Elshikh' : 'صورة المهندس إسلام الشيخ'}" decoding="async" loading="eager"></a><div><strong>${esc(english ? site.nameEn : 'إسلام الشيخ')}</strong><p>${english ? 'Cybersecurity & software engineer' : 'مهندس أمن سيبراني ومطوّر برمجيات'}</p><a href="${prefix}/about/">${english ? 'Meet the engineer' : 'تعرّف على إسلام'}${icon('arrow')}</a></div><span class="signature-monogram" dir="ltr" aria-hidden="true">ES.</span></div>
   <div class="signature-heading"><h2 id="signature-title">${english ? 'My approach, in the work.' : 'بصمتي، في تفاصيل العمل.'}</h2><span dir="ltr" data-signature-position aria-hidden="true">01 / 03</span></div>
   <div class="signature-tabs" role="tablist" aria-label="${english ? 'Explore examples of my work' : 'استكشف نماذج من أعمالي'}" data-signature-tools hidden>${signatureViews.map((view, i) => `<button type="button" role="tab" id="signature-tab-${view.id}" aria-controls="signature-panel-${view.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-signature-tab="${view.id}">${icon(view.glyph)}<span>${esc(t(view.label))}</span></button>`).join('')}</div>
   <div class="signature-views">${signatureViews.map((view, i) => `<section class="signature-view" id="signature-panel-${view.id}" role="tabpanel" aria-labelledby="signature-tab-${view.id}" tabindex="0" data-signature-panel="${view.id}">
    <figure class="signature-preview"><div class="signature-browser" aria-hidden="true"><span><i></i><i></i><i></i></span><span dir="ltr">${view.host}</span>${icon(view.glyph)}</div><a href="${prefix}${view.proof}" aria-label="${esc(english ? `Explore ${t(view.title)}` : `استكشف ${t(view.title)}`)}"><img src="${view.image}" width="${view.width}" height="${view.height}" alt="${esc(`${t(view.title)} — ${t(view.caption)}`)}" loading="${i === 0 ? 'eager' : 'lazy'}" decoding="async"></a><figcaption>${icon('layers')}<span>${esc(t(view.caption))}</span></figcaption></figure>
    <div class="signature-project-copy"><div class="signature-project-title"><h3>${esc(t(view.title))}</h3><a href="${prefix}${view.proof}">${esc(t(view.proofLabel))}${icon('arrow')}</a></div><p>${esc(t(view.summary))}</p><small>${esc(t(view.detail))}</small></div>
    <details class="signature-question"><summary>${esc(t(view.question))}<span class="signature-question-toggle" aria-hidden="true">+</span></summary><p>${esc(t(view.answer))}</p></details>
   </section>`).join('')}</div>
   <footer class="signature-footer"><span>${english ? 'My work · review dated' : 'مشاريع بنيتها · مراجعة بتاريخ'} <time datetime="${latestWorkReviewedAt}">${esc(date)}</time></span><a href="${prefix}/work-evidence/">${english ? 'The delivery record' : 'سجل الأعمال'}${icon('external')}</a></footer>
  </div>
  <p class="signature-caption">${english ? 'One approach. A different solution for each business.' : 'منهجٌ واحد. وحلٌّ يليق بكلّ نشاط.'}<span aria-hidden="true"></span></p>
 </aside>`;
}
