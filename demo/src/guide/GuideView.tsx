/**
 * SDL Guide View
 *
 * Interactive documentation for the SDL language.
 * Covers all constructs with practical examples.
 */

import { useState, useRef, useEffect } from 'react';
import { SdlIcon } from '../lib/icons';

// ═══════════════════════════════════════════
// Guide section data
// ═══════════════════════════════════════════

export const GUIDE_SECTIONS = [
  { id: 'panoramica', label: 'Panoramica', icon: 'telescope' },
  { id: 'struttura', label: 'Struttura scenario', icon: 'building' },
  { id: 'assunzioni', label: 'Assunzioni', icon: 'pin' },
  { id: 'variabili', label: 'Variabili', icon: 'bar-chart' },
  { id: 'parametri', label: 'Parametri', icon: 'settings' },
  { id: 'branches', label: 'Branches', icon: 'git-branch' },
  { id: 'impatti', label: 'Impatti', icon: 'target' },
  { id: 'dati-reali', label: 'Dati reali (bind)', icon: 'radio' },
  { id: 'registro-fonti', label: 'Registro fonti', icon: 'database' },
  { id: 'monitoraggio', label: 'Monitoraggio (watch)', icon: 'alert-triangle' },
  { id: 'calibrazione', label: 'Calibrazione', icon: 'crosshair' },
  { id: 'simulazione', label: 'Simulazione', icon: 'dice' },
  { id: 'distribuzioni', label: 'Distribuzioni', icon: 'trending-up' },
  { id: 'riferimento', label: 'Riferimento rapido', icon: 'clipboard-list' },
] as const;

export type GuideSectionId = typeof GUIDE_SECTIONS[number]['id'];

// ═══════════════════════════════════════════
// Code Block with copy
// ═══════════════════════════════════════════

function CodeBlock({ code, title }: { code: string; title?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900/60 my-4">
      {title && (
        <div className="flex items-center justify-between px-4 py-2 bg-zinc-800/40 border-b border-zinc-800/60">
          <span className="text-[11px] font-semibold text-zinc-400">{title}</span>
          <button
            onClick={handleCopy}
            className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors px-2 py-1 rounded-md hover:bg-zinc-700/50"
          >
            {copied ? 'Copiato!' : 'Copia'}
          </button>
        </div>
      )}
      {!title && (
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 text-[10px] text-zinc-600 hover:text-zinc-300 transition-colors px-2 py-1 rounded-md hover:bg-zinc-700/50 opacity-0 group-hover:opacity-100"
        >
          {copied ? 'Copiato!' : 'Copia'}
        </button>
      )}
      <pre className="text-[13px] font-mono text-zinc-300 p-4 overflow-x-auto leading-relaxed whitespace-pre-wrap">
        {code}
      </pre>
    </div>
  );
}

// ═══════════════════════════════════════════
// Info callout
// ═══════════════════════════════════════════

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 bg-blue-500/5 border border-blue-500/15 rounded-xl p-4 my-4">
      <span className="text-blue-400 text-sm shrink-0 mt-0.5">&#9432;</span>
      <div className="text-[13px] text-zinc-400 leading-relaxed">{children}</div>
    </div>
  );
}

