/**
 * AI Wizard — 5-step guided flow to generate SDL scenarios with an LLM.
 *
 * Steps:
 *   1. Tema — Choose category
 *   2. Contesto — Describe topic, region, timeframe
 *   3. Variabili — Select what to measure
 *   4. Leve — Choose controllable parameters
 *   5. Riepilogo & Genera — Review, configure AI, generate
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  Sparkles, ChevronRight, ChevronLeft, Wand2, Settings2,
  Loader2, CheckCircle2, AlertCircle, ExternalLink, Trash2,
  Copy, ArrowRight, Key,
  Microscope, TrendingUp, Globe, Users, Shield, Scale,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { parse } from '@sdl/core/parser';
import { simulate } from '@sdl/engine/monte-carlo';
import type { SimulationResult, ScenarioNode } from '@sdl/core/types';
import {
  AI_PROVIDERS, loadAIConfig, saveAIConfig, clearAIConfig,
  type AIConfig,
} from './providers';
import { generateSDL } from './generate';
import type { WizardData } from './system-prompt';
import { extractFanData, formatValue, type FanChartPoint } from '../lib/simulation';
import {
  Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Line, ComposedChart,
} from 'recharts';

// ─── Constants ───

type Category = 'tecnologia' | 'economia' | 'ambiente' | 'societa' | 'politica' | 'regolamentazione';

const CATEGORIES: { id: Category; label: string; Icon: LucideIcon; color: string }[] = [
  { id: 'tecnologia', label: 'Tecnologia', Icon: Microscope, color: '#3b82f6' },
  { id: 'economia', label: 'Economia', Icon: TrendingUp, color: '#f59e0b' },
  { id: 'ambiente', label: 'Ambiente', Icon: Globe, color: '#10b981' },
  { id: 'societa', label: 'Società', Icon: Users, color: '#8b5cf6' },
  { id: 'politica', label: 'Politica', Icon: Shield, color: '#ef4444' },
  { id: 'regolamentazione', label: 'Regolamentazione', Icon: Scale, color: '#6366f1' },
];

const VARIABLE_SUGGESTIONS: Record<Category, string[]> = {
  tecnologia: ['Adozione tecnologica', 'Investimenti R&D', 'Occupazione settore tech', 'Brevetti depositati', 'Quota mercato AI', 'Cybersicurezza', 'Automazione industriale'],
  economia: ['PIL reale', 'Tasso di occupazione', 'Debito/PIL', 'Inflazione', 'Export', 'Investimenti esteri', 'Produttività del lavoro'],
  ambiente: ['Emissioni CO₂', 'Quota rinnovabili', 'Temperatura media', 'Livello del mare', 'Deforestazione', 'Biodiversità', 'Consumo idrico'],
  societa: ['Popolazione', 'Indice di dipendenza', 'Aspettativa di vita', 'Tasso di natalità', 'Istruzione terziaria', 'Disuguaglianza (Gini)', 'Indice felicità'],
  politica: ['Fiducia nelle istituzioni', 'Partecipazione elettorale', 'Spesa militare', 'Cooperazione internazionale', 'Stabilità governativa', 'Corruzione percepita'],
  regolamentazione: ['Copertura normativa', 'Costi di compliance', 'Sanzioni emesse', 'Trasparenza algoritmica', 'Adozione standard', 'Contenziosi aperti'],
};

const PARAMETER_SUGGESTIONS: Record<Category, string[]> = {
  tecnologia: ['Budget innovazione', 'Incentivi fiscali R&D', 'Quota formazione STEM', 'Investimento infrastrutture digitali'],
  economia: ['Spesa pubblica', 'Aliquota fiscale imprese', 'Tasso di interesse', 'Investimento in infrastrutture'],
  ambiente: ['Carbon tax', 'Sussidio rinnovabili', 'Obiettivo emissioni', 'Investimento in adattamento'],
  societa: ['Bonus natalità', 'Quota immigrazione', 'Spesa welfare', 'Investimento in istruzione'],
  politica: ['Spesa per difesa', 'Investimento in diplomazia', 'Budget anticorruzione', 'Fondi cooperazione'],
  regolamentazione: ['Budget enforcement', 'Soglia de minimis', 'Periodo di transizione', 'Incentivo compliance'],
};

const REGIONS = [
  'Italia', 'Europa (UE)', 'Mediterraneo', 'Nord Africa',
  'Africa Sub-Sahariana', 'Stati Uniti', 'Cina', 'India',
  'Sud-Est Asiatico', 'America Latina', 'Globale',
];

// ─── Mini Fan Chart (reused from EditorView) ───

function MiniFanChart({ data, label, color, unit }: {
  data: FanChartPoint[]; label: string; color: string; unit: string;
}) {
  if (!data || data.length === 0) return null;
  const gid = `g-wiz-${label.replace(/\s/g, '-')}`;
  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <h4 className="text-xs font-semibold text-zinc-200 truncate">{label}</h4>
        <span className="ml-auto text-[9px] uppercase tracking-wider text-zinc-600">{unit}</span>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <ComposedChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id={`${gid}-o`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.1} /><stop offset="100%" stopColor={color} stopOpacity={0.1} /></linearGradient>
            <linearGradient id={`${gid}-i`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.22} /><stop offset="100%" stopColor={color} stopOpacity={0.22} /></linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgb(39,39,42)" />
          <XAxis dataKey="year" tick={{ fontSize: 10, fill: 'rgb(113,113,122)' }} axisLine={{ stroke: 'rgb(63,63,70)' }} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: 'rgb(113,113,122)' }} axisLine={{ stroke: 'rgb(63,63,70)' }} tickLine={false} tickFormatter={formatValue} width={45} />
          <Tooltip
            contentStyle={{ backgroundColor: 'rgb(24,24,27)', border: '1px solid rgb(63,63,70)', borderRadius: '10px', fontSize: '11px', color: 'rgb(212,212,216)' }}
            formatter={(value: number, name: string) => name === 'p50' ? [formatValue(value), 'Mediana'] : [null, null]}
            labelFormatter={(l) => `Anno ${l}`}
          />
          <Area type="monotone" dataKey="base" stackId="fan" fill="transparent" stroke="none" />
          <Area type="monotone" dataKey="outerLower" stackId="fan" fill={`url(#${gid}-o)`} stroke="none" />
          <Area type="monotone" dataKey="innerLower" stackId="fan" fill={`url(#${gid}-i)`} stroke="none" />
          <Area type="monotone" dataKey="innerUpper" stackId="fan" fill={`url(#${gid}-i)`} stroke="none" />
          <Area type="monotone" dataKey="outerUpper" stackId="fan" fill={`url(#${gid}-o)`} stroke="none" />
          <Line type="monotone" dataKey="p50" stroke={color} strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Chip toggle ───

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
        selected
          ? 'bg-violet-500/15 border-violet-500/30 text-violet-300'
          : 'bg-zinc-800/40 border-zinc-700/40 text-zinc-400 hover:text-zinc-300 hover:border-zinc-600'
      }`}
    >
      {label}
    </button>
  );
}

// ─── Step indicator ───

const STEP_LABELS = ['Tema', 'Contesto', 'Variabili', 'Leve', 'Genera'];

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
            i < current ? 'bg-violet-500 text-white' :
            i === current ? 'bg-violet-500/20 border-2 border-violet-500 text-violet-300' :
            'bg-zinc-800 text-zinc-600'
          }`}>
            {i < current ? <CheckCircle2 size={14} /> : i + 1}
          </div>
          {i < total - 1 && (
            <div className={`w-6 h-0.5 rounded-full transition-all ${i < current ? 'bg-violet-500' : 'bg-zinc-800'}`} />
          )}
        </div>
      ))}
      <span className="ml-3 text-[11px] text-zinc-500">{STEP_LABELS[current]}</span>
    </div>
  );
}

// ═══════════════════════════════════════════
// Main Wizard Component
// ═══════════════════════════════════════════

const CHART_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444',
  '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1',
];

interface WizardViewProps {
  onOpenInEditor?: (sdlSource: string) => void;
}

export default function WizardView({ onOpenInEditor }: WizardViewProps) {
  const [step, setStep] = useState(0);

  // Wizard data
  const [category, setCategory] = useState<Category>('tecnologia');
  const [topic, setTopic] = useState('');
  const [region, setRegion] = useState('Italia');
  const [startYear, setStartYear] = useState(2025);
  const [endYear, setEndYear] = useState(2045);
  const [selectedVars, setSelectedVars] = useState<Set<string>>(new Set());
  const [customVars, setCustomVars] = useState('');
  const [selectedParams, setSelectedParams] = useState<Set<string>>(new Set());
  const [customParams, setCustomParams] = useState('');
  const [extraNotes, setExtraNotes] = useState('');

  // AI config
  const [aiConfig, setAiConfig] = useState<AIConfig | null>(() => loadAIConfig());
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [tempProvider, setTempProvider] = useState(aiConfig?.providerId ?? 'openai');
  const [tempModel, setTempModel] = useState(aiConfig?.modelId ?? 'gpt-4o');
  const [tempKey, setTempKey] = useState(aiConfig?.apiKey ?? '');

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStatus, setGenStatus] = useState('');
  const [genError, setGenError] = useState('');
  const [generatedSDL, setGeneratedSDL] = useState('');
  const [genAttempts, setGenAttempts] = useState(0);
  const [genParseOk, setGenParseOk] = useState(false);

  // Simulation results
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [simAst, setSimAst] = useState<ScenarioNode | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Sync provider → model
  useEffect(() => {
    const prov = AI_PROVIDERS.find(p => p.id === tempProvider);
    if (prov && !prov.models.find(m => m.id === tempModel)) {
      setTempModel(prov.models[0].id);
    }
  }, [tempProvider]);

  const currentProvider = AI_PROVIDERS.find(p => p.id === tempProvider);

  const saveConfig = useCallback(() => {
    const config: AIConfig = { providerId: tempProvider, modelId: tempModel, apiKey: tempKey };
    saveAIConfig(config);
    setAiConfig(config);
    setShowApiConfig(false);
  }, [tempProvider, tempModel, tempKey]);

  const deleteConfig = useCallback(() => {
    clearAIConfig();
    setAiConfig(null);
    setTempKey('');
    setShowApiConfig(false);
  }, []);

  const toggleVar = useCallback((v: string) => {
    setSelectedVars(prev => {
      const next = new Set(prev);
      if (next.has(v)) next.delete(v); else next.add(v);
      return next;
    });
  }, []);

  const toggleParam = useCallback((p: string) => {
    setSelectedParams(prev => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p); else next.add(p);
      return next;
    });
  }, []);

  const canProceed = useMemo(() => {
    switch (step) {
      case 0: return true;
      case 1: return topic.trim().length >= 5;
      case 2: return selectedVars.size > 0 || customVars.trim().length > 0;
      case 3: return selectedParams.size > 0 || customParams.trim().length > 0;
      case 4: return !!aiConfig?.apiKey;
      default: return true;
    }
  }, [step, topic, selectedVars, customVars, selectedParams, customParams, aiConfig]);

  const handleGenerate = useCallback(async () => {
    if (!aiConfig) return;

    setIsGenerating(true);
    setGenError('');
    setGeneratedSDL('');
    setSimResult(null);
    setSimAst(null);

    abortRef.current = new AbortController();

    const wizardData: WizardData = {
      category,
      topic,
      region,
      startYear,
      endYear,
      variables: [...selectedVars],
      customVariables: customVars,
      parameters: [...selectedParams],
      customParameters: customParams,
      extraNotes,
    };

    try {
      const result = await generateSDL(
        aiConfig,
        wizardData,
        (status) => setGenStatus(status),
        abortRef.current.signal,
      );

      setGeneratedSDL(result.sdl);
      setGenAttempts(result.attempts);
      setGenParseOk(result.parseOk);

      if (!result.parseOk) {
        setGenError(`Lo scenario generato contiene ancora errori dopo ${result.attempts} tentativi. Puoi comunque aprirlo nell'editor per correggerlo manualmente.`);
      }

      // Auto-simulate if parsing succeeded
      if (result.parseOk && result.sdl) {
        try {
          const { ast } = parse(result.sdl);
          if (ast) {
            setSimAst(ast);
            const simRes = simulate(ast, { runs: 2000, seed: 42 });
            setSimResult(simRes);
          }
        } catch {
          // Simulation failed — that's OK, user can still use the SDL
        }
      }

      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setGenError('Generazione annullata.');
      } else {
        setGenError(err.message || 'Errore sconosciuto durante la generazione.');
      }
    } finally {
      setIsGenerating(false);
      setGenStatus('');
    }
  }, [aiConfig, category, topic, region, startYear, endYear, selectedVars, customVars, selectedParams, customParams, extraNotes]);

  const handleCancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const handleCopySDL = useCallback(() => {
    navigator.clipboard.writeText(generatedSDL);
  }, [generatedSDL]);

  // Result charts
  const resultCharts = useMemo(() => {
    if (!simResult) return [];
    const charts: { name: string; type: 'variable' | 'impact'; color: string }[] = [];
    let idx = 0;
    for (const [name] of simResult.variables) {
      charts.push({ name, type: 'variable', color: CHART_COLORS[idx % CHART_COLORS.length] });
      idx++;
    }
    for (const [name] of simResult.impacts) {
      charts.push({ name, type: 'impact', color: CHART_COLORS[idx % CHART_COLORS.length] });
      idx++;
    }
    return charts;
  }, [simResult]);

  return (
    <div className="min-h-full animate-fade-in">
      {/* Header */}
      <header className="relative overflow-hidden border-b border-zinc-800">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/5 via-transparent to-fuchsia-600/5" />
        <div className="relative max-w-4xl mx-auto px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-violet-500/10 text-violet-400">
              <Wand2 size={22} strokeWidth={1.8} />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest font-medium px-2 py-0.5 rounded-full text-violet-400 bg-violet-400/10">
                AI Wizard
              </span>
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight mb-2">
            Genera uno scenario con l'AI
          </h1>
          <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed mb-5">
            Rispondi a poche domande e l'intelligenza artificiale creerà uno scenario SDL completo,
            pronto per la simulazione Monte Carlo.
          </p>
          <StepIndicator current={step} total={5} />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 lg:px-8 py-8">
        {/* ═══ Step 0: TEMA ═══ */}
        {step === 0 && (
          <div className="animate-fade-in">
            <h2 className="text-lg font-bold text-white mb-2">Che area vuoi esplorare?</h2>
            <p className="text-sm text-zinc-400 mb-6">Scegli la categoria tematica dello scenario.</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {CATEGORIES.map(cat => {
                const isActive = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`group text-left p-4 rounded-xl border transition-all ${
                      isActive
                        ? 'border-violet-500/40 bg-violet-500/10'
                        : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-600 hover:bg-zinc-900/60'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2.5 transition-colors ${
                        isActive ? 'bg-violet-500/15' : 'bg-zinc-800/60 group-hover:bg-zinc-800'
                      }`}
                    >
                      <cat.Icon
                        size={20}
                        strokeWidth={1.6}
                        style={{ color: isActive ? cat.color : undefined }}
                        className={isActive ? '' : 'text-zinc-400 group-hover:text-zinc-300 transition-colors'}
                      />
                    </div>
                    <p className={`text-sm font-semibold ${isActive ? 'text-violet-300' : 'text-zinc-200'}`}>
                      {cat.label}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ Step 1: CONTESTO ═══ */}
        {step === 1 && (
          <div className="animate-fade-in space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white mb-2">Descrivi lo scenario</h2>
              <p className="text-sm text-zinc-400 mb-4">Cosa vuoi esplorare? Scrivi una breve descrizione.</p>
              <textarea
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="Es: Impatto dell'intelligenza artificiale sul mercato del lavoro italiano, con focus su automazione e nuove competenze..."
                className="w-full h-28 bg-zinc-900/60 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 resize-none"
              />
              <p className="text-[10px] text-zinc-600 mt-1">{topic.length} caratteri (minimo 5)</p>
            </div>

            <div>
              <label className="text-sm font-semibold text-zinc-300 mb-2 block">Area geografica</label>
              <div className="flex flex-wrap gap-2">
                {REGIONS.map(r => (
                  <Chip key={r} label={r} selected={region === r} onClick={() => setRegion(r)} />
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-zinc-300 mb-3 block">Orizzonte temporale</label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 block">Anno inizio</label>
                  <input
                    type="number"
                    value={startYear}
                    onChange={e => setStartYear(parseInt(e.target.value) || 2025)}
                    min={2020} max={2080}
                    className="w-full bg-zinc-900/60 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-violet-500/50"
                  />
                </div>
                <ArrowRight size={16} className="text-zinc-600 mt-5" />
                <div className="flex-1">
                  <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 block">Anno fine</label>
                  <input
                    type="number"
                    value={endYear}
                    onChange={e => setEndYear(parseInt(e.target.value) || 2050)}
                    min={startYear + 5} max={2100}
                    className="w-full bg-zinc-900/60 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-violet-500/50"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ Step 2: VARIABILI ═══ */}
        {step === 2 && (
          <div className="animate-fade-in space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white mb-2">Cosa vuoi misurare?</h2>
              <p className="text-sm text-zinc-400 mb-4">
                Seleziona le variabili da tracciare nello scenario. Puoi anche aggiungerne di personalizzate.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {(VARIABLE_SUGGESTIONS[category] ?? []).map(v => (
                  <Chip key={v} label={v} selected={selectedVars.has(v)} onClick={() => toggleVar(v)} />
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-zinc-300 mb-2 block">Variabili personalizzate</label>
              <input
                value={customVars}
                onChange={e => setCustomVars(e.target.value)}
                placeholder="Es: tasso disoccupazione giovanile, export high-tech..."
                className="w-full bg-zinc-900/60 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50"
              />
              <p className="text-[10px] text-zinc-600 mt-1">Separale con virgola</p>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-zinc-500 bg-zinc-900/40 border border-zinc-800 rounded-lg px-3 py-2">
              <Sparkles size={14} className="text-violet-400 shrink-0" />
              L'AI aggiungerà automaticamente serie temporali, dipendenze causali e distribuzioni d'incertezza.
            </div>
          </div>
        )}

        {/* ═══ Step 3: LEVE ═══ */}
        {step === 3 && (
          <div className="animate-fade-in space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white mb-2">Quali leve vuoi controllare?</h2>
              <p className="text-sm text-zinc-400 mb-4">
                Questi diventeranno slider interattivi per esplorare scenari "what-if".
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {(PARAMETER_SUGGESTIONS[category] ?? []).map(p => (
                  <Chip key={p} label={p} selected={selectedParams.has(p)} onClick={() => toggleParam(p)} />
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-zinc-300 mb-2 block">Parametri personalizzati</label>
              <input
                value={customParams}
                onChange={e => setCustomParams(e.target.value)}
                placeholder="Es: budget formazione, incentivi all'export..."
                className="w-full bg-zinc-900/60 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50"
              />
              <p className="text-[10px] text-zinc-600 mt-1">Separali con virgola</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-zinc-300 mb-2 block">Note aggiuntive (opzionale)</label>
              <textarea
                value={extraNotes}
                onChange={e => setExtraNotes(e.target.value)}
                placeholder="Es: Vorrei un branch pessimistico con recessione globale, includi l'impatto su giovani under-30..."
                className="w-full h-20 bg-zinc-900/60 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 resize-none"
              />
            </div>
          </div>
        )}

        {/* ═══ Step 4: RIEPILOGO & GENERA ═══ */}
        {step === 4 && (
          <div className="animate-fade-in space-y-6">
            <h2 className="text-lg font-bold text-white mb-2">Riepilogo e generazione</h2>

            {/* Summary */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl divide-y divide-zinc-800/60">
              <div className="px-5 py-3 flex items-center justify-between">
                <span className="text-xs text-zinc-500">Categoria</span>
                <span className="text-xs font-medium text-zinc-200 flex items-center gap-1.5">
                  {(() => {
                    const cat = CATEGORIES.find(c => c.id === category);
                    if (!cat) return category;
                    return <><cat.Icon size={13} strokeWidth={1.6} style={{ color: cat.color }} />{cat.label}</>;
                  })()}
                </span>
              </div>
              <div className="px-5 py-3 flex items-center justify-between">
                <span className="text-xs text-zinc-500">Tema</span>
                <span className="text-xs font-medium text-zinc-200 max-w-[60%] text-right truncate">{topic}</span>
              </div>
              <div className="px-5 py-3 flex items-center justify-between">
                <span className="text-xs text-zinc-500">Area</span>
                <span className="text-xs font-medium text-zinc-200">{region}</span>
              </div>
              <div className="px-5 py-3 flex items-center justify-between">
                <span className="text-xs text-zinc-500">Orizzonte</span>
                <span className="text-xs font-medium text-zinc-200">{startYear} → {endYear}</span>
              </div>
              <div className="px-5 py-3">
                <span className="text-xs text-zinc-500 block mb-1.5">Variabili ({selectedVars.size + (customVars.trim() ? customVars.split(',').filter(Boolean).length : 0)})</span>
                <div className="flex flex-wrap gap-1.5">
                  {[...selectedVars].map(v => (
                    <span key={v} className="text-[10px] px-2 py-0.5 bg-violet-500/10 text-violet-300 rounded-full">{v}</span>
                  ))}
                  {customVars.trim() && customVars.split(',').filter(Boolean).map(v => (
                    <span key={v} className="text-[10px] px-2 py-0.5 bg-fuchsia-500/10 text-fuchsia-300 rounded-full">{v.trim()}</span>
                  ))}
                </div>
              </div>
              <div className="px-5 py-3">
                <span className="text-xs text-zinc-500 block mb-1.5">Parametri slider ({selectedParams.size + (customParams.trim() ? customParams.split(',').filter(Boolean).length : 0)})</span>
                <div className="flex flex-wrap gap-1.5">
                  {[...selectedParams].map(p => (
                    <span key={p} className="text-[10px] px-2 py-0.5 bg-cyan-500/10 text-cyan-300 rounded-full">{p}</span>
                  ))}
                  {customParams.trim() && customParams.split(',').filter(Boolean).map(p => (
                    <span key={p} className="text-[10px] px-2 py-0.5 bg-teal-500/10 text-teal-300 rounded-full">{p.trim()}</span>
                  ))}
                </div>
              </div>
              {extraNotes.trim() && (
                <div className="px-5 py-3">
                  <span className="text-xs text-zinc-500 block mb-1">Note</span>
                  <p className="text-xs text-zinc-300">{extraNotes}</p>
                </div>
              )}
            </div>

            {/* AI Configuration */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-violet-500/15 flex items-center justify-center">
                    <Key size={14} className="text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-zinc-200">Configurazione AI</h3>
                    {aiConfig ? (
                      <p className="text-[10px] text-zinc-500">
                        {AI_PROVIDERS.find(p => p.id === aiConfig.providerId)?.name} — {
                          AI_PROVIDERS.find(p => p.id === aiConfig.providerId)?.models.find(m => m.id === aiConfig.modelId)?.name ?? aiConfig.modelId
                        }
                      </p>
                    ) : (
                      <p className="text-[10px] text-amber-400">Nessuna API key configurata</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowApiConfig(!showApiConfig)}
                  className="text-[11px] text-zinc-400 hover:text-violet-400 transition-colors flex items-center gap-1"
                >
                  <Settings2 size={13} />
                  {showApiConfig ? 'Chiudi' : 'Configura'}
                </button>
              </div>

              {showApiConfig && (
                <div className="px-5 py-4 space-y-4 animate-fade-in">
                  {/* Provider */}
                  <div>
                    <label className="text-[11px] text-zinc-400 font-medium mb-2 block">Provider</label>
                    <div className="grid grid-cols-3 gap-2">
                      {AI_PROVIDERS.map(p => (
                        <button
                          key={p.id}
                          onClick={() => setTempProvider(p.id)}
                          className={`text-left p-3 rounded-lg border text-xs transition-all ${
                            tempProvider === p.id
                              ? 'border-violet-500/40 bg-violet-500/10'
                              : 'border-zinc-700/40 bg-zinc-800/30 hover:border-zinc-600'
                          }`}
                        >
                          <p className={`font-semibold ${tempProvider === p.id ? 'text-violet-300' : 'text-zinc-300'}`}>{p.name}</p>
                          <p className="text-[10px] text-zinc-500 mt-0.5 line-clamp-1">{p.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Model */}
                  {currentProvider && (
                    <div>
                      <label className="text-[11px] text-zinc-400 font-medium mb-2 block">Modello</label>
                      <div className="space-y-1.5">
                        {currentProvider.models.map(m => (
                          <button
                            key={m.id}
                            onClick={() => setTempModel(m.id)}
                            className={`w-full text-left px-3 py-2 rounded-lg border text-xs transition-all ${
                              tempModel === m.id
                                ? 'border-violet-500/30 bg-violet-500/8'
                                : 'border-zinc-800 hover:border-zinc-600'
                            }`}
                          >
                            <span className={`font-medium ${tempModel === m.id ? 'text-violet-300' : 'text-zinc-300'}`}>{m.name}</span>
                            <span className="text-zinc-500 ml-2">{m.description}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* API Key */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[11px] text-zinc-400 font-medium">API Key</label>
                      {currentProvider && (
                        <a
                          href={currentProvider.keyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors"
                        >
                          Ottieni una chiave <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                    <input
                      type="password"
                      value={tempKey}
                      onChange={e => setTempKey(e.target.value)}
                      placeholder={currentProvider?.keyPlaceholder ?? 'Inserisci la tua API key...'}
                      className="w-full bg-zinc-900/60 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 font-mono"
                    />
                    <p className="text-[10px] text-zinc-600 mt-1.5 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      La chiave resta nel tuo browser (localStorage). Non viene inviata a nessun server nostro.
                    </p>
                  </div>

                  {/* Save / Delete */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={saveConfig}
                      disabled={!tempKey.trim()}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                        tempKey.trim()
                          ? 'bg-violet-600 text-white hover:bg-violet-500'
                          : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                      }`}
                    >
                      <CheckCircle2 size={14} />
                      Salva configurazione
                    </button>
                    {aiConfig && (
                      <button
                        onClick={deleteConfig}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={13} />
                        Cancella
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={!aiConfig?.apiKey || isGenerating}
              className={`w-full flex items-center justify-center gap-3 px-6 py-4 text-sm font-bold rounded-xl transition-all ${
                !aiConfig?.apiKey || isGenerating
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {genStatus || 'Generazione in corso...'}
                  <button onClick={handleCancel} className="ml-2 text-xs underline opacity-70 hover:opacity-100">
                    Annulla
                  </button>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Genera scenario con AI
                </>
              )}
            </button>

            {!aiConfig?.apiKey && !showApiConfig && (
              <p className="text-center text-xs text-amber-400/80">
                Configura prima la tua API key per generare lo scenario.
              </p>
            )}

            {/* Error */}
            {genError && (
              <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-300">{genError}</p>
              </div>
            )}

            {/* Results */}
            {generatedSDL && (
              <div ref={resultRef} className="space-y-6 animate-fade-in">
                <div className="border-t border-zinc-800 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {genParseOk ? (
                        <CheckCircle2 size={16} className="text-emerald-400" />
                      ) : (
                        <AlertCircle size={16} className="text-amber-400" />
                      )}
                      <h3 className="text-sm font-bold text-white">
                        {genParseOk ? 'Scenario generato con successo' : 'Scenario generato (con avvisi)'}
                      </h3>
                      <span className="text-[10px] text-zinc-500">
                        {genAttempts} tentativ{genAttempts > 1 ? 'i' : 'o'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopySDL}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] text-zinc-400 hover:text-white bg-zinc-800/60 hover:bg-zinc-800 rounded-lg transition-colors"
                      >
                        <Copy size={12} /> Copia SDL
                      </button>
                      {onOpenInEditor && (
                        <button
                          onClick={() => onOpenInEditor(generatedSDL)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 rounded-lg transition-colors"
                        >
                          <ChevronRight size={12} /> Apri nell'editor
                        </button>
                      )}
                    </div>
                  </div>

                  {/* SDL Preview */}
                  <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800/60">
                      <span className="text-[10px] text-zinc-500 font-mono">scenario.sdl</span>
                      <span className="text-[10px] text-zinc-600">{generatedSDL.split('\n').length} righe</span>
                    </div>
                    <pre className="p-4 text-xs text-zinc-300 font-mono leading-relaxed max-h-80 overflow-auto whitespace-pre-wrap">
                      {generatedSDL}
                    </pre>
                  </div>
                </div>

                {/* Simulation results */}
                {simResult && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Anteprima simulazione (2.000 run Monte Carlo)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {resultCharts.map(({ name, type, color }) => (
                        <MiniFanChart
                          key={name}
                          data={extractFanData(simResult, name, type)}
                          label={name.replace(/_/g, ' ')}
                          color={color}
                          unit={
                            (type === 'variable' ? simResult.variables.get(name)?.unit : simResult.impacts.get(name)?.unit) ?? ''
                          }
                        />
                      ))}
                    </div>

                    {onOpenInEditor && (
                      <div className="text-center pt-4">
                        <button
                          onClick={() => onOpenInEditor(generatedSDL)}
                          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 rounded-xl shadow-lg shadow-violet-500/20 transition-all"
                        >
                          Apri nell'editor per personalizzare
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-zinc-800/60">
          <button
            onClick={() => setStep(s => Math.max(0, s - 1))}
            disabled={step === 0}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              step === 0
                ? 'text-zinc-600 cursor-not-allowed'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <ChevronLeft size={14} />
            Indietro
          </button>

          {step < 4 && (
            <button
              onClick={() => setStep(s => Math.min(4, s + 1))}
              disabled={!canProceed}
              className={`flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                !canProceed
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  : 'bg-violet-600 text-white hover:bg-violet-500'
              }`}
            >
              Avanti
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
