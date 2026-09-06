import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

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
