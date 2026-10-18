// Fixed to the actual identity-content revision, not the build time.
export const profileUpdatedAt = "2026-10-18T01:07:16+00:00";

export function renderOfficialProfiles({ site, english = false, esc, icon }) {
  const profiles = [
    ["GitHub", site.social.github, "EslamElshikh-dev"],
    [english ? "Eslam Elshikh on Google" : "إسلام الشيخ على Google", site.social.googleKnowledgePanel, "Eslam Elshikh"],
    [english ? "Google Developer Program" : "Google للمطورين", site.social.googleDeveloper, "EslamElshikh"],
    ["Facebook", site.social.facebook, "@eslamelshikhdev"],
    ["Instagram", site.social.instagram, "@remoesoo10"],
    ["X", site.social.x, "@remoesoo10"],
    ["Threads", site.social.threads, "@remoesoo10"],
    ["YouTube", site.social.youtube, "Eslam Elshikh"],
    ["TikTok", site.social.tiktok, "@remoesoo"]
  ];
  const headingId = "official-profiles-title";
  return `<section class="section-pad identity-profiles" id="official-profiles" aria-labelledby="${headingId}"><div class="container"><div class="identity-profiles-heading"><p class="story-kicker">${english ? "OFFICIAL PROFILES" : "الحسابات والملفات الرسمية"}</p><h2 id="${headingId}">${english ? "One identity, across my public profiles." : "هوية واحدة، عبر ملفاتي العامة."}</h2><p>${english ? "Find my Google Knowledge Panel, developer profile, and public accounts under Eslam Elshikh and إسلام الشيخ." : "بطاقتي المعرفية على Google وملف المطور وحساباتي العامة، باسم إسلام الشيخ وEslam Elshikh."}</p></div><ul class="identity-profile-grid">${profiles.map(([label, url, handle]) => `<li><a href="${esc(url)}" target="_blank" rel="me noopener"><span class="identity-profile-name">${esc(label)}${icon("external")}</span><span class="identity-profile-handle" dir="ltr">${esc(handle)}</span></a></li>`).join("")}</ul><a class="text-link" href="${english ? "/en" : ""}/work-evidence/">${english ? "Review the evidence behind my work" : "راجع أدلة تنفيذ الأعمال"}${icon("arrow")}</a></div></section>`;
}
