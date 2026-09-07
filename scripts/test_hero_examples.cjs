"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const source = fs.readFileSync(path.join(__dirname, "../assets/hero-examples.js"), "utf8");
const html = fs.readFileSync(path.join(__dirname, "../index.html"), "utf8");
const examples = JSON.parse(html.match(/data-examples='([^']+)'/)[1]);

function fixture({ reduced = false, hidden = false, available = true } = {}) {
  const handlers = new Map(), timers = new Map();
  let serial = 0;
  const listener = owner => (name, callback) => handlers.set(owner + ":" + name, callback);
  const prompt = { textContent: examples[0], dataset: {} };
  const readable = { textContent: "Example instruction: " + examples[0] };
  const toggle = { hidden: true, textContent: "Pause examples", addEventListener: listener("toggle") };
  const copy = { addEventListener: listener("copy") };
  const children = [];
  const carousel = { dataset: { examples: JSON.stringify(examples) }, appendChild: element => children.push(element),
    classList: { toggle(name, value) { carousel.playing = value; } } };
  const motion = { matches: reduced, addEventListener: listener("motion") };
  const document = { hidden, addEventListener: listener("document"),
    querySelector: selector => selector === "[data-example-carousel]" ? (available ? carousel : null) : copy,
    getElementById: id => ({ "hero-prompt": prompt, "hero-example-readable": readable, "hero-examples-toggle": toggle })[id],
    createElement: () => ({ setAttribute(key, value) { this[key] = value; } }) };
  const window = { matchMedia: () => motion, addEventListener: listener("window"),
    setTimeout(callback, delay) { const id = ++serial; timers.set(id, { callback, delay }); return id; },
    clearTimeout(id) { timers.delete(id); } };
  vm.runInNewContext(source, { document, window });
  const emit = (owner, event) => handlers.get(owner + ":" + event)?.();
  function tick() {
    assert.equal(timers.size, 1, "Exactly one animation timer is live");
    const [id, { callback, delay }] = timers.entries().next().value;
    timers.delete(id); callback(); return delay;
  }
  return { prompt, readable, toggle, carousel, children, timers, motion, document, emit, tick };
}

test("types, holds, deletes and cycles through every complete example", () => {
  const f = fixture();
  assert.equal(f.prompt.textContent, "");
  assert.equal(f.prompt.dataset.copyText, examples[0]);
  assert.equal(f.toggle.hidden, false);
  const seen = new Set();
  let holds = 0;
  for (let i = 0; i < 500; i += 1) {
    if (examples.includes(f.prompt.textContent)) seen.add(f.prompt.textContent);
    const delay = f.tick();
    if (delay === 2400) holds += 1;
    assert.ok(examples.includes(f.prompt.dataset.copyText));
    assert.equal(f.readable.textContent, "Example instruction: " + f.prompt.dataset.copyText);
  }
  assert.equal(seen.size, examples.length);
  assert.ok(holds >= examples.length);
});
test("pause and copy stop on a whole phrase until explicitly resumed", () => {
  const f = fixture(); f.tick(); f.tick();
  f.emit("toggle", "click");
  assert.equal(f.timers.size, 0);
  assert.equal(f.prompt.textContent, examples[0]);
  assert.equal(f.toggle.textContent, "Resume examples");
  f.emit("toggle", "click"); assert.equal(f.timers.size, 1);
  f.emit("copy", "click");
  assert.equal(f.prompt.textContent, f.prompt.dataset.copyText);
  assert.equal(f.timers.size, 0);
});
test("reduced motion has no animation and provides manual next-example control", () => {
  const f = fixture({ reduced: true });
  assert.equal(f.timers.size, 0); assert.equal(f.prompt.textContent, examples[0]);
  assert.equal(f.toggle.textContent, "Next example");
  f.emit("toggle", "click");
  assert.equal(f.prompt.textContent, examples[1]); assert.equal(f.timers.size, 0);
  f.motion.matches = false; f.emit("motion", "change"); assert.equal(f.timers.size, 1);
  f.motion.matches = true; f.emit("motion", "change"); assert.equal(f.timers.size, 0);
  assert.equal(f.prompt.textContent, f.prompt.dataset.copyText);
});
test("hidden pages suspend timers, including page-cache navigation", () => {
  const f = fixture(); f.tick();
  f.document.hidden = true; f.emit("document", "visibilitychange");
  assert.equal(f.timers.size, 0); assert.equal(f.carousel.playing, false);
  f.document.hidden = false; f.emit("document", "visibilitychange"); assert.equal(f.timers.size, 1);
  f.emit("window", "pagehide"); assert.equal(f.timers.size, 0);
  f.emit("window", "pageshow"); assert.equal(f.timers.size, 1);
  f.emit("window", "pageshow"); assert.equal(f.timers.size, 1);
});
test("all phrases reserve wrapped space and per-letter text is hidden from screen readers", () => {
  const f = fixture();
  assert.equal(f.children.length, examples.length);
  assert.deepEqual(f.children.map(child => child.textContent), examples);
  assert.ok(f.children.every(child => child["aria-hidden"] === "true"));
  assert.match(html, /id="hero-prompt" aria-hidden="true"/);
  assert.match(html, /id="hero-example-readable">Example instruction: Turn the motor 90 degrees slowly\./);
});
test("pages without the homepage carousel remain unchanged", () => {
  assert.equal(fixture({ available: false }).timers.size, 0);
});
