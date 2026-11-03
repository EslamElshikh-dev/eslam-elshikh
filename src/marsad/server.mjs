import {createHash, createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual} from 'node:crypto';
import {promisify} from 'node:util';
import {getIronSession} from 'iron-session';

const scrypt = promisify(scryptCallback);
const ADMIN = 'auth/admin-v1.json';
export class ConflictError extends Error {}
class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }
const sha256 = value => createHash('sha256').update(value).digest('hex');
const same = (a, b) => typeof a === 'string' && typeof b === 'string' && Buffer.byteLength(a) === Buffer.byteLength(b) && timingSafeEqual(Buffer.from(a), Buffer.from(b));
const fail = (status, message) => { throw new HttpError(status, message); };

export function createRemoteStore(env, fetcher = fetch) {
  async function call(path, options = {}) {
    if (!env.MARSAD_DATA_ORIGIN || !env.MARSAD_DATA_TOKEN) throw new Error('Storage configuration missing');
    const origin = new URL(env.MARSAD_DATA_ORIGIN);
    if (origin.protocol !== 'https:' || origin.username || origin.password) throw new Error('Invalid storage origin');
    const response = await fetcher(new URL(path, origin), {
      ...options, cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(12000),
      headers: {'OAI-Sites-Authorization': `Bearer ${env.MARSAD_DATA_TOKEN}`, ...options.headers},
    });
    if (!response.headers.get('content-type')?.includes('application/json')) throw new Error('Storage unavailable');
    return response;
  }
  return {
    async read(key) {
      const response = await call('/api/private-records?key=' + encodeURIComponent(key));
      if (response.status === 404) return null;
      if (!response.ok) throw new Error('Storage read failed');
      return response.json();
    },
    async write(key, data, etag) {
      const response = await call('/api/private-records', {method: 'POST', headers: {'Content-Type': 'application/json', 'X-Casebook-Request': '1'}, body: JSON.stringify({key, data, ...(etag === undefined ? {} : {etag})})});
      if (response.status === 409) throw new ConflictError('Record changed');
      if (!response.ok) throw new Error('Storage write failed');
      return response.json();
    },
    cases(method, body) {
      return call('/api/cases', {method, ...(method === 'POST' ? {headers: {'Content-Type': 'application/json', 'X-Casebook-Request': '1'}, body: JSON.stringify(body)} : {})});
    },
  };
}

async function readBody(req, limit) {
  if (Number(req.headers['content-length'] || 0) > limit) fail(413, 'الطلب أكبر من الحد المسموح.');
  // Vercel may parse the body before invoking a Node function.
  if (req.body !== undefined) {
    const raw = typeof req.body === 'string' || Buffer.isBuffer(req.body) ? String(req.body) : JSON.stringify(req.body);
    if (Buffer.byteLength(raw) > limit) fail(413, 'الطلب أكبر من الحد المسموح.');
    try { return JSON.parse(raw); } catch { fail(400, 'صيغة الطلب غير صالحة.'); }
  }
  const chunks = []; let size = 0;
  for await (const chunk of req) { size += Buffer.byteLength(chunk); if (size > limit) fail(413, 'الطلب أكبر من الحد المسموح.'); chunks.push(chunk); }
  try { return JSON.parse(Buffer.concat(chunks).toString()); } catch { fail(400, 'صيغة الطلب غير صالحة.'); }
}

function assertMutation(req, secure) {
  if (req.headers['x-casebook-request'] !== '1' || !req.headers['content-type']?.startsWith('application/json')) fail(403, 'الطلب غير مسموح.');
  try {
    const origin = new URL(req.headers.origin);
    if (origin.host !== req.headers.host || origin.protocol !== (secure ? 'https:' : 'http:')) throw new Error();
  } catch { fail(403, 'مصدر الطلب غير مسموح.'); }
}

