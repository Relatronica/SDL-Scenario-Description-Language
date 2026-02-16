/**
 * SDL — Scenario Description Language
 * Semantic Validator
 *
 * Validates an AST for semantic correctness:
 * - Builds the causal dependency graph
 * - Detects cycles
 * - Validates references
 * - Checks type consistency
 * - Produces diagnostics
 */

import type {
  ScenarioNode,
  Declaration,
  VariableNode,
  AssumptionNode,
  ParameterNode,
  BranchNode,
  ImpactNode,
  SimulateNode,
  DistributionExpression,
  DateValue,
  Diagnostic,
  ValidationResult,
  CausalGraph,
  CausalNode,
  CausalEdge,
  ExpressionNode,
} from './types';

export function validate(scenario: ScenarioNode): ValidationResult {
  const validator = new Validator(scenario);
  return validator.validate();
}

class Validator {
  private scenario: ScenarioNode;
  private diagnostics: Diagnostic[] = [];
  private symbols: Map<string, Declaration> = new Map();
  private causalNodes: CausalNode[] = [];
  private causalEdges: CausalEdge[] = [];

  constructor(scenario: ScenarioNode) {
    this.scenario = scenario;
  }

  validate(): ValidationResult {
    this.collectSymbols();
    this.validateMetadata();
    this.validateDeclarations();
    this.buildCausalGraph();
    const topologicalOrder = this.detectCycles();

    const causalGraph: CausalGraph = {
      nodes: this.causalNodes,
      edges: this.causalEdges,
      topologicalOrder: topologicalOrder || [],
    };

    return {
      valid: this.diagnostics.filter(d => d.severity === 'error').length === 0,
      diagnostics: this.diagnostics,
      causalGraph,
    };
  }

  // ── Symbol Collection ──

  private collectSymbols(): void {
    for (const decl of this.scenario.declarations) {
      if (!('name' in decl)) continue;

      const name = (decl as { name: string }).name;
      if (name === '_list') continue;

      if (this.symbols.has(name)) {
        this.diagnostics.push({
          code: 'SDL-E006',
          severity: 'error',
          message: `Duplicate declaration: "${name}"`,
          span: decl.span,
          hint: 'Each variable, assumption, and parameter must have a unique name within a scenario.',
        });
      } else {
        this.symbols.set(name, decl);
      }
    }
  }

  // ── Metadata Validation ──

  private validateMetadata(): void {
    const meta = this.scenario.metadata;

    if (!meta.timeframe) {
      this.diagnostics.push({
        code: 'SDL-W001',
        severity: 'warning',
        message: 'Scenario has no timeframe defined. Defaults will be used.',
        span: this.scenario.span,
        hint: 'Add "timeframe: 2025 -> 2050" to specify the simulation period.',
      });
    } else {
      const { start, end } = meta.timeframe;
      if (start.year >= end.year) {
        this.diagnostics.push({
          code: 'SDL-E008',
          severity: 'error',
          message: `Timeframe start (${start.year}) must be before end (${end.year})`,
          span: this.scenario.span,
        });
      }
    }

    if (meta.confidence !== undefined && (meta.confidence < 0 || meta.confidence > 1)) {
      this.diagnostics.push({
        code: 'SDL-E003',
        severity: 'error',
        message: `Confidence must be between 0 and 1, got: ${meta.confidence}`,
        span: this.scenario.span,
      });
    }
  }

  // ── Declaration Validation ──

  private validateDeclarations(): void {
    for (const decl of this.scenario.declarations) {
      switch (decl.type) {
        case 'Variable': this.validateVariable(decl); break;
        case 'Assumption': this.validateAssumption(decl); break;
        case 'Parameter': this.validateParameter(decl); break;
        case 'Branch': this.validateBranch(decl); break;
        case 'Impact': this.validateImpact(decl); break;
        case 'Simulate': this.validateSimulate(decl); break;
      }
    }
  }

  private validateVariable(node: VariableNode): void {
    if (node.dependsOn) {
      for (const dep of node.dependsOn) {
        const baseName = dep.split('.')[0];
        if (!this.symbols.has(baseName)) {
          this.diagnostics.push({
            code: 'SDL-E005',
            severity: 'error',
            message: `Variable "${node.name}" depends on undefined symbol: "${dep}"`,
            span: node.span,
            hint: `Make sure "${baseName}" is declared as a variable, assumption, or parameter.`,
          });
        }
      }
    }

    if (!node.uncertainty) {
      this.diagnostics.push({
        code: 'SDL-W002',
        severity: 'warning',
        message: `Variable "${node.name}" has no uncertainty defined. It will be treated as deterministic.`,
        span: node.span,
        hint: 'Add "uncertainty: normal(±10%)" to enable Monte Carlo sampling.',
      });
    }

    if (node.timeseries.length > 0) {
      this.validateTimeseriesOrder(node);
    }

    if (node.uncertainty) {
      this.validateDistribution(node.uncertainty, node.name);
    }
  }

