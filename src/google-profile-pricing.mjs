export const googleProfilePricingUpdatedAt = '2026-10-11';
export const googleProfilePricingStylesheet = `/assets/css/google-profile-pricing.css?v=${googleProfilePricingUpdatedAt}`;

export const googleProfileOffers = [
  {
    id: 'create-verify', icon: 'pin', price: 490,
    ar: { name: 'إنشاء وتوثيق الملف التجاري', description: 'إعداد ملف نشاطك التجاري على Google، وتنظيم بياناته وتجهيز متطلبات التوثيق ومتابعة خطواته.' },
    en: { name: 'Profile creation and verification', description: 'Set up your Google Business Profile, organize its information, and prepare and follow up on verification requirements.' }
  },
  {
    id: 'reverify-ownership', icon: 'google', price: 490,
    ar: { name: 'إعادة توثيق ملكية نشاط تجاري على Google', description: 'مراجعة حالة إثبات الملكية، وتجهيز المتطلبات ومتابعة مسار إعادة التوثيق المناسب للنشاط.' },
    en: { name: 'Business ownership re-verification', description: 'Review the verification status, prepare the required evidence, and follow the appropriate re-verification process.' }
  },
  {
    id: 'resolve-suspension', icon: 'shield', price: 300,
    ar: { name: 'حل تعليق أو إيقاف الملف التجاري', description: 'تشخيص سبب التعليق أو الإيقاف، ومراجعة بيانات الملف وتجهيز الأدلة ومتابعة طلب المعالجة.' },
    en: { name: 'Profile suspension or disablement support', description: 'Diagnose the suspension or disablement, review profile information, prepare evidence, and follow up on the resolution request.' }
  },
  {
    id: 'profile-review', icon: 'search', price: 100,
    ar: { name: 'فحص حالة الملف التجاري', description: 'مراجعة متخصصة لحالة الملف وبياناته والإشعارات الظاهرة، وتحديد المشكلة والخطوات المناسبة للتعامل معها.' },
    en: { name: 'Business Profile status review', description: 'A professional review of the profile status, information, and visible notices, with the issue and appropriate next steps identified.' }
  }
];

export function googleProfileOfferCatalog({ language = 'ar', url, provider }) {
  return {
    '@type': 'OfferCatalog',
    name: language === 'en' ? 'Google Business Profile services and prices' : 'خدمات الملفات التجارية على Google وأسعارها',
    itemListElement: googleProfileOffers.map((offer) => ({
      '@type': 'Offer',
      name: offer[language].name,
      price: offer.price,
      priceCurrency: 'SAR',
      url: `${url}#${offer.id}`,
      itemOffered: {
        '@type': 'Service',
        name: offer[language].name,
        description: offer[language].description,
        provider
      }
    }))
  };
}

export function renderGoogleProfilePricing({ language = 'ar', site, esc, icon, button, headingText, eyebrowText }) {
  const english = language === 'en';
  const cards = googleProfileOffers.map((offer) => {
    const copy = offer[language];
    const message = english
      ? `Hello Eng. Eslam, I would like to request ${copy.name} for SAR ${offer.price}.`
      : `مرحبًا م. إسلام، أرغب في طلب خدمة ${copy.name} بسعر ${offer.price} ريال.`;
    return `<article class="google-profile-price-card reveal" id="${offer.id}">
<span class="google-profile-price-icon">${icon(offer.icon)}</span>
<h3>${esc(copy.name)}</h3>
<p class="google-profile-price-description">${esc(copy.description)}</p>
<p class="google-profile-price"><bdi dir="ltr">${offer.price}</bdi><span>${english ? 'SAR' : 'ريال'}</span></p>
<p class="google-profile-price-duration"><span>${english ? 'Estimated delivery' : 'مدة التنفيذ المتوقعة'}</span><strong>${english ? '3 to 5 business days' : 'من 3 إلى 5 أيام عمل'}</strong></p>
${button(`${site.whatsapp}?text=${encodeURIComponent(message)}`, english ? 'Request this service' : 'اطلب الخدمة', 'button-ghost', true)}
</article>`;
  }).join('');
  return `<section class="section-pad google-profile-pricing" id="service-pricing" aria-labelledby="google-profile-pricing-title">
<div class="container">
<div class="section-heading reveal"><span class="eyebrow"><span aria-hidden="true"></span>${esc(eyebrowText || (english ? 'Services and prices' : 'الخدمات والأسعار'))}</span><h2 id="google-profile-pricing-title">${esc(headingText || (english ? 'Choose the service your Business Profile needs' : 'اختر الخدمة المناسبة لملفك التجاري على Google'))}</h2><p>${english ? 'Clear prices and estimated delivery times for profile creation, re-verification, suspension support, and professional status reviews.' : 'أسعار واضحة ومدة تنفيذ متوقعة لخدمات الإنشاء والتوثيق وإعادة إثبات الملكية ومعالجة التعليق والفحص المتخصص.'}</p></div>
<div class="google-profile-pricing-grid">${cards}</div>
<div class="google-profile-pricing-note reveal">${icon('clock')}<div><strong>${english ? 'Delivery time for all services' : 'مدة تنفيذ جميع الخدمات'}</strong><p>${english ? 'Estimated delivery is 3 to 5 business days. In some cases subject to restrictions, it may take up to 14 business days.' : 'مدة التنفيذ المتوقعة من 3 إلى 5 أيام عمل لجميع الخدمات. وفي بعض الحالات التي فُرضت عليها قيود، قد تصل المدة إلى 14 يوم عمل.'}</p></div></div>
</div></section>`;
}
