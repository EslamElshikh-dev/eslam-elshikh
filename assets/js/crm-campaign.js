(() => {
  'use strict';
  const root = document.querySelector('[data-crm-campaign]');
  if (!root) return;
  const en = document.documentElement.lang === 'en';
  const t = (ar, english) => en ? english : ar;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const el = key => root.querySelector(`[data-crm-${key}]`);
  const track = name => window.esAnalytics?.track(name, { service: 'crm-systems', placement: 'content' });
  const paths = {
    requests: {
      label: t('تنظيم الطلبات ومسؤوليها', 'Request ownership'),
      kicker: t('مسار تنظيم الطلبات', 'Request ownership path'),
      title: t('الطلب واضح. ومسؤوله يعرف وش بعده.', 'A clear request. An owner with a next step.'),
      copy: t('اربط تفاصيل الطلب بمن يستلمه وبالخطوة المطلوبة. يتسلّم زميلك السياق بدل ما يبدأ من جديد.', 'Connect request details with the owner and next task. A colleague gets the context rather than starting over.'),
      request: t('طلب صيانة لمقر شركة', 'Office maintenance request'),
      need: t('نحتاج تنظيم الطلبات وتحديد مسؤول كل طلب وخطوة المتابعة.', 'We need clear request ownership and follow-up steps.'),
      stages: [
        [t('طلب جديد','New request'),t('بانتظار التعيين','Awaiting assignment'),t('مراجعة تفاصيل الطلب','Review request details'),t('تُحدد بعد المراجعة','Agreed after review'),t('وصل الطلب. نسجل الخدمة والتفاصيل ليبدأ الفريق من احتياج واضح.','The request arrives. Record the service and details so the team starts with a clear need.')],
        [t('المسؤول محدد','Owner assigned'),t('منسق الخدمة · مثال','Service coordinator · example'),t('تأكيد الاحتياج مع العميل','Confirm the need with the customer'),t('تُتفق مع العميل','Agreed with the customer'),t('للخدمة مسؤول يعرف السياق. تنسيق الخطوة التالية يبدأ من سجل الطلب نفسه.','A service owner has the context. Coordinate the next action from the same request record.')],
        [t('زيارة قيد التنسيق','Visit being arranged'),t('منسق الخدمة · مثال','Service coordinator · example'),t('تنسيق موعد الزيارة','Arrange the visit'),t('موعد متفق عليه · مثال','Agreed appointment · example'),t('تتحدد الخطوة وموعدها، فيرى الزميل ما تم تنسيقه وما يحتاج متابعة.','The action and timing are defined, so a colleague can see what was arranged and what needs follow-up.')],
        [t('بانتظار تأكيد العميل','Awaiting customer confirmation'),t('منسق الخدمة · مثال','Service coordinator · example'),t('تأكيد موعد الزيارة','Confirm the appointment'),t('حسب الاتفاق مع العميل','As agreed with the customer'),t('تفاصيل الطلب ومسؤوله والموعد في سياق واحد. يستكمل الفريق المتابعة بناءً على آخر تحديث.','Request details, owner and appointment are in one context. The team follows up using the latest update.')]
      ]
    },
    quotes: {
      label: t('متابعة عروض الأسعار', 'Quote follow-up'),
      kicker: t('مسار متابعة العروض', 'Quote follow-up path'),
      title: t('من «أرسلنا العرض» إلى «وش الخطوة الجاية؟»', 'From “quote sent” to “what happens next?”'),
      copy: t('خلّ آخر تواصل، ومسؤول المتابعة، وموعدها أمام الفريق. كل تحديث يوضح أين وصلت الفرصة.', 'Keep the last contact, follow-up owner and timing in view. Each update makes the opportunity’s stage clearer.'),
      request: t('عرض تشطيب مساحة عمل', 'Workspace fit-out quote'),
      need: t('نحتاج متابعة عروض الأسعار ومعرفة آخر تواصل والخطوة القادمة.', 'We need quote follow-up, the last contact and a clear next action.'),
      stages: [
        [t('استفسار جديد','New enquiry'),t('بانتظار التعيين','Awaiting assignment'),t('مراجعة الاحتياج','Review the need'),t('تُحدد بعد المراجعة','Agreed after review'),t('الطلب وصل. نسجّل احتياجه قبل تحديد المسؤول والخطوة التالية.','The enquiry arrives. Record the need before assigning an owner and next action.')],
        [t('مسؤول الفرصة محدد','Opportunity owner assigned'),t('مسؤول المبيعات · مثال','Sales owner · example'),t('تنسيق معاينة المساحة','Arrange a site visit'),t('تُتفق مع العميل','Agreed with the customer'),t('المسؤول يعرف الاحتياج ويُنسّق المعاينة. سياق الفرصة يبقى مع المهمة.','The owner understands the need and arranges a visit. The opportunity context stays with the task.')],
        [t('العرض قيد المتابعة','Quote in follow-up'),t('مسؤول المبيعات · مثال','Sales owner · example'),t('مراجعة العرض مع العميل','Review the quote with the customer'),t('يوم العمل التالي · مثال','Next working day · example'),t('بعد توثيق المعاينة والعرض، تتحدد المتابعة وموعدها. الفريق يعرف الخطوة القادمة.','After recording the visit and quote, follow-up has an action and timing. The team knows the next step.')],
        [t('بانتظار قرار العميل','Awaiting the customer’s decision'),t('مسؤول المبيعات · مثال','Sales owner · example'),t('مناقشة ملاحظات العميل','Discuss customer feedback'),t('حسب الاتفاق مع العميل','As agreed with the customer'),t('تراجع المرحلة والمسؤول وآخر متابعة من نفس السياق، بناءً على تحديثات فريقك.','Review the stage, owner and last follow-up in the same context, using your team’s updates.')]
      ]
    },
    overview: {
      label: t('رؤية مراحل عمل الفريق', 'Team workflow visibility'),
      kicker: t('مسار رؤية الإدارة', 'Management visibility path'),
      title: t('وش وصلنا له؟ الجواب يبدأ من تحديث واضح.', 'Where do we stand? Start with a clear update.'),
      copy: t('شوف مرحلة الفرصة ومن يتابعها والخطوة المطلوبة. صورة الإدارة تتكوّن من تحديثات الفريق.', 'See the opportunity stage, its owner and the next task. Management’s view comes from the team’s updates.'),
      request: t('فرصة تنفيذ لشركة', 'Business project opportunity'),
      need: t('نحتاج رؤية مراحل الفرص ومسؤوليها والمتابعة المطلوبة من الفريق.', 'We need visibility of opportunity stages, owners and team follow-up.'),
      stages: [
        [t('فرصة جديدة','New opportunity'),t('بانتظار التعيين','Awaiting assignment'),t('توثيق متطلبات المشروع','Record project requirements'),t('تُحدد بعد المراجعة','Agreed after review'),t('نسجل متطلبات الفرصة ليبني الفريق والإدارة نقاشهما على نفس المعلومات.','Record requirements so the team and management can discuss the same information.')],
        [t('مالك الفرصة محدد','Opportunity owner assigned'),t('مسؤول الحساب · مثال','Account owner · example'),t('مراجعة المتطلبات مع الفريق','Review requirements with the team'),t('موعد مراجعة متفق عليه · مثال','Agreed review · example'),t('ارتبطت الفرصة بمسؤول وخطوة. الإدارة تعرف من تراجع معه التقدم.','The opportunity has an owner and action. Management knows who to review progress with.')],
        [t('متابعة مسجلة','Follow-up recorded'),t('مسؤول الحساب · مثال','Account owner · example'),t('تحديث ملاحظات المتابعة','Update follow-up notes'),t('حسب موعد المراجعة','According to the review date'),t('تُوثّق الملاحظات والخطوة المطلوبة، فيظهر ما حدث وما يحتاج إجراءً.','Record notes and the next task so the team can see what happened and what needs action.')],
        [t('الفرصة بانتظار إجراء','Opportunity awaiting action'),t('مسؤول الحساب · مثال','Account owner · example'),t('مراجعة الإجراء مع الفريق','Review the action with the team'),t('موعد مراجعة متفق عليه · مثال','Agreed review · example'),t('المرحلة والمسؤول والإجراء في صورة واحدة. دقتها مرتبطة بتحديث الفريق، لا بمجرد فتح اللوحة.','The stage, owner and action form one picture. Its accuracy depends on team updates, not opening the dashboard.')]
      ]
    }
  };
  const name = el('campaign-name');
  const company = el('brief-company');
  const need = el('brief-need');
  const sector = el('brief-sector');
  const form = el('campaign-form');
  const messagePanel = el('campaign-message');
  const messageText = el('campaign-message-text');
  const whatsapp = el('campaign-whatsapp');
  const whatsappBase = whatsapp.href;
  const stageButtons = [...root.querySelectorAll('[data-crm-campaign-step]')];
  const pathButtons = [...root.querySelectorAll('[data-crm-path]')];
  let selected = 'quotes', stage = 0, pathChosen = false;
  let started = false, completed = false, hasPrepared = false, needEdited = false;
  let sourceKey = '', planRequested = false;
  const sectorButtons = [...root.querySelectorAll('[data-crm-plan-sector]')];
  const sourceButtons = [...root.querySelectorAll('[data-crm-plan-source]')];
  const compareButtons = [...root.querySelectorAll('[data-crm-compare]')];
  const animatePanel = panel => {
    if (!reduced.matches && panel?.animate) panel.animate(
      [{ opacity: 0.75, transform: 'translateY(5px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 240, easing: 'ease-out' }
    );
  };
  const announce = text => el('campaign-announcement').textContent = text;

  const sectors = {
    services: { value: t('خدمات أو صيانة','Services or maintenance'), label: t('خدمات وصيانة','Services and maintenance'), context: t('الخدمة المطلوبة وبيانات التواصل','Service requirements and contact context') },
    contracting: { value: t('مقاولات أو تشطيبات','Contracting or fit-out'), label: t('مقاولات وتشطيبات','Contracting and fit-out'), context: t('تفاصيل المشروع وبيانات التواصل','Project details and contact context') },
    sales: { value: t('مبيعات بين الشركات','B2B sales'), label: t('مبيعات بين الشركات','B2B sales'), context: t('احتياج المنشأة وبيانات التواصل','Business needs and contact context') }
  };
  const sources = {
    phone: t('مكالمة','Phone call'),
    whatsapp: t('رسالة WhatsApp','WhatsApp message'),
    form: t('نموذج تواصل','Enquiry form')
  };
  const workflows = {
    requests: {
      nodes: [
        [t('تسجيل الطلب','Record the request'),t('الاحتياج وبيانات التواصل','The need and contact context')],
        [t('تحديد المسؤول','Assign an owner'),t('دور يستلم الطلب ويعرف سياقه','A role taking the request with its context')],
        [t('ترتيب الخطوة','Arrange the next action'),t('الإجراء وموعده حسب الاتفاق','An action and timing agreed with the customer')],
        [t('متابعة الحالة','Review the status'),t('آخر تحديث والخطوة المطلوبة','The latest update and next task')]
      ],
      insight: t('الهدف: كل طلب له مسؤول وخطوة يعرفها الفريق.','The aim: every request has an owner and a step the team can see.')
    },
    quotes: {
      nodes: [
        [t('تسجيل الفرصة','Record the opportunity'),t('الاحتياج وبيانات التواصل','The need and contact context')],
        [t('مسؤول واضح','A clear owner'),t('دور يراجع الطلب والخطوة المطلوبة','A role reviewing the request and next action')],
        [t('متابعة العرض','Follow up on the quote'),t('توثيق آخر تواصل والخطوة التالية','Record the last contact and next action')],
        [t('مراجعة القرار','Review the decision'),t('الملاحظات والمرحلة أمام الفريق','Feedback and stage in the team’s view')]
      ],
      insight: t('الهدف: كل عرض له مسؤول وخطوة متابعة موثّقة.','The aim: every quote has an owner and a recorded next action.')
    },
    overview: {
      nodes: [
        [t('توثيق الاحتياج','Record the need'),t('متطلبات الفرصة وبيانات التواصل','Opportunity requirements and contact context')],
        [t('توزيع الأدوار','Assign the roles'),t('مسؤول يعرف المطلوب من الفريق','An owner who knows what the team needs to do')],
        [t('تحديث المرحلة','Update the stage'),t('الملاحظات والإجراء القادم','Notes and the next action')],
        [t('مراجعة الفريق','Review team progress'),t('المرحلة والمسؤول والمتابعة في سياق واحد','Stage, owner and follow-up in one context')]
      ],
      insight: t('الهدف: صورة أوضح للإدارة، مبنية على تحديثات الفريق.','The aim: a clearer management view built on the team’s updates.')
    }
  };
  const renderCompare = () => {
    const before = root.dataset.crmSceneMode === 'before';
    el('transform-title').textContent = paths[selected].request;
    el('transform-context').textContent = before
      ? t('المعلومة موزّعة، والخطوة تحتاج سؤالًا.','The context is scattered and the next action needs a question.')
      : t('السياق أمام الفريق، والخطوة موضّحة.','The context is visible and the next step is defined.');
    el('transform-state').textContent = before
      ? t('نحتاج نجمع السياق','The context needs bringing together')
      : t('المتابعة لها مسار','Follow-up has a workflow');
    el('transform-contact').textContent = before ? t('آخر تواصل وين؟','Where is the last contact?') : t('تواصل موثّق','Contact recorded');
    el('transform-contact-note').textContent = before ? t('معلومة تحتاج مراجعة','Context needing review') : t('يُحدّثه فريقك','Updated by your team');
    el('transform-owner').textContent = before ? t('مين يتابع الطلب؟','Who follows this up?') : paths[selected].stages[1][1].split(' · ')[0];
    el('transform-owner-note').textContent = before ? t('دور يحتاج تحديدًا','An owner needing assignment') : t('دور محدد في المثال','An assigned example role');
    el('transform-action').textContent = before ? t('وش الخطوة الجاية؟','What happens next?') : paths[selected].stages[2][2];
    el('transform-action-note').textContent = before ? t('متابعة تحتاج توضيحًا','A next action needing clarity') : t('بعد توثيق التواصل','After recording contact');
    el('transform-caption').textContent = before
      ? t('نفس الطلب، لكن السياق يحتاج تجميعًا. المثال للتوضيح.','The same request, with context still to gather. This is an illustration.')
      : t('ترتيب المعلومات يساعد الفريق يعرف وش بعده. المثال للتوضيح.','Organized information helps the team see the next action. This is an illustration.');
  };
  const showCompare = (mode, interactive = true) => {
    if (!['before','after'].includes(mode)) return;
    root.dataset.crmSceneMode = mode;
    compareButtons.forEach(button => button.setAttribute('aria-pressed',String(button.dataset.crmCompare === mode)));
    renderCompare();
    if (interactive) {
      animatePanel(root.querySelector('.crm-transform-center'));
      announce(el('transform-caption').textContent);
      if (!started) { started = true; track('crm_preview_start'); }
    }
  };
  const renderPlan = () => {
    const sectorKey = Object.keys(sectors).find(key => sectors[key].value === sector.value);
    const business = sectorKey ? sectors[sectorKey] : null;
    const workflow = workflows[selected];
    sectorButtons.forEach(button => button.setAttribute('aria-pressed',String(button.dataset.crmPlanSector === sectorKey)));
    sourceButtons.forEach(button => button.setAttribute('aria-pressed',String(button.dataset.crmPlanSource === sourceKey)));
    el('plan-sector-label').textContent = business?.label || sector.value || t('حدد نشاطك','Choose your business');
    el('plan-source-label').textContent = sourceKey ? sources[sourceKey] : t('حدد بداية الطلب','Choose a request source');
    workflow.nodes.forEach(([title,copy],index) => {
      root.querySelector('[data-crm-plan-node-title="' + index + '"]').textContent = title;
      root.querySelector('[data-crm-plan-node-copy="' + index + '"]').textContent = index === 0
        ? (business?.context || copy) + (sourceKey ? ' · ' + sources[sourceKey] : '')
        : copy;
    });
    el('plan-insight').textContent = workflow.insight;
  };

  const showStage = (index, interactive = true) => {
    const values = paths[selected].stages[index];
    if (!values) return;
    stage = index;
    stageButtons.forEach((b,i) => b.setAttribute('aria-pressed', String(i === index)));
    ['stage','owner','action','due','explanation'].forEach((key,i) => el('campaign-' + key).textContent = values[i]);
    el('record-title').textContent = paths[selected].request;
    el('step-counter').textContent = String(index + 1).padStart(2,'0');
    el('campaign-handoff').hidden = index !== 3;
    el('tour-prev').disabled = index === 0;
    el('tour-next').hidden = index === 3;
    el('tour-finish').hidden = index !== 3;
    if (interactive) {
      announce(`${paths[selected].label}. ${index+1} / 4. ${values[0]}. ${values[4]}`);
      animatePanel(el('record'));
      if (!started) { started = true; track('crm_preview_start'); }
      if (index === 3 && !completed) { completed = true; track('crm_preview_complete'); }
    }
  };
  const setBriefSelection = () => {
    el('brief-selection').hidden = !pathChosen;
    el('brief-path-label').textContent = paths[selected].label;
    if (hasPrepared) prepareMessage();
  };
  const choosePath = key => {
    if (!paths[key]) return;
    selected = key; pathChosen = true;
    const path = paths[key];
    pathButtons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.crmPath === key)));
    ['kicker','title','copy'].forEach(k => el('path-' + k).textContent = path[k]);
    el('selected-label').textContent = path.label;
    need.placeholder = path.need;
    renderPlan();
    renderCompare();
    setBriefSelection();
    showStage(0);
    animatePanel(root.querySelector('#crm-path-result'));
  };
  const bindArrows = (buttons, onSelect) => buttons.forEach((button,index) => {
    button.addEventListener('keydown', event => {
      if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 :
        (index + (event.key === (en ? 'ArrowRight' : 'ArrowLeft') ? 1 : -1) + buttons.length) % buttons.length;
      buttons[next].focus(); onSelect(next);
    });
  });
  pathButtons.forEach(button => button.addEventListener('click', () => choosePath(button.dataset.crmPath)));
  root.querySelectorAll('[data-crm-path-controls],[data-crm-plan-path-controls]').forEach(group => {
    const buttons = [...group.querySelectorAll('[data-crm-path]')];
    bindArrows(buttons,index => choosePath(buttons[index].dataset.crmPath));
  });
  compareButtons.forEach(button => button.addEventListener('click',() => showCompare(button.dataset.crmCompare)));
  bindArrows(compareButtons,index => showCompare(compareButtons[index].dataset.crmCompare));
  const chooseSector = key => {
    if (!sectors[key]) return;
    sector.value = sectors[key].value;
    renderPlan();
    if (hasPrepared) prepareMessage();
    announce(t('النشاط: ','Business type: ') + sectors[key].label);
  };
  const chooseSource = key => {
    if (!sources[key]) return;
    sourceKey = key;
    renderPlan();
    if (hasPrepared) prepareMessage();
    announce(t('بداية الطلب: ','Request source: ') + sources[key]);
  };
  sectorButtons.forEach(button => button.addEventListener('click',() => chooseSector(button.dataset.crmPlanSector)));
  bindArrows(sectorButtons,index => chooseSector(sectorButtons[index].dataset.crmPlanSector));
  sourceButtons.forEach(button => button.addEventListener('click',() => chooseSource(button.dataset.crmPlanSource)));
  bindArrows(sourceButtons,index => chooseSource(sourceButtons[index].dataset.crmPlanSource));
  sector.addEventListener('change',renderPlan);
  stageButtons.forEach((button,index) => button.addEventListener('click', () => showStage(index)));
  bindArrows(stageButtons, showStage);
  el('tour-prev').addEventListener('click', () => showStage(Math.max(0,stage-1)));
  el('tour-next').addEventListener('click', () => showStage(Math.min(3,stage+1)));
  root.querySelectorAll('[data-crm-path-to-brief]').forEach(link => link.addEventListener('click', () => {
    pathChosen = true;
    if (link.hasAttribute('data-crm-plan-to-brief')) planRequested = true;
    if (!needEdited && !need.value.trim()) need.value = paths[selected].need;
    setBriefSelection();
  }));
  const updateBrand = value => {
    el('campaign-brand').textContent = value.trim() || t('مساحة عمل شركتك','Your business workspace');
    el('plan-brand').textContent = value.trim() || t('مسار شركتك','Your business workflow');
  };
  const validateText = () => {
    company.setCustomValidity(company.value.trim() ? '' : t('اكتب اسم المنشأة.','Enter your business name.'));
    need.setCustomValidity(need.value.trim() ? '' : t('اذكر احتياج المتابعة.','Describe your follow-up need.'));
  };
  const prepareMessage = () => {
    validateText();
    if (!form.checkValidity()) { messagePanel.hidden = true; return; }
    const businessType = sector.value;
    const team = el('brief-team').value;
    const lines = [
      t('السلام عليكم، ودي أناقش مشروع CRM مخصص لمنشأتنا في الرياض.','Hello, I would like to discuss a custom CRM project for our Riyadh business.'),
      `${t('المنشأة','Business')}: ${company.value.trim()}`,
      `${t('النشاط','Business type')}: ${businessType}`,
      ...(pathChosen ? [`${t('مسار الاهتمام','Workflow of interest')}: ${paths[selected].label}`] : []),
      ...(sourceKey ? [t('بداية الطلب','Request source') + ': ' + sources[sourceKey]] : []),
      ...(planRequested ? [t('التصور الأولي للمناقشة','Starting workflow to discuss') + ': ' + workflows[selected].nodes.map(node=>node[0]).join(en ? ' → ' : ' ← ')] : []),
      ...(team ? [`${t('عدد متابعي العملاء','People following up')}: ${team}`] : []),
      `${t('الاحتياج','Need')}: ${need.value.trim()}`,
      t('أرغب بمراجعة مسار الفريق ونطاق التنفيذ والتكلفة وشروط التجربة.','I would like to review the team workflow, build scope, cost and trial terms.')
    ];
    messageText.value = lines.join('\n');
    const url = new URL(whatsappBase); url.searchParams.set('text',messageText.value);
    whatsapp.href = url.href; messagePanel.hidden = false;
  };
  name.addEventListener('input', () => {
    company.value = name.value; updateBrand(name.value); validateText();
    if (hasPrepared) prepareMessage();
  });
  company.addEventListener('input', () => {
    name.value = company.value; updateBrand(company.value); validateText();
  });
  need.addEventListener('input', () => { needEdited = true; validateText(); });
  form.addEventListener('submit', event => {
    event.preventDefault(); validateText();
    if (!form.reportValidity()) return;
    hasPrepared = true; prepareMessage();
    if (messagePanel.hidden) return;
    track('crm_brief_prepared');
    messageText.focus({preventScroll:true});
    messagePanel.scrollIntoView({block:'nearest',behavior:reduced.matches?'auto':'smooth'});
  });
  form.addEventListener('input', () => { if (hasPrepared) prepareMessage(); });
  form.addEventListener('change', () => { if (hasPrepared) prepareMessage(); });

  ['path-controls','campaign-controls','tour-actions','compare-controls','plan-controls','campaign-form'].forEach(k => el(k).hidden=false);
  showStage(0,false);
  showCompare('after',false);
  renderPlan();
  updateBrand(company.value);
  const sections = [...root.querySelectorAll('[data-crm-nav-section]')];
  const navLinks = [...root.querySelectorAll('[data-crm-nav]')];
  const setNav = id => navLinks.forEach(link => {
    if (link.dataset.crmNav === id) link.setAttribute('aria-current','location');
    else link.removeAttribute('aria-current');
  });
  navLinks.forEach(link => link.addEventListener('click',() => setNav(link.dataset.crmNav)));
  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver(entries => {
      const visible = entries.filter(e=>e.isIntersecting).sort((a,b)=>Math.abs(a.boundingClientRect.top-180)-Math.abs(b.boundingClientRect.top-180));
      if (visible[0]) setNav(visible[0].target.id);
    },{rootMargin:'-120px 0px -55% 0px',threshold:0});
    sections.forEach(section => navObserver.observe(section));
    const revealNodes = [...root.querySelectorAll('[data-crm-reveal]')];
    let revealObserver;
    if (!reduced.matches) {
      root.classList.add('crm-motion-ready');
      revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); }
      }),{rootMargin:'0px 0px 35px 0px',threshold:0.06});
      revealNodes.forEach(node => revealObserver.observe(node));
    }
    const sceneObserver = new IntersectionObserver(entries => {
      root.classList.toggle('crm-scene-paused',!entries[0].isIntersecting);
    },{threshold:0});
    sceneObserver.observe(root.querySelector('.crm-campaign-hero'));
    reduced.addEventListener('change',event => {
      if (event.matches) {
        revealObserver?.disconnect();
        root.classList.remove('crm-motion-ready');
        revealNodes.forEach(node=>node.classList.add('is-visible'));
      }
    });
  }
  document.addEventListener('visibilitychange',() => root.classList.toggle('crm-page-paused',document.hidden));
})();
