import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { site, services, projects, posts } from "./src/content.mjs";

const root = dirname(fileURLToPath(import.meta.url));

const esc = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const icons = {
  shield: '<path d="M12 3 5 6v5c0 4.7 2.8 8.1 7 10 4.2-1.9 7-5.3 7-10V6l-7-3Z"/><path d="m9.4 12 1.7 1.7 3.8-4"/>',
  cloud: '<path d="M7.5 18h9.7a3.8 3.8 0 0 0 .5-7.6 6 6 0 0 0-11.5-1.7A4.7 4.7 0 0 0 7.5 18Z"/><path d="M12 11v5m-2-2 2 2 2-2"/>',
  spark: '<path d="m12 3 .9 3.1A4.2 4.2 0 0 0 15.8 9l3.2 1-3.2 1a4.2 4.2 0 0 0-2.9 2.9L12 17l-.9-3.1A4.2 4.2 0 0 0 8.2 11L5 10l3.2-1a4.2 4.2 0 0 0 2.9-2.9L12 3Z"/><path d="m18.5 15 .4 1.2a2 2 0 0 0 1.3 1.3l1.3.5-1.3.4a2 2 0 0 0-1.3 1.3l-.4 1.3-.5-1.3a2 2 0 0 0-1.3-1.3l-1.2-.4 1.2-.5a2 2 0 0 0 1.3-1.3l.5-1.2Z"/>',
  code: '<path d="m8.5 8-4 4 4 4M15.5 8l4 4-4 4M14 5l-4 14"/>',
  google: '<path d="M20 12.2c0-.7-.1-1.4-.2-2.1H12v4h4.5a3.9 3.9 0 0 1-1.7 2.5v2.6h2.8c1.7-1.6 2.4-3.9 2.4-7Z"/><path d="M12 20.3c2.4 0 4.4-.8 5.9-2.1l-3-2.4c-.8.6-1.8.9-2.9.9a5.2 5.2 0 0 1-4.9-3.6H4v2.7a8.9 8.9 0 0 0 8 4.5Z"/><path d="M7.1 13.1a5.4 5.4 0 0 1 0-3.3V7.1H4a8.8 8.8 0 0 0 0 8.7l3.1-2.7Z"/><path d="M12 6.3c1.3 0 2.5.5 3.4 1.4L18 5.1A8.7 8.7 0 0 0 4 7.1l3.1 2.7A5.2 5.2 0 0 1 12 6.3Z"/>',
  pin: '<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  nodes: '<circle cx="6" cy="7" r="2.5"/><circle cx="18" cy="7" r="2.5"/><circle cx="12" cy="18" r="2.5"/><path d="m8.1 8.4 2.5 7.2m5.3-7.2-2.5 7.2M8.5 7h7"/>',
  chart: '<path d="M4 20V10m6 10V4m6 16v-7m4 7H2"/><path d="m4 8 5-4 6 5 5-4"/>',
  megaphone: '<path d="M4 13v-2a2 2 0 0 1 2-2h3l8-4v14l-8-4H6a2 2 0 0 1-2-2Z"/><path d="m9 15 1 5H7l-1-5m14-6a4 4 0 0 1 0 6"/>',
  arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  phone: '<path d="M7 3H4a1 1 0 0 0-1 1c0 9.4 7.6 17 17 17a1 1 0 0 0 1-1v-3l-4-1-1 2c-4.2-1.2-7.8-4.8-9-9l2-1-1-4-1-1Z"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  home: '<path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5h6v2m-12 5h18M10 12v2h4v-2"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  book: '<path d="M4 4h10a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3V4Z"/><path d="M7 16h10m0-9h3v13h-3"/>',
  external: '<path d="M14 4h6v6m0-6-9 9"/><path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6"/>',
  whatsapp: '<path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.4-4A8 8 0 1 1 20 11.5Z"/><path d="M8.5 8.2c.3 3 2.4 5.4 5.5 6.2.8.2 1.6-.5 1.8-1.2l-2.2-1-1 1c-1.4-.7-2.5-1.8-3.2-3.2l1-1-1-2.2c-.5.2-1 .7-.9 1.4Z"/>',
  eye: '<path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/>',
  moon: '<path d="M20.5 14.3A8.5 8.5 0 0 1 9.7 3.5 8.5 8.5 0 1 0 20.5 14.3Z"/>'
};

const brandIcons = {
  github: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
  linkedin: "M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5ZM.34 8h4.32v13.66H.34V8Zm7 0h4.14v1.87h.06c.58-1.09 1.99-2.24 4.09-2.24 4.37 0 5.18 2.88 5.18 6.62v7.41H16.5v-6.57c0-1.57-.03-3.59-2.19-3.59-2.19 0-2.53 1.71-2.53 3.48v6.68H7.34V8Z",
  facebook: "M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.673 3.667h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z",
  x: "M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z",
  instagram: "M7.03.084C5.753.144 4.881.348 4.119.647 3.33.955 2.662 1.367 1.997 2.035.75 3.285.126 5.053.063 8.077.007 9.354-.006 9.765 0 13.023c.006 3.259.021 3.667.083 4.947.061 1.277.264 2.148.563 2.911.308.789.72 1.457 1.388 2.123.668.665 1.337 1.074 2.129 1.38.763.295 1.636.496 2.913.552 1.277.056 1.688.069 4.946.063 3.258-.006 3.668-.021 4.948-.081 1.28-.061 2.147-.266 2.91-.564.789-.308 1.458-.72 2.123-1.388 1.247-1.254 1.87-3.021 1.933-6.049.056-1.281.069-1.69.063-4.948-.006-3.258-.021-3.667-.082-4.946-.061-1.28-.264-2.149-.563-2.912C21.047 2.667 19.278.92 16.924.065 15.647.009 15.236-.005 11.977.001 8.718.008 8.31.022 7.03.084Zm.141 21.693c-1.17-.051-1.806-.245-2.229-.408-.561-.216-.96-.477-1.382-.895-.422-.418-.681-.819-.9-1.378-.164-.423-.362-1.058-.417-2.228-.06-1.265-.072-1.644-.079-4.848-.007-3.204.005-3.583.061-4.848.05-1.169.246-1.805.408-2.228.216-.561.476-.96.895-1.382.419-.422.818-.681 1.378-.9.423-.165 1.058-.361 2.227-.417 1.266-.06 1.645-.072 4.848-.079 3.203-.007 3.584.005 4.85.061 1.169.051 1.805.245 2.228.408.561.216.96.475 1.382.895.422.419.682.818.901 1.379.165.422.362 1.056.417 2.226.06 1.266.074 1.645.08 4.848.006 3.203-.006 3.583-.061 4.848-.051 1.17-.245 1.806-.408 2.229-.216.56-.476.96-.895 1.381-.419.422-.818.681-1.378.9-.422.165-1.058.362-2.226.417-1.266.06-1.645.072-4.85.079-3.204.007-3.582-.006-4.848-.061ZM16.953 5.586a1.44 1.44 0 1 0 2.88-.006 1.44 1.44 0 0 0-2.88.006ZM5.839 12.012c.007 3.403 2.771 6.156 6.173 6.149 3.403-.006 6.157-2.77 6.151-6.173-.007-3.403-2.771-6.157-6.174-6.15-3.403.007-6.156 2.771-6.15 6.174ZM8 12.008a4 4 0 1 1 8-.016 4 4 0 0 1-8 .016Z",
  threads: "M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32L7.734 7.847c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388.108.046.216.094.321.142 1.49.7 2.58 1.761 3.154 3.07.797 1.82.871 4.79-1.548 7.158-1.85 1.81-4.094 2.628-7.277 2.65Zm1.003-11.69c-.242 0-.487.007-.739.021-1.836.103-2.98.946-2.916 2.143.067 1.256 1.452 1.839 2.784 1.767 1.224-.065 2.818-.543 3.086-3.71a10.5 10.5 0 0 0-2.215-.221Z",
  youtube: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814ZM9.545 15.568V8.432L15.818 12l-6.273 3.568Z",
  tiktok: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07Z",
  whatsapp: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"
};

