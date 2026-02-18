/**
 * Sidebar — Main navigation panel with scenario categories, editor, and guide.
 */

import { useState, useMemo } from 'react';
import {
  SDL_NATIVE_SCENARIOS, CATEGORY_LABELS, CATEGORY_COLORS,
  type ScenarioCategory,
} from '../scenarios';
import { renderSDL } from '../lib/sdl-renderer';
import { EDITOR_TEMPLATES } from '../editor/templates';
import { GUIDE_SECTIONS, type GuideSectionId } from '../guide/GuideView';
import { SdlIcon } from '../lib/icons';

// ─── Types ───

export type AppMode = 'demo' | 'editor' | 'guide' | 'wizard';

export interface SidebarProps {
  mode: AppMode;
  selectedId: string | null;
  editorTemplateId: string | null;
  guideSectionId: GuideSectionId | null;
  onSelect: (id: string) => void;
  onEditorSelect: (templateId: string) => void;
  onGuideSelect: (sectionId: GuideSectionId) => void;
  onWizardSelect: () => void;
  onHelpOpen: () => void;
  isOpen: boolean;
  onClose: () => void;
}

// ─── Category Icons ───

const CATEGORY_ORDER: ScenarioCategory[] = ['tecnologia', 'economia', 'ambiente', 'societa', 'politica', 'regolamentazione'];

function CategoryIcon({ category, className = '' }: { category: ScenarioCategory; className?: string }) {
  const paths: Record<ScenarioCategory, JSX.Element> = {
    tecnologia: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M3 9h2m14 0h2M3 15h2m14 0h2M7 7h10v10H7z" />,
    economia: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />,
    ambiente: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3c4.97 0 9 4.03 9 9a9 9 0 01-9 9m0-18a9 9 0 00-9 9 9 9 0 009 9m0-18v18m0-9C9 12 6.5 9 6.5 6S9 3 12 3m0 9c3 0 5.5-3 5.5-6S15 3 12 3" />,
    societa: <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></>,
    politica: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
    regolamentazione: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l9-3 9 3v6c0 5.25-3.75 9.75-9 11.25C6.75 21.75 3 17.25 3 12V6zm9 2v4m0 2h.01" />,
  };
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
      {paths[category]}
    </svg>
  );
}

// ─── Sidebar Component ───

interface ScenarioMeta {
  id: string;
  title: string;
  period: string;
  icon: string;
  category: ScenarioCategory;
}

