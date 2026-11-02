import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {createHandler, createRemoteStore, ConflictError} from '../src/marsad/server.mjs';

const token = 'test-only-one-time-activation-token';
const password = 'test-only-long-owner-password';
const env = {MARSAD_SESSION_SECRET: 'test-only-session-secret-with-more-than-32-characters', MARSAD_SETUP_TOKEN_HASH: createHash('sha256').update(token).digest('hex')};
function memoryStore() {
  const records = new Map(); let reads = 0, writes = 0;
  return {
    records, get reads() { return reads; }, get writes() { return writes; },
    async read(key) { return structuredClone(records.get(key) || null); },
    async write(key, data, etag) {
      const current = records.get(key);
      if (current ? current.etag !== etag : etag !== undefined) throw new ConflictError();
      const next = {data: structuredClone(data), etag: String(Number(etag || 0) + 1)}; records.set(key, next); return {etag: next.etag};
    },
    async cases(method, body) {
      if (method === 'GET') { reads++; return Response.json({cases: [{id: 'fixture', revision: 1, name: 'Private fixture'}]}); }
      writes++;
      return body.expectedRevision === 1 ? Response.json({record: {...body.record, revision: 2}}) : Response.json({error: 'Revision conflict'}, {status: 409});
    },
  };
}
async function harness(fn, configuration = env) {
  const store = memoryStore(), handler = createHandler({env: configuration, store});
  const server = createServer(handler);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const call = (path, {body, cookie, origin: callerOrigin = origin, ...options} = {}) => fetch(origin + path, {...options, redirect: 'manual', headers: {...(body === undefined ? {} : {'Content-Type': 'application/json', 'X-Casebook-Request': '1', Origin: callerOrigin}), ...(cookie ? {Cookie: cookie} : {}), ...options.headers}, ...(body === undefined ? {} : {method: 'POST', body: JSON.stringify(body)})});
  try { await fn({store, call}); } finally { await new Promise(resolve => server.close(resolve)); }
}
const cookieFrom = response => response.headers.get('set-cookie').split(';')[0];

test('private portal: activation, session, edits, conflicts, logout and login', async () => harness(async ({store, call}) => {
  let response = await call('/marsad/');
  assert.equal(response.status, 303); assert.equal(response.headers.get('location'), '/marsad/login/');
  response = await call('/marsad/api/cases'); assert.equal(response.status, 401); assert.equal(store.reads, 0);
  response = await call('/api/marsad?route=/api/cases'); assert.equal(response.status, 401);
  response = await call('/marsad/login/');
  const login = await response.text(); assert.match(login, /dir="rtl"/); assert.match(login, /data-marsad-mode="login"/); assert.doesNotMatch(login, /Private fixture/);
  assert.match(response.headers.get('cache-control'), /no-store/); assert.match(response.headers.get('x-robots-tag'), /noindex/);
  response = await call('/marsad/api/auth', {body: {action: 'setup', username: 'admin', password, token: 'invalid'}}); assert.equal(response.status, 403);
  response = await call('/marsad/api/auth', {body: {action: 'setup', username: 'admin', password: 'short', token}}); assert.equal(response.status, 400);
  response = await call('/marsad/api/auth', {body: {action: 'setup', username: 'admin', password, token}, origin: 'https://untrusted.example'}); assert.equal(response.status, 403); assert.equal(store.records.size, 0);
  response = await call('/marsad/api/auth', {body: {action: 'setup', username: 'admin', password, token}});
  assert.equal(response.status, 200); const cookie = cookieFrom(response);
  assert.match(response.headers.get('set-cookie'), /HttpOnly/); assert.match(response.headers.get('set-cookie'), /SameSite=Strict/); assert.match(response.headers.get('set-cookie'), /Path=\/marsad/);
  const admin = store.records.get('auth/admin-v1.json').data; assert.notEqual(admin.hash, password); assert.equal(admin.hash.length, 128); assert.equal(admin.salt.length, 48);
  response = await call('/marsad/api/auth', {body: {action: 'setup', username: 'another', password, token}}); assert.equal(response.status, 409);
  response = await call('/marsad/cases/fixture/', {cookie}); assert.equal(response.status, 200); assert.match(await response.text(), /data-marsad-mode="app"/);
  response = await call('/marsad/api/cases', {cookie}); assert.equal(response.status, 200); assert.equal((await response.json()).cases.length, 1);
  response = await call('/marsad/api/cases', {cookie, body: {record: {id: 'fixture'}, expectedRevision: 1}}); assert.equal(response.status, 200); assert.equal((await response.json()).record.revision, 2);
  response = await call('/marsad/api/cases', {cookie, body: {record: {id: 'fixture'}, expectedRevision: 0}}); assert.equal(response.status, 409);
  response = await call('/marsad/api/cases', {cookie, body: {expectedRevision: 1}, origin: 'https://untrusted.example'}); assert.equal(response.status, 403); assert.equal(store.writes, 2);
  response = await call('/marsad/api/cases', {cookie, method: 'POST', headers: {'Content-Type': 'application/json'}, body: undefined}); assert.equal(response.status, 403);
  response = await call('/marsad/api/cases', {cookie, body: {record: 'a'.repeat(500001)}}); assert.equal(response.status, 413);
  response = await call('/marsad/api/auth', {cookie, body: {action: 'logout'}}); assert.equal(response.status, 200); assert.match(response.headers.get('set-cookie'), /Max-Age=0/);
  response = await call('/marsad/api/cases'); assert.equal(response.status, 401);
  response = await call('/marsad/api/auth', {body: {action: 'login', username: 'admin', password: 'wrong'}}); assert.equal(response.status, 401);
  response = await call('/marsad/api/auth', {body: {action: 'login', username: 'admin', password}}); assert.equal(response.status, 200);
  response = await call('/marsad/api/auth', {cookie: cookieFrom(response)}); assert.equal((await response.json()).authenticated, true);
}));

