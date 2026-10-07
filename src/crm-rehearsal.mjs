const pair = (ar, en) => ({ ar, en });
export const scenarios = {
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
  <h4>${english ? 'One request. Follow it through.' : 'طلبٌ واحد. تتبّع أثر تنظيمه.'}</h4>
  <p>${english ? 'Record a sample request, assign an owner and schedule its next action. Compare the team and management views.' : 'سجّل طلبًا تجريبيًا، وعيّن المسؤول، وحدّد المتابعة وموعدها. ثم استكشف رؤيتي الفريق والإدارة.'}</p>
  <button type="button" class="crm-rehearsal-launch" id="crm-demo-${sector.id}" data-crm-rehearse data-demo-request="${esc(t(data.request))}" data-demo-action="${esc(t(data.action))}" aria-haspopup="dialog" aria-controls="crm-task-dialog" hidden>${english ? 'Try this workflow' : 'اختبر المسار بنفسك'}${icon('arrow')}</button>
  <details class="crm-context-question"><summary>${esc(t(data.question))}<span aria-hidden="true">+</span></summary><p>${esc(t(data.answer))}</p></details>
 </div>`;
}

export function renderCrmRehearsalDialog({ english = false, icon }) {
 const steps = english ? ['Record', 'Assign', 'Follow up', 'Review'] : ['سجّل', 'عيّن', 'تابع', 'راجع'];
 const questions = english ? ['Why record the request first?', 'How does an owner improve the handoff?', 'Why does the next action need a time?', 'What changes for management?'] : ['لماذا يبدأ التنظيم بتسجيل الطلب؟', 'كيف يصبح انتقال المهمة أوضح؟', 'لماذا تحتاج المتابعة إلى موعد؟', 'ما الذي يتغيّر في رؤية الإدارة؟'];
 const benefits = english ? [
  'A clear request record gives the team one place to understand the task.',
  'An explicit owner makes responsibility visible when work changes hands.',
  'An action and an agreed time clarify what should happen next. Your custom trial can discuss reminders and scheduling.',
  'Switch between the illustrative owner and management views to see the task and its context. Actual roles and permissions are agreed for your custom trial.',
 ] : [
  'يجمع سجلّ الطلب سياق المهمة في مرجعٍ واضح، فيعرف الفريق ما يحتاج إليه العميل قبل بدء العمل.',
  'يرتبط الطلب بمسؤولٍ محدد، فتتضح المهمة لمن يتسلّمها ولمن يتابع تقدّمها.',
  'الخطوة القادمة وموعدها يوضّحان ما ينبغي إنجازه ومتى. ويمكن مناقشة التذكيرات والجدولة ضمن تجربتك المخصصة.',
  'بدّل بين رؤيتي مسؤول الطلب والإدارة لتستكشف المهمة وسياقها. هذه معاينة توضيحية؛ تُعتمد الأدوار والصلاحيات الفعلية في نطاق تجربتك المخصصة.',
 ];
 const dueOptions = english ? [['today', 'Today — sample timing'], ['next-workday', 'Next working day — sample timing'], ['agreed', 'At an agreed time — sample timing']] : [['today', 'اليوم — موعد تجريبي'], ['next-workday', 'يوم العمل التالي — موعد تجريبي'], ['agreed', 'في موعد متفق عليه — موعد تجريبي']];
 return `<dialog class="crm-rehearsal-dialog" id="crm-task-dialog" data-crm-demo aria-labelledby="crm-task-title" aria-describedby="crm-task-description">
  <div class="crm-demo-header"><div><span class="crm-rehearsal-eyebrow" dir="ltr">YOUR BUSINESS / A CLEARER WORKFLOW</span><h2 id="crm-task-title">${english ? 'From a first request to a clear follow-up.' : 'من أول طلب، إلى متابعةٍ واضحة.'}</h2><p id="crm-task-description">${english ? 'An interactive simulation using sample data. Your working custom trial is prepared after its scope is agreed.' : 'محاكاة تفاعلية ببيانات أمثلة. تجربتك الفعلية المخصصة تُجهّز بعد اعتماد نطاقها.'}</p></div><button type="button" data-crm-demo-close class="crm-demo-close" aria-label="${english ? 'Close workflow simulation' : 'إغلاق محاكاة المسار'}">×</button></div>
  <ol class="crm-demo-progress" aria-label="${english ? 'Workflow simulation steps' : 'خطوات محاكاة المسار'}">${steps.map((step, i) => `<li data-crm-demo-progress="${i}"><span dir="ltr">${String(i + 1).padStart(2, '0')}</span><strong>${step}</strong>${icon('check')}</li>`).join('')}</ol>
  <div class="crm-demo-quick-nav" role="group" aria-label="${english ? 'Navigate the simulation' : 'التنقل داخل المحاكاة'}" data-crm-demo-nav hidden><button type="button" data-crm-demo-jump="task" aria-controls="crm-demo-task-form">${icon('layers')}${english ? 'Current task' : 'المهمة الحالية'}</button><button type="button" data-crm-demo-jump="record" aria-controls="crm-demo-request-record">${icon('chart')}${english ? 'Request record' : 'سجلّ الطلب'}</button></div>
  <div class="crm-demo-body"><form class="crm-demo-task" id="crm-demo-task-form" data-crm-demo-form novalidate>
   <section data-crm-demo-step="0"><span class="crm-demo-step-code" dir="ltr">01 / REQUEST</span><h3 tabindex="-1">${english ? 'Start with a clear request.' : 'ابدأ بطلبٍ واضح.'}</h3><p>${english ? 'Edit the sample subject, then watch it enter the workflow.' : 'عدّل عنوان المثال، ثم شاهد الطلب يدخل مسار العمل.'}</p><label class="crm-lab-label"><span>${english ? 'Sample request subject' : 'عنوان الطلب التجريبي'}</span><input type="text" data-crm-demo-subject required maxlength="120" autocomplete="off"></label><p class="crm-demo-data-note">${english ? 'Use example information. The simulation stays in this page.' : 'استخدم معلومات أمثلة. المحاكاة تبقى في هذه الصفحة.'}</p></section>
   <section data-crm-demo-step="1" hidden><span class="crm-demo-step-code" dir="ltr">02 / OWNER</span><h3 tabindex="-1">${english ? 'Give the task a clear owner.' : 'امنح المهمة مسؤولًا محددًا.'}</h3><p>${english ? 'Choose a proposed role for this business context.' : 'اختر دورًا مقترحًا يناسب طبيعة نشاطك، وشاهد انتقال الطلب إليه.'}</p><label class="crm-lab-label"><span>${english ? 'Request owner' : 'مسؤول الطلب'}</span><select data-crm-demo-owner required></select></label></section>
   <section data-crm-demo-step="2" hidden><span class="crm-demo-step-code" dir="ltr">03 / NEXT ACTION</span><h3 tabindex="-1">${english ? 'Make the next step actionable.' : 'اجعل الخطوة القادمة قابلةً للتنفيذ.'}</h3><p>${english ? 'Choose an action and sample timing so the owner knows what comes next.' : 'حدّد الإجراء وموعده التجريبي؛ ليعرف المسؤول ما ينبغي إنجازه ومتى.'}</p><label class="crm-lab-label"><span>${english ? 'Next action' : 'خطوة المتابعة'}</span><select data-crm-demo-action required></select></label><label class="crm-lab-label"><span>${english ? 'Follow-up timing' : 'موعد المتابعة'}</span><select data-crm-demo-due required><option value="">${english ? 'Choose sample timing' : 'اختر موعدًا تجريبيًا'}</option>${dueOptions.map(([value, label]) => `<option value="${value}">${label}</option>`).join('')}</select></label><label class="crm-lab-label"><span>${english ? 'Handoff note — optional' : 'ملاحظة للمسؤول — اختياري'}</span><textarea data-crm-demo-note maxlength="240" rows="2" placeholder="${english ? 'Example: confirm the visit before preparing a quote.' : 'مثال: تأكيد المعاينة قبل إعداد العرض.'}"></textarea></label></section>
   <section data-crm-demo-step="3" hidden><span class="crm-demo-step-code" dir="ltr">04 / REVIEW</span><h3 tabindex="-1">${english ? 'The task now has a complete context.' : 'الآن، لكلّ مهمة سياقٌ وخطوة.'}</h3><p>${english ? 'Review the request, owner, action and timing. Switch the preview between the owner and management perspectives.' : 'راجع الطلب ومسؤوله وإجراء المتابعة وموعده. بدّل زاوية العرض لتستكشف ما يصبح أوضح لمسؤول الطلب والإدارة.'}</p><div class="crm-demo-complete">${icon('check')}<span>${english ? 'Four details. One clear follow-up.' : 'أربعة تفاصيل. ومتابعةٌ واضحة.'}</span></div><div class="crm-demo-handoff"><div class="crm-demo-handoff-heading">${icon('layers')}<h4>${english ? 'Task handoff card' : 'بطاقة تسليم المهمة'}</h4></div><p>${english ? 'See how the task can be handed over with its full context. Review or copy this sample summary.' : 'شاهد كيف تنتقل المهمة بسياقها الكامل. راجع هذا الملخص التجريبي أو انسخه.'}</p><textarea data-crm-demo-summary readonly rows="7" dir="auto" aria-label="${english ? 'Sample task handoff card' : 'بطاقة تسليم المهمة التجريبية'}"></textarea><div class="crm-demo-handoff-actions"><button type="button" data-crm-demo-copy>${icon('layers')}${english ? 'Copy task card' : 'انسخ بطاقة المهمة'}</button><button type="button" data-crm-demo-edit>${icon('arrow')}${english ? 'Edit follow-up' : 'راجع المتابعة'}</button></div><p class="crm-demo-copy-status" role="status" aria-live="polite" data-crm-demo-copy-status></p></div><p>${english ? 'Include these tasks in your custom trial request, or restart with a fresh example.' : 'أدرج هذه المهام في طلب تجربتك المخصصة، أو أعد المحاكاة بمثالٍ جديد.'}</p><button type="button" class="crm-demo-restart" data-crm-demo-restart>${icon('arrow')}${english ? 'Start a new example' : 'ابدأ مثالًا جديدًا'}</button></section>
   <div class="crm-demo-benefit">${icon('spark')}<div><span>${english ? 'THE VALUE BEHIND THE STEP' : 'القيمة وراء الخطوة'}</span>${benefits.map((benefit, i) => `<details data-crm-demo-benefit="${i}"${i ? ' hidden' : ''} open><summary>${questions[i]}<span aria-hidden="true">+</span></summary><p>${benefit}</p></details>`).join('')}</div></div>
  </form><aside class="crm-demo-record" id="crm-demo-request-record" aria-label="${english ? 'Sample request record' : 'سجل الطلب التجريبي'}">
   <div class="crm-demo-record-head" tabindex="-1"><span class="crm-brand-mark crm-demo-brand-mark" aria-hidden="true"><img data-crm-brand-logo width="42" height="42" alt="" hidden><span data-crm-brand-fallback>${icon('layers')}</span><span data-crm-brand-initial hidden></span></span><div><strong data-crm-demo-brand dir="auto">${english ? 'Your business workspace' : 'مساحة عمل منشأتك'}</strong><small data-crm-demo-sector-name></small></div><span>${english ? 'SAMPLE DATA' : 'بيانات أمثلة'}</span></div>
   <div class="crm-demo-clarity"><span>${english ? 'Request details completed' : 'عناصر تنظيم الطلب المكتملة'}</span><strong data-crm-demo-clarity dir="ltr">0 / 4</strong></div><progress class="crm-demo-meter" data-crm-demo-meter value="0" max="4" aria-label="${english ? 'Request details completed' : 'عناصر تنظيم الطلب المكتملة'}"></progress>
   <div class="crm-demo-view-switch" role="group" aria-label="${english ? 'Illustrative workspace perspective' : 'معاينة زاوية العرض'}"><button type="button" data-crm-demo-view="owner" aria-pressed="true">${icon('user')}${english ? 'Request owner view' : 'رؤية مسؤول الطلب'}</button><button type="button" data-crm-demo-view="management" aria-pressed="false">${icon('chart')}${english ? 'Management view' : 'رؤية الإدارة'}</button></div>
   <p class="crm-demo-perspective" data-crm-demo-perspective></p>
   <div class="crm-demo-owner-focus" data-crm-demo-owner-focus><span>${english ? 'YOUR NEXT TASK' : 'مهمتك القادمة'}</span><strong data-crm-demo-focus-action></strong><small data-crm-demo-focus-due></small></div>
   <ul class="crm-demo-management-focus" data-crm-demo-management-focus hidden>${(english ? ['An assigned owner', 'A defined action', 'An agreed time'] : ['مسؤول محدد', 'إجراء موثّق', 'موعد معلوم']).map((label, i) => `<li data-crm-demo-checkpoint="${i}"><i aria-hidden="true"></i><span>${label}</span><strong data-crm-demo-checkpoint-state></strong></li>`).join('')}</ul>
   <ol class="crm-demo-pipeline" aria-label="${english ? 'Request movement' : 'انتقال الطلب'}">${(english ? ['Recorded', 'Assigned', 'Follow-up planned'] : ['مسجّل', 'مُسند', 'متابعة محددة']).map((label, i) => `<li data-crm-demo-lane="${i}"><i aria-hidden="true"></i><span>${label}</span></li>`).join('')}</ol>
   <dl><div><dt>${english ? 'Subject' : 'الطلب'}</dt><dd data-crm-demo-record-subject>—</dd></div><div><dt>${english ? 'Status' : 'الحالة'}</dt><dd data-crm-demo-record-status>—</dd></div><div><dt>${english ? 'Owner' : 'المسؤول'}</dt><dd data-crm-demo-record-owner>—</dd></div><div><dt>${english ? 'Next action' : 'الخطوة القادمة'}</dt><dd data-crm-demo-record-action>—</dd></div><div><dt>${english ? 'Timing' : 'الموعد'}</dt><dd data-crm-demo-record-due>—</dd></div><div data-crm-demo-note-row hidden><dt>${english ? 'Note' : 'الملاحظة'}</dt><dd data-crm-demo-record-note></dd></div></dl>
   <h4>${english ? 'Activity record' : 'سجلّ الإجراءات'}</h4><ol data-crm-demo-log></ol><p data-crm-demo-log-empty>${english ? 'Your recorded steps will appear here.' : 'تظهر هنا الخطوات التي تعتمدها داخل المحاكاة.'}</p>
  </aside></div>
  <div class="crm-demo-footer"><p role="status" aria-live="polite" data-crm-demo-status></p><div><button type="button" class="crm-demo-back" data-crm-demo-back>${english ? 'Previous step' : 'الخطوة السابقة'}</button><button type="submit" form="crm-demo-task-form" class="button" data-crm-demo-next><span data-crm-demo-next-label>${english ? 'Record the request' : 'سجّل الطلب'}</span>${icon('arrow')}</button></div></div>
 </dialog>`;
}
