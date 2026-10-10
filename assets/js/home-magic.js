(() => {
  'use strict';
  const root = document.querySelector('[data-home-crafted]');
  if (!root) return;
  const english = document.documentElement.lang === 'en';
  const ribbon = root.querySelector('[data-home-ticker]');
  const toggle = ribbon?.querySelector('[data-ticker-toggle]');
  if (ribbon && toggle) {
    toggle.hidden = false;
    ribbon.classList.add('is-ready');
    toggle.addEventListener('click', () => {
      const paused = ribbon.classList.toggle('is-paused');
      toggle.setAttribute('aria-pressed', String(paused));
      toggle.setAttribute('aria-label', paused
        ? english ? 'Resume the moving expertise ribbon' : 'تشغيل الشريط المتحرك'
        : english ? 'Pause the moving expertise ribbon' : 'إيقاف الشريط المتحرك');
    });
  }
  const opening = root.querySelector('[data-home-opening]');
  if ('IntersectionObserver' in window) {
    const motionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.target.classList.toggle('is-offscreen', !entry.isIntersecting));
    }, { rootMargin: '80px 0px' });
    if (ribbon) motionObserver.observe(ribbon);
    if (opening) motionObserver.observe(opening);
  }
  const onVisibility = () => root.classList.toggle('home-document-hidden', document.hidden);
  document.addEventListener('visibilitychange', onVisibility);
  onVisibility();

  const links = [...root.querySelectorAll('[data-home-section]')];
  const targets = links.map(link => ({ link, section: document.getElementById(link.dataset.homeSection) })).filter(item => item.section);
  let scheduled = false;
  const updateLocation = () => {
    scheduled = false;
    const nav = root.querySelector('[data-home-journey]');
    const navTop = nav ? Number.parseFloat(getComputedStyle(nav).top) || 90 : 90;
    const threshold = navTop + (nav?.offsetHeight || 60) + 48;
    if (nav) {
      const length = Math.max(1, root.offsetHeight - window.innerHeight);
      const progress = Math.min(100, Math.max(0, -root.getBoundingClientRect().top / length * 100));
      nav.style.setProperty('--home-progress', `${progress.toFixed(2)}%`);
    }
    let selected = null;
    let nearestTop = -Infinity;
    for (const item of targets) {
      const top = item.section.getBoundingClientRect().top;
      if (top <= threshold && top > nearestTop) { selected = item; nearestTop = top; }
    }
    targets.forEach(item => {
      if (item === selected) item.link.setAttribute('aria-current', 'location');
      else item.link.removeAttribute('aria-current');
    });
  };
  const scheduleLocation = () => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(updateLocation); }
  };
  window.addEventListener('scroll', scheduleLocation, { passive: true });
  window.addEventListener('resize', scheduleLocation, { passive: true });
  updateLocation();

  // Each lens works with mouse, touch and a direction-aware keyboard.
  // Without JavaScript all server-rendered panels remain available.
  root.querySelectorAll('[data-home-tabs]').forEach(area => {
    const controls = area.querySelector('[data-home-tab-controls]');
    const tabs = [...area.querySelectorAll('[data-home-tab]')];
    const panels = [...area.querySelectorAll('[data-home-panel]')];
    if (!controls || !tabs.length || tabs.length !== panels.length ||
      tabs.some(tab => !panels.some(panel => panel.id === tab.getAttribute('aria-controls') && panel.dataset.homePanel === tab.dataset.homeTab))) return;
    const select = (index, focus = false) => {
      tabs.forEach((tab, i) => {
        tab.setAttribute('aria-selected', String(i === index));
        tab.tabIndex = i === index ? 0 : -1;
      });
      panels.forEach(panel => { panel.hidden = panel.id !== tabs[index].getAttribute('aria-controls'); });
      if (focus) tabs[index].focus();
      scheduleLocation();
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => select(index));
      tab.addEventListener('keydown', event => {
        const rtl = document.documentElement.dir === 'rtl';
        let next;
        if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = tabs.length - 1;
        else if (event.key === 'ArrowRight') next = (index + (rtl ? -1 : 1) + tabs.length) % tabs.length;
        else if (event.key === 'ArrowLeft') next = (index + (rtl ? 1 : -1) + tabs.length) % tabs.length;
        else return;
        event.preventDefault();
        select(next, true);
      });
    });
    select(0);
    controls.hidden = false;
    area.classList.add('home-tabs-ready');
  });
})();