  private validateTimeseriesOrder(node: VariableNode): void {
    for (let i = 1; i < node.timeseries.length; i++) {
      const prev = node.timeseries[i - 1].date;
      const curr = node.timeseries[i].date;
      if (this.dateToNumber(curr) <= this.dateToNumber(prev)) {
        this.diagnostics.push({
          code: 'SDL-E008',
          severity: 'error',
          message: `Timeseries entries in "${node.name}" must be in chronological order`,
          span: node.span,
        });
        break;
      }
    }
  }

  private validateAssumption(node: AssumptionNode): void {
    if (!node.source) {
      this.diagnostics.push({
        code: 'SDL-W001',
        severity: 'warning',
        message: `Assumption "${node.name}" has no source. Consider adding a reference.`,
        span: node.span,
        hint: 'Add source: "URL or citation" for traceability.',
      });
    }

    if (node.confidence !== undefined && (node.confidence < 0 || node.confidence > 1)) {
      this.diagnostics.push({
        code: 'SDL-E003',
        severity: 'error',
        message: `Confidence for "${node.name}" must be between 0 and 1`,
        span: node.span,
      });
    }
  }

  private validateParameter(node: ParameterNode): void {
    if (node.range) {
      const min = this.tryEvalConstant(node.range.min);
      const max = this.tryEvalConstant(node.range.max);
      if (min !== null && max !== null && min >= max) {
        this.diagnostics.push({
          code: 'SDL-E003',
          severity: 'error',
          message: `Parameter "${node.name}" range min (${min}) must be less than max (${max})`,
          span: node.span,
        });
      }
    }
  }

  private validateBranch(node: BranchNode): void {
    if (node.probability !== undefined && (node.probability < 0 || node.probability > 1)) {
      this.diagnostics.push({
        code: 'SDL-E003',
        severity: 'error',
        message: `Branch "${node.name}" probability must be between 0 and 1, got: ${node.probability}`,
        span: node.span,
      });
    }

    this.validateExpressionReferences(node.condition, `branch "${node.name}" condition`);
  }

  private validateImpact(node: ImpactNode): void {
    if (node.derivesFrom) {
      for (const dep of node.derivesFrom) {
        const baseName = dep.split('.')[0];
        if (!this.symbols.has(baseName)) {
          this.diagnostics.push({
            code: 'SDL-E005',
            severity: 'error',
            message: `Impact "${node.name}" references undefined symbol: "${dep}"`,
            span: node.span,
          });
        }
      }
    }
  }

  private validateSimulate(node: SimulateNode): void {
    if (node.runs !== undefined && node.runs < 1) {
      this.diagnostics.push({
        code: 'SDL-E003',
        severity: 'error',
        message: `Simulation runs must be at least 1, got: ${node.runs}`,
        span: node.span,
      });
    }

    if (node.convergence !== undefined) {
      if (node.convergence <= 0 || node.convergence >= 1) {
        this.diagnostics.push({
          code: 'SDL-E003',
          severity: 'error',
          message: `Convergence threshold must be between 0 and 1 (exclusive)`,
          span: node.span,
        });
      }
      if (node.convergence > 0.1) {
        this.diagnostics.push({
          code: 'SDL-W003',
          severity: 'warning',
          message: `High convergence threshold (${node.convergence}). Results may be imprecise.`,
          span: node.span,
          hint: 'Consider a threshold of 0.01-0.05 for reliable results.',
        });
      }
    }

    if (node.percentiles) {
      for (const p of node.percentiles) {
        if (p < 0 || p > 100) {
          this.diagnostics.push({
            code: 'SDL-E003',
            severity: 'error',
            message: `Percentile values must be between 0 and 100, got: ${p}`,
            span: node.span,
          });
        }
      }
    }
  }

  private validateDistribution(dist: DistributionExpression, context: string): void {
    switch (dist.distribution) {
      case 'beta': {
        if (dist.params.length >= 2) {
          const alpha = this.tryEvalConstant(dist.params[0]);
          const beta = this.tryEvalConstant(dist.params[1]);
          if (alpha !== null && alpha <= 0) {
            this.diagnostics.push({
              code: 'SDL-E007',
              severity: 'error',
              message: `Beta distribution alpha must be > 0 in "${context}"`,
              span: dist.span,
            });
          }
          if (beta !== null && beta <= 0) {
            this.diagnostics.push({
              code: 'SDL-E007',
              severity: 'error',
              message: `Beta distribution beta must be > 0 in "${context}"`,
              span: dist.span,
            });
          }
        }
        break;
      }
      case 'uniform': {
        if (dist.params.length >= 2) {
          const min = this.tryEvalConstant(dist.params[0]);
          const max = this.tryEvalConstant(dist.params[1]);
          if (min !== null && max !== null && min >= max) {
            this.diagnostics.push({
              code: 'SDL-E007',
              severity: 'error',
              message: `Uniform distribution min must be < max in "${context}"`,
              span: dist.span,
            });
          }
        }
        break;
      }
      case 'triangular': {
        if (dist.params.length >= 3) {
          const min = this.tryEvalConstant(dist.params[0]);
          const mode = this.tryEvalConstant(dist.params[1]);
          const max = this.tryEvalConstant(dist.params[2]);
          if (min !== null && mode !== null && max !== null) {
            if (min > mode || mode > max) {
              this.diagnostics.push({
                code: 'SDL-E007',
                severity: 'error',
                message: `Triangular distribution requires min ≤ mode ≤ max in "${context}"`,
                span: dist.span,
              });
            }
          }
        }
        break;
      }
    }
  }

