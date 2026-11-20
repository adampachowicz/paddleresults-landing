const searchCopy = {
  en: ["Search our archive. Matching profiles and competitions appear here.","Searching…","No matches. Try a surname, venue or shorter name.","Search is temporarily unavailable. Please try again.","Too many searches. Please wait a moment.","Available in PaddleStats","Download the app","Search is being connected. Please try again later.","Type at least 2 characters.","Results"],
  pl: ["Przeszukaj nasze archiwum. Dopasowane profile i zawody pojawią się tutaj.","Wyszukuję…","Brak dopasowań. Spróbuj nazwiska, miejscowości lub krótszej nazwy.","Wyszukiwanie jest chwilowo niedostępne. Spróbuj ponownie.","Zbyt wiele zapytań. Spróbuj za chwilę.","Dostępne w PaddleStats","Pobierz aplikację","Trwa podłączanie wyszukiwarki. Spróbuj ponownie później.","Wpisz co najmniej 2 znaki.","Wyniki"],
  de: ["Durchsuche unser Archiv. Passende Profile und Wettkämpfe erscheinen hier.","Suche läuft…","Keine Treffer. Versuche einen Nachnamen, Ort oder kürzeren Namen.","Die Suche ist vorübergehend nicht verfügbar. Bitte erneut versuchen.","Zu viele Suchanfragen. Bitte kurz warten.","In PaddleStats verfügbar","App herunterladen","Die Suche wird eingerichtet. Bitte später erneut versuchen.","Gib mindestens 2 Zeichen ein.","Ergebnisse"],
  hu: ["Keress az archívumunkban. A találatok itt jelennek meg.","Keresés…","Nincs találat. Próbálj vezetéknevet, helyszínt vagy rövidebb nevet.","A keresés átmenetileg nem érhető el. Próbáld újra.","Túl sok keresés. Várj egy kicsit.","Elérhető a PaddleStatsban","Az alkalmazás letöltése","A kereső beállítása folyamatban van. Próbáld újra később.","Írj be legalább 2 karaktert.","Találatok"],
  es: ["Busca en nuestro archivo. Los perfiles y las competiciones aparecerán aquí.","Buscando…","Sin coincidencias. Prueba un apellido, lugar o nombre más corto.","La búsqueda no está disponible temporalmente. Inténtalo de nuevo.","Demasiadas búsquedas. Espera un momento.","Disponible en PaddleStats","Descargar la app","Estamos conectando la búsqueda. Vuelve a intentarlo más tarde.","Escribe al menos 2 caracteres.","Resultados"],
  "pt-BR": ["Pesquise em nosso arquivo. Perfis e competições aparecerão aqui.","Buscando…","Nenhum resultado. Tente um sobrenome, local ou nome mais curto.","A busca está temporariamente indisponível. Tente novamente.","Muitas buscas. Aguarde um momento.","Disponível no PaddleStats","Baixar o aplicativo","Estamos conectando a busca. Tente novamente mais tarde.","Digite pelo menos 2 caracteres.","Resultados"]
};
export const searchMessages = Object.fromEntries(Object.entries(searchCopy).map(([code,v])=>[code,Object.fromEntries(["hint","loading","empty","error","limited","available","download","unconfigured","short","results"].map((k,i)=>[k,v[i]]))]));