function icon(name, className = "icon") {
  return `<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${icons[name] ?? icons.shield}</svg>`;
}

function brandIcon(name, className = "brand-icon") {
  return `<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="${brandIcons[name]}"/></svg>`;
}

function logoMark(className = "brand-logo") {
  return `<img class="${className}" src="/assets/brand/eslam-elshikh-mark.svg" width="48" height="48" alt="">`;
}

function header(active = "") {
  const nav = [
    ["home", "/", "الرئيسية"],
    ["services", "/services/", "الخدمات"],
    ["projects", "/projects/", "الأعمال"],
    ["about", "/about/", "عن إسلام"],
    ["google", "/google-expert/", "خبرة Google"],
    ["blog", "/blog/", "المدونة"]
  ];
  const links = nav.map(([key, href, label]) => `<a href="${href}"${active === key ? ' aria-current="page" class="is-active"' : ""}>${label}</a>`).join("");
  return `
    <a class="skip-link" href="#main">انتقل إلى المحتوى</a>
    <header class="site-header" data-header>
      <div class="container header-inner">
        <a class="brand" href="/" aria-label="${site.brandName} — الصفحة الرئيسية">
          ${logoMark()}
          <span><strong>${site.brandName}</strong><small>${site.nameEn}</small></span>
        </a>
        <nav class="desktop-nav" aria-label="التنقل الرئيسي">${links}</nav>
        <div class="header-tools">
          <button class="theme-toggle" type="button" aria-label="تفعيل الوضع الفاتح" aria-pressed="false" data-theme-toggle>
            <span class="theme-sun">${icon("sun")}</span><span class="theme-moon">${icon("moon")}</span>
          </button>
          <a class="button button-small header-cta" href="/contact/">ابدأ مشروعك ${icon("arrow", "button-icon")}</a>
          <button class="menu-toggle" type="button" aria-label="فتح القائمة" aria-expanded="false" aria-controls="mobile-menu" data-menu-toggle>
            <span class="menu-open">${icon("menu")}</span><span class="menu-close">${icon("close")}</span>
          </button>
        </div>
      </div>
      <nav class="mobile-menu" id="mobile-menu" aria-label="قائمة الجوال" data-mobile-menu>${links}<a class="button" href="/contact/">ابدأ مشروعك</a></nav>
    </header>`;
}

function footer() {
  const social = [
    ["github", site.social.github, "GitHub"],
    ["linkedin", site.social.linkedin, "LinkedIn"],
    ["facebook", site.social.facebook, "Facebook"],
    ["x", site.social.x, "X"],
    ["instagram", site.social.instagram, "Instagram"],
    ["threads", site.social.threads, "Threads"],
    ["youtube", site.social.youtube, "YouTube"],
    ["tiktok", site.social.tiktok, "TikTok"]
  ];
  return `
    <footer class="site-footer">
      <div class="container footer-grid">
        <div class="footer-intro">
          <a class="brand" href="/">${logoMark()}<span><strong>${site.brandName}</strong><small>${site.nameEn}</small></span></a>
          <p>حلول رقمية تجمع الأمن السيبراني والبرمجة والذكاء الاصطناعي وخبرة Google والسيو في تجربة واحدة مترابطة.</p>
          <div class="social-row" aria-label="حسابات التواصل الاجتماعي">${social.map(([key,url,label])=>`<a href="${url}" target="_blank" rel="noopener" aria-label="${label}" title="${label}">${brandIcon(key)}</a>`).join("")}</div>
        </div>
        <div><h2>روابط سريعة</h2><a href="/about/">عن إسلام</a><a href="/projects/">الأعمال</a><a href="/google-expert/">خبرة Google</a><a href="/blog/">المدونة</a></div>
        <div class="footer-services"><h2>جميع الخدمات</h2><div>${services.map(s=>`<a href="/services/${s.slug}/">${s.title}</a>`).join("")}</div></div>
        <div class="footer-contact"><h2>تواصل</h2><a dir="ltr" href="tel:${site.phone}">${icon("phone")}<span>${site.phoneDisplay}</span></a><a href="${site.whatsapp}" target="_blank" rel="noopener">${brandIcon("whatsapp")}<span>WhatsApp الأساسي</span></a><a dir="ltr" href="tel:${site.secondaryPhone}">${icon("phone")}<span>${site.secondaryPhoneDisplay} — بديل</span></a><a href="mailto:${site.email}">${icon("mail")}<span>${site.email}</span></a><span class="footer-location">${icon("pin")}<span>${site.city}، ${site.country}</span></span></div>
      </div>
      <div class="container footer-bottom"><p>© ${new Date().getFullYear()} ${site.brandName}. جميع الحقوق محفوظة.</p></div>
    </footer>
    <div class="floating-contact" role="group" aria-label="تواصل سريع">
      <a class="floating-action floating-call" href="tel:${site.phone}" aria-label="اتصال مباشر بالمهندس إسلام الشيخ على ${site.phoneDisplay}">${icon("phone")}<span>اتصال مباشر</span></a>
      <a class="floating-action floating-whatsapp" href="${site.whatsapp}?text=${encodeURIComponent("مرحبًا م. إسلام، أريد مناقشة خدمة تقنية")}" target="_blank" rel="noopener" aria-label="تواصل مع المهندس إسلام الشيخ عبر WhatsApp">${brandIcon("whatsapp")}<span>WhatsApp</span></a>
    </div>
    <nav class="mobile-bottom-nav" aria-label="تنقل سريع للجوال">
      <a href="/">${icon("home")}<span>الرئيسية</span></a>
      <a href="/services/">${icon("briefcase")}<span>الخدمات</span></a>
      <a href="/projects/">${icon("eye")}<span>الأعمال</span></a>
      <a href="/contact/">${icon("mail")}<span>تواصل</span></a>
    </nav>`;
}

function schemaScript(data) {
  return `<script type="application/ld+json">${JSON.stringify(data).replaceAll("<", "\\u003c")}</script>`;
}

