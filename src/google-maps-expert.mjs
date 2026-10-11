import { googleProfileOffers, renderGoogleProfilePricing } from './google-profile-pricing.mjs';
import { renderGoogleMapsSignature, renderGoogleMapsStories, renderGoogleMapsRequest } from './google-maps-experience.mjs';
import { renderGoogleMapsScene, renderGoogleMapsFoundation, renderGoogleMapsModels, renderGoogleMapsJourney, renderGoogleMapsReading } from './google-maps-depth.mjs';

export const googleMapsExpertRevision = '20261011.4';
export const googleMapsExpertStylesheet = `/assets/css/google-maps-expert.css?v=${googleMapsExpertRevision}`;
export const googleMapsExpertScript = `/assets/js/google-maps-expert.js?v=${googleMapsExpertRevision}`;

const pair = (ar, en) => ({ ar, en });
const paths = [
  {
    id: 'create-verify', label: pair('أبدأ ملفًا جديدًا', 'Create a new profile'),
    title: pair('بداية صحيحة لحضورك على الخريطة.', 'A clear start for your presence on Maps.'),
    text: pair('نحوّل معلومات نشاطك إلى ملف تجاري منظم: اسم يعكس هويتك، وفئة تناسب عملك، وبيانات واضحة، ثم نجهّز متطلبات التوثيق ونتابع المسار المتاح.', 'Turn your business information into an organized profile: an accurate name, a suitable category and clear details, followed by preparation and follow-up for the available verification route.'),
    steps: [pair('مراجعة النشاط وأهلية إنشاء الملف', 'Review the business and profile eligibility'), pair('إعداد البيانات والفئة والخدمات', 'Prepare information, categories and services'), pair('تجهيز متطلبات التوثيق ومتابعتها', 'Prepare and follow up on verification requirements')],
    needs: pair('اسم النشاط، وطبيعة الخدمة، والموقع أو نطاق العمل، والموقع الإلكتروني إن وُجد.', 'Business name, services, location or service area, and a website if available.'),
    outcome: pair('الهدف: ملف يعكس نشاطك الحقيقي، وخطوات توثيق مرتبة.', 'The goal: a profile that reflects your business and an organized verification process.')
  },
  {
    id: 'reverify-ownership', label: pair('أعيد إثبات الملكية', 'Verify ownership again'),
    title: pair('ملفك موجود. نرتّب خطوة إثبات الملكية.', 'Your profile exists. Let’s clarify ownership.'),
    text: pair('عندما يُطلب التوثيق مجددًا أو تتعثر محاولة إثبات الملكية، نراجع حالة الملف والمحاولات السابقة، ونحدد المتطلبات المناسبة قبل بدء الخطوة التالية.', 'When verification is requested again or an ownership attempt stalls, review the profile status and previous attempts, then identify the requirements before taking the next step.'),
    steps: [pair('قراءة حالة التوثيق والإشعار الظاهر', 'Read the verification status and current notice'), pair('مراجعة المحاولات وتجهيز أدلة النشاط', 'Review previous attempts and prepare business evidence'), pair('متابعة مسار إعادة إثبات الملكية', 'Follow the re-verification process')],
    needs: pair('رابط الملف، ونص طلب التوثيق، وطبيعة النشاط، وتفاصيل المحاولات السابقة.', 'Profile link, verification notice, business model and previous attempts.'),
    outcome: pair('الهدف: فهم سبب التعثر وتجهيز إعادة التوثيق بوضوح.', 'The goal: understand the obstacle and prepare a clear re-verification path.')
  },
  {
    id: 'resolve-suspension', label: pair('ملفي معلّق أو موقوف', 'My profile is suspended'),
    title: pair('نقرأ سبب التعليق، ثم نبني مسار المعالجة.', 'Understand the suspension. Prepare the response.'),
    text: pair('تبدأ المعالجة من تشخيص الحالة ومراجعة بيانات النشاط والتعديلات السابقة، ثم ترتيب التصحيحات والأدلة ومتابعة طلب المراجعة المناسب.', 'Start with diagnosis, business information and previous changes, then organize corrections and evidence and follow the appropriate review request.'),
    steps: [pair('تشخيص الإشعار وبيانات الملف', 'Diagnose the notice and profile information'), pair('ترتيب التصحيحات والأدلة المطلوبة', 'Organize corrections and required evidence'), pair('متابعة طلب المعالجة والمراجعة', 'Follow up on the resolution and review request')],
    needs: pair('رابط الملف، وإشعار التعليق أو الإيقاف، وآخر التعديلات، وأي طلب مراجعة سابق.', 'Profile link, suspension or disablement notice, recent changes and any previous review request.'),
    outcome: pair('الهدف: معالجة منظمة تستند إلى حالة الملف وبياناته.', 'The goal: a structured response based on the actual profile and its information.')
  },
  {
    id: 'profile-review', label: pair('أحتاج إلى تشخيص الحالة', 'Understand my profile status'),
    title: pair('افهم حالة ملفك قبل اختيار الخدمة.', 'Understand your profile before choosing a service.'),
    text: pair('إذا كانت المشكلة غير واضحة، فالفحص المتخصص يجمع التفاصيل في صورة مفهومة: ما حالة الملف، وما الذي يحتاج إلى تصحيح، وما الخطوة المناسبة بعد ذلك.', 'If the issue is unclear, a professional review brings the details together: the profile status, what needs correction and the appropriate next step.'),
    steps: [pair('فحص الحالة والبيانات والإشعارات', 'Review the status, information and notices'), pair('تحديد مواضع الخلل والتناقض', 'Identify issues and inconsistencies'), pair('توضيح الأولويات والخطوات التالية', 'Explain priorities and next steps')],
    needs: pair('رابط الملف، ووصف المشكلة، والإشعارات الظاهرة، والتغييرات الأخيرة إن وُجدت.', 'Profile link, a description of the issue, visible notices and any recent changes.'),
    outcome: pair('الهدف: تشخيص واضح يساعدك على اتخاذ القرار المناسب.', 'The goal: a clear diagnosis to help you make the right decision.')
  }
];

