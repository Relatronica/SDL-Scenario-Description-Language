/**
 * SDL Pulse — Data Fetcher
 *
 * Scans the SDL AST for `bind` blocks (in Assumptions) and `calibrate`
 * declarations, then fetches observed data using a pluggable adapter system.
 *
 * The adapter registry allows mapping URL patterns to concrete data sources
 * (Eurostat API, fallback datasets, custom APIs).
 */

import type {
  ScenarioNode,
  AssumptionNode,
  CalibrateNode,
  ExpressionNode,
} from '../core/types';
import type {
  ObservedTimeseries,
  ObservedPoint,
  DataAdapter,
  DataAdapterConfig,
} from './types';

// ── Bind target extraction ──

export interface BindTarget {
  targetId: string;
  sourceUrl: string;
  field?: string;
  fallbackValue?: number;
  label?: string;
  unit?: string;
}

export interface CalibrateTarget {
  targetId: string;
  historicalUrl: string;
}

function exprToNumber(expr: ExpressionNode | undefined): number | undefined {
  if (!expr) return undefined;
  switch (expr.type) {
    case 'NumberLiteral': return expr.value;
    case 'PercentageLiteral': return expr.value;
    case 'CurrencyLiteral': return expr.value;
    default: return undefined;
  }
}

/**
 * Extract all bind targets from the AST.
 * Bind blocks are nested inside AssumptionNode.
 */
export function extractBindTargets(scenario: ScenarioNode): BindTarget[] {
  const targets: BindTarget[] = [];

  for (const decl of scenario.declarations) {
    if (decl.type !== 'Assumption') continue;
    const assumption = decl as AssumptionNode;
    if (!assumption.bind?.source) continue;

    targets.push({
      targetId: assumption.name,
      sourceUrl: assumption.bind.source,
      field: assumption.bind.field,
      fallbackValue: exprToNumber(assumption.bind.fallback),
    });
  }

  return targets;
}

/**
 * Extract all calibrate targets from the AST.
 * CalibrateNode is a top-level declaration.
 */
export function extractCalibrateTargets(scenario: ScenarioNode): CalibrateTarget[] {
  const targets: CalibrateTarget[] = [];

  for (const decl of scenario.declarations) {
    if (decl.type !== 'Calibrate') continue;
    const cal = decl as CalibrateNode;
    if (!cal.historical) continue;

    targets.push({
      targetId: cal.target,
      historicalUrl: cal.historical,
    });
  }

  return targets;
}

// ── Adapter Registry ──

const defaultAdapters: DataAdapter[] = [];

/**
 * Find all adapters that can handle a given URL, ordered by priority.
 */
function findAdapters(url: string, adapters: DataAdapter[]): DataAdapter[] {
  return adapters.filter(adapter => adapter.canHandle(url));
}

// ── Fetcher ──

export interface FetchResult {
  observed: Map<string, ObservedTimeseries>;
  errors: Array<{ targetId: string; url: string; error: string }>;
}

/**
 * Fetch observed data for all bind and calibrate targets in the scenario.
 *
 * For each target, finds a matching adapter and fetches the data.
 * Targets without a matching adapter are skipped (with an error logged).
 */
export async function fetchObservedData(
  scenario: ScenarioNode,
  customAdapters: DataAdapter[] = [],
  timeoutMs: number = 10000,
): Promise<FetchResult> {
  const adapters = [...customAdapters, ...defaultAdapters];
  const observed = new Map<string, ObservedTimeseries>();
  const errors: FetchResult['errors'] = [];

  const allUrls = new Map<string, { targetId: string; config: DataAdapterConfig }>();

  for (const bt of extractBindTargets(scenario)) {
    allUrls.set(bt.targetId, {
      targetId: bt.targetId,
      config: {
        sourceUrl: bt.sourceUrl,
        field: bt.field,
        fallbackValue: bt.fallbackValue,
        targetId: bt.targetId,
        label: bt.label,
        unit: bt.unit,
      },
    });
  }

  for (const ct of extractCalibrateTargets(scenario)) {
    if (!allUrls.has(ct.targetId)) {
      allUrls.set(ct.targetId, {
        targetId: ct.targetId,
        config: {
          sourceUrl: ct.historicalUrl,
          targetId: ct.targetId,
        },
      });
    }
  }

  const fetchPromises = Array.from(allUrls.entries()).map(async ([id, { config }]) => {
    const matching = findAdapters(config.sourceUrl, adapters);
    if (matching.length === 0) {
      errors.push({ targetId: id, url: config.sourceUrl, error: `No adapter found for URL: ${config.sourceUrl}` });
      return;
    }

    for (const adapter of matching) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);

        const points = await adapter.fetch(config);
        clearTimeout(timer);

        if (points.length > 0) {
          observed.set(id, {
            targetId: id,
            points,
            lastFetch: new Date(),
            sourceUrl: config.sourceUrl,
            unit: config.unit,
            label: config.label,
          });
          return;
        }
      } catch {
        // Adapter failed — try the next one in the chain
      }
    }

    errors.push({
      targetId: id,
      url: config.sourceUrl,
      error: `All adapters returned empty for: ${config.sourceUrl}`,
    });
  });

  await Promise.allSettled(fetchPromises);

  return { observed, errors };
}
