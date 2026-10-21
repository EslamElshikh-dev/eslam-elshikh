import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

// Inspect every failed response; never accept a blocked status globally.
export function classifyLinks(report, policy, exitCode) {
  if (![0, 2].includes(Number(exitCode)) || exitCode === '') throw new Error(`Unexpected lychee exit code: ${exitCode}`);
  for (const key of ['total', 'unique', 'successful', 'errors', 'timeouts', 'unknown', 'unsupported']) {
    if (!Number.isSafeInteger(report?.[key]) || report[key] < 0) throw new Error(`Invalid lychee counter: ${key}`);
  }
  if (!report.total || !report.unique || !report.successful) throw new Error('Empty or incomplete link check');
  if (!report.error_map || typeof report.error_map !== 'object' || Array.isArray(report.error_map)) throw new Error('Missing error_map');
  if (!Array.isArray(policy?.blocked403)) throw new Error('Missing reviewed 403 policy');
  if (!Array.isArray(policy.blocked429 ?? [])) throw new Error('Invalid reviewed 429 policy');
  const allowed = new Set(policy.blocked403);
  const rateLimited = new Set(policy.blocked429 ?? []);
  const grouped = new Map();
  let count = 0;
  for (const [source, entries] of Object.entries(report.error_map)) {
    if (!Array.isArray(entries)) throw new Error(`Invalid error entries for ${source}`);
    for (const entry of entries) {
      if (typeof entry?.url !== 'string' || typeof entry.status?.text !== 'string') throw new Error('Malformed failed response');
      count++;
      const code = entry.status.code;
      const blocked = (code === 403 && allowed.has(entry.url)) || (code === 429 && rateLimited.has(entry.url));
      // Cached and fresh responses to the same URL are one issue, with all
      // references retained in the occurrence count.
      const key = JSON.stringify([entry.url, code]);
      if (!grouped.has(key)) grouped.set(key, { url: entry.url, code, text: entry.status.text, blocked, sources: new Set(), occurrences: 0 });
      const item = grouped.get(key);
      item.sources.add(source);
      item.occurrences++;
    }
  }
  if (count !== report.errors) throw new Error(`Error report is incomplete: ${count} records for ${report.errors} errors`);
  const issues = [...grouped.values()].sort((a, b) => a.url.localeCompare(b.url));
  const blocked = issues.filter(item => item.blocked);
  const failures = issues.filter(item => !item.blocked);
  const unclassified = report.timeouts + report.unknown + report.unsupported;
  if (Number(exitCode) === 2 && !count && !unclassified) throw new Error('Lychee failed without reported failures');
  return { blocked, failures, unclassified, failed: failures.length > 0 || unclassified > 0 };
}

const cell = value => String(value).replaceAll('|', '\\|').replace(/[\r\n]/g, ' ');
export function formatReport(report, result) {
  const lines = [
    '## Link quality results', '',
    `Scanned ${report.total} references (${report.unique} unique); ${report.successful} successful references.`,
    `Blocking failures: ${result.failures.length}; blocked automated checks: ${result.blocked.length}; timeouts/unknown/unsupported: ${result.unclassified}.`, '',
    'A reviewed automated block is **unverified**, not a successful link. Only the exact reviewed URL and status pair is non-blocking; 404, other 403/429 responses and server/network errors still fail.', ''
  ];
  for (const [title, items] of [['Blocking failures', result.failures], ['Blocked automated verification — manual review remains necessary', result.blocked]]) {
    if (!items.length) continue;
    lines.push(`### ${title}`, '', '| URL | Response | References | Example source |', '| --- | --- | --- | --- |');
    for (const item of items) lines.push(`| ${cell(item.url)} | ${cell(item.code ?? '')} ${cell(item.text)} | ${item.occurrences} | ${cell([...item.sources][0])} |`);
    lines.push('');
  }
  return lines.join('\n') + '\n';
}

async function main() {
  const arg = (name, fallback) => process.argv.find(value => value.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback;
  const report = JSON.parse(await readFile(arg('input', 'lychee/results.json'), 'utf8'));
  const policy = JSON.parse(await readFile(new URL('../ops/link-check-policy.json', import.meta.url), 'utf8'));
  const result = classifyLinks(report, policy, process.env.LYCHEE_EXIT_CODE ?? '');
  const markdown = formatReport(report, result);
  const output = arg('output', 'lychee/classified.md');
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, markdown);
  if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, markdown);
  console.log(`Link check: ${report.unique} unique URLs; ${result.failures.length} blocking failures; ${result.blocked.length} blocked automated checks.`);
  if (result.blocked.length) console.log(`::warning::${result.blocked.length} reviewed URLs blocked automated verification (HTTP 403/429). See the summary and raw report; they are not marked healthy.`);
  for (const item of result.failures) console.error(`${item.text}: ${item.url}`);
  if (result.failed) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(error => { console.error(`Link validation failed: ${error.message}`); process.exitCode = 1; });
}
