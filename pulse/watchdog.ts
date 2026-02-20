/**
 * SDL Pulse — Watchdog
 *
 * Evaluates watch rules by comparing observed data with assumed values.
 * Produces WatchAlert[] that the UI can display as warnings or errors.
 *
 * Watch rules use expressions like:
 *   warn  when: actual < assumed * 0.8
 *   error when: actual < assumed * 0.5
 *
 * The watchdog interprets `actual` as the latest observed value
 * and `assumed` as the value declared in the assumption.
 */

import type {
  ScenarioNode,
  AssumptionNode,
  WatchNode,
  WatchRule,
  ExpressionNode,
} from '../core/types';
import type { ObservedTimeseries, WatchAlert } from './types';

// ── Expression evaluation helpers ──

function exprToNumber(expr: ExpressionNode | undefined): number {
  if (!expr) return 0;
  switch (expr.type) {
    case 'NumberLiteral': return expr.value;
    case 'PercentageLiteral': return expr.value / 100;
    case 'CurrencyLiteral': return expr.value;
    default: return 0;
  }
}

/**
 * Simple expression evaluator for watch conditions.
 * Substitutes `actual` and `assumed` identifiers with provided values,
 * then evaluates the comparison.
 */
function evaluateCondition(
  condition: ExpressionNode,
  actual: number,
  assumed: number,
): boolean {
  if (condition.type === 'BinaryExpression') {
    const left = resolveValue(condition.left, actual, assumed);
    const right = resolveValue(condition.right, actual, assumed);

    switch (condition.operator) {
      case '<': return left < right;
      case '>': return left > right;
      case '<=': return left <= right;
      case '>=': return left >= right;
      case '==': return Math.abs(left - right) < 1e-10;
      case '!=': return Math.abs(left - right) >= 1e-10;
      default: return false;
    }
  }

  return false;
}

function resolveValue(
  expr: ExpressionNode,
  actual: number,
  assumed: number,
): number {
  switch (expr.type) {
    case 'Identifier':
      if (expr.name === 'actual') return actual;
      if (expr.name === 'assumed') return assumed;
      return 0;

    case 'NumberLiteral':
      return expr.value;

    case 'PercentageLiteral':
      return expr.value / 100;

    case 'CurrencyLiteral':
      return expr.value;

    case 'BinaryExpression': {
      const l = resolveValue(expr.left, actual, assumed);
      const r = resolveValue(expr.right, actual, assumed);
      switch (expr.operator) {
        case '+': return l + r;
        case '-': return l - r;
        case '*': return l * r;
        case '/': return r !== 0 ? l / r : 0;
        case '^': return l ** r;
        default: return 0;
      }
    }

    case 'UnaryExpression':
      if (expr.operator === '-') return -resolveValue(expr.operand, actual, assumed);
      return 0;

    default:
      return exprToNumber(expr);
  }
}

function conditionToString(rule: WatchRule): string {
  return `${rule.severity} when condition triggered`;
}

// ── Main watchdog logic ──

/**
 * Evaluate all watch rules in the scenario against observed data.
 */
export function evaluateWatchRules(
  scenario: ScenarioNode,
  observed: Map<string, ObservedTimeseries>,
): WatchAlert[] {
  const alerts: WatchAlert[] = [];

  // Collect assumption values for lookup
  const assumedValues = new Map<string, number>();
  for (const decl of scenario.declarations) {
    if (decl.type === 'Assumption') {
      const a = decl as AssumptionNode;
      if (a.value) {
        assumedValues.set(a.name, exprToNumber(a.value));
      }
    }
  }

  // Process watch blocks nested in assumptions
  for (const decl of scenario.declarations) {
    if (decl.type !== 'Assumption') continue;
    const assumption = decl as AssumptionNode;
    if (!assumption.watch) continue;

    const obs = observed.get(assumption.name);
    if (!obs || obs.points.length === 0) continue;

    const latestObserved = obs.points[obs.points.length - 1].value;
    const assumedValue = assumedValues.get(assumption.name) ?? 0;

    for (const rule of assumption.watch.rules) {
      const triggered = evaluateCondition(rule.condition, latestObserved, assumedValue);
      if (triggered) {
        alerts.push({
          target: assumption.name,
          severity: rule.severity,
          message: `${assumption.name}: valore osservato (${latestObserved.toFixed(2)}) ha attivato un alert rispetto al valore assunto (${assumedValue.toFixed(2)})`,
          observed: latestObserved,
          assumed: assumedValue,
          rule: conditionToString(rule),
          timestamp: new Date(),
        });
      }
    }
  }

  // Process top-level watch declarations
  for (const decl of scenario.declarations) {
    if (decl.type !== 'Watch') continue;
    const watch = decl as WatchNode;
    const targetName = watch.target;
    if (!targetName) continue;

    const obs = observed.get(targetName);
    if (!obs || obs.points.length === 0) continue;

    const latestObserved = obs.points[obs.points.length - 1].value;
    const assumedValue = assumedValues.get(targetName) ?? 0;

    for (const rule of watch.rules) {
      const triggered = evaluateCondition(rule.condition, latestObserved, assumedValue);
      if (triggered) {
        alerts.push({
          target: targetName,
          severity: rule.severity,
          message: `${targetName}: valore osservato (${latestObserved.toFixed(2)}) ha attivato un alert rispetto al valore assunto (${assumedValue.toFixed(2)})`,
          observed: latestObserved,
          assumed: assumedValue,
          rule: conditionToString(rule),
          timestamp: new Date(),
        });
      }
    }
  }

  return alerts;
}
