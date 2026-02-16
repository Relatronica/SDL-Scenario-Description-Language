import { parse } from '@sdl/core/index';
import { validate } from '@sdl/core/validator';
import { simulate } from '@sdl/engine/monte-carlo';
import type {
  ScenarioNode,
  ValidationResult,
  SimulationResult,
  CausalGraph,
  Diagnostic,
  Declaration,
  AssumptionNode,
  VariableNode,
  ParameterNode,
  ImpactNode,
  BranchNode,
  ExpressionNode,
  DistributionExpression,
  ModelExpression,
} from '@sdl/core/types';
import type { Node, Edge } from 'reactflow';
import dagre from '@dagrejs/dagre';

export type {
  ScenarioNode,
  ValidationResult,
  SimulationResult,
  CausalGraph,
  Diagnostic,
};

export interface ParsedScenario {
  ast: ScenarioNode;
  diagnostics: Diagnostic[];
  validation: ValidationResult;
}

export interface FlowData {
  nodes: Node[];
  edges: Edge[];
}

// ─── Humanize helpers ───

export function humanizeName(name: string): string {
  return name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\bAi\b/g, 'AI')
    .replace(/\bEu\b/g, 'EU')
    .replace(/\bUs\b/g, 'US')
    .replace(/\bCo2\b/g, 'CO2')
    .replace(/\bAgi\b/g, 'AGI');
}

function exprToString(expr: ExpressionNode | undefined | null): string {
  if (!expr) return '—';
  switch (expr.type) {
    case 'NumberLiteral':
      return formatNumber((expr as any).value);
    case 'PercentageLiteral':
      return `${(expr as any).value}%`;
    case 'CurrencyLiteral': {
      const c = expr as any;
      const mag = c.magnitude ?? '';
      return `${formatNumber(c.value / magnitudeMultiplier(mag))}${mag} ${c.currency}`;
    }
    case 'StringLiteral':
      return (expr as any).value;
    case 'BooleanLiteral':
      return (expr as any).value ? 'Yes' : 'No';
    default:
      return '—';
  }
}

function magnitudeMultiplier(mag: string): number {
  switch (mag) {
    case 'K': return 1_000;
    case 'M': return 1_000_000;
    case 'B': return 1_000_000_000;
    case 'T': return 1_000_000_000_000;
    default: return 1;
  }
}

function formatNumber(n: number): string {
  if (Math.abs(n) >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Number.isInteger(n)) return n.toLocaleString('en-US');
  return n.toFixed(2);
}

function distributionLabel(dist: DistributionExpression | undefined): string {
  if (!dist) return '';
  const type = dist.distribution;

  // Try to extract a simple ± percentage for normal distributions
  if (type === 'normal' && dist.params.length === 1) {
    const param = exprToString(dist.params[0]);
    return `±${param}`;
  }

  // For other distributions, give a friendly name
  const friendlyNames: Record<string, string> = {
    normal: 'Normal',
    beta: 'Skewed',
    uniform: 'Uniform',
    triangular: 'Triangular',
    lognormal: 'Log-normal',
    custom: 'Custom',
  };

  return friendlyNames[type] ?? type;
}

function modelLabel(model: ModelExpression | undefined): string {
  if (!model) return '';
  const friendlyModels: Record<string, string> = {
    linear: 'Linear growth',
    logistic: 'S-curve growth',
    exponential: 'Exponential growth',
    sigmoid: 'S-curve',
    polynomial: 'Polynomial',
    custom: 'Custom model',
  };
  return friendlyModels[model.model] ?? model.model;
}

// ─── Parse & Validate ───

export function parseSDL(source: string): ParsedScenario | { error: string; diagnostics: Diagnostic[] } {
  const { ast, diagnostics: parseDiag } = parse(source);
  if (!ast) {
    return { error: 'Parse failed', diagnostics: parseDiag };
  }
  const validation = validate(ast);
  return {
    ast,
    diagnostics: [...parseDiag, ...validation.diagnostics],
    validation,
  };
}

// ─── Simulate ───

export function runSimulation(
  ast: ScenarioNode,
  onProgress?: (completed: number, total: number) => void,
): SimulationResult {
  return simulate(ast, {
    runs: 2000,
    seed: 42,
    onProgress: onProgress
      ? (p) => onProgress(p.completedRuns, p.totalRuns)
      : undefined,
  });
}

// ─── AST to ReactFlow ───

const NODE_COLORS: Record<string, string> = {
  Assumption: '#3b82f6',
  Variable: '#10b981',
  Parameter: '#06b6d4',
  Impact: '#8b5cf6',
  Branch: '#f59e0b',
  Simulate: '#64748b',
};

const NODE_WIDTH = 260;
const NODE_HEIGHT = 100;

