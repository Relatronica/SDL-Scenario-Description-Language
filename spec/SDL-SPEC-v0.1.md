# SDL — Scenario Description Language

## Specification v0.1

**Status:** Draft
**Authors:** Relatronica
**Date:** 2026-02-16
**License:** MIT

---

## Abstract

SDL (Scenario Description Language) is a formal, executable language for describing, simulating, and monitoring future scenarios. Unlike traditional foresight methodologies that produce static narratives, SDL scenarios are computational objects that can be parsed, executed via Monte Carlo simulation, connected to live data sources, and compiled from natural language.

SDL is designed to democratize computational foresight — making it accessible to policy makers, researchers, educators, activists, and citizens, not just data scientists.

---

## 1. Design Principles

1. **Executable over Descriptive** — Every SDL scenario can be simulated, not just read
2. **Uncertainty-Native** — Probability distributions are first-class citizens, not afterthoughts
3. **Temporally-Aware** — Time is a core dimension of every construct
4. **Causally-Structured** — Dependencies between variables form an explicit causal graph
5. **Composable** — Scenarios can be forked, merged, combined, and diffed
6. **Human-Readable** — Syntax is readable by non-programmers
7. **Machine-Compilable** — Designed for LLM compilation to/from natural language
8. **Reality-Bound** — Scenarios can bind to live data and self-validate

---

## 2. Lexical Structure

### 2.1 Character Set

SDL source files are encoded in UTF-8. Identifiers support ASCII alphanumeric characters and underscores.

### 2.2 Comments

```
// Single-line comment

/* 
   Multi-line comment 
*/
```

### 2.3 Keywords

Reserved keywords:

```
scenario    variable    assumption    parameter    constant
branch      impact      simulate      watch        calibrate
bind        when        if            else         and
or          not         on            by           from
to          at          between       true         false
warn        error       notify        recalculate  method
runs        output      percentiles   depends_on   model
uncertainty source      confidence    timeframe    resolution
fork        import      export        as           distribution
normal      uniform     beta          triangular   lognormal
linear      logistic    exponential   sigmoid      polynomial
yearly      monthly     weekly        daily
```

### 2.4 Identifiers

```ebnf
identifier     = letter ( letter | digit | "_" )* ;
qualified_id   = identifier ( "." identifier )* ;
letter         = "a".."z" | "A".."Z" ;
digit          = "0".."9" ;
```

Examples: `carbon_tax`, `energy_mix.solar`, `policy.eu.carbon_border`

### 2.5 Literals

#### Numeric Literals
```ebnf
number         = integer | float ;
integer        = digit+ ;
float          = digit+ "." digit+ ;
```

#### Percentage Literals
```ebnf
percentage     = number "%" ;
```
Example: `22%`, `0.5%`

#### Currency Literals
```ebnf
currency       = number currency_code ;
currency_code  = "EUR" | "USD" | "GBP" | "CHF" | "JPY" | "CNY" ;
```
Example: `150 EUR`, `2.5B USD`

#### Magnitude Suffixes
```ebnf
magnitude      = "K" | "M" | "B" | "T" ;
```
`K` = 10^3, `M` = 10^6, `B` = 10^9, `T` = 10^12
Example: `5M EUR` = 5,000,000 EUR

#### Date Literals
```ebnf
date           = year ( "-" month ( "-" day )? )? ;
year           = digit digit digit digit ;
month          = digit digit ;
day            = digit digit ;
```
Example: `2025`, `2025-06`, `2025-06-15`

#### String Literals
```ebnf
string         = '"' ( char | escape )* '"' ;
escape         = '\"' | '\\' | '\n' | '\t' ;
```

#### Duration Literals
```ebnf
duration       = number duration_unit ;
duration_unit  = "y" | "m" | "w" | "d" ;
```
`y` = years, `m` = months, `w` = weeks, `d` = days
Example: `5y`, `18m`

### 2.6 Operators

```
Arithmetic:    +  -  *  /  ^  %
Comparison:    >  <  >=  <=  ==  !=
Logical:       and  or  not
Assignment:    :
Range:         ->
Deviation:     ±
```

