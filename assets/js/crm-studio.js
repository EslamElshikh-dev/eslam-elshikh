(() => {
 'use strict';
 const en = document.documentElement.lang === 'en';
 const normalize = text => text.normalize('NFKD').toLowerCase().replace(/[\u064b-\u065f\u0670\u0640]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').trim();
 document.querySelectorAll('[data-crm-answers]').forEach(section => {
  const tools=section.querySelector('[data-crm-tools]');
  const input=section.querySelector('[data-crm-search]');
  const result=section.querySelector('[data-crm-result]');
  const empty=section.querySelector('[data-crm-empty]');
  const buttons=[...section.querySelectorAll('[data-crm-topic]')];
  const questions=[...section.querySelectorAll('[data-crm-question]')].map(node=>({node,text:normalize(node.textContent),topic:node.dataset.crmQuestion}));
  if(!tools||!input||!result||!empty)return;
  let topic='all';
  const filter = () => {
   const query=normalize(input.value);let count=0;
   questions.forEach(({node,text,topic:itemTopic})=>{node.hidden=!(topic==='all'||topic===itemTopic)||!text.includes(query);if(!node.hidden)count++;});
   result.textContent=en?`${count} of ${questions.length} answers`:`عرض ${count} من ${questions.length} إجابات`;
   empty.hidden=count>0;
  };
  buttons.forEach(button=>button.addEventListener('click',()=>{topic=button.dataset.crmTopic;buttons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));filter();}));
  input.addEventListener('input',filter);tools.hidden=false;filter();
 });
 // Keep the selected workflow tab visible on narrow screens without scrolling the page.
 document.querySelectorAll('.crm-tabs').forEach(tabs=>{
  tabs.addEventListener('click',event=>{
   const button=event.target.closest('[data-product-tab]');if(!button||!tabs.contains(button))return;
   const view=tabs.getBoundingClientRect();const rect=button.getBoundingClientRect();
   const delta=rect.left<view.left?rect.left-view.left:rect.right>view.right?rect.right-view.right:0;
   if(delta)tabs.scrollBy({left:delta,behavior:'auto'});
  });
 });
})();

