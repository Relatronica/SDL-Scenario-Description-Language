/**
 * SDL Guide View
 *
 * Interactive documentation for the SDL language.
 * Covers all constructs with practical examples.
 */

import { useState, useRef, useEffect } from 'react';

// ═══════════════════════════════════════════
// Guide section data
// ═══════════════════════════════════════════

export const GUIDE_SECTIONS = [
  { id: 'panoramica', label: 'Panoramica', icon: '🔭' },
  { id: 'struttura', label: 'Struttura scenario', icon: '🏗' },
  { id: 'assunzioni', label: 'Assunzioni', icon: '📌' },
  { id: 'variabili', label: 'Variabili', icon: '📊' },
  { id: 'parametri', label: 'Parametri', icon: '⚙' },
  { id: 'branches', label: 'Branches', icon: '🔀' },
  { id: 'impatti', label: 'Impatti', icon: '🎯' },
  { id: 'simulazione', label: 'Simulazione', icon: '🎲' },
  { id: 'distribuzioni', label: 'Distribuzioni', icon: '📈' },
  { id: 'riferimento', label: 'Riferimento rapido', icon: '📋' },
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
    <div className="relative group rounded-xl overflow-hidden border border-slate-800 bg-slate-900/60 my-4">
      {title && (
        <div className="flex items-center justify-between px-4 py-2 bg-slate-800/40 border-b border-slate-800/60">
          <span className="text-[11px] font-semibold text-slate-400">{title}</span>
          <button
            onClick={handleCopy}
            className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors px-2 py-1 rounded-md hover:bg-slate-700/50"
          >
            {copied ? 'Copiato!' : 'Copia'}
          </button>
        </div>
      )}
      {!title && (
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 text-[10px] text-slate-600 hover:text-slate-300 transition-colors px-2 py-1 rounded-md hover:bg-slate-700/50 opacity-0 group-hover:opacity-100"
        >
          {copied ? 'Copiato!' : 'Copia'}
        </button>
      )}
      <pre className="text-[13px] font-mono text-slate-300 p-4 overflow-x-auto leading-relaxed whitespace-pre-wrap">
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
      <div className="text-[13px] text-slate-400 leading-relaxed">{children}</div>
    </div>
  );
}

