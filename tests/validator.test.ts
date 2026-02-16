/**
 * SDL Validator Tests
 *
 * Tests the semantic validator:
 * - Duplicate declarations
 * - Undefined references
 * - Causal graph construction
 * - Cycle detection
 * - Metadata validation
 * - Distribution parameter validation
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parse } from '../core/parser';
import { validate } from '../core/validator';

// ── Helper ──

function validateSrc(source: string) {
  const { ast } = parse(source);
  assert.ok(ast, 'Parse failed before validation');
  return validate(ast);
}

function expectValid(source: string) {
  const result = validateSrc(source);
  const errors = result.diagnostics.filter(d => d.severity === 'error');
  assert.equal(errors.length, 0, `Unexpected errors: ${errors.map(e => e.message).join('; ')}`);
  return result;
}

function expectError(source: string, code?: string) {
  const result = validateSrc(source);
  const errors = result.diagnostics.filter(d => d.severity === 'error');
  assert.ok(errors.length > 0, 'Expected validation errors');
  if (code) {
    assert.ok(
      errors.some(e => e.code === code),
      `Expected error code ${code}, got: ${errors.map(e => e.code).join(', ')}`
    );
  }
  return result;
}

function expectWarning(source: string, code?: string) {
  const result = validateSrc(source);
  const warnings = result.diagnostics.filter(d => d.severity === 'warning');
  assert.ok(warnings.length > 0, 'Expected validation warnings');
  if (code) {
    assert.ok(
      warnings.some(w => w.code === code),
      `Expected warning code ${code}, got: ${warnings.map(w => w.code).join(', ')}`
    );
  }
  return result;
}

// ============================================================
// 1. Valid Scenarios
// ============================================================

describe('Validator — Valid Scenarios', () => {
  it('should validate a minimal scenario', () => {
    expectValid(`
      scenario "Test" {
        timeframe: 2025 -> 2050
      }
    `);
  });

  it('should validate a scenario with variables and assumptions', () => {
    expectValid(`
      scenario "Test" {
        timeframe: 2025 -> 2030

        assumption growth {
          value: 0.5
          source: "Test"
          uncertainty: beta(2, 5)
        }

        variable x {
          2025: 100
          2030: 200
          depends_on: growth
          uncertainty: normal(±10%)
        }
      }
    `);
  });

  it('should validate a scenario with impacts', () => {
    expectValid(`
      scenario "Test" {
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
      }
    `);
  });
});

// ============================================================
// 2. Metadata Validation
// ============================================================

describe('Validator — Metadata', () => {
  it('should warn when timeframe is missing', () => {
    expectWarning(`
      scenario "Test" {
        variable x {
          2025: 100
          uncertainty: normal(±5%)
        }
      }
    `, 'SDL-W001');
  });

  it('should error when timeframe start >= end', () => {
    expectError(`
      scenario "Test" {
        timeframe: 2050 -> 2025
      }
    `, 'SDL-E008');
  });

  it('should error when confidence is out of range', () => {
    expectError(`
      scenario "Test" {
        timeframe: 2025 -> 2050
        confidence: 1.5
      }
    `, 'SDL-E003');
  });

  it('should accept confidence between 0 and 1', () => {
    expectValid(`
      scenario "Test" {
        timeframe: 2025 -> 2050
        confidence: 0.75
      }
    `);
  });
});

// ============================================================
// 3. Duplicate Declarations
// ============================================================

describe('Validator — Duplicates', () => {
  it('should detect duplicate variable names', () => {
    expectError(`
      scenario "Test" {
        timeframe: 2025 -> 2030
        variable x {
          2025: 100
          uncertainty: normal(±5%)
        }
        variable x {
          2025: 200
          uncertainty: normal(±5%)
        }
      }
    `, 'SDL-E006');
  });

  it('should detect duplicate across types (variable vs assumption)', () => {
    expectError(`
      scenario "Test" {
        timeframe: 2025 -> 2030
        variable x {
          2025: 100
          uncertainty: normal(±5%)
        }
        assumption x {
          value: 0.5
          source: "Test"
        }
      }
    `, 'SDL-E006');
  });
});

// ============================================================
// 4. Undefined References
// ============================================================

describe('Validator — Undefined References', () => {
  it('should detect undefined depends_on', () => {
    expectError(`
      scenario "Test" {
        timeframe: 2025 -> 2030
        variable x {
          2025: 100
          depends_on: nonexistent
          uncertainty: normal(±5%)
        }
      }
    `, 'SDL-E005');
  });

  it('should detect undefined impact derives_from', () => {
    expectError(`
      scenario "Test" {
        timeframe: 2025 -> 2030
        impact y {
          derives_from: ghost
          formula: ghost * 2
        }
      }
    `, 'SDL-E005');
  });

  it('should accept valid references', () => {
    expectValid(`
      scenario "Test" {
        timeframe: 2025 -> 2030
        assumption a {
          value: 0.5
          source: "Test"
          uncertainty: normal(±10%)
        }
        variable x {
          2025: 100
          depends_on: a
          uncertainty: normal(±5%)
        }
      }
    `);
  });
});

// ============================================================
// 5. Causal Graph & Cycles
// ============================================================

describe('Validator — Causal Graph', () => {
  it('should build a correct causal graph', () => {
    const result = expectValid(`
      scenario "Test" {
        timeframe: 2025 -> 2030
        assumption a {
          value: 1
          source: "Test"
          uncertainty: beta(2, 5)
        }
        variable x {
          2025: 100
          depends_on: a
          uncertainty: normal(±10%)
        }
        variable y {
          2025: 50
          depends_on: x
          uncertainty: normal(±5%)
        }
      }
    `);

    assert.ok(result.causalGraph);
    assert.equal(result.causalGraph.nodes.length, 3);
    assert.equal(result.causalGraph.edges.length, 2);

    // Topological order should place 'a' before 'x', and 'x' before 'y'
    const order = result.causalGraph.topologicalOrder;
    assert.ok(order.indexOf('a') < order.indexOf('x'));
    assert.ok(order.indexOf('x') < order.indexOf('y'));
  });

  it('should detect cyclic dependencies', () => {
    expectError(`
      scenario "Test" {
        timeframe: 2025 -> 2030
        variable x {
          2025: 100
          depends_on: y
          uncertainty: normal(±5%)
        }
        variable y {
          2025: 50
          depends_on: x
          uncertainty: normal(±5%)
        }
      }
    `, 'SDL-E004');
  });
});

// ============================================================
// 6. Variable-specific Validation
// ============================================================

describe('Validator — Variable Validation', () => {
  it('should warn when uncertainty is missing', () => {
    expectWarning(`
      scenario "Test" {
        timeframe: 2025 -> 2030
        variable x {
          2025: 100
          2030: 200
        }
      }
    `, 'SDL-W002');
  });

  it('should error on non-chronological timeseries', () => {
    expectError(`
      scenario "Test" {
        timeframe: 2025 -> 2030
        variable x {
          2030: 200
          2025: 100
          uncertainty: normal(±5%)
        }
      }
    `, 'SDL-E008');
  });
});

// ============================================================
// 7. Assumption Validation
// ============================================================

describe('Validator — Assumption Validation', () => {
  it('should warn when source is missing', () => {
    expectWarning(`
      scenario "Test" {
        timeframe: 2025 -> 2030
        assumption a {
          value: 0.5
        }
      }
    `, 'SDL-W001');
  });

  it('should error on invalid confidence', () => {
    expectError(`
      scenario "Test" {
        timeframe: 2025 -> 2030
        assumption a {
          value: 0.5
          source: "Test"
          confidence: 2.0
        }
      }
    `, 'SDL-E003');
  });
});

// ============================================================
// 8. Parameter Validation
// ============================================================

describe('Validator — Parameter Validation', () => {
  it('should error when range min >= max', () => {
    expectError(`
      scenario "Test" {
        timeframe: 2025 -> 2030
        parameter k {
          value: 0.5
          range: [1.0, 0.1]
        }
      }
    `, 'SDL-E003');
  });
});

// ============================================================
// 9. Branch Validation
// ============================================================

describe('Validator — Branch Validation', () => {
  it('should error on invalid probability', () => {
    expectError(`
      scenario "Test" {
        timeframe: 2025 -> 2030
        variable x {
          2025: 100
          uncertainty: normal(±5%)
        }
        branch "Bad" when x > 50 {
          probability: 1.5
        }
      }
    `, 'SDL-E003');
  });
});

// ============================================================
// 10. Simulate Validation
// ============================================================

describe('Validator — Simulate Validation', () => {
  it('should error on zero runs', () => {
    expectError(`
      scenario "Test" {
        timeframe: 2025 -> 2030
        simulate {
          runs: 0
        }
      }
    `, 'SDL-E003');
  });

  it('should warn on high convergence threshold', () => {
    expectWarning(`
      scenario "Test" {
        timeframe: 2025 -> 2030
        simulate {
          runs: 1000
          convergence: 0.5
        }
      }
    `, 'SDL-W003');
  });
});

// ============================================================
// 11. Distribution Validation
// ============================================================

describe('Validator — Distribution Validation', () => {
  it('should error on uniform min >= max', () => {
    expectError(`
      scenario "Test" {
        timeframe: 2025 -> 2030
        variable x {
          2025: 100
          2030: 200
          uncertainty: uniform(1.5, 0.5)
        }
      }
    `, 'SDL-E007');
  });

  it('should error on beta with non-positive alpha', () => {
    expectError(`
      scenario "Test" {
        timeframe: 2025 -> 2030
        variable x {
          2025: 50
          2030: 100
          uncertainty: beta(0, 5)
        }
      }
    `, 'SDL-E007');
  });

  it('should error on triangular with min > mode', () => {
    expectError(`
      scenario "Test" {
        timeframe: 2025 -> 2030
        variable x {
          2025: 50
          2030: 100
          uncertainty: triangular(60, 50, 90)
        }
      }
    `, 'SDL-E007');
  });
});