(() => {
 'use strict';
 const en=document.documentElement.lang==='en';
 document.querySelectorAll('[data-crm-lab]').forEach(lab=>{
  const controls=lab.querySelector('[data-crm-lab-controls]');
  const sectorButtons=[...lab.querySelectorAll('[data-crm-sector]')];
  const toneButtons=[...lab.querySelectorAll('[data-crm-tone]')];
  const plans=[...lab.querySelectorAll('[data-crm-plan]')];
  const name=lab.querySelector('[data-crm-brand]');
  const previewName=lab.querySelector('[data-crm-brand-preview]');
  const selected=lab.querySelector('[data-crm-selected]');
  const priorities=[...lab.querySelectorAll('[data-crm-priority]')];
  const panel=lab.querySelector('[data-crm-brief-panel]');
  const brief=lab.querySelector('[data-crm-brief]');
  const request=lab.querySelector('[data-crm-request]');
  const status=lab.querySelector('[data-crm-brief-status]');
  const requirement=lab.querySelector('[data-crm-requirement]');
  if(!controls||!name||!previewName||!selected||!panel||!brief||!request||!status||!requirement||!plans.length)return;
  let sector='company',tone='silver';
  const choices=()=>priorities.filter(i=>i.checked).map(i=>i.value);
  const update=()=>{
   previewName.textContent=name.value.trim()||(en?'Your business workspace':'مساحة عمل منشأتك');
   const list=choices();selected.textContent=list.length?list.join(' · '):(en?'Choose a priority to discuss.':'حدد أولوية لنناقشها.');
   if(!panel.hidden)prepare();
  };
  const prepare=()=>{
   const business=plans.find(p=>p.dataset.crmPlan===sector).dataset.crmSectorName;
   const color=toneButtons.find(b=>b.dataset.crmTone===tone).textContent.trim();
   const list=choices();
   const lines=en?['Hello Eng. Eslam, I would like a working custom CRM trial.',`Business: ${name.value.trim()||'To be discussed'}`,`Business type: ${business}`,`Preview color direction: ${color} (final brand to be agreed)`,`Priorities: ${list.length?list.join(', '):'To be discussed'}`,requirement.value.trim()?`Specific task: ${requirement.value.trim()}`:'','Please confirm the proposed trial tasks, scope, timing and commercial terms.']:['مرحبًا م. إسلام، أرغب في تجربة CRM فعلية مخصصة لنشاطي.',`اسم المنشأة: ${name.value.trim()||'نحدده في النقاش'}`,`نوع النشاط: ${business}`,`اتجاه لون المعاينة: ${color} (الهوية النهائية نعتمدها معًا)`,`الأولويات: ${list.length?list.join('، '):'نحددها في النقاش'}`,requirement.value.trim()?`مهمة خاصة: ${requirement.value.trim()}`:'','أرغب في تحديد مهام التجربة ونطاقها وموعدها والشروط التجارية.'];
   if(lab.dataset.crmDemoIncluded)lines.push(en?'Tasks to test: recording a request, assigning an owner, setting a next action and reviewing the activity record.':'مهام أرغب في اختبارها: تسجيل الطلب، تعيين المسؤول، تحديد المتابعة، ومراجعة سجل الخطوات.');
   const message=lines.filter(Boolean).join('\n');brief.value=message;request.href='https://wa.me/966579395299?text='+encodeURIComponent(message);status.textContent=en?'Request prepared. Review it in WhatsApp before sending.':'الطلب جاهز. راجعه في WhatsApp قبل الإرسال.';
  };
  sectorButtons.forEach(button=>button.addEventListener('click',()=>{
   if(sector!==button.dataset.crmSector)delete lab.dataset.crmDemoIncluded;
   sector=button.dataset.crmSector;sectorButtons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));plans.forEach(p=>p.hidden=p.dataset.crmPlan!==sector);update();
  }));
  toneButtons.forEach(button=>button.addEventListener('click',()=>{
   tone=button.dataset.crmTone;toneButtons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));lab.querySelector('.crm-lab-preview').className='crm-lab-preview crm-tone-'+tone;update();
  }));
  name.addEventListener('input',update);priorities.forEach(input=>input.addEventListener('change',update));requirement.addEventListener('input',update);
  lab.querySelector('[data-crm-prepare]').addEventListener('click',()=>{panel.hidden=false;prepare();brief.focus({preventScroll:false});});
  lab.addEventListener('crm:include-demo',()=>{
   priorities.forEach((input,i)=>{if(i<4)input.checked=true;});
   panel.hidden=false;update();brief.focus({preventScroll:false});
  });
  controls.hidden=false;update();
 });
})();

