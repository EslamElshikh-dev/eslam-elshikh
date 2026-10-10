/* Progressive enhancement: anchors, reports and captures also work without JS. */
(() => {
  const root = document.querySelector('[data-case-experience]');
  if (!root) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const links = [...root.querySelectorAll('[data-case-section]')];
  const sections = links.map(link => document.getElementById(link.dataset.caseSection)).filter(Boolean);
  const picker = root.querySelector('.case-section-picker');
  const select = picker?.querySelector('select');
  const counter = picker?.querySelector('.case-step-count');
  const progress = root.querySelector('.case-reading-progress');
  const nav = root.querySelector('.case-story-nav');
  let activeIndex = -1;
  let frame = 0;

  function selectSection(index, inside) {
    if (index === activeIndex) return;
    activeIndex = index;
    links.forEach((link, position) => {
      if (inside && position === index) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    if (select && sections[index]) select.value = sections[index].id;
    if (counter) counter.textContent = `${String(index + 1).padStart(2, '0')} / ${String(sections.length).padStart(2, '0')}`;
    if (progress) progress.value = inside ? index + 1 : 0;
    // Keep the active chip visible on medium screens without moving the page.
    const current = links[index];
    const strip = current?.parentElement;
    if (inside && strip && strip.scrollWidth > strip.clientWidth && strip.clientWidth) {
      const item = current.getBoundingClientRect();
      const bounds = strip.getBoundingClientRect();
      if (item.left < bounds.left || item.right > bounds.right) {
        strip.scrollBy({ left: item.left + item.width / 2 - bounds.left - bounds.width / 2, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
      }
    }
  }

  function updateSection() {
    frame = 0;
    if (!sections.length) return;
    const boundary = (nav?.getBoundingClientRect().bottom || 150) + 64;
    let index = 0;
    sections.forEach((section, position) => {
      if (section.getBoundingClientRect().top <= boundary) index = position;
    });
    const inside = sections[0].getBoundingClientRect().top <= boundary;
    // Crossing the hero/first-section boundary also needs an update at index 0.
    if (index === activeIndex && progress && Boolean(progress.value) !== inside) activeIndex = -1;
    selectSection(index, inside);
  }

  function queueUpdate() {
    if (!frame) frame = requestAnimationFrame(updateSection);
  }

  if (select) {
    picker.hidden = false;
    select.addEventListener('change', () => {
      const target = sections.find(section => section.id === select.value);
      if (!target) return;
      // A native fragment navigation preserves Back/Forward and deep links.
      window.location.hash = target.id;
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  }
  window.addEventListener('scroll', queueUpdate, { passive: true });
  window.addEventListener('resize', queueUpdate, { passive: true });
  window.addEventListener('hashchange', queueUpdate);
  updateSection();

  const gallery = root.querySelector('[data-case-gallery]');
  const viewButtons = [...root.querySelectorAll('[data-case-view]')];
  const tools = root.querySelector('.case-proof-tools');
  if (gallery && tools) {
    tools.hidden = false;
    gallery.dataset.view = 'both';
    viewButtons.forEach(button => button.addEventListener('click', () => {
      gallery.dataset.view = button.dataset.caseView;
      viewButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    }));
  }

  const dialog = root.querySelector('.case-capture-viewer');
  const captures = [...root.querySelectorAll('[data-case-capture]')];
  if (dialog && typeof dialog.showModal === 'function' && captures.length) {
    const viewerImage = dialog.querySelector('[data-case-viewer-image]');
    const viewerTitle = dialog.querySelector('#case-viewer-title');
    const viewerCaption = dialog.querySelector('[data-case-viewer-caption]');
    const original = dialog.querySelector('[data-case-viewer-original]');
    const previous = dialog.querySelector('[data-case-viewer-prev]');
    const next = dialog.querySelector('[data-case-viewer-next]');
    let current = 0;

    function showCapture(index) {
      current = Math.max(0, Math.min(captures.length - 1, index));
      const capture = captures[current];
      const figure = capture.closest('figure');
      const source = capture.querySelector('img');
      viewerImage.src = capture.href;
      viewerImage.alt = source.alt;
      viewerImage.width = Number(source.getAttribute('width'));
      viewerImage.height = Number(source.getAttribute('height'));
      viewerTitle.textContent = [...figure.querySelector('.case-proof-image-label').children].map(part => part.textContent.trim()).join(' · ');
      viewerCaption.textContent = `${current + 1} / ${captures.length} · ${figure.querySelector('figcaption').textContent}`;
      original.href = capture.href;
      previous.disabled = current === 0;
      next.disabled = current === captures.length - 1;
    }

    captures.forEach(capture => capture.setAttribute('aria-haspopup', 'dialog'));
    captures.forEach((capture, index) => capture.addEventListener('click', event => {
      // Preserve open-in-new-tab, modified clicks, and the original asset URL.
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      showCapture(index);
      dialog.showModal();
    }));
    dialog.querySelector('[data-case-viewer-close]').addEventListener('click', () => dialog.close());
    previous.addEventListener('click', () => showCapture(current - 1));
    next.addEventListener('click', () => showCapture(current + 1));
    dialog.addEventListener('keydown', event => {
      const rtl = document.documentElement.dir === 'rtl';
      if (event.key === (rtl ? 'ArrowLeft' : 'ArrowRight')) {
        event.preventDefault();
        showCapture(current + 1);
      } else if (event.key === (rtl ? 'ArrowRight' : 'ArrowLeft')) {
        event.preventDefault();
        showCapture(current - 1);
      }
    });
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    });
  }

  // Short, finite reveals; content remains visible if JS or observation fails.
  if (!reducedMotion.matches && 'IntersectionObserver' in window) {
    const reveal = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('case-arrived');
        reveal.unobserve(entry.target);
      });
    }, { threshold: 0.08 });
    root.querySelectorAll('.case-content > section, .case-content > aside').forEach(section => reveal.observe(section));
  }
})();
