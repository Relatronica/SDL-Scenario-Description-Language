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
  subtitle: "An interactive demographic projection"
  category: societa
  icon: "👥"
  color: "#3b82f6"
  difficulty: base

  assumption growth_rate {
    value: 3.5%
    uncertainty: normal(±20%)
    source: "World Bank, 2024"

    bind {
      source: "https://api.worldbank.org/v2/country/ITA/indicator/SP.POP.GROW"
      refresh: yearly
      field: "value"
      fallback: 3.5
    }

    watch {
      warn  when: actual < assumed * 0.7
      error when: actual < assumed * 0.5
    }
  }

  parameter investment_level {
    label: "Investment Level"
    value: 50
    range: [10, 100]
    step: 5
    unit: "billion €"
    source: "World Bank estimates, 2024"
    format: "{value} bn €"
    control: slider
    description: "Annual investment in infrastructure"
  }

  variable population {
    label: "Population"
    icon: "👥"
    color: "#3b82f6"
    2025: 60M
    2035: 65M
    depends_on: growth_rate
    model: exponential(rate=0.005, base=60000000)
    uncertainty: normal(±5%)
  }

  impact population_change {
    label: "Population Change"
    icon: "📈"
    color: "#10b981"
    formula: population - 60000000
  }

  calibrate population {
    historical: "https://api.worldbank.org/v2/country/ITA/indicator/SP.POP.TOTL"
    method: bayesian_update
    window: 10y
    prior: normal(±5%)
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

### SDL Pulse (this package)
Live data binding, watchdog monitoring, and Bayesian calibration. Connects scenarios to real-world data via `bind`, monitors deviations with `watch`, and updates uncertainty distributions via `calibrate`.

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

### Connect to live data (Pulse)

```typescript
import { parse, validate } from '@relatronica/sdl';
import { loadPulseData, runCalibration, evaluateWatchRules } from '@relatronica/sdl/pulse';

const { ast } = parse(source);

if (ast) {
  const liveData = await loadPulseData(ast);

  // Calibrate uncertainty distributions with historical data
  const calibratedAst = liveData.calibratedAst ?? ast;

  // Check watch rules for deviations
  const alerts = evaluateWatchRules(ast, liveData);
  alerts.forEach(a => console.log(`[${a.level}] ${a.variable}: ${a.message}`));
}
```

### Run sensitivity analysis

```typescript
import { renderSDL, runSensitivityAnalysis } from '@relatronica/sdl';

const rendered = renderSDL(source, 'my-scenario');
const sensitivity = runSensitivityAnalysis(rendered, { runs: 1000 });

sensitivity.rankings.forEach(r => {
  console.log(`${r.parameter}: swing = ${r.swing.toFixed(2)}`);
});
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

### Live Data Binding (`bind`)
Assumptions can bind to real-world API data sources, enabling scenarios that self-validate and self-update. When historical data is available, it's overlaid on fan charts for visual validation.

```sdl
assumption carbon_tax {
  value: 85 EUR
  source: "EU ETS market price, Q1 2025"
  uncertainty: normal(±25%)

  bind {
    source: "https://api.worldbank.org/carbon-pricing/eu-ets"
    refresh: daily
    field: "price_per_ton_eur"
    fallback: 85
  }

  watch {
    warn  when: actual > assumed * 1.5
    error when: actual > assumed * 2.0
  }
}
```

### Watchdog Monitoring (`watch`)
Watch rules detect when real-world data deviates from scenario assumptions. Configurable `warn` and `error` thresholds trigger alerts in the UI, with optional `on_trigger` actions (recalculate, notify, suggest updates).

### Bayesian Calibration (`calibrate`)
Uncertainty distributions automatically narrow as historical data accumulates, making simulations more precise over time. Supports `bayesian_update`, `maximum_likelihood`, and `ensemble` methods.

```sdl
calibrate renewable_share {
  historical: "https://ec.europa.eu/eurostat/api/nrg_ind_ren"
  method: bayesian_update
  window: 5y
  prior: normal(±12%)
  update_frequency: monthly
}
```

### Sensitivity Analysis
Automatically measures which parameters most influence outputs. For each slider parameter, the engine runs simulations at extreme values and computes the output swing, producing tornado charts sorted by influence.

### Automated Narration
Generates human-readable Italian text summaries from simulation results, covering key trajectories, uncertainty levels, historical accuracy (when live data is available), and most influential parameters.

### Composability
Scenarios can import and compose with other scenarios, enabling modular foresight — an energy scenario combined with a demographic scenario.

### Interactive Controls (v0.1.1)
SDL scenarios are self-contained: a single `.sdl` file describes data, model, uncertainty, **and** how to present the scenario to users. Parameters declare interactive controls (sliders, toggles, dropdowns), while variables and impacts carry display hints (label, icon, color). Any viewer can render a full interactive UI from an SDL file alone.

#### Parameter as user control

```sdl
parameter carbon_tax {
  label: "Carbon Price (ETS)"
  value: 80
  range: [30, 200]
  step: 5
  unit: "€/tCO₂"
  source: "EU ETS average price 2024"
  format: "{value} €/t"
  control: slider
  description: "Price per ton of CO₂ in the EU Emissions Trading System"
}
```

#### Variable & impact display hints

```sdl
variable renewable_share {
  label: "Renewables Share"
  description: "Share of renewables in the energy mix"
  unit: "%"
  icon: "☀"
  color: "#10b981"
  // ... timeseries, model, uncertainty
}

impact net_employment {
  label: "Net Employment"
  unit: "thousands"
  icon: "⊕"
  color: "#3b82f6"
  derives_from: green_employment, fossil_employment
  formula: green_employment - fossil_employment
}
```

#### Scenario presentation metadata

```sdl
scenario "Green Transition" {
  // ... core metadata
  subtitle: "Renewables, emissions and costs to 2040"
  category: ambiente
  icon: "⚡"
  color: "#10b981"
  difficulty: base
}
```

All interactive/presentation fields are **optional** — minimal SDL scenarios continue to work without them.

## Examples

See the [`examples/`](./examples/) directory:

| Example | Domain | Complexity | Key SDL Features |
|---------|--------|------------|-----------------|
| **[`green-transition-italy.sdl`](./examples/green-transition-italy.sdl)** | Energy / Climate | High | `bind`, `watch`, `calibrate`, spline interpolation |
| **[`water-scarcity-mediterranean.sdl`](./examples/water-scarcity-mediterranean.sdl)** | Climate / Resources | High | Multiple `bind` + `calibrate`, `watch` with thresholds |
| **[`ai-energy-demand-2035.sdl`](./examples/ai-energy-demand-2035.sdl)** | AI / Energy / Climate | High | `bind` + `watch` + `calibrate`, `lognormal` compute growth |
| **[`demographic-winter-europe.sdl`](./examples/demographic-winter-europe.sdl)** | Demographics | High | `bind` + `calibrate`, `triangular` distribution, 35-year horizon |
| **[`ai-drug-discovery-2040.sdl`](./examples/ai-drug-discovery-2040.sdl)** | AI / Health / Pharma | High | `bind` + `calibrate`, `lognormal` for breakthroughs |
| **[`autonomous-mobility-2040.sdl`](./examples/autonomous-mobility-2040.sdl)** | AI / Mobility / Urban | Medium | `bind` + `calibrate`, `logistic` adoption curves |
| **[`african-urban-leapfrog-2050.sdl`](./examples/african-urban-leapfrog-2050.sdl)** | Urbanization | Medium | `bind` + `calibrate`, `latin_hypercube` sampling |
| **[`ai-governance-2030.sdl`](./examples/ai-governance-2030.sdl)** | Tech / Governance | High | Multi-bloc geopolitics, `beta` distributions |
| **[`digital-euro-adoption.sdl`](./examples/digital-euro-adoption.sdl)** | Finance / CBDC | Low | Great first read, compact scenario, `logistic` model |
| **[`pandemic-preparedness-2035.sdl`](./examples/pandemic-preparedness-2035.sdl)** | Health / Biosecurity | Medium | `lognormal` for fat-tailed risks, low confidence |
| **[`eu-defense-autonomy-2035.sdl`](./examples/eu-defense-autonomy-2035.sdl)** | Geopolitics / Defense | Medium | Very low confidence (0.25), many external assumptions |
| **[`ai-act-compliance-eu.sdl`](./examples/ai-act-compliance-eu.sdl)** | Regulation / AI Act | High | `beta` for enforcement uncertainty, multi-branch |
| **[`biometric-surveillance-risk.sdl`](./examples/biometric-surveillance-risk.sdl)** | Privacy / AI Act | High | Civil liberties impact, regulatory branches |
| **[`gdpr-ai-data-governance.sdl`](./examples/gdpr-ai-data-governance.sdl)** | Privacy / GDPR | Medium | Compliance cost modeling, `beta` distributions |
| **[`chatbot-llm-transparency.sdl`](./examples/chatbot-llm-transparency.sdl)** | AI Ethics | Medium | Transparency metrics, trust modeling |
| **[`automated-decision-risk.sdl`](./examples/automated-decision-risk.sdl)** | AI / Governance | Medium | Algorithmic decision-making, bias modeling |

## Specification

The full formal specification is available at [`spec/SDL-SPEC-v0.1.md`](./spec/SDL-SPEC-v0.1.md).

## Roadmap

### v0.1
- [x] Language specification
- [x] Lexer / Tokenizer
- [x] Recursive descent parser
- [x] Semantic validator with causal graph
- [x] Monte Carlo simulation engine
- [x] Distribution sampling (normal, uniform, beta, triangular, lognormal)
- [x] Branch evaluation
- [x] Convergence detection
- [x] Interactive parameters (sliders, toggles, dropdowns)

### v0.2 (current)
- [x] SDL Pulse: `bind` — data binding to HTTP/JSON APIs
- [x] SDL Pulse: `watch` — watchdog monitoring and alerting
- [x] SDL Pulse: `calibrate` — Bayesian calibration with historical data
- [x] Sensitivity analysis (tornado charts, parameter influence ranking)
- [x] Automated narration (Italian, from simulation results)
- [x] Historical data overlay on fan charts
- [x] AI Wizard with bind/watch/calibrate generation
- [x] 15 demo scenarios with live data integration
- [ ] WebAssembly engine for browser execution

### v0.3
- [ ] SDL Natural: NL → SDL compilation (advanced)
- [ ] SDL Natural: conversational scenario refinement
- [ ] Multi-language narration (EN, DE, FR, ES)
- [ ] Visual editor with drag-and-drop variables
- [ ] Real-time collaborative editing

### v0.4
- [ ] SDL Registry: public scenario repository
- [ ] Scenario diff / merge / fork
- [ ] Accuracy tracking and leaderboards
- [ ] Ensemble multi-scenario analysis

## Support the Project

SDL is free software. No paywall, no premium tier, no vendor lock-in — just open code for open futures.

Building and maintaining a computational language takes time: writing specs, fixing parsers, running simulations, writing documentation, keeping dependencies alive. This is volunteer work, driven by the conviction that foresight tools should belong to everyone — not just to those who can afford consulting firms.

If SDL is useful to you — as a researcher, educator, activist, policy maker, or simply as someone who believes the future should be a public conversation — you can support its development:

[![Support on Buy Me a Coffee](https://img.shields.io/badge/Support%20this%20project-Buy%20Me%20a%20Coffee-orange?logo=buymeacoffee&logoColor=white)](https://buymeacoffee.com/relatronica)

Every contribution, however small, helps keep SDL independent, open, and free.

## License

GPL-3.0 — Created by [Relatronica](https://relatronica.com)

*Imagining possible futures and building tools to navigate them.*
