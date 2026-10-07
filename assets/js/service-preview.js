(() => {
  'use strict';
  const doc = document;
  const root = doc.documentElement;
  // The hero connects a named engineer with public, inspectable delivery.
  doc.querySelectorAll('[data-home-signature]').forEach(signature => {
    const tools = signature.querySelector('[data-signature-tools]');
    const tabs = [...signature.querySelectorAll('[data-signature-tab]')];
    const panels = [...signature.querySelectorAll('[data-signature-panel]')];
    const position = signature.querySelector('[data-signature-position]');
    if (!tools || !tabs.length || !position || tabs.some(tab => !panels.some(panel => panel.dataset.signaturePanel === tab.dataset.signatureTab))) return;
    const rtl = root.dir === 'rtl';
    const select = index => {
      const key = tabs[index].dataset.signatureTab;
      tabs.forEach((tab, i) => {
        tab.setAttribute('aria-selected', String(i === index));
        tab.tabIndex = i === index ? 0 : -1;
      });
      panels.forEach(panel => { panel.hidden = panel.dataset.signaturePanel !== key; });
      position.textContent = `${String(index + 1).padStart(2, '0')} / ${String(tabs.length).padStart(2, '0')}`;
    };
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(i));
      tab.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight') next = (i + (rtl ? -1 : 1) + tabs.length) % tabs.length;
        else if (event.key === 'ArrowLeft') next = (i + (rtl ? 1 : -1) + tabs.length) % tabs.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = tabs.length - 1;
        else return;
        event.preventDefault(); select(next); tabs[next].focus();
      });
    });
    select(0); tools.hidden = false;
  });
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
