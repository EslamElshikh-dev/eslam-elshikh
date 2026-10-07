const pair = (ar, en) => ({ ar, en });
const scenarios = {
 company: {
  request: pair('استفسار تجريبي عن خدمة الشركة', 'Sample enquiry about a company service'),
  action: pair('مراجعة الاحتياج وتجهيز الخطوة التالية', 'Review the need and prepare the next step'),
  question: pair('كيف أعرف من يتابع كل فرصة؟', 'How do I know who owns each opportunity?'),
  answer: pair('يرتبط كل طلب بمسؤول وخطوة قادمة، ويحتفظ سجل المتابعة بسياق العمل. في التجربة المخصصة نختبر مع فريقك توزيع الفرص والمراحل التي تناسب مبيعاتك.', 'Each request has an owner and a next action, while the activity record keeps its context. Your custom trial tests opportunity assignment and the stages that fit your sales process.'),
 },
 shop: {
  request: pair('استفسار تجريبي عن توفر منتج', 'Sample product availability enquiry'),
  action: pair('مراجعة التوفر والرد على الاستفسار', 'Check availability and reply to the enquiry'),
  question: pair('كيف أربط استفسار العميل بالمنتج؟', 'How can a customer enquiry stay connected to a product?'),
  answer: pair('نجمع الاحتياج والمنتج والمسؤول وحالة المتابعة في مسار واضح. نحدد في التجربة المخصصة ما إذا كنت تحتاج إدارة منتجات أو ربط طلبات أو تكاملًا مع متجرك.', 'Keep the need, product, owner and follow-up status in one clear workflow. The custom trial defines whether you need product management, order connections or an integration with your store.'),
 },
 pharmacy: {
  request: pair('استفسار إداري تجريبي عن خدمة الصيدلية', 'Sample administrative pharmacy service enquiry'),
  action: pair('مراجعة الاستفسار مع الفريق المختص', 'Review the enquiry with the appropriate team'),
  question: pair('ما الذي يجربه فريق الصيدلية هنا؟', 'What can pharmacy staff try here?'),
  answer: pair('تنظيم الاستفسار الإداري وإسناده وتوثيق الخطوة القادمة ببيانات اختبار. نناقش المتطلبات التخصصية والتكاملات الصحية في نطاق مستقل قبل إدراجها في التجربة الفعلية.', 'Organize an administrative enquiry, assign it and record the next action using test data. Specialist requirements and health integrations need a separate agreed scope before inclusion in the working trial.'),
 },
 health: {
  request: pair('طلب موعد تجريبي للاستقبال', 'Sample appointment enquiry for reception'),
  action: pair('مراجعة الموعد مع فريق الاستقبال', 'Review the appointment with reception'),
  question: pair('كيف تساعد التجربة فريق الاستقبال؟', 'How does the trial help reception staff?'),
  answer: pair('توضح انتقال طلب الموعد بين الاستقبال والمسؤول عن المتابعة، مع توثيق الخطوة التالية. هذه محاكاة إدارية؛ التجربة المخصصة تعتمد المهام والصلاحيات والربط المطلوب لكل منشأة.', 'It shows how an appointment enquiry moves between reception and the follow-up owner, with a recorded next action. This is an administrative simulation; your custom trial agrees the tasks, permissions and connections for your organization.'),
 },
 contracting: {
  request: pair('طلب معاينة تجريبي لخدمة مقاولات', 'Sample site-visit request for a contracting service'),
  action: pair('تنسيق المعاينة وتوثيق متطلبات العميل', 'Arrange the site visit and record the requirements'),
  question: pair('كيف أتابع الطلب من المعاينة إلى العرض؟', 'How can I follow a request from a site visit to a quote?'),
  answer: pair('نحدد مسؤول الطلب ونوثق المعاينة والخطوة القادمة، ثم نربطها بمراحل العرض والمتابعة. تختبر التجربة المخصصة هذا المسار وفق خدماتك وأدوار فريقك الفعلية.', 'Assign an owner, record the visit and next action, then connect them to quotation and follow-up stages. Your custom trial tests that workflow against your services and actual team roles.'),
 },
 other: {
  request: pair('طلب تجريبي من عميل النشاط', 'Sample customer request'),
  action: pair('تحديد الخطوة القادمة مع الفريق', 'Agree the next action with the team'),
  question: pair('هل يمكن تغيير هذا المسار لطبيعة نشاطي؟', 'Can this workflow be adapted to my business?'),
  answer: pair('نبدأ بمهمة يكررها فريقك، ثم نحدد البيانات والأدوار والمراحل اللازمة لإنجازها. التجربة الفعلية تُبنى على متطلباتك المعتمدة، بما يشمل الوحدات والربط الذي تحتاجه.', 'Start with a task your team repeats, then define the information, roles and stages needed to complete it. The working trial follows your agreed requirements, including the modules and connections you need.'),
 },
};

