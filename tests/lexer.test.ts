/**
 * SDL Lexer Tests
 *
 * Tests the tokenizer against all SDL token types:
 * keywords, literals, operators, punctuation, comments.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { tokenize } from '../core/lexer';
import { TokenType } from '../core/types';

// ── Helper ──

function tokenTypes(source: string): TokenType[] {
  const { tokens } = tokenize(source);
  return tokens.map(t => t.type).filter(t => t !== TokenType.EOF);
}

// ============================================================
// 1. Keywords
// ============================================================

describe('Lexer — Keywords', () => {
  it('should tokenize top-level keywords', () => {
    const types = tokenTypes('scenario variable assumption parameter branch impact simulate');
    assert.deepStrictEqual(types, [
      TokenType.Scenario, TokenType.Variable, TokenType.Assumption,
      TokenType.Parameter, TokenType.Branch, TokenType.Impact, TokenType.Simulate,
    ]);
  });

  it('should tokenize secondary keywords', () => {
    const types = tokenTypes('watch calibrate bind import export as when if else');
    assert.deepStrictEqual(types, [
      TokenType.Watch, TokenType.Calibrate, TokenType.Bind,
      TokenType.Import, TokenType.Export, TokenType.As,
      TokenType.When, TokenType.If, TokenType.Else,
    ]);
  });

  it('should tokenize logical keywords', () => {
    const types = tokenTypes('and or not');
    assert.deepStrictEqual(types, [
      TokenType.And, TokenType.Or, TokenType.Not,
    ]);
  });

  it('should tokenize distribution keywords', () => {
    const types = tokenTypes('normal uniform beta triangular lognormal custom');
    assert.deepStrictEqual(types, [
      TokenType.Normal, TokenType.Uniform, TokenType.Beta,
      TokenType.Triangular, TokenType.Lognormal, TokenType.Custom,
    ]);
  });

  it('should tokenize model keywords', () => {
    const types = tokenTypes('linear logistic exponential sigmoid polynomial');
    assert.deepStrictEqual(types, [
      TokenType.Linear, TokenType.Logistic, TokenType.Exponential,
      TokenType.Sigmoid, TokenType.Polynomial,
    ]);
  });

  it('should tokenize resolution keywords', () => {
    const types = tokenTypes('yearly monthly weekly daily');
    assert.deepStrictEqual(types, [
      TokenType.Yearly, TokenType.Monthly, TokenType.Weekly, TokenType.Daily,
    ]);
  });

  it('should tokenize property keywords', () => {
    const types = tokenTypes('timeframe resolution confidence author version description tags');
    assert.deepStrictEqual(types, [
      TokenType.Timeframe, TokenType.Resolution, TokenType.Confidence,
      TokenType.Author, TokenType.Version, TokenType.Description, TokenType.Tags,
    ]);
  });

  it('should tokenize snake_case keywords', () => {
    const types = tokenTypes('depends_on monte_carlo latin_hypercube on_trigger derives_from');
    assert.deepStrictEqual(types, [
      TokenType.DependsOn, TokenType.MonteCarlo, TokenType.LatinHypercube,
      TokenType.OnTrigger, TokenType.DerivesFrom,
    ]);
  });
});

// ============================================================
// 2. Literals
// ============================================================

describe('Lexer — Number Literals', () => {
  it('should tokenize integers', () => {
    const { tokens } = tokenize('42');
    assert.equal(tokens[0].type, TokenType.Number);
    assert.equal(tokens[0].value, '42');
  });

  it('should tokenize decimals', () => {
    const { tokens } = tokenize('3.14');
    assert.equal(tokens[0].type, TokenType.Number);
    assert.equal(tokens[0].value, '3.14');
  });

  it('should tokenize zero', () => {
    const { tokens } = tokenize('0');
    assert.equal(tokens[0].type, TokenType.Number);
    assert.equal(tokens[0].value, '0');
  });
});

describe('Lexer — Percentage Literals', () => {
  it('should tokenize integer percentages', () => {
    const { tokens } = tokenize('50%');
    assert.equal(tokens[0].type, TokenType.Percentage);
    assert.equal(tokens[0].value, '50%');
  });

  it('should tokenize decimal percentages', () => {
    const { tokens } = tokenize('0.2%');
    assert.equal(tokens[0].type, TokenType.Percentage);
    assert.equal(tokens[0].value, '0.2%');
  });
});

describe('Lexer — Currency Literals', () => {
  it('should tokenize currency with space', () => {
    const { tokens } = tokenize('3000 EUR');
    assert.equal(tokens[0].type, TokenType.Currency);
    assert.equal(tokens[0].value, '3000 EUR');
  });

  it('should tokenize currency with magnitude', () => {
    const { tokens } = tokenize('5M EUR');
    assert.equal(tokens[0].type, TokenType.Currency);
    assert.equal(tokens[0].value, '5M EUR');
  });

  it('should tokenize different currencies', () => {
    for (const curr of ['USD', 'GBP', 'CHF', 'JPY', 'CNY']) {
      const { tokens } = tokenize(`100 ${curr}`);
      assert.equal(tokens[0].type, TokenType.Currency);
    }
  });
});

describe('Lexer — String Literals', () => {
  it('should tokenize simple strings', () => {
    const { tokens } = tokenize('"hello world"');
    assert.equal(tokens[0].type, TokenType.String);
    assert.equal(tokens[0].value, 'hello world');
  });

  it('should handle escape sequences', () => {
    const { tokens } = tokenize('"line1\\nline2"');
    assert.equal(tokens[0].value, 'line1\nline2');
  });

  it('should handle escaped quotes', () => {
    const { tokens } = tokenize('"say \\"hello\\""');
    assert.equal(tokens[0].value, 'say "hello"');
  });

  it('should report unterminated strings', () => {
    const { diagnostics } = tokenize('"unterminated');
    assert.ok(diagnostics.length > 0);
    assert.equal(diagnostics[0].code, 'SDL-E001');
  });
});

describe('Lexer — Boolean Literals', () => {
  it('should tokenize true', () => {
    const { tokens } = tokenize('true');
    assert.equal(tokens[0].type, TokenType.True);
  });

  it('should tokenize false', () => {
    const { tokens } = tokenize('false');
    assert.equal(tokens[0].type, TokenType.False);
  });
});

describe('Lexer — Date Literals', () => {
  it('should tokenize year-month dates', () => {
    const { tokens } = tokenize('2025-01');
    assert.equal(tokens[0].type, TokenType.Date);
    assert.equal(tokens[0].value, '2025-01');
  });

  it('should tokenize full dates', () => {
    const { tokens } = tokenize('2025-06-15');
    assert.equal(tokens[0].type, TokenType.Date);
    assert.equal(tokens[0].value, '2025-06-15');
  });

  it('should tokenize plain year as number', () => {
    const { tokens } = tokenize('2025');
    assert.equal(tokens[0].type, TokenType.Number);
    assert.equal(tokens[0].value, '2025');
  });
});

describe('Lexer — Duration Literals', () => {
  it('should tokenize durations', () => {
    for (const [input, expected] of [['20s', '20s'], ['5y', '5y'], ['3m', '3m'], ['2w', '2w'], ['7d', '7d']]) {
      const { tokens } = tokenize(input);
      assert.equal(tokens[0].type, TokenType.Duration);
      assert.equal(tokens[0].value, expected);
    }
  });
});

// ============================================================
// 3. Operators & Punctuation
// ============================================================

describe('Lexer — Operators', () => {
  it('should tokenize arithmetic operators', () => {
    const types = tokenTypes('+ - * / ^ %');
    assert.deepStrictEqual(types, [
      TokenType.Plus, TokenType.Minus, TokenType.Star,
      TokenType.Slash, TokenType.Caret, TokenType.Percent,
    ]);
  });

  it('should tokenize comparison operators', () => {
    const types = tokenTypes('> < >= <= == !=');
    assert.deepStrictEqual(types, [
      TokenType.GreaterThan, TokenType.LessThan,
      TokenType.GreaterEqual, TokenType.LessEqual,
      TokenType.EqualEqual, TokenType.NotEqual,
    ]);
  });

  it('should tokenize assignment operator', () => {
    const types = tokenTypes('=');
    assert.deepStrictEqual(types, [TokenType.Equal]);
  });

  it('should tokenize arrow operator', () => {
    const types = tokenTypes('->');
    assert.deepStrictEqual(types, [TokenType.Arrow]);
  });

  it('should tokenize plus-minus operator', () => {
    const types = tokenTypes('±');
    assert.deepStrictEqual(types, [TokenType.PlusMinus]);
  });
});

describe('Lexer — Punctuation', () => {
  it('should tokenize all punctuation', () => {
    const types = tokenTypes('{ } [ ] ( ) : , .');
    assert.deepStrictEqual(types, [
      TokenType.LeftBrace, TokenType.RightBrace,
      TokenType.LeftBracket, TokenType.RightBracket,
      TokenType.LeftParen, TokenType.RightParen,
      TokenType.Colon, TokenType.Comma, TokenType.Dot,
    ]);
  });
});

// ============================================================
// 4. Comments & Whitespace
// ============================================================

describe('Lexer — Comments', () => {
  it('should skip single-line comments', () => {
    const types = tokenTypes('variable // this is a comment\nassumption');
    assert.deepStrictEqual(types, [TokenType.Variable, TokenType.Assumption]);
  });

  it('should skip multi-line comments', () => {
    const types = tokenTypes('variable /* block\ncomment */ assumption');
    assert.deepStrictEqual(types, [TokenType.Variable, TokenType.Assumption]);
  });
});

