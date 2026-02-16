import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';

// ─── Shared Shell ───

function NodeShell({
  color,
  icon,
  typeLabel,
  name,
  selected,
  children,
  hasInput = false,
  hasOutput = false,
}: {
  color: string;
  icon: string;
  typeLabel: string;
  name: string;
  selected?: boolean;
  children: React.ReactNode;
  hasInput?: boolean;
  hasOutput?: boolean;
}) {
  return (
    <div
      className={`
        rounded-xl overflow-hidden transition-all duration-200 min-w-[220px] max-w-[260px]
        ${selected
          ? 'ring-2 ring-white/30 shadow-xl scale-[1.03]'
          : 'shadow-lg hover:shadow-xl hover:scale-[1.01]'}
      `}
      style={{
        background: 'linear-gradient(145deg, rgba(30,41,59,0.95), rgba(15,23,42,0.95))',
        border: `1px solid ${selected ? color : 'rgba(51,65,85,0.6)'}`,
      }}
    >
      {/* Colored top bar */}
      <div className="h-1" style={{ background: color }} />

      {/* Header */}
      <div className="flex items-center gap-2 px-3 pt-2 pb-1">
        <span className="text-sm">{icon}</span>
        <span className="text-[10px] font-semibold uppercase tracking-widest opacity-60" style={{ color }}>
          {typeLabel}
        </span>
      </div>

      {/* Name */}
      <div className="px-3 pb-1">
        <p className="text-[13px] font-semibold text-white leading-tight truncate" title={name}>
          {name}
        </p>
      </div>

      {/* Body */}
      <div className="px-3 pb-3 space-y-1">
        {children}
      </div>

      {/* Handles */}
      {hasInput && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-3 !h-3 !rounded-full !border-2 !-left-1.5"
          style={{ borderColor: color, background: '#0f172a' }}
        />
      )}
      {hasOutput && (
        <Handle
          type="source"
          position={Position.Right}
          className="!w-3 !h-3 !rounded-full !border-2 !-right-1.5"
          style={{ borderColor: color, background: '#0f172a' }}
        />
      )}
    </div>
  );
}

function Tag({ text, color = 'bg-slate-700/60 text-slate-400' }: { text: string; color?: string }) {
  if (!text) return null;
  return (
    <span className={`inline-block text-[9px] font-medium px-1.5 py-0.5 rounded-md ${color}`}>
      {text}
    </span>
  );
}

function Info({ text }: { text: string }) {
  if (!text) return null;
  return <p className="text-[10px] text-slate-500 leading-snug truncate">{text}</p>;
}

// ─── Assumption ───

export const AssumptionNode = memo(({ data, selected }: NodeProps) => (
  <NodeShell
    color="#3b82f6"
    icon="💡"
    typeLabel="Assumption"
    name={data.label}
    selected={selected}
    hasOutput
  >
    {data.value && data.value !== '—' && (
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-bold text-blue-300 font-mono">{data.value}</span>
        {data.uncertainty && (
          <span className="text-[10px] text-blue-400/70">{data.uncertainty}</span>
        )}
      </div>
    )}
    {data.confidence != null && (
      <div className="flex items-center gap-1.5">
        <div className="flex-1 h-1 bg-slate-700/50 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500/60 rounded-full" style={{ width: `${data.confidence * 100}%` }} />
        </div>
        <span className="text-[9px] text-slate-500">{(data.confidence * 100).toFixed(0)}%</span>
      </div>
    )}
  </NodeShell>
));
AssumptionNode.displayName = 'AssumptionNode';

// ─── Parameter ───

export const ParameterNode = memo(({ data, selected }: NodeProps) => (
  <NodeShell
    color="#06b6d4"
    icon="⚙️"
    typeLabel="Adjustable"
    name={data.label}
    selected={selected}
    hasOutput
  >
    {data.value && data.value !== '—' && (
      <span className="text-lg font-bold text-cyan-300 font-mono">{data.value}</span>
    )}
    {data.description && <Info text={data.description} />}
  </NodeShell>
));
ParameterNode.displayName = 'ParameterNode';

// ─── Variable ───

export const VariableNode = memo(({ data, selected }: NodeProps) => (
  <NodeShell
    color="#10b981"
    icon="📈"
    typeLabel="Variable"
    name={data.label}
    selected={selected}
    hasInput
    hasOutput
  >
    {data.description && <Info text={data.description} />}
    {data.valueRange && (
      <div className="flex items-baseline gap-2">
        <span className="text-xs text-emerald-300 font-mono font-bold">{data.valueRange}</span>
        {data.unit && <span className="text-[9px] text-slate-500">{data.unit}</span>}
      </div>
    )}
    <div className="flex flex-wrap gap-1 mt-0.5">
      {data.model && <Tag text={data.model} color="bg-emerald-500/15 text-emerald-300" />}
      {data.uncertainty && <Tag text={data.uncertainty} color="bg-emerald-500/10 text-emerald-400/60" />}
    </div>
  </NodeShell>
));
VariableNode.displayName = 'VariableNode';

// ─── Impact ───

export const ImpactNode = memo(({ data, selected }: NodeProps) => (
  <NodeShell
    color="#8b5cf6"
    icon="🎯"
    typeLabel="Impact"
    name={data.label}
    selected={selected}
    hasInput
  >
    {data.description && <Info text={data.description} />}
    <div className="flex flex-wrap gap-1">
      {data.unit && <Tag text={data.unit} color="bg-violet-500/15 text-violet-300" />}
    </div>
  </NodeShell>
));
ImpactNode.displayName = 'ImpactNode';

// ─── Branch ───

export const BranchNode = memo(({ data, selected }: NodeProps) => (
  <NodeShell
    color="#f59e0b"
    icon="🔀"
    typeLabel="Branch"
    name={data.label}
    selected={selected}
    hasInput
    hasOutput
  >
    {data.probability != null && (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-slate-700/60 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-amber-500"
            style={{ width: `${Math.min(data.probability * 100, 100)}%` }}
          />
        </div>
        <span className="text-xs font-semibold text-amber-300">{(data.probability * 100).toFixed(0)}%</span>
      </div>
    )}
    {data.overrideCount > 0 && (
      <Info text={`Modifies ${data.overrideCount} variable${data.overrideCount > 1 ? 's' : ''}`} />
    )}
  </NodeShell>
));
BranchNode.displayName = 'BranchNode';

// ─── Simulate ───

export const SimulateNode = memo(({ data, selected }: NodeProps) => (
  <NodeShell
    color="#64748b"
    icon="🎲"
    typeLabel="Simulate"
    name="Monte Carlo Engine"
    selected={selected}
  >
    <Tag text="2,000 runs" />
  </NodeShell>
));
SimulateNode.displayName = 'SimulateNode';

// ─── Registry ───

export const nodeTypes = {
  'sdl-assumption': AssumptionNode,
  'sdl-variable': VariableNode,
  'sdl-parameter': ParameterNode,
  'sdl-impact': ImpactNode,
  'sdl-branch': BranchNode,
  'sdl-simulate': SimulateNode,
};
