(() => {
  'use strict';
  const home = document.querySelector('[data-home-experience]');
  if (!home) return;
  const en = home.dataset.homeLang === 'en';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const tabs = [...home.querySelectorAll('[data-home-tab]')];
  const panels = [...home.querySelectorAll('[data-home-screen]')];
  const tablist = home.querySelector('[data-home-tabs]');
  const activate = (tab, focus = false) => {
    if (!tab || !panels.some(p => p.dataset.homeScreen === tab.dataset.homeTab)) return;
    tabs.forEach(button => {
      const selected = button === tab;
      button.setAttribute('aria-selected', String(selected));
      button.removeAttribute('aria-pressed');
      button.tabIndex = selected ? 0 : -1;
    });
    panels.forEach(panel => {
      const selected = panel.dataset.homeScreen === tab.dataset.homeTab;
      panel.hidden = !selected;
      panel.classList.toggle('is-current', selected);
    });
    if (focus) tab.focus();
  };
  if (tablist && tabs.length && panels.length) {
    tablist.setAttribute('role', 'tablist');
    tabs.forEach(tab => {
      tab.setAttribute('role', 'tab');
      tab.addEventListener('click', () => activate(tab));
      tab.addEventListener('keydown', event => {
        const i = tabs.indexOf(tab);
        let next;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        if (event.key === 'ArrowRight') next = (i + (en ? 1 : -1) + tabs.length) % tabs.length;
        if (event.key === 'ArrowLeft') next = (i + (en ? -1 : 1) + tabs.length) % tabs.length;
        if (next === undefined) return;
        event.preventDefault();
        activate(tabs[next], true);
      });
    });
    panels.forEach(panel => { panel.setAttribute('role', 'tabpanel'); });
    activate(tabs[0]);
  }
  home.classList.add('hx-enhanced');

  const filters = [...home.querySelectorAll('[data-home-filter]')];
  const work = [...home.querySelectorAll('[data-home-work]')];
  const workGrid = home.querySelector('.hx-work-grid');
  const filterStatus = home.querySelector('[data-home-filter-status]');
  filters.forEach(button => button.addEventListener('click', () => {
    const type = button.dataset.homeFilter;
    if (type !== 'all' && !work.some(card => card.dataset.homeWork === type)) return;
    filters.forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
    let count = 0;
    work.forEach(card => {
      card.hidden = type !== 'all' && card.dataset.homeWork !== type;
      card.classList.remove('hx-filter-in');
      if (!card.hidden) { count++; if (!reduced.matches) requestAnimationFrame(() => card.classList.add('hx-filter-in')); }
    });
    workGrid?.classList.toggle('is-filtered', type !== 'all');
    if (filterStatus) filterStatus.textContent = en ? `${count} selected experiences shown.` : `يظهر الآن ${count} من نماذج الأعمال المختارة.`;
  }));

  const startTitle = home.querySelector('[data-home-start-title]');
  const startPrompt = home.querySelector('[data-home-start-prompt]');
  const startWhatsApp = home.querySelector('[data-home-start-whatsapp]');
  const selectedGoal = home.querySelector('[data-home-selected]');
  home.querySelectorAll('[data-home-pick]').forEach(pick => pick.addEventListener('click', () => {
    if (startTitle) startTitle.textContent = pick.dataset.homeTitle;
    if (startPrompt) startPrompt.textContent = pick.dataset.homePrompt;
    if (selectedGoal) selectedGoal.textContent = `${en ? 'Your starting point: ' : 'بدايتك: '}${pick.closest('[data-home-route]')?.querySelector('.hx-route-tag')?.textContent || ''}`;
    // Only the server-rendered, known business WhatsApp destination is used.
    const destination = pick.dataset.homeWhatsapp;
    if (startWhatsApp && destination?.startsWith('https://wa.me/')) startWhatsApp.href = destination;
  }));

  const journeyLinks = [...home.querySelectorAll('.hx-journey-links a')];
  const journeySections = journeyLinks.map(link => document.getElementById(link.hash.slice(1))).filter(Boolean);
  let scheduled = false;
  const updateJourney = () => {
    scheduled = false;
    let current = journeySections[0];
    journeySections.forEach(section => { if (section.getBoundingClientRect().top <= 230) current = section; });
    journeyLinks.forEach(link => {
      if (link.hash === `#${current?.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };
  window.addEventListener('scroll', () => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(updateJourney); }
  }, { passive: true });
  updateJourney();
  if ('IntersectionObserver' in window && !reduced.matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('hx-entered');
        observer.unobserve(entry.target);
      });
    }, { threshold: .12 });
    home.querySelectorAll('.hx-heading,.hx-method-grid,.hx-about-grid,.hx-start-panel').forEach(element => observer.observe(element));
  }
})();
