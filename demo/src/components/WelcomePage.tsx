/**
 * WelcomePage — Landing page with featured scenarios.
 */

import { useMemo } from 'react';
import { SDL_NATIVE_SCENARIOS } from '../scenarios';
import { renderSDL } from '../lib/sdl-renderer';
import { SdlIcon } from '../lib/icons';

export default function WelcomePage({ onSelect }: { onSelect: (id: string) => void }) {
  const featured = useMemo(() => {
    return SDL_NATIVE_SCENARIOS.slice(0, 4).map(s => {
      const rendered = renderSDL(s.source, s.id);
      return rendered ? { id: s.id, meta: rendered.meta } : null;
    }).filter(Boolean) as { id: string; meta: { title: string; subtitle: string; period: string; icon: string } }[];
  }, []);

  return (
    <div className="min-h-full flex flex-col">
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-3xl text-center animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-8">
            <img src="/segno_logo_white.png" alt="Segno" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-1">
            Segno
          </h1>
          <p className="text-lg md:text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400 mb-4">
            SDL Citizen Lab
          </p>
          <p className="text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed mb-2">
            Esplora il futuro con simulazioni trasparenti e verificabili.
          </p>
          <p className="text-sm text-zinc-500 max-w-lg mx-auto mb-12">
            Ogni scenario e' basato su dati reali, fonti citate, e 2.000 simulazioni Monte Carlo.
            Modifica le assunzioni, verifica tutto. Niente e' nascosto.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {featured.map(s => (
              <button
                key={s.id}
                onClick={() => onSelect(s.id)}
                className="group text-left bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 hover:border-zinc-600 hover:bg-zinc-900/80 transition-all hover:shadow-lg hover:shadow-black/20 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-zinc-800/60 text-zinc-400 group-hover:text-blue-400 transition-colors shrink-0">
                    <SdlIcon name={s.meta.icon} size={20} strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors truncate">{s.meta.title}</p>
                    <p className="text-[10px] text-zinc-600">{s.meta.period}</p>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed line-clamp-2">{s.meta.subtitle}</p>
              </button>
            ))}
          </div>

          <p className="mt-10 text-[11px] text-zinc-600 flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
            Seleziona uno scenario dalla sidebar per iniziare
          </p>
        </div>
      </div>

      <footer className="shrink-0 border-t border-zinc-800/40 px-6 py-6">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-600">
          <p>Segno — SDL Citizen Lab</p>
          <p>Simulazioni eseguite nel tuo browser. Nessun dato inviato a terzi.</p>
        </div>
      </footer>
    </div>
  );
}
