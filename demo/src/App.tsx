/**
 * App — Root layout with sidebar navigation and view routing.
 */

import { useState, useCallback, useRef } from 'react';
import { SDL_NATIVE_SCENARIOS } from './scenarios';
import Sidebar, { type AppMode } from './components/Sidebar';
import SdlScenarioView from './components/SdlScenarioView';
import WelcomePage from './components/WelcomePage';
import EditorView from './editor/EditorView';
import GuideView, { type GuideSectionId } from './guide/GuideView';
import WizardView from './ai/WizardView';

export default function App() {
  const [mode, setMode] = useState<AppMode>('demo');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editorTemplateId, setEditorTemplateId] = useState<string | null>(null);
  const [guideSectionId, setGuideSectionId] = useState<GuideSectionId | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  const selectedScenario = selectedId
    ? SDL_NATIVE_SCENARIOS.find(s => s.id === selectedId) ?? null
    : null;

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

  const handleWizardSelect = useCallback(() => {
    setMode('wizard');
    setSelectedId(null);
    setEditorTemplateId(null);
    setGuideSectionId(null);
    setSidebarOpen(false);
    mainRef.current?.scrollTo(0, 0);
  }, []);

  const handleWizardOpenInEditor = useCallback((sdlSource: string) => {
    setMode('editor');
    setEditorTemplateId('__ai_generated__');
    setSelectedId(null);
    setGuideSectionId(null);
    mainRef.current?.scrollTo(0, 0);
    aiGeneratedRef.current = sdlSource;
  }, []);

  const aiGeneratedRef = useRef<string | null>(null);

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <Sidebar
        mode={mode}
        selectedId={selectedId}
        editorTemplateId={editorTemplateId}
        guideSectionId={guideSectionId}
        onSelect={handleSelect}
        onEditorSelect={handleEditorSelect}
        onGuideSelect={handleGuideSelect}
        onWizardSelect={handleWizardSelect}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div ref={mainRef} className="flex-1 min-w-0 overflow-y-auto">
        {/* Mobile topbar */}
        <div className="sticky top-0 z-30 md:hidden bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/60 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
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
          {mode === 'editor' && (
            <span className="ml-auto text-[11px] text-emerald-400 truncate max-w-[40%]">Editor</span>
          )}
          {mode === 'wizard' && (
            <span className="ml-auto text-[11px] text-violet-400 truncate max-w-[40%]">AI Wizard</span>
          )}
          {mode === 'guide' && (
            <span className="ml-auto text-[11px] text-amber-400 truncate max-w-[40%]">Guida SDL</span>
          )}
        </div>

        {/* Page content */}
        {mode === 'wizard' ? (
          <WizardView onOpenInEditor={handleWizardOpenInEditor} />
        ) : mode === 'guide' && guideSectionId ? (
          <GuideView key={guideSectionId} initialSection={guideSectionId} />
        ) : mode === 'editor' && editorTemplateId ? (
          <EditorView
            key={editorTemplateId}
            initialTemplate={editorTemplateId}
            aiGeneratedSource={editorTemplateId === '__ai_generated__' ? aiGeneratedRef.current ?? undefined : undefined}
          />
        ) : mode === 'demo' && selectedScenario ? (
          <SdlScenarioView key={selectedScenario.id} sdlSource={selectedScenario.source} sdlId={selectedScenario.id} />
        ) : (
          <WelcomePage onSelect={handleSelect} />
        )}
      </div>
    </div>
  );
}
