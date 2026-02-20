/**
 * Sensitivity Analysis Engine
 *
 * Measures how much each assumption/parameter influences the final outputs.
 * For each input, runs simulations at low and high extremes while holding
 * all other inputs at their baseline, then measures the output swing.
 */

import type { SimulationResult, ScenarioNode } from '@sdl/core/types';
import type { RenderedScenario } from './sdl-renderer';
import type { VariableDisplay, SliderDef } from '../scenarios/types';

export interface SensitivityInput {
  id: string;
  label: string;
  baseline: number;
  low: number;
  high: number;
  unit: string;
}

export interface SensitivityOutputSwing {
  outputId: string;
  outputLabel: string;
  baselineValue: number;
  lowValue: number;
  highValue: number;
  swing: number;
  swingPct: number;
}

export interface SensitivityResult {
  inputId: string;
  inputLabel: string;
  outputs: SensitivityOutputSwing[];
  totalSwing: number;
}

/**
 * Run sensitivity analysis by varying each slider parameter independently.
 *
 * For each slider:
 *   1. Run simulation with parameter at its min → capture final medians
 *   2. Run simulation with parameter at its max → capture final medians
 *   3. Compute swing = |high - low| for each output variable
 *
 * Results are sorted by total swing (most influential first).
 */
export function runSensitivityAnalysis(
  rendered: RenderedScenario,
  variables: VariableDisplay[],
  calibratedAst?: ScenarioNode,
): SensitivityResult[] {
  const { sliders } = rendered;
  if (sliders.length === 0) return [];

  const baseline: Record<string, number> = {};
  for (const s of sliders) baseline[s.id] = s.default;

  const baseResult = calibratedAst
    ? rendered.simulateWith(calibratedAst, baseline)
    : rendered.simulate(baseline);
  if (!baseResult) return [];

  const getMedians = (result: SimulationResult): Record<string, number> => {
    const medians: Record<string, number> = {};
    for (const vd of variables) {
      const src = vd.type === 'impact'
        ? result.impacts.get(vd.id)
        : result.variables.get(vd.id);
      if (!src || src.timeseries.length === 0) continue;
      const lastTs = src.timeseries[src.timeseries.length - 1];
      medians[vd.id] = lastTs.distribution.percentiles.get(50)
        ?? lastTs.distribution.mean;
    }
    return medians;
  };

  const baseMedians = getMedians(baseResult);
  const results: SensitivityResult[] = [];

  for (const slider of sliders) {
    const lowOverrides = { ...baseline, [slider.id]: slider.min };
    const highOverrides = { ...baseline, [slider.id]: slider.max };

    const lowResult = calibratedAst
      ? rendered.simulateWith(calibratedAst, lowOverrides)
      : rendered.simulate(lowOverrides);
    const highResult = calibratedAst
      ? rendered.simulateWith(calibratedAst, highOverrides)
      : rendered.simulate(highOverrides);

    if (!lowResult || !highResult) continue;

    const lowMedians = getMedians(lowResult);
    const highMedians = getMedians(highResult);

    const outputs: SensitivityOutputSwing[] = [];
    let totalSwing = 0;

    for (const vd of variables) {
      const bv = baseMedians[vd.id];
      const lv = lowMedians[vd.id];
      const hv = highMedians[vd.id];
      if (bv == null || lv == null || hv == null) continue;

      const swing = Math.abs(hv - lv);
      const swingPct = bv !== 0 ? (swing / Math.abs(bv)) * 100 : 0;
      totalSwing += swingPct;

      outputs.push({
        outputId: vd.id,
        outputLabel: vd.label,
        baselineValue: bv,
        lowValue: lv,
        highValue: hv,
        swing,
        swingPct,
      });
    }

    results.push({
      inputId: slider.id,
      inputLabel: slider.label,
      outputs,
      totalSwing,
    });
  }

  return results.sort((a, b) => b.totalSwing - a.totalSwing);
}
