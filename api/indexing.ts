import { timingSafeEqual } from "node:crypto";
import { google } from "googleapis";

const ALLOWED_HOSTNAME = "www.eslam-elshikh.com";
const INDEXING_SCOPE = "https://www.googleapis.com/auth/indexing";

function json(body: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...extraHeaders,
    },
  });
}

function isAuthorized(request: Request, secret: string) {
  const authorization = request.headers.get("authorization") || "";
  const provided = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  const providedBytes = Buffer.from(provided);
  const expectedBytes = Buffer.from(secret);

  return providedBytes.length === expectedBytes.length
    && timingSafeEqual(providedBytes, expectedBytes);
}

function normalizeEligibleUrl(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return null;

  try {
    const url = new URL(value.trim());
    if (
      url.protocol !== "https:"
      || url.hostname !== ALLOWED_HOSTNAME
      || url.port
      || url.username
      || url.password
      || url.search
      || url.hash
    ) return null;

    return url.href;
  } catch {
    return null;
  }
}

function typeIncludes(value: unknown, expected: string) {
  if (typeof value === "string") return value === expected;
  return Array.isArray(value) && value.includes(expected);
}

function containsType(value: unknown, expected: string): boolean {
  if (!value || typeof value !== "object") return false;
  if (Array.isArray(value)) return value.some((item) => containsType(item, expected));

  const record = value as Record<string, unknown>;
  if (typeIncludes(record["@type"], expected)) return true;
  return Object.values(record).some((item) => containsType(item, expected));
}

function isEligibleStructuredData(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  if (Array.isArray(value)) return value.some(isEligibleStructuredData);

  const record = value as Record<string, unknown>;
  if (typeIncludes(record["@type"], "JobPosting")) return true;
  if (typeIncludes(record["@type"], "VideoObject") && containsType(record, "BroadcastEvent")) return true;
  return Object.values(record).some(isEligibleStructuredData);
}

async function pageIsEligible(url: string) {
  const response = await fetch(url, {
    headers: { "User-Agent": "EslamElshikh-IndexingEligibilityCheck/1.0" },
    redirect: "follow",
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok || !response.headers.get("content-type")?.includes("text/html")) return false;
  const html = await response.text();

  for (const match of html.matchAll(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      if (isEligibleStructuredData(JSON.parse(match[1]))) return true;
    } catch {
      // Ignore malformed blocks; the page is not eligible through that block.
    }
  }

  return false;
}

export default {
  async fetch(request: Request) {
    if (request.method !== "POST") {
      return json({ success: false, error: "الطريقة غير مسموحة" }, 405, { Allow: "POST" });
    }

    const apiSecret = process.env.INDEXING_API_SECRET;
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!apiSecret || !clientEmail || !privateKey) {
      return json({ success: false, error: "إعدادات الخادم غير مكتملة" }, 503);
    }

    if (!isAuthorized(request, apiSecret)) {
      return json({ success: false, error: "غير مصرح" }, 401);
    }

    let body: { urlToCache?: unknown };
    try {
      body = await request.json();
    } catch {
      return json({ success: false, error: "صيغة JSON غير صحيحة" }, 400);
    }

    const urlToCache = normalizeEligibleUrl(body.urlToCache);
    if (!urlToCache) {
      return json({
        success: false,
        error: `يجب إرسال رابط HTTPS أساسي من النطاق ${ALLOWED_HOSTNAME} دون معاملات أو أجزاء`,
      }, 400);
    }

    if (!(await pageIsEligible(urlToCache))) {
      return json({
        success: false,
        error: "واجهة Google Indexing API مخصصة فقط لصفحات JobPosting أو BroadcastEvent داخل VideoObject",
      }, 422);
    }

    try {
      const jwtClient = new google.auth.JWT({
        email: clientEmail,
        key: privateKey,
        scopes: [INDEXING_SCOPE],
      });

      await jwtClient.authorize();

      const indexing = google.indexing({ version: "v3", auth: jwtClient });
      const response = await indexing.urlNotifications.publish({
        requestBody: {
          url: urlToCache,
          type: "URL_UPDATED",
        },
      });

      return json({
        success: true,
        message: "تم إرسال إشعار التحديث إلى Google بنجاح",
        data: response.data,
      });
    } catch (error) {
      console.error("Google Indexing API request failed", error);
      return json({ success: false, error: "تعذر إرسال الإشعار إلى Google" }, 502);
    }
  },
};
