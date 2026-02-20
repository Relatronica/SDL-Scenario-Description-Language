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
import type { SimulationResult, ScenarioNode, ParameterNode, VariableNode, ImpactNode, ExpressionNode, AssumptionNode } from '@sdl/core/types';
import { EDITOR_TEMPLATES, type SDLTemplate } from './templates';
import { extractFanData, formatValue, getUncertaintyLevel, type FanChartPoint, type UncertaintyLevel } from '../lib/simulation';
import { loadPulseData, loadPulseDataOffline, computeValidation } from '../lib/pulse-bridge';
import type { ScenarioLiveData, WatchAlert } from '../lib/pulse-bridge';
import { renderSDL } from '../lib/sdl-renderer';
import type { VariableDisplay } from '../scenarios/types';
import { runSensitivityAnalysis, type SensitivityResult } from '../lib/sensitivity';
import { generateNarration, type NarrationBlock } from '../lib/narration';
import FanChart from '../components/FanChart';
import SensitivityPanel from '../components/SensitivityPanel';
import NarrationPanel from '../components/NarrationPanel';
import { SdlIcon } from '../lib/icons';
import { PenLine, AlertTriangle, AlertOctagon, BarChart3, FileText } from 'lucide-react';

// Colors for auto-generated variable charts
const CHART_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444',
  '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1',
];

// ═══════════════════════════════════════════
// Mini Fan Chart (for results)
// ═══════════════════════════════════════════

const MINI_UNCERTAINTY_COLORS: Record<UncertaintyLevel, string> = {
  'bassa': 'rgb(34,197,94)',
  'media': 'rgb(234,179,8)',
  'alta': 'rgb(249,115,22)',
  'molto alta': 'rgb(239,68,68)',
};

const MINI_UNCERTAINTY_LABELS: Record<UncertaintyLevel, string> = {
  'bassa': 'Incertezza bassa',
  'media': 'Incertezza moderata',
  'alta': 'Incertezza alta',
  'molto alta': 'Incertezza molto alta',
};

function MiniTooltip({ active, payload, label, unit, color }: {
  active?: boolean;
  payload?: Array<{ payload: FanChartPoint }>;
  label?: number;
  unit: string;
  color: string;
}) {
  if (!active || !payload || !payload[0]) return null;
  const d = payload[0].payload;
  return (
    <div style={{
      backgroundColor: 'rgb(24,24,27)', border: '1px solid rgb(63,63,70)',
      borderRadius: '12px', padding: '10px 12px', fontSize: '11px',
      color: 'rgb(212,212,216)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
    }}>
      <p style={{ color: 'rgb(161,161,170)', fontWeight: 600, marginBottom: '6px' }}>Anno {label}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
        <span style={{ width: 8, height: 2, borderRadius: 1, backgroundColor: color, display: 'inline-block' }} />
        <span style={{ fontWeight: 600 }}>Mediana: {formatValue(d.p50)} {unit}</span>
      </div>
      <p style={{ fontSize: '10px', color: 'rgb(113,113,122)' }}>
        Range: {formatValue(d.absP5)} – {formatValue(d.absP95)} {unit}
      </p>
    </div>
  );
}