export function renderCrmRehearsalInvite(sector, { english = false, esc, icon }) {
 const t = value => value[english ? 'en' : 'ar'];
 const data = scenarios[sector.id];
 return `<div class="crm-rehearsal-invite">
  <p class="crm-rehearsal-eyebrow" dir="ltr">ONE REQUEST. A CLEAR NEXT STEP.</p>
  <h4>${english ? 'Try the task. See the handoff.' : 'جرّب المهمة. وشوف كيف تنتقل.'}</h4>
  <p>${english ? 'Record a sample request, assign an owner and choose its next action.' : 'سجّل طلبًا تجريبيًا، وعيّن المسؤول، وحدّد خطوة المتابعة.'}</p>
  <button type="button" class="crm-rehearsal-launch" id="crm-demo-${sector.id}" data-crm-rehearse data-demo-request="${esc(t(data.request))}" data-demo-action="${esc(t(data.action))}" aria-haspopup="dialog" aria-controls="crm-task-dialog" hidden>${english ? 'Try this workflow' : 'اختبر المسار بنفسك'}${icon('arrow')}</button>
  <details class="crm-context-question"><summary>${esc(t(data.question))}<span aria-hidden="true">+</span></summary><p>${esc(t(data.answer))}</p></details>
 </div>`;
}

