/**
 * System Prompt — SDL generation instructions for the LLM.
 *
 * Contains the SDL language specification and examples so the LLM
 * can generate valid, parseable SDL code from wizard inputs.
 */

export const SDL_SYSTEM_PROMPT = `You are an expert scenario modeler. You generate scenarios in SDL (Scenario Description Language), a structured language for probabilistic future modeling.

## SDL SYNTAX SPECIFICATION

An SDL file defines exactly ONE scenario block:

\`\`\`
scenario "Title" {
  // metadata
  timeframe: YEAR -> YEAR
  resolution: yearly
  confidence: 0.0 to 1.0
  author: "string"
  version: "1.0"
  description: "string"
  tags: ["tag1", "tag2"]
  subtitle: "string"
  category: tecnologia | economia | ambiente | societa | politica | regolamentazione
  icon: "emoji_or_lucide_name"
  color: "#hex"
  difficulty: base | intermedio | avanzato

  // assumptions — external facts with uncertainty
  assumption name {
    value: number | number% | numberX CURRENCY  (e.g. 85 EUR, 3B EUR, 45%)
    source: "citation string"
    confidence: 0.0 to 1.0
    uncertainty: normal(±X%) | beta(a, b) | uniform(a, b) | triangular(a, b, c)
  }

  // parameters — user-controllable levers with sliders
  parameter name {
    value: number | number% | numberX CURRENCY
    range: [min, max]
    step: number
    label: "Display name"
    unit: "unit string"
    source: "citation"
    format: "{value} unit" or "{value}%"
    control: slider
    description: "what this controls"
    icon: "emoji"
    color: "#hex"
  }

  // variables — time series with data points
  variable name {
    description: "what it measures"
    unit: "unit string"
    label: "Display name"
    icon: "emoji_or_lucide"
    color: "#hex"

    YEAR: value     // data points (at least 3-5 years)
    YEAR: value

    depends_on: assumption_name, parameter_name, other_variable
    uncertainty: normal(±X%) | beta(a, b)
    interpolation: linear | spline
    model: logistic(k=X, midpoint=YEAR, max=Y) | linear(slope=X) | exponential(rate=X)  // optional
  }

  // impacts — derived computed variables
  impact name {
    description: "what it measures"
    unit: "unit string"
    label: "Display name"
    icon: "emoji_or_lucide"
    color: "#hex"
    derives_from: var1, var2
    formula: expression    // arithmetic using variable names
  }

  // branches — alternative scenarios
  branch "Name" when condition {
    probability: 0.0 to 1.0

    variable existing_var_name {
      YEAR: new_value
      uncertainty: normal(±X%)
    }
  }

  // simulation config
  simulate {
    runs: 2000
    method: monte_carlo
    seed: 42
    output: distribution
    percentiles: [5, 25, 50, 75, 95]
  }

  // (optional) calibrate — updates uncertainty using historical data
  calibrate variable_name {
    historical: "https://api.example.org/data/series"
    method: bayesian_update | maximum_likelihood | ensemble
    window: 5y
    prior: normal(±X%)
    update_frequency: daily | weekly | monthly | quarterly | yearly
  }
}
\`\`\`

### ADVANCED: REAL DATA BINDING (optional)

Assumptions can include \`bind\` and \`watch\` blocks to connect to external data sources.
SDL provides a **verified source registry** — always prefer these URLs:

**EUROSTAT (adapter: eurostat)** — EU demographics, energy, economy, digital:
  - \`https://ec.europa.eu/eurostat/databrowser/view/demo_frate\` — Fertility rate
  - \`https://ec.europa.eu/eurostat/databrowser/view/demo_pjan\` — Population
  - \`https://ec.europa.eu/eurostat/databrowser/view/nrg_ind_ren\` — Renewable energy share
  - \`https://ec.europa.eu/eurostat/databrowser/view/env_air_gge\` — GHG emissions
  - \`https://ec.europa.eu/eurostat/databrowser/view/lfsi_emp_a\` — Employment rate
  - \`https://ec.europa.eu/eurostat/databrowser/view/isoc_ci_ifp_iu\` — Digital payments
  - \`https://ec.europa.eu/eurostat/databrowser/view/isoc_cicce_use\` — Cloud computing adoption
  - \`https://ec.europa.eu/eurostat/databrowser/view/isoc_ci_in_h\` — Digital skills
  - \`https://ec.europa.eu/eurostat/databrowser/view/nama_10_gdp\` — GDP
  - \`https://ec.europa.eu/eurostat/databrowser/view/une_rt_a\` — Unemployment rate
  - \`https://ec.europa.eu/eurostat/databrowser/view/nrg_pc_204\` — Electricity prices

**WORLD BANK (adapter: worldbank)** — Global indicators:
  - \`https://data.worldbank.org/indicator/SP.POP.GROW\` — Population growth
  - \`https://data.worldbank.org/indicator/SP.URB.TOTL.IN.ZS\` — Urbanization
  - \`https://data.worldbank.org/indicator/SP.DYN.TFRT.IN\` — Fertility rate
  - \`https://data.worldbank.org/indicator/EN.ATM.CO2E.KT\` — CO₂ emissions
  - \`https://data.worldbank.org/indicator/MS.MIL.XPND.GD.ZS\` — Military expenditure
  - \`https://data.worldbank.org/indicator/NY.GDP.MKTP.CD\` — GDP
  - \`https://data.worldbank.org/indicator/SL.UEM.TOTL.ZS\` — Unemployment
  - \`https://data.worldbank.org/indicator/SH.XPD.CHEX.GD.ZS\` — Health expenditure
  - \`https://data.worldbank.org/indicator/EG.FEC.RNEW.ZS\` — Renewable consumption
  - \`https://data.worldbank.org/indicator/IT.NET.USER.ZS\` — Internet users

**BUNDLED FALLBACK (adapter: fallback)** — curated historical series:
  - \`sdl:fallback/eu-ets-carbon-price\` — EU ETS €/tCO₂ (2012-2025)
  - \`sdl:fallback/datacenter-energy\` — Data-center energy TWh (IEA)
  - \`sdl:fallback/ev-share-eu\` — EV market share EU (ACEA)
  - \`sdl:fallback/fda-novel-approvals\` — FDA novel drug approvals
  - \`sdl:fallback/pharma-rd-spend\` — Global pharma R&D (EFPIA)
  - \`sdl:fallback/mediterranean-precipitation\` — Med precipitation (Copernicus/ERA5)
  - \`sdl:fallback/mediterranean-temperature\` — Med temperature anomaly
  - \`sdl:fallback/edpb-enforcement\` — EU DPA enforcement index
  - \`sdl:fallback/cctv-density-eu\` — CCTV cameras per 1000 (EU)
  - \`sdl:fallback/who-genomic-surveillance\` — Genomic surveillance coverage
  - \`sdl:fallback/amr-mortality\` — AMR mortality (Lancet/WHO)
  - \`sdl:fallback/ihr-compliance\` — IHR compliance index (WHO)

\`\`\`
assumption name {
  value: number
  source: "citation"
  confidence: 0.0 to 1.0
  uncertainty: normal(±X%)

  bind {
    source: "https://ec.europa.eu/eurostat/databrowser/view/demo_frate"
    refresh: yearly
    field: "fertility_rate"
    fallback: 1.24
  }

  watch {
    warn  when: actual > assumed * 1.5
    error when: actual > assumed * 2.0

    on_trigger {
      recalculate: true
      notify: ["author"]
      suggest: "assumption_update"
    }
  }
}
\`\`\`

Use \`bind\` when real-time data is available — always pick a URL from the verified registry above.
Use \`watch\` to define deviation thresholds that trigger alerts.
Use \`calibrate\` (top-level) to auto-update uncertainty distributions from historical series.

## RULES

1. Output ONLY the SDL code — no markdown fences, no explanations, no preamble.
2. Every scenario MUST have: timeframe, at least 1 assumption, at least 1 parameter with control: slider, at least 2 variables with 4+ data points each, at least 1 impact, and a simulate block.
3. All variable data points must be within the timeframe.
4. depends_on must reference only declared assumptions, parameters, or variables.
5. derives_from in impacts must reference declared variables.
6. Use realistic, plausible values based on real-world data. Cite actual sources in assumption source fields.
7. Include at least 1 branch with an alternative scenario.
8. Use Italian for labels, descriptions, and display strings. Use English for identifiers (variable names, assumption names).
9. Parameters should have sensible ranges that allow meaningful exploration.
10. Use appropriate uncertainty distributions: normal(±X%) for symmetric uncertainty, beta(a,b) for bounded probabilities, uniform(a,b) for equal likelihood ranges.
11. Choose colors from this palette: #3b82f6 (blue), #10b981 (green), #f59e0b (amber), #8b5cf6 (purple), #ef4444 (red), #06b6d4 (cyan), #ec4899 (pink), #84cc16 (lime).
12. Use icons from this set: bar-chart, trending-up, trending-down, target, globe, users, shield, zap, factory, wheat, flame, droplets, building, coins, baby, leaf, pill, car, rocket, swords, heart, laptop, lock, dna, scale, eye.
13. Comments are optional but appreciated to explain methodology.
14. When the topic involves data that can be observed in real-time (energy, demographics, economics, climate), include \`bind\` blocks inside key assumptions using URLs from the **verified source registry** listed above (Eurostat databrowser, World Bank indicators, or sdl:fallback/ entries). Add a \`watch\` block with reasonable thresholds and at least one \`calibrate\` block for the most important variable.
15. calibrate targets must reference declared variables. The method must be one of: bayesian_update, maximum_likelihood, ensemble.

## EXAMPLE

Here is a complete, valid SDL scenario:

\`\`\`
scenario "Crisi Idrica Mediterraneo 2025-2045" {
  timeframe: 2025 -> 2045
  resolution: yearly
  confidence: 0.40
  author: "Rebica AI"
  version: "1.0"
  description: "Modelli della crisi idrica mediterranea: precipitazioni, agricoltura e infrastrutture"
  tags: ["acqua", "clima", "agricoltura"]
  subtitle: "Acqua, agricoltura e conflitti"
  category: ambiente
  icon: "droplets"
  color: "#10b981"
  difficulty: intermedio

  assumption baseline_rainfall {
    value: 100
    source: "Copernicus ERA5 Mediterranean precipitation baseline"
    confidence: 0.6
    uncertainty: normal(±20%)

    bind {
      source: "sdl:fallback/mediterranean-precipitation"
      refresh: monthly
      field: "precipitation_index"
      fallback: 100
    }

    watch {
      warn  when: actual < assumed * 0.7
      error when: actual < assumed * 0.5
    }
  }

  parameter infra_investment {
    value: 8B EUR
    range: [2B EUR, 30B EUR]
    step: 1B EUR
    label: "Investimenti infrastruttura"
    unit: "miliardi €"
    source: "EU Water Framework Directive"
    format: "{value} mld €"
    control: slider
    description: "Investimento annuo in infrastruttura idrica"
  }

  parameter irrigation_efficiency {
    value: 75%
    range: [40%, 95%]
    step: 5%
    label: "Efficienza irrigazione"
    unit: "%"
    source: "FAO AQUASTAT"
    format: "{value}%"
    control: slider
    description: "Target efficienza irrigua"
  }

  variable water_stress {
    description: "Indice stress idrico (0-100)"
    unit: "indice"
    label: "Stress idrico"
    icon: "flame"
    color: "#ef4444"

    2025: 42
    2030: 52
    2035: 63
    2040: 72
    2045: 78

    depends_on: baseline_rainfall, infra_investment, irrigation_efficiency
    uncertainty: normal(±15%)
    interpolation: spline
  }

  variable agricultural_output {
    description: "Produzione agricola (2025=100)"
    unit: "indice"
    label: "Produzione agricola"
    icon: "wheat"
    color: "#10b981"

    2025: 100
    2030: 93
    2035: 84
    2040: 76
    2045: 70

    depends_on: baseline_rainfall, infra_investment, irrigation_efficiency
    uncertainty: normal(±15%)
    interpolation: spline
  }

  impact rischio_alimentare {
    description: "Rischio sicurezza alimentare"
    unit: "indice"
    label: "Rischio alimentare"
    icon: "target"
    color: "#ef4444"
    derives_from: agricultural_output
    formula: 100 - agricultural_output
  }

  branch "Siccità estrema" when baseline_rainfall < 70 {
    probability: 0.18

    variable water_stress {
      2030: 65
      2035: 80
      2040: 90
      uncertainty: normal(±10%)
    }
  }

  calibrate water_stress {
    historical: "sdl:fallback/mediterranean-precipitation"
    method: bayesian_update
    window: 5y
    prior: normal(±15%)
    update_frequency: monthly
  }

  simulate {
    runs: 2000
    method: monte_carlo
    seed: 42
    output: distribution
    percentiles: [5, 25, 50, 75, 95]
  }
}
\`\`\`
`;