---

## 3. Type System

### 3.1 Scalar Types

| Type | Description | Example |
|------|-------------|---------|
| `number` | Floating-point numeric value | `42`, `3.14` |
| `percentage` | Value between 0-100% | `22%` |
| `currency` | Monetary amount with currency code | `150 EUR` |
| `date` | Point in time | `2030-06-15` |
| `string` | Text value | `"IPCC AR7"` |
| `boolean` | True or false | `true` |
| `duration` | Time span | `5y` |

### 3.2 Distribution Types

Distributions represent uncertain values. They are first-class types in SDL.

```ebnf
distribution   = dist_type "(" dist_params ")" ;
dist_type      = "normal" | "uniform" | "beta" | "triangular" 
               | "lognormal" | "custom" ;
```

| Distribution | Parameters | Description |
|-------------|------------|-------------|
| `normal(μ, σ)` | mean, std deviation | Gaussian distribution |
| `normal(±X%)` | symmetric deviation | Shorthand: normal(value, value*X/100) |
| `uniform(min, max)` | bounds | Equal probability in range |
| `beta(α, β)` | shape parameters | Bounded [0,1], flexible shape |
| `triangular(min, mode, max)` | three points | Most likely value with bounds |
| `lognormal(μ, σ)` | log-mean, log-std | Positive-skewed distribution |
| `custom(values, weights)` | discrete | Weighted discrete outcomes |

Example:
```sdl
uncertainty: normal(±15%)           // symmetric around base value
uncertainty: beta(2, 5)             // right-skewed between 0 and 1
uncertainty: triangular(10, 25, 60) // min=10, most likely=25, max=60
uncertainty: uniform(0.8, 1.2)      // flat between 80% and 120% of base
```

### 3.3 Temporal Types

#### Timeseries

A mapping from dates to values, with optional interpolation.

```sdl
variable energy_mix {
  2025: 22%
  2030: 35%
  2040: 55%
  interpolation: linear  // linear | step | spline
}
```

Between defined points, SDL interpolates according to the specified method (default: `linear`).

#### Temporal Records

A mapping from dates to structured values.

```sdl
variable energy_mix {
  2025: { solar: 22%, wind: 18%, nuclear: 25%, fossil: 35% }
  2030: { solar: 35%, wind: 25%, nuclear: 22%, fossil: 18% }
}
```

### 3.4 Compound Types

#### Records
```sdl
{ key1: value1, key2: value2 }
```

#### Arrays
```sdl
[value1, value2, value3]
```

---

## 4. Top-Level Declarations

### 4.1 Scenario

The root container. Every SDL file contains exactly one scenario.

```ebnf
scenario_decl  = "scenario" string "{" scenario_body "}" ;
scenario_body  = ( metadata | declaration )* ;
metadata       = "timeframe" ":" date "->" date
               | "resolution" ":" resolution_value
               | "confidence" ":" number
               | "author" ":" string
               | "version" ":" string
               | "description" ":" string
               | "tags" ":" "[" string ( "," string )* "]" ;
resolution_value = "yearly" | "monthly" | "weekly" | "daily" ;
```

Example:
```sdl
scenario "Green Transition Italy 2040" {
  timeframe: 2025 -> 2050
  resolution: yearly
  confidence: 0.65
  author: "Relatronica"
  version: "1.0"
  tags: ["energy", "europe", "climate"]
  description: "Explores pathways for Italy's transition 
                to carbon neutrality by 2040"
  
  // ... declarations ...
}
```

### 4.2 Variable

A measurable quantity that changes over time. Variables are the core computational units of SDL.

```ebnf
variable_decl  = "variable" identifier "{" variable_body "}" ;
variable_body  = ( timeseries_entry | variable_prop )* ;
variable_prop  = "depends_on" ":" qualified_id ( "," qualified_id )*
               | "model" ":" model_expr
               | "uncertainty" ":" distribution
               | "unit" ":" string
               | "description" ":" string
               | "interpolation" ":" interp_method ;
interp_method  = "linear" | "step" | "spline" ;
```

