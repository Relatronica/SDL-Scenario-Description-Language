/**
 * ManifestoView — Why SDL exists: vision, philosophy, and invitation.
 */

import { SdlIcon } from '../lib/icons';

export default function ManifestoView() {
  return (
    <div className="min-h-full bg-zinc-950">
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-rose-950/20 via-zinc-950 to-zinc-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(244,63,94,0.08),transparent_70%)]" />
        <div className="relative max-w-3xl mx-auto px-6 pt-20 pb-16 text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-medium mb-8">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Manifesto
          </div>

          <blockquote className="text-xl md:text-2xl font-light text-zinc-300 leading-relaxed max-w-2xl mx-auto mb-6 italic">
            "Dal CERN e' nato il Web per condividere il sapere del presente.
            <br />
            Da chi si e' incontrato al CERN nasce il linguaggio per condividere il sapere del futuro."
          </blockquote>
          <p className="text-sm text-zinc-600">— Relatronica</p>
        </div>
      </section>

      {/* ─── Content ─── */}
      <div className="max-w-2xl mx-auto px-6 pb-24 space-y-20">

        {/* ─── Perche' Rebica ─── */}
        <section className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <SectionLabel color="rose">Il nome</SectionLabel>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 leading-tight">
            Perche' Rebica.
          </h2>
          <div className="space-y-4 text-[15px] text-zinc-400 leading-relaxed">
            <p>
              La <strong className="text-zinc-300">ribeca</strong> e' uno degli strumenti musicali
              piu' antichi d'Europa. Arrivata attraverso il Mediterraneo dal mondo arabo, e' stata
              per secoli lo strumento del popolo: suonata nelle piazze, nei mercati, nelle feste.
              Non apparteneva alle corti. Apparteneva a tutti.
            </p>
            <p>
              E' anche uno strumento che non produce una nota sola. Le sue corde vibrano
              insieme, generando <strong className="text-zinc-300">armoniche</strong> —
              frequenze multiple che si sovrappongono, creando un suono ricco e complesso da
              un gesto semplice. Un arco su una corda, e nasce uno spettro intero.
            </p>
            <p>
              Rebica prende il nome da li'. Come la ribeca genera armoniche da una corda,
              SDL genera <strong className="text-zinc-300">distribuzioni di futuri possibili</strong> da
              un insieme di assunzioni. Non una previsione sola, ma un ventaglio. Non una nota,
              ma un accordo. Non la risposta, ma lo spazio delle risposte.
            </p>
            <p>
              E come la ribeca era lo strumento del popolo — non dei re, non dei cortigiani —
              Rebica e' foresight per tutti. Non per le societa' di consulenza. Non per chi
              puo' permettersi i modelli proprietari. <strong className="text-zinc-300">Per chiunque
              creda che pensare il futuro sia un diritto, non un privilegio.</strong>
            </p>
          </div>
        </section>

        {/* ─── Divider ─── */}
        <Divider />

        {/* ─── Il Problema ─── */}
        <section>
          <SectionLabel color="rose">Il problema</SectionLabel>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 leading-tight">
            Il futuro e' troppo importante
            <br />
            per restare chiuso in una slide.
          </h2>
          <div className="space-y-4 text-[15px] text-zinc-400 leading-relaxed">
            <p>
              Oggi il foresight — l'arte di pensare sistematicamente al futuro — funziona cosi':
              una societa' di consulenza produce tre scenari qualitativi (ottimista, base, pessimista),
              li confeziona in un PDF da 200 pagine, e li consegna a chi puo' permetterselo.
              Le assunzioni sono implicite, i modelli sono narrativi, le fonti sono decorative.
            </p>
            <p>
              Il risultato e' che le decisioni piu' importanti — quelle che riguardano il clima,
              la demografia, l'energia, l'intelligenza artificiale, la salute pubblica — vengono
              prese sulla base di storie che nessuno puo' verificare, riprodurre o contestare.
            </p>
            <p>
              Non perche' chi le scrive sia in malafede. Ma perche' gli strumenti disponibili
              non permettono altro. <strong className="text-zinc-300">Il foresight e' rimasto analogico
              in un mondo digitale.</strong>
            </p>
          </div>
        </section>

        {/* ─── Divider ─── */}
        <Divider />

        {/* ─── La Tesi ─── */}
        <section>
          <SectionLabel color="blue">La tesi</SectionLabel>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 leading-tight">
            Gli scenari devono essere eseguibili,
            <br />
            trasparenti e falsificabili.
          </h2>
          <div className="space-y-4 text-[15px] text-zinc-400 leading-relaxed">
            <p>
              SDL nasce da un'idea semplice: <strong className="text-zinc-300">e se gli scenari
              funzionassero come il codice?</strong> Se ogni assunzione fosse esplicita, ogni fonte
              verificabile, ogni proiezione riproducibile da chiunque?
            </p>
            <p>
              Un linguaggio formale per gli scenari cambia tutto. Non serve piu' fidarsi:
              si puo' verificare. Non serve piu' pagare un consulente per capire cosa succedera'
              se il prezzo del carbonio raddoppia: si modifica un parametro e il motore ricalcola
              migliaia di traiettorie. Non serve piu' accettare una narrazione: si puo' forkarla,
              correggerla, migliorarla.
            </p>
            <p>
              Il futuro non e' un prodotto. <strong className="text-zinc-300">E' una conversazione
              pubblica.</strong> E le conversazioni hanno bisogno di un linguaggio comune.
            </p>
          </div>
        </section>

        {/* ─── Divider ─── */}
        <Divider />

        {/* ─── Come Funziona ─── */}
        <section>
          <SectionLabel color="emerald">Come funziona</SectionLabel>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 leading-tight">
            Uno scenario SDL e' un programma
            <br />
            che descrive un pezzo di futuro.
          </h2>
          <div className="space-y-4 text-[15px] text-zinc-400 leading-relaxed">
            <p>
              Uno scenario SDL dichiara variabili, assunzioni, dipendenze e incertezze in un
              formato leggibile sia dagli esseri umani che dalle macchine. Da un singolo file
              <code className="text-rose-400/80 text-[13px] bg-rose-500/8 px-1.5 py-0.5 rounded">.sdl</code> il
              motore genera migliaia di simulazioni Monte Carlo, producendo non una previsione,
              ma una <strong className="text-zinc-300">distribuzione di futuri possibili</strong>.
            </p>
            <p>
              Ogni valore porta con se' un'incertezza. Ogni assunzione dichiara la sua fonte.
              Le variabili si collegano a dati reali — dal World Bank, da Eurostat, da qualsiasi
              API pubblica — e il modello si autocalibra man mano che il futuro diventa presente.
              Se la realta' diverge troppo dalle assunzioni, il sistema avvisa.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FeatureCard
              icon={<DiceIcon />}
              title="Simulazione Monte Carlo"
              description="Migliaia di traiettorie probabilistiche, non una previsione singola. Ogni scenario esplora lo spazio delle possibilita'."
            />
            <FeatureCard
              icon={<LinkIcon />}
              title="Dati reali in tempo reale"
              description="Le assunzioni si collegano ad API pubbliche. Il modello si aggiorna automaticamente quando i dati cambiano."
            />
            <FeatureCard
              icon={<ShieldIcon />}
              title="Monitoraggio continuo"
              description="Regole di watch rilevano quando la realta' diverge dalle assunzioni. Nessuna sorpresa silenziosa."
            />
            <FeatureCard
              icon={<ChartIcon />}
              title="Calibrazione bayesiana"
              description="Le distribuzioni di incertezza si restringono man mano che i dati storici si accumulano. Il modello impara."
            />
          </div>
        </section>

        {/* ─── Divider ─── */}
        <Divider />

        {/* ─── Il Modello ─── */}
        <section>
          <SectionLabel color="violet">Il modello</SectionLabel>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 leading-tight">
            Open source. Nessun paywall.
            <br />
            Nessun vendor lock-in.
          </h2>
          <div className="space-y-4 text-[15px] text-zinc-400 leading-relaxed">
            <p>
              SDL e' software libero, rilasciato sotto licenza GPL-3.0. Non c'e' un tier premium,
              non c'e' un piano enterprise, non c'e' un modello freemium che ti lascia provare
              e poi ti chiude fuori. <strong className="text-zinc-300">Il codice e' aperto perche'
              il futuro deve essere aperto.</strong>
            </p>
            <p>
              Costruire un linguaggio computazionale richiede tempo: scrivere specifiche, debuggare
              parser, progettare motori di simulazione, curare documentazione, mantenere dipendenze.
              E' lavoro volontario, guidato dalla convinzione che gli strumenti per pensare il futuro
              debbano appartenere a tutti — non solo a chi puo' permettersi le societa' di consulenza.
            </p>
            <p>
              SDL e' un progetto di <a href="https://relatronica.com" target="_blank" rel="noopener noreferrer" className="text-rose-400 hover:text-rose-300 underline underline-offset-2 transition-colors">Relatronica</a>,
              un laboratorio indipendente che immagina futuri possibili e costruisce strumenti per navigarli.
            </p>
          </div>
        </section>

        {/* ─── Divider ─── */}
        <Divider />

        {/* ─── Per Chi ─── */}
        <section>
          <SectionLabel color="amber">Per chi</SectionLabel>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 leading-tight">
            Per chiunque pensi che il futuro
            <br />
            meriti strumenti migliori.
          </h2>

          <div className="space-y-3">
            <AudienceRow
              icon="microscope"
              title="Ricercatori"
              description="Modellate scenari con incertezza esplicita, fonti tracciate e riproducibilita' completa."
            />
            <AudienceRow
              icon="landmark"
              title="Policy maker"
              description="Testate l'impatto di decisioni su migliaia di traiettorie. Ogni parametro e' modificabile."
            />
            <AudienceRow
              icon="lightbulb"
              title="Educatori"
              description="Insegnate il pensiero sui futuri con strumenti interattivi, non slide statiche."
            />
            <AudienceRow
              icon="pen-line"
              title="Giornalisti"
              description="Raccontate il futuro con dati, fonti e simulazioni verificabili. Foresight data-driven."
            />
            <AudienceRow
              icon="flame"
              title="Attivisti"
              description="Costruite scenari alternativi con la stessa precisione dei think tank. Il foresight non e' piu' un privilegio."
            />
            <AudienceRow
              icon="globe"
              title="Cittadini"
              description="Esplorate il futuro in prima persona. Modificate le assunzioni. Verificate tutto. Niente e' nascosto."
            />
          </div>
        </section>

        {/* ─── Divider ─── */}
        <Divider />

        {/* ─── Chiusura ─── */}
        <section className="text-center py-8">
          <p className="text-xl md:text-2xl font-light text-zinc-300 leading-relaxed max-w-xl mx-auto mb-8 italic">
            "Il modo migliore per prevedere il futuro e' costruire gli strumenti
            per pensarlo insieme."
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://buymeacoffee.com/relatronica"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium hover:bg-rose-500/20 hover:border-rose-500/30 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Sostieni il progetto
            </a>
            <a
              href="https://github.com/relatronica/SDL-Scenario-Description-Language"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-800/60 border border-zinc-700/60 text-zinc-300 text-sm font-medium hover:bg-zinc-800 hover:border-zinc-600 transition-all"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Codice su GitHub
            </a>
          </div>
          <p className="mt-8 text-[11px] text-zinc-600">
            GPL-3.0 — Creato da Relatronica
          </p>
        </section>
      </div>
    </div>
  );
}

// ─── Sub-components ───

function SectionLabel({ children, color }: { children: React.ReactNode; color: string }) {
  const colorMap: Record<string, string> = {
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    violet: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  };
  return (
    <span className={`inline-block text-[11px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full border mb-5 ${colorMap[color] ?? colorMap.rose}`}>
      {children}
    </span>
  );
}

function Divider() {
  return <div className="border-t border-zinc-800/60" />;
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-5 hover:border-zinc-700/60 transition-colors">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-800/60 text-zinc-400 mb-3">
        {icon}
      </div>
      <p className="text-sm font-semibold text-zinc-200 mb-1.5">{title}</p>
      <p className="text-[13px] text-zinc-500 leading-relaxed">{description}</p>
    </div>
  );
}

function AudienceRow({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex items-start gap-4 py-3 px-4 rounded-lg hover:bg-zinc-900/40 transition-colors">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-zinc-800/60 text-zinc-400 shrink-0 mt-0.5">
        <SdlIcon name={icon} size={18} strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-sm font-semibold text-zinc-200 mb-0.5">{title}</p>
        <p className="text-[13px] text-zinc-500 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// ─── Inline icons ───

function DiceIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}
