import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
const analytics = await readFile(new URL('../assets/js/analytics.js', import.meta.url), 'utf8');
const main = await readFile(new URL('../assets/js/main.js', import.meta.url), 'utf8');
const classes = () => ({ add() {}, remove() {}, toggle() {}, contains() { return false; } });
function setup(choice = 'granted', search = '', legacyChoice = null) {
  const documentEvents = new Map(), windowEvents = new Map(), timers = [], navigations = [], scripts = [], banners = [];
  const storedChoices = { 'es-analytics-consent-v2': choice, 'es-analytics-consent': legacyChoice };
  const makeElement = (value = '') => ({ value, textContent: '', dataset: {}, children: [], classList: classes(), events: new Map(), addEventListener(n, f) { this.events.set(n, f); }, setAttribute() {}, append(...children) { this.children.push(...children); }, focus() {}, remove() {} });
  const fields = Object.fromEntries(['name','service','url','details','timeline'].map(k => [k, makeElement()]));
  fields.service.options = [{ value: '' }, { value: 'web-development', textContent: 'تصميم وتطوير المواقع' }, { value: 'consultation', textContent: 'استشارة' }];
  Object.defineProperty(fields.service, 'selectedOptions', { get: () => fields.service.options.filter(o => o.value === fields.service.value) });
  const button = makeElement(), message = makeElement(), counter = makeElement(), form = makeElement();
  form.querySelector = selector => selector === '[data-project-submit]' ? button : selector === '[data-form-message]' ? message : selector === '[data-character-count]' ? counter : fields[selector.match(/name="([^"]+)"/)?.[1]] || null;
  const preferences = makeElement();
  const document = {
    readyState: 'loading', cookie: '', documentElement: { lang: 'ar', dir: 'rtl', dataset: {} }, body: { classList: classes(), appendChild(el) { banners.push(el); } }, head: { appendChild(el) { scripts.push(el); } },
    querySelector: selector => selector === '[data-project-form]' ? form : null, querySelectorAll: selector => selector === '[data-analytics-preferences]' ? [preferences] : [], createElement: () => makeElement(),
    addEventListener(name, callback) { documentEvents.set(name, callback); }
  };
  const window = { location: { pathname: '/contact/', origin: 'https://www.eslam-elshikh.com', search, assign: url => navigations.push(url) }, matchMedia: () => ({ matches: true }), scrollY: 0, addEventListener(n,f) { windowEvents.set(n,f); } };
  const context = vm.createContext({ window, document, URL, URLSearchParams, localStorage: { getItem: key => storedChoices[key] ?? null, setItem(key, value) { storedChoices[key] = value; } }, setTimeout: callback => timers.push(callback), console });
  vm.runInContext(analytics, context);
  vm.runInContext(main, context);
  const click = () => button.events.get('click')();
  const events = () => (window.dataLayer || []).filter(e => e[0] === 'event');
  return { window, fields, button, message, form, timers, navigations, click, events, documentEvents, windowEvents, scripts, banners, preferences, storedChoices };
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
{
  const s = setup();
  s.documentEvents.get('DOMContentLoaded')();
  assert.equal(s.events().filter(e => e[1] === 'conversion').length, 0, 'A page view is not a contact conversion');
  s.window.esAnalytics.track('whatsapp_click', { placement: 'floating' });
  s.window.esAnalytics.track('call_click', { placement: 'header' });
  const conversions = s.events().filter(e => e[1] === 'conversion');
  assert.deepEqual(Array.from(conversions, e => e[2].send_to), ['AW-18360481022/zh4bCILsiJAdEP7p-rJE', 'AW-18360481022/QFnfCIXsiJAdEP7p-rJE']);
  assert.ok(conversions.every(e => e[2].value === 0 && e[2].currency === 'SAR'));
  assert.equal(s.scripts.length, 1, 'Analytics and Ads share one Google tag loader');
  const configs = s.window.dataLayer.filter(e => e[0] === 'config');
  assert.deepEqual(Array.from(configs, e => e[1]), ['G-MDJ2HGF9E1', 'AW-18360481022']);
  assert.equal(configs[1][2].allow_ad_personalization_signals, false);
  const consent = s.window.dataLayer.find(e => e[0] === 'consent');
  assert.equal(consent[2].ad_personalization, 'denied');
  for (const name of ['email_click', 'project_message_ready', 'booking_message_ready', 'gbp_audit_complete']) s.window.esAnalytics.track(name);
  assert.equal(s.events().filter(e => e[1] === 'conversion').length, 2, 'Prepared messages and unrelated events must not inflate Ads conversions');
}
{
  const s = setup(null, '', 'granted');
  s.documentEvents.get('DOMContentLoaded')();
  assert.equal(s.window.esAnalytics.track('whatsapp_click'), false, 'Legacy Analytics-only consent must not enable Ads measurement');
  assert.equal(s.scripts.length, 0);
  assert.equal(s.banners.length, 1, 'Request a fresh choice for analytics and ad measurement');
  const actions = s.banners[0].children[1].children;
  actions.find(el => el.textContent === 'السماح بالتحليلات').events.get('click')();
  assert.equal(s.storedChoices['es-analytics-consent-v2'], 'granted');
  assert.equal(s.window.esAnalytics.track('whatsapp_click'), true);
}
{
  const s = setup(null, '', 'denied');
  s.documentEvents.get('DOMContentLoaded')();
  assert.equal(s.banners.length, 0, 'Keep an existing refusal');
  assert.equal(s.window.esAnalytics.track('call_click'), false);
}
{
  const s = setup();
  s.documentEvents.get('DOMContentLoaded')();
  s.window.esAnalytics.track('call_click');
  s.preferences.events.get('click')();
  s.banners.at(-1).children[1].children.find(el => el.textContent === 'رفض').events.get('click')();
  const revoked = s.window.dataLayer.filter(e => e[0] === 'consent').at(-1);
  assert.equal(revoked[2].analytics_storage, 'denied');
  assert.equal(revoked[2].ad_storage, 'denied');
  assert.equal(revoked[2].ad_user_data, 'denied');
  assert.equal(s.window.esAnalytics.track('call_click'), false);
  s.preferences.events.get('click')();
  s.banners.at(-1).children[1].children.find(el => el.textContent === 'السماح بالتحليلات').events.get('click')();
  assert.equal(s.window.esAnalytics.track('call_click'), true, 'A renewed choice resumes measurement');
  assert.equal(s.scripts.length, 1, 'Renewal must not install a duplicate tag');
  assert.equal(s.window['ga-disable-G-MDJ2HGF9E1'], false);
}
console.log('Conversion behavior passed: consent, privacy, Ads click routing, consent migration and withdrawal, attribution, validation, service selection, and single navigation.');