export default function Sidebar({ mode, selectedId, editorTemplateId, guideSectionId, onSelect, onEditorSelect, onGuideSelect, onWizardSelect, onHelpOpen, isOpen, onClose }: SidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<ScenarioCategory>>(new Set());
  const [editorExpanded, setEditorExpanded] = useState(false);
  const [guideExpanded, setGuideExpanded] = useState(false);

  const scenarioMetas = useMemo(() => {
    const metas: ScenarioMeta[] = [];
    for (const s of SDL_NATIVE_SCENARIOS) {
      const rendered = renderSDL(s.source, s.id);
      if (rendered?.meta) {
        metas.push({
          id: s.id,
          title: rendered.meta.title,
          period: rendered.meta.period,
          icon: rendered.meta.icon,
          category: rendered.meta.category,
        });
      }
    }
    return metas;
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<ScenarioCategory, ScenarioMeta[]>();
    for (const s of scenarioMetas) {
      const list = map.get(s.category) ?? [];
      list.push(s);
      map.set(s.category, list);
    }
    return map;
  }, [scenarioMetas]);

  const toggleCategory = (cat: ScenarioCategory) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const handleSelect = (id: string) => { onSelect(id); onClose(); };
  const handleEditorSelect = (templateId: string) => { onEditorSelect(templateId); onClose(); };
  const handleGuideSelect = (sectionId: GuideSectionId) => { onGuideSelect(sectionId); onClose(); };

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
          fixed top-0 left-0 z-50 h-full w-[280px] bg-zinc-950 border-r border-zinc-800
          flex flex-col shrink-0 overflow-hidden
          transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0 md:z-0 md:h-full
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo / Header */}
        <div className="shrink-0 px-5 pt-6 pb-4 border-b border-zinc-800/60">
          <div className="flex items-center gap-3">
            <img src="/segno_logo_white.png" alt="Segno" className="w-9 h-9 object-contain" />
            <div>
              <h1 className="text-sm font-bold text-white leading-tight">Segno</h1>
              <p className="text-[10px] text-zinc-500">SDL Citizen Lab</p>
            </div>
            <button
              onClick={onClose}
              className="ml-auto md:hidden p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
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

          {/* ─── Scenarios Section ─── */}
          <div className="flex items-center gap-2 px-2 mb-3">
            <svg className="w-4 h-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">Scenari</span>
            <span className="ml-auto text-[10px] text-zinc-700 bg-zinc-800/60 px-1.5 py-0.5 rounded-full">{scenarioMetas.length}</span>
          </div>

          {/* Categories */}
          <div className="space-y-1">
            {CATEGORY_ORDER.map(cat => {
              const scenarios = grouped.get(cat);
              if (!scenarios || scenarios.length === 0) return null;
              const isExpanded = expandedCategories.has(cat);
              const color = CATEGORY_COLORS[cat];

              return (
                <div key={cat}>
                  <button
                    onClick={() => toggleCategory(cat)}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left hover:bg-zinc-800/40 transition-colors group"
                  >
                    <svg
                      className={`w-3 h-3 text-zinc-600 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <CategoryIcon category={cat} className="text-zinc-500 group-hover:text-zinc-400 transition-colors" />
                    <span className="text-xs font-semibold text-zinc-400 group-hover:text-zinc-300 transition-colors">
                      {CATEGORY_LABELS[cat]}
                    </span>
                    <span
                      className="ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                      style={{ color, backgroundColor: `${color}15` }}
                    >
                      {scenarios.length}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="ml-4 pl-3 border-l border-zinc-800/60 space-y-0.5 mt-0.5 mb-1 animate-slide-down">
                      {scenarios.map(s => {
                        const isActive = mode === 'demo' && selectedId === s.id;
                        return (
                          <button
                            key={s.id}
                            onClick={() => handleSelect(s.id)}
                            className={`
                              w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all duration-150
                              ${isActive
                                ? 'bg-blue-500/10 border border-blue-500/20 text-blue-300'
                                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40 border border-transparent'
                              }
                            `}
                          >
                            <span className="shrink-0" style={{ color: isActive ? undefined : 'rgb(113,113,122)' }}>
                              <SdlIcon name={s.icon} size={16} />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className={`text-[12px] font-medium leading-tight truncate ${isActive ? 'text-blue-300' : 'text-zinc-300'}`}>
                                {s.title}
                              </p>
                              <p className="text-[10px] text-zinc-600 truncate mt-0.5">{s.period}</p>
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
          <div className="my-5 border-t border-zinc-800/60" />

          {/* ─── EDITOR Section ─── */}
          <div className="flex items-center gap-2 px-2 mb-3">
            <svg className="w-4 h-4 text-emerald-500/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">Editor</span>
            <span className="ml-auto text-[10px] text-emerald-500/60 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">new</span>
          </div>

          <div className="space-y-0.5">
            <button
              onClick={() => setEditorExpanded(!editorExpanded)}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left hover:bg-zinc-800/40 transition-colors group"
            >
              <svg
                className={`w-3 h-3 text-zinc-600 transition-transform duration-200 ${editorExpanded ? 'rotate-90' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <svg className="w-4 h-4 text-emerald-400/60 group-hover:text-emerald-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <span className="text-xs font-semibold text-zinc-400 group-hover:text-zinc-300 transition-colors">
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
                          : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40 border border-transparent'
                        }
                      `}
                    >
                      <span className="shrink-0" style={{ color: isActive ? undefined : 'rgb(113,113,122)' }}>
                        <SdlIcon name={t.icon} size={16} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className={`text-[12px] font-medium leading-tight truncate ${isActive ? 'text-emerald-300' : 'text-zinc-300'}`}>
                          {t.name}
                        </p>
                        <p className="text-[10px] text-zinc-600 truncate mt-0.5">{t.description}</p>
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
          <div className="my-5 border-t border-zinc-800/60" />

          {/* ─── AI WIZARD Section ─── */}
          <div className="flex items-center gap-2 px-2 mb-3">
            <svg className="w-4 h-4 text-violet-500/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">AI Wizard</span>
            <span className="ml-auto text-[10px] text-violet-500/60 bg-violet-500/10 px-1.5 py-0.5 rounded-full">AI</span>
          </div>

          <div className="space-y-0.5 mb-1">
            <button
              onClick={() => { onWizardSelect(); onClose(); }}
              className={`
                w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all duration-150
                ${mode === 'wizard'
                  ? 'bg-violet-500/10 border border-violet-500/20 text-violet-300'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40 border border-transparent'
                }
              `}
            >
              <svg className={`w-4 h-4 ${mode === 'wizard' ? 'text-violet-400' : 'text-zinc-500'} transition-colors`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              <div className="min-w-0 flex-1">
                <p className={`text-[12px] font-medium leading-tight truncate ${mode === 'wizard' ? 'text-violet-300' : 'text-zinc-300'}`}>
                  Genera con AI
                </p>
                <p className="text-[10px] text-zinc-600 truncate mt-0.5">Wizard guidato in 5 step</p>
              </div>
              {mode === 'wizard' && (
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0 animate-pulse" />
              )}
            </button>
          </div>

          {/* ─── Divider ─── */}
          <div className="my-5 border-t border-zinc-800/60" />

          {/* ─── GUIDA Section ─── */}
          <div className="flex items-center gap-2 px-2 mb-3">
            <svg className="w-4 h-4 text-amber-500/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">Guida</span>
          </div>

          <div className="space-y-0.5">
            <button
              onClick={() => setGuideExpanded(!guideExpanded)}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left hover:bg-zinc-800/40 transition-colors group"
            >
              <svg
                className={`w-3 h-3 text-zinc-600 transition-transform duration-200 ${guideExpanded ? 'rotate-90' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <svg className="w-4 h-4 text-amber-400/60 group-hover:text-amber-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-xs font-semibold text-zinc-400 group-hover:text-zinc-300 transition-colors">
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
                          : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40 border border-transparent'
                        }
                      `}
                    >
                      <span className="shrink-0" style={{ color: isActive ? undefined : 'rgb(113,113,122)' }}>
                        <SdlIcon name={s.icon} size={14} />
                      </span>
                      <p className={`text-[12px] font-medium leading-tight truncate ${isActive ? 'text-amber-300' : 'text-zinc-300'}`}>
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
        <div className="shrink-0 px-5 py-4 border-t border-zinc-800/60 flex items-end justify-between">
          <div>
            <p className="text-[10px] text-zinc-600 leading-relaxed">
              Creato da <span className="text-zinc-500">Relatronica</span>
            </p>
            <p className="text-[10px] text-zinc-700 mt-0.5">GPL-3.0 License</p>
          </div>
          <button
            onClick={onHelpOpen}
            className="p-1.5 rounded-lg text-zinc-600 hover:text-blue-400 hover:bg-zinc-800 transition-colors"
            aria-label="Cos'è Segno?"
            title="Cos'è Segno?"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </aside>
    </>
  );
}