function buildNodeData(decl: Declaration): Record<string, unknown> {
  const type = decl.type;

  switch (type) {
    case 'Assumption': {
      const a = decl as AssumptionNode;
      return {
        nodeType: type,
        label: humanizeName(a.name),
        rawName: a.name,
        value: exprToString(a.value),
        source: a.source,
        confidence: a.confidence,
        uncertainty: distributionLabel(a.uncertainty),
        color: NODE_COLORS.Assumption,
      };
    }
    case 'Variable': {
      const v = decl as VariableNode;
      const firstTs = v.timeseries?.[0];
      const lastTs = v.timeseries?.[v.timeseries.length - 1];
      const firstYear = firstTs?.date?.year;
      const lastYear = lastTs?.date?.year;
      const firstVal = firstTs ? exprToString(firstTs.value as ExpressionNode) : '';
      const lastVal = lastTs ? exprToString(lastTs.value as ExpressionNode) : '';
      return {
        nodeType: type,
        label: humanizeName(v.name),
        rawName: v.name,
        description: v.description,
        unit: v.unit,
        model: modelLabel(v.model),
        uncertainty: distributionLabel(v.uncertainty),
        dependsOn: v.dependsOn?.map(humanizeName),
        timeRange: firstYear && lastYear ? `${firstYear} → ${lastYear}` : '',
        valueRange: firstVal && lastVal ? `${firstVal} → ${lastVal}` : '',
        color: NODE_COLORS.Variable,
      };
    }
    case 'Parameter': {
      const p = decl as ParameterNode;
      return {
        nodeType: type,
        label: humanizeName(p.name),
        rawName: p.name,
        value: exprToString(p.value),
        description: p.description,
        color: NODE_COLORS.Parameter,
      };
    }
    case 'Impact': {
      const i = decl as ImpactNode;
      return {
        nodeType: type,
        label: humanizeName(i.name),
        rawName: i.name,
        description: i.description,
        unit: i.unit,
        derivesFrom: i.derivesFrom?.map(humanizeName),
        color: NODE_COLORS.Impact,
      };
    }
    case 'Branch': {
      const b = decl as BranchNode;
      return {
        nodeType: type,
        label: b.name,
        rawName: b.name,
        probability: b.probability,
        overrideCount: b.declarations?.length ?? 0,
        color: NODE_COLORS.Branch,
      };
    }
    case 'Simulate': {
      return {
        nodeType: type,
        label: 'Simulation',
        rawName: '__simulate__',
        color: NODE_COLORS.Simulate,
      };
    }
    default:
      return {
        nodeType: type,
        label: (decl as any).name ?? type,
        rawName: (decl as any).name ?? type,
        color: '#64748b',
      };
  }
}

export function astToFlow(scenario: ScenarioNode, causalGraph?: CausalGraph): FlowData {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const seen = new Set<string>();

  for (const decl of scenario.declarations) {
    const rawName =
      decl.type === 'Branch'
        ? (decl as BranchNode).name
        : decl.type === 'Simulate'
          ? '__simulate__'
          : (decl as any).name;

    if (!rawName || seen.has(rawName)) continue;
    seen.add(rawName);

    nodes.push({
      id: rawName,
      type: `sdl-${decl.type.toLowerCase()}`,
      data: buildNodeData(decl),
      position: { x: 0, y: 0 },
    });
  }

  if (causalGraph) {
    for (const edge of causalGraph.edges) {
      const sourceOk = nodes.some((n) => n.id === edge.from);
      const targetOk = nodes.some((n) => n.id === edge.to);
      if (sourceOk && targetOk) {
        edges.push({
          id: `e-${edge.from}-${edge.to}`,
          source: edge.from,
          target: edge.to,
          animated: true,
          style: { stroke: 'rgba(100, 116, 139, 0.5)', strokeWidth: 1.5 },
          type: 'smoothstep',
        });
      }
    }
  }

  applyLayout(nodes, edges);
  return { nodes, edges };
}

function applyLayout(nodes: Node[], edges: Edge[]) {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'LR', ranksep: 150, nodesep: 60, marginx: 80, marginy: 80 });

  for (const node of nodes) {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }
  for (const edge of edges) {
    g.setEdge(edge.source, edge.target);
  }
  dagre.layout(g);

  for (const node of nodes) {
    const n = g.node(node.id);
    if (n) {
      node.position = { x: n.x - NODE_WIDTH / 2, y: n.y - NODE_HEIGHT / 2 };
    }
  }
}

// ─── Result helpers ───

export interface FanChartData {
  year: number;
  p5: number;
  p25: number;
  p50: number;
  p75: number;
  p95: number;
}

export function extractFanChartData(result: SimulationResult, variableName: string): FanChartData[] {
  const varResult = result.variables.get(variableName);
  if (!varResult) return [];
  return varResult.timeseries.map((ts) => {
    const pcts = ts.distribution.percentiles;
    return {
      year: ts.date.getFullYear(),
      p5: pcts.get(5) ?? ts.distribution.mean - 2 * ts.distribution.std,
      p25: pcts.get(25) ?? ts.distribution.mean - 0.674 * ts.distribution.std,
      p50: pcts.get(50) ?? ts.distribution.mean,
      p75: pcts.get(75) ?? ts.distribution.mean + 0.674 * ts.distribution.std,
      p95: pcts.get(95) ?? ts.distribution.mean + 2 * ts.distribution.std,
    };
  });
}

export function getVariableNames(result: SimulationResult): string[] {
  return Array.from(result.variables.keys());
}

export function getImpactNames(result: SimulationResult): string[] {
  return Array.from(result.impacts.keys());
}
