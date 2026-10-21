import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../assets/js/google-audit.js', import.meta.url), 'utf8');
const build = await readFile(new URL('../build.mjs', import.meta.url), 'utf8');
const checkSource = build.match(/const manualChecks = \[([\s\S]*?)\n  \];/)?.[1];
const definitions = [...checkSource.matchAll(/\["([^"]+)", (\d+), "([^"]+)", "([^"]+)"\]/g)];
assert.equal(definitions.length, 8, 'The rendered tool must define eight checks');
assert.match(build, /data-confirmation="\$\{esc\(label\)\}"/);

class Element {
 constructor() { this.value = ''; this.hidden = true; this.listeners = {}; this.children = []; this.dataset = {}; }
 addEventListener(type, callback) { this.listeners[type] = callback; }
 replaceChildren(...children) { this.children = children; }
 removeAttribute(name) { delete this[name]; }
 scrollIntoView() {}
 focus() { this.focused = true; }
 click() { this.listeners.click?.(); }
}

const nodes = new Map();
const node = selector => { if (!nodes.has(selector)) nodes.set(selector, new Element()); return nodes.get(selector); };
const inputs = definitions.map(([, name, weight, confirmation, label]) => Object.assign(new Element(), { name, value: weight, checked: false, dataset: { label, confirmation } }));
node('[data-manual-audit]').querySelectorAll = () => inputs;
const root = { querySelector: node };
const events = [];
vm.runInNewContext(source, {
 document: { querySelector: () => root, createElement: () => new Element() },
 window: { esAnalytics: { track: (...args) => events.push(args) } },
 URL,
 fetch() { assert.fail('A self-check must not request Google or a server'); }
});

node('[data-audit-query]').value = 'نشاط اختباري، الرياض';
node('[data-audit-website]').value = 'https://business.example/';
node('[data-audit-phone]').value = '0500000000';
node('[data-audit-submit]').click();
assert.equal(node('[data-manual-audit]').hidden, false);

// Regression: checking only reviews must not manufacture exact review data or a name pass.
inputs.find(input => input.name === 'reviews').checked = true;
node('[data-manual-calculate]').click();
assert.equal(node('[data-score]').textContent, '15');
assert.equal(node('[data-audit-checks]').children.filter(item => item.className === 'is-pass').length, 1);
assert.match(node('[data-audit-checks]').children[0].textContent, /^غير مؤكد:/);
assert.match(node('[data-result-rating]').textContent, /لا تعرف متوسط التقييم أو عدد المراجعات الفعلي/);
assert.doesNotMatch(node('[data-result-rating]').textContent, /4\.0|\(5 مراجعة\)/);
assert.match(node('[data-result-reference]').textContent, /لم تُفحص المطابقة تلقائيًا/);
assert.equal(node('[data-audit-checks]').children.length, 8, 'Expected fields cannot create automatic matching claims');

// Every combination must reflect exactly the selected confirmations.
for (let mask = 0; mask < 256; mask++) {
 inputs.forEach((input, i) => { input.checked = Boolean(mask & (1 << i)); });
 node('[data-manual-calculate]').click();
 const expected = inputs.filter(input => input.checked);
 assert.equal(Number(node('[data-score]').textContent), expected.reduce((sum, input) => sum + Number(input.value), 0));
 node('[data-audit-checks]').children.forEach((item, i) => assert.equal(item.className === 'is-pass', inputs[i].checked));
 assert.equal(node('[data-audit-priorities]').children.length, Math.min(3, 8 - expected.length) || 1);
}

node('[data-manual-edit]').click();
assert.equal(node('[data-manual-audit]').hidden, false);
assert.equal(node('[data-audit-results]').hidden, true);
assert.equal(inputs.every(input => input.checked), true, 'Editing preserves the visitor’s answers');

for (const [value, valid] of [
 ['https://maps.app.goo.gl/example', true],
 ['https://www.google.com/maps/place/example', true],
 ['https://www.google.com/search?q=example', false],
 ['https://google.com.attacker.example/maps/', false],
 ['javascript:alert(1)', false],
 ['http://maps.google.com/maps/', false]
]) {
 node('[data-audit-query]').value = value;
 node('[data-manual-calculate]').click();
 assert.equal(node('[data-result-maps]').hidden, !valid);
 if (!valid) assert.equal(node('[data-result-maps]').href, undefined);
}
const message = new URL(node('[data-audit-whatsapp]').href).searchParams.get('text');
assert.match(message, /الدرجة من إجاباتي: 100\/100/);
assert.match(message, /لم تُجلب بيانات من Google/);
assert.equal(events.every(([, payload]) => Object.keys(payload).every(key => ['service', 'placement'].includes(key))), true, 'Analytics events contain no entered business details');

node('[data-audit-query]').value = 'a';
node('[data-audit-submit]').click();
assert.equal(node('[data-audit-query]').focused, true);
console.log('Manual audit: review-only regression, 256 answer combinations, edit flow, privacy and Maps-link checks passed.');
