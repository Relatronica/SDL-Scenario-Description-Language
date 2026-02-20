# SDL Scenario Files Audit Report

## File 1: demographic-winter-europe.sdl

**BUG 1: Branch conditions with wrong scale**
- **No issues found** - No percentage parameters are used directly in branch conditions. All branch conditions compare variables or non-percentage parameters/assumptions.

**BUG 2: Currency step values**
- Line 72: `step: 5` for `natality_incentive_budget` (currency parameter with `value: 25B EUR`, `range: [5B EUR, 80B EUR]`)
  - Step value `5` is a plain number without currency magnitude. For a parameter in billions EUR, this should be `5B EUR` if the step represents 5 billion increments.
  - **ISSUE FOUND**: Step should be `5B EUR` or verified that `5` correctly represents 5 billion increments.

**BUG 3: Unit redundancy**
- No currency timeseries variables with redundant unit descriptions found.

**BUG 4: Data sanity**
- All dates are within timeframe (2025-2060)
- All values appear reasonable
- **No issues found**

---

## File 2: eu-defense-autonomy-2035.sdl

**BUG 1: Branch conditions with wrong scale**
- Line 282: `branch "EU Army" when eu_political_cohesion > 0.75 and avg_defense_spending_gdp > 2.8%`
  - `eu_political_cohesion` is an assumption (0-1 scale), condition is correct.
  - `avg_defense_spending_gdp` is a variable (not parameter) with percentage values. Condition `> 2.8%` compares against 2.8 on 0-100 scale, which is correct.
- **No issues found** - no percentage parameters used in branch conditions.

**BUG 2: Currency step values**
- Line 101: `step: 0.5` for `edirpa_budget` (currency parameter with `value: 1.5B EUR`, `range: [0.5B EUR, 8B EUR]`)
  - Step value `0.5` is a plain number without currency magnitude. For a parameter in billions EUR, this should be `0.5B EUR` if the step represents 0.5 billion increments.
  - **ISSUE FOUND**: Step should be `0.5B EUR` or verified that `0.5` correctly represents 0.5 billion increments.

**BUG 3: Unit redundancy**
- No currency timeseries variables with redundant unit descriptions found.

**BUG 4: Data sanity**
- All dates are within timeframe (2025-2038)
- All values appear reasonable
- **No issues found**

---

## File 3: gdpr-ai-data-governance.sdl

**BUG 1: Branch conditions with wrong scale**
- All branch conditions compare assumptions or variables, not percentage parameters.
- **No issues found**

**BUG 2: Currency step values**
- No currency parameters found in this file.

**BUG 3: Unit redundancy**
- Variables `gdpr_fines_ai` (line 183) and `rischio_sanzioni_annuo` (line 363) have `unit: "milioni EUR"` but values are plain numbers (180, 320, etc.), not currency with magnitude. This is correct - values are already in millions.
- **No issues found**

**BUG 4: Data sanity**
- All dates are within timeframe (2025-2035)
- All values appear reasonable
- **No issues found**

---

## File 4: pandemic-preparedness-2035.sdl

**BUG 1: Branch conditions with wrong scale**
- Line 329: `branch "Surveillance Failure" when genomic_surveillance_coverage < 30% and who_ihr_compliance < 0.4`
  - `genomic_surveillance_coverage` is a variable (not parameter) with percentage values. Condition `< 30%` compares against 30 on 0-100 scale, which is correct.
  - `who_ihr_compliance` is an assumption (0-1 scale), condition is correct.
- **No issues found** - no percentage parameters used in branch conditions.

**BUG 2: Currency step values**
- Line 94: `step: 1` for `stockpile_investment` (currency parameter with `value: 5B USD`, `range: [1B USD, 20B USD]`)
  - Step value `1` is a plain number without currency magnitude. For a parameter in billions USD, this should be `1B USD` if the step represents 1 billion increments.
  - **ISSUE FOUND**: Step should be `1B USD` or verified that `1` correctly represents 1 billion increments.

**BUG 3: Unit redundancy**
- No currency timeseries variables with redundant unit descriptions found.

**BUG 4: Data sanity**
- All dates are within timeframe (2025-2040)
- All values appear reasonable
- **No issues found**

---

## File 5: ai-act-compliance-eu.sdl

**BUG 1: Branch conditions with wrong scale**
- All branch conditions compare parameters or assumptions on 0-1 scale, not percentage parameters.
- **No issues found**

**BUG 2: Currency step values**
- No currency parameters found in this file.

