/**
 * SDL Pulse — Bayesian Calibrator
 *
 * Updates scenario uncertainty distributions using observed historical data.
 * Reads CalibrateNode declarations from the AST, matches them with observed
 * data from the DataFetcher, and produces calibrated distributions.
 *
 * Supported methods:
 *   - bayesian_update: Conjugate normal-normal update (default)
 *   - maximum_likelihood: MLE point estimate with bootstrap variance
 *   - ensemble: Weighted average of prior and observed
 *
 * The calibrator produces a modified AST with updated uncertainty parameters,
 * which can be passed directly to the Monte Carlo engine.
 */

import type {
  ScenarioNode,
  CalibrateNode,
  AssumptionNode,
  VariableNode,
  DistributionExpression,
  ExpressionNode,
  Declaration,
  DurationValue,
} from '../core/types';
import type { ObservedTimeseries, CalibrationResult } from './types';

// ── Helpers ──

function exprToNumber(expr: ExpressionNode | undefined): number {
  if (!expr) return 0;
  switch (expr.type) {
    case 'NumberLiteral': return expr.value;
    case 'PercentageLiteral': return expr.value;
    case 'CurrencyLiteral': return expr.value;
    default: return 0;
  }
}

function numberToExpr(value: number, template?: ExpressionNode): ExpressionNode {
  const span = template?.span ?? { start: { line: 0, column: 0, offset: 0 }, end: { line: 0, column: 0, offset: 0 } };
  if (template?.type === 'PercentageLiteral') {
    return { type: 'PercentageLiteral', value, span };
  }
  return { type: 'NumberLiteral', value, span };
}

function durationToYears(d: DurationValue | undefined): number {
  if (!d) return 5;
  switch (d.unit) {
    case 'y': return d.amount;
    case 'm': return d.amount / 12;
    case 'w': return d.amount / 52;
    case 'd': return d.amount / 365;
    default: return 5;
  }
}

// ── Distribution parameter extraction ──

interface NormalParams {
  mean: number;
  std: number;
  isRelative: boolean;
  relativePercent: number;
}

function extractNormalParams(
  dist: DistributionExpression,
  baseMean?: number,
): NormalParams | null {
  if (dist.distribution !== 'normal') return null;

  if (dist.params.length === 1) {
    const p = dist.params[0];
    if (p.type === 'PercentageLiteral') {
      const pct = p.value;
      const mean = baseMean ?? 0;
      return { mean, std: Math.abs(mean * pct / 100), isRelative: true, relativePercent: pct };
    }
    const val = exprToNumber(p);
    return { mean: baseMean ?? 0, std: Math.abs(val), isRelative: false, relativePercent: 0 };
  }

  if (dist.params.length >= 2) {
    return {
      mean: exprToNumber(dist.params[0]),
      std: Math.abs(exprToNumber(dist.params[1])),
      isRelative: false,
      relativePercent: 0,
    };
  }

  return null;
}

// ── Bayesian conjugate update (Normal-Normal) ──

interface BayesianNormalResult {
  posteriorMean: number;
  posteriorStd: number;
}

function bayesianNormalUpdate(
  priorMean: number,
  priorStd: number,
  observedValues: number[],
): BayesianNormalResult {
  if (observedValues.length === 0 || priorStd <= 0) {
    return { posteriorMean: priorMean, posteriorStd: priorStd };
  }

  const n = observedValues.length;
  const obsMean = observedValues.reduce((s, v) => s + v, 0) / n;
  const obsVariance = n > 1
    ? observedValues.reduce((s, v) => s + (v - obsMean) ** 2, 0) / (n - 1)
    : priorStd ** 2;
  const obsStd = Math.sqrt(obsVariance);

  const priorPrec = 1 / (priorStd ** 2);
  const likelihoodPrec = n / (obsStd ** 2 || priorStd ** 2);

  const posteriorPrec = priorPrec + likelihoodPrec;
  const posteriorMean = (priorPrec * priorMean + likelihoodPrec * obsMean) / posteriorPrec;
  const posteriorStd = Math.sqrt(1 / posteriorPrec);

  return { posteriorMean, posteriorStd };
}