export function googleMapsExpertFaq(english = false) {
  return english ? [
    ['Which service should I choose?', 'Choose profile creation if your business needs a new profile, re-verification if ownership must be verified again, or suspension support if the profile is suspended or disabled. A paid status review is useful when the issue is unclear.'],
    ['What are the prices and delivery times?', 'Profile creation and verification costs SAR 490; ownership re-verification costs SAR 490; suspension or disablement support costs SAR 300; and a professional status review costs SAR 100. Estimated delivery for every service is 3 to 5 business days. In some cases subject to restrictions, it may take up to 14 business days.'],
    ['What should I prepare before contacting you?', 'Prepare the public profile link, the notice you see, your business model and a brief history of changes or previous attempts. We will identify any further requirements after reviewing the case.'],
    ['How does the free audit differ from the paid status review?', 'The free audit available on this website is an initial check to help you get started. The SAR 100 service is a professional review of the profile status, information and notices, with the issue and appropriate next steps identified.'],
    ['Are these prices paid to Google?', 'Google Business Profile is free. The prices on this page cover the selected professional service, including the review, preparation and follow-up described for that service.'],
    ['Does the request builder send my message automatically?', 'The builder prepares a message with your chosen service, price and the details you enter. Open it in WhatsApp, review it and send it when ready.'],
    ['Does suspension support include guaranteed reinstatement?', 'The service covers diagnosis, information review, evidence preparation and follow-up on the appropriate request. Google makes the final verification and reinstatement decisions; no approval or fixed ranking is guaranteed.'],
    ['Do you represent Google?', 'Eslam Elshikh provides independent Google Maps and Business Profile services. He does not represent Google. Public work examples and professional profiles are available through this website.']
  ] : [
    ['كيف أختار الخدمة المناسبة لملفي؟', 'اختر الإنشاء والتوثيق إذا كنت تبدأ ملفًا جديدًا، وإعادة التوثيق إذا طُلب إثبات الملكية مجددًا، ومعالجة التعليق إذا كان الملف معلّقًا أو موقوفًا. وإذا كانت الحالة غير واضحة، يساعدك الفحص المتخصص على تحديد المشكلة والخطوة المناسبة.'],
    ['ما الأسعار ومدة التنفيذ؟', 'إنشاء وتوثيق الملف التجاري: 490 ريال. إعادة توثيق الملكية: 490 ريال. حل التعليق أو الإيقاف: 300 ريال. فحص حالة الملف: 100 ريال. مدة التنفيذ المتوقعة لجميع الخدمات من 3 إلى 5 أيام عمل، وقد تصل إلى 14 يوم عمل في بعض الحالات التي فُرضت عليها قيود.'],
    ['ماذا أجهّز قبل التواصل؟', 'جهّز رابط الملف التجاري، ونص الإشعار الظاهر، وطبيعة النشاط، وملخصًا لآخر التعديلات والمحاولات السابقة. بعد مراجعة الحالة نحدد أي متطلبات إضافية يحتاج إليها المسار.'],
    ['ما الفرق بين الفحص المجاني والفحص المتخصص؟', 'الفحص المجاني المتاح في الموقع هو مراجعة أولية تساعدك على البدء. أما خدمة فحص حالة الملف بسعر 100 ريال فتشمل مراجعة متخصصة للحالة والبيانات والإشعارات، وتحديد المشكلة والخطوات المناسبة للتعامل معها.'],
    ['هل تُدفع هذه الأسعار إلى جوجل؟', 'الملف التجاري على Google مجاني. الأسعار الموضحة في هذه الصفحة مقابل الخدمة المهنية المختارة، وما يشمله نطاقها من مراجعة وتجهيز ومتابعة كما هو موضح لكل خدمة.'],
    ['هل يرسل نموذج الطلب الرسالة تلقائيًا؟', 'يجهّز النموذج رسالة بالخدمة المختارة وسعرها والتفاصيل التي أدخلتها. افتحها في واتساب، وراجعها ثم أرسلها عندما تكون جاهزًا.'],
    ['هل تشمل معالجة التعليق ضمان استعادة الملف؟', 'تشمل الخدمة التشخيص ومراجعة البيانات وتجهيز الأدلة ومتابعة الطلب المناسب. تتخذ Google القرار النهائي بشأن التوثيق والاستعادة، لذلك لا تتضمن الخدمة ضمان الموافقة أو ترتيب محدد في النتائج.'],
    ['هل تمثل Google عند تقديم الخدمة؟', 'إسلام الشيخ يقدم خدمات مستقلة في خرائط جوجل والملفات التجارية، ولا يمثل Google. يمكنك مراجعة نماذج الأعمال العامة والملفات المهنية المنشورة من خلال الموقع.']
  ];
}

