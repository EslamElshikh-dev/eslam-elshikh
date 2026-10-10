import { products, productText } from './products.mjs';

const experiences = {
  'sama-scan-control-center': { brand: ['سما سكان', 'Sama Scan'], field: ['المراكز الصحية', 'Healthcare centers'], focus: ['الطلبات والمواعيد', 'Requests & appointments'], sector: 'health', icon: 'user' },
  'alargan-crm': { brand: ['الأرجان', 'ALARGAN'], field: ['العقارات', 'Real estate'], focus: ['العميل والفرصة', 'Customers & opportunities'], sector: 'company', icon: 'briefcase' },
  'tawod-control-center': { brand: ['تعاود', 'Tawod'], field: ['المقاولات والخدمات', 'Contracting & services'], focus: ['التسويق والمبيعات', 'Marketing & sales'], sector: 'contracting', icon: 'nodes' },
  'kermez-control-center': { brand: ['كرمز', 'Kermez'], field: ['المقاهي والمطاعم', 'Cafes & restaurants'], focus: ['المنيو والتشغيل', 'Menu & operations'], sector: 'shop', icon: 'layers' },
  'alya-catalog-control': { brand: ['عليا', 'Alya'], field: ['التجارة والمنتجات', 'Retail & products'], focus: ['كتالوج المنتجات', 'Product catalog'], sector: 'shop', icon: 'layers' }
};

