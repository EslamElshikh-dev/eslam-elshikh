import assert from "node:assert/strict";
import handler from "../api/google-place-audit.mjs";

function responseMock() {
  return {
    headers: {},
    statusCode: 200,
    payload: null,
    setHeader(name, value) { this.headers[name.toLowerCase()] = value; },
    status(code) { this.statusCode = code; return this; },
    json(value) { this.payload = value; return this; }
  };
}

async function invoke({ method = "POST", body = {}, headers = {} } = {}) {
  const response = responseMock();
  await handler({ method, body, headers: { "content-type": "application/json", ...headers }, socket: { remoteAddress: `test-${Math.random()}` } }, response);
  return response;
}

const previousKey = process.env.GOOGLE_PLACES_API_KEY;
delete process.env.GOOGLE_PLACES_API_KEY;

const method = await invoke({ method: "GET" });
assert.equal(method.statusCode, 405);
assert.equal(method.payload.error, "method_not_allowed");

const invalid = await invoke({ body: { query: "x" } });
assert.equal(invalid.statusCode, 422);
assert.equal(invalid.payload.error, "invalid_query");

const fallback = await invoke({ body: { query: "نشاط تجريبي الرياض" } });
assert.equal(fallback.statusCode, 503);
assert.equal(fallback.payload.error, "configuration_required");
assert.equal(fallback.payload.manualAvailable, true);
assert.equal(fallback.headers["cache-control"], "no-store");

if (previousKey) process.env.GOOGLE_PLACES_API_KEY = previousKey;
console.log("Google growth API fallback and request guards passed.");
