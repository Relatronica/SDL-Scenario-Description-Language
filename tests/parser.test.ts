/**
 * SDL Parser Tests
 *
 * Tests the recursive descent parser against all SDL constructs,
 * verifying correct AST generation and error handling.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parse } from '../core/parser';

// ── Helper ──

function parseOk(source: string) {
  const result = parse(source);
  const errors = result.diagnostics.filter(d => d.severity === 'error');
  assert.equal(errors.length, 0, `Unexpected errors: ${errors.map(e => e.message).join(', ')}`);
  assert.ok(result.ast, 'Expected non-null AST');
  return result.ast;
}

function parseError(source: string) {
  const result = parse(source);
  const errors = result.diagnostics.filter(d => d.severity === 'error');
  assert.ok(errors.length > 0, 'Expected parse errors but got none');
  return errors;
}

// ============================================================
// 1. Scenario
// ============================================================

describe('Parser — Scenario', () => {
  it('should parse a minimal scenario', () => {
    const ast = parseOk('scenario "Test" {}');
    assert.equal(ast.type, 'Scenario');
    assert.equal(ast.name, 'Test');
    assert.equal(ast.declarations.length, 0);
  });

  it('should parse scenario metadata', () => {
    const ast = parseOk(`
      scenario "Test" {
        timeframe: 2025 -> 2050
        resolution: yearly
        confidence: 0.8
        author: "Relatronica"
        version: "1.0"
        description: "Test scenario"
        tags: ["a", "b", "c"]
      }
    `);
    assert.equal(ast.metadata.timeframe?.start.year, 2025);
    assert.equal(ast.metadata.timeframe?.end.year, 2050);
    assert.equal(ast.metadata.resolution, 'yearly');
    assert.equal(ast.metadata.confidence, 0.8);
    assert.equal(ast.metadata.author, 'Relatronica');
    assert.equal(ast.metadata.version, '1.0');
    assert.equal(ast.metadata.description, 'Test scenario');
    assert.deepStrictEqual(ast.metadata.tags, ['a', 'b', 'c']);
  });

  it('should parse scenario with date-format timeframe', () => {
    const ast = parseOk(`
      scenario "Test" {
        timeframe: 2025-01 -> 2050-12
      }
    `);
    assert.equal(ast.metadata.timeframe?.start.year, 2025);
    assert.equal(ast.metadata.timeframe?.start.month, 1);
    assert.equal(ast.metadata.timeframe?.end.year, 2050);
    assert.equal(ast.metadata.timeframe?.end.month, 12);
  });

  it('should fail on missing scenario name', () => {
    parseError('scenario {}');
  });

  it('should fail on missing opening brace', () => {
    parseError('scenario "Test"');
  });
});

// ============================================================
// 2. Variable
// ============================================================

describe('Parser — Variable', () => {
  it('should parse a minimal variable', () => {
    const ast = parseOk(`
      scenario "S" {
        variable test {
          2025: 100
          2030: 200
        }
      }
    `);
    const v = ast.declarations[0];
    assert.equal(v.type, 'Variable');
    if (v.type === 'Variable') {
      assert.equal(v.name, 'test');
      assert.equal(v.timeseries.length, 2);
      assert.equal(v.timeseries[0].date.year, 2025);
    }
  });

  it('should parse variable with all properties', () => {
    const ast = parseOk(`
      scenario "S" {
        variable adoption {
          description: "Test variable"
          unit: "%"
          2025: 0%
          2030: 50%
          depends_on: x, y
          model: logistic(k=0.5, midpoint=2028, max=100)
          uncertainty: normal(±10%)
          interpolation: spline
        }
      }
    `);
    const v = ast.declarations[0];
    assert.equal(v.type, 'Variable');
    if (v.type === 'Variable') {
      assert.equal(v.description, 'Test variable');
      assert.equal(v.unit, '%');
      assert.deepStrictEqual(v.dependsOn, ['x', 'y']);
      assert.ok(v.model);
      assert.equal(v.model.model, 'logistic');
      assert.ok(v.uncertainty);
      assert.equal(v.uncertainty.distribution, 'normal');
      assert.equal(v.interpolation, 'spline');
    }
  });

  it('should parse variable with percentage values', () => {
    const ast = parseOk(`
      scenario "S" {
        variable x {
          2025: 0%
          2026: 25%
          2027: 50.5%
        }
      }
    `);
    const v = ast.declarations[0];
    if (v.type === 'Variable') {
      assert.equal(v.timeseries.length, 3);
    }
  });
});

// ============================================================
// 3. Assumption
// ============================================================

describe('Parser — Assumption', () => {
  it('should parse a minimal assumption', () => {
    const ast = parseOk(`
      scenario "S" {
        assumption test {
          value: 0.85
        }
      }
    `);
    const a = ast.declarations[0];
    assert.equal(a.type, 'Assumption');
    if (a.type === 'Assumption') {
      assert.equal(a.name, 'test');
    }
  });

  it('should parse assumption with all properties', () => {
    const ast = parseOk(`
      scenario "S" {
        assumption rate {
          value: 0.7
          source: "ECB report 2025"
          confidence: 0.8
          uncertainty: beta(5, 3)
        }
      }
    `);
    const a = ast.declarations[0];
    if (a.type === 'Assumption') {
      assert.equal(a.source, 'ECB report 2025');
      assert.equal(a.confidence, 0.8);
      assert.ok(a.uncertainty);
      assert.equal(a.uncertainty.distribution, 'beta');
    }
  });

  it('should parse assumption with currency value', () => {
    const ast = parseOk(`
      scenario "S" {
        assumption budget {
          value: 3000 EUR
          source: "Test"
        }
      }
    `);
    const a = ast.declarations[0];
    if (a.type === 'Assumption') {
      assert.ok(a.value);
      assert.equal(a.value.type, 'CurrencyLiteral');
    }
  });
});

// ============================================================
// 4. Parameter
// ============================================================

describe('Parser — Parameter', () => {
  it('should parse a parameter with value and range', () => {
    const ast = parseOk(`
      scenario "S" {
        parameter k {
          value: 0.5
          range: [0.1, 1.0]
          description: "Growth rate"
        }
      }
    `);
    const p = ast.declarations[0];
    assert.equal(p.type, 'Parameter');
    if (p.type === 'Parameter') {
      assert.equal(p.name, 'k');
      assert.ok(p.range);
      assert.equal(p.description, 'Growth rate');
    }
  });

  it('should parse parameter with percentage range', () => {
    const ast = parseOk(`
      scenario "S" {
        parameter fee {
          value: 0.2%
          range: [0%, 0.5%]
        }
      }
    `);
    const p = ast.declarations[0];
    if (p.type === 'Parameter') {
      assert.ok(p.value);
      assert.ok(p.range);
    }
  });
});

// ============================================================
// 5. Branch
// ============================================================

describe('Parser — Branch', () => {
  it('should parse a simple branch', () => {
    const ast = parseOk(`
      scenario "S" {
        variable x { 2025: 100 }
        branch "High Growth" when x > 50 {
          probability: 0.3
        }
      }
    `);
    const b = ast.declarations[1];
    assert.equal(b.type, 'Branch');
    if (b.type === 'Branch') {
      assert.equal(b.name, 'High Growth');
      assert.equal(b.probability, 0.3);
      assert.ok(b.condition);
    }
  });

  it('should parse branch with compound condition', () => {
    const ast = parseOk(`
      scenario "S" {
        variable x { 2025: 100 }
        variable y { 2025: 50 }
        branch "Complex" when x > 50 and y < 100 {
          probability: 0.25
        }
      }
    `);
    const b = ast.declarations[2];
    if (b.type === 'Branch') {
      assert.equal(b.condition.type, 'BinaryExpression');
    }
  });

  it('should parse branch with nested declarations', () => {
    const ast = parseOk(`
      scenario "S" {
        variable x { 2025: 0 }
        branch "Overwrite" when x > 10 {
          probability: 0.5
          variable x {
            2025: 100
            uncertainty: normal(±20%)
          }
        }
      }
    `);
    const b = ast.declarations[1];
    if (b.type === 'Branch') {
      assert.ok(b.declarations.length > 0);
      assert.equal(b.declarations[0].type, 'Variable');
    }
  });
});

// ============================================================
// 6. Impact
// ============================================================

describe('Parser — Impact', () => {
  it('should parse impact with formula', () => {
    const ast = parseOk(`
      scenario "S" {
        variable x { 2025: 10 }
        impact gdp_effect {
          description: "GDP effect"
          unit: "%"
          derives_from: x
          formula: x * 0.5
        }
      }
    `);
    const i = ast.declarations[1];
    assert.equal(i.type, 'Impact');
    if (i.type === 'Impact') {
      assert.equal(i.name, 'gdp_effect');
      assert.ok(i.formula);
      assert.deepStrictEqual(i.derivesFrom, ['x']);
    }
  });
});

// ============================================================
// 7. Simulate
// ============================================================

describe('Parser — Simulate', () => {
  it('should parse simulate block with all properties', () => {
    const ast = parseOk(`
      scenario "S" {
        simulate {
          runs: 5000
          method: monte_carlo
          seed: 2026
          output: distribution
          percentiles: [5, 25, 50, 75, 95]
          convergence: 0.02
          timeout: 20s
        }
      }
    `);
    const s = ast.declarations[0];
    assert.equal(s.type, 'Simulate');
    if (s.type === 'Simulate') {
      assert.equal(s.runs, 5000);
      assert.equal(s.method, 'monte_carlo');
      assert.equal(s.seed, 2026);
      assert.equal(s.output, 'distribution');
      assert.deepStrictEqual(s.percentiles, [5, 25, 50, 75, 95]);
      assert.equal(s.convergence, 0.02);
      assert.ok(s.timeout);
      assert.equal(s.timeout.amount, 20);
      assert.equal(s.timeout.unit, 's');
    }
  });

  it('should parse minimal simulate block', () => {
    const ast = parseOk(`
      scenario "S" {
        simulate {
          runs: 100
        }
      }
    `);
    const s = ast.declarations[0];
    if (s.type === 'Simulate') {
      assert.equal(s.runs, 100);
    }
  });
});

// ============================================================
// 8. Watch
// ============================================================

describe('Parser — Watch', () => {
  it('should parse watch with rules', () => {
    const ast = parseOk(`
      scenario "S" {
        variable x { 2025: 100 }
        watch x {
          warn when: x > 80
          error when: x > 95
        }
      }
    `);
    const w = ast.declarations[1];
    assert.equal(w.type, 'Watch');
    if (w.type === 'Watch') {
      assert.equal(w.target, 'x');
      assert.equal(w.rules.length, 2);
      assert.equal(w.rules[0].severity, 'warn');
      assert.equal(w.rules[1].severity, 'error');
    }
  });
});

// ============================================================
// 9. Calibrate
// ============================================================

describe('Parser — Calibrate', () => {
  it('should parse calibrate block', () => {
    const ast = parseOk(`
      scenario "S" {
        variable x { 2025: 100 }
        calibrate x {
          historical: "https://example.com/data"
          method: bayesian_update
          window: 5y
          prior: normal(100, 10)
          update_frequency: monthly
        }
      }
    `);
    const c = ast.declarations[1];
    assert.equal(c.type, 'Calibrate');
    if (c.type === 'Calibrate') {
      assert.equal(c.target, 'x');
      assert.equal(c.method, 'bayesian_update');
      assert.ok(c.window);
      assert.ok(c.prior);
      assert.equal(c.updateFrequency, 'monthly');
    }
  });
});

// ============================================================
// 10. Import
// ============================================================

describe('Parser — Import', () => {
  it('should parse import statement', () => {
    const ast = parseOk(`
      scenario "S" {
        import "other.sdl" as other
      }
    `);
    const i = ast.declarations[0];
    assert.equal(i.type, 'Import');
    if (i.type === 'Import') {
      assert.equal(i.path, 'other.sdl');
      assert.equal(i.alias, 'other');
    }
  });
});

// ============================================================
// 11. Expressions
// ============================================================

describe('Parser — Expressions', () => {
  it('should parse arithmetic expressions', () => {
    const ast = parseOk(`
      scenario "S" {
        variable x { 2025: 10 }
        impact y {
          derives_from: x
          formula: x * 2 + 1
        }
      }
    `);
    const i = ast.declarations[1];
    if (i.type === 'Impact') {
      assert.ok(i.formula);
      assert.equal(i.formula!.type, 'BinaryExpression');
    }
  });

  it('should parse unary minus', () => {
    const ast = parseOk(`
      scenario "S" {
        variable x { 2025: 10 }
        impact y {
          derives_from: x
          formula: -x
        }
      }
    `);
    const i = ast.declarations[1];
    if (i.type === 'Impact') {
      assert.equal(i.formula!.type, 'UnaryExpression');
    }
  });

  it('should parse function calls', () => {
    const ast = parseOk(`
      scenario "S" {
        variable x { 2025: 10 }
        impact y {
          derives_from: x
          formula: min(x, 100)
        }
      }
    `);
    const i = ast.declarations[1];
    if (i.type === 'Impact') {
      assert.equal(i.formula!.type, 'FunctionCall');
    }
  });

  it('should respect operator precedence', () => {
    const ast = parseOk(`
      scenario "S" {
        variable x { 2025: 10 }
        impact y {
          derives_from: x
          formula: x + 2 * 3
        }
      }
    `);
    const i = ast.declarations[1];
    if (i.type === 'Impact') {
      // Should be x + (2 * 3), not (x + 2) * 3
      assert.equal(i.formula!.type, 'BinaryExpression');
      if (i.formula!.type === 'BinaryExpression') {
        assert.equal(i.formula!.operator, '+');
        assert.equal(i.formula!.right.type, 'BinaryExpression');
      }
    }
  });
});

// ============================================================
// 12. Distribution Expressions
// ============================================================

describe('Parser — Distributions', () => {
  it('should parse normal distribution with ± shorthand', () => {
    const ast = parseOk(`
      scenario "S" {
        variable x {
          2025: 100
          uncertainty: normal(±10%)
        }
      }
    `);
    const v = ast.declarations[0];
    if (v.type === 'Variable') {
      assert.ok(v.uncertainty);
      assert.equal(v.uncertainty.distribution, 'normal');
    }
  });

  it('should parse beta distribution', () => {
    const ast = parseOk(`
      scenario "S" {
        assumption a {
          value: 0.5
          uncertainty: beta(2, 5)
        }
      }
    `);
    const a = ast.declarations[0];
    if (a.type === 'Assumption') {
      assert.ok(a.uncertainty);
      assert.equal(a.uncertainty.distribution, 'beta');
      assert.equal(a.uncertainty.params.length, 2);
    }
  });

  it('should parse uniform distribution', () => {
    const ast = parseOk(`
      scenario "S" {
        assumption a {
          value: 100
          uncertainty: uniform(0.8, 1.2)
        }
      }
    `);
    const a = ast.declarations[0];
    if (a.type === 'Assumption') {
      assert.equal(a.uncertainty!.distribution, 'uniform');
    }
  });

  it('should parse triangular distribution', () => {
    const ast = parseOk(`
      scenario "S" {
        assumption a {
          value: 50
          uncertainty: triangular(10, 50, 90)
        }
      }
    `);
    const a = ast.declarations[0];
    if (a.type === 'Assumption') {
      assert.equal(a.uncertainty!.distribution, 'triangular');
      assert.equal(a.uncertainty!.params.length, 3);
    }
  });

  it('should parse lognormal distribution', () => {
    const ast = parseOk(`
      scenario "S" {
        assumption a {
          value: 100
          uncertainty: lognormal(4.6, 0.5)
        }
      }
    `);
    const a = ast.declarations[0];
    if (a.type === 'Assumption') {
      assert.equal(a.uncertainty!.distribution, 'lognormal');
    }
  });
});

// ============================================================
// 13. Model Expressions
// ============================================================

describe('Parser — Models', () => {
  it('should parse logistic model', () => {
    const ast = parseOk(`
      scenario "S" {
        variable x {
          2025: 0
          model: logistic(k=0.5, midpoint=2030, max=100)
        }
      }
    `);
    const v = ast.declarations[0];
    if (v.type === 'Variable') {
      assert.ok(v.model);
      assert.equal(v.model.model, 'logistic');
      assert.equal(v.model.params.length, 3);
    }
  });

  it('should parse linear model', () => {
    const ast = parseOk(`
      scenario "S" {
        variable x {
          2025: 0
          model: linear(slope=5, intercept=100)
        }
      }
    `);
    const v = ast.declarations[0];
    if (v.type === 'Variable') {
      assert.equal(v.model!.model, 'linear');
    }
  });

  it('should parse exponential model', () => {
    const ast = parseOk(`
      scenario "S" {
        variable x {
          2025: 0
          model: exponential(rate=0.05, base=1)
        }
      }
    `);
    const v = ast.declarations[0];
    if (v.type === 'Variable') {
      assert.equal(v.model!.model, 'exponential');
    }
  });
});

// ============================================================
// 14. Error Recovery
// ============================================================

describe('Parser — Errors', () => {
  it('should fail on completely invalid input', () => {
    parseError('this is not valid SDL');
  });

  it('should fail on missing closing brace', () => {
    parseError('scenario "Test" {');
  });
});
