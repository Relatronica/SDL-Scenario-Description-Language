/**
 * SDL Pulse — Live Data Binding, Calibration, and Monitoring
 *
 * Pulse reads bind/calibrate/watch blocks from the SDL AST and:
 *   1. Fetches observed data from external APIs (DataFetcher + Adapters)
 *   2. Calibrates uncertainty distributions using Bayesian methods (Calibrator)
 *   3. Evaluates watch rules and produces alerts (Watchdog)
 *
 * Usage:
 *   const { ast } = parse(sdlSource);
 *   const pulseResult = await pulse(ast);
 *   const simResult = simulate(pulseResult.calibratedAst ?? ast);
 */

import type { ScenarioNode } from '../core/types';
import type { PulseResult, PulseOptions, DataAdapter } from './types';
import { fetchObservedData } from './data-fetcher';
import { calibrateScenario } from './calibrator';
import { evaluateWatchRules } from './watchdog';
import { EurostatAdapter, WorldBankAdapter, FallbackAdapter } from './adapters';

const DEFAULT_ADAPTERS: DataAdapter[] = [EurostatAdapter, WorldBankAdapter, FallbackAdapter];

/**
 * Run the full Pulse pipeline on a parsed SDL scenario.
 *
 * Returns observed data, calibration results, watch alerts,
 * and optionally a calibrated AST for the Monte Carlo engine.
 */
export async function pulse(
  scenario: ScenarioNode,
  options: PulseOptions = {},
): Promise<PulseResult & { calibratedAst?: ScenarioNode }> {
  const adapters = [...(options.adapters ?? []), ...DEFAULT_ADAPTERS];
  const timeoutMs = options.timeoutMs ?? 10000;

  // 1. Fetch observed data
  const fetchResult = options.skipFetch
    ? { observed: new Map(), errors: [] }
    : await fetchObservedData(scenario, adapters, timeoutMs);

  // 2. Calibrate distributions
  const { calibratedAst, results: calibrations } = options.skipCalibration
    ? { calibratedAst: undefined, results: new Map() }
    : calibrateScenario(scenario, fetchResult.observed);

  // 3. Evaluate watch rules
  const alerts = options.skipWatch
    ? []
    : evaluateWatchRules(scenario, fetchResult.observed);

  return {
    scenario: scenario.name,
    observed: fetchResult.observed,
    alerts,
    calibrations,
    fetchedAt: new Date(),
    isLive: fetchResult.observed.size > 0 && fetchResult.errors.length === 0,
    calibratedAst,
  };
}

// Re-export types and components for consumers
export type {
  PulseResult,
  PulseOptions,
  ObservedPoint,
  ObservedTimeseries,
  WatchAlert,
  CalibrationResult,
  DataAdapter,
  DataAdapterConfig,
} from './types';

export { fetchObservedData, extractBindTargets, extractCalibrateTargets } from './data-fetcher';
export { calibrateScenario } from './calibrator';
export { evaluateWatchRules } from './watchdog';
export { EurostatAdapter, WorldBankAdapter, FallbackAdapter, registerFallbackData } from './adapters';

// Source registry
export type { SourceEntry } from './sources';
export {
  SOURCE_REGISTRY,
  findSourceById,
  findSourceByUrl,
  findSourcesByCategory,
  findSourcesByProvider,
  findSourcesByAdapter,
  CATEGORY_META,
} from './sources';
export type { SourceCategory } from './sources';
