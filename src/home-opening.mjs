import { renderHomeSignature } from './home-signature.mjs';

export const homeOpeningRevision = '2026-10-21';

function renderExpertiseRibbon({ english, esc, icon }) {
 const prefix = english ? '/en' : '';
 const items = [
  ['shield', '/services/cybersecurity/', 'أمن سيبراني', 'Cybersecurity'],
  ['code', '/services/web-development/', 'برمجة مواقع ومتاجر', 'Websites & e-commerce'],
  ['pin', '/google-expert/', 'خبير خرائط جوجل', 'Google Maps expert'],
  ['spark', '/services/ai-agents/', 'مطور وكلاء AI', 'AI agent developer'],
  ['megaphone', '/google-ads/', 'خبير إعلانات جوجل', 'Google Ads expert']
 ];
 const group = duplicate => `<div class="home-ticker-group" dir="${english ? 'ltr' : 'rtl'}"${duplicate ? ' aria-hidden="true"' : ''}>${items.map(([glyph, path, ar, en]) => `<a href="${prefix}${path}"${duplicate ? ' tabindex="-1"' : ''}>${icon(glyph)}<span>${esc(english ? en : ar).replace('AI', '<bdi dir="ltr">AI</bdi>')}</span><span class="home-ticker-divider" aria-hidden="true"></span></a>`).join('')}</div>`;
 return `<div class="home-ticker" data-home-ticker role="region" aria-label="${english ? 'My areas of expertise' : 'مجالات خبرتي'}"><button class="home-ticker-toggle" type="button" data-ticker-toggle aria-pressed="false" aria-label="${english ? 'Pause the moving expertise ribbon' : 'إيقاف الشريط المتحرك'}" hidden><span class="ticker-pause" aria-hidden="true"><svg viewBox="0 0 16 16" fill="currentColor"><rect x="4" y="3" width="2.5" height="10" rx="1"></rect><rect x="9.5" y="3" width="2.5" height="10" rx="1"></rect></svg></span><span class="ticker-play" aria-hidden="true"><svg viewBox="0 0 16 16" fill="currentColor"><path d="M5 3.5 12 8l-7 4.5z"></path></svg></span></button><div class="home-ticker-window" dir="ltr"><div class="home-ticker-track">${group(false)}${group(true)}${group(true)}</div></div></div>`;
}

function renderHomeJourney({ english, icon }) {
 const paths = [['services', 'code', 'الخدمات', 'Services'], [english ? 'work' : 'home-work', 'layers', 'الأعمال', 'Work'], [english ? 'about' : 'home-method', 'shield', 'منهج العمل', 'Approach'], [english ? 'faq' : 'home-faq', 'search', 'الأسئلة', 'Questions'], [english ? 'contact' : 'home-contact', 'arrow', 'نبدأ مشروعك', 'Let’s talk']];
 return `<nav class="home-journey-nav" data-home-journey aria-label="${english ? 'Explore this page' : 'تنقل داخل الصفحة الرئيسية'}"><div class="container home-journey-inner"><a class="home-journey-home" href="#home-opening" aria-label="${english ? 'Back to the opening' : 'العودة إلى بداية الصفحة'}"><span dir="ltr">ES.</span></a><div class="home-journey-links">${paths.map(([id, glyph, ar, en], i) => `<a href="#${id}" data-home-section="${id}"><span class="home-journey-number" aria-hidden="true" dir="ltr">0${i+1}</span>${icon(glyph)}<span>${english ? en : ar}</span></a>`).join('')}</div><a class="home-journey-book" href="${english ? '/en' : ''}/book/">${icon('clock')}<span>${english ? 'Book a consultation' : 'احجز استشارة'}</span></a></div></nav>`;
}