describe('Lexer — Whitespace', () => {
  it('should handle empty input', () => {
    const { tokens } = tokenize('');
    assert.equal(tokens.length, 1);
    assert.equal(tokens[0].type, TokenType.EOF);
  });

  it('should handle whitespace-only input', () => {
    const { tokens } = tokenize('   \n\t\n   ');
    assert.equal(tokens.length, 1);
    assert.equal(tokens[0].type, TokenType.EOF);
  });
});

// ============================================================
// 5. Identifiers
// ============================================================

describe('Lexer — Identifiers', () => {
  it('should tokenize simple identifiers', () => {
    const { tokens } = tokenize('my_variable');
    assert.equal(tokens[0].type, TokenType.Identifier);
    assert.equal(tokens[0].value, 'my_variable');
  });

  it('should tokenize identifiers with digits', () => {
    const { tokens } = tokenize('var2025');
    assert.equal(tokens[0].type, TokenType.Identifier);
    assert.equal(tokens[0].value, 'var2025');
  });

  it('should distinguish identifiers from keywords', () => {
    const { tokens } = tokenize('scenario myScenario');
    assert.equal(tokens[0].type, TokenType.Scenario);
    assert.equal(tokens[1].type, TokenType.Identifier);
  });
});

// ============================================================
// 6. Source Locations
// ============================================================