function MiniFanChart({ data, label, color, unit }: {
  data: FanChartPoint[]; label: string; color: string; unit: string;
}) {
  if (!data || data.length === 0) return null;
  const gid = `g-editor-${label.replace(/\s/g, '-')}`;
  const uncertainty = getUncertaintyLevel(data);
  const uColor = MINI_UNCERTAINTY_COLORS[uncertainty];
  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 animate-fade-in">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-zinc-200 truncate">{label}</h3>
        </div>
        <span className="ml-auto text-[10px] uppercase tracking-wider text-zinc-600 font-medium shrink-0">{unit}</span>
      </div>
      <ResponsiveContainer width="100%" height={190}>
        <ComposedChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id={`${gid}-o`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.1} /><stop offset="100%" stopColor={color} stopOpacity={0.1} /></linearGradient>
            <linearGradient id={`${gid}-i`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.22} /><stop offset="100%" stopColor={color} stopOpacity={0.22} /></linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgb(39,39,42)" />
          <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'rgb(113,113,122)' }} axisLine={{ stroke: 'rgb(63,63,70)' }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: 'rgb(113,113,122)' }} axisLine={{ stroke: 'rgb(63,63,70)' }} tickLine={false} tickFormatter={formatValue} width={50} />
          <Tooltip content={<MiniTooltip unit={unit} color={color} />} />
          <Area type="monotone" dataKey="base" stackId="fan" fill="transparent" stroke="none" />
          <Area type="monotone" dataKey="outerLower" stackId="fan" fill={`url(#${gid}-o)`} stroke="none" />
          <Area type="monotone" dataKey="innerLower" stackId="fan" fill={`url(#${gid}-i)`} stroke="none" />
          <Area type="monotone" dataKey="innerUpper" stackId="fan" fill={`url(#${gid}-i)`} stroke="none" />
          <Area type="monotone" dataKey="outerUpper" stackId="fan" fill={`url(#${gid}-o)`} stroke="none" />
          <Line type="monotone" dataKey="p50" stroke={color} strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: color, stroke: 'white', strokeWidth: 2 }} />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-5 text-[10px] text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="w-5 h-1.5 rounded-full" style={{ backgroundColor: color, opacity: 0.2 }} />Fascia ampia</span>
          <span className="flex items-center gap-1.5"><span className="w-5 h-1.5 rounded-full" style={{ backgroundColor: color, opacity: 0.4 }} />Probabile</span>
          <span className="flex items-center gap-1.5"><span className="w-5 h-0.5 rounded-full" style={{ backgroundColor: color }} />Mediana</span>
        </div>
        <span className="flex items-center gap-1.5 text-[10px]" style={{ color: uColor }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: uColor }} />
          {MINI_UNCERTAINTY_LABELS[uncertainty]}
        </span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// Parameter extraction from AST
// ═══════════════════════════════════════════

interface ParamDef {
  name: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  format: string;
  description: string;
  icon?: string;
  color?: string;
}

function exprNum(expr: ExpressionNode | undefined | null): number {
  if (!expr) return 0;
  switch (expr.type) {
    case 'NumberLiteral': return expr.value;
    case 'PercentageLiteral': return expr.value;
    case 'CurrencyLiteral': return expr.value;
    default: return 0;
  }
}

function extractParams(ast: ScenarioNode): ParamDef[] {
  const out: ParamDef[] = [];
  for (const decl of ast.declarations) {
    if (decl.type !== 'Parameter') continue;
    const p = decl as ParameterNode;
    if (p.control !== 'slider') continue;

    const value = exprNum(p.value);
    const hasRange = !!p.range;
    const min = hasRange ? exprNum(p.range!.min) : value * 0.1;
    const max = hasRange ? exprNum(p.range!.max) : value * 3;
    const step = p.step ? exprNum(p.step) : (max - min) / 100;

    out.push({
      name: p.name,
      label: p.label ?? p.name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      value,
      min,
      max,
      step: step > 0 ? step : 1,
      unit: p.unit ?? '',
      format: p.format ?? '{value}',
      description: p.description ?? '',
      icon: p.icon,
      color: p.color,
    });
  }
  return out;
}

