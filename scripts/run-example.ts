/**
 * SDL Runner — Parse, validate, and simulate an SDL file.
 *
 * Usage:
 *   npx tsx scripts/run-example.ts <file.sdl>
 *   npx tsx scripts/run-example.ts examples/ai-governance-2030.sdl
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from '../core/index';
import { validate } from '../core/validator';
import { simulate } from '../engine/monte-carlo';

// ── Parse CLI args ──

const filePath = process.argv[2];

if (!filePath) {
  console.error('Usage: npx tsx scripts/run-example.ts <file.sdl>');
  console.error('');
  console.error('Examples:');
  console.error('  npx tsx scripts/run-example.ts examples/ai-governance-2030.sdl');
  console.error('  npx tsx scripts/run-example.ts examples/green-transition-italy.sdl');
  process.exit(1);
}

const absolutePath = resolve(filePath);
let source: string;

try {
  source = readFileSync(absolutePath, 'utf-8');
} catch {
  console.error(`Error: Cannot read file "${filePath}"`);
  process.exit(1);
}

// ── Parse ──

console.log(`\n${'='.repeat(60)}`);
console.log(`  SDL Runner — ${filePath}`);
console.log(`${'='.repeat(60)}\n`);

console.log('[1/3] Parsing...');
const { ast, diagnostics: parseDiagnostics } = parse(source);

if (parseDiagnostics.length > 0) {
  console.log(`\n  Parse diagnostics (${parseDiagnostics.length}):`);
  for (const d of parseDiagnostics) {
    const loc = d.span?.start;
    const pos = loc ? ` (line ${loc.line}, col ${loc.column})` : '';
    console.log(`  ${d.severity === 'error' ? 'ERROR' : 'WARN'}${pos}: ${d.message}`);
  }
}

if (!ast) {
  console.error('\n  Parse failed. Cannot continue.\n');
  process.exit(1);
}

console.log(`  OK — Parsed scenario: "${ast.name}"`);
console.log(`  Declarations: ${ast.declarations.length}`);

// ── Validate ──

console.log('\n[2/3] Validating...');
const validation = validate(ast);

if (validation.diagnostics.length > 0) {
  console.log(`\n  Validation diagnostics (${validation.diagnostics.length}):`);
  for (const d of validation.diagnostics) {
    const severity = d.severity === 'error' ? 'ERROR' : d.severity === 'warning' ? 'WARN' : 'INFO';
    console.log(`  ${severity}: ${d.message}`);
    if (d.hint) console.log(`         hint: ${d.hint}`);
  }
}

if (validation.valid) {
  console.log('  OK — Scenario is valid');
} else {
  console.log('\n  Validation failed. Attempting simulation anyway...');
}

// Print causal graph
if (validation.causalGraph) {
  const { nodes, edges } = validation.causalGraph;
  console.log(`\n  Causal graph: ${nodes.length} nodes, ${edges.length} edges`);
  if (edges.length > 0 && edges.length <= 20) {
    for (const edge of edges) {
      console.log(`    ${edge.from} -> ${edge.to}`);
    }
  }
}

// ── Simulate ──

console.log('\n[3/3] Simulating...');

const startTime = performance.now();

try {
  const results = simulate(ast, {
    seed: 42,
    onProgress: (p) => {
      if (p.completedRuns % 200 === 0 || p.completedRuns === p.totalRuns) {
        const pct = ((p.completedRuns / p.totalRuns) * 100).toFixed(0);
        process.stdout.write(`\r  Progress: ${p.completedRuns}/${p.totalRuns} runs (${pct}%)`);
      }
    },
  });

  const elapsedMs = (performance.now() - startTime).toFixed(0);
  console.log(`\n  Completed in ${elapsedMs}ms\n`);

  // ── Print results ──

  console.log(`${'─'.repeat(60)}`);
  console.log('  SIMULATION RESULTS');
  console.log(`${'─'.repeat(60)}\n`);

  // Variables
  if (results.variables.size > 0) {
    console.log('  Variables:');
    console.log('');
    for (const [name, variable] of results.variables) {
      const ts = variable.timeseries;
      if (ts.length === 0) continue;

      const first = ts[0];
      const last = ts[ts.length - 1];
      const firstYear = first.date.getFullYear();
      const lastYear = last.date.getFullYear();

      console.log(`  ${name}`);
      console.log(`    ${firstYear}: mean=${fmt(first.distribution.mean)}, std=${fmt(first.distribution.std)}`);
      console.log(`    ${lastYear}: mean=${fmt(last.distribution.mean)}, std=${fmt(last.distribution.std)}`);

      if (last.distribution.percentiles.size > 0) {
        const pcts = Array.from(last.distribution.percentiles.entries())
          .sort((a, b) => a[0] - b[0])
          .map(([p, v]) => `P${p}=${fmt(v)}`)
          .join(', ');
        console.log(`    Percentiles (${lastYear}): ${pcts}`);
      }
      console.log('');
    }
  }

  // Impacts
  if (results.impacts.size > 0) {
    console.log('  Impacts:');
    console.log('');
    for (const [name, impact] of results.impacts) {
      const ts = impact.timeseries;
      if (ts.length === 0) continue;

      const last = ts[ts.length - 1];
      const year = last.date.getFullYear();

      console.log(`  ${name}`);
      console.log(`    ${year}: mean=${fmt(last.distribution.mean)}, std=${fmt(last.distribution.std)}`);
      console.log('');
    }
  }

  // Branches
  if (results.branches.size > 0) {
    console.log('  Branches:');
    console.log('');
    for (const [name, branch] of results.branches) {
      const prob = branch.triggerProbability != null
        ? `${(branch.triggerProbability * 100).toFixed(1)}%`
        : 'N/A';
      console.log(`  ${name}: trigger probability = ${prob}`);
    }
    console.log('');
  }

  console.log(`${'─'.repeat(60)}`);
  console.log(`  Scenario: "${results.scenarioName ?? ast.name}"`);
  console.log(`  Runs: ${results.totalRuns ?? 'N/A'} | Converged: ${results.converged ?? 'N/A'}`);
  console.log(`${'─'.repeat(60)}\n`);

} catch (err) {
  const elapsedMs = (performance.now() - startTime).toFixed(0);
  console.log(`\n  Simulation failed after ${elapsedMs}ms`);
  console.error(`  Error: ${err instanceof Error ? err.message : String(err)}`);
  if (err instanceof Error && err.stack) {
    console.error(`\n${err.stack}`);
  }
  process.exit(1);
}

// ── Helpers ──

function fmt(n: number): string {
  if (Math.abs(n) >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(2)}K`;
  if (Math.abs(n) < 0.01 && n !== 0) return n.toExponential(2);
  return n.toFixed(2);
}
