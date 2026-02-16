import type { Node } from 'reactflow';

interface NodeEditorProps {
  node: Node | null;
  onClose: () => void;
}

const TYPE_STYLES: Record<string, { color: string; bg: string; icon: string }> = {
  Assumption: { color: 'text-blue-400', bg: 'bg-blue-500/10', icon: '💡' },
  Variable: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: '📈' },
  Parameter: { color: 'text-cyan-400', bg: 'bg-cyan-500/10', icon: '⚙️' },
  Impact: { color: 'text-violet-400', bg: 'bg-violet-500/10', icon: '🎯' },
  Branch: { color: 'text-amber-400', bg: 'bg-amber-500/10', icon: '🔀' },
};

export default function NodeEditor({ node, onClose }: NodeEditorProps) {
  if (!node) return null;

  const data = node.data;
  const nodeType = data.nodeType as string;
  const style = TYPE_STYLES[nodeType] ?? { color: 'text-slate-400', bg: 'bg-slate-800', icon: '📄' };

  return (
    <div className="bg-slate-900/95 backdrop-blur-md border-l border-slate-700/40 w-80 h-full flex flex-col shrink-0">
      {/* Header */}
      <div className={`px-5 py-4 border-b border-slate-700/40 ${style.bg}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">{style.icon}</span>
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-widest ${style.color}`}>{nodeType}</p>
              <p className="text-base font-bold text-white mt-0.5">{data.label}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors p-1.5 hover:bg-slate-700/50 rounded-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {data.description && (
          <Field label="Description">
            <p className="text-sm text-slate-300 leading-relaxed">{data.description}</p>
          </Field>
        )}

        {data.value && data.value !== '—' && (
          <Field label="Value">
            <p className="text-2xl font-bold text-white font-mono">{data.value}</p>
          </Field>
        )}

        {data.valueRange && (
          <Field label="Projected Range">
            <p className="text-lg font-bold text-emerald-300 font-mono">{data.valueRange}</p>
            {data.timeRange && (
              <p className="text-xs text-slate-500 mt-1">{data.timeRange}</p>
            )}
          </Field>
        )}

        {data.unit && (
          <Field label="Unit">
            <span className="text-sm text-slate-200">{data.unit}</span>
          </Field>
        )}

        {data.source && (
          <Field label="Data Source">
            <p className="text-xs text-slate-400 leading-relaxed italic">{data.source}</p>
          </Field>
        )}

        {data.confidence != null && (
          <Field label="Confidence Level">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2.5 bg-slate-700/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${data.confidence * 100}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-white">{(data.confidence * 100).toFixed(0)}%</span>
            </div>
          </Field>
        )}

        {data.uncertainty && (
          <Field label="Uncertainty Model">
            <code className="text-xs text-slate-300 bg-slate-800/60 px-2.5 py-1.5 rounded-lg block font-mono">
              {data.uncertainty}
            </code>
          </Field>
        )}

        {data.model && (
          <Field label="Growth Model">
            <code className="text-xs text-emerald-300 bg-emerald-500/10 px-2.5 py-1.5 rounded-lg block font-mono">
              {data.model}
            </code>
          </Field>
        )}

        {data.probability != null && (
          <Field label="Trigger Probability">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2.5 bg-slate-700/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${data.probability * 100}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-amber-300">{(data.probability * 100).toFixed(0)}%</span>
            </div>
          </Field>
        )}

        {data.dependsOn && data.dependsOn.length > 0 && (
          <Field label="Depends On">
            <div className="flex flex-wrap gap-1.5">
              {data.dependsOn.map((dep: string) => (
                <span key={dep} className="text-[11px] bg-slate-700/50 text-slate-300 px-2 py-1 rounded-lg">
                  {dep}
                </span>
              ))}
            </div>
          </Field>
        )}

        {data.derivesFrom && data.derivesFrom.length > 0 && (
          <Field label="Computed From">
            <div className="flex flex-wrap gap-1.5">
              {data.derivesFrom.map((dep: string) => (
                <span key={dep} className="text-[11px] bg-slate-700/50 text-slate-300 px-2 py-1 rounded-lg">
                  {dep}
                </span>
              ))}
            </div>
          </Field>
        )}

        {data.overrideCount > 0 && (
          <Field label="Scenario Changes">
            <p className="text-sm text-slate-300">
              Modifies <strong className="text-amber-300">{data.overrideCount}</strong> variable{data.overrideCount > 1 ? 's' : ''} if triggered
            </p>
          </Field>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-1.5">{label}</p>
      {children}
    </div>
  );
}
