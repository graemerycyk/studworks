import test from 'node:test';
import assert from 'node:assert/strict';
import { api, projectCard, safeMediaLink } from '../assets/community-common.mjs';

test('anonymous submission omits cookies and sends JSON, never URL parameters', async t => {
  t.mock.method(globalThis, 'fetch', async (path, options) => {
    assert.equal(path, '/api/v1/submissions'); assert.equal(options.credentials, 'omit');
    assert.equal(options.method, 'POST'); assert.equal(options.referrerPolicy, 'no-referrer');
    assert.deepEqual(JSON.parse(options.body), { title: 'A crane' });
    return Response.json({ status: 'pending' }, { status: 201 });
  });
  assert.deepEqual(await api('/api/v1/submissions', { title: 'A crane' }), { status: 'pending' });
});

test('moderation uses same-origin cookies and explicit CSRF header', async t => {
  t.mock.method(globalThis, 'fetch', async (_path, options) => {
    assert.equal(options.credentials, 'same-origin'); assert.equal(options.headers['X-Studworks-CSRF'], 'test-csrf');
    return Response.json({ saved: true });
  });
  await api('/api/v1/admin/test', {}, { admin: true, csrf: 'test-csrf' });
});

test('unavailable and oversized responses never become successful UI data', async t => {
  const mocked = t.mock.method(globalThis, 'fetch', async () => new Response('<html>Unavailable</html>', { status: 503 }));
  await assert.rejects(api('/api/v1/gallery'), /unavailable/);
  mocked.mock.mockImplementation(async () => Response.json({ error: { message: 'Please wait.' } }, { status: 429 }));
  await assert.rejects(api('/api/v1/gallery'), /Please wait/);
  mocked.mock.mockImplementation(async () => new Response('x'.repeat(512 * 1024 + 1)));
  await assert.rejects(api('/api/v1/gallery'), /too large/);
});

test('untrusted gallery content is text, with no automatic media embed or fetch', t => {
  const made = [];
  const previous = globalThis.document;
  globalThis.document = { createElement(tag) {
    const element = { tag, children: [], append(...children) { this.children.push(...children); },
      set innerHTML(_value) { throw new Error('Untrusted HTML insertion'); } };
    made.push(element); return element;
  } };
  t.after(() => { if (previous === undefined) delete globalThis.document; else globalThis.document = previous; });
  projectCard({ title: '<img src=x onerror=alert(1)>', creator: '', description: '<script>x</script>', hardware: 'Motor', prompt: 'print(1)', mediaUrl: 'https://example.org/video' });
  assert.equal(made.find(e => e.tag === 'h3').textContent, '<img src=x onerror=alert(1)>');
  assert.equal(made.some(e => ['img', 'video', 'iframe', 'script'].includes(e.tag)), false);
  assert.equal(made.find(e => e.tag === 'a').rel, 'noopener noreferrer nofollow ugc');
  assert.equal(safeMediaLink('javascript:alert(1)'), null);
  assert.equal(safeMediaLink('https://user:password@example.org/'), null);
});
