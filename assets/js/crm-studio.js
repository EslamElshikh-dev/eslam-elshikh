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
   const message=lines.filter(Boolean).join('\n');brief.value=message;request.href='https://wa.me/966579395299?text='+encodeURIComponent(message);status.textContent=en?'Request prepared. Review it in WhatsApp before sending.':'الطلب جاهز. راجعه في WhatsApp قبل الإرسال.';
  };
  sectorButtons.forEach(button=>button.addEventListener('click',()=>{
   sector=button.dataset.crmSector;sectorButtons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));plans.forEach(p=>p.hidden=p.dataset.crmPlan!==sector);update();
  }));
  toneButtons.forEach(button=>button.addEventListener('click',()=>{
   tone=button.dataset.crmTone;toneButtons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));lab.querySelector('.crm-lab-preview').className='crm-lab-preview crm-tone-'+tone;update();
  }));
  name.addEventListener('input',update);priorities.forEach(input=>input.addEventListener('change',update));requirement.addEventListener('input',update);
  lab.querySelector('[data-crm-prepare]').addEventListener('click',()=>{panel.hidden=false;prepare();brief.focus({preventScroll:false});});
  controls.hidden=false;update();
 });
})();