test('shared login limit blocks brute force before password verification', async () => harness(async ({call}) => {
  for (let i = 0; i < 10; i++) assert.equal((await call('/marsad/api/auth', {body: {action: 'login', username: 'admin', password: 'wrong'}})).status, 401);
  assert.equal((await call('/marsad/api/auth', {body: {action: 'login', username: 'admin', password: 'wrong'}})).status, 429);
}));

test('production sessions set a secure cookie and reject insecure origins', async () => harness(async ({call}) => {
  const body = {action: 'setup', username: 'admin', password, token};
  assert.equal((await call('/marsad/api/auth', {body})).status, 403);
  // Origin host includes the dynamic local test port; production protocol must be HTTPS.
  const page = await call('/marsad/login/'); const url = new URL(page.url);
  const response = await call('/marsad/api/auth', {body, origin: 'https://' + url.host});
  assert.equal(response.status, 200); assert.match(response.headers.get('set-cookie'), /; Secure/);
}, {...env, VERCEL: '1'}));

test('remote storage keeps credentials server side and preserves revision conflicts', async () => {
  const calls = [];
  const store = createRemoteStore({MARSAD_DATA_ORIGIN: 'https://private-store.example', MARSAD_DATA_TOKEN: 'server-only-fixture'}, async (url, options) => {
    calls.push({url, options}); return options.method === 'POST' ? Response.json({error: 'conflict'}, {status: 409}) : Response.json({data: {value: 1}, etag: '1'});
  });
  assert.equal((await store.read('auth/admin-v1.json')).etag, '1');
  assert.equal(calls[0].options.headers['OAI-Sites-Authorization'], 'Bearer server-only-fixture'); assert.equal(calls[0].options.redirect, 'error');
  await assert.rejects(store.write('auth/admin-v1.json', {}, '1'), ConflictError);
  const response = await store.cases('POST', {expectedRevision: 1}); assert.equal(response.status, 409);
  assert.equal(calls.at(-1).url.pathname, '/api/cases');
  const invalid = createRemoteStore({MARSAD_DATA_ORIGIN: 'http://private-store.example', MARSAD_DATA_TOKEN: 'fixture'}); await assert.rejects(invalid.read('auth/admin-v1.json'));
});

test('deployment routes and client source keep data behind the authenticated API', async () => {
  const config = JSON.parse(await readFile('vercel.json', 'utf8'));
  assert.ok(config.rewrites.some(rule => rule.source === '/marsad/:path*' && rule.destination === '/api/marsad?route=/:path*'));
  const source = await readFile('src/marsad/casebook.tsx', 'utf8');
  assert.doesNotMatch(source, /fetch\(['"]\/api\//); assert.doesNotMatch(source, /style=\{/);
  const model = await readFile('src/marsad/model.ts', 'utf8');
  assert.doesNotMatch(source + model, /chatgpt\.site|libfile_|MARSAD_DATA_TOKEN|seedCases/);
});