function applyOverrides(ast: ScenarioNode, overrides: Record<string, number>): ScenarioNode {
  if (Object.keys(overrides).length === 0) return ast;
  const newDecls = ast.declarations.map(decl => {
    if (decl.type !== 'Parameter') return decl;
    const p = decl as ParameterNode;
    if (!(p.name in overrides)) return decl;
    const nv = overrides[p.name];
    let newExpr: ExpressionNode;
    if (p.value?.type === 'PercentageLiteral') newExpr = { ...p.value, value: nv } as any;
    else if (p.value?.type === 'CurrencyLiteral') newExpr = { ...p.value, value: nv } as any;
    else newExpr = { type: 'NumberLiteral', value: nv, span: p.value?.span ?? { start: { line: 0, column: 0, offset: 0 }, end: { line: 0, column: 0, offset: 0 } } } as any;
    return { ...p, value: newExpr, range: undefined };
  });
  return { ...ast, declarations: newDecls };
}

function smartFmt(n: number): string {
  if (Math.abs(n) >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (Math.abs(n) >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  if (Number.isInteger(n)) return n.toString();
  return n.toFixed(2);
}

function fmtParamVal(value: number, format: string, unit: string): string {
  const s = format.replace('{value}', smartFmt(value));
  if (s !== smartFmt(value)) return s;
  return unit ? `${smartFmt(value)} ${unit}` : smartFmt(value);
}

// ═══════════════════════════════════════════
// Parameter Sliders Panel
// ═══════════════════════════════════════════

function ParameterSliders({ params, overrides, onChange, onReset }: {
  params: ParamDef[];
  overrides: Record<string, number>;
  onChange: (name: string, value: number) => void;
  onReset: () => void;
}) {
  if (params.length === 0) return null;
  const hasOverrides = Object.keys(overrides).length > 0;

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden animate-fade-in">
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/60">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/15 flex items-center justify-center">
            <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-zinc-200">Controlli interattivi</h3>
            <p className="text-[10px] text-zinc-500">{params.length} parametr{params.length > 1 ? 'i' : 'o'} con slider</p>
          </div>
        </div>
        {hasOverrides && (
          <button onClick={onReset} className="text-[10px] text-zinc-500 hover:text-amber-400 transition-colors px-2 py-1 rounded">
            Reset
          </button>
        )}
      </div>

      <div className="divide-y divide-zinc-800/40">
        {params.map(p => {
          const curr = p.name in overrides ? overrides[p.name] : p.value;
          const isModified = curr !== p.value;
          const pct = ((curr - p.min) / (p.max - p.min)) * 100;

          return (
            <div key={p.name} className="group px-5 py-3 hover:bg-zinc-800/30 transition-colors">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  {p.icon && <span className="shrink-0" style={{ color: p.color ?? '#06b6d4' }}><SdlIcon name={p.icon} size={14} /></span>}
                  <span className="text-xs font-medium text-zinc-200 truncate">{p.label}</span>
                  {isModified && <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />}
                </div>
                <span className={`text-xs font-mono tabular-nums ${isModified ? 'text-cyan-400 font-semibold' : 'text-zinc-400'}`}>
                  {fmtParamVal(curr, p.format, p.unit)}
                </span>
              </div>

              <div className="relative mt-1">
                <input type="range" min={p.min} max={p.max} step={p.step} value={curr}
                  onChange={e => onChange(p.name, parseFloat(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${p.color ?? '#06b6d4'} 0%, ${p.color ?? '#06b6d4'} ${pct}%, rgb(63,63,70) ${pct}%, rgb(63,63,70) 100%)`,
                    margin: 0,
                  }} />
              </div>

              <div className="flex justify-between mt-1">
                <span className="text-[9px] text-zinc-600 font-mono">{smartFmt(p.min)}</span>
                {isModified && (
                  <button onClick={() => onChange(p.name, p.value)}
                    className="text-[9px] text-zinc-600 hover:text-cyan-400 transition-colors">
                    default: {smartFmt(p.value)}
                  </button>
                )}
                <span className="text-[9px] text-zinc-600 font-mono">{smartFmt(p.max)}</span>
              </div>

              {p.description && (
                <p className="text-[10px] text-zinc-600 mt-1 hidden group-hover:block leading-tight">{p.description}</p>
              )}
            </div>
          );
        })}
      </div>

      {hasOverrides && (
        <div className="px-5 py-2 border-t border-zinc-800/60">
          <p className="text-[10px] text-zinc-500 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Valori modificati — la simulazione si aggiorna automaticamente
          </p>
        </div>
      )}
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
    <div className="border border-zinc-800 rounded-xl overflow-hidden animate-fade-in">
      <div className="flex items-center gap-3 px-4 py-2.5 bg-zinc-900/60 border-b border-zinc-800/60">
        <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <span className="text-xs font-semibold text-zinc-400">Diagnostica</span>
        {errors.length > 0 && (
          <span className="text-[10px] font-medium text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full">{errors.length} errori</span>
        )}
        {warnings.length > 0 && (
          <span className="text-[10px] font-medium text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">{warnings.length} avvisi</span>
        )}
      </div>
      <div className="max-h-40 overflow-y-auto">
        {items.map((d, i) => (
          <div key={i} className="flex items-start gap-2.5 px-4 py-2 border-b border-zinc-800/30 last:border-b-0">
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
              <span className="text-[10px] text-zinc-600 shrink-0">riga {d.line}</span>
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
          className="group text-left bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 hover:border-zinc-600 hover:bg-zinc-900/80 transition-all hover:shadow-lg hover:shadow-black/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-zinc-800/60 text-zinc-400 group-hover:text-emerald-400 transition-colors shrink-0">
              <SdlIcon name={t.icon} size={20} strokeWidth={1.8} />
            </div>
            <p className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">{t.name}</p>
          </div>
          <p className="text-[11px] text-zinc-500 leading-relaxed">{t.description}</p>
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
        CMEditorView.lineWrapping,
        CMEditorView.theme({
          '&': { height: '100%', fontSize: '13px' },
          '.cm-scroller': { overflow: 'auto', fontFamily: "'JetBrains Mono', monospace" },
          '.cm-content': { padding: '12px 0' },
          '.cm-line': { paddingRight: '16px' },
          '.cm-gutters': { backgroundColor: 'transparent', borderRight: '1px solid rgb(39,39,42)' },
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
  aiGeneratedSource?: string;
}

export default function EditorView({ initialTemplate, aiGeneratedSource }: EditorViewProps) {
  const initialTpl = useMemo(
    () => EDITOR_TEMPLATES.find(t => t.id === initialTemplate) ?? EDITOR_TEMPLATES[0],
    [initialTemplate],
  );

  const [source, setSource] = useState(aiGeneratedSource ?? initialTpl.source);
  const [currentTemplate, setCurrentTemplate] = useState(
    aiGeneratedSource
      ? { id: '__ai_generated__', name: 'Generato con AI', description: 'Scenario creato con AI Wizard', icon: 'sparkles', source: aiGeneratedSource }
      : initialTpl,
  );
  const [diagnostics, setDiagnostics] = useState<DiagnosticItem[]>([]);
  const [ast, setAst] = useState<ScenarioNode | null>(null);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simElapsed, setSimElapsed] = useState(0);
  const [simRuns, setSimRuns] = useState(0);
  const [showTemplates, setShowTemplates] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'results'>('editor');
  const [paramOverrides, setParamOverrides] = useState<Record<string, number>>({});

  // Pulse / live data state
  const [liveData, setLiveData] = useState<ScenarioLiveData | null>(null);
  const [calibratedAst, setCalibratedAst] = useState<ScenarioNode | null>(null);
  const [alerts, setAlerts] = useState<WatchAlert[]>([]);

  // Sensitivity & Narration state
  const [showSensitivity, setShowSensitivity] = useState(false);
  const [sensitivityData, setSensitivityData] = useState<SensitivityResult[] | null>(null);
  const [showNarration, setShowNarration] = useState(false);
  const [narrationBlocks, setNarrationBlocks] = useState<NarrationBlock[] | null>(null);
  const [showValidation, setShowValidation] = useState(false);

  const parseTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const pulseTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Extract interactive parameters from AST
  const params = useMemo<ParamDef[]>(() => (ast ? extractParams(ast) : []), [ast]);

  // Extract variable/impact display info from AST
  const variableDisplays = useMemo<VariableDisplay[]>(() => {
    if (!ast) return [];
    const displays: VariableDisplay[] = [];
    let idx = 0;
    for (const decl of ast.declarations) {
      if (decl.type === 'Variable') {
        const v = decl as VariableNode;
        displays.push({
          id: v.name,
          label: v.label ?? v.name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          description: v.description ?? '',
          unit: v.unit ?? '',
          color: v.color ?? CHART_COLORS[idx % CHART_COLORS.length],
          type: 'variable',
          icon: v.icon ?? 'bar-chart',
        });
        idx++;
      } else if (decl.type === 'Impact') {
        const imp = decl as ImpactNode;
        displays.push({
          id: imp.name,
          label: imp.label ?? imp.name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          description: imp.description ?? '',
          unit: imp.unit ?? '',
          color: imp.color ?? CHART_COLORS[idx % CHART_COLORS.length],
          type: 'impact',
          icon: imp.icon ?? 'target',
        });
        idx++;
      }
    }
    return displays;
  }, [ast]);

  // Capture original parameter defaults for dependency modulation
  const parameterDefaults = useMemo<Record<string, number>>(() => {
    const defaults: Record<string, number> = {};
    for (const p of params) defaults[p.name] = p.value;
    return defaults;
  }, [params]);

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

  // Load Pulse data when AST has bind/calibrate blocks (debounced)
  useEffect(() => {
    if (!ast) {
      setLiveData(null);
      setCalibratedAst(null);
      setAlerts([]);
      return;
    }

    const hasBind = ast.declarations.some(
      d => d.type === 'Assumption' && (d as AssumptionNode).bind != null,
    );
    const hasCalibrate = ast.declarations.some(d => d.type === 'Calibrate');

    if (!hasBind && !hasCalibrate) {
      setLiveData(null);
      setCalibratedAst(null);
      setAlerts([]);
      return;
    }

    clearTimeout(pulseTimerRef.current);
    let cancelled = false;

    pulseTimerRef.current = setTimeout(() => {
      loadPulseDataOffline(ast).then(offline => {
        if (cancelled || !offline) return;
        setLiveData(offline);

        loadPulseData(ast).then(live => {
          if (cancelled || !live) return;
          setLiveData(live);
          setAlerts(live.alerts);
          if (live.calibratedAst) setCalibratedAst(live.calibratedAst);
        });
      });
    }, 600);

    return () => {
      cancelled = true;
      clearTimeout(pulseTimerRef.current);
    };
  }, [ast]);

  // Reset sensitivity/narration when AST changes
  useEffect(() => {
    setSensitivityData(null);
    setNarrationBlocks(null);
    setShowSensitivity(false);
    setShowNarration(false);
    setShowValidation(false);
  }, [ast]);

  // Run simulation (with parameter overrides applied)
  const handleSimulate = useCallback(() => {
    if (!ast) return;
    setIsSimulating(true);
    setActiveTab('results');

    setTimeout(() => {
      try {
        const effectiveAst = applyOverrides(ast, paramOverrides);
        const hasOverridesNow = Object.keys(paramOverrides).length > 0;
        const res = simulate(effectiveAst, {
          runs: 2000,
          seed: 42,
          parameterDefaults: hasOverridesNow ? parameterDefaults : undefined,
        });
        setResult(res);
        setSimElapsed(res.elapsedMs);
        setSimRuns(res.runs);
      } catch (e) {
        console.error('Simulazione fallita:', e);
      } finally {
        setIsSimulating(false);
      }
    }, 30);
  }, [ast, paramOverrides, parameterDefaults]);

  // Parameter change handlers
  const autoSimTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const handleParamChange = useCallback((name: string, value: number) => {
    setParamOverrides(prev => ({ ...prev, [name]: value }));
  }, []);

  // Auto-simulate when slider overrides change
  useEffect(() => {
    if (!ast || Object.keys(paramOverrides).length === 0) return;

    clearTimeout(autoSimTimerRef.current);
    autoSimTimerRef.current = setTimeout(() => {
      try {
        const effectiveAst = applyOverrides(ast, paramOverrides);
        const res = simulate(effectiveAst, {
          runs: 2000,
          seed: 42,
          parameterDefaults,
        });
        setResult(res);
        setSimElapsed(res.elapsedMs);
        setSimRuns(res.runs);
        setActiveTab('results');
      } catch (e) {
        console.error('Simulazione auto fallita:', e);
      }
    }, 300);

    return () => clearTimeout(autoSimTimerRef.current);
  }, [ast, paramOverrides, parameterDefaults]);

  const handleParamReset = useCallback(() => {
    setParamOverrides({});
    if (ast) {
      setTimeout(() => {
        try {
          const res = simulate(ast, { runs: 2000, seed: 42 });
          setResult(res);
          setSimElapsed(res.elapsedMs);
          setSimRuns(res.runs);
        } catch (e) {
          console.error('Simulazione reset fallita:', e);
        }
      }, 50);
    }
  }, [ast]);

  // Load template
  const handleLoadTemplate = useCallback((t: SDLTemplate) => {
    setCurrentTemplate(t);
    setSource(t.source);
    setResult(null);
    setParamOverrides({});
    setLiveData(null);
    setCalibratedAst(null);
    setAlerts([]);
    setSensitivityData(null);
    setNarrationBlocks(null);
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
  const hasOverrides = Object.keys(paramOverrides).length > 0;
  const hasLiveData = liveData !== null;

  return (
    <div className="min-h-full animate-fade-in">
      {/* Header */}
      <header className="relative overflow-hidden border-b border-zinc-800">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/5 via-transparent to-cyan-600/5" />
        <div className="relative max-w-full px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-emerald-500/10 text-emerald-400">
              <PenLine size={22} strokeWidth={1.8} />
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
          <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed mb-4">
            Scrivi codice SDL, verifica la sintassi in tempo reale, e lancia simulazioni Monte Carlo.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-500">
            {/* Template badge */}
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center gap-1.5 bg-zinc-800/60 px-3 py-1.5 rounded-full hover:bg-zinc-800 transition-colors"
            >
              <SdlIcon name={currentTemplate.icon} size={13} />
              <span>{currentTemplate.name}</span>
              <svg className={`w-3 h-3 transition-transform ${showTemplates ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Status */}
            {ast ? (
              <span className="flex items-center gap-1.5 bg-zinc-800/60 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Parsing OK
              </span>
            ) : (
              <span className="flex items-center gap-1.5 bg-zinc-800/60 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                Errori nel codice
              </span>
            )}

            {hasLiveData && (
              <span className="flex items-center gap-1.5 bg-zinc-800/60 px-3 py-1.5 rounded-full text-cyan-400">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                Dati reali
              </span>
            )}
            {calibratedAst && (
              <span className="flex items-center gap-1.5 bg-zinc-800/60 px-3 py-1.5 rounded-full text-violet-400">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                Calibrato
              </span>
            )}

            {result && (
              <>
                <span className="bg-zinc-800/60 px-3 py-1.5 rounded-full">{simRuns.toLocaleString()} simulazioni</span>
                {simElapsed > 0 && <span className="bg-zinc-800/60 px-3 py-1.5 rounded-full">{simElapsed}ms</span>}
              </>
            )}

            {/* Simulate button */}
            <button
              onClick={handleSimulate}
              disabled={!canSimulate || isSimulating}
              className={`
                ml-auto flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg transition-all
                ${!canSimulate || isSimulating
                  ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
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
                  {hasOverrides && result && (
                    <span className="relative flex h-2 w-2 ml-0.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
                    </span>
                  )}
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Template picker (collapsible) */}
      {showTemplates && (
        <div className="px-6 lg:px-8 py-5 border-b border-zinc-800 bg-zinc-950/80 animate-fade-in">
          <p className="text-xs text-zinc-400 mb-3">Scegli un template per iniziare:</p>
          <TemplatePicker onSelect={handleLoadTemplate} />
        </div>
      )}

      <main className="px-6 lg:px-8 py-6">
        {/* Mobile tab switcher */}
        <div className="flex items-center gap-1 mb-5 lg:hidden bg-zinc-900/60 p-1 rounded-lg border border-zinc-800 w-fit">
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'editor' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Editor
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'results' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Risultati {result ? `(${resultCharts.length})` : ''}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor panel */}
          <div className={`space-y-4 ${activeTab !== 'editor' ? 'hidden lg:block' : ''}`}>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-white">Codice SDL</h2>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-zinc-600">{source.split('\n').length} righe</span>
              </div>
            </div>

            {/* CodeMirror editor */}
            <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-900/40" style={{ height: '560px' }}>
              <CodeMirrorEditor value={source} onChange={handleSourceChange} />
            </div>

            {/* Interactive parameter sliders */}
            <ParameterSliders params={params} overrides={paramOverrides} onChange={handleParamChange} onReset={handleParamReset} />

            {/* Diagnostics */}
            <DiagnosticsPanel items={diagnostics} />
          </div>

          {/* Results panel */}
          <div className={`space-y-5 ${activeTab !== 'results' ? 'hidden lg:block' : ''}`}>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-white">Risultati simulazione</h2>
              {isSimulating && (
                <div className="flex items-center gap-2 text-xs text-emerald-400 animate-pulse-slow">
                  <div className="w-3 h-3 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                  Calcolo in corso...
                </div>
              )}
            </div>

            {/* Watch Alerts */}
            {alerts.length > 0 && (
              <div className="space-y-2">
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
                      <div key={name} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 text-center">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 truncate">{name.replace(/_/g, ' ')}</p>
                        <p className="text-lg font-bold tabular-nums" style={{ color }}>{formatValue(val)}</p>
                        <p className="text-[10px] text-zinc-600 mt-0.5">{lastYear}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Fan Charts — with historical data overlay when available */}
                {variableDisplays.length > 0 ? (
                  variableDisplays.map(vd => {
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
                  resultCharts.map(({ name, type, color }) => {
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
                  })
                )}

                {/* ── Expandable Panels ── */}
                <div className="space-y-3 mt-6">

                  {/* Validation panel — only when live data + results available */}
                  {hasLiveData && (
                    <div className="border border-cyan-500/20 rounded-2xl overflow-hidden">
                      <button onClick={() => setShowValidation(!showValidation)} className="w-full flex items-center justify-between px-5 py-3 bg-cyan-500/5 hover:bg-cyan-500/10 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                          <span className="text-xs font-semibold text-zinc-300">Validazione: proiezione vs. realtà</span>
                        </div>
                        <svg className={`w-3.5 h-3.5 text-zinc-500 transition-transform ${showValidation ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </button>
                      {showValidation && (
                        <div className="px-5 py-4 bg-zinc-950/50 animate-fade-in space-y-4">
                          {Array.from(liveData!.variables.entries()).map(([varId, varHist]) => {
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
                              <div key={varId} className="bg-zinc-900/40 rounded-xl p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="text-[11px] font-semibold text-zinc-300">{varHist.label}</h4>
                                  <span className="text-[10px] font-medium" style={{ color: errorColor }}>{errorLabel} — scarto medio {avgError.toFixed(1)}%</span>
                                </div>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-[10px]">
                                    <thead><tr className="text-zinc-600 border-b border-zinc-800"><th className="text-left py-1 pr-3">Anno</th><th className="text-right py-1 px-2">Osservato</th><th className="text-right py-1 px-2">Proiezione</th><th className="text-right py-1 pl-2">Scarto</th></tr></thead>
                                    <tbody>{validation.map(v => {
                                      const absPct = Math.abs(v.errorPct);
                                      const cellColor = absPct < 5 ? 'text-emerald-400' : absPct < 15 ? 'text-yellow-400' : 'text-red-400';
                                      return (
                                        <tr key={v.year} className="border-b border-zinc-800/50"><td className="py-1 pr-3 text-zinc-400">{v.year}</td><td className="py-1 px-2 text-right text-zinc-300 tabular-nums">{formatValue(v.observed)}</td><td className="py-1 px-2 text-right text-zinc-400 tabular-nums">{formatValue(v.projected)}</td><td className={`py-1 pl-2 text-right tabular-nums font-medium ${cellColor}`}>{v.errorPct > 0 ? '+' : ''}{v.errorPct.toFixed(1)}%</td></tr>
                                      );
                                    })}</tbody>
                                  </table>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Narration panel */}
                  <div className="border border-violet-500/20 rounded-2xl overflow-hidden">
                    <button onClick={() => {
                      if (!showNarration && !narrationBlocks && result) {
                        const blocks = generateNarration(result, variableDisplays, liveData, sensitivityData);
                        setNarrationBlocks(blocks);
                      }
                      setShowNarration(!showNarration);
                    }} className="w-full flex items-center justify-between px-5 py-3 bg-violet-500/5 hover:bg-violet-500/10 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <FileText size={14} className="text-violet-400/70" />
                        <span className="text-xs font-semibold text-zinc-300">Riassunto automatico</span>
                      </div>
                      <svg className={`w-3.5 h-3.5 text-zinc-500 transition-transform ${showNarration ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {showNarration && (
                      <div className="px-5 py-4 bg-zinc-950/50 animate-fade-in">
                        {narrationBlocks ? <NarrationPanel blocks={narrationBlocks} /> : (
                          <div className="flex items-center justify-center py-6"><div className="w-5 h-5 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" /></div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Sensitivity panel */}
                  {params.length > 0 && (
                    <div className="border border-amber-500/20 rounded-2xl overflow-hidden">
                      <button onClick={() => {
                        if (!showSensitivity && !sensitivityData) {
                          const rendered = renderSDL(source, '__editor__');
                          if (rendered) {
                            const data = runSensitivityAnalysis(rendered, variableDisplays, calibratedAst ?? undefined);
                            setSensitivityData(data);
                          }
                        }
                        setShowSensitivity(!showSensitivity);
                      }} className="w-full flex items-center justify-between px-5 py-3 bg-amber-500/5 hover:bg-amber-500/10 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <BarChart3 size={14} className="text-amber-400/70" />
                          <span className="text-xs font-semibold text-zinc-300">Sensitivity analysis</span>
                          <span className="text-[9px] text-amber-400/60 bg-amber-400/10 px-1.5 py-0.5 rounded-full">quali parametri contano?</span>
                        </div>
                        <svg className={`w-3.5 h-3.5 text-zinc-500 transition-transform ${showSensitivity ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </button>
                      {showSensitivity && (
                        <div className="px-5 py-4 bg-zinc-950/50 animate-fade-in">
                          {sensitivityData ? <SensitivityPanel data={sensitivityData} /> : (
                            <div className="flex items-center justify-center py-6"><div className="w-5 h-5 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" /></div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <div className="text-center max-w-xs">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-zinc-800/60 flex items-center justify-center">
                    <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-zinc-400 mb-2">Nessun risultato ancora</p>
                  <p className="text-[11px] text-zinc-600 leading-relaxed">
                    Scrivi o modifica il codice SDL nell'editor, poi premi <strong className="text-zinc-400">Simula</strong> per lanciare 2.000 simulazioni Monte Carlo.
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