Example:
```sdl
variable renewable_share {
  description: "Share of renewables in energy mix"
  unit: "%"
  
  2025: 22%
  2030: 35%
  2040: 55%
  
  depends_on: carbon_tax, subsidy_policy
  model: logistic(k=0.12, midpoint=2032)
  uncertainty: normal(±12%)
  interpolation: linear
}
```

#### Variable Dependencies

`depends_on` declares a causal relationship. The simulation engine uses these to build the causal graph and determine execution order.

When a variable has both explicit timeseries values AND a model, the timeseries values act as calibration anchors. The model generates intermediate values, and the engine adjusts to minimize deviation from anchors.

### 4.3 Assumption

An external condition taken as given. Unlike variables, assumptions are not derived — they are inputs to the scenario.

```ebnf
assumption_decl = "assumption" identifier "{" assumption_body "}" ;
assumption_body = ( "value" ":" expr
                  | "by" ":" date
                  | "source" ":" string
                  | "confidence" ":" number
                  | "uncertainty" ":" distribution
                  | bind_block
                  | watch_block )* ;
```

Example:
```sdl
assumption carbon_tax {
  value: 150 EUR by 2030
  source: "EU Commission Proposal 2024/331"
  confidence: 0.6
  uncertainty: normal(±30%)
  
  bind {
    source: "api.worldbank.org/carbon-pricing/eu"
    refresh: daily
    field: "price_per_ton_eur"
  }
}
```

### 4.4 Parameter

A configuration value that does not change over time within a simulation run, but can be varied across runs.

```ebnf
parameter_decl = "parameter" identifier "{" parameter_body "}" ;
parameter_body = ( "value" ":" expr
                 | "range" ":" "[" expr "," expr "]"
                 | "description" ":" string )* ;
```

Example:
```sdl
parameter discount_rate {
  value: 3.5%
  range: [2%, 6%]
  description: "Social discount rate for cost-benefit analysis"
}
```

### 4.5 Branch

A conditional fork that creates an alternative trajectory when conditions are met.

```ebnf
branch_decl    = "branch" string "when" condition "{" branch_body "}" ;
branch_body    = ( "probability" ":" number
                 | "fork" ":" "scenario" string
                 | declaration )* ;
condition      = expr comparator expr ( ("and" | "or") condition )* ;
```

Example:
```sdl
branch "Nuclear Renaissance" when energy_mix.nuclear > 30% {
  probability: 0.15
  
  variable energy_cost {
    model: linear(slope=-0.02)
    uncertainty: normal(±20%)
  }
  
  fork: scenario "Nuclear Europe 2045"
}
```

When a branch condition is met during simulation, the engine forks the run and continues down both paths (with and without the branch), weighted by the branch probability.

### 4.6 Impact

Declares output metrics — the quantities the scenario is designed to measure.

```ebnf
impact_decl    = "impact" "on" ":" "[" qualified_id ( "," qualified_id )* "]" ;
```

Or as detailed block:
```ebnf
impact_decl    = "impact" identifier "{" impact_body "}" ;
impact_body    = ( "derives_from" ":" qualified_id ( "," qualified_id )*
                 | "formula" ":" expr
                 | "unit" ":" string
                 | "description" ":" string )* ;
```

Example:
```sdl
impact employment_delta {
  description: "Net change in employment"
  unit: "jobs"
  derives_from: renewable_share, retraining_budget, automation_rate
  formula: (renewable_share * green_jobs_factor) 
           - (fossil_phase_out * displaced_workers)
           + (retraining_budget / cost_per_worker * success_rate)
}
```

### 4.7 Simulate

Configures the Monte Carlo simulation engine.

```ebnf
simulate_decl  = "simulate" "{" simulate_body "}" ;
simulate_body  = ( "runs" ":" integer
                 | "method" ":" sim_method
                 | "seed" ":" integer
                 | "output" ":" output_type
                 | "percentiles" ":" "[" number ( "," number )* "]"
                 | "convergence" ":" number
                 | "timeout" ":" duration )* ;
sim_method     = "monte_carlo" | "latin_hypercube" | "sobol" ;
output_type    = "distribution" | "percentiles" | "summary" | "full" ;
```

