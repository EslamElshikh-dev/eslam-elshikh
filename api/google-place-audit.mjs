import { createSign } from "node:crypto";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 12;
const requestBuckets = new Map();
const PLACES_SCOPE = "https://www.googleapis.com/auth/maps-platform.places.textsearch";
let cachedGoogleToken = null;

const allowedMapHosts = new Set([
  "maps.app.goo.gl",
  "goo.gl",
  "google.com",
  "www.google.com",
  "maps.google.com"
]);

function json(response, status, body) {
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("X-Content-Type-Options", "nosniff");
  return response.status(status).json(body);
}

function clientAddress(request) {
  return String(request.headers["x-forwarded-for"] || request.socket?.remoteAddress || "unknown")
    .split(",")[0]
    .trim()
    .slice(0, 80);
}

function rateLimited(request) {
  const now = Date.now();
  const key = clientAddress(request);
  const current = requestBuckets.get(key);
  if (!current || current.expiresAt <= now) {
    requestBuckets.set(key, { count: 1, expiresAt: now + WINDOW_MS });
    return false;
  }
  current.count += 1;
  if (requestBuckets.size > 500) {
    for (const [bucketKey, bucket] of requestBuckets) {
      if (bucket.expiresAt <= now) requestBuckets.delete(bucketKey);
    }
  }
  return current.count > MAX_REQUESTS;
}

function isAllowedMapUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && allowedMapHosts.has(url.hostname.toLowerCase());
  } catch {
    return false;
  }
}

function queryFromMapUrl(value) {
  try {
    const url = new URL(value);
    const query = url.searchParams.get("query") || url.searchParams.get("q");
    if (query) return query.trim();
    const placeSegment = url.pathname.match(/\/maps\/place\/([^/]+)/i)?.[1];
    return placeSegment ? decodeURIComponent(placeSegment.replaceAll("+", " ")).trim() : "";
  } catch {
    return "";
  }
}

function base64url(value) {
  return Buffer.from(value).toString("base64url");
}

function unwrapEnvironmentValue(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (raw.startsWith('"') && raw.endsWith('"')) {
    try { return JSON.parse(raw); } catch {}
  }
  if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
    return raw.slice(1, -1);
  }
  return raw;
}

export function normalizeGooglePrivateKey(value) {
  let privateKey = unwrapEnvironmentValue(value).replaceAll("\\n", "\n").trim();
  if (privateKey && !privateKey.includes("BEGIN PRIVATE KEY")) {
    try {
      const decoded = Buffer.from(privateKey, "base64").toString("utf8").trim();
      if (decoded.includes("BEGIN PRIVATE KEY")) privateKey = decoded;
    } catch {}
  }
  return privateKey;
}

function serviceAccountCredentials() {
  const clientEmail = unwrapEnvironmentValue(process.env.GOOGLE_CLIENT_EMAIL);
  const privateKey = normalizeGooglePrivateKey(process.env.GOOGLE_PRIVATE_KEY);
  return clientEmail && privateKey ? { clientEmail, privateKey } : null;
}

