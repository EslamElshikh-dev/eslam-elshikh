import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
const analytics = await readFile(new URL('../assets/js/analytics.js', import.meta.url), 'utf8');
const main = await readFile(new URL('../assets/js/main.js', import.meta.url), 'utf8');
const classes = () => ({ add() {}, remove() {}, toggle() {}, contains() { return false; } });
function setup(choice = 'granted', search = '') {
  const documentEvents = new Map(), windowEvents = new Map(), timers = [], navigations = [];
  const makeElement = (value = '') => ({ value, textContent: '', dataset: {}, classList: classes(), events: new Map(), addEventListener(n, f) { this.events.set(n, f); }, setAttribute() {}, append() {}, focus() {}, remove() {} });
  const fields = Object.fromEntries(['name','service','url','details','timeline'].map(k => [k, makeElement()]));
  fields.service.options = [{ value: '' }, { value: 'web-development', textContent: 'تصميم وتطوير المواقع' }, { value: 'consultation', textContent: 'استشارة' }];
  Object.defineProperty(fields.service, 'selectedOptions', { get: () => fields.service.options.filter(o => o.value === fields.service.value) });
  const button = makeElement(), message = makeElement(), counter = makeElement(), form = makeElement();
  form.querySelector = selector => selector === '[data-project-submit]' ? button : selector === '[data-form-message]' ? message : selector === '[data-character-count]' ? counter : fields[selector.match(/name="([^"]+)"/)?.[1]] || null;
  const document = {
    readyState: 'loading', cookie: '', documentElement: { lang: 'ar', dir: 'rtl', dataset: {} }, body: { classList: classes(), appendChild() {} }, head: { appendChild() {} },
    querySelector: selector => selector === '[data-project-form]' ? form : null, querySelectorAll: () => [], createElement: () => makeElement(),
    addEventListener(name, callback) { documentEvents.set(name, callback); }
  };
  const window = { location: { pathname: '/contact/', origin: 'https://www.eslam-elshikh.com', search, assign: url => navigations.push(url) }, matchMedia: () => ({ matches: true }), scrollY: 0, addEventListener(n,f) { windowEvents.set(n,f); } };
  const context = vm.createContext({ window, document, URL, URLSearchParams, localStorage: { getItem: () => choice, setItem() {} }, setTimeout: callback => timers.push(callback), console });
  vm.runInContext(analytics, context);
  vm.runInContext(main, context);
  const click = () => button.events.get('click')();
  const events = () => (window.dataLayer || []).filter(e => e[0] === 'event');
  return { window, fields, button, message, form, timers, navigations, click, events, documentEvents, windowEvents };
}
for (const choice of [null, 'denied']) {
  const s = setup(choice);
  assert.equal(s.window.esAnalytics.track('whatsapp_click'), false);
  assert.equal(s.window.dataLayer, undefined, 'No analytics request or queue before consent');
}
{
  const s = setup();
  s.window.esAnalytics.track('project_message_ready', { service: 'web-development', placement: 'contact_form', name: 'private', message: 'private', url: 'private' });
  const e = s.events()[0];
  assert.equal(e[1], 'project_message_ready');
  assert.equal(e[2].service, 'web-development');
  assert.ok(!JSON.stringify(e).includes('private'), 'Form content must never enter analytics');
  assert.equal(s.window.esAnalytics.track('generate_lead'), false, 'Prepared intent must not be reported as a confirmed lead');
  s.window.esAnalytics.track('call_click', { service: 'private@example.com', placement: 'private' });
  assert.equal(s.events()[1][2].service, 'general');
  assert.equal(s.events()[1][2].placement, 'content');
}
{
  const s = setup('denied', '?service=web-development');
  assert.equal(s.fields.service.value, 'web-development');
  s.click(); assert.equal(s.navigations.length, 0); assert.ok(s.message.textContent.includes('يرجى'));
  s.fields.name.value = 'Test Business'; s.fields.details.value = 'A valid synthetic project description.';
  s.fields.url.value = 'javascript:alert(1)'; s.click(); assert.equal(s.navigations.length, 0);
  s.fields.url.value = 'https://example.com/'; s.click(); s.click();
  assert.equal(s.navigations.length, 1, 'Double clicks must open only one WhatsApp destination');
  const destination = new URL(s.navigations[0]);
  assert.equal(destination.hostname, 'wa.me'); assert.equal(destination.pathname, '/966579395299');
  assert.ok(destination.searchParams.get('text').includes('تصميم وتطوير المواقع'));
  assert.equal(s.events().length, 0, 'Contact still works without analytics consent');
  s.windowEvents.get('pageshow')(); assert.equal(s.button.disabled, false);
}
{
  const s = setup('granted', '?service=web-development');
  s.fields.name.value = 'Test'; s.fields.details.value = 'A valid synthetic project description.';
  s.form.events.get('input')(); s.form.events.get('input')();
  assert.equal(s.events().filter(e => e[1] === 'project_form_start').length, 1);
  s.click(); s.click();
  const e = s.events().find(e => e[1] === 'project_message_ready'); assert.ok(e);
  e[2].event_callback(); s.timers.forEach(f => f());
  assert.equal(s.navigations.length, 1, 'Analytics callback and timeout must not duplicate navigation');
}
{
  const s = setup('granted', '?service=unrecognized'); assert.equal(s.fields.service.value, '');
  const link = { getAttribute: () => 'https://wa.me/966579395299?text=private-content', closest: selector => selector === '.floating-contact' ? {} : null };
  s.documentEvents.get('click')({ type: 'click', target: { closest: () => link } });
  assert.equal(s.events()[0][1], 'whatsapp_click'); assert.equal(s.events()[0][2].placement, 'floating');
  assert.ok(!JSON.stringify(s.events()).includes('private-content'));
}
console.log('Conversion behavior passed: consent, privacy, attribution, validation, service selection, and single navigation.');
