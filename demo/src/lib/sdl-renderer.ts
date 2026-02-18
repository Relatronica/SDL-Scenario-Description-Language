/**
 * SDL Renderer — Extract UI definitions from a parsed SDL AST.
 *
 * This module bridges the gap between raw SDL source and the interactive UI.
 * Given an SDL string, it parses the AST and extracts:
 *   - Scenario metadata (title, category, icon, color, etc.)
 *   - Slider definitions from `parameter` declarations with `control: slider`
 *   - Variable/Impact display definitions (label, icon, color, unit)
 *   - A function to re-simulate with modified parameter values
 */

import { parse } from '@sdl/core/parser';
import { simulate } from '@sdl/engine/monte-carlo';
import type {
  ScenarioNode,
  ParameterNode,
  VariableNode,
  ImpactNode,
  ExpressionNode,
  CurrencyLiteral,
  Magnitude,
  SimulationResult,
} from '@sdl/core/types';
import type { ScenarioMeta, SliderDef, VariableDisplay, ScenarioCategory } from '../scenarios/types';

// ─── Magnitude handling ───

const MAGNITUDE_MULTIPLIERS: Record<Magnitude, number> = { K: 1e3, M: 1e6, B: 1e9, T: 1e12 };

function exprToNumber(expr: ExpressionNode | undefined | null): number {
  if (!expr) return 0;
  switch (expr.type) {
    case 'NumberLiteral': return expr.value;
    case 'PercentageLiteral': return expr.value;
    case 'CurrencyLiteral': return expr.value;
    default: return 0;
  }
}

/**
 * Extract the display-scale value from an expression.
 * For CurrencyLiterals with magnitude (e.g. 3B EUR → value=3e9, magnitude='B'),
 * returns the human-readable value (3) and the magnitude divisor (1e9).
 */
function exprToDisplayValue(expr: ExpressionNode | undefined | null): { value: number; divisor: number; magnitude?: Magnitude } {
  if (!expr) return { value: 0, divisor: 1 };
  if (expr.type === 'CurrencyLiteral') {
    const c = expr as CurrencyLiteral;
    if (c.magnitude) {
      const divisor = MAGNITUDE_MULTIPLIERS[c.magnitude];
      return { value: c.value / divisor, divisor, magnitude: c.magnitude };
    }
    return { value: c.value, divisor: 1 };
  }
  return { value: exprToNumber(expr), divisor: 1 };
}

// ─── Extract metadata ───

const VALID_CATEGORIES: ScenarioCategory[] = ['tecnologia', 'economia', 'ambiente', 'societa', 'politica', 'regolamentazione'];

function extractMeta(ast: ScenarioNode, sdlId: string): ScenarioMeta {
  const m = ast.metadata;
  const tf = m.timeframe;
  const period = tf ? `${tf.start.year} — ${tf.end.year}` : '';

  let category: ScenarioCategory = 'tecnologia';
  if (m.category && VALID_CATEGORIES.includes(m.category as ScenarioCategory)) {
    category = m.category as ScenarioCategory;
  }

  return {
    id: sdlId,
    title: ast.name,
    subtitle: m.subtitle ?? '',
    description: m.description ?? '',
    category,
    tags: m.tags ?? [],
    icon: m.icon ?? '📊',
    color: m.color ?? '#3b82f6',
    period,
    difficulty: (m.difficulty as ScenarioMeta['difficulty']) ?? 'base',
  };
}

// ─── Extract sliders from parameters ───

interface SliderDefWithDivisor extends SliderDef {
  _divisor: number;
}

function extractSliders(ast: ScenarioNode): SliderDefWithDivisor[] {
  const sliders: SliderDefWithDivisor[] = [];

  for (const decl of ast.declarations) {
    if (decl.type !== 'Parameter') continue;
    const p = decl as ParameterNode;
    if (p.control !== 'slider') continue;

    const valueInfo = exprToDisplayValue(p.value);
    const divisor = valueInfo.divisor;
    const value = valueInfo.value;

    const hasRange = !!p.range;
    const min = hasRange ? exprToDisplayValue(p.range!.min).value : Math.round(value * 0.1);
    const max = hasRange ? exprToDisplayValue(p.range!.max).value : Math.round(value * 3);
    const step = p.step ? exprToNumber(p.step) : Math.max(0.1, Math.round((max - min) / 100 * 10) / 10);

    const fmt = p.format ?? '{value}';
    const unit = p.unit ?? '';

    sliders.push({
      id: p.name,
      label: p.label ?? p.name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      description: p.description ?? '',
      unit,
      min,
      max,
      step: step > 0 ? step : 1,
      default: value,
      source: p.source ?? '',
      format: (v: number) => {
        const s = fmt.replace('{value}', String(v));
        if (s !== String(v)) return s;
        return unit ? `${v} ${unit}` : String(v);
      },
      _divisor: divisor,
    });
  }

  return sliders;
}

