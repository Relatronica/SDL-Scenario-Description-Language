/**
 * SDL — Scenario Description Language
 * Lexer / Tokenizer
 *
 * Transforms SDL source text into a stream of tokens.
 */
import { TokenType, } from './types';
const KEYWORDS = {
    scenario: TokenType.Scenario,
    variable: TokenType.Variable,
    assumption: TokenType.Assumption,
    parameter: TokenType.Parameter,
    constant: TokenType.Constant,
    branch: TokenType.Branch,
    impact: TokenType.Impact,
    simulate: TokenType.Simulate,
    watch: TokenType.Watch,
    calibrate: TokenType.Calibrate,
    bind: TokenType.Bind,
    import: TokenType.Import,
    export: TokenType.Export,
    as: TokenType.As,
    when: TokenType.When,
    if: TokenType.If,
    else: TokenType.Else,
    and: TokenType.And,
    or: TokenType.Or,
    not: TokenType.Not,
    on: TokenType.On,
    by: TokenType.By,
    from: TokenType.From,
    to: TokenType.To,
    at: TokenType.At,
    between: TokenType.Between,
    true: TokenType.True,
    false: TokenType.False,
    warn: TokenType.Warn,
    error: TokenType.Error,
    fork: TokenType.Fork,
    // Distributions
    normal: TokenType.Normal,
    uniform: TokenType.Uniform,
    beta: TokenType.Beta,
    triangular: TokenType.Triangular,
    lognormal: TokenType.Lognormal,
    custom: TokenType.Custom,
    // Models
    linear: TokenType.Linear,
    logistic: TokenType.Logistic,
    exponential: TokenType.Exponential,
    sigmoid: TokenType.Sigmoid,
    polynomial: TokenType.Polynomial,
    // Resolution
    yearly: TokenType.Yearly,
    monthly: TokenType.Monthly,
    weekly: TokenType.Weekly,
    daily: TokenType.Daily,
    // Property keywords
    timeframe: TokenType.Timeframe,
    resolution: TokenType.Resolution,
    confidence: TokenType.Confidence,
    author: TokenType.Author,
    version: TokenType.Version,
    description: TokenType.Description,
    tags: TokenType.Tags,
    depends_on: TokenType.DependsOn,
    model: TokenType.Model,
    uncertainty: TokenType.Uncertainty,
    unit: TokenType.Unit,
    interpolation: TokenType.Interpolation,
    value: TokenType.Value,
    source: TokenType.Source,
    range: TokenType.Range,
    probability: TokenType.Probability,
    runs: TokenType.Runs,
    method: TokenType.Method,
    seed: TokenType.Seed,
    output: TokenType.Output,
    percentiles: TokenType.Percentiles,
    convergence: TokenType.Convergence,
    timeout: TokenType.Timeout,
    refresh: TokenType.Refresh,
    field: TokenType.Field,
    transform: TokenType.Transform,
    fallback: TokenType.Fallback,
    historical: TokenType.Historical,
    window: TokenType.Window,
    prior: TokenType.Prior,
    update_frequency: TokenType.UpdateFrequency,
    recalculate: TokenType.Recalculate,
    notify: TokenType.Notify,
    suggest: TokenType.Suggest,
    on_trigger: TokenType.OnTrigger,
    derives_from: TokenType.DerivesFrom,
    formula: TokenType.Formula,
    compose: TokenType.Compose,
    // Interactive / presentation keywords
    label: TokenType.Label,
    step: TokenType.Step,
    format: TokenType.Format,
    control: TokenType.Control,
    icon: TokenType.Icon,
    color: TokenType.Color,
    category: TokenType.Category,
    subtitle: TokenType.Subtitle,
    difficulty: TokenType.Difficulty,
    // Simulation methods
    monte_carlo: TokenType.MonteCarlo,
    latin_hypercube: TokenType.LatinHypercube,
    sobol: TokenType.Sobol,
    // Calibration methods
    bayesian_update: TokenType.BayesianUpdate,
    maximum_likelihood: TokenType.MaximumLikelihood,
    ensemble: TokenType.Ensemble,
    // Output types
    distribution: TokenType.Distribution,
    summary: TokenType.Summary,
    full: TokenType.Full,
};
const CURRENCY_CODES = new Set(['EUR', 'USD', 'GBP', 'CHF', 'JPY', 'CNY']);
const MAGNITUDE_SUFFIXES = new Set(['K', 'M', 'B', 'T']);
export class Lexer {
    source;
    pos = 0;
    line = 1;
    column = 1;
    tokens = [];
    diagnostics = [];
    constructor(source) {
        this.source = source;
    }
    tokenize() {
        while (!this.isAtEnd()) {
            this.skipWhitespaceAndComments();
            if (this.isAtEnd())
                break;
            const token = this.readToken();
            if (token) {
                this.tokens.push(token);
            }
        }
        this.tokens.push(this.makeToken(TokenType.EOF, '', this.currentLocation()));
        return {
            tokens: this.tokens,
            diagnostics: this.diagnostics,
        };
    }
    readToken() {
        const start = this.currentLocation();
        const ch = this.peek();
        // String literal
        if (ch === '"')
            return this.readString();
        // Number or date (starts with digit)
        if (this.isDigit(ch))
            return this.readNumberOrDate();
        // Plus-minus operator ±
        if (ch === '±' || (ch === '+' && this.peekAt(1) === '/' && this.peekAt(2) === '-')) {
            if (ch === '±') {
                this.advance();
                return this.makeToken(TokenType.PlusMinus, '±', start);
            }
            this.advance();
            this.advance();
            this.advance();
            return this.makeToken(TokenType.PlusMinus, '±', start);
        }
        // Two-character operators
        if (ch === '-' && this.peekAt(1) === '>') {
            this.advance();
            this.advance();
            return this.makeToken(TokenType.Arrow, '->', start);
        }
        if (ch === '>' && this.peekAt(1) === '=') {
            this.advance();
            this.advance();
            return this.makeToken(TokenType.GreaterEqual, '>=', start);
        }
        if (ch === '<' && this.peekAt(1) === '=') {
            this.advance();
            this.advance();
            return this.makeToken(TokenType.LessEqual, '<=', start);
        }
        if (ch === '=' && this.peekAt(1) === '=') {
            this.advance();
            this.advance();
            return this.makeToken(TokenType.EqualEqual, '==', start);
        }
        if (ch === '=') {
            this.advance();
            return this.makeToken(TokenType.Equal, '=', start);
        }
        if (ch === '!' && this.peekAt(1) === '=') {
            this.advance();
            this.advance();
            return this.makeToken(TokenType.NotEqual, '!=', start);
        }
        // Single-character tokens
        switch (ch) {
            case '{':
                this.advance();
                return this.makeToken(TokenType.LeftBrace, '{', start);
            case '}':
                this.advance();
                return this.makeToken(TokenType.RightBrace, '}', start);
            case '[':
                this.advance();
                return this.makeToken(TokenType.LeftBracket, '[', start);
            case ']':
                this.advance();
                return this.makeToken(TokenType.RightBracket, ']', start);
            case '(':
                this.advance();
                return this.makeToken(TokenType.LeftParen, '(', start);
            case ')':
                this.advance();
                return this.makeToken(TokenType.RightParen, ')', start);
            case ':':
                this.advance();
                return this.makeToken(TokenType.Colon, ':', start);
            case ',':
                this.advance();
                return this.makeToken(TokenType.Comma, ',', start);
            case '.':
                this.advance();
                return this.makeToken(TokenType.Dot, '.', start);
            case '+':
                this.advance();
                return this.makeToken(TokenType.Plus, '+', start);
            case '-':
                this.advance();
                return this.makeToken(TokenType.Minus, '-', start);
            case '*':
                this.advance();
                return this.makeToken(TokenType.Star, '*', start);
            case '/':
                this.advance();
                return this.makeToken(TokenType.Slash, '/', start);
            case '^':
                this.advance();
                return this.makeToken(TokenType.Caret, '^', start);
            case '%':
                this.advance();
                return this.makeToken(TokenType.Percent, '%', start);
            case '>':
                this.advance();
                return this.makeToken(TokenType.GreaterThan, '>', start);
            case '<':
                this.advance();
                return this.makeToken(TokenType.LessThan, '<', start);
        }
        // Identifier or keyword
        if (this.isAlpha(ch))
            return this.readIdentifierOrKeyword();
        // Unknown character
        this.diagnostics.push({
            code: 'SDL-E001',
            severity: 'error',
            message: `Unexpected character: '${ch}'`,
            span: { start, end: this.currentLocation() },
        });
        this.advance();
        return null;
    }
    readString() {
        const start = this.currentLocation();
        this.advance(); // skip opening "
        let value = '';
        while (!this.isAtEnd() && this.peek() !== '"') {
            if (this.peek() === '\\') {
                this.advance();
                const escaped = this.peek();
                switch (escaped) {
                    case '"':
                        value += '"';
                        break;
                    case '\\':
                        value += '\\';
                        break;
                    case 'n':
                        value += '\n';
                        break;
                    case 't':
                        value += '\t';
                        break;
                    default: value += escaped;
                }
            }
            else {
                value += this.peek();
            }
            this.advance();
        }
        if (this.isAtEnd()) {
            this.diagnostics.push({
                code: 'SDL-E001',
                severity: 'error',
                message: 'Unterminated string literal',
                span: { start, end: this.currentLocation() },
            });
        }
        else {
            this.advance(); // skip closing "
        }
        return this.makeToken(TokenType.String, value, start);
    }
    readNumberOrDate() {
        const start = this.currentLocation();
        let value = '';
        // Read integer part
        while (!this.isAtEnd() && this.isDigit(this.peek())) {
            value += this.peek();
            this.advance();
        }
        // Check for date pattern: YYYY-MM or YYYY-MM-DD
        if (value.length === 4 && this.peek() === '-' && this.isDigit(this.peekAt(1))) {
            return this.readDate(value, start);
        }
        // Check for decimal
        if (this.peek() === '.' && this.isDigit(this.peekAt(1))) {
            value += '.';
            this.advance();
            while (!this.isAtEnd() && this.isDigit(this.peek())) {
                value += this.peek();
                this.advance();
            }
        }
        // Check for percentage
        if (this.peek() === '%') {
            value += '%';
            this.advance();
            return this.makeToken(TokenType.Percentage, value, start);
        }
        // Check for magnitude suffix + currency (e.g., 5M EUR) or plain magnitude (e.g., 1.5M)
        if (MAGNITUDE_SUFFIXES.has(this.peek())) {
            const mag = this.peek();
            const magPos = this.pos;
            this.advance();
            // Check if magnitude is immediately followed by alphanumeric (not a standalone magnitude)
            const charAfterMag = this.peek();
            const isMagStandalone = !this.isAlphaNumeric(charAfterMag) || charAfterMag === ' '
                || charAfterMag === '\t' || charAfterMag === '\n' || charAfterMag === '\r';
            this.skipInlineWhitespace();
            if (this.isAlpha(this.peek())) {
                let curr = '';
                while (!this.isAtEnd() && this.isAlpha(this.peek())) {
                    curr += this.peek();
                    this.advance();
                }
                if (CURRENCY_CODES.has(curr)) {
                    return this.makeToken(TokenType.Currency, `${value}${mag} ${curr}`, start);
                }
                // Not a currency — backtrack to after magnitude
                this.pos = magPos + 1;
                this.recalculatePosition();
            }
            // Plain magnitude without currency (e.g., 1.5M, 65B)
            if (isMagStandalone) {
                const multipliers = { K: 1e3, M: 1e6, B: 1e9, T: 1e12 };
                const numValue = parseFloat(value) * multipliers[mag];
                return this.makeToken(TokenType.Number, String(numValue), start);
            }
            // Otherwise backtrack magnitude
            this.pos = magPos;
            this.recalculatePosition();
        }
        // Check for currency code directly after number (e.g., 150 EUR)
        const savedPos = this.pos;
        const savedLine = this.line;
        const savedCol = this.column;
        this.skipInlineWhitespace();
        if (this.isAlpha(this.peek())) {
            let word = '';
            while (!this.isAtEnd() && this.isAlpha(this.peek())) {
                word += this.peek();
                this.advance();
            }
            if (CURRENCY_CODES.has(word)) {
                return this.makeToken(TokenType.Currency, `${value} ${word}`, start);
            }
            // Not a currency, backtrack
            this.pos = savedPos;
            this.line = savedLine;
            this.column = savedCol;
        }
        else {
            this.pos = savedPos;
            this.line = savedLine;
            this.column = savedCol;
        }
        // Check for duration suffix
        if (!this.isAtEnd() && 'ymwds'.includes(this.peek()) && !this.isAlpha(this.peekAt(1))) {
            const unit = this.peek();
            this.advance();
            return this.makeToken(TokenType.Duration, `${value}${unit}`, start);
        }
        return this.makeToken(TokenType.Number, value, start);
    }
    readDate(yearStr, start) {
        let value = yearStr;
        // Read -MM
        value += '-';
        this.advance(); // skip -
        while (!this.isAtEnd() && this.isDigit(this.peek())) {
            value += this.peek();
            this.advance();
        }
        // Check for -DD
        if (this.peek() === '-' && this.isDigit(this.peekAt(1))) {
            value += '-';
            this.advance();
            while (!this.isAtEnd() && this.isDigit(this.peek())) {
                value += this.peek();
                this.advance();
            }
        }
        return this.makeToken(TokenType.Date, value, start);
    }
    readIdentifierOrKeyword() {
        const start = this.currentLocation();
        let value = '';
        while (!this.isAtEnd() && (this.isAlphaNumeric(this.peek()) || this.peek() === '_')) {
            value += this.peek();
            this.advance();
        }
        // Check for boolean
        if (value === 'true')
            return this.makeToken(TokenType.True, value, start);
        if (value === 'false')
            return this.makeToken(TokenType.False, value, start);
        // Check for keyword
        const keyword = KEYWORDS[value];
        if (keyword)
            return this.makeToken(keyword, value, start);
        return this.makeToken(TokenType.Identifier, value, start);
    }
    // ── Utility methods ──
    skipWhitespaceAndComments() {
        while (!this.isAtEnd()) {
            const ch = this.peek();
            // Whitespace
            if (ch === ' ' || ch === '\t' || ch === '\r') {
                this.advance();
                continue;
            }
            // Newline
            if (ch === '\n') {
                this.advance();
                continue;
            }
            // Single-line comment
            if (ch === '/' && this.peekAt(1) === '/') {
                while (!this.isAtEnd() && this.peek() !== '\n') {
                    this.advance();
                }
                continue;
            }
            // Multi-line comment
            if (ch === '/' && this.peekAt(1) === '*') {
                this.advance(); // skip /
                this.advance(); // skip *
                while (!this.isAtEnd() && !(this.peek() === '*' && this.peekAt(1) === '/')) {
                    this.advance();
                }
                if (!this.isAtEnd()) {
                    this.advance(); // skip *
                    this.advance(); // skip /
                }
                continue;
            }
            break;
        }
    }
    skipInlineWhitespace() {
        while (!this.isAtEnd() && (this.peek() === ' ' || this.peek() === '\t')) {
            this.advance();
        }
    }
    peek() {
        if (this.isAtEnd())
            return '\0';
        return this.source[this.pos];
    }
    peekAt(offset) {
        const idx = this.pos + offset;
        if (idx >= this.source.length)
            return '\0';
        return this.source[idx];
    }
    advance() {
        const ch = this.source[this.pos];
        this.pos++;
        if (ch === '\n') {
            this.line++;
            this.column = 1;
        }
        else {
            this.column++;
        }
        return ch;
    }
    isAtEnd() {
        return this.pos >= this.source.length;
    }
    isDigit(ch) {
        return ch >= '0' && ch <= '9';
    }
    isAlpha(ch) {
        return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_';
    }
    isAlphaNumeric(ch) {
        return this.isDigit(ch) || this.isAlpha(ch);
    }
    currentLocation() {
        return { line: this.line, column: this.column, offset: this.pos };
    }
    makeToken(type, value, start) {
        return {
            type,
            value,
            span: { start, end: this.currentLocation() },
        };
    }
    recalculatePosition() {
        this.line = 1;
        this.column = 1;
        for (let i = 0; i < this.pos; i++) {
            if (this.source[i] === '\n') {
                this.line++;
                this.column = 1;
            }
            else {
                this.column++;
            }
        }
    }
}
/**
 * Convenience function to tokenize SDL source code.
 */
export function tokenize(source) {
    return new Lexer(source).tokenize();
}
//# sourceMappingURL=lexer.js.map