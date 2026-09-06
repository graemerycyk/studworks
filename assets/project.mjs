import { $, api, message, projectCard, projectHref, isProjectID } from './community-common.mjs';
const id = new URLSearchParams(location.search).get('id');
let available = false;
$('download-project').addEventListener('click', async () => {
  if (!available) return;
  $('download-project').disabled = true;
  try {
    const result = await api(`/api/v1/gallery/${id}/project`);
    if (result.project?.format !== 'studworks.project' || result.project?.version !== 1) throw new Error('This project is not available in a supported format.');
    const url = URL.createObjectURL(new Blob([JSON.stringify(result.project, null, 2) + '\n'], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = `studworks-${id}.json`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    message('project-status', 'Project downloaded. Open it in Studworks to inspect and map your hardware.');
  } catch (error) { message('project-status', error.message, true); }
  finally { $('download-project').disabled = !available; }
});
$('copy-public-link').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText($('public-link').value); message('build-status', 'Public link copied.'); }
  catch { $('public-link').focus(); $('public-link').select(); message('build-status', 'Link selected. Use your usual Copy command.'); }
});
try {
  if (!isProjectID(id)) throw new Error('Choose a published build from Projects.');
  const result = await api(`/api/v1/gallery/${id}`);
  const project = result.project ?? result;
  if (project.id !== id || typeof project.title !== 'string') throw new Error('This published build could not be loaded.');
  $('build-title').textContent = project.title; document.title = `${project.title} — Studworks`;
  $('build-card').replaceChildren(projectCard(project));
  $('public-link').value = new URL(projectHref(id), location.origin).href; $('share-build').hidden = false;
  if (isProjectID(project.forkedFrom)) { const link = document.createElement('a'); link.href = projectHref(project.forkedFrom); link.textContent = 'Inspired by this original build'; $('parent-build').append(link); $('parent-build').hidden = false; }
  available = project.hasProject === true;
  $('build-actions').hidden = !available; $('download-project').disabled = !available;
  if (available) { $('open-workbench').href = `/app/?project=${id}`; $('open-workbench').hidden = false; $('share-remix').href = `/projects/submit/?remix=${id}`; }
  message('build-status', 'Published community build.');
} catch (error) { message('build-status', error.message || 'This build is not available on this deployment yet.', true); }