function layout({ title, description, path = "/", active = "", body, schema = [], type = "website", image = "/assets/og/eslam-elshikh-og.png", robots = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1", publishedTime = "", modifiedTime = "2026-07-21" }) {
  const canonical = `${site.url}${path === "/" ? "/" : path}`;
  const pageTitle = path === "/" ? site.brandName : title.includes(site.brandName) ? title : `${title} | ${site.brandName}`;
  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${canonical}#webpage`,
    url: canonical,
    name: pageTitle,
    description,
    inLanguage: "ar-SA",
    isPartOf: { "@id": `${site.url}/#website` },
    about: { "@id": `${site.url}/#person` },
    dateModified: modifiedTime
  };
  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(pageTitle)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="robots" content="${robots}">
  <meta name="author" content="${site.nameAr}">
  <meta name="application-name" content="${site.brandName}">
  <meta name="color-scheme" content="dark light">
  <meta name="referrer" content="strict-origin-when-cross-origin">
  <meta name="format-detection" content="telephone=yes">
  <meta name="geo.region" content="SA-01">
  <meta name="geo.placename" content="الرياض">
  <meta name="theme-color" content="#07111b" data-theme-color>
  <script>try{const s=localStorage.getItem("es-theme");const t=s||(matchMedia("(prefers-color-scheme: light)").matches?"light":"dark");document.documentElement.dataset.theme=t;document.querySelector("meta[data-theme-color]")?.setAttribute("content",t==="light"?"#f4f8fb":"#07111b")}catch(e){}</script>
  <link rel="canonical" href="${canonical}">
  <link rel="alternate" hreflang="ar-SA" href="${canonical}">
  <link rel="alternate" hreflang="x-default" href="${canonical}">
  <link rel="me" href="${site.social.googleDeveloper}">
  <link rel="me" href="${site.social.wikidata}">
  <link rel="me" href="${site.social.github}">
  <link rel="alternate" type="application/ld+json" href="/profile.json" title="الملف المهني للمهندس إسلام الشيخ">
  <link rel="icon" href="/assets/icons/favicon.svg" type="image/svg+xml" sizes="any">
  <link rel="apple-touch-icon" href="/assets/icons/apple-touch-icon.png">
  <link rel="manifest" href="/manifest.webmanifest">
  <link rel="alternate" type="application/rss+xml" title="مدونة ${site.brandName}" href="/feed.xml">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-title" content="${site.brandName}">
  <meta property="og:locale" content="ar_SA">
  <meta property="og:type" content="${type}">
  <meta property="og:site_name" content="${site.brandName}">
  <meta property="og:title" content="${esc(pageTitle)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${site.url}${image}">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${esc(pageTitle)}">
  ${publishedTime ? `<meta property="article:published_time" content="${publishedTime}">` : ""}
  ${modifiedTime && type === "article" ? `<meta property="article:modified_time" content="${modifiedTime}">` : ""}
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@remoesoo10">
  <meta name="twitter:creator" content="@remoesoo10">
  <meta name="twitter:title" content="${esc(pageTitle)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${site.url}${image}">
  <meta name="twitter:image:alt" content="${esc(pageTitle)}">
  <link rel="stylesheet" href="/assets/css/main.css">
  <noscript><style>.reveal{opacity:1!important;transform:none!important}</style></noscript>
${[pageSchema, ...schema].map(schemaScript).join("\n")}
</head>
<body>
${header(active).trim()}
  <main id="main">${body}</main>
${footer().trim()}
  <script src="/assets/js/main.js" defer></script>
</body>
</html>`;
}

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${site.url}/#person`,
  name: site.nameAr,
  honorificPrefix: "المهندس",
  alternateName: [site.brandName, "اسلام الشيخ", site.nameEn, "Islam Elshikh", "Eslam El Sheikh"],
  url: site.url,
  mainEntityOfPage: { "@id": `${site.url}/about/#profile` },
  jobTitle: ["مهندس أمن سيبراني", "مطور برمجيات", "خبير منتجات Google"],
  hasOccupation: [
    { "@type":"Occupation", name:"مهندس أمن سيبراني" },
    { "@type":"Occupation", name:"مطور برمجيات" },
    { "@type":"Occupation", name:"خبير منتجات Google" }
  ],
  identifier: { "@type":"PropertyValue", propertyID:"Wikidata", value:"Q138800449", url:site.social.wikidata },
  description: site.description,
  email: `mailto:${site.email}`,
  telephone: site.phone,
  contactPoint: [
    { "@type":"ContactPoint", telephone:site.phone, contactType:"customer service", availableLanguage:["ar","en"], areaServed:"SA" },
    { "@type":"ContactPoint", telephone:site.secondaryPhone, contactType:"alternative contact", availableLanguage:["ar","en"], areaServed:"SA" }
  ],
  workLocation: { "@type": "Place", name: site.city, address:{ "@type":"PostalAddress", addressLocality:site.city, addressCountry:"SA" } },
  areaServed: { "@type":"Country", name:site.country },
  knowsAbout: ["Cybersecurity", "Software Development", "Artificial Intelligence Agents", "AI Agents", "Google Business Profile", "Google Product Support", "Search Engine Optimization", "Local SEO", "Cloud Solutions", "Firebase", "Knowledge Bases", "Structured Data"],
  sameAs: Object.values(site.social)
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${site.url}/#website`,
  url: site.url,
  name: site.brandName,
  alternateName: [site.nameAr, site.nameEn],
  inLanguage: "ar-SA",
  publisher: { "@id": `${site.url}/#person` }
};

const profilePageSchema = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "@id": `${site.url}/about/#profile`,
  url: `${site.url}/about/`,
  dateCreated: "2026-07-21",
  dateModified: "2026-07-21",
  mainEntity: { "@id": `${site.url}/#person` }
};

const breadcrumbs = (items) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: `${site.url}${item.path}` }))
});

function eyebrow(text) { return `<span class="eyebrow"><span></span>${text}</span>`; }
function sectionHead(kicker, title, text = "") { return `<div class="section-head reveal">${eyebrow(kicker)}<h2>${title}</h2>${text ? `<p>${text}</p>` : ""}</div>`; }
function serviceCard(s) {
  return `<article class="service-card reveal" data-service-group="${s.group}"><div class="service-card-top"><span class="service-number">${s.number}</span><span class="service-icon">${icon(s.icon)}</span></div><p class="service-group">${s.group}</p><h3><a href="/services/${s.slug}/">${s.title}</a></h3><p>${s.short}</p><a class="text-link" href="/services/${s.slug}/">تفاصيل الخدمة ${icon("arrow")}</a></article>`;
}
function projectCard(p) {
  return `<article class="project-card reveal"><div class="project-visual"><span>${p.category}</span><div class="project-lines" aria-hidden="true"></div></div><div class="project-content"><h3>${p.title}</h3><p>${p.description}</p><div class="tag-row">${p.tags.map(tag => `<span>${tag}</span>`).join("")}</div><a class="text-link" href="${p.url}" target="_blank" rel="noopener">معاينة المشروع ${icon("external")}</a></div></article>`;
}
function postCard(p) {
  return `<article class="post-card reveal"><a class="post-art post-art-${p.relatedService}" href="/blog/${p.slug}/" aria-label="اقرأ: ${p.title}"><span>${p.category}</span>${icon(services.find(s => s.slug === p.relatedService)?.icon ?? "book", "post-icon")}</a><div class="post-meta"><time datetime="${p.date}">${new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium" }).format(new Date(`${p.date}T12:00:00Z`))}</time><span>${p.readTime}</span></div><h3><a href="/blog/${p.slug}/">${p.title}</a></h3><p>${p.excerpt}</p><a class="text-link" href="/blog/${p.slug}/">اقرأ المقال ${icon("arrow")}</a></article>`;
}

