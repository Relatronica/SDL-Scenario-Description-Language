/**
 * SDL — Scenario Description Language
 * Monte Carlo Simulation Engine
 *
 * Executes SDL scenarios via Monte Carlo simulation,
 * propagating uncertainty through the causal graph.
 */
import { ScenarioNode, SimulationResult } from '../core/types';
export interface SimulationConfig {
    runs: number;
    method: 'monte_carlo' | 'latin_hypercube' | 'sobol';
    seed: number;
    percentiles: number[];
    convergence: number;
    timeoutMs: number;
    onProgress?: (progress: SimulationProgress) => void;
}
export interface SimulationProgress {
    completedRuns: number;
    totalRuns: number;
    elapsedMs: number;
    convergenceMetric: number | null;
}
export declare function simulate(scenario: ScenarioNode, configOverride?: Partial<SimulationConfig>): SimulationResult;
//# sourceMappingURL=monte-carlo.d.ts.map