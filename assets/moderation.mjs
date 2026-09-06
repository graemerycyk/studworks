import { $, api, message, projectCard, communityAvailability } from './community-common.mjs';
let csrf = null;
let nextCursor = null;
let loginReady = false;
async function refresh(cursor = '') {
  const session = await api('/api/v1/admin/session', undefined, { admin: true });
  csrf = session.csrf; $('admin-identity').textContent = `Signed in as ${session.email}`;
  $('sign-in').hidden = true; $('moderation').hidden = false;
  const query = new URLSearchParams({ status: $('queue-status').value }); if (cursor) query.set('cursor', cursor);
  const result = await api('/api/v1/admin/submissions?' + query, undefined, { admin: true });
  nextCursor = result.nextCursor; $('next-queue').hidden = !nextCursor;
  $('moderation-queue').replaceChildren();
  for (const submission of result.submissions) {
    const card = projectCard(submission, { moderation: true });
    const fields = document.createElement('div'); fields.className = 'moderation-fields';
    if (submission.hasProject) {
      const inspect = document.createElement('button'); inspect.type = 'button'; inspect.className = 'button secondary';
      inspect.textContent = 'Inspect attached project (read only)';
      const contents = document.createElement('pre'); contents.hidden = true; contents.tabIndex = 0;
      inspect.addEventListener('click', async () => {
        inspect.disabled = true;
        try {
          const result = await api(`/api/v1/admin/submissions/${submission.id}/project`, undefined, { admin: true });
          contents.textContent = JSON.stringify(result.project, null, 2); contents.hidden = false;
          inspect.textContent = 'Attached project shown below';
        } catch (error) { message('admin-status', error.message, true); inspect.disabled = false; }
      });
      fields.append(inspect, contents);
    }
    const label = document.createElement('label'); label.textContent = 'Note visible to the builder with their receipt';
    const note = document.createElement('textarea'); note.maxLength = 1000; note.rows = 3; note.value = submission.publicNote; label.append(note); fields.append(label);
    const actions = document.createElement('div'); actions.className = 'moderation-actions';
    const choices = submission.status === 'pending' ? [['publish', 'Publish build'], ['reject', 'Decline']] : submission.status === 'published' ? [['unpublish', 'Remove from gallery']] : [];
    for (const [action, title] of choices) {
      const button = document.createElement('button'); button.type = 'button'; button.textContent = title; button.className = 'button' + (action === 'publish' ? '' : ' secondary destructive');
      button.addEventListener('click', async () => {
        if (!window.confirm(`${title}: “${submission.title}”?${action === 'publish' ? ' Its submitted details, chosen credit, links, and any attached project including notes and version history will become public.' : ''}`)) return;
        for (const child of actions.children) child.disabled = true;
        try { await api(`/api/v1/admin/submissions/${submission.id}/moderate`, { action, expectedVersion: submission.version, note: note.value }, { admin: true, csrf }); await refresh(); message('admin-status', 'Review saved.'); }
        catch (error) { message('admin-status', error.message, true); for (const child of actions.children) child.disabled = false; }
      });
      actions.append(button);
    }
    fields.append(actions); card.append(fields); $('moderation-queue').append(card);
  }
  message('admin-status', result.submissions.length ? `${result.submissions.length} builds shown. Oldest first; up to 20 per page.` : 'Nothing in this review queue.');
}
$('sign-in-form').addEventListener('submit', async event => {
  event.preventDefault(); if (!loginReady) return; $('send-link').disabled = true;
  try { const result = await api('/api/v1/admin/sign-in', { email: $('admin-email').value }, { admin: true }); message('admin-status', result.message); }
  catch (error) { message('admin-status', error.message, true); }
  finally { $('send-link').disabled = !loginReady; }
});
for (const id of ['refresh-queue', 'queue-status']) $(id).addEventListener(id === 'queue-status' ? 'change' : 'click', () => { void refresh().catch(error => message('admin-status', error.message, true)); });
$('next-queue').addEventListener('click', async () => {
  $('next-queue').disabled = true;
  try { if (nextCursor) await refresh(nextCursor); } catch (error) { message('admin-status', error.message, true); }
  finally { $('next-queue').disabled = false; }
});
$('sign-out').addEventListener('click', async () => {
  try { await api('/api/v1/admin/logout', {}, { admin: true, csrf }); csrf = null; nextCursor = null; $('next-queue').hidden = true; $('moderation-queue').replaceChildren(); $('moderation').hidden = true; $('sign-in').hidden = false; message('admin-status', 'Signed out.'); }
  catch (error) { message('admin-status', error.message, true); }
});
try {
  const availability = await communityAvailability(); loginReady = availability.moderatorLoginReady;
  $('send-link').disabled = !loginReady;
  await refresh().catch(() => {
    $('sign-in').hidden = false; $('moderation').hidden = true;
    message('admin-status', loginReady ? 'Request a sign-in link to review builds.' : 'Moderator sign-in is not available on this website yet.');
  });
} catch { message('admin-status', 'Moderator sign-in is not available on this website yet.'); }
