import { useState, useCallback, useRef, useEffect, useMemo, lazy, Suspense } from 'react';
import {
  Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Line, ComposedChart,
} from 'recharts';
import { parse } from '@sdl/core/parser';
import { simulate } from '@sdl/engine/monte-carlo';
import type { SimulationResult } from '@sdl/core/types';
import {
  SCENARIOS, CATEGORY_LABELS, CATEGORY_COLORS,
  type ScenarioDefinition, type SliderDef, type VariableDisplay, type ScenarioCategory,
} from './scenarios';
import { EDITOR_TEMPLATES } from './editor/templates';
import EditorView from './editor/EditorView';
import GuideView, { GUIDE_SECTIONS, type GuideSectionId } from './guide/GuideView';

const CausalGraph = lazy(() => import('./components/CausalGraph'));

// ═══════════════════════════════════════════
// Utility Helpers
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

function getFinalMedian(result: SimulationResult, name: string, type: 'variable' | 'impact'): number | null {
  const src = type === 'impact' ? result.impacts.get(name) : result.variables.get(name);
  if (!src || src.timeseries.length === 0) return null;
  const last = src.timeseries[src.timeseries.length - 1];
  return last.distribution.percentiles.get(50) ?? last.distribution.mean;
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

// ═══════════════════════════════════════════
// Fan Chart
// ═══════════════════════════════════════════

function FanChart({ data, display }: { data: FanChartPoint[]; display: VariableDisplay }) {
  if (!data || data.length === 0) return null;
  const gid = `g-${display.id}`;
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 animate-fade-in">
      <div className="flex items-center gap-2.5 mb-4">
        <span className="text-lg" aria-hidden>{display.icon}</span>
        <div>
          <h3 className="text-sm font-semibold text-slate-200">{display.label}</h3>
          <p className="text-[11px] text-slate-500">{display.description}</p>
        </div>
        <span className="ml-auto text-[10px] uppercase tracking-wider text-slate-600 font-medium">{display.unit}</span>
      </div>
      <ResponsiveContainer width="100%" height={210}>
        <ComposedChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id={`${gid}-o`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={display.color} stopOpacity={0.1} /><stop offset="100%" stopColor={display.color} stopOpacity={0.1} /></linearGradient>
            <linearGradient id={`${gid}-i`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={display.color} stopOpacity={0.22} /><stop offset="100%" stopColor={display.color} stopOpacity={0.22} /></linearGradient>
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
          <Line type="monotone" dataKey="p50" stroke={display.color} strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: display.color, stroke: 'white', strokeWidth: 2 }} />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="flex items-center justify-center gap-6 mt-2 text-[10px] text-slate-600">
        <span className="flex items-center gap-1.5"><span className="w-6 h-1.5 rounded-full" style={{ backgroundColor: display.color, opacity: 0.2 }} />90% (P5-P95)</span>
        <span className="flex items-center gap-1.5"><span className="w-6 h-1.5 rounded-full" style={{ backgroundColor: display.color, opacity: 0.4 }} />50% (P25-P75)</span>
        <span className="flex items-center gap-1.5"><span className="w-6 h-0.5 rounded-full" style={{ backgroundColor: display.color }} />Mediana</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// Slider Control
// ═══════════════════════════════════════════

function SliderControl({ slider, value, onChange }: { slider: SliderDef; value: number; onChange: (v: number) => void }) {
  const isDefault = value === slider.default;
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors">
      <div className="flex items-baseline justify-between mb-1">
        <label className="text-sm font-medium text-slate-200">{slider.label}</label>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-white tabular-nums">{slider.format(value)}</span>
          {!isDefault && <button onClick={() => onChange(slider.default)} className="text-[10px] text-blue-400 hover:text-blue-300">reset</button>}
        </div>
      </div>
      <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">{slider.description}</p>
      <div className="relative">
        <input type="range" min={slider.min} max={slider.max} step={slider.step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full cursor-pointer" />
        <div className="flex justify-between mt-1 text-[10px] text-slate-600"><span>{slider.format(slider.min)}</span><span>{slider.format(slider.max)}</span></div>
        {!isDefault && <div className="absolute top-0 w-0.5 h-[6px] bg-slate-500 rounded-full pointer-events-none" style={{ left: `${((slider.default - slider.min) / (slider.max - slider.min)) * 100}%` }} />}
      </div>
      <div className="mt-2 text-[10px] text-slate-600 italic">Fonte: {slider.source}</div>
    </div>
  );
}

// ═══════════════════════════════════════════
// Sidebar
// ═══════════════════════════════════════════

const CATEGORY_ICONS: Record<ScenarioCategory, string> = {
  tecnologia: 'cpu',
  economia: 'trending-up',
  ambiente: 'leaf',
  societa: 'users',
  politica: 'shield',
};

function CategoryIcon({ category, className = '' }: { category: ScenarioCategory; className?: string }) {
  const paths: Record<ScenarioCategory, JSX.Element> = {
    tecnologia: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M3 9h2m14 0h2M3 15h2m14 0h2M7 7h10v10H7z" />,
    economia: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />,
    ambiente: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3c4.97 0 9 4.03 9 9a9 9 0 01-9 9m0-18a9 9 0 00-9 9 9 9 0 009 9m0-18v18m0-9C9 12 6.5 9 6.5 6S9 3 12 3m0 9c3 0 5.5-3 5.5-6S15 3 12 3" />,
    societa: <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></>,
    politica: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
  };
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
      {paths[category]}
    </svg>
  );
}

type AppMode = 'demo' | 'editor' | 'guide';

interface SidebarProps {
  mode: AppMode;
  selectedId: string | null;
  editorTemplateId: string | null;
  guideSectionId: GuideSectionId | null;
  onSelect: (id: string) => void;
  onEditorSelect: (templateId: string) => void;
  onGuideSelect: (sectionId: GuideSectionId) => void;
  isOpen: boolean;
  onClose: () => void;
}

function Sidebar({ mode, selectedId, editorTemplateId, guideSectionId, onSelect, onEditorSelect, onGuideSelect, isOpen, onClose }: SidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<ScenarioCategory>>(new Set());
  const [editorExpanded, setEditorExpanded] = useState(false);
  const [guideExpanded, setGuideExpanded] = useState(false);

  const grouped = useMemo(() => {
    const map = new Map<ScenarioCategory, ScenarioDefinition[]>();
    for (const s of SCENARIOS) {
      const list = map.get(s.meta.category) ?? [];
      list.push(s);
      map.set(s.meta.category, list);
    }
    return map;
  }, []);

  const categoryOrder: ScenarioCategory[] = ['tecnologia', 'economia', 'ambiente', 'societa', 'politica'];

  const toggleCategory = (cat: ScenarioCategory) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const handleSelect = (id: string) => {
    onSelect(id);
    onClose();
  };

  const handleEditorSelect = (templateId: string) => {
    onEditorSelect(templateId);
    onClose();
  };

  const handleGuideSelect = (sectionId: GuideSectionId) => {
    onGuideSelect(sectionId);
    onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-[280px] bg-slate-950 border-r border-slate-800
          flex flex-col shrink-0 overflow-hidden
          transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0 md:z-0 md:h-full
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo / Header */}
        <div className="shrink-0 px-5 pt-6 pb-4 border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            <img src="/segno_logo_white.png" alt="Segno" className="w-9 h-9 object-contain" />
            <div>
              <h1 className="text-sm font-bold text-white leading-tight">Segno</h1>
              <p className="text-[10px] text-slate-500">SDL Citizen Lab</p>
            </div>
            {/* Mobile close */}
            <button
              onClick={onClose}
              className="ml-auto md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
              aria-label="Chiudi menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 sidebar-scroll">

          {/* ─── DEMO Section ─── */}
          <div className="flex items-center gap-2 px-2 mb-3">
            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Demo</span>
            <span className="ml-auto text-[10px] text-slate-700 bg-slate-800/60 px-1.5 py-0.5 rounded-full">{SCENARIOS.length}</span>
          </div>

          {/* Categories */}
          <div className="space-y-1">
            {categoryOrder.map(cat => {
              const scenarios = grouped.get(cat);
              if (!scenarios || scenarios.length === 0) return null;
              const isExpanded = expandedCategories.has(cat);
              const color = CATEGORY_COLORS[cat];

              return (
                <div key={cat}>
                  {/* Category header */}
                  <button
                    onClick={() => toggleCategory(cat)}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left hover:bg-slate-800/40 transition-colors group"
                  >
                    <svg
                      className={`w-3 h-3 text-slate-600 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <CategoryIcon category={cat} className="text-slate-500 group-hover:text-slate-400 transition-colors" />
                    <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-300 transition-colors">
                      {CATEGORY_LABELS[cat]}
                    </span>
                    <span
                      className="ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                      style={{ color, backgroundColor: `${color}15` }}
                    >
                      {scenarios.length}
                    </span>
                  </button>

                  {/* Scenario items */}
                  {isExpanded && (
                    <div className="ml-4 pl-3 border-l border-slate-800/60 space-y-0.5 mt-0.5 mb-1 animate-slide-down">
                      {scenarios.map(s => {
                        const isActive = mode === 'demo' && selectedId === s.meta.id;
                        return (
                          <button
                            key={s.meta.id}
                            onClick={() => handleSelect(s.meta.id)}
                            className={`
                              w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all duration-150
                              ${isActive
                                ? 'bg-blue-500/10 border border-blue-500/20 text-blue-300'
                                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/40 border border-transparent'
                              }
                            `}
                          >
                            <span className="text-base shrink-0">{s.meta.icon}</span>
                            <div className="min-w-0 flex-1">
                              <p className={`text-[12px] font-medium leading-tight truncate ${isActive ? 'text-blue-300' : 'text-slate-300'}`}>
                                {s.meta.title}
                              </p>
                              <p className="text-[10px] text-slate-600 truncate mt-0.5">{s.meta.period}</p>
                            </div>
                            {isActive && (
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 animate-pulse" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ─── Divider ─── */}
          <div className="my-5 border-t border-slate-800/60" />

          {/* ─── EDITOR Section ─── */}
          <div className="flex items-center gap-2 px-2 mb-3">
            <svg className="w-4 h-4 text-emerald-500/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Editor</span>
            <span className="ml-auto text-[10px] text-emerald-500/60 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">new</span>
          </div>

          {/* Editor toggle */}
          <div className="space-y-0.5">
            <button
              onClick={() => setEditorExpanded(!editorExpanded)}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left hover:bg-slate-800/40 transition-colors group"
            >
              <svg
                className={`w-3 h-3 text-slate-600 transition-transform duration-200 ${editorExpanded ? 'rotate-90' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <svg className="w-4 h-4 text-emerald-400/60 group-hover:text-emerald-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-300 transition-colors">
                Template
              </span>
              <span className="ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded-full text-emerald-400" style={{ backgroundColor: 'rgba(16,185,129,0.08)' }}>
                {EDITOR_TEMPLATES.length}
              </span>
            </button>

            {editorExpanded && (
              <div className="ml-4 pl-3 border-l border-emerald-800/30 space-y-0.5 mt-0.5 mb-1 animate-slide-down">
                {EDITOR_TEMPLATES.map(t => {
                  const isActive = mode === 'editor' && editorTemplateId === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => handleEditorSelect(t.id)}
                      className={`
                        w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all duration-150
                        ${isActive
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                          : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/40 border border-transparent'
                        }
                      `}
                    >
                      <span className="text-base shrink-0">{t.icon}</span>
                      <div className="min-w-0 flex-1">
                        <p className={`text-[12px] font-medium leading-tight truncate ${isActive ? 'text-emerald-300' : 'text-slate-300'}`}>
                          {t.name}
                        </p>
                        <p className="text-[10px] text-slate-600 truncate mt-0.5">{t.description}</p>
                      </div>
                      {isActive && (
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ─── Divider ─── */}
          <div className="my-5 border-t border-slate-800/60" />

          {/* ─── GUIDA Section ─── */}
          <div className="flex items-center gap-2 px-2 mb-3">
            <svg className="w-4 h-4 text-amber-500/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Guida</span>
          </div>

          <div className="space-y-0.5">
            <button
              onClick={() => setGuideExpanded(!guideExpanded)}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left hover:bg-slate-800/40 transition-colors group"
            >
              <svg
                className={`w-3 h-3 text-slate-600 transition-transform duration-200 ${guideExpanded ? 'rotate-90' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <svg className="w-4 h-4 text-amber-400/60 group-hover:text-amber-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-300 transition-colors">
                Sezioni
              </span>
              <span className="ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded-full text-amber-400" style={{ backgroundColor: 'rgba(245,158,11,0.08)' }}>
                {GUIDE_SECTIONS.length}
              </span>
            </button>

            {guideExpanded && (
              <div className="ml-4 pl-3 border-l border-amber-800/20 space-y-0.5 mt-0.5 mb-1 animate-slide-down">
                {GUIDE_SECTIONS.map(s => {
                  const isActive = mode === 'guide' && guideSectionId === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => handleGuideSelect(s.id)}
                      className={`
                        w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all duration-150
                        ${isActive
                          ? 'bg-amber-500/10 border border-amber-500/20 text-amber-300'
                          : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/40 border border-transparent'
                        }
                      `}
                    >
                      <span className="text-sm shrink-0">{s.icon}</span>
                      <p className={`text-[12px] font-medium leading-tight truncate ${isActive ? 'text-amber-300' : 'text-slate-300'}`}>
                        {s.label}
                      </p>
                      {isActive && (
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 animate-pulse ml-auto" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Footer */}
        <div className="shrink-0 px-5 py-4 border-t border-slate-800/60">
          <p className="text-[10px] text-slate-600 leading-relaxed">
            Creato da <span className="text-slate-500">Relatronica</span>
          </p>
          <p className="text-[10px] text-slate-700 mt-0.5">GPL-3.0 License</p>
        </div>
      </aside>
    </>
  );
}

// ═══════════════════════════════════════════
// Welcome Page
// ═══════════════════════════════════════════

function WelcomePage({ onSelect }: { onSelect: (id: string) => void }) {
  const featured = SCENARIOS.slice(0, 4);

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
          <p className="text-lg text-slate-400 max-w-xl mx-auto leading-relaxed mb-2">
            Esplora il futuro con simulazioni trasparenti e verificabili.
          </p>
          <p className="text-sm text-slate-500 max-w-lg mx-auto mb-12">
            Ogni scenario e' basato su dati reali, fonti citate, e 2.000 simulazioni Monte Carlo.
            Modifica le assunzioni, verifica tutto. Niente e' nascosto.
          </p>

          {/* Quick start cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {featured.map(s => (
              <button
                key={s.meta.id}
                onClick={() => onSelect(s.meta.id)}
                className="group text-left bg-slate-900/60 border border-slate-800 rounded-xl p-4 hover:border-slate-600 hover:bg-slate-900/80 transition-all hover:shadow-lg hover:shadow-black/20 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{s.meta.icon}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors truncate">{s.meta.title}</p>
                    <p className="text-[10px] text-slate-600">{s.meta.period}</p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">{s.meta.subtitle}</p>
              </button>
            ))}
          </div>

          <p className="mt-10 text-[11px] text-slate-600 flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
            Seleziona uno scenario dalla sidebar per iniziare
          </p>
        </div>
      </div>

      <footer className="shrink-0 border-t border-slate-800/40 px-6 py-6">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-600">
          <p>Segno — SDL Citizen Lab</p>
          <p>Simulazioni eseguite nel tuo browser. Nessun dato inviato a terzi.</p>
        </div>
      </footer>
    </div>
  );
}

// ═══════════════════════════════════════════
// Scenario View (Simulation Page)
// ═══════════════════════════════════════════

function ScenarioView({ scenario }: { scenario: ScenarioDefinition }) {
  const [values, setValues] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    for (const s of scenario.sliders) init[s.id] = s.default;
    return init;
  });
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showSDL, setShowSDL] = useState(false);
  const [showGraph, setShowGraph] = useState(false);
  const [showMethodology, setShowMethodology] = useState(false);
  const [simElapsed, setSimElapsed] = useState(0);
  const [simRuns, setSimRuns] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const runSim = useCallback((vals: Record<string, number>) => {
    const sdl = scenario.generateSDL(vals);
    const { ast } = parse(sdl);
    if (!ast) return;
    setIsSimulating(true);
    setTimeout(() => {
      try {
        const res = simulate(ast, { runs: 2000, seed: 42 });
        setResult(res);
        setSimElapsed(res.elapsedMs);
        setSimRuns(res.runs);
      } catch (e) { console.error(e); }
      finally { setIsSimulating(false); }
    }, 30);
  }, [scenario]);

  useEffect(() => { runSim(values); }, []);

  const handleChange = useCallback((id: string, value: number) => {
    setValues(prev => {
      const next = { ...prev, [id]: value };
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => runSim(next), 350);
      return next;
    });
  }, [runSim]);

  const resetAll = useCallback(() => {
    const defs: Record<string, number> = {};
    for (const s of scenario.sliders) defs[s.id] = s.default;
    setValues(defs);
    runSim(defs);
  }, [scenario, runSim]);

  const sdlSource = scenario.generateSDL(values);
  const { meta } = scenario;

  return (
    <div className="min-h-full animate-fade-in">
      {/* Compact header */}
      <header className="relative overflow-hidden border-b border-slate-800">
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
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight mb-2">
            {meta.title}
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed mb-4">
            {meta.description}
          </p>
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5 bg-slate-800/60 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {isSimulating ? 'Simulazione in corso...' : `${simRuns.toLocaleString()} simulazioni`}
            </span>
            <span className="bg-slate-800/60 px-3 py-1.5 rounded-full">{meta.period}</span>
            {simElapsed > 0 && <span className="bg-slate-800/60 px-3 py-1.5 rounded-full">{simElapsed}ms</span>}
            <div className="flex flex-wrap gap-1.5 ml-2">
              {meta.tags.map(tag => (
                <span key={tag} className="text-[10px] bg-slate-800/40 text-slate-600 px-2 py-0.5 rounded-full">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sliders */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-white">Le tue assunzioni</h2>
              <button onClick={resetAll} className="text-[11px] text-slate-500 hover:text-blue-400 transition-colors px-2 py-1 rounded-md hover:bg-slate-800">Ripristina tutto</button>
            </div>
            {scenario.sliders.map(s => (
              <SliderControl key={s.id} slider={s} value={values[s.id]} onChange={v => handleChange(s.id, v)} />
            ))}
          </div>

          {/* Charts */}
          <div className="lg:col-span-8 space-y-5">
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
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-2">
                {scenario.variables.map(vd => {
                  const val = getFinalMedian(result, vd.id, vd.type);
                  if (val === null) return null;
                  const isNeg = val < 0;
                  const lastYear = result.timesteps[result.timesteps.length - 1]?.getFullYear() ?? '';
                  return (
                    <div key={vd.id} className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-center">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 truncate">{vd.label}</p>
                      <p className="text-xl font-bold tabular-nums" style={{ color: vd.id.includes('netto') || vd.id.includes('guadagno') || vd.id.includes('riduzione') || vd.id.includes('pressione') ? (isNeg ? '#ef4444' : '#10b981') : vd.color }}>
                        {isNeg ? '' : '+'}{formatValue(val)}
                      </p>
                      <p className="text-[10px] text-slate-600 mt-0.5">{lastYear} {vd.unit}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {result ? (
              scenario.variables.map(vd => (
                <FanChart key={vd.id} data={extractFanData(result, vd.id, vd.type)} display={vd} />
              ))
            ) : (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                  <p className="text-sm text-slate-400">Prima simulazione in corso...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Causal Graph + Transparency */}
        <div className="mt-12 space-y-4">
          {/* Causal Graph */}
          <div className="border border-slate-800 rounded-2xl overflow-hidden">
            <button onClick={() => setShowGraph(!showGraph)} className="w-full flex items-center justify-between px-6 py-4 bg-slate-900/40 hover:bg-slate-900/60 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-blue-400/70">🔗</span>
                <span className="text-sm font-semibold text-slate-300">Grafo causale</span>
                <span className="text-[10px] text-slate-600 bg-slate-800 px-2 py-0.5 rounded-full">interattivo</span>
              </div>
              <svg className={`w-4 h-4 text-slate-500 transition-transform ${showGraph ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {showGraph && (
              <div className="px-2 py-3 bg-slate-950/50 animate-fade-in">
                <p className="text-[11px] text-slate-500 mb-3 px-4">Mappa interattiva delle dipendenze causali tra variabili. Trascina per esplorare, zoom con la rotella.</p>
                <Suspense fallback={<div className="h-[500px] flex items-center justify-center"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>}>
                  <CausalGraph sdlSource={sdlSource} />
                </Suspense>
              </div>
            )}
          </div>

          {/* Methodology */}
          <div className="border border-slate-800 rounded-2xl overflow-hidden">
            <button onClick={() => setShowMethodology(!showMethodology)} className="w-full flex items-center justify-between px-6 py-4 bg-slate-900/40 hover:bg-slate-900/60 transition-colors">
              <div className="flex items-center gap-3"><span className="text-slate-500">&#9432;</span><span className="text-sm font-semibold text-slate-300">Metodologia e trasparenza</span></div>
              <svg className={`w-4 h-4 text-slate-500 transition-transform ${showMethodology ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {showMethodology && (
              <div className="px-6 py-5 bg-slate-950/50 text-sm text-slate-400 leading-relaxed space-y-3 animate-fade-in">
                <p><strong className="text-slate-300">Simulazione Monte Carlo:</strong> Ogni scenario viene simulato 2.000 volte con valori estratti casualmente dalle distribuzioni di incertezza. Il risultato e' una distribuzione di probabilita'.</p>
                <p><strong className="text-slate-300">Bande di incertezza:</strong> La banda esterna copre il 90% dei risultati (P5-P95). La banda interna il 50% centrale (P25-P75). La linea e' la mediana.</p>
                <p><strong className="text-slate-300">Fonti:</strong> Ogni assunzione riporta la fonte. I dati provengono da ISTAT, OECD, Eurostat, ENEA, GSE, INPS, e altre fonti istituzionali.</p>
                <p><strong className="text-slate-300">Limiti:</strong> Questo e' uno strumento esplorativo, non predittivo. Non cattura shock esogeni o dinamiche settoriali specifiche.</p>
                <p><strong className="text-slate-300">Privacy:</strong> Le simulazioni sono eseguite nel browser. Nessun dato viene inviato a server esterni.</p>
              </div>
            )}
          </div>
          <div className="border border-slate-800 rounded-2xl overflow-hidden">
            <button onClick={() => setShowSDL(!showSDL)} className="w-full flex items-center justify-between px-6 py-4 bg-slate-900/40 hover:bg-slate-900/60 transition-colors">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-blue-400/60">{'{}'}</span>
                <span className="text-sm font-semibold text-slate-300">Codice sorgente SDL</span>
                <span className="text-[10px] text-slate-600 bg-slate-800 px-2 py-0.5 rounded-full">verificabile</span>
              </div>
              <svg className={`w-4 h-4 text-slate-500 transition-transform ${showSDL ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {showSDL && (
              <div className="px-6 py-5 bg-slate-950/50 animate-fade-in">
                <p className="text-[11px] text-slate-500 mb-3">Codice SDL generato dalle tue assunzioni. Leggibile, verificabile, copiabile.</p>
                <pre className="text-xs font-mono text-slate-400 bg-slate-900/80 border border-slate-800 rounded-xl p-4 overflow-x-auto max-h-96 overflow-y-auto leading-relaxed">{sdlSource}</pre>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════
// Main App (Sidebar Layout)
// ═══════════════════════════════════════════

export default function App() {
  const [mode, setMode] = useState<AppMode>('demo');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editorTemplateId, setEditorTemplateId] = useState<string | null>(null);
  const [guideSectionId, setGuideSectionId] = useState<GuideSectionId | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  const selected = selectedId ? SCENARIOS.find(s => s.meta.id === selectedId) ?? null : null;

  const handleSelect = useCallback((id: string) => {
    setMode('demo');
    setSelectedId(id);
    setEditorTemplateId(null);
    setGuideSectionId(null);
    setSidebarOpen(false);
    mainRef.current?.scrollTo(0, 0);
  }, []);

  const handleEditorSelect = useCallback((templateId: string) => {
    setMode('editor');
    setEditorTemplateId(templateId);
    setSelectedId(null);
    setGuideSectionId(null);
    setSidebarOpen(false);
    mainRef.current?.scrollTo(0, 0);
  }, []);

  const handleGuideSelect = useCallback((sectionId: GuideSectionId) => {
    setMode('guide');
    setGuideSectionId(sectionId);
    setSelectedId(null);
    setEditorTemplateId(null);
    setSidebarOpen(false);
    mainRef.current?.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <Sidebar
        mode={mode}
        selectedId={selectedId}
        editorTemplateId={editorTemplateId}
        guideSectionId={guideSectionId}
        onSelect={handleSelect}
        onEditorSelect={handleEditorSelect}
        onGuideSelect={handleGuideSelect}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div ref={mainRef} className="flex-1 min-w-0 overflow-y-auto">
        {/* Mobile topbar */}
        <div className="sticky top-0 z-30 md:hidden bg-slate-950/90 backdrop-blur-md border-b border-slate-800/60 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Apri menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <img src="/segno_logo_white.png" alt="Segno" className="w-6 h-6 object-contain" />
            <span className="text-sm font-semibold text-white">Segno</span>
          </div>
          {mode === 'demo' && selected && (
            <span className="ml-auto text-[11px] text-slate-500 truncate max-w-[40%]">{selected.meta.title}</span>
          )}
          {mode === 'editor' && (
            <span className="ml-auto text-[11px] text-emerald-400 truncate max-w-[40%]">Editor</span>
          )}
          {mode === 'guide' && (
            <span className="ml-auto text-[11px] text-amber-400 truncate max-w-[40%]">Guida SDL</span>
          )}
        </div>

        {/* Page content */}
        {mode === 'guide' && guideSectionId ? (
          <GuideView key={guideSectionId} initialSection={guideSectionId} />
        ) : mode === 'editor' && editorTemplateId ? (
          <EditorView key={editorTemplateId} initialTemplate={editorTemplateId} />
        ) : mode === 'demo' && selected ? (
          <ScenarioView key={selected.meta.id} scenario={selected} />
        ) : (
          <WelcomePage onSelect={handleSelect} />
        )}
      </div>
    </div>
  );
}