Example:
```sdl
simulate {
  runs: 10000
  method: monte_carlo
  seed: 42
  output: distribution
  percentiles: [5, 10, 25, 50, 75, 90, 95]
  convergence: 0.01    // stop early if results stabilize within 1%
  timeout: 30s
}
```

#### Simulation Methods

| Method | Description | Use Case |
|--------|-------------|----------|
| `monte_carlo` | Pure random sampling | Default, general purpose |
| `latin_hypercube` | Stratified sampling | Better coverage with fewer runs |
| `sobol` | Quasi-random sequences | Sensitivity analysis |

### 4.8 Watch

Defines monitoring rules for live scenarios connected to data sources.

```ebnf
watch_decl     = "watch" qualified_id "{" watch_body "}" ;
watch_body     = ( watch_rule | on_trigger )* ;
watch_rule     = ("warn" | "error") "when" ":" condition ;
on_trigger     = "on_trigger" "{" trigger_body "}" ;
trigger_body   = ( "recalculate" ":" boolean
                 | "notify" ":" "[" string ( "," string )* "]"
                 | "suggest" ":" string )* ;
```

Example:
```sdl
watch carbon_tax {
  warn  when: actual < assumed * 0.8
  error when: actual < assumed * 0.5
  
  on_trigger {
    recalculate: true
    notify: ["author", "subscribers"]
    suggest: "assumption_update"
  }
}
```

### 4.9 Bind

Connects an assumption or variable to an external data source.

```ebnf
bind_block     = "bind" "{" bind_body "}" ;
bind_body      = ( "source" ":" string
                 | "refresh" ":" refresh_rate
                 | "field" ":" string
                 | "transform" ":" expr
                 | "fallback" ":" expr )* ;
refresh_rate   = "realtime" | "hourly" | "daily" | "weekly" | "monthly" ;
```

### 4.10 Calibrate

Configures Bayesian updating of uncertainty distributions based on historical data.

```ebnf
calibrate_decl = "calibrate" qualified_id "{" calibrate_body "}" ;
calibrate_body = ( "historical" ":" string
                 | "method" ":" cal_method
                 | "window" ":" duration
                 | "prior" ":" distribution
                 | "update_frequency" ":" refresh_rate )* ;
cal_method     = "bayesian_update" | "maximum_likelihood" | "ensemble" ;
```

Example:
```sdl
calibrate renewable_share {
  historical: "api.irena.org/capacity/eu/2015-2025"
  method: bayesian_update
  window: 5y
  prior: normal(±15%)
  update_frequency: monthly
}
```

---

## 5. Expressions

### 5.1 Arithmetic Expressions

```ebnf
expr           = term ( ("+" | "-") term )* ;
term           = factor ( ("*" | "/" | "%") factor )* ;
factor         = base ( "^" base )* ;
base           = number | percentage | currency | qualified_id
               | "(" expr ")" | function_call | unary ;
unary          = "-" base | "not" base ;
```

### 5.2 Comparison Expressions

```ebnf
comparison     = expr comp_op expr ;
comp_op        = ">" | "<" | ">=" | "<=" | "==" | "!=" ;
```

### 5.3 Logical Expressions

```ebnf
logical        = comparison ( ("and" | "or") comparison )* ;
```

### 5.4 Temporal Expressions

```ebnf
temporal_expr  = qualified_id "at" date
               | qualified_id "between" date "and" date
               | qualified_id "by" date
               | qualified_id "from" date "to" date ;
```

Example:
```sdl
carbon_tax at 2030               // value of carbon_tax in 2030
renewable_share between 2025 and 2035  // timeseries slice
employment_delta by 2040         // cumulative by date
```

### 5.5 Model Expressions

Built-in models for common growth/decay patterns.

```ebnf
model_expr     = model_type "(" model_params ")" ;
model_type     = "linear" | "logistic" | "exponential" 
               | "sigmoid" | "polynomial" | "custom" ;
model_params   = named_param ( "," named_param )* ;
named_param    = identifier "=" expr ;
```

