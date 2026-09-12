(() => {
  "use strict";
  const root = document.querySelector("[data-local-dashboard]");
  if (!root) return;
  const english = document.documentElement.lang.startsWith("en");
  const metrics = new Map();

  function parseCsv(input) {
    const rows = [];
    let row = [], cell = "", quoted = false;
    for (let index = 0; index < input.length; index += 1) {
      const char = input[index];
      if (char === '"' && input[index + 1] === '"' && quoted) { cell += '"'; index += 1; }
      else if (char === '"') quoted = !quoted;
      else if (char === "," && !quoted) { row.push(cell.trim()); cell = ""; }
      else if ((char === "\n" || char === "\r") && !quoted) {
        if (char === "\r" && input[index + 1] === "\n") index += 1;
        row.push(cell.trim()); cell = "";
        if (row.some(Boolean)) rows.push(row);
        row = [];
      } else cell += char;
    }
    if (cell || row.length) { row.push(cell.trim()); if (row.some(Boolean)) rows.push(row); }
    return rows;
  }

  const number = (value) => Number(String(value || "0").replaceAll(/[^\d.-]/g, "")) || 0;
  const slug = (value) => String(value || "").toLowerCase().replaceAll(/[\s_()-]/g, "");
  const definitions = {
    gbp: [
      ["views", ["views", "impressions", "profileviews", "مشاهدات", "مراتالظهور"]],
      ["interactions", ["interactions", "actions", "calls", "websiteclicks", "directionrequests", "تفاعلات", "مكالمات"]]
    ],
    search: [
      ["clicks", ["clicks", "نقرات"]],
      ["impressions", ["impressions", "مراتالظهور"]],
      ["position", ["position", "averageposition", "الموضع"]]
    ],
    ga4: [
      ["sessions", ["sessions", "جلسات"]],
      ["users", ["users", "activeusers", "مستخدمون"]],
      ["conversions", ["conversions", "keyevents", "تحويلات", "أحداثرئيسية"]]
    ],
    leads: [
      ["leads", ["leads", "calls", "whatsapp", "bookings", "عملاءمحتملون", "مكالمات", "حجوزات"]]
    ]
  };

  function summarize(source, rows) {
    if (rows.length < 2) return {};
    const headers = rows[0].map(slug);
    const output = {};
    for (const [metric, aliases] of definitions[source]) {
      const indexes = headers.map((header, index) => aliases.map(slug).includes(header) ? index : -1).filter((index) => index >= 0);
      if (!indexes.length) continue;
      const values = rows.slice(1).flatMap((row) => indexes.map((index) => number(row[index])));
      output[metric] = metric === "position" ? values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1) : values.reduce((sum, value) => sum + value, 0);
    }
    return output;
  }

  function render() {
    root.querySelectorAll("[data-metric]").forEach((element) => {
      const value = metrics.get(element.dataset.metric);
      element.textContent = value == null ? "—" : Number.isInteger(value) ? value.toLocaleString(english ? "en" : "ar-SA") : value.toFixed(1);
    });
    const summary = Object.fromEntries(metrics);
    const hasData = metrics.size > 0;
    root.querySelector("[data-dashboard-empty]").hidden = hasData;
    root.querySelector("[data-dashboard-ready]").hidden = !hasData;
    const exportButton = root.querySelector("[data-dashboard-export]");
    exportButton.disabled = !hasData;
    exportButton.onclick = () => {
      const blob = new Blob([JSON.stringify({ generatedAt: new Date().toISOString(), metrics: summary }, null, 2)], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "local-visibility-summary.json";
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    };
  }

  root.querySelectorAll("[data-dashboard-file]").forEach((input) => input.addEventListener("change", async () => {
    const file = input.files?.[0];
    if (!file || file.size > 5_000_000) return;
    const source = input.dataset.dashboardFile;
    const values = summarize(source, parseCsv(await file.text()));
    for (const [key, value] of Object.entries(values)) metrics.set(`${source}.${key}`, value);
    const label = root.querySelector(`[data-file-status="${source}"]`);
    label.textContent = Object.keys(values).length
      ? (english ? `${Object.keys(values).length} metrics loaded locally` : `تم تحميل ${Object.keys(values).length} مؤشرات محليًا`)
      : (english ? "No recognized metric columns" : "لم يتم التعرف على أعمدة مؤشرات");
    render();
  }));
  render();
})();
