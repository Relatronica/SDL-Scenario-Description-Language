/**
 * SDL Monte Carlo Engine Tests
 *
 * Tests the simulation engine:
 * - Deterministic seeded execution
 * - Distribution sampling
 * - Model evaluation
 * - Timeseries interpolation
 * - Result aggregation
 * - Convergence detection
 * - Branch evaluation
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parse } from '../core/parser';
import type { SimulationConfig } from '../engine/monte-carlo';
import { simulate } from '../engine/monte-carlo';
import type { SimulationResult } from '../core/types';

// ── Helper ──

function runScenario(source: string, configOverride?: Partial<SimulationConfig>): SimulationResult {
  const { ast, diagnostics } = parse(source);
  const errors = diagnostics.filter(d => d.severity === 'error');
  assert.equal(errors.length, 0, `Parse errors: ${errors.map(e => e.message).join('; ')}`);
  assert.ok(ast);
  return simulate(ast, configOverride);
}

// ============================================================
// 1. Basic Simulation
// ============================================================

describe('Engine — Basic Simulation', () => {
  it('should run a minimal scenario', () => {
    const result = runScenario(`
      scenario "Minimal" {
        timeframe: 2025 -> 2030
        variable x {
          2025: 100
          2030: 200
          uncertainty: normal(±10%)
        }
        simulate {
          runs: 100
          seed: 42
        }
      }
    `);

    assert.equal(result.scenario, 'Minimal');
    assert.ok(result.runs > 0);
    assert.ok(result.variables.has('x'));
    assert.ok(result.elapsedMs >= 0);
  });

  it('should produce the correct number of timesteps', () => {
    const result = runScenario(`
      scenario "Timesteps" {
        timeframe: 2025 -> 2030
        variable x {
          2025: 100
          2030: 200
          uncertainty: normal(±5%)
        }
        simulate { runs: 10 seed: 1 }
      }
    `);

    // 2025 to 2030 inclusive = 6 timesteps
    assert.equal(result.timesteps.length, 6);
  });
});

// ============================================================
// 2. Deterministic Seeding
// ============================================================

describe('Engine — Deterministic Seeding', () => {
  it('should produce identical results with the same seed', () => {
    const src = `
      scenario "Seed" {
        timeframe: 2025 -> 2030
        variable x {
          2025: 100
          2030: 200
          uncertainty: normal(±20%)
        }
        simulate { runs: 500 seed: 12345 }
      }
    `;

    const r1 = runScenario(src);
    const r2 = runScenario(src);

    const x1 = r1.variables.get('x')!;
    const x2 = r2.variables.get('x')!;

    for (let i = 0; i < x1.timeseries.length; i++) {
      assert.equal(
        x1.timeseries[i].distribution.mean,
        x2.timeseries[i].distribution.mean,
        `Mean mismatch at timestep ${i}`
      );
    }
  });

  it('should produce different results with different seeds', () => {
    const base = `
      scenario "S" {
        timeframe: 2025 -> 2030
        variable x {
          2025: 100
          2030: 200
          uncertainty: normal(±20%)
        }
        simulate { runs: 500 }
      }
    `;

    const r1 = runScenario(base, { seed: 111 });
    const r2 = runScenario(base, { seed: 999 });

    const mean1 = r1.variables.get('x')!.timeseries[3].distribution.mean;
    const mean2 = r2.variables.get('x')!.timeseries[3].distribution.mean;

    // Means should differ with different seeds
    assert.notEqual(mean1, mean2);
  });
});

// ============================================================
// 3. Variable Interpolation
// ============================================================

describe('Engine — Variable Interpolation', () => {
  it('should interpolate between timeseries points', () => {
    const result = runScenario(`
      scenario "Interp" {
        timeframe: 2025 -> 2030
        variable x {
          2025: 100
          2030: 200
          uncertainty: normal(±1%)
          interpolation: linear
        }
        simulate { runs: 1000 seed: 42 }
      }
    `);

    const ts = result.variables.get('x')!.timeseries;
    const mean2025 = ts[0].distribution.mean;
    const mean2030 = ts[5].distribution.mean;

    // Values should increase monotonically (approximately)
    assert.ok(mean2025 < mean2030, `Expected ${mean2025} < ${mean2030}`);

    // Midpoint (2027.5) should be roughly 150
    const mean2027 = ts[2].distribution.mean;
    assert.ok(mean2027 > 110 && mean2027 < 190,
      `Expected midpoint mean ~150, got ${mean2027}`);
  });
});

// ============================================================
// 4. Uncertainty / Distributions
// ============================================================

describe('Engine — Uncertainty', () => {
  it('should produce spread in results with uncertainty', () => {
    const result = runScenario(`
      scenario "Spread" {
        timeframe: 2025 -> 2030
        variable x {
          2025: 100
          2030: 200
          uncertainty: normal(±20%)
        }
        simulate { runs: 1000 seed: 42 }
      }
    `);

    const dist = result.variables.get('x')!.timeseries[3].distribution;
    // Standard deviation should be > 0
    assert.ok(dist.std > 0, `Expected std > 0, got ${dist.std}`);
    // Min should be less than max
    assert.ok(dist.min < dist.max);
  });

  it('should produce no spread when there is no uncertainty', () => {
    const result = runScenario(`
      scenario "NoSpread" {
        timeframe: 2025 -> 2027
        variable x {
          2025: 100
          2027: 100
        }
        simulate { runs: 100 seed: 42 }
      }
    `);

    const dist = result.variables.get('x')!.timeseries[0].distribution;
    assert.equal(dist.std, 0, 'Expected zero std for deterministic variable');
    assert.equal(dist.mean, 100);
  });
});

// ============================================================
// 5. Assumption Sampling
// ============================================================

describe('Engine — Assumption Sampling', () => {
  it('should sample assumptions with uncertainty', () => {
    const result = runScenario(`
      scenario "AssumptionTest" {
        timeframe: 2025 -> 2030
        assumption a {
          value: 0.5
          source: "Test"
          uncertainty: beta(5, 5)
        }
        variable x {
          2025: 100
          2030: 200
          depends_on: a
          model: linear(slope=10, intercept=100)
          uncertainty: normal(±5%)
        }
        simulate { runs: 500 seed: 42 }
      }
    `);

    assert.ok(result.variables.has('x'));
    const dist = result.variables.get('x')!.timeseries[3].distribution;
    assert.ok(dist.std > 0);
  });
});

// ============================================================
// 6. Impact Calculation
// ============================================================

describe('Engine — Impact Calculation', () => {
  it('should compute impacts from formula', () => {
    const result = runScenario(`
      scenario "ImpactTest" {
        timeframe: 2025 -> 2030

        variable x {
          2025: 100
          2030: 200
          uncertainty: normal(±5%)
        }

        impact effect {
          derives_from: x
          formula: x * 0.1
        }

        simulate { runs: 500 seed: 42 }
      }
    `);

    assert.ok(result.impacts.has('effect'));
    const impact = result.impacts.get('effect')!;
    const mean2025 = impact.timeseries[0].distribution.mean;
    // x=100 * 0.1 = ~10 (with uncertainty)
    assert.ok(mean2025 > 5 && mean2025 < 20,
      `Expected impact ~10, got ${mean2025}`);
  });
});

// ============================================================
// 7. Branch Evaluation
// ============================================================

describe('Engine — Branches', () => {
  it('should evaluate branches and report activation rates', () => {
    const result = runScenario(`
      scenario "BranchTest" {
        timeframe: 2025 -> 2030

        variable x {
          2025: 10
          2030: 80
          uncertainty: normal(±20%)
        }

        branch "High" when x > 50 {
          probability: 0.5
        }

        simulate { runs: 1000 seed: 42 }
      }
    `);

    assert.ok(result.branches.has('High'));
    const branch = result.branches.get('High')!;
    // Should have some activation rate between 0 and 1
    assert.ok(branch.activationRate >= 0 && branch.activationRate <= 1);
  });
});

// ============================================================
// 8. Percentiles
// ============================================================

describe('Engine — Percentiles', () => {
  it('should compute requested percentiles', () => {
    const result = runScenario(`
      scenario "Percentiles" {
        timeframe: 2025 -> 2030
        variable x {
          2025: 100
          2030: 200
          uncertainty: normal(±15%)
        }
        simulate {
          runs: 1000
          seed: 42
          percentiles: [5, 25, 50, 75, 95]
        }
      }
    `);

    const dist = result.variables.get('x')!.timeseries[3].distribution;
    assert.ok(dist.percentiles.has(5));
    assert.ok(dist.percentiles.has(25));
    assert.ok(dist.percentiles.has(50));
    assert.ok(dist.percentiles.has(75));
    assert.ok(dist.percentiles.has(95));

    // Percentiles should be in order
    const p5 = dist.percentiles.get(5)!;
    const p50 = dist.percentiles.get(50)!;
    const p95 = dist.percentiles.get(95)!;
    assert.ok(p5 <= p50, `Expected p5 (${p5}) <= p50 (${p50})`);
    assert.ok(p50 <= p95, `Expected p50 (${p50}) <= p95 (${p95})`);
  });
});

// ============================================================
// 9. Config Override
// ============================================================

describe('Engine — Config Override', () => {
  it('should apply config override seed when no scenario simulate block', () => {
    const result = runScenario(`
      scenario "Override" {
        timeframe: 2025 -> 2027
        variable x {
          2025: 100
          2027: 200
          uncertainty: normal(±10%)
        }
      }
    `, { runs: 50, seed: 42 });

    // With no scenario simulate block, override should apply
    assert.equal(result.runs, 50);
    assert.equal(result.seed, 42);
  });

  it('should merge scenario simulate block with defaults', () => {
    const result = runScenario(`
      scenario "Merge" {
        timeframe: 2025 -> 2027
        variable x {
          2025: 100
          2027: 200
          uncertainty: normal(±10%)
        }
        simulate { runs: 200 seed: 99 }
      }
    `);

    // Scenario block values should be applied
    assert.equal(result.seed, 99);
    assert.ok(result.runs <= 200);
  });
});

// ============================================================
// 10. Validation Gate
// ============================================================

describe('Engine — Validation', () => {
  it('should throw on invalid scenario', () => {
    const { ast } = parse(`
      scenario "Invalid" {
        timeframe: 2050 -> 2025
      }
    `);
    assert.ok(ast);
    assert.throws(() => simulate(ast), /validation failed/i);
  });
});

// ============================================================
// 11. Model Evaluation
// ============================================================

describe('Engine — Model Evaluation', () => {
  it('should apply linear model', () => {
    const result = runScenario(`
      scenario "Linear" {
        timeframe: 2025 -> 2030
        variable x {
          model: linear(slope=10, intercept=100)
          uncertainty: normal(±1%)
        }
        simulate { runs: 500 seed: 42 }
      }
    `);

    const ts = result.variables.get('x')!.timeseries;
    const mean2025 = ts[0].distribution.mean;
    const mean2030 = ts[5].distribution.mean;

    // At t=0 (2025): 100 + 0*10 = 100
    // At t=5 (2030): 100 + 5*10 = 150
    assert.ok(mean2025 > 90 && mean2025 < 110,
      `Expected ~100 at 2025, got ${mean2025}`);
    assert.ok(mean2030 > 140 && mean2030 < 160,
      `Expected ~150 at 2030, got ${mean2030}`);
  });
});

// ============================================================
// 12. Multiple Variables with Dependencies
// ============================================================

describe('Engine — Dependency Chain', () => {
  it('should propagate through dependency chain', () => {
    const result = runScenario(`
      scenario "Chain" {
        timeframe: 2025 -> 2030

        assumption base_rate {
          value: 0.5
          source: "Test"
          uncertainty: beta(5, 5)
        }

        variable upstream {
          2025: 100
          2030: 200
          depends_on: base_rate
          model: linear(slope=20, intercept=100)
          uncertainty: normal(±10%)
        }

        variable downstream {
          2025: 50
          2030: 100
          depends_on: upstream
          model: linear(slope=10, intercept=50)
          uncertainty: normal(±5%)
        }

        simulate { runs: 500 seed: 42 }
      }
    `);

    assert.ok(result.variables.has('upstream'));
    assert.ok(result.variables.has('downstream'));

    // Both should have results
    assert.ok(result.variables.get('upstream')!.timeseries.length > 0);
    assert.ok(result.variables.get('downstream')!.timeseries.length > 0);
  });
});
