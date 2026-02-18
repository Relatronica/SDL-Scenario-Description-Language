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
import type { ScenarioNode, ValidationResult } from './types';
export declare function validate(scenario: ScenarioNode): ValidationResult;
//# sourceMappingURL=validator.d.ts.map