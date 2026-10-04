(() => {
  'use strict';
  const root = document.querySelector('[data-proof-engine]');
  if (!root) return;
  const english = document.documentElement.lang.startsWith('en');
  const cards = [...root.querySelectorAll('[data-proof-card]')];
  const search = root.querySelector('[data-proof-search]');
  const city = root.querySelector('[data-proof-city]');
  const status = root.querySelector('[data-proof-status]');
  const empty = root.querySelector('[data-proof-empty]');
  const gallery = root.querySelector('.maps-gallery');
  const sectors = [...root.querySelectorAll('[data-proof-sector]')];
  const more = root.querySelector('[data-proof-more]');
  const moreWrap = root.querySelector('[data-proof-more-wrap]');
  const progress = root.querySelector('[data-proof-progress]');
  const dialog = document.querySelector('[data-maps-dialog]');
  const content = dialog.querySelector('[data-maps-dialog-content]');
  const closeButton = dialog.querySelector('[data-maps-close]');
  const position = dialog.querySelector('[data-maps-position]');
  const normalize = value => value.toLocaleLowerCase().normalize('NFKD').replace(/[\u064b-\u065f\u0670]/g, '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/\s+/g, ' ').trim();
  const searchable = new Map(cards.map(card => [card, normalize(card.dataset.search)]));
  let sector = 'all';
  let limit = 18;
  let matching = cards;
  let activeCard = null;
  let opener = null;
  let previousHash = '';

  function apply({ resetLimit = true } = {}) {
    if (resetLimit) limit = 18;
    const term = normalize(search.value);
    matching = cards.filter(card => (sector === 'all' || card.dataset.sector === sector)
      && (city.value === 'all' || card.dataset.region === city.value)
      && (!term || searchable.get(card).includes(term)));
    const show = new Set(matching.slice(0, limit));
    cards.forEach(card => { card.hidden = !show.has(card); });
    gallery.classList.toggle('is-filtered', sector !== 'all' || city.value !== 'all' || Boolean(term));
    const shown = Math.min(limit, matching.length);
    status.textContent = english ? `${shown} of ${matching.length} matching work records` : `عرض ${shown} من ${matching.length} عملًا مطابقًا`;
    empty.hidden = matching.length !== 0;
    moreWrap.hidden = shown >= matching.length;
    progress.textContent = english ? `${matching.length - shown} more to discover` : `${matching.length - shown} عملًا آخر بانتظارك`;
  }

  function reset() {
    sector = 'all'; search.value = ''; city.value = 'all';
    sectors.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.proofSector === 'all')));
    apply();
  }

  function showDetails(card, trigger, updateHash = true) {
    const template = document.getElementById(`map-detail-${card.dataset.cid}`);
    if (!template) return;
    if (!dialog.open) {
      opener = trigger || card.querySelector('[data-map-open]');
      previousHash = location.hash.startsWith('#map-') ? '' : location.hash;
    }
    activeCard = card;
    content.replaceChildren(template.content.cloneNode(true));
    content.querySelector('img').loading = 'eager';
    const pool = matching.includes(card) ? matching : cards;
    position.textContent = `${pool.indexOf(card) + 1} / ${pool.length}`;
    dialog.scrollTop = 0;
    if (!dialog.open) { dialog.showModal(); document.body.classList.add('maps-dialog-open'); }
    if (updateHash) history.replaceState(null, '', `#map-${card.dataset.cid}`);
    closeButton.focus({ preventScroll: true });
  }

  document.querySelectorAll('[data-map-open]').forEach(link => link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || typeof dialog.showModal !== 'function') return;
    const card = cards.find(item => item.dataset.cid === link.dataset.mapOpen);
    if (!card) return;
    event.preventDefault(); showDetails(card, link);
  }));
  closeButton.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    document.body.classList.remove('maps-dialog-open');
    if (location.hash.startsWith('#map-')) history.replaceState(null, '', `${location.pathname}${location.search}${previousHash}`);
    if (opener?.isConnected && !opener.closest('[hidden]')) opener.focus({ preventScroll: true });
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  function step(direction) {
    const pool = matching.includes(activeCard) ? matching : cards;
    const index = pool.indexOf(activeCard);
    showDetails(pool[(index + direction + pool.length) % pool.length], opener);
  }
  dialog.querySelector('[data-maps-prev]').addEventListener('click', () => step(-1));
  dialog.querySelector('[data-maps-next]').addEventListener('click', () => step(1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault(); step((event.key === 'ArrowRight') === (document.documentElement.dir === 'rtl') ? -1 : 1);
    }
  });
  sectors.forEach(button => button.addEventListener('click', () => {
    sector = button.dataset.proofSector;
    sectors.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    apply();
    window.esAnalytics?.track('proof_map_interaction', { service: 'google-business-profile', placement: 'maps_collection' });
  }));
  search.addEventListener('input', () => apply());
  city.addEventListener('change', () => apply());
  root.querySelectorAll('[data-proof-reset]').forEach(button => button.addEventListener('click', reset));
  more.addEventListener('click', () => {
    const firstNew = matching[limit]; limit += 18; apply({ resetLimit: false });
    firstNew?.querySelector('[data-map-open]')?.focus({ preventScroll: true });
  });
  function fromHash() {
    const cid = location.hash.match(/^#map-(\d+)$/)?.[1];
    const card = cards.find(item => item.dataset.cid === cid);
    if (!card || typeof dialog.showModal !== 'function') return;
    if (!matching.includes(card)) reset();
    limit = Math.max(limit, matching.indexOf(card) + 1);
    apply({ resetLimit: false });
    showDetails(card, card.querySelector('[data-map-open]'), false);
  }
  window.addEventListener('hashchange', fromHash);
  apply(); fromHash();
})();
