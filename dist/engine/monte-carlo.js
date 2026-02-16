/**
 * SDL — Scenario Description Language
 * Monte Carlo Simulation Engine
 *
 * Executes SDL scenarios via Monte Carlo simulation,
 * propagating uncertainty through the causal graph.
 */
import { validate } from '../core/validator';
// ============================================================
// Random Number Generation (Seedable)
// ============================================================
class SeededRNG {
    state;
    constructor(seed) {
        this.state = seed;
    }
    /** Returns a pseudo-random number in [0, 1) using xorshift32 */
    next() {
        this.state ^= this.state << 13;
        this.state ^= this.state >> 17;
        this.state ^= this.state << 5;
        return (this.state >>> 0) / 4294967296;
    }
    /** Normal distribution via Box-Muller transform */
    normalSample(mean, std) {
        const u1 = this.next();
        const u2 = this.next();
        const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        return mean + std * z;
    }
    /** Uniform distribution in [min, max] */
    uniformSample(min, max) {
        return min + this.next() * (max - min);
    }
    /** Beta distribution via Jöhnk's algorithm (for small alpha, beta) */
    betaSample(alpha, beta) {
        const ga = this.gammaSample(alpha, 1);
        const gb = this.gammaSample(beta, 1);
        return ga / (ga + gb);
    }
    /** Gamma distribution via Marsaglia and Tsang's method */
    gammaSample(shape, scale) {
        if (shape < 1) {
            return this.gammaSample(shape + 1, scale) * Math.pow(this.next(), 1 / shape);
        }
        const d = shape - 1 / 3;
        const c = 1 / Math.sqrt(9 * d);
        while (true) {
            let x;
            let v;
            do {
                x = this.normalSample(0, 1);
                v = 1 + c * x;
            } while (v <= 0);
            v = v * v * v;
            const u = this.next();
            if (u < 1 - 0.0331 * x * x * x * x)
                return d * v * scale;
            if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v)))
                return d * v * scale;
        }
    }
    /** Triangular distribution */
    triangularSample(min, mode, max) {
        const u = this.next();
        const fc = (mode - min) / (max - min);
        if (u < fc) {
            return min + Math.sqrt(u * (max - min) * (mode - min));
        }
        return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
    }
    /** Lognormal distribution */
    lognormalSample(mu, sigma) {
        return Math.exp(this.normalSample(mu, sigma));
    }
}
// ============================================================
// Distribution Sampler
// ============================================================
function sampleDistribution(dist, baseValue, rng) {
    switch (dist.distribution) {
        case 'normal': {
            if (dist.params.length === 1) {
                // ±X% shorthand: normal around baseValue
                const pctParam = dist.params[0];
                const pct = extractNumber(pctParam) / 100;
                return rng.normalSample(baseValue, baseValue * pct);
            }
            if (dist.params.length >= 2) {
                const mean = extractNumber(dist.params[0]);
                const std = extractNumber(dist.params[1]);
                return rng.normalSample(mean, std);
            }
            return baseValue;
        }
        case 'uniform': {
            if (dist.params.length >= 2) {
                const min = extractNumber(dist.params[0]);
                const max = extractNumber(dist.params[1]);
                return rng.uniformSample(min * baseValue, max * baseValue);
            }
            return baseValue;
        }
        case 'beta': {
            if (dist.params.length >= 2) {
                const alpha = extractNumber(dist.params[0]);
                const beta = extractNumber(dist.params[1]);
                return rng.betaSample(alpha, beta);
            }
            return baseValue;
        }
        case 'triangular': {
            if (dist.params.length >= 3) {
                const min = extractNumber(dist.params[0]);
                const mode = extractNumber(dist.params[1]);
                const max = extractNumber(dist.params[2]);
                return rng.triangularSample(min, mode, max);
            }
            return baseValue;
        }
        case 'lognormal': {
            if (dist.params.length >= 2) {
                const mu = extractNumber(dist.params[0]);
                const sigma = extractNumber(dist.params[1]);
                return rng.lognormalSample(mu, sigma);
            }
            return baseValue;
        }
        default:
            return baseValue;
    }
}
function extractNumber(expr) {
    switch (expr.type) {
        case 'NumberLiteral': return expr.value;
        case 'PercentageLiteral': return expr.value;
        case 'CurrencyLiteral': return expr.value;
        case 'UnaryExpression': {
            if (expr.operator === '-')
                return -extractNumber(expr.operand);
            return extractNumber(expr.operand);
        }
        default: return 0;
    }
}
// ============================================================
// Model Evaluation
// ============================================================
function evaluateModel(model, t, t0) {
    const params = new Map(model.params.map(p => [p.name, extractNumber(p.value)]));
    const dt = t - t0;
    switch (model.model) {
        case 'linear': {
            const slope = params.get('slope') ?? 0;
            const intercept = params.get('intercept') ?? 0;
            return intercept + slope * dt;
        }
        case 'logistic': {
            const k = params.get('k') ?? 0.1;
            const midpoint = params.get('midpoint') ?? (t0 + 10);
            const max = params.get('max') ?? 1;
            return max / (1 + Math.exp(-k * (t - midpoint)));
        }
        case 'exponential': {
            const rate = params.get('rate') ?? 0.05;
            const base = params.get('base') ?? 1;
            return base * Math.exp(rate * dt);
        }
        case 'sigmoid': {
            const k = params.get('k') ?? 0.5;
            const midpoint = params.get('midpoint') ?? (t0 + 10);
            return 1 / (1 + Math.exp(-k * (t - midpoint)));
        }
        case 'polynomial': {
            const coefficients = [];
            for (let i = 0; params.has(`c${i}`); i++) {
                coefficients.push(params.get(`c${i}`));
            }
            let result = 0;
            for (let i = 0; i < coefficients.length; i++) {
                result += coefficients[i] * Math.pow(dt, i);
            }
            return result;
        }
        default:
            return 0;
    }
}
// ============================================================
// Timeseries Interpolation
// ============================================================
function interpolateTimeseries(entries, targetYear, method = 'linear') {
    if (entries.length === 0)
        return null;
    if (entries.length === 1)
        return entries[0].value;
    // Before first entry
    if (targetYear <= entries[0].year)
        return entries[0].value;
    // After last entry
    if (targetYear >= entries[entries.length - 1].year) {
        return entries[entries.length - 1].value;
    }
    // Find surrounding entries
    for (let i = 0; i < entries.length - 1; i++) {
        const prev = entries[i];
        const next = entries[i + 1];
        if (targetYear >= prev.year && targetYear <= next.year) {
            switch (method) {
                case 'step':
                    return prev.value;
                case 'linear': {
                    const t = (targetYear - prev.year) / (next.year - prev.year);
                    return prev.value + t * (next.value - prev.value);
                }
                case 'spline':
                    // Catmull-Rom spline for smoother interpolation
                    return catmullRomInterpolate(entries, i, targetYear);
            }
        }
    }
    return null;
}
function catmullRomInterpolate(entries, index, targetYear) {
    const p0 = entries[Math.max(0, index - 1)];
    const p1 = entries[index];
    const p2 = entries[index + 1];
    const p3 = entries[Math.min(entries.length - 1, index + 2)];
    const t = (targetYear - p1.year) / (p2.year - p1.year);
    const t2 = t * t;
    const t3 = t2 * t;
    return 0.5 * ((2 * p1.value) +
        (-p0.value + p2.value) * t +
        (2 * p0.value - 5 * p1.value + 4 * p2.value - p3.value) * t2 +
        (-p0.value + 3 * p1.value - 3 * p2.value + p3.value) * t3);
}
const DEFAULT_CONFIG = {
    runs: 1000,
    method: 'monte_carlo',
    seed: Date.now(),
    percentiles: [5, 25, 50, 75, 95],
    convergence: 0.01,
    timeoutMs: 60000,
};
export function simulate(scenario, configOverride) {
    const config = { ...DEFAULT_CONFIG, ...configOverride };
    // Extract simulation config from scenario
    const simNode = scenario.declarations.find(d => d.type === 'Simulate');
    if (simNode) {
        if (simNode.runs)
            config.runs = simNode.runs;
        if (simNode.method)
            config.method = simNode.method;
        if (simNode.seed)
            config.seed = simNode.seed;
        if (simNode.percentiles)
            config.percentiles = simNode.percentiles;
        if (simNode.convergence)
            config.convergence = simNode.convergence;
    }
    // Validate first
    const validation = validate(scenario);
    if (!validation.valid) {
        throw new Error(`Scenario validation failed:\n${validation.diagnostics
            .filter(d => d.severity === 'error')
            .map(d => `  [${d.code}] ${d.message}`)
            .join('\n')}`);
    }
    const causalGraph = validation.causalGraph;
    const startTime = Date.now();
    // Resolve timeframe
    const timeframe = scenario.metadata.timeframe || {
        start: { year: 2025 },
        end: { year: 2050 },
    };
    const resolution = scenario.metadata.resolution || 'yearly';
    const timesteps = generateTimesteps(timeframe.start, timeframe.end, resolution);
    // Collect declarations by type
    const variables = new Map();
    const assumptions = new Map();
    const parameters = new Map();
    const branches = [];
    const impacts = new Map();
    for (const decl of scenario.declarations) {
        switch (decl.type) {
            case 'Variable':
                variables.set(decl.name, decl);
                break;
            case 'Assumption':
                assumptions.set(decl.name, decl);
                break;
            case 'Parameter':
                parameters.set(decl.name, decl);
                break;
            case 'Branch':
                branches.push(decl);
                break;
            case 'Impact':
                if (decl.name !== '_list')
                    impacts.set(decl.name, decl);
                break;
        }
    }
    // Prepare result collectors
    const variableCollectors = new Map();
    const impactCollectors = new Map();
    const branchActivations = new Map();
    for (const [name] of variables) {
        variableCollectors.set(name, new Map());
        for (const ts of timesteps) {
            variableCollectors.get(name).set(ts.getFullYear(), []);
        }
    }
    for (const [name] of impacts) {
        impactCollectors.set(name, new Map());
        for (const ts of timesteps) {
            impactCollectors.get(name).set(ts.getFullYear(), []);
        }
    }
    for (const branch of branches) {
        branchActivations.set(branch.name, 0);
    }
    // Precompute timeseries data for each variable
    const variableTimeseries = new Map();
    for (const [name, varNode] of variables) {
        const entries = [];
        for (const entry of varNode.timeseries) {
            const val = extractNumber(entry.value);
            entries.push({ year: entry.date.year, value: val });
        }
        entries.sort((a, b) => a.year - b.year);
        variableTimeseries.set(name, entries);
    }
    const rng = new SeededRNG(config.seed);
    let convergenceReached = false;
    // ── Main simulation loop ──
    for (let run = 0; run < config.runs; run++) {
        // Check timeout
        if (Date.now() - startTime > config.timeoutMs)
            break;
        // 1. Sample assumptions
        const state = new Map();
        for (const [name, assump] of assumptions) {
            const baseValue = assump.value ? extractNumber(assump.value) : 0;
            const sampledValue = assump.uncertainty
                ? sampleDistribution(assump.uncertainty, baseValue, rng)
                : baseValue;
            state.set(name, new Map());
            for (const ts of timesteps) {
                state.get(name).set(ts.getFullYear(), sampledValue);
            }
        }
        // 2. Sample parameters
        for (const [name, param] of parameters) {
            const baseValue = param.value ? extractNumber(param.value) : 0;
            let sampledValue = baseValue;
            if (param.range) {
                const min = extractNumber(param.range.min);
                const max = extractNumber(param.range.max);
                sampledValue = rng.uniformSample(min, max);
            }
            state.set(name, new Map());
            for (const ts of timesteps) {
                state.get(name).set(ts.getFullYear(), sampledValue);
            }
        }
        // 3. Compute variables in topological order
        const t0 = timeframe.start.year;
        for (const varName of causalGraph.topologicalOrder) {
            if (!variables.has(varName))
                continue;
            const varNode = variables.get(varName);
            const tsEntries = variableTimeseries.get(varName) || [];
            state.set(varName, new Map());
            for (const ts of timesteps) {
                const year = ts.getFullYear();
                // Base value from timeseries interpolation or model
                let baseValue;
                if (tsEntries.length > 0) {
                    baseValue = interpolateTimeseries(tsEntries, year, varNode.interpolation || 'linear') ?? 0;
                }
                else if (varNode.model) {
                    baseValue = evaluateModel(varNode.model, year, t0);
                }
                else {
                    baseValue = 0;
                }
                // Apply dependency modulation
                if (varNode.dependsOn && varNode.model) {
                    let modulation = 1;
                    for (const dep of varNode.dependsOn) {
                        const baseName = dep.split('.')[0];
                        const depState = state.get(baseName);
                        if (depState) {
                            const depValue = depState.get(year) ?? 0;
                            modulation *= (1 + depValue * 0.01);
                        }
                    }
                    baseValue *= modulation;
                }
                // Apply uncertainty
                let finalValue = baseValue;
                if (varNode.uncertainty) {
                    finalValue = sampleDistribution(varNode.uncertainty, baseValue, rng);
                }
                state.get(varName).set(year, finalValue);
            }
        }
        // 4. Evaluate branches
        for (const branch of branches) {
            let activated = false;
            for (const ts of timesteps) {
                const year = ts.getFullYear();
                if (evaluateCondition(branch.condition, state, year)) {
                    if (rng.next() < (branch.probability ?? 0.5)) {
                        activated = true;
                        branchActivations.set(branch.name, (branchActivations.get(branch.name) || 0) + 1);
                        break;
                    }
                }
            }
        }
        // 5. Collect results
        for (const [name] of variables) {
            const varState = state.get(name);
            if (!varState)
                continue;
            for (const ts of timesteps) {
                const year = ts.getFullYear();
                variableCollectors.get(name).get(year).push(varState.get(year) ?? 0);
            }
        }
        // 6. Compute impacts
        for (const [name, impact] of impacts) {
            for (const ts of timesteps) {
                const year = ts.getFullYear();
                let impactValue = 0;
                if (impact.formula) {
                    impactValue = evaluateExpression(impact.formula, state, year);
                }
                else if (impact.derivesFrom) {
                    for (const dep of impact.derivesFrom) {
                        const baseName = dep.split('.')[0];
                        const depState = state.get(baseName);
                        if (depState) {
                            impactValue += depState.get(year) ?? 0;
                        }
                    }
                }
                impactCollectors.get(name).get(year).push(impactValue);
            }
        }
        // 7. Check convergence every 100 runs
        if (run > 0 && run % 100 === 0 && config.convergence > 0) {
            const converged = checkConvergence(variableCollectors, config.convergence);
            if (converged) {
                convergenceReached = true;
                config.onProgress?.({
                    completedRuns: run + 1,
                    totalRuns: config.runs,
                    elapsedMs: Date.now() - startTime,
                    convergenceMetric: config.convergence,
                });
                break;
            }
        }
        // Progress callback
        if (run % 100 === 0) {
            config.onProgress?.({
                completedRuns: run + 1,
                totalRuns: config.runs,
                elapsedMs: Date.now() - startTime,
                convergenceMetric: null,
            });
        }
    }
    const elapsedMs = Date.now() - startTime;
    // ── Aggregate results ──
    const variableResults = new Map();
    for (const [name, yearMap] of variableCollectors) {
        const varNode = variables.get(name);
        const timeseries = [];
        for (const ts of timesteps) {
            const year = ts.getFullYear();
            const samples = yearMap.get(year) || [];
            timeseries.push({
                date: ts,
                distribution: computeDistribution(samples, config.percentiles),
            });
        }
        variableResults.set(name, {
            name,
            unit: varNode.unit,
            timeseries,
        });
    }
    const impactResults = new Map();
    for (const [name, yearMap] of impactCollectors) {
        const impactNode = impacts.get(name);
        const timeseries = [];
        for (const ts of timesteps) {
            const year = ts.getFullYear();
            const samples = yearMap.get(year) || [];
            timeseries.push({
                date: ts,
                distribution: computeDistribution(samples, config.percentiles),
            });
        }
        impactResults.set(name, {
            name,
            unit: impactNode.unit,
            timeseries,
            sensitivity: new Map(),
        });
    }
    const branchResults = new Map();
    for (const branch of branches) {
        const activations = branchActivations.get(branch.name) || 0;
        branchResults.set(branch.name, {
            name: branch.name,
            activationRate: activations / config.runs,
            variables: new Map(),
        });
    }
    const actualRuns = variableCollectors.values().next().value?.values().next().value?.length ?? 0;
    return {
        scenario: scenario.name,
        config: scenario.declarations.find(d => d.type === 'Simulate') || {
            type: 'Simulate', span: scenario.span,
        },
        runs: actualRuns,
        timesteps,
        variables: variableResults,
        impacts: impactResults,
        branches: branchResults,
        convergenceReached,
        elapsedMs,
        seed: config.seed,
    };
}
// ============================================================
// Helper Functions
// ============================================================
function generateTimesteps(start, end, resolution) {
    const steps = [];
    switch (resolution) {
        case 'yearly': {
            for (let y = start.year; y <= end.year; y++) {
                steps.push(new Date(y, 0, 1));
            }
            break;
        }
        case 'monthly': {
            for (let y = start.year; y <= end.year; y++) {
                const startMonth = y === start.year ? (start.month || 1) - 1 : 0;
                const endMonth = y === end.year ? (end.month || 12) - 1 : 11;
                for (let m = startMonth; m <= endMonth; m++) {
                    steps.push(new Date(y, m, 1));
                }
            }
            break;
        }
        case 'weekly': {
            const startDate = new Date(start.year, (start.month || 1) - 1, start.day || 1);
            const endDate = new Date(end.year, (end.month || 12) - 1, end.day || 28);
            const current = new Date(startDate);
            while (current <= endDate) {
                steps.push(new Date(current));
                current.setDate(current.getDate() + 7);
            }
            break;
        }
        case 'daily': {
            const startDate = new Date(start.year, (start.month || 1) - 1, start.day || 1);
            const endDate = new Date(end.year, (end.month || 12) - 1, end.day || 28);
            const current = new Date(startDate);
            while (current <= endDate) {
                steps.push(new Date(current));
                current.setDate(current.getDate() + 1);
            }
            break;
        }
    }
    return steps;
}
function evaluateCondition(expr, state, year) {
    const result = evaluateExpression(expr, state, year);
    return result !== 0;
}
function evaluateExpression(expr, state, year) {
    switch (expr.type) {
        case 'NumberLiteral':
            return expr.value;
        case 'PercentageLiteral':
            return expr.value / 100;
        case 'CurrencyLiteral':
            return expr.value;
        case 'BooleanLiteral':
            return expr.value ? 1 : 0;
        case 'Identifier': {
            const varState = state.get(expr.name);
            if (varState)
                return varState.get(year) ?? 0;
            return 0;
        }
        case 'QualifiedIdentifier': {
            const baseName = expr.parts[0];
            const varState = state.get(baseName);
            if (varState)
                return varState.get(year) ?? 0;
            return 0;
        }
        case 'BinaryExpression': {
            const left = evaluateExpression(expr.left, state, year);
            const right = evaluateExpression(expr.right, state, year);
            switch (expr.operator) {
                case '+': return left + right;
                case '-': return left - right;
                case '*': return left * right;
                case '/': return right !== 0 ? left / right : 0;
                case '^': return Math.pow(left, right);
                case '%': return right !== 0 ? left % right : 0;
                case '>': return left > right ? 1 : 0;
                case '<': return left < right ? 1 : 0;
                case '>=': return left >= right ? 1 : 0;
                case '<=': return left <= right ? 1 : 0;
                case '==': return left === right ? 1 : 0;
                case '!=': return left !== right ? 1 : 0;
                case 'and': return (left !== 0 && right !== 0) ? 1 : 0;
                case 'or': return (left !== 0 || right !== 0) ? 1 : 0;
                default: return 0;
            }
        }
        case 'UnaryExpression': {
            const operand = evaluateExpression(expr.operand, state, year);
            switch (expr.operator) {
                case '-': return -operand;
                case 'not': return operand === 0 ? 1 : 0;
                default: return operand;
            }
        }
        case 'FunctionCall': {
            const args = expr.arguments.map(a => evaluateExpression(a, state, year));
            return evaluateBuiltinFunction(expr.name, args);
        }
        default:
            return 0;
    }
}
function evaluateBuiltinFunction(name, args) {
    switch (name) {
        case 'min': return Math.min(...args);
        case 'max': return Math.max(...args);
        case 'abs': return Math.abs(args[0] ?? 0);
        case 'sqrt': return Math.sqrt(args[0] ?? 0);
        case 'log': return Math.log(args[0] ?? 1);
        case 'pow': return Math.pow(args[0] ?? 0, args[1] ?? 1);
        case 'round': {
            const decimals = args[1] ?? 0;
            const factor = Math.pow(10, decimals);
            return Math.round((args[0] ?? 0) * factor) / factor;
        }
        case 'clamp': return Math.min(Math.max(args[0] ?? 0, args[1] ?? 0), args[2] ?? 1);
        case 'lerp': return (args[0] ?? 0) + (args[2] ?? 0) * ((args[1] ?? 0) - (args[0] ?? 0));
        case 'sum': return args.reduce((a, b) => a + b, 0);
        case 'avg': return args.length > 0 ? args.reduce((a, b) => a + b, 0) / args.length : 0;
        default: return 0;
    }
}
function computeDistribution(samples, percentiles) {
    if (samples.length === 0) {
        return {
            mean: 0, median: 0, std: 0, min: 0, max: 0,
            percentiles: new Map(),
        };
    }
    const sorted = [...samples].sort((a, b) => a - b);
    const n = sorted.length;
    const mean = sorted.reduce((a, b) => a + b, 0) / n;
    const variance = sorted.reduce((acc, v) => acc + (v - mean) ** 2, 0) / n;
    const std = Math.sqrt(variance);
    const percMap = new Map();
    for (const p of percentiles) {
        const index = Math.ceil((p / 100) * n) - 1;
        percMap.set(p, sorted[Math.max(0, Math.min(index, n - 1))]);
    }
    return {
        mean,
        median: sorted[Math.floor(n / 2)],
        std,
        min: sorted[0],
        max: sorted[n - 1],
        percentiles: percMap,
    };
}
function checkConvergence(collectors, threshold) {
    for (const [, yearMap] of collectors) {
        for (const [, samples] of yearMap) {
            if (samples.length < 200)
                return false;
            const half = Math.floor(samples.length / 2);
            const firstHalf = samples.slice(0, half);
            const secondHalf = samples.slice(half);
            const mean1 = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
            const mean2 = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
            if (mean1 === 0 && mean2 === 0)
                continue;
            const relativeDiff = Math.abs(mean1 - mean2) / Math.max(Math.abs(mean1), Math.abs(mean2), 1e-10);
            if (relativeDiff > threshold)
                return false;
        }
    }
    return true;
}
//# sourceMappingURL=monte-carlo.js.map