// ── Main calibration logic ──

/**
 * Apply calibration to a scenario AST using observed data.
 * Returns calibrated AST and calibration results.
 */
export function calibrateScenario(
  scenario: ScenarioNode,
  observed: Map<string, ObservedTimeseries>,
): { calibratedAst: ScenarioNode; results: Map<string, CalibrationResult> } {
  const results = new Map<string, CalibrationResult>();

  const calibrateDecls = scenario.declarations.filter(
    (d): d is CalibrateNode => d.type === 'Calibrate',
  );

  if (calibrateDecls.length === 0) {
    return { calibratedAst: scenario, results };
  }

  const newDeclarations = [...scenario.declarations];

  for (const cal of calibrateDecls) {
    const obs = observed.get(cal.target);
    if (!obs || obs.points.length === 0) continue;

    const windowYears = durationToYears(cal.window);
    const now = new Date();
    const cutoff = new Date(now.getFullYear() - windowYears, 0, 1);
    const recentPoints = obs.points.filter(p => p.date >= cutoff);
    if (recentPoints.length === 0) continue;

    const observedValues = recentPoints.map(p => p.value);

    const targetIdx = newDeclarations.findIndex(
      d => ('name' in d) && (d as AssumptionNode | VariableNode).name === cal.target,
    );
    if (targetIdx === -1) continue;

    const target = newDeclarations[targetIdx] as AssumptionNode | VariableNode;
    const dist = cal.prior ?? target.uncertainty;
    if (!dist || dist.type !== 'DistributionExpression') continue;

    let baseMean = 0;
    if (target.type === 'Assumption' && target.value) {
      baseMean = exprToNumber(target.value);
    } else if (target.type === 'Variable' && target.timeseries.length > 0) {
      const lastEntry = target.timeseries[target.timeseries.length - 1];
      if (lastEntry.value && 'type' in lastEntry.value) {
        baseMean = exprToNumber(lastEntry.value as ExpressionNode);
      }
    }
    if (baseMean === 0 && observedValues.length > 0) {
      baseMean = observedValues.reduce((s, v) => s + v, 0) / observedValues.length;
    }

    const normalParams = extractNormalParams(dist, baseMean);
    if (!normalParams) continue;

    const method = cal.method ?? 'bayesian_update';
    let posteriorMean: number;
    let posteriorStd: number;

    if (method === 'bayesian_update') {
      const result = bayesianNormalUpdate(normalParams.mean, normalParams.std, observedValues);
      posteriorMean = result.posteriorMean;
      posteriorStd = result.posteriorStd;
    } else if (method === 'maximum_likelihood') {
      posteriorMean = observedValues.reduce((s, v) => s + v, 0) / observedValues.length;
      posteriorStd = observedValues.length > 1
        ? Math.sqrt(observedValues.reduce((s, v) => s + (v - posteriorMean) ** 2, 0) / (observedValues.length - 1))
        : normalParams.std;
    } else {
      const obsMean = observedValues.reduce((s, v) => s + v, 0) / observedValues.length;
      const weight = Math.min(0.7, observedValues.length / 20);
      posteriorMean = normalParams.mean * (1 - weight) + obsMean * weight;
      posteriorStd = normalParams.std * (1 - weight * 0.5);
    }

    const calibratedDist: DistributionExpression = {
      ...dist,
      distribution: 'normal',
      params: normalParams.isRelative
        ? [numberToExpr(posteriorStd / (Math.abs(posteriorMean) || 1) * 100, dist.params[0])]
        : [numberToExpr(posteriorMean, dist.params[0]), numberToExpr(posteriorStd, dist.params[1])],
    };

    const updatedTarget: Declaration = { ...target, uncertainty: calibratedDist } as Declaration;
    newDeclarations[targetIdx] = updatedTarget;

    results.set(cal.target, {
      target: cal.target,
      originalDistribution: dist,
      calibratedDistribution: calibratedDist,
      dataPointsUsed: recentPoints.length,
      posteriorMean,
      posteriorStd,
    });
  }

  return {
    calibratedAst: { ...scenario, declarations: newDeclarations },
    results,
  };
}