export const locales = {
  en: {
    name: 'English', ogLocale: 'en_US', title: 'Canoe, kayak & SUP results app | PaddleResults by PaddleStats',
    description: 'Find available canoe, kayak and SUP competition results, athlete profiles and race history in PaddleStats. Download the app for iPhone or Android.',
    eyebrow: 'YOUR SPORT. CLOSER THAN EVER.', first: 'The race ends.', second: 'The story stays.',
    lead: 'The finish is only the beginning. Explore competition results, follow athletes and discover the stories behind the times — in PaddleStats.',
    available: 'Available on iPhone & Android', searchLabel: 'Find a competition or athlete', placeholder: 'A competition, a name, a moment…',
    search: 'Find results', searchHint: 'Search continues on paddlestats.eu. Coverage varies by competition.',
    events: 'Competitions', athletes: 'Athletes', try: 'Try', download: 'Take the results with you.',
    ios: 'Download PaddleStats on the App Store', android: 'Get PaddleStats on Google Play',
    web: 'Explore PaddleStats on the web', privacy: 'Privacy', language: 'Language',
    disciplines: ['Canoe sprint', 'Slalom', 'Canoe polo', 'SUP', 'Ocean racing', 'Marathon'],
    artAlt: 'Three racing kayaks leave flowing tracks across blue water.',
    artLabel: 'FROM THE WATER. INTO YOUR HANDS.', footer: 'A PaddleStats experience.', skip: 'Skip to content',
  },
  pl: {
    name: 'Polski', ogLocale: 'pl_PL', title: 'Wyniki kajakarstwa i SUP w aplikacji | PaddleResults od PaddleStats',
    description: 'Sprawdzaj dostępne wyniki zawodów kajakowych i SUP, profile zawodników oraz historię startów w PaddleStats. Pobierz aplikację na iPhone lub Androida.',
    eyebrow: 'TWÓJ SPORT. JESZCZE BLIŻEJ.', first: 'Wyścig się kończy.', second: 'Historia zostaje.',
    lead: 'Meta to dopiero początek. Odkrywaj wyniki zawodów, śledź zawodników i poznawaj historie ukryte za czasami — w PaddleStats.',
    available: 'Na iPhone i Androida', searchLabel: 'Znajdź zawody lub zawodnika', placeholder: 'Zawody, nazwisko, sportowy moment…',
    search: 'Znajdź wyniki', searchHint: 'Wyszukiwanie otworzy paddlestats.eu. Zakres danych zależy od zawodów.',
    events: 'Zawody', athletes: 'Zawodnicy', try: 'Spróbuj', download: 'Wyniki zawsze pod ręką.',
    ios: 'Pobierz PaddleStats z App Store', android: 'Pobierz PaddleStats z Google Play',
    web: 'Przejdź do PaddleStats w przeglądarce', privacy: 'Prywatność', language: 'Język',
    disciplines: ['Sprint kajakowy', 'Slalom', 'Kajak polo', 'SUP', 'Ocean racing', 'Maraton'],
    artAlt: 'Trzy kajaki wyścigowe zostawiają płynne ślady na błękitnej wodzie.',
    artLabel: 'Z WODY. PROSTO DO TWOICH RĄK.', footer: 'Serwis od PaddleStats.', skip: 'Przejdź do treści',
  },
  de: {
    name: 'Deutsch', ogLocale: 'de_DE', title: 'Kanu-, Kajak- und SUP-Ergebnisse | PaddleResults von PaddleStats',
    description: 'Entdecke verfügbare Kanu-, Kajak- und SUP-Ergebnisse, Athletenprofile und Rennhistorien in PaddleStats. Lade die App für iPhone oder Android herunter.',
    eyebrow: 'DEIN SPORT. NÄHER ALS JE ZUVOR.', first: 'Das Rennen endet.', second: 'Die Geschichte bleibt.',
    lead: 'Das Ziel ist erst der Anfang. Entdecke Wettkampfergebnisse, verfolge Athleten und erfahre, was hinter den Zeiten steckt — mit PaddleStats.',
    available: 'Für iPhone und Android', searchLabel: 'Wettkampf oder Athlet suchen', placeholder: 'Ein Wettkampf, ein Name, ein Moment…',
    search: 'Ergebnisse finden', searchHint: 'Die Suche wird auf paddlestats.eu fortgesetzt. Die Datenabdeckung variiert je nach Wettkampf.',
    events: 'Wettkämpfe', athletes: 'Athleten', try: 'Zum Beispiel', download: 'Deine Ergebnisse. Immer dabei.',
    ios: 'PaddleStats im App Store laden', android: 'PaddleStats bei Google Play herunterladen',
    web: 'PaddleStats im Browser entdecken', privacy: 'Datenschutz', language: 'Sprache',
    disciplines: ['Kanurennsport', 'Kanuslalom', 'Kanupolo', 'SUP', 'Ocean Racing', 'Kanumarathon'],
    artAlt: 'Drei Rennkajaks ziehen fließende Spuren durch blaues Wasser.',
    artLabel: 'VOM WASSER. DIREKT IN DEINE HAND.', footer: 'Ein Angebot von PaddleStats.', skip: 'Zum Inhalt',
  },
  hu: {
    name: 'Magyar', ogLocale: 'hu_HU', title: 'Kajak-kenu és SUP eredmények | PaddleResults a PaddleStatstől',
    description: 'Nézd meg az elérhető kajak-kenu és SUP versenyeredményeket, sportolói profilokat és korábbi futamokat a PaddleStatsban. Töltsd le iPhone-ra vagy Androidra.',
    eyebrow: 'A SPORTOD. MÉG KÖZELEBB.', first: 'A verseny véget ér.', second: 'A történet megmarad.',
    lead: 'A cél csak a kezdet. Böngéssz a versenyeredmények között, kövesd a sportolókat, és ismerd meg az idők mögötti történeteket a PaddleStatsban.',
    available: 'iPhone-ra és Androidra', searchLabel: 'Verseny vagy sportoló keresése', placeholder: 'Egy verseny, egy név, egy pillanat…',
    search: 'Eredmények keresése', searchHint: 'A keresés a paddlestats.eu oldalon folytatódik. Az elérhető adatok versenyenként eltérnek.',
    events: 'Versenyek', athletes: 'Sportolók', try: 'Például', download: 'Az eredmények mindig veled.',
    ios: 'A PaddleStats letöltése az App Store-ból', android: 'A PaddleStats letöltése a Google Playről',
    web: 'A PaddleStats megnyitása a böngészőben', privacy: 'Adatvédelem', language: 'Nyelv',
    disciplines: ['Gyorsasági kajak-kenu', 'Szlalom', 'Kajakpóló', 'SUP', 'Ocean racing', 'Maraton'],
    artAlt: 'Három versenykajak ívelt nyomokat hagy a kék vízen.',
    artLabel: 'A VÍZRŐL. EGYENESEN A KEZEDBE.', footer: 'A PaddleStats szolgáltatása.', skip: 'Ugrás a tartalomhoz',
  },
  es: {
    name: 'Español', ogLocale: 'es_ES', title: 'Resultados de piragüismo, kayak y SUP | PaddleResults de PaddleStats',
    description: 'Consulta los resultados disponibles de piragüismo, kayak y SUP, perfiles de deportistas e historiales en PaddleStats. Descarga la app para iPhone o Android.',
    eyebrow: 'TU DEPORTE. MÁS CERCA QUE NUNCA.', first: 'La carrera termina.', second: 'La historia continúa.',
    lead: 'La meta es solo el principio. Explora resultados, sigue a tus deportistas y descubre las historias detrás de los tiempos en PaddleStats.',
    available: 'Para iPhone y Android', searchLabel: 'Busca una competición o deportista', placeholder: 'Una competición, un nombre, un momento…',
    search: 'Buscar resultados', searchHint: 'La búsqueda continúa en paddlestats.eu. La cobertura varía según la competición.',
    events: 'Competiciones', athletes: 'Deportistas', try: 'Prueba', download: 'Lleva los resultados contigo.',
    ios: 'Descarga PaddleStats en el App Store', android: 'Descarga PaddleStats en Google Play',
    web: 'Explora PaddleStats en la web', privacy: 'Privacidad', language: 'Idioma',
    disciplines: ['Sprint', 'Slalom', 'Kayak polo', 'SUP', 'Ocean racing', 'Maratón'],
    artAlt: 'Tres kayaks de competición dejan estelas curvas sobre el agua azul.',
    artLabel: 'DEL AGUA. DIRECTO A TUS MANOS.', footer: 'Una experiencia de PaddleStats.', skip: 'Ir al contenido',
  },
  'pt-BR': {
    name: 'Português', ogLocale: 'pt_BR', title: 'Resultados de canoagem, caiaque e SUP | PaddleResults do PaddleStats',
    description: 'Confira resultados disponíveis de canoagem, caiaque e SUP, perfis de atletas e históricos no PaddleStats. Baixe o aplicativo para iPhone ou Android.',
    eyebrow: 'SEU ESPORTE. AINDA MAIS PERTO.', first: 'A corrida termina.', second: 'A história continua.',
    lead: 'A chegada é só o começo. Explore resultados, acompanhe atletas e descubra as histórias por trás dos tempos no PaddleStats.',
    available: 'Para iPhone e Android', searchLabel: 'Busque uma competição ou atleta', placeholder: 'Uma competição, um nome, um momento…',
    search: 'Buscar resultados', searchHint: 'A busca continua em paddlestats.eu. A cobertura varia conforme a competição.',
    events: 'Competições', athletes: 'Atletas', try: 'Experimente', download: 'Leve os resultados com você.',
    ios: 'Baixe o PaddleStats na App Store', android: 'Baixe o PaddleStats no Google Play',
    web: 'Explore o PaddleStats na web', privacy: 'Privacidade', language: 'Idioma',
    disciplines: ['Canoagem velocidade', 'Slalom', 'Caiaque polo', 'SUP', 'Ocean racing', 'Maratona'],
    artAlt: 'Três caiaques de competição deixam rastros curvos na água azul.',
    artLabel: 'DA ÁGUA. DIRETO PARA SUAS MÃOS.', footer: 'Uma experiência do PaddleStats.', skip: 'Ir para o conteúdo',
  },
};

