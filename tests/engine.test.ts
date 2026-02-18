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
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from '../core/parser';
import type { SimulationConfig } from '../engine/monte-carlo';
import { simulate } from '../engine/monte-carlo';
import type { SimulationResult } from '../core/types';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

// ============================================================
// 8. Parameter Propagation
// ============================================================

describe('Engine — Parameter Propagation', () => {
  it('should modulate timeseries variable when parameter changes', () => {
    const sdlSource = `
      scenario "ParamPropagation" {
        timeframe: 2025 -> 2030
        resolution: yearly

        parameter investment {
          value: 100
          control: slider
        }

        variable output {
          2025: 100
          2030: 200
          depends_on: investment
          uncertainty: normal(±5%)
        }

        simulate { runs: 500 seed: 42 }
      }
    `;

    const resultDefault = runScenario(sdlSource, {
      parameterDefaults: { investment: 50 },
    });

    const ts = resultDefault.variables.get('output')!.timeseries;
    const lastMean = ts[ts.length - 1].distribution.mean;

    // Parameter is 100 vs default 50 → +100% delta, 30% sensitivity → +30% modulation
    assert.ok(
      lastMean > 200 * 1.1,
      `Expected mean significantly above 200, got ${lastMean}`,
    );
  });

  it('should not modulate when parameter equals its default', () => {
    const source = `
      scenario "NoModulation" {
        timeframe: 2025 -> 2030
        resolution: yearly

        parameter rate {
          value: 50
          control: slider
        }

        variable output {
          2025: 100
          2030: 200
          depends_on: rate
        }

        simulate { runs: 100 seed: 42 }
      }
    `;

    const result = runScenario(source, {
      parameterDefaults: { rate: 50 },
    });
    const ts = result.variables.get('output')!.timeseries;
    const lastMean = ts[ts.length - 1].distribution.mean;

    // At default value, delta is 0, modulation = 1. Mean should be close to 200.
    assert.ok(
      Math.abs(lastMean - 200) < 5,
      `Expected mean close to 200, got ${lastMean}`,
    );
  });

  it('should decrease output when parameter drops below default', () => {
    const sdlSource = `
      scenario "ParamDecrease" {
        timeframe: 2025 -> 2030
        resolution: yearly

        parameter funding {
          value: 25
          control: slider
        }

        variable result_var {
          2025: 100
          2030: 200
          depends_on: funding
          uncertainty: normal(±5%)
        }

        simulate { runs: 500 seed: 42 }
      }
    `;

    const result = runScenario(sdlSource, {
      parameterDefaults: { funding: 50 },
    });
    const ts = result.variables.get('result_var')!.timeseries;
    const lastMean = ts[ts.length - 1].distribution.mean;

    // Parameter 25 vs default 50 → -50% delta, 30% sensitivity → -15% modulation
    assert.ok(
      lastMean < 200 * 0.95,
      `Expected mean below ~190, got ${lastMean}`,
    );
  });

  it('should resolve parameter references in model expressions', () => {
    const source = `
      scenario "ModelRef" {
        timeframe: 2025 -> 2030
        resolution: yearly

        parameter growth_rate {
          value: 5
          control: slider
        }

        variable population {
          depends_on: growth_rate
          model: exponential(rate=0.01, base=1000)
        }

        simulate { runs: 100 seed: 42 }
      }
    `;

    const result = runScenario(source);
    const ts = result.variables.get('population')!.timeseries;

    assert.ok(ts.length > 0, 'Should have timeseries results');
    const lastMean = ts[ts.length - 1].distribution.mean;
    assert.ok(lastMean > 1000, `Expected growth above base, got ${lastMean}`);
  });

  it('should modulate proportionally across multiple dependencies', () => {
    const sdlSource = `
      scenario "MultiDep" {
        timeframe: 2025 -> 2030
        resolution: yearly

        parameter alpha {
          value: 100
          control: slider
        }

        parameter beta_param {
          value: 100
          control: slider
        }

        variable combined {
          2025: 100
          2030: 200
          depends_on: alpha, beta_param
          uncertainty: normal(±3%)
        }

        simulate { runs: 500 seed: 42 }
      }
    `;

    const resultBothHigh = runScenario(sdlSource, {
      parameterDefaults: { alpha: 50, beta_param: 50 },
    });

    const ts = resultBothHigh.variables.get('combined')!.timeseries;
    const highMean = ts[ts.length - 1].distribution.mean;

    // Both parameters doubled → each +100% delta, 30% sensitivity → ~1.3 * 1.3 ≈ 1.69x
    assert.ok(
      highMean > 200 * 1.2,
      `Expected mean significantly above 200, got ${highMean}`,
    );
  });
});

// ============================================================
// 9. Integration — Green Transition Italy (SDL Native)
// ============================================================