function homePage() {
  const grouped = [{ key:"all", label:"كل الخدمات" }, ...["الأمن والحلول المتقدمة", "البرمجة والذكاء الاصطناعي", "خدمات Google", "التسويق والبحث الذكي"].map(label=>({key:label,label}))];
  const groupTabs = grouped.map((g, i) => `<button type="button" role="tab" aria-selected="${i === 0}" data-service-filter="${g.key}">${g.label}</button>`).join("");
  const faq = [
    ["ما نوع المشروعات التي تعمل عليها؟", "أعمل مع الشركات وأصحاب الأعمال على مشروعات الأمن السيبراني، تطوير المواقع والتطبيقات، وكلاء الذكاء الاصطناعي، حلول Google والسيو والإعلانات، مع تحديد نطاق مناسب لكل مشروع."],
    ["هل يمكن جمع أكثر من خدمة في مشروع واحد؟", "نعم، وهذه إحدى نقاط القوة الرئيسية. يمكن مثلًا بناء موقع آمن، ثم تهيئته للسيو وربطه بملف Google ونظام قياس وحملة تسويق ضمن خطة مترابطة."],
    ["كيف تبدأ الاستشارة؟", "ترسل وصفًا مختصرًا للهدف والوضع الحالي والموعد المتوقع. بعد ذلك نحدد مكالمة أو محادثة تشخيصية، ثم نطاق العمل والمخرجات والخطوات."],
    ["هل تقدم خدماتك داخل الرياض فقط؟", "أعمل من الرياض وأقدم معظم الخدمات التقنية عن بُعد داخل السعودية وخارجها، بينما تختلف متطلبات الزيارات الميدانية حسب نوع المشروع."]
  ];
  return layout({
    title: site.brandName,
    description: site.description,
    active: "home",
    schema: [personSchema, websiteSchema, { "@context":"https://schema.org", "@type":"FAQPage", mainEntity: faq.map(([q,a])=>({"@type":"Question",name:q,acceptedAnswer:{"@type":"Answer",text:a}})) }],
    body: `
      <section class="hero section-pad">
        <div class="hero-grid container">
          <div class="hero-copy reveal">
            ${eyebrow("مهندس أمن سيبراني · مطور برمجيات · خبير منتجات Google")}
            <h1>أهندس حلولًا رقمية <span>آمنة وذكية</span> تنمو مع أعمالك</h1>
            <p class="hero-lead">أنا إسلام الشيخ. أجمع الأمن السيبراني والبرمجة والذكاء الاصطناعي وخبرة Google والسيو لبناء أنظمة وتجارب رقمية متماسكة من الاستراتيجية إلى الإطلاق.</p>
            <div class="hero-actions"><a class="button" href="/contact/">ناقش مشروعك ${icon("arrow", "button-icon")}</a><a class="button button-ghost" href="/services/">استكشف الخدمات</a></div>
            <div class="hero-proof"><a href="${site.social.googleDeveloper}" target="_blank" rel="noopener"><span class="proof-dot proof-google"></span>ملف Google للمطورين</a><a href="${site.social.wikidata}" target="_blank" rel="noopener"><span class="proof-dot"></span>Wikidata Q138800449</a></div>
          </div>
          <div class="hero-visual reveal" aria-label="هوية المهندس إسلام الشيخ للأمن السيبراني والبرمجيات والحلول الذكية">
            <div class="visual-grid" aria-hidden="true"></div>
            <div class="orbit orbit-one"><span>AI</span><span>SEO</span><span>Cloud</span></div>
            <div class="orbit orbit-two"><span>Secure</span><span>Google</span></div>
            <div class="core-mark"><span class="core-scan" aria-hidden="true"></span><img class="core-logo" src="/assets/brand/eslam-elshikh-mark.svg" width="176" height="176" alt="شعار المهندس إسلام الشيخ"><p><strong>SECURE · BUILD · GROW</strong><span>Cybersecurity & Digital Engineering</span></p></div>
          </div>
        </div>
        <div class="container stats-bar reveal">
          <div><strong>472</strong><span>مساهمة في توثيق ملفات Google</span></div>
          <div><strong>233</strong><span>مشكلة ملف تجاري تمت معالجتها</span></div>
          <div><strong>9</strong><span>مسارات خدمة مترابطة</span></div>
          <div><strong>360°</strong><span>رؤية أمنية وتقنية وتسويقية</span></div>
        </div>
      </section>
      <section class="section-pad services-section" id="services">
        <div class="container">
          ${sectionHead("الخدمات", "خبرة متعددة التخصصات حول هدف واحد", "بدل التعامل مع الأمن والتطوير والتسويق كجزر منفصلة، تُبنى الحلول ضمن رحلة رقمية واحدة قابلة للقياس والتوسع.")}
          <div class="service-filters" role="tablist" aria-label="تصنيفات الخدمات">${groupTabs}</div>
          <div class="services-grid services-grid-home" data-services-grid>${services.map(serviceCard).join("")}</div>
          <div class="section-action"><a class="button button-ghost" href="/services/">عرض جميع الخدمات ${icon("arrow", "button-icon")}</a></div>
        </div>
      </section>
      <section class="section-pad approach-section">
        <div class="container approach-grid">
          <div class="approach-copy reveal">${eyebrow("لماذا هذا النهج؟")}<h2>المشروع القوي لا يكتفي بواجهة جميلة</h2><p>يجب أن يكون مفهومًا للمستخدم، آمنًا في التشغيل، قابلًا للفهرسة، ومهيأً للتحسين بعد الإطلاق. لذلك أتعامل مع كل طبقة بوصفها جزءًا من المنتج نفسه.</p><a class="text-link" href="/about/">تعرف على منهجية العمل ${icon("arrow")}</a></div>
          <div class="pillars">
            <article class="pillar reveal"><span>01</span>${icon("shield")}<h3>Secure by design</h3><p>الأمان والصلاحيات والبيانات تُراجع من البداية، لا بعد حدوث المشكلة.</p></article>
            <article class="pillar reveal"><span>02</span>${icon("code")}<h3>Built for people</h3><p>بنية واضحة وتجربة متجاوبة تجعل الوصول إلى القرار أسهل على كل جهاز.</p></article>
            <article class="pillar reveal"><span>03</span>${icon("chart")}<h3>Ready to grow</h3><p>قياس وسيو ومحتوى يجعل التحسين المستمر جزءًا من التشغيل.</p></article>
          </div>
        </div>
      </section>
      <section class="section-pad projects-section"><div class="container">${sectionHead("مختارات من الأعمال", "مشروعات تحوّل الهدف التجاري إلى تجربة رقمية", "نماذج عامة من مشروعات منشورة في تطوير المواقع وتحسين البحث المحلي وبناء بنية محتوى قابلة للتوسع.")}<div class="projects-grid">${projects.map(projectCard).join("")}</div><div class="section-action"><a class="button button-ghost" href="/projects/">كل الأعمال ${icon("arrow", "button-icon")}</a></div></div></section>
      <section class="section-pad process-section"><div class="container">${sectionHead("مسار العمل", "وضوح من أول سؤال حتى ما بعد الإطلاق")}<ol class="process-list"><li class="reveal"><span>01</span><h3>تشخيص الهدف</h3><p>نفهم المستخدم والنتيجة والقيود والمخاطر قبل اختيار الأدوات.</p></li><li class="reveal"><span>02</span><h3>تصميم الحل</h3><p>نحدد البنية والمحتوى والنطاق والمخرجات ومعيار القبول.</p></li><li class="reveal"><span>03</span><h3>تنفيذ قابل للمراجعة</h3><p>نبني على مراحل قصيرة مع اختبارات وقرارات موثقة.</p></li><li class="reveal"><span>04</span><h3>إطلاق وتحسين</h3><p>نراقب المؤشرات ونغلق الملاحظات ونرتب فرص التطوير.</p></li></ol></div></section>
      <section class="section-pad blog-section"><div class="container">${sectionHead("من المدونة", "معرفة عملية للقرارات التقنية المعقدة")}<div class="posts-grid">${posts.map(postCard).join("")}</div><div class="section-action"><a class="button button-ghost" href="/blog/">استكشف المدونة ${icon("arrow", "button-icon")}</a></div></div></section>
      <section class="section-pad faq-section"><div class="container faq-grid"><div class="faq-intro reveal">${eyebrow("الأسئلة الشائعة")}<h2>إجابات واضحة قبل بدء المشروع</h2><p>إذا كانت حالتك مختلفة، أرسل ملخصًا وسأقترح نقطة البداية المناسبة.</p><a class="button button-ghost" href="/contact/">أرسل تفاصيل مشروعك</a></div><div class="accordion">${faq.map(([q,a],i)=>`<details class="reveal"${i===0?" open":""}><summary>${q}<span>+</span></summary><p>${a}</p></details>`).join("")}</div></div></section>
      ${ctaSection()}`
  });
}