// ─── Extract variable/impact display info ───

const DEFAULT_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444',
  '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1',
];

function extractVariableDisplays(ast: ScenarioNode): VariableDisplay[] {
  const displays: VariableDisplay[] = [];
  let colorIdx = 0;

  for (const decl of ast.declarations) {
    if (decl.type === 'Variable') {
      const v = decl as VariableNode;
      displays.push({
        id: v.name,
        label: v.label ?? v.name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        description: v.description ?? '',
        unit: v.unit ?? '',
        color: v.color ?? DEFAULT_COLORS[colorIdx % DEFAULT_COLORS.length],
        type: 'variable',
        icon: v.icon ?? '📊',
      });
      colorIdx++;
    } else if (decl.type === 'Impact') {
      const imp = decl as ImpactNode;
      displays.push({
        id: imp.name,
        label: imp.label ?? imp.name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        description: imp.description ?? '',
        unit: imp.unit ?? '',
        color: imp.color ?? DEFAULT_COLORS[colorIdx % DEFAULT_COLORS.length],
        type: 'impact',
        icon: imp.icon ?? '🎯',
      });
      colorIdx++;
    }
  }

  return displays;
}

// ─── Apply parameter overrides to AST ───

/**
 * Apply display-scale overrides to the AST.
 * The `divisorMap` maps parameter names to their magnitude divisors
 * so that display values (e.g. 3 for "3 mld €") are converted back
 * to raw values (3e9) for the simulation engine.
 */
function applyOverrides(
  ast: ScenarioNode,
  overrides: Record<string, number>,
  divisorMap: Record<string, number> = {},
): ScenarioNode {
  if (Object.keys(overrides).length === 0) return ast;

  const newDecls = ast.declarations.map(decl => {
    if (decl.type !== 'Parameter') return decl;
    const p = decl as ParameterNode;
    if (!(p.name in overrides)) return decl;

    const displayValue = overrides[p.name];
    const divisor = divisorMap[p.name] ?? 1;
    const rawValue = displayValue * divisor;

    let newExpr: ExpressionNode;
    if (p.value?.type === 'PercentageLiteral') {
      newExpr = { ...p.value, value: rawValue } as ExpressionNode;
    } else if (p.value?.type === 'CurrencyLiteral') {
      newExpr = { ...p.value, value: rawValue } as ExpressionNode;
    } else {
      newExpr = {
        type: 'NumberLiteral',
        value: rawValue,
        span: p.value?.span ?? { start: { line: 0, column: 0, offset: 0 }, end: { line: 0, column: 0, offset: 0 } },
      } as ExpressionNode;
    }
    return { ...p, value: newExpr, range: undefined };
  });

  return { ...ast, declarations: newDecls };
}

// ─── Main renderer: SDL source → renderable scenario ───

export interface RenderedScenario {
  ast: ScenarioNode;
  meta: ScenarioMeta;
  sliders: SliderDef[];
  variables: VariableDisplay[];
  simulate: (overrides?: Record<string, number>) => SimulationResult | null;
}

export function renderSDL(sdlSource: string, sdlId: string): RenderedScenario | null {
  const { ast, diagnostics } = parse(sdlSource);

  const errors = diagnostics.filter(d => d.severity === 'error');
  if (!ast || errors.length > 0) return null;

  const meta = extractMeta(ast, sdlId);
  const sliders = extractSliders(ast);
  const variables = extractVariableDisplays(ast);

  const divisorMap: Record<string, number> = {};
  const parameterDefaults: Record<string, number> = {};
  for (const s of sliders) {
    if (s._divisor !== 1) divisorMap[s.id] = s._divisor;
    parameterDefaults[s.id] = s.default * (s._divisor ?? 1);
  }

  return {
    ast,
    meta,
    sliders,
    variables,
    simulate: (overrides?: Record<string, number>) => {
      try {
        const effectiveAst = overrides
          ? applyOverrides(ast, overrides, divisorMap)
          : ast;
        return simulate(effectiveAst, {
          runs: 2000,
          seed: 42,
          parameterDefaults: overrides ? parameterDefaults : undefined,
        });
      } catch {
        return null;
      }
    },
  };
}

export { applyOverrides };
