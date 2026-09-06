import { $, api, message, communityAvailability } from './community-common.mjs';
let receipt = location.hash.slice(1);
let available = false;
history.replaceState(null, '', location.pathname);
if (receipt) $('receipt-token').value = receipt;
async function check() {
  if (!available) return;
  receipt = $('receipt-token').value.trim();
  try {
    const result = await api('/api/v1/submissions/status', { receiptToken: receipt });
    $('receipt-detail').hidden = false; $('submission-title').textContent = result.title || 'Withdrawn submission';
    $('submission-state').textContent = `Status: ${result.status}`; $('submission-reason').textContent = result.publicNote || '';
    $('withdraw-confirm').checked = false; $('withdraw-confirm').disabled = result.status === 'withdrawn'; $('withdraw').disabled = true;
    message('receipt-status', 'Your private status is up to date.');
  } catch (error) { $('receipt-detail').hidden = true; message('receipt-status', error.message, true); }
}
$('receipt-form').addEventListener('submit', event => { event.preventDefault(); void check(); });
$('withdraw-confirm').addEventListener('change', () => { $('withdraw').disabled = !$('withdraw-confirm').checked; });
$('withdraw').addEventListener('click', async () => {
  if (!$('withdraw-confirm').checked) return;
  $('withdraw').disabled = true;
  try { await api('/api/v1/submissions/withdraw', { receiptToken: receipt }); await check(); message('receipt-status', 'Withdrawn. Its content is no longer in the gallery or review queue.'); }
  catch (error) { message('receipt-status', error.message, true); }
});
try {
  await communityAvailability(); available = true; $('check-receipt').disabled = false;
  if (receipt) await check(); else message('receipt-status', 'Enter your private receipt to check this submission.');
} catch { message('receipt-status', 'Submission status is not available on this website yet. Keep your private receipt.'); }
