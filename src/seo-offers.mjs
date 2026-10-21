export const seoOfferRevision = '2026-10-21';
export const seoOfferStylesheet = `/assets/css/seo-offers.css?v=${seoOfferRevision}`;

// Scope options, not fixed-price packages. Fees and quantities require a written quote.
export function renderSeoOffers({ english = false, site, esc, icon, button }) {
 const t = (ar, en) => english ? en : ar;
 const offers = [
  {
   id: 'seo-audit', glyph: 'search',
   name: t('تدقيق SEO لمرة واحدة', 'One-time SEO audit'),
   fit: t('لمن يريد معرفة أسباب ضعف الظهور وخطة إصلاح يسلمها لفريقه.', 'For a diagnosis and a repair plan your team can implement.'),
   items: english ? ['Review the agreed priority URLs, crawling, indexing and canonicals.', 'Review service content, search intent and internal links.', 'Deliver a prioritized findings table with evidence and next steps.'] : ['فحص الروابط ذات الأولوية المتفق عليها والزحف والفهرسة والعناوين الأساسية.', 'مراجعة صفحات الخدمات ونية البحث والروابط الداخلية.', 'تسليم جدول مشكلات بالأدلة، وأولويات إصلاح وخطوات تالية.'],
   boundary: t('التسليم تقرير وخطة. تنفيذ الإصلاحات والمتابعة الشهرية يُتفق عليهما بشكل منفصل.', 'Deliverable: a report and plan. Implementation and monthly follow-up are agreed separately.'),
   action: t('اطلب عرض تدقيق', 'Request an audit quote')
  },
  {
   id: 'seo-monthly', glyph: 'chart',
   name: t('إدارة SEO شهرية', 'Monthly SEO management'),
   fit: t('لمن يحتاج تنفيذًا مستمرًا ومتابعة أثر التغييرات على البحث والاستفسارات.', 'For ongoing implementation and measurement of search visibility and enquiries.'),
   items: english ? ['Establish a Search Console baseline and agree a monthly work plan.', 'Implement the agreed technical, content and internal-link priorities.', 'Deliver a monthly change log, performance review and next priorities.'] : ['تحديد خط أساس من Search Console وخطة عمل شهرية متفق عليها.', 'تنفيذ أولويات التقنية والمحتوى والروابط ضمن النطاق المحدد.', 'تقرير شهري بالتغييرات والأداء والأولويات التالية.'],
   boundary: t('عدد الصفحات والمحتوى والإصلاحات ومدة التعاون تُحدد في العرض. ميزانية الإعلانات وخدمات الملفات التجارية تُسعّر منفصلة.', 'Page counts, content, fixes and engagement length are specified in the quote. Advertising budgets and Business Profile services are priced separately.'),
   action: t('ناقش الإدارة الشهرية', 'Discuss monthly management')
  }
 ];
 return `<section class="section-pad seo-offers" id="seo-engagements" aria-labelledby="seo-offers-title"><div class="container">
 <div class="section-heading"><span class="eyebrow"><span aria-hidden="true"></span>${t('اختر طريقة التعاون', 'Choose an engagement')}</span><h2 id="seo-offers-title">${t('تحتاج تشخيصًا محددًا أم إدارة مستمرة؟', 'A focused diagnosis or ongoing management?')}</h2><p>${t('مساران بمخرجات واضحة. نراجع رابط موقعك وهدفك ثم نحدد النطاق والتكلفة كتابةً قبل البدء.', 'Two clear scopes. Share your website and goal so we can agree deliverables and fees in writing before work begins.')}</p></div>
 <div class="seo-offer-grid">${offers.map(offer => `<article class="seo-offer-card" id="${offer.id}"><span class="seo-offer-icon" aria-hidden="true">${icon(offer.glyph)}</span><h3>${esc(offer.name)}</h3><p>${esc(offer.fit)}</p><ul>${offer.items.map(item => `<li>${esc(item)}</li>`).join('')}</ul><p class="seo-offer-boundary">${esc(offer.boundary)}</p><p class="seo-offer-price">${t('السعر حسب النطاق بعد مراجعة الموقع', 'Priced by scope after reviewing the website')}</p>${button(`${site.whatsapp}?text=${encodeURIComponent(t(`مرحبًا م. إسلام، أرغب في عرض لخدمة ${offer.name}.\nرابط موقعي: \nالهدف أو المشكلة الحالية: `, `Hello Eng. Eslam, I would like a quote for ${offer.name}.\nMy website: \nGoal or current issue: `))}`, offer.action, 'button-ghost', true)}</article>`).join('')}</div>
 <p class="seo-offer-note">${t('نقيس الفهرسة والظهور والنقرات والاستفسارات كلًّا على حدة. قرار الفهرسة والترتيب لدى Google، ولا يتضمن أي مسار وعدًا بمركز أو عدد عملاء مضمون.', 'Indexing, impressions, clicks and enquiries are measured separately. Google decides indexing and ranking; neither engagement guarantees a position or customer count.')}</p>
 </div></section>`;
}
