/**
 * SDL — Scenario Description Language
 * Lexer / Tokenizer
 *
 * Transforms SDL source text into a stream of tokens.
 */
import type { Token, Diagnostic } from './types';
export interface LexerResult {
    tokens: Token[];
    diagnostics: Diagnostic[];
}
export declare class Lexer {
    private source;
    private pos;
    private line;
    private column;
    private tokens;
    private diagnostics;
    constructor(source: string);
    tokenize(): LexerResult;
    private readToken;
    private readString;
    private readNumberOrDate;
    private readDate;
    private readIdentifierOrKeyword;
    private skipWhitespaceAndComments;
    private skipInlineWhitespace;
    private peek;
    private peekAt;
    private advance;
    private isAtEnd;
    private isDigit;
    private isAlpha;
    private isAlphaNumeric;
    private currentLocation;
    private makeToken;
    private recalculatePosition;
}
/**
 * Convenience function to tokenize SDL source code.
 */
export declare function tokenize(source: string): LexerResult;
//# sourceMappingURL=lexer.d.ts.map