"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const source = fs.readFileSync(path.join(__dirname, "../assets/site.js"), "utf8");

function fixture({ link = false, clipboard, copyText, textContent = "  Report the battery voltage\n" } = {}) {
  const status = { textContent: "" };
  let fallback;
  let onClick;
  const row = {
    querySelector: (selector) => selector === ".copy-status" ? status : fallback,
    appendChild: (element) => { fallback = element; },
  };
  const button = {
    hidden: true,
    disabled: false,
    dataset: link ? {} : { copyTarget: "prompt" },
    closest: () => row,
    addEventListener: (event, callback) => { assert.equal(event, "click"); onClick = callback; },
  };
  const navigator = { clipboard };
  const document = {
    querySelectorAll: () => [button],
    getElementById: (id) => { assert.equal(id, "prompt"); return { textContent, dataset: { copyText } }; },
    createElement: (tag) => {
      assert.equal(tag, "textarea");
      return { attributes: {}, setAttribute(key, value) { this.attributes[key] = value; },
        focus() { this.focused = true; }, select() { this.selected = true; } };
    },
  };
  vm.runInNewContext(source, { document, navigator, URL,
    window: { location: { origin: "https://www.studworks.build", pathname: "/projects/meet-your-hub/", search: "?private=discard" } } });
  return { button, status, navigator, click: () => onClick(), fallback: () => fallback };
}

test("copies the exact prompt and announces success", async () => {
  let copied;
  const f = fixture({ clipboard: { writeText: async (text) => { copied = text; } } });
  assert.equal(f.button.hidden, false);
  await f.click();
  assert.equal(copied, "Report the battery voltage");
  assert.equal(f.status.textContent, "Prompt copied.");
  assert.equal(f.button.disabled, false);
  assert.equal(f.fallback(), undefined);
});

test("copies the current page URL without query parameters", async () => {
  let copied;
  const f = fixture({ link: true, clipboard: { writeText: async (text) => { copied = text; } } });
  await f.click();
  assert.equal(copied, "https://www.studworks.build/projects/meet-your-hub/");
  assert.equal(f.status.textContent, "Link copied.");
});

test("copies the full selected example while its visible text is still typing", async () => {
  let copied;
  const f = fixture({ textContent: "Turn th", copyText: "Turn the hub light red.",
    clipboard: { writeText: async text => { copied = text; } } });
  await f.click();
  assert.equal(copied, "Turn the hub light red.");
});

test("permission denial offers selected, labelled manual copy and can recover", async () => {
  const f = fixture({ clipboard: { writeText: async () => { throw new Error("Denied"); } } });
  await f.click();
  const fallback = f.fallback();
  assert.equal(fallback.value, "Report the battery voltage");
  assert.equal(fallback.readOnly, true);
  assert.equal(fallback.focused, true);
  assert.equal(fallback.selected, true);
  assert.equal(fallback.attributes["aria-label"], "Prompt to copy manually");
  assert.equal(f.button.disabled, false);
  await f.click();
  assert.equal(f.fallback(), fallback, "Fallback must be reused, not duplicated");
  f.navigator.clipboard.writeText = async () => {};
  await f.click();
  assert.equal(fallback.hidden, true);
  assert.equal(f.status.textContent, "Prompt copied.");
});

test("missing Clipboard API offers manual link copy", async () => {
  const f = fixture({ link: true });
  await f.click();
  assert.equal(f.fallback().value, "https://www.studworks.build/projects/meet-your-hub/");
  assert.equal(f.fallback().attributes["aria-label"], "Link to copy manually");
  assert.equal(f.button.disabled, false);
});

test("keeps the copy control disabled until the clipboard request settles", async () => {
  let finish;
  const f = fixture({ clipboard: { writeText: () => new Promise((resolve) => { finish = resolve; }) } });
  const pending = f.click();
  assert.equal(f.button.disabled, true);
  finish();
  await pending;
  assert.equal(f.button.disabled, false);
});
