/**
 * SDL Editor View
 *
 * Full-featured SDL editor with:
 * - CodeMirror 6 text editor with dark theme
 * - Real-time parsing & diagnostics
 * - Monte Carlo simulation
 * - Fan chart results (reusing demo's chart style)
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Line, ComposedChart,
} from 'recharts';
import { EditorView as CMEditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { basicSetup } from 'codemirror';

import { parse } from '@sdl/core/parser';
import { validate } from '@sdl/core/validator';
import { simulate } from '@sdl/engine/monte-carlo';
import type { SimulationResult, ScenarioNode } from '@sdl/core/types';
import { EDITOR_TEMPLATES, type SDLTemplate } from './templates';

// ═══════════════════════════════════════════
// Chart helpers (same as demo App)
// ═══════════════════════════════════════════

interface FanChartPoint {
  year: number; base: number; outerLower: number;
  innerLower: number; innerUpper: number; outerUpper: number; p50: number;
}

function extractFanData(result: SimulationResult, name: string, type: 'variable' | 'impact'): FanChartPoint[] {
  const src = type === 'impact' ? result.impacts.get(name) : result.variables.get(name);
  if (!src) return [];
  return src.timeseries.map((ts) => {
    const p = ts.distribution.percentiles;
    const p5 = p.get(5) ?? ts.distribution.mean - 2 * ts.distribution.std;
    const p25 = p.get(25) ?? ts.distribution.mean - 0.674 * ts.distribution.std;
    const p50 = p.get(50) ?? ts.distribution.mean;
    const p75 = p.get(75) ?? ts.distribution.mean + 0.674 * ts.distribution.std;
    const p95 = p.get(95) ?? ts.distribution.mean + 2 * ts.distribution.std;
    return { year: ts.date.getFullYear(), base: p5, outerLower: p25 - p5, innerLower: p50 - p25, innerUpper: p75 - p50, outerUpper: p95 - p75, p50 };
  });
}

function formatValue(v: number): string {
  if (Math.abs(v) >= 1e9) return `${(v / 1e9).toFixed(0)}B`;
  if (Math.abs(v) >= 1e6) return `${(v / 1e6).toFixed(0)}M`;
  if (Math.abs(v) >= 1e4) return `${(v / 1e3).toFixed(0)}K`;
  if (Math.abs(v) >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
  if (Math.abs(v) < 0.01 && v !== 0) return v.toExponential(1);
  if (Math.abs(v) < 1) return v.toFixed(2);
  return v.toFixed(1);
}

// Colors for auto-generated variable charts
const CHART_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444',
  '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1',
];

// ═══════════════════════════════════════════
// Mini Fan Chart (for results)
// ═══════════════════════════════════════════

function MiniFanChart({ data, label, color, unit }: {
  data: FanChartPoint[]; label: string; color: string; unit: string;
}) {
  if (!data || data.length === 0) return null;
  const gid = `g-editor-${label.replace(/\s/g, '-')}`;
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 animate-fade-in">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-slate-200 truncate">{label}</h3>
        </div>
        <span className="ml-auto text-[10px] uppercase tracking-wider text-slate-600 font-medium shrink-0">{unit}</span>
      </div>
      <ResponsiveContainer width="100%" height={190}>
        <ComposedChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id={`${gid}-o`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.1} /><stop offset="100%" stopColor={color} stopOpacity={0.1} /></linearGradient>
            <linearGradient id={`${gid}-i`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.22} /><stop offset="100%" stopColor={color} stopOpacity={0.22} /></linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgb(30,41,59)" />
          <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'rgb(100,116,139)' }} axisLine={{ stroke: 'rgb(51,65,85)' }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: 'rgb(100,116,139)' }} axisLine={{ stroke: 'rgb(51,65,85)' }} tickLine={false} tickFormatter={formatValue} width={50} />
          <Tooltip
            contentStyle={{ backgroundColor: 'rgb(15,23,42)', border: '1px solid rgb(51,65,85)', borderRadius: '12px', fontSize: '12px', color: 'rgb(203,213,225)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}
            formatter={(value: number, name: string) => name === 'p50' ? [formatValue(value), 'Mediana'] : [null, null]}
            labelFormatter={(l) => `Anno ${l}`} labelStyle={{ color: 'rgb(148,163,184)', fontWeight: 600 }}
          />
          <Area type="monotone" dataKey="base" stackId="fan" fill="transparent" stroke="none" />
          <Area type="monotone" dataKey="outerLower" stackId="fan" fill={`url(#${gid}-o)`} stroke="none" />
          <Area type="monotone" dataKey="innerLower" stackId="fan" fill={`url(#${gid}-i)`} stroke="none" />
          <Area type="monotone" dataKey="innerUpper" stackId="fan" fill={`url(#${gid}-i)`} stroke="none" />
          <Area type="monotone" dataKey="outerUpper" stackId="fan" fill={`url(#${gid}-o)`} stroke="none" />
          <Line type="monotone" dataKey="p50" stroke={color} strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: color, stroke: 'white', strokeWidth: 2 }} />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="flex items-center justify-center gap-6 mt-2 text-[10px] text-slate-600">
        <span className="flex items-center gap-1.5"><span className="w-6 h-1.5 rounded-full" style={{ backgroundColor: color, opacity: 0.2 }} />90%</span>
        <span className="flex items-center gap-1.5"><span className="w-6 h-1.5 rounded-full" style={{ backgroundColor: color, opacity: 0.4 }} />50%</span>
        <span className="flex items-center gap-1.5"><span className="w-6 h-0.5 rounded-full" style={{ backgroundColor: color }} />Mediana</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// Diagnostics Panel
// ═══════════════════════════════════════════

interface DiagnosticItem {
  severity: 'error' | 'warning' | 'info';
  message: string;
  line?: number;
}

function DiagnosticsPanel({ items }: { items: DiagnosticItem[] }) {
  if (items.length === 0) return null;

  const errors = items.filter(d => d.severity === 'error');
  const warnings = items.filter(d => d.severity === 'warning');

  return (
    <div className="border border-slate-800 rounded-xl overflow-hidden animate-fade-in">
      <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-900/60 border-b border-slate-800/60">
        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <span className="text-xs font-semibold text-slate-400">Diagnostica</span>
        {errors.length > 0 && (
          <span className="text-[10px] font-medium text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full">{errors.length} errori</span>
        )}
        {warnings.length > 0 && (
          <span className="text-[10px] font-medium text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">{warnings.length} avvisi</span>
        )}
      </div>
      <div className="max-h-40 overflow-y-auto">
        {items.map((d, i) => (
          <div key={i} className="flex items-start gap-2.5 px-4 py-2 border-b border-slate-800/30 last:border-b-0">
            <span className={`mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${
              d.severity === 'error' ? 'bg-red-400' : d.severity === 'warning' ? 'bg-amber-400' : 'bg-blue-400'
            }`} />
            <div className="min-w-0 flex-1">
              <p className={`text-xs font-mono leading-relaxed ${
                d.severity === 'error' ? 'text-red-300' : d.severity === 'warning' ? 'text-amber-300' : 'text-blue-300'
              }`}>
                {d.message}
              </p>
            </div>
            {d.line != null && (
              <span className="text-[10px] text-slate-600 shrink-0">riga {d.line}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// Template Picker
// ═══════════════════════════════════════════

function TemplatePicker({ onSelect }: { onSelect: (t: SDLTemplate) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {EDITOR_TEMPLATES.map(t => (
        <button
          key={t.id}
          onClick={() => onSelect(t)}
          className="group text-left bg-slate-900/60 border border-slate-800 rounded-xl p-4 hover:border-slate-600 hover:bg-slate-900/80 transition-all hover:shadow-lg hover:shadow-black/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{t.icon}</span>
            <p className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">{t.name}</p>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">{t.description}</p>
        </button>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════
// CodeMirror Editor Wrapper
// ═══════════════════════════════════════════

function CodeMirrorEditor({ value, onChange }: {
  value: string;
  onChange: (v: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<CMEditorView | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!containerRef.current) return;

    const state = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        javascript(),
        oneDark,
        CMEditorView.theme({
          '&': { height: '100%', fontSize: '13px' },
          '.cm-scroller': { overflow: 'auto', fontFamily: "'JetBrains Mono', monospace" },
          '.cm-content': { padding: '12px 0' },
          '.cm-gutters': { backgroundColor: 'transparent', borderRight: '1px solid rgb(30,41,59)' },
          '.cm-activeLineGutter': { backgroundColor: 'rgba(59,130,246,0.08)' },
          '.cm-activeLine': { backgroundColor: 'rgba(59,130,246,0.06)' },
        }),
        CMEditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChangeRef.current(update.state.doc.toString());
          }
        }),
      ],
    });

    const view = new CMEditorView({
      state,
      parent: containerRef.current,
    });
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []);

  // Update content when value changes externally (template switch)
  const lastExternalValue = useRef(value);
  useEffect(() => {
    if (lastExternalValue.current === value) return;
    lastExternalValue.current = value;

    const view = viewRef.current;
    if (!view) return;

    const currentDoc = view.state.doc.toString();
    if (currentDoc !== value) {
      view.dispatch({
        changes: { from: 0, to: currentDoc.length, insert: value },
      });
    }
  }, [value]);

  return (
    <div ref={containerRef} className="h-full codemirror-container" />
  );
}

// ═══════════════════════════════════════════
// Main Editor View
// ═══════════════════════════════════════════

interface EditorViewProps {
  initialTemplate?: string;
}

export default function EditorView({ initialTemplate }: EditorViewProps) {
  const initialTpl = useMemo(
    () => EDITOR_TEMPLATES.find(t => t.id === initialTemplate) ?? EDITOR_TEMPLATES[0],
    [initialTemplate],
  );

  const [source, setSource] = useState(initialTpl.source);
  const [currentTemplate, setCurrentTemplate] = useState(initialTpl);
  const [diagnostics, setDiagnostics] = useState<DiagnosticItem[]>([]);
  const [ast, setAst] = useState<ScenarioNode | null>(null);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simElapsed, setSimElapsed] = useState(0);
  const [simRuns, setSimRuns] = useState(0);
  const [showTemplates, setShowTemplates] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'results'>('editor');

  const parseTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Parse SDL source with debounce
  const parseSource = useCallback((src: string) => {
    const diags: DiagnosticItem[] = [];

    try {
      const { ast: parsed, diagnostics: parseDiags } = parse(src);

      for (const d of parseDiags) {
        diags.push({
          severity: d.severity,
          message: d.message,
          line: d.span?.start?.line,
        });
      }

      if (parsed) {
        const validation = validate(parsed);
        for (const d of validation.diagnostics) {
          diags.push({
            severity: d.severity,
            message: d.message,
            line: d.span?.start?.line,
          });
        }
        setAst(parsed);
      } else {
        setAst(null);
      }
    } catch (e: any) {
      diags.push({ severity: 'error', message: e.message ?? 'Errore di parsing sconosciuto' });
      setAst(null);
    }

    setDiagnostics(diags);
  }, []);

  // Debounced parsing on source change
  const handleSourceChange = useCallback((src: string) => {
    setSource(src);
    clearTimeout(parseTimerRef.current);
    parseTimerRef.current = setTimeout(() => parseSource(src), 400);
  }, [parseSource]);

  // Initial parse
  useEffect(() => {
    parseSource(source);
  }, []);

  // Run simulation
  const handleSimulate = useCallback(() => {
    if (!ast) return;
    setIsSimulating(true);
    setActiveTab('results');

    setTimeout(() => {
      try {
        const res = simulate(ast, { runs: 2000, seed: 42 });
        setResult(res);
        setSimElapsed(res.elapsedMs);
        setSimRuns(res.runs);
      } catch (e) {
        console.error('Simulazione fallita:', e);
      } finally {
        setIsSimulating(false);
      }
    }, 30);
  }, [ast]);

  // Load template
  const handleLoadTemplate = useCallback((t: SDLTemplate) => {
    setCurrentTemplate(t);
    setSource(t.source);
    setResult(null);
    setShowTemplates(false);
    setActiveTab('editor');
    setTimeout(() => parseSource(t.source), 50);
  }, [parseSource]);

  // Collect variable/impact names from result
  const resultCharts = useMemo(() => {
    if (!result) return [];
    const charts: { name: string; type: 'variable' | 'impact'; color: string }[] = [];
    let idx = 0;
    for (const [name] of result.variables) {
      charts.push({ name, type: 'variable', color: CHART_COLORS[idx % CHART_COLORS.length] });
      idx++;
    }
    for (const [name] of result.impacts) {
      charts.push({ name, type: 'impact', color: CHART_COLORS[idx % CHART_COLORS.length] });
      idx++;
    }
    return charts;
  }, [result]);

  const errorCount = diagnostics.filter(d => d.severity === 'error').length;
  const canSimulate = ast != null && errorCount === 0;

  return (
    <div className="min-h-full animate-fade-in">
      {/* Header */}
      <header className="relative overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/5 via-transparent to-cyan-600/5" />
        <div className="relative max-w-full px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl bg-emerald-500/10">
              &#9998;
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest font-medium px-2 py-0.5 rounded-full text-emerald-400 bg-emerald-400/10">
                Editor
              </span>
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight mb-2">
            Crea il tuo scenario
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed mb-4">
            Scrivi codice SDL, verifica la sintassi in tempo reale, e lancia simulazioni Monte Carlo.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
            {/* Template badge */}
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center gap-1.5 bg-slate-800/60 px-3 py-1.5 rounded-full hover:bg-slate-800 transition-colors"
            >
              <span>{currentTemplate.icon}</span>
              <span>{currentTemplate.name}</span>
              <svg className={`w-3 h-3 transition-transform ${showTemplates ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Status */}
            {ast ? (
              <span className="flex items-center gap-1.5 bg-slate-800/60 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Parsing OK
              </span>
            ) : (
              <span className="flex items-center gap-1.5 bg-slate-800/60 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                Errori nel codice
              </span>
            )}

            {result && (
              <>
                <span className="bg-slate-800/60 px-3 py-1.5 rounded-full">{simRuns.toLocaleString()} simulazioni</span>
                {simElapsed > 0 && <span className="bg-slate-800/60 px-3 py-1.5 rounded-full">{simElapsed}ms</span>}
              </>
            )}

            {/* Simulate button */}
            <button
              onClick={handleSimulate}
              disabled={!canSimulate || isSimulating}
              className={`
                ml-auto flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg transition-all
                ${!canSimulate || isSimulating
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white hover:from-emerald-500 hover:to-cyan-500 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30'}
              `}
            >
              {isSimulating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Simulazione...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Simula
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Template picker (collapsible) */}
      {showTemplates && (
        <div className="px-6 lg:px-8 py-5 border-b border-slate-800 bg-slate-950/80 animate-fade-in">
          <p className="text-xs text-slate-400 mb-3">Scegli un template per iniziare:</p>
          <TemplatePicker onSelect={handleLoadTemplate} />
        </div>
      )}

      <main className="px-6 lg:px-8 py-6">
        {/* Mobile tab switcher */}
        <div className="flex items-center gap-1 mb-5 lg:hidden bg-slate-900/60 p-1 rounded-lg border border-slate-800 w-fit">
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'editor' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Editor
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'results' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Risultati {result ? `(${resultCharts.length})` : ''}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Editor panel */}
          <div className={`lg:col-span-6 space-y-4 ${activeTab !== 'editor' ? 'hidden lg:block' : ''}`}>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-white">Codice SDL</h2>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-600">{source.split('\n').length} righe</span>
              </div>
            </div>

            {/* CodeMirror editor */}
            <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/40" style={{ height: '480px' }}>
              <CodeMirrorEditor value={source} onChange={handleSourceChange} />
            </div>

            {/* Diagnostics */}
            <DiagnosticsPanel items={diagnostics} />
          </div>

          {/* Results panel */}
          <div className={`lg:col-span-6 space-y-5 ${activeTab !== 'results' ? 'hidden lg:block' : ''}`}>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-white">Risultati simulazione</h2>
              {isSimulating && (
                <div className="flex items-center gap-2 text-xs text-emerald-400 animate-pulse-slow">
                  <div className="w-3 h-3 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                  Calcolo in corso...
                </div>
              )}
            </div>

            {result ? (
              <div className="space-y-5">
                {/* Summary cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {resultCharts.map(({ name, type, color }) => {
                    const src = type === 'impact' ? result.impacts.get(name) : result.variables.get(name);
                    if (!src || src.timeseries.length === 0) return null;
                    const last = src.timeseries[src.timeseries.length - 1];
                    const val = last.distribution.percentiles.get(50) ?? last.distribution.mean;
                    const lastYear = last.date.getFullYear();
                    return (
                      <div key={name} className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-center">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 truncate">{name.replace(/_/g, ' ')}</p>
                        <p className="text-lg font-bold tabular-nums" style={{ color }}>{formatValue(val)}</p>
                        <p className="text-[10px] text-slate-600 mt-0.5">{lastYear}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Fan Charts */}
                {resultCharts.map(({ name, type, color }) => {
                  const src = type === 'impact' ? result.impacts.get(name) : result.variables.get(name);
                  const unit = src?.unit ?? '';
                  return (
                    <MiniFanChart
                      key={name}
                      data={extractFanData(result, name, type)}
                      label={name.replace(/_/g, ' ')}
                      color={color}
                      unit={unit}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <div className="text-center max-w-xs">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800/60 flex items-center justify-center">
                    <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-slate-400 mb-2">Nessun risultato ancora</p>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Scrivi o modifica il codice SDL nell'editor, poi premi <strong className="text-slate-400">Simula</strong> per lanciare 2.000 simulazioni Monte Carlo.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
