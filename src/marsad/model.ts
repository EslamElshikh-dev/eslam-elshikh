export const statuses = {review:'قيد المراجعة',verification:'بحاجة للتحقق',suspended:'معلّق',disabled:'موقوف',rejected:'اعتراض مرفوض',restored:'مستعاد',unknown:'غير مؤكد',archived:'مؤرشف'} as const;
export const priorities = {urgent:'عاجلة',high:'مرتفعة',medium:'متوسطة',low:'منخفضة'} as const;
export const issues = {posting:'تقييد النشر',deceptive:'محتوى مخادع',existence:'وجود النشاط',video:'التحقق بالفيديو',ownership:'الملكية والوصول',edits:'تعديلات معلّقة',other:'مشكلة أخرى'} as const;
export const evidenceStates = {available:'متوفر',needed:'ناقص',review:'يحتاج مراجعة',unconfirmed:'غير مؤكد',na:'لا ينطبق'} as const;
export type Evidence = {id:string;title:string;state:keyof typeof evidenceStates;note:string;url:string};
export type CaseEvent = {id:string;date:string;title:string;body:string;kind:'note'|'submitted'|'decision'|'evidence'|'verification'|'update'};
export type CaseRecord = {
 id:string;name:string;shortName:string;category:string;city:string;status:keyof typeof statuses;googleStatus:string;issue:keyof typeof issues;
 reason:string;priority:keyof typeof priorities;profileId:string;caseNumber:string;lastAction:string;lastVerified:string;nextFollowup:string;nextStep:string;
 businessModel:'sab'|'storefront'|'hybrid'|'unknown';addressHidden:'yes'|'no'|'unknown';website:string;email:string;notes:string;tags:string[];
 evidence:Evidence[];events:CaseEvent[];appealDraft:string;draftUpdated:string;source:string;sourceUrl:string;
};
export type SavedCase = CaseRecord & {revision:number;updatedAt:string};
export const rank = {urgent:0,high:1,medium:2,low:3};
export const models = {sab:'نشاط منطقة خدمة (SAB)',storefront:'مقر يستقبل العملاء',hybrid:'مقر + منطقة خدمة',unknown:'غير مؤكد'};
export const hiddenStates = {yes:'مخفي',no:'ظاهر',unknown:'غير مؤكد'};
export function today(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Riyadh',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
export function formatDate(date:string,long=false){if(!date)return 'غير مسجّل';const d=new Date(date.length===10?date+'T12:00:00+03:00':date);if(Number.isNaN(d.getTime()))return 'غير مسجّل';return new Intl.DateTimeFormat('ar-SA-u-ca-gregory',{timeZone:'Asia/Riyadh',day:'numeric',month:long?'long':'short',...(long?{year:'numeric' as const}:{})}).format(d);}
export const number=(n:number)=>new Intl.NumberFormat('ar-SA').format(n);
export function evidenceProgress(c:CaseRecord){const a=c.evidence.filter(e=>e.state!=='na');const ready=a.filter(e=>e.state==='available').length;return {ready,total:a.length,percent:a.length?Math.round(ready/a.length*100):0};}
export function safeLink(s:string){try{const u=new URL(s);return ['https:','http:'].includes(u.protocol)?u.href:''}catch{return ''}}
export function makeId(){return globalThis.crypto?.randomUUID?.()??('case-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,12));}
export function blankCase():CaseRecord{return {id:makeId(),name:'',shortName:'',category:'',city:'',status:'unknown',googleStatus:'',issue:'other',reason:'',priority:'medium',profileId:'',caseNumber:'',lastAction:'',lastVerified:'',nextFollowup:'',nextStep:'',businessModel:'unknown',addressHidden:'unknown',website:'',email:'',notes:'',tags:[],evidence:[],events:[],appealDraft:'',draftUpdated:'',source:'',sourceUrl:''};}
