/**
 * SDL — Scenario Description Language
 * Abstract Syntax Tree Type Definitions
 *
 * Spec: v0.1
 * License: MIT
 * (c) Relatronica 2026
 */
export declare enum TokenType {
    Number = "Number",
    Percentage = "Percentage",
    Currency = "Currency",
    String = "String",
    Boolean = "Boolean",
    Date = "Date",
    Duration = "Duration",
    Identifier = "Identifier",
    LeftBrace = "LeftBrace",// {
    RightBrace = "RightBrace",// }
    LeftBracket = "LeftBracket",// [
    RightBracket = "RightBracket",// ]
    LeftParen = "LeftParen",// (
    RightParen = "RightParen",// )
    Colon = "Colon",// :
    Comma = "Comma",// ,
    Dot = "Dot",// .
    Arrow = "Arrow",// ->
    PlusMinus = "PlusMinus",// ±
    Plus = "Plus",
    Minus = "Minus",
    Star = "Star",
    Slash = "Slash",
    Caret = "Caret",
    Percent = "Percent",
    Equal = "Equal",// =
    GreaterThan = "GreaterThan",
    LessThan = "LessThan",
    GreaterEqual = "GreaterEqual",
    LessEqual = "LessEqual",
    EqualEqual = "EqualEqual",
    NotEqual = "NotEqual",
    Scenario = "Scenario",
    Variable = "Variable",
    Assumption = "Assumption",
    Parameter = "Parameter",
    Constant = "Constant",
    Branch = "Branch",
    Impact = "Impact",
    Simulate = "Simulate",
    Watch = "Watch",
    Calibrate = "Calibrate",
    Bind = "Bind",
    Import = "Import",
    Export = "Export",
    As = "As",
    When = "When",
    If = "If",
    Else = "Else",
    And = "And",
    Or = "Or",
    Not = "Not",
    On = "On",
    By = "By",
    From = "From",
    To = "To",
    At = "At",
    Between = "Between",
    True = "True",
    False = "False",
    Warn = "Warn",
    Error = "Error",
    Fork = "Fork",
    Normal = "Normal",
    Uniform = "Uniform",
    Beta = "Beta",
    Triangular = "Triangular",
    Lognormal = "Lognormal",
    Custom = "Custom",
    Linear = "Linear",
    Logistic = "Logistic",
    Exponential = "Exponential",
    Sigmoid = "Sigmoid",
    Polynomial = "Polynomial",
    Yearly = "Yearly",
    Monthly = "Monthly",
    Weekly = "Weekly",
    Daily = "Daily",
    Timeframe = "Timeframe",
    Resolution = "Resolution",
    Confidence = "Confidence",
    Author = "Author",
    Version = "Version",
    Description = "Description",
    Tags = "Tags",
    DependsOn = "DependsOn",
    Model = "Model",
    Uncertainty = "Uncertainty",
    Unit = "Unit",
    Interpolation = "Interpolation",
    Value = "Value",
    Source = "Source",
    Range = "Range",
    Probability = "Probability",
    Runs = "Runs",
    Method = "Method",
    Seed = "Seed",
    Output = "Output",
    Percentiles = "Percentiles",
    Convergence = "Convergence",
    Timeout = "Timeout",
    Refresh = "Refresh",
    Field = "Field",
    Transform = "Transform",
    Fallback = "Fallback",
    Historical = "Historical",
    Window = "Window",
    Prior = "Prior",
    UpdateFrequency = "UpdateFrequency",
    Recalculate = "Recalculate",
    Notify = "Notify",
    Suggest = "Suggest",
    OnTrigger = "OnTrigger",
    DerivesFrom = "DerivesFrom",
    Formula = "Formula",
    Compose = "Compose",
    MonteCarlo = "MonteCarlo",
    LatinHypercube = "LatinHypercube",
    Sobol = "Sobol",
    BayesianUpdate = "BayesianUpdate",
    MaximumLikelihood = "MaximumLikelihood",
    Ensemble = "Ensemble",
    Distribution = "Distribution",
    Summary = "Summary",
    Full = "Full",
    EOF = "EOF",
    Newline = "Newline"
}
export interface SourceLocation {
    line: number;
    column: number;
    offset: number;
}
export interface SourceSpan {
    start: SourceLocation;
    end: SourceLocation;
}
export interface Token {
    type: TokenType;
    value: string;
    span: SourceSpan;
}
export type ASTNode = ScenarioNode | VariableNode | AssumptionNode | ParameterNode | BranchNode | ImpactNode | SimulateNode | WatchNode | CalibrateNode | BindNode | ImportNode | ExpressionNode;
interface BaseNode {
    span: SourceSpan;
}
export interface ScenarioNode extends BaseNode {
    type: 'Scenario';
    name: string;
    metadata: ScenarioMetadata;
    declarations: Declaration[];
}
export interface ScenarioMetadata {
    timeframe?: TimeframeValue;
    resolution?: ResolutionValue;
    confidence?: number;
    author?: string;
    version?: string;
    description?: string;
    tags?: string[];
}
export interface TimeframeValue {
    start: DateValue;
    end: DateValue;
}
export type ResolutionValue = 'yearly' | 'monthly' | 'weekly' | 'daily';
export interface DateValue {
    year: number;
    month?: number;
    day?: number;
}
export type Declaration = VariableNode | AssumptionNode | ParameterNode | BranchNode | ImpactNode | SimulateNode | WatchNode | CalibrateNode | ImportNode;
export interface VariableNode extends BaseNode {
    type: 'Variable';
    name: string;
    description?: string;
    unit?: string;
    timeseries: TimeseriesEntry[];
    dependsOn?: string[];
    model?: ModelExpression;
    uncertainty?: DistributionExpression;
    interpolation?: InterpolationMethod;
}
export interface TimeseriesEntry {
    date: DateValue;
    value: ExpressionNode | RecordValue;
}
export interface RecordValue {
    type: 'Record';
    fields: {
        key: string;
        value: ExpressionNode;
    }[];
}
export type InterpolationMethod = 'linear' | 'step' | 'spline';
export interface AssumptionNode extends BaseNode {
    type: 'Assumption';
    name: string;
    value?: ExpressionNode;
    byDate?: DateValue;
    source?: string;
    confidence?: number;
    uncertainty?: DistributionExpression;
    bind?: BindNode;
    watch?: WatchNode;
}
export interface ParameterNode extends BaseNode {
    type: 'Parameter';
    name: string;
    value?: ExpressionNode;
    range?: {
        min: ExpressionNode;
        max: ExpressionNode;
    };
    description?: string;
}
export interface BranchNode extends BaseNode {
    type: 'Branch';
    name: string;
    condition: ExpressionNode;
    probability?: number;
    fork?: string;
    declarations: Declaration[];
}
export interface ImpactNode extends BaseNode {
    type: 'Impact';
    name: string;
    description?: string;
    unit?: string;
    derivesFrom?: string[];
    formula?: ExpressionNode;
}
export interface ImpactListNode extends BaseNode {
    type: 'ImpactList';
    targets: string[];
}
export interface SimulateNode extends BaseNode {
    type: 'Simulate';
    runs?: number;
    method?: SimulationMethod;
    seed?: number;
    output?: OutputType;
    percentiles?: number[];
    convergence?: number;
    timeout?: DurationValue;
}
export type SimulationMethod = 'monte_carlo' | 'latin_hypercube' | 'sobol';
export type OutputType = 'distribution' | 'percentiles' | 'summary' | 'full';
export interface DurationValue {
    amount: number;
    unit: 'y' | 'm' | 'w' | 'd' | 's';
}
export interface WatchNode extends BaseNode {
    type: 'Watch';
    target?: string;
    rules: WatchRule[];
    onTrigger?: OnTriggerNode;
}
export interface WatchRule {
    severity: 'warn' | 'error';
    condition: ExpressionNode;
}
export interface OnTriggerNode {
    recalculate?: boolean;
    notify?: string[];
    suggest?: string;
}
export interface CalibrateNode extends BaseNode {
    type: 'Calibrate';
    target: string;
    historical?: string;
    method?: CalibrationMethod;
    window?: DurationValue;
    prior?: DistributionExpression;
    updateFrequency?: RefreshRate;
}
export type CalibrationMethod = 'bayesian_update' | 'maximum_likelihood' | 'ensemble';
export type RefreshRate = 'realtime' | 'hourly' | 'daily' | 'weekly' | 'monthly';
export interface BindNode extends BaseNode {
    type: 'Bind';
    source?: string;
    refresh?: RefreshRate;
    field?: string;
    transform?: ExpressionNode;
    fallback?: ExpressionNode;
}
export interface ImportNode extends BaseNode {
    type: 'Import';
    path: string;
    alias: string;
}
export type ExpressionNode = NumberLiteral | PercentageLiteral | CurrencyLiteral | StringLiteral | BooleanLiteral | DateLiteral | DurationLiteral | IdentifierNode | QualifiedIdentifier | BinaryExpression | UnaryExpression | FunctionCall | DistributionExpression | ModelExpression | TemporalExpression | RecordExpression | ArrayExpression;
export interface NumberLiteral extends BaseNode {
    type: 'NumberLiteral';
    value: number;
}
export interface PercentageLiteral extends BaseNode {
    type: 'PercentageLiteral';
    value: number;
}
export interface CurrencyLiteral extends BaseNode {
    type: 'CurrencyLiteral';
    value: number;
    currency: CurrencyCode;
    magnitude?: Magnitude;
}
export type CurrencyCode = 'EUR' | 'USD' | 'GBP' | 'CHF' | 'JPY' | 'CNY';
export type Magnitude = 'K' | 'M' | 'B' | 'T';
export interface StringLiteral extends BaseNode {
    type: 'StringLiteral';
    value: string;
}
export interface BooleanLiteral extends BaseNode {
    type: 'BooleanLiteral';
    value: boolean;
}
export interface DateLiteral extends BaseNode {
    type: 'DateLiteral';
    value: DateValue;
}
export interface DurationLiteral extends BaseNode {
    type: 'DurationLiteral';
    value: DurationValue;
}
export interface IdentifierNode extends BaseNode {
    type: 'Identifier';
    name: string;
}
export interface QualifiedIdentifier extends BaseNode {
    type: 'QualifiedIdentifier';
    parts: string[];
}
export interface BinaryExpression extends BaseNode {
    type: 'BinaryExpression';
    operator: BinaryOperator;
    left: ExpressionNode;
    right: ExpressionNode;
}
export type BinaryOperator = '+' | '-' | '*' | '/' | '^' | '%' | '>' | '<' | '>=' | '<=' | '==' | '!=' | 'and' | 'or';
export interface UnaryExpression extends BaseNode {
    type: 'UnaryExpression';
    operator: UnaryOperator;
    operand: ExpressionNode;
}
export type UnaryOperator = '-' | 'not';
export interface FunctionCall extends BaseNode {
    type: 'FunctionCall';
    name: string;
    arguments: ExpressionNode[];
}
export interface DistributionExpression extends BaseNode {
    type: 'DistributionExpression';
    distribution: DistributionType;
    params: ExpressionNode[];
    namedParams?: {
        name: string;
        value: ExpressionNode;
    }[];
}
export type DistributionType = 'normal' | 'uniform' | 'beta' | 'triangular' | 'lognormal' | 'custom';
export interface ModelExpression extends BaseNode {
    type: 'ModelExpression';
    model: ModelType;
    params: {
        name: string;
        value: ExpressionNode;
    }[];
}
export type ModelType = 'linear' | 'logistic' | 'exponential' | 'sigmoid' | 'polynomial' | 'custom';
export interface TemporalExpression extends BaseNode {
    type: 'TemporalExpression';
    target: ExpressionNode;
    operator: TemporalOperator;
    start: DateValue;
    end?: DateValue;
}
export type TemporalOperator = 'at' | 'between' | 'by' | 'from_to';
export interface RecordExpression extends BaseNode {
    type: 'RecordExpression';
    fields: {
        key: string;
        value: ExpressionNode;
    }[];
}
export interface ArrayExpression extends BaseNode {
    type: 'ArrayExpression';
    elements: ExpressionNode[];
}
export interface SimulationResult {
    scenario: string;
    config: SimulateNode;
    runs: number;
    timesteps: Date[];
    variables: Map<string, VariableResult>;
    impacts: Map<string, ImpactResult>;
    branches: Map<string, BranchResult>;
    convergenceReached: boolean;
    elapsedMs: number;
    seed: number;
}
export interface VariableResult {
    name: string;
    unit?: string;
    timeseries: TimeseriesResult[];
}
export interface TimeseriesResult {
    date: Date;
    distribution: DistributionResult;
}
export interface DistributionResult {
    mean: number;
    median: number;
    std: number;
    min: number;
    max: number;
    percentiles: Map<number, number>;
    samples?: number[];
}
export interface ImpactResult extends VariableResult {
    sensitivity: Map<string, number>;
}
export interface BranchResult {
    name: string;
    activationRate: number;
    variables: Map<string, VariableResult>;
}
export type DiagnosticSeverity = 'error' | 'warning' | 'info';
export interface Diagnostic {
    code: string;
    severity: DiagnosticSeverity;
    message: string;
    span: SourceSpan;
    hint?: string;
}
export interface ValidationResult {
    valid: boolean;
    diagnostics: Diagnostic[];
    causalGraph?: CausalGraph;
}
export interface CausalGraph {
    nodes: CausalNode[];
    edges: CausalEdge[];
    topologicalOrder: string[];
}
export interface CausalNode {
    id: string;
    type: 'variable' | 'assumption' | 'parameter' | 'impact';
}
export interface CausalEdge {
    from: string;
    to: string;
}
export interface BoundValue {
    assumed: number;
    actual: number | null;
    deviation: number | null;
    lastUpdated: Date | null;
    status: 'ok' | 'warn' | 'error' | 'unreachable';
}
export interface WatchAlert {
    target: string;
    severity: 'warn' | 'error';
    assumed: number;
    actual: number;
    deviation: number;
    message: string;
    timestamp: Date;
}
export interface CompileRequest {
    naturalLanguage: string;
    context?: {
        existingScenario?: ScenarioNode;
        availableDataSources?: string[];
        domain?: string;
    };
}
export interface CompileResult {
    sdl: string;
    ast: ScenarioNode;
    confidence: number;
    warnings: string[];
    groundedSources: {
        claim: string;
        source: string;
        confidence: number;
    }[];
}
export interface NarrateRequest {
    scenario: ScenarioNode;
    results?: SimulationResult;
    style?: 'technical' | 'executive' | 'public' | 'educational';
    language?: string;
}
export interface NarrateResult {
    narrative: string;
    keyInsights: string[];
    risksIdentified: string[];
    recommendations: string[];
}
export interface MutateRequest {
    scenario: ScenarioNode;
    instruction: string;
}
export interface MutateResult {
    sdl: string;
    ast: ScenarioNode;
    diff: string;
    explanation: string;
}
export {};
//# sourceMappingURL=types.d.ts.map