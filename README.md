# SDL — Scenario Description Language

**A formal, executable language for describing, simulating, and monitoring future scenarios.**

> From CERN came the Web to share the knowledge of the present.  
> From those who met at CERN comes the language to share the knowledge of the future.

---

## What is SDL?

SDL (Scenario Description Language) is a new computational language designed for **futures thinking**. Unlike traditional foresight methods that produce static narratives in slide decks and PDFs, SDL scenarios are executable — they can be parsed, simulated, connected to real data, and compiled from natural language.

SDL makes computational foresight accessible to everyone: policy makers, researchers, educators, activists, and citizens.

## Why SDL?

| Today | With SDL |
|-------|----------|
| Scenarios are written in PowerPoint | Scenarios are executable code |
| 3 qualitative scenarios (best/base/worst) | 10,000 quantitative Monte Carlo runs |
| Assumptions are implicit | Assumptions are explicit and verifiable |
| Models are static documents | Models self-validate against live data |
| Foresight is for consultants | Foresight is for everyone |

## Quick Start

```sdl
scenario "My First Scenario" {
  timeframe: 2025 -> 2035
  resolution: yearly

  assumption growth_rate {
    value: 3.5%
    uncertainty: normal(±20%)
    source: "World Bank, 2024"
  }

  variable population {
    2025: 60M
    2035: 65M
    depends_on: growth_rate
    model: exponential(rate=0.005, base=60000000)
    uncertainty: normal(±5%)
  }

  impact population_change {
    formula: population - 60000000
  }

  simulate {
    runs: 1000
    method: monte_carlo
    output: distribution
    percentiles: [5, 25, 50, 75, 95]
  }
}
```

## Architecture

SDL is composed of four modules:

```
┌─────────────────────────────────────────────────┐
│                  SDL Platform                    │
├──────────┬──────────┬──────────┬────────────────┤
│ SDL Core │SDL Engine│SDL Pulse │  SDL Natural   │
│          │          │          │                │
│ • Spec   │ • Monte  │ • Data   │ • NL → SDL    │
│ • Lexer  │   Carlo  │   Bind   │ • SDL → NL    │
│ • Parser │ • Causal │ • Watch  │ • Mutation     │
│ • Valid. │   Graph  │ • Calib. │ • Interpret    │
│ • Types  │ • WASM*  │ • Alert  │ • Ground       │
└──────────┴──────────┴──────────┴────────────────┘
```

### SDL Core (this package)
The language specification, lexer, parser, and validator. Open source.

### SDL Engine (this package)
Monte Carlo simulation engine with uncertainty propagation through causal graphs.

### SDL Pulse (coming soon)
Live data binding, watchdog monitoring, and Bayesian calibration.

### SDL Natural (coming soon)
LLM-powered compilation between natural language and SDL.

## Usage

### Parse an SDL file

```typescript
import { parse, validate } from '@relatronica/sdl';

const source = `
  scenario "Test" {
    timeframe: 2025 -> 2030
    variable x {
      2025: 100
      2030: 200
      uncertainty: normal(±10%)
    }
    simulate { runs: 1000 }
  }
`;

const { ast, diagnostics } = parse(source);

if (ast) {
  const validation = validate(ast);
  console.log('Valid:', validation.valid);
  console.log('Causal graph:', validation.causalGraph);
}
```

### Run a simulation

```typescript
import { parse, simulate } from '@relatronica/sdl';

const { ast } = parse(source);

if (ast) {
  const results = simulate(ast, {
    runs: 5000,
    seed: 42,
    onProgress: (p) => {
      console.log(`${p.completedRuns}/${p.totalRuns} runs`);
    },
  });

  for (const [name, variable] of results.variables) {
    const lastStep = variable.timeseries[variable.timeseries.length - 1];
    console.log(`${name} in ${lastStep.date.getFullYear()}:`);
    console.log(`  Mean: ${lastStep.distribution.mean.toFixed(2)}`);
    console.log(`  P5-P95: ${lastStep.distribution.percentiles.get(5)?.toFixed(2)} — ${lastStep.distribution.percentiles.get(95)?.toFixed(2)}`);
  }
}
```

## Language Features

### Uncertainty-Native
Every value can carry a probability distribution. SDL supports normal, uniform, beta, triangular, lognormal, and custom distributions.

### Causal Graphs
Variables declare dependencies explicitly. The engine resolves the directed acyclic graph and propagates uncertainty in the correct order.

