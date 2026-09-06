import { $, api, message, copyField, isProjectID } from './community-common.mjs';
let available = false;
let sending = false;
let projectSource = null;
let fileEpoch = 0;
const forkedFrom = new URLSearchParams(location.search).get('remix');
if (isProjectID(forkedFrom)) { $('remix-source').hidden = false; $('remix-source').textContent = 'Sharing a remix. Attach your revised project; the original published build will be credited.'; }
$('project-file').addEventListener('change', async () => {
  const epoch = ++fileEpoch;
  projectSource = null;
  const file = $('project-file').files?.[0];
  if (!file) { message('project-file-status', 'No project attached.'); return; }
  try {
    if (file.size > 1024 * 1024) throw new Error('Projects must be 1 MiB or smaller.');
    const source = await file.text();
    const value = JSON.parse(source);
    if (!value || Array.isArray(value) || value.format !== 'studworks.project' || value.version !== 1) throw new Error('Choose a portable Studworks project exported from the app or web workbench.');
    if (epoch !== fileEpoch) return;
    projectSource = source;
    message('project-file-status', 'Project attached. The shared validator checks the complete file when you submit.');
  } catch (error) { if (epoch === fileEpoch) { $('project-file').value = ''; message('project-file-status', error.message, true); } }
});
function attributionChanged() {
  const named = $('attribution-mode').value === 'named';
  $('attribution-details').disabled = !named;
  $('attribution-details').hidden = !named;
  $('display-name').required = named;
}
$('attribution-mode').addEventListener('change', attributionChanged);
attributionChanged();
$('submit-build').disabled = true;
try { const result = await api('/api/v1/community/status'); available = result.submissionsOpen === true; message('form-status', available ? 'Ready for your build.' : 'Submissions are not open yet. Your draft stays in this page.'); }
catch { message('form-status', 'Submissions are not open on this deployment yet. Your draft stays in this page.'); }
$('submit-build').disabled = !available;
$('submission-form').addEventListener('submit', async event => {
  event.preventDefault(); if (!available || sending) return;
  sending = true;
  $('submit-build').disabled = true;
  message('form-status', 'Sending for review…');
  try {
    const named = $('attribution-mode').value === 'named';
    const input = { title: $('title').value, displayName: named ? $('display-name').value : '', authorUrl: named ? $('author-url').value : '', description: $('description').value, hardware: $('hardware').value, prompt: $('prompt').value, mediaUrl: $('media-url').value, permission: $('permission').checked, privacy: $('privacy').checked, website: $('website').value };
    if (isProjectID(forkedFrom)) {
      if (!projectSource) throw new Error('Attach your revised Studworks project before sharing this remix.');
      input.forkedFrom = forkedFrom;
    }
    // Retain the file's exact JSON tokens so the server can reject duplicate keys
    // and lossy numeric spellings instead of trusting JSON.parse's coercions.
    const encodedBody = projectSource ? JSON.stringify(input).slice(0, -1) + ',"project":' + projectSource + '}' : undefined;
    const result = await api('/api/v1/submissions', input, { encodedBody });
    if (result.status !== 'pending' || !/^[A-Za-z0-9_-]{43}$/.test(result.receiptToken ?? '')) throw new Error('The service did not confirm your submission. Keep your draft and try again.');
    const link = new URL('/projects/submission/', location.origin); link.hash = result.receiptToken;
    $('receipt-link').value = link.href; $('open-receipt').href = link.href; $('receipt').hidden = false;
    message('form-status', 'Received for review. Nothing has been published. Save your private receipt below.');
    available = false; $('receipt-link').focus();
  } catch (error) { message('form-status', error.message, true); }
  finally { sending = false; $('submit-build').disabled = !available; }
});
$('copy-receipt').addEventListener('click', () => void copyField($('receipt-link'), 'form-status'));
