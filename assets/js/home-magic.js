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
})();