### Temporal Semantics
Time is a first-class citizen. Timeseries support linear, step, and spline interpolation with configurable resolution (yearly, monthly, weekly, daily).

### Branching Scenarios
Conditional branches create alternative trajectories. When conditions are met during simulation, the engine forks and explores both paths.

### Live Data Binding
Assumptions can bind to real-world API data sources, enabling scenarios that self-validate and self-update.

### Bayesian Calibration
Uncertainty distributions automatically narrow as historical data accumulates, making simulations more precise over time.

### Composability
Scenarios can import and compose with other scenarios, enabling modular foresight — an energy scenario combined with a demographic scenario.

## Examples

See the [`examples/`](./examples/) directory:

| Example | Domain | Complexity | Key SDL Features |
|---------|--------|------------|-----------------|
| **[`green-transition-italy.sdl`](./examples/green-transition-italy.sdl)** | Energy / Climate | High | `bind`, `watch`, `calibrate`, spline interpolation |
| **[`ai-governance-2030.sdl`](./examples/ai-governance-2030.sdl)** | Tech / Governance | High | Multi-bloc geopolitics, `beta` distributions |
| **[`digital-euro-adoption.sdl`](./examples/digital-euro-adoption.sdl)** | Finance / CBDC | Low | Great first read, compact scenario, `logistic` model |
| **[`demographic-winter-europe.sdl`](./examples/demographic-winter-europe.sdl)** | Demographics | Medium | `import`/`compose`, `triangular` distribution, 35-year horizon |
| **[`water-scarcity-mediterranean.sdl`](./examples/water-scarcity-mediterranean.sdl)** | Climate / Resources | High | Multiple `bind` + `calibrate`, `watch` with thresholds |
| **[`pandemic-preparedness-2035.sdl`](./examples/pandemic-preparedness-2035.sdl)** | Health / Biosecurity | Medium | `lognormal` for fat-tailed risks, low confidence |
| **[`african-urban-leapfrog-2050.sdl`](./examples/african-urban-leapfrog-2050.sdl)** | Urbanization | Medium | `latin_hypercube` sampling, exponential growth |
| **[`eu-defense-autonomy-2035.sdl`](./examples/eu-defense-autonomy-2035.sdl)** | Geopolitics / Defense | Medium | Very low confidence (0.25), many external assumptions |
| **[`ai-energy-demand-2035.sdl`](./examples/ai-energy-demand-2035.sdl)** | AI / Energy / Climate | High | `bind` + `watch` + `calibrate`, `lognormal` compute growth |
| **[`ai-drug-discovery-2040.sdl`](./examples/ai-drug-discovery-2040.sdl)** | AI / Health / Pharma | High | `lognormal` for breakthroughs, `beta` for accuracy rates |
| **[`autonomous-mobility-2040.sdl`](./examples/autonomous-mobility-2040.sdl)** | AI / Mobility / Urban | Medium | `logistic` adoption curves, `calibrate`, 20-year horizon |

## Specification

The full formal specification is available at [`spec/SDL-SPEC-v0.1.md`](./spec/SDL-SPEC-v0.1.md).

## Roadmap

### v0.1 (current)
- [x] Language specification
- [x] Lexer / Tokenizer
- [x] Recursive descent parser
- [x] Semantic validator with causal graph
- [x] Monte Carlo simulation engine
- [x] Distribution sampling (normal, uniform, beta, triangular, lognormal)
- [x] Branch evaluation
- [x] Convergence detection

### v0.2
- [ ] SDL Pulse: data binding to HTTP/JSON APIs
- [ ] SDL Pulse: watchdog monitoring and alerting
- [ ] SDL Pulse: Bayesian calibration
- [ ] WebAssembly engine for browser execution
- [ ] Sensitivity analysis

### v0.3
- [ ] SDL Natural: NL → SDL compilation
- [ ] SDL Natural: SDL → NL narration
- [ ] SDL Natural: conversational scenario refinement
- [ ] SDL Natural: simulation result interpretation
- [ ] Visual editor (web-based)

### v0.4
- [ ] SDL Registry: public scenario repository
- [ ] Scenario diff / merge / fork
- [ ] Collaborative editing
- [ ] Accuracy tracking and leaderboards

## License

GPL-3.0 — Created by [Relatronica](https://relatronica.com)

*Imagining possible futures and building tools to navigate them.*
