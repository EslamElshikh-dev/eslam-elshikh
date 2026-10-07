import { crmSectors } from './crm-lab.mjs';
import { scenarios } from './crm-rehearsal.mjs';

export function renderCrmServicePreview({ english = false, esc, icon }) {
 const t = value => value[english ? 'en' : 'ar'];
 const prefix = english ? '/en' : '';
 const labels = english ? ['Record the request', 'Assign an owner', 'Define the next action'] : ['سجّل الطلب', 'عيّن المسؤول', 'حدّد المتابعة'];
 const descriptions = english ? [
  'A clear request gives the team context to return to.',
  'A proposed role makes the handoff and responsibility visible.',
  'An explicit action clarifies what comes next. Set sample timing in the simulation.',
 ] : [
  'طلبٌ واضح يمنح الفريق سياقًا يعود إليه عند المتابعة.',
  'دورٌ مقترح يُظهر لمن تنتقل المهمة ومن يتابعها.',
  'إجراءٌ محدد يوضح الخطوة القادمة. اختبر تحديد موعدها داخل المحاكاة.',
 ];
 return `<div class="service-card-visual crm-service-preview" id="crm-service-preview" data-crm-service-preview>
  <div class="service-visual-head"><span>YOUR BUSINESS / ONE CLEAR WORKFLOW</span><span>${english ? 'SAMPLE SCENARIO' : 'سيناريو تجريبي'}</span></div>
  <div class="service-preview-intro"><h4>${english ? 'See the task take shape.' : 'شاهد المهمة حين تتّضح.'}</h4><p>${english ? 'Choose a business context. Explore the request, its owner and its next action.' : 'اختر طبيعة نشاطك. واستكشف الطلب، ومن يتسلّمه، وخطوته القادمة.'}</p></div>
  <div class="service-preview-tools" data-crm-service-tools hidden><label class="service-preview-sector"><span>${english ? 'Business type in this preview' : 'نوع النشاط في المعاينة'}</span><select data-crm-service-sector>${crmSectors.map(sector => `<option value="${sector.id}">${esc(t(sector.name))}</option>`).join('')}</select></label><div class="service-preview-steps" role="group" aria-label="${english ? 'Sample workflow scenes' : 'مشاهد مسار الطلب التجريبي'}">${labels.map((label, i) => `<button type="button" data-crm-service-step="${i}" aria-pressed="${i === 0}"><span dir="ltr">0${i + 1}</span><strong>${label}</strong></button>`).join('')}</div></div>
  <div class="service-preview-panels">${crmSectors.map((sector, i) => {
   const example = scenarios[sector.id];
   const scenes = [
    [english ? 'THE REQUEST' : 'الطلب', t(example.request), 'layers'],
    [english ? 'A PROPOSED OWNER' : 'مسؤول مقترح', t(sector.roles[1]), 'user'],
    [english ? 'THE NEXT ACTION' : 'الخطوة القادمة', t(example.action), 'check'],
   ];
   return `<div data-crm-service-panel="${sector.id}" data-crm-service-name="${esc(t(sector.name))}" data-crm-service-href="${prefix}/services/crm-systems/#crm-demo-${sector.id}"${i ? ' hidden' : ''}><div class="service-preview-context">${icon(sector.icon)}<div><strong>${esc(t(sector.name))}</strong><span>${esc(t(sector.focus))}</span></div><span class="service-preview-sample">${english ? 'Sample' : 'مثال'}</span></div><div class="service-preview-story">${scenes.map(([label, value, glyph], step) => `<div class="service-preview-scene" data-crm-service-scene="${step}"${step ? ' hidden' : ''}><span class="service-preview-scene-code"><span dir="ltr">0${step + 1} / 03</span>${label}</span><div class="service-preview-scene-value">${icon(glyph)}<p>${esc(value)}</p></div><p class="service-preview-scene-benefit">${descriptions[step]}</p></div>`).join('')}</div><details class="service-preview-question"><summary>${esc(t(example.question))}<span aria-hidden="true">+</span></summary><p>${esc(t(example.answer))}</p></details></div>`;
  }).join('')}</div>
  <a class="service-preview-launch" data-crm-service-launch href="${prefix}/services/crm-systems/#crm-demo-company" aria-label="${english ? 'Try the workflow simulation: Company' : 'اختبر محاكاة المسار: شركة'}">${english ? 'Try the workflow yourself' : 'اختبر المسار بنفسك'}${icon('arrow')}</a>
  <p class="service-preview-note">${english ? 'Sample information. Your working custom trial follows an agreed scope.' : 'معلومات أمثلة. تجربتك الفعلية المخصصة تبدأ بنطاقٍ نتفق عليه.'}</p>
  <p class="sr-only" data-crm-service-status role="status" aria-live="polite"></p>
  <noscript><div class="service-preview-fallback">${crmSectors.map(sector => `<a href="${prefix}/services/crm-systems/#crm-demo-${sector.id}">${esc(t(sector.name))}</a>`).join('')}</div></noscript>
 </div>`;
}
