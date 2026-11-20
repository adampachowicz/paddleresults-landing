export function normalizeHits(payload, scope) {
  const hits = payload?.data?.hits;
  if (!Array.isArray(hits)) throw new Error('Invalid search response');
  return hits.filter(h => h && typeof h.title === 'string' && ['athlete', 'event'].includes(h.type) && h.availability === 'available_in_app' && (scope === 'all' || (scope === 'events' ? h.type === 'event' : h.type === 'athlete'))).slice(0, 6);
}
export function queryUrl(endpoint, query, scope, discipline = null) {
  const url = new URL(endpoint, globalThis.location?.origin || 'http://localhost:4174');
  url.searchParams.set('q', query.trim());
  url.searchParams.set('scope', scope);
  if (discipline) url.searchParams.set('discipline',discipline);
  return url;
}
export function detectDevice({userAgent = '', platform = '', maxTouchPoints = 0} = {}) {
 if (/android/i.test(userAgent)) return 'android';
 if (/iPhone|iPad|iPod/i.test(userAgent) || (platform === 'MacIntel' && maxTouchPoints > 1)) return 'ios';
 return 'web';
}
export function resultDestination(hit, locale, device, stores) {
 if (device === 'ios') return stores.apple;
 if (device === 'android') return stores.google;
 const path = hit.profile_path;
 const safe = typeof path==='string' && /^\/(?:athletes|canoe-slalom\/athletes|canoe-polo|results|events)\//.test(path) && !path.includes('\\');
 const url = new URL(safe ? path : hit.type === 'event' ? '/results' : '/athletes', 'https://paddlestats.eu');
 if (url.origin !== 'https://paddlestats.eu') throw new Error('Invalid result destination');
 if (!safe) url.searchParams.set('q', hit.title);
 url.searchParams.set('lang', locale);
 for (const [k,v] of Object.entries({utm_source:'paddleresults.com',utm_medium:'referral',utm_campaign:'paddleresults_launch_v1',utm_content:`search_${hit.type}_${locale}`})) url.searchParams.set(k,v);
 return url.href;
}
export function searchTotal(payload) {
 const total = payload?.data?.total;
 return Number.isSafeInteger(total) && total >= 0 ? {value:total,estimated:payload.data.total_is_estimate === true} : null;
}
export function flagAsset(country, baseUrl) {
 const code = country?.flag_code;
 return typeof code === 'string' && /^[a-z]{2}$/.test(code) ? new URL(`assets/flags/${code}.svg`, baseUrl).href : null;
}
export async function searchDirectory(endpoint, query, scope, discipline, key, signal, fetcher = fetch) {
 const response = await fetcher(queryUrl(endpoint,query,scope,discipline), {headers:{Accept:'application/json','X-API-Key':key},signal,credentials:'omit',referrerPolicy:'no-referrer'});
 if (!response.ok) return {error:response.status};
 const payload = await response.json();
 const totals = payload?.data?.totals;
 return {disciplineCounts:payload?.data?.discipline_counts ?? null,disciplineTotal:payload?.data?.discipline_total ?? null,hits:normalizeHits(payload,scope),total:searchTotal(payload),totals:totals && ['all','events','athletes'].every(k=>Number.isSafeInteger(totals[k]) && totals[k]>=0) ? totals : null,estimated:payload?.data?.total_is_estimate===true};
}
export function eventDetails(hit, locale, t) {
 if (hit.type !== 'event') return [];
 const parts = [];
 const dates = [hit.start_date,hit.end_date].filter((d,i,a)=>typeof d==='string' && /^\d{4}-\d{2}-\d{2}$/.test(d) && a.indexOf(d)===i);
 const format = new Intl.DateTimeFormat(locale,{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
 if (dates.length) parts.push(dates.map(d=>format.format(new Date(`${d}T00:00:00Z`))).join(' – '));
 for (const [field,label] of [['races_count',hit.race_unit==='matches' ? t.matches : t.races],['athletes_count',t.athleteCount],['countries_count',t.countryCount]]) {
  if (Number.isSafeInteger(hit[field]) && hit[field]>=0) parts.push(`${new Intl.NumberFormat(locale).format(hit[field])} ${label}`);
 }
 return parts;
}
export function athleteName(hit,locale='en') {
 const name = [hit.first_name,hit.last_name].filter(v=>typeof v==='string' && v.trim()).join(' ') || hit.title;
 return name.replace(/\p{L}[\p{L}\p{M}]*/gu,word=>{const [first,...rest]=[...word];return first.toLocaleUpperCase(locale)+rest.join('').toLocaleLowerCase(locale);});
}
export function recentDestination(item,locale,device,stores) {
 return resultDestination({type:'event',title:item.name,profile_path:item.path},locale,device,stores);
}
