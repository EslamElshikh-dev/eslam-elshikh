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

const method = await invoke({ method: "GET" });
assert.equal(method.statusCode, 405);
assert.equal(method.payload.error, "method_not_allowed");

const disabled = await invoke({ body: { query: "نشاط تجريبي الرياض" } });
assert.equal(disabled.statusCode, 410);
assert.equal(disabled.payload.error, "direct_lookup_disabled");
assert.equal(disabled.payload.manualAvailable, true);
assert.equal(disabled.payload.auditUrl, "/google-business-profile-audit/");
assert.equal(disabled.headers["cache-control"], "no-store");

console.log("Google growth guided-only mode and retired endpoint guard passed.");