// ═══════════════════════════════════════════
// Table
// ═══════════════════════════════════════════

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto my-4 rounded-xl border border-zinc-800">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="bg-zinc-800/40">
            {headers.map((h, i) => (
              <th key={i} className="text-left px-4 py-2.5 text-zinc-400 font-semibold border-b border-zinc-800/60">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-zinc-800/30 last:border-b-0 hover:bg-zinc-800/20 transition-colors">
              {row.map((cell, j) => (
                <td key={j} className={`px-4 py-2.5 ${j === 0 ? 'font-mono text-amber-300/80' : 'text-zinc-400'}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ═══════════════════════════════════════════
// Section components
// ═══════════════════════════════════════════

function SectionPanoramica() {
  return (
    <section>
      <h2 className="text-2xl font-bold text-white mb-4">Cos'e' SDL?</h2>
      <p className="text-zinc-400 leading-relaxed mb-4">
        <strong className="text-zinc-200">SDL (Scenario Description Language)</strong> e' un linguaggio formale
        per descrivere, simulare e monitorare scenari futuri. A differenza delle previsioni tradizionali
        (testi statici o presentazioni), uno scenario SDL e' un <strong className="text-zinc-200">oggetto computazionale</strong>: 
        puo' essere parsato, eseguito con simulazioni Monte Carlo, collegato a fonti dati reali,
        e tradotto da/verso linguaggio naturale.
      </p>

      <h3 className="text-lg font-semibold text-white mt-8 mb-3">Principi fondamentali</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          ['Eseguibile', 'Ogni scenario puo\' essere simulato, non solo letto'],
          ['Incertezza nativa', 'Le distribuzioni di probabilita\' sono cittadini di prima classe'],
          ['Temporale', 'Il tempo e\' una dimensione fondamentale di ogni costrutto'],
          ['Causale', 'Le dipendenze tra variabili formano un grafo causale esplicito'],
          ['Componibile', 'Gli scenari possono essere combinati, derivati, confrontati'],
          ['Collegato ai dati', 'Le assunzioni si collegano a fonti reali via bind e si auto-aggiornano'],
          ['Auto-calibrante', 'Le distribuzioni si restringono man mano che i dati storici confermano le previsioni'],
          ['Verificabile', 'Watch monitora le deviazioni e genera alert quando la realta\' diverge'],
        ].map(([title, desc]) => (
          <div key={title} className="bg-zinc-900/40 border border-zinc-800/60 rounded-lg p-3">
            <p className="text-sm font-semibold text-zinc-200 mb-1">{title}</p>
            <p className="text-[12px] text-zinc-500 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      <h3 className="text-lg font-semibold text-white mt-8 mb-3">Come funziona</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
        {[
          ['1. Scrivi', 'Definisci scenario con assunzioni, variabili, branches'],
          ['2. Collega', 'bind collega le assunzioni a fonti dati reali (API)'],
          ['3. Valida', 'Il parser controlla sintassi e costruisce il grafo causale'],
          ['4. Simula', '2.000+ simulazioni Monte Carlo propagano l\'incertezza'],
          ['5. Calibra', 'I dati storici restringono le distribuzioni di incertezza'],
          ['6. Analizza', 'Fan chart, sensibilita\', narrazione e alert in tempo reale'],
        ].map(([step, desc]) => (
          <div key={step} className="flex-1 bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-4">
            <p className="text-sm font-bold text-blue-400 mb-1">{step}</p>
            <p className="text-[11px] text-zinc-500 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionStruttura() {
  return (
    <section>
      <h2 className="text-2xl font-bold text-white mb-4">Struttura di uno scenario</h2>
      <p className="text-zinc-400 leading-relaxed mb-4">
        Ogni file SDL contiene esattamente un blocco <code className="text-amber-300/80">scenario</code>.
        Al suo interno si dichiarano i metadati e i vari costrutti.
      </p>

      <CodeBlock title="Struttura base" code={`scenario "Nome dello scenario" {
  // ── Metadati obbligatori ──
  timeframe: 2025 -> 2040        // Periodo di simulazione
  resolution: yearly              // Risoluzione temporale

  // ── Metadati opzionali ──
  confidence: 0.6                 // Confidenza complessiva (0-1)
  author: "Il tuo nome"
  version: "1.0"
  description: "Descrizione dello scenario"
  tags: ["tag1", "tag2"]

  // ── Metadati di presentazione (v0.1.1) ──
  subtitle: "Una riga di sottotitolo"
  category: tecnologia            // tecnologia | economia | ambiente |
                                  // societa | politica | salute
  icon: "🔬"                      // Emoji per la card
  color: "#3b82f6"                // Colore primario (hex)
  difficulty: intermedio           // base | intermedio | avanzato

  // ── Dichiarazioni ──
  assumption ...   // Condizioni esterne prese come date
  parameter ...    // Valori configurabili con slider
  variable ...     // Grandezze che cambiano nel tempo
  branch ...       // Scenari alternativi condizionali
  impact ...       // Metriche di output derivate
  simulate ...     // Configurazione simulazione

  // ── Avanzato ──
  calibrate ...    // Calibrazione bayesiana
  bind ...         // Collegamento a dati esterni
  watch ...        // Monitoraggio deviazioni
}`} />

      <h3 className="text-lg font-semibold text-white mt-8 mb-3">Metadati</h3>
      <Table
        headers={['Campo', 'Tipo', 'Obbligatorio', 'Descrizione']}
        rows={[
          ['timeframe', '2025 -> 2040', 'Si\'', 'Periodo inizio -> fine'],
          ['resolution', 'yearly | monthly | weekly | daily', 'Si\'', 'Passo temporale della simulazione'],
          ['confidence', '0.0 — 1.0', 'No', 'Confidenza complessiva dello scenario'],
          ['author', '"Nome"', 'No', 'Autore dello scenario'],
          ['version', '"1.0"', 'No', 'Versione'],
          ['description', '"Testo"', 'No', 'Descrizione testuale'],
          ['tags', '["a", "b"]', 'No', 'Tag per categorizzazione'],
        ]}
      />

      <h3 className="text-lg font-semibold text-white mt-8 mb-3">Metadati di presentazione <span className="text-xs font-normal text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full ml-2">v0.1.1</span></h3>
      <p className="text-zinc-400 leading-relaxed mb-3">
        Campi opzionali che controllano come lo scenario appare nell'interfaccia: card, colori, categorizzazione.
      </p>
      <Table
        headers={['Campo', 'Tipo', 'Descrizione']}
        rows={[
          ['subtitle', '"Testo"', 'Sottotitolo per la card dello scenario'],
          ['category', 'tecnologia | economia | ambiente | societa | politica | salute', 'Categoria tematica per raggruppamento'],
          ['icon', '"emoji"', 'Emoji o icona per la card'],
          ['color', '"#hex"', 'Colore primario per grafici e UI'],
          ['difficulty', 'base | intermedio | avanzato', 'Livello di complessita\' dello scenario'],
        ]}
      />

      <h3 className="text-lg font-semibold text-white mt-8 mb-3">Commenti</h3>
      <CodeBlock code={`// Commento su una riga

/* Commento
   su piu' righe */`} />
    </section>
  );
}

function SectionAssunzioni() {
  return (
    <section>
      <h2 className="text-2xl font-bold text-white mb-4">Assunzioni</h2>
      <p className="text-zinc-400 leading-relaxed mb-4">
        Le <strong className="text-zinc-200">assunzioni</strong> (<code className="text-amber-300/80">assumption</code>) 
        rappresentano condizioni esterne prese come date. Sono gli <em>input</em> dello scenario: 
        non vengono derivate, ma alimentano le variabili attraverso il grafo causale.
      </p>

      <CodeBlock title="Sintassi" code={`assumption nome_assunzione {
  value: 85 EUR             // Valore base (numeri, %, valuta)
  source: "Fonte dei dati"  // Fonte (obbligatoria per trasparenza)
  confidence: 0.7           // Confidenza (0-1)
  uncertainty: normal(±25%) // Distribuzione di incertezza
}`} />

      <Tip>
        <strong>Buona pratica:</strong> indica sempre la <code>source</code> di ogni assunzione. 
        Questo rende lo scenario verificabile e trasparente.
      </Tip>

      <h3 className="text-lg font-semibold text-white mt-8 mb-3">Assunzioni con dati reali <span className="text-xs font-normal text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full ml-2">v0.2</span></h3>
      <p className="text-zinc-400 leading-relaxed mb-3">
        Le assunzioni possono includere blocchi <code className="text-amber-300/80">bind</code> (collegamento dati) e 
        <code className="text-amber-300/80"> watch</code> (monitoraggio deviazioni). Vedi le sezioni dedicate per i dettagli.
      </p>
      <CodeBlock title="Assunzione con bind + watch" code={`assumption prezzo_carbonio {
  value: 72 EUR
  source: "EU ETS, media 2025"
  confidence: 0.7
  uncertainty: normal(±25%)

  bind {
    source: "sdl:fallback/eu-ets-carbon-price"
    refresh: daily
    field: "price_per_ton_eur"
    fallback: 72
  }

  watch {
    warn  when: actual > assumed * 1.5
    error when: actual > assumed * 2.0
  }
}`} />

      <h3 className="text-lg font-semibold text-white mt-8 mb-3">Esempio completo</h3>
      <CodeBlock code={`assumption tasso_crescita_pil {
  value: 0.8
  source: "ISTAT, previsioni 2025"
  confidence: 0.5
  uncertainty: normal(±40%)
}

assumption prezzo_carbonio {
  value: 85 EUR
  source: "EU ETS, Q1 2025"
  confidence: 0.7
  uncertainty: normal(±25%)
}

assumption volonta_politica {
  value: 0.7
  source: "Indice composito politiche UE"
  confidence: 0.5
  uncertainty: beta(7, 3)    // Distribuzione beta
}`} />

      <h3 className="text-lg font-semibold text-white mt-8 mb-3">Tipi di valore supportati</h3>
      <Table
        headers={['Tipo', 'Esempio', 'Note']}
        rows={[
          ['Numero', '0.8, 42, 3.14', 'Interi e decimali'],
          ['Percentuale', '22%, 0.5%', 'Valore con %'],
          ['Valuta', '85 EUR, 5M USD', 'Con codice valuta'],
          ['Con magnitudine', '5B EUR, 100K', 'K=10^3, M=10^6, B=10^9, T=10^12'],
        ]}
      />
    </section>
  );
}

function SectionVariabili() {
  return (
    <section>
      <h2 className="text-2xl font-bold text-white mb-4">Variabili</h2>
      <p className="text-zinc-400 leading-relaxed mb-4">
        Le <strong className="text-zinc-200">variabili</strong> (<code className="text-amber-300/80">variable</code>) 
        sono grandezze misurabili che cambiano nel tempo. Sono il cuore computazionale di SDL: 
        definiscono serie temporali con punti noti, modelli di crescita, e incertezza.
      </p>

      <CodeBlock title="Sintassi" code={`variable nome_variabile {
  description: "Cosa rappresenta"
  unit: "unita' di misura"

  // Metadati di visualizzazione (v0.1.1)
  label: "Nome leggibile"    // Etichetta per grafici
  icon: "📊"                  // Icona per il grafo causale
  color: "#3b82f6"            // Colore per i grafici

  // Serie temporale (punti noti)
  2025: 100
  2030: 150
  2035: 200
  2040: 250

  // Relazioni causali
  depends_on: assunzione1, assunzione2

  // Modello di crescita (opzionale)
  model: logistic(k=0.12, midpoint=2032, max=300)

  // Incertezza
  uncertainty: normal(±15%)

  // Metodo di interpolazione
  interpolation: linear   // linear | step | spline
}`} />

      <h3 className="text-lg font-semibold text-white mt-8 mb-3">Serie temporali</h3>
      <p className="text-zinc-400 leading-relaxed mb-3">
        I punti definiti nella variabile sono <strong className="text-zinc-200">ancore</strong>. 
        Tra un punto e l'altro, SDL interpola secondo il metodo specificato.
      </p>
      <Table
        headers={['Interpolazione', 'Comportamento']}
        rows={[
          ['linear', 'Linea retta tra i punti (default)'],
          ['step', 'Valore costante fino al punto successivo'],
          ['spline', 'Curva morbida (spline cubica)'],
        ]}
      />

      <h3 className="text-lg font-semibold text-white mt-8 mb-3">Dipendenze causali</h3>
      <p className="text-zinc-400 leading-relaxed mb-3">
        <code className="text-amber-300/80">depends_on</code> dichiara che questa variabile 
        e' influenzata da altre. Il motore usa queste relazioni per costruire il <strong className="text-zinc-200">grafo causale</strong> e 
        determinare l'ordine di esecuzione.
      </p>
      <CodeBlock code={`variable occupazione_green {
  description: "Lavoratori nel settore green"
  unit: "migliaia"

  2025: 80
  2030: 120
  2040: 220

  depends_on: quota_rinnovabili, budget_formazione
  uncertainty: normal(±15%)
  interpolation: spline
}`} />

      <Tip>
        Le dipendenze formano un DAG (grafo aciclico diretto). 
        SDL rifiuta scenari con dipendenze circolari.
      </Tip>

      <h3 className="text-lg font-semibold text-white mt-8 mb-3">Modelli di crescita</h3>
      <Table
        headers={['Modello', 'Parametri', 'Uso tipico']}
        rows={[
          ['linear(slope, intercept)', 'Pendenza, valore iniziale', 'Crescita/declino costante'],
          ['logistic(k, midpoint, max)', 'Velocita\', punto flesso, tetto', 'Adozione tecnologica, saturazione'],
          ['exponential(rate, base)', 'Tasso, valore iniziale', 'Crescita/decadimento esponenziale'],
          ['sigmoid(k, midpoint)', 'Ripidita\', centro', 'Transizioni graduali'],
        ]}
      />

      <h3 className="text-lg font-semibold text-white mt-8 mb-3">Metadati di visualizzazione <span className="text-xs font-normal text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full ml-2">v0.1.1</span></h3>
      <p className="text-zinc-400 leading-relaxed mb-3">
        Campi opzionali che personalizzano come la variabile appare nei grafici e nel grafo causale.
      </p>
      <Table
        headers={['Campo', 'Tipo', 'Descrizione']}
        rows={[
          ['label', '"Testo"', 'Nome leggibile per grafici e legenda (default: nome variabile)'],
          ['icon', '"emoji"', 'Icona visualizzata nel nodo del grafo causale'],
          ['color', '"#hex"', 'Colore del nodo e delle bande nel fan chart'],
        ]}
      />
      <CodeBlock title="Esempio con metadati visivi" code={`variable quota_rinnovabili {
  description: "Quota rinnovabili nel mix energetico"
  unit: "%"
  label: "Rinnovabili"
  icon: "☀"
  color: "#10b981"

  2025: 22
  2030: 35
  2040: 65

  depends_on: prezzo_carbonio
  uncertainty: normal(±12%)
  interpolation: spline
}`} />
    </section>
  );
}

function SectionParametri() {
  return (
    <section>
      <h2 className="text-2xl font-bold text-white mb-4">Parametri</h2>
      <p className="text-zinc-400 leading-relaxed mb-4">
        I <strong className="text-zinc-200">parametri</strong> (<code className="text-amber-300/80">parameter</code>) 
        sono valori di configurazione che <em>non cambiano nel tempo</em> all'interno di una singola simulazione, 
        ma possono variare tra simulazioni diverse. Utili per soglie, budget, costi unitari.
      </p>
      <p className="text-zinc-400 leading-relaxed mb-4">
        A partire dalla <strong className="text-zinc-200">v0.1.1</strong>, i parametri possono includere 
        metadati per generare automaticamente <strong className="text-zinc-200">controlli interattivi</strong> (slider, toggle, dropdown)
        nell'interfaccia, permettendo all'utente di esplorare scenari alternativi in tempo reale.
      </p>

      <CodeBlock title="Sintassi base" code={`parameter nome_parametro {
  value: 3.5%                      // Valore di default
  range: [2%, 6%]                  // Range esplorabile (opzionale)
  description: "Cosa rappresenta"  // Descrizione
}`} />

      <h3 className="text-lg font-semibold text-white mt-8 mb-3">Controlli interattivi <span className="text-xs font-normal text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full ml-2">v0.1.1</span></h3>
      <p className="text-zinc-400 leading-relaxed mb-3">
        Quando un parametro specifica <code className="text-amber-300/80">control: slider</code>, l'interfaccia genera
        automaticamente uno slider che l'utente puo' muovere per modificare il valore e vedere i risultati aggiornarsi in tempo reale.
      </p>
      <CodeBlock title="Sintassi completa con controlli" code={`parameter spesa_pubblica {
  value: 5                          // Valore di default
  range: [0, 15]                    // Min e max dello slider

  // ── Controllo interattivo ──
  control: slider                   // Tipo di controllo UI
  label: "Spesa pubblica extra"     // Etichetta nell'interfaccia
  unit: "mld €"                     // Unita' di misura
  step: 0.5                         // Incremento dello slider
  format: "{value} mld €"           // Formato di visualizzazione
  description: "Spesa pubblica aggiuntiva annua"

  // ── Stile visivo ──
  icon: "💰"                         // Icona accanto al nome
  color: "#10b981"                  // Colore della barra
}`} />

      <h3 className="text-lg font-semibold text-white mt-8 mb-3">Proprieta' dei parametri</h3>
      <Table
        headers={['Campo', 'Tipo', 'Descrizione']}
        rows={[
          ['value', 'Numero, %, Valuta', 'Valore di default (obbligatorio)'],
          ['range', '[min, max]', 'Range esplorabile — definisce i limiti dello slider'],
          ['description', '"Testo"', 'Descrizione del parametro'],
          ['control', 'slider | toggle | dropdown | input', 'Tipo di controllo UI da generare'],
          ['label', '"Testo"', 'Etichetta leggibile nell\'interfaccia'],
          ['unit', '"Testo"', 'Unita\' di misura (es. "%", "mld €", "persone")'],
          ['step', 'Numero', 'Incremento del controllo (default: 1% del range)'],
          ['format', '"{value} unita\'"', 'Template per la visualizzazione del valore'],
          ['source', '"Testo"', 'Fonte del valore di default'],
          ['icon', '"emoji"', 'Icona visualizzata accanto al parametro'],
          ['color', '"#hex"', 'Colore della barra di progresso'],
        ]}
      />

      <h3 className="text-lg font-semibold text-white mt-8 mb-3">Tipi di controllo</h3>
      <Table
        headers={['Controllo', 'Uso tipico', 'Esempio']}
        rows={[
          ['slider', 'Valori numerici continui in un range', 'Budget, aliquote, soglie'],
          ['toggle', 'Scelte binarie (on/off)', 'Politica attiva/inattiva'],
          ['dropdown', 'Scelta tra opzioni discrete', 'Scenario base/ottimista/pessimista'],
          ['input', 'Inserimento numerico libero', 'Valori precisi senza range'],
        ]}
      />

      <h3 className="text-lg font-semibold text-white mt-8 mb-3">Esempio completo</h3>
      <CodeBlock code={`parameter sussidio_rinnovabili {
  value: 30
  range: [0, 60]
  label: "Sussidio rinnovabili"
  unit: "%"
  step: 5
  format: "{value}%"
  control: slider
  icon: "☀"
  color: "#10b981"
  description: "Incentivo statale sulle installazioni rinnovabili"
}

parameter aliquota_imprese {
  value: 24
  range: [15, 35]
  label: "Aliquota IRES"
  unit: "%"
  step: 1
  format: "{value}%"
  control: slider
  description: "Aliquota fiscale sulle imprese"
}

parameter budget_formazione {
  value: 3B EUR
  range: [1B EUR, 8B EUR]
  description: "Budget annuo per riqualificazione professionale"
}`} />

      <Tip>
        <strong>Differenza tra assunzione e parametro:</strong> le assunzioni rappresentano condizioni 
        esterne <em>incerte</em> (con distribuzione di probabilita'). I parametri sono scelte 
        <em>configurabili</em> dall'utente (con range discreto). Solo i parametri con <code>control: slider</code> generano 
        slider interattivi nell'editor.
      </Tip>

      <Tip>
        <strong>Suggerimento:</strong> nell'editor, scrivi un parametro con <code>control: slider</code> e 
        il pannello "Controlli interattivi" apparira' automaticamente sotto il codice, pronto per l'uso.
      </Tip>
    </section>
  );
}

function SectionBranches() {
  return (
    <section>
      <h2 className="text-2xl font-bold text-white mb-4">Branches (scenari alternativi)</h2>
      <p className="text-zinc-400 leading-relaxed mb-4">
        Un <strong className="text-zinc-200">branch</strong> e' una biforcazione condizionale: 
        quando una condizione viene soddisfatta durante la simulazione, il motore "forka" il run 
        e continua sia lungo il percorso base sia lungo quello alternativo.
      </p>

      <CodeBlock title="Sintassi" code={`branch "Nome del branch" when condizione {
  probability: 0.15    // Probabilita' di attivazione (0-1)

  // Override di variabili nel ramo alternativo
  variable nome_variabile {
    2030: nuovo_valore
    2035: altro_valore
    uncertainty: normal(±20%)
  }
}`} />

      <h3 className="text-lg font-semibold text-white mt-8 mb-3">Come funzionano</h3>
      <p className="text-zinc-400 leading-relaxed mb-3">
        A ogni passo temporale della simulazione:
      </p>
      <ol className="list-decimal list-inside text-zinc-400 space-y-2 ml-2 text-[13px] leading-relaxed">
        <li>Il motore valuta la condizione <code className="text-amber-300/80">when</code> con i valori correnti</li>
        <li>Se la condizione e' vera <strong className="text-zinc-200">e</strong> un sorteggio casuale {'<'} <code className="text-amber-300/80">probability</code>:
          <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
            <li>Il run viene biforcato</li>
            <li>Le variabili del branch sovrascrivono quelle base</li>
            <li>La simulazione prosegue con i parametri modificati</li>
          </ul>
        </li>
        <li>I risultati finali aggregano tutti i branches, pesati per probabilita'</li>
      </ol>

      <h3 className="text-lg font-semibold text-white mt-8 mb-3">Esempio con piu' branches</h3>
      <CodeBlock code={`branch "Crisi Energetica" when prezzo_gas > 80 {
  probability: 0.15

  variable costo_energia {
    2030: 140
    2035: 115
    uncertainty: normal(±25%)
  }
}

branch "Svolta Tecnologica" when capacita_solare > 100 {
  probability: 0.20

  variable costo_energia {
    2035: 60
    2040: 40
    uncertainty: normal(±15%)
  }

  variable occupazione_green {
    2035: 300
    2040: 400
    uncertainty: normal(±20%)
  }
}

branch "Inversione Politica" when volonta_politica < 0.4 {
  probability: 0.10

  variable quota_rinnovabili {
    2030: 28%
    2035: 35%
    uncertainty: normal(±15%)
  }
}`} />

      <h3 className="text-lg font-semibold text-white mt-8 mb-3">Operatori nelle condizioni</h3>
      <Table
        headers={['Operatore', 'Significato', 'Esempio']}
        rows={[
          ['>', 'Maggiore', 'prezzo > 100'],
          ['<', 'Minore', 'tasso < 0.5'],
          ['>=', 'Maggiore o uguale', 'quota >= 50%'],
          ['<=', 'Minore o uguale', 'spesa <= 10B EUR'],
          ['==', 'Uguale', 'stato == 1'],
          ['!=', 'Diverso', 'livello != 0'],
          ['and', 'E logico', 'a > 10 and b < 5'],
          ['or', 'O logico', 'a > 10 or b < 5'],
        ]}
      />
    </section>
  );
}

function SectionImpatti() {
  return (
    <section>
      <h2 className="text-2xl font-bold text-white mb-4">Impatti</h2>
      <p className="text-zinc-400 leading-relaxed mb-4">
        Gli <strong className="text-zinc-200">impatti</strong> (<code className="text-amber-300/80">impact</code>) 
        sono metriche di output derivate dalle variabili. Rappresentano cio' che lo scenario vuole 
        misurare: effetti netti, progressi, gap rispetto a obiettivi.
      </p>

      <CodeBlock title="Sintassi" code={`impact nome_impatto {
  description: "Cosa misura"
  unit: "unita'"
  derives_from: variabile1, variabile2
  formula: variabile1 - variabile2

  // Metadati di visualizzazione (v0.1.1)
  label: "Nome leggibile"    // Etichetta per grafici
  icon: "🎯"                  // Icona per il grafo causale
  color: "#ef4444"            // Colore per i grafici
}`} />

      <h3 className="text-lg font-semibold text-white mt-8 mb-3">Esempi</h3>
      <CodeBlock code={`impact occupazione_netta {
  description: "Variazione netta occupazione"
  unit: "migliaia"
  label: "Occupazione netta"
  icon: "👷"
  color: "#10b981"
  derives_from: occupazione_green, occupazione_fossile
  formula: occupazione_green - occupazione_fossile
}

impact progresso_climatico {
  description: "Riduzione emissioni dal 2025 (%)"
  unit: "%"
  label: "Progresso climatico"
  icon: "🌿"
  color: "#06b6d4"
  derives_from: emissioni_co2
  formula: (320 - emissioni_co2) / 320 * 100
}

impact risparmio_famiglie {
  description: "Risparmio energetico vs 2025"
  unit: "indice"
  derives_from: costo_energia
  formula: 100 - costo_energia
}`} />

      <h3 className="text-lg font-semibold text-white mt-8 mb-3">Metadati di visualizzazione <span className="text-xs font-normal text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full ml-2">v0.1.1</span></h3>
      <Table
        headers={['Campo', 'Tipo', 'Descrizione']}
        rows={[
          ['label', '"Testo"', 'Nome leggibile per grafici e legenda'],
          ['icon', '"emoji"', 'Icona visualizzata nel nodo del grafo causale'],
          ['color', '"#hex"', 'Colore del nodo e delle bande nel fan chart'],
        ]}
      />

      <Tip>
        La <code>formula</code> puo' usare operazioni aritmetiche (<code>+</code>, <code>-</code>, <code>*</code>, <code>/</code>, <code>^</code>) 
        e riferirsi a qualsiasi variabile dichiarata nello scenario.
      </Tip>
    </section>
  );
}

function SectionDatiReali() {
  return (
    <section>
      <h2 className="text-2xl font-bold text-white mb-4">Dati reali (bind) <span className="text-xs font-normal text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full ml-2">v0.2</span></h2>
      <p className="text-zinc-400 leading-relaxed mb-4">
        Il blocco <code className="text-amber-300/80">bind</code> collega un'assunzione a una <strong className="text-zinc-200">fonte dati esterna</strong>.
        Questo permette allo scenario di auto-aggiornarsi con dati reali, confrontare le previsioni con la realta',
        e sovrapporre i dati storici ai fan chart.
      </p>

      <CodeBlock title="Sintassi" code={`assumption nome_assunzione {
  value: 1.24
  source: "Eurostat demo_frate, 2024"
  confidence: 0.9
  uncertainty: normal(±5%)

  bind {
    source: "https://ec.europa.eu/eurostat/databrowser/view/demo_frate"
    refresh: yearly                          // Frequenza aggiornamento
    field: "fertility_rate"                  // Campo da estrarre
    fallback: 1.24                           // Valore se l'API non risponde
  }
}`} />

      <h3 className="text-lg font-semibold text-white mt-8 mb-3">Proprieta' del bind</h3>
      <Table
        headers={['Campo', 'Tipo', 'Obbligatorio', 'Descrizione']}
        rows={[
          ['source', 'URL', 'Si\'', 'Endpoint API da cui recuperare il dato'],
          ['refresh', 'daily | weekly | monthly | quarterly | yearly', 'No', 'Frequenza di aggiornamento (default: yearly)'],
          ['field', '"nome_campo"', 'No', 'Path del campo JSON nel payload della risposta'],
          ['fallback', 'Numero', 'No', 'Valore da usare se la chiamata API fallisce'],
        ]}
      />

      <h3 className="text-lg font-semibold text-white mt-8 mb-3">Frequenze di aggiornamento</h3>
      <Table
        headers={['Frequenza', 'Uso tipico']}
        rows={[
          ['daily', 'Prezzi di mercato, indicatori finanziari, dati meteo'],
          ['weekly', 'Report epidemiologici, dati occupazionali'],
          ['monthly', 'Indici economici, dati energetici'],
          ['quarterly', 'PIL, dati demografici, report istituzionali'],
          ['yearly', 'Censimenti, proiezioni a lungo termine, benchmark'],
        ]}
      />

      <h3 className="text-lg font-semibold text-white mt-8 mb-3">Esempio: scenario con fonti reali</h3>
      <CodeBlock code={`assumption prezzo_carbonio {
  value: 72 EUR
  source: "EU ETS, media 2025"
  confidence: 0.7
  uncertainty: normal(±25%)

  bind {
    source: "sdl:fallback/eu-ets-carbon-price"
    refresh: daily
    field: "price_per_ton_eur"
    fallback: 72
  }
}

assumption tasso_fecondita {
  value: 1.24
  source: "Eurostat demo_frate, 2024"
  confidence: 0.9
  uncertainty: normal(±5%)

  bind {
    source: "https://ec.europa.eu/eurostat/databrowser/view/demo_frate"
    refresh: yearly
    field: "fertility_rate"
    fallback: 1.24
  }
}`} />

      <h3 className="text-lg font-semibold text-white mt-8 mb-3">Cosa succede nell'interfaccia</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          ['Dati storici sul grafico', 'I dati reali vengono sovrapposti ai fan chart come punti o linea, permettendo di vedere quanto la previsione corrisponde alla realta\''],
          ['Badge "Dati reali"', 'Lo scenario mostra un badge verde quando ha dati collegati attivi'],
          ['Pannello Validazione', 'Tabella che confronta proiezione vs dato osservato anno per anno'],
          ['Fallback automatico', 'Se l\'API non e\' raggiungibile, il sistema usa dati pre-registrati'],
        ].map(([title, desc]) => (
          <div key={title} className="bg-zinc-900/40 border border-zinc-800/60 rounded-lg p-3">
            <p className="text-sm font-semibold text-zinc-200 mb-1">{title}</p>
            <p className="text-[12px] text-zinc-500 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      <Tip>
        <strong>Buona pratica:</strong> specifica sempre un <code>fallback</code> per garantire che 
        lo scenario funzioni anche offline. Il sistema Pulse usa dati pre-registrati quando le API esterne non sono disponibili.
      </Tip>
    </section>
  );
}

function SourceTable({ title, color, entries }: {
  title: string;
  color: string;
  entries: Array<{ url: string; field: string; description: string; geo: string }>;
}) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleCopy = (idx: number, entry: typeof entries[0]) => {
    const snippet = `bind {\n      source: "${entry.url}"\n      refresh: yearly\n      field: "${entry.field}"\n    }`;
    navigator.clipboard.writeText(snippet);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="mb-6">
      <h4 className="text-sm font-semibold mb-2" style={{ color }}>{title}</h4>
      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="bg-zinc-800/40">
              <th className="text-left px-3 py-2 text-zinc-400 font-semibold border-b border-zinc-800/60">URL / Identificatore</th>
              <th className="text-left px-3 py-2 text-zinc-400 font-semibold border-b border-zinc-800/60">Descrizione</th>
              <th className="text-left px-3 py-2 text-zinc-400 font-semibold border-b border-zinc-800/60">Geo</th>
              <th className="text-left px-3 py-2 text-zinc-400 font-semibold border-b border-zinc-800/60 w-16"></th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => (
              <tr key={i} className="border-b border-zinc-800/30 last:border-b-0 hover:bg-zinc-800/20 transition-colors">
                <td className="px-3 py-2 font-mono text-[11px] text-amber-300/80 max-w-[280px] truncate" title={e.url}>{e.url}</td>
                <td className="px-3 py-2 text-zinc-400">{e.description}</td>
                <td className="px-3 py-2 text-zinc-500">{e.geo}</td>
                <td className="px-3 py-2">
                  <button
                    onClick={() => handleCopy(i, e)}
                    className="text-[10px] text-zinc-600 hover:text-zinc-300 transition-colors px-2 py-0.5 rounded hover:bg-zinc-700/50"
                    title="Copia snippet bind"
                  >
                    {copiedIdx === i ? '✓' : 'bind'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SectionRegistroFonti() {
  return (
    <section>
      <h2 className="text-2xl font-bold text-white mb-4">Registro fonti verificate <span className="text-xs font-normal text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full ml-2">v0.2</span></h2>
      <p className="text-zinc-400 leading-relaxed mb-4">
        SDL fornisce un <strong className="text-zinc-200">catalogo curato di fonti dati reali</strong> che puoi usare
        nei blocchi <code className="text-amber-300/80">bind</code> e <code className="text-amber-300/80">calibrate</code>.
        Ogni URL e' verificato e gestito da un adapter Pulse dedicato.
      </p>
      <p className="text-zinc-400 leading-relaxed mb-6">
        Clicca il pulsante <strong className="text-zinc-200">bind</strong> su ogni riga per copiare
        lo snippet SDL pronto da incollare nel tuo scenario.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        {[
          ['Eurostat', '#60a5fa', 'API pubblica UE — demografia, energia, economia, digitale. Nessuna API key richiesta.'],
          ['World Bank', '#34d399', 'Indicatori globali — popolazione, CO\u2082, PIL, urbanizzazione. Nessuna API key richiesta.'],
          ['SDL Fallback', '#fbbf24', 'Dati storici curati, inclusi nel bundle SDL. Funzionano sempre, anche offline.'],
        ].map(([name, color, desc]) => (
          <div key={name} className="bg-zinc-900/40 border border-zinc-800/60 rounded-lg p-3">
            <p className="text-sm font-semibold mb-1" style={{ color }}>{name}</p>
            <p className="text-[11px] text-zinc-500 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      <h3 className="text-lg font-semibold text-white mt-8 mb-4">Demografia</h3>
      <SourceTable
        title="Eurostat"
        color="#60a5fa"
        entries={[
          { url: 'ec.europa.eu/eurostat/databrowser/view/demo_frate', field: 'fertility_rate', description: 'Tasso di fecondita\'', geo: 'EU27, IT, DE, FR...' },
          { url: 'ec.europa.eu/eurostat/databrowser/view/demo_pjan', field: 'population_millions', description: 'Popolazione al 1° gennaio', geo: 'EU27, IT, DE, FR...' },
          { url: 'ec.europa.eu/eurostat/databrowser/view/demo_pjanind', field: 'old_age_dependency_ratio', description: 'Indice di dipendenza anziani', geo: 'EU27, IT, DE, FR...' },
        ]}
      />
      <SourceTable
        title="World Bank"
        color="#34d399"
        entries={[
          { url: 'data.worldbank.org/indicator/SP.POP.GROW', field: 'annual_growth_rate_pct', description: 'Crescita demografica annua (%)', geo: 'Globale, SSF, IT...' },
          { url: 'data.worldbank.org/indicator/SP.URB.TOTL.IN.ZS', field: 'urbanization_rate_pct', description: 'Popolazione urbana (%)', geo: 'Globale, SSF, IT...' },
          { url: 'data.worldbank.org/indicator/SP.DYN.TFRT.IN', field: 'fertility_rate', description: 'Tasso fecondita\' (globale)', geo: 'Globale, SSF, IT...' },
          { url: 'data.worldbank.org/indicator/SP.DYN.LE00.IN', field: 'life_expectancy_years', description: 'Aspettativa di vita alla nascita', geo: 'Globale, IT, DE...' },
          { url: 'data.worldbank.org/indicator/SM.POP.NETM', field: 'net_migration', description: 'Migrazione netta', geo: 'Globale, IT, DE...' },
        ]}
      />

      <h3 className="text-lg font-semibold text-white mt-8 mb-4">Energia e clima</h3>
      <SourceTable
        title="Eurostat"
        color="#60a5fa"
        entries={[
          { url: 'ec.europa.eu/eurostat/databrowser/view/nrg_ind_ren', field: 'renewable_share_pct', description: 'Quota rinnovabili nel mix energetico', geo: 'EU27, IT, DE...' },
          { url: 'ec.europa.eu/eurostat/databrowser/view/env_air_gge', field: 'ghg_total_mt', description: 'Emissioni gas serra (MtCO\u2082eq)', geo: 'EU27, IT, DE...' },
          { url: 'ec.europa.eu/eurostat/databrowser/view/nrg_pc_204', field: 'price_eur_kwh', description: 'Prezzi elettricita\' famiglie', geo: 'EU27, IT, DE...' },
        ]}
      />
      <SourceTable
        title="World Bank"
        color="#34d399"
        entries={[
          { url: 'data.worldbank.org/indicator/EN.ATM.CO2E.KT', field: 'co2_kt', description: 'Emissioni CO\u2082 (kt)', geo: 'Globale, IT, SSF...' },
          { url: 'data.worldbank.org/indicator/EG.FEC.RNEW.ZS', field: 'renewable_pct', description: 'Consumo energia rinnovabile (%)', geo: 'Globale, IT...' },
        ]}
      />
      <SourceTable
        title="SDL Fallback (dati inclusi)"
        color="#fbbf24"
        entries={[
          { url: 'sdl:fallback/eu-ets-carbon-price', field: 'price_per_ton_eur', description: 'Prezzo carbonio EU ETS (\u20ac/tCO\u2082)', geo: 'EU' },
          { url: 'sdl:fallback/datacenter-energy', field: 'twh_annual', description: 'Consumo energetico data center (TWh)', geo: 'Globale' },
          { url: 'sdl:fallback/mediterranean-precipitation', field: 'precipitation_index', description: 'Indice precipitazioni Mediterraneo', geo: 'IT, ES, GR...' },
          { url: 'sdl:fallback/mediterranean-temperature', field: 'annual_anomaly_celsius', description: 'Anomalia temperatura Mediterraneo', geo: 'IT, ES, GR...' },
        ]}
      />

      <h3 className="text-lg font-semibold text-white mt-8 mb-4">Economia e occupazione</h3>
      <SourceTable
        title="Eurostat"
        color="#60a5fa"
        entries={[
          { url: 'ec.europa.eu/eurostat/databrowser/view/lfsi_emp_a', field: 'employment_rate', description: 'Tasso occupazione (20-64 anni)', geo: 'EU27, IT, DE...' },
          { url: 'ec.europa.eu/eurostat/databrowser/view/nama_10_gdp', field: 'gdp_million_eur', description: 'PIL (milioni di euro)', geo: 'EU27, IT, DE...' },
          { url: 'ec.europa.eu/eurostat/databrowser/view/une_rt_a', field: 'unemployment_rate_pct', description: 'Tasso disoccupazione', geo: 'EU27, IT, DE...' },
        ]}
      />
      <SourceTable
        title="World Bank"
        color="#34d399"
        entries={[
          { url: 'data.worldbank.org/indicator/NY.GDP.MKTP.CD', field: 'gdp_usd', description: 'PIL (USD correnti)', geo: 'Globale, IT, SSF...' },
          { url: 'data.worldbank.org/indicator/SL.UEM.TOTL.ZS', field: 'unemployment_rate_pct', description: 'Disoccupazione (% forza lavoro)', geo: 'Globale, IT...' },
          { url: 'data.worldbank.org/indicator/SI.POV.GINI', field: 'gini_index', description: 'Indice Gini (disuguaglianza)', geo: 'Globale, IT...' },
        ]}
      />
      <SourceTable
        title="SDL Fallback (dati inclusi)"
        color="#fbbf24"
        entries={[
          { url: 'sdl:fallback/pharma-rd-spend', field: 'total_billion_usd', description: 'Spesa R&D farmaceutica globale (mld USD)', geo: 'Globale' },
        ]}
      />

      <h3 className="text-lg font-semibold text-white mt-8 mb-4">Digitale</h3>
      <SourceTable
        title="Eurostat"
        color="#60a5fa"
        entries={[
          { url: 'ec.europa.eu/eurostat/databrowser/view/isoc_ci_ifp_iu', field: 'digital_payment_adoption_pct', description: 'Adozione pagamenti digitali', geo: 'EU27, IT, DE...' },
          { url: 'ec.europa.eu/eurostat/databrowser/view/isoc_cicce_use', field: 'eu_cloud_market_share_pct', description: 'Adozione cloud computing imprese', geo: 'EU27, IT...' },
          { url: 'ec.europa.eu/eurostat/databrowser/view/isoc_ci_in_h', field: 'digital_skills_index', description: 'Competenze digitali di base', geo: 'EU27, IT, DE...' },
        ]}
      />
      <SourceTable
        title="World Bank"
        color="#34d399"
        entries={[
          { url: 'data.worldbank.org/indicator/IT.NET.USER.ZS', field: 'internet_users_pct', description: 'Utenti Internet (%)', geo: 'Globale, IT, SSF...' },
        ]}
      />

      <h3 className="text-lg font-semibold text-white mt-8 mb-4">Salute</h3>
      <SourceTable
        title="World Bank"
        color="#34d399"
        entries={[
          { url: 'data.worldbank.org/indicator/SH.XPD.CHEX.GD.ZS', field: 'health_expenditure_gdp_pct', description: 'Spesa sanitaria (% PIL)', geo: 'Globale, IT...' },
        ]}
      />
      <SourceTable
        title="SDL Fallback (dati inclusi)"
        color="#fbbf24"
        entries={[
          { url: 'sdl:fallback/fda-novel-approvals', field: 'novel_approvals', description: 'Approvazioni FDA (farmaci nuovi/anno)', geo: 'US' },
          { url: 'sdl:fallback/who-genomic-surveillance', field: 'global_coverage_pct', description: 'Copertura sorveglianza genomica', geo: 'Globale' },
          { url: 'sdl:fallback/amr-mortality', field: 'annual_deaths_millions', description: 'Mortalita\' resistenza antimicrobica (mln)', geo: 'Globale' },
          { url: 'sdl:fallback/ihr-compliance', field: 'global_compliance_index', description: 'Indice conformita\' IHR (WHO)', geo: 'Globale' },
        ]}
      />

      <h3 className="text-lg font-semibold text-white mt-8 mb-4">Difesa, trasporti e governance</h3>
      <SourceTable
        title="World Bank"
        color="#34d399"
        entries={[
          { url: 'data.worldbank.org/indicator/MS.MIL.XPND.GD.ZS', field: 'military_gdp_pct', description: 'Spesa militare (% PIL)', geo: 'Globale, IT, DE...' },
        ]}
      />
      <SourceTable
        title="SDL Fallback (dati inclusi)"
        color="#fbbf24"
        entries={[
          { url: 'sdl:fallback/ev-share-eu', field: 'ev_share_pct', description: 'Quota mercato EV (nuove immatricolazioni UE)', geo: 'EU27' },
          { url: 'sdl:fallback/edpb-enforcement', field: 'maturity_index', description: 'Indice enforcement DPA (EDPB)', geo: 'EU' },
          { url: 'sdl:fallback/cctv-density-eu', field: 'cameras_per_1000', description: 'Telecamere per 1.000 abitanti', geo: 'EU' },
        ]}
      />

      <h3 className="text-lg font-semibold text-white mt-8 mb-3">Esempio: usare il registro</h3>
      <CodeBlock title="Assumption con fonte verificata Eurostat" code={`assumption tasso_fecondita {
  value: 1.24
  source: "Eurostat demo_frate, 2024"
  confidence: 0.9
  uncertainty: normal(±5%)

  bind {
    source: "https://ec.europa.eu/eurostat/databrowser/view/demo_frate"
    refresh: yearly
    field: "fertility_rate"
    fallback: 1.24
  }
}`} />
      <CodeBlock title="Assumption con fonte verificata World Bank" code={`assumption crescita_popolazione {
  value: 2.7
  source: "World Bank SP.POP.GROW, 2023"
  confidence: 0.8
  uncertainty: normal(±3%)

  bind {
    source: "https://data.worldbank.org/indicator/SP.POP.GROW"
    refresh: yearly
    field: "annual_growth_rate_pct"
    fallback: 2.7
  }
}`} />
      <CodeBlock title="Assumption con fallback incluso" code={`assumption prezzo_carbonio {
  value: 72 EUR
  source: "EU ETS, media 2025"
  confidence: 0.6
  uncertainty: normal(±25%)

  bind {
    source: "sdl:fallback/eu-ets-carbon-price"
    refresh: daily
    field: "price_per_ton_eur"
    fallback: 72
  }
}`} />

      <Tip>
        <strong>Usa solo URL dal registro:</strong> il sistema Pulse gestisce automaticamente
        il fetch dei dati per gli URL verificati. URL esterni non riconosciuti verranno ignorati.
        Se hai bisogno di una fonte non presente, puoi registrare fallback personalizzati via API.
      </Tip>

      <Tip>
        <strong>Eurostat vs World Bank:</strong> usa Eurostat per dati EU-specifici (piu' granulari e aggiornati).
        Usa World Bank per confronti globali o dati su paesi extra-UE (Africa, Asia, ecc.).
        Usa i fallback per indicatori di nicchia dove non esistono API pubbliche gratuite.
      </Tip>
    </section>
  );
}

function SectionMonitoraggio() {
  return (
    <section>
      <h2 className="text-2xl font-bold text-white mb-4">Monitoraggio (watch) <span className="text-xs font-normal text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full ml-2">v0.2</span></h2>
      <p className="text-zinc-400 leading-relaxed mb-4">
        Il blocco <code className="text-amber-300/80">watch</code> definisce regole di monitoraggio: 
        quando il dato reale (ottenuto via <code className="text-amber-300/80">bind</code>) devia troppo 
        dal valore assunto, il sistema genera un <strong className="text-zinc-200">alert</strong>.
      </p>

      <CodeBlock title="Sintassi (dentro un'assunzione)" code={`assumption tasso_occupazione {
  value: 65.4%
  source: "Eurostat lfsi_emp_a, 2024"
  uncertainty: normal(±5%)

  bind {
    source: "https://ec.europa.eu/eurostat/databrowser/view/lfsi_emp_a"
    refresh: quarterly
    field: "employment_rate"
    fallback: 65.4
  }

  watch {
    warn  when: actual < assumed * 0.9    // Warning: -10%
    error when: actual < assumed * 0.8    // Errore: -20%
  }
}`} />

      <h3 className="text-lg font-semibold text-white mt-8 mb-3">Livelli di alert</h3>
      <Table
        headers={['Livello', 'Significato', 'Visualizzazione']}
        rows={[
          ['warn', 'Il dato reale devia significativamente', 'Badge giallo con messaggio di avviso'],
          ['error', 'Il dato reale e\' in contraddizione con l\'assunzione', 'Badge rosso con messaggio critico'],
        ]}
      />

      <h3 className="text-lg font-semibold text-white mt-8 mb-3">Variabili nelle condizioni</h3>
      <p className="text-zinc-400 leading-relaxed mb-3">
        All'interno delle condizioni <code className="text-amber-300/80">when</code> puoi usare:
      </p>
      <Table
        headers={['Variabile', 'Significato']}
        rows={[
          ['actual', 'Il valore reale ottenuto dal bind'],
          ['assumed', 'Il valore dichiarato nell\'assunzione'],
        ]}
      />

      <h3 className="text-lg font-semibold text-white mt-8 mb-3">Watch top-level</h3>
      <p className="text-zinc-400 leading-relaxed mb-3">
        Oltre che dentro le assunzioni, <code className="text-amber-300/80">watch</code> puo' essere 
        dichiarato a livello top-level per monitorare una variabile specifica:
      </p>
      <CodeBlock title="Watch top-level" code={`watch quota_rinnovabili {
  warn  when: actual < assumed * 0.8
  error when: actual < assumed * 0.6
  on_trigger: recalculate
}`} />

      <h3 className="text-lg font-semibold text-white mt-8 mb-3">Azioni su trigger</h3>
      <Table
        headers={['Azione', 'Descrizione']}
        rows={[
          ['recalculate', 'Rilancia la simulazione con i dati aggiornati'],
          ['notify', 'Invia una notifica all\'utente'],
          ['suggest_update', 'Suggerisce di aggiornare l\'assunzione'],
        ]}
      />

      <Tip>
        <strong>Quando usare watch:</strong> aggiungi watch alle assunzioni che hanno un bind attivo 
        e che sono critiche per lo scenario. Cosi' saprai subito se la realta' si discosta dalle tue ipotesi.
      </Tip>
    </section>
  );
}

function SectionCalibrazione() {
  return (
    <section>
      <h2 className="text-2xl font-bold text-white mb-4">Calibrazione <span className="text-xs font-normal text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full ml-2">v0.2</span></h2>
      <p className="text-zinc-400 leading-relaxed mb-4">
        Il blocco <code className="text-amber-300/80">calibrate</code> usa dati storici per 
        <strong className="text-zinc-200"> aggiornare automaticamente le distribuzioni di incertezza</strong>.
        Man mano che i dati reali si accumulano, le previsioni diventano piu' precise: 
        le bande del fan chart si restringono.
      </p>

      <CodeBlock title="Sintassi" code={`calibrate nome_variabile {
  historical: "https://ec.europa.eu/eurostat/databrowser/view/nrg_ind_ren"
  method: bayesian_update
  window: 5y
  prior: normal(±15%)
  update_frequency: monthly
}`} />

      <h3 className="text-lg font-semibold text-white mt-8 mb-3">Proprieta'</h3>
      <Table
        headers={['Campo', 'Tipo', 'Obbligatorio', 'Descrizione']}
        rows={[
          ['historical', 'URL', 'Consigliato', 'URL dei dati storici per la calibrazione'],
          ['method', 'bayesian_update | maximum_likelihood | ensemble', 'No', 'Algoritmo di calibrazione (default: bayesian_update)'],
          ['window', 'Durata (es. 5y)', 'No', 'Finestra temporale dei dati storici da considerare'],
          ['prior', 'Distribuzione', 'No', 'Distribuzione a priori (sovrascrive quella della variabile)'],
          ['update_frequency', 'daily | monthly | quarterly | yearly', 'No', 'Con quale frequenza aggiornare la calibrazione'],
        ]}
      />

      <h3 className="text-lg font-semibold text-white mt-8 mb-3">Metodi di calibrazione</h3>
      <div className="space-y-3">
        <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-lg p-4">
          <p className="text-sm font-semibold text-blue-400 mb-1">bayesian_update</p>
          <p className="text-[12px] text-zinc-400">
            Aggiornamento bayesiano: combina la distribuzione a priori (prior) con i dati osservati 
            per produrre una distribuzione a posteriori piu' stretta. Il metodo piu' robusto e comune.
          </p>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-lg p-4">
          <p className="text-sm font-semibold text-emerald-400 mb-1">maximum_likelihood</p>
          <p className="text-[12px] text-zinc-400">
            Massima verosimiglianza: trova i parametri della distribuzione che meglio spiegano i dati osservati. 
            Piu' semplice ma meno robusto con pochi dati.
          </p>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-lg p-4">
          <p className="text-sm font-semibold text-amber-400 mb-1">ensemble</p>
          <p className="text-[12px] text-zinc-400">
            Ensemble: media pesata di piu' metodi di calibrazione. 
            Utile quando non c'e' un metodo chiaramente preferibile.
          </p>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-white mt-8 mb-3">Esempio completo</h3>
      <CodeBlock code={`// La variabile quota_rinnovabili ha uncertainty: normal(±12%)
// Con i dati Eurostat degli ultimi 5 anni, la calibrazione
// puo' restringere l'incertezza a ±7% se i dati sono coerenti

calibrate quota_rinnovabili {
  historical: "https://ec.europa.eu/eurostat/databrowser/view/nrg_ind_ren"
  method: bayesian_update
  window: 5y
  prior: normal(±12%)
  update_frequency: monthly
}

calibrate emissioni_co2 {
  historical: "https://ec.europa.eu/eurostat/databrowser/view/env_air_gge"
  method: ensemble
  window: 10y
  prior: normal(±15%)
  update_frequency: yearly
}`} />

      <h3 className="text-lg font-semibold text-white mt-8 mb-3">Cosa succede nell'interfaccia</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          ['Badge "Calibrato"', 'Lo scenario mostra un badge blu quando la calibrazione e\' attiva e ha ridotto l\'incertezza'],
          ['Fan chart piu\' stretti', 'Le bande di incertezza si restringono dove i dati storici confermano le proiezioni'],
          ['Prior vs Posterior', 'Il sistema mostra la distribuzione originale vs quella calibrata'],
          ['Aggiornamento continuo', 'La calibrazione si rinnova automaticamente alla frequenza specificata'],
        ].map(([title, desc]) => (
          <div key={title} className="bg-zinc-900/40 border border-zinc-800/60 rounded-lg p-3">
            <p className="text-sm font-semibold text-zinc-200 mb-1">{title}</p>
            <p className="text-[12px] text-zinc-500 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      <Tip>
        <strong>Importante:</strong> il target del <code>calibrate</code> deve corrispondere al nome 
        di una variabile o assunzione dichiarata nello scenario. Se il nome non corrisponde, 
        la validazione fallira' con errore SDL-E005.
      </Tip>

      <Tip>
        <strong>bind + watch + calibrate:</strong> queste tre funzionalita' lavorano insieme. 
        <code>bind</code> recupera i dati, <code>watch</code> verifica la coerenza, 
        <code>calibrate</code> aggiorna le distribuzioni. Insieme rendono lo scenario <em>vivente</em>: 
        si auto-aggiorna e auto-corregge con i dati reali.
      </Tip>
    </section>
  );
}

function SectionSimulazione() {
  return (
    <section>
      <h2 className="text-2xl font-bold text-white mb-4">Simulazione</h2>
      <p className="text-zinc-400 leading-relaxed mb-4">
        Il blocco <code className="text-amber-300/80">simulate</code> configura il motore Monte Carlo.
        Il simulatore esegue migliaia di run, campionando ogni volta valori diversi dalle distribuzioni
        di incertezza, e produce distribuzioni di probabilita' per ogni variabile e impatto.
      </p>

      <CodeBlock title="Sintassi" code={`simulate {
  runs: 2000              // Numero di simulazioni
  method: monte_carlo     // Metodo di campionamento
  seed: 42                // Seed per riproducibilita'
  output: distribution    // Formato output
  percentiles: [5, 25, 50, 75, 95]  // Percentili da calcolare
  convergence: 0.01       // Soglia di convergenza
  timeout: 30s            // Timeout massimo
}`} />

      <h3 className="text-lg font-semibold text-white mt-8 mb-3">Parametri</h3>
      <Table
        headers={['Campo', 'Default', 'Descrizione']}
        rows={[
          ['runs', '1000', 'Numero di simulazioni. Piu\' run = risultati piu\' stabili'],
          ['method', 'monte_carlo', 'Metodo di campionamento'],
          ['seed', 'casuale', 'Seed per riproducibilita\' (stesso seed = stessi risultati)'],
          ['output', 'distribution', 'Formato output: distribution, percentiles, summary, full'],
          ['percentiles', '[5,25,50,75,95]', 'Quali percentili calcolare'],
          ['convergence', '0.01', 'Stop anticipato se i risultati si stabilizzano (1%)'],
          ['timeout', '30s', 'Tempo massimo di simulazione'],
        ]}
      />

      <h3 className="text-lg font-semibold text-white mt-8 mb-3">Metodi di campionamento</h3>
      <Table
        headers={['Metodo', 'Descrizione', 'Quando usarlo']}
        rows={[
          ['monte_carlo', 'Campionamento casuale puro', 'Uso generale (default)'],
          ['latin_hypercube', 'Campionamento stratificato', 'Migliore copertura con meno run'],
          ['sobol', 'Sequenze quasi-casuali', 'Analisi di sensitivita\''],
        ]}
      />

      <h3 className="text-lg font-semibold text-white mt-8 mb-3">Come leggere i risultati</h3>
      <p className="text-zinc-400 leading-relaxed mb-3">
        I <strong className="text-zinc-200">fan chart</strong> mostrano la distribuzione dei risultati:
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-lg p-3 text-center">
          <div className="w-12 h-3 rounded-full bg-blue-400/20 mx-auto mb-2" />
          <p className="text-xs font-semibold text-zinc-300">Banda esterna (P5-P95)</p>
          <p className="text-[11px] text-zinc-500">90% dei risultati cade qui</p>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-lg p-3 text-center">
          <div className="w-12 h-3 rounded-full bg-blue-400/40 mx-auto mb-2" />
          <p className="text-xs font-semibold text-zinc-300">Banda interna (P25-P75)</p>
          <p className="text-[11px] text-zinc-500">50% dei risultati cade qui</p>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-lg p-3 text-center">
          <div className="w-12 h-1.5 rounded-full bg-blue-400 mx-auto mb-2 mt-0.5" />
          <p className="text-xs font-semibold text-zinc-300">Linea mediana (P50)</p>
          <p className="text-[11px] text-zinc-500">Il risultato piu' probabile</p>
        </div>
      </div>
    </section>
  );
}

function SectionDistribuzioni() {
  return (
    <section>
      <h2 className="text-2xl font-bold text-white mb-4">Distribuzioni di incertezza</h2>
      <p className="text-zinc-400 leading-relaxed mb-4">
        Le distribuzioni sono il modo in cui SDL rappresenta l'<strong className="text-zinc-200">incertezza</strong>.
        Ogni assunzione e variabile puo' avere una distribuzione che descrive quanto i valori
        reali potrebbero deviare dalle stime.
      </p>

      <Table
        headers={['Distribuzione', 'Sintassi', 'Quando usarla']}
        rows={[
          ['Normale', 'normal(±15%)', 'Incertezza simmetrica attorno al valore (piu\' comune)'],
          ['Normale (parametrica)', 'normal(media, deviazione)', 'Quando conosci media e deviazione standard'],
          ['Uniforme', 'uniform(min, max)', 'Probabilita\' uguale in tutto il range'],
          ['Beta', 'beta(alpha, beta)', 'Valori tra 0 e 1, forma flessibile'],
          ['Triangolare', 'triangular(min, moda, max)', 'Quando conosci il valore piu\' probabile e i limiti'],
          ['Lognormale', 'lognormal(mu, sigma)', 'Valori positivi con asimmetria a destra'],
        ]}
      />

      <h3 className="text-lg font-semibold text-white mt-8 mb-3">Guida alla scelta</h3>
      <div className="space-y-3">
        <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-lg p-4">
          <p className="text-sm font-semibold text-blue-400 mb-1">normal(±X%)</p>
          <p className="text-[12px] text-zinc-400">La scelta piu' comune. "Il valore potrebbe deviare di ±X% dal previsto".
            Esempio: <code className="text-amber-300/80">normal(±15%)</code> = potrebbe essere 15% sopra o sotto.</p>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-lg p-4">
          <p className="text-sm font-semibold text-emerald-400 mb-1">beta(a, b)</p>
          <p className="text-[12px] text-zinc-400">Per valori tra 0 e 1 (probabilita', indici normalizzati). 
            <code className="text-amber-300/80">beta(8, 2)</code> = concentrata verso 1.
            <code className="text-amber-300/80"> beta(2, 8)</code> = concentrata verso 0.</p>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-lg p-4">
          <p className="text-sm font-semibold text-amber-400 mb-1">uniform(min, max)</p>
          <p className="text-[12px] text-zinc-400">Quando non hai idea di quale valore sia piu' probabile nel range.
            Esempio: <code className="text-amber-300/80">uniform(0.5, 1.5)</code> = equiprobabile tra 0.5 e 1.5.</p>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-lg p-4">
          <p className="text-sm font-semibold text-purple-400 mb-1">triangular(min, moda, max)</p>
          <p className="text-[12px] text-zinc-400">Quando conosci il minimo, il massimo, e il valore piu' probabile.
            Esempio: <code className="text-amber-300/80">triangular(10, 25, 60)</code></p>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-lg p-4">
          <p className="text-sm font-semibold text-red-400 mb-1">lognormal(mu, sigma)</p>
          <p className="text-[12px] text-zinc-400">Per valori che non possono essere negativi e tendono ad avere "code" lunghe a destra.
            Esempio: prezzi, costi, tempi.</p>
        </div>
      </div>
    </section>
  );
}

function SectionRiferimento() {
  return (
    <section>
      <h2 className="text-2xl font-bold text-white mb-4">Riferimento rapido</h2>
      <p className="text-zinc-400 leading-relaxed mb-6">
        Un riepilogo di tutti i costrutti SDL con la sintassi essenziale.
      </p>

      <h3 className="text-lg font-semibold text-white mt-6 mb-3">Parole chiave</h3>
      <div className="flex flex-wrap gap-1.5 mb-6">
        {[
          'scenario', 'variable', 'assumption', 'parameter', 'branch',
          'impact', 'simulate', 'watch', 'calibrate', 'bind',
          'when', 'and', 'or', 'not', 'depends_on', 'model',
          'uncertainty', 'source', 'confidence', 'timeframe', 'resolution',
          'normal', 'uniform', 'beta', 'triangular', 'lognormal',
          'linear', 'logistic', 'exponential', 'sigmoid',
          'yearly', 'monthly', 'weekly', 'daily', 'quarterly',
          'derives_from', 'formula', 'interpolation',
          'label', 'step', 'format', 'control', 'icon', 'color',
          'category', 'subtitle', 'difficulty',
          'refresh', 'field', 'fallback', 'historical', 'method',
          'window', 'prior', 'update_frequency',
          'bayesian_update', 'maximum_likelihood', 'ensemble',
          'warn', 'error', 'actual', 'assumed', 'on_trigger',
        ].map(kw => (
          <span key={kw} className="text-[11px] font-mono bg-zinc-800/60 text-amber-300/70 px-2 py-1 rounded-md">{kw}</span>
        ))}
      </div>

      <h3 className="text-lg font-semibold text-white mt-6 mb-3">Operatori</h3>
      <Table
        headers={['Categoria', 'Operatori']}
        rows={[
          ['Aritmetici', '+  -  *  /  ^  %'],
          ['Confronto', '>  <  >=  <=  ==  !='],
          ['Logici', 'and  or  not'],
          ['Assegnazione', ':'],
          ['Range', '->'],
          ['Deviazione', '±'],
        ]}
      />

      <h3 className="text-lg font-semibold text-white mt-6 mb-3">Funzioni built-in</h3>
      <Table
        headers={['Funzione', 'Descrizione']}
        rows={[
          ['min(a, b)', 'Minimo tra due valori'],
          ['max(a, b)', 'Massimo tra due valori'],
          ['clamp(val, lo, hi)', 'Vincola il valore nel range'],
          ['abs(x)', 'Valore assoluto'],
          ['sqrt(x)', 'Radice quadrata'],
          ['log(x)', 'Logaritmo naturale'],
          ['pow(base, exp)', 'Esponenziazione'],
          ['round(x, dec)', 'Arrotondamento a N decimali'],
          ['sum(array)', 'Somma degli elementi'],
          ['avg(array)', 'Media degli elementi'],
          ['cumulative(serie)', 'Totale cumulativo di una serie'],
          ['delta(serie)', 'Variazione anno su anno'],
          ['growth_rate(serie)', 'Tasso di crescita anno su anno'],
        ]}
      />

      <h3 className="text-lg font-semibold text-white mt-6 mb-3">Suffissi di magnitudine</h3>
      <Table
        headers={['Suffisso', 'Valore', 'Esempio']}
        rows={[
          ['K', '10^3 (mille)', '100K = 100.000'],
          ['M', '10^6 (milione)', '5M EUR = 5.000.000 EUR'],
          ['B', '10^9 (miliardo)', '3B EUR = 3.000.000.000 EUR'],
          ['T', '10^12 (trilione)', '1T = 1.000.000.000.000'],
        ]}
      />

      <h3 className="text-lg font-semibold text-white mt-6 mb-3">Valute supportate</h3>
      <div className="flex flex-wrap gap-2">
        {['EUR', 'USD', 'GBP', 'CHF', 'JPY', 'CNY'].map(c => (
          <span key={c} className="text-xs font-mono bg-zinc-800/60 text-zinc-300 px-3 py-1.5 rounded-lg">{c}</span>
        ))}
      </div>

      <h3 className="text-lg font-semibold text-white mt-8 mb-3">Schema completo</h3>
      <CodeBlock title="Scenario completo (v0.2)" code={`scenario "Nome" {
  timeframe: 2025 -> 2040
  resolution: yearly
  confidence: 0.6
  author: "Autore"
  version: "1.0"
  description: "Descrizione"
  tags: ["tag1", "tag2"]
  subtitle: "Sottotitolo"
  category: tecnologia
  icon: "🔬"
  color: "#3b82f6"
  difficulty: intermedio

  assumption nome {
    value: 100
    source: "Fonte"
    confidence: 0.7
    uncertainty: normal(±20%)

    bind {                           // v0.2
      source: "https://ec.europa.eu/eurostat/databrowser/view/demo_frate"
      refresh: yearly
      field: "fertility_rate"
      fallback: 100
    }

    watch {                          // v0.2
      warn  when: actual < assumed * 0.7
      error when: actual < assumed * 0.5
    }
  }

  parameter nome {
    value: 50
    range: [10, 100]
    description: "Descrizione"
    label: "Nome leggibile"
    unit: "unita'"
    step: 5
    format: "{value} unita'"
    control: slider
    icon: "⚙"
    color: "#10b981"
  }

  variable nome {
    description: "Descrizione"
    unit: "unita'"
    label: "Nome leggibile"
    icon: "📊"
    color: "#3b82f6"
    2025: 100
    2030: 150
    2040: 200
    depends_on: assunzione1
    uncertainty: normal(±15%)
    interpolation: linear
  }

  branch "Alternativa" when condizione {
    probability: 0.15
    variable nome {
      2030: valore_alternativo
      uncertainty: normal(±20%)
    }
  }

  impact nome {
    description: "Descrizione"
    unit: "unita'"
    label: "Nome leggibile"
    icon: "🎯"
    color: "#ef4444"
    derives_from: var1, var2
    formula: var1 - var2
  }

  calibrate nome {                   // v0.2
    historical: "https://ec.europa.eu/eurostat/databrowser/view/nrg_ind_ren"
    method: bayesian_update
    window: 5y
    prior: normal(±15%)
    update_frequency: monthly
  }

  simulate {
    runs: 2000
    method: monte_carlo
    seed: 42
    output: distribution
    percentiles: [5, 25, 50, 75, 95]
  }
}`} />
    </section>
  );
}

// ═══════════════════════════════════════════
// Section renderer
// ═══════════════════════════════════════════

const SECTION_COMPONENTS: Record<GuideSectionId, React.FC> = {
  panoramica: SectionPanoramica,
  struttura: SectionStruttura,
  assunzioni: SectionAssunzioni,
  variabili: SectionVariabili,
  parametri: SectionParametri,
  branches: SectionBranches,
  impatti: SectionImpatti,
  'dati-reali': SectionDatiReali,
  'registro-fonti': SectionRegistroFonti,
  monitoraggio: SectionMonitoraggio,
  calibrazione: SectionCalibrazione,
  simulazione: SectionSimulazione,
  distribuzioni: SectionDistribuzioni,
  riferimento: SectionRiferimento,
};

// ═══════════════════════════════════════════
// Main Guide View
// ═══════════════════════════════════════════

interface GuideViewProps {
  initialSection?: GuideSectionId;
}

export default function GuideView({ initialSection }: GuideViewProps) {
  const [activeSection, setActiveSection] = useState<GuideSectionId>(initialSection ?? 'panoramica');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialSection) setActiveSection(initialSection);
  }, [initialSection]);

  useEffect(() => {
    contentRef.current?.scrollTo(0, 0);
  }, [activeSection]);

  const currentIdx = GUIDE_SECTIONS.findIndex(s => s.id === activeSection);
  const prevSection = currentIdx > 0 ? GUIDE_SECTIONS[currentIdx - 1] : null;
  const nextSection = currentIdx < GUIDE_SECTIONS.length - 1 ? GUIDE_SECTIONS[currentIdx + 1] : null;

  const SectionComponent = SECTION_COMPONENTS[activeSection];
  const currentSection = GUIDE_SECTIONS.find(s => s.id === activeSection)!;

  return (
    <div className="min-h-full animate-fade-in">
      {/* Header */}
      <header className="relative overflow-hidden border-b border-zinc-800">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-600/5 via-transparent to-orange-600/5" />
        <div className="relative max-w-full px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl bg-amber-500/10">
              &#128214;
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest font-medium px-2 py-0.5 rounded-full text-amber-400 bg-amber-400/10">
                Guida
              </span>
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight mb-2">
            Guida SDL
          </h1>
          <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed mb-4">
            Impara a scrivere scenari in SDL: dalla struttura base fino ai dati reali, alla calibrazione bayesiana e alle simulazioni Monte Carlo.
          </p>

          {/* Section tabs */}
          <div className="flex flex-wrap gap-1.5">
            {GUIDE_SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-lg transition-all
                  ${activeSection === s.id
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/20'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60 border border-transparent'}
                `}
              >
                <SdlIcon name={s.icon} size={13} />
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <div ref={contentRef} className="max-w-4xl mx-auto px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-[11px] text-zinc-600">
          <span>Guida SDL</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="flex items-center gap-1 text-amber-400/60"><SdlIcon name={currentSection.icon} size={12} /> {currentSection.label}</span>
        </div>

        {/* Section content */}
        <SectionComponent />

        {/* Prev/Next navigation */}
        <div className="flex items-center justify-between mt-12 pt-6 border-t border-zinc-800/60">
          {prevSection ? (
            <button
              onClick={() => setActiveSection(prevSection.id)}
              className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors group"
            >
              <svg className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <div className="text-left">
                <p className="text-[10px] text-zinc-600">Precedente</p>
                <p className="font-medium flex items-center gap-1.5"><SdlIcon name={prevSection.icon} size={14} /> {prevSection.label}</p>
              </div>
            </button>
          ) : <div />}

          {nextSection ? (
            <button
              onClick={() => setActiveSection(nextSection.id)}
              className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors group"
            >
              <div className="text-right">
                <p className="text-[10px] text-zinc-600">Successiva</p>
                <p className="font-medium flex items-center justify-end gap-1.5">{nextSection.label} <SdlIcon name={nextSection.icon} size={14} /></p>
              </div>
              <svg className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : <div />}
        </div>
      </div>
    </div>
  );
}