function ctaSection() {
  return `<section class="section-pad final-cta"><div class="container"><div class="cta-panel reveal"><div>${eyebrow("لديك تحدٍ تقني؟")}<h2>لنحوّل التعقيد إلى خطة واضحة قابلة للتنفيذ</h2><p>أرسل الهدف، الوضع الحالي، والموعد المتوقع. ستحصل على تشخيص أولي ونقطة بداية مناسبة.</p></div><div class="cta-actions"><a class="button button-light" href="/contact/">ابدأ الآن ${icon("arrow", "button-icon")}</a><a class="cta-phone" href="tel:${site.phone}" dir="ltr">${site.phoneDisplay}</a></div></div></div></section>`;
}

function pageHero(kicker, title, description, extra = "") {
  return `<section class="page-hero"><div class="container page-hero-grid"><div class="reveal">${eyebrow(kicker)}<h1>${title}</h1><p>${description}</p>${extra}</div><div class="page-hero-mark reveal"><span>ES</span><div></div></div></div></section>`;
}

function servicesPage() {
  return layout({ title:"الخدمات التقنية المتكاملة", description:"خدمات إسلام الشيخ في الأمن السيبراني والحلول السحابية ووكلاء الذكاء الاصطناعي وتطوير المواقع وخدمات Google والسيو والإعلانات.", path:"/services/", active:"services", schema:[personSchema, breadcrumbs([{name:"الرئيسية",path:"/"},{name:"الخدمات",path:"/services/"}])], body:`${pageHero("الخدمات", "حلول تقنية مترابطة من الحماية إلى النمو", "اختر الخدمة الأقرب لهدفك، أو ابدأ باستشارة تشخيصية إذا كان التحدي يجمع أكثر من مسار.", `<a class="button" href="/contact/">اطلب تشخيصًا أوليًا ${icon("arrow", "button-icon")}</a>`)}<section class="section-pad"><div class="container"><div class="services-grid services-grid-all">${services.map(serviceCard).join("")}</div></div></section><section class="section-pad compact-section"><div class="container split-callout reveal"><div><h2>لا تعرف أي خدمة تحتاج؟</h2><p>قد يكون أصل المشكلة في البنية أو البيانات أو تجربة المستخدم لا في الأداة الظاهرة. ابدأ بوصف النتيجة المطلوبة وسأساعدك على تحديد النطاق.</p></div><a class="button button-ghost" href="/contact/">ناقش التحدي</a></div></section>${ctaSection()}` });
}

function servicePage(s) {
  const path = `/services/${s.slug}/`;
  const serviceSchema = { "@context":"https://schema.org", "@type":"Service", "@id":`${site.url}${path}#service`, name:s.title, description:s.meta, provider:{"@id":`${site.url}/#person`}, areaServed:[{"@type":"City",name:"Riyadh"},{"@type":"Country",name:"Saudi Arabia"}], url:`${site.url}${path}` };
  const faqSchema = { "@context":"https://schema.org", "@type":"FAQPage", mainEntity:s.faq.map(([q,a])=>({"@type":"Question",name:q,acceptedAnswer:{"@type":"Answer",text:a}})) };
  return layout({ title:s.title, description:s.meta, path, active:"services", schema:[personSchema,serviceSchema,faqSchema,breadcrumbs([{name:"الرئيسية",path:"/"},{name:"الخدمات",path:"/services/"},{name:s.title,path}])], body:`
    <section class="service-hero"><div class="container service-hero-grid"><div class="reveal">${eyebrow(s.group)}<span class="service-hero-number">${s.number}</span><h1>${s.title}</h1><p>${s.intro}</p><div class="hero-actions"><a class="button" href="/contact/?service=${s.slug}">اطلب الخدمة ${icon("arrow", "button-icon")}</a><a class="button button-ghost" href="${site.whatsapp}?text=${encodeURIComponent(`مرحبًا م. إسلام، أريد الاستفسار عن خدمة ${s.title}`)}" target="_blank" rel="noopener">تحدث عبر WhatsApp</a></div></div><div class="service-emblem reveal"><span>${icon(s.icon, "service-emblem-icon")}</span><p>${s.group}</p></div></div></section>
    <section class="section-pad"><div class="container detail-grid"><div class="detail-copy reveal">${eyebrow("القيمة التي تحصل عليها")}<h2>مخرجات مفهومة وقابلة للمتابعة</h2><p>يُضبط النطاق بعد فهم حالتك، مع تعريف واضح للمخرجات والمسؤوليات وحدود الخدمة قبل بدء التنفيذ.</p></div><ul class="check-list">${s.outcomes.map(x=>`<li class="reveal">${icon("check")}<span>${x}</span></li>`).join("")}</ul></div></section>
    <section class="section-pad muted-section"><div class="container">${sectionHead("نطاق الخدمة", "ما الذي يمكن أن يشمله المشروع؟", "تُختار العناصر المناسبة فقط وفق الاحتياج، حتى يبقى المشروع مركزًا وقابلًا للقياس.")}<div class="scope-grid">${s.scope.map((x,i)=>`<article class="scope-card reveal"><span>${String(i+1).padStart(2,"0")}</span><h3>${x}</h3></article>`).join("")}</div></div></section>
    <section class="section-pad"><div class="container">${sectionHead("آلية التنفيذ", "أربع مراحل تبقي القرار واضحًا")}<ol class="service-steps">${s.steps.map((x,i)=>`<li class="reveal"><span>${String(i+1).padStart(2,"0")}</span><h3>${x}</h3></li>`).join("")}</ol></div></section>
    <section class="section-pad faq-section"><div class="container faq-grid"><div class="faq-intro reveal">${eyebrow("أسئلة الخدمة")}<h2>قبل أن تبدأ</h2><p>تفاصيل النطاق والمدة تعتمد على حجم النظام والوضع الحالي والأطراف المشاركة.</p></div><div class="accordion">${s.faq.map(([q,a],i)=>`<details class="reveal"${i===0?" open":""}><summary>${q}<span>+</span></summary><p>${a}</p></details>`).join("")}</div></div></section>
    ${ctaSection()}` });
}

