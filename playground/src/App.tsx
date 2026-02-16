import { useState, useCallback, useMemo } from 'react';
import type { Node } from 'reactflow';
import FlowCanvas from './components/FlowCanvas';
import ResultsPanel from './components/ResultsPanel';
import NodeEditor from './components/NodeEditor';
import {
  parseSDL,
  runSimulation,
  astToFlow,
  type ScenarioNode,
  type SimulationResult,
  type Diagnostic,
} from './lib/sdl-bridge';
import { EXAMPLES, type SDLExample } from './lib/examples';

export default function App() {
  // State
  const [currentExample, setCurrentExample] = useState<SDLExample>(EXAMPLES[0]);
  const [ast, setAst] = useState<ScenarioNode | null>(null);
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [flowNodes, setFlowNodes] = useState<Node[]>([]);
  const [flowEdges, setFlowEdges] = useState<any[]>([]);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [showExampleMenu, setShowExampleMenu] = useState(false);

  // Selected node object
  const selectedNode = useMemo(
    () => flowNodes.find((n) => n.id === selectedNodeId) ?? null,
    [flowNodes, selectedNodeId],
  );

  // Load example
  const loadExample = useCallback((example: SDLExample) => {
    setCurrentExample(example);
    setSimulationResult(null);
    setShowResults(false);
    setSelectedNodeId(null);
    setShowExampleMenu(false);

    const result = parseSDL(example.source);

    if ('error' in result) {
      setDiagnostics(result.diagnostics);
      setAst(null);
      setFlowNodes([]);
      setFlowEdges([]);
      return;
    }

    setAst(result.ast);
    setDiagnostics(result.diagnostics);

    const flow = astToFlow(result.ast, result.validation.causalGraph ?? undefined);
    setFlowNodes(flow.nodes);
    setFlowEdges(flow.edges);
  }, []);

  // Initial load
  const [initialized, setInitialized] = useState(false);
  if (!initialized) {
    loadExample(EXAMPLES[0]);
    setInitialized(true);
  }

  // Run simulation
  const handleRun = useCallback(() => {
    if (!ast) return;
    setIsSimulating(true);
    setShowResults(true);

    // Use setTimeout to let the UI update before heavy computation
    setTimeout(() => {
      try {
        const result = runSimulation(ast);
        setSimulationResult(result);
      } catch (err) {
        console.error('Simulation failed:', err);
      } finally {
        setIsSimulating(false);
      }
    }, 50);
  }, [ast]);

  // Diagnostics that are errors
  const errorCount = diagnostics.filter((d) => d.severity === 'error').length;

  return (
    <div className="h-full flex flex-col bg-slate-950">
      {/* ─── Header / Toolbar ─── */}
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm shrink-0 z-20">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src="/segno_logo_white.png" alt="Segno" className="w-7 h-7 object-contain" />
            <div>
              <h1 className="text-sm font-bold text-white leading-none">Segno Playground</h1>
              <p className="text-[10px] text-slate-500 leading-none mt-0.5">SDL Citizen Lab</p>
            </div>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-slate-700" />

          {/* Example selector */}
          <div className="relative">
            <button
              onClick={() => setShowExampleMenu(!showExampleMenu)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <span className="text-slate-400">Example:</span>
              <span className="text-white font-medium">{currentExample.name}</span>
              <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showExampleMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowExampleMenu(false)} />
                <div className="absolute top-full left-0 mt-1 w-72 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-40 overflow-hidden">
                  {EXAMPLES.map((ex) => (
                    <button
                      key={ex.name}
                      onClick={() => loadExample(ex)}
                      className={`
                        w-full text-left px-4 py-3 hover:bg-slate-700/50 transition-colors border-b border-slate-700/30 last:border-b-0
                        ${currentExample.name === ex.name ? 'bg-slate-700/30' : ''}
                      `}
                    >
                      <p className="text-sm font-medium text-white">{ex.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{ex.description}</p>
                      <div className="flex gap-1 mt-1.5">
                        {ex.tags.map((tag) => (
                          <span key={tag} className="text-[9px] bg-slate-600/50 text-slate-400 px-1.5 py-0.5 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status */}
          {ast && (
            <div className="flex items-center gap-2 mr-2">
              <span className="flex items-center gap-1 text-[10px]">
                {errorCount > 0 ? (
                  <span className="text-red-400">{errorCount} errors</span>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Ready
                  </span>
                )}
              </span>
            </div>
          )}

          {/* Toggle results */}
          {simulationResult && (
            <button
              onClick={() => setShowResults(!showResults)}
              className={`
                px-3 py-1.5 text-xs rounded-lg border transition-colors
                ${showResults
                  ? 'bg-slate-700 border-slate-600 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}
              `}
            >
              {showResults ? 'Hide' : 'Show'} Results
            </button>
          )}

          {/* Run button */}
          <button
            onClick={handleRun}
            disabled={!ast || isSimulating}
            className={`
              flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all
              ${!ast || isSimulating
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:from-blue-500 hover:to-violet-500 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30'}
            `}
          >
            {isSimulating ? (
              <>
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Running...
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Run Simulation
              </>
            )}
          </button>
        </div>
      </header>

      {/* ─── Main content ─── */}
      <div className="flex-1 flex min-h-0">
        {/* Canvas */}
        <div className="flex-1 min-w-0">
          {flowNodes.length > 0 ? (
            <FlowCanvas
              key={currentExample.name}
              initialNodes={flowNodes}
              initialEdges={flowEdges}
              onNodeSelect={setSelectedNodeId}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-lg text-slate-500">No scenario loaded</p>
                {diagnostics.length > 0 && (
                  <div className="mt-4 max-w-md mx-auto text-left">
                    {diagnostics.slice(0, 5).map((d, i) => (
                      <p key={i} className={`text-xs font-mono ${d.severity === 'error' ? 'text-red-400' : 'text-amber-400'}`}>
                        {d.severity}: {d.message}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Results panel */}
        {showResults && (
          <div className="w-[420px] border-l border-slate-800 bg-slate-900/60 shrink-0">
            <ResultsPanel result={simulationResult} isSimulating={isSimulating} />
          </div>
        )}

        {/* Node editor */}
        {selectedNode && !showResults && (
          <NodeEditor node={selectedNode} onClose={() => setSelectedNodeId(null)} />
        )}
      </div>

      {/* ─── Footer ─── */}
      <footer className="flex items-center justify-between px-4 py-1.5 border-t border-slate-800 bg-slate-900/50 text-[10px] text-slate-600 shrink-0">
        <span>Segno v0.1.0 — SDL Citizen Lab</span>
        <span>by Relatronica</span>
      </footer>
    </div>
  );
}
