/**
 * Academy — Course content: lessons and quizzes.
 */

import type { Course } from './types';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COURSE 1 — Introduzione al Foresight
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const foresight: Course = {
  id: 'intro-foresight',
  title: 'Introduzione al Foresight',
  subtitle: "Cos'e' il pensiero sui futuri e perche' serve a tutti",
  icon: 'telescope',
  color: '#14b8a6',
  track: 1,
  trackLabel: 'Pensare il futuro',

  lessons: [
    {
      id: 'foresight-1',
      title: "Cos'e' il foresight",
      icon: 'telescope',
      duration: '4 min',
      blocks: [
        "Il foresight non e' previsione. Non e' profezia. Non e' intuizione. E' una disciplina strutturata per pensare sistematicamente a cio' che potrebbe accadere — e prepararsi.",
        "La differenza e' fondamentale. Una **previsione** dice: \"domani piovera'\". Il foresight dice: \"date queste condizioni atmosferiche, c'e' il 70% di probabilita' di pioggia, il 20% di nuvoloso, il 10% di sereno — e per ciascun caso, ecco cosa conviene fare.\"",
        { type: 'highlight', text: "Il foresight non cerca di indovinare il futuro. Cerca di mappare lo spazio dei futuri possibili, per prendere decisioni migliori nel presente." },
        "La disciplina nasce negli anni '50, nei think tank militari americani. Herman Kahn, alla RAND Corporation, sviluppa i primi scenari quantitativi per simulare conflitti nucleari. Negli anni '70, Pierre Wack porta il metodo alla Royal Dutch Shell, che grazie agli scenari anticipa la crisi petrolifera del 1973 — mentre i concorrenti ne vengono travolti.",
        "Da allora il foresight si e' diffuso nella pianificazione strategica aziendale e governativa. Ma con un limite: e' rimasto un esercizio **narrativo**. Si scrivono storie plausibili sul futuro, si presentano in documenti, si discutono in workshop. Le assunzioni restano implicite, i modelli restano nella testa degli esperti.",
        { type: 'tip', text: "Il foresight non dice cosa succeder\\u00e0. Dice cosa potrebbe succedere, con quale probabilit\\u00e0, e cosa possiamo fare al riguardo." },
      ],
    },
    {
      id: 'foresight-2',
      title: 'Tre modi di pensare il futuro',
      icon: 'git-branch',
      duration: '4 min',
      blocks: [
        "Esistono tre approcci fondamentali per pensare al futuro. Ognuno ha il suo ruolo, i suoi limiti e i suoi strumenti.",
        { type: 'heading', text: 'Previsione (forecasting)' },
        "La previsione cerca di calcolare il valore piu' probabile di una variabile nel futuro. \"Il PIL crescera' dell'1.2% nel 2026.\" E' utile per il breve termine e per sistemi stabili, ma fragile quando intervengono discontinuita' — una pandemia, una guerra, una rivoluzione tecnologica.",
        { type: 'heading', text: 'Proiezione (scenario analysis)' },
        "La proiezione costruisce traiettorie condizionali: \"se il prezzo del carbonio raddoppia, allora...\" Non cerca la risposta giusta, ma esplora lo spazio delle possibilita'. SDL vive qui: ogni scenario e' una proiezione computazionale con incertezza esplicita.",
        { type: 'heading', text: 'Immaginazione (speculative design)' },
        "L'immaginazione si chiede \"e se...?\" senza vincoli quantitativi. E' il territorio della fantascienza, del design speculativo, dell'arte. Non produce numeri, ma amplia l'orizzonte del pensabile.",
        { type: 'highlight', text: "I tre approcci non sono in competizione. Sono complementari. SDL porta il rigore computazionale nella proiezione, rendendo gli scenari verificabili e riproducibili." },
      ],
    },
    {
      id: 'foresight-3',
      title: 'Perche\' gli scenari battono le previsioni',
      icon: 'target',
      duration: '5 min',
      blocks: [
        "Nassim Taleb racconta la storia del tacchino. Ogni giorno il tacchino viene nutrito. Ogni giorno conferma la sua \"previsione\" che domani sara' nutrito di nuovo. Il giorno del Ringraziamento, il tacchino scopre che la serie storica non bastava.",
        { type: 'highlight', text: "Le previsioni puntuali funzionano finche\\u0301 il mondo e' stabile. Quando il mondo cambia — ed e' sempre questione di quando, non di se — falliscono." },
        "I sistemi complessi — clima, economia, demografia, tecnologia — non sono prevedibili con precisione. Sono influenzati da troppe variabili interdipendenti, da feedback loop non lineari, da eventi rari ma trasformativi.",
        "Gli scenari affrontano questa complessita' in modo onesto:",
        { type: 'list', items: [
          "**Esplorano molteplici futuri** invece di scommettere su uno solo",
          "**Rendono esplicite le assunzioni** su cui si basano",
          "**Quantificano l'incertezza** invece di nasconderla",
          "**Si aggiornano** quando arrivano nuovi dati",
        ]},
        "Nel 2020, i paesi che avevano scenari pandemici (come la Corea del Sud) hanno risposto in settimane. Quelli che si basavano su previsioni (\"qui non arrivera'\") hanno impiegato mesi. La differenza tra previsione e scenario puo' essere una questione di vite.",
        { type: 'tip', text: "Uno scenario non e' una previsione ottimista, una base e una pessimista. E' un modello che esplora migliaia di traiettorie possibili, ciascuna con la sua probabilita'." },
      ],
    },
    {
      id: 'foresight-4',
      title: 'Il foresight computazionale',
      icon: 'settings',
      duration: '4 min',
      blocks: [
        "Il foresight tradizionale ha un problema di fondo: e' **analogico**. Le assunzioni restano nella testa degli esperti. I modelli sono narrativi. I risultati non sono riproducibili. Chi legge uno scenario non puo' verificare se le conclusioni seguono dalle premesse.",
        "SDL propone un cambio di paradigma: scenari scritti come **codice eseguibile**. Ogni assunzione e' dichiarata. Ogni fonte e' citata. Ogni proiezione e' calcolata da un motore di simulazione che chiunque puo' eseguire.",
        { type: 'list', items: [
          "**Trasparenza**: le assunzioni sono nel codice, non in una slide",
          "**Riproducibilita'**: chiunque puo' eseguire lo stesso scenario e ottenere gli stessi risultati",
          "**Verificabilita'**: le assunzioni si collegano a dati reali e si auto-monitorano",
          "**Falsificabilita'**: se i dati contraddicono le assunzioni, il sistema avvisa",
        ]},
        { type: 'highlight', text: "Il foresight computazionale non sostituisce l'expertise umana. La rende trasparente, verificabile e condivisibile." },
        "Questo e' il cuore di SDL: non un tool per esperti, ma un linguaggio comune per pensare il futuro insieme. Come il web ha reso la conoscenza del presente accessibile a tutti, SDL vuole fare lo stesso per la conoscenza del futuro.",
      ],
    },
  ],

  quiz: [
    {
      id: 'foresight-q1',
      question: "Qual e' la differenza principale tra previsione e foresight?",
      options: [
        'La previsione usa i computer, il foresight no',
        'La previsione cerca un valore preciso, il foresight esplora piu\' futuri possibili',
        'Il foresight e\' piu\' accurato della previsione',
        'Non c\'e\' differenza, sono sinonimi',
      ],
      correctIndex: 1,
      explanation: "La previsione (forecasting) cerca di calcolare il valore piu' probabile. Il foresight esplora lo spazio dei futuri possibili, mappando traiettorie alternative e le loro probabilita'.",
    },
    {
      id: 'foresight-q2',
      question: 'Chi ha introdotto il metodo degli scenari alla Royal Dutch Shell?',
      options: [
        'Herman Kahn',
        'Nassim Taleb',
        'Pierre Wack',
        'Peter Schwartz',
      ],
      correctIndex: 2,
      explanation: "Pierre Wack porto' il metodo degli scenari alla Shell negli anni '70. Grazie a questo approccio, Shell fu tra le poche compagnie petrolifere preparate alla crisi del 1973.",
    },
    {
      id: 'foresight-q3',
      question: "La \"storia del tacchino\" di Taleb illustra:",
      options: [
        'I limiti della statistica bayesiana',
        'Il pericolo di basarsi solo su serie storiche per prevedere il futuro',
        'L\'importanza dei dati in tempo reale',
        'I vantaggi del machine learning',
      ],
      correctIndex: 1,
      explanation: "La storia del tacchino mostra come le previsioni basate esclusivamente su dati passati possano fallire catastroficamente quando intervengono discontinuita' — eventi che non erano nella serie storica.",
    },
    {
      id: 'foresight-q4',
      question: 'Cosa distingue uno scenario SDL da uno scenario tradizionale?',
      options: [
        'E\' scritto in inglese',
        'Usa l\'intelligenza artificiale',
        'E\' eseguibile: le assunzioni sono esplicite, le proiezioni sono calcolate e verificabili',
        'E\' piu\' sintetico',
      ],
      correctIndex: 2,
      explanation: "Uno scenario SDL e' codice eseguibile. Le assunzioni sono dichiarate nel file, le proiezioni sono calcolate da un motore Monte Carlo, e i risultati sono riproducibili da chiunque.",
    },
    {
      id: 'foresight-q5',
      question: "Quale di questi NON e' un vantaggio del foresight computazionale?",
      options: [
        'Trasparenza delle assunzioni',
        'Garanzia di previsioni corrette',
        'Riproducibilita\' dei risultati',
        'Collegamento a dati reali',
      ],
      correctIndex: 1,
      explanation: "Il foresight computazionale non garantisce previsioni corrette — nessun metodo puo' farlo. Il suo vantaggio e' rendere il processo trasparente, riproducibile e verificabile.",
    },
  ],
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COURSE 2 — Leggere l'incertezza
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const uncertainty: Course = {
  id: 'leggere-incertezza',
  title: "Leggere l'incertezza",
  subtitle: 'Distribuzioni, fan chart e come prendere decisioni senza certezze',
  icon: 'bar-chart',
  color: '#14b8a6',
  track: 1,
  trackLabel: 'Pensare il futuro',

  lessons: [
    {
      id: 'uncertainty-1',
      title: "L'incertezza non e' un difetto",
      icon: 'cloud',
      duration: '4 min',
      blocks: [
        "Quando un esperto dice \"il PIL crescera' tra l'0.8% e l'1.5%\", la reazione comune e': \"ma allora non lo sai?\". Come se l'incertezza fosse un segno di incompetenza. E' il contrario: **l'incertezza e' informazione**.",
        "Un numero preciso senza incertezza e' una bugia educata. Dire \"la crescita sara' dell'1.2%\" implica una certezza che non esiste. Dire \"la crescita sara' tra 0.8% e 1.5% con il 90% di probabilita'\" e' onesto — e infinitamente piu' utile per chi deve decidere.",
        { type: 'highlight', text: "Nascondere l'incertezza non la elimina. La trasferisce su chi prende decisioni senza sapere quanto puo' fidarsi del numero che ha davanti." },
        { type: 'heading', text: 'Due tipi di incertezza' },
        "L'**incertezza aleatoria** e' intrinseca al fenomeno. Non sai che numero uscira' dal dado, e non puoi saperlo nemmeno con informazione perfetta. E' irriducibile.",
        "L'**incertezza epistemica** e' legata alla nostra ignoranza. Non sai quanti abitanti avra' l'Italia nel 2040, ma con migliori modelli e dati potresti ridurre l'incertezza. E' riducibile.",
        "SDL gestisce entrambe: le distribuzioni catturano l'incertezza aleatoria, la calibrazione bayesiana riduce quella epistemica man mano che i dati arrivano.",
      ],
    },
    {
      id: 'uncertainty-2',
      title: 'Come leggere un fan chart',
      icon: 'bar-chart',
      duration: '5 min',
      blocks: [
        "Un fan chart — il grafico a ventaglio che SDL produce per ogni variabile — e' la rappresentazione visiva dell'incertezza nel tempo. Imparare a leggerlo e' la competenza piu' importante che questa Academy puo' insegnarti.",
        { type: 'heading', text: 'Anatomia di un fan chart' },
        { type: 'list', items: [
          '**La linea centrale** (mediana, P50): il valore piu\' rappresentativo. Non il piu\' probabile in assoluto, ma quello che divide a meta\' le traiettorie possibili.',
          '**La banda scura** (P25-P75): il 50% centrale dei risultati. Se la banda e\' stretta, il modello e\' relativamente sicuro. Se e\' larga, c\'e\' molta incertezza.',
          '**La banda chiara** (P5-P95): il 90% dei risultati. Quasi tutto potrebbe cadere qui. Cio\' che resta fuori e\' possibile, ma improbabile.',
          '**La larghezza crescente**: l\'incertezza di solito cresce nel tempo. Piu\' e\' lontano l\'orizzonte, meno sappiamo.',
        ]},
        { type: 'highlight', text: "Un fan chart non mostra \"la previsione\". Mostra lo spazio dei futuri possibili. La larghezza del ventaglio e' informazione, non rumore." },
        { type: 'heading', text: 'Errori comuni di lettura' },
        { type: 'list', items: [
          '**Fissarsi sulla mediana**: la linea centrale non e\' "la previsione". E\' il punto medio di una distribuzione.',
          '**Ignorare le bande**: la larghezza del ventaglio dice quanto e\' affidabile la proiezione. Bande larghe = tanta incertezza.',
          '**Confondere P5-P95 con limiti assoluti**: il 10% dei futuri simulati cade fuori da quelle bande. Eventi estremi sono possibili.',
        ]},
        { type: 'tip', text: "Quando guardi un fan chart, chiediti: \"quanto e' largo il ventaglio?\" e \"quanto velocemente si allarga?\". Queste due domande valgono piu' del numero esatto della mediana." },
      ],
    },
    {
      id: 'uncertainty-3',
      title: "Le forme dell'incertezza",
      icon: 'dice',
      duration: '5 min',
      blocks: [
        "Non tutte le incertezze hanno la stessa forma. La distribuzione che scegli per un'assunzione dice qualcosa di profondo sulla natura del fenomeno che stai modellando.",
        { type: 'heading', text: 'Normale (gaussian)' },
        "La classica campana simmetrica. La usi quando il fenomeno tende a un valore centrale e le deviazioni sono ugualmente probabili in entrambe le direzioni. Esempio: il tasso di crescita del PIL in condizioni stabili. In SDL: **normal(±10%)**.",
        { type: 'heading', text: 'Lognormale' },
        "Simile alla normale ma con una coda destra lunga. I valori non possono essere negativi, e gli estremi positivi sono piu' probabili di quelli negativi. Esempio: il numero di contagi in una pandemia, la crescita della potenza di calcolo. In SDL: **lognormal(±30%)**.",
        { type: 'heading', text: 'Beta' },
        "Vive tra 0 e 1 (o tra 0% e 100%). Perfetta per proporzioni, tassi di adozione, probabilita' di successo. Puo' essere simmetrica o asimmetrica a seconda dei parametri. In SDL: **beta(2, 5)**.",
        { type: 'heading', text: 'Triangolare' },
        "Definita da tre punti: minimo, piu' probabile, massimo. La usi quando hai un'opinione esperta ma pochi dati. In SDL: **triangular(10, 25, 40)**.",
        { type: 'highlight', text: "La scelta della distribuzione non e' un dettaglio tecnico. E' una dichiarazione su come pensi che funzioni il mondo. Una lognormale dice: \"gli estremi positivi sono piu' probabili di quelli negativi.\" Una beta dice: \"il risultato e' una proporzione tra 0 e 1.\"" },
        { type: 'tip', text: "Regola pratica: usa la normale come default, la lognormale per fenomeni che crescono esponenzialmente, la beta per percentuali, la triangolare quando hai solo il giudizio di un esperto." },
      ],
    },
    {
      id: 'uncertainty-4',
      title: "Dall'incertezza alla decisione",
      icon: 'shield',
      duration: '4 min',
      blocks: [
        "L'incertezza non e' un ostacolo alla decisione. E' il contesto in cui le decisioni reali vengono prese. La domanda non e' \"cosa succeder\\u00e0?\", ma \"cosa faccio dato quello che so e quello che non so?\".",
        { type: 'heading', text: 'Decisioni robuste' },
        "Una decisione robusta e' quella che funziona ragionevolmente bene nella maggior parte degli scenari possibili — non solo in quello piu' probabile. E' come portare l'ombrello quando c'e' il 40% di probabilita' di pioggia: non ottimizzi per lo scenario piu' probabile, gestisci il rischio.",
        { type: 'heading', text: 'Il valore dell\'informazione' },
        "Quando il fan chart e' molto largo, significa che un dato in piu' potrebbe cambiare tutto. Questo e' il **valore dell'informazione**: se ridurre l'incertezza su un parametro restringerebbe il ventaglio in modo significativo, allora vale la pena investire per ottenere quel dato.",
        "SDL rende questo visibile attraverso l'analisi di sensitivita': mostra quali parametri influenzano di piu' il risultato. Se il parametro piu' influente e' anche il piu' incerto, hai identificato dove investire nella raccolta dati.",
        { type: 'highlight', text: "Il foresight non serve a eliminare l'incertezza. Serve a capire quale incertezza conta, quale si puo' ridurre, e come decidere nonostante il resto." },
        { type: 'tip', text: "Guarda il tornado chart di uno scenario SDL: il parametro in cima e' quello su cui la tua decisione dipende di piu'. Se puoi ridurre l'incertezza su quel parametro, fallo prima di tutto." },
      ],
    },
  ],

  quiz: [
    {
      id: 'uncertainty-q1',
      question: "Perche' un numero preciso senza incertezza e' problematico?",
      options: [
        'Perche\' e\' sempre sbagliato',
        'Perche\' nasconde quanta fiducia possiamo avere in quel numero',
        'Perche\' i numeri precisi non esistono',
        'Perche\' confonde i non-esperti',
      ],
      correctIndex: 1,
      explanation: "Un numero preciso senza incertezza nasconde un'informazione cruciale: quanto e' affidabile. Chi prende decisioni basandosi su quel numero non sa se fidarsi al 99% o al 50%.",
    },
    {
      id: 'uncertainty-q2',
      question: 'In un fan chart, cosa indica la larghezza del ventaglio?',
      options: [
        'L\'errore del modello',
        'Il grado di incertezza della proiezione',
        'Il numero di simulazioni eseguite',
        'La volatilita\' dei dati storici',
      ],
      correctIndex: 1,
      explanation: "La larghezza del ventaglio rappresenta il grado di incertezza. Un ventaglio stretto indica alta fiducia nella proiezione; uno largo indica che molti esiti sono possibili.",
    },
    {
      id: 'uncertainty-q3',
      question: 'Quale distribuzione useresti per modellare una percentuale di adozione (tra 0% e 100%)?',
      options: [
        'Normale',
        'Lognormale',
        'Beta',
        'Triangolare',
      ],
      correctIndex: 2,
      explanation: "La distribuzione beta e' ideale per modellare proporzioni e percentuali, perche' vive naturalmente tra 0 e 1 (0% e 100%). Puo' assumere forme diverse a seconda dei parametri.",
    },
    {
      id: 'uncertainty-q4',
      question: "Qual e' la differenza tra incertezza aleatoria e epistemica?",
      options: [
        'L\'aleatoria e\' piu\' grande dell\'epistemica',
        'L\'aleatoria e\' intrinseca al fenomeno, l\'epistemica e\' riducibile con piu\' informazioni',
        'L\'epistemica riguarda solo i dati, l\'aleatoria solo i modelli',
        'Non c\'e\' differenza pratica',
      ],
      correctIndex: 1,
      explanation: "L'incertezza aleatoria e' irriducibile (il lancio di un dado), l'epistemica e' riducibile (non sai un valore perche' non hai abbastanza dati, ma potresti ottenerli). SDL gestisce entrambe.",
    },
    {
      id: 'uncertainty-q5',
      question: "Cosa significa che una decisione e' \"robusta\"?",
      options: [
        'E\' basata sulla previsione piu\' probabile',
        'Funziona solo nello scenario migliore',
        'Funziona ragionevolmente bene nella maggior parte degli scenari possibili',
        'E\' stata validata da un esperto',
      ],
      correctIndex: 2,
      explanation: "Una decisione robusta non e' ottimizzata per uno scenario specifico, ma funziona accettabilmente bene in un ampio range di futuri possibili. E' l'approccio razionale sotto incertezza.",
    },
  ],
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COURSE 3 — La matematica degli scenari
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const mathScenarios: Course = {
  id: 'matematica-scenari',
  title: 'La matematica degli scenari',
  subtitle: 'Monte Carlo, Bayes e sensitivity analysis senza formule',
  icon: 'dice',
  color: '#14b8a6',
  track: 1,
  trackLabel: 'Pensare il futuro',

  lessons: [
    {
      id: 'math-1',
      title: 'La nuvola',
      icon: 'cloud',
      duration: '4 min',
      blocks: [
        "Un numero e' un punto. Un numero incerto e' una **nuvola**.",
        "Quando scrivi `value: 3.5%` in SDL, stai piantando un punto preciso: il tasso di crescita e' esattamente il 3.5%. Ma la realta' non funziona cosi'. Il tasso potrebbe essere 3.2%, o 3.8%, o 2.9%. Non lo sai con certezza.",
        "Quando scrivi `uncertainty: normal(±20%)`, quel punto diventa una nuvola. Stai dicendo: \"il valore piu' probabile e' 3.5%, ma potrebbe variare del ±20% secondo una distribuzione normale\". Il motore SDL non usa piu' un singolo numero — pesca dalla nuvola.",
        { type: 'highlight', text: "Una distribuzione di probabilita' e' una nuvola di valori possibili, ciascuno con la sua probabilita'. E' il modo matematico per dire: \"non so esattamente, ma so in che intervallo e con che forma.\"" },
        "Ogni volta che SDL esegue una simulazione, pesca un valore dalla nuvola di ogni assunzione. Valori vicini al centro della nuvola vengono pescati piu' spesso. Valori ai bordi, meno spesso. La forma della nuvola (normale, lognormale, beta...) determina come i valori si distribuiscono.",
        { type: 'tip', text: "Pensa a una distribuzione come a un bersaglio. Le frecce (i campionamenti) cadono piu' spesso al centro, ma qualcuna finisce ai bordi. La forma del bersaglio dipende dalla distribuzione scelta." },
      ],
    },
    {
      id: 'math-2',
      title: 'I 2.000 futuri',
      icon: 'dice',
      duration: '5 min',
      blocks: [
        "La simulazione Monte Carlo — inventata da Stanislaw Ulam e John von Neumann a Los Alamos negli anni '40 — e' un'idea semplice e potente: se non puoi calcolare un risultato esatto, **simulalo migliaia di volte con valori diversi e guarda cosa succede**.",
        "Ecco come funziona in SDL, passo per passo:",
        { type: 'list', items: [
          "**Run 1**: per ogni assunzione, pesca un valore dalla sua distribuzione. Calcola tutte le variabili. Ottieni una traiettoria: un possibile futuro.",
          "**Run 2**: pesca valori diversi (perche\\u0301 sono casuali). Calcola tutto. Ottieni un altro futuro possibile.",
          "**...ripeti 2.000 volte.**",
          "**Risultato**: hai 2.000 traiettorie. Non una previsione, ma una mappa statistica di cio\\u0300 che potrebbe accadere.",
        ]},
        "Le 2.000 traiettorie vengono poi aggregate: il motore calcola mediana, percentili, intervalli di confidenza. Il risultato e' il fan chart che vedi sullo schermo.",
        { type: 'highlight', text: "Il Monte Carlo non e' un algoritmo sofisticato. E' un'idea brutale e geniale: non sai risolvere l'equazione? Simulala migliaia di volte. La statistica fara' il resto." },
        "Perche' 2.000 e non 100? Con piu' simulazioni, la stima diventa piu' stabile. Con 100 run, la mediana puo' oscillare. Con 2.000, si stabilizza. Con 10.000, cambia pochissimo. SDL usa 1.000-5.000 run come default — un buon compromesso tra precisione e velocita'.",
        { type: 'tip', text: "Il nome \"Monte Carlo\" viene dal casino\\u0300 di Monaco. Ulam la chiamo\\u0300 cosi\\u0300 perche\\u0301 il metodo si basa sull'equivalente computazionale di tirare i dadi migliaia di volte." },
      ],
    },
    {
      id: 'math-3',
      title: "L'aggiornamento",
      icon: 'activity',
      duration: '5 min',
      blocks: [
        "Hai un'idea. Arriva un dato. La tua idea si aggiorna. Questa e' l'essenza della **statistica bayesiana** — e di come SDL gestisce la calibrazione.",
        "Esempio concreto: nel tuo scenario, la popolazione italiana nel 2030 ha incertezza `normal(±5%)`. Hai scritto cosi' basandoti su proiezioni ISTAT. Passano due anni. Arrivano i dati reali dal censimento: sono leggermente sotto le tue aspettative.",
        "Cosa succede con `calibrate`? SDL prende la tua distribuzione originale (il **prior** — cio' che credevi prima) e la combina con i dati reali (l'**evidence**). Il risultato e' una nuova distribuzione (il **posterior**) che e' piu' stretta e leggermente spostata verso i dati osservati.",
        { type: 'highlight', text: "La calibrazione bayesiana e' un meccanismo di apprendimento: il modello aggiorna le proprie convinzioni quando arrivano nuove prove. Non butta via l'opinione iniziale, la raffina." },
        { type: 'heading', text: 'Perche\\u0301 \"bayesiana\"?' },
        "Il reverendo Thomas Bayes, nel XVIII secolo, formalizzo' un principio che oggi porta il suo nome: la probabilita' di un'ipotesi si aggiorna in proporzione alla plausibilita' dei dati osservati sotto quell'ipotesi. In pratica: se i dati sono coerenti con le tue assunzioni, la tua fiducia aumenta; se non lo sono, diminuisce e la distribuzione si sposta.",
        "SDL automatizza questo processo. Ogni volta che i dati storici vengono aggiornati, il comando `calibrate` ricalcola la distribuzione. Il fan chart si restringe nel tempo — non perche' l'incertezza sparisca, ma perche' **impari dal presente**.",
        { type: 'tip', text: "Calibrate non modifica le assunzioni: le affina. Il modello mantiene la struttura originale, ma le distribuzioni si adattano ai dati reali. E' la differenza tra cambiare idea e imparare." },
      ],
    },
    {
      id: 'math-4',
      title: 'Chi comanda?',
      icon: 'trending-up',
      duration: '4 min',
      blocks: [
        "Non tutti i parametri di uno scenario contano allo stesso modo. L'**analisi di sensitivita'** rivela quali assunzioni influenzano davvero il risultato — e quali sono rumore di fondo.",
        "SDL la esegue automaticamente. Per ogni parametro con slider, il motore simula lo scenario con il valore minimo e con il valore massimo, mantenendo tutto il resto costante. La differenza tra i due risultati si chiama **swing**: quanto l'output oscilla al variare di quel parametro.",
        { type: 'heading', text: 'Il tornado chart' },
        "I risultati vengono ordinati per swing decrescente in un **tornado chart**: il parametro in cima e' quello che piu' influenza il risultato. Quello in fondo conta poco.",
        { type: 'highlight', text: "Il tornado chart risponde alla domanda piu' importante dell'analisi di scenario: \"su cosa devo concentrarmi?\". Se un parametro domina il risultato, e' li' che vanno le risorse, la ricerca, l'attenzione politica." },
        "Esempio: in uno scenario sulla transizione energetica, scopri che il prezzo del carbonio ha uno swing tre volte maggiore del costo dei pannelli solari. Questo significa che le politiche sul carbon pricing sono molto piu' determinanti degli investimenti in rinnovabili — almeno per il tuo modello.",
        { type: 'tip', text: "Se il parametro piu' influente e' anche il piu' incerto, hai trovato il punto debole del tuo scenario. E' li' che devi investire nella raccolta dati o nell'analisi piu' approfondita." },
      ],
    },
  ],

  quiz: [
    {
      id: 'math-q1',
      question: "In SDL, cosa significa `uncertainty: normal(±20%)`?",
      options: [
        'Il valore ha un errore massimo del 20%',
        'Il valore sara\' sempre entro il ±20%',
        'Il valore e\' una distribuzione normale centrata sul valore dichiarato, con deviazione proporzionale al 20%',
        'Il 20% dei risultati sara\' diverso',
      ],
      correctIndex: 2,
      explanation: "L'annotazione `normal(±20%)` definisce una distribuzione normale (gaussiana) centrata sul valore dichiarato. Il ±20% indica l'ampiezza della distribuzione — non un limite rigido, ma la deviazione standard relativa.",
    },
    {
      id: 'math-q2',
      question: "In una simulazione Monte Carlo con 2.000 run, ogni run:",
      options: [
        'Usa gli stessi valori di input',
        'Pesca valori casuali dalla distribuzione di ogni assunzione e calcola il risultato',
        'Simula 2.000 anni nel futuro',
        'Modifica la struttura del modello',
      ],
      correctIndex: 1,
      explanation: "Ogni run e' un esperimento: il motore pesca casualmente un valore dalla distribuzione di ogni assunzione, propaga i calcoli e ottiene una traiettoria. Ripetendo migliaia di volte, si mappa lo spazio dei risultati possibili.",
    },
    {
      id: 'math-q3',
      question: "Nella calibrazione bayesiana, il \"posterior\" e':",
      options: [
        'La distribuzione originale prima dei dati',
        'I dati reali osservati',
        'La distribuzione aggiornata dopo aver combinato prior e dati reali',
        'L\'errore del modello',
      ],
      correctIndex: 2,
      explanation: "Il posterior e' la distribuzione aggiornata: combina l'opinione iniziale (prior) con i dati osservati (evidence). E' piu' stretta del prior perche' incorpora informazione reale.",
    },
    {
      id: 'math-q4',
      question: "In un tornado chart, il parametro in cima e':",
      options: [
        'Quello con il valore piu\' alto',
        'Quello con l\'incertezza maggiore',
        'Quello che influenza di piu\' il risultato finale',
        'Quello inserito per primo nel modello',
      ],
      correctIndex: 2,
      explanation: "Il tornado chart ordina i parametri per \"swing\" — la differenza nell'output quando il parametro varia dal minimo al massimo. Il parametro in cima e' il piu' influente.",
    },
    {
      id: 'math-q5',
      question: "Perche' si usano 2.000 simulazioni invece di 10?",
      options: [
        'Per rendere il modello piu\' complesso',
        'Perche\\u0301 10 simulazioni non bastano a coprire tutti gli scenari',
        'Perche\\u0301 con piu\' run la stima statistica dei risultati si stabilizza',
        'Per motivi storici legati ai computer degli anni \'40',
      ],
      correctIndex: 2,
      explanation: "Con poche simulazioni, le statistiche aggregate (mediana, percentili) oscillano. Con 2.000 run, si stabilizzano e producono stime affidabili dello spazio dei risultati possibili.",
    },
  ],
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COURSE 4 — Anatomia di uno scenario SDL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const anatomyScenario: Course = {
  id: 'anatomia-scenario',
  title: 'Anatomia di uno scenario',
  subtitle: 'Variabili, assunzioni, grafi causali: la struttura di un file SDL',
  icon: 'flask',
  color: '#0ea5e9',
  track: 2,
  trackLabel: 'Costruire scenari',

  lessons: [
    {
      id: 'anatomy-1',
      title: 'La struttura di un file SDL',
      icon: 'file-text',
      duration: '5 min',
      blocks: [
        "Un file `.sdl` e' un programma che descrive un pezzo di futuro. Ma a differenza di un programma tradizionale, non produce un risultato: produce una **distribuzione di risultati possibili**. Vediamo come e' strutturato.",
        { type: 'heading', text: 'Il blocco scenario' },
        "Tutto inizia con `scenario \"Nome\" { ... }`. Il blocco scenario e' il contenitore principale. Definisce i metadati e contiene tutto il resto: assunzioni, variabili, parametri, impatti, regole di simulazione.",
        { type: 'heading', text: 'Metadati temporali' },
        "Ogni scenario ha un **timeframe** (`2025 -> 2040`) e una **resolution** (`yearly`, `monthly`, `weekly`, `daily`). Il timeframe definisce l'orizzonte della proiezione; la resolution determina quanti punti intermedi il motore calcola.",
        { type: 'tip', text: "La resolution influenza la precisione e la velocita'. Per scenari a 20+ anni, `yearly` e' quasi sempre sufficiente. Per scenari a 2-3 anni su mercati finanziari, potresti volere `monthly`." },
        { type: 'heading', text: 'Metadati di presentazione' },
        "SDL e' **self-contained**: un singolo file descrive dati, modello, incertezza *e* come presentare lo scenario all'utente. I campi `subtitle`, `category`, `icon`, `color`, `difficulty` dicono al viewer come renderizzare la card e l'interfaccia, senza bisogno di configurazione esterna.",
        { type: 'highlight', text: "Questa e' una scelta di design precisa: uno scenario SDL e' un documento completo. Chiunque abbia il file puo' visualizzarlo, simularlo e interagirci. Non servono metadati separati, configurazioni, o viewer specifici." },
      ],
    },
    {
      id: 'anatomy-2',
      title: 'Assunzioni, variabili, parametri',
      icon: 'settings',
      duration: '6 min',
      blocks: [
        "In SDL esistono tre tipi di blocchi fondamentali per modellare un fenomeno. Capire la differenza tra loro e' essenziale per costruire scenari solidi.",
        { type: 'heading', text: 'Assumption' },
        "Un'**assunzione** (`assumption`) e' un valore che il modellatore dichiara come dato di partenza. Non e' calcolato dal modello — e' un input. Ogni assunzione dovrebbe avere una `source` (la fonte) e un'`uncertainty` (quanto sei sicuro).",
        "Le assunzioni sono il cuore epistemologico dello scenario: rendono esplicito cio' che normalmente resta implicito. \"Il tasso di crescita sara' del 3.5%\" non e' un fatto — e' un'assunzione. SDL ti obbliga a dichiararlo come tale.",
        { type: 'heading', text: 'Variable' },
        "Una **variabile** (`variable`) e' un valore che evolve nel tempo. Ha una timeseries (punti temporali noti), un modello di interpolazione (`linear`, `exponential`, `logistic`, `spline`) e puo' dipendere da altre variabili o assunzioni. E' il blocco da cui il motore calcola le traiettorie.",
        { type: 'heading', text: 'Parameter' },
        "Un **parametro** (`parameter`) e' un valore interattivo. A differenza dell'assunzione, il parametro e' pensato per essere modificato dall'utente: ha un `range`, uno `step`, un `control` (slider, toggle, dropdown). E' cio' che rende lo scenario interattivo.",
        { type: 'highlight', text: "La distinzione e' importante: le assunzioni sono premesse analitiche (cosa credi), le variabili sono proiezioni (cosa calcoli), i parametri sono leve (cosa l'utente puo' esplorare)." },
        { type: 'tip', text: "Regola pratica: se un valore ha una fonte autorevole e non dovrebbe cambiare spesso → assumption. Se evolve nel tempo ed e' calcolato → variable. Se vuoi che l'utente lo modifichi → parameter." },
      ],
    },
    {
      id: 'anatomy-3',
      title: 'Il grafo causale',
      icon: 'git-branch',
      duration: '5 min',
      blocks: [
        "Ogni scenario SDL ha, implicitamente, un **grafo causale**: una rete di dipendenze che il motore risolve automaticamente. E' la struttura che dice \"se cambia X, allora cambia anche Y\".",
        { type: 'heading', text: 'depends_on' },
        "Quando una variabile dichiara `depends_on: growth_rate`, sta dicendo che il suo valore dipende dal valore di `growth_rate`. Il motore SDL costruisce un grafo diretto aciclico (DAG) da queste dichiarazioni e lo risolve nell'ordine giusto.",
        "Se `population` dipende da `growth_rate`, e `gdp_per_capita` dipende da `population` e `gdp`, il motore calcola prima `growth_rate`, poi `population`, poi `gdp_per_capita`. L'ordine e' determinato automaticamente dalla topologia del grafo.",
        { type: 'highlight', text: "Il grafo causale e' cio' che trasforma un insieme di numeri in un modello. Senza dipendenze, le variabili sono indipendenti. Con le dipendenze, una perturbazione si propaga attraverso il sistema — esattamente come nella realta'." },
        { type: 'heading', text: 'Propagazione dell\'incertezza' },
        "La potenza del grafo causale emerge con Monte Carlo. In ogni run, il motore pesca un valore casuale per ogni assunzione e lo propaga attraverso il grafo. L'incertezza si **compone**: se `growth_rate` e' incerto e `population` dipende da esso, anche `population` diventa incerto — e l'incertezza si amplifica lungo la catena.",
        "Questo e' il motivo per cui scenari con catene causali lunghe hanno fan chart piu' larghi: l'incertezza si accumula. Non e' un bug — e' informazione preziosa su quanto il tuo modello sia sensibile alle assunzioni iniziali.",
        { type: 'tip', text: "Il validator SDL verifica automaticamente che il grafo sia aciclico (niente dipendenze circolari) e che tutte le dipendenze dichiarate esistano. Se il grafo ha un ciclo, lo scenario non compila." },
      ],
    },
    {
      id: 'anatomy-4',
      title: 'Branch, impatti e simulazione',
      icon: 'target',
      duration: '5 min',
      blocks: [
        { type: 'heading', text: 'Branch: scenari che si biforcano' },
        "Un `branch` definisce un percorso condizionale: \"se questa condizione si verifica durante la simulazione, allora...\" I branch permettono di modellare discontinuita': un cambio di policy, un evento geopolitico, un breakthrough tecnologico.",
        "Ogni branch ha una condizione (`when`), una probabilita', e un set di modifiche che si applicano se la condizione e' soddisfatta. Il motore Monte Carlo valuta la condizione in ogni run e segue il branch corrispondente.",
        { type: 'heading', text: 'Impact: valori derivati' },
        "Un `impact` e' un valore calcolato da altri. Ha una `formula` che combina variabili e parametri. Ad esempio: `formula: green_jobs - fossil_jobs` calcola l'impatto netto sull'occupazione. Gli impatti non hanno incertezza propria — la ereditano dalle variabili da cui dipendono.",
        "Gli impatti servono a comunicare: non sempre il dato grezzo (\"65 milioni di abitanti\") e' significativo. L'impatto (\"5 milioni in piu' rispetto a oggi\") racconta una storia.",
        { type: 'heading', text: 'Simulate: come girare il motore' },
        "Il blocco `simulate { runs: 2000; method: monte_carlo }` dice al motore quante simulazioni eseguire e con quale metodo. Ogni run e' un esperimento indipendente. Il risultato aggregato e' un quadro statistico completo.",
        { type: 'list', items: [
          '**runs**: quante simulazioni (1000-5000 e\' il range tipico)',
          '**method**: `monte_carlo` (default), `latin_hypercube` (campionamento piu\' uniforme)',
          '**output**: `distribution` (default) o `timeseries`',
          '**percentiles**: quali percentili calcolare — tipicamente `[5, 25, 50, 75, 95]`',
        ]},
        { type: 'highlight', text: "Un file SDL completo — con scenario, assunzioni, variabili, parametri, impatti, branch e simulate — e' un modello di foresight autosufficiente. Un documento che chiunque puo' eseguire, verificare e modificare." },
      ],
    },
  ],

  quiz: [
    {
      id: 'anatomy-q1',
      question: "Qual e' la differenza tra un'assunzione e un parametro in SDL?",
      options: [
        'L\'assunzione ha incertezza, il parametro no',
        'L\'assunzione e\' un input analitico con fonte, il parametro e\' una leva interattiva per l\'utente',
        'Il parametro e\' calcolato dal motore, l\'assunzione no',
        'Non c\'e\' differenza, sono sinonimi',
      ],
      correctIndex: 1,
      explanation: "L'assunzione e' una premessa analitica del modellatore, con fonte e incertezza. Il parametro e' pensato per essere esplorato dall'utente tramite slider, toggle o dropdown.",
    },
    {
      id: 'anatomy-q2',
      question: 'A cosa serve `depends_on` in una variabile SDL?',
      options: [
        'A importare dati da un\'API esterna',
        'A dichiarare che la variabile dipende da un\'altra, costruendo il grafo causale',
        'A definire l\'ordine di visualizzazione nel fan chart',
        'A collegare la variabile a un parametro interattivo',
      ],
      correctIndex: 1,
      explanation: "`depends_on` dichiara una dipendenza causale. Il motore SDL usa queste dichiarazioni per costruire un grafo diretto aciclico e calcolare le variabili nell'ordine corretto.",
    },
    {
      id: 'anatomy-q3',
      question: "Perche' scenari con catene causali lunghe hanno fan chart piu' larghi?",
      options: [
        'Perche\' hanno piu\' variabili',
        'Perche\' l\'incertezza si accumula propagandosi attraverso le dipendenze',
        'Perche\' usano piu\' simulazioni Monte Carlo',
        'Per un errore nel motore di simulazione',
      ],
      correctIndex: 1,
      explanation: "L'incertezza si compone lungo la catena di dipendenze. Se A e' incerto e B dipende da A, anche B sara' incerto — e la sua incertezza sara' almeno pari a quella di A, spesso maggiore.",
    },
    {
      id: 'anatomy-q4',
      question: 'Cosa succede in un branch durante una simulazione Monte Carlo?',
      options: [
        'Il motore sceglie sempre il branch piu\' probabile',
        'Il motore valuta la condizione in ogni run e segue il path corrispondente',
        'Tutti i branch vengono eseguiti contemporaneamente',
        'I branch vengono ignorati durante la simulazione',
      ],
      correctIndex: 1,
      explanation: "In ogni run Monte Carlo, il motore valuta la condizione del branch. Se e' soddisfatta (in base alla probabilita' e ai valori pescati), segue quel path. Run diversi possono seguire branch diversi.",
    },
    {
      id: 'anatomy-q5',
      question: "Perche' SDL include metadati di presentazione (icon, color, subtitle) nello stesso file del modello?",
      options: [
        'Per motivi estetici',
        'Perche\' il file sia autosufficiente: chiunque lo abbia puo\' visualizzarlo senza configurazione esterna',
        'Per compatibilita\' con PowerPoint',
        'E\' un requisito tecnico del parser',
      ],
      correctIndex: 1,
      explanation: "SDL e' progettato per essere self-contained. Un singolo file .sdl contiene dati, modello, incertezza e presentazione. Chiunque abbia il file puo' renderizzare l'intera interfaccia interattiva.",
    },
  ],
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COURSE 5 — Dati reali e monitoraggio
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const liveData: Course = {
  id: 'dati-reali',
  title: 'Dati reali e monitoraggio',
  subtitle: 'Bind, watch, calibrate: scenari che si aggiornano con il mondo reale',
  icon: 'link',
  color: '#0ea5e9',
  track: 2,
  trackLabel: 'Costruire scenari',

  lessons: [
    {
      id: 'live-1',
      title: 'Bind — collegare le assunzioni ai dati',
      icon: 'link',
      duration: '5 min',
      blocks: [
        "Uno scenario tradizionale ha un problema temporale: nel momento in cui viene scritto, inizia a invecchiare. Le assunzioni si basano su dati di ieri. Domani quei dati saranno obsoleti.",
        "Il blocco `bind` in SDL risolve questo problema collegando un'assunzione a una fonte dati reale — un'API pubblica, un dataset aggiornato periodicamente, un indicatore istituzionale.",
        { type: 'list', items: [
          '**source**: l\'URL dell\'API o del dataset',
          '**refresh**: ogni quanto aggiornare (`daily`, `weekly`, `monthly`, `yearly`)',
          '**field**: quale campo estrarre dalla risposta',
          '**fallback**: il valore da usare se l\'API non risponde',
        ]},
        { type: 'highlight', text: "Con `bind`, uno scenario SDL non e' una fotografia: e' un organismo vivente. Le sue assunzioni si aggiornano automaticamente quando il mondo cambia." },
        "Le fonti piu' comuni sono World Bank, Eurostat, OECD, IPCC, APIs nazionali. SDL Pulse — il modulo di data binding — gestisce le connessioni, il caching, il fallback e la normalizzazione dei dati.",
        { type: 'tip', text: "Sempre definire un `fallback`. Le API esterne possono essere offline, cambiare formato, o avere limiti di rate. Il fallback garantisce che lo scenario funzioni anche senza connessione." },
      ],
    },
    {
      id: 'live-2',
      title: 'Watch — monitorare le deviazioni',
      icon: 'eye',
      duration: '5 min',
      blocks: [
        "Collegare i dati non basta. Serve sapere **quando la realta' diverge dalle assunzioni**. Il blocco `watch` fa esattamente questo: definisce soglie che, se superate, generano allarmi.",
        "La logica e' semplice ma potente:",
        { type: 'list', items: [
          '`warn when: actual < assumed * 0.7` → avviso giallo se il dato reale e\' sotto il 70% dell\'assunto',
          '`error when: actual < assumed * 0.5` → allarme rosso se e\' sotto il 50%',
        ]},
        "Le soglie sono espressioni che confrontano `actual` (il dato reale da bind) con `assumed` (il valore dichiarato nell'assunzione). Puoi definire quante soglie vuoi, con livelli diversi di gravita'.",
        { type: 'heading', text: 'Perche\' il monitoraggio conta' },
        "Senza watch, uno scenario puo' diventare silenziosamente obsoleto. L'assunzione diceva \"crescita al 3%\" ma la realta' mostra 1.5%, e nessuno se ne accorge. Il modello continua a proiettare un futuro basato su premesse false.",
        { type: 'highlight', text: "Watch trasforma lo scenario da documento passivo a sistema di allerta. Non aspetta che qualcuno lo rilegga — segnala attivamente quando le sue fondamenta vacillano." },
        "Nell'interfaccia Rebica, i watch attivi vengono mostrati come badge sulla card dello scenario: un punto giallo per warn, rosso per error. L'utente vede immediatamente quali scenari richiedono attenzione.",
        { type: 'tip', text: "Non mettere soglie troppo strette: generano troppi falsi allarmi. Non troppo larghe: perdono il senso. Una regola pratica: warn al ±30%, error al ±50% del valore assunto." },
      ],
    },
    {
      id: 'live-3',
      title: "Calibrate — l'apprendimento del modello",
      icon: 'activity',
      duration: '5 min',
      blocks: [
        "Bind ti da' i dati. Watch ti avvisa quando qualcosa non va. **Calibrate** va oltre: aggiorna automaticamente le distribuzioni di incertezza usando i dati storici.",
        "Immagina di aver scritto nel 2024 uno scenario demografico con `uncertainty: normal(±5%)` sulla popolazione. Passano due anni. I dati ISTAT del 2025 confermano che il trend e' vicino alle tue assunzioni. Calibrate restringe la distribuzione: la tua incertezza era giustificata, ma ora puoi essere piu' preciso.",
        { type: 'list', items: [
          '**historical**: l\'URL dei dati storici',
          '**method**: `bayesian_update` (default), `maximum_likelihood`, `ensemble`',
          '**window**: quanti anni di dati usare (`5y`, `10y`)',
          '**prior**: la distribuzione iniziale da aggiornare',
        ]},
        { type: 'heading', text: 'Come funziona in pratica' },
        "Il metodo `bayesian_update` prende la distribuzione originale (il prior) e la combina con i dati osservati usando il teorema di Bayes. Se i dati confermano le assunzioni, la distribuzione si restringe (piu' fiducia). Se li contraddicono, si sposta e si allarga (meno fiducia nella direzione originale).",
        { type: 'highlight', text: "Calibrate e' il meccanismo che rende gli scenari SDL genuinamente scientifici: formulano ipotesi, le confrontano con i dati, e si aggiornano. Non e' foresight narrativo — e' foresight sperimentale." },
        { type: 'tip', text: "Il window e' importante: troppo corto e il modello overfitta ai dati recenti. Troppo lungo e incorpora periodi storici che potrebbero non essere piu' rilevanti. Per scenari demografici, 10y e' un buon default. Per scenari tecnologici, 5y o meno." },
      ],
    },
    {
      id: 'live-4',
      title: 'Da scenario statico a scenario vivente',
      icon: 'zap',
      duration: '4 min',
      blocks: [
        "Mettiamo tutto insieme. Uno scenario SDL con bind, watch e calibrate non e' piu' un documento: e' un **sistema vivente** che:",
        { type: 'list', items: [
          'Si collega ai dati reali e si aggiorna automaticamente (**bind**)',
          'Avvisa quando le sue premesse non reggono piu\' (**watch**)',
          'Migliora le sue stime man mano che i dati si accumulano (**calibrate**)',
        ]},
        { type: 'heading', text: 'Il ciclo virtuoso' },
        "Lo scenario viene scritto con assunzioni esplicite e fonti citate. Bind lo collega ai dati. Watch lo monitora. Calibrate lo affina. Il fan chart si restringe nel tempo — non perche' l'incertezza sparisca, ma perche' il modello impara.",
        "Se un watch scatta (warn o error), l'analista sa esattamente cosa e' cambiato. Puo' aggiornare l'assunzione, ricalcolare lo scenario, e comunicare il cambiamento in modo trasparente.",
        { type: 'highlight', text: "Questo ciclo — scrivere, collegare, monitorare, calibrare — e' cio' che distingue SDL da qualsiasi altro approccio al foresight. Non e' un report che invecchia. E' un modello che vive." },
        { type: 'heading', text: 'Dati storici sui fan chart' },
        "Quando un bind fornisce dati storici, Rebica li sovrappone al fan chart come punti o linee. L'utente puo' vedere visivamente se il passato conferma o smentisce le proiezioni del modello. E' la forma piu' diretta di validazione: il grafico mostra se le assunzioni reggono alla prova dei fatti.",
        { type: 'tip', text: "Consiglio di progettazione: inizia con uno scenario senza bind/watch/calibrate. Fallo funzionare. Poi aggiungi bind per le assunzioni chiave, watch per le soglie critiche, e calibrate per le variabili con dati storici abbondanti. Un passo alla volta." },
      ],
    },
  ],

  quiz: [
    {
      id: 'live-q1',
      question: "A cosa serve il campo `fallback` nel blocco bind?",
      options: [
        'A definire il valore massimo dell\'assunzione',
        'A fornire un valore di riserva se l\'API non risponde',
        'A calibrare la distribuzione di incertezza',
        'A collegare l\'assunzione a un parametro',
      ],
      correctIndex: 1,
      explanation: "Il fallback garantisce che lo scenario funzioni anche quando la fonte dati esterna e' offline o non raggiungibile. E' una misura di resilienza fondamentale.",
    },
    {
      id: 'live-q2',
      question: 'Come funziona la regola `warn when: actual < assumed * 0.7`?',
      options: [
        'Genera un allarme se il valore assunto e\' troppo alto',
        'Genera un avviso se il dato reale e\' inferiore al 70% del valore assunto',
        'Modifica automaticamente l\'assunzione al 70%',
        'Disattiva l\'assunzione se il dato reale e\' basso',
      ],
      correctIndex: 1,
      explanation: "La regola confronta il dato reale (`actual`, da bind) con l'assunzione (`assumed`). Se il reale scende sotto il 70% dell'assunto, scatta un avviso di livello `warn`.",
    },
    {
      id: 'live-q3',
      question: "Nel metodo `bayesian_update`, cosa succede se i dati reali confermano le assunzioni?",
      options: [
        'La distribuzione si allarga',
        'La distribuzione rimane uguale',
        'La distribuzione si restringe (piu\' fiducia)',
        'Il modello ignora i dati',
      ],
      correctIndex: 2,
      explanation: "Se i dati confermano le assunzioni, la distribuzione posterior si restringe: il modello \"ha piu' fiducia\" nella stima originale, perche' i dati la supportano.",
    },
    {
      id: 'live-q4',
      question: "Quale sequenza descrive correttamente il ciclo di uno scenario SDL vivente?",
      options: [
        'Scrivere → Pubblicare → Dimenticare',
        'Scrivere → Collegare (bind) → Monitorare (watch) → Calibrare (calibrate)',
        'Collegare → Scrivere → Simulare → Cancellare',
        'Calibrare → Scrivere → Monitorare → Collegare',
      ],
      correctIndex: 1,
      explanation: "Il ciclo virtuoso: scrivi lo scenario con assunzioni esplicite, collegalo ai dati reali (bind), monitora le deviazioni (watch), e affina le distribuzioni (calibrate). Il modello migliora nel tempo.",
    },
    {
      id: 'live-q5',
      question: "Perche' il parametro `window` nella calibrazione e' importante?",
      options: [
        'Determina la dimensione del fan chart',
        'Controlla quanti anni di dati storici usare per l\'aggiornamento',
        'Definisce l\'orizzonte temporale dello scenario',
        'Imposta la frequenza di refresh dell\'API',
      ],
      correctIndex: 1,
      explanation: "Il window definisce quanti anni di dati storici alimentano la calibrazione. Troppo corto: overfitting ai dati recenti. Troppo lungo: include periodi non piu' rilevanti.",
    },
  ],
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COURSE 6 — Scenari settoriali
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const sectors: Course = {
  id: 'scenari-settoriali',
  title: 'Scenari settoriali',
  subtitle: 'Clima, demografia, AI, geopolitica: il foresight applicato ai grandi temi',
  icon: 'globe',
  color: '#0ea5e9',
  track: 2,
  trackLabel: 'Costruire scenari',

  lessons: [
    {
      id: 'sector-1',
      title: 'Clima ed energia',
      icon: 'sun',
      duration: '5 min',
      blocks: [
        "La transizione energetica e' forse il caso d'uso piu' naturale per il foresight computazionale. Le variabili sono molte, le dipendenze complesse, le incertezze enormi, e le decisioni politiche hanno effetti su decenni.",
        { type: 'heading', text: 'Le variabili chiave' },
        "Uno scenario energetico tipico modella la quota di rinnovabili nel mix energetico, le emissioni di CO2, il prezzo del carbonio, gli investimenti in infrastrutture, e l'occupazione nel settore. Queste variabili sono profondamente interconnesse: il prezzo del carbonio influenza gli investimenti, che influenzano la quota rinnovabili, che influenza le emissioni.",
        { type: 'highlight', text: "Il grafo causale di uno scenario energetico e' un buon esempio di perche' i metodi narrativi non bastano: le interazioni tra variabili sono troppo complesse per essere tenute \"a mente\". Serve un motore che le propaghi correttamente." },
        { type: 'heading', text: 'Le incertezze specifiche' },
        "In ambito energia, le incertezze piu' rilevanti sono spesso di tipo **politico** (il prezzo del carbonio dipende dalle decisioni dell'UE) e **tecnologico** (il costo dello storage puo' crollare con una breakthrough). Le distribuzioni lognormali sono comuni per i costi tecnologici — possono calare molto piu' rapidamente del previsto, ma non aumentare altrettanto.",
        { type: 'heading', text: 'Bind e calibrate in azione' },
        "Lo scenario `green-transition-italy.sdl` nella demo usa bind per collegare la quota rinnovabili ai dati Eurostat e il prezzo del carbonio all'EU ETS. Watch avvisa se le emissioni si discostano dal target. Calibrate affina le stime usando 10 anni di dati storici.",
        { type: 'tip', text: "Per scenari climatici, usa spline interpolation invece di linear: le transizioni energetiche non sono lineari — hanno curve a S tipiche dell'adozione tecnologica." },
      ],
    },
    {
      id: 'sector-2',
      title: 'Demografia e societa\'',
      icon: 'users',
      duration: '5 min',
      blocks: [
        "La demografia e' \"il futuro piu' prevedibile\": le persone che avranno 50 anni nel 2050 sono gia' nate. Ma anche qui le incertezze sono reali e consequenziali — fertilita', migrazione, aspettativa di vita, struttura per eta' della popolazione.",
        { type: 'heading', text: 'L\'inverno demografico europeo' },
        "Lo scenario `demographic-winter-europe.sdl` modella un orizzonte lungo (35 anni) con distribuzioni triangolari per il tasso di fertilita' — ideali quando hai stime esperte (minimo, piu' probabile, massimo) ma pochi dati storici sulla traiettoria futura.",
        "Il modello usa un timeframe 2025-2060, con variabili per popolazione totale, tasso di fertilita', saldo migratorio, rapporto di dipendenza. Le dipendenze causali collegano fertilita' e migrazione alla popolazione, e la popolazione al rapporto di dipendenza.",
        { type: 'highlight', text: "I scenari demografici hanno un vantaggio epistemologico: sono falsificabili a breve termine. Ogni anno arrivano i dati ISTAT o Eurostat. Calibrate puo' aggiornare le distribuzioni rapidamente." },
        { type: 'heading', text: 'Implicazioni politiche' },
        "Il fan chart di uno scenario demografico mostra visivamente qualcosa che i numeri puntuali nascondono: quanto e' ampio l'intervallo di futuri possibili. Un policy maker che vede \"tra 50 e 65 milioni di abitanti nel 2060\" capisce l'urgenza in modo diverso rispetto a chi legge \"57 milioni\".",
        { type: 'tip', text: "Per scenari demografici lunghi (30+ anni), usa percentili ampi [5, 25, 50, 75, 95] e dichiara esplicitamente un livello di confidenza basso (0.4-0.6). L'onesta' sull'incertezza e' piu' preziosa della falsa precisione." },
      ],
    },
    {
      id: 'sector-3',
      title: 'AI e governance',
      icon: 'bot',
      duration: '5 min',
      blocks: [
        "L'intelligenza artificiale rappresenta una sfida unica per il foresight: e' un dominio dove le discontinuita' sono la norma, le distribuzioni hanno code grosse, e le decisioni regolatorie possono cambiare tutto in mesi.",
        { type: 'heading', text: 'Modellare l\'incertezza tecnologica' },
        "Per la crescita della potenza di calcolo o il numero di breakthrough AI, la distribuzione lognormale e' la scelta naturale. I valori non possono essere negativi (non puoi avere meno di zero breakthrough), e le sorprese positive sono piu' probabili di quelle negative — ma quando arrivano, sono molto grandi.",
        "Lo scenario `ai-energy-demand-2035.sdl` usa lognormal per la crescita della domanda computazionale. Il fan chart risultante ha una coda destra lunga: la domanda *potrebbe* esplodere ben oltre le aspettative centrali.",
        { type: 'heading', text: 'L\'AI Act e la regolamentazione' },
        "Lo scenario `ai-act-compliance-eu.sdl` modella l'enforcement dell'AI Act europeo usando distribuzioni beta — ideali per proporzioni (\"quale percentuale di aziende sara' compliant?\") con alta incertezza. I branch modellano scenari di enforcement forte vs debole.",
        { type: 'highlight', text: "Scenari sulla regolamentazione AI mostrano il potere dei branch in SDL: la stessa base di variabili puo' evolvere in direzioni radicalmente diverse a seconda delle decisioni politiche. Il fan chart include tutte le traiettorie." },
        { type: 'tip', text: "Per scenari AI e tecnologia, dichiarare una confidenza molto bassa (0.2-0.4) e' onesto e utile. Chiunque affermi di sapere come sara' l'AI tra 10 anni sta vendendo certezze che non ha." },
      ],
    },
    {
      id: 'sector-4',
      title: 'Progettare il tuo scenario',
      icon: 'pen-line',
      duration: '6 min',
      blocks: [
        "Hai i concetti. Hai visto gli esempi. Ora vediamo il processo per creare uno scenario da zero.",
        { type: 'heading', text: 'Passo 1: Definire la domanda' },
        "Ogni buono scenario parte da una domanda precisa. Non \"come sara' il futuro dell'energia\" (troppo vaga), ma \"quale sara' la quota di rinnovabili nel mix energetico italiano al 2040?\" La domanda definisce le variabili di output, l'orizzonte temporale, e il perimetro geografico.",
        { type: 'heading', text: 'Passo 2: Mappare le variabili' },
        "Identifica le 3-7 variabili chiave. Meno sono, meglio e': ogni variabile aggiunge complessita' e incertezza. Per ciascuna, chiediti: e' un input (assumption), un'evoluzione temporale (variable), o una leva interattiva (parameter)?",
        { type: 'heading', text: 'Passo 3: Costruire il grafo' },
        "Disegna le dipendenze: \"la quota rinnovabili dipende dal prezzo del carbonio e dagli investimenti\". Assicurati che il grafo sia aciclico — niente dipendenze circolari. Se ne trovi, probabilmente stai confondendo una correlazione con una causalita'.",
        { type: 'heading', text: 'Passo 4: Quantificare l\'incertezza' },
        "Per ogni assunzione, chiediti: quanto sono sicuro? Se la fonte e' autorevole e recente, ±10-15%. Se e' una stima esperta su un tema volatile, ±30-50%. Scegli la distribuzione che meglio cattura la forma dell'incertezza.",
        { type: 'heading', text: 'Passo 5: Iterare' },
        "Lancia la simulazione. Guarda il fan chart. Se e' troppo stretto, probabilmente stai sottostimando l'incertezza. Se e' troppo largo, forse hai troppe variabili incerte o catene causali troppo lunghe. Semplifica, affina, ripeti.",
        { type: 'highlight', text: "Il processo non e' lineare. Tra il passo 1 e il passo 5 tornerai indietro molte volte. E' normale: un buon scenario e' il risultato di iterazioni, non di una stesura unica." },
        { type: 'tip', text: "Inizia sempre con la versione piu' semplice possibile: 2-3 variabili, niente branch, uncertainty conservative. Poi aggiungi complessita' solo quando capisci che serve. Un modello semplice che capisci e' meglio di uno complesso che non capisci." },
      ],
    },
  ],

  quiz: [
    {
      id: 'sector-q1',
      question: "Perche' la distribuzione lognormale e' adatta per modellare la crescita della domanda computazionale AI?",
      options: [
        'Perche\' e\' la distribuzione piu\' semplice',
        'Perche\' i valori non possono essere negativi e le sorprese positive sono piu\' probabili di quelle negative',
        'Perche\' l\'AI cresce sempre in modo lineare',
        'Per convenzione nel settore tecnologico',
      ],
      correctIndex: 1,
      explanation: "La lognormale e' ideale per variabili che non possono essere negative e che hanno una coda destra lunga: le sorprese positive (crescita esplosiva) sono piu' probabili di quelle negative.",
    },
    {
      id: 'sector-q2',
      question: "Qual e' il primo passo per progettare uno scenario SDL?",
      options: [
        'Scegliere le distribuzioni di incertezza',
        'Definire una domanda precisa',
        'Collegare le API con bind',
        'Lanciare la simulazione Monte Carlo',
      ],
      correctIndex: 1,
      explanation: "Tutto parte dalla domanda. Una domanda precisa definisce le variabili, l'orizzonte temporale, il perimetro. Senza domanda chiara, il modello rischia di essere vago e incoerente.",
    },
    {
      id: 'sector-q3',
      question: "Perche' per scenari demografici lunghi conviene dichiarare un livello di confidenza basso?",
      options: [
        'Perche\' i dati demografici sono inaffidabili',
        'Per rendere il fan chart piu\' stretto',
        'Perche\' l\'incertezza su 30+ anni e\' genuinamente alta, e dichiararlo e\' piu\' onesto e utile',
        'Per motivi di performance computazionale',
      ],
      correctIndex: 2,
      explanation: "Su orizzonti di 30+ anni, l'incertezza e' intrinsecamente alta. Dichiararlo esplicitamente (confidenza 0.4-0.6) e' piu' onesto e utile di una falsa precisione che nessuno puo' giustificare.",
    },
    {
      id: 'sector-q4',
      question: "Nello scenario sull'AI Act, perche' si usa la distribuzione beta per l'enforcement?",
      options: [
        'Perche\' la beta e\' la piu\' precisa',
        'Perche\' modella proporzioni (0-100%) con alta incertezza sulla forma',
        'Perche\' l\'AI Act e\' un regolamento europeo',
        'Perche\' la beta ha code piu\' grosse',
      ],
      correctIndex: 1,
      explanation: "La distribuzione beta vive naturalmente tra 0 e 1 (0% e 100%), ed e' ideale per modellare proporzioni come \"quale percentuale di aziende sara' compliant\". I parametri permettono di esprimere diversi gradi di asimmetria e incertezza.",
    },
    {
      id: 'sector-q5',
      question: "Se il tuo fan chart e' troppo largo, cosa dovresti fare?",
      options: [
        'Aumentare il numero di simulazioni',
        'Ridurre artificialmente l\'incertezza delle assunzioni',
        'Semplificare il modello: meno variabili, catene causali piu\' corte, incertezze piu\' realistiche',
        'Cambiare la distribuzione da normale a uniforme',
      ],
      correctIndex: 2,
      explanation: "Un fan chart troppo largo spesso indica un modello troppo complesso o incertezze sovrastimate. La soluzione e' semplificare: meno variabili, dipendenze piu' dirette, e incertezze calibrate con piu' cura.",
    },
  ],
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COURSE 7 — SDL da zero
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const sdlFromScratch: Course = {
  id: 'sdl-da-zero',
  title: 'SDL da zero',
  subtitle: 'Scrivere il primo scenario, passo per passo, fino alla simulazione',
  icon: 'pen-line',
  color: '#a855f7',
  track: 3,
  trackLabel: 'Padroneggiare SDL',

  lessons: [
    {
      id: 'scratch-1',
      title: 'Il tuo primo file SDL',
      icon: 'file-text',
      duration: '6 min',
      blocks: [
        "Basta teoria. Scriviamo uno scenario. Apri l'editor di Rebica e comincia con il blocco piu' semplice possibile:",
        { type: 'highlight', text: "`scenario \"Il mio primo scenario\" { timeframe: 2025 -> 2035; resolution: yearly }` — Questo e' gia' un file SDL valido. Non fa nulla di utile, ma compila." },
        { type: 'heading', text: 'Aggiungere i metadati' },
        "Diamo al nostro scenario un'identita'. I metadati di presentazione sono opzionali ma rendono lo scenario navigabile nell'interfaccia: `subtitle`, `category`, `icon`, `color`, `difficulty`.",
        { type: 'heading', text: 'La prima assunzione' },
        "Aggiungiamo un'assunzione: il tasso di crescita annuale di qualcosa — la popolazione, il PIL, le emissioni. Il blocco `assumption` dichiara un valore, una fonte, e un'incertezza.",
        "La struttura e': `assumption nome { value: 2.5%; source: \"ISTAT, 2024\"; uncertainty: normal(±15%) }`. Ora lo scenario ha una premessa esplicita, con fonte e margine di errore dichiarato.",
        { type: 'heading', text: 'La prima variabile' },
        "Una variabile evolve nel tempo. La definiamo con punti temporali noti e un modello di crescita: `variable popolazione { 2025: 59M; 2035: 61M; depends_on: tasso_crescita; model: exponential(rate=0.003, base=59000000) }`.",
        "Adesso il motore ha qualcosa da calcolare: una traiettoria dalla popolazione attuale a quella stimata, con un modello esponenziale e incertezza ereditata dall'assunzione.",
        { type: 'tip', text: "Inizia sempre minimalista: un'assunzione, una variabile, un'incertezza. Fai funzionare lo scenario piu' semplice possibile, poi aggiungi complessita'." },
      ],
    },
    {
      id: 'scratch-2',
      title: 'Modelli di interpolazione',
      icon: 'trending-up',
      duration: '5 min',
      blocks: [
        "Quando una variabile ha due punti temporali (2025: 100, 2040: 200), il motore deve decidere come interpolare i valori intermedi. SDL offre quattro modelli.",
        { type: 'heading', text: 'Linear' },
        "Il valore cresce in modo uniforme anno dopo anno. Se vai da 100 a 200 in 15 anni, ogni anno aggiungi circa 6.7. Semplice, prevedibile, adatto a trend stabili senza accelerazione.",
        { type: 'heading', text: 'Exponential' },
        "Il valore cresce a un tasso percentuale costante. Il 3% all'anno sembra poco, ma in 20 anni raddoppia il valore. Adatto a crescita economica, popolazione, adozione tecnologica nelle fasi iniziali.",
        { type: 'heading', text: 'Logistic' },
        "La curva a S: crescita lenta all'inizio, accelerazione al centro, rallentamento verso un plateau. E' il modello piu' realistico per adozione tecnologica, penetrazione di mercato, transizioni energetiche. Parametri: `rate` (velocita') e `ceiling` (plateau massimo).",
        { type: 'heading', text: 'Spline' },
        "Interpolazione morbida tra piu' punti, senza imporre una forma predefinita. Utile quando hai molti punti dati e vuoi che la curva passi per tutti senza angoli netti.",
        { type: 'highlight', text: "La scelta del modello non e' estetica — e' un'affermazione sulla dinamica del fenomeno. Linear dice \"crescita costante\". Logistic dice \"adozione con saturazione\". La scelta sbagliata produce proiezioni incoerenti." },
        { type: 'tip', text: "Regola pratica: linear per trend macro stabili, exponential per crescita composta, logistic per adozione e transizioni (quasi sempre la scelta migliore per scenari energetici e tecnologici), spline quando hai 4+ punti dati." },
      ],
    },
    {
      id: 'scratch-3',
      title: 'Distribuzioni avanzate',
      icon: 'dice',
      duration: '5 min',
      blocks: [
        "Nel corso \"Leggere l'incertezza\" hai visto le distribuzioni base. Ora vediamo come sceglierle e combinarle nella pratica.",
        { type: 'heading', text: 'La normale e i suoi limiti' },
        "La normale (`normal(±X%)`) e' il default, ma ha un problema: e' simmetrica e illimitata. Per un tasso di crescita del 3%, `normal(±50%)` puo' generare valori negativi — che spesso non hanno senso fisico. Se il tuo valore non puo' essere negativo, usa una lognormale.",
        { type: 'heading', text: 'Combinare distribuzione e modello' },
        "La distribuzione si applica **sopra** il modello di interpolazione. Il motore calcola prima il valore deterministico (dal modello) e poi lo perturba secondo la distribuzione. Se `population` ha `model: exponential` e `uncertainty: normal(±5%)`, ogni run Monte Carlo calcola la traiettoria esponenziale e poi aggiunge rumore gaussiano a ogni step.",
        { type: 'highlight', text: "Distribuzione e modello lavorano insieme: il modello definisce la traiettoria centrale, la distribuzione definisce quanto ci si puo' allontanare. Sono due domande diverse: \"dove va?\" e \"quanto sono sicuro?\"." },
        { type: 'heading', text: 'Confidenza e percentili' },
        "Il livello di confidenza generale dello scenario (dichiarato nel blocco scenario) modula l'ampiezza di tutte le distribuzioni. Un scenario con `confidence: 0.4` produrra' fan chart piu' larghi di uno con `confidence: 0.8`, a parita' di incertezze individuali.",
        "I percentili `[5, 25, 50, 75, 95]` definiscono le bande del fan chart. P5-P95 copre il 90% delle traiettorie. Puoi restringere a [10, 90] per un ventaglio piu' stretto, o allargare a [1, 99] per catturare anche gli estremi.",
        { type: 'tip', text: "Se non sai che distribuzione usare: normale per valori che possono andare in entrambe le direzioni, lognormale per valori positivi con possibili sorprese al rialzo, beta per percentuali, triangolare quando hai solo min/probabile/max da un esperto." },
      ],
    },
    {
      id: 'scratch-4',
      title: 'Branch e scenari condizionali',
      icon: 'git-branch',
      duration: '5 min',
      blocks: [
        "Il mondo reale non segue un'unica traiettoria. Le politiche cambiano, le tecnologie emergono, le crisi esplodono. I branch modellano queste discontinuita'.",
        { type: 'heading', text: 'Struttura di un branch' },
        "Un branch ha un nome, una condizione (`when`), una probabilita', e un set di modifiche. Quando la condizione e' vera durante un run Monte Carlo, le modifiche si applicano da quel punto in avanti.",
        "Esempio: `branch crisi_energetica { when: prezzo_petrolio > 150; probability: 0.15 }` definisce un branch che si attiva nel 15% dei run, quando il prezzo del petrolio supera 150. Dentro il branch, puoi ridefinire variabili, cambiare tassi di crescita, o attivare nuovi impatti.",
        { type: 'heading', text: 'Branch multipli' },
        "Puoi avere piu' branch nello stesso scenario. Il motore li valuta indipendentemente in ogni run. Un run potrebbe attivare zero, uno, o piu' branch. Questo genera un ventaglio di traiettorie molto ricco — il fan chart cattura tutte le combinazioni.",
        { type: 'highlight', text: "I branch sono cio' che rende SDL diverso da un semplice modello di regressione. Non stai estrapolando una tendenza — stai esplorando un albero di possibilita', dove ogni biforcazione ha una probabilita' e un impatto." },
        { type: 'heading', text: 'Quando usare i branch' },
        { type: 'list', items: [
          '**Decisioni politiche**: un nuovo regolamento, una carbon tax, un trattato',
          '**Shock esogeni**: pandemia, conflitto, crisi finanziaria',
          '**Breakthrough tecnologici**: fusione nucleare, AGI, storage economico',
          '**Soglie critiche**: quando una variabile supera un punto di non ritorno',
        ]},
        { type: 'tip', text: "Non abusare dei branch. Ogni branch raddoppia la complessita' combinatoria. Due o tre branch ben calibrati sono piu' utili di dieci superficiali. Chiediti: questo evento cambierebbe davvero la traiettoria?" },
      ],
    },
  ],

  quiz: [
    {
      id: 'scratch-q1',
      question: "Qual e' il file SDL minimo valido?",
      options: [
        'Un blocco scenario vuoto senza timeframe',
        'Un blocco scenario con almeno timeframe e resolution',
        'Almeno un\'assunzione e una variabile',
        'Un blocco simulate con runs e method',
      ],
      correctIndex: 1,
      explanation: "Il minimo e' `scenario \"Nome\" { timeframe: 2025 -> 2035; resolution: yearly }`. Non fa nulla di utile, ma e' sintatticamente valido.",
    },
    {
      id: 'scratch-q2',
      question: 'Quale modello di interpolazione sceglieresti per la penetrazione di mercato di una nuova tecnologia?',
      options: [
        'Linear — crescita costante',
        'Exponential — crescita percentuale',
        'Logistic — curva a S con saturazione',
        'Spline — interpolazione libera',
      ],
      correctIndex: 2,
      explanation: "La logistica (curva a S) e' il modello naturale per l'adozione tecnologica: crescita lenta iniziale, accelerazione, saturazione verso un plateau. E' il pattern osservato per internet, smartphone, auto elettriche.",
    },
    {
      id: 'scratch-q3',
      question: "Perche' `normal(±50%)` puo' essere problematica per un valore che non puo' essere negativo?",
      options: [
        'Perche\' la normale e\' troppo lenta da calcolare',
        'Perche\' la distribuzione normale e\' illimitata e puo\' generare valori negativi',
        'Perche\' il 50% e\' troppo alto per qualsiasi variabile',
        'Perche\' la normale non funziona con Monte Carlo',
      ],
      correctIndex: 1,
      explanation: "La distribuzione normale e' simmetrica e illimitata: con ±50%, una parte dei campionamenti produrra' valori negativi. Per variabili che non possono essere negative (popolazione, costi, quote), usa una lognormale.",
    },
    {
      id: 'scratch-q4',
      question: 'In un run Monte Carlo, cosa succede quando la condizione di un branch e\' soddisfatta?',
      options: [
        'Il run viene scartato e rifatto',
        'Le modifiche definite nel branch si applicano da quel punto in avanti nel run',
        'Tutti i run successivi seguono il branch',
        'Il branch sostituisce l\'intero scenario',
      ],
      correctIndex: 1,
      explanation: "Ogni run e' indipendente. Se in un particolare run la condizione del branch e' soddisfatta, le modifiche si applicano solo a quel run, da quel punto temporale in avanti. Gli altri run continuano indipendentemente.",
    },
    {
      id: 'scratch-q5',
      question: "Come interagiscono modello di interpolazione e distribuzione di incertezza?",
      options: [
        'Si escludono a vicenda: o usi il modello o la distribuzione',
        'Il modello definisce la traiettoria centrale, la distribuzione perturba ogni step',
        'La distribuzione definisce il modello automaticamente',
        'Il modello ignora la distribuzione durante la simulazione',
      ],
      correctIndex: 1,
      explanation: "Lavorano insieme: il motore calcola prima il valore deterministico (dal modello di interpolazione), poi lo perturba secondo la distribuzione di incertezza. Il modello risponde a \"dove va?\", la distribuzione a \"quanto sono sicuro?\".",
    },
  ],
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COURSE 8 — Sensitivity e comunicazione
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const sensitivityComm: Course = {
  id: 'sensitivity-comunicazione',
  title: 'Sensitivity e comunicazione',
  subtitle: 'Tornado chart, narrazione automatica e come presentare l\'incertezza',
  icon: 'trending-up',
  color: '#a855f7',
  track: 3,
  trackLabel: 'Padroneggiare SDL',

  lessons: [
    {
      id: 'sens-1',
      title: 'Analisi di sensitivita\'',
      icon: 'bar-chart',
      duration: '5 min',
      blocks: [
        "Hai uno scenario con 8 parametri e 5 variabili. Il fan chart mostra molta incertezza. La domanda e': **quale parametro conta di piu'?** L'analisi di sensitivita' risponde a questa domanda.",
        { type: 'heading', text: 'Come funziona in SDL' },
        "Per ogni parametro con `control: slider`, il motore esegue due simulazioni extra: una con il parametro al valore minimo del range, una al massimo. Tutto il resto e' mantenuto costante. La differenza nell'output tra le due simulazioni e' lo **swing**: quanto l'output oscilla al variare di quel singolo parametro.",
        "Lo swing e' una misura grezza ma potente dell'influenza. Un parametro con swing alto e' un parametro che \"conta\" — le decisioni che lo riguardano avranno un impatto reale sul risultato.",
        { type: 'highlight', text: "L'analisi di sensitivita' non dice quale parametro e' \"giusto\". Dice quale parametro fa la differenza. E' la mappa che indica dove concentrare attenzione, risorse e ricerca." },
        { type: 'heading', text: 'Limiti' },
        "L'analisi one-at-a-time (un parametro alla volta) non cattura le interazioni: se due parametri si amplificano a vicenda, lo swing individuale sottostima l'effetto combinato. Per scenari con forti interazioni, servirebbero tecniche piu' sofisticate (Sobol indices). Ma per la maggior parte degli scenari di policy, l'approccio one-at-a-time e' gia' enormemente piu' informativo di nessuna analisi.",
      ],
    },
    {
      id: 'sens-2',
      title: 'Leggere un tornado chart',
      icon: 'trending-up',
      duration: '4 min',
      blocks: [
        "Il tornado chart e' la visualizzazione classica della sensitivita'. I parametri sono ordinati dall'alto (piu' influente) al basso (meno influente). Ogni barra mostra lo swing: quanto l'output cambia.",
        { type: 'heading', text: 'Anatomia' },
        { type: 'list', items: [
          '**Asse verticale**: parametri ordinati per swing decrescente',
          '**Barre orizzontali**: lo swing di ciascun parametro (valore min → valore max)',
          '**Parametro in cima**: quello che influenza di piu\' il risultato',
          '**Parametro in fondo**: quello che conta meno — potresti semplificarlo a costante',
        ]},
        { type: 'heading', text: 'Come interpretarlo' },
        "Il tornado chart risponde a tre domande operative:",
        { type: 'list', items: [
          '**Dove investire in ricerca?** Sul parametro in cima, se la sua incertezza e\' alta',
          '**Cosa semplificare?** I parametri in fondo possono diventare costanti senza perdita significativa',
          '**Dove si gioca la partita politica?** Il parametro piu\' influente e\' quello su cui le decisioni contano di piu\'',
        ]},
        { type: 'highlight', text: "Un tornado chart ben letto vale piu' di cento pagine di analisi qualitativa. Mostra in un colpo d'occhio la gerarchia delle influenze nel tuo modello." },
        { type: 'tip', text: "Se il primo parametro domina tutti gli altri (swing 10x piu' grande), il tuo scenario e' essenzialmente un modello a un parametro. Potresti semplificarlo drasticamente, o investire tutto nella precisione di quel singolo parametro." },
      ],
    },
    {
      id: 'sens-3',
      title: 'Narrazione automatica',
      icon: 'file-text',
      duration: '4 min',
      blocks: [
        "I numeri non bastano. Un fan chart e' potente ma non parla. La narrazione automatica di SDL genera un riassunto leggibile dei risultati della simulazione, in italiano, partendo dai dati.",
        { type: 'heading', text: 'Cosa genera' },
        "Il modulo di narrazione analizza i risultati e produce un testo strutturato che copre:",
        { type: 'list', items: [
          '**Traiettoria principale**: dove va la mediana, in che direzione, con che velocita\'',
          '**Livello di incertezza**: quanto e\' largo il ventaglio, come si allarga nel tempo',
          '**Dati storici**: se ci sono dati reali (da bind), quanto confermano o smentiscono le proiezioni',
          '**Parametri chiave**: quali influenzano di piu\' il risultato (dalla sensitivita\')',
          '**Alert attivi**: se watch ha rilevato deviazioni significative',
        ]},
        { type: 'heading', text: 'A chi serve' },
        "La narrazione e' pensata per chi non legge fan chart: policy maker, giornalisti, cittadini. Trasforma i risultati quantitativi in un testo che chiunque puo' capire, senza sacrificare il rigore — ogni affermazione e' derivata dai dati, non inventata.",
        { type: 'highlight', text: "La narrazione automatica chiude il cerchio: lo scenario SDL parte dal codice, produce simulazioni, genera visualizzazioni, e infine si racconta in linguaggio naturale. Un singolo file .sdl diventa un report completo." },
        { type: 'tip', text: "La narrazione e' generata automaticamente ma non va presa alla lettera. E' un punto di partenza per la comunicazione, non il prodotto finale. Rileggila, contestualizzala, aggiungi l'interpretazione che il modello non puo' dare." },
      ],
    },
    {
      id: 'sens-4',
      title: "Comunicare l'incertezza",
      icon: 'users',
      duration: '5 min',
      blocks: [
        "Hai uno scenario solido, un fan chart chiaro, un tornado chart eloquente, una narrazione generata. Ora devi comunicarlo a persone che non sanno cos'e' un percentile. Come si fa?",
        { type: 'heading', text: 'Regola 1: Non nascondere l\'incertezza' },
        "La tentazione e' dare un numero preciso (\"la popolazione sara' 62 milioni\") perche' e' piu' facile da comunicare. Resisti. L'incertezza e' informazione. Dire \"tra 58 e 65 milioni\" e' piu' onesto e piu' utile per chi decide.",
        { type: 'heading', text: 'Regola 2: Usa la mediana, non la media' },
        "Per distribuzioni asimmetriche (lognormali, beta), la media puo' essere fuorviante. La mediana (P50) e' il valore che divide a meta' i futuri possibili — piu' intuitivo per un pubblico non tecnico.",
        { type: 'heading', text: 'Regola 3: Mostra la larghezza, non solo il centro' },
        "\"Il valore centrale e' 62 milioni\" e' un'informazione. \"Il valore centrale e' 62 milioni, ma c'e' un 10% di probabilita' che sia sotto 55 milioni\" e' un'informazione molto piu' ricca. La larghezza del ventaglio racconta una storia diversa dalla mediana.",
        { type: 'heading', text: 'Regola 4: Nomina il parametro che conta' },
        "Invece di dire \"il risultato e' incerto\", dici: \"il risultato dipende soprattutto dal prezzo del carbonio. Se resta sotto 50 euro, le emissioni calano del 10%. Se supera 120 euro, calano del 35%.\" Questo e' **actionable**: chi ascolta sa dove agire.",
        { type: 'highlight', text: "Comunicare l'incertezza non significa essere vaghi. Significa essere precisi su cio' che non si sa. E' la differenza tra \"non lo so\" e \"so che il valore cadra' in questo intervallo, e il fattore che conta di piu' e' questo\"." },
        { type: 'tip', text: "Per presentazioni a policy maker: un fan chart, un tornado chart, e tre frasi. Il fan chart mostra dove si va. Il tornado mostra cosa conta. Le tre frasi dicono: qual e' la traiettoria, qual e' il rischio, qual e' la leva." },
      ],
    },
  ],

  quiz: [
    {
      id: 'sens-q1',
      question: "Cosa misura lo \"swing\" nell'analisi di sensitivita'?",
      options: [
        'La velocita\' di convergenza della simulazione',
        'La differenza nell\'output quando un parametro varia dal suo minimo al suo massimo',
        'Il numero di run necessari per un risultato stabile',
        'La distanza tra mediana e media',
      ],
      correctIndex: 1,
      explanation: "Lo swing e' la differenza nell'output tra la simulazione con il parametro al minimo e quella con il parametro al massimo. Piu' e' grande lo swing, piu' quel parametro influenza il risultato.",
    },
    {
      id: 'sens-q2',
      question: 'In un tornado chart, se il primo parametro ha uno swing 10 volte maggiore degli altri, cosa significa?',
      options: [
        'Il modello ha un errore',
        'Il risultato dipende quasi interamente da quel parametro',
        'Servono piu\' simulazioni',
        'Gli altri parametri sono inutili',
      ],
      correctIndex: 1,
      explanation: "Se un parametro domina il tornado chart, il modello e' essenzialmente un modello a un parametro. Le decisioni riguardanti quel parametro sono le piu' consequenziali.",
    },
    {
      id: 'sens-q3',
      question: 'La narrazione automatica di SDL serve a:',
      options: [
        'Sostituire l\'analisi umana',
        'Tradurre i risultati quantitativi in testo leggibile per non specialisti',
        'Generare il codice SDL da un testo',
        'Validare la correttezza del modello',
      ],
      correctIndex: 1,
      explanation: "La narrazione automatica trasforma i risultati della simulazione (fan chart, sensitivita', alert) in un riassunto in linguaggio naturale, pensato per chi non legge grafici statistici.",
    },
    {
      id: 'sens-q4',
      question: "Perche' per distribuzioni asimmetriche conviene comunicare la mediana invece della media?",
      options: [
        'La mediana e\' sempre piu\' accurata della media',
        'La mediana e\' piu\' facile da calcolare',
        'La mediana divide a meta\' i futuri possibili, mentre la media puo\' essere trascinata dagli estremi',
        'La media non esiste per distribuzioni asimmetriche',
      ],
      correctIndex: 2,
      explanation: "In distribuzioni asimmetriche (lognormale, beta), la media puo' essere spostata verso la coda lunga. La mediana (P50) e' il valore che ha esattamente il 50% dei risultati sopra e sotto — piu' intuitivo e meno fuorviante.",
    },
    {
      id: 'sens-q5',
      question: "Qual e' il limite principale dell'analisi di sensitivita' one-at-a-time?",
      options: [
        'Funziona solo con distribuzioni normali',
        'Non cattura le interazioni tra parametri che si amplificano a vicenda',
        'Richiede troppo tempo computazionale',
        'Non funziona con branch',
      ],
      correctIndex: 1,
      explanation: "L'analisi one-at-a-time varia un parametro alla volta, tenendo gli altri costanti. Non cattura gli effetti combinati: se due parametri si amplificano a vicenda, il loro effetto congiunto sara' sottostimato.",
    },
  ],
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COURSE 9 — Scenari avanzati
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const advancedScenarios: Course = {
  id: 'scenari-avanzati',
  title: 'Scenari avanzati',
  subtitle: 'Pattern, anti-pattern, validazione e il futuro di SDL',
  icon: 'rocket',
  color: '#a855f7',
  track: 3,
  trackLabel: 'Padroneggiare SDL',

  lessons: [
    {
      id: 'advanced-1',
      title: 'Pattern di modellazione',
      icon: 'lightbulb',
      duration: '5 min',
      blocks: [
        "Dopo aver costruito diversi scenari, emergono pattern ricorrenti: combinazioni di blocchi SDL che risolvono problemi comuni. Ecco i piu' utili.",
        { type: 'heading', text: 'Il pattern Hub-and-Spoke' },
        "Un'assunzione centrale (l'hub) da cui dipendono molte variabili (gli spoke). Esempio: il prezzo del carbonio influenza emissioni, costi energetici, investimenti green, competitivita' industriale. Cambiare l'hub cambia tutto. Ideale per scenari dove un singolo fattore di policy domina.",
        { type: 'heading', text: 'Il pattern Cascade' },
        "Una catena lineare di dipendenze: A → B → C → D. Esempio: investimento R&D → breakthrough tecnologici → costo di produzione → adozione di mercato. L'incertezza si amplifica lungo la catena. Utile per modellare processi sequenziali.",
        { type: 'heading', text: 'Il pattern Fork' },
        "Un branch che crea due traiettorie radicalmente diverse. Esempio: \"se l'UE adotta un regolamento, il mercato va in una direzione; se non lo adotta, in un'altra.\" Il fan chart risultante ha una forma bimodale — due cluster di traiettorie invece di uno.",
        { type: 'heading', text: 'Il pattern Monitor' },
        "Assunzione con bind + watch + calibrate: il pattern completo per uno scenario vivente. L'assunzione si aggiorna dai dati, il watch segnala deviazioni, il calibrate affina le distribuzioni. E' il pattern piu' sofisticato ma anche il piu' potente.",
        { type: 'highlight', text: "Conoscere i pattern accelera la modellazione: non devi inventare la struttura ogni volta. Identifica il pattern che corrisponde al tuo problema e adattalo." },
      ],
    },
    {
      id: 'advanced-2',
      title: 'Anti-pattern e errori comuni',
      icon: 'alert-triangle',
      duration: '5 min',
      blocks: [
        "I pattern sono soluzioni ricorrenti. Gli anti-pattern sono errori ricorrenti. Riconoscerli evita settimane di debug concettuale.",
        { type: 'heading', text: 'L\'anti-pattern Overfit' },
        "Troppe variabili, troppe dipendenze, troppe distribuzioni precise. Il modello diventa una scatola nera che nessuno capisce. Se non riesci a spiegare il tuo scenario in 3 frasi, e' troppo complesso. Semplifica finche' non puoi.",
        { type: 'heading', text: 'L\'anti-pattern False Precision' },
        "Dichiarare `uncertainty: normal(±3%)` quando in realta' non hai idea. Incertezze troppo strette producono fan chart troppo stretti, che danno una falsa sensazione di sicurezza. **E' meglio un'incertezza larga e onesta che una stretta e falsa.**",
        { type: 'heading', text: 'L\'anti-pattern Correlation Blindness' },
        "Due assunzioni con incertezza alta ma trattate come indipendenti, quando in realta' sono correlate. Esempio: prezzo del petrolio e costi di trasporto. Se li tratti come indipendenti, Monte Carlo potrebbe generare run in cui il petrolio e' al massimo ma i trasporti al minimo — combinazione irrealistica.",
        { type: 'heading', text: 'L\'anti-pattern Source Washing' },
        "Scrivere `source: \"varie fonti\"` o `source: \"elaborazioni proprie\"`. Se non puoi citare la fonte specifica, la tua assunzione e' un'opinione. Va bene avere opinioni in un modello, ma dichiarale come tali.",
        { type: 'highlight', text: "L'anti-pattern piu' pericoloso non e' tecnico: e' la fiducia eccessiva nel proprio modello. Un modello e' una semplificazione della realta'. Se lo dimentichi, le conclusioni diventano dogmi." },
        { type: 'tip', text: "Review checklist: (1) Posso spiegare lo scenario in 3 frasi? (2) Ogni assunzione ha una fonte reale? (3) Le incertezze sono oneste? (4) Le dipendenze hanno senso causale? Se anche una risposta e' no, semplifica." },
      ],
    },
    {
      id: 'advanced-3',
      title: 'Validazione e qualita\'',
      icon: 'shield',
      duration: '5 min',
      blocks: [
        "Il validator SDL esegue controlli automatici sulla struttura e la semantica dello scenario. Ma la validazione vera — quella che conta — e' concettuale.",
        { type: 'heading', text: 'Validazione strutturale (automatica)' },
        { type: 'list', items: [
          'Il grafo delle dipendenze e\' aciclico (niente cicli)',
          'Tutte le dipendenze dichiarate esistono come blocchi',
          'I timeframe sono coerenti (start < end)',
          'Le distribuzioni hanno parametri validi',
          'I percentili nel simulate sono tra 0 e 100',
        ]},
        "Questi controlli sono necessari ma non sufficienti. Un modello puo' essere strutturalmente valido e concettualmente sbagliato.",
        { type: 'heading', text: 'Validazione concettuale (manuale)' },
        { type: 'list', items: [
          '**Face validity**: i risultati \"hanno senso\"? Se il modello dice che la popolazione italiana raddoppiera\' in 10 anni, c\'e\' un errore',
          '**Sensitivity check**: il parametro piu\' influente e\' anche quello che ti aspetteresti? Se no, perche\\u0301?',
          '**Extreme testing**: cosa succede con parametri estremi? Il modello si comporta ragionevolmente?',
          '**Historical backtest**: se hai dati storici, il modello \"prevedrebbe\" correttamente il passato?',
        ]},
        { type: 'highlight', text: "Un modello non validato e' un'opinione travestita da scienza. La validazione — strutturale e concettuale — e' cio' che separa il foresight dal wishful thinking." },
        { type: 'tip', text: "Il backtest storico e' il gold standard: prendi lo scenario, spostalo indietro di 5 anni, e confronta le sue proiezioni con i dati reali. Se il modello fallisce sul passato, le sue proiezioni future vanno prese con cautela extra." },
      ],
    },
    {
      id: 'advanced-4',
      title: 'Il futuro di SDL',
      icon: 'rocket',
      duration: '4 min',
      blocks: [
        "SDL e' un progetto giovane. La specifica e' alla versione 0.2. C'e' molto da costruire — e molto di quello che verra' costruito dipendera' dalla comunita' che si formera' attorno al linguaggio.",
        { type: 'heading', text: 'SDL Natural' },
        "La prossima grande frontiera: compilazione bidirezionale tra linguaggio naturale e SDL. Descrivi uno scenario a parole (\"voglio un modello sulla transizione energetica italiana al 2040\") e l'AI genera il file SDL. Modifica il file SDL e l'AI aggiorna la descrizione. Il foresight diventa accessibile a chi non scrive codice.",
        { type: 'heading', text: 'Composabilita\'' },
        "Scenari che importano altri scenari. Uno scenario demografico + uno scenario energetico = uno scenario integrato. Come i moduli software, gli scenari diventano componenti riutilizzabili. Un ricercatore pubblica uno scenario demografico validato, e altri lo usano come input nei propri modelli.",
        { type: 'heading', text: 'Registry e community' },
        "Un repository pubblico di scenari SDL — come npm per JavaScript o PyPI per Python. Chiunque puo' pubblicare, forkare, migliorare. Con tracking dell'accuratezza: quale scenario ha previsto meglio? Chi mantiene modelli piu' affidabili? Il foresight diventa una disciplina collettiva e verificabile.",
        { type: 'highlight', text: "La visione a lungo termine di SDL non e' un tool migliore. E' un'infrastruttura pubblica per pensare il futuro collettivamente — come Wikipedia per la conoscenza del presente, SDL per la conoscenza del futuro." },
        { type: 'heading', text: 'Come contribuire' },
        { type: 'list', items: [
          '**Scrivi scenari**: ogni scenario SDL pubblicato arricchisce l\'ecosistema',
          '**Segnala bug e limiti**: il linguaggio migliora con il feedback degli utenti',
          '**Proponi estensioni**: nuove distribuzioni, nuovi modelli, nuovi blocchi',
          '**Insegna**: usa SDL nei corsi, nei workshop, nei think tank',
          '**Sostieni**: il progetto e\' open source e volontario — ogni contributo conta',
        ]},
        { type: 'tip', text: "Il modo migliore per imparare SDL e' usarlo. Prendi un tema che ti sta a cuore — la crisi climatica, l'invecchiamento della popolazione, l'impatto dell'AI sul lavoro — e costruisci uno scenario. Poi condividilo." },
      ],
    },
  ],

  quiz: [
    {
      id: 'advanced-q1',
      question: "Il pattern Hub-and-Spoke e' ideale per scenari dove:",
      options: [
        'Ci sono molte variabili indipendenti',
        'Un singolo fattore centrale influenza molte variabili',
        'Le variabili formano una catena lineare',
        'Non ci sono branch',
      ],
      correctIndex: 1,
      explanation: "Nel pattern Hub-and-Spoke, un'assunzione centrale (come il prezzo del carbonio) influenza molte variabili derivate. Cambiare l'hub cambia tutto il modello.",
    },
    {
      id: 'advanced-q2',
      question: "L'anti-pattern False Precision consiste nel:",
      options: [
        'Usare troppe variabili nel modello',
        'Dichiarare incertezze troppo strette rispetto alla conoscenza reale',
        'Non citare le fonti delle assunzioni',
        'Non eseguire abbastanza simulazioni Monte Carlo',
      ],
      correctIndex: 1,
      explanation: "False Precision e' dichiarare incertezze piu' strette di quanto la conoscenza giustifichi. Produce fan chart ingannevoli che danno una falsa sensazione di sicurezza. Meglio un'incertezza larga e onesta.",
    },
    {
      id: 'advanced-q3',
      question: "Qual e' il gold standard per la validazione di un modello SDL?",
      options: [
        'Che il validator non dia errori',
        'Che il fan chart sia stretto',
        'Il backtest storico: verificare che il modello avrebbe previsto correttamente il passato',
        'Che un esperto approvi le assunzioni',
      ],
      correctIndex: 2,
      explanation: "Il backtest storico e' la validazione piu' rigorosa: applichi il modello a un periodo passato e confronti le proiezioni con i dati reali. Se fallisce sul passato, le proiezioni future vanno prese con cautela extra.",
    },
    {
      id: 'advanced-q4',
      question: "Cosa significa \"composabilita'\" nel futuro di SDL?",
      options: [
        'Scenari piu\' complessi con piu\' variabili',
        'Scenari che possono importare e combinare altri scenari come moduli',
        'La possibilita\' di scrivere SDL in piu\' linguaggi',
        'La compilazione automatica da testo a SDL',
      ],
      correctIndex: 1,
      explanation: "La composabilita' permette di importare scenari come moduli: uno scenario demografico validato puo' essere usato come input in uno scenario energetico. Come i componenti software, gli scenari diventano riutilizzabili.",
    },
    {
      id: 'advanced-q5',
      question: "Un modello strutturalmente valido (nessun errore dal validator) e' necessariamente corretto?",
      options: [
        'Si\', se il validator non da\' errori il modello e\' affidabile',
        'No, la validazione strutturale e\' necessaria ma non sufficiente — serve anche validazione concettuale',
        'Dipende dal numero di simulazioni',
        'Si\', se le fonti sono autorevoli',
      ],
      correctIndex: 1,
      explanation: "La validazione strutturale verifica che il codice sia corretto (niente cicli, dipendenze valide, ecc.), ma un modello puo' essere strutturalmente perfetto e concettualmente sbagliato. La validazione concettuale (face validity, sensitivity check, backtest) e' indispensabile.",
    },
  ],
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Export
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const ACADEMY_COURSES: Course[] = [
  foresight, uncertainty, mathScenarios,
  anatomyScenario, liveData, sectors,
  sdlFromScratch, sensitivityComm, advancedScenarios,
];
