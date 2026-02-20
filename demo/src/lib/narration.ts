/**
 * Automated Narration Engine
 *
 * Generates a human-readable Italian text summary of simulation results.
 * Covers: key trajectories, uncertainty levels, historical accuracy,
 * and most influential parameters.
 */

import type { SimulationResult } from '@sdl/core/types';
import type { VariableDisplay } from '../scenarios/types';
import type { ScenarioLiveData } from './pulse-bridge';
import type { SensitivityResult } from './sensitivity';
import { formatValue, getUncertaintyLevel } from './simulation';
import { computeValidation } from './pulse-bridge';

export interface NarrationBlock {
  title: string;
  text: string;
  tone: 'neutral' | 'positive' | 'warning' | 'critical';
}

function getLastMedian(
  result: SimulationResult,
  varId: string,
  type: 'variable' | 'impact',
): { median: number; p5: number; p95: number; year: number } | null {
  const src = type === 'impact' ? result.impacts.get(varId) : result.variables.get(varId);
  if (!src || src.timeseries.length === 0) return null;
  const last = src.timeseries[src.timeseries.length - 1];
  const p = last.distribution.percentiles;
  return {
    median: p.get(50) ?? last.distribution.mean,
    p5: p.get(5) ?? last.distribution.mean - 2 * last.distribution.std,
    p95: p.get(95) ?? last.distribution.mean + 2 * last.distribution.std,
    year: last.date.getFullYear(),
  };
}

function getFirstMedian(
  result: SimulationResult,
  varId: string,
  type: 'variable' | 'impact',
): number | null {
  const src = type === 'impact' ? result.impacts.get(varId) : result.variables.get(varId);
  if (!src || src.timeseries.length === 0) return null;
  const first = src.timeseries[0];
  return first.distribution.percentiles.get(50) ?? first.distribution.mean;
}

function percentChange(from: number, to: number): string {
  if (from === 0) return 'N/A';
  const pct = ((to - from) / Math.abs(from)) * 100;
  const sign = pct > 0 ? '+' : '';
  return `${sign}${pct.toFixed(0)}%`;
}

function directionWord(from: number, to: number): string {
  const diff = to - from;
  if (Math.abs(diff) / Math.max(Math.abs(from), 1) < 0.02) return 'restare sostanzialmente stabile';
  return diff > 0 ? 'crescere' : 'diminuire';
}

/**
 * Generate a narrative summary of the simulation results.
 */
