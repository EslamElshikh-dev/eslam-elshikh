function json(response, status, body) {
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("X-Content-Type-Options", "nosniff");
  return response.status(status).json(body);
}

export const config = { maxDuration: 5 };

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return json(response, 405, { error: "method_not_allowed" });
  }

  return json(response, 410, {
    error: "direct_lookup_disabled",
    manualAvailable: true,
    auditUrl: "/google-business-profile-audit/"
  });
}