| Model | Parameters | Formula |
|-------|-----------|---------|
| `linear(slope, intercept)` | rate of change, starting value | `y = slope * t + intercept` |
| `logistic(k, midpoint, max)` | growth rate, inflection, ceiling | `y = max / (1 + e^(-k*(t-midpoint)))` |
| `exponential(rate, base)` | growth/decay rate, initial | `y = base * e^(rate*t)` |
| `sigmoid(k, midpoint)` | steepness, center | `y = 1 / (1 + e^(-k*(t-midpoint)))` |
| `polynomial(coefficients)` | array of coefficients | `y = Σ(c_i * t^i)` |

### 5.6 Function Calls

```ebnf
function_call  = identifier "(" ( expr ( "," expr )* )? ")" ;
```

Built-in functions:

| Function | Description |
|----------|-------------|
| `min(a, b)` | Minimum of two values |
| `max(a, b)` | Maximum of two values |
| `clamp(val, lo, hi)` | Constrain value to range |
| `lerp(a, b, t)` | Linear interpolation |
| `sum(array)` | Sum of array elements |
| `avg(array)` | Average of array elements |
| `abs(x)` | Absolute value |
| `sqrt(x)` | Square root |
| `log(x)` | Natural logarithm |
| `pow(base, exp)` | Exponentiation |
| `round(x, decimals)` | Round to N decimals |
| `cumulative(series)` | Running total of timeseries |
| `delta(series)` | Year-over-year change |
| `growth_rate(series)` | Year-over-year growth rate |
| `correlation(a, b)` | Pearson correlation between two series |
| `delay(series, n)` | Shift timeseries by n periods |

---

## 6. Semantic Rules

### 6.1 Causal Graph

All `depends_on` relationships form a directed acyclic graph (DAG). The SDL validator MUST reject scenarios containing cycles.

```
carbon_tax ──→ renewable_share ──→ employment_delta
                     ↑
subsidy_policy ──────┘
```

The simulation engine resolves the DAG via topological sort and computes variables in dependency order.

### 6.2 Temporal Resolution

Each scenario declares a `resolution` (default: `yearly`). All timeseries values are interpolated to this resolution before simulation.

If a variable defines values at `2025` and `2030` with `resolution: yearly`, the engine generates interpolated values for 2026, 2027, 2028, and 2029 according to the `interpolation` method.

### 6.3 Uncertainty Propagation

During Monte Carlo simulation:

1. For each run, sample all root uncertainties (assumptions, parameters with ranges)
2. Propagate through the causal graph in topological order
3. Each variable's uncertainty compounds with its dependencies' sampled values
4. Record the output values for each impact metric

### 6.4 Branch Evaluation

Branches are evaluated at each timestep during simulation:

1. Check branch condition against current variable values
2. If condition is met AND random draw < branch probability:
   - Fork the simulation run
   - Apply branch-specific variable overrides
   - Continue simulation with modified parameters
3. Aggregate results across all branches, weighted by probability

### 6.5 Scope Rules

- Variables, assumptions, and parameters declared at the scenario level are globally visible
- Declarations inside a `branch` block override same-named parent declarations within that branch
- Qualified identifiers (`energy_mix.solar`) access fields of temporal records

---

## 7. Simulation Engine Specification

### 7.1 Execution Model

```
Input:  SDL scenario (parsed AST)
Output: SimulationResult {
          runs: number
          timesteps: Date[]
          variables: Map<string, Distribution[]>
          impacts: Map<string, Distribution[]>
          branches: Map<string, BranchResult>
          metadata: { convergence, elapsed_time, seed }
        }
```

### 7.2 Monte Carlo Algorithm

