const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 12;
const requestBuckets = new Map();

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

export const config = { maxDuration: 10 };

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

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return json(response, 503, { error: "configuration_required", manualAvailable: true });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7_500);
  try {
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
        "X-Goog-Api-Key": apiKey,
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
    return json(response, 200, { places, source: "google_places_public_data" });
  } catch (error) {
    return json(response, error?.name === "AbortError" ? 504 : 500, { error: "audit_unavailable", manualAvailable: true });
  } finally {
    clearTimeout(timeout);
  }
}
