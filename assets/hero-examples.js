/* Display-only examples. No requests, project submission or hardware access. */
"use strict";
(() => {
  const carousel = document.querySelector("[data-example-carousel]");
  if (!carousel) return;
  const prompt = document.getElementById("hero-prompt");
  const readable = document.getElementById("hero-example-readable");
  const toggle = document.getElementById("hero-examples-toggle");
  const copy = document.querySelector('[data-copy-target="hero-prompt"]');
  let examples;
  try { examples = JSON.parse(carousel.dataset.examples); } catch { return; }
  if (!prompt || !readable || !toggle || !Array.isArray(examples) || examples.length < 2
    || !examples.every(text => typeof text === "string" && text.length > 0 && text.length <= 160)) return;

  // Every phrase shares a grid cell. Invisible full phrases reserve the largest
  // wrapped height, including narrow screens and enlarged text, without a guess.
  for (const text of examples) {
    const size = document.createElement("span");
    size.className = "hero-prompt-size";
    size.setAttribute("aria-hidden", "true");
    size.textContent = text;
    carousel.appendChild(size);
  }
  const motion = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  const reduced = () => !motion || motion.matches;
  let index = 0, cursor = 0, phase = "typing", timer = null, paused = false, active = true;
  const characters = () => Array.from(examples[index]);
  const canAnimate = () => active && !document.hidden && !paused && !reduced();
  const clear = () => { if (timer !== null) window.clearTimeout(timer); timer = null; };
  function selectExample() {
    // Screen readers and Copy get a whole instruction, never a stream of letters.
    prompt.dataset.copyText = examples[index];
    readable.textContent = "Example instruction: " + examples[index];
  }
  function finishPhrase() {
    cursor = characters().length; phase = "hold";
    prompt.textContent = examples[index];
  }
  function schedule(delay) {
    clear();
    if (canAnimate()) timer = window.setTimeout(step, delay);
  }
  function step() {
    timer = null;
    if (!canAnimate()) return;
    const text = characters();
    if (phase === "hold") { phase = "deleting"; schedule(30); return; }
    if (phase === "deleting") {
      cursor -= 1; prompt.textContent = text.slice(0, cursor).join("");
      if (cursor === 0) {
        index = (index + 1) % examples.length; phase = "typing"; selectExample(); schedule(300);
      } else schedule(25);
      return;
    }
    cursor += 1; prompt.textContent = text.slice(0, cursor).join("");
    if (cursor === text.length) { phase = "hold"; schedule(2400); }
    else schedule(55);
  }
  function refresh() {
    clear();
    if (reduced() || paused) finishPhrase();
    toggle.textContent = reduced() ? "Next example" : paused ? "Resume examples" : "Pause examples";
    carousel.classList.toggle("examples-playing", canAnimate());
    schedule(phase === "hold" ? 2400 : 300);
  }
  toggle.hidden = false;
  toggle.addEventListener("click", () => {
    if (reduced()) { index = (index + 1) % examples.length; selectExample(); }
    else paused = !paused;
    refresh();
  });
  copy?.addEventListener("click", () => { paused = true; refresh(); });
  motion?.addEventListener("change", refresh);
  document.addEventListener("visibilitychange", refresh);
  window.addEventListener("pagehide", () => { active = false; refresh(); });
  window.addEventListener("pageshow", () => { active = true; refresh(); });
  selectExample();
  if (!reduced()) prompt.textContent = "";
  refresh();
})();
