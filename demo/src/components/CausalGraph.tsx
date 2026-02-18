/**
 * CausalGraph — ReactFlow visualization of the SDL scenario causal structure.
 *
 * Parses the generated SDL, validates it to extract the causal graph,
 * then renders nodes (assumptions, parameters, variables, impacts, branches)
 * with directed edges showing causal dependencies.
 */

import { memo, useMemo } from 'react';
import ReactFlow, {
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeProps,
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from '@dagrejs/dagre';
import { parse } from '@sdl/core/parser';
import { validate } from '@sdl/core/validator';
import type {
  ScenarioNode,
  Declaration,
  AssumptionNode,
  VariableNode as VarNode,
  ParameterNode as ParamNode,
  ImpactNode as ImpNode,
  BranchNode as BrNode,
  ExpressionNode,
  DistributionExpression,
  ModelExpression,
  CausalGraph as CausalGraphType,
} from '@sdl/core/types';

// ═══════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════

function humanize(name: string): string {
  return name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\bAi\b/g, 'AI')
    .replace(/\bEu\b/g, 'EU')
    .replace(/\bCo2\b/g, 'CO₂');
}

function exprStr(expr: ExpressionNode | undefined | null): string {
  if (!expr) return '—';
  switch (expr.type) {
    case 'NumberLiteral': return fmtNum(expr.value);
    case 'PercentageLiteral': return `${expr.value}%`;
    case 'CurrencyLiteral': {
      const c = expr as any;
      const mag = c.magnitude ?? '';
      return `${fmtNum(c.value / magMul(mag))}${mag} ${c.currency}`;
    }
    case 'StringLiteral': return (expr as any).value;
    case 'BooleanLiteral': return (expr as any).value ? 'Yes' : 'No';
    default: return '—';
  }
}

function magMul(m: string): number {
  switch (m) { case 'K': return 1e3; case 'M': return 1e6; case 'B': return 1e9; case 'T': return 1e12; default: return 1; }
}

