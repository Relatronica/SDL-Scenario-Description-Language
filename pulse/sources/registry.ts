/**
 * SDL Pulse — Verified Source Registry
 *
 * Curated catalog of real, tested data sources that SDL scenarios can
 * reference in `bind` and `calibrate` blocks.  Every entry points to a
 * publicly accessible URL.  The `adapter` field indicates which Pulse
 * adapter handles it; "fallback" means the data is bundled locally.
 *
 * Users can import this registry to discover available sources and
 * copy-paste the `exampleBind` snippet into their SDL files.
 */

import type { SourceCategory } from './categories';

export interface SourceEntry {
  /** Unique dot-separated identifier, e.g. "eurostat.demo_frate" */
  id: string;
  name: string;
  provider: string;
  /** Which Pulse adapter handles this URL */
  adapter: 'eurostat' | 'worldbank' | 'fallback';
  category: SourceCategory;
  /** Canonical URL used in `bind { source: "..." }` */
  url: string;
  /** Available field names for the `field:` property */
  fields: string[];
  /** ISO country/region codes this source covers */
  geo: string[];
  refresh: 'daily' | 'monthly' | 'quarterly' | 'yearly';
  free: boolean;
  apiKeyRequired: boolean;
  description: string;
  /** ISO date of last successful verification */
  lastVerified: string;
  /** Ready-to-paste SDL snippet */
  exampleBind: string;
}

// ─────────────────────────────────────────────────────────
// EUROSTAT — ec.europa.eu
// ─────────────────────────────────────────────────────────

const eurostat = (
  id: string,
  name: string,
  dataset: string,
  category: SourceCategory,
  fields: string[],
  geo: string[],
  description: string,
  exampleField: string,
): SourceEntry => ({
  id: `eurostat.${id}`,
  name,
  provider: 'Eurostat',
  adapter: 'eurostat',
  category,
  url: `https://ec.europa.eu/eurostat/databrowser/view/${dataset}`,
  fields,
  geo,
  refresh: 'yearly',
  free: true,
  apiKeyRequired: false,
  description,
  lastVerified: '2026-02-20',
  exampleBind: [
    `bind {`,
    `      source: "https://ec.europa.eu/eurostat/databrowser/view/${dataset}"`,
    `      refresh: yearly`,
    `      field: "${exampleField}"`,
    `    }`,
  ].join('\n'),
});

// ─────────────────────────────────────────────────────────
// WORLD BANK — data.worldbank.org
// ─────────────────────────────────────────────────────────

const worldbank = (
  id: string,
  name: string,
  indicator: string,
  category: SourceCategory,
  fields: string[],
  geo: string[],
  description: string,
  refresh: SourceEntry['refresh'],
  exampleField: string,
): SourceEntry => ({
  id: `worldbank.${id}`,
  name,
  provider: 'World Bank',
  adapter: 'worldbank',
  category,
  url: `https://data.worldbank.org/indicator/${indicator}`,
  fields,
  geo,
  refresh,
  free: true,
  apiKeyRequired: false,
  description,
  lastVerified: '2026-02-20',
  exampleBind: [
    `bind {`,
    `      source: "https://data.worldbank.org/indicator/${indicator}"`,
    `      refresh: ${refresh}`,
    `      field: "${exampleField}"`,
    `    }`,
  ].join('\n'),
});

// ─────────────────────────────────────────────────────────
// FALLBACK — bundled historical data
// ─────────────────────────────────────────────────────────

const fallback = (
  id: string,
  name: string,
  category: SourceCategory,
  urlKeyword: string,
  fields: string[],
  geo: string[],
  description: string,
  refresh: SourceEntry['refresh'],
  exampleField: string,
): SourceEntry => ({
  id: `fallback.${id}`,
  name,
  provider: 'SDL Bundled Data',
  adapter: 'fallback',
  category,
  url: urlKeyword,
  fields,
  geo,
  refresh,
  free: true,
  apiKeyRequired: false,
  description,
  lastVerified: '2026-02-20',
  exampleBind: [
    `bind {`,
    `      source: "${urlKeyword}"`,
    `      refresh: ${refresh}`,
    `      field: "${exampleField}"`,
    `    }`,
  ].join('\n'),
});

