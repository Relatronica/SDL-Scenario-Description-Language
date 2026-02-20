/**
 * SdlScenarioView — Renders a scenario directly from SDL source code.
 *
 * Takes raw SDL source, parses it, extracts all UI metadata from the AST,
 * and renders sliders, fan charts, summary cards, causal graph, and
 * historical data validation when live data is available.
 */

import { useState, useCallback, useRef, useEffect, lazy, Suspense } from 'react';
import type { SimulationResult, ScenarioNode } from '@sdl/core/types';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '../scenarios/types';
import { renderSDL, type RenderedScenario } from '../lib/sdl-renderer';
import { extractFanData, getFinalMedian, getFinalRange, formatValue } from '../lib/simulation';
import { loadPulseData, loadPulseDataOffline, computeValidation } from '../lib/pulse-bridge';
import type { ScenarioLiveData, WatchAlert } from '../lib/pulse-bridge';
import { runSensitivityAnalysis, type SensitivityResult } from '../lib/sensitivity';
import { generateNarration, type NarrationBlock } from '../lib/narration';
import { SdlIcon } from '../lib/icons';
import { Link2, AlertTriangle, AlertOctagon, BarChart3, FileText } from 'lucide-react';
import FanChart from './FanChart';
import SliderControl from './SliderControl';
import SensitivityPanel from './SensitivityPanel';
import NarrationPanel from './NarrationPanel';

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
  const [showValidation, setShowValidation] = useState(false);
  const [showSensitivity, setShowSensitivity] = useState(false);
  const [sensitivityData, setSensitivityData] = useState<SensitivityResult[] | null>(null);
  const [showNarration, setShowNarration] = useState(false);
  const [narrationBlocks, setNarrationBlocks] = useState<NarrationBlock[] | null>(null);
  const [simElapsed, setSimElapsed] = useState(0);
  const [simRuns, setSimRuns] = useState(0);
  const [liveData, setLiveData] = useState<ScenarioLiveData | null>(null);
  const [calibratedAst, setCalibratedAst] = useState<ScenarioNode | null>(null);
  const [alerts, setAlerts] = useState<WatchAlert[]>([]);
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
    setCalibratedAst(null);
    setAlerts([]);

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

    // Load observed data via SDL Pulse (reads bind blocks from AST)
    loadPulseDataOffline(r.ast).then(offline => {
      if (offline) {
        setLiveData(offline);
        loadPulseData(r.ast).then(live => {
          if (live) {
            setLiveData(live);
            if (live.alerts.length > 0) setAlerts(live.alerts);
            if (live.calibratedAst) {
              setCalibratedAst(live.calibratedAst);
              setIsSimulating(true);
              setTimeout(() => {
                const res = r.simulateWith(live.calibratedAst!);
                if (res) {
                  setResult(res);
                  setSimElapsed(res.elapsedMs);
                  setSimRuns(res.runs);
                }
                setIsSimulating(false);
              }, 30);
            }
          }
        });
      }
    });
  }, [sdlSource, sdlId]);

  const runSim = useCallback((overrides: Record<string, number>) => {
    if (!rendered) return;
    setIsSimulating(true);
    setTimeout(() => {
      const res = calibratedAst
        ? rendered.simulateWith(calibratedAst, overrides)
        : rendered.simulate(overrides);
      if (res) {
        setResult(res);
        setSimElapsed(res.elapsedMs);
        setSimRuns(res.runs);
      }
      setIsSimulating(false);
    }, 30);
  }, [rendered, calibratedAst]);

  const handleChange = useCallback((id: string, value: number) => {
    setValues(prev => ({ ...prev, [id]: value }));
  }, []);

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
  const hasLiveData = liveData !== null;

  return (
    <div className="min-h-full animate-fade-in">
      {/* Header */}
      <header className="relative overflow-hidden border-b border-zinc-800">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-transparent to-violet-600/5" />
        <div className="relative max-w-full px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${meta.color}15`, color: meta.color }}>
              <SdlIcon name={meta.icon} size={22} strokeWidth={1.8} />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest font-medium px-2 py-0.5 rounded-full" style={{ color: CATEGORY_COLORS[meta.category], backgroundColor: `${CATEGORY_COLORS[meta.category]}15` }}>
                {CATEGORY_LABELS[meta.category]}
              </span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {hasLiveData && (
                <span className="text-[10px] text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  Dati reali
                </span>
              )}
              {calibratedAst && (
                <span className="text-[10px] text-violet-400 bg-violet-400/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                  Calibrato
                </span>
              )}
              <span className="text-[10px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">SDL nativo</span>
            </div>
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
            {hasLiveData && (
              <span className="bg-zinc-800/60 px-3 py-1.5 rounded-full">
                {liveData.variables.size} variabili con dati osservati
              </span>
            )}
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

            {/* Inline explanation */}
            <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl px-4 py-3 mb-4">
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                <strong className="text-blue-400/80">Come leggere questi grafici</strong>
                {' — '}
                {hasLiveData ? (
                  <>
                    I <strong className="text-zinc-300">punti bianchi</strong> sono dati reali osservati (fonti ufficiali: Eurostat, IRENA, ISPRA).
                    La <strong className="text-zinc-300">banda colorata</strong> è la proiezione simulata ({simRuns.toLocaleString()} volte): più è larga, più il futuro è incerto.
                    La linea tratteggiata segna il passaggio dai dati reali alla proiezione.
                    {sliders.length > 0 && <> Muovi i cursori a sinistra per esplorare scenari diversi.</>}
                  </>
                ) : (
                  <>
                    Ogni grafico mostra i possibili futuri simulati dal computer ({simRuns.toLocaleString()} volte).
                    La <strong className="text-zinc-300">linea</strong> al centro è il risultato più tipico.
                    La <strong className="text-zinc-300">banda colorata</strong> indica il range di incertezza: più è larga, più il futuro è incerto.
                    {sliders.length > 0 && <> Muovi i cursori a sinistra per esplorare scenari diversi.</>}
                  </>
                )}
              </p>
            </div>

            {/* Watch Alerts */}
            {alerts.length > 0 && (
              <div className="space-y-2 mb-4">
                {alerts.map((alert, i) => (
                  <div
                    key={`${alert.target}-${i}`}
                    className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${
                      alert.severity === 'error'
                        ? 'bg-red-500/5 border-red-500/20'
                        : 'bg-amber-500/5 border-amber-500/20'
                    }`}
                  >
                    {alert.severity === 'error'
                      ? <AlertOctagon size={16} className="text-red-400 shrink-0 mt-0.5" />
                      : <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                    }
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-semibold ${alert.severity === 'error' ? 'text-red-300' : 'text-amber-300'}`}>
                        {alert.severity === 'error' ? 'Deviazione critica' : 'Attenzione'}: {alert.target.replace(/_/g, ' ')}
                      </p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{alert.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Summary cards */}
            {result && (
              <div className={`grid grid-cols-2 ${variables.length <= 4 ? 'md:grid-cols-4' : 'md:grid-cols-5'} gap-3 mb-2`}>
                {variables.map(vd => {
                  const val = getFinalMedian(result, vd.id, vd.type);
                  if (val === null) return null;
                  const range = getFinalRange(result, vd.id, vd.type);
                  const lastYear = result.timesteps[result.timesteps.length - 1]?.getFullYear() ?? '';
                  return (
                    <div key={vd.id} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 text-center">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 truncate">{vd.label}</p>
                      <p className="text-xl font-bold tabular-nums" style={{ color: vd.color }}>
                        {formatValue(val)}
                      </p>
                      {range && (
                        <p className="text-[9px] text-zinc-600 mt-0.5 tabular-nums">
                          da {formatValue(range.p5)} a {formatValue(range.p95)}
                        </p>
                      )}
                      <p className="text-[9px] text-zinc-700 mt-0.5">Valore mediano al {lastYear} ({vd.unit})</p>
                    </div>
                  );
                })}
              </div>
            )}

            {result ? (
              variables.map(vd => {
                const hist = liveData?.variables.get(vd.id);
                return (
                  <FanChart
                    key={vd.id}
                    data={extractFanData(result, vd.id, vd.type)}
                    display={vd}
                    historical={hist}
                  />
                );
              })
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
          {/* Validation panel — only when live data + results available */}
          {hasLiveData && result && (
            <div className="border border-cyan-500/20 rounded-2xl overflow-hidden">
              <button onClick={() => setShowValidation(!showValidation)} className="w-full flex items-center justify-between px-6 py-4 bg-cyan-500/5 hover:bg-cyan-500/10 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-sm font-semibold text-zinc-300">Validazione: proiezione vs. realtà</span>
                  <span className="text-[10px] text-cyan-400/60 bg-cyan-400/10 px-2 py-0.5 rounded-full">dati reali</span>
                </div>
                <svg className={`w-4 h-4 text-zinc-500 transition-transform ${showValidation ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {showValidation && (
                <div className="px-6 py-5 bg-zinc-950/50 animate-fade-in space-y-5">
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    Confronto tra le proiezioni dello scenario e i dati reali osservati per gli anni in cui entrambi sono disponibili.
                    Questo permette di valutare quanto il modello sia coerente con la realtà.
                  </p>

                  {Array.from(liveData.variables.entries()).map(([varId, varHist]) => {
                    const simVar = result.variables.get(varId) ?? result.impacts.get(varId);
                    if (!simVar) return null;

                    const projected = simVar.timeseries.map(ts => ({
                      year: ts.date.getFullYear(),
                      median: ts.distribution.percentiles.get(50) ?? ts.distribution.mean,
                    }));
                    const validation = computeValidation(varHist.data, projected);
                    if (validation.length === 0) return null;

                    const avgError = validation.reduce((s, v) => s + Math.abs(v.errorPct), 0) / validation.length;
                    const errorColor = avgError < 5 ? 'rgb(34,197,94)' : avgError < 15 ? 'rgb(234,179,8)' : 'rgb(239,68,68)';
                    const errorLabel = avgError < 5 ? 'Ottimo' : avgError < 15 ? 'Accettabile' : 'Da rivedere';

                    return (
                      <div key={varId} className="bg-zinc-900/40 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-xs font-semibold text-zinc-300">{varHist.label}</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-medium" style={{ color: errorColor }}>
                              {errorLabel} — scarto medio {avgError.toFixed(1)}%
                            </span>
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: errorColor }} />
                          </div>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-[11px]">
                            <thead>
                              <tr className="text-zinc-600 border-b border-zinc-800">
                                <th className="text-left py-1.5 pr-4">Anno</th>
                                <th className="text-right py-1.5 px-3">Osservato</th>
                                <th className="text-right py-1.5 px-3">Proiezione</th>
                                <th className="text-right py-1.5 pl-3">Scarto</th>
                              </tr>
                            </thead>
                            <tbody>
                              {validation.map(v => {
                                const absPct = Math.abs(v.errorPct);
                                const cellColor = absPct < 5 ? 'text-emerald-400' : absPct < 15 ? 'text-yellow-400' : 'text-red-400';
                                return (
                                  <tr key={v.year} className="border-b border-zinc-800/50">
                                    <td className="py-1.5 pr-4 text-zinc-400 font-medium">{v.year}</td>
                                    <td className="py-1.5 px-3 text-right text-zinc-300 tabular-nums">{formatValue(v.observed)} {varHist.unit}</td>
                                    <td className="py-1.5 px-3 text-right text-zinc-400 tabular-nums">{formatValue(v.projected)} {varHist.unit}</td>
                                    <td className={`py-1.5 pl-3 text-right tabular-nums font-medium ${cellColor}`}>
                                      {v.errorPct > 0 ? '+' : ''}{v.errorPct.toFixed(1)}%
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                        <p className="text-[9px] text-zinc-700 mt-2">
                          Fonte: {varHist.source} — Ultimo aggiornamento: {varHist.lastUpdate}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Narration — automated summary */}
          {result && (
            <div className="border border-violet-500/20 rounded-2xl overflow-hidden">
              <button onClick={() => {
                if (!showNarration && !narrationBlocks && result) {
                  const blocks = generateNarration(result, variables, liveData, sensitivityData);
                  setNarrationBlocks(blocks);
                }
                setShowNarration(!showNarration);
              }} className="w-full flex items-center justify-between px-6 py-4 bg-violet-500/5 hover:bg-violet-500/10 transition-colors">
                <div className="flex items-center gap-3">
                  <FileText size={16} className="text-violet-400/70" />
                  <span className="text-sm font-semibold text-zinc-300">Riassunto automatico</span>
                  <span className="text-[10px] text-violet-400/60 bg-violet-400/10 px-2 py-0.5 rounded-full">narrazione</span>
                </div>
                <svg className={`w-4 h-4 text-zinc-500 transition-transform ${showNarration ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {showNarration && (
                <div className="px-6 py-5 bg-zinc-950/50 animate-fade-in">
                  {narrationBlocks ? (
                    <NarrationPanel blocks={narrationBlocks} />
                  ) : (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-6 h-6 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Sensitivity Analysis */}
          {sliders.length > 0 && (
            <div className="border border-amber-500/20 rounded-2xl overflow-hidden">
              <button onClick={() => {
                if (!showSensitivity && !sensitivityData && rendered && result) {
                  const data = runSensitivityAnalysis(rendered, variables, calibratedAst ?? undefined);
                  setSensitivityData(data);
                }
                setShowSensitivity(!showSensitivity);
              }} className="w-full flex items-center justify-between px-6 py-4 bg-amber-500/5 hover:bg-amber-500/10 transition-colors">
                <div className="flex items-center gap-3">
                  <BarChart3 size={16} className="text-amber-400/70" />
                  <span className="text-sm font-semibold text-zinc-300">Sensitivity analysis</span>
                  <span className="text-[10px] text-amber-400/60 bg-amber-400/10 px-2 py-0.5 rounded-full">quali parametri contano di più?</span>
                </div>
                <svg className={`w-4 h-4 text-zinc-500 transition-transform ${showSensitivity ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {showSensitivity && (
                <div className="px-6 py-5 bg-zinc-950/50 animate-fade-in">
                  {sensitivityData ? (
                    <SensitivityPanel data={sensitivityData} />
                  ) : (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-6 h-6 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Causal Graph */}
          <div className="border border-zinc-800 rounded-2xl overflow-hidden">
            <button onClick={() => setShowGraph(!showGraph)} className="w-full flex items-center justify-between px-6 py-4 bg-zinc-900/40 hover:bg-zinc-900/60 transition-colors">
              <div className="flex items-center gap-3">
                <Link2 size={16} className="text-blue-400/70" />
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
              <div className="px-6 py-5 bg-zinc-950/50 text-sm text-zinc-400 leading-relaxed space-y-4 animate-fade-in">
                <div>
                  <p className="text-zinc-300 font-semibold mb-1">Cos&apos;è una simulazione Monte Carlo?</p>
                  <p>Immagina di lanciare un dado migliaia di volte: ogni lancio rappresenta un possibile futuro. Il computer fa esattamente questo: ripete lo scenario {simRuns.toLocaleString()} volte, ogni volta variando leggermente le assunzioni entro i margini di incertezza. Il risultato non è &ldquo;il futuro&rdquo;, ma una mappa di futuri possibili.</p>
                </div>
                <div>
                  <p className="text-zinc-300 font-semibold mb-1">Come leggere le bande colorate</p>
                  <p><strong className="text-zinc-300">Banda esterna (fascia ampia):</strong> 9 simulazioni su 10 ricadono in questa fascia. Se il risultato reale finisce fuori, sarebbe davvero sorprendente.</p>
                  <p><strong className="text-zinc-300">Banda interna (fascia probabile):</strong> 1 simulazione su 2 ricade qui. È la zona &ldquo;più probabile&rdquo;.</p>
                  <p><strong className="text-zinc-300">Linea centrale (mediana):</strong> il valore che divide a metà tutti i risultati — non una previsione, ma il punto centrale.</p>
                </div>
                {hasLiveData && (
                  <div>
                    <p className="text-zinc-300 font-semibold mb-1">Dati reali e validazione</p>
                    <p>Questo scenario include dati storici reali da fonti ufficiali (Eurostat, IRENA, ISPRA). I punti bianchi sui grafici mostrano i valori effettivamente osservati. Dove la proiezione si sovrappone ai dati reali, puoi verificare direttamente quanto il modello è accurato.</p>
                  </div>
                )}
                <div>
                  <p className="text-zinc-300 font-semibold mb-1">Perché l&apos;incertezza è importante</p>
                  <p>Nessuno può prevedere il futuro con certezza. Mostrare l&apos;incertezza è più onesto di dare un singolo numero. Se la banda è stretta, le simulazioni concordano. Se è larga, piccoli cambiamenti nelle assunzioni producono futuri molto diversi.</p>
                </div>
                <div>
                  <p className="text-zinc-300 font-semibold mb-1">Fonti e trasparenza</p>
                  <p>Ogni assunzione riporta la fonte dei dati. Puoi verificare tutto aprendo il codice sorgente SDL qui sotto. Questo scenario è eseguito direttamente da un file .sdl — nessun calcolo nascosto.</p>
                </div>
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
