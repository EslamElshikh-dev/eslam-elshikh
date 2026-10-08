(() => {
 'use strict';
 const root = document.querySelector('[data-crm-campaign]');
 if (!root) return;
 const en = document.documentElement.lang === 'en';
 const t = (ar, english) => en ? english : ar;
 const track = name => window.esAnalytics?.track(name, { service: 'crm-systems', placement: 'content' });
 const name = root.querySelector('[data-crm-campaign-name]');
 const brand = root.querySelector('[data-crm-campaign-brand]');
 const company = root.querySelector('[data-crm-brief-company]');
 const buttons = [...root.querySelectorAll('[data-crm-campaign-step]')];
 const stages = [
  [t('استفسار جديد','New enquiry'),t('بانتظار التعيين','Awaiting assignment'),t('مراجعة الاحتياج','Review the need'),t('يُحدد مع المسؤول','To be agreed with the owner'),t('طلب العميل يصبح سجلًا يمكن الرجوع إليه. الخطوة القادمة: مراجعة الاحتياج وتحديد المسؤول.','The enquiry becomes a record your team can return to. Next: review the need and assign an owner.')],
  [t('مسؤول الطلب محدد','Owner assigned'),t('مسؤول المبيعات · مثال','Sales owner · example'),t('تنسيق معاينة المساحة','Arrange a site visit'),t('يُحدد مع العميل','To be agreed with the customer'),t('ظهر المسؤول عن الطلب، ومعه سياق المهمة والخطوة المطلوب تنسيقها.','The owner can see the request context and the next task to arrange.')],
  [t('العرض قيد المتابعة','Quote in follow-up'),t('مسؤول المبيعات · مثال','Sales owner · example'),t('مراجعة العرض مع العميل','Review the quote with the customer'),t('يوم العمل التالي · مثال','Next working day · example'),t('بعد توثيق المعاينة والعرض، تتحدد المتابعة وموعدها. تتضح الخطوة التي يحتاجها الفريق.','After recording the visit and quote, follow-up has an action and timing.')],
  [t('بانتظار قرار العميل','Awaiting the customer’s decision'),t('مسؤول المبيعات · مثال','Sales owner · example'),t('مراجعة العرض مع العميل','Review the quote with the customer'),t('يوم العمل التالي · مثال','Next working day · example'),t('من سجل واحد، تستطيع مراجعة المرحلة والمسؤول والمتابعة. وضوح الصورة يعتمد على تحديث الفريق للبيانات.','One record shows the stage, owner and next action. Its accuracy depends on the team keeping it updated.')]
 ];
 let started = false, completed = false;
 const show = index => {
  const values = stages[index];
  if (!values) return;
  buttons.forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.crmCampaignStep) === index)));
  ['stage','owner','action','due','explanation'].forEach((key,i) => root.querySelector(`[data-crm-campaign-${key}]`).textContent = values[i]);
  root.querySelector('[data-crm-campaign-handoff]').hidden = index !== 3;
  root.querySelector('[data-crm-campaign-announcement]').textContent = `${values[0]}. ${values[4]}`;
  if (!started) { started = true; track('crm_preview_start'); }
  if (index === 3 && !completed) { completed = true; track('crm_preview_complete'); }
 };
 buttons.forEach((button, index) => {
  button.addEventListener('click', () => show(index));
  button.addEventListener('keydown', event => {
   if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
   event.preventDefault();
   let next = index;
   if (event.key === 'Home') next = 0;
   else if (event.key === 'End') next = buttons.length - 1;
   else next = (index + (event.key === (en ? 'ArrowRight' : 'ArrowLeft') ? 1 : -1) + buttons.length) % buttons.length;
   buttons[next].focus(); show(next);
  });
 });
 root.querySelector('[data-crm-campaign-controls]').hidden = false;
 const updateBrand = value => brand.textContent = value.trim() || t('مساحة عمل شركتك','Your business workspace');
 name.addEventListener('input', () => { updateBrand(name.value); if (!company.dataset.edited) company.value = name.value; });
 company.addEventListener('input', () => { company.dataset.edited = 'true'; name.value = company.value; updateBrand(company.value); });
 const form = root.querySelector('[data-crm-campaign-form]');
 const messagePanel = root.querySelector('[data-crm-campaign-message]');
 const messageText = root.querySelector('[data-crm-campaign-message-text]');
 const whatsapp = root.querySelector('[data-crm-campaign-whatsapp]');
 const whatsappBase = whatsapp.href;
 const prepareMessage = () => {
  if (!form.checkValidity()) { messagePanel.hidden = true; return; }
  const sector = root.querySelector('[data-crm-brief-sector]').value;
  const need = root.querySelector('[data-crm-brief-need]').value.trim();
  const team = root.querySelector('[data-crm-brief-team]').value;
  if (!company.value.trim() || !need) { messagePanel.hidden = true; return; }
  const lines = [t('السلام عليكم، أبغى أناقش تجربة CRM مخصصة لمنشأتنا في الرياض.','Hello, I would like to discuss a custom CRM trial for our Riyadh business.'), `${t('المنشأة','Business')}: ${company.value.trim()}`, `${t('النشاط','Business type')}: ${sector}`, ...(team ? [`${t('عدد متابعي العملاء','People following up')}: ${team}`] : []), `${t('الاحتياج','Need')}: ${need}`, t('أرغب بمراجعة مسار الفريق ونطاق التجربة وشروطها.','I would like to review the team workflow, trial scope and commercial terms.')];
  messageText.value = lines.join('\n');
  const url = new URL(whatsappBase); url.searchParams.set('text', messageText.value); whatsapp.href = url.href;
  messagePanel.hidden = false;
 };
 form.addEventListener('submit', event => {
  event.preventDefault(); prepareMessage();
  if (messagePanel.hidden) return;
  track('crm_brief_prepared');
  messageText.focus({ preventScroll: true });
  messagePanel.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
 });
 form.addEventListener('input', () => { if (!messagePanel.hidden) prepareMessage(); });
 form.addEventListener('change', () => { if (!messagePanel.hidden) prepareMessage(); });
 form.hidden = false;
})();
