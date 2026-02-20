/**
 * Pulse Bridge — Maps SDL Pulse output to demo display types.
 *
 * Bridges the core pulse module (engine-level) with the demo UI
 * (VariableHistorical, FanChart props, validation tables).
 */

import { pulse as corePulse, registerFallbackData } from '@sdl/pulse/index';
import type { PulseResult, ObservedTimeseries, WatchAlert } from '@sdl/pulse/index';
import type { ScenarioNode } from '@sdl/core/types';

// ── Display types (consumed by FanChart and SdlScenarioView) ──

export interface HistoricalPoint {
  year: number;
  value: number;
  provisional?: boolean;
}

export interface VariableHistorical {
  variableId: string;
  label: string;
  unit: string;
  source: string;
  sourceUrl: string;
  lastUpdate: string;
  data: HistoricalPoint[];
}

export interface ValidationPoint {
  year: number;
  projected: number;
  observed: number;
  error: number;
  errorPct: number;
}

export interface ScenarioLiveData {
  scenarioId: string;
  variables: Map<string, VariableHistorical>;
  alerts: WatchAlert[];
  fetchedAt: Date;
  isLive: boolean;
  calibratedAst?: ScenarioNode;
}

// ── Green Transition fallback data (migrated from live-data.ts) ──

registerFallbackData(
  /nrg_ind_ren|eurostat.*renewable|renewable.*share/i,
  'Eurostat nrg_ind_ren (fallback)',
  [
    { year: 2010, value: 13.0 }, { year: 2011, value: 12.9 },
    { year: 2012, value: 15.4 }, { year: 2013, value: 16.7 },
    { year: 2014, value: 17.1 }, { year: 2015, value: 17.5 },
    { year: 2016, value: 17.4 }, { year: 2017, value: 18.3 },
    { year: 2018, value: 17.8 }, { year: 2019, value: 18.2 },
    { year: 2020, value: 20.4 }, { year: 2021, value: 19.0 },
    { year: 2022, value: 19.1 }, { year: 2023, value: 20.8, provisional: true },
  ],
);

registerFallbackData(
  /irena|solar.*capacity/i,
  'IRENA / Terna (fallback)',
  [
    { year: 2010, value: 3.5 }, { year: 2011, value: 12.8 },
    { year: 2012, value: 16.4 }, { year: 2013, value: 18.1 },
    { year: 2014, value: 18.6 }, { year: 2015, value: 18.9 },
    { year: 2016, value: 19.3 }, { year: 2017, value: 19.7 },
    { year: 2018, value: 20.1 }, { year: 2019, value: 20.9 },
    { year: 2020, value: 21.6 }, { year: 2021, value: 22.6 },
    { year: 2022, value: 25.0 }, { year: 2023, value: 30.2 },
    { year: 2024, value: 35.0, provisional: true },
  ],
);

registerFallbackData(
  /wind.*capacity/i,
  'IRENA / Terna (fallback)',
  [
    { year: 2010, value: 5.8 }, { year: 2011, value: 6.9 },
    { year: 2012, value: 8.1 }, { year: 2013, value: 8.6 },
    { year: 2014, value: 8.7 }, { year: 2015, value: 9.1 },
    { year: 2016, value: 9.4 }, { year: 2017, value: 9.8 },
    { year: 2018, value: 10.3 }, { year: 2019, value: 10.7 },
    { year: 2020, value: 10.9 }, { year: 2021, value: 11.3 },
    { year: 2022, value: 11.8 }, { year: 2023, value: 12.3 },
    { year: 2024, value: 13.0, provisional: true },
  ],
);

registerFallbackData(
  /co2.*emission|ghg.*emission|ispra/i,
  'ISPRA / EEA (fallback)',
  [
    { year: 2010, value: 417 }, { year: 2011, value: 405 },
    { year: 2012, value: 383 }, { year: 2013, value: 360 },
    { year: 2014, value: 344 }, { year: 2015, value: 348 },
    { year: 2016, value: 339 }, { year: 2017, value: 339 },
    { year: 2018, value: 335 }, { year: 2019, value: 328 },
    { year: 2020, value: 286 }, { year: 2021, value: 315 },
    { year: 2022, value: 316 }, { year: 2023, value: 306, provisional: true },
  ],
);

registerFallbackData(
  /istat.*pop|demo_pjan|population.*ital/i,
  'ISTAT Bilancio demografico (fallback)',
  [
    { year: 2010, value: 60.5 }, { year: 2011, value: 60.6 },
    { year: 2012, value: 60.8 }, { year: 2013, value: 60.8 },
    { year: 2014, value: 60.8 }, { year: 2015, value: 60.7 },
    { year: 2016, value: 60.6 }, { year: 2017, value: 60.5 },
    { year: 2018, value: 60.3 }, { year: 2019, value: 60.2 },
    { year: 2020, value: 59.6 }, { year: 2021, value: 59.2 },
    { year: 2022, value: 59.0 }, { year: 2023, value: 58.9, provisional: true },
  ],
);