```
FUNCTION simulate(scenario, config):
  graph = build_causal_graph(scenario)
  order = topological_sort(graph)
  results = []
  
  FOR i = 1 TO config.runs:
    state = {}
    
    // 1. Sample root values
    FOR EACH assumption IN scenario.assumptions:
      state[assumption.id] = sample(assumption.uncertainty)
    FOR EACH parameter IN scenario.parameters:
      IF parameter.range:
        state[parameter.id] = uniform_sample(parameter.range)
    
    // 2. Compute variables in causal order
    FOR EACH timestep IN scenario.timeframe BY scenario.resolution:
      FOR EACH variable IN order:
        base = interpolate(variable.timeseries, timestep)
        IF variable.model:
          base = evaluate_model(variable.model, timestep, state)
        noise = sample(variable.uncertainty)
        state[variable.id][timestep] = base * (1 + noise)
        
        // 3. Check branches
        FOR EACH branch IN scenario.branches:
          IF evaluate(branch.condition, state, timestep):
            IF random() < branch.probability:
              fork_state = deep_copy(state)
              apply_overrides(fork_state, branch)
              results.push({ state: fork_state, branch: branch.id })
    
    results.push({ state, branch: "base" })
    
    // 4. Early convergence check
    IF i % 100 == 0 AND check_convergence(results, config.convergence):
      BREAK
  
  RETURN aggregate(results, config.percentiles)
```

### 7.3 Convergence Detection

The engine checks for convergence every 100 runs by comparing the mean and variance of impact metrics between the last two batches. If the relative change in both is less than the `convergence` threshold, simulation stops early.

### 7.4 Output Formats

| Format | Description |
|--------|-------------|
| `distribution` | Full distribution per variable per timestep |
| `percentiles` | Specified percentile values only |
| `summary` | Mean, median, std, min, max per variable |
| `full` | Raw data for every run (warning: large) |

---

## 8. Data Binding Specification

### 8.1 Source Protocol

SDL supports binding to external data sources via HTTP/HTTPS APIs that return JSON.

```sdl
bind {
  source: "https://api.worldbank.org/v2/country/EU/indicator/EN.ATM.CO2E.PC"
  refresh: daily
  field: "value[0].value"    // JSONPath-like field extraction
  transform: value * 1000    // optional transformation
  fallback: 150              // value to use if source is unavailable
}
```

### 8.2 Deviation Calculation

When a bound value is available, the SDL runtime computes:

```
deviation = (actual - assumed) / assumed
```

This deviation is used by `watch` rules to trigger warnings or errors.

### 8.3 Refresh Policy

| Policy | Description |
|--------|-------------|
| `realtime` | WebSocket or polling < 1min |
| `hourly` | Poll every hour |
| `daily` | Poll once per day |
| `weekly` | Poll once per week |
| `monthly` | Poll once per month |

---

## 9. Calibration Specification

### 9.1 Bayesian Update

When `calibrate` is configured, the engine updates uncertainty distributions based on observed data:

```
posterior ∝ likelihood(data | params) × prior(params)
```

1. Load historical data from the specified source
2. Compute likelihood of observed data given current distribution parameters
3. Update distribution parameters using Bayes' theorem
4. Replace the variable's `uncertainty` with the posterior distribution

### 9.2 Windowed Calibration

The `window` parameter limits how far back historical data is considered. This prevents ancient data from dominating recent trends.

---

## 10. Import and Composition

### 10.1 Import

SDL scenarios can import variables and assumptions from other scenarios.

```sdl
import "eu-energy-baseline.sdl" as baseline

scenario "Italy Extension" {
  variable solar_capacity {
    depends_on: baseline.renewable_share
    // ...
  }
}
```

### 10.2 Scenario Composition

Two scenarios can be composed by merging their causal graphs:

```sdl
import "energy-scenario.sdl" as energy
import "demographics-scenario.sdl" as demographics

scenario "Combined EU Outlook" {
  compose: [energy, demographics]
  
  // Link variables across scenarios
  variable economic_output {
    depends_on: energy.renewable_share, demographics.working_age_population
  }
}
```

The composer resolves naming conflicts by qualifying with the import alias.

---

## 11. Formal Grammar (EBNF)

