/* Progressive enhancement: every prompt remains selectable without JavaScript. */
"use strict";
document.querySelectorAll("[data-copy-target], [data-copy-link]").forEach((button) => {
  button.hidden = false;
  button.addEventListener("click", async () => {
    const row = button.closest(".copy-row");
    const status = row.querySelector(".copy-status");
    const target = button.dataset.copyTarget;
    const text = target
      ? document.getElementById(target).textContent.trim()
      : new URL(window.location.pathname, window.location.origin).href;
    button.disabled = true;
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(text);
      status.textContent = target ? "Prompt copied." : "Link copied.";
      const fallback = row.querySelector("textarea");
      if (fallback) fallback.hidden = true;
    } catch {
      let fallback = row.querySelector("textarea");
      if (!fallback) {
        fallback = document.createElement("textarea");
        fallback.className = "copy-fallback";
        fallback.readOnly = true;
        fallback.rows = 3;
        fallback.setAttribute("aria-label", target ? "Prompt to copy manually" : "Link to copy manually");
        row.appendChild(fallback);
      }
      fallback.value = text;
      fallback.hidden = false;
      fallback.focus();
      fallback.select();
      status.textContent = "Automatic copy is unavailable. Copy the selected text below.";
    } finally {
      button.disabled = false;
    }
  });
});