describe('Integration — Green Transition Italy Parameter Propagation', () => {
  const sdlPath = path.resolve(__dirname, '..', 'demo', 'public', 'sdl', 'green-transition-italy.sdl');
  let sdlSource: string;

  try {
    sdlSource = fs.readFileSync(sdlPath, 'utf8');
  } catch {
    sdlSource = '';
  }

  it('should parse and simulate the SDL native scenario', () => {
    assert.ok(sdlSource.length > 0, 'SDL file should exist and be non-empty');
    const { ast, diagnostics } = parse(sdlSource);
    const errors = diagnostics.filter(d => d.severity === 'error');
    assert.ok(ast, 'AST should be parsed successfully');
    assert.equal(errors.length, 0, `Expected no parse errors, got: ${errors.map(e => e.message).join(', ')}`);

    const result = simulate(ast!, { runs: 500, seed: 42 });
    assert.ok(result.variables.has('renewable_share'), 'Should have renewable_share variable');
    assert.ok(result.variables.has('co2_emissions'), 'Should have co2_emissions variable');
    assert.ok(result.variables.get('renewable_share')!.timeseries.length > 0, 'Should produce timeseries data');
  });

  it('should respond to subsidy_rate parameter change via parameterDefaults', () => {
    if (!sdlSource) return;
    const { ast } = parse(sdlSource);
    if (!ast) return;

    // Default simulation: subsidy_rate = 0.3 (30%), parameterDefaults says original was also 0.3 → no delta
    const resultDefault = simulate(ast, { runs: 500, seed: 42, parameterDefaults: { subsidy_rate: 0.3 } });

    // Boosted: subsidy_rate = 0.3 in AST but parameterDefaults says original was 0.15 → +100% delta
    const resultBoosted = simulate(ast, { runs: 500, seed: 42, parameterDefaults: { subsidy_rate: 0.15 } });

    // Reduced: subsidy_rate = 0.3 in AST but parameterDefaults says original was 0.5 → -40% delta
    const resultReduced = simulate(ast, { runs: 500, seed: 42, parameterDefaults: { subsidy_rate: 0.5 } });

    const getMean = (result: SimulationResult, varName: string) => {
      const v = result.variables.get(varName)!;
      return v.timeseries[v.timeseries.length - 1].distribution.mean;
    };

    const defaultMean = getMean(resultDefault, 'renewable_share');
    const boostedMean = getMean(resultBoosted, 'renewable_share');
    const reducedMean = getMean(resultReduced, 'renewable_share');

    assert.ok(
      boostedMean > defaultMean,
      `Expected boosted (${boostedMean.toFixed(2)}) > default (${defaultMean.toFixed(2)})`,
    );
    assert.ok(
      defaultMean > reducedMean,
      `Expected default (${defaultMean.toFixed(2)}) > reduced (${reducedMean.toFixed(2)})`,
    );
  });

  it('should respond to retraining_budget parameter change', () => {
    if (!sdlSource) return;
    const { ast } = parse(sdlSource);
    if (!ast) return;

    // green_employment depends_on: renewable_share, retraining_budget
    // retraining_budget default = 3B EUR = 3_000_000_000
    const resultDefault = simulate(ast, { runs: 500, seed: 42, parameterDefaults: { retraining_budget: 3_000_000_000 } });
    const resultBoosted = simulate(ast, { runs: 500, seed: 42, parameterDefaults: { retraining_budget: 1_500_000_000 } });

    const getMean = (result: SimulationResult, varName: string) => {
      const v = result.variables.get(varName)!;
      return v.timeseries[v.timeseries.length - 1].distribution.mean;
    };

    const defaultMean = getMean(resultDefault, 'green_employment');
    const boostedMean = getMean(resultBoosted, 'green_employment');

    // retraining_budget=3B vs default 1.5B → +100% delta → green_employment should increase
    assert.ok(
      boostedMean > defaultMean,
      `Expected boosted green employment (${boostedMean.toFixed(2)}) > default (${defaultMean.toFixed(2)})`,
    );
  });
});

// ============================================================
// 10. SDL File Validation — All scenarios parse successfully
// ============================================================

describe('SDL Files — All scenarios parse and simulate', () => {
  const sdlDir = path.resolve(__dirname, '..', 'demo', 'public', 'sdl');
  let sdlFiles: string[] = [];

  try {
    sdlFiles = fs.readdirSync(sdlDir).filter(f => f.endsWith('.sdl')).sort();
  } catch {
    sdlFiles = [];
  }

  it('should have SDL scenario files', () => {
    assert.ok(sdlFiles.length >= 15, `Expected at least 15 SDL files, found ${sdlFiles.length}`);
  });

  for (const file of sdlFiles) {
    it(`should parse ${file} without errors`, () => {
      const source = fs.readFileSync(path.join(sdlDir, file), 'utf8');
      const { ast, diagnostics } = parse(source);
      const errors = diagnostics.filter(d => d.severity === 'error');
      assert.ok(ast, `AST should be returned for ${file}`);
      assert.equal(errors.length, 0, `Parse errors in ${file}: ${errors.map(e => `[L${e.span?.start.line}] ${e.message}`).join('; ')}`);
    });

    it(`should simulate ${file} successfully`, () => {
      const source = fs.readFileSync(path.join(sdlDir, file), 'utf8');
      const { ast } = parse(source);
      if (!ast) return;
      const result = simulate(ast, { runs: 100, seed: 42 });
      assert.ok(result.variables.size > 0, `${file} should produce variable results`);
    });
  }
});