// ═══════════════════════════════════════════════════════════
//  THE REGISTRY
// ═══════════════════════════════════════════════════════════

export const SOURCE_REGISTRY: SourceEntry[] = [

  // ── DEMOGRAPHICS ──────────────────────────────────────

  eurostat(
    'fertility_rate', 'EU Fertility Rate', 'demo_frate', 'demographics',
    ['fertility_rate', 'total_fertility_rate'],
    ['EU27', 'IT', 'DE', 'FR', 'ES', 'PL'],
    'Total fertility rate by country — Eurostat demo_frate',
    'fertility_rate',
  ),
  eurostat(
    'population', 'EU Population', 'demo_pjan', 'demographics',
    ['population_total', 'population_millions'],
    ['EU27', 'IT', 'DE', 'FR', 'ES', 'PL'],
    'Population on 1 January by age and sex — Eurostat demo_pjan',
    'population_millions',
  ),
  eurostat(
    'old_age_dependency', 'Old-Age Dependency Ratio', 'demo_pjanind', 'demographics',
    ['old_age_dependency_ratio'],
    ['EU27', 'IT', 'DE', 'FR', 'ES'],
    'Old-age dependency ratio (65+ / 15-64) — Eurostat',
    'old_age_dependency_ratio',
  ),
  worldbank(
    'population_growth', 'Population Growth Rate', 'SP.POP.GROW', 'demographics',
    ['annual_growth_rate_pct'],
    ['WLD', 'SSF', 'EUU', 'ITA'],
    'Annual population growth (%). World Bank SP.POP.GROW',
    'yearly', 'annual_growth_rate_pct',
  ),
  worldbank(
    'urbanization', 'Urban Population Share', 'SP.URB.TOTL.IN.ZS', 'demographics',
    ['urbanization_rate_pct', 'urban_population_pct'],
    ['WLD', 'SSF', 'EUU', 'ITA'],
    'Urban population as % of total. World Bank SP.URB.TOTL.IN.ZS',
    'yearly', 'urbanization_rate_pct',
  ),
  worldbank(
    'life_expectancy', 'Life Expectancy at Birth', 'SP.DYN.LE00.IN', 'demographics',
    ['life_expectancy_years'],
    ['WLD', 'SSF', 'EUU', 'ITA'],
    'Life expectancy at birth, total (years). World Bank SP.DYN.LE00.IN',
    'yearly', 'life_expectancy_years',
  ),
  worldbank(
    'fertility_rate', 'World Fertility Rate', 'SP.DYN.TFRT.IN', 'demographics',
    ['fertility_rate', 'total_fertility_rate'],
    ['WLD', 'SSF', 'EUU', 'ITA'],
    'Fertility rate, total (births per woman). World Bank SP.DYN.TFRT.IN',
    'yearly', 'fertility_rate',
  ),
  worldbank(
    'net_migration', 'Net Migration', 'SM.POP.NETM', 'demographics',
    ['net_migration'],
    ['WLD', 'ITA', 'DEU', 'FRA'],
    'Net migration (five-year estimates). World Bank SM.POP.NETM',
    'yearly', 'net_migration',
  ),

  // ── ENERGY ────────────────────────────────────────────

  eurostat(
    'renewable_share', 'Renewable Energy Share (EU)', 'nrg_ind_ren', 'energy',
    ['renewable_share_pct', 'res_share'],
    ['EU27', 'IT', 'DE', 'FR', 'ES'],
    'Share of renewable energy in gross final energy consumption — Eurostat nrg_ind_ren',
    'renewable_share_pct',
  ),
  eurostat(
    'ghg_emissions', 'Greenhouse Gas Emissions (EU)', 'env_air_gge', 'energy',
    ['ghg_total_mt', 'co2_equivalent_mt'],
    ['EU27', 'IT', 'DE', 'FR', 'ES'],
    'Greenhouse gas emissions by source sector — Eurostat env_air_gge',
    'ghg_total_mt',
  ),
  eurostat(
    'energy_balance', 'Energy Balance', 'nrg_bal_c', 'energy',
    ['primary_energy_mtoe', 'final_energy_mtoe'],
    ['EU27', 'IT', 'DE', 'FR'],
    'Complete energy balances — Eurostat nrg_bal_c',
    'primary_energy_mtoe',
  ),
  eurostat(
    'electricity_prices', 'Electricity Prices (EU)', 'nrg_pc_204', 'energy',
    ['price_eur_kwh'],
    ['EU27', 'IT', 'DE', 'FR', 'ES'],
    'Electricity prices for household consumers — Eurostat nrg_pc_204',
    'price_eur_kwh',
  ),
  worldbank(
    'co2_emissions', 'CO₂ Emissions', 'EN.ATM.CO2E.KT', 'energy',
    ['co2_kt', 'co2_emissions_kt'],
    ['WLD', 'ITA', 'DEU', 'FRA', 'SSF'],
    'CO2 emissions (kt). World Bank EN.ATM.CO2E.KT',
    'yearly', 'co2_kt',
  ),
  worldbank(
    'renewable_consumption', 'Renewable Energy Consumption', 'EG.FEC.RNEW.ZS', 'energy',
    ['renewable_pct'],
    ['WLD', 'ITA', 'DEU', 'SSF'],
    'Renewable energy consumption (% of total). World Bank EG.FEC.RNEW.ZS',
    'yearly', 'renewable_pct',
  ),
  worldbank(
    'energy_use_per_capita', 'Energy Use per Capita', 'EG.USE.PCAP.KG.OE', 'energy',
    ['kg_oil_equivalent'],
    ['WLD', 'ITA', 'DEU'],
    'Energy use (kg of oil equivalent per capita). World Bank EG.USE.PCAP.KG.OE',
    'yearly', 'kg_oil_equivalent',
  ),
  fallback(
    'eu_ets_price', 'EU ETS Carbon Price', 'energy',
    'sdl:fallback/eu-ets-carbon-price', ['price_per_ton_eur'],
    ['EU'],
    'EU ETS auction price (€/tCO₂). Bundled annual averages 2012-2025.',
    'daily', 'price_per_ton_eur',
  ),
  fallback(
    'datacenter_energy', 'Global Data-Center Energy Demand', 'energy',
    'sdl:fallback/datacenter-energy', ['twh_annual'],
    ['WLD'],
    'Estimated global data-center electricity consumption (TWh). IEA/IDC estimates.',
    'yearly', 'twh_annual',
  ),

  // ── CLIMATE ───────────────────────────────────────────

  worldbank(
    'forest_area', 'Forest Area', 'AG.LND.FRST.ZS', 'climate',
    ['forest_area_pct'],
    ['WLD', 'ITA', 'SSF'],
    'Forest area (% of land area). World Bank AG.LND.FRST.ZS',
    'yearly', 'forest_area_pct',
  ),
  fallback(
    'med_precipitation', 'Mediterranean Precipitation Index', 'climate',
    'sdl:fallback/mediterranean-precipitation', ['precipitation_index'],
    ['IT', 'ES', 'GR', 'TR'],
    'Mediterranean basin precipitation anomaly index. Copernicus/ERA5 summaries.',
    'monthly', 'precipitation_index',
  ),
  fallback(
    'med_temperature', 'Mediterranean Temperature Anomaly', 'climate',
    'sdl:fallback/mediterranean-temperature', ['annual_anomaly_celsius'],
    ['IT', 'ES', 'GR', 'TR'],
    'Mediterranean basin temperature anomaly vs 1991-2020 baseline. Copernicus/ERA5.',
    'monthly', 'annual_anomaly_celsius',
  ),

  // ── ECONOMY ───────────────────────────────────────────

  eurostat(
    'employment_rate', 'Employment Rate (EU)', 'lfsi_emp_a', 'economy',
    ['employment_rate', 'employment_rate_pct'],
    ['EU27', 'IT', 'DE', 'FR', 'ES'],
    'Employment rate by age group 20-64 — Eurostat lfsi_emp_a',
    'employment_rate',
  ),
  eurostat(
    'gdp', 'GDP (EU)', 'nama_10_gdp', 'economy',
    ['gdp_million_eur', 'gdp_per_capita_eur'],
    ['EU27', 'IT', 'DE', 'FR', 'ES'],
    'GDP and main components — Eurostat nama_10_gdp',
    'gdp_million_eur',
  ),
  eurostat(
    'unemployment', 'Unemployment Rate (EU)', 'une_rt_a', 'economy',
    ['unemployment_rate_pct'],
    ['EU27', 'IT', 'DE', 'FR', 'ES'],
    'Unemployment rate by sex and age — Eurostat une_rt_a',
    'unemployment_rate_pct',
  ),
  worldbank(
    'gdp_current', 'GDP (current US$)', 'NY.GDP.MKTP.CD', 'economy',
    ['gdp_usd'],
    ['WLD', 'ITA', 'SSF', 'EUU'],
    'GDP (current US$). World Bank NY.GDP.MKTP.CD',
    'yearly', 'gdp_usd',
  ),
  worldbank(
    'unemployment', 'Unemployment Rate', 'SL.UEM.TOTL.ZS', 'economy',
    ['unemployment_rate_pct'],
    ['WLD', 'ITA', 'SSF'],
    'Unemployment, total (% of labor force). World Bank SL.UEM.TOTL.ZS',
    'yearly', 'unemployment_rate_pct',
  ),
  worldbank(
    'gini_index', 'Gini Index', 'SI.POV.GINI', 'economy',
    ['gini_index'],
    ['WLD', 'ITA', 'SSF'],
    'Gini index (income inequality). World Bank SI.POV.GINI',
    'yearly', 'gini_index',
  ),
  fallback(
    'pharma_rd_spend', 'Global Pharma R&D Spend', 'economy',
    'sdl:fallback/pharma-rd-spend', ['total_billion_usd'],
    ['WLD'],
    'Global pharmaceutical R&D expenditure (USD billions). EFPIA/Evaluate Pharma estimates.',
    'yearly', 'total_billion_usd',
  ),

  // ── DIGITAL ───────────────────────────────────────────

  eurostat(
    'digital_payments', 'Digital Payment Adoption (EU)', 'isoc_ci_ifp_iu', 'digital',
    ['digital_payment_adoption_pct', 'internet_banking_pct'],
    ['EU27', 'IT', 'DE', 'FR', 'ES'],
    'Internet use: online banking, purchases — Eurostat isoc_ci_ifp_iu',
    'digital_payment_adoption_pct',
  ),
  eurostat(
    'cloud_adoption', 'Cloud Computing Adoption (EU)', 'isoc_cicce_use', 'digital',
    ['eu_cloud_market_share_pct', 'cloud_adoption_pct'],
    ['EU27', 'IT', 'DE', 'FR'],
    'Cloud computing services used by enterprises — Eurostat isoc_cicce_use',
    'eu_cloud_market_share_pct',
  ),
  eurostat(
    'digital_skills', 'Digital Skills Index (EU)', 'isoc_ci_in_h', 'digital',
    ['digital_skills_index', 'basic_digital_skills_pct'],
    ['EU27', 'IT', 'DE', 'FR', 'ES'],
    'Individuals who have basic or above basic digital skills — Eurostat isoc_ci_in_h',
    'digital_skills_index',
  ),
  worldbank(
    'internet_users', 'Internet Users', 'IT.NET.USER.ZS', 'digital',
    ['internet_users_pct'],
    ['WLD', 'ITA', 'SSF'],
    'Individuals using the Internet (% of population). World Bank IT.NET.USER.ZS',
    'yearly', 'internet_users_pct',
  ),

  // ── HEALTH ────────────────────────────────────────────

  worldbank(
    'health_expenditure', 'Health Expenditure % GDP', 'SH.XPD.CHEX.GD.ZS', 'health',
    ['health_expenditure_gdp_pct'],
    ['WLD', 'ITA', 'SSF'],
    'Current health expenditure (% of GDP). World Bank SH.XPD.CHEX.GD.ZS',
    'yearly', 'health_expenditure_gdp_pct',
  ),
  worldbank(
    'immunization_measles', 'Immunization, Measles', 'SH.IMM.MEAS', 'health',
    ['immunization_pct'],
    ['WLD', 'ITA', 'SSF'],
    'Immunization, measles (% of children 12-23 months). World Bank SH.IMM.MEAS',
    'yearly', 'immunization_pct',
  ),
  fallback(
    'fda_novel_approvals', 'FDA Novel Drug Approvals', 'health',
    'sdl:fallback/fda-novel-approvals', ['novel_approvals'],
    ['US'],
    'Annual FDA novel drug approvals (CDER NMEs + BLAs). FDA annual reports.',
    'yearly', 'novel_approvals',
  ),
  fallback(
    'who_genomic_surveillance', 'WHO Genomic Surveillance Coverage', 'health',
    'sdl:fallback/who-genomic-surveillance', ['global_coverage_pct'],
    ['WLD'],
    'Estimated global pathogen genomic-surveillance coverage. WHO/GISAID summaries.',
    'quarterly', 'global_coverage_pct',
  ),
  fallback(
    'amr_mortality', 'Antimicrobial Resistance Mortality', 'health',
    'sdl:fallback/amr-mortality', ['annual_deaths_millions'],
    ['WLD'],
    'Estimated annual deaths attributable to AMR. Lancet/WHO Global AMR report.',
    'yearly', 'annual_deaths_millions',
  ),

  // ── DEFENSE ───────────────────────────────────────────

  worldbank(
    'military_expenditure', 'Military Expenditure % GDP', 'MS.MIL.XPND.GD.ZS', 'defense',
    ['military_gdp_pct', 'eu_avg_defense_gdp_pct'],
    ['WLD', 'ITA', 'DEU', 'FRA'],
    'Military expenditure (% of GDP). World Bank / SIPRI MS.MIL.XPND.GD.ZS',
    'yearly', 'military_gdp_pct',
  ),
  worldbank(
    'arms_imports', 'Arms Imports', 'MS.MIL.MPRT.KD', 'defense',
    ['arms_imports_usd'],
    ['WLD', 'ITA', 'DEU'],
    'Arms imports (constant 1990 US$). World Bank MS.MIL.MPRT.KD',
    'yearly', 'arms_imports_usd',
  ),

  // ── TRANSPORT ─────────────────────────────────────────

  fallback(
    'ev_share_eu', 'EV Market Share (EU)', 'transport',
    'sdl:fallback/ev-share-eu', ['ev_share_pct'],
    ['EU27'],
    'Battery-electric + plug-in hybrid share of new car registrations. ACEA data.',
    'quarterly', 'ev_share_pct',
  ),

  // ── GOVERNANCE ────────────────────────────────────────

  fallback(
    'edpb_enforcement', 'EDPB Enforcement Stats', 'governance',
    'sdl:fallback/edpb-enforcement', ['maturity_index', 'enforcement_actions'],
    ['EU'],
    'EU DPA enforcement activity index. EDPB annual reports.',
    'quarterly', 'maturity_index',
  ),
  fallback(
    'cctv_density', 'CCTV Camera Density (EU)', 'governance',
    'sdl:fallback/cctv-density-eu', ['cameras_per_1000'],
    ['EU'],
    'Estimated CCTV cameras per 1 000 inhabitants, EU average. Comparitech/SurfShark.',
    'yearly', 'cameras_per_1000',
  ),
  fallback(
    'ihr_compliance', 'IHR Compliance Index', 'governance',
    'sdl:fallback/ihr-compliance', ['global_compliance_index'],
    ['WLD'],
    'International Health Regulations compliance index. WHO SPAR assessments.',
    'yearly', 'global_compliance_index',
  ),
];

// ── Lookup helpers ──────────────────────────────────────

export function findSourceById(id: string): SourceEntry | undefined {
  return SOURCE_REGISTRY.find(s => s.id === id);
}

export function findSourceByUrl(url: string): SourceEntry | undefined {
  return SOURCE_REGISTRY.find(s =>
    url.includes(s.url) || s.url.includes(url),
  );
}

export function findSourcesByCategory(category: SourceCategory): SourceEntry[] {
  return SOURCE_REGISTRY.filter(s => s.category === category);
}

export function findSourcesByProvider(provider: string): SourceEntry[] {
  return SOURCE_REGISTRY.filter(s =>
    s.provider.toLowerCase().includes(provider.toLowerCase()),
  );
}

export function findSourcesByAdapter(adapter: string): SourceEntry[] {
  return SOURCE_REGISTRY.filter(s => s.adapter === adapter);
}