async function googleServiceAccountToken(credentials, signal) {
  const now = Math.floor(Date.now() / 1000);
  if (cachedGoogleToken?.expiresAt > now + 60) return cachedGoogleToken.value;

  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: credentials.clientEmail,
    scope: PLACES_SCOPE,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600
  };
  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claim))}`;
  let signature;
  try {
    const signer = createSign("RSA-SHA256");
    signer.update(unsigned);
    signer.end();
    signature = signer.sign(credentials.privateKey).toString("base64url");
  } catch {
    throw new Error("google_private_key_invalid");
  }
  const assertion = `${unsigned}.${signature}`;
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    signal,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion
    })
  });
  const tokenPayload = await tokenResponse.json();
  if (!tokenResponse.ok) {
    const reason = ["invalid_grant", "invalid_scope", "unauthorized_client"].includes(tokenPayload?.error)
      ? tokenPayload.error
      : `http_${tokenResponse.status}`;
    throw new Error(`google_token_${reason}`);
  }
  if (!tokenPayload.access_token) throw new Error("google_token_missing");
  cachedGoogleToken = {
    value: tokenPayload.access_token,
    expiresAt: now + Math.min(Number(tokenPayload.expires_in) || 3600, 3600)
  };
  return cachedGoogleToken.value;
}

async function placesAuthorization(signal) {
  const apiKey = String(process.env.GOOGLE_PLACES_API_KEY || "").trim();
  if (apiKey) return { headers: { "X-Goog-Api-Key": apiKey }, mode: "api_key" };
  const credentials = serviceAccountCredentials();
  if (!credentials) return null;
  const accessToken = await googleServiceAccountToken(credentials, signal);
  return { headers: { Authorization: `Bearer ${accessToken}` }, mode: "service_account_oauth" };
}

async function resolveMapQuery(value, signal) {
  let current = value;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    if (!isAllowedMapUrl(current)) return "";
    const directQuery = queryFromMapUrl(current);
    if (directQuery) return directQuery;
    const response = await fetch(current, {
      method: "GET",
      redirect: "manual",
      signal,
      headers: { "User-Agent": "Eslam-Elshikh-GBP-Audit/1.0" }
    });
    const location = response.headers.get("location");
    if (!location) return "";
    current = new URL(location, current).href;
  }
  return queryFromMapUrl(current);
}

function publicPlace(place = {}) {
  return {
    id: place.id || "",
    name: place.displayName?.text || "",
    address: place.formattedAddress || "",
    category: place.primaryTypeDisplayName?.text || "",
    phone: place.nationalPhoneNumber || "",
    website: place.websiteUri || "",
    hoursAvailable: Boolean(place.regularOpeningHours?.periods?.length),
    openNow: typeof place.regularOpeningHours?.openNow === "boolean" ? place.regularOpeningHours.openNow : null,
    rating: Number.isFinite(place.rating) ? place.rating : null,
    reviewCount: Number.isFinite(place.userRatingCount) ? place.userRatingCount : 0,
    photoCount: Array.isArray(place.photos) ? place.photos.length : 0,
    googleMapsUrl: place.googleMapsUri || ""
  };
}

export const config = { maxDuration: 15 };

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return json(response, 405, { error: "method_not_allowed" });
  }
  if (rateLimited(request)) return json(response, 429, { error: "rate_limited" });

  const contentType = String(request.headers["content-type"] || "");
  const contentLength = Number(request.headers["content-length"] || 0);
  if (!contentType.includes("application/json") || contentLength > 8_000) {
    return json(response, 415, { error: "invalid_request" });
  }

  const rawQuery = typeof request.body?.query === "string" ? request.body.query.trim() : "";
  if (rawQuery.length < 3 || rawQuery.length > 220) {
    return json(response, 422, { error: "invalid_query" });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 11_000);
  try {
    const authorization = await placesAuthorization(controller.signal);
    if (!authorization) {
      return json(response, 503, { error: "configuration_required", manualAvailable: true });
    }

    let query = rawQuery;
    if (/^https:\/\//i.test(rawQuery)) {
      if (!isAllowedMapUrl(rawQuery)) return json(response, 422, { error: "unsupported_url" });
      query = await resolveMapQuery(rawQuery, controller.signal);
      if (!query) return json(response, 422, { error: "map_link_needs_business_name", manualAvailable: true });
    }

    const googleResponse = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...authorization.headers,
        "X-Goog-FieldMask": [
          "places.id",
          "places.displayName",
          "places.formattedAddress",
          "places.primaryTypeDisplayName",
          "places.nationalPhoneNumber",
          "places.websiteUri",
          "places.regularOpeningHours",
          "places.rating",
          "places.userRatingCount",
          "places.photos",
          "places.googleMapsUri"
        ].join(",")
      },
      body: JSON.stringify({ textQuery: query, languageCode: "ar", regionCode: "SA", maxResultCount: 3 })
    });

    if (!googleResponse.ok) {
      return json(response, googleResponse.status === 429 ? 429 : 502, {
        error: googleResponse.status === 429 ? "provider_rate_limited" : "provider_error",
        manualAvailable: true
      });
    }
    const payload = await googleResponse.json();
    const places = Array.isArray(payload.places) ? payload.places.map(publicPlace) : [];
    if (!places.length) return json(response, 404, { error: "place_not_found", manualAvailable: true });
    return json(response, 200, {
      places,
      source: "google_places_public_data",
      authentication: authorization.mode
    });
  } catch (error) {
    const diagnostic = String(error?.message || "").startsWith("google_") ? "google_oauth" : undefined;
    return json(response, error?.name === "AbortError" ? 504 : 500, {
      error: "audit_unavailable",
      manualAvailable: true,
      ...(diagnostic ? { stage: diagnostic } : {})
    });
  } finally {
    clearTimeout(timeout);
  }
}