for (const [code, t] of Object.entries(locales)) { t.searchHint = searchMessages[code].hint; t.artAlt = ({en:"PaddleStats app showing a canoe sprint competition programme and results.",pl:"Aplikacja PaddleStats z programem i wynikami zawodów sprintu kajakowego.",de:"PaddleStats-App mit Programm und Ergebnissen eines Kanurennsport-Wettkampfs.",hu:"A PaddleStats alkalmazás kajak-kenu versenyprogrammal és eredményekkel.",es:"La aplicación PaddleStats con el programa y los resultados de piragüismo.","pt-BR":"Aplicativo PaddleStats com programação e resultados de canoagem."})[code]; t.artLabel = t.available; }

const actionCopy = {
 en: ['Open on the web', 'View on the App Store', 'View on Google Play', 'Scan to download'],
 pl: ['Otwórz w PaddleStats', 'Zobacz w App Store', 'Zobacz w Google Play', 'Zeskanuj i pobierz'],
 de: ['In PaddleStats öffnen', 'Im App Store ansehen', 'Bei Google Play ansehen', 'Scannen und herunterladen'],
 hu: ['Megnyitás a PaddleStatsban', 'Megtekintés az App Store-ban', 'Megtekintés a Google Playen', 'Olvasd be és töltsd le'],
 es: ['Abrir en PaddleStats', 'Ver en el App Store', 'Ver en Google Play', 'Escanea para descargar'],
 'pt-BR': ['Abrir no PaddleStats', 'Ver na App Store', 'Ver no Google Play', 'Escaneie para baixar']
};
for (const [code, v] of Object.entries(actionCopy)) Object.assign(searchMessages[code], { openWeb:v[0], openIos:v[1], openAndroid:v[2], qr:v[3] });

