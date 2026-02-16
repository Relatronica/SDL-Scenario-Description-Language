/**
 * SDL Integration Tests
 *
 * End-to-end tests: parse → validate → simulate
 * using the real example files from the examples/ directory.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from '../core/parser';
import { validate } from '../core/validator';
import { simulate } from '../engine/monte-carlo';

// ── Helper ──

const EXAMPLES_DIR = join(import.meta.dirname ?? '.', '..', 'examples');

function loadExample(filename: string): string {
  return readFileSync(join(EXAMPLES_DIR, filename), 'utf-8');
}

function fullPipeline(source: string, runs = 100) {
  // 1. Parse
  const parseResult = parse(source);
  const parseErrors = parseResult.diagnostics.filter(d => d.severity === 'error');
  assert.equal(parseErrors.length, 0,
    `Parse errors: ${parseErrors.map(e => `[${e.code}] ${e.message} (line ${e.span.start.line})`).join('\n')}`);
  assert.ok(parseResult.ast, 'Expected non-null AST');

  // 2. Validate
  const validationResult = validate(parseResult.ast);
  const validationErrors = validationResult.diagnostics.filter(d => d.severity === 'error');
  assert.equal(validationErrors.length, 0,
    `Validation errors: ${validationErrors.map(e => `[${e.code}] ${e.message}`).join('\n')}`);
  assert.ok(validationResult.causalGraph, 'Expected causal graph');

  // 3. Simulate
  const result = simulate(parseResult.ast, { runs, seed: 42 });
  assert.ok(result.runs > 0, 'Expected at least 1 run');
  assert.ok(result.elapsedMs >= 0);

  return { parseResult, validationResult, result };
}

// ============================================================
// 1. Full Pipeline Tests with Example Files
// ============================================================

describe('Integration — Digital Euro Adoption', () => {
  it('should parse, validate, and simulate successfully', () => {
    const source = loadExample('digital-euro-adoption.sdl');
    const { result, validationResult } = fullPipeline(source);

    assert.equal(result.scenario, 'Digital Euro Adoption 2030');
    assert.ok(result.variables.size > 0);
    assert.ok(result.impacts.size > 0);
    assert.ok(result.branches.size > 0);

    // Causal graph should have nodes and edges
    assert.ok(validationResult.causalGraph!.nodes.length >= 5);
    assert.ok(validationResult.causalGraph!.edges.length > 0);
  });

  it('should produce reasonable results for wallet_adoption', () => {
    const source = loadExample('digital-euro-adoption.sdl');
    const { result } = fullPipeline(source, 500);

    const adoption = result.variables.get('wallet_adoption');
    assert.ok(adoption);

    // At 2025, adoption should start near 0
    const mean2025 = adoption.timeseries[0].distribution.mean;
    assert.ok(mean2025 >= -20 && mean2025 <= 20,
      `Expected near 0 at 2025, got ${mean2025}`);

    // At 2032, adoption should be significantly higher
    const lastIdx = adoption.timeseries.length - 1;
    const meanLast = adoption.timeseries[lastIdx].distribution.mean;
    assert.ok(meanLast > mean2025,
      `Expected growth: last (${meanLast}) > first (${mean2025})`);
  });
});

describe('Integration — Demographic Winter Europe', () => {
  it('should parse, validate, and simulate successfully', () => {
    const source = loadExample('demographic-winter-europe.sdl');
    const { result } = fullPipeline(source);

    assert.ok(result.variables.size > 0);
    assert.ok(result.timesteps.length > 0);
  });
});

describe('Integration — Pandemic Preparedness 2035', () => {
  it('should parse, validate, and simulate successfully', () => {
    const source = loadExample('pandemic-preparedness-2035.sdl');
    const { result } = fullPipeline(source);

    assert.ok(result.variables.size > 0);
  });
});

describe('Integration — African Urban Leapfrog 2050', () => {
  it('should parse, validate, and simulate successfully', () => {
    const source = loadExample('african-urban-leapfrog-2050.sdl');
    const { result } = fullPipeline(source);

    assert.ok(result.variables.size > 0);
    assert.ok(result.timesteps.length > 0);
  });
});

describe('Integration — EU Defense Autonomy 2035', () => {
  it('should parse, validate, and simulate successfully', () => {
    const source = loadExample('eu-defense-autonomy-2035.sdl');
    const { result } = fullPipeline(source);

    assert.ok(result.variables.size > 0);
  });
});

describe('Integration — Water Scarcity Mediterranean', () => {
  it('should parse, validate, and simulate successfully', () => {
    const source = loadExample('water-scarcity-mediterranean.sdl');
    const { result } = fullPipeline(source);

    assert.ok(result.variables.size > 0);
  });
});

describe('Integration — AI Governance 2030', () => {
  it('should parse, validate, and simulate successfully', () => {
    const source = loadExample('ai-governance-2030.sdl');
    const { result } = fullPipeline(source);

    assert.ok(result.variables.size > 0);
  });
});

describe('Integration — Green Transition Italy', () => {
  it('should parse, validate, and simulate successfully', () => {
    const source = loadExample('green-transition-italy.sdl');
    const { result } = fullPipeline(source);

    assert.ok(result.variables.size > 0);
  });
});

// ============================================================
// 2. Cross-cutting concerns
// ============================================================

describe('Integration — Result Structure', () => {
  it('should have proper result structure', () => {
    const source = loadExample('digital-euro-adoption.sdl');
    const { result } = fullPipeline(source, 200);

    // Check variable results
    for (const [name, varResult] of result.variables) {
      assert.equal(typeof name, 'string');
      assert.equal(varResult.name, name);
      assert.ok(varResult.timeseries.length > 0);

      for (const ts of varResult.timeseries) {
        assert.ok(ts.date instanceof Date);
        assert.equal(typeof ts.distribution.mean, 'number');
        assert.equal(typeof ts.distribution.median, 'number');
        assert.equal(typeof ts.distribution.std, 'number');
        assert.equal(typeof ts.distribution.min, 'number');
        assert.equal(typeof ts.distribution.max, 'number');
        assert.ok(ts.distribution.percentiles instanceof Map);
        assert.ok(!isNaN(ts.distribution.mean));
      }
    }

    // Check branch results
    for (const [name, branchResult] of result.branches) {
      assert.equal(typeof name, 'string');
      assert.equal(branchResult.name, name);
      assert.ok(branchResult.activationRate >= 0);
      assert.ok(branchResult.activationRate <= 1);
    }

    // Check impact results
    for (const [name, impactResult] of result.impacts) {
      assert.equal(typeof name, 'string');
      assert.equal(impactResult.name, name);
      assert.ok(impactResult.timeseries.length > 0);
    }
  });
});
