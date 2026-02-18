/**
 * SDL — Scenario Description Language
 * Recursive Descent Parser
 *
 * Transforms a token stream into an Abstract Syntax Tree (AST).
 */
import { TokenType } from './types';
import { tokenize } from './lexer';
export class Parser {
    tokens;
    pos = 0;
    diagnostics = [];
    constructor(tokens) {
        this.tokens = tokens;
    }
    parse() {
        try {
            const ast = this.parseScenario();
            return { ast, diagnostics: this.diagnostics };
        }
        catch (e) {
            if (e instanceof ParseError) {
                this.diagnostics.push(e.diagnostic);
            }
            return { ast: null, diagnostics: this.diagnostics };
        }
    }
    // ── Scenario ──
    parseScenario() {
        // Handle top-level imports before scenario keyword
        const topLevelImports = [];
        while (this.check(TokenType.Import)) {
            topLevelImports.push(this.parseImport());
        }
        const start = this.current().span.start;
        this.expect(TokenType.Scenario);
        const name = this.expectString();
        this.expect(TokenType.LeftBrace);
        const metadata = {};
        const declarations = [...topLevelImports];
        while (!this.check(TokenType.RightBrace) && !this.check(TokenType.EOF)) {
            if (this.isMetadataKey()) {
                this.parseMetadata(metadata);
            }
            else {
                const decl = this.parseDeclaration();
                if (decl)
                    declarations.push(decl);
            }
        }
        this.expect(TokenType.RightBrace);
        return {
            type: 'Scenario',
            name,
            metadata,
            declarations,
            span: this.spanFrom(start),
        };
    }
    isMetadataKey() {
        const type = this.current().type;
        return [
            TokenType.Timeframe, TokenType.Resolution, TokenType.Confidence,
            TokenType.Author, TokenType.Version, TokenType.Description, TokenType.Tags,
            TokenType.Subtitle, TokenType.Category, TokenType.Icon, TokenType.Color,
            TokenType.Difficulty,
        ].includes(type);
    }
    parseMetadata(metadata) {
        const key = this.current().type;
        switch (key) {
            case TokenType.Timeframe: {
                this.advance();
                this.expect(TokenType.Colon);
                const startDate = this.parseDate();
                this.expect(TokenType.Arrow);
                const endDate = this.parseDate();
                metadata.timeframe = { start: startDate, end: endDate };
                break;
            }
            case TokenType.Resolution: {
                this.advance();
                this.expect(TokenType.Colon);
                metadata.resolution = this.parseResolution();
                break;
            }
            case TokenType.Confidence: {
                this.advance();
                this.expect(TokenType.Colon);
                metadata.confidence = this.expectNumber();
                break;
            }
            case TokenType.Author: {
                this.advance();
                this.expect(TokenType.Colon);
                metadata.author = this.expectString();
                break;
            }
            case TokenType.Version: {
                this.advance();
                this.expect(TokenType.Colon);
                metadata.version = this.expectString();
                break;
            }
            case TokenType.Description: {
                this.advance();
                this.expect(TokenType.Colon);
                metadata.description = this.expectString();
                break;
            }
            case TokenType.Tags: {
                this.advance();
                this.expect(TokenType.Colon);
                metadata.tags = this.parseStringArray();
                break;
            }
            case TokenType.Subtitle: {
                this.advance();
                this.expect(TokenType.Colon);
                metadata.subtitle = this.expectString();
                break;
            }
            case TokenType.Category: {
                this.advance();
                this.expect(TokenType.Colon);
                metadata.category = (this.check(TokenType.String)
                    ? this.expectString()
                    : this.expectIdentifier());
                break;
            }
            case TokenType.Icon: {
                this.advance();
                this.expect(TokenType.Colon);
                metadata.icon = this.expectString();
                break;
            }
            case TokenType.Color: {
                this.advance();
                this.expect(TokenType.Colon);
                metadata.color = this.expectString();
                break;
            }
            case TokenType.Difficulty: {
                this.advance();
                this.expect(TokenType.Colon);
                metadata.difficulty = (this.check(TokenType.String)
                    ? this.expectString()
                    : this.expectIdentifier());
                break;
            }
        }
    }
    // ── Declarations ──
    parseDeclaration() {
        switch (this.current().type) {
            case TokenType.Variable: return this.parseVariable();
            case TokenType.Assumption: return this.parseAssumption();
            case TokenType.Parameter: return this.parseParameter();
            case TokenType.Branch: return this.parseBranch();
            case TokenType.Impact: return this.parseImpact();
            case TokenType.Simulate: return this.parseSimulate();
            case TokenType.Watch: return this.parseWatch();
            case TokenType.Calibrate: return this.parseCalibrate();
            case TokenType.Import: return this.parseImport();
            default: {
                this.diagnostics.push({
                    code: 'SDL-E001',
                    severity: 'error',
                    message: `Unexpected token: ${this.current().value}`,
                    span: this.current().span,
                });
                this.advance();
                return null;
            }
        }
    }
    // ── Variable ──
    parseVariable() {
        const start = this.current().span.start;
        this.expect(TokenType.Variable);
        const name = this.expectIdentifier();
        this.expect(TokenType.LeftBrace);
        const node = {
            type: 'Variable',
            name,
            timeseries: [],
            span: { start, end: start },
        };
        while (!this.check(TokenType.RightBrace) && !this.check(TokenType.EOF)) {
            if (this.check(TokenType.Description)) {
                this.advance();
                this.expect(TokenType.Colon);
                node.description = this.expectString();
            }
            else if (this.check(TokenType.Unit)) {
                this.advance();
                this.expect(TokenType.Colon);
                node.unit = this.expectString();
            }
            else if (this.check(TokenType.Label)) {
                this.advance();
                this.expect(TokenType.Colon);
                node.label = this.expectString();
            }
            else if (this.check(TokenType.Icon)) {
                this.advance();
                this.expect(TokenType.Colon);
                node.icon = this.expectString();
            }
            else if (this.check(TokenType.Color)) {
                this.advance();
                this.expect(TokenType.Colon);
                node.color = this.expectString();
            }
            else if (this.check(TokenType.DependsOn)) {
                this.advance();
                this.expect(TokenType.Colon);
                node.dependsOn = this.parseIdentifierList();
            }
            else if (this.check(TokenType.Model)) {
                this.advance();
                this.expect(TokenType.Colon);
                node.model = this.parseModelExpression();
            }
            else if (this.check(TokenType.Uncertainty)) {
                this.advance();
                this.expect(TokenType.Colon);
                node.uncertainty = this.parseDistributionExpression();
            }
            else if (this.check(TokenType.Interpolation)) {
                this.advance();
                this.expect(TokenType.Colon);
                node.interpolation = this.parseInterpolation();
            }
            else if (this.check(TokenType.Number) || this.check(TokenType.Date)) {
                const entry = this.parseTimeseriesEntry();
                node.timeseries.push(entry);
            }
            else {
                this.diagnostics.push({
                    code: 'SDL-E001',
                    severity: 'error',
                    message: `Unexpected token in variable block: ${this.current().value}`,
                    span: this.current().span,
                });
                this.advance();
            }
        }
        this.expect(TokenType.RightBrace);
        node.span = this.spanFrom(start);
        return node;
    }
    parseTimeseriesEntry() {
        const date = this.parseDate();
        this.expect(TokenType.Colon);
        if (this.check(TokenType.LeftBrace)) {
            const record = this.parseRecordExpression();
            return { date, value: record };
        }
        const value = this.parseExpression();
        return { date, value };
    }
    // ── Assumption ──
    parseAssumption() {
        const start = this.current().span.start;
        this.expect(TokenType.Assumption);
        const name = this.expectIdentifier();
        this.expect(TokenType.LeftBrace);
        const node = {
            type: 'Assumption',
            name,
            span: { start, end: start },
        };
        while (!this.check(TokenType.RightBrace) && !this.check(TokenType.EOF)) {
            if (this.check(TokenType.Value)) {
                this.advance();
                this.expect(TokenType.Colon);
                node.value = this.parseExpression();
                if (this.check(TokenType.By)) {
                    this.advance();
                    node.byDate = this.parseDate();
                }
            }
            else if (this.check(TokenType.Source)) {
                this.advance();
                this.expect(TokenType.Colon);
                node.source = this.expectString();
            }
            else if (this.check(TokenType.Confidence)) {
                this.advance();
                this.expect(TokenType.Colon);
                node.confidence = this.expectNumber();
            }
            else if (this.check(TokenType.Uncertainty)) {
                this.advance();
                this.expect(TokenType.Colon);
                node.uncertainty = this.parseDistributionExpression();
            }
            else if (this.check(TokenType.Bind)) {
                node.bind = this.parseBindBlock();
            }
            else if (this.check(TokenType.Watch)) {
                node.watch = this.parseWatchBlock();
            }
            else {
                this.advance();
            }
        }
        this.expect(TokenType.RightBrace);
        node.span = this.spanFrom(start);
        return node;
    }
    // ── Parameter ──
    parseParameter() {
        const start = this.current().span.start;
        this.expect(TokenType.Parameter);
        const name = this.expectIdentifier();
        this.expect(TokenType.LeftBrace);
        const node = {
            type: 'Parameter',
            name,
            span: { start, end: start },
        };
        while (!this.check(TokenType.RightBrace) && !this.check(TokenType.EOF)) {
            if (this.check(TokenType.Value)) {
                this.advance();
                this.expect(TokenType.Colon);
                node.value = this.parseExpression();
            }
            else if (this.check(TokenType.Range)) {
                this.advance();
                this.expect(TokenType.Colon);
                this.expect(TokenType.LeftBracket);
                const min = this.parseExpression();
                this.expect(TokenType.Comma);
                const max = this.parseExpression();
                this.expect(TokenType.RightBracket);
                node.range = { min, max };
            }
            else if (this.check(TokenType.Description)) {
                this.advance();
                this.expect(TokenType.Colon);
                node.description = this.expectString();
            }
            else if (this.check(TokenType.Label)) {
                this.advance();
                this.expect(TokenType.Colon);
                node.label = this.expectString();
            }
            else if (this.check(TokenType.Unit)) {
                this.advance();
                this.expect(TokenType.Colon);
                node.unit = this.expectString();
            }
            else if (this.check(TokenType.Step)) {
                this.advance();
                this.expect(TokenType.Colon);
                node.step = this.parseExpression();
            }
            else if (this.check(TokenType.Source)) {
                this.advance();
                this.expect(TokenType.Colon);
                node.source = this.expectString();
            }
            else if (this.check(TokenType.Format)) {
                this.advance();
                this.expect(TokenType.Colon);
                node.format = this.expectString();
            }
            else if (this.check(TokenType.Control)) {
                this.advance();
                this.expect(TokenType.Colon);
                node.control = (this.check(TokenType.String)
                    ? this.expectString()
                    : this.expectIdentifier());
            }
            else if (this.check(TokenType.Icon)) {
                this.advance();
                this.expect(TokenType.Colon);
                node.icon = this.expectString();
            }
            else if (this.check(TokenType.Color)) {
                this.advance();
                this.expect(TokenType.Colon);
                node.color = this.expectString();
            }
            else {
                this.advance();
            }
        }
        this.expect(TokenType.RightBrace);
        node.span = this.spanFrom(start);
        return node;
    }
    // ── Branch ──
    parseBranch() {
        const start = this.current().span.start;
        this.expect(TokenType.Branch);
        const name = this.expectString();
        this.expect(TokenType.When);
        const condition = this.parseExpression();
        this.expect(TokenType.LeftBrace);
        const node = {
            type: 'Branch',
            name,
            condition,
            declarations: [],
            span: { start, end: start },
        };
        while (!this.check(TokenType.RightBrace) && !this.check(TokenType.EOF)) {
            if (this.check(TokenType.Probability)) {
                this.advance();
                this.expect(TokenType.Colon);
                node.probability = this.expectNumber();
            }
            else if (this.check(TokenType.Fork)) {
                this.advance();
                this.expect(TokenType.Colon);
                this.expect(TokenType.Scenario);
                node.fork = this.expectString();
            }
            else {
                const decl = this.parseDeclaration();
                if (decl)
                    node.declarations.push(decl);
            }
        }
        this.expect(TokenType.RightBrace);
        node.span = this.spanFrom(start);
        return node;
    }
    // ── Impact ──
    parseImpact() {
        const start = this.current().span.start;
        this.expect(TokenType.Impact);
        // impact on: [...]
        if (this.check(TokenType.On)) {
            this.advance();
            this.expect(TokenType.Colon);
            this.expect(TokenType.LeftBracket);
            const targets = this.parseIdentifierList();
            this.expect(TokenType.RightBracket);
            return {
                type: 'Impact',
                name: '_list',
                derivesFrom: targets,
                span: this.spanFrom(start),
            };
        }
        // impact name { ... }
        const name = this.expectIdentifier();
        this.expect(TokenType.LeftBrace);
        const node = {
            type: 'Impact',
            name,
            span: { start, end: start },
        };
        while (!this.check(TokenType.RightBrace) && !this.check(TokenType.EOF)) {
            if (this.check(TokenType.Description)) {
                this.advance();
                this.expect(TokenType.Colon);
                node.description = this.expectString();
            }
            else if (this.check(TokenType.Unit)) {
                this.advance();
                this.expect(TokenType.Colon);
                node.unit = this.expectString();
            }
            else if (this.check(TokenType.Label)) {
                this.advance();
                this.expect(TokenType.Colon);
                node.label = this.expectString();
            }
            else if (this.check(TokenType.Icon)) {
                this.advance();
                this.expect(TokenType.Colon);
                node.icon = this.expectString();
            }
            else if (this.check(TokenType.Color)) {
                this.advance();
                this.expect(TokenType.Colon);
                node.color = this.expectString();
            }
            else if (this.check(TokenType.DerivesFrom)) {
                this.advance();
                this.expect(TokenType.Colon);
                node.derivesFrom = this.parseIdentifierList();
            }
            else if (this.check(TokenType.Formula)) {
                this.advance();
                this.expect(TokenType.Colon);
                node.formula = this.parseExpression();
            }
            else {
                this.advance();
            }
        }
        this.expect(TokenType.RightBrace);
        node.span = this.spanFrom(start);
        return node;
    }
    // ── Simulate ──
    parseSimulate() {
        const start = this.current().span.start;
        this.expect(TokenType.Simulate);
        this.expect(TokenType.LeftBrace);
        const node = {
            type: 'Simulate',
            span: { start, end: start },
        };
        while (!this.check(TokenType.RightBrace) && !this.check(TokenType.EOF)) {
            if (this.check(TokenType.Runs)) {
                this.advance();
                this.expect(TokenType.Colon);
                node.runs = this.expectNumber();
            }
            else if (this.check(TokenType.Method)) {
                this.advance();
                this.expect(TokenType.Colon);
                node.method = this.parseSimulationMethod();
            }
            else if (this.check(TokenType.Seed)) {
                this.advance();
                this.expect(TokenType.Colon);
                node.seed = this.expectNumber();
            }
            else if (this.check(TokenType.Output)) {
                this.advance();
                this.expect(TokenType.Colon);
                node.output = this.parseOutputType();
            }
            else if (this.check(TokenType.Percentiles)) {
                this.advance();
                this.expect(TokenType.Colon);
                node.percentiles = this.parseNumberArray();
            }
            else if (this.check(TokenType.Convergence)) {
                this.advance();
                this.expect(TokenType.Colon);
                node.convergence = this.expectNumber();
            }
            else if (this.check(TokenType.Timeout)) {
                this.advance();
                this.expect(TokenType.Colon);
                node.timeout = this.parseDuration();
            }
            else {
                this.advance();
            }
        }
        this.expect(TokenType.RightBrace);
        node.span = this.spanFrom(start);
        return node;
    }
    // ── Watch ──
    parseWatch() {
        const start = this.current().span.start;
        this.expect(TokenType.Watch);
        const target = this.expectIdentifier();
        this.expect(TokenType.LeftBrace);
        return this.parseWatchBody(target, start);
    }
    parseWatchBlock() {
        const start = this.current().span.start;
        this.expect(TokenType.Watch);
        this.expect(TokenType.LeftBrace);
        return this.parseWatchBody(undefined, start);
    }
    parseWatchBody(target, start) {
        const rules = [];
        let onTrigger;
        while (!this.check(TokenType.RightBrace) && !this.check(TokenType.EOF)) {
            if (this.check(TokenType.Warn) || this.check(TokenType.Error)) {
                const severity = this.current().type === TokenType.Warn ? 'warn' : 'error';
                this.advance();
                this.expect(TokenType.When);
                this.expect(TokenType.Colon);
                const condition = this.parseExpression();
                rules.push({ severity, condition });
            }
            else if (this.check(TokenType.OnTrigger)) {
                this.advance();
                this.expect(TokenType.LeftBrace);
                onTrigger = {};
                while (!this.check(TokenType.RightBrace) && !this.check(TokenType.EOF)) {
                    if (this.check(TokenType.Recalculate)) {
                        this.advance();
                        this.expect(TokenType.Colon);
                        onTrigger.recalculate = this.expectBoolean();
                    }
                    else if (this.check(TokenType.Notify)) {
                        this.advance();
                        this.expect(TokenType.Colon);
                        onTrigger.notify = this.parseStringArray();
                    }
                    else if (this.check(TokenType.Suggest)) {
                        this.advance();
                        this.expect(TokenType.Colon);
                        onTrigger.suggest = this.expectString();
                    }
                    else {
                        this.advance();
                    }
                }
                this.expect(TokenType.RightBrace);
            }
            else {
                this.advance();
            }
        }
        this.expect(TokenType.RightBrace);
        return {
            type: 'Watch',
            target,
            rules,
            onTrigger,
            span: this.spanFrom(start),
        };
    }
    // ── Calibrate ──
    parseCalibrate() {
        const start = this.current().span.start;
        this.expect(TokenType.Calibrate);
        const target = this.expectIdentifier();
        this.expect(TokenType.LeftBrace);
        const node = {
            type: 'Calibrate',
            target,
            span: { start, end: start },
        };
        while (!this.check(TokenType.RightBrace) && !this.check(TokenType.EOF)) {
            if (this.check(TokenType.Historical)) {
                this.advance();
                this.expect(TokenType.Colon);
                node.historical = this.expectString();
            }
            else if (this.check(TokenType.Method)) {
                this.advance();
                this.expect(TokenType.Colon);
                node.method = this.parseCalibrationMethod();
            }
            else if (this.check(TokenType.Window)) {
                this.advance();
                this.expect(TokenType.Colon);
                node.window = this.parseDuration();
            }
            else if (this.check(TokenType.Prior)) {
                this.advance();
                this.expect(TokenType.Colon);
                node.prior = this.parseDistributionExpression();
            }
            else if (this.check(TokenType.UpdateFrequency)) {
                this.advance();
                this.expect(TokenType.Colon);
                node.updateFrequency = this.parseRefreshRate();
            }
            else {
                this.advance();
            }
        }
        this.expect(TokenType.RightBrace);
        node.span = this.spanFrom(start);
        return node;
    }
    // ── Bind ──
    parseBindBlock() {
        const start = this.current().span.start;
        this.expect(TokenType.Bind);
        this.expect(TokenType.LeftBrace);
        const node = {
            type: 'Bind',
            span: { start, end: start },
        };
        while (!this.check(TokenType.RightBrace) && !this.check(TokenType.EOF)) {
            if (this.check(TokenType.Source)) {
                this.advance();
                this.expect(TokenType.Colon);
                node.source = this.expectString();
            }
            else if (this.check(TokenType.Refresh)) {
                this.advance();
                this.expect(TokenType.Colon);
                node.refresh = this.parseRefreshRate();
            }
            else if (this.check(TokenType.Field)) {
                this.advance();
                this.expect(TokenType.Colon);
                node.field = this.expectString();
            }
            else if (this.check(TokenType.Transform)) {
                this.advance();
                this.expect(TokenType.Colon);
                node.transform = this.parseExpression();
            }
            else if (this.check(TokenType.Fallback)) {
                this.advance();
                this.expect(TokenType.Colon);
                node.fallback = this.parseExpression();
            }
            else {
                this.advance();
            }
        }
        this.expect(TokenType.RightBrace);
        node.span = this.spanFrom(start);
        return node;
    }
    // ── Import ──
    parseImport() {
        const start = this.current().span.start;
        this.expect(TokenType.Import);
        const path = this.expectString();
        this.expect(TokenType.As);
        const alias = this.expectIdentifier();
        return {
            type: 'Import',
            path,
            alias,
            span: this.spanFrom(start),
        };
    }
    // ── Expression Parsing (Pratt / Precedence Climbing) ──
    parseExpression() {
        return this.parseOr();
    }
    parseOr() {
        let left = this.parseAnd();
        while (this.check(TokenType.Or)) {
            const start = left.span.start;
            this.advance();
            const right = this.parseAnd();
            left = {
                type: 'BinaryExpression',
                operator: 'or',
                left,
                right,
                span: this.spanFrom(start),
            };
        }
        return left;
    }
    parseAnd() {
        let left = this.parseComparison();
        while (this.check(TokenType.And)) {
            const start = left.span.start;
            this.advance();
            const right = this.parseComparison();
            left = {
                type: 'BinaryExpression',
                operator: 'and',
                left,
                right,
                span: this.spanFrom(start),
            };
        }
        return left;
    }
    parseComparison() {
        let left = this.parseAddition();
        if (this.check(TokenType.GreaterThan) || this.check(TokenType.LessThan) ||
            this.check(TokenType.GreaterEqual) || this.check(TokenType.LessEqual) ||
            this.check(TokenType.EqualEqual) || this.check(TokenType.NotEqual)) {
            const start = left.span.start;
            const op = this.current().value;
            this.advance();
            const right = this.parseAddition();
            left = {
                type: 'BinaryExpression',
                operator: op,
                left,
                right,
                span: this.spanFrom(start),
            };
        }
        return left;
    }
    parseAddition() {
        let left = this.parseMultiplication();
        while (this.check(TokenType.Plus) || this.check(TokenType.Minus)) {
            const start = left.span.start;
            const op = this.current().value;
            this.advance();
            const right = this.parseMultiplication();
            left = {
                type: 'BinaryExpression',
                operator: op,
                left,
                right,
                span: this.spanFrom(start),
            };
        }
        return left;
    }
    parseMultiplication() {
        let left = this.parsePower();
        while (this.check(TokenType.Star) || this.check(TokenType.Slash) || this.check(TokenType.Percent)) {
            const start = left.span.start;
            const op = this.current().value;
            this.advance();
            const right = this.parsePower();
            left = {
                type: 'BinaryExpression',
                operator: op,
                left,
                right,
                span: this.spanFrom(start),
            };
        }
        return left;
    }
    parsePower() {
        let left = this.parseUnary();
        while (this.check(TokenType.Caret)) {
            const start = left.span.start;
            this.advance();
            const right = this.parseUnary();
            left = {
                type: 'BinaryExpression',
                operator: '^',
                left,
                right,
                span: this.spanFrom(start),
            };
        }
        return left;
    }
    parseUnary() {
        if (this.check(TokenType.Minus)) {
            const start = this.current().span.start;
            this.advance();
            const operand = this.parsePrimary();
            return {
                type: 'UnaryExpression',
                operator: '-',
                operand,
                span: this.spanFrom(start),
            };
        }
        if (this.check(TokenType.Not)) {
            const start = this.current().span.start;
            this.advance();
            const operand = this.parsePrimary();
            return {
                type: 'UnaryExpression',
                operator: 'not',
                operand,
                span: this.spanFrom(start),
            };
        }
        // ± shorthand for distribution
        if (this.check(TokenType.PlusMinus)) {
            return this.parseDistributionExpression();
        }
        return this.parsePrimary();
    }
    parsePrimary() {
        const token = this.current();
        switch (token.type) {
            case TokenType.Number: {
                this.advance();
                return {
                    type: 'NumberLiteral',
                    value: parseFloat(token.value),
                    span: token.span,
                };
            }
            case TokenType.Percentage: {
                this.advance();
                return {
                    type: 'PercentageLiteral',
                    value: parseFloat(token.value.replace('%', '')),
                    span: token.span,
                };
            }
            case TokenType.Currency: {
                this.advance();
                const parts = token.value.split(' ');
                let numStr = parts[0];
                const currStr = parts[parts.length - 1];
                let magnitude;
                const lastChar = numStr[numStr.length - 1];
                if ('KMBT'.includes(lastChar)) {
                    magnitude = lastChar;
                    numStr = numStr.slice(0, -1);
                }
                let value = parseFloat(numStr);
                if (magnitude) {
                    const multipliers = { K: 1e3, M: 1e6, B: 1e9, T: 1e12 };
                    value *= multipliers[magnitude];
                }
                return {
                    type: 'CurrencyLiteral',
                    value,
                    currency: currStr,
                    magnitude,
                    span: token.span,
                };
            }
            case TokenType.String: {
                this.advance();
                return {
                    type: 'StringLiteral',
                    value: token.value,
                    span: token.span,
                };
            }
            case TokenType.True:
            case TokenType.False: {
                this.advance();
                return {
                    type: 'BooleanLiteral',
                    value: token.type === TokenType.True,
                    span: token.span,
                };
            }
            case TokenType.LeftParen: {
                this.advance();
                const expr = this.parseExpression();
                this.expect(TokenType.RightParen);
                return expr;
            }
            case TokenType.LeftBrace: {
                return this.parseRecordExpression();
            }
            case TokenType.LeftBracket: {
                return this.parseArrayExpression();
            }
            // Distribution constructors
            case TokenType.Normal:
            case TokenType.Uniform:
            case TokenType.Beta:
            case TokenType.Triangular:
            case TokenType.Lognormal:
            case TokenType.Custom: {
                return this.parseDistributionExpression();
            }
            // Identifier or function call
            case TokenType.Identifier: {
                return this.parseIdentifierOrCall();
            }
            default: {
                throw new ParseError({
                    code: 'SDL-E001',
                    severity: 'error',
                    message: `Unexpected token: ${token.value} (${token.type})`,
                    span: token.span,
                });
            }
        }
    }
    parseIdentifierOrCall() {
        const start = this.current().span.start;
        const name = this.expectIdentifier();
        // Function call
        if (this.check(TokenType.LeftParen)) {
            this.advance();
            const args = [];
            if (!this.check(TokenType.RightParen)) {
                args.push(this.parseExpression());
                while (this.check(TokenType.Comma)) {
                    this.advance();
                    args.push(this.parseExpression());
                }
            }
            this.expect(TokenType.RightParen);
            return {
                type: 'FunctionCall',
                name,
                arguments: args,
                span: this.spanFrom(start),
            };
        }
        // Qualified identifier (a.b.c)
        if (this.check(TokenType.Dot)) {
            const parts = [name];
            while (this.check(TokenType.Dot)) {
                this.advance();
                parts.push(this.expectIdentifier());
            }
            return {
                type: 'QualifiedIdentifier',
                parts,
                span: this.spanFrom(start),
            };
        }
        return {
            type: 'Identifier',
            name,
            span: this.spanFrom(start),
        };
    }
    // ── Distribution Expression ──
    parseDistributionExpression() {
        const start = this.current().span.start;
        // ± shorthand: ±X%
        if (this.check(TokenType.PlusMinus)) {
            this.advance();
            const value = this.parseExpression();
            return {
                type: 'DistributionExpression',
                distribution: 'normal',
                params: [value],
                span: this.spanFrom(start),
            };
        }
        const distToken = this.current();
        const distMap = {
            [TokenType.Normal]: 'normal',
            [TokenType.Uniform]: 'uniform',
            [TokenType.Beta]: 'beta',
            [TokenType.Triangular]: 'triangular',
            [TokenType.Lognormal]: 'lognormal',
            [TokenType.Custom]: 'custom',
        };
        const distribution = distMap[distToken.type];
        if (!distribution) {
            throw new ParseError({
                code: 'SDL-E001',
                severity: 'error',
                message: `Expected distribution type, got: ${distToken.value}`,
                span: distToken.span,
            });
        }
        this.advance();
        this.expect(TokenType.LeftParen);
        const params = [];
        const namedParams = [];
        if (!this.check(TokenType.RightParen)) {
            // Check if first param is ± shorthand
            if (this.check(TokenType.PlusMinus)) {
                this.advance();
                params.push(this.parseExpression());
            }
            else if (this.check(TokenType.Identifier) && (this.peekNext()?.type === TokenType.Equal || this.peekNext()?.type === TokenType.EqualEqual)) {
                // Named parameter: name=value
                while (!this.check(TokenType.RightParen) && !this.check(TokenType.EOF)) {
                    const paramName = this.expectIdentifier();
                    this.advance(); // skip =
                    const paramValue = this.parseExpression();
                    namedParams.push({ name: paramName, value: paramValue });
                    if (this.check(TokenType.Comma))
                        this.advance();
                }
            }
            else {
                params.push(this.parseExpression());
                while (this.check(TokenType.Comma)) {
                    this.advance();
                    params.push(this.parseExpression());
                }
            }
        }
        this.expect(TokenType.RightParen);
        return {
            type: 'DistributionExpression',
            distribution,
            params,
            namedParams: namedParams.length > 0 ? namedParams : undefined,
            span: this.spanFrom(start),
        };
    }
    // ── Model Expression ──
    parseModelExpression() {
        const start = this.current().span.start;
        const modelToken = this.current();
        const modelMap = {
            [TokenType.Linear]: 'linear',
            [TokenType.Logistic]: 'logistic',
            [TokenType.Exponential]: 'exponential',
            [TokenType.Sigmoid]: 'sigmoid',
            [TokenType.Polynomial]: 'polynomial',
        };
        const model = modelMap[modelToken.type];
        if (!model) {
            throw new ParseError({
                code: 'SDL-E001',
                severity: 'error',
                message: `Expected model type, got: ${modelToken.value}`,
                span: modelToken.span,
            });
        }
        this.advance();
        this.expect(TokenType.LeftParen);
        const params = [];
        if (!this.check(TokenType.RightParen)) {
            do {
                const paramName = this.expectIdentifier();
                if (this.check(TokenType.Equal) || this.check(TokenType.EqualEqual)) {
                    this.advance();
                }
                else {
                    this.expect(TokenType.Equal);
                }
                const paramValue = this.parseExpression();
                params.push({ name: paramName, value: paramValue });
            } while (this.check(TokenType.Comma) && (this.advance(), true));
        }
        this.expect(TokenType.RightParen);
        return {
            type: 'ModelExpression',
            model,
            params,
            span: this.spanFrom(start),
        };
    }
    // ── Compound Expressions ──
    parseRecordExpression() {
        const start = this.current().span.start;
        this.expect(TokenType.LeftBrace);
        const fields = [];
        while (!this.check(TokenType.RightBrace) && !this.check(TokenType.EOF)) {
            const key = this.expectIdentifier();
            this.expect(TokenType.Colon);
            const value = this.parseExpression();
            fields.push({ key, value });
            if (this.check(TokenType.Comma))
                this.advance();
        }
        this.expect(TokenType.RightBrace);
        return {
            type: 'RecordExpression',
            fields,
            span: this.spanFrom(start),
        };
    }
    parseArrayExpression() {
        const start = this.current().span.start;
        this.expect(TokenType.LeftBracket);
        const elements = [];
        while (!this.check(TokenType.RightBracket) && !this.check(TokenType.EOF)) {
            elements.push(this.parseExpression());
            if (this.check(TokenType.Comma))
                this.advance();
        }
        this.expect(TokenType.RightBracket);
        return {
            type: 'ArrayExpression',
            elements,
            span: this.spanFrom(start),
        };
    }
    // ── Helpers for specific value types ──
    parseDate() {
        const token = this.current();
        if (token.type === TokenType.Date) {
            this.advance();
            const parts = token.value.split('-').map(Number);
            return { year: parts[0], month: parts[1], day: parts[2] };
        }
        if (token.type === TokenType.Number) {
            this.advance();
            const year = parseInt(token.value, 10);
            return { year };
        }
        throw new ParseError({
            code: 'SDL-E001',
            severity: 'error',
            message: `Expected date, got: ${token.value}`,
            span: token.span,
        });
    }
    parseDuration() {
        const token = this.current();
        if (token.type === TokenType.Duration) {
            this.advance();
            const unit = token.value[token.value.length - 1];
            const amount = parseFloat(token.value.slice(0, -1));
            return { amount, unit };
        }
        // Fallback: number + unit
        const amount = this.expectNumber();
        const unitToken = this.current();
        if (unitToken.type === TokenType.Identifier && 'ymwds'.includes(unitToken.value)) {
            this.advance();
            return { amount, unit: unitToken.value };
        }
        return { amount, unit: 's' };
    }
    parseResolution() {
        const token = this.current();
        const map = {
            [TokenType.Yearly]: 'yearly',
            [TokenType.Monthly]: 'monthly',
            [TokenType.Weekly]: 'weekly',
            [TokenType.Daily]: 'daily',
        };
        const value = map[token.type];
        if (value) {
            this.advance();
            return value;
        }
        throw new ParseError({
            code: 'SDL-E001',
            severity: 'error',
            message: `Expected resolution (yearly/monthly/weekly/daily), got: ${token.value}`,
            span: token.span,
        });
    }
    parseSimulationMethod() {
        const token = this.current();
        const map = {
            [TokenType.MonteCarlo]: 'monte_carlo',
            [TokenType.LatinHypercube]: 'latin_hypercube',
            [TokenType.Sobol]: 'sobol',
        };
        const value = map[token.type];
        if (value) {
            this.advance();
            return value;
        }
        throw new ParseError({
            code: 'SDL-E001',
            severity: 'error',
            message: `Expected simulation method, got: ${token.value}`,
            span: token.span,
        });
    }
    parseOutputType() {
        const token = this.current();
        const map = {
            [TokenType.Distribution]: 'distribution',
            [TokenType.Percentiles]: 'percentiles',
            [TokenType.Summary]: 'summary',
            [TokenType.Full]: 'full',
        };
        const value = map[token.type];
        if (value) {
            this.advance();
            return value;
        }
        throw new ParseError({
            code: 'SDL-E001',
            severity: 'error',
            message: `Expected output type, got: ${token.value}`,
            span: token.span,
        });
    }
    parseCalibrationMethod() {
        const token = this.current();
        const map = {
            [TokenType.BayesianUpdate]: 'bayesian_update',
            [TokenType.MaximumLikelihood]: 'maximum_likelihood',
            [TokenType.Ensemble]: 'ensemble',
        };
        const value = map[token.type];
        if (value) {
            this.advance();
            return value;
        }
        throw new ParseError({
            code: 'SDL-E001',
            severity: 'error',
            message: `Expected calibration method, got: ${token.value}`,
            span: token.span,
        });
    }
    parseRefreshRate() {
        const token = this.current();
        const rates = ['realtime', 'hourly', 'daily', 'weekly', 'monthly'];
        if (token.type === TokenType.Identifier && rates.includes(token.value)) {
            this.advance();
            return token.value;
        }
        // Check for keyword tokens that match
        const keywordMap = {
            [TokenType.Daily]: 'daily',
            [TokenType.Weekly]: 'weekly',
            [TokenType.Monthly]: 'monthly',
            [TokenType.Yearly]: 'yearly',
        };
        const value = keywordMap[token.type];
        if (value) {
            this.advance();
            return value;
        }
        throw new ParseError({
            code: 'SDL-E001',
            severity: 'error',
            message: `Expected refresh rate, got: ${token.value}`,
            span: token.span,
        });
    }
    parseInterpolation() {
        const token = this.current();
        const methods = ['linear', 'step', 'spline'];
        if (token.type === TokenType.Identifier && methods.includes(token.value)) {
            this.advance();
            return token.value;
        }
        if (token.type === TokenType.Linear) {
            this.advance();
            return 'linear';
        }
        throw new ParseError({
            code: 'SDL-E001',
            severity: 'error',
            message: `Expected interpolation method (linear/step/spline), got: ${token.value}`,
            span: token.span,
        });
    }
    // ── List parsers ──
    parseIdentifierList() {
        const list = [];
        list.push(this.parseQualifiedName());
        while (this.check(TokenType.Comma)) {
            this.advance();
            list.push(this.parseQualifiedName());
        }
        return list;
    }
    parseQualifiedName() {
        let name = this.expectIdentifier();
        while (this.check(TokenType.Dot)) {
            this.advance();
            name += '.' + this.expectIdentifier();
        }
        return name;
    }
    parseStringArray() {
        this.expect(TokenType.LeftBracket);
        const items = [];
        if (!this.check(TokenType.RightBracket)) {
            items.push(this.expectString());
            while (this.check(TokenType.Comma)) {
                this.advance();
                if (!this.check(TokenType.RightBracket)) {
                    items.push(this.expectString());
                }
            }
        }
        this.expect(TokenType.RightBracket);
        return items;
    }
    parseNumberArray() {
        this.expect(TokenType.LeftBracket);
        const items = [];
        if (!this.check(TokenType.RightBracket)) {
            items.push(this.expectNumber());
            while (this.check(TokenType.Comma)) {
                this.advance();
                if (!this.check(TokenType.RightBracket)) {
                    items.push(this.expectNumber());
                }
            }
        }
        this.expect(TokenType.RightBracket);
        return items;
    }
    // ── Token manipulation ──
    current() {
        return this.tokens[this.pos] || this.tokens[this.tokens.length - 1];
    }
    peekNext() {
        return this.tokens[this.pos + 1] || null;
    }
    check(type) {
        return this.current().type === type;
    }
    advance() {
        const token = this.current();
        if (this.pos < this.tokens.length - 1)
            this.pos++;
        return token;
    }
    expect(type) {
        if (this.check(type)) {
            return this.advance();
        }
        throw new ParseError({
            code: 'SDL-E001',
            severity: 'error',
            message: `Expected ${type}, got ${this.current().type} ("${this.current().value}")`,
            span: this.current().span,
        });
    }
    expectString() {
        const token = this.expect(TokenType.String);
        return token.value;
    }
    expectNumber() {
        const token = this.current();
        if (token.type === TokenType.Number) {
            this.advance();
            return parseFloat(token.value);
        }
        if (token.type === TokenType.Percentage) {
            this.advance();
            return parseFloat(token.value.replace('%', ''));
        }
        throw new ParseError({
            code: 'SDL-E001',
            severity: 'error',
            message: `Expected number, got ${token.type} ("${token.value}")`,
            span: token.span,
        });
    }
    expectBoolean() {
        if (this.check(TokenType.True)) {
            this.advance();
            return true;
        }
        if (this.check(TokenType.False)) {
            this.advance();
            return false;
        }
        throw new ParseError({
            code: 'SDL-E001',
            severity: 'error',
            message: `Expected boolean, got ${this.current().type}`,
            span: this.current().span,
        });
    }
    expectIdentifier() {
        const token = this.current();
        if (token.type === TokenType.Identifier) {
            this.advance();
            return token.value;
        }
        // Some keywords can also be used as identifiers in certain contexts
        if (this.isContextualIdentifier(token.type)) {
            this.advance();
            return token.value;
        }
        throw new ParseError({
            code: 'SDL-E001',
            severity: 'error',
            message: `Expected identifier, got ${token.type} ("${token.value}")`,
            span: token.span,
        });
    }
    isContextualIdentifier(type) {
        return [
            TokenType.Value, TokenType.Source, TokenType.Field,
            TokenType.Output, TokenType.Method, TokenType.Seed,
            TokenType.Label, TokenType.Step, TokenType.Format,
            TokenType.Control, TokenType.Icon, TokenType.Color,
            TokenType.Category, TokenType.Subtitle, TokenType.Difficulty,
        ].includes(type);
    }
    spanFrom(start) {
        const prev = this.tokens[Math.max(0, this.pos - 1)];
        return { start, end: prev ? prev.span.end : start };
    }
}
class ParseError extends globalThis.Error {
    diagnostic;
    constructor(diagnostic) {
        super(diagnostic.message);
        this.diagnostic = diagnostic;
    }
}
/**
 * Parse SDL source code into an AST.
 */
export function parse(source) {
    const { tokens, diagnostics: lexDiags } = tokenize(source);
    const parser = new Parser(tokens);
    const result = parser.parse();
    result.diagnostics = [...lexDiags, ...result.diagnostics];
    return result;
}
//# sourceMappingURL=parser.js.map