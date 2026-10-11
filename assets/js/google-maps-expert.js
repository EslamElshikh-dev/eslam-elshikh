(() => {
  const root = document.querySelector('[data-maps-expert]');
  if (!root) return;
  const controls = root.querySelector('[data-expert-tabs]');
  const tabs = [...root.querySelectorAll('[data-expert-tab]')];
  const panels = [...root.querySelectorAll('[data-expert-panel]')];
  const rtl = document.documentElement.dir === 'rtl';
  const requestForm = root.querySelector('[data-expert-request-form]');
  const requestService = requestForm?.querySelector('[data-request-service]');
  const requestProfile = requestForm?.querySelector('[data-request-profile]');
  const requestNote = requestForm?.querySelector('[data-request-note]');
  const requestLink = requestForm?.querySelector('[data-request-link]');
  const english = requestForm?.dataset.language === 'en';
  const updateRequest = () => {
    if (!requestService || !requestLink) return;
    const option = requestService.selectedOptions[0];
    const { name, price } = option.dataset;
    const lines = english
      ? ['Hello Eng. Eslam, I would like to request:', `Service: ${name}`, `Price: SAR ${price}`, 'Estimated delivery: 3 to 5 business days. In some cases subject to restrictions, it may take up to 14 business days.']
      : ['مرحبًا م. إسلام، أرغب في طلب الخدمة التالية:', `الخدمة: ${name}`, `السعر: ${price} ريال`, 'مدة التنفيذ المتوقعة: من 3 إلى 5 أيام عمل. وفي بعض الحالات التي فُرضت عليها قيود، قد تصل المدة إلى 14 يوم عمل.'];
    const profile = requestProfile.value.trim();
    const note = requestNote.value.trim();
    if (profile) lines.push(`${english ? 'Profile link' : 'رابط الملف'}: ${profile}`);
    if (note) lines.push(`${english ? 'Case details' : 'تفاصيل الحالة'}: ${note}`);
    const message = lines.join('\n');
    requestForm.querySelector('[data-request-service-name]').textContent = name;
    requestForm.querySelector('[data-request-price]').textContent = price;
    requestForm.querySelector('[data-request-message]').textContent = message;
    const url = new URL(requestForm.dataset.whatsapp);
    url.searchParams.set('text', message);
    requestLink.href = url.href;
  };
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
    if (requestService && requestService.value !== id) {
      requestService.value = id;
      updateRequest();
    }
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
    root.querySelectorAll('[data-expert-request-select]').forEach(link => {
      link.addEventListener('click', () => activate(link.dataset.expertRequestSelect));
    });
    window.addEventListener('hashchange', openHash);
  }
  if (requestForm && requestService && requestLink) {
    updateRequest();
    requestForm.hidden = false;
    root.querySelector('[data-request-fallback]').hidden = true;
    requestService.addEventListener('change', () => {
      activate(requestService.value);
      updateRequest();
    });
    requestProfile.addEventListener('input', updateRequest);
    requestNote.addEventListener('input', updateRequest);
    requestLink.addEventListener('click', event => {
      if (!requestForm.reportValidity()) event.preventDefault();
    });
    requestForm.addEventListener('submit', event => {
      event.preventDefault();
      if (requestForm.reportValidity()) requestLink.click();
    });
  }
  const storyTabs = [...root.querySelectorAll('[data-story-tab]')];
  const storyPanels = [...root.querySelectorAll('[data-story-panel]')];
  if (storyTabs.length && storyTabs.length === storyPanels.length) {
    const openStory = (index, focus = false) => {
      storyTabs.forEach((tab, i) => {
        tab.setAttribute('aria-selected', String(i === index));
        tab.tabIndex = i === index ? 0 : -1;
      });
      storyPanels.forEach((panel, i) => {
        panel.hidden = i !== index;
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('aria-labelledby', storyTabs[i].id);
        panel.tabIndex = 0;
      });
      if (focus) storyTabs[index].focus();
    };
    openStory(0);
    root.querySelector('[data-story-tabs]').hidden = false;
    root.classList.add('expert-stories-enhanced');
    storyTabs.forEach((tab, index) => {
      tab.addEventListener('click', () => openStory(index));
      tab.addEventListener('keydown', event => {
        let next;
        if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = storyTabs.length - 1;
        else if (event.key === 'ArrowRight') next = (index + (rtl ? -1 : 1) + storyTabs.length) % storyTabs.length;
        else if (event.key === 'ArrowLeft') next = (index + (rtl ? 1 : -1) + storyTabs.length) % storyTabs.length;
        else return;
        event.preventDefault();
        openStory(next, true);
      });
    });
  }
  const progress = root.querySelector('[data-expert-progress]');
  if (progress) {
    let scheduled = false;
    const updateProgress = () => {
      const rect = root.getBoundingClientRect();
      const traversed = Math.max(0, -rect.top);
      const distance = Math.max(1, rect.height - window.innerHeight);
      progress.style.transform = `scaleX(${Math.min(1, traversed / distance)})`;
      scheduled = false;
    };
    const scheduleProgress = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(updateProgress);
    };
    window.addEventListener('scroll', scheduleProgress, { passive: true });
    window.addEventListener('resize', scheduleProgress);
    updateProgress();
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
