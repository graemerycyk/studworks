import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';

const publicSource = name => readFile(new URL('../' + name, import.meta.url), 'utf8');
const plainText = value => value.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ');

test('website entry points lead to the web app and guided chat connection on the same deployment', async () => {
  const home = await publicSource('index.html');
  assert.match(home, /class="cta" href="\/app\/">Open Web App/);
  assert.match(home, /preferred browser with a connected hub bridge/);
  const hubGuide = await publicSource('journal/set-up-your-hub/index.html');
  for (const phrase of ['Use an existing hub bridge', 'Connect a hub', 'confirmation codes', 'Preview project for bridge', 'Use this reviewed version', 'physical stop button', 'MCP does not give their cloud server access']) assert.ok(hubGuide.includes(phrase));
  const guide = await publicSource('journal/use-with-claude-chatgpt/index.html');
  for (const html of [home, guide]) {
    for (const path of ['/app/', '/app/connect.html', '/journal/use-with-claude-chatgpt/']) {
      assert.ok(html.includes(`href="${path}"`));
      assert.equal(new URL(path, 'https://beta.example.ondigitalocean.app').origin, 'https://beta.example.ondigitalocean.app');
    }
    assert.doesNotMatch(html, /href="\/mcp"/); // A protocol setting is not a page.
  }
  assert.match(guide, /id="hosted-mcp-address" data-deployment-mcp/);
  assert.match(guide, /opening the hub page alone does not authorize a chat session/);
  assert.match(guide, /rel="canonical" href="https:\/\/studworks.build\/journal\/use-with-claude-chatgpt\/"/);
});

test('every website page has the same static footer and safe fixed navigation', async () => {
  const footer = (await publicSource('scripts/footer.html')).trim();
  const navigation = (await publicSource('scripts/navigation.html')).trim();
  const pages = ['index.html'];
  for (const section of ['projects', 'journal', 'admin', 'privacy', 'terms']) {
    for (const path of await readdir(new URL('../' + section + '/', import.meta.url), { recursive: true })) {
      if (path.endsWith('.html')) pages.push(section + '/' + path);
    }
  }
  for (const path of pages) {
    const html = await publicSource(path);
    assert.doesNotMatch(html, /<[^>]+\s(?:style|on[a-z]+)\s*=/i, `${path}: keep styling and handlers in external files for strict CSP`);
    for (const script of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      assert.match(script[1], /\bsrc="[^\"]+"/, path);
      assert.equal(script[2].trim(), '', path);
    }
    assert.deepEqual(html.match(/<footer\b[^>]*>[\s\S]*?<\/footer>/g), [footer], path);
    const nav = html.match(/<nav class="site-nav"[^>]*>[\s\S]*?<\/nav>/g);
    assert.equal(nav?.length, 1, path);
    assert.equal(nav[0].replace(/ aria-current="(?:page|true)"/g, ''), navigation, path);
    const active = [...nav[0].matchAll(/href="([^"]+)" aria-current="(page|true)"/g)];
    const route = path === 'index.html' ? '/' : '/' + path.replace(/index\.html$/, '');
    const expected = route === '/' ? '/' : route.startsWith('/projects/') ? '/projects/'
      : route === '/journal/use-with-claude-chatgpt/' ? route : route.startsWith('/journal/') ? '/journal/' : null;
    assert.deepEqual(active.map(match => [match[1], match[2]]), expected ? [[expected, expected === route ? 'page' : 'true']] : [], path);
  }
  assert.deepEqual([...footer.matchAll(/href="([^"]+)"/g)].map(match => match[1]),
    ['/privacy/', '/terms/', 'mailto:help@studworks.build', '/', '/projects/', '/journal/', '/projects/#share', '/app/', '/journal/use-with-claude-chatgpt/', '/journal/set-up-your-hub/']);
  assert.doesNotMatch(footer, /<script|<input|<button|data-copy-link/);
  assert.match(footer, /Free, forever/);
  assert.match(footer, /Not affiliated with, endorsed by, or sponsored by the LEGO Group/);
  assert.match(footer, /Not affiliated with the Pybricks project/);
  assert.match(footer, /MicroPython cross-compiler, MIT licensed/);
  assert.match(await publicSource('admin/verify/index.html'), /Private moderator access\. No builder accounts\./);
  assert.match(await publicSource('journal/use-with-claude-chatgpt/index.html'), /independent of Anthropic and OpenAI/);
  assert.match(await publicSource('projects/build/index.html'), /Report a concern/);
  for (const path of ['meet-your-hub', 'quarter-turn']) {
    assert.match(await publicSource('projects/' + path + '/index.html'), /href="\/journal\/first-city-hub-tests\/"/);
  }
  assert.match(await publicSource('projects/railway-crossing/index.html'), /href="\/journal\/projects-should-travel\/"/);
  assert.match(navigation, /class="nav-action" href="\/#get-it">Get the Mac \/ iPad App/);
  assert.match(navigation, />Web App</);
});