for (const [code, value] of Object.entries({en:"Close search",pl:"Zamknij wyszukiwanie",de:"Suche schließen",hu:"Keresés bezárása",es:"Cerrar búsqueda","pt-BR":"Fechar busca"})) searchMessages[code].close = value;

for (const t of Object.values(locales)) t.title = t.title.replace(/\| PaddleResults.*$/, "| PaddleResults");

for (const [code, value] of Object.entries({en:"Local search test · sample directory",pl:"Lokalny test wyszukiwania · przykładowy katalog",de:"Lokaler Suchtest · Beispielverzeichnis",hu:"Helyi keresési teszt · mintakatalógus",es:"Prueba local de búsqueda · directorio de ejemplo","pt-BR":"Teste local de busca · diretório de exemplo"})) searchMessages[code].demo = value;

const discoveryCopy = {
 en:['Best matches','All disciplines','Competition','Athlete','races','matches','athletes','countries','Some results could not be loaded.',['Sprint & marathon','Slalom','Canoe polo','SUP','Ocean racing','Dragon boat']],
 pl:['Najlepsze dopasowania','Wszystkie dyscypliny','Zawody','Zawodnik','wyścigów','meczów','zawodników','krajów','Nie udało się wczytać części wyników.',['Sprint i maraton','Slalom','Kajak polo','SUP','Ocean racing','Smocze łodzie']],
 de:['Beste Treffer','Alle Disziplinen','Wettkampf','Athlet','Rennen','Spiele','Athleten','Länder','Einige Ergebnisse konnten nicht geladen werden.',['Sprint & Marathon','Slalom','Kanupolo','SUP','Ocean Racing','Drachenboot']],
 hu:['Legjobb találatok','Minden szakág','Verseny','Sportoló','futam','mérkőzés','sportoló','ország','Egyes találatok nem tölthetők be.',['Sprint és maraton','Szlalom','Kajakpóló','SUP','Ocean racing','Sárkányhajó']],
 es:['Mejores coincidencias','Todas las disciplinas','Competición','Deportista','carreras','partidos','deportistas','países','No se pudieron cargar algunos resultados.',['Sprint y maratón','Eslalon','Kayak polo','SUP','Ocean racing','Barco dragón']],
 'pt-BR':['Melhores resultados','Todas as modalidades','Competição','Atleta','provas','partidas','atletas','países','Não foi possível carregar parte dos resultados.',['Velocidade e maratona','Slalom','Caiaque polo','SUP','Ocean racing','Barco-dragão']],
};
for (const [code,v] of Object.entries(discoveryCopy)) Object.assign(searchMessages[code],Object.fromEntries(['best','allDisciplines','eventType','athleteType','races','matches','athleteCount','countryCount','partial','disciplines'].map((key,i)=>[key,v[i]])));
export const disciplineKeys = ['canoe-sprint','canoe-slalom','canoe-polo','sup','ocean-racing','dragon-boat'];
const resultCopy={
 en:['Latest placed result','Place','Final A','Final B','Final','Semi-final','Heat','Quarter-final','Team classification'],
 pl:['Ostatni wynik z miejscem','Miejsce','Finał A','Finał B','Finał','Półfinał','Eliminacje','Ćwierćfinał','Klasyfikacja drużynowa'],
 de:['Letztes platziertes Ergebnis','Platz','Finale A','Finale B','Finale','Halbfinale','Vorlauf','Viertelfinale','Teamwertung'],
 hu:['Legutóbbi helyezés','Helyezés','A döntő','B döntő','Döntő','Elődöntő','Előfutam','Negyeddöntő','Csapatverseny'],
 es:['Último resultado con puesto','Puesto','Final A','Final B','Final','Semifinal','Eliminatoria','Cuartos de final','Clasificación por equipos'],
 'pt-BR':['Último resultado com colocação','Colocação','Final A','Final B','Final','Semifinal','Eliminatória','Quartas de final','Classificação por equipes'],
};
for(const [code,v] of Object.entries(resultCopy)) Object.assign(searchMessages[code],{recentResults:v[0],place:v[1],resultPhases:{final_a:v[2],final_b:v[3],final:v[4],FNL:v[4],semifinal:v[5],semi_final:v[5],SFNL:v[5],heat:v[6],heats:v[6],HEAT:v[6],QFNL:v[7],team_classification:v[8]}});
