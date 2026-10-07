const pair = (ar, en) => ({ ar, en });
// Planning examples, not claims about a deployed client system.
const stageExamples = {
 company: [
  pair('يبدأ السجل بطلب العميل ومصدره والخدمة التي يسأل عنها.', 'Start with the customer request, its source and the service of interest.'),
  pair('يوثّق الفريق الاحتياج والأسئلة المفتوحة قبل اقتراح الحل.', 'Record the need and open questions before proposing a solution.'),
  pair('يرتبط العرض بمسؤول وخطوة متابعة يمكن الرجوع إليها.', 'Connect the quote to an owner and a next action the team can review.'),
  pair('يُسجّل القرار وسياقه لتكون مراجعة الفرصة مفهومة.', 'Record the decision and its context so the opportunity can be reviewed.'),
 ],
 shop: [
  pair('يجمع السجل سؤال العميل والمنتج الذي يستفسر عنه.', 'Keep the enquiry and the product of interest in the same record.'),
  pair('يحدّد الفريق المنتج والكمية المطلوبة والتفاصيل التي تحتاج مراجعة.', 'Define the product, requested quantity and details to check.'),
  pair('تتضح جهة المتابعة والإجراء التالي قبل تأكيد الطلب.', 'Make the owner and next action clear before confirming the order.'),
  pair('تُحدّث حالة الاستفسار أو الطلب مع سبب التغيير.', 'Update the enquiry or order status with the reason for the change.'),
 ],
 pharmacy: [
  pair('يبدأ المثال باستفسار إداري عن خدمة الصيدلية ببيانات اختبار.', 'Start with a test-data administrative enquiry about a pharmacy service.'),
  pair('يراجع الفريق موضوع الاستفسار والجهة الإدارية المناسبة.', 'Review the enquiry and the appropriate administrative team.'),
  pair('يُسند الاستفسار إلى دور متفق عليه في الفريق.', 'Assign the enquiry to an agreed staff role.'),
  pair('يُوثّق الرد الإداري وخطوة المتابعة وحالة الاستفسار.', 'Record the administrative reply, next action and enquiry status.'),
 ],
 health: [
  pair('يُسجّل الاستقبال طلب موعد توضيحي ببيانات اختبار.', 'Reception records an illustrative appointment enquiry using test data.'),
  pair('تُراجع تفاصيل التنسيق اللازمة داخل النطاق الإداري.', 'Review the coordination details within the administrative scope.'),
  pair('تتضح جهة التنسيق وخطوة تأكيد الموعد المقترحة.', 'Make the coordinating role and proposed confirmation step clear.'),
  pair('تُحدّث حالة طلب الموعد والخطوة الإدارية التالية.', 'Update the appointment enquiry status and next administrative action.'),
 ],
 contracting: [
  pair('يُسجّل نوع الخدمة وموقع المشروع المبدئي وما يطلبه العميل.', 'Record the service, initial project location and customer request.'),
  pair('يوثّق الفريق متطلبات المعاينة والأسئلة التي تسبق تجهيز العرض.', 'Record site-visit requirements and questions to resolve before quoting.'),
  pair('يرتبط العرض بالمسؤول وما يحتاج متابعة أو توضيحًا.', 'Connect the quote to its owner and the details that need follow-up.'),
  pair('يُسجّل قرار العميل والخطوة المتفق عليها لاستكمال المسار.', 'Record the customer decision and the agreed next step.'),
 ],
 other: [
  pair('نبدأ بطلب يكرره نشاطك والبيانات اللازمة لفهمه.', 'Start with a recurring request and the information needed to understand it.'),
  pair('نحدّد الاحتياج والأسئلة التي يحتاج فريقك إجابتها.', 'Define the need and the questions your team must resolve.'),
  pair('تتضح المهمة والمسؤول وطريقة تسجيل إنجاز الخطوة.', 'Make the task, owner and completion record clear.'),
  pair('نراجع الحالة والخطوة القادمة وفق طريقة عمل نشاطك.', 'Review the status and next action against your business workflow.'),
 ],
};
const questions = [
 pair('ما الذي يجعل بداية الطلب أوضح؟', 'What makes the first request clearer?'),
 pair('كيف نستعد للخطوة التالية؟', 'How do we prepare for the next step?'),
 pair('كيف يتسلّم الفريق المهمة بسياقها؟', 'How does the team receive the task with its context?'),
 pair('ما الذي نراجعه قبل إنهاء المسار؟', 'What do we review before closing the workflow?'),
];
const answers = [
 pair('نختبر هل يستطيع المستخدم تسجيل الطلب وفهم ما يحتاج إليه، بالحقول التي نعتمدها مع فريقك.', 'Test whether a user can record and understand the request using fields agreed with your team.'),
 pair('نراجع المعلومات الناقصة ونحدد من يستكملها؛ ثم نختبر انتقال الطلب إلى المرحلة المناسبة.', 'Review missing information and who will complete it, then test movement to the appropriate stage.'),
 pair('نختبر ظهور سياق الطلب والمسؤول والإجراء التالي للمستخدم المناسب. تُعتمد الصلاحيات الفعلية في نطاق التجربة.', 'Test whether the relevant user sees the request context, owner and next action. Actual permissions follow the agreed trial scope.'),
 pair('نختبر تسجيل الحالة وسبب القرار وإمكان الرجوع إلى المتابعة، ثم نراجع ما يحتاج تحسينًا مع الفريق.', 'Test recording the status and decision context, review the activity record and discuss improvements with the team.'),
];

export function renderCrmWorkflowPlan(sector, { english = false, esc }) {
 const t = value => value[english ? 'en' : 'ar'];
 return `<div class="crm-flow-explorer" data-crm-flow>
  <p class="crm-flow-caption">${english ? 'Explore the stages of this proposed workflow' : 'استكشف مراحل هذا المسار المقترح'}</p>
  <div class="crm-flow-tabs" data-crm-flow-tools hidden role="tablist" aria-label="${english ? 'Proposed workflow stages: ' : 'مراحل المسار المقترح: '}${esc(t(sector.name))}">${sector.stages.map((stage, i) => `<button type="button" role="tab" id="crm-flow-tab-${sector.id}-${i}" data-crm-flow-tab="${i}" aria-controls="crm-flow-panel-${sector.id}-${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}"><span dir="ltr">0${i + 1}</span><strong>${esc(t(stage))}</strong></button>`).join('')}</div>
  ${sector.stages.map((stage, i) => `<div class="crm-flow-panel" role="tabpanel" id="crm-flow-panel-${sector.id}-${i}" data-crm-flow-panel="${i}" aria-labelledby="crm-flow-tab-${sector.id}-${i}" tabindex="0"><span class="crm-flow-code" dir="ltr">0${i + 1} / 04</span><h4>${esc(t(stage))}</h4><p>${esc(t(stageExamples[sector.id][i]))}</p><details><summary>${esc(t(questions[i]))}<span aria-hidden="true">+</span></summary><p>${esc(t(answers[i]))}</p></details></div>`).join('')}
 </div>`;
}
