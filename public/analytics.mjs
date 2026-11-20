const key='paddleresults.analytics.v1';
const lifetime=180*24*60*60*1000;
export function analyticsTracker({id,storage,send,load,disable,now=Date.now}) {
 let choice=null,started=false;
 try { const saved=JSON.parse(storage.getItem(key));if(saved && now()-saved.at<lifetime && now()>=saved.at && ['accepted','declined'].includes(saved.choice)) choice=saved.choice; } catch {}
 function activate() {
  disable(false);
  if(started) {send('consent','update',{analytics_storage:'granted'});return;}
  started=true;
  send('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
  send('consent','update',{analytics_storage:'granted'});
  send('js',new Date(now()));
  load(id);
 }
 if(choice==='accepted') activate();
 return {
  get choice(){return choice;},
  choose(value){
   if(!['accepted','declined'].includes(value)) return;
   choice=value;try{storage.setItem(key,JSON.stringify({choice,at:now()}));}catch{}
   if(value==='accepted') activate();else {disable(true);if(started)send('consent','update',{analytics_storage:'denied'});}
  },
  track(name,params={}){if(choice==='accepted')send('event',name,params);},
 };
}
const messages={
 en:['Visit statistics?','We use Google Analytics to measure visits and clicks. It starts only if you agree.','Accept','Decline','Analytics settings'],
 pl:['Statystyki odwiedzin?','Używamy Google Analytics do pomiaru odwiedzin i kliknięć. Uruchomimy je tylko za Twoją zgodą.','Zgadzam się','Odrzucam','Ustawienia statystyk'],
 de:['Besuchsstatistik?','Wir nutzen Google Analytics für Besuche und Klicks. Es startet erst mit Ihrer Zustimmung.','Zustimmen','Ablehnen','Statistikeinstellungen'],
 hu:['Látogatottsági statisztika?','A Google Analytics a látogatásokat és kattintásokat méri. Csak hozzájárulás után indul el.','Elfogadom','Elutasítom','Statisztikai beállítások'],
 es:['¿Estadísticas de visitas?','Usamos Google Analytics para medir visitas y clics. Solo se activa con tu consentimiento.','Aceptar','Rechazar','Ajustes de estadísticas'],
 'pt-BR':['Estatísticas de visitas?','Usamos o Google Analytics para medir visitas e cliques. Ele só é ativado com seu consentimento.','Aceitar','Recusar','Configurações de estatísticas'],
};
if(typeof document!=='undefined') {
 const id=document.querySelector('meta[name="ga-measurement-id"]')?.content;
 if(/^G-[A-Z0-9]+$/.test(id||'') && !['localhost','127.0.0.1'].includes(location.hostname)) {
  const locale=document.documentElement.lang;
  const t=messages[locale]||messages.en;
  let storage;try{storage=localStorage;}catch{storage={getItem:()=>null,setItem:()=>{}};}
  window.dataLayer=window.dataLayer||[];
  const send=function(){window.dataLayer.push(arguments);};
  const tracker=analyticsTracker({id,storage,send,disable:value=>{window[`ga-disable-${id}`]=value;},load:()=>{
   window.gtag=send;
   send('config',id,{page_location:location.origin+location.pathname,page_referrer:document.referrer ? new URL(document.referrer).origin : '',allow_google_signals:false,allow_ad_personalization_signals:false,cookie_prefix:'pr',cookie_expires:180*24*60*60,send_page_view:true});
   const script=document.createElement('script');script.async=true;script.src=`https://www.googletagmanager.com/gtag/js?id=${id}`;document.head.append(script);
  }});
  const panel=document.createElement('section');panel.className='analytics-choice';panel.setAttribute('aria-label',t[4]);
  const heading=document.createElement('strong');heading.textContent=t[0];
  const text=document.createElement('p');text.textContent=t[1];
  const actions=document.createElement('div');actions.className='analytics-actions';
  for(const [choice,label] of [['declined',t[3]],['accepted',t[2]]]) {
   const button=document.createElement('button');button.type='button';button.textContent=label;
   button.addEventListener('click',()=>{tracker.choose(choice);panel.hidden=true;
    if(choice==='declined')for(const cookie of document.cookie.split(';')) {const name=cookie.trim().split('=')[0];if(!/^pr_ga(?:_|$)/.test(name))continue;for(const domain of ['',location.hostname,`.${location.hostname}`]) document.cookie=`${name}=; Max-Age=0; Path=/;${domain?` Domain=${domain};`:''}`;}
   });actions.append(button);
  }
  panel.append(heading,text,actions);panel.hidden=tracker.choice!==null;document.body.append(panel);
  const settings=document.createElement('button');settings.type='button';settings.className='analytics-settings';settings.textContent=t[4];settings.addEventListener('click',()=>{panel.hidden=false;panel.querySelector('button').focus();});document.querySelector('.footer').append(settings);
  document.addEventListener('click',event=>{
   const link=event.target.closest?.('a[href]');if(!link)return;
   const url=new URL(link.href,location.href);
   const destination=url.hostname==='apps.apple.com'?'ios':url.hostname==='play.google.com'?'android':url.hostname==='paddlestats.eu'?'web':null;
   if(!destination)return;
   const placement=link.closest('.search-results')?'search':link.closest('.qr-pair')?'qr':link.closest('.footer')?'footer':'hero';
   tracker.track(destination==='web'?'paddlestats_click':'app_store_click',{destination,placement,language:locale,transport_type:'beacon'});
  });
  document.addEventListener('directory:search',event=>{
   const {scope,discipline,count}=event.detail||{};
   if(!['all','events','athletes'].includes(scope)||!Number.isInteger(count))return;
   tracker.track('directory_search',{search_scope:scope,discipline:discipline||'all',result_count:count,language:locale});
  });
 }
}