export function renderCrmShowcase({ english = false, esc, icon }) {
  const text = value => productText(value, english);
  const label = value => value[english ? 1 : 0];
  const number = n => String(n).padStart(2, '0');
  const prefix = english ? '/en' : '';
  const screens = products.reduce((total, product) => total + product.tour.length, 0);

  return `<section class="section-pad crm-showcase" id="crm-experiences" data-crm-showcase>
    <div class="container">
      <div class="crm-showcase-heading">
        <div><p class="crm-kicker" dir="ltr">CRM / EXPERIENCE GALLERY</p><h2>${english ? 'See the system.<br><em>Understand the workflow.</em>' : 'شوف النظام.<br><em>وافهم طريقة عمله.</em>'}</h2></div>
        <div><p>${english ? 'Choose a business close to yours. Explore its screens, inspect the details, then shape a trial for your team.' : 'اختر النشاط الأقرب لك، تنقّل بين الواجهات وكبّر التفاصيل. وبعد الجولة، ابدأ بتخصيص تجربة لفريقك.'}</p><dl class="crm-showcase-counts"><div><dt>${english ? 'Experiences' : 'تجارب مختلفة'}</dt><dd dir="ltr">${number(products.length)}</dd></div><div><dt>${english ? 'Interface views' : 'واجهات للاستكشاف'}</dt><dd dir="ltr">${number(screens)}</dd></div></dl></div>
      </div>
      <div class="crm-showcase-picker-heading"><span>${english ? '01 / CHOOSE YOUR BUSINESS' : '01 / اختر النشاط'}</span><span data-showcase-picker-hint hidden>${english ? 'Swipe to explore all five' : 'اسحب لاستكشاف التجارب الخمس'} ${icon('arrow')}</span></div>
      <div class="crm-showcase-picker" data-showcase-tabs aria-label="${english ? 'CRM experiences by business' : 'تجارب الأنظمة حسب النشاط'}">
        ${products.map((product, index) => {
          const item = experiences[product.slug];
          return `<button type="button" class="crm-showcase-tab" id="crm-choice-${product.slug}" data-showcase-tab="${product.slug}" aria-controls="crm-tour-${product.slug}"><span class="crm-showcase-tab-top"><span class="crm-showcase-tab-icon">${icon(item.icon)}</span><span class="crm-showcase-tab-number" dir="ltr">${number(index + 1)}</span></span><strong>${esc(label(item.brand))}</strong><span class="crm-showcase-tab-field">${esc(label(item.field))}</span><span class="crm-showcase-tab-focus">${esc(label(item.focus))}${icon('arrow')}</span></button>`;
        }).join('')}
      </div>
      <div class="crm-showcase-panels">
        ${products.map(product => {
          const item = experiences[product.slug];
          const href = `${prefix}/products/${product.slug}/`;
          return `<section class="crm-showcase-panel" id="crm-tour-${product.slug}" data-showcase-panel="${product.slug}" aria-labelledby="crm-choice-${product.slug}">
            <div class="crm-showcase-meta"><span dir="ltr">${esc(product.code)}</span><span class="crm-showcase-stage${product.stage === 'concept' ? ' is-concept' : ''}"><i aria-hidden="true"></i>${product.stage === 'concept' ? english ? 'Interactive concept' : 'تصوّر تفاعلي' : english ? 'Implemented custom system' : 'نظام مخصص منفّذ'}</span></div>
            <div class="crm-showcase-grid">
              <div class="crm-showcase-context"><p class="crm-kicker">${esc(label(item.field))}</p><h3>${esc(text(product.name))}</h3><p>${esc(text(product.description))}</p><div class="crm-showcase-audience">${icon('user')}<p>${esc(text(product.audience))}</p></div><div class="crm-showcase-actions"><a class="button" href="#crm-personal-trial" data-showcase-trial="${item.sector}" data-showcase-reference="${esc(text(product.name))}">${english ? 'Shape a similar trial' : 'أريد تجربة مشابهة'}${icon('arrow')}</a><a class="crm-text-link" href="${href}">${english ? 'Explore the complete project' : 'تفاصيل التجربة كاملة'}${icon('layers')}</a></div></div>
              <div class="crm-showcase-viewer">
                <div class="crm-showcase-scenes" data-showcase-scenes aria-label="${english ? 'Choose an interface view' : 'اختر الواجهة'}">${product.tour.map(scene => `<button type="button" id="crm-view-${product.slug}-${scene.id}" data-showcase-scene-tab="${scene.id}" aria-controls="crm-scene-${product.slug}-${scene.id}">${esc(text(scene.label))}</button>`).join('')}</div>
                <div class="crm-showcase-window"><div class="crm-showcase-window-bar"><span class="crm-showcase-window-dots" aria-hidden="true"><i></i><i></i><i></i></span><span dir="ltr">${esc(product.code.split(' / ')[0])} / WORKSPACE</span><span class="crm-showcase-counter" data-showcase-counter dir="ltr">01 / ${number(product.tour.length)}</span></div>
                  ${product.tour.map(scene => `<div class="crm-showcase-scene" id="crm-scene-${product.slug}-${scene.id}" data-showcase-scene="${scene.id}" aria-labelledby="crm-view-${product.slug}-${scene.id}"><figure><a href="${scene.image}" data-showcase-image aria-label="${esc(english ? `Enlarge ${text(scene.label)}` : `تكبير ${text(scene.label)}`)}"><img src="${scene.image}" width="${['kermez', 'alya'].includes(product.theme) ? 1348 : 1200}" height="${['kermez', 'alya'].includes(product.theme) ? 926 : 750}" loading="lazy" decoding="async" alt="${esc(`${text(product.name)} — ${text(scene.label)}`)}"><span class="crm-showcase-image-action" aria-hidden="true">${icon('search')}${english ? 'Inspect the interface' : 'كبّر الواجهة'}</span></a></figure><div class="crm-showcase-scene-notes"><h4>${esc(text(scene.title))}</h4><p>${esc(text(scene.text))}</p><ul>${scene.points.map(point => `<li>${icon('check')}${esc(text(point))}</li>`).join('')}</ul></div></div>`).join('')}
                </div>
                <div class="crm-showcase-view-controls" data-showcase-view-controls hidden><button type="button" data-showcase-prev>${icon('arrow')}<span>${english ? 'Previous view' : 'الواجهة السابقة'}</span></button><span>${english ? '02 / EXPLORE THE INTERFACE' : '02 / استكشف الواجهة'}</span><button type="button" data-showcase-next><span>${english ? 'Next view' : 'الواجهة التالية'}</span>${icon('arrow')}</button></div>
              </div>
            </div>
            <div class="crm-showcase-workflow"><p>${english ? 'THE WORKFLOW / FROM REQUEST TO NEXT ACTION' : 'مسار العمل / من البداية إلى الخطوة القادمة'}</p><ol>${product.workflow.map((step, index) => `<li><span dir="ltr">${number(index + 1)}</span><strong>${esc(text(step))}</strong></li>`).join('')}</ol></div>
            <details class="crm-showcase-scope"><summary>${english ? 'Delivery scope and connections' : 'نطاق التجربة والربط'}<span aria-hidden="true">+</span></summary><p>${esc(text(product.scope))}</p><a class="crm-text-link" href="${href}#crm-answers">${english ? 'Practical questions and answers' : 'أسئلة وإجابات عن التجربة'}${icon('arrow')}</a></details>
          </section>`;
        }).join('')}
      </div>
    </div>
    <dialog class="crm-showcase-lightbox" data-showcase-lightbox aria-labelledby="crm-lightbox-title">
      <div class="crm-showcase-lightbox-head"><div><span data-showcase-lightbox-brand dir="ltr"></span><h3 id="crm-lightbox-title"></h3></div><form method="dialog"><button type="submit" aria-label="${english ? 'Close interface preview' : 'إغلاق معاينة الواجهة'}"><span aria-hidden="true">×</span></button></form></div>
      <div class="crm-showcase-lightbox-viewport" data-showcase-lightbox-viewport dir="ltr" tabindex="0"><img data-showcase-lightbox-image width="1200" height="750" alt="" draggable="false"></div>
      <div class="crm-showcase-lightbox-tools"><button type="button" data-showcase-lightbox-prev aria-label="${english ? 'Previous interface' : 'الواجهة السابقة'}">${icon('arrow')}</button><span data-showcase-lightbox-count dir="ltr"></span><button type="button" data-showcase-lightbox-next aria-label="${english ? 'Next interface' : 'الواجهة التالية'}">${icon('arrow')}</button><button type="button" data-showcase-zoom aria-pressed="false">${icon('search')}<span>${english ? 'Actual size' : 'الحجم الأصلي'}</span></button></div>
      <p>${english ? 'Switch views, or use actual size and scroll to inspect the details.' : 'بدّل الواجهة، أو اختر الحجم الأصلي وحرّك مساحة العرض لقراءة التفاصيل.'}</p>
    </dialog>
  </section>`;
}
