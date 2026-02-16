/**
 * SDL Core — Scenario Description Language
 *
 * Core module: lexer, parser, validator, types.
 */

// Types
export type {
  // Token types
  Token,
  TokenType,
  SourceLocation,
  SourceSpan,

  // AST nodes
  ASTNode,
  ScenarioNode,
  ScenarioMetadata,
  Declaration,
  VariableNode,
  AssumptionNode,
  ParameterNode,
  BranchNode,
  ImpactNode,
  SimulateNode,
  WatchNode,
  WatchRule,
  OnTriggerNode,
  CalibrateNode,
  BindNode,
  ImportNode,

  // Expressions
  ExpressionNode,
  NumberLiteral,
  PercentageLiteral,
  CurrencyLiteral,
  StringLiteral,
  BooleanLiteral,
  DateLiteral,
  DurationLiteral,
  IdentifierNode,
  QualifiedIdentifier,
  BinaryExpression,
  UnaryExpression,
  FunctionCall,
  DistributionExpression,
  ModelExpression,
  RecordExpression,
  ArrayExpression,
  TemporalExpression,

  // Value types
  DateValue,
  DurationValue,
  TimeseriesEntry,
  RecordValue,

  // Enum types
  DistributionType,
  ModelType,
  InterpolationMethod,
  ResolutionValue,
  SimulationMethod,
  OutputType,
  CalibrationMethod,
  RefreshRate,
  BinaryOperator,
  UnaryOperator,
  TemporalOperator,
  CurrencyCode,
  Magnitude,

  // Results
  SimulationResult,
  VariableResult,
  ImpactResult,
  BranchResult,
  DistributionResult,
  TimeseriesResult,

  // Validation
  Diagnostic,
  DiagnosticSeverity,
  ValidationResult,
  CausalGraph,
  CausalNode,
  CausalEdge,

  // Data binding
  BoundValue,
  WatchAlert,

  // Compiler interface
  CompileRequest,
  CompileResult,
  NarrateRequest,
  NarrateResult,
  MutateRequest,
  MutateResult,
} from './types';

// Lexer
export { Lexer, tokenize } from './lexer';
export type { LexerResult } from './lexer';

// Parser
export { Parser, parse } from './parser';
export type { ParseResult } from './parser';

// Validator
export { validate } from './validator';