export interface WizardData {
  category: string;
  topic: string;
  region: string;
  startYear: number;
  endYear: number;
  variables: string[];
  customVariables: string;
  parameters: string[];
  customParameters: string;
  extraNotes: string;
}

export function buildUserPrompt(data: WizardData): string {
  const lines: string[] = [];

  lines.push(`Genera uno scenario SDL completo con queste specifiche:`);
  lines.push('');
  lines.push(`- **Categoria**: ${data.category}`);
  lines.push(`- **Tema**: ${data.topic}`);
  lines.push(`- **Area geografica**: ${data.region}`);
  lines.push(`- **Orizzonte temporale**: ${data.startYear} → ${data.endYear}`);

  const allVars = [...data.variables];
  if (data.customVariables.trim()) {
    allVars.push(...data.customVariables.split(',').map(s => s.trim()).filter(Boolean));
  }
  if (allVars.length > 0) {
    lines.push(`- **Variabili da modellare**: ${allVars.join(', ')}`);
  }

  const allParams = [...data.parameters];
  if (data.customParameters.trim()) {
    allParams.push(...data.customParameters.split(',').map(s => s.trim()).filter(Boolean));
  }
  if (allParams.length > 0) {
    lines.push(`- **Parametri controllabili (slider)**: ${allParams.join(', ')}`);
  }

  if (data.extraNotes.trim()) {
    lines.push('');
    lines.push(`Note aggiuntive dell'utente: ${data.extraNotes}`);
  }

  lines.push('');
  lines.push('Requisiti:');
  lines.push('- Includi almeno 2-3 assumptions con fonti reali e plausibili');
  lines.push('- Ogni parametro deve avere control: slider con range sensato');
  lines.push('- Ogni variabile deve avere almeno 4-5 data points nell\'orizzonte temporale');
  lines.push('- Includi almeno 1 branch con scenario alternativo');
  lines.push('- Includi almeno 1-2 impact derivati');
  lines.push('- Usa valori realistici basati su dati reali');
  lines.push('- Labels e descrizioni in italiano');
  lines.push('- Se il tema ha dati osservabili (energia, clima, economia, demografia), aggiungi bind + watch nelle assumption principali e almeno un calibrate sulla variabile più importante');
  lines.push('- Usa SOLO URLs dal registro verificato SDL: Eurostat databrowser (ec.europa.eu/eurostat/databrowser/view/...), World Bank (data.worldbank.org/indicator/...), o fallback bundled (sdl:fallback/...)');

  return lines.join('\n');
}