function fmtNum(n: number): string {
  if (Math.abs(n) >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (Number.isInteger(n)) return n.toLocaleString('en-US');
  return n.toFixed(2);
}

function distLabel(d: DistributionExpression | undefined): string {
  if (!d) return '';
  if (d.distribution === 'normal' && d.params.length === 1) return `±${exprStr(d.params[0])}`;
  const names: Record<string, string> = { normal: 'Normal', beta: 'Skewed', uniform: 'Uniform', triangular: 'Triangular', lognormal: 'Log-normal' };
  return names[d.distribution] ?? d.distribution;
}

function modelStr(m: ModelExpression | undefined): string {
  if (!m) return '';
  const names: Record<string, string> = { linear: 'Linear', logistic: 'S-curve', exponential: 'Exponential', sigmoid: 'S-curve' };
  return names[m.model] ?? m.model;
}

// ═══════════════════════════════════════════
// Node Components
// ═══════════════════════════════════════════

function Shell({
  color, icon, typeLabel, name, selected, children, hasInput = false, hasOutput = false,
}: {
  color: string; icon: string; typeLabel: string; name: string;
  selected?: boolean; children: React.ReactNode; hasInput?: boolean; hasOutput?: boolean;
}) {
  return (
    <div
      className={`rounded-xl overflow-hidden transition-all min-w-[200px] max-w-[240px] ${
        selected ? 'ring-2 ring-white/30 shadow-xl scale-[1.03]' : 'shadow-lg'
      }`}
      style={{
        background: 'linear-gradient(145deg, rgba(39,39,42,0.95), rgba(24,24,27,0.95))',
        border: `1px solid ${selected ? color : 'rgba(63,63,70,0.6)'}`,
      }}
    >
      <div className="h-1" style={{ background: color }} />
      <div className="flex items-center gap-1.5 px-2.5 pt-1.5 pb-0.5">
        <span className="text-xs">{icon}</span>
        <span className="text-[9px] font-semibold uppercase tracking-widest opacity-60" style={{ color }}>{typeLabel}</span>
      </div>
      <div className="px-2.5 pb-0.5">
        <p className="text-[11px] font-semibold text-white leading-tight truncate">{name}</p>
      </div>
      <div className="px-2.5 pb-2.5 space-y-0.5">{children}</div>
      {hasInput && <Handle type="target" position={Position.Left} className="!w-2.5 !h-2.5 !rounded-full !border-2 !-left-1" style={{ borderColor: color, background: '#18181b' }} />}
      {hasOutput && <Handle type="source" position={Position.Right} className="!w-2.5 !h-2.5 !rounded-full !border-2 !-right-1" style={{ borderColor: color, background: '#18181b' }} />}
    </div>
  );
}

function Tag({ text, cls = 'bg-zinc-700/60 text-zinc-400' }: { text: string; cls?: string }) {
  return text ? <span className={`inline-block text-[8px] font-medium px-1 py-0.5 rounded ${cls}`}>{text}</span> : null;
}

const AssumptionNode = memo(({ data, selected }: NodeProps) => (
  <Shell color="#3b82f6" icon="💡" typeLabel="Assumption" name={data.label} selected={selected} hasOutput>
    {data.value && data.value !== '—' && (
      <div className="flex items-baseline gap-1.5">
        <span className="text-sm font-bold text-blue-300 font-mono">{data.value}</span>
        {data.uncertainty && <span className="text-[9px] text-blue-400/70">{data.uncertainty}</span>}
      </div>
    )}
    {data.confidence != null && (
      <div className="flex items-center gap-1">
        <div className="flex-1 h-0.5 bg-zinc-700/50 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500/60 rounded-full" style={{ width: `${data.confidence * 100}%` }} />
        </div>
        <span className="text-[8px] text-zinc-500">{(data.confidence * 100).toFixed(0)}%</span>
      </div>
    )}
  </Shell>
));

const ParameterNodeC = memo(({ data, selected }: NodeProps) => (
  <Shell color="#06b6d4" icon="⚙️" typeLabel="Parameter" name={data.label} selected={selected} hasOutput>
    {data.value && data.value !== '—' && <span className="text-sm font-bold text-cyan-300 font-mono">{data.value}</span>}
    {data.description && <p className="text-[9px] text-zinc-500 truncate">{data.description}</p>}
  </Shell>
));

const VariableNodeC = memo(({ data, selected }: NodeProps) => (
  <Shell color={data.color ?? '#10b981'} icon="📈" typeLabel="Variable" name={data.label} selected={selected} hasInput hasOutput>
    {data.description && <p className="text-[9px] text-zinc-500 truncate">{data.description}</p>}
    {data.valueRange && (
      <div className="flex items-baseline gap-1.5">
        <span className="text-[10px] text-emerald-300 font-mono font-bold">{data.valueRange}</span>
        {data.unit && <span className="text-[8px] text-zinc-500">{data.unit}</span>}
      </div>
    )}
    <div className="flex flex-wrap gap-0.5">
      {data.model && <Tag text={data.model} cls="bg-emerald-500/15 text-emerald-300" />}
      {data.uncertainty && <Tag text={data.uncertainty} cls="bg-emerald-500/10 text-emerald-400/60" />}
    </div>
  </Shell>
));

const ImpactNodeC = memo(({ data, selected }: NodeProps) => (
  <Shell color={data.color ?? '#8b5cf6'} icon="🎯" typeLabel="Impact" name={data.label} selected={selected} hasInput>
    {data.description && <p className="text-[9px] text-zinc-500 truncate">{data.description}</p>}
    {data.unit && <Tag text={data.unit} cls="bg-violet-500/15 text-violet-300" />}
  </Shell>
));

const BranchNodeC = memo(({ data, selected }: NodeProps) => (
  <Shell color="#f59e0b" icon="🔀" typeLabel="Branch" name={data.label} selected={selected} hasInput hasOutput>
    {data.probability != null && (
      <div className="flex items-center gap-1.5">
        <div className="flex-1 h-1 bg-zinc-700/60 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-amber-500" style={{ width: `${Math.min(data.probability * 100, 100)}%` }} />
        </div>
        <span className="text-[10px] font-semibold text-amber-300">{(data.probability * 100).toFixed(0)}%</span>
      </div>
    )}
  </Shell>
));

const SimulateNodeC = memo(({ data, selected }: NodeProps) => (
  <Shell color="#71717a" icon="🎲" typeLabel="Simulate" name="Monte Carlo" selected={selected}>
    <Tag text="2,000 runs" />
  </Shell>
));

const nodeTypes = {
  'sdl-assumption': AssumptionNode,
  'sdl-variable': VariableNodeC,
  'sdl-parameter': ParameterNodeC,
  'sdl-impact': ImpactNodeC,
  'sdl-branch': BranchNodeC,
  'sdl-simulate': SimulateNodeC,
};

// ═══════════════════════════════════════════
// AST → ReactFlow Conversion
// ═══════════════════════════════════════════

const NODE_W = 240;
const NODE_H = 90;

function buildNodeData(decl: Declaration): Record<string, unknown> {
  switch (decl.type) {
    case 'Assumption': {
      const a = decl as AssumptionNode;
      return { label: humanize(a.name), value: exprStr(a.value), confidence: a.confidence, uncertainty: distLabel(a.uncertainty), color: '#3b82f6' };
    }
    case 'Variable': {
      const v = decl as VarNode;
      const first = v.timeseries?.[0]; const last = v.timeseries?.[v.timeseries.length - 1];
      const fv = first ? exprStr(first.value as ExpressionNode) : '';
      const lv = last ? exprStr(last.value as ExpressionNode) : '';
      return { label: v.label ?? humanize(v.name), description: v.description, unit: v.unit, model: modelStr(v.model), uncertainty: distLabel(v.uncertainty), valueRange: fv && lv ? `${fv} → ${lv}` : '', color: v.color ?? '#10b981' };
    }
    case 'Parameter': {
      const p = decl as ParamNode;
      return { label: p.label ?? humanize(p.name), value: exprStr(p.value), description: p.description, color: p.color ?? '#06b6d4' };
    }
    case 'Impact': {
      const i = decl as ImpNode;
      return { label: i.label ?? humanize(i.name), description: i.description, unit: i.unit, color: i.color ?? '#8b5cf6' };
    }
    case 'Branch': {
      const b = decl as BrNode;
      return { label: b.name, probability: b.probability, color: '#f59e0b' };
    }
    case 'Simulate':
      return { label: 'Simulation', color: '#71717a' };
    default:
      return { label: (decl as any).name ?? decl.type, color: '#71717a' };
  }
}

function astToFlow(scenario: ScenarioNode, causalGraph?: CausalGraphType): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const seen = new Set<string>();

  for (const decl of scenario.declarations) {
    const name = decl.type === 'Branch' ? (decl as BrNode).name
      : decl.type === 'Simulate' ? '__simulate__'
      : (decl as any).name;
    if (!name || seen.has(name)) continue;
    seen.add(name);
    nodes.push({ id: name, type: `sdl-${decl.type.toLowerCase()}`, data: buildNodeData(decl), position: { x: 0, y: 0 } });
  }

  if (causalGraph) {
    for (const edge of causalGraph.edges) {
      if (nodes.some(n => n.id === edge.from) && nodes.some(n => n.id === edge.to)) {
        edges.push({
          id: `e-${edge.from}-${edge.to}`, source: edge.from, target: edge.to,
          animated: true, style: { stroke: 'rgba(113,113,122,0.5)', strokeWidth: 1.5 }, type: 'smoothstep',
        });
      }
    }
  }

  // Layout with dagre
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'LR', ranksep: 120, nodesep: 50, marginx: 60, marginy: 60 });
  for (const n of nodes) g.setNode(n.id, { width: NODE_W, height: NODE_H });
  for (const e of edges) g.setEdge(e.source, e.target);
  dagre.layout(g);
  for (const n of nodes) { const p = g.node(n.id); if (p) n.position = { x: p.x - NODE_W / 2, y: p.y - NODE_H / 2 }; }

  return { nodes, edges };
}