(() => {
 'use strict';
 const en=document.documentElement.lang==='en';
 const labels=en?['Record the request','Assign the owner','Set the next action','Add these tasks to my trial request']:['سجّل الطلب','اعتمد المسؤول','حدّد المتابعة','أضف هذه المهام لطلب تجربتي'];
 document.querySelectorAll('[data-crm-lab]').forEach(lab=>{
  const dialog=lab.querySelector('[data-crm-demo]');
  if(!dialog||typeof dialog.showModal!=='function')return;
  const form=dialog.querySelector('[data-crm-demo-form]');
  const subject=dialog.querySelector('[data-crm-demo-subject]');
  const owner=dialog.querySelector('[data-crm-demo-owner]');
  const action=dialog.querySelector('[data-crm-demo-action]');
  const sections=[...dialog.querySelectorAll('[data-crm-demo-step]')];
  const progress=[...dialog.querySelectorAll('[data-crm-demo-progress]')];
  const benefits=[...dialog.querySelectorAll('[data-crm-demo-benefit]')];
  const back=dialog.querySelector('[data-crm-demo-back]');
  const nextLabel=dialog.querySelector('[data-crm-demo-next-label]');
  const log=dialog.querySelector('[data-crm-demo-log]');
  const status=dialog.querySelector('[data-crm-demo-status]');
  let phase=0,record={};
  const populate=(select,items)=>{
   select.replaceChildren();
   [en?'Choose an option':'اختر من الخيارات',...items].forEach((text,i)=>{
    const option=document.createElement('option');option.value=i?text:'';option.textContent=text;select.append(option);
   });
  };
  const render=()=>{
   sections.forEach((section,i)=>section.hidden=i!==phase);
   benefits.forEach((benefit,i)=>benefit.hidden=i!==phase);
   progress.forEach((item,i)=>{
    item.dataset.state=i<phase?'done':i===phase?'current':'pending';
    if(i===phase)item.setAttribute('aria-current','step');else item.removeAttribute('aria-current');
   });
   back.hidden=phase===0;nextLabel.textContent=labels[phase];
   status.textContent=en?`Step ${phase+1} of 4`:`الخطوة ${phase+1} من 4`;
   dialog.querySelector('[data-crm-demo-record-subject]').textContent=record.subject||(en?'Not recorded yet':'لم يُسجّل بعد');
   dialog.querySelector('[data-crm-demo-record-owner]').textContent=record.owner||(en?'To be assigned':'بانتظار الإسناد');
   dialog.querySelector('[data-crm-demo-record-action]').textContent=record.action||(en?'To be defined':'لم تُحدد بعد');
   dialog.querySelector('[data-crm-demo-record-status]').textContent=record.action?(en?'Ready for follow-up':'جاهز للمتابعة'):record.owner?(en?'Assigned':'تم الإسناد'):record.subject?(en?'Recorded':'تم التسجيل'):(en?'Example in preparation':'مثال قيد التجهيز');
   log.replaceChildren();
   [[record.subject,en?'Request recorded':'تسجيل الطلب'],[record.owner,en?'Owner assigned':'إسناد المسؤول'],[record.action,en?'Next action set':'تحديد المتابعة']].forEach(([value,label])=>{
    if(!value)return;
    const item=document.createElement('li');const title=document.createElement('strong');const detail=document.createElement('span');
    title.textContent=label;detail.textContent=value;item.append(title,detail);log.append(item);
   });
   dialog.querySelector('[data-crm-demo-log-empty]').hidden=!!record.subject;
  };
  const move=step=>{phase=step;render();sections[phase].querySelector('h3').focus({preventScroll:false});};
  const launchers=[...lab.querySelectorAll('[data-crm-rehearse]')];
  const open=button=>{
    if(dialog.open)dialog.close();
    const plan=button.closest('[data-crm-plan]');phase=0;record={};subject.value=button.dataset.demoRequest;subject.setCustomValidity('');
    populate(owner,[...plan.querySelectorAll('.crm-lab-roles>div>span')].map(item=>item.textContent.trim()));
    populate(action,[button.dataset.demoAction,en?'Ask for more information':'طلب تفاصيل إضافية',en?'Review the request with management':'مراجعة الطلب مع الإدارة']);
    dialog.querySelector('[data-crm-demo-brand]').textContent=lab.querySelector('[data-crm-brand-preview]').textContent;
    render();history.replaceState(history.state,'','#'+button.id);dialog.showModal();subject.focus({preventScroll:true});
  };
  launchers.forEach(button=>{
   button.hidden=false;button.addEventListener('click',()=>open(button));
  });
  dialog.querySelector('[data-crm-demo-close]').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{if(!dialog.open&&launchers.some(button=>location.hash==='#'+button.id))history.replaceState(history.state,'','#crm-personal-trial');});
  back.addEventListener('click',()=>{if(phase>0)move(phase-1);});
  subject.addEventListener('input',()=>subject.setCustomValidity(''));
  form.addEventListener('submit',event=>{
   event.preventDefault();
   if(phase===0){
    subject.setCustomValidity(subject.value.trim()?'':(en?'Enter a sample request subject.':'اكتب عنوانًا للطلب التجريبي.'));
    if(!subject.reportValidity())return;record.subject=subject.value.trim();
   }else if(phase===1){if(!owner.reportValidity())return;record.owner=owner.value;
   }else if(phase===2){if(!action.reportValidity())return;record.action=action.value;
   }else{
    lab.dataset.crmDemoIncluded='true';dialog.close();lab.dispatchEvent(new CustomEvent('crm:include-demo'));return;
   }
   move(phase+1);
  });
  const openFromHash=()=>{
   const button=launchers.find(button=>location.hash==='#'+button.id);if(!button)return;
   const sector=button.closest('[data-crm-plan]').dataset.crmPlan;
   lab.querySelector(`[data-crm-sector="${sector}"]`).click();open(button);
  };
  window.addEventListener('hashchange',openFromHash);openFromHash();
 });
})();
