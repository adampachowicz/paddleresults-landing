const people = [
 ['Martin Fuksa','CZE'],['Fernando Pimenta','POR'],['Klaudia Zwolińska','POL'],['Lisa Carrington','NZL'],['Jessica Fox','AUS'],
 ['Jiří Prskavec','CZE'],['Joseph Clarke','GBR'],['Max Rendschmidt','GER'],['Sebastian Brendel','GER'],['Katie Vincent','CAN'],
];
const competitions = [
 ['ICF Canoe Sprint and Paracanoe World Championships - Poznan 2026','2026 · Poznań · POL'],
 ['ICF Canoe Marathon World Championships - Gualeguaychu 2026','2026 · Gualeguaychú · ARG'],
 ['ICF Canoe Marathon Masters World Championships - Gualeguaychu 2026','2026 · Gualeguaychú · ARG'],
 ['ICF Canoe Slalom World Championships - Penrith 2025','2025 · Penrith · AUS'],
 ['Paddle Europe Slalom Championships - Ivrea 2026','2026 · Ivrea · ITA'],
 ['ICF Canoe Polo World Championships - Duisburg 2026','2026 · Duisburg · GER'],
 ['Paddle Europe Canoe Polo Club Championships - Milan 2026','2026 · Milan · ITA'],
 ['ICF Stand Up Paddling World Championships - Sabaudia 2026','2026 · Sabaudia · ITA'],
 ['ICF Canoe Ocean Racing World Championships - Vilajoyosa 2026','2026 · Vilajoyosa · ESP'],
 ['ICF Canoe Sprint World Cup - Szeged 2026','2026 · Szeged · HUN'],
];
// Synthetic local fixtures: counts are deliberately demo data, not competition statistics.
const countries = {CZE:'Czechia',POR:'Portugal',POL:'Poland',NZL:'New Zealand',AUS:'Australia',GBR:'Great Britain',GER:'Germany',CAN:'Canada',ARG:'Argentina',ITA:'Italy',ESP:'Spain',HUN:'Hungary'};
const personNames = [['Martin','Fuksa'],['Fernando','Pimenta'],['Klaudia','Zwolińska'],['Lisa','Carrington'],['Jessica','Fox'],['Jiří','Prskavec'],['Joseph','Clarke'],['Max','Rendschmidt'],['Sebastian','Brendel'],['Katie','Vincent']];
const eventDisciplines = ['sprint','marathon','marathon','slalom','slalom','canoe-polo','canoe-polo','sup','ocean','sprint'];
const group = d => ({sprint:'canoe-sprint',marathon:'canoe-sprint',slalom:'canoe-slalom',ocean:'ocean-racing'}[d] || d);
const country = code => { const flag_code = {CZE:'cz',POR:'pt',POL:'pl',NZL:'nz',AUS:'au',GBR:'gb',GER:'de',CAN:'ca',ARG:'ar',ITA:'it',ESP:'es',HUN:'hu'}[code]; return {code,name:countries[code],flag_code,flag_emoji:[...flag_code.toUpperCase()].map(c=>String.fromCodePoint(c.charCodeAt(0)-65+0x1f1e6)).join('')}; };
export const mockDirectory = {
 athletes: people.map(([title,subtitle],i)=>({type:'athlete',id:900001+i,title,subtitle,availability:'available_in_app',
  first_name:personNames[i][0],last_name:personNames[i][1],country:country(subtitle),
  disciplines:[i===2 || i===4 || i===5 || i===6 ? 'slalom' : 'sprint'],
  discipline_groups:[i===2 || i===4 || i===5 || i===6 ? 'canoe-slalom' : 'canoe-sprint'],club:null,age:null})),
 events: competitions.map(([title,subtitle],i)=>({type:'event',id:900101+i,title,subtitle,availability:'available_in_app',
  location:subtitle.split(' · ')[1],city:subtitle.split(' · ')[1],venue:null,country:country(subtitle.split(' · ')[2]),
  level:i===4 || i===6 ? 'european' : i===9 ? 'world_cup' : 'world',
  disciplines:[eventDisciplines[i]],discipline_groups:[group(eventDisciplines[i])],
  start_date:`${subtitle.slice(0,4)}-06-12`,end_date:`${subtitle.slice(0,4)}-06-14`,races_count:12+i,race_unit:eventDisciplines[i]==='canoe-polo'?'matches':'races',
  results_count:20+i,athletes_count:40+i,countries_count:5+i,
  results_unit:eventDisciplines[i]==='canoe-polo' ? 'matches' : eventDisciplines[i]==='slalom' ? 'runs' : 'boat_results'})),
};
for (const person of mockDirectory.athletes) {
 person.profile_path=`/${person.discipline_groups.includes('canoe-slalom')?'canoe-slalom/athletes':'athletes'}/${person.id}`;
 person.birth_year=person.first_name==='Klaudia' ? 1998 : null;
 person.recent_results=mockDirectory.events.filter(event=>event.discipline_groups.some(group=>person.discipline_groups.includes(group))).slice(0,2).map(event=>({id:event.id,name:event.title,start_date:event.start_date,end_date:event.end_date,year:Number(event.start_date.slice(0,4)),path:`/results/${event.id}`}));
}
const normalize = value => value.toLowerCase().normalize('NFD').replace(/\p{M}/gu,'').replace(/ł/g,'l').trim();
export function mockSearch(query, scope = 'all', discipline = '') {
 if (!['all','events','athletes'].includes(scope) || (discipline && !['canoe-sprint','canoe-slalom','canoe-polo','sup','ocean-racing','dragon-boat'].includes(discipline)) || [...query.trim()].length < 2 || [...query.trim()].length > 80) return {status:422,body:{message:'Invalid search query, scope or discipline.'}};
 const tokens = normalize(query).split(/\s+/);
 const unfiltered = Object.fromEntries(['events','athletes'].map(key=>[key,mockDirectory[key].filter(hit=>tokens.every(token=>normalize(`${hit.title} ${hit.subtitle}`).includes(token)))]));
 const byScope=Object.fromEntries(Object.entries(unfiltered).map(([key,hits])=>[key,hits.filter(hit=>!discipline || hit.discipline_groups.includes(discipline))]));
 const allScope=scope==='all' ? [...unfiltered.events,...unfiltered.athletes] : unfiltered[scope];
 const discipline_counts=Object.fromEntries(['canoe-sprint','canoe-slalom','canoe-polo','sup','ocean-racing','dragon-boat'].map(group=>[group,allScope.filter(hit=>hit.discipline_groups.includes(group)).length]));
 const totals = {events:byScope.events.length,athletes:byScope.athletes.length}; totals.all = totals.events+totals.athletes;
 const candidates = scope==='all' ? [...byScope.events,...byScope.athletes] : byScope[scope];
 const hits = candidates.map(hit=>({...hit,relevance:normalize(hit.title)===normalize(query)?1:normalize(hit.title).startsWith(normalize(query))?.95:.8})).sort((a,b)=>b.relevance-a.relevance).slice(0,6);
 return {status:200,body:{data:{hits,total:totals[scope],totals,discipline_counts,discipline_total:allScope.length,total_is_estimate:false}}};
}