```ebnf
(* Top Level *)
program        = scenario_decl ;
scenario_decl  = "scenario" string_lit "{" { metadata | declaration } "}" ;

(* Metadata *)
metadata       = "timeframe" ":" date "->" date
               | "resolution" ":" resolution
               | "confidence" ":" number
               | "author" ":" string_lit
               | "version" ":" string_lit
               | "description" ":" string_lit
               | "tags" ":" "[" string_lit { "," string_lit } "]" ;
resolution     = "yearly" | "monthly" | "weekly" | "daily" ;

(* Declarations *)
declaration    = variable_decl
               | assumption_decl
               | parameter_decl
               | branch_decl
               | impact_decl
               | simulate_decl
               | watch_decl
               | calibrate_decl
               | import_decl ;

(* Variable *)
variable_decl  = "variable" ident "{" { var_entry } "}" ;
var_entry      = date ":" value
               | "depends_on" ":" ident_list
               | "model" ":" model_expr
               | "uncertainty" ":" dist_expr
               | "unit" ":" string_lit
               | "description" ":" string_lit
               | "interpolation" ":" interp ;
interp         = "linear" | "step" | "spline" ;

(* Assumption *)
assumption_decl = "assumption" ident "{" { assump_entry } "}" ;
assump_entry   = "value" ":" expr [ "by" date ]
               | "source" ":" string_lit
               | "confidence" ":" number
               | "uncertainty" ":" dist_expr
               | bind_block
               | watch_block ;

(* Parameter *)
parameter_decl = "parameter" ident "{" { param_entry } "}" ;
param_entry    = "value" ":" expr
               | "range" ":" "[" expr "," expr "]"
               | "description" ":" string_lit ;

(* Branch *)
branch_decl    = "branch" string_lit "when" condition "{" { branch_entry } "}" ;
branch_entry   = "probability" ":" number
               | "fork" ":" "scenario" string_lit
               | declaration ;

(* Impact *)
impact_decl    = "impact" ident "{" { impact_entry } "}"
               | "impact" "on" ":" "[" ident_list "]" ;
impact_entry   = "derives_from" ":" ident_list
               | "formula" ":" expr
               | "unit" ":" string_lit
               | "description" ":" string_lit ;

(* Simulate *)
simulate_decl  = "simulate" "{" { sim_entry } "}" ;
sim_entry      = "runs" ":" integer
               | "method" ":" sim_method
               | "seed" ":" integer
               | "output" ":" output_type
               | "percentiles" ":" "[" number { "," number } "]"
               | "convergence" ":" number
               | "timeout" ":" duration ;
sim_method     = "monte_carlo" | "latin_hypercube" | "sobol" ;
output_type    = "distribution" | "percentiles" | "summary" | "full" ;

(* Watch *)
watch_decl     = "watch" qualified_id "{" { watch_entry } "}" ;
watch_block    = "watch" "{" { watch_entry } "}" ;
watch_entry    = ( "warn" | "error" ) "when" ":" condition
               | "on_trigger" "{" { trigger_entry } "}" ;
trigger_entry  = "recalculate" ":" boolean
               | "notify" ":" "[" string_lit { "," string_lit } "]"
               | "suggest" ":" string_lit ;

(* Bind *)
bind_block     = "bind" "{" { bind_entry } "}" ;
bind_entry     = "source" ":" string_lit
               | "refresh" ":" refresh_rate
               | "field" ":" string_lit
               | "transform" ":" expr
               | "fallback" ":" expr ;
refresh_rate   = "realtime" | "hourly" | "daily" | "weekly" | "monthly" ;

(* Calibrate *)
calibrate_decl = "calibrate" qualified_id "{" { cal_entry } "}" ;
cal_entry      = "historical" ":" string_lit
               | "method" ":" cal_method
               | "window" ":" duration
               | "prior" ":" dist_expr
               | "update_frequency" ":" refresh_rate ;
cal_method     = "bayesian_update" | "maximum_likelihood" | "ensemble" ;

(* Import *)
import_decl    = "import" string_lit "as" ident ;

(* Expressions *)
expr           = logical ;
logical        = comparison { ( "and" | "or" ) comparison } ;
comparison     = addition [ comp_op addition ] ;
comp_op        = ">" | "<" | ">=" | "<=" | "==" | "!=" ;
addition       = multiplication { ( "+" | "-" ) multiplication } ;
multiplication = power { ( "*" | "/" | "%" ) power } ;
power          = unary { "^" unary } ;
unary          = [ "-" | "not" ] primary ;
primary        = number | percentage | currency_lit | string_lit
               | boolean | qualified_id | function_call
               | dist_expr | "(" expr ")" ;

(* Distribution Expression *)
dist_expr      = dist_type "(" [ expr { "," expr } ] ")"
               | "±" expr "%" ;
dist_type      = "normal" | "uniform" | "beta" | "triangular" 
               | "lognormal" | "custom" ;

(* Model Expression *)
model_expr     = model_type "(" [ named_param { "," named_param } ] ")" ;
model_type     = "linear" | "logistic" | "exponential" 
               | "sigmoid" | "polynomial" | "custom" ;
named_param    = ident "=" expr ;

(* Function Call *)
function_call  = ident "(" [ expr { "," expr } ] ")" ;

(* Condition *)
condition      = expr comp_op expr { ( "and" | "or" ) expr comp_op expr } ;

(* Shared *)
value          = expr | record | array ;
record         = "{" ident ":" value { "," ident ":" value } "}" ;
array          = "[" value { "," value } "]" ;
ident_list     = qualified_id { "," qualified_id } ;
qualified_id   = ident { "." ident } ;
ident          = letter { letter | digit | "_" } ;
date           = digit digit digit digit [ "-" digit digit [ "-" digit digit ] ] ;
duration       = number ( "y" | "m" | "w" | "d" | "s" ) ;
number         = integer | float ;
integer        = digit { digit } ;
float          = digit { digit } "." digit { digit } ;
percentage     = number "%" ;
currency_lit   = number [ magnitude ] currency_code ;
magnitude      = "K" | "M" | "B" | "T" ;
currency_code  = "EUR" | "USD" | "GBP" | "CHF" | "JPY" | "CNY" ;
string_lit     = '"' { character } '"' ;
boolean        = "true" | "false" ;
```

