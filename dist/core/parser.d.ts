/**
 * SDL — Scenario Description Language
 * Recursive Descent Parser
 *
 * Transforms a token stream into an Abstract Syntax Tree (AST).
 */
import { Token, Diagnostic, ScenarioNode } from './types';
export interface ParseResult {
    ast: ScenarioNode | null;
    diagnostics: Diagnostic[];
}
export declare class Parser {
    private tokens;
    private pos;
    private diagnostics;
    constructor(tokens: Token[]);
    parse(): ParseResult;
    private parseScenario;
    private isMetadataKey;
    private parseMetadata;
    private parseDeclaration;
    private parseVariable;
    private parseTimeseriesEntry;
    private parseAssumption;
    private parseParameter;
    private parseBranch;
    private parseImpact;
    private parseSimulate;
    private parseWatch;
    private parseWatchBlock;
    private parseWatchBody;
    private parseCalibrate;
    private parseBindBlock;
    private parseImport;
    private parseExpression;
    private parseOr;
    private parseAnd;
    private parseComparison;
    private parseAddition;
    private parseMultiplication;
    private parsePower;
    private parseUnary;
    private parsePrimary;
    private parseIdentifierOrCall;
    private parseDistributionExpression;
    private parseModelExpression;
    private parseRecordExpression;
    private parseArrayExpression;
    private parseDate;
    private parseDuration;
    private parseResolution;
    private parseSimulationMethod;
    private parseOutputType;
    private parseCalibrationMethod;
    private parseRefreshRate;
    private parseInterpolation;
    private parseIdentifierList;
    private parseQualifiedName;
    private parseStringArray;
    private parseNumberArray;
    private current;
    private peekNext;
    private check;
    private advance;
    private expect;
    private expectString;
    private expectNumber;
    private expectBoolean;
    private expectIdentifier;
    private isContextualIdentifier;
    private spanFrom;
}
/**
 * Parse SDL source code into an AST.
 */
export declare function parse(source: string): ParseResult;
//# sourceMappingURL=parser.d.ts.map