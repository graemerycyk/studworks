"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const source = fs.readFileSync(path.join(__dirname, "../assets/hero-examples.js"), "utf8");
const html = fs.readFileSync(path.join(__dirname, "../index.html"), "utf8");
const css = fs.readFileSync(path.join(__dirname, "../assets/site.css"), "utf8");
const examples = JSON.parse(html.match(/data-examples='([^']+)'/)[1]);

function fixture({ reduced = false, hidden = false, available = true, mediaAvailable = true } = {}) {
  const handlers = new Map(), timers = new Map();
  let serial = 0;
  const listener = owner => (name, callback) => handlers.set(owner + ":" + name, callback);
  const prompt = { textContent: examples[0], dataset: {} };
  const readable = { textContent: "Example instruction: " + examples[0] };
  const children = [];
  const carousel = { dataset: { examples: JSON.stringify(examples) }, appendChild: element => children.push(element),
    classList: { toggle(name, value) { carousel.playing = value; } } };
  const motion = { matches: reduced, addEventListener: listener("motion") };
  const document = { hidden, addEventListener: listener("document"),
    querySelector: selector => selector === "[data-example-carousel]" && available ? carousel : null,
    getElementById: id => ({ "hero-prompt": prompt, "hero-example-readable": readable })[id],
    createElement: () => ({ setAttribute(key, value) { this[key] = value; } }) };
  const window = { matchMedia: mediaAvailable ? () => motion : undefined, addEventListener: listener("window"),
    setTimeout(callback, delay) { const id = ++serial; timers.set(id, { callback, delay }); return id; },
    clearTimeout(id) { timers.delete(id); } };
  vm.runInNewContext(source, { document, window });
  const emit = (owner, event) => handlers.get(owner + ":" + event)?.();
  function tick() {
    assert.equal(timers.size, 1, "Exactly one animation timer is live");
    const [id, { callback, delay }] = timers.entries().next().value;
    timers.delete(id); callback(); return delay;
  }
  return { prompt, readable, carousel, children, timers, motion, document, emit, tick };
}

test("types, holds, deletes and cycles through every complete example", () => {
  const f = fixture();
  assert.equal(f.prompt.textContent, "");
  assert.equal(f.readable.textContent, "Example instruction: " + examples[0]);
  assert.doesNotMatch(html, /hero-examples-toggle|Pause examples|Resume examples|Next example|Copy prompt|data-copy-target="hero-prompt"/);
  assert.doesNotMatch(css, /example-toggle/);
  const seen = new Set();
  let holds = 0;
  for (let i = 0; i < 500; i += 1) {
    if (examples.includes(f.prompt.textContent)) seen.add(f.prompt.textContent);
    const delay = f.tick();
    if (delay === 2400) holds += 1;
    assert.ok(examples.some(example => f.readable.textContent === "Example instruction: " + example));
  }
  assert.equal(seen.size, examples.length);
  assert.ok(holds >= examples.length);
});
test("reduced motion displays a complete static example without extra controls", () => {
  const f = fixture({ reduced: true });
  assert.equal(f.timers.size, 0); assert.equal(f.prompt.textContent, examples[0]);
  assert.equal(f.readable.textContent, "Example instruction: " + examples[0]);
  f.motion.matches = false; f.emit("motion", "change"); assert.equal(f.timers.size, 1);
  f.motion.matches = true; f.emit("motion", "change"); assert.equal(f.timers.size, 0);
  assert.equal(f.readable.textContent, "Example instruction: " + f.prompt.textContent);
});
test("browsers without a motion-preference API retain a complete static example", () => {
  const f = fixture({ mediaAvailable: false });
  assert.equal(f.timers.size, 0);
  assert.equal(f.prompt.textContent, examples[0]);
  assert.equal(f.readable.textContent, "Example instruction: " + examples[0]);
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
test("an initially hidden page starts only after becoming visible", () => {
  const f = fixture({ hidden: true });
  assert.equal(f.timers.size, 0); assert.equal(f.carousel.playing, false);
  f.document.hidden = false; f.emit("document", "visibilitychange");
  assert.equal(f.timers.size, 1); assert.equal(f.carousel.playing, true);
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
