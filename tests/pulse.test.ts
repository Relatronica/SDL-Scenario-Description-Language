/**
 * SDL Pulse Module Tests
 *
 * Tests the data fetcher, calibrator, watchdog, and orchestrator.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from '../core/parser';
import type { ScenarioNode } from '../core/types';
import { extractBindTargets, extractCalibrateTargets, fetchObservedData } from '../pulse/data-fetcher';
import { calibrateScenario } from '../pulse/calibrator';
import { evaluateWatchRules } from '../pulse/watchdog';
import { pulse } from '../pulse/index';
import { FallbackAdapter, registerFallbackData } from '../pulse/adapters/index';
import type { ObservedTimeseries, DataAdapter } from '../pulse/types';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseSDL(source: string): ScenarioNode {
  const { ast, diagnostics } = parse(source);
  const errors = diagnostics.filter(d => d.severity === 'error');
  assert.equal(errors.length, 0, `Parse errors: ${errors.map(e => e.message).join('; ')}`);
  assert.ok(ast);
  return ast;
}

function parseFile(filename: string): ScenarioNode {
  const sdlPath = path.resolve(__dirname, '..', 'examples', filename);
  const source = fs.readFileSync(sdlPath, 'utf-8');
  return parseSDL(source);
}

// ============================================================
// DataFetcher — Bind target extraction
// ============================================================

describe('Pulse — DataFetcher — Bind Extraction', () => {
  it('should extract bind targets from assumptions', () => {
    const ast = parseSDL(`
      scenario "Test Bind" {
        timeframe: 2025 -> 2030
        assumption carbon_tax {
          value: 85
          source: "test"
          bind {
            source: "https://api.example.com/data"
            field: "price"
            fallback: 80
          }
        }
        variable x {
          2025: 100
          2030: 200
        }
        simulate { runs: 10 }
      }
    `);

    const targets = extractBindTargets(ast);
    assert.equal(targets.length, 1);
    assert.equal(targets[0].targetId, 'carbon_tax');
    assert.equal(targets[0].sourceUrl, 'https://api.example.com/data');
    assert.equal(targets[0].field, 'price');
    assert.equal(targets[0].fallbackValue, 80);
  });

  it('should return empty for scenarios without bind blocks', () => {
    const ast = parseSDL(`
      scenario "No Bind" {
        timeframe: 2025 -> 2030
        assumption x {
          value: 10
          source: "test"
        }
        variable v {
          2025: 100
          2030: 200
        }
        simulate { runs: 10 }
      }
    `);
    assert.equal(extractBindTargets(ast).length, 0);
  });

  it('should extract bind targets from green-transition-italy.sdl', () => {
    const ast = parseFile('green-transition-italy.sdl');
    const targets = extractBindTargets(ast);
    assert.ok(targets.length >= 1, 'Should have at least one bind target');
    assert.ok(targets.some(t => t.targetId === 'carbon_tax'));
  });
});

// ============================================================
// DataFetcher — Calibrate target extraction
// ============================================================

describe('Pulse — DataFetcher — Calibrate Extraction', () => {
  it('should extract calibrate targets from green-transition-italy.sdl', () => {
    const ast = parseFile('green-transition-italy.sdl');
    const targets = extractCalibrateTargets(ast);
    assert.ok(targets.length >= 2, 'Should have at least two calibrate targets');
    assert.ok(targets.some(t => t.targetId === 'renewable_share'));
    assert.ok(targets.some(t => t.targetId === 'co2_emissions'));
  });
});

// ============================================================
// DataFetcher — Fetch with custom adapter
// ============================================================

describe('Pulse — DataFetcher — Fetch', () => {
  it('should fetch data using a custom adapter', async () => {
    const mockAdapter: DataAdapter = {
      name: 'mock',
      canHandle: (url: string) => url.includes('example.com'),
      fetch: async () => [
        { date: new Date(2023, 0, 1), value: 42, source: 'mock' },
        { date: new Date(2024, 0, 1), value: 44, source: 'mock' },
      ],
    };

    const ast = parseSDL(`
      scenario "Test Fetch" {
        timeframe: 2025 -> 2030
        assumption x {
          value: 40
          source: "test"
          bind {
            source: "https://example.com/data"
            field: "val"
          }
        }
        variable v {
          2025: 100
          2030: 200
        }
        simulate { runs: 10 }
      }
    `);

    const result = await fetchObservedData(ast, [mockAdapter]);
    assert.equal(result.observed.size, 1);
    assert.ok(result.observed.has('x'));
    assert.equal(result.observed.get('x')!.points.length, 2);
    assert.equal(result.errors.length, 0);
  });

  it('should report error when no adapter matches', async () => {
    const ast = parseSDL(`
      scenario "Test No Adapter" {
        timeframe: 2025 -> 2030
        assumption x {
          value: 40
          source: "test"
          bind {
            source: "https://unknown-api.com/data"
            field: "val"
          }
        }
        variable v {
          2025: 100
          2030: 200
        }
        simulate { runs: 10 }
      }
    `);

    const result = await fetchObservedData(ast, []);
    assert.equal(result.observed.size, 0);
    assert.equal(result.errors.length, 1);
    assert.ok(result.errors[0].error.includes('No adapter'));
  });
});

// ============================================================
// Calibrator
// ============================================================

describe('Pulse — Calibrator', () => {
  it('should calibrate normal distributions using Bayesian update', () => {
    const ast = parseSDL(`
      scenario "Test Calibrate" {
        timeframe: 2025 -> 2050
        variable renewable_share {
          2025: 20%
          2050: 45%
          uncertainty: normal(±15%)
        }
        calibrate renewable_share {
          historical: "https://api.irena.org/data"
          method: bayesian_update
          window: 5y
          prior: normal(±15%)
        }
        simulate { runs: 10 }
      }
    `);

    const observed = new Map<string, ObservedTimeseries>();
    observed.set('renewable_share', {
      targetId: 'renewable_share',
      points: [
        { date: new Date(2022, 0, 1), value: 19.1, source: 'test' },
        { date: new Date(2023, 0, 1), value: 20.8, source: 'test' },
        { date: new Date(2024, 0, 1), value: 22.0, source: 'test' },
      ],
      lastFetch: new Date(),
      sourceUrl: 'https://api.irena.org/data',
    });

    const { calibratedAst, results } = calibrateScenario(ast, observed);
    assert.ok(results.has('renewable_share'), 'Should have calibration result');
    assert.ok(results.get('renewable_share')!.dataPointsUsed > 0);
    assert.ok(results.get('renewable_share')!.posteriorStd > 0);
    assert.notEqual(calibratedAst, ast, 'Should produce a new AST');
  });

  it('should skip calibration when no observed data', () => {
    const ast = parseSDL(`
      scenario "No Data" {
        timeframe: 2025 -> 2050
        variable x {
          2025: 100
          2050: 200
          uncertainty: normal(±10%)
        }
        calibrate x {
          historical: "https://example.com/data"
          method: bayesian_update
          window: 5y
        }
        simulate { runs: 10 }
      }
    `);

    const { results } = calibrateScenario(ast, new Map());
    assert.equal(results.size, 0);
  });
});

// ============================================================
// Watchdog
// ============================================================

describe('Pulse — Watchdog', () => {
  it('should trigger warn alert when condition is met', () => {
    const ast = parseSDL(`
      scenario "Test Watch" {
        timeframe: 2025 -> 2030
        assumption carbon_tax {
          value: 85
          source: "test"
          watch {
            warn when: actual < assumed * 0.8
          }
        }
        variable v {
          2025: 100
          2030: 200
        }
        simulate { runs: 10 }
      }
    `);

    const observed = new Map<string, ObservedTimeseries>();
    observed.set('carbon_tax', {
      targetId: 'carbon_tax',
      points: [
        { date: new Date(2024, 0, 1), value: 60, source: 'test' },
      ],
      lastFetch: new Date(),
      sourceUrl: 'https://example.com',
    });

    const alerts = evaluateWatchRules(ast, observed);
    assert.equal(alerts.length, 1);
    assert.equal(alerts[0].severity, 'warn');
    assert.equal(alerts[0].target, 'carbon_tax');
    assert.equal(alerts[0].observed, 60);
    assert.equal(alerts[0].assumed, 85);
  });

  it('should not trigger when condition is not met', () => {
    const ast = parseSDL(`
      scenario "Test Watch OK" {
        timeframe: 2025 -> 2030
        assumption carbon_tax {
          value: 85
          source: "test"
          watch {
            warn when: actual < assumed * 0.8
          }
        }
        variable v {
          2025: 100
          2030: 200
        }
        simulate { runs: 10 }
      }
    `);

    const observed = new Map<string, ObservedTimeseries>();
    observed.set('carbon_tax', {
      targetId: 'carbon_tax',
      points: [
        { date: new Date(2024, 0, 1), value: 82, source: 'test' },
      ],
      lastFetch: new Date(),
      sourceUrl: 'https://example.com',
    });

    const alerts = evaluateWatchRules(ast, observed);
    assert.equal(alerts.length, 0);
  });

  it('should trigger error alert with stronger condition', () => {
    const ast = parseSDL(`
      scenario "Test Error" {
        timeframe: 2025 -> 2030
        assumption carbon_tax {
          value: 85
          source: "test"
          watch {
            warn  when: actual < assumed * 0.8
            error when: actual < assumed * 0.5
          }
        }
        variable v {
          2025: 100
          2030: 200
        }
        simulate { runs: 10 }
      }
    `);

    const observed = new Map<string, ObservedTimeseries>();
    observed.set('carbon_tax', {
      targetId: 'carbon_tax',
      points: [
        { date: new Date(2024, 0, 1), value: 30, source: 'test' },
      ],
      lastFetch: new Date(),
      sourceUrl: 'https://example.com',
    });

    const alerts = evaluateWatchRules(ast, observed);
    assert.equal(alerts.length, 2, 'Both warn and error should trigger');
    assert.ok(alerts.some(a => a.severity === 'warn'));
    assert.ok(alerts.some(a => a.severity === 'error'));
  });

  it('should handle missing observed data gracefully', () => {
    const ast = parseSDL(`
      scenario "Test No Data" {
        timeframe: 2025 -> 2030
        assumption carbon_tax {
          value: 85
          source: "test"
          watch {
            warn when: actual < assumed * 0.8
          }
        }
        variable v {
          2025: 100
          2030: 200
        }
        simulate { runs: 10 }
      }
    `);

    const alerts = evaluateWatchRules(ast, new Map());
    assert.equal(alerts.length, 0);
  });
});

// ============================================================
// Orchestrator (pulse function)
// ============================================================

describe('Pulse — Orchestrator', () => {
  it('should run full pipeline with mock adapter', async () => {
    const mockAdapter: DataAdapter = {
      name: 'mock',
      canHandle: (url: string) => url.includes('worldbank') || url.includes('irena') || url.includes('eea'),
      fetch: async () => [
        { date: new Date(2022, 0, 1), value: 60, source: 'mock' },
        { date: new Date(2023, 0, 1), value: 65, source: 'mock' },
      ],
    };

    const ast = parseFile('green-transition-italy.sdl');
    const result = await pulse(ast, { adapters: [mockAdapter] });

    assert.ok(result.scenario, 'Should have scenario name');
    assert.ok(result.fetchedAt instanceof Date);
    assert.ok(result.observed.size > 0, 'Should have observed data');
  });

  it('should return empty results for scenarios without bind/calibrate', async () => {
    const ast = parseSDL(`
      scenario "Simple" {
        timeframe: 2025 -> 2030
        variable x {
          2025: 100
          2030: 200
          uncertainty: normal(±10%)
        }
        simulate { runs: 10 }
      }
    `);

    const result = await pulse(ast);
    assert.equal(result.observed.size, 0);
    assert.equal(result.alerts.length, 0);
    assert.equal(result.calibrations.size, 0);
  });

  it('should skip fetch when option is set', async () => {
    const ast = parseFile('green-transition-italy.sdl');
    const result = await pulse(ast, { skipFetch: true });
    assert.equal(result.observed.size, 0);
  });
});

// ============================================================
// FallbackAdapter
// ============================================================

describe('Pulse — FallbackAdapter', () => {
  it('should match known URL patterns', () => {
    assert.ok(FallbackAdapter.canHandle('https://api.worldbank.org/carbon-pricing/eu-ets'));
    assert.ok(FallbackAdapter.canHandle('https://api.eea.europa.eu/ghg/italy/2015-2025'));
  });

  it('should return data for matched patterns', async () => {
    const points = await FallbackAdapter.fetch({
      sourceUrl: 'https://api.eea.europa.eu/ghg/italy/2015-2025',
      targetId: 'co2_emissions',
    });
    assert.ok(points.length > 0, 'Should return fallback data');
    assert.ok(points[0].date instanceof Date);
    assert.ok(typeof points[0].value === 'number');
  });

  it('should support dynamic registration', async () => {
    registerFallbackData(
      /test-dynamic-pulse-data/i,
      'Test Source',
      [{ year: 2020, value: 100 }, { year: 2021, value: 110 }],
    );

    assert.ok(FallbackAdapter.canHandle('https://test-dynamic-pulse-data.example.com'));
    const points = await FallbackAdapter.fetch({
      sourceUrl: 'https://test-dynamic-pulse-data.example.com',
      targetId: 'test',
    });
    assert.equal(points.length, 2);
    assert.equal(points[0].value, 100);
  });
});
