import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';

const publicSource = name => readFile(new URL('../' + name, import.meta.url), 'utf8');
const plainText = value => value.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ');

test('improvement policy distinguishes future default-on limited data from current processing', async () => {
  const privacy = plainText(await publicSource('privacy/index.html'));
  const terms = plainText(await publicSource('terms/index.html'));
  assert.match(privacy, /planned but is not enabled/);
  assert.match(privacy, /on by default when launched, without a separate opt-in or model-training permission checkbox/);
  assert.match(privacy, /user or account IDs, visitor or session tracking IDs, IP addresses, HTTP headers, credentials/);
  assert.match(privacy, /Instructions and generated output can themselves contain personal information/);
  assert.match(privacy, /connection information temporarily for security and request limits/);
  assert.match(privacy, /up to 30 days.*up to 90 days/);
  assert.match(privacy, /rights to object or request access, correction or deletion remain/);
  assert.match(privacy, /will not be activated until that review and the safeguards are complete/);
  assert.match(privacy, /not be sold, published as a dataset or used to claim ownership/);
  assert.match(terms, /You keep your rights in the original content/);
  assert.match(terms, /does not transfer ownership of your project/);
  assert.match(terms, /A completed program alone does not prove/);
  assert.match(terms, /Web App is available as a beta/);
  assert.doesNotMatch(terms, /workbench, cloud connections and community submissions are not yet publicly available/);
  for (const page of [privacy, terms]) {
    assert.doesNotMatch(page, /training permission is separate|Permission for model training must remain a separate choice|does not add advertising or analytics tracking/);
  }
  assert.match(await publicSource('privacy/index.html'), /id="service-improvement"/);
  assert.match(await publicSource('terms/index.html'), /href="\/privacy\/#service-improvement"/);
});
