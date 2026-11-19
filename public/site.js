import { searchMessages } from './locales.mjs';
import { searchScopes, flagAsset, detectDevice, resultDestination } from './search.mjs';
import { storeLinks } from './links.mjs';
const dialog = document.querySelector('#search-dialog');
const opener = document.querySelector('#open-search');
const closer = document.querySelector('#close-search');
const form = document.querySelector('#search-form');
const field = document.querySelector('#search-query');
const scope = document.querySelector('#search-scope');
const area = document.querySelector('.search-area');
const status = document.querySelector('#search-status');
const results = document.querySelector('#search-results');
const locale = document.documentElement.lang;
const t = searchMessages[locale] || searchMessages.en;
const device = detectDevice(navigator);
const stores = storeLinks(locale, 'search');
let timer, controller, generation = 0, cachedQuery = null, cachedScopes = null, cachedAt = 0;
const flagBase = new URL('./', import.meta.url);
function updateCounts(data) {
 for (const node of document.querySelectorAll('[data-count]')) {
  const total = data?.[node.dataset.count]?.total;
  node.hidden = !total;
  node.textContent = total ? `${total.estimated && total.value > 0 ? '≈' : ''}${new Intl.NumberFormat(locale).format(total.value)}` : '';
 }
}
function clear() { results.replaceChildren(); results.hidden = true; }
function invalidate() { generation++; controller?.abort(); clearTimeout(timer); clear(); updateCounts(null); status.textContent = ''; }
async function search() {
  invalidate();
  const current = generation;
  const q = field.value.trim();
  if ([...q].length < 2) { status.textContent = t.short; return; }
  if (!area.dataset.searchApi || !area.dataset.searchKey) { status.textContent = t.unconfigured; return; }
  controller = new AbortController();
  const activeController = controller;
  const timeout = setTimeout(() => activeController.abort(), 8000);
  status.textContent = t.loading;
  results.setAttribute('aria-busy', 'true');
  try {
    const data = cachedQuery === q && cachedScopes && Date.now()-cachedAt < 60000 ? cachedScopes : await searchScopes(area.dataset.searchApi, q, area.dataset.searchKey, activeController.signal);
    if (current !== generation) return;
    if (!Object.values(data).some(section => section.error)) { cachedQuery = q; cachedScopes = data; cachedAt = Date.now(); }
    updateCounts(data);
    const selected = data[scope.value];
    if (selected.error) { status.textContent = selected.error === 429 ? t.limited : t.error; return; }
    const hits = selected.hits;
    const total = selected.total;
    status.textContent = hits.length ? `${t.results}: ${total ? `${total.estimated ? '≈' : ''}${new Intl.NumberFormat(locale).format(total.value)}` : hits.length}` : t.empty;
    for (const hit of hits) {
      const row = document.createElement('div'); row.className = 'search-hit';
      const copy = document.createElement('div'); copy.className = 'hit-copy';
      const destination = resultDestination(hit, locale, device, stores);
      const label = device === 'ios' ? t.openIos : device === 'android' ? t.openAndroid : t.openWeb;
      const title = document.createElement('a'); title.className = 'hit-title'; title.textContent = hit.title; title.href = destination;
      const flagUrl = flagAsset(hit.country, flagBase);
      if (flagUrl) {
        const flag = document.createElement('img'); flag.className = 'hit-flag'; flag.src = flagUrl; flag.alt = hit.country.name || hit.country.code || ''; flag.width = 20; flag.height = 15; flag.addEventListener('error', () => flag.remove(), {once:true}); title.prepend(flag);
      }
      const subtitle = document.createElement('div'); subtitle.className = 'hit-subtitle'; subtitle.textContent = hit.subtitle || '';
      copy.append(title, subtitle);
      const open = document.createElement('a'); open.className = 'hit-open'; open.href = destination; open.textContent = label; open.setAttribute('aria-label', `${label} — ${hit.title}`);
      row.append(copy, open); results.append(row);
    }
    results.hidden = !hits.length;
  } catch (error) {
    if (current === generation) status.textContent = t.error;
  } finally {
    clearTimeout(timeout);
    if (current === generation) results.removeAttribute('aria-busy');
  }
}
function openSearch() {
  if (!dialog.open) dialog.showModal();
  field.focus({preventScroll:true});
}
function chooseScope(value) {
  scope.value = value;
  for (const tab of document.querySelectorAll('[data-scope]')) tab.setAttribute('aria-pressed', String(tab.dataset.scope === value));
}
if (form && field && scope && dialog && opener && closer) {
  opener.addEventListener('click', openSearch);
  closer.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { cachedScopes = null; invalidate(); opener.focus({preventScroll:true}); });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  document.addEventListener('keydown', event => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openSearch(); }
  });
  for (const tab of document.querySelectorAll('[data-scope]')) tab.addEventListener('click', () => { chooseScope(tab.dataset.scope); field.focus({preventScroll:true}); if (field.value.trim().length >= 2) search(); });
  document.querySelector('.download').id = 'download';
  form.addEventListener('submit', e => { e.preventDefault(); search(); });
  field.addEventListener('input', () => { invalidate(); if ([...field.value.trim()].length >= 2) timer = setTimeout(search, 300); });
  scope.addEventListener('change', search);
  for (const suggestion of document.querySelectorAll('[data-query]')) suggestion.addEventListener('click', () => {
    field.value = suggestion.dataset.query; chooseScope(suggestion.dataset.scope); field.focus(); search();
  });
}
