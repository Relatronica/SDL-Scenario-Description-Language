/**
 * SdlScenarioView — Renders a scenario directly from SDL source code.
 *
 * Unlike ScenarioView (which requires TypeScript definitions), this component
 * takes raw SDL source, parses it, extracts all UI metadata from the AST,
 * and renders sliders, fan charts, summary cards, and causal graph.
 *
 * This is the bridge between .sdl files and the interactive UI.
 */

import { useState, useCallback, useRef, useEffect, lazy, Suspense } from 'react';
import type { SimulationResult } from '@sdl/core/types';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '../scenarios/types';
import { renderSDL, type RenderedScenario } from '../lib/sdl-renderer';
import { extractFanData, getFinalMedian, formatValue } from '../lib/simulation';
import FanChart from './FanChart';
import SliderControl from './SliderControl';

const CausalGraph = lazy(() => import('./CausalGraph'));

interface SdlScenarioViewProps {
  sdlSource: string;
  sdlId: string;
}

export default function SdlScenarioView({ sdlSource, sdlId }: SdlScenarioViewProps) {
  const [rendered, setRendered] = useState<RenderedScenario | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, number>>({});
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showSDL, setShowSDL] = useState(false);
  const [showGraph, setShowGraph] = useState(false);
  const [showMethodology, setShowMethodology] = useState(false);
  const [simElapsed, setSimElapsed] = useState(0);
  const [simRuns, setSimRuns] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const r = renderSDL(sdlSource, sdlId);
    if (!r) {
      setParseError('Errore nel parsing del file SDL. Verifica la sintassi.');
      setRendered(null);
      return;
    }
    setRendered(r);
    setParseError(null);

    const init: Record<string, number> = {};
    for (const s of r.sliders) init[s.id] = s.default;
    setValues(init);

    setIsSimulating(true);
    setTimeout(() => {
      const res = r.simulate();
      if (res) {
        setResult(res);
        setSimElapsed(res.elapsedMs);
        setSimRuns(res.runs);
      }
      setIsSimulating(false);
    }, 30);
  }, [sdlSource, sdlId]);

  const runSim = useCallback((overrides: Record<string, number>) => {
    if (!rendered) return;
    setIsSimulating(true);
    setTimeout(() => {
      const res = rendered.simulate(overrides);
      if (res) {
        setResult(res);
        setSimElapsed(res.elapsedMs);
        setSimRuns(res.runs);
      }
      setIsSimulating(false);
    }, 30);
  }, [rendered]);

  const handleChange = useCallback((id: string, value: number) => {
    setValues(prev => ({ ...prev, [id]: value }));
  }, []);

  // Auto-simulate when slider values change
  useEffect(() => {
    if (!rendered) return;
    const hasNonDefault = rendered.sliders.some(s => values[s.id] !== s.default);
    if (!hasNonDefault) return;

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => runSim(values), 350);
    return () => clearTimeout(timerRef.current);
  }, [values, rendered, runSim]);

  const resetAll = useCallback(() => {
    if (!rendered) return;
    const defs: Record<string, number> = {};
    for (const s of rendered.sliders) defs[s.id] = s.default;
    setValues(defs);
    runSim(defs);
  }, [rendered, runSim]);

  if (parseError) {
    return (
      <div className="min-h-full flex items-center justify-center animate-fade-in">
        <div className="max-w-md text-center p-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Errore di parsing</h2>
          <p className="text-sm text-zinc-400">{parseError}</p>
        </div>
      </div>
    );
  }

  if (!rendered) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  const { meta, sliders, variables } = rendered;

  return (
    <div className="min-h-full animate-fade-in">
      {/* Header */}
      <header className="relative overflow-hidden border-b border-zinc-800">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-transparent to-violet-600/5" />
        <div className="relative max-w-full px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: `${meta.color}15` }}>
              {meta.icon}
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest font-medium px-2 py-0.5 rounded-full" style={{ color: CATEGORY_COLORS[meta.category], backgroundColor: `${CATEGORY_COLORS[meta.category]}15` }}>
                {CATEGORY_LABELS[meta.category]}
              </span>
            </div>
            <span className="ml-auto text-[10px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">SDL nativo</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight mb-2">
            {meta.title}
          </h1>
          <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed mb-4">
            {meta.description}
          </p>
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-500">
            <span className="flex items-center gap-1.5 bg-zinc-800/60 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {isSimulating ? 'Simulazione in corso...' : `${simRuns.toLocaleString()} simulazioni`}
            </span>
            <span className="bg-zinc-800/60 px-3 py-1.5 rounded-full">{meta.period}</span>
            {simElapsed > 0 && <span className="bg-zinc-800/60 px-3 py-1.5 rounded-full">{simElapsed}ms</span>}
            <div className="flex flex-wrap gap-1.5 ml-2">
              {meta.tags.map(tag => (
                <span key={tag} className="text-[10px] bg-zinc-800/40 text-zinc-600 px-2 py-0.5 rounded-full">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sliders */}
          {sliders.length > 0 && (
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-white">Le tue assunzioni</h2>
                <button onClick={resetAll} className="text-[11px] text-zinc-500 hover:text-blue-400 transition-colors px-2 py-1 rounded-md hover:bg-zinc-800">Ripristina tutto</button>
              </div>
              {sliders.map(s => (
                <SliderControl key={s.id} slider={s} value={values[s.id] ?? s.default} onChange={v => handleChange(s.id, v)} />
              ))}
            </div>
          )}

          {/* Charts */}
          <div className={sliders.length > 0 ? 'lg:col-span-8 space-y-5' : 'lg:col-span-12 space-y-5'}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-white">Proiezioni {meta.period}</h2>
              {isSimulating && (
                <div className="flex items-center gap-2 text-xs text-blue-400 animate-pulse-slow">
                  <div className="w-3 h-3 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                  Ricalcolo...
                </div>
              )}
            </div>

            {/* Summary cards */}
            {result && (
              <div className={`grid grid-cols-2 ${variables.length <= 4 ? 'md:grid-cols-4' : 'md:grid-cols-5'} gap-3 mb-2`}>
                {variables.map(vd => {
                  const val = getFinalMedian(result, vd.id, vd.type);
                  if (val === null) return null;
                  const isNeg = val < 0;
                  const lastYear = result.timesteps[result.timesteps.length - 1]?.getFullYear() ?? '';
                  return (
                    <div key={vd.id} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 text-center">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 truncate">{vd.label}</p>
                      <p className="text-xl font-bold tabular-nums" style={{ color: isNeg ? '#ef4444' : vd.color }}>
                        {isNeg ? '' : '+'}{formatValue(val)}
                      </p>
                      <p className="text-[10px] text-zinc-600 mt-0.5">{lastYear} {vd.unit}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {result ? (
              variables.map(vd => (
                <FanChart key={vd.id} data={extractFanData(result, vd.id, vd.type)} display={vd} />
              ))
            ) : (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                  <p className="text-sm text-zinc-400">Prima simulazione in corso...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Expandable panels */}
        <div className="mt-12 space-y-4">
          {/* Causal Graph */}
          <div className="border border-zinc-800 rounded-2xl overflow-hidden">
            <button onClick={() => setShowGraph(!showGraph)} className="w-full flex items-center justify-between px-6 py-4 bg-zinc-900/40 hover:bg-zinc-900/60 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-blue-400/70">🔗</span>
                <span className="text-sm font-semibold text-zinc-300">Grafo causale</span>
                <span className="text-[10px] text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded-full">interattivo</span>
              </div>
              <svg className={`w-4 h-4 text-zinc-500 transition-transform ${showGraph ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {showGraph && (
              <div className="px-2 py-3 bg-zinc-950/50 animate-fade-in">
                <p className="text-[11px] text-zinc-500 mb-3 px-4">Mappa interattiva delle dipendenze causali tra variabili.</p>
                <Suspense fallback={<div className="h-[500px] flex items-center justify-center"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>}>
                  <CausalGraph sdlSource={sdlSource} />
                </Suspense>
              </div>
            )}
          </div>

          {/* Methodology */}
          <div className="border border-zinc-800 rounded-2xl overflow-hidden">
            <button onClick={() => setShowMethodology(!showMethodology)} className="w-full flex items-center justify-between px-6 py-4 bg-zinc-900/40 hover:bg-zinc-900/60 transition-colors">
              <div className="flex items-center gap-3"><span className="text-zinc-500">&#9432;</span><span className="text-sm font-semibold text-zinc-300">Metodologia e trasparenza</span></div>
              <svg className={`w-4 h-4 text-zinc-500 transition-transform ${showMethodology ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {showMethodology && (
              <div className="px-6 py-5 bg-zinc-950/50 text-sm text-zinc-400 leading-relaxed space-y-3 animate-fade-in">
                <p><strong className="text-zinc-300">Simulazione Monte Carlo:</strong> Ogni scenario viene simulato 2.000 volte con valori estratti casualmente dalle distribuzioni di incertezza.</p>
                <p><strong className="text-zinc-300">Bande di incertezza:</strong> La banda esterna copre il 90% dei risultati (P5-P95). La banda interna il 50% centrale (P25-P75). La linea e' la mediana.</p>
                <p><strong className="text-zinc-300">Fonti:</strong> Ogni assunzione riporta la fonte. Controlla il codice sorgente SDL per i dettagli.</p>
                <p><strong className="text-zinc-300">SDL nativo:</strong> Questo scenario e' eseguito direttamente da un file .sdl — nessuna definizione TypeScript intermedia.</p>
              </div>
            )}
          </div>

          {/* SDL Source */}
          <div className="border border-zinc-800 rounded-2xl overflow-hidden">
            <button onClick={() => setShowSDL(!showSDL)} className="w-full flex items-center justify-between px-6 py-4 bg-zinc-900/40 hover:bg-zinc-900/60 transition-colors">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-blue-400/60">{'{}'}</span>
                <span className="text-sm font-semibold text-zinc-300">Codice sorgente SDL</span>
                <span className="text-[10px] text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded-full">verificabile</span>
              </div>
              <svg className={`w-4 h-4 text-zinc-500 transition-transform ${showSDL ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {showSDL && (
              <div className="px-6 py-5 bg-zinc-950/50 animate-fade-in">
                <p className="text-[11px] text-zinc-500 mb-3">Codice SDL originale. Leggibile, verificabile, copiabile.</p>
                <pre className="text-xs font-mono text-zinc-400 bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 overflow-x-auto max-h-96 overflow-y-auto leading-relaxed">{sdlSource}</pre>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
