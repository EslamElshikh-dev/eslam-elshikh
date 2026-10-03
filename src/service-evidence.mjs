export const searchRevision = "2026-10-03";

// Scope is taken from the published project studies; these are not ranking claims.
export const serviceEvidence = {
  "web-development": [
    { project: "tawod-contracting", ar: "موقع مقاولات عربي متعدد الصفحات: خدمات مستقلة، ومقالات مرتبطة بها، ومسارات اتصال وواتساب تناسب الجوال.", en: "An Arabic contracting website with dedicated service pages, supporting articles, and mobile call and WhatsApp journeys." },
    { project: "sama-scan", ar: "موقع مركز أشعة: صفحات تشرح الخدمات، وتسلسل يساعد المراجع على فهم الفحص والوصول إلى الحجز والتواصل.", en: "A diagnostic-center website with dedicated service information and a clear journey from understanding an examination to booking or contacting the center." },
    { project: "bowdy-labs", ar: "موقع شركة تقنية: هوية داكنة، وتعريف مباشر بالقدرات، ومكونات متجاوبة يمكن تطويرها مع توسع الخدمات.", en: "A technology-company website with a dark visual identity, clear capabilities, and responsive components that support new services." }
  ],
  seo: [
    { project: "tawod-contracting", ar: "بنية محتوى تفصل خدمات المقاولات وتربطها بالمقالات، مع بيانات منظمة ومسارات تواصل. دراسة الحالة توضح النطاق والقرارات ويمكن فتح النسخة الحية.", en: "Service-led architecture supported by related articles, structured data, and contact journeys. The case study documents the scope and decisions and links to the public website." },
    { project: "sama-scan", ar: "صفحات مستقلة لخدمات مركز أشعة في الرياض، تربط شرح الخدمة بخطوة الحجز وتدعم بنية البحث المحلي. راجع التنفيذ المنشور بدل الاكتفاء بوصف الخدمة.", en: "Dedicated service pages for a Riyadh diagnostic center connect service information with booking and local-search architecture. Inspect the published implementation as well as the service description." }
  ],
  "local-seo": [
    { project: "tawod-contracting", ar: "شركة مقاولات في الرياض: ربط نوع الخدمة بالمحتوى وبطلب التواصل، مع فصل صفحات الخدمات عن المقالات المساندة.", en: "A Riyadh contracting company connects each service with relevant content and a contact action, with service pages separated from supporting articles." },
    { project: "sama-scan", ar: "مركز أشعة في الرياض: تنظيم الخدمات والمسار الذي ينقل الباحث من المعلومة إلى الحجز، بحسب طبيعة نشاط طبي محلي.", en: "A Riyadh diagnostic center organizes its services and the journey from information to booking around the needs of a local healthcare business." }
  ],
  "google-business-profile": [
    { mapTitle: "مؤسسة ريم كوم لتفصيل الخزائن الحديثة", enTitle: "Reem Com Custom Closets", ar: "نموذج من سجل أعمال الخرائط في قطاع النجارة والديكور الخشبي بحي المصيف في الرياض. يمكن فتح الملف العام ومراجعة النشاط المعروض.", en: "A public Maps portfolio example for a carpentry and wood-interiors business in Al Masif, Riyadh. Open the listing to inspect the published business information." },
    { mapTitle: "مؤسسة العنود فراج البقمي للمقاولات والديكور الخشبي", enTitle: "Alanoud Faraj Albuqami Contracting and Wood Interiors", ar: "نموذج منشور آخر من قطاع الديكور الخشبي في الرياض. يعرض سجل الأعمال أمثلة فعلية من قطاعات ومدن مختلفة مع روابطها العامة.", en: "Another published wood-interiors business in Riyadh. The portfolio provides public links to examples across different sectors and cities." }
  ]
};

// A reporting cohort. The full sitemap remains the discovery source for all canonical pages.
export const coreRoutes = [
  "/", "/about/", "/services/", "/services/web-development/", "/services/seo/",
  "/services/google-business-profile/", "/google-expert/", "/local-seo/riyadh/",
  "/projects/", "/projects/tawod-contracting/", "/projects/sama-scan/",
  "/projects/bowdy-labs/", "/projects/alargan-crm-concept/", "/google-maps-projects/", "/contact/"
];
