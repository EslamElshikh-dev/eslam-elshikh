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
