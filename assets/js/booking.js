(() => {
  "use strict";
  const root = document.querySelector("[data-booking-builder]");
  if (!root) return;
  const submit = root.querySelector("[data-booking-submit]");
  const status = root.querySelector("[data-booking-status]");
  const get = (name) => root.querySelector(`[name="${name}"]`)?.value.trim() || "";

  function prepare() {
    const name = get("name");
    const consultation = get("consultation");
    const channel = get("channel");
    const date = get("date");
    const time = get("time");
    if (!name || !consultation || !channel || !date || !time) {
      status.textContent = document.documentElement.lang.startsWith("en")
        ? "Complete the required fields before opening WhatsApp."
        : "أكمل الحقول المطلوبة قبل فتح WhatsApp.";
      status.className = "form-message is-error";
      return;
    }
    const english = document.documentElement.lang.startsWith("en");
    const message = english
      ? `Hello Eng. Eslam, I would like to request a consultation.\nName/company: ${name}\nConsultation: ${consultation}\nChannel: ${channel}\nPreferred time: ${date} ${time}\nPublic link: ${get("url") || "Not provided"}\nContext: ${get("details") || "Not provided"}\nPlease confirm the appointment.`
      : `مرحبًا م. إسلام، أرغب في طلب موعد استشارة.\nالاسم/المنشأة: ${name}\nنوع الاستشارة: ${consultation}\nطريقة اللقاء: ${channel}\nالموعد المفضل: ${date} ${time}\nالرابط العام: ${get("url") || "غير مضاف"}\nملخص الحالة: ${get("details") || "غير مضاف"}\nفضلاً أكد الموعد.`;
    status.textContent = english ? "Opening WhatsApp so you can review the request before sending." : "سيُفتح WhatsApp لمراجعة الطلب قبل إرساله.";
    status.className = "form-message is-success";
    window.esAnalytics?.track("booking_message_ready", { service: "consultation", placement: "booking_form" });
    window.open(`https://wa.me/966579395299?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  }
  submit.addEventListener("click", prepare);
})();
