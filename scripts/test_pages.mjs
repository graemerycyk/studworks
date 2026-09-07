import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const publicSource = name => readFile(new URL('../' + name, import.meta.url), 'utf8');
const plainText = value => value.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ');

test('homepage and README align implemented builder workflows with the upcoming release', async () => {
  for (const name of ['README.md', 'index.html']) {
    const source = await publicSource(name), copy = plainText(source);
    for (const label of ['guided setup', 'New project using this machine', 'Share current version', 'Download full backup']) {
      assert.ok(copy.toLowerCase().includes(label.toLowerCase()), `${name}: ${label}`);
    }
    assert.match(copy, /next beta/);
    assert.match(copy, /September 2026, subject to Apple review/);
    assert.doesNotMatch(source, /finished safely|v0\.1\.0-beta\.1/);
  }
  assert.match(await publicSource('README.md'), /public download and hosted service are still awaiting release/);
  assert.match(await publicSource('index.html'), /program finished/);
});

test('hub and connected-app guides separate non-moving checks from motor approval', async () => {
  for (const name of ['journal/set-up-your-hub/index.html', 'journal/use-with-claude-chatgpt/index.html']) {
    const copy = plainText(await publicSource(name));
    assert.match(copy, /non-moving/);
    assert.match(copy, /separate.*approv(?:al|ing)/);
    assert.doesNotMatch(copy, /(?:check|self-test|test) (?:may|can) move a motor/);
  }
  const setup = plainText(await publicSource('journal/set-up-your-hub/index.html'));
  assert.match(setup, /15°/); assert.match(setup, /100°\/s/);
});

test('project-sharing journal preserves its original date and dates the implementation update', async () => {
  const article = await publicSource('journal/projects-should-travel/index.html');
  assert.match(article, /datetime="2026-09-05"/);
  assert.match(article, /Update — <time datetime="2026-09-07"/);
  assert.match(article, /href="\/projects\/submit\/"/);
  assert.match(article, /Direct publishing from the app remains future work/);
  assert.match(article, /public beta and hosted features still await release/);
  const feed = await publicSource('journal/feed.xml');
  const entry = [...feed.matchAll(/<entry>[\s\S]*?<\/entry>/g)]
    .map(match => match[0]).find(value => value.includes('<title>A project should travel. Permission should not.</title>'));
  assert.ok(entry);
  assert.match(entry, /<published>2026-09-05/);
  assert.match(entry, /<updated>2026-09-07/);
});

const routes = [
  ['moderation', 'admin/index.html', 'send-link'],
  ['receipt', 'projects/submission/index.html', 'check-receipt'],
  ['verify-admin', 'admin/verify/index.html', 'confirm-sign-in'],
  ['submission', 'projects/submit/index.html', 'submit-build'],
];
for (const [module, page, control] of routes) {
  test(`${module}: static Pages leaves backend controls disabled and sends no mutation`, async t => {
    const html = await readFile(new URL('../' + page, import.meta.url), 'utf8');
    assert.match(html, new RegExp(`<button[^>]*id="${control}"[^>]*disabled`));
    const elements = new Map();
    const element = id => {
      if (!elements.has(id)) elements.set(id, { disabled: id === control, hidden: false, value: '', textContent: '', checked: false, handlers: {}, classList: { toggle() {} }, addEventListener(event, handler) { this.handlers[event] = handler; } });
      return elements.get(id);
    };
    const globals = ['document', 'location', 'history'];
    const saved = new Map(globals.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
    Object.defineProperty(globalThis, 'document', { configurable: true, value: { getElementById: element } });
    Object.defineProperty(globalThis, 'location', { configurable: true, value: { hash: '#' + 'A'.repeat(43), pathname: '/' + page.replace('index.html', ''), origin: 'https://www.studworks.build' } });
    Object.defineProperty(globalThis, 'history', { configurable: true, value: { replaceState() {} } });
    t.after(() => { for (const key of globals) { const descriptor = saved.get(key); if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key]; } });
    const requests = [];
    t.mock.method(globalThis, 'fetch', async (path, options) => { requests.push({ path, method: options.method }); return new Response('<html>GitHub Pages 404</html>', { status: 404 }); });
    await import(new URL('../assets/' + module + '.mjs', import.meta.url));
    assert.equal(element(control).disabled, true);
    const source = await readFile(new URL('../assets/' + module + '.mjs', import.meta.url), 'utf8');
    for (const [, id] of source.matchAll(/\$\('([^']+)'\)/g)) assert.ok(html.includes(`id="${id}"`), `${module} references absent ${id}`);
    for (const form of ['sign-in-form', 'receipt-form', 'submission-form']) if (elements.has(form)) await element(form).handlers.submit?.({ preventDefault() {} });
    await element(control).handlers.click?.();
    assert.ok(requests.length > 0); assert.ok(requests.every(r => r.method === 'GET'));
    assert.equal(element(control).disabled, true);
  });
}
