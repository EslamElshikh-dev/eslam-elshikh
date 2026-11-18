(() => {
  const gallery = document.querySelector(".credential-gallery");
  if (!gallery) return;

  const controls = gallery.querySelector("[data-controls]");
  const slides = [...gallery.querySelectorAll("[data-slide]")];
  const position = gallery.querySelector("[data-position]");
  const subject = gallery.querySelector("[data-subject-label]");
  const zoom = gallery.querySelector("[data-current-zoom]");
  let current = 0;
  if (slides.length > 1) {
    controls.hidden = false;
    controls.addEventListener("click", event => {
      const button = event.target.closest("button[data-step]");
      if (!button) return;
      slides[current].hidden = true;
      current = (current + Number(button.dataset.step) + slides.length) % slides.length;
      slides[current].hidden = false;
      const link = slides[current].querySelector("[data-enlarge]");
      zoom.href = link.href;
      zoom.dataset.enlarge = link.dataset.enlarge;
      position.textContent = String(current + 1);
      subject.textContent = slides[current].dataset.subject;
    });
  }

  const dialog = gallery.querySelector(".folio-dialog");
  if (typeof dialog.showModal !== "function") return;
  const paper = dialog.querySelector(".folio-dialog-paper");
  const title = dialog.querySelector("h2");
  const verify = dialog.querySelector(".folio-dialog-verify");
  const close = dialog.querySelector("[data-close]");
  const records = new Map([...gallery.querySelectorAll("[data-record]")].map(record => [record.dataset.record, record]));
  let opener;

  gallery.addEventListener("click", event => {
    const trigger = event.target.closest("a[data-enlarge]");
    if (!trigger || event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const record = records.get(trigger.dataset.enlarge);
    if (!record) return;
    event.preventDefault();
    opener = trigger;
    title.textContent = record.querySelector("h3").textContent;
    const image = record.querySelector(".folio-thumb img").cloneNode();
    image.loading = "eager";
    image.alt = title.textContent;
    paper.replaceChildren(image);
    verify.href = record.querySelector("[data-verify]").href;
    verify.dataset.identityItem = record.dataset.record;
    dialog.showModal();
    close.focus();
  });
  close.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
  dialog.addEventListener("close", () => {
    paper.replaceChildren();
    opener?.focus({ preventScroll: true });
  });
})();