**BUG 3: Unit redundancy**
- Variables `compliance_cost_eu` (line 113), `penalty_volume_eur` (line 178), and `costo_totale_eu` (line 366) have units like `"milioni EUR"` or `"miliardi EUR"` but values are plain numbers. This is correct - values are already in the stated units.
- **No issues found**

**BUG 4: Data sanity**
- All dates are within timeframe (2025-2035)
- All values appear reasonable
- **No issues found**

---

## File 6: digital-euro-adoption.sdl

**BUG 1: Branch conditions with wrong scale**
- Line 198: `branch "Mass Adoption" when wallet_adoption > 50% and daily_transactions > 100`
  - `wallet_adoption` is a variable (not parameter) with percentage values. Condition `> 50%` compares against 50 on 0-100 scale, which is correct.
- Line 233: `branch "Bank Run Scare" when bank_deposits_shift > 5%`
  - `bank_deposits_shift` is a variable (not parameter) with percentage values. Condition `> 5%` compares against 5 on 0-100 scale, which is correct.
- **No issues found** - no percentage parameters used in branch conditions.

**BUG 2: Currency step values**
- Line 68: `step: 0.05%` for `merchant_incentive` (parameter with `value: 0.2%`, `range: [0%, 0.5%]`)
  - This is a percentage parameter, not currency. Step value `0.05%` is correct for percentage.
- **No issues found**

**BUG 3: Unit redundancy**
- No currency timeseries variables with redundant unit descriptions found.

**BUG 4: Data sanity**
- All dates are within timeframe (2025-2032)
- All values appear reasonable
- **No issues found**

---

## File 7: water-scarcity-mediterranean.sdl

**BUG 1: Branch conditions with wrong scale**
- Line 258: `branch "Water Marshall Plan" when infrastructure_investment > 15B and eu_water_directive_enforcement > 0.8`
  - `infrastructure_investment` is a currency parameter (not percentage). Condition `> 15B` compares against 15 billion, which is correct.
  - `eu_water_directive_enforcement` is an assumption (0-1 scale), condition is correct.
- **No issues found** - no percentage parameters used in branch conditions.

**BUG 2: Currency step values**
- Line 89: `step: 1` for `infrastructure_investment` (currency parameter with `value: 8B EUR`, `range: [3B EUR, 25B EUR]`)
  - Step value `1` is a plain number without currency magnitude. For a parameter in billions EUR, this should be `1B EUR` if the step represents 1 billion increments.
  - **ISSUE FOUND**: Step should be `1B EUR` or verified that `1` correctly represents 1 billion increments.

**BUG 3: Unit redundancy**
- No currency timeseries variables with redundant unit descriptions found.

**BUG 4: Data sanity**
- All dates are within timeframe (2025-2045)
- All values appear reasonable
- **No issues found**

---

## File 8: automated-decision-risk.sdl

**BUG 1: Branch conditions with wrong scale**
- All branch conditions compare assumptions or parameters on 0-1 scale, not percentage parameters.
- **No issues found**

**BUG 2: Currency step values**
- No currency parameters found in this file.

**BUG 3: Unit redundancy**
- Variable `sanctions_art22` (line 192) has `unit: "milioni EUR"` but values are plain numbers (45, 120, etc.), not currency with magnitude. This is correct - values are already in millions.
- **No issues found**

**BUG 4: Data sanity**
- All dates are within timeframe (2025-2035)
- All values appear reasonable
- **No issues found**

---

## Summary

### BUG 1 Issues: 0 found
No percentage parameters are used incorrectly in branch conditions. All branch conditions either compare variables (which is fine) or compare non-percentage parameters/assumptions.

### BUG 2 Issues: 4 issues found
1. **demographic-winter-europe.sdl** line 72: `step: 5` for `natality_incentive_budget` (billions EUR) - should be `5B EUR` if step represents 5 billion increments
2. **eu-defense-autonomy-2035.sdl** line 101: `step: 0.5` for `edirpa_budget` (billions EUR) - should be `0.5B EUR` if step represents 0.5 billion increments
3. **pandemic-preparedness-2035.sdl** line 94: `step: 1` for `stockpile_investment` (billions USD) - should be `1B USD` if step represents 1 billion increments
4. **water-scarcity-mediterranean.sdl** line 89: `step: 1` for `infrastructure_investment` (billions EUR) - should be `1B EUR` if step represents 1 billion increments

### BUG 3 Issues: 0 found
No currency timeseries variables have redundant unit descriptions. Variables with units like "milioni EUR" have plain numeric values (already in millions), which is correct.

### BUG 4 Issues: 0 found
All dates are within their respective timeframes and all values appear reasonable.