function aboutPage() {
  return layout({
    title:"الملف المهني",
    description:"الملف المهني للمهندس إسلام الشيخ في الرياض: خبير أمن سيبراني، مطور برمجيات، وخبير منتجات Google متخصص في الذكاء الاصطناعي والسيو والحلول الرقمية.",
    path:"/about/",
    active:"about",
    type:"profile",
    schema:[personSchema,profilePageSchema,breadcrumbs([{name:"الرئيسية",path:"/"},{name:"عن إسلام",path:"/about/"}])],
    body:`${pageHero("عن إسلام", "أربط التقنية بالقرار التجاري، دون فقدان الدقة", "أنا المهندس إسلام الشيخ؛ خبير أمن سيبراني ومطور برمجيات وخبير منتجات Google أعمل من الرياض على تحويل المشكلات المعقدة إلى حلول قابلة للفهم والتنفيذ والقياس.")}
    <section class="section-pad identity-section"><div class="container identity-panel reveal"><div class="identity-intro">${eyebrow("تعريف واضح وموثق")}<h2>من هو المهندس إسلام الشيخ؟</h2><p>مرجع مختصر للمعلومات المهنية الأساسية، مدعوم بروابط الهوية العامة والصفحات الرسمية المرتبطة بالاسم.</p></div><dl class="identity-facts"><div><dt>الاسم</dt><dd>إسلام الشيخ — Eslam Elshikh</dd></div><div><dt>الموقع</dt><dd>الرياض، المملكة العربية السعودية</dd></div><div><dt>الصفة المهنية</dt><dd>خبير أمن سيبراني، مطور برمجيات، وخبير منتجات Google</dd></div><div><dt>مجالات التخصص</dt><dd>الأمن السيبراني، تطوير المواقع والتطبيقات، وكلاء الذكاء الاصطناعي، حلول Google، السيو والحلول السحابية</dd></div><div><dt>مراجع الهوية</dt><dd><a href="${site.social.wikidata}" target="_blank" rel="noopener">Wikidata Q138800449</a> · <a href="${site.social.googleDeveloper}" target="_blank" rel="noopener">ملف Google للمطورين</a></dd></div></dl></div></section>
    <section class="section-pad"><div class="container bio-grid"><div class="bio-panel reveal"><img class="bio-logo" src="/assets/brand/eslam-elshikh-mark.svg" width="260" height="260" alt="شعار المهندس إسلام الشيخ"><p>Cybersecurity<br>Software Engineering<br>Google Products<br>AI & Search</p></div><div class="bio-copy reveal">${eyebrow("الملف المهني")}<h2>خبرة تقنية عابرة للتخصصات</h2><p>لا أنظر إلى الموقع أو النظام بوصفه كودًا فقط. الأمان، تجربة المستخدم، البنية السحابية، طريقة ظهور المحتوى في البحث، ومسار تواصل العميل كلها أجزاء تؤثر في النتيجة النهائية.</p><p>عملي يركز على الحلول القابلة للتطبيق: نطاق واضح، قرارات موثقة، أقل تعقيد ممكن، واختبارات مناسبة للمخاطر. وعندما يكون القرار بيد منصة خارجية مثل Google، ألتزم بالمسارات الرسمية دون تقديم وعود لا يمكن ضمانها.</p><div class="credentials"><a href="${site.social.googleDeveloper}" target="_blank" rel="noopener">ملف Google للمطورين ${icon("external")}</a><a href="${site.social.wikidata}" target="_blank" rel="noopener">Wikidata ${icon("external")}</a><a href="${site.social.github}" target="_blank" rel="noopener">GitHub ${icon("external")}</a></div></div></div></section>
    <section class="section-pad muted-section"><div class="container">${sectionHead("مبادئ العمل", "ما الذي يحكم القرارات داخل المشروع؟")}<div class="values-grid"><article class="reveal"><span>01</span><h3>الدليل قبل الانطباع</h3><p>أفصل بين ما تم التحقق منه، وما هو استنتاج، وما يحتاج اختبارًا إضافيًا.</p></article><article class="reveal"><span>02</span><h3>الأمان حسب المخاطر</h3><p>لا أضيف تعقيدًا بلا سبب، ولا أتنازل عن الضوابط التي تحمي الأصول الحساسة.</p></article><article class="reveal"><span>03</span><h3>المستخدم في المركز</h3><p>جودة الحل تظهر في سهولة فهمه واستخدامه والوصول إلى نتيجته.</p></article><article class="reveal"><span>04</span><h3>قابلية التطوير</h3><p>التوثيق والبنية النظيفة والقياس تجعل التحسين اللاحق أسرع وأقل مخاطرة.</p></article></div></div></section>
    <section class="section-pad"><div class="container skills-panel reveal"><div>${eyebrow("مجالات الخبرة")}<h2>من الدفاع الرقمي إلى تجربة البحث</h2></div><div class="skills-cloud">${["Cybersecurity","Secure Web Development","Cloud Solutions","AI Agents","RAG & Knowledge Bases","Google Business Profile","Technical SEO","Local SEO","GitHub","Firebase","Digital Advertising","Structured Data"].map(x=>`<span>${x}</span>`).join("")}</div></div></section>${ctaSection()}`
  });
}

function googlePage() {
  return layout({ title:"خبير منتجات Google", description:"خبرة المهندس إسلام الشيخ في دعم منتجات Google وملفات الأنشطة التجارية: تشخيص المشكلات والتوثيق والظهور على الخرائط وفق الإرشادات الرسمية.", path:"/google-expert/", active:"google", schema:[personSchema,breadcrumbs([{name:"الرئيسية",path:"/"},{name:"خبرة Google",path:"/google-expert/"}])], body:`${pageHero("خبرة Google", "تشخيص منظم بدل التجارب العشوائية", "خبرة عملية في ملفات Google التجارية ودعم المستخدمين، مع التزام واضح بالسياسات والمسارات الرسمية وشرح ما يمكن التحكم فيه وما يظل قرارًا للمنصة.", `<a class="button" href="${site.social.googleDeveloper}" target="_blank" rel="noopener">عرض ملف Google ${icon("external", "button-icon")}</a>`)}<section class="section-pad"><div class="container google-stats"><article class="reveal"><strong>472</strong><h2>مساهمة في التوثيق</h2><p>خبرة تراكمية في تجهيز ومراجعة حالات ملفات الأنشطة التجارية.</p></article><article class="reveal"><strong>233</strong><h2>مشكلة تمت معالجتها</h2><p>تشخيص حالات تتعلق بالتحقق والتعليق والتكرار والبيانات والظهور.</p></article><article class="reveal"><strong>100%</strong><h2>شفافية في المسار</h2><p>لا كلمات مرور، لا ضمان لقرارات Google، ولا وعود بتجاوز السياسات.</p></article></div></section><section class="section-pad muted-section"><div class="container approach-grid"><div class="approach-copy reveal">${eyebrow("حدود الدور")}<h2>خبرة مستقلة موثقة، وليست تمثيلًا لشركة Google</h2><p>أقدّم استشارات مستقلة اعتمادًا على الخبرة في المنتجات والإرشادات العامة. لا يعني ذلك أنني موظف لدى Google أو أتحكم في قرارات المراجعة أو الاستعادة. هذا الفصل مهم لحماية العميل وبناء توقعات صحيحة.</p><a class="text-link" href="/services/google-support/">استشارات منتجات Google ${icon("arrow")}</a></div><div class="pillars"><article class="pillar reveal">${icon("google")}<h3>قراءة الحالة</h3><p>فهم الإشعار والتغييرات السابقة وما إذا كانت المشكلة سياسة أم بيانات أم صلاحيات.</p></article><article class="pillar reveal">${icon("nodes")}<h3>تنظيم الأدلة</h3><p>تحديد المستندات والصور والروابط المطلوبة وربطها بالنقطة التي تثبتها.</p></article><article class="pillar reveal">${icon("chart")}<h3>متابعة واعية</h3><p>تسجيل ما تم إرساله ومتى، وتجنب التعديلات المتكررة التي تربك الحالة.</p></article></div></div></section><section class="section-pad"><div class="container split-callout reveal"><div><h2>لديك مشكلة في ملف Google التجاري؟</h2><p>لا ترسل كلمات مرور أو رموز تحقق. جهّز رابط الملف، نص الإشعار، وتسلسل ما حدث، ثم أرسل ملخص الحالة.</p></div><a class="button" href="/contact/?service=google-business-profile">ابدأ التشخيص</a></div></section>${ctaSection()}` });
}

