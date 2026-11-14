export const googlePartnerBadgeRevision = "2026-11-14";

// Verified in Google Partners for Eslam Elshikh and www.eslam-elshikh.com.
export function renderGooglePartnerBadge({ english = false, standalone = false } = {}) {
  const label = english
    ? "Verify Eslam Elshikh's Google Partner status (opens in a new tab)"
    : "التحقق من تصنيف إسلام الشيخ كشريك Google (يفتح في تبويب جديد)";
  return `<div class="google-partner-badge${standalone ? " container google-partner-badge--standalone" : ""}"><a class="google-partner-badge__link" href="https://www.google.com/partners/agency?id=2904930188" target="_blank" rel="noopener noreferrer" aria-label="${label}"><img src="https://www.gstatic.com/partners/badge/images/2026/PartnerBadgeClickable.svg" alt="Google Partner" width="96" height="92" loading="lazy" decoding="async"></a></div>`;
}
