import { createServer } from "node:http";
import { runSeoControlCenter, buildMarkdown } from "./seo-control-center.mjs";

const port = Number(process.env.PORT || 8080);
const expectedToken = process.env.SEO_MONITOR_TOKEN || "";

function authorized(request) {
  if (!expectedToken) return true;
  const bearer = request.headers.authorization?.replace(/^Bearer\s+/i, "") || "";
  const headerToken = request.headers["x-seo-monitor-token"] || "";
  return bearer === expectedToken || headerToken === expectedToken;
}

function send(response, status, body, contentType = "application/json; charset=utf-8") {
  response.writeHead(status, {
    "content-type": contentType,
    "cache-control": "no-store",
    "x-content-type-options": "nosniff"
  });
  response.end(body);
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
  if (url.pathname === "/healthz") {
    return send(response, 200, JSON.stringify({ ok: true, service: "seo-control-center" }));
  }
  if (url.pathname !== "/run" || !["GET", "POST"].includes(request.method || "")) {
    return send(response, 404, JSON.stringify({ error: "not_found" }));
  }
  if (!authorized(request)) return send(response, 401, JSON.stringify({ error: "unauthorized" }));

  try {
    const submitSitemap = url.searchParams.get("submitSitemap") === "1";
    const report = await runSeoControlCenter({ submitSitemap });
    if (url.searchParams.get("format") === "markdown") {
      return send(response, 200, buildMarkdown(report), "text/markdown; charset=utf-8");
    }
    return send(response, 200, JSON.stringify(report));
  } catch (error) {
    console.error(error);
    return send(response, 500, JSON.stringify({ error: "monitor_failed", message: error.message }));
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`SEO Control Center listening on :${port}`);
});