function projectsPage() {
  return layout({ title:"مشروعات وأعمال رقمية", description:"نماذج من أعمال إسلام الشيخ في تطوير المواقع وتجربة المستخدم والسيو المحلي والبيانات المنظمة والهوية الرقمية للمشروعات السعودية.", path:"/projects/", active:"projects", schema:[personSchema,breadcrumbs([{name:"الرئيسية",path:"/"},{name:"الأعمال",path:"/projects/"}])], body:`${pageHero("الأعمال", "مشروعات مبنية حول النتيجة، لا حول القالب", "مختارات من أعمال منشورة تركز على هندسة المحتوى وتجربة الجوال والتحويل والسيو التقني والمحلي.")}<section class="section-pad"><div class="container projects-grid projects-grid-page">${projects.map(projectCard).join("")}</div></section><section class="section-pad muted-section"><div class="container">${sectionHead("ما وراء الواجهة", "ما الذي أراجعه في كل مشروع ويب؟")}<div class="values-grid"><article class="reveal"><span>UX</span><h3>رحلة المستخدم</h3><p>وضوح الخدمة والثقة ودعوة الإجراء وترتيب المعلومات على الجوال.</p></article><article class="reveal"><span>SEO</span><h3>قابلية الاكتشاف</h3><p>بنية العناوين والروابط والميتا والـSchema والفهرسة والأداء.</p></article><article class="reveal"><span>SEC</span><h3>أساس آمن</h3><p>تقليل التبعيات وضبط النشر وعدم تعريض الأسرار أو المدخلات.</p></article><article class="reveal"><span>OPS</span><h3>قابلية التشغيل</h3><p>ملفات مشروع منظمة وتوثيق وتشغيل وتحديث يمكن متابعتهما.</p></article></div></div></section>${ctaSection()}` });
}

function blogPage() {
  return layout({ title:"المدونة التقنية", description:"مقالات إسلام الشيخ عن الأمن السيبراني ووكلاء الذكاء الاصطناعي وتطوير المواقع وخدمات Google وSEO والبحث الذكي.", path:"/blog/", active:"blog", schema:[websiteSchema,breadcrumbs([{name:"الرئيسية",path:"/"},{name:"المدونة",path:"/blog/"}])], body:`${pageHero("المدونة", "محتوى تقني يساعدك على اتخاذ قرار أفضل", "مقالات عملية تشرح المخاطر والخيارات والخطوات في الأمن السيبراني والذكاء الاصطناعي وتطوير الويب ومنتجات Google والسيو.")}<section class="section-pad"><div class="container posts-grid posts-grid-page">${posts.map(postCard).join("")}</div></section><section class="section-pad compact-section"><div class="container external-blog reveal"><div>${eyebrow("الأرشيف السابق")}<h2>مقالات إضافية على المدونة الخارجية</h2><p>يمكنك أيضًا استكشاف المقالات المنشورة سابقًا حول خرائط Google وملفات الأنشطة التجارية والممارسات الرقمية.</p></div><a class="button button-ghost" href="${site.social.blog}" target="_blank" rel="noopener">زيارة الأرشيف ${icon("external", "button-icon")}</a></div></section>${ctaSection()}` });
}

function articlePage(p) {
  const path = `/blog/${p.slug}/`;
  const service = services.find(s=>s.slug===p.relatedService);
  const articleSchema = { "@context":"https://schema.org", "@type":"BlogPosting", headline:p.title, description:p.description, datePublished:p.date, dateModified:p.date, inLanguage:"ar-SA", mainEntityOfPage:`${site.url}${path}`, author:{"@id":`${site.url}/#person`}, publisher:{"@id":`${site.url}/#person`}, image:`${site.url}/assets/og/eslam-elshikh-og.png` };
  return layout({ title:p.seoTitle ?? p.title, description:p.description, path, active:"blog", type:"article", publishedTime:p.date, modifiedTime:p.date, schema:[personSchema,articleSchema,breadcrumbs([{name:"الرئيسية",path:"/"},{name:"المدونة",path:"/blog/"},{name:p.title,path}])], body:`<article class="article"><header class="article-header"><div class="container article-head-inner reveal">${eyebrow(p.category)}<h1>${p.title}</h1><p>${p.excerpt}</p><div class="article-byline"><span>بقلم ${site.brandName}</span><time datetime="${p.date}">${new Intl.DateTimeFormat("ar-SA",{dateStyle:"long"}).format(new Date(`${p.date}T12:00:00Z`))}</time><span>${p.readTime}</span></div></div></header><div class="container article-layout"><aside class="article-aside reveal"><p>في هذا المقال</p><ol>${p.sections.map(([h])=>`<li><a href="#${slugify(h)}">${h}</a></li>`).join("")}</ol><a class="aside-service" href="/services/${service.slug}/">${icon(service.icon)}<span><small>الخدمة المرتبطة</small><strong>${service.title}</strong></span></a></aside><div class="article-body">${p.sections.map(([h,c],i)=>`<section id="${slugify(h)}" class="reveal"><span class="article-section-number">${String(i+1).padStart(2,"0")}</span><h2>${h}</h2><p>${c}</p></section>`).join("")}<div class="article-note reveal"><h2>الخلاصة</h2><p>ابدأ بنطاق صغير يمكن قياسه، وثّق الافتراضات، وافصل بين ما يمكنك التحكم فيه وقرارات الأطراف الخارجية. الاستراتيجية الجيدة تجعل الخطوة التالية أوضح وأقل مخاطرة.</p></div></div></div></article>${ctaSection()}` });
}

function slugify(text) {
  return text.normalize("NFKD").replace(/[\u064B-\u065F\u0670]/g,"").replace(/[^\p{L}\p{N}]+/gu,"-").replace(/^-|-$/g,"").toLowerCase();
}

function contactPage() {
  return layout({
    title:"تواصل وطلب خدمة",
    description:"تواصل مع المهندس إسلام الشيخ في الرياض عبر الاتصال أو WhatsApp لطلب خدمات الأمن السيبراني والبرمجة والذكاء الاصطناعي وخدمات Google والسيو.",
    path:"/contact/",
    active:"contact",
    schema:[personSchema,breadcrumbs([{name:"الرئيسية",path:"/"},{name:"تواصل",path:"/contact/"}])],
    body:`${pageHero("تواصل", "ابدأ بوصف الهدف، وسنرتب الطريق إليه", "اختر الخدمة واكتب ملخصًا موجزًا عن الوضع الحالي والنتيجة المطلوبة. لن يطلب منك الموقع كلمات مرور أو مفاتيح سرية أو رموز تحقق.")}
    <section class="section-pad contact-section"><div class="container contact-grid"><div class="contact-options reveal">
      <article>${brandIcon("whatsapp", "icon brand-contact-icon")}<div><small>WhatsApp الأساسي</small><h2>محادثة مباشرة</h2><a href="${site.whatsapp}" target="_blank" rel="noopener" dir="ltr">${site.phoneDisplay}</a></div></article>
      <article>${icon("phone")}<div><small>اتصال مباشر</small><h2>الرقم الأساسي</h2><a href="tel:${site.phone}" dir="ltr">${site.phoneDisplay}</a></div></article>
      <article>${icon("phone")}<div><small>خيار تواصل ثانٍ</small><h2>الرقم البديل</h2><a href="tel:${site.secondaryPhone}" dir="ltr">${site.secondaryPhoneDisplay}</a></div></article>
      <article>${icon("mail")}<div><small>البريد الإلكتروني</small><h2>تفاصيل رسمية</h2><a href="mailto:${site.email}">${site.email}</a></div></article>
      <article>${icon("pin")}<div><small>نطاق العمل</small><h2>${site.city}</h2><p>خدمات رقمية داخل السعودية وعن بُعد</p></div></article>
      <div class="security-note">${icon("shield")}<p><strong>تنبيه أمني:</strong> لا ترسل كلمة مرور أو رمز تحقق أو مفتاح API. يمكن مناقشة المشكلة باستخدام وصف أو لقطات منزوعة البيانات الحساسة.</p></div>
    </div><form class="contact-form reveal" data-contact-form><div class="form-head"><span>ملخص المشروع</span><h2>جهّز رسالة واضحة خلال دقيقة</h2><p>عند الإرسال ستفتح رسالة WhatsApp على الرقم الأساسي، ويمكنك مراجعتها قبل الإرسال.</p></div><label>الاسم أو اسم النشاط<input type="text" name="name" autocomplete="name" maxlength="80" placeholder="مثال: محمد / شركة ..." required></label><label>الخدمة المطلوبة<select name="service" required><option value="">اختر الخدمة</option>${services.map(s=>`<option value="${s.slug}">${s.title}</option>`).join("")}</select></label><label>ما النتيجة التي تريد الوصول إليها؟<textarea name="goal" rows="5" maxlength="800" placeholder="اكتب الوضع الحالي والهدف والموعد المتوقع دون بيانات حساسة" required></textarea></label><button class="button" type="submit">فتح الرسالة في WhatsApp ${brandIcon("whatsapp", "button-icon brand-contact-icon")}</button><p class="form-status" role="status" aria-live="polite"></p></form></div></section>`
  });
}

