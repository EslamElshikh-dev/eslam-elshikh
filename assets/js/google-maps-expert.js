(() => {
  const root = document.querySelector('[data-maps-expert]');
  if (!root) return;
  const controls = root.querySelector('[data-expert-tabs]');
  const tabs = [...root.querySelectorAll('[data-expert-tab]')];
  const panels = [...root.querySelectorAll('[data-expert-panel]')];
  const rtl = document.documentElement.dir === 'rtl';
  const activate = (id, focus = false, updateHash = false) => {
    const chosen = tabs.find(tab => tab.dataset.expertTab === id);
    if (!chosen) return;
    tabs.forEach(tab => {
      const selected = tab === chosen;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    panels.forEach(panel => {
      panel.hidden = panel.dataset.expertPanel !== id;
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', `expert-tab-${panel.dataset.expertPanel}`);
      panel.tabIndex = 0;
    });
    if (focus) chosen.focus();
    if (updateHash) history.replaceState(null, '', `#path-${id}`);
  };
  const openHash = () => {
    const id = location.hash.replace(/^#path-/, '');
    const panel = panels.find(item => item.dataset.expertPanel === id);
    if (!panel) return;
    const wasHidden = panel.hidden;
    activate(id);
    if (wasHidden) requestAnimationFrame(() => panel.scrollIntoView({ block: 'start' }));
  };
  if (controls && tabs.length && panels.length === tabs.length) {
    activate(tabs[0].dataset.expertTab);
    controls.hidden = false;
    root.classList.add('expert-enhanced');
    openHash();
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activate(tab.dataset.expertTab, false, true));
      tab.addEventListener('keydown', event => {
        let next = index;
        if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = tabs.length - 1;
        else if (event.key === 'ArrowRight') next = (index + (rtl ? -1 : 1) + tabs.length) % tabs.length;
        else if (event.key === 'ArrowLeft') next = (index + (rtl ? 1 : -1) + tabs.length) % tabs.length;
        else return;
        event.preventDefault();
        activate(tabs[next].dataset.expertTab, true, true);
      });
    });
    root.querySelectorAll('[data-expert-select]').forEach(link => {
      link.addEventListener('click', () => activate(link.dataset.expertSelect));
    });
    window.addEventListener('hashchange', openHash);
  }
  const navLinks = [...root.querySelectorAll('[data-expert-nav] a')];
  const sections = navLinks.map(link => root.querySelector(link.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const visible = new Map();
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => visible.set(entry.target.id, entry.isIntersecting));
      const current = sections.find(section => visible.get(section.id));
      if (!current) return;
      navLinks.forEach(link => {
        if (link.getAttribute('href') === `#${current.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-24% 0px -45% 0px', threshold: 0 });
    sections.forEach(section => observer.observe(section));
  }
})();
