/**
 * SDL — Scenario Description Language
 * Abstract Syntax Tree Type Definitions
 *
 * Spec: v0.1
 * License: GPL-3.0-only
 * (c) Relatronica 2026
 */
// ============================================================
// 1. Token Types (Lexer output)
// ============================================================
export var TokenType;
(function (TokenType) {
    // Literals
    TokenType["Number"] = "Number";
    TokenType["Percentage"] = "Percentage";
    TokenType["Currency"] = "Currency";
    TokenType["String"] = "String";
    TokenType["Boolean"] = "Boolean";
    TokenType["Date"] = "Date";
    TokenType["Duration"] = "Duration";
    TokenType["Identifier"] = "Identifier";
    // Punctuation
    TokenType["LeftBrace"] = "LeftBrace";
    TokenType["RightBrace"] = "RightBrace";
    TokenType["LeftBracket"] = "LeftBracket";
    TokenType["RightBracket"] = "RightBracket";
    TokenType["LeftParen"] = "LeftParen";
    TokenType["RightParen"] = "RightParen";
    TokenType["Colon"] = "Colon";
    TokenType["Comma"] = "Comma";
    TokenType["Dot"] = "Dot";
    TokenType["Arrow"] = "Arrow";
    TokenType["PlusMinus"] = "PlusMinus";
    // Arithmetic
    TokenType["Plus"] = "Plus";
    TokenType["Minus"] = "Minus";
    TokenType["Star"] = "Star";
    TokenType["Slash"] = "Slash";
    TokenType["Caret"] = "Caret";
    TokenType["Percent"] = "Percent";
    // Assignment
    TokenType["Equal"] = "Equal";
    // Comparison
    TokenType["GreaterThan"] = "GreaterThan";
    TokenType["LessThan"] = "LessThan";
    TokenType["GreaterEqual"] = "GreaterEqual";
    TokenType["LessEqual"] = "LessEqual";
    TokenType["EqualEqual"] = "EqualEqual";
    TokenType["NotEqual"] = "NotEqual";
    // Keywords
    TokenType["Scenario"] = "Scenario";
    TokenType["Variable"] = "Variable";
    TokenType["Assumption"] = "Assumption";
    TokenType["Parameter"] = "Parameter";
    TokenType["Constant"] = "Constant";
    TokenType["Branch"] = "Branch";
    TokenType["Impact"] = "Impact";
    TokenType["Simulate"] = "Simulate";
    TokenType["Watch"] = "Watch";
    TokenType["Calibrate"] = "Calibrate";
    TokenType["Bind"] = "Bind";
    TokenType["Import"] = "Import";
    TokenType["Export"] = "Export";
    TokenType["As"] = "As";
    TokenType["When"] = "When";
    TokenType["If"] = "If";
    TokenType["Else"] = "Else";
    TokenType["And"] = "And";
    TokenType["Or"] = "Or";
    TokenType["Not"] = "Not";
    TokenType["On"] = "On";
    TokenType["By"] = "By";
    TokenType["From"] = "From";
    TokenType["To"] = "To";
    TokenType["At"] = "At";
    TokenType["Between"] = "Between";
    TokenType["True"] = "True";
    TokenType["False"] = "False";
    TokenType["Warn"] = "Warn";
    TokenType["Error"] = "Error";
    TokenType["Fork"] = "Fork";
    // Distribution keywords
    TokenType["Normal"] = "Normal";
    TokenType["Uniform"] = "Uniform";
    TokenType["Beta"] = "Beta";
    TokenType["Triangular"] = "Triangular";
    TokenType["Lognormal"] = "Lognormal";
    TokenType["Custom"] = "Custom";
    // Model keywords
    TokenType["Linear"] = "Linear";
    TokenType["Logistic"] = "Logistic";
    TokenType["Exponential"] = "Exponential";
    TokenType["Sigmoid"] = "Sigmoid";
    TokenType["Polynomial"] = "Polynomial";
    // Resolution keywords
    TokenType["Yearly"] = "Yearly";
    TokenType["Monthly"] = "Monthly";
    TokenType["Weekly"] = "Weekly";
    TokenType["Daily"] = "Daily";
    // Property keywords
    TokenType["Timeframe"] = "Timeframe";
    TokenType["Resolution"] = "Resolution";
    TokenType["Confidence"] = "Confidence";
    TokenType["Author"] = "Author";
    TokenType["Version"] = "Version";
    TokenType["Description"] = "Description";
    TokenType["Tags"] = "Tags";
    TokenType["DependsOn"] = "DependsOn";
    TokenType["Model"] = "Model";
    TokenType["Uncertainty"] = "Uncertainty";
    TokenType["Unit"] = "Unit";
    TokenType["Interpolation"] = "Interpolation";
    TokenType["Value"] = "Value";
    TokenType["Source"] = "Source";
    TokenType["Range"] = "Range";
    TokenType["Probability"] = "Probability";
    TokenType["Runs"] = "Runs";
    TokenType["Method"] = "Method";
    TokenType["Seed"] = "Seed";
    TokenType["Output"] = "Output";
    TokenType["Percentiles"] = "Percentiles";
    TokenType["Convergence"] = "Convergence";
    TokenType["Timeout"] = "Timeout";
    TokenType["Refresh"] = "Refresh";
    TokenType["Field"] = "Field";
    TokenType["Transform"] = "Transform";
    TokenType["Fallback"] = "Fallback";
    TokenType["Historical"] = "Historical";
    TokenType["Window"] = "Window";
    TokenType["Prior"] = "Prior";
    TokenType["UpdateFrequency"] = "UpdateFrequency";
    TokenType["Recalculate"] = "Recalculate";
    TokenType["Notify"] = "Notify";
    TokenType["Suggest"] = "Suggest";
    TokenType["OnTrigger"] = "OnTrigger";
    TokenType["DerivesFrom"] = "DerivesFrom";
    TokenType["Formula"] = "Formula";
    TokenType["Compose"] = "Compose";
    // Interactive / presentation keywords
    TokenType["Label"] = "Label";
    TokenType["Step"] = "Step";
    TokenType["Format"] = "Format";
    TokenType["Control"] = "Control";
    TokenType["Icon"] = "Icon";
    TokenType["Color"] = "Color";
    TokenType["Category"] = "Category";
    TokenType["Subtitle"] = "Subtitle";
    TokenType["Difficulty"] = "Difficulty";
    // Simulation methods
    TokenType["MonteCarlo"] = "MonteCarlo";
    TokenType["LatinHypercube"] = "LatinHypercube";
    TokenType["Sobol"] = "Sobol";
    // Calibration methods
    TokenType["BayesianUpdate"] = "BayesianUpdate";
    TokenType["MaximumLikelihood"] = "MaximumLikelihood";
    TokenType["Ensemble"] = "Ensemble";
    // Output types
    TokenType["Distribution"] = "Distribution";
    TokenType["Summary"] = "Summary";
    TokenType["Full"] = "Full";
    // Special
    TokenType["EOF"] = "EOF";
    TokenType["Newline"] = "Newline";
})(TokenType || (TokenType = {}));
//# sourceMappingURL=types.js.map