// Shared home opening: client value first, followed by evidence and clear routes.
export function renderHomeOpening({ english = false, site, button, profilePhoto, esc, icon }) {
 const prefix = english ? '/en' : '';
 const routes = english ? [
  ['code', 'web-development', 'Website or store', 'Design, development & security'],
  ['layers', 'crm-systems', 'CRM or business system', 'Custom CRM & working trials'],
  ['pin', 'local-seo', 'Search & Maps visibility', 'Search & Google Maps'],
 ] : [
  ['code', 'web-development', 'موقع أو متجر', 'تصميم وتطوير وأمان'],
  ['layers', 'crm-systems', 'نظام لإدارة أعمالك', 'CRM وتجارب مخصصة'],
  ['pin', 'local-seo', 'ظهور في البحث والخرائط', 'البحث وخرائط Google'],
 ];
 const statLabels = english ? ['Issuer-linked professional credentials', 'Selected evidence-led case studies', 'Public Google Maps examples', 'Web projects in the work registry'] : site.stats.map(stat => stat.label);
 return `<section class="hero section-pad home-opening home-magic${english ? ' hero-en' : ''}" id="home-opening" data-home-opening>
  <div class="home-atmosphere" aria-hidden="true"><span class="home-orbit home-orbit-one"></span><span class="home-orbit home-orbit-two"></span><span class="home-orbit-point"></span></div>
  <div class="container hero-grid">
   <div class="hero-copy reveal">
    <p class="home-hero-kicker"><span aria-hidden="true"></span>${english ? 'DIGITAL ENGINEERING, SHAPED AROUND YOUR BUSINESS' : 'هندسة رقميّة تبدأ من طموحك'}</p>
    <h1><span class="home-hero-name">${english ? 'Eng. Eslam Elshikh' : 'المهندس إسلام الشيخ'}</span> <span class="home-hero-promise">${english ? 'A presence that persuades.<br><em>Systems that get things done.</em>' : 'أصنعُ لعملك حضورًا يُقنع،<br><em>وأنظمةً تُنجز.</em>'}</span></h1>
    <p class="hero-lead">${english ? `I build <a class="home-service-link" href="${prefix}/services/web-development/">websites, stores</a> and systems around your business. <a class="home-service-link" href="${prefix}/services/google-business-profile/">Google Business Profile services</a> and <a class="home-service-link" href="${prefix}/services/seo/">SEO</a> help customers find you.` : `أصمّم وأبرمج <a class="home-service-link" href="${prefix}/services/web-development/">مواقع ومتاجر</a> وأنظمة تناسب طريقة عملك. وأساعد عملاءك على الوصول إليك عبر <a class="home-service-link" href="${prefix}/services/google-business-profile/">خدمات ملفات Google التجارية</a> و<a class="home-service-link" href="${prefix}/services/seo/">تحسين محركات البحث</a>.`}</p>
    <p class="hero-support">${english ? 'Based in Riyadh. A clear scope, delivery in stages and work you can review.' : 'من الرياض، أبدأ بفهم أعمالك؛ ثم نحوّل احتياجك إلى نطاقٍ واضح، وتنفيذٍ متدرّج، وتسليمٍ يمكنك مراجعته.'}</p>
    <nav class="home-quick-routes" aria-label="${english ? 'Choose a starting point for your project' : 'اختر نقطة البداية لمشروعك'}">${routes.map(([glyph, slug, title, detail]) => `<a href="${slug === 'local-seo' ? `${prefix}/local-seo/riyadh/` : `${prefix}/services/${slug}/`}">${icon(glyph)}<span><strong>${esc(title)}</strong><small>${esc(detail)}</small></span>${icon('arrow')}</a>`).join('')}</nav>
    <div class="hero-actions">${button(`${prefix}/contact/`, english ? 'Discuss your project' : 'ناقش مشروعك معي')}${button(`${prefix}/projects/`, english ? 'Explore the work' : 'شاهد الأعمال المنفّذة', 'button-ghost')}</div>
    <a class="home-trial-link" href="${prefix}/services/crm-systems/#crm-personal-trial"><span class="home-trial-icon">${icon('layers')}</span><span><strong>${english ? 'Picture a system with your business identity.' : 'تصوّر نظامًا يحمل هوية منشأتك.'}</strong><small>${english ? 'Add your name and logo. Explore how a sample request moves through your team.' : 'ضع اسمك وشعارك، واستكشف كيف ينتقل الطلب بين أعضاء فريقك.'}</small></span>${icon('arrow')}</a>
    <div class="hero-trust"><a href="${site.googleMapsProfile}" target="_blank" rel="noopener"><span class="trust-dot trust-google"></span>${english ? 'Google Business Profile' : 'ملفي التجاري على Google'}</a><a href="${site.social.googleDeveloper}" target="_blank" rel="noopener"><span class="trust-dot"></span>${english ? 'Google Developer Profile' : 'ملفي على Google للمطورين'}</a></div>
   </div>
   ${renderExpertiseRibbon({ english, esc, icon })}
   ${renderHomeSignature({ english, site, portrait: profilePhoto, esc, icon })}
  </div>
  <div class="container stats-bar reveal">${site.stats.map((stat, index) => `<a href="${prefix}${['/credentials/', '/credentials/#selected-evidence', '/google-maps-projects/', '/work-evidence/'][index]}"><strong dir="ltr">${esc(stat.value)}</strong><span>${esc(statLabels[index])}</span></a>`).join('')}</div>
  <p class="container stats-note">${english ? 'Credentials link to issuer records. Project and Maps figures describe published portfolio entries, not unique clients or search-indexed pages.' : 'الشهادات مرتبطة بسجلات الجهات المانحة؛ وأرقام المواقع والخرائط تصف نماذج المعرض، وليست عدد عملاء مستقلين أو صفحات مفهرسة.'}</p>
 </section>${renderHomeJourney({ english, icon })}`;
}
