import { $, api, message, communityAvailability } from './community-common.mjs';
let token = location.hash.slice(1);
let available = false;
history.replaceState(null, '', location.pathname);
if (!/^[A-Za-z0-9_-]{43}$/.test(token)) { $('confirm-sign-in').disabled = true; message('verify-status', 'This page has no valid sign-in link. Request a new one.', true); }
$('confirm-sign-in').addEventListener('click', async () => {
  if (!available || !token) return;
  $('confirm-sign-in').disabled = true;
  try { await api('/api/v1/admin/verify', { token }, { admin: true }); token = ''; location.replace('/admin/'); }
  catch (error) { token = ''; message('verify-status', error.message, true); }
});
if (/^[A-Za-z0-9_-]{43}$/.test(token)) {
  try { await communityAvailability(); available = true; $('confirm-sign-in').disabled = false; message('verify-status', 'Ready to confirm the sign-in you requested.'); }
  catch { message('verify-status', 'Moderator sign-in is not available on this website yet.'); }
}
