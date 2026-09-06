import { $, api, message, projectCard } from './community-common.mjs';
let cursor = null;
async function load() {
  $('gallery-more').disabled = true;
  try {
    const result = await api('/api/v1/gallery' + (cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''));
    if (!Array.isArray(result.projects)) throw new Error('The gallery could not be loaded.');
    for (const project of result.projects) $('community-gallery').append(projectCard(project));
    cursor = result.nextCursor ?? null; $('gallery-more').hidden = !cursor;
    message('gallery-status', $('community-gallery').childElementCount ? 'Reviewed community builds. Open external media only if you trust its host.' : 'No community builds published yet. Yours could be the first.');
  } catch { message('gallery-status', 'The community gallery is not available yet. The build notes above are ready to explore.'); }
  finally { $('gallery-more').disabled = false; }
}
$('gallery-more').addEventListener('click', () => void load());
await load();
