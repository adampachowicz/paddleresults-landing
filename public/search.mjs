export function normalizeHits(payload, scope) {
  const hits = payload?.data?.hits;
  if (!Array.isArray(hits)) throw new Error('Invalid search response');
  return hits.filter(h => h && typeof h.title === 'string' && ['athlete', 'event'].includes(h.type) && h.availability === 'available_in_app' && (scope === 'events' ? h.type === 'event' : h.type === 'athlete')).slice(0, 6);
}
export function queryUrl(endpoint, query, scope) {
  const url = new URL(endpoint, globalThis.location?.origin || 'http://localhost:4174');
  url.searchParams.set('q', query.trim());
  url.searchParams.set('scope', scope);
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
 const url = new URL(hit.type === 'event' ? '/results' : '/athletes', 'https://paddlestats.eu');
 url.searchParams.set('q', hit.title);
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
export async function searchScopes(endpoint, query, key, signal, fetcher = fetch) {
 return Object.fromEntries(await Promise.all(['events','athletes'].map(async scope => {
  try {
   const response = await fetcher(queryUrl(endpoint,query,scope), {headers:{Accept:'application/json','X-API-Key':key},signal,credentials:'omit',referrerPolicy:'no-referrer'});
   if (!response.ok) return [scope,{error:response.status}];
   const payload = await response.json();
   return [scope,{hits:normalizeHits(payload,scope),total:searchTotal(payload)}];
  } catch (error) { if (signal?.aborted) throw error; return [scope,{error:503}]; }
 })));
}