async function attempt(store, secret, identity, maximum) {
  const digest = createHmac('sha256', secret).update(identity).digest('hex');
  const key = `auth/limits/${digest}.json`;
  for (let retry = 0; retry < 4; retry++) {
    const current = await store.read(key), now = Date.now();
    const data = current && current.data.until > now ? current.data : {count: 0, until: now + 600000};
    if (data.count >= maximum) fail(429, 'محاولات كثيرة. جرّب مجددًا بعد عشر دقائق.');
    try { await store.write(key, {...data, count: data.count + 1}, current?.etag); return; }
    catch (error) { if (!(error instanceof ConflictError)) throw error; }
  }
  fail(429, 'يرجى الانتظار قليلًا قبل المحاولة.');
}

function html(mode, version, ownerEmail) {
  const email = ownerEmail.replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><meta name="referrer" content="no-referrer"><meta name="theme-color" content="#0f3933"><title>مرصد | إسلام الشيخ — إدارة الملفات التجارية</title><link rel="icon" href="/favicon.ico"><script src="/assets/js/theme.js"></script><link rel="stylesheet" href="/assets/marsad/style.css?v=${version}"><script type="module" src="/assets/marsad/app.js?v=${version}"></script></head><body data-marsad-mode="${mode}" data-owner-email="${email}"><div id="marsad-root"></div><noscript>يتطلب مرصد تفعيل JavaScript لتسجيل الدخول وإدارة الملفات.</noscript></body></html>`;
}

export function createHandler({env = process.env, store = createRemoteStore(env)} = {}) {
  return async (req, res) => {
    const json = (status, body) => { res.statusCode = status; res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.end(JSON.stringify(body)); };
    const redirect = path => { res.statusCode = 303; res.setHeader('Location', path); res.end(); };
    res.setHeader('Cache-Control', 'private, no-store, max-age=0');
    res.setHeader('CDN-Cache-Control', 'no-store');
    res.setHeader('Vercel-CDN-Cache-Control', 'no-store');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Content-Security-Policy', "default-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; form-action 'none'; img-src 'self' data: blob:; font-src 'self'; style-src 'self'; script-src 'self'; connect-src 'self'");
    try {
      const secure = env.VERCEL === '1' || env.NODE_ENV === 'production';
      if (!env.MARSAD_SESSION_SECRET || env.MARSAD_SESSION_SECRET.length < 32) throw new Error('Session configuration missing');
      const ownerEmail = String(env.MARSAD_OWNER_EMAIL || '').trim().toLowerCase();
      if (ownerEmail && (ownerEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail))) throw new Error('Invalid owner configuration');
      const session = await getIronSession(req, res, {cookieName: 'marsad_owner', password: env.MARSAD_SESSION_SECRET, ttl: 43200, cookieOptions: {path: '/marsad', secure, httpOnly: true, sameSite: 'strict'}});
      const url = new URL(req.url, 'https://localhost');
      let route = url.pathname.startsWith('/marsad') ? url.pathname.slice(7) : url.searchParams.get('route') || '/';
      route = '/' + route.replace(/^\/+|\/+$/g, '');
      const authenticated = session.owner === true;
      if (route === '/api/auth') {
        if (req.method === 'GET') return json(200, {authenticated});
        if (req.method !== 'POST') return json(405, {error: 'الطريقة غير مسموحة.'});
        assertMutation(req, secure);
        const body = await readBody(req, 8192);
        if (!body || typeof body !== 'object' || Array.isArray(body)) fail(400, 'الطلب غير صالح.');
        if (body.action === 'logout') { session.destroy(); return json(200, {ok: true}); }
        if (!['login', 'setup'].includes(body.action)) fail(400, 'الإجراء غير صالح.');
        if (typeof body.username !== 'string' || !body.username.trim() || body.username.length > (ownerEmail ? 254 : 80) || typeof body.password !== 'string' || body.password.length > 256) fail(400, ownerEmail ? 'أدخل البريد الإلكتروني وكلمة المرور.' : 'أدخل اسم المستخدم وكلمة المرور.');
        const identity = ownerEmail ? body.username.trim().toLowerCase() : body.username.trim();
        if (body.action === 'setup') {
          if (typeof body.token !== 'string' || body.token.length > 512 || !same(sha256(body.token), env.MARSAD_SETUP_TOKEN_HASH)) fail(403, 'رابط التفعيل غير صالح.');
          if (ownerEmail && identity !== ownerEmail) fail(403, 'التفعيل متاح لبريد المالك فقط.');
          if (body.password.length < 12) fail(400, 'كلمة المرور تحتاج 12 حرفًا على الأقل.');
          if (await store.read(ADMIN)) fail(409, 'تم تفعيل الحساب بالفعل. استخدم تسجيل الدخول.');
          const salt = randomBytes(24).toString('hex');
          const hash = Buffer.from(await scrypt(body.password, salt, 64)).toString('hex');
          try { await store.write(ADMIN, {username: identity, ...(ownerEmail ? {email: ownerEmail} : {}), salt, hash, createdAt: new Date().toISOString()}); }
          catch (error) { if (error instanceof ConflictError) fail(409, 'تم تفعيل الحساب بالفعل.'); throw error; }
        } else {
          const ip = String(req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
          await attempt(store, env.MARSAD_SESSION_SECRET, 'global-login', 100);
          await attempt(store, env.MARSAD_SESSION_SECRET, 'ip-login:' + ip, 10);
          const admin = await store.read(ADMIN);
          const salt = admin?.data.salt || 'uninitialized-owner-account';
          const hash = Buffer.from(await scrypt(body.password, salt, 64)).toString('hex');
          const registeredIdentity = ownerEmail ? String(admin?.data.email || admin?.data.username || '').trim().toLowerCase() : admin?.data.username;
          if (!admin || (ownerEmail && identity !== ownerEmail) || !same(identity, registeredIdentity) || !same(hash, admin.data.hash)) fail(401, 'بيانات الدخول غير صحيحة.');
        }
        session.owner = true;
        await session.save();
        return json(200, {ok: true});
      }
      if (route === '/api/cases') {
        if (!authenticated) fail(401, 'سجّل الدخول للوصول إلى الملفات.');
        if (!['GET', 'POST'].includes(req.method)) return json(405, {error: 'الطريقة غير مسموحة.'});
        let body;
        if (req.method === 'POST') { assertMutation(req, secure); body = await readBody(req, 500000); }
        const upstream = await store.cases(req.method, body);
        const payload = await upstream.json();
        return json(upstream.status, payload);
      }
      if (route === '/api/sync') {
        if (!authenticated) fail(401, 'سجّل الدخول للوصول إلى مصادر البيانات.');
        if (req.method !== 'GET') return json(405, {error: 'الطريقة غير مسموحة.'});
        const status = await store.read('sync/status-v1.json');
        return json(200, {status: status?.data || null, fetchedAt: new Date().toISOString()});
      }
      if (req.method !== 'GET' && req.method !== 'HEAD') return json(405, {error: 'الطريقة غير مسموحة.'});
      if (!['/', '/login', '/setup'].includes(route) && !/^\/cases\/[a-zA-Z0-9_-]{1,100}$/.test(route)) return json(404, {error: 'الصفحة غير موجودة.'});
      if (authenticated && ['/login', '/setup'].includes(route)) return redirect('/marsad/');
      if (!authenticated && !['/login', '/setup'].includes(route)) return redirect('/marsad/login/');
      const mode = authenticated ? 'app' : route === '/setup' ? 'setup' : 'login';
      const version = /^[a-f0-9]{7,64}$/.test(env.VERCEL_GIT_COMMIT_SHA || '') ? env.VERCEL_GIT_COMMIT_SHA.slice(0,12) : '1';
      res.statusCode = 200; res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(req.method === 'HEAD' ? '' : html(mode, version, ownerEmail));
    } catch (error) {
      if (!res.writableEnded) json(error instanceof HttpError ? error.status : 503, {error: error instanceof HttpError ? error.message : 'تعذّر الاتصال بالخدمة. أعد المحاولة قليلًا.'});
    }
  };
}