registerFallbackData(
  /istat.*fert|demo_frate|fertility.*rate|tasso.*natalit/i,
  'ISTAT Indicatori demografici (fallback)',
  [
    { year: 2010, value: 1.46 }, { year: 2011, value: 1.44 },
    { year: 2012, value: 1.42 }, { year: 2013, value: 1.39 },
    { year: 2014, value: 1.37 }, { year: 2015, value: 1.35 },
    { year: 2016, value: 1.34 }, { year: 2017, value: 1.32 },
    { year: 2018, value: 1.29 }, { year: 2019, value: 1.27 },
    { year: 2020, value: 1.24 }, { year: 2021, value: 1.25 },
    { year: 2022, value: 1.24 }, { year: 2023, value: 1.20, provisional: true },
  ],
);

registerFallbackData(
  /nama_10_gdp|eurostat.*gdp|pil.*real/i,
  'Eurostat nama_10_gdp (fallback)',
  [
    { year: 2010, value: 1605 }, { year: 2011, value: 1614 },
    { year: 2012, value: 1567 }, { year: 2013, value: 1540 },
    { year: 2014, value: 1542 }, { year: 2015, value: 1555 },
    { year: 2016, value: 1572 }, { year: 2017, value: 1599 },
    { year: 2018, value: 1612 }, { year: 2019, value: 1617 },
    { year: 2020, value: 1474 }, { year: 2021, value: 1574 },
    { year: 2022, value: 1634 }, { year: 2023, value: 1652, provisional: true },
  ],
);

registerFallbackData(
  /iea.*data.*cent|energy.*ai|ai.*energy.*consum/i,
  'IEA Data Centres & Networks (fallback)',
  [
    { year: 2018, value: 15 }, { year: 2019, value: 20 },
    { year: 2020, value: 30 }, { year: 2021, value: 45 },
    { year: 2022, value: 65 }, { year: 2023, value: 90 },
    { year: 2024, value: 120, provisional: true },
  ],
);

registerFallbackData(
  /copernicus|era5|precipit|rainfall/i,
  'Copernicus ERA5 (fallback)',
  [
    { year: 2010, value: 102 }, { year: 2011, value: 95 },
    { year: 2012, value: 91 }, { year: 2013, value: 98 },
    { year: 2014, value: 105 }, { year: 2015, value: 88 },
    { year: 2016, value: 92 }, { year: 2017, value: 82 },
    { year: 2018, value: 96 }, { year: 2019, value: 89 },
    { year: 2020, value: 93 }, { year: 2021, value: 86 },
    { year: 2022, value: 78 }, { year: 2023, value: 81, provisional: true },
  ],
);

// ── Mapping: ObservedTimeseries → VariableHistorical ──

function toVariableHistorical(obs: ObservedTimeseries): VariableHistorical {
  return {
    variableId: obs.targetId,
    label: obs.label ?? obs.targetId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    unit: obs.unit ?? '',
    source: obs.points[0]?.source ?? 'SDL Pulse',
    sourceUrl: obs.sourceUrl,
    lastUpdate: obs.lastFetch.toISOString().slice(0, 7),
    data: obs.points.map(p => ({
      year: p.date.getFullYear(),
      value: p.value,
      provisional: p.provisional,
    })),
  };
}

// ── Public API ──

/**
 * Run SDL Pulse on a parsed AST and return demo-compatible display data.
 * Falls back gracefully: if the AST has no bind/calibrate blocks, returns null.
 */
export async function loadPulseData(ast: ScenarioNode): Promise<ScenarioLiveData | null> {
  try {
    const result = await corePulse(ast);
    if (result.observed.size === 0) return null;

    const variables = new Map<string, VariableHistorical>();
    for (const [id, obs] of result.observed) {
      variables.set(id, toVariableHistorical(obs));
    }

    return {
      scenarioId: result.scenario,
      variables,
      alerts: result.alerts,
      fetchedAt: result.fetchedAt,
      isLive: result.isLive,
      calibratedAst: result.calibratedAst,
    };
  } catch {
    return null;
  }
}

/**
 * Synchronous fallback: runs pulse without network fetches.
 * Uses only fallback adapter data.
 */
export async function loadPulseDataOffline(ast: ScenarioNode): Promise<ScenarioLiveData | null> {
  try {
    const result = await corePulse(ast, { skipCalibration: true, skipWatch: true });
    if (result.observed.size === 0) return null;

    const variables = new Map<string, VariableHistorical>();
    for (const [id, obs] of result.observed) {
      variables.set(id, toVariableHistorical(obs));
    }

    return {
      scenarioId: result.scenario,
      variables,
      alerts: [],
      fetchedAt: result.fetchedAt,
      isLive: false,
    };
  } catch {
    return null;
  }
}

/**
 * Compare scenario projections with observed data for overlapping years.
 */
export function computeValidation(
  historical: HistoricalPoint[],
  projectedTimeseries: Array<{ year: number; median: number }>,
): ValidationPoint[] {
  const histMap = new Map(historical.map(h => [h.year, h.value]));
  const points: ValidationPoint[] = [];

  for (const p of projectedTimeseries) {
    const observed = histMap.get(p.year);
    if (observed != null) {
      const error = p.median - observed;
      const errorPct = observed !== 0 ? (error / observed) * 100 : 0;
      points.push({ year: p.year, projected: p.median, observed, error, errorPct });
    }
  }

  return points;
}

export type { PulseResult, WatchAlert };
