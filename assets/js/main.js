(() => {
  'use strict';

  const GA_ID = 'G-DW2DZW7KQ7';
  const PRIMARY_PHONE = '966579395299';
  const header = document.querySelector('[data-header]');
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');
  const themeButton = document.querySelector('[data-theme-toggle]');
  const themeColor = document.querySelector('[data-theme-color]');
  const pathname = window.location.pathname.replace(/index\.html$/, '');

  const loadAnalytics = () => {
    if (document.querySelector(`script[src*="${GA_ID}"]`)) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag(){ window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { anonymize_ip: true, send_page_view: true });
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);
  };

  const CONSENT_KEY = 'es-analytics-consent';
  const applyAnalyticsConsent = (choice) => {
    try { localStorage.setItem(CONSENT_KEY, choice); } catch {}
    document.querySelector('[data-analytics-consent]')?.remove();
    if (choice === 'accepted') loadAnalytics();
  };
  const initAnalyticsConsent = () => {
    let saved = null;
    try { saved = localStorage.getItem(CONSENT_KEY); } catch {}
    if (saved === 'accepted') { loadAnalytics(); return; }
    if (saved === 'declined') return;
    const isEnglish = document.documentElement.lang === 'en';
    const banner = document.createElement('aside');
    banner.className = 'analytics-consent';
    banner.dataset.analyticsConsent = '';
    banner.setAttribute('aria-label', isEnglish ? 'Analytics preferences' : 'تفضيلات التحليلات');
    banner.innerHTML = isEnglish
      ? '<p><strong>Privacy-friendly analytics</strong><span>Allow anonymous interaction measurement to improve the website. Project message content is never sent to analytics.</span></p><div><button class="button button-small" type="button" data-consent-accept>Allow</button><button class="button button-ghost button-small" type="button" data-consent-decline>Decline</button><a href="/privacy/">Privacy</a></div>'
      : '<p><strong>تحليلات تحترم الخصوصية</strong><span>يمكنك السماح بقياس التفاعل العام لتحسين الموقع. لا يُرسل محتوى رسالة المشروع إلى التحليلات.</span></p><div><button class="button button-small" type="button" data-consent-accept>السماح</button><button class="button button-ghost button-small" type="button" data-consent-decline>رفض</button><a href="/privacy/">التفاصيل</a></div>';
    document.body.appendChild(banner);
    banner.querySelector('[data-consent-accept]')?.addEventListener('click', () => applyAnalyticsConsent('accepted'));
    banner.querySelector('[data-consent-decline]')?.addEventListener('click', () => applyAnalyticsConsent('declined'));
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAnalyticsConsent, { once: true });
  else initAnalyticsConsent();

  const trackConversion = (eventName, details = {}) => {
    const payload = { page_path: window.location.pathname, ...details };
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: eventName, ...payload });
    if (typeof window.gtag === 'function') window.gtag('event', eventName, payload);
    window.dispatchEvent(new CustomEvent('eslam:conversion', { detail: { event: eventName, ...payload } }));
  };

  const applyTheme = (theme, persist = false) => {
    const normalized = theme === 'light' ? 'light' : 'dark';
    document.documentElement.dataset.theme = normalized;
    themeColor?.setAttribute('content', normalized === 'light' ? '#f4f8fb' : '#07111b');
    themeButton?.setAttribute('aria-pressed', String(normalized === 'light'));
    themeButton?.setAttribute('aria-label', normalized === 'light' ? 'تفعيل الوضع الداكن' : 'تفعيل الوضع الفاتح');
    if (persist) {
      try { localStorage.setItem('es-theme', normalized); } catch {}
    }
  };

  applyTheme(document.documentElement.dataset.theme || 'dark');
  themeButton?.addEventListener('click', () => {
    applyTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light', true);
  });

  const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 16);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  const closeMenu = () => {
    if (!menuButton || !mobileMenu) return;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', document.documentElement.lang === 'en' ? 'Open menu' : 'فتح القائمة');
    mobileMenu.classList.remove('is-open');
  };

  menuButton?.addEventListener('click', () => {
    const willOpen = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(willOpen));
    menuButton.setAttribute('aria-label', willOpen ? (document.documentElement.lang === 'en' ? 'Close menu' : 'إغلاق القائمة') : (document.documentElement.lang === 'en' ? 'Open menu' : 'فتح القائمة'));
    mobileMenu?.classList.toggle('is-open', willOpen);
  });
  mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });

  document.querySelectorAll('.services-grid, .primary-services-grid, .projects-grid, .maps-portfolio-grid, .posts-grid, .values-grid, .google-stats, .credentials-grid, .case-studies-grid, .knowledge-hubs-grid').forEach((group) => {
    [...group.children].forEach((element, index) => element.style.setProperty('--reveal-delay', `${Math.min(index, 6) * 55}ms`));
  });

  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px' });
    reveals.forEach((element) => observer.observe(element));
  } else {
    reveals.forEach((element) => element.classList.add('is-visible'));
  }

  const filterButtons = [...document.querySelectorAll('[data-service-filter]')];
  const serviceCards = document.querySelectorAll('[data-services-grid] .service-card');
  const servicesList = document.querySelector('[data-services-grid]');
  if (servicesList) servicesList.id = servicesList.id || 'services-list';
  const applyFilter = (group) => {
    filterButtons.forEach((button) => {
      const active = button.dataset.serviceFilter === group;
      button.setAttribute('aria-selected', String(active));
      button.setAttribute('tabindex', active ? '0' : '-1');
      button.setAttribute('aria-controls', 'services-list');
    });
    serviceCards.forEach((card) => { card.hidden = group !== 'all' && card.dataset.serviceGroup !== group; });
  };
  if (filterButtons.length && serviceCards.length) {
    applyFilter(filterButtons[0].dataset.serviceFilter);
    filterButtons.forEach((button, index) => {
      button.addEventListener('click', () => applyFilter(button.dataset.serviceFilter));
      button.addEventListener('keydown', (event) => {
        if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const direction = document.documentElement.dir === 'rtl' ? -1 : 1;
        let target = index;
        if (event.key === 'Home') target = 0;
        else if (event.key === 'End') target = filterButtons.length - 1;
        else if (event.key === 'ArrowRight') target = (index + direction + filterButtons.length) % filterButtons.length;
        else target = (index - direction + filterButtons.length) % filterButtons.length;
        filterButtons[target].focus();
        filterButtons[target].click();
      });
    });
  }

  document.querySelectorAll('.accordion details').forEach((detail) => {
    detail.addEventListener('toggle', () => {
      if (!detail.open) return;
      detail.closest('.accordion')?.querySelectorAll('details[open]').forEach((other) => { if (other !== detail) other.open = false; });
    });
  });

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href') || '';
    let eventName = 'link_click';
    if (href.startsWith('tel:')) eventName = 'phone_click';
    else if (href.includes('wa.me/')) eventName = 'whatsapp_click';
    else if (href.startsWith('mailto:')) eventName = 'email_click';
    else if (href.includes('maps.app.goo.gl') || href.includes('google.com/maps')) eventName = 'google_maps_click';
    else if (link.closest('.project-card, .case-study-card, .maps-project-card')) eventName = 'portfolio_click';
    else if (href.startsWith('/services/')) eventName = 'service_click';
    else if (href.startsWith('/blog/')) eventName = 'content_click';
    trackConversion(eventName, { link_url: link.href, link_text: (link.textContent || '').trim().slice(0, 120) });
  });

  const serviceNamesAr = {
    cybersecurity: 'الأمن السيبراني وحماية الأنظمة',
    'cloud-solutions': 'الحلول السحابية الآمنة',
    'ai-agents': 'تطوير الذكاء الاصطناعي ووكلاء AI',
    'web-development': 'تطوير المواقع والتطبيقات',
    'google-support': 'استشارات ودعم منتجات Google',
    'google-business-profile': 'إدارة وتوثيق الأنشطة التجارية على Google',
    'knowledge-bases': 'قواعد المعرفة والبحث الذكي',
    seo: 'تحسين محركات البحث SEO',
    'digital-advertising': 'إدارة الإعلانات الرقمية'
  };
  const serviceNamesEn = {
    cybersecurity: 'Cybersecurity and system protection',
    'cloud-solutions': 'Secure cloud solutions',
    'ai-agents': 'AI agents and automation',
    'web-development': 'Web and software development',
    'google-support': 'Google product support',
    'google-business-profile': 'Google Business Profile',
    'knowledge-bases': 'Knowledge bases and intelligent search',
    seo: 'Search engine optimization',
    'digital-advertising': 'Digital advertising'
  };
  const serviceNames = document.documentElement.lang === 'en' ? serviceNamesEn : serviceNamesAr;

  const form = document.querySelector('[data-contact-form]');
  if (form) {
    const serviceSelect = form.elements.service;
    const selectedService = new URLSearchParams(window.location.search).get('service');
    if (selectedService && serviceNames[selectedService] && serviceSelect) serviceSelect.value = selectedService;
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const values = new FormData(form);
      const name = String(values.get('name') || '').trim();
      const service = String(values.get('service') || '');
      const goal = String(values.get('goal') || '').trim();
      const budget = String(values.get('budget') || 'غير محددة');
      const timeline = String(values.get('timeline') || 'غير محدد');
      const isEnglish = document.documentElement.lang === 'en';
      const message = (isEnglish ? [
        'Hello Eng. Eslam Elshikh,',
        `Name or business: ${name}`,
        `Requested service: ${serviceNames[service] || service}`,
        `Estimated budget: ${budget}`,
        `Target timeline: ${timeline}`,
        'Goal and current situation:',
        goal
      ] : [
        'مرحبًا م. إسلام الشيخ،',
        `الاسم أو النشاط: ${name}`,
        `الخدمة المطلوبة: ${serviceNames[service] || service}`,
        `الميزانية التقريبية: ${budget}`,
        `الموعد المتوقع: ${timeline}`,
        'تفاصيل الهدف:',
        goal
      ]).join('\n');
      const url = `https://wa.me/${PRIMARY_PHONE}?text=${encodeURIComponent(message)}`;
      trackConversion('contact_form_submit', { requested_service: serviceNames[service] || service, budget_range: budget, project_timeline: timeline });
      const opened = window.open(url, '_blank', 'noopener,noreferrer');
      const status = form.querySelector('.form-status');
      if (status) status.textContent = opened ? 'تم تجهيز الرسالة. راجعها في WhatsApp قبل الإرسال.' : 'تعذر فتح نافذة جديدة. استخدم زر WhatsApp المباشر.';
    });
  }

  document.querySelectorAll('.mobile-bottom-nav a').forEach((link) => {
    const path = new URL(link.href).pathname;
    const active = path === '/' ? pathname === '/' : pathname.startsWith(path);
    if (active) link.setAttribute('aria-current', 'page');
  });

  document.querySelectorAll('.footer-bottom').forEach((footerBottom) => {
    if (footerBottom.querySelector('.footer-legal')) return;
    footerBottom.insertAdjacentHTML('beforeend', '<div class="footer-legal"><a href="/privacy/">سياسة الخصوصية</a><a href="/terms/">شروط الاستخدام</a><a href="/.well-known/security.txt">الإبلاغ الأمني</a></div>');
  });

  const mapFrames = document.querySelectorAll('iframe[data-map-src]');
  const loadMapFrame = (frame) => {
    if (!frame.dataset.mapSrc || frame.src !== 'about:blank') return;
    frame.src = frame.dataset.mapSrc;
    frame.addEventListener('load', () => { frame.style.opacity = '1'; }, { once: true });
  };
  if ('IntersectionObserver' in window) {
    const mapObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        loadMapFrame(entry.target);
        mapObserver.unobserve(entry.target);
      });
    }, { rootMargin: '350px 0px' });
    mapFrames.forEach((frame) => mapObserver.observe(frame));
  } else {
    mapFrames.forEach(loadMapFrame);
  }
})();