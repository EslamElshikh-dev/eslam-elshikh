// Shared home opening: client value first, followed by evidence and clear routes.
export function renderHomeOpening({ english = false, site, button, studioVisual, esc, icon }) {
 const prefix = english ? '/en' : '';
 const routes = english ? [
  ['code', 'web-development', 'A website that earns attention', 'Design, development & security'],
  ['layers', 'crm-systems', 'A clearer way to run your business', 'Custom CRM & working trials'],
  ['pin', 'local-seo', 'A presence customers can find', 'Search & Google Maps'],
 ] : [
  ['code', 'web-development', 'موقعٌ يعكس قيمة عملك', 'تصميم وتطوير وأمان'],
  ['layers', 'crm-systems', 'نظامٌ يجمع تفاصيل أعمالك', 'CRM وتجارب مخصصة'],
  ['pin', 'local-seo', 'حضورٌ يصل إليه عملاؤك', 'البحث وخرائط Google'],
 ];
 const statLabels = english ? ['Google Business Profiles supported through verification', 'Business profile issues resolved', 'Public Google Maps examples', 'Web projects in the work registry'] : site.stats.map(stat => stat.label);
 return `<section class="hero section-pad home-opening${english ? ' hero-en' : ''}">
  <div class="container hero-grid">
   <div class="hero-copy reveal">
    <p class="home-hero-kicker"><span aria-hidden="true"></span>${english ? 'DIGITAL ENGINEERING, SHAPED AROUND YOUR BUSINESS' : 'هندسة رقميّة تبدأ من طموحك'}</p>
    <h1><span class="home-hero-name">${english ? 'Eng. Eslam Elshikh' : 'المهندس إسلام الشيخ'}</span><span class="home-hero-promise">${english ? 'A presence that persuades.<br><em>Systems that get things done.</em>' : 'أصنعُ لعملك حضورًا يُقنع،<br><em>وأنظمةً تُنجز.</em>'}</span></h1>
    <p class="hero-lead">${english ? 'Thoughtful websites, custom CRM systems and a considered presence in search and Google Maps. I bring development, cybersecurity and user experience together around what your business needs.' : 'مواقعٌ متقنة، وأنظمة CRM تُصمَّم حول فريقك، وحضورٌ مدروس في البحث وخرائط Google. أجمع التطوير والأمن السيبراني وتجربة المستخدم في حلولٍ تخدم احتياج منشأتك.'}</p>
    <p class="hero-support">${english ? 'Based in Riyadh. A clear scope, delivery in stages and work you can review.' : 'من الرياض، أبدأ بفهم أعمالك؛ ثم نحوّل احتياجك إلى نطاقٍ واضح، وتنفيذٍ متدرّج، وتسليمٍ يمكنك مراجعته.'}</p>
    <div class="hero-actions">${button(`${prefix}/contact/`, english ? 'Discuss your project' : 'ناقش مشروعك معي')}${button(`${prefix}/projects/`, english ? 'Explore the work' : 'شاهد الأعمال المنفّذة', 'button-ghost')}</div>
    <a class="home-trial-link" href="${prefix}/services/crm-systems/#crm-demo-company"><span class="home-trial-icon">${icon('layers')}</span><span><strong>${english ? 'What would a CRM change for your team?' : 'كيف يُغيّر CRM طريقة عمل فريقك؟'}</strong><small>${english ? 'Try a sample request from entry to follow-up.' : 'اختبر طلبًا تجريبيًا، من تسجيله إلى متابعته.'}</small></span>${icon('arrow')}</a>
    <div class="hero-trust"><a href="${site.googleMapsProfile}" target="_blank" rel="noopener"><span class="trust-dot trust-google"></span>${english ? 'Google Business Profile' : 'ملفي التجاري على Google'}</a><a href="${site.social.googleDeveloper}" target="_blank" rel="noopener"><span class="trust-dot"></span>${english ? 'Google Developer Profile' : 'ملفي على Google للمطورين'}</a></div>
   </div>
   ${studioVisual(english ? 'en' : 'ar')}
  </div>
  <nav class="container home-starting-points" aria-label="${english ? 'Choose a starting point for your project' : 'اختر نقطة البداية لمشروعك'}"><div class="home-route-intro"><span dir="ltr">01 — 03</span><p>${english ? 'Where should<br>your next step begin?' : 'لكلّ طموحٍ<br><strong>نقطةُ بداية.</strong>'}</p></div>${routes.map(([glyph, slug, title, detail], index) => `<a href="${slug === 'local-seo' ? `${prefix}/local-seo/riyadh/` : `${prefix}/services/${slug}/`}"><span class="home-route-number" dir="ltr">0${index + 1}</span><span class="home-route-copy"><strong>${esc(title)}</strong><small>${esc(detail)}</small></span>${icon(glyph)}${icon('arrow')}</a>`).join('')}</nav>
  <div class="container stats-bar reveal">${site.stats.map((stat, index) => `<div><strong>${esc(stat.value)}</strong><span>${esc(statLabels[index])}</span></div>`).join('')}</div>
  <p class="container stats-note">${english ? 'Experience figures updated through September 2026. Public examples are available in the projects and Google Maps work sections.' : 'أرقام خبرة محدثة حتى سبتمبر 2026؛ ويمكن مراجعة النماذج العامة المنشورة في قسمي الأعمال وخرائط Google.'}</p>
 </section>`;
}