function notFoundPage() {
  return layout({ title:"الصفحة غير موجودة", description:"تعذر العثور على الصفحة المطلوبة في موقع المهندس إسلام الشيخ. يمكنك العودة إلى الرئيسية أو استكشاف الخدمات التقنية.", path:"/404.html", robots:"noindex, follow", schema:[], body:`<section class="not-found"><div class="container reveal"><span>404</span><h1>الرابط لا يقود إلى صفحة موجودة</h1><p>قد يكون الرابط قديمًا أو تمت كتابة العنوان بصورة غير صحيحة. ابدأ من الرئيسية أو استكشف الخدمات.</p><div class="hero-actions"><a class="button" href="/">العودة للرئيسية</a><a class="button button-ghost" href="/services/">الخدمات</a></div></div></section>` });
}

async function output(relativePath, content) {
  const file = join(root, relativePath);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, content, "utf8");
}

const pages = [
  ["index.html", homePage()],
  ["services/index.html", servicesPage()],
  ["about/index.html", aboutPage()],
  ["google-expert/index.html", googlePage()],
  ["projects/index.html", projectsPage()],
  ["blog/index.html", blogPage()],
  ["contact/index.html", contactPage()],
  ["404.html", notFoundPage()]
];

for (const s of services) pages.push([`services/${s.slug}/index.html`, servicePage(s)]);
for (const p of posts) pages.push([`blog/${p.slug}/index.html`, articlePage(p)]);
for (const [path, content] of pages) await output(path, content);

const sitemapPaths = ["/", "/services/", ...services.map(s=>`/services/${s.slug}/`), "/about/", "/google-expert/", "/projects/", "/blog/", ...posts.map(p=>`/blog/${p.slug}/`), "/contact/"];
const lastmod = "2026-07-21";
await output("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapPaths.map((path,i)=>`  <url><loc>${site.url}${path}</loc><lastmod>${lastmod}</lastmod><changefreq>${path.startsWith("/blog/") ? "monthly" : "monthly"}</changefreq><priority>${path === "/" ? "1.0" : path === "/services/" ? "0.9" : "0.8"}</priority></url>`).join("\n")}\n</urlset>\n`);
await output("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`);
await output("CNAME", "eslam-elshikh.com\n");
await output(".nojekyll", "");
await output("manifest.webmanifest", JSON.stringify({ name:site.brandName, short_name:site.nameAr, description:site.description, start_url:"/", display:"standalone", lang:"ar", dir:"rtl", background_color:"#07111b", theme_color:"#07111b", icons:[{src:"/assets/icons/icon-192.png",sizes:"192x192",type:"image/png",purpose:"any maskable"},{src:"/assets/icons/icon-512.png",sizes:"512x512",type:"image/png",purpose:"any maskable"}] }, null, 2));
await output("feed.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>${esc(site.brandName)} — المدونة التقنية</title><link>${site.url}/blog/</link><description>${esc(site.description)}</description><language>ar-SA</language>${posts.map(p=>`<item><title>${esc(p.title)}</title><link>${site.url}/blog/${p.slug}/</link><guid isPermaLink="true">${site.url}/blog/${p.slug}/</guid><pubDate>${new Date(`${p.date}T12:00:00Z`).toUTCString()}</pubDate><description>${esc(p.description)}</description></item>`).join("")}</channel></rss>\n`);
await output("profile.json", `${JSON.stringify(personSchema, null, 2)}\n`);
await output("llms.txt", `# ${site.brandName}\n\n> ${site.description}\n\n## معلومات الهوية\n- الاسم العربي: ${site.nameAr}\n- الاسم الإنجليزي: ${site.nameEn}\n- الصفة المهنية: خبير أمن سيبراني، مطور برمجيات، خبير منتجات Google\n- الموقع المهني: ${site.city}، ${site.country}\n- الموقع الرسمي: ${site.url}/\n- الملف المهني: ${site.url}/about/\n- ملف الهوية المنظم: ${site.url}/profile.json\n- ملف Google للمطورين: ${site.social.googleDeveloper}\n- Wikidata: ${site.social.wikidata}\n\n## الخدمات\n${services.map(s=>`- ${s.title}: ${site.url}/services/${s.slug}/`).join("\n")}\n\n## المحتوى\n- جميع الخدمات: ${site.url}/services/\n- المدونة التقنية: ${site.url}/blog/\n- خبرة منتجات Google: ${site.url}/google-expert/\n- التواصل: ${site.url}/contact/\n- سياق موسع للأنظمة الذكية: ${site.url}/llms-full.txt\n\nهذه المعلومات تعريفية عامة. المرجع الأساسي والأحدث هو صفحات الموقع الرسمية والروابط الموثقة أعلاه.\n`);
await output("llms-full.txt", `# الملف المهني الموسع — ${site.brandName}\n\n## الهوية\n${site.description}\n\nيُكتب الاسم بالعربية: ${site.nameAr}، وقد يظهر في البحث أيضًا بصيغة «اسلام الشيخ». ويُكتب بالإنجليزية: ${site.nameEn}. يعمل من ${site.city} ويقدم خدمات رقمية داخل السعودية وعن بُعد.\n\n## الصفة المهنية\n- خبير أمن سيبراني\n- مطور برمجيات ومواقع وتطبيقات\n- خبير منتجات Google يقدم دعمًا واستشارات مستقلة\n- متخصص في وكلاء الذكاء الاصطناعي والسيو والحلول السحابية وقواعد المعرفة\n\nخبرة منتجات Google مستقلة، ولا تعني أن ${site.nameAr} موظف لدى Google أو يملك التحكم في قرارات المنصة.\n\n## الخدمات بالتفصيل\n${services.map(s=>`### ${s.title}\n${s.intro}\nالرابط الرسمي: ${site.url}/services/${s.slug}/`).join("\n\n")}\n\n## المراجع الرسمية\n- الموقع: ${site.url}/\n- الملف المهني: ${site.url}/about/\n- ملف Google للمطورين: ${site.social.googleDeveloper}\n- Wikidata: ${site.social.wikidata}\n- GitHub: ${site.social.github}\n- المدونة: ${site.url}/blog/\n\n## التواصل العام\n- الهاتف وWhatsApp الأساسي: ${site.phone}\n- الهاتف البديل: ${site.secondaryPhone}\n- البريد: ${site.email}\n\nآخر تحديث: 2026-07-21. استخدم الصفحات الرسمية أعلاه بوصفها المرجع الأحدث، ولا تستنتج اعتمادات أو علاقات عمل غير مذكورة صراحة.\n`);

console.log(`Built ${pages.length} HTML pages.`);