  // ── Causal Graph ──

  private buildCausalGraph(): void {
    for (const decl of this.scenario.declarations) {
      switch (decl.type) {
        case 'Variable': {
          this.causalNodes.push({ id: decl.name, type: 'variable' });
          if (decl.dependsOn) {
            for (const dep of decl.dependsOn) {
              const baseName = dep.split('.')[0];
              this.causalEdges.push({ from: baseName, to: decl.name });
            }
          }
          break;
        }
        case 'Assumption': {
          this.causalNodes.push({ id: decl.name, type: 'assumption' });
          break;
        }
        case 'Parameter': {
          this.causalNodes.push({ id: decl.name, type: 'parameter' });
          break;
        }
        case 'Impact': {
          if (decl.name !== '_list') {
            this.causalNodes.push({ id: decl.name, type: 'impact' });
            if (decl.derivesFrom) {
              for (const dep of decl.derivesFrom) {
                const baseName = dep.split('.')[0];
                this.causalEdges.push({ from: baseName, to: decl.name });
              }
            }
          }
          break;
        }
      }
    }
  }

  private detectCycles(): string[] | null {
    const adjacency = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    for (const node of this.causalNodes) {
      adjacency.set(node.id, []);
      inDegree.set(node.id, 0);
    }

    for (const edge of this.causalEdges) {
      if (adjacency.has(edge.from)) {
        adjacency.get(edge.from)!.push(edge.to);
        inDegree.set(edge.to, (inDegree.get(edge.to) || 0) + 1);
      }
    }

    // Kahn's algorithm for topological sort
    const queue: string[] = [];
    for (const [node, degree] of inDegree) {
      if (degree === 0) queue.push(node);
    }

    const order: string[] = [];
    while (queue.length > 0) {
      const node = queue.shift()!;
      order.push(node);

      for (const neighbor of adjacency.get(node) || []) {
        const newDegree = (inDegree.get(neighbor) || 0) - 1;
        inDegree.set(neighbor, newDegree);
        if (newDegree === 0) queue.push(neighbor);
      }
    }

    if (order.length !== this.causalNodes.length) {
      const cycleNodes = this.causalNodes
        .filter(n => !order.includes(n.id))
        .map(n => n.id);

      this.diagnostics.push({
        code: 'SDL-E004',
        severity: 'error',
        message: `Cyclic dependency detected involving: ${cycleNodes.join(', ')}`,
        span: this.scenario.span,
        hint: 'Variables cannot depend on each other in a circular chain. Review the depends_on declarations.',
      });

      return null;
    }

    return order;
  }

  // ── Expression validation helpers ──

  private validateExpressionReferences(expr: ExpressionNode, context: string): void {
    switch (expr.type) {
      case 'Identifier': {
        if (!this.symbols.has(expr.name)) {
          this.diagnostics.push({
            code: 'SDL-E005',
            severity: 'error',
            message: `Undefined reference "${expr.name}" in ${context}`,
            span: expr.span,
          });
        }
        break;
      }
      case 'QualifiedIdentifier': {
        const baseName = expr.parts[0];
        if (!this.symbols.has(baseName)) {
          this.diagnostics.push({
            code: 'SDL-E005',
            severity: 'error',
            message: `Undefined reference "${expr.parts.join('.')}" in ${context}`,
            span: expr.span,
          });
        }
        break;
      }
      case 'BinaryExpression': {
        this.validateExpressionReferences(expr.left, context);
        this.validateExpressionReferences(expr.right, context);
        break;
      }
      case 'UnaryExpression': {
        this.validateExpressionReferences(expr.operand, context);
        break;
      }
      case 'FunctionCall': {
        for (const arg of expr.arguments) {
          this.validateExpressionReferences(arg, context);
        }
        break;
      }
    }
  }

  private tryEvalConstant(expr: ExpressionNode): number | null {
    switch (expr.type) {
      case 'NumberLiteral': return expr.value;
      case 'PercentageLiteral': return expr.value;
      case 'CurrencyLiteral': return expr.value;
      default: return null;
    }
  }

  private dateToNumber(d: DateValue): number {
    return d.year * 10000 + (d.month || 0) * 100 + (d.day || 0);
  }
}