export function renderGoogleMapsExpert({ english = false, site, mapsProjects, profilePhoto, esc, icon, button, faqBlock }) {
  const lang = english ? 'en' : 'ar';
  const t = value => value[lang];
  const prefix = english ? '/en' : '';
  const message = english ? 'Hello Eng. Eslam, I would like to discuss the status of my Google Business Profile and choose the appropriate service.' : 'مرحبًا م. إسلام، أرغب في مناقشة حالة ملفي التجاري على جوجل وتحديد الخدمة المناسبة.';
  const contact = `${site.whatsapp}?text=${encodeURIComponent(message)}`;
  const links = [
    ['choose-path', pair('ابدأ من حالتك', 'Choose your path')],
    ['service-pricing', pair('الخدمات والأسعار', 'Services & prices')],
    ['business-models', pair('نوع نشاطك', 'Business model')],
    ['expert-method', pair('رحلة العمل', 'The approach')],
    ['expert-work', pair('قصص الأعمال', 'Work stories')],
    ['expert-request', pair('جهّز طلبك', 'Prepare your request')]
  ];
  const pathPanels = paths.map((path, index) => {
    const offer = googleProfileOffers.find(item => item.id === path.id);
    return `<section class="expert-path-panel" id="path-${path.id}" aria-labelledby="path-title-${path.id}" data-expert-panel="${path.id}">
      <div class="expert-path-story"><span class="expert-kicker">${icon(offer.icon)} ${esc(offer[lang].name)}</span><h3 id="path-title-${path.id}">${esc(t(path.title))}</h3><p>${esc(t(path.text))}</p><div class="expert-path-outcome">${icon('check')}<span>${esc(t(path.outcome))}</span></div><div class="expert-path-bottom"><div class="expert-path-price"><strong dir="ltr">${offer.price}</strong><span>${english ? 'SAR' : 'ريال'}<small>${english ? '3–5 business days*' : '3–5 أيام عمل*'}</small></span></div><a class="button" href="#expert-request" data-expert-request-select="${path.id}">${english ? 'Prepare this request' : 'جهّز طلب هذه الخدمة'} ${icon('arrow', 'icon expert-arrow')}</a></div><a class="expert-time-link" href="#service-pricing">${english ? '*Restricted cases may take up to 14 business days. View pricing details.' : '*قد تصل الحالات المقيّدة إلى 14 يوم عمل. تفاصيل الأسعار والمدة.'}</a></div>
      <div class="expert-path-road"><span class="expert-road-heading">${english ? 'Your next steps' : 'خطوات مسارك'}</span><ol>${path.steps.map((step, i) => `<li><span dir="ltr">0${i + 1}</span><strong>${esc(t(step))}</strong></li>`).join('')}</ol><div class="expert-path-needs"><span>${icon('layers')} ${english ? 'Prepare to get started' : 'جهّز هذه المعلومات للبدء'}</span><p>${esc(t(path.needs))}</p></div><span class="expert-path-position" dir="ltr">0${index + 1} / 04</span></div>
    </section>`;
  }).join('');
  return `<div class="maps-expert" data-maps-expert>
    <section class="expert-hero" aria-labelledby="expert-title"><div class="container">
      <nav class="breadcrumbs" aria-label="${english ? 'Breadcrumb' : 'مسار الصفحة'}"><a href="${prefix}/">${english ? 'Home' : 'الرئيسية'}</a>${icon('chevron')}<a href="${prefix}/google-expert/" aria-current="page">${english ? 'Google Maps Expert' : 'خبير خرائط جوجل'}</a></nav>
      <div class="expert-hero-grid"><div class="expert-hero-copy reveal"><span class="expert-kicker"><span class="expert-status-dot" aria-hidden="true"></span>${english ? 'Eslam Elshikh · Riyadh & Saudi Arabia' : 'إسلام الشيخ · الرياض والسعودية'}</span><h1 id="expert-title">${english ? '<span>Google Maps</span> Expert' : '<span>خبير</span> خرائط جوجل'}</h1><p class="expert-promise">${english ? 'Your presence on Maps.<br>Every detail considered.' : 'حضورك على الخريطة.<br>وتفاصيل تصنع الفرق.'}</p><p class="expert-hero-lead">${english ? 'Creation, verification, suspension support or a clear diagnosis. Choose where your Business Profile stands, and follow a structured path with transparent prices and practical next steps.' : 'من تأسيس ملف جديد إلى معالجة تعثّر التوثيق والتعليق؛ أراجع التفاصيل، وأرتّب متطلبات حالتك، وأتابع المسار المناسب بخدمات محددة وأسعار واضحة.'}</p><div class="expert-hero-actions">${button('#choose-path', english ? 'Find my path' : 'اكتشف مسارك')}${button(contact, english ? 'Discuss my profile' : 'ناقش حالة ملفك', 'button-ghost', true)}</div><a class="expert-hero-proof" href="#expert-work">${icon('pin')}<span>${english ? `${mapsProjects.length} public work examples. Explore the details.` : `${mapsProjects.length} نموذج عمل منشور. شاهد التفاصيل على الخريطة.`}</span>${icon('arrow', 'icon expert-arrow')}</a></div>
      ${renderGoogleMapsScene({ english, mapsProjects, profilePhoto, esc, icon, signature: renderGoogleMapsSignature })}</div>
      <div class="expert-facts"><div><strong dir="ltr">04</strong><span>${english ? 'Services for different profile needs' : 'خدمات لحالات الملف المختلفة'}</span></div><div><strong dir="ltr">3–5</strong><span>${english ? 'Business days · up to 14 in restricted cases' : 'أيام عمل · حتى 14 يوم عمل للحالات المقيّدة'}</span></div><a href="${prefix}/google-maps-projects/"><strong dir="ltr">${mapsProjects.length}</strong><span>${english ? 'Public work examples to explore' : 'نموذج عمل منشور يمكنك استكشافه'} ${icon('arrow', 'icon expert-arrow')}</span></a></div>
    </div></section>
    <nav class="expert-section-nav" aria-label="${english ? 'Explore this page' : 'تنقّل داخل الصفحة'}" data-expert-nav><div class="container">${links.map(([id, label], i) => `<a href="#${id}"${i === 0 ? ' aria-current="location"' : ''}><span dir="ltr">0${i + 1}</span>${esc(t(label))}</a>`).join('')}</div><div class="expert-reading-progress" aria-hidden="true"><span data-expert-progress></span></div></nav>
    ${renderGoogleMapsFoundation({ english, esc, icon })}
    <section class="expert-section expert-paths" id="choose-path" aria-labelledby="expert-path-title"><div class="container"><div class="expert-section-heading reveal"><div><span class="expert-kicker">${english ? '01 / Start where you are' : '01 / البداية من حالتك'}</span><h2 id="expert-path-title">${english ? 'Where does your profile stand?' : 'أين يقف ملفك الآن؟'}</h2></div><p>${english ? 'Choose the closest situation to see the service, its steps and what to prepare.' : 'اختر الحالة الأقرب لملفك؛ لتتعرف على الخدمة المناسبة، وخطواتها، وما تحتاج إلى تجهيزه.'}</p></div><div class="expert-path-selector reveal" data-expert-paths><div class="expert-path-tabs" role="tablist" aria-label="${english ? 'Choose the profile situation' : 'اختر حالة الملف التجاري'}" data-expert-tabs hidden>${paths.map((path, i) => `<button type="button" role="tab" id="expert-tab-${path.id}" aria-controls="path-${path.id}" aria-selected="${i === 0}" tabindex="${i ? -1 : 0}" data-expert-tab="${path.id}"><span class="expert-tab-number" dir="ltr">0${i + 1}</span>${icon(googleProfileOffers[i].icon)}<strong>${esc(t(path.label))}</strong><span class="expert-tab-arrow">${icon('arrow', 'icon expert-arrow')}</span></button>`).join('')}</div><div class="expert-path-panels">${pathPanels}</div></div><div class="expert-path-help"><span>${icon('search')} ${english ? 'Still unsure where to start?' : 'لم تتضح لك حالة الملف بعد؟'}</span><a href="${prefix}/google-business-profile-audit/">${english ? 'Try the initial free audit' : 'ابدأ بالفحص الأولي المجاني'} ${icon('arrow', 'icon expert-arrow')}</a></div></div></section>
    ${renderGoogleProfilePricing({ language: lang, site, esc, icon, button, headingText: english ? 'Your profile. A clear service price.' : 'خدمات ملفك التجاري، بأسعار واضحة.', eyebrowText: english ? '02 / Services and prices' : '02 / الخدمات والأسعار' })}
    ${renderGoogleMapsModels({ english, esc, icon })}
    <section class="expert-section expert-method" id="expert-method" aria-labelledby="expert-method-title"><div class="container"><div class="expert-section-heading reveal"><div><span class="expert-kicker">${english ? '04 / Explore the work journey' : '04 / رحلة عمل بخطوات مدروسة'}</span><h2 id="expert-method-title">${english ? 'Clarity at every step.' : 'وضوح في كل خطوة.'}</h2></div><p>${english ? 'The work begins with your actual case. Each stage prepares the next, from understanding the issue to following up on the result.' : 'نبدأ من واقع نشاطك وحالة ملفك. كل مرحلة تهيّئ لما بعدها، من فهم المشكلة إلى متابعة نتيجة الإجراء.'}</p></div><div class="expert-method-grid"><aside class="expert-person-card reveal"><div class="expert-person-top"><img src="${esc(profilePhoto)}" width="128" height="128" loading="lazy" decoding="async" alt="${english ? 'Eslam Elshikh' : 'إسلام الشيخ'}"><span>${icon('pin')} ${english ? 'Riyadh · Saudi Arabia' : 'الرياض · السعودية'}</span></div><span class="expert-kicker">${english ? 'Your profile, in context' : 'نقرأ الملف في سياقه'}</span><h3>${english ? 'Eslam Elshikh' : 'إسلام الشيخ'}</h3><p>${english ? 'Google Maps and Business Profile work connected with local SEO and website experience. The approach looks at how your information fits together, from business identity to the customer’s next step.' : 'خبرة عملية في خرائط جوجل والملفات التجارية، متصلة بالسيو المحلي وتجربة الموقع. أراجع ترابط المعلومات من هوية نشاطك إلى الخطوة التي يتخذها العميل.'}</p><ul><li>${icon('check')}${english ? 'Diagnosis before choosing the procedure' : 'تشخيص الحالة قبل اختيار الإجراء'}</li><li>${icon('check')}${english ? 'Clear scope, price and next steps' : 'نطاق وسعر وخطوات واضحة'}</li><li>${icon('check')}${english ? 'Public work you can review' : 'نماذج أعمال متاحة للمراجعة'}</li></ul><a href="${prefix}/about/">${english ? 'Meet Eslam' : 'تعرّف على إسلام'} ${icon('arrow', 'icon expert-arrow')}</a><a href="${esc(site.social.googleDeveloper)}" target="_blank" rel="noopener">${english ? 'Google developer profile' : 'الملف المهني على Google للمطورين'} ${icon('external')}</a></aside>${renderGoogleMapsJourney({ english, esc, icon })}</div></div></section>
    ${renderGoogleMapsStories({ english, mapsProjects, esc, icon })}
    ${renderGoogleMapsReading({ english, esc, icon })}
    <section class="expert-section expert-faq" id="expert-faq" aria-labelledby="expert-faq-title"><div class="container expert-faq-grid"><div class="expert-faq-intro reveal"><span class="expert-kicker">${english ? '06 / Before you begin' : '06 / قبل أن تبدأ'}</span><h2 id="expert-faq-title">${english ? 'A clear answer.<br>A confident next step.' : 'إجابة واضحة.<br>وخطوة بثقة.'}</h2><p>${english ? 'Service choice, requirements, timing and the scope of support — the details that help you get started.' : 'اختيار الخدمة، والمتطلبات، والمدة، ونطاق المتابعة؛ تفاصيل تساعدك على بدء العمل بفهم أوضح.'}</p>${button(contact, english ? 'Discuss my case' : 'ناقش حالتك', 'button-ghost', true)}</div>${faqBlock(googleMapsExpertFaq(english))}</div></section>
    ${renderGoogleMapsRequest({ english, site, esc, icon, button })}
    <section class="expert-closing"><div class="container"><div class="expert-closing-card reveal"><span class="expert-closing-pin" aria-hidden="true">${icon('pin')}</span><div><span class="expert-kicker">${english ? 'Your next step starts here' : 'خطوتك التالية تبدأ هنا'}</span><h2>${english ? 'Let’s find the right path<br>for your Business Profile.' : 'لنرتّب المسار المناسب<br>لملفك التجاري.'}</h2><p>${english ? 'Share your profile link and describe the situation. We will discuss the appropriate service and what to prepare.' : 'أرسل رابط الملف واشرح حالته، لنناقش الخدمة المناسبة وما تحتاج إلى تجهيزه للبدء.'}</p></div><div class="expert-closing-actions">${button('#expert-request', english ? 'Prepare my request' : 'جهّز طلبك الآن')}<a href="#choose-path">${english ? 'Back to the four paths' : 'العودة إلى المسارات الأربعة'} ${icon('arrow', 'icon expert-arrow')}</a></div></div></div></section>
  </div>`;
}
