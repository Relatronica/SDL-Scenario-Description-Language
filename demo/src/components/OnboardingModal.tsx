/**
 * OnboardingModal — 3-step intro that explains Rebica / SDL to new users.
 * Shown on first visit (localStorage), recallable via help button.
 */

import { useState, useEffect, useCallback } from 'react';
import { BarChart3, Search, Settings, Lock } from 'lucide-react';

const STORAGE_KEY = 'rebica-onboarding-seen';

interface OnboardingModalProps {
  open: boolean;
  onClose: () => void;
  onNavigate?: (target: 'demo' | 'editor' | 'wizard') => void;
}

const STEPS = [
  {
    tag: 'Benvenuto',
    title: "Cos'è Rebica?",
    body: (
      <>
        <p className="text-zinc-400 leading-relaxed">
          Rebica trasforma gli <strong className="text-zinc-200">scenari futuri</strong> in
          codice eseguibile. Invece di slide statiche, qui ogni ipotesi viene simulata con
          migliaia di run Monte Carlo.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3 text-[12px]">
          <div className="flex items-start gap-2.5 rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-3">
            <BarChart3 size={16} className="shrink-0 mt-0.5 text-blue-400" strokeWidth={1.5} />
            <div>
              <p className="font-semibold text-zinc-300">2 000 simulazioni</p>
              <p className="text-zinc-600 text-[11px] mt-0.5">per ogni scenario</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-3">
            <Search size={16} className="shrink-0 mt-0.5 text-blue-400" strokeWidth={1.5} />
            <div>
              <p className="font-semibold text-zinc-300">Fonti citate</p>
              <p className="text-zinc-600 text-[11px] mt-0.5">dati verificabili</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-3">
            <Settings size={16} className="shrink-0 mt-0.5 text-blue-400" strokeWidth={1.5} />
            <div>
              <p className="font-semibold text-zinc-300">Parametri interattivi</p>
              <p className="text-zinc-600 text-[11px] mt-0.5">modifica le assunzioni</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-3">
            <Lock size={16} className="shrink-0 mt-0.5 text-blue-400" strokeWidth={1.5} />
            <div>
              <p className="font-semibold text-zinc-300">Nel tuo browser</p>
              <p className="text-zinc-600 text-[11px] mt-0.5">nessun dato inviato</p>
            </div>
          </div>
        </div>
      </>
    ),
  },
  {
    tag: 'Funzionalità',
    title: 'Cosa puoi fare',
    body: (
      <div className="space-y-3">
        <div className="flex items-start gap-3 rounded-xl p-3 border border-zinc-800/60 bg-blue-500/10">
          <div className="shrink-0 mt-0.5 text-blue-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-blue-400">Esplora scenari</p>
            <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">Sfoglia scenari reali per categoria e simula in tempo reale.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-xl p-3 border border-zinc-800/60 bg-emerald-500/10">
          <div className="shrink-0 mt-0.5 text-emerald-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-emerald-400">Scrivi nel Editor SDL</p>
            <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">Scrivi i tuoi scenari in SDL con syntax highlighting e simulazione live.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-xl p-3 border border-zinc-800/60 bg-violet-500/10">
          <div className="shrink-0 mt-0.5 text-violet-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-violet-400">Genera con AI Wizard</p>
            <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">Un wizard guidato in 5 step genera SDL a partire dalle tue idee.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-xl p-3 border border-zinc-800/60 bg-amber-500/10">
          <div className="shrink-0 mt-0.5 text-amber-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-amber-400">Leggi la Guida SDL</p>
            <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">Impara la sintassi SDL con esempi interattivi e spiegazioni dettagliate.</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    tag: 'Inizia',
    title: 'Da dove vuoi partire?',
    body: null, // rendered inline with CTA buttons
  },
];

export function useOnboardingAutoOpen() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) setOpen(true);
  }, []);
  const close = useCallback(() => {
    setOpen(false);
    localStorage.setItem(STORAGE_KEY, '1');
  }, []);
  return { open, setOpen, close } as const;
}

export default function OnboardingModal({ open, onClose, onNavigate }: OnboardingModalProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  const handleNavigate = (target: 'demo' | 'editor' | 'wizard') => {
    localStorage.setItem(STORAGE_KEY, '1');
    onClose();
    onNavigate?.(target);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl shadow-black/50 animate-modal-enter overflow-hidden">
        {/* Gradient accent */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors z-10"
          aria-label="Chiudi"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="px-6 pt-7 pb-2">
          {/* Step tag */}
          <span className="inline-block text-[10px] font-semibold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full mb-3">
            {current.tag}
          </span>
          <h2 className="text-xl font-bold text-white mb-4">{current.title}</h2>

          {/* Body (animated) */}
          <div key={step} className="animate-step-in min-h-[220px]">
            {current.body ?? (
              /* Step 3: CTA cards */
              <div className="space-y-3">
                <button
                  onClick={() => handleNavigate('demo')}
                  className="w-full flex items-center gap-4 rounded-xl p-4 border border-zinc-800 bg-zinc-900/60 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all group text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0 group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">Esplora uno scenario</p>
                    <p className="text-[11px] text-zinc-500">Inizia subito con un caso reale</p>
                  </div>
                  <svg className="w-4 h-4 text-zinc-700 ml-auto group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <button
                  onClick={() => handleNavigate('editor')}
                  className="w-full flex items-center gap-4 rounded-xl p-4 border border-zinc-800 bg-zinc-900/60 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all group text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">Apri l'editor SDL</p>
                    <p className="text-[11px] text-zinc-500">Scrivi e simula il tuo scenario</p>
                  </div>
                  <svg className="w-4 h-4 text-zinc-700 ml-auto group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <button
                  onClick={() => handleNavigate('wizard')}
                  className="w-full flex items-center gap-4 rounded-xl p-4 border border-zinc-800 bg-zinc-900/60 hover:border-violet-500/40 hover:bg-violet-500/5 transition-all group text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 shrink-0 group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white group-hover:text-violet-300 transition-colors">Genera con AI</p>
                    <p className="text-[11px] text-zinc-500">Il wizard crea SDL dalle tue idee</p>
                  </div>
                  <svg className="w-4 h-4 text-zinc-700 ml-auto group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer: dots + nav buttons */}
        <div className="px-6 pb-5 pt-3 flex items-center justify-between">
          {/* Dots */}
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step
                    ? 'w-6 bg-blue-500'
                    : 'w-1.5 bg-zinc-700 hover:bg-zinc-600'
                }`}
                aria-label={`Step ${i + 1}`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800"
              >
                Indietro
              </button>
            )}
            {step === 0 && (
              <button
                onClick={onClose}
                className="px-3 py-1.5 text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                Salta
              </button>
            )}
            {!isLast && (
              <button
                onClick={() => setStep(s => s + 1)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
              >
                Avanti
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
