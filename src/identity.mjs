// Fixed to the actual identity-content revision, not the build time.
export const profileUpdatedAt = "2026-10-21T04:26:04+00:00";

export function getOfficialProfiles(site, english = false) {
  return [
    ["GitHub", site.social.github, "EslamElshikh-dev"],
    [english ? "Eslam Elshikh on Google" : "إسلام الشيخ على Google", site.social.googleKnowledgePanel, "Eslam Elshikh"],
    [english ? "Google Developer Program" : "Google للمطورين", site.social.googleDeveloper, "EslamElshikh"],
    ["Facebook", site.social.facebook, "@eslamelshikhdev"],
    ["Instagram", site.social.instagram, "@remoesoo10"],
    ["X", site.social.x, "@remoesoo10"],
    ["Threads", site.social.threads, "@remoesoo10"],
    ["YouTube", site.social.youtube, "@remoesoo10"],
    ["YouTube", site.social.youtubeTutorials, "@EslamElshikh10"],
    ["TikTok", site.social.tiktok, "@remoesoo"]
  ];
}

export function renderContactCard(site) {
  const text = (value) => String(value).replace(/\\/g, "\\\\").replace(/\r\n|\r|\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,");
  // Fold UTF-8 lines without splitting a code point. Continuation spaces count
  // toward the 75-byte limit, and contact importers receive standard CRLFs.
  const fold = (line) => {
    const lines = [];
    let part = "";
    let bytes = 0;
    for (const char of line) {
      const size = Buffer.byteLength(char, "utf8");
      if (bytes + size > 75) {
        lines.push(part);
        part = " ";
        bytes = 1;
      }
      part += char;
      bytes += size;
    }
    return [...lines, part].join("\r\n");
  };
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `UID:${site.url}/#person`,
    `FN:${text(`${site.nameAr} | ${site.nameEn}`)}`,
    "N:Elshikh;Eslam;;;",
    "TITLE:Cybersecurity Engineer and Software Developer",
    "ORG:Independent",
    `TEL;TYPE=WORK,VOICE:${site.phone}`,
    `EMAIL;TYPE=INTERNET,WORK:${site.email}`,
    `URL:${site.url}/about/`,
    `NOTE:${text("Cybersecurity, software and web development, AI agents and automation, Google Maps and local SEO. الرياض، السعودية.")}`,
    `X-SOCIALPROFILE;TYPE=github:${site.social.github}`,
    `X-SOCIALPROFILE;TYPE=google-developer:${site.social.googleDeveloper}`,
    `X-SOCIALPROFILE;TYPE=youtube:${site.social.youtube}`,
    `X-SOCIALPROFILE;TYPE=youtube:${site.social.youtubeTutorials}`,
    `REV:${new Date(profileUpdatedAt).toISOString().replace(/[-:]/g, "").replace(".000", "")}`,
    "END:VCARD"
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}

export function renderOfficialProfiles({ site, english = false, esc, icon }) {
  const profiles = getOfficialProfiles(site, english);
  const headingId = "official-profiles-title";
  return `<section class="section-pad identity-profiles" id="official-profiles" aria-labelledby="${headingId}"><div class="container"><div class="identity-profiles-heading"><p class="story-kicker">${english ? "OFFICIAL PROFILES" : "الحسابات والملفات الرسمية"}</p><h2 id="${headingId}">${english ? "One identity, across my public profiles." : "هوية واحدة، عبر ملفاتي العامة."}</h2><p>${english ? "Find my Google Knowledge Panel, developer profile, and public accounts under Eslam Elshikh and إسلام الشيخ." : "بطاقتي المعرفية على Google وملف المطور وحساباتي العامة، باسم إسلام الشيخ وEslam Elshikh."}</p></div><ul class="identity-profile-grid">${profiles.map(([label, url, handle]) => `<li><a href="${esc(url)}" target="_blank" rel="me noopener"><span class="identity-profile-name">${esc(label)}${icon("external")}</span><span class="identity-profile-handle" dir="ltr">${esc(handle)}</span></a></li>`).join("")}</ul><div class="identity-profile-actions"><a class="button button-ghost" href="/eslam-elshikh.vcf" download="Eslam_Elshikh.vcf">${icon("phone")}${english ? "Save my contact details" : "احفظ بيانات التواصل"}</a><a class="text-link" href="${english ? "/en" : ""}/work-evidence/">${english ? "Review the evidence behind my work" : "راجع أدلة تنفيذ الأعمال"}${icon("arrow")}</a></div></div></section>`;
}
