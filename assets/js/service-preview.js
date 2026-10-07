(() => {
  'use strict';
  const doc = document;
  const root = doc.documentElement;
  // Keep the homepage CRM example aligned with the selected business context.
  doc.querySelectorAll("[data-crm-service-preview]").forEach(preview => {
    const tools = preview.querySelector("[data-crm-service-tools]");
    const sector = preview.querySelector("[data-crm-service-sector]");
    const steps = [...preview.querySelectorAll("[data-crm-service-step]")];
    const panels = [...preview.querySelectorAll("[data-crm-service-panel]")];
    const launch = preview.querySelector("[data-crm-service-launch]");
    const status = preview.querySelector("[data-crm-service-status]");
    if (!tools || !sector || !steps.length || !panels.length || !launch || !status) return;
    let scene = 0;
    const english = root.lang === "en";
    const render = (announce = true) => {
      const active = panels.find(panel => panel.dataset.crmServicePanel === sector.value);
      if (!active) return;
      panels.forEach(panel => {
        panel.hidden = panel !== active;
        panel.querySelectorAll("[data-crm-service-scene]").forEach(item => item.hidden = Number(item.dataset.crmServiceScene) !== scene);
      });
      steps.forEach((button, index) => button.setAttribute("aria-pressed", String(index === scene)));
      launch.href = active.dataset.crmServiceHref;
      launch.setAttribute("aria-label", (english ? "Try the workflow simulation: " : "اختبر محاكاة المسار: ") + active.dataset.crmServiceName);
      if (announce) status.textContent = active.dataset.crmServiceName + " · " + steps[scene].querySelector("strong").textContent;
    };
    sector.addEventListener("change", () => { scene = 0; render(); });
    steps.forEach((button, index) => button.addEventListener("click", () => { scene = index; render(); }));
    render(false); tools.hidden = false;
  });

})();
