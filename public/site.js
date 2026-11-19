import { searchMessages } from './locales.mjs';
import { normalizeHits, queryUrl, detectDevice, resultDestination } from './search.mjs';
import { storeLinks } from './links.mjs';
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
let timer, controller, generation = 0;
function clear() { results.replaceChildren(); results.hidden = true; }
function invalidate() { generation++; controller?.abort(); clearTimeout(timer); clear(); status.textContent = ''; }
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
    const response = await fetch(queryUrl(area.dataset.searchApi, q, scope.value), { headers: { Accept: 'application/json', 'X-API-Key': area.dataset.searchKey }, signal: activeController.signal, credentials: 'omit', referrerPolicy: 'no-referrer' });
    if (current !== generation) return;
    if (!response.ok) { status.textContent = response.status === 429 ? t.limited : t.error; return; }
    const hits = normalizeHits(await response.json(), scope.value);
    if (current !== generation) return;
    status.textContent = hits.length ? `${t.results}: ${hits.length}` : t.empty;
    for (const hit of hits) {
      const row = document.createElement('div'); row.className = 'search-hit';
      const copy = document.createElement('div'); copy.className = 'hit-copy';
      const destination = resultDestination(hit, locale, device, stores);
      const label = device === 'ios' ? t.openIos : device === 'android' ? t.openAndroid : t.openWeb;
      const title = document.createElement('a'); title.className = 'hit-title'; title.textContent = hit.title; title.href = destination;
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
if (form && field && scope) {
  document.querySelector('.download').id = 'download';
  form.addEventListener('submit', e => { e.preventDefault(); search(); });
  field.addEventListener('input', () => { invalidate(); if ([...field.value.trim()].length >= 2) timer = setTimeout(search, 300); });
  scope.addEventListener('change', search);
  for (const suggestion of document.querySelectorAll('[data-query]')) suggestion.addEventListener('click', () => {
    field.value = suggestion.dataset.query; scope.value = suggestion.dataset.scope; field.focus(); search();
  });
}
