(() => {
  "use strict";
  const english = document.documentElement.lang.startsWith("en");
  const status = document.querySelector("[data-copy-status]");
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    document.querySelectorAll("[data-copy-bio]").forEach(button => {
      const source = document.getElementById(button.dataset.copyBio);
      if (!source) return;
      button.hidden = false;
      button.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(source.textContent.trim());
          if (status) status.textContent = english ? "Biography copied." : "تم نسخ النبذة.";
        } catch {
          if (status) status.textContent = english ? "Select the biography text and copy it manually." : "حدد نص النبذة وانسخه يدويًا.";
        }
      });
    });
  }
})();