export function generateNarration(
  result: SimulationResult,
  variables: VariableDisplay[],
  liveData?: ScenarioLiveData | null,
  sensitivityData?: SensitivityResult[] | null,
): NarrationBlock[] {
  const blocks: NarrationBlock[] = [];

  // 1. Overview: key trajectories
  const trajectories: string[] = [];
  for (const vd of variables) {
    const last = getLastMedian(result, vd.id, vd.type);
    const first = getFirstMedian(result, vd.id, vd.type);
    if (!last || first == null) continue;

    const direction = directionWord(first, last.median);
    const change = percentChange(first, last.median);
    trajectories.push(
      `**${vd.label}** dovrebbe ${direction} fino a ${formatValue(last.median)} ${vd.unit} entro il ${last.year} (${change} rispetto al valore iniziale), con un intervallo plausibile tra ${formatValue(last.p5)} e ${formatValue(last.p95)}.`,
    );
  }

  if (trajectories.length > 0) {
    blocks.push({
      title: 'Traiettorie principali',
      text: `Con le assunzioni correnti e ${result.runs.toLocaleString()} simulazioni Monte Carlo, ecco cosa emerge:\n\n${trajectories.join('\n\n')}`,
      tone: 'neutral',
    });
  }

  // 2. Uncertainty assessment
  const uncertainties: Array<{ label: string; level: string }> = [];
  for (const vd of variables) {
    const src = vd.type === 'impact' ? result.impacts.get(vd.id) : result.variables.get(vd.id);
    if (!src) continue;
    const fanData = src.timeseries.map(ts => {
      const p = ts.distribution.percentiles;
      return {
        year: ts.date.getFullYear(),
        base: 0, outerLower: 0, innerLower: 0, innerUpper: 0, outerUpper: 0,
        p50: p.get(50) ?? ts.distribution.mean,
        absP5: p.get(5) ?? ts.distribution.mean - 2 * ts.distribution.std,
        absP25: p.get(25) ?? ts.distribution.mean - 0.674 * ts.distribution.std,
        absP75: p.get(75) ?? ts.distribution.mean + 0.674 * ts.distribution.std,
        absP95: p.get(95) ?? ts.distribution.mean + 2 * ts.distribution.std,
      };
    });
    const level = getUncertaintyLevel(fanData);
    uncertainties.push({ label: vd.label, level });
  }

  const highUncertainty = uncertainties.filter(u => u.level === 'alta' || u.level === 'molto alta');
  if (highUncertainty.length > 0) {
    const names = highUncertainty.map(u => `**${u.label}**`).join(', ');
    blocks.push({
      title: 'Incertezza elevata',
      text: `Le variabili ${names} presentano un'incertezza ${highUncertainty[0].level}. Questo significa che piccole variazioni nelle assunzioni di partenza possono produrre risultati molto diversi. Questi valori vanno interpretati come scenari esplorativi, non come previsioni puntuali.`,
      tone: 'warning',
    });
  } else if (uncertainties.length > 0) {
    blocks.push({
      title: 'Incertezza contenuta',
      text: 'Le simulazioni mostrano un buon grado di convergenza: le diverse iterazioni producono risultati relativamente coerenti. Il ventaglio dei futuri possibili è ragionevolmente stretto.',
      tone: 'positive',
    });
  }

  // 3. Historical accuracy (if live data available)
  if (liveData && liveData.variables.size > 0) {
    const accuracies: Array<{ label: string; avgError: number }> = [];
    for (const [varId, varHist] of liveData.variables) {
      const simVar = result.variables.get(varId) ?? result.impacts.get(varId);
      if (!simVar) continue;
      const projected = simVar.timeseries.map(ts => ({
        year: ts.date.getFullYear(),
        median: ts.distribution.percentiles.get(50) ?? ts.distribution.mean,
      }));
      const validation = computeValidation(varHist.data, projected);
      if (validation.length === 0) continue;
      const avgError = validation.reduce((s, v) => s + Math.abs(v.errorPct), 0) / validation.length;
      accuracies.push({ label: varHist.label, avgError });
    }

    if (accuracies.length > 0) {
      const overallError = accuracies.reduce((s, a) => s + a.avgError, 0) / accuracies.length;
      const tone = overallError < 10 ? 'positive' : overallError < 20 ? 'neutral' : 'critical';
      const rating = overallError < 5 ? 'ottima' : overallError < 10 ? 'buona' : overallError < 20 ? 'accettabile' : 'da rivedere';

      const details = accuracies
        .map(a => `${a.label}: scarto medio ${a.avgError.toFixed(1)}%`)
        .join('; ');

      blocks.push({
        title: 'Confronto con la realtà',
        text: `Confrontando le proiezioni con i dati storici osservati, l'accuratezza complessiva è **${rating}** (scarto medio: ${overallError.toFixed(1)}%). Dettaglio: ${details}.`,
        tone,
      });
    }
  }

  // 4. Most influential parameters
  if (sensitivityData && sensitivityData.length > 0) {
    const top = sensitivityData.slice(0, 3);
    const topDesc = top.map((s, i) =>
      `${i + 1}. **${s.inputLabel}** (influenza totale: ${s.totalSwing.toFixed(1)}%)`,
    ).join('\n');

    blocks.push({
      title: 'Parametri più influenti',
      text: `La sensitivity analysis mostra quali assunzioni hanno il maggior impatto sui risultati:\n\n${topDesc}\n\nVariare questi parametri produce le oscillazioni più ampie nelle proiezioni. Se vuoi esplorare scenari diversi, concentrati su questi.`,
      tone: 'neutral',
    });
  }

  return blocks;
}
