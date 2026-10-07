// A dated, manually reviewed snapshot. Only business names, public Maps CIDs,
// and workflow states are retained. No account URLs, store codes or addresses.
export const accountReviewDate = "2026-10-07";
const verified = "verified";
const rows = [
  ["أبو آدم لخدمات صيانة الديكور الخشبي والموبيليا", "5329212634280123442", verified],
  ["أبو رائد لخدمات الدهانات", "13918176190770485515", verified],
  ["أبو غيث حداد ابواب ونوافذ", "11492642801654205914", verified],
  ["أبو فؤاد لخدمات تفصيل الخزائن الخشبية", "11971171566477389147", verified],
  ["أمين سرور لخدمات السباكة وصيانة الكهرباء", "809316932329652691", verified],
  ["أبو محمد سباك وكهربائي", "17693792217964304335", "processing"],
  ["الرضا لصيانة وتفصيل الخزائن", null, "confirmation"],
  ["الفقية كهربائي وسباك", "15829663282597122448", verified],
  ["تعاود للصيانة والتشغيل", "10951974762186752976", "confirmation"],
  ["تفصيل دواليب وغرف ملابس", "12193821414518186124", verified],
  ["جبس بورد معلم جبس أبو ابراهيم", null, "processing"],
  ["دهانات عليا", "6767429191682531127", verified],
  ["دهانات وورق الجدران أبو صالح", "6344461274912850870", verified],
  ["زايد للديكورات والدهانات", "1897748647829048451", verified],
  ["شركة تعاود للمقاولات — الدمام", "14473534090041620558", verified],
  ["شركة تعاود للمقاولات — الرياض", "10137711914490617617", verified],
  ["عادل أديب فني ديكور", "2608524584471932598", verified],
  ["عبدالحكيم للكهرباء والإنارة الحديثة", null, "confirmation"],
  ["عبدالله لأعمال الحداد وتركيب الساندوتش بانل", "9430058594512080494", "confirmation"],
  ["عمر شهزاد فني سباكة وكهرباء", "9159762841151103468", "confirmation"],
  ["فني سباك وكهربائي مصلح صالح", "16159888974867028772", verified],
  ["كرمز كافيه", "11638879468923755595", verified],
  ["كهربائي وسباك العارض أبو ليث", "13473435412033668842", verified],
  ["مؤسسة آفاق الاحترافية للدواجن", "6057541754283792803", verified],
  ["مؤسسة صروح الاختصاص للمقاولات", "11034322791727195323", verified],
  ["مؤسسة فيصل الحربي للألمنيوم والزجاج", "15332624632434218485", verified],
  ["مؤسسة كيان الازدهار للألمنيوم والزجاج", "9467171334533522220", verified],
  ["مجدي رزق فني نجارة", "3348526091528547289", verified],
  ["محترف أعمال السباكة والكهرباء", "995433213391221534", verified],
  ["مركز دار البديع للحجامة — خميس مشيط", "7015695672151507629", verified],
  ["مركز سما سكان للأشعة", "249734721661275541", verified],
  ["مؤسسة وليد سعود الثبيتي للتجارة", "13083942540739396774", verified],
  ["النجار الماهر لتفصيل الخزائن والدواليب", "17960702198771263311", verified],
  ["نجار تفصيل خزائن", "10152361801652394359", verified],
  ["يوسف للكهرباء والإنارة الحديثة", "12934607898949691811", verified]
];

export const accountProfiles = rows.map(([title, cid, state]) => ({
  title, cid, state, reviewedAt: accountReviewDate,
  publicUrl: cid ? `https://maps.google.com/maps?cid=${cid}` : null
}));
export const ownProfileReview = { title: "المهندس إسلام الشيخ", cid: "11144656483074905822", state: verified, reviewedAt: accountReviewDate };
export const accountReviewByCid = new Map(accountProfiles.filter(item => item.cid).map(item => [item.cid, item]));
export const accountReviewSummary = {
  reviewedProfiles: accountProfiles.length + 1,
  clientProfiles: accountProfiles.length,
  verifiedClientProfiles: accountProfiles.filter(item => item.state === verified).length,
  ongoingClientProfiles: accountProfiles.filter(item => item.state !== verified).length
};
export const accountStateLabel = (state, english = false) => ({
  verified: english ? "Verified at review" : "مثبت الملكية وقت المراجعة",
  processing: english ? "Verification processing" : "قيد معالجة التوثيق",
  confirmation: english ? "Confirmation in progress" : "استكمال تأكيد البيانات"
}[state]);