// ═══════════════════════════════════════════
// Table
// ═══════════════════════════════════════════

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto my-4 rounded-xl border border-slate-800">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="bg-slate-800/40">
            {headers.map((h, i) => (
              <th key={i} className="text-left px-4 py-2.5 text-slate-400 font-semibold border-b border-slate-800/60">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-slate-800/30 last:border-b-0 hover:bg-slate-800/20 transition-colors">
              {row.map((cell, j) => (
                <td key={j} className={`px-4 py-2.5 ${j === 0 ? 'font-mono text-amber-300/80' : 'text-slate-400'}`}>{cell}</td>
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
      <p className="text-slate-400 leading-relaxed mb-4">
        <strong className="text-slate-200">SDL (Scenario Description Language)</strong> e' un linguaggio formale
        per descrivere, simulare e monitorare scenari futuri. A differenza delle previsioni tradizionali
        (testi statici o presentazioni), uno scenario SDL e' un <strong className="text-slate-200">oggetto computazionale</strong>: 
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
          ['Leggibile', 'La sintassi e\' comprensibile anche ai non-programmatori'],
          ['Trasparente', 'Ogni assunzione dichiara la sua fonte e il livello di confidenza'],
          ['Verificabile', 'I risultati possono essere riprodotti e controllati'],
        ].map(([title, desc]) => (
          <div key={title} className="bg-slate-900/40 border border-slate-800/60 rounded-lg p-3">
            <p className="text-sm font-semibold text-slate-200 mb-1">{title}</p>
            <p className="text-[12px] text-slate-500 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      <h3 className="text-lg font-semibold text-white mt-8 mb-3">Come funziona</h3>
      <div className="flex flex-col sm:flex-row items-center gap-3 text-center">
        {[
          ['1. Scrivi', 'Definisci scenario con assunzioni, variabili, branches'],
          ['2. Valida', 'Il parser controlla sintassi e costruisce il grafo causale'],
          ['3. Simula', '2.000+ simulazioni Monte Carlo propagano l\'incertezza'],
          ['4. Analizza', 'Fan chart con percentili mostrano la gamma di futuri possibili'],
        ].map(([step, desc]) => (
          <div key={step} className="flex-1 bg-slate-900/40 border border-slate-800/60 rounded-xl p-4">
            <p className="text-sm font-bold text-blue-400 mb-1">{step}</p>
            <p className="text-[11px] text-slate-500 leading-relaxed">{desc}</p>
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
      <p className="text-slate-400 leading-relaxed mb-4">
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
      <p className="text-slate-400 leading-relaxed mb-3">
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
      <p className="text-slate-400 leading-relaxed mb-4">
        Le <strong className="text-slate-200">assunzioni</strong> (<code className="text-amber-300/80">assumption</code>) 
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
      <p className="text-slate-400 leading-relaxed mb-4">
        Le <strong className="text-slate-200">variabili</strong> (<code className="text-amber-300/80">variable</code>) 
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
      <p className="text-slate-400 leading-relaxed mb-3">
        I punti definiti nella variabile sono <strong className="text-slate-200">ancore</strong>. 
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
      <p className="text-slate-400 leading-relaxed mb-3">
        <code className="text-amber-300/80">depends_on</code> dichiara che questa variabile 
        e' influenzata da altre. Il motore usa queste relazioni per costruire il <strong className="text-slate-200">grafo causale</strong> e 
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
      <p className="text-slate-400 leading-relaxed mb-3">
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
      <p className="text-slate-400 leading-relaxed mb-4">
        I <strong className="text-slate-200">parametri</strong> (<code className="text-amber-300/80">parameter</code>) 
        sono valori di configurazione che <em>non cambiano nel tempo</em> all'interno di una singola simulazione, 
        ma possono variare tra simulazioni diverse. Utili per soglie, budget, costi unitari.
      </p>
      <p className="text-slate-400 leading-relaxed mb-4">
        A partire dalla <strong className="text-slate-200">v0.1.1</strong>, i parametri possono includere 
        metadati per generare automaticamente <strong className="text-slate-200">controlli interattivi</strong> (slider, toggle, dropdown)
        nell'interfaccia, permettendo all'utente di esplorare scenari alternativi in tempo reale.
      </p>

      <CodeBlock title="Sintassi base" code={`parameter nome_parametro {
  value: 3.5%                      // Valore di default
  range: [2%, 6%]                  // Range esplorabile (opzionale)
  description: "Cosa rappresenta"  // Descrizione
}`} />

      <h3 className="text-lg font-semibold text-white mt-8 mb-3">Controlli interattivi <span className="text-xs font-normal text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full ml-2">v0.1.1</span></h3>
      <p className="text-slate-400 leading-relaxed mb-3">
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
      <p className="text-slate-400 leading-relaxed mb-4">
        Un <strong className="text-slate-200">branch</strong> e' una biforcazione condizionale: 
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
      <p className="text-slate-400 leading-relaxed mb-3">
        A ogni passo temporale della simulazione:
      </p>
      <ol className="list-decimal list-inside text-slate-400 space-y-2 ml-2 text-[13px] leading-relaxed">
        <li>Il motore valuta la condizione <code className="text-amber-300/80">when</code> con i valori correnti</li>
        <li>Se la condizione e' vera <strong className="text-slate-200">e</strong> un sorteggio casuale {'<'} <code className="text-amber-300/80">probability</code>:
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
      <p className="text-slate-400 leading-relaxed mb-4">
        Gli <strong className="text-slate-200">impatti</strong> (<code className="text-amber-300/80">impact</code>) 
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

function SectionSimulazione() {
  return (
    <section>
      <h2 className="text-2xl font-bold text-white mb-4">Simulazione</h2>
      <p className="text-slate-400 leading-relaxed mb-4">
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
      <p className="text-slate-400 leading-relaxed mb-3">
        I <strong className="text-slate-200">fan chart</strong> mostrano la distribuzione dei risultati:
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-900/40 border border-slate-800/60 rounded-lg p-3 text-center">
          <div className="w-12 h-3 rounded-full bg-blue-400/20 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-300">Banda esterna (P5-P95)</p>
          <p className="text-[11px] text-slate-500">90% dei risultati cade qui</p>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/60 rounded-lg p-3 text-center">
          <div className="w-12 h-3 rounded-full bg-blue-400/40 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-300">Banda interna (P25-P75)</p>
          <p className="text-[11px] text-slate-500">50% dei risultati cade qui</p>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/60 rounded-lg p-3 text-center">
          <div className="w-12 h-1.5 rounded-full bg-blue-400 mx-auto mb-2 mt-0.5" />
          <p className="text-xs font-semibold text-slate-300">Linea mediana (P50)</p>
          <p className="text-[11px] text-slate-500">Il risultato piu' probabile</p>
        </div>
      </div>
    </section>
  );
}

function SectionDistribuzioni() {
  return (
    <section>
      <h2 className="text-2xl font-bold text-white mb-4">Distribuzioni di incertezza</h2>
      <p className="text-slate-400 leading-relaxed mb-4">
        Le distribuzioni sono il modo in cui SDL rappresenta l'<strong className="text-slate-200">incertezza</strong>.
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
        <div className="bg-slate-900/40 border border-slate-800/60 rounded-lg p-4">
          <p className="text-sm font-semibold text-blue-400 mb-1">normal(±X%)</p>
          <p className="text-[12px] text-slate-400">La scelta piu' comune. "Il valore potrebbe deviare di ±X% dal previsto".
            Esempio: <code className="text-amber-300/80">normal(±15%)</code> = potrebbe essere 15% sopra o sotto.</p>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/60 rounded-lg p-4">
          <p className="text-sm font-semibold text-emerald-400 mb-1">beta(a, b)</p>
          <p className="text-[12px] text-slate-400">Per valori tra 0 e 1 (probabilita', indici normalizzati). 
            <code className="text-amber-300/80">beta(8, 2)</code> = concentrata verso 1.
            <code className="text-amber-300/80"> beta(2, 8)</code> = concentrata verso 0.</p>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/60 rounded-lg p-4">
          <p className="text-sm font-semibold text-amber-400 mb-1">uniform(min, max)</p>
          <p className="text-[12px] text-slate-400">Quando non hai idea di quale valore sia piu' probabile nel range.
            Esempio: <code className="text-amber-300/80">uniform(0.5, 1.5)</code> = equiprobabile tra 0.5 e 1.5.</p>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/60 rounded-lg p-4">
          <p className="text-sm font-semibold text-purple-400 mb-1">triangular(min, moda, max)</p>
          <p className="text-[12px] text-slate-400">Quando conosci il minimo, il massimo, e il valore piu' probabile.
            Esempio: <code className="text-amber-300/80">triangular(10, 25, 60)</code></p>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/60 rounded-lg p-4">
          <p className="text-sm font-semibold text-red-400 mb-1">lognormal(mu, sigma)</p>
          <p className="text-[12px] text-slate-400">Per valori che non possono essere negativi e tendono ad avere "code" lunghe a destra.
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
      <p className="text-slate-400 leading-relaxed mb-6">
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
          'yearly', 'monthly', 'weekly', 'daily',
          'derives_from', 'formula', 'interpolation',
          'label', 'step', 'format', 'control', 'icon', 'color',
          'category', 'subtitle', 'difficulty',
        ].map(kw => (
          <span key={kw} className="text-[11px] font-mono bg-slate-800/60 text-amber-300/70 px-2 py-1 rounded-md">{kw}</span>
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
          <span key={c} className="text-xs font-mono bg-slate-800/60 text-slate-300 px-3 py-1.5 rounded-lg">{c}</span>
        ))}
      </div>

      <h3 className="text-lg font-semibold text-white mt-8 mb-3">Schema completo</h3>
      <CodeBlock title="Scenario completo (con campi v0.1.1)" code={`scenario "Nome" {
  timeframe: 2025 -> 2040
  resolution: yearly
  confidence: 0.6
  author: "Autore"
  version: "1.0"
  description: "Descrizione"
  tags: ["tag1", "tag2"]
  subtitle: "Sottotitolo"         // v0.1.1
  category: tecnologia             // v0.1.1
  icon: "🔬"                       // v0.1.1
  color: "#3b82f6"                 // v0.1.1
  difficulty: intermedio            // v0.1.1

  assumption nome {
    value: 100
    source: "Fonte"
    confidence: 0.7
    uncertainty: normal(±20%)
  }

  parameter nome {
    value: 50
    range: [10, 100]
    description: "Descrizione"
    label: "Nome leggibile"        // v0.1.1
    unit: "unita'"                  // v0.1.1
    step: 5                         // v0.1.1
    format: "{value} unita'"        // v0.1.1
    control: slider                 // v0.1.1
    icon: "⚙"                      // v0.1.1
    color: "#10b981"                // v0.1.1
  }

  variable nome {
    description: "Descrizione"
    unit: "unita'"
    label: "Nome leggibile"        // v0.1.1
    icon: "📊"                      // v0.1.1
    color: "#3b82f6"                // v0.1.1
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
    label: "Nome leggibile"        // v0.1.1
    icon: "🎯"                      // v0.1.1
    color: "#ef4444"                // v0.1.1
    derives_from: var1, var2
    formula: var1 - var2
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
      <header className="relative overflow-hidden border-b border-slate-800">
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
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed mb-4">
            Impara a scrivere scenari in SDL: dalla struttura base fino ai branches e alle simulazioni Monte Carlo.
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
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 border border-transparent'}
                `}
              >
                <span>{s.icon}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <div ref={contentRef} className="max-w-4xl mx-auto px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-[11px] text-slate-600">
          <span>Guida SDL</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-amber-400/60">{currentSection.icon} {currentSection.label}</span>
        </div>

        {/* Section content */}
        <SectionComponent />

        {/* Prev/Next navigation */}
        <div className="flex items-center justify-between mt-12 pt-6 border-t border-slate-800/60">
          {prevSection ? (
            <button
              onClick={() => setActiveSection(prevSection.id)}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors group"
            >
              <svg className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <div className="text-left">
                <p className="text-[10px] text-slate-600">Precedente</p>
                <p className="font-medium">{prevSection.icon} {prevSection.label}</p>
              </div>
            </button>
          ) : <div />}

          {nextSection ? (
            <button
              onClick={() => setActiveSection(nextSection.id)}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors group"
            >
              <div className="text-right">
                <p className="text-[10px] text-slate-600">Successiva</p>
                <p className="font-medium">{nextSection.icon} {nextSection.label}</p>
              </div>
              <svg className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : <div />}
        </div>
      </div>
    </div>
  );
}