export function renderCrmRehearsalDialog({ english = false, icon }) {
 const steps = english ? ['Record', 'Assign', 'Follow up', 'Review'] : ['سجّل', 'عيّن', 'تابع', 'راجع'];
 const benefits = english ? [
  'A clear request record gives the team one place to understand the task.',
  'An explicit owner makes responsibility visible when work changes hands.',
  'A recorded next action shows what the team needs to do after this step.',
  'The request, owner and activity record give management a reviewable picture.',
 ] : [
  'سجل واضح للطلب يجمع سياق المهمة في مكان يرجع إليه الفريق.',
  'تعيين المسؤول يوضح ملكية الطلب عند انتقال العمل بين أعضاء الفريق.',
  'خطوة قادمة موثقة توضّح للفريق ما يحتاج إلى المتابعة بعد هذه المرحلة.',
  'الطلب والمسؤول وسجل الخطوات يعطون الإدارة صورة يمكن مراجعتها.',
 ];
 return `<dialog class="crm-rehearsal-dialog" id="crm-task-dialog" data-crm-demo aria-labelledby="crm-task-title" aria-describedby="crm-task-description">
  <div class="crm-demo-header"><div><span class="crm-rehearsal-eyebrow" dir="ltr">WORKFLOW / HANDS-ON PREVIEW</span><h2 id="crm-task-title">${english ? 'One request. A complete picture.' : 'طلب واحد. والصورة كاملة.'}</h2><p id="crm-task-description">${english ? 'An interactive simulation using sample data. Your working custom trial is prepared after its scope is agreed.' : 'محاكاة تفاعلية ببيانات أمثلة. تجربتك الفعلية المخصصة تُجهّز بعد اعتماد نطاقها.'}</p></div><button type="button" data-crm-demo-close class="crm-demo-close" aria-label="${english ? 'Close workflow simulation' : 'إغلاق محاكاة المسار'}">×</button></div>
  <ol class="crm-demo-progress" aria-label="${english ? 'Workflow simulation steps' : 'خطوات محاكاة المسار'}">${steps.map((step, i) => `<li data-crm-demo-progress="${i}"><span dir="ltr">${String(i + 1).padStart(2, '0')}</span><strong>${step}</strong>${icon('check')}</li>`).join('')}</ol>
  <div class="crm-demo-body"><form class="crm-demo-task" id="crm-demo-task-form" data-crm-demo-form novalidate>
   <section data-crm-demo-step="0"><span class="crm-demo-step-code" dir="ltr">01 / REQUEST</span><h3 tabindex="-1">${english ? 'Give the request a clear subject.' : 'خلّ الطلب واضحًا من البداية.'}</h3><p>${english ? 'Edit the sample subject, then record it in this simulation.' : 'عدّل عنوان المثال، ثم سجّله داخل المحاكاة.'}</p><label class="crm-lab-label"><span>${english ? 'Sample request subject' : 'عنوان الطلب التجريبي'}</span><input type="text" data-crm-demo-subject required maxlength="120" autocomplete="off"></label><p class="crm-demo-data-note">${english ? 'Use example information. The simulation stays in this page.' : 'استخدم معلومات أمثلة. المحاكاة تبقى في هذه الصفحة.'}</p></section>
   <section data-crm-demo-step="1" hidden><span class="crm-demo-step-code" dir="ltr">02 / OWNER</span><h3 tabindex="-1">${english ? 'Who owns the next step?' : 'مين مسؤول عن الخطوة القادمة؟'}</h3><p>${english ? 'Choose a proposed role for this business context.' : 'اختر دورًا مقترحًا لطبيعة النشاط الذي حددته.'}</p><label class="crm-lab-label"><span>${english ? 'Request owner' : 'مسؤول الطلب'}</span><select data-crm-demo-owner required></select></label></section>
   <section data-crm-demo-step="2" hidden><span class="crm-demo-step-code" dir="ltr">03 / NEXT ACTION</span><h3 tabindex="-1">${english ? 'Make the follow-up specific.' : 'حدّد المتابعة بدل ما تتركها مفتوحة.'}</h3><p>${english ? 'Choose a next action that the owner can understand and follow.' : 'اختر خطوة قادمة يستطيع المسؤول فهمها ومتابعتها.'}</p><label class="crm-lab-label"><span>${english ? 'Next action' : 'خطوة المتابعة'}</span><select data-crm-demo-action required></select></label></section>
   <section data-crm-demo-step="3" hidden><span class="crm-demo-step-code" dir="ltr">04 / REVIEW</span><h3 tabindex="-1">${english ? 'Now the team has context.' : 'الآن، الفريق عنده الصورة.'}</h3><p>${english ? 'You recorded the request, its owner and the next action. Review the sample record beside this task.' : 'سجّلت الطلب، وحددت مسؤوله والخطوة القادمة. راجع سجل المثال المعروض مع هذه المهمة.'}</p><div class="crm-demo-complete">${icon('check')}<span>${english ? 'A request ready for follow-up' : 'طلب واضح وجاهز للمتابعة'}</span></div><p>${english ? 'Add these tasks to your trial request so we can discuss them in your working custom version.' : 'أضف هذه المهام إلى طلب تجربتك، لنناقش اختبارها في نسختك الفعلية المخصصة.'}</p></section>
   <div class="crm-demo-benefit">${icon('spark')}<div><span>${english ? 'WHY THIS STEP MATTERS' : 'فائدة هذه الخطوة'}</span>${benefits.map((benefit, i) => `<p data-crm-demo-benefit="${i}"${i ? ' hidden' : ''}>${benefit}</p>`).join('')}</div></div>
  </form><aside class="crm-demo-record" aria-label="${english ? 'Sample request record' : 'سجل الطلب التجريبي'}"><div class="crm-demo-record-head"><strong data-crm-demo-brand>${english ? 'Your business workspace' : 'مساحة عمل منشأتك'}</strong><span>${english ? 'SAMPLE DATA' : 'بيانات أمثلة'}</span></div><dl><div><dt>${english ? 'Subject' : 'الطلب'}</dt><dd data-crm-demo-record-subject>—</dd></div><div><dt>${english ? 'Status' : 'الحالة'}</dt><dd data-crm-demo-record-status>—</dd></div><div><dt>${english ? 'Owner' : 'المسؤول'}</dt><dd data-crm-demo-record-owner>—</dd></div><div><dt>${english ? 'Next action' : 'الخطوة القادمة'}</dt><dd data-crm-demo-record-action>—</dd></div></dl><h4>${english ? 'Activity record' : 'سجل الخطوات'}</h4><ol data-crm-demo-log></ol><p data-crm-demo-log-empty>${english ? 'Your recorded steps will appear here.' : 'خطواتك المسجلة هتظهر هنا.'}</p></aside></div>
  <div class="crm-demo-footer"><p role="status" aria-live="polite" data-crm-demo-status></p><div><button type="button" class="crm-demo-back" data-crm-demo-back>${english ? 'Previous step' : 'الخطوة السابقة'}</button><button type="submit" form="crm-demo-task-form" class="button" data-crm-demo-next><span data-crm-demo-next-label>${english ? 'Record the request' : 'سجّل الطلب'}</span>${icon('arrow')}</button></div></div>
 </dialog>`;
}
