import { searchMessages, disciplineKeys } from './locales.mjs';
import { searchDirectory, eventDetails, flagAsset, detectDevice, resultDestination, athleteName, recentDestination, recentResultSummary } from './search.mjs';
import { storeLinks } from './links.mjs';
import { searchViewport } from './viewport.mjs';
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
let timer, controller, generation = 0, discipline = '';
const searchCache = new Map();
let viewportReference = window.innerHeight;
let viewportFrame;
function syncViewport() {
 cancelAnimationFrame(viewportFrame);
 viewportFrame = requestAnimationFrame(() => {
  if (!dialog?.open) return;
  const viewport = window.visualViewport;
  const state = searchViewport({height:viewport?.height ?? window.innerHeight,offsetTop:viewport?.offsetTop ?? 0,scale:viewport?.scale ?? 1,referenceHeight:Math.max(viewportReference,window.innerHeight),focused:document.activeElement===field});
  if (!state) return;
  dialog.style.setProperty('--search-viewport-height',`${state.height}px`);
  dialog.style.setProperty('--search-viewport-top',`${state.top}px`);
  dialog.dataset.keyboard = String(state.keyboard);
 });
}
window.visualViewport?.addEventListener('resize',syncViewport);
window.visualViewport?.addEventListener('scroll',syncViewport);
window.addEventListener('resize',syncViewport);
const flagBase = new URL('./', import.meta.url);
function updateCounts(data) {
 for (const node of document.querySelectorAll('[data-count]')) {
  const value = data?.totals?.[node.dataset.count];
  const total = Number.isSafeInteger(value) ? {value,estimated:data.estimated} : null;
  node.hidden = !total;
  node.textContent = total ? `${total.estimated && total.value > 0 ? '≈' : ''}${new Intl.NumberFormat(locale).format(total.value)}` : '';
 }
}
function updateDisciplineCounts(data) {
 for (const node of document.querySelectorAll('[data-discipline-count]')) {
  const value = node.dataset.disciplineCount==='all' ? data?.disciplineTotal : data?.disciplineCounts?.[node.dataset.disciplineCount];
  node.hidden = !Number.isSafeInteger(value);
  node.textContent = Number.isSafeInteger(value) ? `${data?.estimated && value>0 ? '≈' : ''}${new Intl.NumberFormat(locale).format(value)}` : '';
 }
}
function clear() { results.replaceChildren(); results.hidden = true; }
function invalidate() { generation++; controller?.abort(); clearTimeout(timer); clear(); updateCounts(null); updateDisciplineCounts(null); status.textContent = ''; }
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
    const cacheKey = JSON.stringify([q,scope.value,discipline]);
    const cached = searchCache.get(cacheKey);
    const data = cached && Date.now()-cached.at < 60000 ? cached.data : await searchDirectory(area.dataset.searchApi, q, scope.value, discipline, area.dataset.searchKey, activeController.signal);
    if (current !== generation) return;
    if (!data.error) { searchCache.set(cacheKey,{at:Date.now(),data}); if (searchCache.size>12) searchCache.delete(searchCache.keys().next().value); }
    updateCounts(data); updateDisciplineCounts(data);
    const selected = data;
    if (selected.error) { status.textContent = selected.error === 429 ? t.limited : t.error; return; }
    const hits = selected.hits;
    const total = selected.total;
    status.textContent = hits.length ? `${t.results}: ${total ? `${total.estimated ? '≈' : ''}${new Intl.NumberFormat(locale).format(total.value)}` : hits.length}` : t.empty;
    for (const hit of hits) {
      const row = document.createElement('div'); row.className = 'search-hit';
      const copy = document.createElement('div'); copy.className = 'hit-copy';
      const destination = resultDestination(hit, locale, device, stores);
      const label = device === 'ios' ? t.openIos : device === 'android' ? t.openAndroid : t.openWeb;
      const title = document.createElement('a'); title.className = 'hit-title'; title.textContent = hit.type==='athlete' ? athleteName(hit,locale) : hit.title; title.href = destination;
      const flagUrl = flagAsset(hit.country, flagBase);
      if (flagUrl) {
        const flag = document.createElement('img'); flag.className = 'hit-flag'; flag.src = flagUrl; flag.alt = hit.country.name || hit.country.code || ''; flag.width = 20; flag.height = 15; flag.addEventListener('error', () => flag.remove(), {once:true}); title.prepend(flag);
      }
      title.setAttribute('aria-label',`${hit.type==='athlete' ? t.athleteType : t.eventType} — ${title.textContent}`);
      const heading = document.createElement('div'); heading.className = 'hit-heading'; heading.append(title);
      if (hit.type==='athlete' && Number.isInteger(hit.birth_year)) { const year=document.createElement('span');year.className='hit-birth';year.textContent=`(${hit.birth_year})`;heading.append(year); }
      const badges = document.createElement('div'); badges.className='hit-badges';
      for (const key of hit.discipline_groups || []) {
        const index=disciplineKeys.indexOf(key); if (index<0) continue;
        const badge=document.createElement('span');badge.className='hit-discipline';badge.textContent=t.disciplines[index];badges.append(badge);
      }
      copy.append(heading,badges);
      const subtitle = document.createElement('div'); subtitle.className = 'hit-subtitle';
      subtitle.textContent = hit.type==='athlete' ? (hit.club || '') : (hit.location || hit.city || '');
      if (subtitle.textContent) copy.append(subtitle);
      const details = eventDetails(hit,locale,t);
      if (details.length) { const meta = document.createElement('div'); meta.className = 'hit-details'; meta.textContent = details.join(' · '); copy.append(meta); }
      if (hit.type==='athlete' && Array.isArray(hit.recent_results) && hit.recent_results.some(item=>recentResultSummary(item,t))) {
        const recent=document.createElement('div');recent.className='hit-recent';
        const label=document.createElement('div');label.className='hit-recent-label';label.textContent=t.recentResults;recent.append(label);
        for (const item of hit.recent_results.filter(item=>recentResultSummary(item,t)).slice(0,1)) {
          if (typeof item.name!=='string' || !recentResultSummary(item,t)) continue;
          const link=document.createElement('a');link.href=recentDestination(item,locale,device,stores);link.textContent=item.name;link.className='hit-recent-link';
          const itemRow=document.createElement('div');itemRow.className='hit-recent-item';itemRow.append(link);
          const summary=document.createElement('div');summary.className='hit-result-summary';summary.textContent=recentResultSummary(item,t);itemRow.append(summary);
          const date=item.end_date || item.start_date;
          if (typeof date==='string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) { const time=document.createElement('time');time.dateTime=date;time.textContent=new Intl.DateTimeFormat(locale,{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(`${date}T00:00:00Z`));itemRow.append(time); }
          else if (Number.isInteger(item.year)) { const year=document.createElement('span');year.className='hit-recent-year';year.textContent=String(item.year);itemRow.append(year); }
          recent.append(itemRow);
        }
        copy.append(recent);
      }
      row.append(copy); results.append(row);
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
  viewportReference = window.innerHeight;
  if (!dialog.open) dialog.showModal();
  field.focus({preventScroll:true});
  syncViewport();
}
function chooseScope(value) {
  scope.value = value;
  for (const tab of document.querySelectorAll('[data-scope]')) tab.setAttribute('aria-pressed', String(tab.dataset.scope === value));
}
function chooseDiscipline(value) {
 discipline = value;
 for (const node of document.querySelectorAll('[data-discipline]')) node.setAttribute('aria-pressed',String(node.dataset.discipline===value));
}
if (form && field && scope && dialog && opener && closer) {
  opener.addEventListener('click', openSearch);
  field.addEventListener('focus',syncViewport);
  field.addEventListener('blur',syncViewport);
  closer.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { cancelAnimationFrame(viewportFrame); delete dialog.dataset.keyboard; dialog.style.removeProperty('--search-viewport-height'); dialog.style.removeProperty('--search-viewport-top'); searchCache.clear(); invalidate(); opener.focus({preventScroll:true}); });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  document.addEventListener('keydown', event => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openSearch(); }
  });
  for (const tab of document.querySelectorAll('[data-scope]')) tab.addEventListener('click', () => { chooseScope(tab.dataset.scope); field.focus({preventScroll:true}); if (field.value.trim().length >= 2) search(); });
  for (const pill of document.querySelectorAll('[data-discipline]')) pill.addEventListener('click', () => {
    chooseDiscipline(pill.dataset.discipline);
    field.focus({preventScroll:true}); if (field.value.trim().length>=2) search();
  });
  document.querySelector('.download').id = 'download';
  form.addEventListener('submit', e => { e.preventDefault(); search(); });
  field.addEventListener('input', () => { invalidate(); if ([...field.value.trim()].length >= 2) timer = setTimeout(search, 200); });
  scope.addEventListener('change', search);
  for (const suggestion of document.querySelectorAll('[data-query]')) suggestion.addEventListener('click', () => {
    field.value = suggestion.dataset.query; chooseScope('all'); chooseDiscipline(''); field.focus(); search();
  });
}
