(() => {
  "use strict";
  const root = document.querySelector("[data-proof-engine]");
  if (!root) return;
  const cards = [...root.querySelectorAll("[data-proof-card]")];
  const search = root.querySelector("[data-proof-search]");
  const status = root.querySelector("[data-proof-status]");
  const empty = root.querySelector("[data-proof-empty]");
  const filters = [...root.querySelectorAll("[data-proof-region]")];
  let region = "all";

  function apply() {
    const term = search.value.trim().toLocaleLowerCase("ar");
    let visible = 0;
    cards.forEach((card) => {
      const regionMatch = region === "all" || card.dataset.region === region;
      const textMatch = !term || card.dataset.search.includes(term);
      const show = regionMatch && textMatch;
      card.hidden = !show;
      if (show) visible += 1;
    });
    status.textContent = document.documentElement.lang.startsWith("en")
      ? `Showing ${visible} of ${cards.length} public examples`
      : `عرض ${visible} من أصل ${cards.length} نموذجًا عامًا`;
    empty.hidden = visible !== 0;
  }

  filters.forEach((button) => button.addEventListener("click", () => {
    region = button.dataset.proofRegion;
    filters.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
    apply();
    window.esAnalytics?.track("proof_map_interaction", { service: "google-business-profile", placement: "proof_map" });
  }));
  search.addEventListener("input", apply);
  apply();
})();