// ═══════════════════════════════════════════
// Public Component
// ═══════════════════════════════════════════

interface CausalGraphProps {
  sdlSource: string;
}

export default function CausalGraph({ sdlSource }: CausalGraphProps) {
  const flow = useMemo(() => {
    try {
      const { ast } = parse(sdlSource);
      if (!ast) return null;
      const validation = validate(ast);
      return astToFlow(ast, validation.causalGraph ?? undefined);
    } catch {
      return null;
    }
  }, [sdlSource]);

  const [nodes, , onNodesChange] = useNodesState(flow?.nodes ?? []);
  const [edges, , onEdgesChange] = useEdgesState(flow?.edges ?? []);

  if (!flow || nodes.length === 0) {
    return (
      <div className="h-[500px] flex items-center justify-center text-zinc-500 text-sm">
        Impossibile generare il grafo causale
      </div>
    );
  }

  return (
    <div className="h-[500px] rounded-xl overflow-hidden border border-zinc-800">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3, minZoom: 0.4, maxZoom: 1.2 }}
        minZoom={0.2}
        maxZoom={2}
        defaultEdgeOptions={{ type: 'smoothstep', animated: true, style: { stroke: 'rgb(82,82,91)', strokeWidth: 2 } }}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="rgb(39,39,42)" />
        <Controls showInteractive={false} position="bottom-left" />
        <MiniMap
          nodeStrokeWidth={3}
          nodeColor={(n) => n.data?.color ?? '#71717a'}
          maskColor="rgba(24,24,27,0.8)"
          position="bottom-right"
          style={{ width: 130, height: 85 }}
        />
      </ReactFlow>
    </div>
  );
}