---

## 12. File Format

- **Extension:** `.sdl`
- **Encoding:** UTF-8
- **MIME type:** `application/sdl+text`
- **Max file size (recommended):** 1MB per scenario
- **Line endings:** LF or CRLF (normalized to LF by parser)

---

## 13. Conformance Levels

### Level 1: SDL Core
Parser can read and validate SDL syntax and semantics. No simulation.

### Level 2: SDL Engine
Includes Level 1 + Monte Carlo simulation with uncertainty propagation.

### Level 3: SDL Pulse
Includes Level 2 + data binding, watchdog, and calibration.

### Level 4: SDL Natural
Includes Level 3 + LLM compilation interface (NL↔SDL).

---

## Appendix A: Reserved for Future Versions

- `agent` declarations for multi-agent scenarios
- `constraint` blocks for optimization problems
- `game` blocks for game-theoretic modeling
- `spatial` data types for geographic scenarios
- `event` declarations for discrete scenario events
- Policy optimization: "Find the carbon_tax trajectory that minimizes unemployment while reaching carbon neutrality by 2040"

---

## Appendix B: Error Codes

| Code | Description |
|------|-------------|
| `SDL-E001` | Syntax error |
| `SDL-E002` | Unknown keyword |
| `SDL-E003` | Type mismatch |
| `SDL-E004` | Cyclic dependency in causal graph |
| `SDL-E005` | Undefined variable reference |
| `SDL-E006` | Duplicate declaration |
| `SDL-E007` | Invalid distribution parameters |
| `SDL-E008` | Timeframe out of bounds |
| `SDL-E009` | Invalid temporal resolution |
| `SDL-E010` | Import not found |
| `SDL-W001` | Assumption without source |
| `SDL-W002` | Variable without uncertainty |
| `SDL-W003` | High convergence threshold |
| `SDL-W004` | Data binding source unreachable |
| `SDL-W005` | Watch deviation exceeded |

---

*SDL is created by Relatronica — imagining possible futures and building tools to navigate them.*

*From CERN came the Web to share the knowledge of the present. From those who met at CERN comes the language to share the knowledge of the future.*
