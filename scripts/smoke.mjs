import { spawn } from "node:child_process";

const port = 4173;
const server = spawn("python3", ["-u", "-m", "http.server", String(port)], { cwd: new URL("../", import.meta.url), stdio: ["ignore", "pipe", "pipe"] });
const paths = [
  "/", "/en/", "/services/", "/services/cybersecurity/", "/services/ai-agents/",
  "/services/google-business-profile/", "/local-seo/", "/local-seo/riyadh/",
  "/about/", "/google-expert/", "/projects/", "/blog/",
  "/blog/secure-website-development/", "/blog/topics/local-seo-saudi/",
  "/contact/", "/privacy/", "/terms/", "/sitemap.xml",
  "/robots.txt", "/llms.txt", "/llms-full.txt", "/profile.json", "/feed.xml",
  "/assets/css/main.css", "/assets/css/seo-cro.css", "/assets/js/main.js",
  "/assets/brand/eslam-elshikh-logo-transparent.png",
  "/assets/og/eslam-elshikh-og-transparent.png"
];

const waitForServer = async () => {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/`, { method: "HEAD" });
      if (response.ok) return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error("Local server did not start");
};

try {
  await waitForServer();
  const rows = await Promise.all(paths.map(async path => {
    const response = await fetch(`http://127.0.0.1:${port}${path}`);
    return { path, status: response.status, contentType: response.headers.get("content-type") };
  }));
  rows.forEach(row => console.log(`${row.path} | ${row.status} | ${row.contentType}`));
  if (rows.some(row => row.status !== 200)) process.exitCode = 1;
} finally {
  server.kill("SIGTERM");
}
