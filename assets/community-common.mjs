export const $ = id => document.getElementById(id);
export async function api(path, body, { admin = false, csrf } = {}) {
  const response = await fetch(path, { method: body === undefined ? 'GET' : 'POST',
    credentials: admin ? 'same-origin' : 'omit', cache: 'no-store', referrerPolicy: 'no-referrer',
    headers: { Accept: 'application/json', ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...(csrf ? { 'X-Studworks-CSRF': csrf } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(15000) });
  const reader = response.body.getReader(); const chunks = []; let length = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read(); if (done) break;
      length += value.byteLength;
      if (length > 512 * 1024) { await reader.cancel(); throw new Error('The response was too large. Please try again.'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(length); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  let result;
  try { result = JSON.parse(text); } catch { throw new Error('The community service is unavailable. Nothing has been confirmed saved.'); }
  if (!response.ok) throw new Error(result?.error?.message || 'This request could not be completed. Please try again.');
  return result;
}
export function message(id, text, error = false) { $(id).textContent = text; $(id).classList.toggle('community-error', error); }
export async function communityAvailability() {
  const result = await api('/api/v1/community/status');
  if (result?.mediaMode !== 'links' || typeof result.submissionsOpen !== 'boolean' || typeof result.moderatorLoginReady !== 'boolean') throw new Error('The community service is not available on this website yet.');
  return result;
}
export async function copyField(field, statusId) {
  try { await navigator.clipboard.writeText(field.value); message(statusId, 'Copied. Keep this private.'); }
  catch { field.focus(); field.select(); message(statusId, 'The text is selected. Use your usual Copy command.'); }
}
export function safeMediaLink(value) {
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : null; } catch { return null; }
}
export function projectCard(project) {
  const article = document.createElement('article'); article.className = 'project-card community-card';
  const title = document.createElement('h3'); title.textContent = project.title;
  const creator = document.createElement('p'); creator.className = 'meta'; creator.textContent = `By ${project.creator || 'Anonymous builder'}`;
  const description = document.createElement('p'); description.textContent = project.description;
  const hardware = document.createElement('p'); hardware.textContent = `Hardware: ${project.hardware}`;
  const prompt = document.createElement('pre'); prompt.textContent = project.prompt;
  article.append(title, creator, description, hardware, prompt);
  const href = safeMediaLink(project.mediaUrl);
  if (href) { const media = document.createElement('a'); media.href = href; media.textContent = 'View photo or video ↗'; media.rel = 'noopener noreferrer nofollow ugc'; media.target = '_blank'; article.append(media); }
  const notice = document.createElement('p'); notice.className = 'small meta'; notice.textContent = 'Community submission. Moderation is not hardware safety certification.'; article.append(notice);
  return article;
}
