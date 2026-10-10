(() => {
  'use strict';
  const en = document.documentElement.lang === 'en';
  const rtl = document.documentElement.dir === 'rtl';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const number = n => String(n).padStart(2, '0');

  document.querySelectorAll('[data-crm-showcase]').forEach(showcase => {
    const tabs = [...showcase.querySelectorAll('[data-showcase-tab]')];
    const panels = [...showcase.querySelectorAll('[data-showcase-panel]')];
    const picker = showcase.querySelector('[data-showcase-tabs]');
    const dialog = showcase.querySelector('[data-showcase-lightbox]');
    const viewport = dialog?.querySelector('[data-showcase-lightbox-viewport]');
    const fullImage = dialog?.querySelector('[data-showcase-lightbox-image]');
    const zoomButton = dialog?.querySelector('[data-showcase-zoom]');
    if (!picker || !tabs.length || panels.length !== tabs.length || !dialog || !viewport || !fullImage || !zoomButton) return;

    const views = panels.map(panel => ({
      tabs: [...panel.querySelectorAll('[data-showcase-scene-tab]')],
      scenes: [...panel.querySelectorAll('[data-showcase-scene]')],
      selected: 0
    }));
    if (views.some(view => !view.tabs.length || view.tabs.length !== view.scenes.length)) return;
    let active = 0;
    let opener = null;
    let drag = null;
    const sceneLabel = button => button.querySelector('.crm-showcase-scene-label > span')?.textContent.trim() || button.textContent.trim();
    const animateChange = (element, direction = 1) => {
      if (reducedMotion || !element.animate || !showcase.classList.contains('is-enhanced')) return;
      element.getAnimations().forEach(animation => animation.cancel());
      element.animate([
        { opacity: .35, transform: `translateX(${direction * (rtl ? -1 : 1) * 14}px)` },
        { opacity: 1, transform: 'translateX(0)' }
      ], { duration: 380, easing: 'cubic-bezier(.22, 1, .36, 1)' });
    };

    // Add tab semantics only after the whole gallery can be enhanced.
    const enhanceTabs = (list, buttons, content) => {
      list.setAttribute('role', 'tablist');
      buttons.forEach(button => button.setAttribute('role', 'tab'));
      content.forEach(panel => { panel.setAttribute('role', 'tabpanel'); panel.tabIndex = 0; });
    };
    const scrollTab = (list, button) => {
      const box = list.getBoundingClientRect();
      const item = button.getBoundingClientRect();
      const offset = item.left < box.left ? item.left - box.left : item.right > box.right ? item.right - box.right : 0;
      if (offset) list.scrollBy({ left: offset, behavior: reducedMotion ? 'instant' : 'smooth' });
    };
    const saveHash = id => {
      try { history.replaceState(null, '', `#${id}`); } catch (_) { /* Gallery also works without history access. */ }
    };
    const resetZoom = () => {
      viewport.classList.remove('is-zoomed', 'is-panning');
      zoomButton.setAttribute('aria-pressed', 'false');
      viewport.scrollTo(0, 0);
      drag = null;
    };
    const syncLightbox = () => {
      const view = views[active];
      const scene = view.scenes[view.selected];
      const image = scene.querySelector('img');
      fullImage.src = image.src;
      fullImage.alt = image.alt;
      fullImage.width = Number(image.getAttribute('width'));
      fullImage.height = Number(image.getAttribute('height'));
      dialog.querySelector('#crm-lightbox-title').textContent = sceneLabel(view.tabs[view.selected]);
      dialog.querySelector('[data-showcase-lightbox-brand]').textContent = panels[active].querySelector('.crm-showcase-meta > span').textContent;
      dialog.querySelector('[data-showcase-lightbox-count]').textContent = `${number(view.selected + 1)} / ${number(view.scenes.length)}`;
      resetZoom();
    };
    const selectScene = (productIndex, sceneIndex, { focus = false, hash = false } = {}) => {
      const view = views[productIndex];
      const previous = view.selected;
      view.selected = (sceneIndex + view.scenes.length) % view.scenes.length;
      view.tabs.forEach((tab, index) => {
        const selected = index === view.selected;
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
        view.scenes[index].hidden = !selected;
      });
      panels[productIndex].querySelector('[data-showcase-counter]').textContent = `${number(view.selected + 1)} / ${number(view.scenes.length)}`;
      panels[productIndex].querySelector('[data-showcase-progress]').style.setProperty('--scene-progress', `${(view.selected + 1) / view.scenes.length * 100}%`);
      scrollTab(panels[productIndex].querySelector('[data-showcase-scenes]'), view.tabs[view.selected]);
      if (previous !== view.selected) animateChange(view.scenes[view.selected], sceneIndex - previous);
      if (hash) showcase.querySelector('[data-showcase-announcement]').textContent = `${sceneLabel(view.tabs[view.selected])} — ${view.selected + 1} / ${view.scenes.length}`;
      if (focus) view.tabs[view.selected].focus({ preventScroll: true });
      if (hash) saveHash(view.scenes[view.selected].id);
      if (dialog.open && productIndex === active) syncLightbox();
    };
    const selectProduct = (index, { focus = false, hash = false } = {}) => {
      const previous = active;
      active = index;
      tabs.forEach((tab, position) => {
        const selected = position === active;
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
        panels[position].hidden = !selected;
      });
      scrollTab(picker, tabs[active]);
      if (previous !== active) animateChange(panels[active], active - previous);
      if (focus) tabs[active].focus({ preventScroll: true });
      if (hash) saveHash(panels[active].id);
    };
    const arrowTabs = (event, index, length, select) => {
      let next;
      if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = length - 1;
      else if (event.key === 'ArrowRight') next = (index + (rtl ? -1 : 1) + length) % length;
      else if (event.key === 'ArrowLeft') next = (index + (rtl ? 1 : -1) + length) % length;
      else return;
      event.preventDefault();
      select(next);
    };

    enhanceTabs(picker, tabs, panels);
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => selectProduct(index, { hash: true }));
      tab.addEventListener('keydown', event => arrowTabs(event, index, tabs.length, next => selectProduct(next, { focus: true, hash: true })));
      const panel = panels[index];
      const view = views[index];
      enhanceTabs(panel.querySelector('[data-showcase-scenes]'), view.tabs, view.scenes);
      view.tabs.forEach((button, sceneIndex) => {
        button.addEventListener('click', () => selectScene(index, sceneIndex, { hash: true }));
        button.addEventListener('keydown', event => arrowTabs(event, sceneIndex, view.tabs.length, next => selectScene(index, next, { focus: true, hash: true })));
      });
      panel.querySelector('[data-showcase-view-controls]').hidden = false;
      panel.querySelector('[data-showcase-prev]').addEventListener('click', () => selectScene(index, view.selected - 1, { hash: true }));
      panel.querySelector('[data-showcase-next]').addEventListener('click', () => selectScene(index, view.selected + 1, { hash: true }));
      view.scenes.forEach(scene => scene.querySelector('[data-showcase-image]').addEventListener('click', event => {
        if (typeof dialog.showModal !== 'function') return;
        event.preventDefault();
        opener = event.currentTarget;
        syncLightbox();
        dialog.showModal();
        document.body.classList.add('crm-showcase-image-open');
      }));
      selectScene(index, 0);
    });

    dialog.querySelector('[data-showcase-lightbox-prev]').addEventListener('click', () => selectScene(active, views[active].selected - 1, { hash: true }));
    dialog.querySelector('[data-showcase-lightbox-next]').addEventListener('click', () => selectScene(active, views[active].selected + 1, { hash: true }));
    dialog.addEventListener('keydown', event => {
      if (viewport.classList.contains('is-zoomed')) return;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        const delta = event.key === 'ArrowLeft' ? rtl ? 1 : -1 : rtl ? -1 : 1;
        selectScene(active, views[active].selected + delta, { hash: true });
      }
    });
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const box = dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => {
      document.body.classList.remove('crm-showcase-image-open');
      resetZoom();
      // Changing screens can hide the original opener; restore focus to the current view instead.
      const currentLink = views[active].scenes[views[active].selected].querySelector('[data-showcase-image]');
      (opener?.checkVisibility?.() ? opener : currentLink).focus({ preventScroll: true });
    });
    zoomButton.addEventListener('click', () => {
      const zoomed = viewport.classList.toggle('is-zoomed');
      zoomButton.setAttribute('aria-pressed', String(zoomed));
      viewport.scrollTo(0, 0);
    });
    viewport.addEventListener('pointerdown', event => {
      if (!viewport.classList.contains('is-zoomed') || event.pointerType !== 'mouse' || event.button !== 0) return;
      event.preventDefault();
      drag = { x: event.clientX, y: event.clientY, left: viewport.scrollLeft, top: viewport.scrollTop };
      viewport.setPointerCapture(event.pointerId);
      viewport.classList.add('is-panning');
    });
    viewport.addEventListener('pointermove', event => {
      if (!drag) return;
      viewport.scrollLeft = drag.left - event.clientX + drag.x;
      viewport.scrollTop = drag.top - event.clientY + drag.y;
    });
    const stopDrag = () => { drag = null; viewport.classList.remove('is-panning'); };
    viewport.addEventListener('pointerup', stopDrag);
    viewport.addEventListener('pointercancel', stopDrag);

    showcase.querySelectorAll('[data-showcase-trial]').forEach(link => link.addEventListener('click', event => {
      const lab = document.querySelector('[data-crm-lab]');
      const sector = lab?.querySelector(`[data-crm-sector="${link.dataset.showcaseTrial}"]`);
      if (!sector || lab.querySelector('[data-crm-lab-controls]')?.hidden) return;
      event.preventDefault();
      sector.click();
      lab.dataset.crmReference = link.dataset.showcaseReference;
      let reference = lab.querySelector('[data-crm-reference]');
      if (!reference) {
        reference = document.createElement('p');
        reference.className = 'crm-showcase-selection';
        reference.dataset.crmReference = '';
        reference.setAttribute('role', 'status');
        lab.querySelector('.crm-lab-heading > div:last-child').append(reference);
      }
      reference.textContent = en ? `Your starting point: ${link.dataset.showcaseReference}. Shape it around your business below.` : `نقطة البداية: ${link.dataset.showcaseReference}. خصّص التجربة لنشاطك بالأسفل.`;
      lab.dispatchEvent(new CustomEvent('crm:reference-selected'));
      saveHash(lab.id);
      const heading = lab.querySelector('h2');
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
      lab.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth', block: 'start' });
    }));

    const applyHash = () => {
      const id = location.hash.slice(1);
      const product = panels.findIndex(panel => panel.id === id);
      if (product !== -1) { selectProduct(product); return true; }
      for (let index = 0; index < views.length; index++) {
        const scene = views[index].scenes.findIndex(item => item.id === id);
        if (scene !== -1) { selectProduct(index); selectScene(index, scene); return true; }
      }
      return false;
    };
    const featured = tabs.findIndex(tab => tab.hasAttribute('data-showcase-featured'));
    selectProduct(featured === -1 ? 0 : featured);
    showcase.classList.add('is-enhanced');
    if (!reducedMotion && 'IntersectionObserver' in window) {
      const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.remove('is-reveal-pending');
        reveal.unobserve(entry.target);
      }), { threshold: .08 });
      showcase.querySelectorAll('.crm-showcase-heading, .crm-showcase-picker, .crm-showcase-workflow').forEach(element => {
        element.classList.add('crm-showcase-reveal', 'is-reveal-pending');
        reveal.observe(element);
      });
    }
    showcase.querySelector('[data-showcase-picker-hint]').hidden = false;
    if (applyHash()) requestAnimationFrame(() => showcase.scrollIntoView({ block: 'start', behavior: 'instant' }));
    window.addEventListener('hashchange', () => { if (applyHash()) panels[active].scrollIntoView({ block: 'start', behavior: 'instant' }); });
  });
})();