describe('Lexer — Source Locations', () => {
  it('should track line and column numbers', () => {
    const { tokens } = tokenize('scenario\n  variable');
    assert.equal(tokens[0].span.start.line, 1);
    assert.equal(tokens[0].span.start.column, 1);
    assert.equal(tokens[1].span.start.line, 2);
    assert.equal(tokens[1].span.start.column, 3);
  });
});

// ============================================================
// 7. Error handling
// ============================================================

describe('Lexer — Error Handling', () => {
  it('should report unexpected characters', () => {
    const { diagnostics } = tokenize('§');
    assert.ok(diagnostics.length > 0);
    assert.equal(diagnostics[0].severity, 'error');
  });
});

// ============================================================
// 8. Realistic SDL fragments
// ============================================================

describe('Lexer — SDL Fragments', () => {
  it('should tokenize a scenario header', () => {
    const source = 'scenario "Test" {';
    const types = tokenTypes(source);
    assert.deepStrictEqual(types, [
      TokenType.Scenario, TokenType.String, TokenType.LeftBrace,
    ]);
  });

  it('should tokenize a timeframe declaration', () => {
    const source = 'timeframe: 2025 -> 2050';
    const types = tokenTypes(source);
    assert.deepStrictEqual(types, [
      TokenType.Timeframe, TokenType.Colon,
      TokenType.Number, TokenType.Arrow, TokenType.Number,
    ]);
  });

  it('should tokenize a variable entry with percentage', () => {
    const source = '2030: 45%';
    const types = tokenTypes(source);
    assert.deepStrictEqual(types, [
      TokenType.Number, TokenType.Colon, TokenType.Percentage,
    ]);
  });

  it('should tokenize a model expression', () => {
    const source = 'model: logistic(k=0.8, midpoint=2029, max=75)';
    const types = tokenTypes(source);
    assert.deepStrictEqual(types, [
      TokenType.Model, TokenType.Colon,
      TokenType.Logistic, TokenType.LeftParen,
      TokenType.Identifier, TokenType.Equal, TokenType.Number, TokenType.Comma,
      TokenType.Identifier, TokenType.Equal, TokenType.Number, TokenType.Comma,
      TokenType.Identifier, TokenType.Equal, TokenType.Number,
      TokenType.RightParen,
    ]);
  });

  it('should tokenize a branch condition', () => {
    const source = 'branch "Test" when x > 50% and y < 100 {';
    const types = tokenTypes(source);
    assert.deepStrictEqual(types, [
      TokenType.Branch, TokenType.String, TokenType.When,
      TokenType.Identifier, TokenType.GreaterThan, TokenType.Percentage,
      TokenType.And,
      TokenType.Identifier, TokenType.LessThan, TokenType.Number,
      TokenType.LeftBrace,
    ]);
  });
});
