import { $, api, message, copyField } from './community-common.mjs';
let available = false;
let sending = false;
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
    const input = { title: $('title').value, creator: $('creator').value, description: $('description').value, hardware: $('hardware').value, prompt: $('prompt').value, mediaUrl: $('media-url').value, permission: $('permission').checked, privacy: $('privacy').checked, website: $('website').value };
    const result = await api('/api/v1/submissions', input);
    if (result.status !== 'pending' || !/^[A-Za-z0-9_-]{43}$/.test(result.receiptToken ?? '')) throw new Error('The service did not confirm your submission. Keep your draft and try again.');
    const link = new URL('/projects/submission/', location.origin); link.hash = result.receiptToken;
    $('receipt-link').value = link.href; $('open-receipt').href = link.href; $('receipt').hidden = false;
    message('form-status', 'Received for review. Nothing has been published. Save your private receipt below.');
    available = false; $('receipt-link').focus();
  } catch (error) { message('form-status', error.message, true); }
  finally { sending = false; $('submit-build').disabled = !available; }
});
$('copy-receipt').addEventListener('click', () => void copyField($('receipt-link'), 'form-status'));
