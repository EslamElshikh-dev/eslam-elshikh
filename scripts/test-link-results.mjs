import assert from 'node:assert/strict';
import { test } from 'node:test';
import { classifyLinks, formatReport } from './check-link-results.mjs';

const url = 'https://x.com/remoesoo10';
const policy = { blocked403: [url] };
const report = (failedUrl = url, code = 403) => ({
  total: 2, unique: 2, successful: 1, errors: 1, timeouts: 0, unknown: 0, unsupported: 0,
  error_map: { 'dist/about/index.html': [{ url: failedUrl, status: { code, text: `${code} response` } }] }
});

test('only a reviewed exact 403 becomes an explicit unverified warning', () => {
  const r = report();
  const result = classifyLinks(r, policy, '2');
  assert.equal(result.failed, false);
  assert.equal(result.blocked.length, 1);
  assert.match(formatReport(r, result), /unverified/);
  assert.match(formatReport(r, result), /dist\/about\/index.html/);
});

test('404, 429 and server failures still fail for a reviewed URL', () => {
  for (const code of [404, 429, 500, 503]) assert.equal(classifyLinks(report(url, code), policy, 2).failed, true);
});

test('new URLs, query variants and internal files cannot inherit the exception', () => {
  for (const u of ['https://x.com/missing-account', `${url}?new=1`, 'https://www.eslam-elshikh.com/missing/', 'file:///dist/missing.html']) {
    assert.equal(classifyLinks(report(u), policy, 2).failed, true);
  }
});

test('network errors without an HTTP code still fail', () => {
  const r = report();
  delete r.error_map['dist/about/index.html'][0].status.code;
  r.error_map['dist/about/index.html'][0].status.text = 'Network error';
  assert.equal(classifyLinks(r, policy, 2).failed, true);
});

test('timeouts, unknown and unsupported results fail independently', () => {
  for (const key of ['timeouts', 'unknown', 'unsupported']) assert.equal(classifyLinks({ ...report(), [key]: 1 }, policy, 2).failed, true);
});

test('truncated, empty and malformed reports fail closed', () => {
  for (const r of [null, {}, { ...report(), total: 0 }, { ...report(), error_map: {} }, { ...report(), error_map: { x: null } }, { ...report(), errors: 2 }]) {
    assert.throws(() => classifyLinks(r, policy, 2));
  }
});

test('scanner startup failures and missing exit codes cannot pass', () => {
  for (const code of ['', 1, 3, undefined]) assert.throws(() => classifyLinks(report(), policy, code));
});

test('a clean complete scan passes without warnings', () => {
  const r = { ...report(), errors: 0, error_map: {} };
  assert.equal(classifyLinks(r, policy, 0).failed, false);
  assert.throws(() => classifyLinks(r, policy, 2));
});

test('cached and fresh failures retain their references without duplicating URL counts', () => {
  const r = report();
  r.errors = 2;
  r.error_map['dist/en/about/index.html'] = [{ url, status: { code: 403, text: 'Error (cached)' } }];
  const result = classifyLinks(r, policy, 2);
  assert.equal(result.blocked.length, 1);
  assert.equal(result.blocked[0].occurrences, 2);
});

test('a reviewed Google rate limit does not exempt other URLs or status codes', () => {
  const google = 'https://support.google.com/webmasters/answer/7440203';
  const p = { ...policy, blocked429: [google] };
  assert.equal(classifyLinks(report(google, 429), p, 2).failed, false);
  for (const code of [403, 404, 500]) assert.equal(classifyLinks(report(google, code), p, 2).failed, true);
  assert.equal(classifyLinks(report(`${google}?new=1`, 429), p, 2).failed, true);
  assert.equal(classifyLinks(report(url, 429), p, 2).failed, true);
});
