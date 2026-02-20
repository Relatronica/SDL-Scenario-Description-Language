/**
 * Shared simulation utilities — FanChart data extraction and formatting.
 *
 * Used by both the Demo ScenarioView and the Editor results panel.
 */

import type { SimulationResult } from '@sdl/core/types';

export interface FanChartPoint {
  year: number;
  base: number;
  outerLower: number;
  innerLower: number;
  innerUpper: number;
  outerUpper: number;
  p50: number;
  absP5: number;
  absP25: number;
  absP75: number;
  absP95: number;
}

export type UncertaintyLevel = 'bassa' | 'media' | 'alta' | 'molto alta';

export function extractFanData(
  result: SimulationResult,
  name: string,
  type: 'variable' | 'impact',
): FanChartPoint[] {
  const src = type === 'impact' ? result.impacts.get(name) : result.variables.get(name);
  if (!src) return [];
  return src.timeseries.map((ts) => {
    const p = ts.distribution.percentiles;
    const p5 = p.get(5) ?? ts.distribution.mean - 2 * ts.distribution.std;
    const p25 = p.get(25) ?? ts.distribution.mean - 0.674 * ts.distribution.std;
    const p50 = p.get(50) ?? ts.distribution.mean;
    const p75 = p.get(75) ?? ts.distribution.mean + 0.674 * ts.distribution.std;
    const p95 = p.get(95) ?? ts.distribution.mean + 2 * ts.distribution.std;
    return {
      year: ts.date.getFullYear(),
      base: p5,
      outerLower: p25 - p5,
      innerLower: p50 - p25,
      innerUpper: p75 - p50,
      outerUpper: p95 - p75,
      p50,
      absP5: p5,
      absP25: p25,
      absP75: p75,
      absP95: p95,
    };
  });
}

export function getFinalMedian(
  result: SimulationResult,
  name: string,
  type: 'variable' | 'impact',
): number | null {
  const src = type === 'impact' ? result.impacts.get(name) : result.variables.get(name);
  if (!src || src.timeseries.length === 0) return null;
  const last = src.timeseries[src.timeseries.length - 1];
  return last.distribution.percentiles.get(50) ?? last.distribution.mean;
}

export function getFinalRange(
  result: SimulationResult,
  name: string,
  type: 'variable' | 'impact',
): { p5: number; p95: number } | null {
  const src = type === 'impact' ? result.impacts.get(name) : result.variables.get(name);
  if (!src || src.timeseries.length === 0) return null;
  const last = src.timeseries[src.timeseries.length - 1];
  const p = last.distribution.percentiles;
  return {
    p5: p.get(5) ?? last.distribution.mean - 2 * last.distribution.std,
    p95: p.get(95) ?? last.distribution.mean + 2 * last.distribution.std,
  };
}

export function getUncertaintyLevel(data: FanChartPoint[]): UncertaintyLevel {
  if (!data || data.length === 0) return 'media';
  const last = data[data.length - 1];
  const median = Math.abs(last.p50) || 1;
  const spread = (last.absP95 - last.absP5) / median;
  if (spread < 0.1) return 'bassa';
  if (spread < 0.3) return 'media';
  if (spread < 0.6) return 'alta';
  return 'molto alta';
}

export function formatValue(v: number): string {
  if (Math.abs(v) >= 1e9) return `${(v / 1e9).toFixed(0)}B`;
  if (Math.abs(v) >= 1e6) return `${(v / 1e6).toFixed(0)}M`;
  if (Math.abs(v) >= 1e4) return `${(v / 1e3).toFixed(0)}K`;
  if (Math.abs(v) >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
  if (Math.abs(v) < 0.01 && v !== 0) return v.toExponential(1);
  if (Math.abs(v) < 1) return v.toFixed(2);
  return v.toFixed(1);
}

export function formatValueFull(v: number): string {
  if (Math.abs(v) >= 1e9) return `${(v / 1e9).toFixed(1)} miliardi`;
  if (Math.abs(v) >= 1e6) return `${(v / 1e6).toFixed(1)} milioni`;
  if (Math.abs(v) >= 1e3) return `${(v / 1e3).toFixed(1)} mila`;
  if (Math.abs(v) < 1) return v.toFixed(2);
  return v.toFixed(1);
}
