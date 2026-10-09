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
  const form = el('campaign-form');
  const messagePanel = el('campaign-message');
  const messageText = el('campaign-message-text');
  const whatsapp = el('campaign-whatsapp');
  const whatsappBase = whatsapp.href;
  const stageButtons = [...root.querySelectorAll('[data-crm-campaign-step]')];
  const pathButtons = [...root.querySelectorAll('[data-crm-path]')];
  let selected = 'quotes', stage = 0, pathChosen = false;
  let started = false, completed = false, hasPrepared = false, needEdited = false;
  const animatePanel = panel => {
    if (!reduced.matches && panel?.animate) panel.animate(
      [{ opacity: 0.75, transform: 'translateY(5px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 240, easing: 'ease-out' }
    );
  };
  const announce = text => el('campaign-announcement').textContent = text;
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
  bindArrows(pathButtons, index => choosePath(pathButtons[index].dataset.crmPath));
  stageButtons.forEach((button,index) => button.addEventListener('click', () => showStage(index)));
  bindArrows(stageButtons, showStage);
  el('tour-prev').addEventListener('click', () => showStage(Math.max(0,stage-1)));
  el('tour-next').addEventListener('click', () => showStage(Math.min(3,stage+1)));
  root.querySelectorAll('[data-crm-path-to-brief]').forEach(link => link.addEventListener('click', () => {
    pathChosen = true;
    if (!needEdited && !need.value.trim()) need.value = paths[selected].need;
    setBriefSelection();
  }));
  const updateBrand = value => el('campaign-brand').textContent = value.trim() || t('مساحة عمل شركتك','Your business workspace');
  const validateText = () => {
    company.setCustomValidity(company.value.trim() ? '' : t('اكتب اسم المنشأة.','Enter your business name.'));
    need.setCustomValidity(need.value.trim() ? '' : t('اذكر احتياج المتابعة.','Describe your follow-up need.'));
  };
  const prepareMessage = () => {
    validateText();
    if (!form.checkValidity()) { messagePanel.hidden = true; return; }
    const sector = el('brief-sector').value;
    const team = el('brief-team').value;
    const lines = [
      t('السلام عليكم، ودي أناقش مشروع CRM مخصص لمنشأتنا في الرياض.','Hello, I would like to discuss a custom CRM project for our Riyadh business.'),
      `${t('المنشأة','Business')}: ${company.value.trim()}`,
      `${t('النشاط','Business type')}: ${sector}`,
      ...(pathChosen ? [`${t('مسار الاهتمام','Workflow of interest')}: ${paths[selected].label}`] : []),
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

  const process = [
    [t('نفهم شغلك','Understand your work'),t('نبدأ من المسار، قبل الشاشة.','Start with the workflow, before the screen.'),t('نراجع كيف يصل الطلب، ومن يستلمه، ومتى يحتاج متابعة. نحدد الأدوار والمهام التي تستحق أن يجمعها النظام.','Review how a request arrives, who takes it and when it needs follow-up. Agree the roles and tasks worth connecting.'),t('احتياج محدد · أدوار واضحة · نطاق وشروط','Defined need · clear roles · scope and terms')],
    [t('يختبر فريقك','Your team tests'),t('خلّ الفريق يجرّب طريقة عمله.','Let the team test its own workflow.'),t('نناقش تجربة مخصصة بهوية منشأتك ومهام متفق عليها. يختبرها الفريق ببيانات اختبار، ويحدد ما يحتاج تعديلًا.','Discuss a custom trial with your branding and agreed tasks. Your team tests with sample data and identifies changes.'),t('مهام متفق عليها · بيانات اختبار · ملاحظات الفريق','Agreed tasks · test data · team feedback')],
    [t('نراجع ونبني','Review and build'),t('التنفيذ الكامل، على نطاق مفهوم.','A full build with a clear scope.'),t('نراجع الملاحظات، ثم نحدد نطاق التنفيذ والربط والصلاحيات والدعم والتكلفة. تبدأ الخطوة التالية بعد الاتفاق.','Review feedback, then agree the build, integrations, permissions, support and cost. The next step follows that agreement.'),t('نطاق تنفيذ · تكلفة واضحة · دعم متفق عليه','Build scope · clear cost · agreed support')]
  ];
  const buildButtons = [...root.querySelectorAll('[data-crm-build-step]')];
  const showBuild = index => {
    buildButtons.forEach((b,i) => b.setAttribute('aria-pressed',String(i===index)));
    ['label','title','copy','note'].forEach((k,i) => el('build-' + k).textContent = process[index][i]);
    animatePanel(root.querySelector('#crm-build-panel'));
    announce(`${process[index][0]}. ${process[index][1]}`);
  };
  buildButtons.forEach((button,index) => button.addEventListener('click',() => showBuild(index)));
  bindArrows(buildButtons,showBuild);

  ['path-controls','campaign-controls','tour-actions','build-controls','campaign-form'].forEach(k => el(k).hidden=false);
  showStage(0,false);
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
