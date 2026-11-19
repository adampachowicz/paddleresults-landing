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
export const mockDirectory = {
 athletes: people.map(([title,subtitle],i)=>({type:'athlete',id:900001+i,title,subtitle,availability:'available_in_app'})),
 events: competitions.map(([title,subtitle],i)=>({type:'event',id:900101+i,title,subtitle,availability:'available_in_app'})),
};
const normalize = value => value.toLowerCase().normalize('NFD').replace(/\p{M}/gu,'').replace(/ł/g,'l').trim();
export function mockSearch(query, scope) {
 if (!['events','athletes'].includes(scope) || [...query.trim()].length < 2 || [...query.trim()].length > 80) return {status:422,body:{message:'Invalid search query or scope.',errors:{q:['Use 2–80 characters and a valid scope.']}}};
 const tokens = normalize(query).split(/\s+/);
 const hits = mockDirectory[scope].filter(hit=>tokens.every(token=>normalize(`${hit.title} ${hit.subtitle}`).includes(token))).slice(0,6);
 return {status:200,body:{data:{hits}}};
}