test('all Projects and Journal routes opt into the shared colourful shell', async () => {
  for (const section of ['projects', 'journal']) {
    const paths = (await readdir(new URL('../' + section + '/', import.meta.url), { recursive: true }))
      .filter(path => path.endsWith('.html'));
    assert.ok(paths.includes('index.html'));
    for (const path of paths) {
      const html = await publicSource(section + '/' + path);
      assert.match(html, new RegExp(`<body class="content-page ${section}-page">`), `${section}/${path}`);
      assert.match(html, /href="\/assets\/site.css"/);
      assert.match(html, /class="skip-link"/);
    }
  }
  for (const path of ['admin/index.html', 'privacy/index.html', 'terms/index.html']) {
    assert.doesNotMatch(await publicSource(path), /class="content-page/);
  }
  const css = await publicSource('assets/site.css');
  assert.match(css, /\.home,\.content-page\{background:linear-gradient/);
  assert.match(css, /\.content-page :is\(\.project-card,\.journal-entry\)/);
  assert.match(css, /\.content-page \.article-body\{/);
  assert.match(css, /\.content-page \.community-form\{/);
  assert.match(css, /\[hidden\]\{display:none!important\}/);
  assert.match(css, /:focus-visible\{outline:3px solid var\(--accent\)/);
});

test('homepage feature, workbench and hardware cards all receive a scoped colour treatment', async () => {
  const home = await publicSource('index.html'), css = await publicSource('assets/site.css');
  const features = home.match(/<ul class="feature-list">([\s\S]*?)<\/ul>/)?.[1];
  const workbench = home.match(/<h2>From the workbench<\/h2>([\s\S]*?)<h2>Hardware<\/h2>/)?.[1];
  const hardware = home.match(/<div class="hw">([\s\S]*?)<\/div>\s*<p>/)?.[1];
  assert.equal([...features.matchAll(/<li>/g)].length, 4);
  assert.equal([...workbench.matchAll(/<article class="project-card">/g)].length, 2);
  assert.equal([...hardware.matchAll(/<b>/g)].length, 6);
  assert.match(workbench, /href="\/projects\/"/);
  assert.match(workbench, /href="\/journal\/"/);
  assert.match(css, /:root\{[^}]*--red-soft:#FFF0F1/);
  const treatment = css.match(/\.home :is\(\.feature-list>li,\.grid>\.project-card,\.hw>div\)\{([^}]+)\}/)?.[1];
  assert.ok(treatment);
  assert.match(treatment, /--card-accent:var\(--accent\);--card-soft:var\(--blue-soft\)/);
  assert.match(treatment, /border-top:4px solid var\(--card-accent\)/);
  assert.match(treatment, /background:linear-gradient\(180deg,var\(--card-soft\),var\(--panel\) 150px\)/);
  // Preserve the existing yellow/green feature accents; complete the set in blue/red.
  for (const [position, accent, surface] of [['4n+2', 'yellow', 'yellow-soft'], ['4n+3', 'ok', 'ok-soft'], ['4n', 'red', 'red-soft']]) {
    const selector = `.home :is(.feature-list>li,.hw>div):nth-child(${position})`;
    const rule = css.slice(css.indexOf(selector)).split('}')[0];
    assert.ok(rule.includes(`--card-accent:var(--${accent});--card-soft:var(--${surface})`), selector);
  }
  assert.match(css, /\.home \.grid>\.project-card:first-child\{--card-accent:var\(--ok\);--card-soft:var\(--ok-soft\)\}/);
});

test('buttons keep opaque white or blue surfaces inside coloured cards', async () => {
  const css = await publicSource('assets/site.css');
  assert.match(css, /:root\{[^}]*--panel:#FFFFFF/);
  assert.match(css, /:root\{[^}]*--accent:#0057D9/);
  const filled = css.match(/\.cta,\.button\{([^}]+)\}/)?.[1];
  const outlined = css.match(/\.cta\.ghost,\.button\.secondary\{([^}]+)\}/)?.[1];
  assert.match(filled, /background:var\(--accent\)/);
  assert.match(filled, /color:#fff/);
  assert.match(outlined, /background:var\(--panel\)/);
  assert.match(outlined, /color:var\(--accent\)/);
  assert.doesNotMatch(outlined, /background:(?:transparent|inherit)/);
  assert.match(await publicSource('journal/index.html'), /<a class="cta ghost" href="\/journal\/feed.xml">Follow via Atom feed<\/a>/);
});

test('content palette keeps readable text on the new light surfaces', async () => {
  const css = await publicSource('assets/site.css');
  const colors = new Map([...css.matchAll(/--([a-z-]+):(#\w{6})\b/g)].map(match => [match[1], match[2]]));
  const luminance = hex => {
    const rgb = hex.slice(1).match(/../g).map(pair => parseInt(pair, 16) / 255)
      .map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
  };
  const contrast = (foreground, background) => {
    const values = [luminance(colors.get(foreground)), luminance(colors.get(background))];
    assert.ok((Math.max(...values) + 0.05) / (Math.min(...values) + 0.05) >= 4.5,
      `${foreground} on ${background} must retain readable contrast`);
  };
  for (const surface of ['panel', 'ground', 'blue-soft', 'ok-soft', 'yellow-soft', 'red-soft']) {
    for (const foreground of ['ink', 'soft', 'accent', 'ok']) contrast(foreground, surface);
  }
  contrast('ink', 'yellow');
});

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
